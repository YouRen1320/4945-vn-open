<script setup lang="ts">
import { Download, Save, Trash2, Upload } from '@lucide/vue'
import { computed, ref } from 'vue'

import { deleteSave, exportSave, listSaves, SAVE_SLOTS } from '@/engine/storage'
import type { SaveSlot } from '@/engine/storage'

const props = defineProps<{ inGame: boolean }>()
const emit = defineEmits<{
  save: [slot: SaveSlot]
  load: [slot: SaveSlot]
  imported: [slot: SaveSlot, raw: string]
  deleted: [slot: SaveSlot]
}>()

const revision = ref(0)
const importSlot = ref<SaveSlot>('1')
const fileInput = ref<HTMLInputElement | null>(null)
const records = computed(() => {
  revision.value
  return listSaves()
})

const slotLabel = (slot: string) => slot === 'auto' ? '自动记录' : slot === 'quick' ? '快速记录' : `记录 ${slot}`
const routeLabel = (route: string | null) => route ? `${route.slice(-1)}组路线` : '共同序章'
const formatTime = (value: number) => new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(value)

const requestSave = (slot: SaveSlot) => { emit('save', slot); window.setTimeout(() => { revision.value += 1 }, 0) }
const requestDelete = (slot: SaveSlot) => {
  if (!window.confirm(`删除“${slotLabel(slot)}”？此操作只影响本设备。`)) return
  deleteSave(slot)
  revision.value += 1
  emit('deleted', slot)
}
const download = (slot: SaveSlot) => {
  const blob = new Blob([exportSave(slot)], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `4945-vn-save-${slot}.json`
  link.click()
  URL.revokeObjectURL(link.href)
}
const pickImport = (slot: SaveSlot) => { importSlot.value = slot; fileInput.value?.click() }
const importFile = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  emit('imported', importSlot.value, await file.text())
  revision.value += 1
  ;(event.target as HTMLInputElement).value = ''
}

// SaveLoadPanel 仅管理槽位展示和文件选择，存取是否合法仍由 storage 层验证。
</script>

<template>
  <div class="save-list">
    <article v-for="(slot, index) in SAVE_SLOTS" :key="slot" :class="{ empty: !records[index] }">
      <div class="slot-title">
        <span>{{ slotLabel(slot) }}</span>
        <time v-if="records[index]">{{ formatTime(records[index]!.savedAt) }}</time>
      </div>
      <template v-if="records[index]">
        <h3>{{ records[index]!.playerName }} · {{ records[index]!.organizationName || '无组织' }}</h3>
        <p class="save-date">{{ records[index]!.date }}</p>
        <p>{{ routeLabel(records[index]!.route) }}｜{{ records[index]!.preview }}</p>
      </template>
      <p v-else class="empty-copy">空记录</p>
      <div class="slot-actions">
        <button v-if="inGame && slot !== 'auto'" type="button" @click="requestSave(slot)"><Save :size="17" />保存</button>
        <button :disabled="!records[index]" type="button" @click="emit('load', slot)">读取</button>
        <button v-if="records[index]" class="icon" type="button" aria-label="导出存档" @click="download(slot)"><Download :size="17" /></button>
        <button v-if="slot !== 'auto'" class="icon" type="button" aria-label="导入存档" @click="pickImport(slot)"><Upload :size="17" /></button>
        <button v-if="records[index]" class="icon danger" type="button" aria-label="删除存档" @click="requestDelete(slot)"><Trash2 :size="17" /></button>
      </div>
    </article>
    <input ref="fileInput" class="visually-hidden" type="file" accept="application/json,.json" tabindex="-1" @change="importFile" />
  </div>
</template>

<style scoped>
.save-list { display: grid; gap: .75rem; }
article { display: grid; gap: .4rem; padding: .9rem; border: 1px solid rgba(139,124,246,.3); border-radius: .9rem; background: linear-gradient(125deg, rgba(139,124,246,.1), rgba(255,255,255,.02)); }
article.empty { border-color: var(--color-border); background: rgba(255,255,255,.015); }
.slot-title { display: flex; justify-content: space-between; gap: 1rem; color: var(--color-accent); font-family: var(--font-mono); font-size: .72rem; letter-spacing: .08em; }
time { color: var(--color-text-muted); letter-spacing: 0; }
h3 { margin: 0; font-size: .98rem; }
p { margin: 0; color: var(--color-text-muted); font-size: .8rem; line-height: 1.5; }
.save-date { color: var(--color-accent); font-family: var(--font-mono); font-size: .68rem; }
.empty-copy { padding: .3rem 0; }
.slot-actions { display: flex; flex-wrap: wrap; gap: .45rem; margin-top: .35rem; }
button { display: inline-flex; min-width: 4.4rem; min-height: 2.75rem; align-items: center; justify-content: center; gap: .4rem; padding: .4rem .75rem; border: 1px solid var(--color-border); border-radius: .65rem; background: rgba(255,255,255,.05); color: var(--color-text); }
button:first-child:not(.icon) { border-color: rgba(232,188,120,.35); }
button.icon { min-width: 2.75rem; padding: .4rem; }
button.danger { color: var(--color-danger); }
button:disabled { cursor: not-allowed; opacity: .3; }
.visually-hidden { position: fixed; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
@media (min-width: 700px) { .save-list { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
