<script setup lang="ts">
import { ArrowRight, BookHeart, Heart, LockKeyhole, MapPin, MessageCircleHeart, RotateCcw, Sparkles } from '@lucide/vue'
import { computed, nextTick, ref, watch } from 'vue'

import { characters } from '@/content/characters'
import {
  getRomanceAction,
  getRomanceAvailability,
  isRomanceEpisodeCompleted,
  romanceEpisodeById,
  romanceProfiles,
} from '@/content/romanceProfiles'
import {
  romanceAfterEpisodeKinds,
  romanceStyleAxes,
  romanceStyleAxisLabels,
  romanceStyleVariable,
} from '@/content/romanceAfterStoryTypes'
import { getSpriteAsset } from '@/content/sprites'

import type {
  RomanceCandidateId,
  RomanceProfile,
  RomanceStage,
} from '@/content/romanceProfiles'
import type { GameState, SpriteExpression } from '@/engine/types'

const props = defineProps<{ state: GameState }>()
const emit = defineEmits<{
  start: [episodeId: string]
  replay: [episodeId: string]
}>()

interface ProfileView {
  profile: RomanceProfile
  stage: RomanceStage
  progress: number
}

const profiles = Object.values(romanceProfiles)
const profileViews = computed<ProfileView[]>(() => profiles.map((profile) => {
  const availability = getRomanceAvailability(props.state, profile.character)
  return {
    profile,
    stage: availability.stage,
    progress: availability.progress,
  }
}))

const preferredCharacter = () => (
  profileViews.value.find(({ stage }) => stage === 'partner')?.profile.character
  ?? profileViews.value.find(({ stage }) => stage === 'confessable')?.profile.character
  ?? profileViews.value.find(({ stage }) => stage === 'dateable')?.profile.character
  ?? [...profileViews.value].sort((left, right) => right.progress - left.progress)[0]?.profile.character
  ?? profiles[0]!.character
)

const selectedId = ref<RomanceCandidateId>(preferredCharacter())
const selectedView = computed(() => (
  profileViews.value.find(({ profile }) => profile.character === selectedId.value)
  ?? profileViews.value[0]!
))
const selectedCharacter = computed(() => characters[selectedId.value])
const selectedRelationship = computed(() => props.state.relationships[selectedId.value])
const partnerView = computed(() => profileViews.value.find(({ stage }) => stage === 'partner'))

watch(profileViews, (views) => {
  if (!views.some(({ profile }) => profile.character === selectedId.value)) {
    selectedId.value = preferredCharacter()
  }
})

const stageLabels: Record<RomanceStage, string> = {
  locked: '仍在相识',
  dateable: '新的邀约',
  dated: '已经靠近',
  confessable: '心意已明',
  partner: '与你约定',
  'partnered-elsewhere': '珍贵同伴',
}

const stageExpression: Record<RomanceStage, SpriteExpression> = {
  locked: 'neutral',
  dateable: 'soft',
  dated: 'smile',
  confessable: 'soft',
  partner: 'relaxed',
  'partnered-elsewhere': 'neutral',
}

const selectedSprite = computed(() => getSpriteAsset(
  selectedId.value,
  stageExpression[selectedView.value.stage],
  'base',
))

const relationshipLine = computed(() => {
  const relation = selectedRelationship.value
  if (selectedView.value.stage === 'partner') return '组织里的称呼已经放下，你们正在学习只为彼此留一段时间。'
  if (selectedView.value.stage === 'confessable') return '有一句话已经走到门前，只差你亲手把那扇门推开。'
  if (selectedView.value.stage === 'dateable') return '一条不谈职位和胜负的消息，正在等你的回复。'
  if (selectedView.value.stage === 'dated') return '你们已经共享过一个夜晚，下一句重要的话不必着急。'
  if (selectedView.value.stage === 'partnered-elsewhere') return '有些关系适合留在可靠的同伴位置，也仍然值得被认真记住。'
  if (relation.stance === 'left') return '对方离开了组织，但私人窗口没有因此从故事里消失。'
  if (relation.stance === 'oppose') return '你们的意见仍然相左，真正的靠近要从听完彼此开始。'
  if (relation.stance === 'watch') return '对方还在观察：你说过的话，会不会在下一次选择里算数。'
  if (relation.stance === 'support') return '对方愿意站在你这一边，但还没有把这份信任叫作别的名字。'
  if (selectedView.value.progress > 0) return '一条普通消息正在慢慢变得私人，只是你们都还没有点破。'
  return '你们还没有留下足够多的共同片段。继续主线，也许会等到第一条私聊。'
})

const action = computed(() => {
  const { profile } = selectedView.value
  const recommendation = getRomanceAction(profile, props.state)
  if (!recommendation.enabled || !recommendation.nodeId || recommendation.kind === 'disabled') return null
  const copy = ({
    firstDate: ['赴约', '这段邀约会进入全屏支线，结束后回到刚才的主线。'],
    confession: ['回应', '这一次回答会确认唯一的恋爱关系。'],
    secondDate: ['再赴约', '这次没有标准答案；选择会成为你们的相处方式。'],
    conflict: ['面对分歧', '问题不会靠一句误会解除；双方边界都需要被说清。'],
    reconciliation: ['一起修复', '修复会承认代价，并留下可以继续调整的约定。'],
    daily: ['去见 Ta', '新续篇完成后，仍可回到只属于你们的普通日常。'],
  } as const)[recommendation.kind]
  if (!copy) return null
  return {
    id: recommendation.nodeId,
    label: `${copy[0]} · ${recommendation.title}`,
    hint: copy[1],
  }
})

// Completed episodes become read-only memories; replay isolation is enforced by the store, not this panel.
const selectedMemories = computed(() => {
  const profile = selectedView.value.profile
  const ids = [
    profile.firstDateNodeId,
    profile.confessionNodeId,
    profile.secondDateNodeId,
    profile.conflictNodeId,
    profile.reconciliationNodeId,
    profile.dailyNodeId,
  ]
  return ids
    .map((id) => romanceEpisodeById[id])
    .filter((episode) => episode && isRomanceEpisodeCompleted(episode, props.state))
})

const selectedStyleMemories = computed(() => {
  const character = selectedId.value
  return romanceAfterEpisodeKinds.flatMap((kind) => romanceStyleAxes[kind].flatMap((axis) => {
    const value = props.state.variables[romanceStyleVariable(character, axis)]
    return typeof value === 'string' && value.trim()
      ? [{ axis, label: romanceStyleAxisLabels[axis] ?? axis, value }]
      : []
  }))
})

const unavailableReason = computed(() => {
  const { profile, stage } = selectedView.value
  if (stage === 'partnered-elsewhere') {
    const partner = partnerView.value
    const name = partner ? (characters[partner.profile.character].shortName ?? characters[partner.profile.character].name) : '另一个人'
    return `你已经和${name}约定彼此；这里会保留为一段重要的同伴关系。`
  }
  if (stage === 'dated') return `关于「${profile.confessionTitle}」的话还没到该说的时候。先继续主线。`
  return `关于「${profile.dateTitle}」的消息还没有发来。先继续主线，也许会在下一次选择后亮起。`
})

const heading = computed(() => {
  const partner = partnerView.value
  if (!partner) return {
    title: '谁的头像还亮着？',
    copy: '关系不是另一张任务表。这里记住的，是你们一起度过的那些小事。',
  }
  const name = characters[partner.profile.character].shortName ?? characters[partner.profile.character].name
  return {
    title: `与${name}的约定`,
    copy: '告白已经有了答案；其他人的故事仍会以朋友和同伴的方式继续。',
  }
})

const stageStyle = computed<Record<string, string>>(() => ({
  '--bond-color': selectedCharacter.value.color,
  '--bond-avatar': `url("${selectedCharacter.value.avatar ?? ''}")`,
}))

const tabId = (character: RomanceCandidateId) => `romance-tab-${character}`
const panelId = (character: RomanceCandidateId) => `romance-panel-${character}`

const focusProfile = async (character: RomanceCandidateId) => {
  selectedId.value = character
  await nextTick()
  const tab = document.getElementById(tabId(character))
  tab?.focus({ preventScroll: true })
  tab?.scrollIntoView({ block: 'nearest', inline: 'center' })
}

const moveSelection = (offset: number) => {
  const index = profiles.findIndex(({ character }) => character === selectedId.value)
  const nextIndex = (index + offset + profiles.length) % profiles.length
  const nextProfile = profiles[nextIndex]
  if (nextProfile) void focusProfile(nextProfile.character)
}

const moveToEdge = (edge: 'first' | 'last') => {
  const profile = edge === 'first' ? profiles[0] : profiles.at(-1)
  if (profile) void focusProfile(profile.character)
}
</script>

<template>
  <section class="romance-panel" :style="stageStyle" aria-labelledby="romance-title">
    <header class="bond-heading">
      <div class="heading-mark" aria-hidden="true"><Heart :size="20" fill="currentColor" /></div>
      <div>
        <span>羁绊 · 夜色未完</span>
        <h2 id="romance-title">{{ heading.title }}</h2>
        <p>{{ heading.copy }}</p>
      </div>
      <div v-if="partnerView" class="partner-chip">
        <img :src="characters[partnerView.profile.character].avatar" alt="" />
        <span><small>与你约定的人</small><strong>{{ characters[partnerView.profile.character].shortName ?? characters[partnerView.profile.character].name }}</strong></span>
      </div>
    </header>

    <div
      class="portrait-reel"
      role="tablist"
      aria-label="可查看的羁绊角色"
      @keydown.left.prevent="moveSelection(-1)"
      @keydown.right.prevent="moveSelection(1)"
      @keydown.home.prevent="moveToEdge('first')"
      @keydown.end.prevent="moveToEdge('last')"
    >
      <button
        v-for="view in profileViews"
        :id="tabId(view.profile.character)"
        :key="view.profile.character"
        class="portrait-tab"
        :class="{ selected: view.profile.character === selectedId, available: ['dateable', 'confessable', 'partner'].includes(view.stage) }"
        type="button"
        role="tab"
        :tabindex="view.profile.character === selectedId ? 0 : -1"
        :aria-selected="view.profile.character === selectedId"
        :aria-controls="panelId(view.profile.character)"
        @click="selectedId = view.profile.character"
      >
        <span class="portrait-frame">
          <img :src="characters[view.profile.character].avatar" alt="" />
          <i v-if="view.stage === 'partner'" aria-hidden="true"><Heart :size="11" fill="currentColor" /></i>
          <i v-else-if="['dateable', 'confessable'].includes(view.stage)" aria-hidden="true"><Sparkles :size="11" /></i>
        </span>
        <span>{{ characters[view.profile.character].shortName ?? characters[view.profile.character].name }}</span>
      </button>
    </div>

    <article
      :id="panelId(selectedId)"
      class="bond-stage"
      role="tabpanel"
      :aria-labelledby="tabId(selectedId)"
      tabindex="0"
    >
      <div class="stage-art">
        <div class="portrait-haze" aria-hidden="true" />
        <div class="stage-wash" aria-hidden="true" />
        <img
          v-if="selectedSprite"
          class="character-sprite"
          :src="selectedSprite"
          :alt="`${selectedCharacter.name}的羁绊立绘`"
        />
        <img
          v-else
          class="character-avatar"
          :src="selectedCharacter.avatar"
          :alt="`${selectedCharacter.name}头像`"
        />
        <div class="identity">
          <span>{{ stageLabels[selectedView.stage] }}</span>
          <h3>{{ selectedCharacter.name }}</h3>
          <p>{{ selectedCharacter.role }}</p>
        </div>
      </div>

      <div class="bond-copy">
        <p class="character-note">{{ selectedCharacter.description }}</p>
        <blockquote>
          <MessageCircleHeart :size="20" aria-hidden="true" />
          <p>{{ relationshipLine }}</p>
        </blockquote>

        <div class="progress-copy">
          <div>
            <span>攻略进度</span>
            <strong>{{ selectedView.progress }}%</strong>
          </div>
          <div
            class="progress-track"
            role="progressbar"
            :aria-label="`${selectedCharacter.name}攻略进度`"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="selectedView.progress"
          >
            <i :style="{ width: `${selectedView.progress}%` }" />
          </div>
          <small>数字只记录已经发生的故事，不提示最优答案。</small>
        </div>

        <section v-if="selectedStyleMemories.length" class="style-memory" aria-labelledby="style-memory-title">
          <div class="memory-heading">
            <BookHeart :size="18" aria-hidden="true" />
            <h4 id="style-memory-title">你们正在形成的相处方式</h4>
          </div>
          <div class="style-chips">
            <span v-for="memory in selectedStyleMemories" :key="memory.axis">
              <small>{{ memory.label }}</small>{{ memory.value }}
            </span>
          </div>
        </section>

        <section v-if="selectedMemories.length" class="episode-memory" aria-labelledby="episode-memory-title">
          <div class="memory-heading">
            <RotateCcw :size="18" aria-hidden="true" />
            <div>
              <h4 id="episode-memory-title">关系回忆</h4>
              <p>重温使用临时快照，不改当前选择、收藏或存档。</p>
            </div>
          </div>
          <div class="memory-list">
            <button
              v-for="memory in selectedMemories"
              :key="memory!.id"
              type="button"
              :aria-label="`重温${memory!.title}`"
              @click="emit('replay', memory!.id)"
            >
              <span>{{ memory!.title }}</span><RotateCcw :size="16" aria-hidden="true" />
            </button>
          </div>
        </section>

        <div v-if="action" class="action-area">
          <p><MapPin :size="16" aria-hidden="true" />{{ action.hint }}</p>
          <button type="button" @click="emit('start', action.id)">
            <span>{{ action.label }}</span><ArrowRight :size="20" aria-hidden="true" />
          </button>
        </div>
        <div v-else class="waiting-note" role="status">
          <LockKeyhole :size="18" aria-hidden="true" />
          <p>{{ unavailableReason }}</p>
        </div>
      </div>
    </article>
  </section>
</template>

<style scoped>
.romance-panel {
  --bond-color: #d97e9f;
  --bond-avatar: none;
  display: grid;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  gap: 1rem;
  overflow: hidden;
  color: var(--color-text);
}

.bond-heading {
  display: grid;
  min-width: 0;
  align-items: center;
  gap: .75rem;
  grid-template-columns: auto minmax(0, 1fr) auto;
}

.heading-mark {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid color-mix(in srgb, var(--bond-color) 62%, white 10%);
  border-radius: 50%;
  background: color-mix(in srgb, var(--bond-color) 18%, transparent);
  color: color-mix(in srgb, var(--bond-color) 72%, white 28%);
  place-items: center;
}

.bond-heading > div:nth-child(2) { min-width: 0; }
.bond-heading span {
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: .68rem;
  letter-spacing: .12em;
}
.bond-heading h2 {
  margin: .08rem 0 0;
  font-family: var(--font-display);
  font-size: clamp(1.25rem, 5vw, 1.75rem);
  line-height: 1.2;
}
.bond-heading p {
  max-width: 38rem;
  margin: .25rem 0 0;
  color: var(--color-text-muted);
  font-size: .78rem;
  line-height: 1.55;
}

.partner-chip {
  display: flex;
  min-height: 2.75rem;
  align-items: center;
  gap: .5rem;
  padding: .25rem .65rem .25rem .25rem;
  border: 1px solid color-mix(in srgb, var(--bond-color) 35%, transparent);
  border-radius: 2rem;
  background: color-mix(in srgb, var(--bond-color) 10%, rgba(255,255,255,.035));
}
.partner-chip img { width: 2.15rem; height: 2.15rem; border-radius: 50%; object-fit: cover; }
.partner-chip span { display: grid; min-width: 0; letter-spacing: normal; }
.partner-chip small { color: var(--color-text-muted); font-size: .57rem; }
.partner-chip strong { overflow: hidden; max-width: 8rem; font-size: .72rem; text-overflow: ellipsis; white-space: nowrap; }

.portrait-reel {
  display: flex;
  min-width: 0;
  gap: .55rem;
  overflow-x: auto;
  padding: .2rem .15rem .55rem;
  scroll-padding-inline: .15rem;
  scrollbar-color: color-mix(in srgb, var(--bond-color) 42%, transparent) transparent;
  scrollbar-width: thin;
  overscroll-behavior-inline: contain;
  scroll-snap-type: inline proximity;
}

.portrait-tab {
  display: grid;
  width: 4rem;
  min-width: 4rem;
  min-height: 4.65rem;
  justify-items: center;
  gap: .3rem;
  padding: .22rem;
  border: 0;
  border-radius: .8rem;
  background: transparent;
  color: var(--color-text-muted);
  scroll-snap-align: center;
}
.portrait-frame {
  position: relative;
  width: 3.25rem;
  height: 3.25rem;
  padding: .14rem;
  border: 1px solid rgba(255,255,255,.16);
  border-radius: 50%;
  background: rgba(255,255,255,.035);
  transition: border-color var(--duration-fast) ease, transform var(--duration-fast) var(--ease-out), filter var(--duration-fast) ease;
}
.portrait-frame img { width: 100%; height: 100%; border-radius: inherit; filter: saturate(.68) brightness(.82); object-fit: cover; }
.portrait-frame i {
  position: absolute;
  right: -.1rem;
  bottom: -.05rem;
  display: grid;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #231725;
  border-radius: 50%;
  background: var(--bond-color);
  color: white;
  place-items: center;
}
.portrait-tab > span:last-child {
  overflow: hidden;
  width: 100%;
  font-size: .66rem;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.portrait-tab.available .portrait-frame { border-color: color-mix(in srgb, var(--bond-color) 62%, white 10%); }
.portrait-tab.selected { color: white; }
.portrait-tab.selected .portrait-frame {
  border-color: color-mix(in srgb, var(--bond-color) 78%, white 22%);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--bond-color) 22%, transparent);
  transform: translateY(-.12rem);
}
.portrait-tab.selected .portrait-frame img { filter: none; }
.portrait-tab:focus-visible { outline: 3px solid rgba(242,196,209,.82); outline-offset: 1px; box-shadow: none; }

.bond-stage {
  display: grid;
  min-width: 0;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--bond-color) 26%, rgba(255,255,255,.12));
  border-radius: 1rem;
  background: rgba(26, 17, 27, .82);
  box-shadow: 0 1.25rem 3rem rgba(1,2,9,.32);
  grid-template-columns: minmax(14rem, .9fr) minmax(0, 1.1fr);
}
.bond-stage:focus { outline: none; }
.bond-stage:focus-visible { box-shadow: var(--focus-ring), 0 1.25rem 3rem rgba(1,2,9,.32); }

.stage-art {
  position: relative;
  min-height: 25rem;
  overflow: hidden;
  background:
    radial-gradient(circle at 52% 18%, color-mix(in srgb, var(--bond-color) 34%, transparent), transparent 45%),
    linear-gradient(145deg, color-mix(in srgb, var(--bond-color) 16%, #1b1320), #17121d 72%);
  isolation: isolate;
}
.portrait-haze {
  position: absolute;
  z-index: -2;
  inset: -12%;
  background: var(--bond-avatar) center / cover no-repeat;
  filter: blur(34px) saturate(.75);
  opacity: .26;
  transform: scale(1.08);
}
.stage-wash {
  position: absolute;
  z-index: 2;
  inset: 0;
  background:
    linear-gradient(180deg, transparent 42%, rgba(20,13,22,.78) 88%),
    linear-gradient(90deg, transparent 56%, rgba(20,13,22,.28));
  pointer-events: none;
}
.character-sprite {
  position: absolute;
  z-index: 1;
  right: -5%;
  bottom: -7%;
  width: 94%;
  height: 108%;
  filter: drop-shadow(0 1.2rem 1.5rem rgba(10, 5, 12, .48));
  object-fit: contain;
  object-position: center bottom;
}
.character-avatar {
  position: absolute;
  z-index: 1;
  top: 17%;
  left: 50%;
  width: min(62%, 13rem);
  border: 2px solid color-mix(in srgb, var(--bond-color) 60%, white 15%);
  border-radius: 50%;
  box-shadow: 0 1rem 2.5rem rgba(8,4,10,.38);
  aspect-ratio: 1;
  object-fit: cover;
  transform: translateX(-50%);
}
.identity {
  position: absolute;
  z-index: 3;
  right: 1rem;
  bottom: 1rem;
  left: 1rem;
  text-shadow: 0 .15rem .65rem rgba(0,0,0,.72);
}
.identity span { color: color-mix(in srgb, var(--bond-color) 48%, white 52%); font-size: .7rem; letter-spacing: .12em; }
.identity h3 { margin: .12rem 0 0; font-family: var(--font-display); font-size: clamp(1.45rem, 5vw, 2.25rem); line-height: 1.15; }
.identity p { margin: .2rem 0 0; color: rgba(255,255,255,.72); font-size: .7rem; }

.bond-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 1rem;
  padding: clamp(1rem, 3.5vw, 1.5rem);
}
.character-note {
  margin: 0;
  color: var(--color-text-muted);
  font-size: .82rem;
  line-height: 1.65;
}
.bond-copy blockquote {
  display: grid;
  align-items: start;
  gap: .65rem;
  margin: 0;
  padding: .85rem;
  border-left: .2rem solid var(--bond-color);
  border-radius: .25rem .75rem .75rem .25rem;
  background: color-mix(in srgb, var(--bond-color) 9%, rgba(255,255,255,.035));
  grid-template-columns: auto 1fr;
}
.bond-copy blockquote svg { margin-top: .1rem; color: color-mix(in srgb, var(--bond-color) 68%, white 32%); }
.bond-copy blockquote p { margin: 0; font-size: .88rem; line-height: 1.7; }

.progress-copy { display: grid; gap: .45rem; }
.progress-copy > div:first-child { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; }
.progress-copy span { color: var(--color-text-muted); font-size: .72rem; }
.progress-copy strong { color: color-mix(in srgb, var(--bond-color) 58%, white 42%); font-family: var(--font-mono); font-size: .78rem; }
.progress-track { overflow: hidden; height: .42rem; border-radius: 1rem; background: rgba(255,255,255,.09); }
.progress-track i {
  display: block;
  width: 0;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, color-mix(in srgb, var(--bond-color) 78%, #e6b681), color-mix(in srgb, var(--bond-color) 74%, white 26%));
  transition: width var(--duration-normal) var(--ease-out);
}
.progress-copy small { color: rgba(221,203,212,.72); font-size: .66rem; line-height: 1.5; }

.style-memory,
.episode-memory {
  display: grid;
  gap: .65rem;
  padding: .8rem;
  border: 1px solid color-mix(in srgb, var(--bond-color) 24%, rgba(255,255,255,.08));
  border-radius: .8rem;
  background: color-mix(in srgb, var(--bond-color) 7%, rgba(255,255,255,.025));
}
.memory-heading { display: flex; align-items: flex-start; gap: .55rem; color: color-mix(in srgb, var(--bond-color) 65%, white 35%); }
.memory-heading > svg { flex: 0 0 auto; margin-top: .1rem; }
.memory-heading h4 { margin: 0; color: var(--color-text); font-family: var(--font-display); font-size: .82rem; }
.memory-heading p { margin: .15rem 0 0; color: var(--color-text-muted); font-size: .64rem; line-height: 1.45; }
.style-chips { display: flex; flex-wrap: wrap; gap: .4rem; }
.style-chips span {
  display: grid;
  gap: .08rem;
  padding: .4rem .55rem;
  border: 1px solid color-mix(in srgb, var(--bond-color) 24%, rgba(255,255,255,.08));
  border-radius: .65rem;
  background: rgba(255,255,255,.035);
  color: var(--color-text);
  font-size: .67rem;
}
.style-chips small { color: var(--color-text-muted); font-size: .54rem; }
.memory-list { display: grid; gap: .4rem; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.memory-list button {
  display: flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: space-between;
  gap: .5rem;
  padding: .5rem .65rem;
  border: 1px solid rgba(255,255,255,.12);
  border-radius: .65rem;
  background: rgba(255,255,255,.035);
  color: var(--color-text);
  font-size: .66rem;
  text-align: left;
}
.memory-list button:hover { border-color: color-mix(in srgb, var(--bond-color) 52%, white 8%); background: color-mix(in srgb, var(--bond-color) 12%, rgba(255,255,255,.035)); }
.memory-list button svg { flex: 0 0 auto; color: var(--color-accent); }

.action-area {
  display: grid;
  gap: .65rem;
  margin-top: auto;
  padding-top: .85rem;
}
.action-area p {
  display: flex;
  align-items: center;
  gap: .42rem;
  margin: 0;
  color: var(--color-text-muted);
  font-size: .7rem;
  line-height: 1.5;
}
.action-area p svg { flex: 0 0 auto; color: var(--color-accent); }
.action-area button {
  display: flex;
  width: 100%;
  min-height: 3.25rem;
  align-items: center;
  justify-content: space-between;
  gap: .75rem;
  padding: .7rem 1rem;
  border: 1px solid color-mix(in srgb, var(--bond-color) 72%, white 12%);
  border-radius: .8rem;
  background: linear-gradient(105deg, color-mix(in srgb, var(--bond-color) 82%, #55223c), color-mix(in srgb, var(--bond-color) 56%, #2c1930));
  color: white;
  box-shadow: 0 .75rem 1.5rem color-mix(in srgb, var(--bond-color) 18%, transparent);
  font-weight: 600;
  text-align: left;
  transition: filter var(--duration-fast) ease, transform var(--duration-fast) var(--ease-out);
}
.action-area button:hover { filter: brightness(1.08); transform: translateY(-1px); }
.action-area button:active { transform: scale(.985); }

.waiting-note {
  display: grid;
  min-height: 4.4rem;
  align-items: center;
  gap: .65rem;
  margin-top: auto;
  padding: .8rem;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: .75rem;
  background: rgba(255,255,255,.035);
  color: var(--color-text-muted);
  grid-template-columns: auto 1fr;
}
.waiting-note svg { color: color-mix(in srgb, var(--bond-color) 44%, var(--color-text-muted)); }
.waiting-note p { margin: 0; font-size: .75rem; line-height: 1.6; }

@media (max-width: 680px) {
  .bond-heading { grid-template-columns: auto minmax(0, 1fr); }
  .partner-chip { grid-column: 1 / -1; justify-self: start; }
  .bond-heading p { font-size: .75rem; }
  .portrait-reel { margin-inline: -.15rem; }
  .bond-stage { grid-template-columns: 1fr; }
  .stage-art { min-height: clamp(14.5rem, 43vh, 20rem); }
  .character-sprite { right: -3%; bottom: -9%; width: 88%; height: 118%; }
  .identity { right: .85rem; bottom: .85rem; left: .85rem; }
  .bond-copy { padding: .9rem; }
  .memory-list { grid-template-columns: 1fr; }
  .action-area {
    position: sticky;
    z-index: 4;
    bottom: 0;
    margin: auto -.9rem -.9rem;
    padding: .85rem .9rem max(.9rem, env(safe-area-inset-bottom));
    background: linear-gradient(transparent, rgba(26,17,27,.98) 24%);
  }
}

@media (max-width: 380px) {
  .bond-heading { gap: .55rem; }
  .heading-mark { width: 2.75rem; height: 2.75rem; }
  .portrait-tab { width: 3.75rem; min-width: 3.75rem; }
  .stage-art { min-height: 13.8rem; }
  .bond-copy blockquote { padding: .72rem; }
}

@media (prefers-reduced-motion: reduce) {
  .portrait-frame,
  .progress-track i,
  .action-area button { transition: none; }
}
</style>
