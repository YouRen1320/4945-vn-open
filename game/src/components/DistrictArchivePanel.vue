<script setup lang="ts">
import { computed } from 'vue'

import {
  districtEvidenceRecords,
  districtRoster,
  districtTimeline,
} from '@/content/districtArchive'

import type { DistrictEvidenceKind, DistrictRosterGroup } from '@/content/districtArchive'

const props = defineProps<{ section: 'history' | 'roster' }>()

const evidenceKindLabel: Record<DistrictEvidenceKind, string> = {
  confirmed: '记录确认', adapted: '整理转述', claim: '当事人说法',
}

const rosterGroups: readonly { id: DistrictRosterGroup; title: string; subtitle: string }[] = [
  { id: 'org1', title: '一组成员', subtitle: '素材目录时点' },
  { id: 'org2', title: '二组成员', subtitle: '素材目录时点' },
  { id: 'org3', title: '三组成员', subtitle: '素材目录时点' },
  { id: 'bridge', title: '桥接篇人物', subtitle: '已进入正式剧情' },
  { id: 'guest', title: '跨区来客', subtitle: '只记录已确认身份' },
]

const rosterByGroup = computed(() => rosterGroups.map((group) => ({
  ...group,
  entries: districtRoster.filter((entry) => entry.group === group.id),
})))

// This archive deliberately renders summaries instead of source screenshots so account names and phone UI never ship.
</script>

<template>
  <div v-if="props.section === 'history'" class="district-archive">
    <header class="archive-intro">
      <span>4945 ARCHIVE</span>
      <h3>区史档案</h3>
      <p>时间线与二十份聊天记录均已逐项整理。原截图不随游戏发布；这里展示可追溯的脱敏摘要，并区分事实、转述和争议说法。</p>
    </header>

    <section aria-labelledby="district-timeline-title">
      <div class="section-heading">
        <h4 id="district-timeline-title">八月时间线</h4>
        <span>{{ districtTimeline.length }} 个事件</span>
      </div>
      <ol class="timeline-list">
        <li v-for="entry in districtTimeline" :key="entry.id">
          <time :datetime="entry.date">{{ entry.date.slice(5).replace('-', '.') }}</time>
          <div><strong>{{ entry.title }}</strong><p>{{ entry.summary }}</p></div>
        </li>
      </ol>
    </section>

    <section aria-labelledby="district-evidence-title">
      <div class="section-heading">
        <h4 id="district-evidence-title">证据摘要</h4>
        <span>{{ districtEvidenceRecords.length }} / 20</span>
      </div>
      <div class="evidence-grid">
        <article v-for="record in districtEvidenceRecords" :key="record.id">
          <div class="evidence-meta">
            <span>{{ record.id.toUpperCase() }}</span>
            <em :class="`kind-${record.kind}`">{{ evidenceKindLabel[record.kind] }}</em>
          </div>
          <h5>{{ record.title }}</h5>
          <p>{{ record.summary }}</p>
          <footer>
            <span>{{ record.event }}</span>
            <code :title="record.sourceFile">SHA-256 {{ record.sourceHash.slice(0, 10) }}</code>
          </footer>
        </article>
      </div>
    </section>
  </div>

  <div v-else class="district-roster">
    <header class="archive-intro">
      <span>ROSTER SNAPSHOT</span>
      <h3>成员名册</h3>
      <p>三十二张人物素材全部进入名册。卡片只记录文件能够确认的身份，不因此新增关系、战绩或对白。</p>
    </header>

    <section v-for="group in rosterByGroup" :key="group.id" :aria-labelledby="`roster-${group.id}`">
      <div class="section-heading">
        <div><h4 :id="`roster-${group.id}`">{{ group.title }}</h4><small>{{ group.subtitle }}</small></div>
        <span>{{ group.entries.length }} 人</span>
      </div>
      <div class="roster-grid">
        <article v-for="entry in group.entries" :key="entry.id">
          <img :src="entry.asset" :alt="`${entry.name}的区史头像`" width="512" height="512" loading="lazy" decoding="async" />
          <div>
            <strong>{{ entry.name }}</strong>
            <span>{{ entry.role }}</span>
            <p>{{ entry.note }}</p>
            <em v-if="entry.privacy === 'fictionalized-replacement'">隐私保护 · 虚构替代头像</em>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.district-archive,
.district-roster { display: grid; gap: 1.5rem; }
.archive-intro { padding: 1.25rem; border: 1px solid rgba(243,154,199,.28); border-radius: 1rem; background: radial-gradient(circle at 100% 0, rgba(126,54,83,.24), transparent 50%), rgba(255,255,255,.025); }
.archive-intro > span { color: var(--color-accent); font-family: var(--font-mono); font-size: .62rem; letter-spacing: .16em; }
.archive-intro h3 { margin: .3rem 0 .45rem; font-family: var(--font-display); font-size: 1.35rem; }
.archive-intro p { max-width: 44rem; margin: 0; color: var(--color-text-muted); font-size: .78rem; line-height: 1.75; }
.section-heading { display: flex; align-items: end; justify-content: space-between; gap: 1rem; margin-bottom: .75rem; }
.section-heading h4 { margin: 0; font-family: var(--font-display); font-size: 1rem; }
.section-heading small { display: block; margin-top: .15rem; color: var(--color-text-muted); font-size: .66rem; }
.section-heading > span { color: var(--color-accent); font-family: var(--font-mono); font-size: .7rem; }
.timeline-list { display: grid; margin: 0; padding: 0; list-style: none; }
.timeline-list li { display: grid; gap: .85rem; padding: .85rem 0; border-bottom: 1px solid var(--color-border); grid-template-columns: 3.1rem 1fr; }
.timeline-list time { color: var(--color-accent); font-family: var(--font-mono); font-size: .72rem; }
.timeline-list strong { font-size: .86rem; }
.timeline-list p { margin: .3rem 0 0; color: var(--color-text-muted); font-size: .74rem; line-height: 1.65; }
.evidence-grid { display: grid; gap: .65rem; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.evidence-grid article { display: grid; min-height: 10.5rem; gap: .45rem; padding: .85rem; border: 1px solid var(--color-border); border-radius: .8rem; background: rgba(255,255,255,.025); grid-template-rows: auto auto 1fr auto; }
.evidence-meta { display: flex; align-items: center; justify-content: space-between; gap: .5rem; }
.evidence-meta > span { color: var(--color-text-muted); font-family: var(--font-mono); font-size: .58rem; }
.evidence-meta em { padding: .15rem .35rem; border: 1px solid currentColor; border-radius: 1rem; font-size: .56rem; font-style: normal; }
.kind-confirmed { color: #a5d6bd; }
.kind-adapted { color: #e7c38c; }
.kind-claim { color: #e8a6bc; }
.evidence-grid h5 { margin: 0; font-size: .82rem; }
.evidence-grid p { margin: 0; color: var(--color-text-muted); font-size: .7rem; line-height: 1.65; }
.evidence-grid footer { display: flex; align-items: end; justify-content: space-between; gap: .5rem; color: var(--color-text-muted); font-size: .58rem; }
.evidence-grid code { overflow: hidden; font-family: var(--font-mono); text-overflow: ellipsis; white-space: nowrap; }
.district-roster section { min-width: 0; }
.roster-grid { display: grid; gap: .65rem; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.roster-grid article { display: grid; overflow: hidden; min-width: 0; border: 1px solid var(--color-border); border-radius: .85rem; background: rgba(255,255,255,.025); grid-template-columns: 5.5rem minmax(0, 1fr); }
.roster-grid img { width: 5.5rem; height: 100%; min-height: 7.7rem; object-fit: cover; background: rgba(255,255,255,.03); }
.roster-grid article > div { display: grid; align-content: center; gap: .24rem; min-width: 0; padding: .7rem; }
.roster-grid strong { overflow-wrap: anywhere; font-size: .82rem; }
.roster-grid span { color: var(--color-accent); font-size: .63rem; }
.roster-grid p { margin: .15rem 0 0; color: var(--color-text-muted); font-size: .64rem; line-height: 1.55; }
.roster-grid em { color: #e8b48e; font-size: .56rem; font-style: normal; }
@media (min-width: 760px) { .roster-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 560px) {
  .evidence-grid,
  .roster-grid { grid-template-columns: 1fr; }
  .archive-intro { padding: 1rem; }
  .evidence-grid article { min-height: 9.5rem; }
  .roster-grid article { grid-template-columns: 5rem minmax(0, 1fr); }
  .roster-grid img { width: 5rem; min-height: 7.2rem; }
}
</style>
