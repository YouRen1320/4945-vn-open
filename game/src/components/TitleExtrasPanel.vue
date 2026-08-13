<script setup lang="ts">
import { Archive, BookOpen, FlaskConical, Images, Layers, Megaphone, Settings } from '@lucide/vue'

defineProps<{
  hasChapterReplay: boolean
  hasSupplement: boolean
  hasGoldenSlicePreview: boolean
  releaseNotesUnread: boolean
}>()

const emit = defineEmits<{
  chapterReplay: []
  supplement: []
  goldenSlice: []
  outcomeArchive: []
  collection: []
  settings: []
  releaseNotes: []
}>()

// 标题页的非主线功能集中在此面板，解锁状态仍由 App 作为唯一数据源传入。
</script>

<template>
  <div class="extras-grid">
    <button v-if="hasChapterReplay" type="button" @click="emit('chapterReplay')">
      <Layers :size="20" /><span><strong>章节回放</strong><small>重温已完成的事件</small></span>
    </button>
    <button v-if="hasSupplement" type="button" @click="emit('supplement')">
      <BookOpen :size="20" /><span><strong>事件一补遗</strong><small>补全组织路线的因果片段</small></span>
    </button>
    <button v-if="hasGoldenSlicePreview" type="button" @click="emit('goldenSlice')">
      <FlaskConical :size="20" /><span><strong>剧情黄金样板</strong><small>事件一＋事件二 · 不写存档</small></span>
    </button>
    <button type="button" @click="emit('outcomeArchive')">
      <Archive :size="20" /><span><strong>多季结局档案</strong><small>查看事件二与事件三的封存结果</small></span>
    </button>
    <button type="button" @click="emit('collection')">
      <Images :size="20" /><span><strong>鉴赏</strong><small>剧情图像与结局收藏</small></span>
    </button>
    <button type="button" @click="emit('settings')">
      <Settings :size="20" /><span><strong>设置</strong><small>阅读、声音与离线选项</small></span>
    </button>
    <button type="button" @click="emit('releaseNotes')">
      <Megaphone :size="20" />
      <span><strong>本次更新 <em v-if="releaseNotesUnread">NEW</em></strong><small>查看版本变化</small></span>
    </button>
  </div>
</template>

<style scoped>
.extras-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .65rem; }
.extras-grid button {
  display: flex;
  min-height: 4.5rem;
  align-items: center;
  gap: .75rem;
  padding: .75rem .85rem;
  border: 1px solid var(--color-border);
  border-radius: .8rem;
  background: rgba(255,255,255,.035);
  color: var(--color-text);
  text-align: left;
  transition: border-color .16s ease, background .16s ease, transform .16s ease;
}
.extras-grid button:hover { border-color: rgba(240,169,191,.5); background: rgba(126,54,83,.18); transform: translateY(-1px); }
.extras-grid button > span { display: grid; min-width: 0; gap: .15rem; }
.extras-grid strong { font-size: .86rem; letter-spacing: .04em; }
.extras-grid small { color: var(--color-text-muted); font-size: .68rem; line-height: 1.4; }
.extras-grid em { margin-left: .35rem; color: #f4ce93; font-family: var(--font-mono); font-size: .58rem; font-style: normal; }
@media (max-width: 560px) { .extras-grid { grid-template-columns: 1fr; } }
</style>
