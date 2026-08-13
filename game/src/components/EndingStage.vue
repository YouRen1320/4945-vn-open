<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

import { ENDING_REGISTRY } from '@/content/endingRegistry'
import { organizations } from '@/content/organizations'
import {
  isSeason2ActiveRoute,
  SEASON2_ACTIVE_ROUTES,
  type Season2ActiveRoute,
} from '@/engine/season2-outcome'
import { renderText } from '@/engine/state'

import type { GameState, StoryNode } from '@/engine/types'
import type { ResolvedSceneDirection } from '@/engine/presentation'

const props = defineProps<{
  node: StoryNode
  state: GameState
  direction: ResolvedSceneDirection
}>()

const emit = defineEmits<{
  title: []
  advance: []
  continueSeason2: [destination?: Season2ActiveRoute]
}>()

// ── 分阶段展示动画 ──
const phase = ref<'cg' | 'title' | 'review' | 'credits' | 'done'>('cg')
const creditsScrolling = ref(false)
const autoAdvanced = ref(false)
const showRouteBridge = ref(false)
const selectedBridgeRoute = ref<Season2ActiveRoute | null>(null)
const routeBridgePanel = ref<HTMLElement | null>(null)
const phaseTimers: number[] = []

const endingId = computed(() => {
  // 连续片尾优先展示当前节点刚解锁的结局；共用字幕节点才回看最近的组织结局。
  const currentEnding = props.node.onEnter?.find((effect) => effect.type === 'unlockEnding')
  if (currentEnding?.type === 'unlockEnding') return currentEnding.id
  const orgEnding = props.state.unlockedEndings.findLast((id) => /^r[1-6]-/.test(id))
  return orgEnding ?? props.state.unlockedEndings.at(-1) ?? ''
})

const endingMeta = computed(() => {
  const entry = ENDING_REGISTRY.find((e) => e.id === endingId.value)
  if (entry) return entry
  return { id: endingId.value, title: props.node.title ?? '结局', subtitle: '', skin: props.direction.ui, tier: 0 as const }
})

// ── 评级计算 ──
const grade = computed(() => {
  const dims = ['bf_cruelty', 'bf_loyalty', 'bf_chaos', 'bf_diplomacy', 'bf_shadow', 'bf_heart'] as const
  const values = dims.map((d) => Math.abs((props.state.variables[d] as number) ?? 0))
  const avg = values.reduce((s, v) => s + v, 0) / values.length
  const variance = values.reduce((s, v) => s + (v - avg) ** 2, 0) / values.length
  const balanceScore = Math.max(0, 40 - variance * 5)
  const collectionScore = props.state.unlockedEndings.length * 2 + props.state.unlockedCgs.length * 0.5
  const total = balanceScore + Math.min(collectionScore, 40)

  if (total >= 80) return 'S'
  if (total >= 60) return 'A'
  if (total >= 40) return 'B'
  return 'C'
})

// ── 关键选择回顾（从 history 取最近 5 条有选择标记的条目） ──
const keyChoices = computed(() => {
  return props.state.history
    .filter((e) => e.choiceLabel)
    .slice(-5)
    .reverse()
    .map((e) => ({
      label: e.choiceLabel ?? '',
      date: e.date,
    }))
})

// ── 皮肤 class ──
const skinClass = computed(() => {
  const ui = props.direction.ui
  if (ui.startsWith('ending-')) return `ending-skin ${ui.replace('ending-', 'skin-')}`
  return 'ending-skin skin-default'
})

// ── 动画时序 ──
const clearPhaseTimers = () => {
  phaseTimers.splice(0).forEach((timer) => window.clearTimeout(timer))
}

const startPhaseSequence = () => {
  clearPhaseTimers()
  autoAdvanced.value = false
  showRouteBridge.value = false
  selectedBridgeRoute.value = null
  // CG 先展示 800ms → 标题卡淡入
  phase.value = 'cg'
  phaseTimers.push(window.setTimeout(() => { phase.value = 'title' }, 800))
  phaseTimers.push(window.setTimeout(() => { phase.value = 'review' }, 2400))
  phaseTimers.push(window.setTimeout(() => {
    if (keyChoices.value.length === 0) {
      phase.value = 'done'
      scheduleEndingAdvance()
    } else {
      phase.value = 'credits'
      creditsScrolling.value = true
      phaseTimers.push(window.setTimeout(() => {
        creditsScrolling.value = false
        phase.value = 'done'
        scheduleEndingAdvance()
      }, 6000))
    }
  }, keyChoices.value.length > 0 ? 4400 : 3200))
}

// 组织/隐藏结局是片尾的前置节拍；演出结束后自动进入统一片尾，只把跨季选择留给玩家。
const scheduleEndingAdvance = () => {
  if (!canAdvanceEventOneEnding.value) return
  phaseTimers.push(window.setTimeout(() => {
    autoAdvanced.value = true
    emit('advance')
  }, 650))
}

// 组织结局、共享隐藏结局和共用片尾复用同一组件；节点变化时必须重新开始各自的演出时序。
watch(() => props.node.id, startPhaseSequence, { immediate: true })

onBeforeUnmount(() => clearPhaseTimers())

// 事件一的组织/隐藏结局是连续片尾中的中间节拍；片尾总章再负责跨季传承。
const isEventOneCredits = computed(() => props.node.id === 'credits-first-season')
const needsRouteBridge = computed(() => (
  isEventOneCredits.value
  && props.state.schemaVersion === 4
  && props.state.route === 'org1'
))
const canContinueToSeason2 = computed(() => (
  isEventOneCredits.value
  && props.state.schemaVersion === 4
  && isSeason2ActiveRoute(props.state.route)
))

// 一组事件一结局先选择事件二活跃组织；确认前不改写任何存档或状态。
const openRouteBridge = async () => {
  showRouteBridge.value = true
  await nextTick()
  routeBridgePanel.value?.focus()
}

const confirmRouteBridge = () => {
  if (!selectedBridgeRoute.value) return
  emit('continueSeason2', selectedBridgeRoute.value)
}
const canAdvanceEventOneEnding = computed(() => (
  props.state.schemaVersion === 4
  && !isEventOneCredits.value
  && Boolean(props.node.next)
))
// 事件二季终卡仍有完成哨兵要进入；直接返回标题会跳过结局归档。
const canCompleteSeason2Ending = computed(() => (
  props.state.schemaVersion === 5
  && Boolean(props.node.next)
))

// EndingStage 完全接管结局画面的导演职责；对白框、选项面板一律不渲染。
</script>

<template>
  <div class="ending-stage" :class="skinClass" :aria-label="`结局：${endingMeta.title}`">
    <!-- 结局标题卡 -->
    <Transition name="ending-title">
      <div v-if="phase !== 'cg'" class="ending-title-card revealed">
        <div class="ending-grade" :data-grade="grade" aria-hidden="true">{{ grade }}</div>
        <h1 class="ending-name">{{ endingMeta.title }}</h1>
        <p v-if="endingMeta.subtitle" class="ending-subtitle">{{ endingMeta.subtitle }}</p>
        <div v-if="endingMeta.tier === 2" class="ending-secret-badge">隐藏结局</div>
      </div>
    </Transition>

    <!-- 关键选择回顾 -->
    <Transition name="ending-review">
      <div v-if="phase === 'review' && keyChoices.length > 0" class="ending-key-choices">
        <h3>一路走来</h3>
        <ul>
          <li v-for="(choice, idx) in keyChoices" :key="idx">
            <span class="choice-date">{{ choice.date }}</span>
            <span class="choice-label">{{ renderText(choice.label, state) }}</span>
          </li>
        </ul>
      </div>
    </Transition>

    <!-- 致谢滚动 -->
    <Transition name="ending-credits">
      <div v-if="phase === 'credits'" class="ending-credits-scroll" :class="{ scrolling: creditsScrolling }">
        <p class="credits-line">感谢游玩《4945区》</p>
        <p class="credits-line">你的每一个选择，塑造了这个故事</p>
        <p class="credits-line">开发者 · YouRen</p>
        <p class="credits-contact">QQ 1670615595</p>
      </div>
    </Transition>

    <!-- 事件一是连续主线的中继点，不再同时提供“下一季 / 返回标题”两套分流。 -->
    <Transition name="ending-btn">
      <div
        v-if="!autoAdvanced && (phase === 'done' || (phase !== 'cg' && keyChoices.length === 0 && phase !== 'review'))"
        class="ending-actions"
        :class="{
          'with-note': needsRouteBridge,
          'route-bridge-open': showRouteBridge,
        }"
      >
        <template v-if="needsRouteBridge">
          <template v-if="!showRouteBridge">
            <p class="ending-next-note">
              第一席的结局已经保存。进入事件二前，请选择二至六组作为新的活跃组织。
            </p>
            <button class="ending-season2-btn" type="button" @click="openRouteBridge">
              选择事件二去向
            </button>
            <button class="ending-return-btn" type="button" @click="emit('title')">
              稍后决定
            </button>
          </template>

          <section
            v-else
            ref="routeBridgePanel"
            class="route-bridge"
            aria-labelledby="route-bridge-title"
            tabindex="-1"
          >
            <header class="route-bridge-header">
              <span class="route-bridge-kicker">事件一 → 事件二</span>
              <h2 id="route-bridge-title">选择新的活跃组织</h2>
              <p>一组结局与第一席身份会完整保留，本次选择只决定事件二的主路线。</p>
            </header>

            <div class="route-bridge-grid" role="radiogroup" aria-label="事件二组织">
              <button
                v-for="route in SEASON2_ACTIVE_ROUTES"
                :key="route"
                class="route-bridge-option"
                :class="{ selected: selectedBridgeRoute === route }"
                type="button"
                role="radio"
                :aria-checked="selectedBridgeRoute === route"
                @click="selectedBridgeRoute = route"
              >
                <strong>{{ organizations[route].index }}组 · {{ organizations[route].name }}</strong>
                <small>{{ organizations[route].theme }}</small>
                <span v-if="selectedBridgeRoute === route" class="route-bridge-selected">已选择</span>
              </button>
            </div>

            <button
              class="ending-season2-btn route-bridge-confirm"
              type="button"
              :disabled="!selectedBridgeRoute"
              @click="confirmRouteBridge"
            >
              {{ selectedBridgeRoute ? `加入${organizations[selectedBridgeRoute].name}，进入事件二` : '请先选择一个组织' }}
            </button>
            <button class="route-bridge-back" type="button" @click="showRouteBridge = false">
              返回片尾
            </button>
          </section>
        </template>
        <button
          v-else-if="isEventOneCredits && canContinueToSeason2"
          class="ending-season2-btn"
          type="button"
          @click="emit('continueSeason2')"
        >
          继续主线 · 事件二
        </button>
        <button
          v-else-if="canAdvanceEventOneEnding || canCompleteSeason2Ending"
          class="ending-season2-btn"
          type="button"
          @click="emit('advance')"
        >
          {{ canCompleteSeason2Ending ? '封存结局并返回标题' : '进入事件一片尾' }}
        </button>
        <button
          v-else
          class="ending-return-btn"
          type="button"
          @click="emit('title')"
        >
          返回标题
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.ending-stage {
  position: absolute;
  z-index: 25;
  inset: 0;
  display: grid;
  width: 100%;
  height: 100%;
  overflow: hidden;
  contain: layout paint;
  overscroll-behavior: none;
  place-items: center;
}

/* ── 共同基底 ── */
.ending-title-card {
  position: absolute;
  z-index: 2;
  display: grid;
  gap: .45rem;
  text-align: center;
  place-items: center;
}
.ending-grade {
  width: 3.8rem;
  height: 3.8rem;
  display: grid;
  border: 2px solid #e8bc78;
  border-radius: 50%;
  color: #e8bc78;
  font-family: var(--font-display);
  font-size: 2.1rem;
  font-weight: 700;
  letter-spacing: .06em;
  place-items: center;
}
.ending-grade[data-grade='S'] { border-color: #f4ce93; color: #f4ce93; box-shadow: 0 0 2rem rgba(244,206,147,.35); }
.ending-grade[data-grade='A'] { border-color: #f3afc7; color: #f3afc7; box-shadow: 0 0 1.5rem rgba(243,175,199,.25); }
.ending-name {
  margin: 0;
  color: white;
  font-family: var(--font-display);
  font-size: clamp(2.2rem, 6vw, 4rem);
  letter-spacing: .1em;
  text-shadow: 0 .2rem 1.2rem rgba(0,0,0,.55);
}
.ending-subtitle {
  margin: 0;
  color: rgba(255,255,255,.78);
  font-size: clamp(.85rem, 1.8vw, 1.1rem);
  letter-spacing: .12em;
}
.ending-secret-badge {
  margin-top: .4rem;
  padding: .2rem .65rem;
  border: 1px solid rgba(139,92,246,.5);
  border-radius: 1rem;
  color: #c4b5fd;
  font-family: var(--font-mono);
  font-size: .65rem;
  letter-spacing: .1em;
}

/* ── 关键选择回顾 ── */
.ending-key-choices {
  position: absolute;
  z-index: 2;
  bottom: max(5rem, calc(env(safe-area-inset-bottom) + 4.5rem));
  right: 50%;
  min-width: 18rem;
  max-width: min(42rem, 88vw);
  transform: translateX(50%);
}
.ending-key-choices h3 {
  margin: 0 0 .6rem;
  color: rgba(255,255,255,.62);
  font-family: var(--font-display);
  font-size: .78rem;
  letter-spacing: .16em;
  text-transform: uppercase;
}
.ending-key-choices ul {
  display: grid;
  gap: .45rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.ending-key-choices li {
  display: flex;
  align-items: baseline;
  gap: .8rem;
  padding: .5rem .8rem;
  border-left: 2px solid rgba(255,255,255,.16);
  background: rgba(0,0,0,.28);
}
.choice-date {
  flex: 0 0 auto;
  color: rgba(255,255,255,.42);
  font-family: var(--font-mono);
  font-size: .62rem;
}
.choice-label {
  color: rgba(255,255,255,.78);
  font-size: .8rem;
  line-height: 1.5;
}

/* ── 致谢滚动 ── */
.ending-credits-scroll {
  position: absolute;
  z-index: 2;
  inset: 0;
  display: grid;
  align-content: center;
  gap: 1.4rem;
  padding: max(1rem, env(safe-area-inset-top)) max(1rem, env(safe-area-inset-right))
    max(1rem, env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left));
  text-align: center;
  place-items: center;
  pointer-events: none;
  animation: credits-rise 6s linear;
}
.ending-credits-scroll.scrolling { animation-play-state: running; }
.credits-line {
  margin: 0;
  color: rgba(255,255,255,.7);
  font-family: var(--font-display);
  font-size: clamp(.9rem, 2vw, 1.25rem);
  letter-spacing: .1em;
  text-shadow: 0 1px 8px rgba(0,0,0,.5);
}
.credits-contact { margin: -.85rem 0 0; color: rgba(255,255,255,.52); font-family: var(--font-mono); font-size: .72rem; letter-spacing: .08em; }

/* ── 主线继续 / 返回标题 ── */
.ending-actions {
  position: absolute;
  z-index: 3;
  bottom: max(2rem, calc(env(safe-area-inset-bottom) + 1.5rem));
  right: 50%;
  display: flex;
  width: min(100% - 2rem, 24rem);
  justify-content: center;
  gap: .75rem;
  transform: translateX(50%);
}
.ending-actions.with-note { flex-direction: column; align-items: stretch; }
.ending-actions.route-bridge-open {
  bottom: max(.75rem, env(safe-area-inset-bottom));
  width: min(100% - 1rem, 30rem);
}
.ending-next-note {
  margin: 0;
  color: rgba(255,255,255,.72);
  font-size: .78rem;
  line-height: 1.5;
  text-align: center;
}
.route-bridge {
  display: grid;
  max-height: min(58vh, 31rem);
  gap: .75rem;
  padding: 1rem;
  overflow-y: auto;
  border: 1px solid rgba(244,206,147,.32);
  border-radius: 1.25rem;
  outline: none;
  background: rgba(12,14,35,.94);
  box-shadow: 0 1rem 3rem rgba(0,0,0,.48);
  backdrop-filter: blur(18px);
  overscroll-behavior: contain;
}
.route-bridge:focus-visible { box-shadow: 0 0 0 3px rgba(244,206,147,.36), 0 1rem 3rem rgba(0,0,0,.48); }
.route-bridge-header { display: grid; gap: .3rem; text-align: center; }
.route-bridge-kicker {
  color: #e8bc78;
  font-family: var(--font-mono);
  font-size: .64rem;
  letter-spacing: .14em;
}
.route-bridge-header h2 {
  margin: 0;
  color: white;
  font-family: var(--font-display);
  font-size: 1.15rem;
  letter-spacing: .08em;
}
.route-bridge-header p {
  margin: 0;
  color: rgba(255,255,255,.74);
  font-size: .78rem;
  line-height: 1.55;
}
.route-bridge-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: .5rem;
}
.route-bridge-option {
  display: grid;
  min-height: 3.5rem;
  gap: .18rem;
  padding: .55rem .7rem;
  border: 1px solid rgba(255,255,255,.18);
  border-radius: .75rem;
  background: rgba(255,255,255,.06);
  color: white;
  text-align: left;
  touch-action: manipulation;
  cursor: pointer;
  transition: border-color .2s ease, background .2s ease, box-shadow .2s ease;
}
.route-bridge-option:last-child:nth-child(odd) { grid-column: 1 / -1; }
.route-bridge-option strong { font-size: .78rem; font-weight: 600; }
.route-bridge-option small { color: rgba(255,255,255,.62); font-size: .66rem; line-height: 1.35; }
.route-bridge-selected { color: #f4ce93; font-size: .64rem; font-weight: 600; }
.route-bridge-option:hover { background: rgba(255,255,255,.12); }
.route-bridge-option.selected {
  border-color: #f4ce93;
  background: rgba(244,206,147,.16);
  box-shadow: inset 0 0 0 1px rgba(244,206,147,.2);
}
.route-bridge-option:focus-visible,
.route-bridge-back:focus-visible,
.ending-return-btn:focus-visible,
.ending-season2-btn:focus-visible { outline: 3px solid rgba(244,206,147,.55); outline-offset: 2px; }
.route-bridge-confirm { width: 100%; }
.route-bridge-back {
  min-height: 2.75rem;
  border: 0;
  background: transparent;
  color: rgba(255,255,255,.7);
  font-size: .78rem;
  touch-action: manipulation;
  cursor: pointer;
}
.ending-return-btn {
  min-width: 10rem;
  min-height: 3rem;
  padding: .5rem 2rem;
  border: 1px solid rgba(255,255,255,.3);
  border-radius: 2rem;
  background: rgba(255,255,255,.08);
  color: white;
  font-size: .88rem;
  letter-spacing: .08em;
  backdrop-filter: blur(12px);
  transition: background .2s ease;
  cursor: pointer;
}
.ending-return-btn:hover { background: rgba(255,255,255,.18); }
.ending-season2-btn {
  min-width: 10rem;
  min-height: 3rem;
  padding: .5rem 2rem;
  border: 1px solid rgba(244,206,147,.5);
  border-radius: 2rem;
  background: rgba(244,206,147,.15);
  color: #f4ce93;
  font-size: .88rem;
  letter-spacing: .08em;
  backdrop-filter: blur(12px);
  transition: background .2s ease;
  cursor: pointer;
}
.ending-season2-btn:hover { background: rgba(244,206,147,.28); }
.ending-season2-btn:disabled {
  border-color: rgba(255,255,255,.16);
  background: rgba(255,255,255,.06);
  color: rgba(255,255,255,.42);
  cursor: not-allowed;
}

/* ── 六个皮肤变体 ── */

/* 凯旋：金色光晕 */
.ending-skin.skin-triumph .ending-grade[data-grade] { border-color: #f4ce93; color: #f4ce93; }
.ending-skin.skin-triumph .ending-name { text-shadow: 0 0 2rem rgba(244,206,147,.4); }
.ending-skin.skin-triumph .ending-return-btn { border-color: rgba(244,206,147,.4); background: rgba(244,206,147,.12); }

/* 遗响：蓝灰褪色 */
.ending-skin.skin-lament .ending-name { color: #a8bbc8; text-shadow: 0 .15rem 1rem rgba(0,0,0,.6); }
.ending-skin.skin-lament .ending-grade { border-color: #8899aa; color: #8899aa; }
.ending-skin.skin-lament .ending-return-btn { border-color: rgba(136,153,170,.35); }
.ending-skin.skin-lament .ending-key-choices li { border-left-color: rgba(136,153,170,.3); }

/* 暗面：深红阴影 */
.ending-skin.skin-dark .ending-name { color: #f0c8d4; text-shadow: 0 0 3rem rgba(180,50,70,.35); }
.ending-skin.skin-dark .ending-grade { border-color: #a8556a; color: #c46b80; }
.ending-skin.skin-dark .ending-return-btn { border-color: rgba(180,50,70,.35); background: rgba(63,20,32,.25); }

/* 混沌：故障绿 */
.ending-skin.skin-chaos .ending-name {
  color: #22c55e;
  text-shadow: 2px 0 #ff0000, -2px 0 #0000ff;
  animation: glitch-shift 2s infinite;
}
.ending-skin.skin-chaos .ending-grade { border-color: #22c55e; color: #22c55e; animation: glitch-shift 2s infinite .3s; }

/* 秘闻：紫色迷雾 */
.ending-skin.skin-secret .ending-name { color: #c4b5fd; text-shadow: 0 0 2.5rem rgba(139,92,246,.45); }
.ending-skin.skin-secret .ending-grade { border-color: #8b5cf6; color: #a78bfa; }
.ending-skin.skin-secret .ending-return-btn { border-color: rgba(139,92,246,.35); }

/* ── 过渡动画 ── */
.ending-title-enter-active, .ending-title-leave-active { transition: opacity .8s ease, transform .8s ease; }
.ending-title-enter-from, .ending-title-leave-to { opacity: 0; transform: translateY(1.5rem); }
.ending-review-enter-active, .ending-review-leave-active { transition: opacity .5s ease; }
.ending-review-enter-from, .ending-review-leave-to { opacity: 0; }
.ending-credits-enter-active { transition: opacity .6s ease; }
.ending-credits-leave-active { transition: opacity .45s ease; animation: none !important; }
.ending-credits-enter-from, .ending-credits-leave-to { opacity: 0; }
.ending-btn-enter-active { transition: opacity .4s ease .2s; }
.ending-btn-enter-from { opacity: 0; }

@keyframes credits-rise {
  from { opacity: 0; transform: translateY(40vh); }
  20% { opacity: 1; }
  80% { opacity: 1; }
  to { opacity: 0; transform: translateY(-40vh); }
}

@keyframes glitch-shift {
  0%, 100% { transform: translate(0); }
  25% { transform: translate(-2px, 1px); }
  50% { transform: translate(2px, 0); }
  75% { transform: translate(-1px, -1px); }
}

@media (prefers-reduced-motion: reduce) {
  .ending-credits-scroll { animation: none; }
  .ending-skin.skin-chaos .ending-name,
  .ending-skin.skin-chaos .ending-grade { animation: none; }
}

@media (max-width: 560px) {
  .ending-actions { bottom: max(1rem, calc(env(safe-area-inset-bottom) + .75rem)); }
  .ending-return-btn, .ending-season2-btn { width: 100%; min-height: 3.25rem; }
  .ending-key-choices { bottom: max(5rem, calc(env(safe-area-inset-bottom) + 4.5rem)); min-width: 0; width: min(100% - 2rem, 30rem); }
}
</style>
