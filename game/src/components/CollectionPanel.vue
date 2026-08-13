<script setup lang="ts">
import { Archive, ChevronLeft, ChevronRight, Images, UsersRound, X } from '@lucide/vue'
import { computed, nextTick, ref, watch } from 'vue'

import { backgrounds } from '@/content/assets'
import { characters, romanceCandidates } from '@/content/characters'
import { galleryCgEntries } from '@/content/cgAssets'
import { ENDING_REGISTRY, ENDING_SKIN_STYLE } from '@/content/endingRegistry'
import { romanceProfiles } from '@/content/romanceProfiles'
import DistrictArchivePanel from '@/components/DistrictArchivePanel.vue'

import type { GalleryCgEntry as GalleryEntry } from '@/content/cgAssets'
import type { BackgroundId } from '@/engine/types'

const props = defineProps<{ seenNodes: string[]; unlockedCgs: string[]; unlockedEndings: string[] }>()
const emit = defineEmits<{ lightboxChange: [open: boolean] }>()
const activeTab = ref<'collection' | 'history' | 'roster'>('collection')

const galleryEntry = (background: BackgroundId, name: string): GalleryEntry => ({
  id: backgrounds[background].collectionId!,
  name,
  src: backgrounds[background].src!,
})

// This explicit order is the public collection index; persisted CG IDs must not shift when art files are replaced.
const cgs: GalleryEntry[] = [
  galleryEntry('invitation', '老朋友喊你进区'),
  galleryEntry('login', '4945区开服'),
  galleryEntry('recruitment', '招募广场'),
  galleryEntry('organization', '五组席位'),
  galleryEntry('mutedKey', '被按下的发言键'),
  galleryEntry('worldChat', '与世界为敌'),
  galleryEntry('twoGroups', '两个官方群'),
  galleryEntry('warRoom', '深夜作战室'),
  galleryEntry('fortress', '第二次要塞'),
  galleryEntry('aftermath', '战后的空场'),
  galleryEntry('rewardHall', '稀有饰品'),
  galleryEntry('sixthSeat', '第六席点亮'),
  galleryEntry('nightMessage', '灰色头像'),
  galleryEntry('romanceGate', '幻想夜市 · 月门'),
  galleryEntry('romanceFoodStreet', '幻想夜市 · 妖怪食街'),
  galleryEntry('romanceArcade', '幻想夜市 · 符卡游艺场'),
  galleryEntry('romanceLanternBridge', '幻想夜市 · 河灯桥'),
  galleryEntry('ending', '黎明仍在线'),
  // 剧情/羁绊 CG 与剧情节点共用 content/cgAssets 单一注册表，路径不再两处维护。
  ...galleryCgEntries,
  // Confession entries resolve to valid v1.7 art while the external v1.8 package is still pending.
  ...Object.values(romanceProfiles).map((profile): GalleryEntry => ({
    id: profile.confessionCgId,
    name: `${characters[profile.character].name} · ${profile.confessionTitle}`,
    src: profile.confessionCg,
    placeholderFor: profile.confessionCg === profile.confessionCgFinal
      ? undefined
      : profile.confessionCgFinal,
    promptRef: profile.confessionCgPromptRef,
  })),
]

// 从注册表派生的组织结局列表（排除羁绊和特殊结局）
const orgEndings = computed(() =>
  ENDING_REGISTRY.filter((e) => e.route !== undefined && e.tier <= 1))

// 隐藏结局（tier 2）
const secretEndings = computed(() =>
  ENDING_REGISTRY.filter((e) => e.tier === 2))

const totalOrgEndings = computed(() => orgEndings.value.length)
const unlockedOrgEndings = computed(() =>
  orgEndings.value.filter((e) => props.unlockedEndings.includes(e.id)).length)

const unlockedEndingIds = computed(() => new Set(props.unlockedEndings))

const unlockedCgIds = computed(() => new Set(props.unlockedCgs))
const unlockedGallery = computed(() => cgs.filter((cg) => unlockedCgIds.value.has(cg.id)))
const selectedCgId = ref<string | null>(null)
const lightboxPanel = ref<HTMLElement | null>(null)
const lightboxCloseButton = ref<HTMLButtonElement | null>(null)
const lightboxTrigger = ref<HTMLButtonElement | null>(null)

const selectedCgIndex = computed(() => (
  unlockedGallery.value.findIndex((cg) => cg.id === selectedCgId.value)
))
const selectedCg = computed(() => (
  selectedCgIndex.value >= 0 ? unlockedGallery.value[selectedCgIndex.value] ?? null : null
))
const lightboxOpen = computed(() => Boolean(selectedCg.value))

const openLightbox = (cg: GalleryEntry, event: MouseEvent) => {
  lightboxTrigger.value = event.currentTarget instanceof HTMLButtonElement ? event.currentTarget : null
  // The teleported viewer becomes the sole active modal; App makes the outer gallery inert.
  emit('lightboxChange', true)
  selectedCgId.value = cg.id
}

const closeLightbox = () => {
  const trigger = lightboxTrigger.value
  selectedCgId.value = null
  lightboxTrigger.value = null
  emit('lightboxChange', false)
  void nextTick(() => {
    if (trigger?.isConnected) trigger.focus()
  })
}

const moveLightbox = (offset: -1 | 1) => {
  const entries = unlockedGallery.value
  if (entries.length < 2) return
  const nextIndex = (selectedCgIndex.value + offset + entries.length) % entries.length
  selectedCgId.value = entries[nextIndex]?.id ?? null
}

const lightboxFocusableSelector = 'button:not(:disabled):not([tabindex="-1"])'
const handleLightboxKeydown = (event: KeyboardEvent) => {
  if (!lightboxOpen.value) return
  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    closeLightbox()
    return
  }
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault()
    moveLightbox(event.key === 'ArrowLeft' ? -1 : 1)
    return
  }
  if (event.key !== 'Tab' || !lightboxPanel.value) return
  const focusable = [...lightboxPanel.value.querySelectorAll<HTMLButtonElement>(lightboxFocusableSelector)]
  const first = focusable[0]
  const last = focusable.at(-1)
  if (!first || !last) return
  if (!lightboxPanel.value.contains(document.activeElement)) {
    event.preventDefault()
    first.focus()
  } else if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

// Opening a CG temporarily owns body scroll and keyboard focus; cleanup runs on close and component teardown.
watch(lightboxOpen, (isOpen, _wasOpen, onCleanup) => {
  if (!isOpen) return
  const previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', handleLightboxKeydown, true)
  onCleanup(() => {
    document.body.style.overflow = previousOverflow
    window.removeEventListener('keydown', handleLightboxKeydown, true)
  })
  void nextTick(() => lightboxCloseButton.value?.focus())
})

// CollectionPanel merges permanent collection progress and presents only unlocked art as interactive media.
</script>

<template>
  <nav class="collection-tabs" aria-label="鉴赏内容分类">
    <button type="button" :aria-current="activeTab === 'collection' ? 'page' : undefined" @click="activeTab = 'collection'">
      <Images :size="18" /><span>剧情鉴赏</span>
    </button>
    <button type="button" :aria-current="activeTab === 'history' ? 'page' : undefined" @click="activeTab = 'history'">
      <Archive :size="18" /><span>区史档案</span><em>20</em>
    </button>
    <button type="button" :aria-current="activeTab === 'roster' ? 'page' : undefined" @click="activeTab = 'roster'">
      <UsersRound :size="18" /><span>成员名册</span><em>32</em>
    </button>
  </nav>

  <template v-if="activeTab === 'collection'">
  <section class="collection-section">
    <div class="section-title"><h3>场景鉴赏</h3><span>{{ unlockedGallery.length }}/{{ cgs.length }}</span></div>
    <div class="cg-grid">
      <figure
        v-for="cg in cgs"
        :key="cg.id"
        :class="{ locked: !unlockedCgIds.has(cg.id) }"
        :aria-hidden="!unlockedCgIds.has(cg.id) || undefined"
      >
        <button
          v-if="unlockedCgIds.has(cg.id)"
          class="cg-open"
          type="button"
          :aria-label="`查看${cg.name}大图`"
          @click="openLightbox(cg, $event)"
        >
          <img :src="cg.src" :alt="cg.name" loading="lazy" decoding="async" />
          <span v-if="cg.placeholderFor" class="cg-pending">占位 · {{ cg.promptRef }}</span>
        </button>
        <div v-else class="cg-placeholder" aria-hidden="true">?</div>
        <figcaption>{{ unlockedCgIds.has(cg.id) ? cg.name : '未解锁' }}</figcaption>
      </figure>
    </div>
  </section>

  <section class="collection-section">
    <div class="section-title"><h3>组织结局</h3><span>{{ unlockedOrgEndings }}/{{ totalOrgEndings }}</span></div>
    <div class="ending-grid">
      <div
        v-for="ending in orgEndings"
        :key="ending.id"
        :class="{ unlocked: unlockedEndingIds.has(ending.id) }"
        :style="unlockedEndingIds.has(ending.id) ? { borderLeftColor: ENDING_SKIN_STYLE[ending.skin].border } : undefined"
      >
        <span class="ending-tag" v-if="unlockedEndingIds.has(ending.id) && ENDING_SKIN_STYLE[ending.skin].badge">
          {{ ENDING_SKIN_STYLE[ending.skin].badge }}
        </span>
        <span>{{ unlockedEndingIds.has(ending.id) ? ending.title : '？？？' }}</span>
      </div>
    </div>
  </section>

  <section v-if="secretEndings.length > 0" class="collection-section">
    <div class="section-title"><h3>隐藏结局</h3><span>{{ secretEndings.filter((e) => unlockedEndingIds.has(e.id)).length }}/{{ secretEndings.length }}</span></div>
    <div class="ending-grid ending-grid-secret">
      <div
        v-for="ending in secretEndings"
        :key="ending.id"
        :class="{ unlocked: unlockedEndingIds.has(ending.id) }"
        :style="unlockedEndingIds.has(ending.id) ? { borderLeftColor: ENDING_SKIN_STYLE[ending.skin].border } : undefined"
      >
        <span>{{ unlockedEndingIds.has(ending.id) ? ending.title : '？？？' }}</span>
      </div>
    </div>
  </section>

  <section class="collection-section">
    <!-- 关系卡片与总数共用候选清单，后续扩充攻略线时不会再出现硬编码计数。 -->
    <div class="section-title"><h3>关系结局</h3><span>{{ romanceCandidates.filter((id) => unlockedEndings.includes(`bond-${id}`)).length }}/{{ romanceCandidates.length }}</span></div>
    <div class="bond-grid">
      <article v-for="id in romanceCandidates" :key="id" :class="{ locked: !unlockedEndings.includes(`bond-${id}`) }">
        <img :src="characters[id].avatar" alt="" />
        <span>{{ unlockedEndings.includes(`bond-${id}`) ? characters[id].name : '未相识' }}</span>
      </article>
    </div>
  </section>

  <p class="progress">已阅读 {{ seenNodes.length }} 个剧情节点。收藏保存在本设备，可通过存档导出备份关键进度。</p>
  </template>

  <DistrictArchivePanel v-else :section="activeTab" />

  <Teleport to="body">
    <Transition name="cg-lightbox">
      <div v-if="selectedCg" class="cg-lightbox-backdrop" role="presentation" @click.self="closeLightbox">
        <section
          ref="lightboxPanel"
          class="cg-lightbox-panel"
          role="dialog"
          aria-modal="true"
          :aria-label="`${selectedCg.name}全屏鉴赏`"
        >
          <header class="cg-lightbox-toolbar">
            <p>场景鉴赏</p>
            <button
              ref="lightboxCloseButton"
              class="cg-lightbox-control cg-lightbox-close"
              type="button"
              aria-label="关闭全屏鉴赏"
              @click="closeLightbox"
            >
              <X :size="24" />
            </button>
          </header>

          <figure class="cg-lightbox-media">
            <img :key="selectedCg.id" :src="selectedCg.src" :alt="selectedCg.name" decoding="async" />
            <figcaption class="cg-lightbox-caption" aria-live="polite" aria-atomic="true">
              <strong>{{ selectedCg.name }}</strong>
              <em v-if="selectedCg.placeholderFor">视觉占位 · {{ selectedCg.promptRef }}</em>
              <span>{{ selectedCgIndex + 1 }} / {{ unlockedGallery.length }}</span>
            </figcaption>
          </figure>

          <button
            v-if="unlockedGallery.length > 1"
            class="cg-lightbox-control cg-lightbox-previous"
            type="button"
            aria-label="上一张"
            @click="moveLightbox(-1)"
          >
            <ChevronLeft :size="28" />
          </button>
          <button
            v-if="unlockedGallery.length > 1"
            class="cg-lightbox-control cg-lightbox-next"
            type="button"
            aria-label="下一张"
            @click="moveLightbox(1)"
          >
            <ChevronRight :size="28" />
          </button>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.collection-tabs { display: grid; gap: .5rem; margin-bottom: 1.25rem; padding: .3rem; border: 1px solid var(--color-border); border-radius: .9rem; background: rgba(255,255,255,.025); grid-template-columns: repeat(3, minmax(0, 1fr)); }
.collection-tabs button { display: flex; min-height: 2.75rem; align-items: center; justify-content: center; gap: .4rem; padding: .45rem .6rem; border: 0; border-radius: .65rem; background: transparent; color: var(--color-text-muted); font-size: .72rem; transition: background .18s ease, color .18s ease; }
.collection-tabs button[aria-current="page"] { background: rgba(126,54,83,.3); color: var(--color-text); }
.collection-tabs em { padding: .1rem .3rem; border-radius: 1rem; background: rgba(232,188,120,.14); color: var(--color-accent); font-family: var(--font-mono); font-size: .55rem; font-style: normal; }
.collection-section { margin-bottom: 1.5rem; }
.section-title { display: flex; align-items: center; justify-content: space-between; margin-bottom: .75rem; }
h3 { margin: 0; font-family: var(--font-display); font-size: 1.05rem; }
.section-title span { color: var(--color-accent); font-family: var(--font-mono); font-size: .75rem; }
.cg-grid { display: grid; gap: .65rem; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.cg-grid > figure { position: relative; overflow: hidden; margin: 0; border: 1px solid var(--color-border); border-radius: .8rem; aspect-ratio: 16 / 9; background: rgba(255,255,255,.03); }
.cg-open { display: block; width: 100%; height: 100%; padding: 0; border: 0; background: transparent; cursor: zoom-in; }
.cg-open img { display: block; width: 100%; height: 100%; object-fit: cover; transition: filter .2s ease, transform .2s ease; }
.cg-open:hover img { filter: brightness(1.08); transform: scale(1.025); }
.cg-open:focus-visible { outline: 3px solid var(--color-accent); outline-offset: -3px; }
.cg-pending {
  position: absolute;
  top: .4rem;
  right: .4rem;
  padding: .25rem .42rem;
  border: 1px solid rgba(255,225,166,.45);
  border-radius: 999px;
  background: rgba(20,13,29,.82);
  color: #ffe1a6;
  font-family: var(--font-mono);
  font-size: .56rem;
  letter-spacing: .04em;
  pointer-events: none;
}
.cg-placeholder { display: grid; height: 100%; color: rgba(255,255,255,.18); font-family: var(--font-display); font-size: 2rem; place-items: center; }
.cg-grid figcaption { position: absolute; inset: auto 0 0; padding: .65rem .55rem .45rem; background: linear-gradient(transparent, rgba(0,0,0,.88)); font-size: .72rem; pointer-events: none; }
.ending-grid { display: grid; gap: .45rem; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.ending-grid div {
  position: relative;
  display: flex;
  align-items: center;
  gap: .4rem;
  padding: .65rem;
  border: 1px solid var(--color-border);
  border-left-width: 3px;
  border-left-color: transparent;
  border-radius: .65rem;
  color: var(--color-text-muted);
  font-size: .78rem;
  transition: border-left-color .3s ease;
}
.ending-grid div.unlocked { border-color: rgba(232,188,120,.4); background: rgba(232,188,120,.06); color: var(--color-text); }
.ending-grid-secret div { opacity: .55; }
.ending-grid-secret div.unlocked { opacity: 1; }
.ending-tag {
  flex: 0 0 auto;
  padding: .1rem .35rem;
  border: 1px solid currentColor;
  border-radius: .25rem;
  font-size: .58rem;
  line-height: 1.3;
  opacity: .8;
}
.bond-grid { display: grid; gap: .55rem; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.bond-grid article { display: grid; gap: .35rem; text-align: center; }
.bond-grid img { width: 100%; border: 1px solid rgba(243,154,199,.35); border-radius: 50%; aspect-ratio: 1; object-fit: cover; }
.bond-grid article.locked { filter: grayscale(1); opacity: .28; }
.bond-grid span { overflow: hidden; font-size: .68rem; text-overflow: ellipsis; white-space: nowrap; }
.progress { color: var(--color-text-muted); font-size: .78rem; text-align: center; }

.cg-lightbox-backdrop {
  position: fixed;
  z-index: 300;
  inset: 0;
  display: grid;
  box-sizing: border-box;
  padding: max(1rem, env(safe-area-inset-top)) max(1rem, env(safe-area-inset-right))
    max(1rem, calc(env(safe-area-inset-bottom) + 1rem)) max(1rem, env(safe-area-inset-left));
  background: rgba(2, 3, 12, .94);
  backdrop-filter: blur(18px);
  place-items: center;
}

.cg-lightbox-panel {
  position: relative;
  display: grid;
  width: min(100%, 100rem);
  height: 100%;
  min-height: 0;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.2);
  border-radius: .8rem;
  background: #050713;
  box-shadow: 0 1.5rem 5rem rgba(0,0,0,.68);
  grid-template-rows: auto minmax(0, 1fr);
}

.cg-lightbox-toolbar {
  z-index: 2;
  display: flex;
  min-height: 3.5rem;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: .35rem .4rem .35rem 1rem;
  border-bottom: 1px solid rgba(255,255,255,.12);
  background: rgba(10,14,39,.92);
}

.cg-lightbox-toolbar p {
  margin: 0;
  color: rgba(255,255,255,.78);
  font-family: var(--font-display);
  font-size: .82rem;
  letter-spacing: .12em;
}

.cg-lightbox-media {
  position: relative;
  display: grid;
  min-height: 0;
  margin: 0;
  overflow: hidden;
  background: radial-gradient(circle at 50% 50%, rgba(55, 44, 76, .55), #03040b 72%);
  place-items: center;
}

.cg-lightbox-media img { width: 100%; height: 100%; min-height: 0; object-fit: contain; }
.cg-lightbox-caption {
  position: absolute;
  right: 50%;
  bottom: .8rem;
  display: flex;
  width: max-content;
  max-width: calc(100% - 7rem);
  align-items: center;
  gap: .8rem;
  padding: .5rem .8rem;
  border: 1px solid rgba(255,255,255,.16);
  border-radius: 2rem;
  background: rgba(4,5,14,.82);
  color: rgba(255,255,255,.9);
  font-size: .75rem;
  transform: translateX(50%);
  backdrop-filter: blur(10px);
}
.cg-lightbox-caption em { color: #ffe1a6; font-size: .7rem; font-style: normal; }
.cg-lightbox-caption strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cg-lightbox-caption span { flex: 0 0 auto; color: var(--color-accent); font-family: var(--font-mono); }

.cg-lightbox-control {
  display: grid;
  width: 2.75rem;
  min-width: 2.75rem;
  height: 2.75rem;
  border: 1px solid rgba(255,255,255,.24);
  border-radius: 50%;
  background: rgba(8,10,24,.78);
  color: white;
  box-shadow: 0 .4rem 1.3rem rgba(0,0,0,.36);
  place-items: center;
  transition: background .18s ease, border-color .18s ease;
}
.cg-lightbox-control:hover { border-color: rgba(243,154,199,.8); background: rgba(91,43,72,.9); }
.cg-lightbox-control:focus-visible { outline: 3px solid #f3a6c7; outline-offset: 2px; }
.cg-lightbox-previous,
.cg-lightbox-next { position: absolute; z-index: 3; top: 50%; transform: translateY(-50%); }
.cg-lightbox-previous { left: .7rem; }
.cg-lightbox-next { right: .7rem; }
.cg-lightbox-enter-active,
.cg-lightbox-leave-active { transition: opacity .2s ease; }
.cg-lightbox-enter-active .cg-lightbox-panel,
.cg-lightbox-leave-active .cg-lightbox-panel { transition: transform .2s ease; }
.cg-lightbox-enter-from,
.cg-lightbox-leave-to { opacity: 0; }
.cg-lightbox-enter-from .cg-lightbox-panel,
.cg-lightbox-leave-to .cg-lightbox-panel { transform: scale(.985); }

@media (min-width: 700px) { .cg-grid { grid-template-columns: repeat(3, 1fr); } .ending-grid { grid-template-columns: repeat(4, 1fr); } .bond-grid { grid-template-columns: repeat(7, 1fr); } }

@media (max-width: 560px) {
  .collection-tabs button { min-height: 3rem; padding: .4rem .25rem; }
  .collection-tabs button span { font-size: .66rem; }
  .cg-lightbox-caption { bottom: .55rem; max-width: calc(100% - 6.5rem); }
  .cg-lightbox-previous { left: .35rem; }
  .cg-lightbox-next { right: .35rem; }
}

@media (prefers-reduced-motion: reduce) {
  .cg-open img,
  .cg-lightbox-enter-active,
  .cg-lightbox-leave-active,
  .cg-lightbox-enter-active .cg-lightbox-panel,
  .cg-lightbox-leave-active .cg-lightbox-panel { transition: none; }
}
</style>
