<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { AlertTriangle, Check, Play, RotateCcw, SkipForward } from '@lucide/vue'

import { characters, romanceCandidates } from '@/content/characters'
import { organizations } from '@/content/organizations'
import { useGameStore } from '@/stores/game'
import type { SaveSlot } from '@/engine/storage'
import { buildSkipSummary, type Season1OutcomeSummary } from '@/engine/season2-outcome'
import { SEASON1_FLAVOROR_SEGMENTS, SKIP_ROUTES, segmentRouteName } from '@/content/season1Segments'
import type { CharacterId, RouteId } from '@/engine/types'

const emit = defineEmits<{
  start: [params: { summary: Season1OutcomeSummary; playerName: string; slot: SaveSlot; overwrite: boolean }]
  back: []
}>()

const store = useGameStore()

const saves = computed(() => store.season2Saves.filter((s): s is NonNullable<typeof s> => s !== null))
const NEW_SEASON2_SLOTS: SaveSlot[] = ['1', '2', '3', '4', '5', '6']
const occupiedSlots = computed(() => new Set(saves.value.map((s) => s.slot)))
const firstEmptySlot = computed(() => NEW_SEASON2_SLOTS.find((s) => !occupiedSlots.value.has(s)) ?? '1')

const autoRecord = (() => {
  try { return store.scanSeason1Sources().at(0) ?? null } catch { return null }
})()
const playerName = ref(autoRecord?.playerName.trim() || '玩家')
const selectedRoute = ref<RouteId>('org2')
const selectedPartner = ref<CharacterId | 'none'>('none')
const checkedSegments = ref<Set<string>>(new Set())
const targetSlot = ref<SaveSlot>(firstEmptySlot.value)
const overwriteConfirmed = ref(false)

const targetOccupied = computed(() => occupiedSlots.value.has(targetSlot.value))
const selectedSummary = computed<Season1OutcomeSummary | null>(() => {
  try {
    const flavorFacts = SEASON1_FLAVOROR_SEGMENTS
      .filter((seg) => checkedSegments.value.has(seg.id))
      .map((seg) => seg.fact)
    return buildSkipSummary(selectedRoute.value, selectedPartner.value, flavorFacts, organizations)
  } catch {
    return null
  }
})

const canStart = computed(() => selectedSummary.value !== null && (!targetOccupied.value || overwriteConfirmed.value))

const toggleSegment = (id: string) => {
  const next = new Set(checkedSegments.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  checkedSegments.value = next
}

const start = () => {
  const summary = selectedSummary.value
  if (!summary || !canStart.value) return
  emit('start', {
    summary,
    playerName: playerName.value.trim() || '玩家',
    slot: targetSlot.value,
    overwrite: targetOccupied.value,
  })
}

const keyHandler = (event: KeyboardEvent) => {
  if (event.key === 'Escape') emit('back')
}
onMounted(() => window.addEventListener('keydown', keyHandler))
onBeforeUnmount(() => window.removeEventListener('keydown', keyHandler))
</script>

<template>
  <div class="skip-flow">
    <p class="flow-note" role="note">
      片段跳过：没有完整的事件一存档，或只想快速进入事件二时，声明你的上一季路线、伴侣与已发生的关键事件，直接开启事件二共通序章。跳过档只生成 canon 允许的合法开局，不伪造未达成的结局。
    </p>

    <label class="field">
      <span class="field-label">你的名字</span>
      <input v-model="playerName" class="text-input" type="text" maxlength="12" placeholder="玩家" />
    </label>

    <label class="field">
      <span class="field-label">所属路线（决定事件二开局归属）</span>
      <div class="option-grid">
        <button
          v-for="r in SKIP_ROUTES"
          :key="r"
          type="button"
          class="option-btn"
          :class="{ active: selectedRoute === r }"
          @click="selectedRoute = r"
        >{{ segmentRouteName(r) }}</button>
      </div>
    </label>

    <label class="field">
      <span class="field-label">伴侣状态</span>
      <div class="option-grid">
        <button
          type="button"
          class="option-btn"
          :class="{ active: selectedPartner === 'none' }"
          @click="selectedPartner = 'none'"
        >无伴侣</button>
        <button
          v-for="p in romanceCandidates"
          :key="p"
          type="button"
          class="option-btn"
          :class="{ active: selectedPartner === p }"
          @click="selectedPartner = p"
        >{{ characters[p]?.name ?? p }}</button>
      </div>
    </label>

    <div class="field">
      <span class="field-label">已发生的关键事件（可选，提升事件二连续感）</span>
      <div class="segment-list">
        <button
          v-for="seg in SEASON1_FLAVOROR_SEGMENTS"
          :key="seg.id"
          type="button"
          class="segment-chip"
          :class="{ active: checkedSegments.has(seg.id) }"
          @click="toggleSegment(seg.id)"
        >
          <Check v-if="checkedSegments.has(seg.id)" :size="14" />
          <span v-else class="dot" />
          <span class="segment-main">
            <strong>{{ seg.label }}</strong>
            <small>{{ seg.detail }}</small>
          </span>
        </button>
      </div>
    </div>

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
        class="start-action"
        type="button"
        :disabled="!canStart"
        @click="start"
      >
        <Play :size="16" fill="currentColor" />片段跳过 · 开启事件二共通序章
      </button>
    </div>

    <button class="back-action" type="button" @click="emit('back')">
      <RotateCcw :size="16" />返回标题
    </button>

    <p class="flow-foot"><SkipForward :size="13" />跳过档不写入事件一存档；事件二进度写入独立 v5 槽</p>
  </div>
</template>

<style scoped>
.skip-flow { display: grid; gap: .85rem; padding: .25rem 0; }
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
.segment-list { display: grid; gap: .4rem; }
.segment-chip {
  display: flex;
  align-items: flex-start;
  gap: .55rem;
  padding: .55rem .7rem;
  border: 1px solid rgba(255, 255, 255, .18);
  border-radius: .55rem;
  background: rgba(255, 255, 255, .05);
  color: #fff;
  text-align: left;
  transition: border-color .15s ease, background .15s ease;
}
.segment-chip.active { border-color: #f0a9bf; background: rgba(126, 54, 83, .35); }
.segment-chip .dot { width: .65rem; height: .65rem; margin-top: .15rem; border-radius: 50%; border: 1px solid rgba(255, 255, 255, .5); flex: 0 0 auto; }
.segment-main { display: grid; gap: .1rem; line-height: 1.3; }
.segment-main strong { font-size: .8rem; }
.segment-main small { color: rgba(255, 250, 246, .6); font-size: .66rem; }
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

@media (max-width: 680px) {
  .slot-grid { grid-template-columns: repeat(6, 1fr); gap: .2rem; }
}
</style>
