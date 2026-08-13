<script setup lang="ts">
import {
  BarChart3, BookOpen, ChevronDown, FastForward, Heart, HeartHandshake, History, Menu, Pause, Play,
  RotateCcw, Save, Settings, SkipForward, Volume2, VolumeX,
} from '@lucide/vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import BattleStage from '@/components/BattleStage.vue'
import CharacterStage from '@/components/CharacterStage.vue'
import ChatStage from '@/components/ChatStage.vue'
import EndingStage from '@/components/EndingStage.vue'
import SceneAtmosphere from '@/components/SceneAtmosphere.vue'
import SceneBackdrop from '@/components/SceneBackdrop.vue'
import SystemStage from '@/components/SystemStage.vue'
import { backgrounds } from '@/content/assets'
import { characters } from '@/content/characters'
import { getActor } from '@/content/storyActors'
import type { Season2ActiveRoute } from '@/engine/season2-outcome'
import { audioDirector } from '@/engine/audio'
import { preloadCurrentAndNextScenes } from '@/engine/preload'
import { resolveSceneDirection } from '@/engine/presentation'
import { renderText } from '@/engine/state'
import { useGameStore } from '@/stores/game'
import type { Effect, NumericStat } from '@/engine/types'

const emit = defineEmits<{
  open: [panel: 'menu' | 'history' | 'saves' | 'status' | 'romance' | 'settings']
  title: []
  toast: [message: string]
}>()
const props = defineProps<{ paused?: boolean }>()

const store = useGameStore()
const visibleText = ref('')
const autoMode = ref(false)
const skipMode = ref(false)
const showControls = ref(true)
const revealComplete = ref(false)
let typingTimer: number | null = null
let advanceTimer: number | null = null

const node = computed(() => store.node)
const state = computed(() => store.state)
const renderedText = computed(() => node.value && state.value ? renderText(node.value.text, state.value) : '')
const speaker = computed(() => {
  if (!node.value || !state.value) return characters.narrator
  if (node.value.speaker === 'player') return { ...characters.player, name: state.value.playerName }
  return getActor(node.value.speaker)
})
const background = computed(() => node.value ? backgrounds[node.value.background] : backgrounds.login)
const direction = computed(() => node.value ? resolveSceneDirection(node.value) : null)
// CG placeholders override background placeholders; ordinary scenes inherit the background replacement contract.
const visualPlaceholderFor = computed(() => (
  direction.value?.cgPlaceholderFor
  ?? (!direction.value?.cg ? background.value.placeholderFor : undefined)
))
const visualPromptRef = computed(() => (
  direction.value?.cgPromptRef
  ?? (!direction.value?.cg ? background.value.promptRef : undefined)
))
const hasChoices = computed(() => store.choices.length > 0)
const hasKeyBranchHint = computed(() => {
  const structuralEffects = new Set<Effect['type']>([
    'route',
    'organizationName',
    'organizationRelation',
    'activePartner',
    'highCouncil',
    'stance',
  ])
  // The hint names no branch or outcome; it only signals that this is a durable decision.
  return store.choices.some((choice) => choice.effects?.some((effect) => structuralEffects.has(effect.type)))
})
const hasTextEntry = computed(() => Boolean(node.value?.textEntry))
const canAdvance = computed(() => Boolean(node.value?.next))
const dialogueCanInteract = computed(() => Boolean(
  !store.isFinished
  && (!revealComplete.value || (canAdvance.value && !hasChoices.value && !hasTextEntry.value)),
))
const isChatStage = computed(() => (
  direction.value?.ui === 'private-chat'
  || direction.value?.ui === 'group-chat'
  || direction.value?.ui === 'world-chat'
))
const isSystemStage = computed(() => (
  direction.value?.ui === 'game-client'
  || direction.value?.ui === 'organization'
  || direction.value?.ui === 'reward'
))
const isInlineStage = computed(() => isChatStage.value || isSystemStage.value)
const isBattleStage = computed(() => direction.value?.ui === 'fortress')
const isEndingStage = computed(() => (direction.value?.ui ?? '').startsWith('ending'))
const showSceneTitle = computed(() => Boolean(
  node.value?.title
  && !isChatStage.value
  && !isSystemStage.value
  && !isBattleStage.value
  && !isEndingStage.value,
))
const heartbeatSupport = computed(() => state.value?.supportAbilities.heartbeat)
const showHeartbeatSupport = computed(() => Boolean(
  hasChoices.value && !store.inRomanceScene && heartbeatSupport.value?.unlocked,
))
const heartbeatSupportLabel = computed(() => {
  const support = heartbeatSupport.value
  if (!support) return '心跳支援'
  if (support.active) return '心跳已就绪·下一选择生效'
  if (support.charges <= 0) return '心跳支援·本幕已用'
  return `心跳支援·${support.charges}`
})

const clearTimers = () => {
  if (typingTimer !== null) window.clearTimeout(typingTimer)
  if (advanceTimer !== null) window.clearTimeout(advanceTimer)
  typingTimer = null
  advanceTimer = null
}

const typeCurrentText = () => {
  clearTimers()
  const chars = [...renderedText.value]
  visibleText.value = ''
  revealComplete.value = false

  if (store.settings.reducedMotion || store.settings.textSpeed <= 8) {
    visibleText.value = renderedText.value
    revealComplete.value = true
    scheduleAdvance()
    return
  }

  let index = 0
  const tick = () => {
    index += 1
    visibleText.value = chars.slice(0, index).join('')
    if (index >= chars.length) {
      revealComplete.value = true
      scheduleAdvance()
      return
    }
    typingTimer = window.setTimeout(tick, store.settings.textSpeed)
  }
  tick()
}

const reveal = () => {
  if (revealComplete.value) return
  if (typingTimer !== null) window.clearTimeout(typingTimer)
  typingTimer = null
  visibleText.value = renderedText.value
  revealComplete.value = true
  scheduleAdvance()
}

const scheduleAdvance = () => {
  if (advanceTimer !== null) window.clearTimeout(advanceTimer)
  advanceTimer = null
  if (props.paused || !revealComplete.value || hasChoices.value || hasTextEntry.value || !canAdvance.value) return

  const skipAllowed = skipMode.value && (store.wasSeenBeforeEntry || store.settings.skipUnread)
  const delay = skipAllowed ? 110 : autoMode.value ? store.settings.autoDelay : null
  if (delay === null) return
  advanceTimer = window.setTimeout(() => { store.advance() }, delay)
}

const unlockAudio = () => audioDirector.unlock(store.settings)

const advanceOrReveal = () => {
  if (props.paused) return
  unlockAudio()
  if (!revealComplete.value) { reveal(); return }
  if (hasChoices.value || hasTextEntry.value) return
  audioDirector.playSound('tap', store.settings)
  store.advance()
}

const selectChoice = (id: string) => {
  if (props.paused) return
  unlockAudio()
  audioDirector.playSound('choice', store.settings)
  const support = store.choose(id)
  if (!support) return
  const statLabels: Partial<Record<NumericStat, string>> = { reputation: '声望', cohesion: '凝聚' }
  const applied = (Object.entries(support.appliedBonuses) as Array<[NumericStat, number]>)
    .map(([key, value]) => `${statLabels[key] ?? key} ${value > 0 ? '+' : ''}${value}`)
    .join('、')
  emit('toast', support.consumed
    ? `${support.name}协助了这次回应：${applied}`
    : `${support.name}未消耗：相关属性已达上限`)
}

const activateHeartbeatSupport = () => {
  if (props.paused || (!heartbeatSupport.value?.active && (heartbeatSupport.value?.charges ?? 0) <= 0)) return
  unlockAudio()
  const result = store.toggleSupport('heartbeat')
  if (result) {
    audioDirector.playSound('notice', store.settings)
    emit('toast', result === 'activated' ? '心跳支援已就绪，将作用于下一次选择' : '已取消心跳支援，本幕次数未消耗')
  }
}

const submitTextEntry = (value: string) => {
  if (props.paused) return
  unlockAudio()
  audioDirector.playSound('choice', store.settings)
  store.submitTextEntry(value)
}

const toggleAuto = () => {
  autoMode.value = !autoMode.value
  if (autoMode.value) skipMode.value = false
  scheduleAdvance()
}

const toggleSkip = () => {
  skipMode.value = !skipMode.value
  if (skipMode.value) autoMode.value = false
  scheduleAdvance()
}

const quickSave = () => {
  if (store.inReplay) {
    emit('toast', store.inGoldenSliceReplay
      ? '黄金样板不会写入存档；退出试玩后再保存'
      : store.inChapterReplay
        ? '章节回放不会写入存档；退出回放后再保存'
        : store.inSupplementReplay
          ? '事件一补遗不会写入存档；退出补遗后再保存'
          : '关系回忆不会写入存档；退出回忆后再保存')
    return
  }
  store.save('quick')
  audioDirector.playSound('save', store.settings)
  emit('toast', '已写入快速记录')
}

// 事件一片尾继续主线：可见按钮触发，底层沿用跨 schema 传承逻辑并报告失败原因。
const continueSeason2 = (destination?: Season2ActiveRoute) => {
  try {
    const result = store.transitionToSeason2(destination)
    emit('toast', result.overwrite
      ? `已进入事件二（覆盖槽 ${result.slot}）`
      : `已进入事件二（槽 ${result.slot}）`)
  } catch (error) {
    emit('toast', error instanceof Error ? error.message : '衔接失败：当前状态不构成合法的事件一结局')
  }
}

// 事件一组织结局与共享隐藏结局按数据定义继续推进，最终统一抵达跨季片尾。
const advanceEnding = () => {
  if (!store.advance()) emit('toast', '片尾暂时无法继续')
}

// 回放期内主动退出：导航由 App 的 inReplay 监听统一处理，这里只负责清场与提示。
const exitReplay = () => {
  const wasChapter = store.inChapterReplay
  const wasRomance = store.inRomanceReplay
  const wasSupplement = store.inSupplementReplay
  const wasGoldenSlice = store.inGoldenSliceReplay
  if (!store.exitReplay()) return
  emit('toast', wasGoldenSlice
    ? '已退出黄金样板，回到内测入口'
    : wasSupplement
    ? '已退出事件一补遗，回到补遗列表'
    : wasChapter
      ? '已退出章节回放，回到章节选择'
      : wasRomance
        ? '已退出关系回忆，当前存档保持不变'
        : '已退出回放')
}

const keyHandler = (event: KeyboardEvent) => {
  if (props.paused) return
  // 浏览器与系统快捷键拥有更高优先级，避免 Cmd/Ctrl+S/F/A 同时改变游戏状态。
  if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return
  const target = event.target
  // 原生/ARIA 交互控件自行处理 Enter 与 Space，不能被全局“推进对白”快捷键截获。
  if (target instanceof Element
    && target.closest('button, a, input, textarea, select, [role="button"], [contenteditable="true"]')) return
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); advanceOrReveal() }
  else if (event.key.toLowerCase() === 'a') toggleAuto()
  else if (event.key.toLowerCase() === 'f') toggleSkip()
  else if (event.key.toLowerCase() === 's') quickSave()
  else if (event.key === 'Escape') emit('open', 'menu')
}

watch(() => store.sceneRevision, async () => {
  await nextTick()
  typeCurrentText()
  audioDirector.setMusic(store.node?.music, store.settings)
  audioDirector.playSound(store.node?.sound, store.settings)
  // Warm the current composition and every immediately reachable scene after state effects settle.
  if (store.node && store.state) preloadCurrentAndNextScenes(store.node, store.state)
}, { immediate: true })

watch(() => store.settings, (settings) => {
  audioDirector.syncVolumes(settings)
  scheduleAdvance()
}, { deep: true })

watch([autoMode, skipMode], scheduleAdvance)
watch(() => props.paused, scheduleAdvance)

onMounted(() => window.addEventListener('keydown', keyHandler))
onBeforeUnmount(() => { clearTimers(); window.removeEventListener('keydown', keyHandler) })

// GameShell coordinates visual direction and reading cadence; all route mutations remain inside the store/engine.
</script>

<template>
  <main
    v-if="node && state && direction"
    id="main-content"
    class="game-shell"
    :class="[
      `mode-${node.mode}`,
      `skin-${direction.ui}`,
      { 'reduced-motion': store.settings.reducedMotion, 'ui-hidden': !showControls },
    ]"
    @pointerdown.once="unlockAudio"
  >
    <SceneBackdrop
      :scene-key="node.id"
      :src="background.src"
      :gradient="background.gradient"
      :alt="background.alt"
      :focal-point="background.focalPoint"
      :cg="direction.cg"
      :cg-portrait="direction.cgPortrait"
      :cg-alt="direction.cgAlt"
      :placeholder-for="visualPlaceholderFor"
      :prompt-ref="visualPromptRef"
      :camera="direction.camera"
      :transition="direction.transition"
      :focus="direction.focus"
    />
    <SceneAtmosphere :kind="direction.atmosphere" />

    <header
      v-if="!isEndingStage"
      class="top-bar"
      :class="{ hidden: !showControls }"
      :aria-hidden="!showControls"
      :inert="!showControls || undefined"
    >
      <div class="chapter-mark">
        <span>{{ node.actLabel }}</span>
        <strong>{{ state.date.slice(5) }}</strong>
        <small v-if="store.inSeason3">事件三 · 独立进度</small>
        <small v-else-if="store.inSeason2">事件二 · 独立进度</small>
        <small v-else-if="store.inReplay">{{ store.inGoldenSliceReplay ? '黄金样板试玩 · 不写存档' : store.inChapterReplay ? '标准章节回放 · 不写存档' : store.inSupplementReplay ? '事件一补遗 · 不写存档' : '关系回忆 · 不写存档' }}</small>
      </div>
      <nav aria-label="游戏控制">
        <button
          v-if="store.inSeason2 || store.inSeason3"
          class="replay-exit"
          type="button"
          aria-label="保存并返回标题"
          title="保存并返回标题"
          @click="emit('title')"
        >
          <RotateCcw :size="18" />
          <span>保存并返回标题</span>
        </button>
        <button
          v-else-if="store.inReplay"
          class="replay-exit"
          type="button"
          aria-label="退出回放"
          title="退出回放"
          @click="exitReplay"
        >
          <RotateCcw :size="18" />
          <span>退出回放</span>
        </button>
        <button
          v-if="showHeartbeatSupport"
          class="support-action"
          :class="{ active: heartbeatSupport?.active }"
          type="button"
          :disabled="!heartbeatSupport?.active && (heartbeatSupport?.charges ?? 0) <= 0"
          :aria-pressed="heartbeatSupport?.active"
          :aria-label="heartbeatSupportLabel"
          :title="heartbeatSupportLabel"
          @click.stop="activateHeartbeatSupport"
        >
          <HeartHandshake :size="18" />
          <span aria-live="polite">{{ heartbeatSupportLabel }}</span>
        </button>
        <button
          v-if="!store.inRomanceScene && !store.inChapterReplay && !store.inGoldenSliceReplay && !store.inSeason2 && !store.inSeason3"
          class="romance-action"
          type="button"
          aria-label="羁绊与约会"
          title="羁绊与约会"
          @click="emit('open', 'romance')"
        >
          <Heart :size="19" />
          <i v-if="store.hasRomanceInvitation" aria-hidden="true" />
        </button>
        <button v-if="!store.inRomanceScene" type="button" aria-label="状态" title="状态" @click="emit('open', 'status')"><BarChart3 :size="19" /></button>
        <button class="top-history" type="button" aria-label="历史" title="历史" @click="emit('open', 'history')"><History :size="19" /></button>
        <button class="top-save" type="button" :disabled="store.inReplay" aria-label="快速保存" title="快速保存 (S)" @click="quickSave"><Save :size="19" /></button>
        <button type="button" aria-label="菜单" title="菜单 (Esc)" @click="emit('open', 'menu')"><Menu :size="21" /></button>
      </nav>
    </header>

    <section v-if="showSceneTitle" class="scene-title" aria-live="polite">
      <span>{{ node.location }}</span>
      <h1>{{ renderText(node.title ?? '', state) }}</h1>
    </section>

    <ChatStage
      v-if="isChatStage"
      :node="node"
      :state="state"
      :history="state.history"
      :visible-text="visibleText"
      :reveal-complete="revealComplete"
      :can-advance="canAdvance"
      :choices="store.choices"
      :sprites="direction.sprites"
      :ui="direction.ui as 'private-chat' | 'group-chat' | 'world-chat'"
      @interact="advanceOrReveal"
      @choose="selectChoice"
    />
    <SystemStage
      v-else-if="isSystemStage"
      :node="node"
      :state="state"
      :visible-text="visibleText"
      :reveal-complete="revealComplete"
      :can-advance="canAdvance"
      :choices="store.choices"
      :scene-revision="store.sceneRevision"
      :ui="direction.ui as 'game-client' | 'organization' | 'reward'"
      @interact="advanceOrReveal"
      @choose="selectChoice"
      @submit-entry="submitTextEntry"
    />
    <BattleStage v-else-if="isBattleStage" :node="node" :state="state" />
    <EndingStage
      v-else-if="isEndingStage"
      :node="node"
      :state="state"
      :direction="direction"
      @title="emit('title')"
      @advance="advanceEnding"
      @continue-season2="continueSeason2"
    />
    <CharacterStage
      v-else-if="!direction.cg"
      :cues="direction.sprites"
      :active-speaker="node.speaker"
    />

    <section v-if="revealComplete && hasChoices && !isInlineStage && !isEndingStage" class="choice-panel" aria-label="选择">
      <p v-if="hasKeyBranchHint" class="choice-branch-hint" role="note">
        这里的选择会改变你的位置或后续分歧。
      </p>
      <button
        v-for="choice in store.choices"
        :key="choice.id"
        type="button"
        :class="`tone-${choice.tone ?? 'calm'}`"
        @click="selectChoice(choice.id)"
      >
        <span>{{ renderText(choice.label, state) }}</span>
      </button>
    </section>

    <section
      v-if="!direction.hideDialogue && !isInlineStage && !isEndingStage"
      class="dialogue-zone"
      :role="dialogueCanInteract ? 'button' : undefined"
      :tabindex="dialogueCanInteract ? 0 : undefined"
      :aria-label="`${speaker.name}的对话${dialogueCanInteract ? '，按回车继续' : ''}`"
      @click="advanceOrReveal"
      @keydown.enter.self.prevent="advanceOrReveal"
      @keydown.space.self.prevent="advanceOrReveal"
    >
      <div class="speaker-row">
        <div>
          <strong :style="{ '--speaker-color': speaker.color }">{{ speaker.name }}</strong>
          <span v-if="node.location">{{ node.location }}</span>
        </div>
      </div>
      <p aria-hidden="true">
        {{ visibleText }}<i v-if="!revealComplete" class="typing-cursor" />
      </p>
      <span v-if="revealComplete" class="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {{ speaker.name }}：{{ renderedText }}
      </span>
      <button v-if="store.isFinished" class="ending-action" type="button" @click.stop="emit('title')">返回标题</button>
      <ChevronDown v-else-if="revealComplete && canAdvance && !hasChoices" class="advance-mark" :size="24" aria-hidden="true" />
    </section>

    <footer
      v-if="!isEndingStage"
      class="quick-controls"
      :class="{ hidden: !showControls }"
      :aria-hidden="!showControls"
      :inert="!showControls || undefined"
      aria-label="快捷控制"
    >
      <button type="button" :disabled="store.inReplay" @click="quickSave"><Save :size="14" />Q.SAVE</button>
      <button type="button" @click="emit('open', 'saves')"><RotateCcw :size="14" />LOAD</button>
      <button type="button" :class="{ active: autoMode }" :aria-pressed="autoMode" @click="toggleAuto">
        <Pause v-if="autoMode" :size="14" /><Play v-else :size="14" />AUTO
      </button>
      <button type="button" :class="{ active: skipMode }" :aria-pressed="skipMode" @click="toggleSkip"><FastForward :size="14" />SKIP</button>
      <button type="button" @click="emit('open', 'history')"><BookOpen :size="14" />LOG</button>
      <button type="button" @click="emit('open', 'settings')"><Settings :size="14" />SYSTEM</button>
      <button type="button" @click="store.updateSettings({ muted: !store.settings.muted })">
        <VolumeX v-if="store.settings.muted" :size="14" /><Volume2 v-else :size="14" />SOUND
      </button>
      <button type="button" aria-label="隐藏界面" @click="showControls = false"><SkipForward :size="14" />UI</button>
    </footer>

    <button v-if="!showControls && !isEndingStage" class="restore-ui" type="button" @click="showControls = true">
      显示界面
    </button>
  </main>
</template>

<style scoped>
.game-shell {
  position: relative;
  min-height: 100dvh;
  overflow: hidden;
  background: #241724;
  isolation: isolate;
  user-select: none;
}
.top-bar {
  position: absolute;
  z-index: 30;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  min-height: 4.2rem;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: max(.75rem, env(safe-area-inset-top)) max(1rem, env(safe-area-inset-right)) .65rem max(1rem, env(safe-area-inset-left));
  background: linear-gradient(180deg, rgba(42, 21, 37, .72), transparent);
  transition: opacity .2s ease;
}
.top-bar.hidden, .quick-controls.hidden { opacity: 0; pointer-events: none; }
.chapter-mark { display: grid; min-width: 0; text-shadow: 0 2px 8px rgba(0,0,0,.65); }
.chapter-mark span { overflow: hidden; color: rgba(255,255,255,.84); font-size: .68rem; letter-spacing: .06em; text-overflow: ellipsis; white-space: nowrap; }
.chapter-mark strong { color: #ffd5a3; font-family: var(--font-mono); font-size: .72rem; }
.chapter-mark small {
  width: fit-content;
  margin-top: .2rem;
  padding: .18rem .42rem;
  border: 1px solid rgba(255,213,163,.38);
  border-radius: 999px;
  background: rgba(35,20,34,.7);
  color: #ffe7c8;
  font-size: .58rem;
  letter-spacing: .04em;
}
.top-bar nav { display: flex; align-items: center; gap: .5rem; }
.top-bar button {
  position: relative;
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid rgba(255,255,255,.3);
  border-radius: 50%;
  background: rgba(52, 30, 47, .48);
  color: white;
  backdrop-filter: blur(9px);
  place-items: center;
}
.romance-action i {
  position: absolute;
  top: .18rem;
  right: .12rem;
  width: .55rem;
  height: .55rem;
  border: 2px solid rgba(52,30,47,.92);
  border-radius: 50%;
  background: #ff9abb;
  box-shadow: 0 0 .65rem rgba(255,154,187,.75);
}
.top-bar .support-action {
  width: auto;
  min-width: 2.75rem;
  display: flex;
  min-height: 2.75rem;
  align-items: center;
  gap: .45rem;
  padding: .55rem .8rem;
  border: 1px solid rgba(255, 184, 211, .55);
  border-radius: 2rem;
  background: rgba(52, 27, 48, .84);
  color: #ffe5ef;
  box-shadow: 0 .55rem 1.4rem rgba(35, 12, 29, .32);
  font-size: .7rem;
  backdrop-filter: blur(10px);
  transition: transform .18s var(--ease-out), background .18s ease, opacity .18s ease;
}
.support-action:not(:disabled):hover { transform: translateY(-2px); background: rgba(125, 54, 91, .9); }
.support-action.active { border-color: #ffd08f; background: rgba(132, 64, 91, .94); color: #fff3d6; }
.support-action:disabled:not(.active) { opacity: .48; }
.replay-exit {
  display: flex;
  min-width: 2.75rem;
  align-items: center;
  gap: .4rem;
  padding: .5rem .8rem;
  border: 1px solid rgba(255, 184, 211, .55);
  border-radius: 2rem;
  background: rgba(52, 27, 48, .84);
  color: #ffe5ef;
  font-size: .7rem;
  backdrop-filter: blur(10px);
  transition: transform .18s var(--ease-out), background .18s ease;
}
.replay-exit:hover { transform: translateY(-2px); background: rgba(125, 54, 91, .9); }
.top-bar button:disabled, .quick-controls button:disabled { opacity: .4; cursor: not-allowed; }
.ui-hidden .scene-title,
.ui-hidden .choice-panel,
.ui-hidden .dialogue-zone,
.ui-hidden :deep(.chat-stage),
.ui-hidden :deep(.system-stage),
.ui-hidden :deep(.battle-stage) { opacity: 0; pointer-events: none; }
.scene-title {
  position: absolute;
  z-index: 8;
  top: clamp(5rem, 13vh, 8rem);
  left: clamp(1rem, 6vw, 6rem);
  max-width: min(74vw, 38rem);
  padding: .5rem 1rem .65rem;
  border-left: 3px solid #e68aa8;
  background: linear-gradient(90deg, rgba(55,29,47,.58), transparent);
  color: white;
  text-shadow: 0 3px 16px rgba(0,0,0,.72);
  animation: title-in .5s var(--ease-out);
}
.scene-title span { color: #ffd3ae; font-family: var(--font-mono); font-size: .68rem; letter-spacing: .12em; }
.scene-title h1 { margin: .12rem 0 0; font-family: var(--font-display); font-size: clamp(1.25rem, 4vw, 2.35rem); letter-spacing: .08em; }

.choice-panel {
  position: absolute;
  z-index: 22;
  right: max(1rem, env(safe-area-inset-right));
  bottom: clamp(13.2rem, 29vh, 17rem);
  display: grid;
  width: min(calc(100% - 2rem), 39rem);
  max-height: 48vh;
  gap: .5rem;
  overflow: auto;
  padding: .25rem;
  overscroll-behavior: contain;
}
.choice-branch-hint {
  margin: 0;
  color: rgba(255, 225, 166, .9);
  font-size: .72rem;
  letter-spacing: .04em;
  text-shadow: 0 1px 5px rgba(0,0,0,.45);
}
.choice-panel button {
  display: flex;
  min-height: 3.65rem;
  align-items: center;
  padding: .7rem 1rem;
  border: 1px solid rgba(112, 63, 87, .25);
  border-left: .28rem solid #c96d8e;
  border-radius: .5rem .9rem .9rem .5rem;
  background: linear-gradient(110deg, rgba(255,252,249,.97), rgba(249,230,237,.95));
  color: #422b37;
  text-align: left;
  box-shadow: 0 .7rem 1.8rem rgba(44, 20, 36, .28);
  transition: transform .16s ease, border-color .16s ease, filter .16s ease;
}
.choice-panel button:hover { transform: translateX(-5px); filter: brightness(1.03); }
.choice-panel .tone-danger { border-left-color: #cf565f; }
.choice-panel .tone-warm { border-left-color: #df769e; }
.choice-panel .tone-secret { border-left-color: #7867b5; }
.choice-panel button > span { font-size: .88rem; font-weight: 600; line-height: 1.5; }

.dialogue-zone {
  position: absolute;
  z-index: 20;
  right: max(1rem, env(safe-area-inset-right));
  bottom: max(3.25rem, calc(env(safe-area-inset-bottom) + 2.7rem));
  left: max(1rem, env(safe-area-inset-left));
  min-height: clamp(9.3rem, 22vh, 12rem);
  padding: 1rem clamp(1rem, 4vw, 2rem) 1.35rem;
  border: 1px solid rgba(111,61,84,.28);
  border-top: .2rem solid #d37798;
  border-radius: .45rem 1rem 1rem;
  background:
    linear-gradient(105deg, rgba(255,252,250,.96), rgba(249,230,237,.93)),
    repeating-linear-gradient(135deg, transparent 0 8px, rgba(163,83,115,.025) 8px 9px);
  color: #36232e;
  box-shadow: 0 1.1rem 3rem rgba(42,17,34,.4);
  backdrop-filter: blur(12px);
  cursor: pointer;
}
.speaker-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: .45rem; }
.speaker-row > div { display: flex; align-items: baseline; gap: .7rem; }
.speaker-row strong {
  --speaker-color: #b4577a;
  position: relative;
  color: color-mix(in srgb, var(--speaker-color) 72%, #452335);
  font-family: var(--font-display);
  font-size: 1.05rem;
  letter-spacing: .08em;
}
.speaker-row strong::after { position: absolute; right: -1.1rem; bottom: .08rem; width: .8rem; height: 1px; background: currentColor; content: ""; opacity: .5; }
.speaker-row > div span { color: #876b7b; font-size: .68rem; }
.dialogue-zone p { max-width: 76ch; margin: 0; white-space: pre-line; font-size: clamp(.96rem, 2vw, 1.08rem); line-height: 1.72; }
.typing-cursor { display: inline-block; width: .42em; height: 1.02em; margin-left: .16rem; background: #cf6d91; vertical-align: -.14em; animation: blink .7s step-end infinite; }
.advance-mark { position: absolute; right: 1rem; bottom: .7rem; color: #b85d7f; animation: bounce 1.2s ease-in-out infinite; }
.ending-action { position: absolute; right: 1rem; bottom: .8rem; min-height: 2.75rem; padding: .4rem 1rem; border: 1px solid #c97b72; border-radius: .7rem; background: #f4ded9; color: #874d4c; }

.quick-controls {
  position: absolute;
  z-index: 30;
  right: max(.7rem, env(safe-area-inset-right));
  bottom: max(.25rem, env(safe-area-inset-bottom));
  display: flex;
  gap: .08rem;
  overflow: hidden;
  border-radius: .35rem;
  background: rgba(47, 25, 41, .66);
  box-shadow: 0 .45rem 1.2rem rgba(26,10,21,.25);
  backdrop-filter: blur(8px);
  transition: opacity .2s ease;
}
.quick-controls button {
  display: flex;
  min-height: 2.45rem;
  align-items: center;
  gap: .25rem;
  padding: .35rem .5rem;
  border: 0;
  border-right: 1px solid rgba(255,255,255,.12);
  background: transparent;
  color: rgba(255,255,255,.82);
  font-family: var(--font-mono);
  font-size: .56rem;
}
.quick-controls button:last-child { border-right: 0; }
.quick-controls button.active { background: rgba(234, 133, 169, .25); color: #ffd5e3; }
.restore-ui {
  position: fixed;
  z-index: 50;
  right: max(.65rem, env(safe-area-inset-right));
  bottom: max(.65rem, env(safe-area-inset-bottom));
  min-width: 5.5rem;
  min-height: 2.75rem;
  border: 1px solid rgba(255,255,255,.34);
  border-radius: 2rem;
  background: rgba(46,24,39,.72);
  color: white;
  font-size: .7rem;
  backdrop-filter: blur(8px);
}

@keyframes title-in { from { opacity: 0; transform: translateX(-1rem); } }
@keyframes blink { 50% { opacity: 0; } }
@keyframes bounce { 50% { transform: translateY(4px); } }
.reduced-motion *, .reduced-motion *::before, .reduced-motion *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }

@media (max-width: 700px) {
  .top-bar { min-height: 3.65rem; padding-right: max(.65rem, env(safe-area-inset-right)); padding-left: max(.65rem, env(safe-area-inset-left)); }
  .top-bar nav { gap: .5rem; }
  .top-bar button { width: 2.75rem; height: 2.75rem; }
  .top-bar .top-history, .top-bar .top-save { display: none; }
  .top-bar .support-action { width: 2.75rem; min-width: 2.75rem; padding: .5rem; }
  .support-action span { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  /* Keep the scene heading below both the game toolbar and notched-device status area. */
  .scene-title { top: max(4.4rem, calc(env(safe-area-inset-top) + 3.8rem)); left: .7rem; max-width: 82vw; }
  .choice-panel { right: .65rem; bottom: min(34vh, 16.5rem); left: .65rem; width: auto; max-height: 42vh; }
  .choice-panel button { min-height: 3.25rem; padding: .5rem .6rem; }
  .dialogue-zone {
    right: .55rem;
    bottom: max(3rem, calc(env(safe-area-inset-bottom) + 2.55rem));
    left: .55rem;
    min-height: min(28vh, 11.2rem);
    padding: .78rem .85rem 1.15rem;
    border-radius: .35rem .8rem .8rem;
  }
  .dialogue-zone p { font-size: .93rem; line-height: 1.62; }
  .speaker-row { margin-bottom: .3rem; }
  .speaker-row > div span { display: none; }
  .quick-controls { right: max(.35rem, env(safe-area-inset-right)); bottom: max(.15rem, env(safe-area-inset-bottom)); left: max(.35rem, env(safe-area-inset-left)); justify-content: space-between; gap: .25rem; }
  .quick-controls button { min-width: 2.75rem; min-height: 2.75rem; justify-content: center; padding: .3rem .25rem; }
  .quick-controls button:nth-child(2),
  .quick-controls button:nth-child(5),
  .quick-controls button:nth-child(7) { display: none; }
}

@media (orientation: landscape) and (max-height: 540px) {
  .top-bar { min-height: 3rem; padding-top: max(.25rem, env(safe-area-inset-top)); }
  .scene-title { top: 3.3rem; }
  .dialogue-zone { right: max(1rem, env(safe-area-inset-right)); bottom: max(3.05rem, calc(env(safe-area-inset-bottom) + 2.9rem)); left: max(1rem, env(safe-area-inset-left)); min-height: 6.4rem; padding: .55rem 1rem .9rem; }
  .dialogue-zone p { font-size: .84rem; line-height: 1.48; }
  .choice-panel {
    top: max(3.25rem, calc(env(safe-area-inset-top) + 3.15rem));
    right: max(1rem, env(safe-area-inset-right));
    bottom: max(9.5rem, calc(env(safe-area-inset-bottom) + 9.25rem));
    left: auto;
    width: min(49vw, 34rem);
    max-height: none;
  }
  .choice-panel button { min-height: 2.75rem; }
  .quick-controls { bottom: max(.12rem, env(safe-area-inset-bottom)); }
  .quick-controls button { min-height: 2.75rem; }
}
</style>
