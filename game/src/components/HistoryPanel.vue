<script setup lang="ts">
import { computed, ref } from 'vue'

import { storyById } from '@/content/story'
import type { ChapterId, HistoryEntry } from '@/engine/types'

const props = defineProps<{ entries: HistoryEntry[] }>()

// HistoryPanel 按发生顺序展示已经渲染的文本，避免读档后模板变量变动改写旧记录。
const chapterLabel = (entry: HistoryEntry) => storyById[entry.nodeId]?.actLabel ?? '剧情记录'
const chapterNames: Record<ChapterId, string> = {
  prologue: '序章',
  act1: '第一幕',
  act2: '第二幕',
  act3: '第三幕',
  act4: '第四幕',
  epilogue: '尾声',
}
const selectedChapter = ref<'all' | ChapterId>('all')
const availableChapters = computed(() => {
  const chapters = new Set<ChapterId>()
  for (const entry of props.entries) {
    const chapter = storyById[entry.nodeId]?.chapter
    if (chapter) chapters.add(chapter)
  }
  return Object.keys(chapterNames).filter((chapter): chapter is ChapterId => chapters.has(chapter as ChapterId))
})
const visibleEntries = computed(() => selectedChapter.value === 'all'
  ? props.entries
  : props.entries.filter((entry) => storyById[entry.nodeId]?.chapter === selectedChapter.value))
</script>

<template>
  <nav v-if="availableChapters.length > 1" class="history-filters" aria-label="按剧情幕筛选历史">
    <button
      type="button"
      :class="{ active: selectedChapter === 'all' }"
      :aria-pressed="selectedChapter === 'all'"
      @click="selectedChapter = 'all'"
    >全部</button>
    <button
      v-for="chapter in availableChapters"
      :key="chapter"
      type="button"
      :class="{ active: selectedChapter === chapter }"
      :aria-pressed="selectedChapter === chapter"
      @click="selectedChapter = chapter"
    >{{ chapterNames[chapter] }}</button>
  </nav>
  <ol class="history-list">
    <li v-for="(entry, index) in [...visibleEntries].reverse()" :key="`${entry.nodeId}-${index}`">
      <div><time>{{ entry.date.slice(5) }}</time><span class="history-chapter">{{ chapterLabel(entry) }}</span><strong>{{ entry.speakerName }}</strong></div>
      <p>{{ entry.text }}</p>
      <blockquote v-if="entry.choiceLabel">选择：{{ entry.choiceLabel }}</blockquote>
    </li>
  </ol>
  <p v-if="!visibleEntries.length" class="empty">这个剧情幕还没有可回看的文本。</p>
</template>

<style scoped>
.history-filters { display: flex; flex-wrap: wrap; gap: .4rem; margin-bottom: .9rem; }
.history-filters button { min-height: 2.2rem; padding: .35rem .65rem; border: 1px solid var(--color-border); border-radius: 999px; background: transparent; color: var(--color-text-muted); font-size: .75rem; }
.history-filters button.active { border-color: var(--color-secondary); background: rgba(243,154,199,.12); color: var(--color-text); }
.history-list { display: grid; gap: 1rem; margin: 0; padding: 0; list-style: none; }
li { padding: .85rem 0; border-bottom: 1px solid var(--color-border); }
li > div { display: flex; align-items: baseline; gap: .75rem; }
time { color: var(--color-accent); font-family: var(--font-mono); font-size: .72rem; }
.history-chapter { color: var(--color-text-muted); font-size: .7rem; }
strong { color: var(--color-info); }
p { margin: .4rem 0 0; white-space: pre-line; }
blockquote { margin: .6rem 0 0; padding: .45rem .65rem; border-left: 2px solid var(--color-secondary); background: rgba(243,154,199,.06); color: var(--color-text-muted); font-size: .8rem; }
.empty { color: var(--color-text-muted); text-align: center; }
</style>
