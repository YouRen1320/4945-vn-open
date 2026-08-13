// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick } from 'vue'

import CommunityGroupPanel from './CommunityGroupPanel.vue'

const QQ_GROUP_NUMBER = '1075594288'
const QQ_GROUP_INVITE_URL = 'https://qm.qq.com/q/eHUS6rTboI'

let unmount: (() => void) | undefined

afterEach(() => {
  unmount?.()
  unmount = undefined
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe('CommunityGroupPanel', () => {
  it('提供官方邀请链接、可选群号和一键复制反馈', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp(CommunityGroupPanel)
    app.mount(host)
    unmount = () => app.unmount()

    const joinLink = host.querySelector<HTMLAnchorElement>('a.qq-action')
    expect(joinLink?.href).toBe(QQ_GROUP_INVITE_URL)
    expect(joinLink?.target).toBe('_blank')
    expect(host.textContent).toContain(QQ_GROUP_NUMBER)

    host.querySelector<HTMLButtonElement>('button.copy-action')?.click()
    await Promise.resolve()
    await nextTick()
    expect(writeText).toHaveBeenCalledWith(QQ_GROUP_NUMBER)
    expect(host.querySelector('[role="status"]')?.textContent).toContain('群号已复制')
  })
})
