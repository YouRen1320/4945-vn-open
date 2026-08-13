<script setup lang="ts">
import { X } from '@lucide/vue'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{ title: string; wide?: boolean; obscured?: boolean; mobileSheet?: boolean }>()
const emit = defineEmits<{ close: [] }>()
const panel = ref<HTMLElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
let previouslyFocused: HTMLElement | null = null

// The trap must ignore deliberately removed controls such as the hidden file picker.
const focusableSelector = [
  'button:not(:disabled):not([tabindex="-1"])',
  'a[href]:not([tabindex="-1"])',
  'input:not(:disabled):not([tabindex="-1"])',
  'select:not(:disabled):not([tabindex="-1"])',
  'textarea:not(:disabled):not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

// Nested full-screen viewers own keyboard input while their dialog is the topmost modal layer.
const isTopmostDialog = () => {
  const dialogs = document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]')
  return dialogs.item(dialogs.length - 1) === panel.value
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!isTopmostDialog()) return
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
    return
  }
  if (event.key !== 'Tab' || !panel.value) return
  const focusable = [...panel.value.querySelectorAll<HTMLElement>(focusableSelector)]
  if (!focusable.length) return
  const first = focusable[0]
  const last = focusable.at(-1)
  if (!panel.value.contains(document.activeElement)) { event.preventDefault(); first?.focus(); return }
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
}

onMounted(async () => {
  previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
  window.addEventListener('keydown', handleKeydown, true)
  await nextTick()
  closeButton.value?.focus()
})
watch(() => props.title, async () => {
  await nextTick()
  closeButton.value?.focus()
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown, true)
  previouslyFocused?.focus()
})

// BaseModal 统一移动端全屏与桌面浮层行为，并管理 Esc、焦点圈与关闭后的焦点归还。
</script>

<template>
  <div class="modal-backdrop" :class="{ 'mobile-sheet': mobileSheet }" role="presentation" @click.self="emit('close')">
    <section
      ref="panel"
      class="modal-panel"
      :class="{ wide, 'mobile-sheet': mobileSheet }"
      role="dialog"
      :aria-modal="obscured ? undefined : 'true'"
      :aria-hidden="obscured ? 'true' : undefined"
      :aria-label="title"
      :inert="obscured || undefined"
    >
      <header>
        <h2>{{ title }}</h2>
        <button ref="closeButton" class="icon-button" type="button" aria-label="关闭" @click="emit('close')">
          <X :size="22" />
        </button>
      </header>
      <div class="modal-body">
        <slot />
      </div>
      <footer v-if="$slots.footer">
        <slot name="footer" />
      </footer>
    </section>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  z-index: 100;
  inset: 0;
  display: grid;
  padding: max(0.75rem, env(safe-area-inset-top)) max(0.75rem, env(safe-area-inset-right))
    max(0.75rem, env(safe-area-inset-bottom)) max(0.75rem, env(safe-area-inset-left));
  background: rgba(2, 3, 12, 0.76);
  backdrop-filter: blur(12px);
  place-items: center;
  animation: fade-in 180ms ease-out;
}

.modal-panel {
  display: grid;
  width: min(100%, 35rem);
  max-height: min(88dvh, 50rem);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 1.25rem;
  background: rgba(10, 14, 39, 0.97);
  box-shadow: 0 24px 90px rgba(0, 0, 0, 0.62);
  grid-template-rows: auto minmax(0, 1fr) auto;
}

.modal-panel.wide { width: min(100%, 58rem); }

header,
footer {
  display: flex;
  min-height: 4rem;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
}

footer {
  border-top: 1px solid var(--color-border);
  border-bottom: 0;
}

h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.15rem;
  letter-spacing: 0.06em;
}

.modal-body {
  overflow: auto;
  padding: 1rem;
  overscroll-behavior: contain;
}

.icon-button {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.07);
  color: var(--color-text);
  place-items: center;
}

@keyframes fade-in { from { opacity: 0; } }

@media (max-width: 560px) {
  .modal-backdrop { padding: 0; place-items: stretch; }
  .modal-panel,
  .modal-panel.wide { width: 100%; max-height: 100dvh; border: 0; border-radius: 0; }
  header { padding-top: max(0.75rem, env(safe-area-inset-top)); }
  .modal-body { padding-bottom: max(1rem, calc(env(safe-area-inset-bottom) + 1rem)); }
  footer { padding-bottom: max(0.75rem, env(safe-area-inset-bottom)); }
  .modal-backdrop.mobile-sheet { place-items: end center; }
  .modal-panel.mobile-sheet,
  .modal-panel.mobile-sheet.wide {
    width: 100%;
    max-height: min(88dvh, 43rem);
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-bottom: 0;
    border-radius: 1.25rem 1.25rem 0 0;
    animation: sheet-in 220ms ease-out;
  }
  .modal-panel.mobile-sheet header { padding-top: .75rem; }
}

@keyframes sheet-in { from { transform: translateY(1.25rem); opacity: 0; } }

@media (prefers-reduced-motion: reduce) {
  .modal-backdrop,
  .modal-panel.mobile-sheet { animation: none; }
}
</style>
