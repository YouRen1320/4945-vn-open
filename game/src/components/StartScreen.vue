<script setup lang="ts">
import { BookOpen, ChevronRight, Layers, Play, RotateCcw, UsersRound } from '@lucide/vue'

defineProps<{
  canContinue: boolean
}>()

const emit = defineEmits<{
  start: []
  continue: []
  progress: []
  community: []
  more: []
}>()

// 首页只承担主线分流；回放、鉴赏和设置统一收进“更多内容”，避免首访玩家被功能列表淹没。
</script>

<template>
  <main id="main-content" class="title-screen">
    <div class="title-art" role="img" aria-label="暮色中的夏娜站在城市露台，等待玩家进入4945区" />
    <div class="title-grade" aria-hidden="true" />
    <div class="petal petal-one" aria-hidden="true" />
    <div class="petal petal-two" aria-hidden="true" />

    <section class="title-content" aria-labelledby="game-title">
      <div class="title-lockup">
        <h1 id="game-title">4945区</h1>
        <div class="title-rule" aria-hidden="true"><i /></div>
        <p class="subtitle">影·银角 · 新区开服篇</p>
        <p class="creator">YouRen 独立制作</p>
      </div>

      <nav class="title-actions" aria-label="主线菜单">
        <button v-if="canContinue" class="primary" type="button" @click="emit('continue')">
          <RotateCcw :size="20" />
          <span><strong>继续主线</strong><small>CONTINUE STORY</small></span>
          <ChevronRight :size="18" aria-hidden="true" />
        </button>
        <button v-else class="primary" type="button" @click="emit('start')">
          <Play :size="20" fill="currentColor" />
          <span><strong>开始主线</strong><small>从事件一开始</small></span>
          <ChevronRight :size="18" aria-hidden="true" />
        </button>

        <button v-if="canContinue" type="button" @click="emit('start')">
          <Play :size="18" />
          <span><strong>重新开始</strong><small>从事件一建立新故事</small></span>
          <ChevronRight :size="17" aria-hidden="true" />
        </button>
        <button type="button" @click="emit('progress')">
          <BookOpen :size="18" />
          <span><strong>主线进度</strong><small>事件一 · 事件二 · 事件三</small></span>
          <ChevronRight :size="17" aria-hidden="true" />
        </button>
      </nav>

      <div class="title-utilities" aria-label="其他入口">
        <button type="button" aria-label="加入4945区区群，QQ群1075594288" @click="emit('community')">
          <UsersRound :size="16" />玩家社区
        </button>
        <i aria-hidden="true" />
        <button type="button" @click="emit('more')">
          <Layers :size="16" />更多内容
        </button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.title-screen {
  position: relative;
  min-height: 100dvh;
  overflow: hidden;
  background: #20151f;
  isolation: isolate;
}
.title-art {
  position: absolute;
  z-index: -4;
  inset: -2%;
  background: url('/assets/cg/title-shana-sunset-v1.webp') 58% center / cover no-repeat;
  animation: title-breathe 18s ease-in-out infinite alternate;
}
.title-grade {
  position: absolute;
  z-index: -3;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(30,18,29,.92) 0%, rgba(39,22,35,.72) 30%, rgba(39,22,35,.08) 62%),
    linear-gradient(0deg, rgba(26,16,25,.85), transparent 40%),
    linear-gradient(180deg, rgba(26,16,25,.22), transparent 25%);
}
.title-content {
  display: flex;
  width: min(100%, 96rem);
  min-height: 100dvh;
  flex-direction: column;
  justify-content: center;
  margin: auto;
  padding: max(2rem, env(safe-area-inset-top)) clamp(1.25rem, 6vw, 6.5rem)
    max(1rem, env(safe-area-inset-bottom));
}
.title-lockup { width: min(100%, 38rem); margin: 0 0 clamp(1.4rem, 5vh, 3rem); }
h1 {
  margin: 0;
  color: #fffaf4;
  font-family: var(--font-display);
  font-size: clamp(3rem, 7.5vw, 6.3rem);
  font-weight: 700;
  letter-spacing: .06em;
  line-height: 1;
  text-shadow: 0 .35rem 1.7rem rgba(24,12,23,.45);
}
.title-rule { display: flex; width: min(18rem, 65%); align-items: center; margin: 1rem 0 .8rem; }
.title-rule::before, .title-rule::after { height: 1px; background: rgba(255,232,218,.62); content: ""; flex: 1; }
.title-rule i { width: .45rem; height: .45rem; margin: 0 .55rem; border: 1px solid #efafc3; transform: rotate(45deg); }
.subtitle { margin: 0; color: rgba(255,246,241,.86); font-size: clamp(.86rem, 1.8vw, 1rem); letter-spacing: .16em; }
.creator { margin: .55rem 0 0; color: rgba(246,205,174,.66); font-size: .66rem; letter-spacing: .12em; }
.title-actions { display: grid; width: min(100%, 20.5rem); gap: .5rem; }
.title-actions button {
  display: grid;
  min-height: 3.65rem;
  align-items: center;
  gap: .8rem;
  padding: .55rem .85rem;
  border: 1px solid rgba(255,232,222,.14);
  border-left: 2px solid transparent;
  border-radius: .35rem;
  background: linear-gradient(90deg, rgba(46,26,40,.74), rgba(46,26,40,.2));
  color: rgba(255,250,246,.84);
  grid-template-columns: 1.35rem 1fr 1.1rem;
  text-align: left;
  backdrop-filter: blur(8px);
  transition: transform .18s ease, color .18s ease, border-color .18s ease, background .18s ease;
}
.title-actions button:hover, .title-actions button:focus-visible {
  border-left-color: #f0a9bf;
  background: linear-gradient(90deg, rgba(126,54,83,.78), rgba(69,34,54,.32));
  color: white;
  transform: translateX(.25rem);
}
.title-actions button.primary {
  min-height: 4.35rem;
  border-color: rgba(246,181,202,.48);
  border-left-color: #f4b5c8;
  background: linear-gradient(100deg, rgba(126,54,83,.9), rgba(68,34,55,.54));
  color: white;
  box-shadow: 0 .8rem 2.4rem rgba(18,8,16,.22);
}
.title-actions button > span { display: grid; line-height: 1.25; }
.title-actions strong { font-size: .9rem; letter-spacing: .09em; }
.title-actions small { color: rgba(255,230,219,.62); font-family: var(--font-mono); font-size: .56rem; letter-spacing: .1em; }
.title-utilities { display: flex; width: min(100%, 20.5rem); align-items: center; gap: .65rem; margin-top: .8rem; }
.title-utilities button {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  gap: .4rem;
  padding: .4rem .2rem;
  border: 0;
  background: transparent;
  color: rgba(255,243,236,.72);
  font-size: .72rem;
  letter-spacing: .06em;
}
.title-utilities button:hover, .title-utilities button:focus-visible { color: #fff; }
.title-utilities i { width: 1px; height: .9rem; background: rgba(255,255,255,.2); }
.petal {
  position: absolute;
  z-index: -1;
  width: .75rem;
  height: 1.15rem;
  border-radius: 70% 20% 70% 20%;
  background: rgba(244,161,185,.72);
  pointer-events: none;
  animation: petal-drift 8s ease-in-out infinite;
}
.petal-one { top: 18%; left: 42%; transform: rotate(20deg); }
.petal-two { top: 46%; left: 55%; animation-delay: -3s; transform: rotate(58deg) scale(.72); }
@keyframes title-breathe { to { transform: scale(1.025) translateX(-.25%); } }
@keyframes petal-drift { 50% { transform: translate(2rem, 2.5rem) rotate(150deg); opacity: .3; } }

@media (max-width: 680px) {
  .title-art { inset: 0; background-position: 67% center; }
  .title-grade {
    background:
      linear-gradient(0deg, rgba(28,17,26,.98) 0%, rgba(32,18,29,.8) 43%, rgba(32,18,29,.08) 72%),
      linear-gradient(180deg, rgba(25,14,24,.42), transparent 25%);
  }
  .title-content { justify-content: flex-end; padding: max(1rem, env(safe-area-inset-top)) .9rem max(.65rem, env(safe-area-inset-bottom)); }
  .title-lockup { margin: 0 0 1rem; }
  h1 { font-size: clamp(2.7rem, 14vw, 4rem); }
  .title-rule { margin: .7rem 0 .55rem; }
  .subtitle { font-size: .76rem; }
  .creator { margin-top: .4rem; }
  .title-actions, .title-utilities { width: 100%; }
  .title-actions button { min-height: 3.5rem; background: rgba(44,25,39,.76); }
  .title-actions button.primary { min-height: 4rem; }
  .title-actions button:hover { transform: none; }
  .title-utilities { justify-content: center; margin-top: .5rem; }
  .title-utilities button { min-height: 2.75rem; padding-inline: .45rem; }
}

@media (max-height: 650px) and (orientation: landscape) {
  .title-content { justify-content: center; padding-block: .75rem; }
  .title-lockup { margin-bottom: .75rem; }
  h1 { font-size: clamp(2.6rem, 9vh, 4rem); }
  .title-rule { margin-block: .5rem; }
  .creator { display: none; }
  .title-actions { gap: .3rem; }
  .title-actions button, .title-actions button.primary { min-height: 3rem; }
  .title-utilities { margin-top: .25rem; }
}
</style>
