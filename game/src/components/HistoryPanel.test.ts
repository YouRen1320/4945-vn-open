// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'

import HistoryPanel from './HistoryPanel.vue'

const entries = [
  {
    nodeId: 'p00-opening',
    date: '2026-07-16',
    speaker: 'mentor' as const,
    speakerName: '老朋友',
    text: '先上号。',
    timestamp: 1,
  },
  {
    nodeId: 'r2-09-world-enemy-starts',
    date: '2026-07-20',
    speaker: 'system' as const,
    speakerName: '系统',
    text: '与世界为敌。',
    timestamp: 2,
  },
]

describe('HistoryPanel 章节回看筛选', () => {
  let host: HTMLDivElement | undefined
  let unmount: (() => void) | undefined

  afterEach(() => {
    unmount?.()
    unmount = undefined
    host?.remove()
    host = undefined
  })

  it('显示幕标签并按剧情幕筛选历史记录', async () => {
    host = document.createElement('div')
    document.body.append(host)
    const app = createApp({ render: () => h(HistoryPanel, { entries }) })
    app.mount(host)
    unmount = () => app.unmount()

    expect(host.textContent).toContain('序章')
    expect(host.textContent).toContain('第一幕')
    expect(host.textContent).toContain('先上号。')
    expect(host.textContent).toContain('与世界为敌。')

    const act1 = [...host.querySelectorAll('button')].find((button) => button.textContent === '第一幕')
    expect(act1).toBeDefined()
    act1?.click()
    await nextTick()

    expect(host.textContent).not.toContain('先上号。')
    expect(host.textContent).toContain('与世界为敌。')
    expect(host.querySelector('.history-filters .active')?.textContent).toBe('第一幕')
  })

  it('只提供当前记录包含的剧情幕筛选项', async () => {
    host = document.createElement('div')
    document.body.append(host)
    const app = createApp({ render: () => h(HistoryPanel, { entries }) })
    app.mount(host)
    unmount = () => app.unmount()

    // The real panel only exposes chapters present in the entries; this assertion documents that contract.
    expect(host.querySelectorAll('.history-filters button')).toHaveLength(3)
    expect(host.textContent).not.toContain('第四幕')
    await nextTick()
    expect(host.textContent).toContain('先上号。')
  })
})
