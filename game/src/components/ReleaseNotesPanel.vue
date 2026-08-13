<script setup lang="ts">
import { currentReleaseNotes } from '@/content/releaseNotes'

// ReleaseNotesPanel renders the shared release catalog; App owns read-state persistence.
const notes = currentReleaseNotes
</script>

<template>
  <article class="release-notes" aria-labelledby="release-notes-title">
    <header class="release-hero">
      <div class="release-meta">
        <span>VERSION {{ notes.version }}</span>
        <time :datetime="notes.publishedAt">{{ notes.publishedLabel }}</time>
      </div>
      <h3 id="release-notes-title">{{ notes.title }}</h3>
      <p>{{ notes.introduction }}</p>
    </header>

    <div class="release-sections">
      <section
        v-for="(section, index) in notes.sections"
        :key="section.id"
        :aria-labelledby="`release-section-${section.id}`"
      >
        <span class="section-index" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
        <div>
          <h4 :id="`release-section-${section.id}`">{{ section.title }}</h4>
          <p>{{ section.summary }}</p>
          <ul>
            <li v-for="detail in section.details" :key="detail">{{ detail }}</li>
          </ul>
        </div>
      </section>
    </div>
  </article>
</template>

<style scoped>
.release-notes { display: grid; gap: var(--space-5); }
.release-hero {
  position: relative;
  overflow: hidden;
  padding: clamp(1.1rem, 4vw, 1.6rem);
  border: 1px solid color-mix(in srgb, var(--color-primary-strong) 42%, transparent);
  border-radius: var(--radius-md);
  background:
    radial-gradient(circle at 88% 10%, rgba(230, 182, 129, .14), transparent 10rem),
    linear-gradient(135deg, rgba(182, 95, 127, .2), rgba(255, 255, 255, .025));
}
.release-meta { display: flex; align-items: center; justify-content: space-between; gap: 1rem; color: var(--color-accent); font-family: var(--font-mono); font-size: .68rem; letter-spacing: .09em; }
.release-hero h3 { margin: .65rem 0 .35rem; font-family: var(--font-display); font-size: clamp(1.4rem, 5vw, 2rem); line-height: 1.25; }
.release-hero p { max-width: 42rem; margin: 0; color: var(--color-text-muted); font-size: .88rem; line-height: 1.65; }
.release-sections { display: grid; gap: .7rem; }
.release-sections section {
  display: grid;
  gap: .8rem;
  padding: .9rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, .025);
  grid-template-columns: 2rem minmax(0, 1fr);
}
.section-index { padding-top: .08rem; color: var(--color-primary-strong); font-family: var(--font-mono); font-size: .68rem; letter-spacing: .08em; }
.release-sections h4 { margin: 0; color: var(--color-text); font-size: .95rem; }
.release-sections p { margin: .25rem 0 .4rem; color: var(--color-text-muted); font-size: .82rem; line-height: 1.6; }
.release-sections ul { display: grid; gap: .25rem; margin: 0; padding-left: 1.15rem; color: var(--color-text-muted); font-size: .78rem; line-height: 1.6; }
.release-sections li::marker { color: var(--color-accent); }

@media (max-width: 560px) {
  .release-notes { gap: var(--space-4); }
  .release-hero { padding: 1rem; }
  .release-meta { align-items: flex-start; flex-direction: column; gap: .2rem; }
  .release-sections section { padding: .8rem; grid-template-columns: 1.65rem minmax(0, 1fr); }
}
</style>
