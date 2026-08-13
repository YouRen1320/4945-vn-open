// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'

import DistrictArchivePanel from './DistrictArchivePanel.vue'

let unmount: (() => void) | undefined

afterEach(() => {
  unmount?.()
  unmount = undefined
  document.body.replaceChildren()
})

const mountPanel = (section: 'history' | 'roster') => {
  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp({ render: () => h(DistrictArchivePanel, { section }) })
  app.mount(host)
  unmount = () => app.unmount()
  return host
}

describe('DistrictArchivePanel 区史档案', () => {
  it('展示四个日期事件和二十张脱敏证据摘要', () => {
    const host = mountPanel('history')
    expect(host.querySelectorAll('.timeline-list li')).toHaveLength(4)
    expect(host.querySelectorAll('.evidence-grid article')).toHaveLength(20)
    expect(host.textContent).toContain('原截图不随游戏发布')
    expect(host.textContent).toContain('当事人说法')
    expect(host.textContent).toContain('SHA-256')
    expect(host.querySelector('img')).toBeNull()
  })

  it('展示三十二名成员并标明两张虚构替代头像', () => {
    const host = mountPanel('roster')
    expect(host.querySelectorAll('.roster-grid article')).toHaveLength(32)
    expect(host.querySelectorAll('.roster-grid img')).toHaveLength(32)
    expect(host.textContent?.match(/隐私保护 · 虚构替代头像/g)).toHaveLength(2)
    expect(host.textContent).toContain('小欣ovo')
    expect(host.textContent).toContain('不与宇智波带土绑定')
  })
})
