// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'

import { currentReleaseNotes } from '@/content/releaseNotes'

import ReleaseNotesPanel from './ReleaseNotesPanel.vue'

let unmount: (() => void) | undefined

afterEach(() => {
  unmount?.()
  unmount = undefined
  document.body.replaceChildren()
})

describe('ReleaseNotesPanel 更新内容', () => {
  it('从结构化数据渲染版本、语义分区与兼容说明', () => {
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp({ render: () => h(ReleaseNotesPanel) })
    app.mount(host)
    unmount = () => app.unmount()

    expect(host.querySelector('article')?.getAttribute('aria-labelledby')).toBe('release-notes-title')
    expect(host.querySelector('time')?.getAttribute('datetime')).toBe(currentReleaseNotes.publishedAt)
    expect(host.textContent).toContain(`VERSION ${currentReleaseNotes.version}`)
    expect(host.querySelectorAll('section')).toHaveLength(currentReleaseNotes.sections.length)

    for (const section of currentReleaseNotes.sections) {
      const heading = host.querySelector(`#release-section-${section.id}`)
      expect(heading?.textContent).toBe(section.title)
      expect(host.textContent).toContain(section.summary)
      for (const detail of section.details) expect(host.textContent).toContain(detail)
    }

    expect(host.textContent).toContain('选择立即得到回应')
    expect(host.textContent).toContain('关键决定留下后续回响')
    expect(host.textContent).toContain('旧存档停在共享节点时仍按原路线继续')
  })
})
