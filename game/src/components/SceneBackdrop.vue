<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import type { CameraMotion, SceneTransition } from '@/engine/types'

const props = defineProps<{
  sceneKey: string
  src?: string
  gradient: string
  alt: string
  focalPoint?: string
  cg?: string
  cgPortrait?: string
  cgAlt?: string
  placeholderFor?: string
  promptRef?: string
  camera: CameraMotion
  transition: SceneTransition
  focus: 'left' | 'center' | 'right'
}>()

const portraitQuery = '(max-width: 600px) and (orientation: portrait)'
const portraitViewport = ref(
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(portraitQuery).matches
    : false,
)
let viewportMedia: MediaQueryList | undefined

// The story supplies two compositions; viewport selection stays inside the renderer.
const requestedImage = computed(() => (
  portraitViewport.value && props.cgPortrait ? props.cgPortrait : props.cg ?? props.src
))
const isEventCg = computed(() => Boolean(props.cg || props.cgPortrait))
const displayedImage = ref<string>()
const displayedSceneKey = ref(props.sceneKey)
const displayedDescription = ref(props.cgAlt ?? props.alt)
// Keep placeholder metadata visible while the next frame is decoding; the label describes
// the requested production asset, not the currently displayed fallback frame.
const displayedPlaceholderFor = ref<string | undefined>(props.placeholderFor)
const displayedPromptRef = ref<string | undefined>(props.promptRef)
const imageLoading = ref(false)
const imageError = ref(false)
let loadSequence = 0
let pendingImage: HTMLImageElement | undefined

// Decode the requested frame before swapping it into the stage; slow networks keep the previous frame visible.
watch([requestedImage, () => props.sceneKey], ([url, sceneKey]) => {
  const sequence = ++loadSequence
  imageError.value = false
  if (pendingImage) {
    pendingImage.onload = null
    pendingImage.onerror = null
  }
  pendingImage = undefined

  if (!url) {
    displayedImage.value = undefined
    displayedSceneKey.value = sceneKey
    displayedDescription.value = props.cgAlt ?? props.alt
    displayedPlaceholderFor.value = props.placeholderFor
    displayedPromptRef.value = props.promptRef
    imageLoading.value = false
    return
  }

  if (displayedImage.value === url) {
    displayedSceneKey.value = sceneKey
    displayedDescription.value = props.cgAlt ?? props.alt
    displayedPlaceholderFor.value = props.placeholderFor
    displayedPromptRef.value = props.promptRef
    imageLoading.value = false
    return
  }

  imageLoading.value = displayedImage.value !== url
  const image = new Image()
  pendingImage = image
  let committed = false
  const commitFrame = () => {
    if (committed) return
    committed = true
    if (sequence !== loadSequence) return
    displayedImage.value = url
    displayedSceneKey.value = sceneKey
    displayedDescription.value = props.cgAlt ?? props.alt
    displayedPlaceholderFor.value = props.placeholderFor
    displayedPromptRef.value = props.promptRef
    imageLoading.value = false
    pendingImage = undefined
  }
  image.onload = commitFrame
  image.onerror = () => {
    if (sequence !== loadSequence) return
    imageLoading.value = false
    imageError.value = true
    pendingImage = undefined
  }
  image.src = url
  // decode() warms the render path when supported; onload remains the non-blocking fallback.
  void image.decode?.().then(commitFrame).catch(() => {
    if (image.complete && image.naturalWidth > 0) commitFrame()
  })
}, { immediate: true })

onBeforeUnmount(() => {
  loadSequence += 1
  viewportMedia?.removeEventListener('change', syncPortraitViewport)
  if (pendingImage) {
    pendingImage.onload = null
    pendingImage.onerror = null
  }
})

const syncPortraitViewport = (event?: MediaQueryListEvent) => {
  portraitViewport.value = event?.matches ?? viewportMedia?.matches ?? false
}

onMounted(() => {
  if (typeof window.matchMedia !== 'function') return
  viewportMedia = window.matchMedia(portraitQuery)
  syncPortraitViewport()
  viewportMedia.addEventListener('change', syncPortraitViewport)
})

const imageStyle = computed(() => ({
  backgroundImage: displayedImage.value
    ? `url('${displayedImage.value}')`
    : props.gradient,
  backgroundPosition: isEventCg.value
    ? ({ left: '34% center', center: 'center', right: '66% center' }[props.focus])
    : (props.focalPoint ?? 'center'),
}))

const placeholderLabel = computed(() => (
  displayedPlaceholderFor.value
    ? `视觉占位${displayedPromptRef.value ? ` · ${displayedPromptRef.value}` : ''}`
    : ''
))

// SceneBackdrop owns image continuity; story and UI layers never manipulate its DOM directly.
</script>

<template>
  <div class="scene-backdrop" :class="[`transition-${transition}`, { 'is-cg': isEventCg }]">
    <!-- Overlap outgoing and incoming frames so crossfades never expose the stage base color. -->
    <Transition :name="`scene-${transition}`" type="transition">
      <div
        :key="`${displayedSceneKey}:${displayedImage ?? gradient}`"
        class="scene-image"
        :class="`camera-${camera}`"
        :style="imageStyle"
        role="img"
        :aria-label="displayedDescription"
        :data-image-state="imageLoading ? 'loading' : imageError ? 'error' : 'ready'"
        :data-image-url="displayedImage"
        :data-placeholder-for="displayedPlaceholderFor"
      />
    </Transition>
    <Transition name="loading-fade">
      <div v-if="imageLoading" class="scene-loading" aria-hidden="true"><i /></div>
    </Transition>
    <div class="stage-vignette" aria-hidden="true" />
    <div v-if="isEventCg" class="cg-mark" aria-hidden="true"><i /><span>EVENT CG</span></div>
    <div
      v-if="displayedPlaceholderFor"
      class="visual-placeholder-mark"
      role="status"
      :title="`最终素材：${displayedPlaceholderFor}`"
    >
      {{ placeholderLabel }}
    </div>
  </div>
</template>

<style scoped>
.scene-backdrop,
.scene-image,
.stage-vignette { position: absolute; inset: 0; }
.scene-backdrop { z-index: -5; overflow: hidden; background: #171321; }
.scene-image {
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  will-change: opacity, transform;
}
.scene-loading {
  position: absolute;
  z-index: 1;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.scene-loading i {
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,.09) 50%, transparent 65%);
  animation: scene-loading 1.4s ease-in-out infinite;
  transform: translateX(-100%);
}
.loading-fade-leave-active { transition: opacity .22s ease; }
.loading-fade-leave-to { opacity: 0; }
.stage-vignette {
  z-index: 2;
  background:
    linear-gradient(180deg, rgba(26, 19, 37, .12) 0%, transparent 45%, rgba(21, 13, 27, .72) 100%),
    radial-gradient(circle at 50% 42%, transparent 30%, rgba(20, 12, 25, .18) 100%);
  pointer-events: none;
}
.is-cg .stage-vignette {
  background: linear-gradient(180deg, rgba(19, 12, 24, .03) 0 57%, rgba(19, 12, 24, .62) 100%);
}
.cg-mark {
  position: absolute;
  z-index: 3;
  top: clamp(4.8rem, 10vh, 6.6rem);
  left: max(1rem, env(safe-area-inset-left));
  display: flex;
  align-items: center;
  gap: .5rem;
  color: rgba(255,255,255,.72);
  font-family: var(--font-mono);
  font-size: .62rem;
  letter-spacing: .14em;
  text-shadow: 0 2px 8px rgba(0,0,0,.5);
}
.cg-mark i { width: 1.8rem; height: 1px; background: currentColor; }
.visual-placeholder-mark {
  position: absolute;
  z-index: 4;
  top: clamp(7rem, 15vh, 9rem);
  left: max(1rem, env(safe-area-inset-left));
  max-width: min(70vw, 20rem);
  padding: .38rem .62rem;
  border: 1px solid rgba(255, 225, 166, .45);
  border-radius: 999px;
  background: rgba(20, 13, 29, .78);
  color: #ffe1a6;
  font-family: var(--font-mono);
  font-size: .64rem;
  letter-spacing: .06em;
  pointer-events: none;
  text-shadow: 0 1px 5px rgba(0,0,0,.55);
}

.camera-push-in { animation: camera-push 9s ease-out both; }
.camera-pull-back { animation: camera-pull 9s ease-out both; }
.camera-drift-left { animation: camera-left 11s ease-in-out both; }
.camera-drift-right { animation: camera-right 11s ease-in-out both; }

.scene-crossfade-enter-active,
.scene-crossfade-leave-active,
.scene-ink-enter-active,
.scene-ink-leave-active,
.scene-flash-enter-active,
.scene-flash-leave-active,
.scene-glitch-enter-active,
.scene-glitch-leave-active,
.scene-slide-enter-active,
.scene-slide-leave-active {
  transition: opacity .32s ease, transform .38s var(--ease-out), filter .3s ease, clip-path .42s var(--ease-out);
}
.scene-crossfade-enter-from,
.scene-crossfade-leave-to { opacity: 0; }
.scene-slide-enter-from { opacity: 0; transform: translateX(2.5%); }
.scene-slide-leave-to { opacity: 0; transform: translateX(-1.5%); }
.scene-ink-enter-from { opacity: 0; clip-path: circle(0 at 50% 50%); }
.scene-ink-leave-to { opacity: 0; filter: saturate(.3); }
.scene-flash-enter-from { opacity: 0; filter: brightness(2.2) saturate(.4); }
.scene-flash-leave-to { opacity: 0; filter: brightness(1.7); }
.scene-glitch-enter-from { opacity: 0; transform: translateX(1.5%); filter: hue-rotate(22deg) contrast(1.4); }
.scene-glitch-leave-to { opacity: 0; transform: translateX(-1%); }

@keyframes camera-push { from { transform: scale(1); } to { transform: scale(1.045); } }
@keyframes camera-pull { from { transform: scale(1.05); } to { transform: scale(1); } }
@keyframes camera-left { from { transform: scale(1.035) translateX(1%); } to { transform: scale(1.035) translateX(-1%); } }
@keyframes camera-right { from { transform: scale(1.035) translateX(-1%); } to { transform: scale(1.035) translateX(1%); } }
@keyframes scene-loading { to { transform: translateX(100%); } }

@media (max-width: 600px) and (orientation: portrait) {
  .scene-image { background-size: auto 100%; }
  .is-cg .scene-image { background-size: cover; }
  .stage-vignette { background: linear-gradient(180deg, rgba(20,12,25,.04) 0 48%, rgba(20,12,25,.88) 76% 100%); }
  .cg-mark { top: max(4.6rem, calc(env(safe-area-inset-top) + 3.8rem)); }
  .visual-placeholder-mark { top: max(6.8rem, calc(env(safe-area-inset-top) + 6rem)); }
}

@media (prefers-reduced-motion: reduce) {
  .scene-loading i { animation: none; }
}
</style>
