<script setup lang="ts">
import { FlaskConical, Play, RotateCcw } from '@lucide/vue'
import { ref } from 'vue'

import { goldenSliceCheckpoint } from '@/content/goldenSliceCheckpoint'
import { goldenSliceS2Checkpoint } from '@/content/goldenSliceS2Checkpoint'
import type { ReplayCheckpoint, ReplayContext } from '@/engine/replay'

const emit = defineEmits<{
  start: [checkpoint: ReplayCheckpoint, context: ReplayContext]
  back: []
}>()

// 内测入口不读取自动档，避免玩家仅打开面板就触发任何旧存档迁移或写入。
const playerName = ref('新手')

const start = (checkpoint: ReplayCheckpoint) => emit('start', checkpoint, {
  playerName: playerName.value.trim() || '新手',
})
</script>

<template>
  <div class="golden-slice-panel">
    <p class="preview-note" role="note">
      七场新区开场黄金样板。使用真实剧情界面，但只在内存中运行；不会写入存档、收藏、结局或正式主线进度。
    </p>

    <label>
      <span>试玩玩家名</span>
      <input
        v-model="playerName"
        type="text"
        maxlength="12"
        placeholder="新手"
        aria-label="黄金样板玩家名"
      >
    </label>

    <button class="start-action" type="button" @click="start(goldenSliceCheckpoint)">
      <Play :size="18" fill="currentColor" />开始事件一七场试玩
    </button>

    <button class="start-action event-two" type="button" @click="start(goldenSliceS2Checkpoint)">
      <Play :size="18" fill="currentColor" />开始事件二 2.6—2.9 试玩
    </button>

    <p class="scope"><FlaskConical :size="14" />事件二为三组＋心跳成瘾代表性路线，不代表全路线矩阵</p>

    <button class="back-action" type="button" @click="emit('back')">
      <RotateCcw :size="16" />返回标题
    </button>
  </div>
</template>

<style scoped>
.golden-slice-panel { display: grid; gap: .85rem; padding: .25rem 0; }
.preview-note {
  margin: 0;
  padding: .8rem .9rem;
  border: 1px solid rgba(232, 188, 120, .3);
  border-radius: .7rem;
  background: rgba(232, 188, 120, .08);
  color: #f4e3c6;
  font-size: .78rem;
  line-height: 1.6;
}
label { display: grid; gap: .4rem; }
label span { color: rgba(255, 250, 246, .82); font-size: .72rem; letter-spacing: .04em; }
input {
  min-height: 2.75rem;
  padding: .55rem .75rem;
  border: 1px solid rgba(255, 255, 255, .22);
  border-radius: .55rem;
  background: rgba(255, 255, 255, .06);
  color: #fff;
  font-size: .9rem;
}
input:focus-visible { outline: 2px solid #e8bc78; outline-offset: 1px; }
button {
  display: inline-flex;
  min-height: 2.8rem;
  align-items: center;
  justify-content: center;
  gap: .45rem;
  border-radius: .6rem;
  color: #fff;
}
.start-action {
  border: 1px solid rgba(232, 188, 120, .55);
  background: linear-gradient(135deg, rgba(126, 54, 83, .95), rgba(83, 43, 69, .92));
  font-weight: 700;
}
.start-action.event-two { background: linear-gradient(135deg, rgba(54, 80, 126, .96), rgba(55, 47, 88, .94)); }
.back-action { border: 1px solid rgba(255, 255, 255, .16); background: rgba(255, 255, 255, .05); }
.scope { display: flex; align-items: center; gap: .35rem; margin: 0; color: var(--color-text-muted); font-size: .7rem; }
</style>
