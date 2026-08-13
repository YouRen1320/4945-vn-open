<script setup lang="ts">
import { Archive, BookOpen, Heart, Shield, Star, Target, Trash2, Users } from '@lucide/vue'
import { computed, ref } from 'vue'

import { characters } from '@/content/characters'
import { ENDING_REGISTRY } from '@/content/endingRegistry'
import { season2OrganizationNameForRoute } from '@/content/season2/augustContinuity'
import {
  type Season2OutcomeRecord,
} from '@/engine/season2-outcome'
import {
  deleteSeason2OutcomeRecord,
  readSeason2OutcomeArchive,
} from '@/engine/season2-storage'
import { deleteSeason3OutcomeRecord, readSeason3OutcomeArchive } from '@/engine/season3-outcome-storage'
import type { Season3OutcomeRecord } from '@/engine/season3-outcome'

const records = ref<Season2OutcomeRecord[]>([])
const season3Records = ref<Season3OutcomeRecord[]>([])
const loaded = ref(false)
const confirmDeleteId = ref<string | null>(null)

const load = () => {
  records.value = readSeason2OutcomeArchive()
  season3Records.value = readSeason3OutcomeArchive()
  loaded.value = true
}

const promptDelete = (recordId: string) => {
  confirmDeleteId.value = recordId
}

const confirmDelete = () => {
  if (!confirmDeleteId.value) return
  if (!deleteSeason2OutcomeRecord(confirmDeleteId.value)) deleteSeason3OutcomeRecord(confirmDeleteId.value)
  confirmDeleteId.value = null
  load()
}

const cancelDelete = () => {
  confirmDeleteId.value = null
}

// 加载时机：组件挂载 + watch records
load()

const sorted = computed(() =>
  [...records.value].sort((a, b) => a.summary.createdAt - b.summary.createdAt),
)
const sortedSeason3 = computed(() => [...season3Records.value].sort((a, b) => a.createdAt - b.createdAt))

const endingLabel = (endingId: string): string => {
  const ending = ENDING_REGISTRY.find((candidate) => candidate.id === endingId)
  return ending ? `${ending.subtitle.split(' · ')[0]} · ${ending.title}` : endingId
}

// 关系档案直接读取角色表，避免新增合法伴侣后只完成归档、却在界面显示成“—”。
const partnerLabel = (partnerId: string): string => {
  if (partnerId === 'none') return '独行'
  if (partnerId === 'bottle') return '瓶'
  if (partnerId === 'truth') return '真理'
  const character = characters[partnerId as keyof typeof characters]
  return character?.shortName ?? character?.name ?? '—'
}

// 关系对象和关系结局分别展示，分开或破裂也不会被误写成“独行”。
const relationshipResolutionLabel = (resolution: string): string => ({
  together: '并肩',
  'apart-understood': '分开但彼此理解',
  broken: '关系破裂',
  none: '无关系线',
}[resolution] ?? resolution)

const formatDate = (ts: number): string => {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<template>
  <article class="outcome-archive" aria-label="多季结局档案">
    <div v-if="!loaded" class="archive-loading">
      <BookOpen :size="18" />
      <span>读取中…</span>
    </div>

    <div v-else-if="records.length === 0 && season3Records.length === 0" class="archive-empty">
      <Archive :size="48" />
      <h2>暂无多季结局档案</h2>
      <p>通关事件二或事件三任一完整尾声后，结局将封存于此。<br>不占用普通存档槽，删除来源存档也不会清除档案。</p>
    </div>

    <ul v-if="sortedSeason3.length" class="outcome-list">
      <li v-for="r in sortedSeason3" :key="r.recordId" class="outcome-card outcome-card--season3">
        <header class="outcome-header">
          <span class="outcome-ending">事件三 · {{ endingLabel(r.summary.mainEnding) }}</span>
          <time>{{ formatDate(r.summary.completedAt) }}</time>
        </header>
        <div class="outcome-meta">
          <span class="meta-tag"><Target :size="14" />{{ r.summary.organizationName }}</span>
          <span class="meta-tag"><Heart :size="14" />{{ partnerLabel(r.summary.relationshipSubject) }} · {{ relationshipResolutionLabel(r.summary.relationshipResolution) }}</span>
        </div>
        <div class="outcome-stats">
          <span class="stat" title="凝聚力"><Users :size="14" /><strong>{{ r.summary.stats.cohesion }}</strong></span>
          <span class="stat" title="声望"><Star :size="14" /><strong>{{ r.summary.stats.reputation }}</strong></span>
          <span class="stat" title="资源"><Shield :size="14" /><strong>{{ r.summary.stats.resources }}</strong></span>
        </div>
        <footer class="outcome-footer">
          <span class="outcome-lineage">三季连续性已封存</span>
          <button v-if="confirmDeleteId !== r.recordId" class="delete-btn" aria-label="删除这条档案" title="删除" @click="promptDelete(r.recordId)"><Trash2 :size="15" /></button>
          <span v-else class="delete-confirm"><span class="confirm-label">确认删除？</span><button class="btn-danger" @click="confirmDelete">删除</button><button class="btn-cancel" @click="cancelDelete">取消</button></span>
        </footer>
      </li>
    </ul>

    <ul v-if="sorted.length" class="outcome-list">
      <li
        v-for="r in sorted"
        :key="r.recordId"
        class="outcome-card"
        :class="{ 'outcome-card--superseded': r.supersededBy !== undefined }"
      >
        <header class="outcome-header">
          <span class="outcome-ending">{{ endingLabel(r.summary.s2MainEnding) }}</span>
          <time>{{ formatDate(r.summary.createdAt) }}</time>
        </header>

        <div class="outcome-meta">
          <span class="meta-tag"><Target :size="14" /> {{ season2OrganizationNameForRoute(r.summary.route, r.summary.organizationName || '—') }}</span>
          <span class="meta-tag"><Heart :size="14" /> {{ partnerLabel(r.summary.s2RelationshipResolved) }}</span>
        </div>

        <div class="outcome-stats">
          <span class="stat" title="凝聚力">
            <Users :size="14" />
            <strong>{{ r.summary.stats.cohesion }}</strong>
          </span>
          <span class="stat" title="声望">
            <Star :size="14" />
            <strong>{{ r.summary.stats.reputation }}</strong>
          </span>
          <span class="stat" title="资源">
            <Shield :size="14" />
            <strong>{{ r.summary.stats.resources }}</strong>
          </span>
        </div>

        <footer class="outcome-footer">
          <span v-if="r.supersededBy" class="outcome-superseded" :title="r.supersededBy.reason">
            已被取代
          </span>
          <span v-else-if="r.lineageId" class="outcome-lineage" :title="'血缘 ID: ' + r.lineageId.slice(0, 16) + '…'">
            追溯自事件一
          </span>
          <span v-else class="outcome-timestamp">
            {{ formatDate(r.summary.createdAt) }}
          </span>
          <button
            v-if="confirmDeleteId !== r.recordId"
            class="delete-btn"
            aria-label="删除这条档案"
            title="删除"
            @click="promptDelete(r.recordId)"
          >
            <Trash2 :size="15" />
          </button>
          <span v-else class="delete-confirm">
            <span class="confirm-label">确认删除？</span>
            <button class="btn-danger" @click="confirmDelete">删除</button>
            <button class="btn-cancel" @click="cancelDelete">取消</button>
          </span>
        </footer>
      </li>
    </ul>
  </article>
</template>

<style scoped>
.outcome-archive {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.archive-loading,
.archive-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
  color: #6d5e72;
  gap: .75rem;
}

.archive-empty h2 {
  margin: 0;
  font-family: var(--font-display, serif);
  font-size: 1.25rem;
  color: #9b889e;
  letter-spacing: .04em;
}

.archive-empty p {
  font-size: .82rem;
  line-height: 1.65;
  max-width: 22rem;
  color: #7d6b80;
}

.outcome-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: .85rem;
}

.outcome-card {
  background: rgba(122, 73, 103, .07);
  border: 1px solid rgba(112, 63, 87, .15);
  border-radius: .7rem;
  padding: .85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: .55rem;
  transition: border-color .18s ease;
}

.outcome-card:hover {
  border-color: rgba(112, 63, 87, .3);
}

.outcome-card--superseded {
  opacity: .6;
  background: rgba(122, 73, 103, .04);
}

.outcome-card--superseded:hover {
  opacity: .75;
}

.outcome-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: .5rem;
}

.outcome-ending {
  font-family: var(--font-display, serif);
  font-size: 1.05rem;
  font-weight: 700;
  color: #422b37;
  letter-spacing: .03em;
}

.outcome-header time {
  font-family: var(--font-mono, monospace);
  font-size: .7rem;
  color: #9b889e;
  white-space: nowrap;
}

.outcome-meta {
  display: flex;
  gap: .75rem;
  flex-wrap: wrap;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  gap: .3rem;
  font-size: .78rem;
  color: #5a4760;
  background: rgba(112, 63, 87, .08);
  border-radius: .35rem;
  padding: .15rem .5rem;
}

.meta-tag svg {
  flex-shrink: 0;
  opacity: .7;
}

.outcome-stats {
  display: flex;
  gap: 1.15rem;
}

.stat {
  display: inline-flex;
  align-items: center;
  gap: .25rem;
  font-size: .75rem;
  color: #6d5e72;
}

.stat svg {
  opacity: .65;
}

.stat strong {
  font-family: var(--font-mono, monospace);
  font-size: .82rem;
  color: #422b37;
}

.outcome-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: .5rem;
  padding-top: .35rem;
  border-top: 1px solid rgba(112, 63, 87, .1);
}

.outcome-superseded {
  font-size: .72rem;
  color: #c6904e;
  background: rgba(198, 144, 78, .12);
  padding: .1rem .5rem;
  border-radius: .3rem;
}

.outcome-lineage {
  font-size: .72rem;
  color: #6b7db3;
  background: rgba(107, 125, 179, .1);
  padding: .1rem .5rem;
  border-radius: .3rem;
}

.outcome-timestamp {
  font-family: var(--font-mono, monospace);
  font-size: .68rem;
  color: #b5a5b9;
}

.delete-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid transparent;
  border-radius: .4rem;
  background: transparent;
  color: #9b889e;
  cursor: pointer;
  transition: color .15s ease, border-color .15s ease;
}

.delete-btn:hover {
  color: #cf565f;
  border-color: rgba(207, 86, 95, .25);
}

.delete-confirm {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  font-size: .75rem;
  color: #cf565f;
}

.confirm-label {
  font-weight: 600;
}

.btn-danger,
.btn-cancel {
  padding: .2rem .55rem;
  border-radius: .3rem;
  border: 1px solid;
  font-size: .72rem;
  cursor: pointer;
  transition: background .15s ease;
}

.btn-danger {
  background: rgba(207, 86, 95, .12);
  color: #cf565f;
  border-color: rgba(207, 86, 95, .35);
}

.btn-danger:hover {
  background: rgba(207, 86, 95, .22);
}

.btn-cancel {
  background: transparent;
  color: #7d6b80;
  border-color: rgba(125, 107, 128, .3);
}

.btn-cancel:hover {
  background: rgba(125, 107, 128, .1);
}
</style>
