<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { BookOpen, Check, Lock, Play, RotateCcw } from '@lucide/vue'

import { organizations } from '@/content/organizations'
import {
  isSupplementUnlocked,
  supplementCheckpoints,
} from '@/content/supplementCheckpoints'
import { readSave } from '@/engine/storage'
import { useGameStore } from '@/stores/game'
import type { RouteId } from '@/engine/types'
import type { ReplayCheckpoint, ReplayContext } from '@/engine/replay'

const emit = defineEmits<{
  start: [checkpoint: ReplayCheckpoint, context: ReplayContext]
  back: []
}>()

const store = useGameStore()

const routeOrder: RouteId[] = ['org1', 'org2', 'org3', 'org4', 'org5', 'org6']

const unlockedEndings = computed(() => store.collection.unlockedEndings)
const completedNodeIds = computed(() => new Set(store.collection.seenNodes))

const isChapterUnlocked = (route: RouteId) => isSupplementUnlocked(route, unlockedEndings.value)
const isChapterCompleted = (checkpoint: ReplayCheckpoint & { doneNodeId: string }) =>
  completedNodeIds.value.has(checkpoint.doneNodeId)

const autoRecord = readSave('auto')
const playerName = ref((autoRecord?.playerName ?? '').trim() || '新手')
const org6Name = ref('')

const buildContext = (checkpoint: ReplayCheckpoint): ReplayContext => ({
  playerName: playerName.value.trim() || '新手',
  organizationName: checkpoint.route === 'org6' ? (org6Name.value.trim() || undefined) : undefined,
})

const start = (checkpoint: ReplayCheckpoint) => {
  if (!isChapterUnlocked(checkpoint.route as RouteId)) return
  emit('start', checkpoint, buildContext(checkpoint))
}

const keyHandler = (event: KeyboardEvent) => {
  if (event.key === 'Escape') emit('back')
}
onMounted(() => window.addEventListener('keydown', keyHandler))
onBeforeUnmount(() => window.removeEventListener('keydown', keyHandler))
</script>

<template>
  <div class="supplement-replay">
    <p class="replay-note" role="note">
      事件一补遗：补充叙事，只补全组织路线里“为什么发生、成员为什么这样选择”的因果缺口。纯沙盒体验，不会改变原路线结局、原存档结果，也不复原你过去的个人选择。
    </p>

    <label class="name-field">
      <span>玩家名</span>
      <input
        v-model="playerName"
        type="text"
        maxlength="12"
        placeholder="新手"
        aria-label="补遗使用的玩家名"
      >
    </label>

    <div
      v-for="route in routeOrder"
      :key="route"
      class="route-group"
    >
      <div class="route-head">
        <h3>{{ organizations[route].name }}</h3>
        <span
          v-if="!isChapterUnlocked(route)"
          class="lock-hint"
        ><Lock :size="13" />需通关该路线结局后解锁</span>
      </div>
      <div class="chapter-grid">
        <button
          v-for="checkpoint in supplementCheckpoints.filter((c) => c.route === route)"
          :key="checkpoint.id"
          type="button"
          class="chapter-chip"
          :class="{ done: isChapterCompleted(checkpoint) }"
          :disabled="!isChapterUnlocked(route)"
          :aria-disabled="!isChapterUnlocked(route)"
          @click="start(checkpoint)"
        >
          <Check v-if="isChapterCompleted(checkpoint)" :size="15" />
          <Play v-else-if="isChapterUnlocked(route)" :size="15" fill="currentColor" />
          <Lock v-else :size="15" />
          <span>{{ checkpoint.label }}</span>
        </button>
      </div>

      <label v-if="route === 'org6'" class="name-field org6-field">
        <span>本次沙盒组织名（可选）</span>
        <input
          v-model="org6Name"
          type="text"
          maxlength="12"
          placeholder="留空则使用「第六组织」"
          aria-label="六组沙盒组织名"
        >
      </label>
    </div>

    <button class="back-action" type="button" @click="emit('back')">
      <RotateCcw :size="16" />返回标题
    </button>

    <p class="replay-foot"><BookOpen :size="13" />共 5 篇事件一补遗 · 每篇补全一个因果缺口</p>
  </div>
</template>

<style scoped>
.supplement-replay { display: grid; gap: .85rem; padding: .25rem 0; }
.replay-note {
  margin: 0;
  padding: .7rem .85rem;
  border: 1px solid rgba(232, 188, 120, .28);
  border-radius: .6rem;
  background: rgba(232, 188, 120, .08);
  color: #f4e3c6;
  font-size: .76rem;
  line-height: 1.55;
}
.name-field { display: grid; gap: .35rem; }
.name-field span { color: rgba(255, 250, 246, .82); font-size: .72rem; letter-spacing: .04em; }
.name-field input {
  min-height: 2.75rem;
  padding: .5rem .75rem;
  border: 1px solid rgba(255, 255, 255, .22);
  border-radius: .5rem;
  background: rgba(255, 255, 255, .06);
  color: #fff;
  font-size: .9rem;
}
.name-field input:focus-visible { outline: 2px solid #e8bc78; outline-offset: 1px; }
.org6-field { margin-top: .15rem; }
.route-group { display: grid; gap: .4rem; padding-top: .35rem; border-top: 1px solid rgba(255, 255, 255, .1); }
.route-group:first-of-type { border-top: 0; }
.route-head { display: flex; align-items: center; justify-content: space-between; gap: .5rem; }
.route-head h3 { margin: 0; color: #fff; font-family: var(--font-display); font-size: 1rem; letter-spacing: .06em; }
.lock-hint { display: inline-flex; align-items: center; gap: .25rem; color: rgba(255, 225, 166, .8); font-size: .66rem; }
.chapter-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: .45rem; }
.chapter-chip {
  display: flex;
  min-height: 3rem;
  align-items: center;
  justify-content: center;
  gap: .4rem;
  padding: .5rem;
  border: 1px solid rgba(112, 63, 87, .35);
  border-radius: .55rem;
  background: linear-gradient(135deg, rgba(255, 252, 249, .96), rgba(249, 230, 237, .94));
  color: #422b37;
  font-size: .82rem;
  font-weight: 600;
  transition: transform .15s ease, filter .15s ease;
}
.chapter-chip:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.03); }
.chapter-chip.done { border-color: rgba(120, 200, 140, .6); background: linear-gradient(135deg, rgba(232, 248, 236, .96), rgba(214, 240, 222, .94)); }
.chapter-chip:disabled {
  cursor: not-allowed;
  border-color: rgba(255, 255, 255, .12);
  background: rgba(255, 255, 255, .05);
  color: rgba(255, 255, 255, .34);
}
.back-action {
  display: flex;
  min-height: 3rem;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  border: 1px solid rgba(255, 255, 255, .25);
  border-radius: .6rem;
  background: transparent;
  color: rgba(255, 255, 255, .82);
  font-size: .85rem;
}
.replay-foot { margin: 0; color: rgba(255, 250, 246, .5); font-size: .66rem; text-align: center; }

@media (max-width: 680px) {
  .chapter-grid { grid-template-columns: 1fr; }
  .chapter-chip { min-height: 2.85rem; }
}
</style>
