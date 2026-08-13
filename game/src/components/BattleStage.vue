<script setup lang="ts">
import { Crosshair, Radio, Shield, Swords } from '@lucide/vue'
import { computed } from 'vue'

import { organizationDisplayName } from '@/content/season2/augustContinuity'
import type { GameState, StoryNode } from '@/engine/types'

const props = defineProps<{ node: StoryNode; state: GameState }>()
const ally = computed(() => Math.min(96, 48 + props.state.stats.cohesion * 5 + props.state.stats.skill * 2))
const target = computed(() => Math.max(18, 82 - props.state.stats.power * 2 - props.state.stats.contribution))
const allyName = computed(() => props.state.organization
  ? organizationDisplayName(props.state, props.state.organization)
  : '本组')

// BattleStage derives visual HUD pressure from current stats; it never resolves combat outcomes itself.
</script>

<template>
  <section class="battle-stage" aria-label="要塞战斗界面">
    <header>
      <div><Radio :size="17" /><span>战术频道</span></div>
      <strong>{{ node.location || '要塞战场' }}</strong>
      <div class="live"><i />LIVE</div>
    </header>
    <div class="battle-score">
      <article class="ally"><small>{{ allyName }}</small><div><i :style="{ width: `${ally}%` }" /></div><strong>{{ ally }}</strong></article>
      <Swords :size="28" />
      <article class="enemy"><small>目标要塞</small><div><i :style="{ width: `${target}%` }" /></div><strong>{{ target }}</strong></article>
    </div>
    <div class="reticle"><Crosshair :size="72" /><span>火之要塞 · 二号入口</span></div>
    <footer>
      <span><Shield :size="17" />凝聚 {{ state.stats.cohesion }}</span>
      <span>贡献 {{ state.stats.contribution }}</span>
      <span>资源 {{ state.stats.resources }}</span>
    </footer>
  </section>
</template>

<style scoped>
.battle-stage {
  position: absolute;
  z-index: 4;
  top: max(4.6rem, calc(env(safe-area-inset-top) + 3.8rem));
  right: max(1rem, env(safe-area-inset-right));
  bottom: max(9.4rem, calc(env(safe-area-inset-bottom) + 9rem));
  left: max(1rem, env(safe-area-inset-left));
  color: white;
  pointer-events: none;
  text-shadow: 0 2px 8px rgba(0,0,0,.72);
}
header { display: grid; align-items: center; gap: .7rem; grid-template-columns: 1fr auto 1fr; }
header > div { display: flex; align-items: center; gap: .4rem; font-size: .7rem; }
header > strong { font-family: var(--font-display); letter-spacing: .08em; }
.live { justify-self: end; }
.live i { width: .5rem; height: .5rem; border-radius: 50%; background: #ff626b; box-shadow: 0 0 .7rem #ff626b; animation: pulse .8s infinite alternate; }
.battle-score { display: grid; align-items: start; gap: 1rem; margin-top: 1rem; grid-template-columns: minmax(0,1fr) auto minmax(0,1fr); }
.battle-score article { display: grid; gap: .2rem; }
.battle-score .enemy { text-align: right; }
.battle-score small { font-size: .67rem; letter-spacing: .08em; }
.battle-score article > div { height: .45rem; overflow: hidden; border: 1px solid rgba(255,255,255,.4); border-radius: 1rem; background: rgba(5,8,22,.48); }
.battle-score i { display: block; height: 100%; background: linear-gradient(90deg, #72cfff, #9e8cff); }
.battle-score .enemy i { margin-left: auto; background: linear-gradient(90deg, #f2a14a, #ff6069); }
.battle-score strong { font-family: var(--font-mono); font-size: .72rem; }
.reticle { position: absolute; top: 48%; left: 50%; display: grid; gap: .4rem; color: rgba(255,255,255,.78); transform: translate(-50%,-50%); place-items: center; }
.reticle svg { filter: drop-shadow(0 0 .8rem rgba(109,199,255,.65)); animation: rotate 10s linear infinite; }
.reticle span { padding: .22rem .55rem; border-radius: 1rem; background: rgba(5,8,22,.45); font-size: .62rem; backdrop-filter: blur(5px); }
footer { position: absolute; right: 0; bottom: 0; left: 0; display: flex; align-items: center; justify-content: center; gap: .6rem; }
footer span { display: flex; min-height: 2.1rem; align-items: center; gap: .35rem; padding: .35rem .65rem; border: 1px solid rgba(255,255,255,.22); border-radius: 2rem; background: rgba(5,8,22,.5); font-size: .66rem; backdrop-filter: blur(8px); }
@keyframes pulse { to { opacity: .35; } }
@keyframes rotate { to { transform: rotate(360deg); } }

@media (max-width: 600px) and (orientation: portrait) {
  .battle-stage {
    top: max(4.4rem, calc(env(safe-area-inset-top) + 3.7rem));
    right: max(.7rem, env(safe-area-inset-right));
    bottom: max(12.6rem, calc(env(safe-area-inset-bottom) + 12rem));
    left: max(.7rem, env(safe-area-inset-left));
  }
  .battle-score { gap: .5rem; }
  .reticle { top: 45%; }
  footer { flex-wrap: wrap; gap: .35rem; }
  footer span { min-height: 1.8rem; padding: .25rem .5rem; }
}
</style>
