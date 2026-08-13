<script setup lang="ts">
import { Download, RotateCcw, Volume2, VolumeX } from '@lucide/vue'
import { ref } from 'vue'

import { cacheSeasonAssets } from '@/engine/offline'
import { GAME_APP_VERSION } from '@/engine/state'
import type { GameSettings } from '@/engine/types'

const props = defineProps<{ settings: GameSettings }>()
const emit = defineEmits<{ update: [settings: Partial<GameSettings>]; reset: [] }>()

const cacheLabel = ref('下载事件一素材')
const caching = ref(false)

const updateNumber = (key: keyof GameSettings, event: Event) => {
  const value = Number((event.target as HTMLInputElement).value)
  emit('update', { [key]: value })
}

const downloadOffline = async () => {
  caching.value = true
  try {
    await cacheSeasonAssets(({ cached, total, complete }) => {
      cacheLabel.value = complete ? '离线素材已就绪' : `正在缓存 ${cached}/${total}`
    })
  } catch (error) {
    cacheLabel.value = error instanceof Error ? error.message : '缓存失败，请联网后重试'
  } finally {
    caching.value = false
  }
}

// SettingsPanel 的每次修改即时持久化；重置动作由 store 提供唯一默认值。
</script>

<template>
  <div class="settings-grid">
    <section>
      <h3>阅读</h3>
      <label>
        <span>文字速度 <output>{{ settings.textSpeed }}ms</output></span>
        <input type="range" min="8" max="70" step="2" :value="settings.textSpeed" @input="updateNumber('textSpeed', $event)" />
      </label>
      <label>
        <span>自动播放等待 <output>{{ (settings.autoDelay / 1000).toFixed(1) }}s</output></span>
        <input type="range" min="800" max="4000" step="100" :value="settings.autoDelay" @input="updateNumber('autoDelay', $event)" />
      </label>
      <label class="toggle-row">
        <span>允许快进未读文本</span>
        <input type="checkbox" :checked="settings.skipUnread" @change="emit('update', { skipUnread: ($event.target as HTMLInputElement).checked })" />
      </label>
      <label class="toggle-row">
        <span>减少动态效果</span>
        <input type="checkbox" :checked="settings.reducedMotion" @change="emit('update', { reducedMotion: ($event.target as HTMLInputElement).checked })" />
      </label>
    </section>

    <section>
      <h3>声音</h3>
      <label>
        <span>音乐 <output>{{ Math.round(settings.musicVolume * 100) }}%</output></span>
        <input type="range" min="0" max="1" step="0.05" :value="settings.musicVolume" @input="updateNumber('musicVolume', $event)" />
      </label>
      <label>
        <span>音效 <output>{{ Math.round(settings.soundVolume * 100) }}%</output></span>
        <input type="range" min="0" max="1" step="0.05" :value="settings.soundVolume" @input="updateNumber('soundVolume', $event)" />
      </label>
      <button class="setting-button" type="button" @click="emit('update', { muted: !settings.muted })">
        <VolumeX v-if="settings.muted" :size="19" />
        <Volume2 v-else :size="19" />
        {{ settings.muted ? '恢复声音' : '全部静音' }}
      </button>
    </section>

    <section>
      <h3>离线与恢复</h3>
      <p>安装到主屏幕后可像应用一样启动；下载素材能让完整章节在断网时继续读取。</p>
      <button class="setting-button" type="button" :disabled="caching" @click="downloadOffline">
        <Download :size="19" />{{ cacheLabel }}
      </button>
      <button class="setting-button muted" type="button" @click="emit('reset')"><RotateCcw :size="19" />恢复默认设置</button>
    </section>

    <section class="about">
      <h3>关于</h3>
      <strong>《4945区》· 影·银角 · 新区开服篇</strong>
      <p>由YouRen独立开发与维护</p>
      <p>开发者 QQ：1670615595</p>
      <p>免费同人创作 · v{{ GAME_APP_VERSION }}</p>
    </section>
  </div>
</template>

<style scoped>
.settings-grid { display: grid; gap: 1.25rem; }
section { display: grid; gap: .85rem; padding: 1rem; border: 1px solid var(--color-border); border-radius: 1rem; background: rgba(255,255,255,.025); }
h3 { margin: 0; color: var(--color-accent); font-size: .82rem; letter-spacing: .12em; text-transform: uppercase; }
label { display: grid; gap: .45rem; }
label > span { display: flex; justify-content: space-between; color: var(--color-text-muted); font-size: .88rem; }
output { color: var(--color-text); font-family: var(--font-mono); }
input[type='range'] { width: 100%; accent-color: var(--color-secondary); }
.toggle-row { display: flex; min-height: 2.8rem; align-items: center; justify-content: space-between; gap: 1rem; }
.toggle-row input { width: 1.35rem; height: 1.35rem; accent-color: var(--color-primary); }
p { margin: 0; color: var(--color-text-muted); font-size: .82rem; }
.about strong { color: var(--color-text); font-family: var(--font-display); font-size: .96rem; }
.setting-button { display: flex; min-height: 3rem; align-items: center; justify-content: center; gap: .65rem; border: 1px solid rgba(122,212,255,.28); border-radius: .75rem; background: rgba(122,212,255,.08); color: var(--color-text); }
.setting-button.muted { border-color: var(--color-border); background: transparent; color: var(--color-text-muted); }
.setting-button:disabled { cursor: wait; opacity: .55; }
</style>
