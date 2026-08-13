<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { AlertTriangle, BookOpen, Check, FolderUp, Play, RotateCcw, Users } from '@lucide/vue'

import { characters, romanceCandidates } from '@/content/characters'
import { organizations } from '@/content/organizations'
import { useGameStore } from '@/stores/game'
import type { SaveSlot } from '@/engine/storage'
import { buildRecapSummary, SEASON2_ACTIVE_ROUTES, type Season1OutcomeSummary } from '@/engine/season2-outcome'
import { SEASON2_EPISODES, isEpisodeComplete, isSeason2Complete } from '@/content/season2/registry'
import type { CharacterId, OrganizationId, RouteId } from '@/engine/types'

const emit = defineEmits<{
  start: [params: { summary: Season1OutcomeSummary; playerName: string; slot: SaveSlot; overwrite: boolean }]
  continue: [slot: SaveSlot]
  playEpisode: [slot: SaveSlot, episodeId: string]
  openEventOneSaves: []
  openSeason3: []
  back: []
}>()

const store = useGameStore()

const sources = computed(() => store.scanSeason1Sources())
const saves = computed(() => store.season2Saves.filter((s): s is NonNullable<typeof s> => s !== null))

const NEW_SEASON2_SLOTS: SaveSlot[] = ['1', '2', '3', '4', '5', '6']
const occupiedSlots = computed(() => new Set(saves.value.map((s) => s.slot)))

const orgName = (id: OrganizationId | null) => (id && organizations[id] ? organizations[id].name : '无组织')
const routeName = (id: RouteId | null) => (id && organizations[id] ? organizations[id].name : '未定线')
const partnerName = (id: CharacterId | 'none') => (id === 'none' ? '无伴侣' : (characters[id]?.name ?? id))

const selectedSourceSlot = ref<string | null>(null)
const targetSlot = ref<SaveSlot>('1')
const overwriteConfirmed = ref(false)

const firstEmptySlot = computed(() => NEW_SEASON2_SLOTS.find((s) => !occupiedSlots.value.has(s)) ?? '1')
const selectedSource = computed(() => sources.value.find((s) => s.slot === selectedSourceSlot.value) ?? null)
const targetOccupied = computed(() => occupiedSlots.value.has(targetSlot.value))
const canStart = computed(() => Boolean(selectedSource.value) && (!targetOccupied.value || overwriteConfirmed.value))

const pickSource = (slot: string) => {
  selectedSourceSlot.value = slot
  overwriteConfirmed.value = false
  targetSlot.value = firstEmptySlot.value
}

const start = () => {
  if (!selectedSource.value || !canStart.value) return
  emit('start', {
    summary: selectedSource.value.summary,
    playerName: selectedSource.value.playerName,
    slot: targetSlot.value,
    overwrite: targetOccupied.value,
  })
}

const resume = (save: (typeof saves.value)[number]) => {
  if (!isSeason2Complete(save.episodeCompletion)) emit('continue', save.slot)
}

// 某非序章 episode 锁定：其前一集（index-1）尚未完成。
const epLocked = (save: { episodeCompletion?: Record<string, boolean> }, ep: typeof SEASON2_EPISODES[number]) => {
  if (ep.isPrologue) return false
  const previous = SEASON2_EPISODES.find((e) => e.index === ep.index - 1)
  if (!previous) return false
  return !isEpisodeComplete(save.episodeCompletion ?? {}, previous)
}

// ── 回顾建档（recap）：无合法事件一完成档时，玩家显式选择路线与伴侣，进入事件二序章 ──
const RECAP_ROUTES: RouteId[] = [...SEASON2_ACTIVE_ROUTES]
const recapRoute = ref<RouteId>('org2')
const recapPartner = ref<CharacterId | 'none'>('none')
const recapPlayerName = ref('玩家')
const recapError = ref<string | null>(null)
const recapSummary = computed<Season1OutcomeSummary | null>(() => {
  try {
    return buildRecapSummary(recapRoute.value, recapPartner.value, organizations)
  } catch {
    return null
  }
})
const canRecapStart = computed(() => recapSummary.value !== null && (!targetOccupied.value || overwriteConfirmed.value))

const startRecap = () => {
  const summary = recapSummary.value
  if (!summary || !canRecapStart.value) return
  recapError.value = null
  emit('start', { summary, playerName: recapPlayerName.value.trim() || '玩家', slot: targetSlot.value, overwrite: targetOccupied.value })
}

const keyHandler = (event: KeyboardEvent) => {
  if (event.key === 'Escape') emit('back')
}
onMounted(() => window.addEventListener('keydown', keyHandler))
onBeforeUnmount(() => window.removeEventListener('keydown', keyHandler))
</script>

<template>
  <div class="season2-flow">
    <p class="flow-note" role="note">
      主线由事件一连续进入事件二。事件三使用事件二完整结局档案建立独立进度，不会覆盖前两季存档。
    </p>

    <button class="event-three-entry" type="button" @click="emit('openSeason3')">
      <Play :size="16" fill="currentColor" />事件三 · 选择之后
      <small>继承事件二结局，或使用明确标记的回顾建档</small>
    </button>

    <button class="event-one-saves" type="button" @click="emit('openEventOneSaves')">
      <BookOpen :size="16" />查看事件一存档
    </button>

    <section v-if="saves.length" class="flow-section">
      <h3><RotateCcw :size="15" />事件二进度</h3>
      <div class="save-grid">
        <div v-for="s in saves" :key="s.slot" class="save-card">
          <button v-if="!isSeason2Complete(s.episodeCompletion)" type="button" class="save-chip" @click="resume(s)">
            <span class="save-slot">槽 {{ s.slot }}</span>
            <span class="save-meta">{{ s.playerName }} · {{ s.date }}</span>
            <Play :size="14" fill="currentColor" />
          </button>
          <div v-else class="save-chip completed-save" :aria-label="`槽 ${s.slot} 已完成`">
            <span class="save-slot">槽 {{ s.slot }}</span>
            <span class="save-meta">{{ s.playerName }} · {{ s.date }}</span>
            <span class="completed-label"><Check :size="13" />已完成</span>
          </div>
          <div class="episode-list">
            <div
              v-for="ep in SEASON2_EPISODES"
              :key="ep.id"
              class="episode-row"
              :class="{ done: isEpisodeComplete(s.episodeCompletion ?? {}, ep), locked: !isEpisodeComplete(s.episodeCompletion ?? {}, ep) && epLocked(s, ep) }"
            >
              <span class="ep-tag">
                <Check v-if="isEpisodeComplete(s.episodeCompletion ?? {}, ep)" :size="12" />
                <span v-else>{{ ep.isPrologue ? '序' : `2.${ep.index}` }}</span>
              </span>
              <span class="ep-title">{{ ep.title }}</span>
              <button
                v-if="!ep.isPrologue && isEpisodeComplete(s.episodeCompletion ?? {}, ep) === false && !epLocked(s, ep)"
                type="button"
                class="ep-enter"
                @click="emit('playEpisode', s.slot, ep.id)"
              >进入</button>
              <span v-else-if="!ep.isPrologue && epLocked(s, ep)" class="ep-locked">未解锁</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="flow-section">
      <h3><BookOpen :size="15" />开始事件二</h3>

      <!-- 有合法事件一完成档：选择存档来源 -->
      <template v-if="sources.length">
        <p class="source-label">选择作为连续剧情依据的事件一存档：</p>
        <div class="source-list">
          <button
            v-for="s in sources"
            :key="s.slot"
            type="button"
            class="source-chip"
            :class="{ active: selectedSourceSlot === s.slot }"
            @click="pickSource(s.slot)"
          >
            <Check v-if="selectedSourceSlot === s.slot" :size="15" />
            <span v-else class="dot" />
            <span class="source-main">
              <strong>{{ s.playerName }}</strong>
              <small>槽 {{ s.slot }} · {{ orgName(s.summary.organization) }} · {{ routeName(s.summary.route) }}</small>
              <small>伴侣：{{ partnerName(s.summary.activePartner) }}</small>
            </span>
          </button>
        </div>
      </template>

      <!-- 无合法事件一完成档：回顾建档入口 -->
      <template v-else>
        <p class="source-label"><FolderUp :size="14" />没有可读取的事件一结局存档，可手动建立连续剧情依据：</p>
        <div class="recap-form">
          <label class="field">
            <span class="field-label">你的名字</span>
            <input v-model="recapPlayerName" class="text-input" type="text" maxlength="12" placeholder="玩家" />
          </label>

          <label class="field">
            <span class="field-label">所属路线</span>
            <div class="option-grid">
              <button
                v-for="r in RECAP_ROUTES"
                :key="r"
                type="button"
                class="option-btn"
                :class="{ active: recapRoute === r }"
                @click="recapRoute = r"
              >{{ orgName(r) }}</button>
            </div>
          </label>

          <label class="field">
            <span class="field-label">伴侣状态</span>
            <div class="option-grid">
              <button
                type="button"
                class="option-btn"
                :class="{ active: recapPartner === 'none' }"
                @click="recapPartner = 'none'"
              >无伴侣</button>
              <button
                v-for="p in romanceCandidates"
                :key="p"
                type="button"
                class="option-btn"
                :class="{ active: recapPartner === p }"
                @click="recapPartner = p"
              >{{ characters[p]?.name ?? p }}</button>
            </div>
          </label>

          <p class="recap-note">
            回顾建档只生成 canon 允许的合法开局，不会伪造未达成的路线结局或关系。若你已有事件一存档，请先从上方进入存档记录。
          </p>
        </div>
      </template>

      <!-- 两种入口共用：事件二存档槽选择；底层 v5 槽位名称保持不变。 -->
      <div class="slot-picker">
        <span class="slot-label">事件二存档槽</span>
        <div class="slot-grid">
          <button
            v-for="opt in NEW_SEASON2_SLOTS"
            :key="opt"
            type="button"
            class="slot-btn"
            :class="{ active: targetSlot === opt, taken: occupiedSlots.has(opt) }"
            @click="targetSlot = opt; overwriteConfirmed = false"
          >
            {{ opt }}<small v-if="occupiedSlots.has(opt)">已用</small>
          </button>
        </div>

        <label v-if="targetOccupied" class="overwrite-row">
          <input v-model="overwriteConfirmed" type="checkbox" />
          <AlertTriangle :size="14" />
          <span>槽 {{ targetSlot }} 已有事件二进度，勾选以覆盖。</span>
        </label>

        <button
          v-if="sources.length"
          class="start-action"
          type="button"
          :disabled="!canStart"
          @click="start"
        >
          <Play :size="16" fill="currentColor" />继续主线 · 进入事件二
        </button>
        <button
          v-else
          class="start-action"
          type="button"
          :disabled="!canRecapStart"
          @click="startRecap"
        >
          <Play :size="16" fill="currentColor" />以回顾建档进入事件二
        </button>
      </div>
    </section>

    <button class="back-action" type="button" @click="emit('back')">
      <RotateCcw :size="16" />返回标题
    </button>

    <p class="flow-foot"><Users :size="13" />事件二 · 共通序章至完整结局均已开放</p>
  </div>
</template>

<style scoped>
.season2-flow { display: grid; gap: .85rem; padding: .25rem 0; }
.flow-note {
  margin: 0;
  padding: .7rem .85rem;
  border: 1px solid rgba(232, 188, 120, .28);
  border-radius: .6rem;
  background: rgba(232, 188, 120, .08);
  color: #f4e3c6;
  font-size: .76rem;
  line-height: 1.55;
}
.event-one-saves {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  gap: .45rem;
  border: 1px solid rgba(255,255,255,.2);
  border-radius: .6rem;
  background: rgba(255,255,255,.045);
  color: rgba(255,250,246,.84);
}
.event-three-entry {
  display: grid;
  min-height: 3.4rem;
  place-content: center;
  gap: .18rem;
  border: 1px solid rgba(143,182,217,.55);
  border-radius: .65rem;
  background: linear-gradient(135deg, rgba(66,104,137,.72), rgba(39,63,98,.62));
  color: white;
  font-weight: 700;
}
.event-three-entry small { color: rgba(232,242,255,.68); font-size: .62rem; font-weight: 400; }
.flow-section { display: grid; gap: .5rem; padding-top: .35rem; border-top: 1px solid rgba(255, 255, 255, .1); }
.flow-section:first-of-type { border-top: 0; }
.flow-section h3 { display: flex; align-items: center; gap: .4rem; margin: 0; color: #fff; font-family: var(--font-display); font-size: 1rem; letter-spacing: .06em; }
.save-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: .45rem; }
.save-chip {
  display: flex;
  align-items: center;
  gap: .5rem;
  min-height: 3rem;
  padding: .5rem .7rem;
  border: 1px solid rgba(112, 63, 87, .35);
  border-radius: .55rem;
  background: linear-gradient(135deg, rgba(255, 252, 249, .96), rgba(249, 230, 237, .94));
  color: #422b37;
  font-size: .8rem;
  font-weight: 600;
  transition: transform .15s ease, filter .15s ease;
}
.save-chip:hover { transform: translateY(-2px); filter: brightness(1.03); }
.save-chip.completed-save { cursor: default; border-color: rgba(127, 200, 147, .45); }
.save-chip.completed-save:hover { transform: none; filter: none; }
.save-slot { color: #9a5b77; font-family: var(--font-mono); font-size: .66rem; }
.save-meta { margin-left: auto; color: #5a3a47; font-size: .72rem; }
.completed-label { display: inline-flex; align-items: center; gap: .25rem; color: #3d7a4c; font-size: .68rem; }
.save-card { display: grid; gap: .4rem; padding: .5rem; border: 1px solid rgba(255, 255, 255, .12); border-radius: .6rem; background: rgba(255, 255, 255, .04); }
.episode-list { display: grid; gap: .25rem; }
.episode-row { display: flex; align-items: center; gap: .5rem; font-size: .7rem; color: rgba(255, 250, 246, .82); }
.episode-row.done { color: #b7e8c0; }
.episode-row.locked { color: rgba(255, 250, 246, .42); }
.ep-tag { display: inline-flex; align-items: center; justify-content: center; width: 1.15rem; height: 1.15rem; border-radius: 50%; border: 1px solid rgba(255, 255, 255, .3); font-size: .58rem; flex: 0 0 auto; color: #f0a9bf; }
.episode-row.done .ep-tag { background: rgba(120, 200, 140, .22); border-color: #7fc893; color: #b7e8c0; }
.ep-title { flex: 1; }
.ep-enter { padding: .2rem .55rem; border: 1px solid rgba(240, 169, 191, .55); border-radius: .4rem; background: rgba(126, 54, 83, .35); color: #fff; font-size: .68rem; font-weight: 700; }
.ep-enter:hover { background: rgba(126, 54, 83, .55); }
.ep-locked { color: rgba(255, 250, 246, .42); font-size: .64rem; }
.empty-hint { display: flex; align-items: center; gap: .4rem; margin: 0; color: rgba(255, 225, 166, .85); font-size: .74rem; }
.source-label { margin: 0; color: rgba(255, 250, 246, .82); font-size: .72rem; }
.source-list { display: grid; gap: .4rem; }
.source-chip {
  display: flex;
  align-items: center;
  gap: .55rem;
  padding: .55rem .7rem;
  border: 1px solid rgba(255, 255, 255, .18);
  border-radius: .55rem;
  background: rgba(255, 255, 255, .05);
  color: #fff;
  text-align: left;
  transition: border-color .15s ease, background .15s ease;
}
.source-chip.active { border-color: #f0a9bf; background: rgba(126, 54, 83, .35); }
.source-chip .dot { width: .65rem; height: .65rem; border-radius: 50%; border: 1px solid rgba(255, 255, 255, .5); }
.source-main { display: grid; gap: .05rem; line-height: 1.25; }
.source-main strong { font-size: .82rem; }
.source-main small { color: rgba(255, 250, 246, .6); font-size: .66rem; }
.slot-picker { display: grid; gap: .45rem; margin-top: .25rem; }
.slot-label { color: rgba(255, 250, 246, .82); font-size: .72rem; }
.slot-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: .35rem; }
.slot-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .1rem;
  min-height: 2.6rem;
  border: 1px solid rgba(255, 255, 255, .2);
  border-radius: .45rem;
  background: rgba(255, 255, 255, .06);
  color: #fff;
  font-size: .82rem;
  font-weight: 700;
  transition: border-color .15s ease, background .15s ease;
}
.slot-btn small { color: rgba(255, 220, 200, .7); font-size: .52rem; font-weight: 400; }
.slot-btn.active { border-color: #f0a9bf; background: rgba(126, 54, 83, .4); }
.slot-btn.taken { border-color: rgba(232, 188, 120, .4); }
.overwrite-row { display: flex; align-items: center; gap: .45rem; color: #ffd9b8; font-size: .72rem; }
.overwrite-row input { width: 1rem; height: 1rem; accent-color: #e8bc78; }
.start-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  min-height: 3rem;
  border: 1px solid rgba(240, 169, 191, .6);
  border-radius: .6rem;
  background: linear-gradient(135deg, rgba(132, 64, 91, .9), rgba(92, 42, 70, .85));
  color: #fff;
  font-size: .85rem;
  font-weight: 700;
}
.start-action:disabled { opacity: .42; cursor: not-allowed; }
.back-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  min-height: 3rem;
  border: 1px solid rgba(255, 255, 255, .25);
  border-radius: .6rem;
  background: transparent;
  color: rgba(255, 255, 255, .82);
  font-size: .85rem;
}
.flow-foot { margin: 0; color: rgba(255, 250, 246, .5); font-size: .66rem; text-align: center; }

/* 回顾建档表单 */
.recap-form { display: grid; gap: .6rem; padding: .2rem 0; }
.field { display: grid; gap: .3rem; }
.field-label { color: rgba(255, 250, 246, .82); font-size: .72rem; }
.text-input {
  min-height: 2.4rem;
  padding: .4rem .6rem;
  border: 1px solid rgba(255, 255, 255, .22);
  border-radius: .45rem;
  background: rgba(255, 255, 255, .06);
  color: #fff;
  font-size: .82rem;
}
.text-input::placeholder { color: rgba(255, 250, 246, .4); }
.option-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(4.6rem, 1fr)); gap: .35rem; }
.option-btn {
  min-height: 2.3rem;
  padding: .3rem .4rem;
  border: 1px solid rgba(255, 255, 255, .2);
  border-radius: .45rem;
  background: rgba(255, 255, 255, .05);
  color: #fff;
  font-size: .72rem;
  font-weight: 600;
  transition: border-color .15s ease, background .15s ease;
}
.option-btn.active { border-color: #f0a9bf; background: rgba(126, 54, 83, .42); }
.recap-note { margin: 0; color: rgba(255, 220, 200, .7); font-size: .66rem; line-height: 1.5; }

@media (max-width: 680px) {
  .save-grid { grid-template-columns: 1fr; }
  .slot-grid { grid-template-columns: repeat(6, 1fr); gap: .2rem; }
}
</style>
