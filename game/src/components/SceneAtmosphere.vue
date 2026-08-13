<script setup lang="ts">
import type { Atmosphere } from '@/engine/types'

defineProps<{ kind: Atmosphere }>()

// Atmosphere is intentionally code-native: lightweight particles communicate state without multiplying bitmap assets.
</script>

<template>
  <div v-if="kind !== 'none'" class="atmosphere" :class="`kind-${kind}`" aria-hidden="true">
    <i v-for="index in 12" :key="index" :style="{ '--i': index }" />
  </div>
</template>

<style scoped>
.atmosphere { position: absolute; z-index: 2; inset: 0; overflow: hidden; pointer-events: none; }
.atmosphere i { --i: 1; position: absolute; display: block; }
.kind-dust i,
.kind-petals i,
.kind-paper i {
  top: calc(-8% - var(--i) * 2%);
  left: calc(var(--i) * 8% - 5%);
  width: calc(3px + var(--i) * .35px);
  height: calc(3px + var(--i) * .25px);
  border-radius: 50%;
  background: rgba(255, 239, 207, .56);
  animation: fall calc(8s + var(--i) * .7s) linear infinite;
  animation-delay: calc(var(--i) * -.9s);
}
.kind-petals i {
  width: 9px;
  height: 5px;
  border-radius: 80% 20% 70% 30%;
  background: rgba(255, 173, 196, .72);
}
.kind-paper i {
  width: 12px;
  height: 6px;
  border-radius: 1px;
  background: rgba(245, 226, 185, .5);
}
.kind-rain i {
  top: calc(var(--i) * 8% - 10%);
  left: calc(var(--i) * 9% - 8%);
  width: 1px;
  height: 17vh;
  background: linear-gradient(transparent, rgba(196, 218, 255, .5));
  transform: rotate(13deg);
  animation: rain calc(.8s + var(--i) * .03s) linear infinite;
}
.kind-embers i,
.kind-danmaku i,
.kind-messages i {
  top: calc(8% + var(--i) * 6%);
  left: calc(-12% - var(--i) * 2%);
  width: calc(3px + var(--i) * .18px);
  height: calc(3px + var(--i) * .18px);
  border-radius: 50%;
  background: hsl(calc(18 + var(--i) * 7) 82% 68% / .68);
  box-shadow: 0 0 12px currentColor;
  animation: streak calc(7s + var(--i) * .35s) linear infinite;
  animation-delay: calc(var(--i) * -.55s);
}
.kind-danmaku i {
  background: hsl(calc(205 + var(--i) * 11) 84% 70% / .72);
  animation-duration: calc(4s + var(--i) * .22s);
}
.kind-messages i {
  width: calc(1.8rem + var(--i) * .12rem);
  height: .72rem;
  border: 1px solid rgba(255,255,255,.35);
  border-radius: .45rem .45rem .45rem .1rem;
  background: rgba(255,255,255,.08);
  box-shadow: none;
}
@keyframes fall { to { transform: translate(11vw, 118vh) rotate(540deg); } }
@keyframes rain { to { transform: translate(-8vw, 100vh) rotate(13deg); } }
@keyframes streak { to { transform: translateX(130vw) translateY(-8vh); } }
</style>
