<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { AlertTriangle, Check, Clock3, Play, RotateCcw, Sparkles } from '@lucide/vue'

import { characters, romanceCandidates } from '@/content/characters'
import { season2OrganizationNameForRoute } from '@/content/season2/augustContinuity'
import { useGameStore } from '@/stores/game'
import type { SaveSlot } from '@/engine/storage'
import type { Season2OutcomeRecord } from '@/engine/season2-outcome'
import type { S2EndingKind, S3ActiveRoute, S3Partner, S3RecapSelection } from '@/engine/season3-continuity'
import { isSeason3Complete, SEASON3_EPISODES } from '@/content/season3/registry'

const emit = defineEmits<{
  start: [params: { record: Season2OutcomeRecord; playerName: string; slot: SaveSlot; overwrite: boolean }]
  startRecap: [params: { selection: S3RecapSelection; playerName: string; slot: SaveSlot; overwrite: boolean }]
  continue: [slot: SaveSlot]
  back: []
}>()

const store = useGameStore()
const outcomes = computed(() => store.scanSeason2OutcomesForSeason3())
const saves = computed(() => store.season3Saves)
const selectedRecordId = ref<string | null>(null)
const playerName = ref('玩家')
const targetSlot = ref<SaveSlot>('1')
const overwriteConfirmed = ref(false)
const showRecap = ref(false)
const recapRoute = ref<S3ActiveRoute>('org2')
const recapEnding = ref<S2EndingKind>('triumph')
const recapPartner = ref<S3Partner>('none')
const recapOrganizationName = ref('第六组织')

const slots: SaveSlot[] = ['1', '2', '3', '4', '5', '6']
const routes: S3ActiveRoute[] = ['org2', 'org3', 'org4', 'org5', 'org6']
const occupiedSlots = computed(() => new Set(saves.value.map((save) => save.slot)))
const targetOccupied = computed(() => occupiedSlots.value.has(targetSlot.value))
const selectedRecord = computed(() => outcomes.value.find((record) => record.recordId === selectedRecordId.value) ?? null)
const canStart = computed(() => Boolean(selectedRecord.value) && (!targetOccupied.value || overwriteConfirmed.value))
const canRecap = computed(() => !targetOccupied.value || overwriteConfirmed.value)

const routeName = (route: S3ActiveRoute, fallback: string = route) => (
  route === 'org6' ? (fallback === 'org6' ? '自定义六组' : fallback) : season2OrganizationNameForRoute(route, fallback)
)
const relationName = (id: string) => id === 'none' ? '无伴侣' : (characters[id as keyof typeof characters]?.name ?? id)
const endingName = (id: string) => id.endsWith('-triumph') ? '强势收束' : '保护条款收束'
// 章节进度来自独立 campaign 的显式完成表，不用节点位置猜测完成度。
const progressLabel = (completion: Record<string, boolean>) => {
  const completed = SEASON3_EPISODES.filter((episode) => completion[episode.id]).length
  return isSeason3Complete(completion) ? '第三季已完成' : `已完成 ${completed}/${SEASON3_EPISODES.length} 章`
}

const selectSlot = (slot: SaveSlot) => {
  targetSlot.value = slot
  overwriteConfirmed.value = false
}

const start = () => {
  if (!selectedRecord.value || !canStart.value) return
  emit('start', {
    record: selectedRecord.value,
    playerName: playerName.value.trim() || '玩家',
    slot: targetSlot.value,
    overwrite: targetOccupied.value,
  })
}

const startRecap = () => {
  if (!canRecap.value) return
  emit('startRecap', {
    selection: {
      route: recapRoute.value,
      endingKind: recapEnding.value,
      partner: recapPartner.value,
      ...(recapRoute.value === 'org6' ? { organizationName: recapOrganizationName.value.trim() || '第六组织' } : {}),
    },
    playerName: playerName.value.trim() || '玩家',
    slot: targetSlot.value,
    overwrite: targetOccupied.value,
  })
}

const keyHandler = (event: KeyboardEvent) => { if (event.key === 'Escape') emit('back') }
onMounted(() => window.addEventListener('keydown', keyHandler))
onBeforeUnmount(() => window.removeEventListener('keydown', keyHandler))
</script>

<template>
  <div class="season3-flow">
    <p class="flow-note">
      事件三从一份完整的事件二结局快照开始。开始后即使来源档案被删除，当前剧情也不会改变。
    </p>

    <section v-if="saves.length" class="flow-section">
      <h3><Clock3 :size="16" />事件三进度</h3>
      <button
        v-for="save in saves"
        :key="save.slot"
        class="save-card"
        type="button"
        :disabled="isSeason3Complete(save.episodeCompletion)"
        @click="emit('continue', save.slot)"
      >
        <span>槽 {{ save.slot }} · {{ save.playerName }}</span>
        <small>{{ save.organizationName }} · {{ progressLabel(save.episodeCompletion) }} · {{ save.date }}</small>
        <Check v-if="isSeason3Complete(save.episodeCompletion)" :size="15" />
        <Play v-else :size="15" fill="currentColor" />
      </button>
    </section>

    <section class="flow-section">
      <h3><Sparkles :size="16" />开始事件三 · 选择之后</h3>
      <label class="field">
        <span>你的名字</span>
        <input v-model="playerName" maxlength="12" placeholder="玩家" />
      </label>

      <template v-if="outcomes.length && !showRecap">
        <p class="source-label">选择本次继承的事件二结局。多个结果不会自动替你决定：</p>
        <button
          v-for="record in outcomes"
          :key="record.recordId"
          type="button"
          class="source-card"
          :class="{ active: selectedRecordId === record.recordId }"
          @click="selectedRecordId = record.recordId"
        >
          <Check v-if="selectedRecordId === record.recordId" :size="15" />
          <span>
            <strong>{{ routeName(record.summary.route as S3ActiveRoute, record.summary.organizationName) }}</strong>
            <small>{{ endingName(record.summary.s2MainEnding) }} · {{ relationName(record.summary.s2RelationshipResolved) }}</small>
          </span>
        </button>
        <button class="text-action" type="button" @click="showRecap = true">没有要使用的档案，改用回顾建档</button>
      </template>

      <template v-else>
        <p class="spoiler"><AlertTriangle :size="15" />回顾建档会显示事件二路线、结局与伴侣状态，并明确标记为合成记录。</p>
        <label class="field"><span>事件二所属组织</span></label>
        <div class="option-grid">
          <button v-for="route in routes" :key="route" type="button" :class="{ active: recapRoute === route }" @click="recapRoute = route">
            {{ routeName(route) }}
          </button>
        </div>
        <label v-if="recapRoute === 'org6'" class="field">
          <span>六组名称</span>
          <input v-model="recapOrganizationName" maxlength="12" placeholder="第六组织" />
        </label>
        <label class="field"><span>事件二结局类型</span></label>
        <div class="option-grid two">
          <button type="button" :class="{ active: recapEnding === 'triumph' }" @click="recapEnding = 'triumph'">强势收束</button>
          <button type="button" :class="{ active: recapEnding === 'compromise' }" @click="recapEnding = 'compromise'">保护条款收束</button>
        </div>
        <label class="field"><span>伴侣状态</span></label>
        <div class="option-grid partner-grid">
          <button type="button" :class="{ active: recapPartner === 'none' }" @click="recapPartner = 'none'">无伴侣</button>
          <button v-for="partner in romanceCandidates" :key="partner" type="button" :class="{ active: recapPartner === partner }" @click="recapPartner = partner">
            {{ characters[partner].name }}
          </button>
        </div>
        <button v-if="outcomes.length" class="text-action" type="button" @click="showRecap = false">返回选择真实结局档案</button>
      </template>

      <div class="slot-picker">
        <span>事件三独立进度槽</span>
        <div class="slot-grid">
          <button v-for="slot in slots" :key="slot" type="button" :class="{ active: targetSlot === slot, taken: occupiedSlots.has(slot) }" @click="selectSlot(slot)">
            {{ slot }}<small v-if="occupiedSlots.has(slot)">已用</small>
          </button>
        </div>
        <label v-if="targetOccupied" class="overwrite-row">
          <input v-model="overwriteConfirmed" type="checkbox" />确认覆盖事件三槽 {{ targetSlot }}；事件一、事件二存档不会被修改
        </label>
      </div>

      <button v-if="outcomes.length && !showRecap" class="start-action" type="button" :disabled="!canStart" @click="start">
        <Play :size="16" fill="currentColor" />继承所选结局 · 开始事件三
      </button>
      <button v-else class="start-action" type="button" :disabled="!canRecap" @click="startRecap">
        <Play :size="16" fill="currentColor" />以回顾建档 · 开始事件三
      </button>
    </section>

    <button class="back-action" type="button" @click="emit('back')"><RotateCcw :size="16" />返回主线进度</button>
    <p class="flow-foot">当前开放：事件三完整季，共八章；从“北岸来客”连续推进至 2027 年 6 月 30 日季终。</p>
  </div>
</template>

<style scoped>
.season3-flow { display: grid; gap: .85rem; padding: .25rem 0; }
.flow-note, .spoiler { display: flex; align-items: center; gap: .45rem; margin: 0; padding: .7rem .8rem; border: 1px solid rgba(143,182,217,.3); border-radius: .65rem; background: rgba(89,121,158,.12); color: #e8f2ff; font-size: .75rem; line-height: 1.5; }
.spoiler { border-color: rgba(232,188,120,.32); background: rgba(232,188,120,.1); color: #f7e3bd; }
.flow-section { display: grid; gap: .55rem; padding-top: .45rem; border-top: 1px solid rgba(255,255,255,.1); }
h3 { display: flex; align-items: center; gap: .4rem; margin: 0; color: white; font-size: 1rem; }
.save-card, .source-card { display: flex; align-items: center; gap: .6rem; min-height: 3.15rem; padding: .6rem .75rem; border: 1px solid rgba(255,255,255,.16); border-radius: .6rem; background: rgba(255,255,255,.045); color: white; text-align: left; }
.save-card span, .source-card span { display: grid; gap: .12rem; flex: 1; }
.save-card small, .source-card small { color: rgba(255,255,255,.58); font-size: .68rem; }
.source-card.active { border-color: #8fb6d9; background: rgba(89,121,158,.26); }
.field { display: grid; gap: .35rem; color: rgba(255,255,255,.8); font-size: .72rem; }
.field input { min-height: 2.75rem; padding: 0 .75rem; border: 1px solid rgba(255,255,255,.18); border-radius: .55rem; background: rgba(255,255,255,.07); color: white; }
.source-label { margin: 0; color: rgba(255,255,255,.72); font-size: .72rem; }
.option-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: .35rem; }
.option-grid.two { grid-template-columns: repeat(2, 1fr); }
.partner-grid { max-height: 12rem; overflow: auto; }
.option-grid button, .slot-grid button { min-height: 2.55rem; border: 1px solid rgba(255,255,255,.15); border-radius: .5rem; background: rgba(255,255,255,.04); color: rgba(255,255,255,.78); font-size: .7rem; }
.option-grid button.active, .slot-grid button.active { border-color: #8fb6d9; background: rgba(89,121,158,.34); color: white; }
.slot-picker { display: grid; gap: .4rem; color: rgba(255,255,255,.8); font-size: .72rem; }
.slot-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: .3rem; }
.slot-grid button { display: grid; place-content: center; }
.slot-grid small { display: block; color: #efb2c4; font-size: .55rem; }
.overwrite-row { display: flex; align-items: center; gap: .4rem; color: #f4d7a1; font-size: .68rem; }
.start-action, .back-action, .text-action { min-height: 2.9rem; border-radius: .55rem; }
.start-action { display: flex; align-items: center; justify-content: center; gap: .45rem; border: 1px solid #8fb6d9; background: linear-gradient(135deg, #426889, #273f62); color: white; font-weight: 700; }
.start-action:disabled { opacity: .4; }
.back-action { display: flex; align-items: center; justify-content: center; gap: .4rem; border: 1px solid rgba(255,255,255,.15); background: transparent; color: rgba(255,255,255,.72); }
.text-action { border: 0; background: transparent; color: #a9cbe8; text-decoration: underline; }
.flow-foot { margin: 0; color: rgba(255,255,255,.48); font-size: .68rem; text-align: center; }
@media (max-width: 620px) { .option-grid { grid-template-columns: repeat(2, 1fr); } }
</style>
