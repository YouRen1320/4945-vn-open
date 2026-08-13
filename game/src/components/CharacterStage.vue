<script setup lang="ts">
import { computed } from 'vue'

import { characters } from '@/content/characters'
import { getSpriteAsset } from '@/content/sprites'

import type { ActorId, SpriteCue } from '@/engine/types'

const props = defineProps<{
  cues: SpriteCue[]
  activeSpeaker: ActorId
}>()

const stagedCharacters = computed(() => props.cues.map((cue) => {
  const definition = characters[cue.character]
  return {
    ...cue,
    definition,
    asset: getSpriteAsset(cue.character, cue.expression, cue.pose),
    inactive: cue.dimmed || (
      !['narrator', 'system', 'player', 'crowd'].includes(props.activeSpeaker)
      && props.activeSpeaker !== cue.character
    ),
  }
}))

// CharacterStage maps semantic cues to consistent sprite assets and never mutates story state.
</script>

<template>
  <section v-if="stagedCharacters.length" class="character-stage" aria-label="场景人物">
    <TransitionGroup name="sprite">
      <figure
        v-for="character in stagedCharacters"
        :key="`${character.character}:${character.pose}:${character.expression}:${character.position}`"
        class="sprite"
        :class="[
          `position-${character.position ?? 'right'}`,
          { inactive: character.inactive, mirrored: character.mirror, fallback: !character.asset },
        ]"
        :style="{ '--sprite-scale': character.scale ?? 1, '--character-color': character.definition.color }"
      >
        <img
          v-if="character.asset"
          :src="character.asset"
          :alt="`${character.definition.name}${character.expression ?? 'neutral'}表情立绘`"
        />
        <div v-else class="fallback-card">
          <img v-if="character.definition.avatar" :src="character.definition.avatar" :alt="`${character.definition.name}头像`" />
          <div>
            <strong>{{ character.definition.name }}</strong>
            <span>{{ character.definition.role }}</span>
            <small>立绘制作中</small>
          </div>
        </div>
      </figure>
    </TransitionGroup>
  </section>
</template>

<style scoped>
.character-stage { position: absolute; z-index: 4; inset: 4rem 0 8.7rem; overflow: hidden; pointer-events: none; }
.sprite {
  --sprite-scale: 1;
  --character-color: #d67797;
  position: absolute;
  bottom: -4.5%;
  width: min(48vw, 34rem);
  height: 100%;
  margin: 0;
  transform-origin: bottom center;
  filter: drop-shadow(0 1.2rem 1.5rem rgba(43, 20, 38, .34));
  transition: filter .28s ease, opacity .28s ease, transform .38s var(--ease-out);
}
.sprite img { width: 100%; height: 100%; object-fit: contain; object-position: center bottom; }
.sprite.inactive { opacity: .62; filter: brightness(.68) saturate(.72) drop-shadow(0 1rem 1.5rem rgba(20, 10, 18, .35)); }
.sprite.mirrored img { transform: scaleX(-1); }
.position-far-left { left: -12%; transform: scale(calc(var(--sprite-scale) * .9)); }
.position-left { left: 2%; transform: scale(var(--sprite-scale)); }
.position-center { left: 50%; transform: translateX(-50%) scale(var(--sprite-scale)); }
.position-right { right: 2%; transform: scale(var(--sprite-scale)); }
.position-far-right { right: -12%; transform: scale(calc(var(--sprite-scale) * .9)); }

.fallback { width: min(34vw, 22rem); height: auto; bottom: 14%; }
.fallback-card {
  display: grid;
  overflow: hidden;
  border: 2px solid color-mix(in srgb, var(--character-color) 65%, white 12%);
  border-radius: 1rem;
  background: rgba(255, 247, 245, .93);
  color: #3c2734;
  box-shadow: 0 1.5rem 3rem rgba(32, 14, 27, .32);
}
.fallback-card > img { width: 100%; height: auto; aspect-ratio: 1; object-fit: cover; }
.fallback-card > div { display: grid; gap: .08rem; padding: .7rem .85rem; }
.fallback-card strong { font-family: var(--font-display); }
.fallback-card span, .fallback-card small { font-size: .7rem; color: #765d6e; }
.fallback-card small { justify-self: start; margin-top: .25rem; padding: .12rem .4rem; border-radius: 1rem; background: #f1d8e2; }

.sprite-enter-active, .sprite-leave-active { transition: opacity .28s ease, transform .36s var(--ease-out); }
.sprite-enter-from, .sprite-leave-to { opacity: 0; transform: translateY(2.5rem) scale(.97); }

@media (max-width: 600px) and (orientation: portrait) {
  .character-stage { inset: 3.8rem 0 12rem; }
  .sprite { bottom: -2%; width: min(88vw, 27rem); height: 100%; }
  .position-far-left, .position-left { left: -22%; }
  .position-far-right, .position-right { right: -22%; }
  .position-center { left: 50%; }
  .fallback { bottom: 17%; width: min(54vw, 17rem); }
}

@media (max-height: 500px) and (orientation: landscape) {
  .character-stage { inset: 2.8rem 0 6.2rem; }
  .sprite { width: min(42vw, 24rem); }
}
</style>
