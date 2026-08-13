// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'

import type { ReplayCheckpoint, ReplayContext } from '@/engine/replay'
import GoldenSlicePanel from './GoldenSlicePanel.vue'

let unmount: (() => void) | undefined
afterEach(() => {
  unmount?.()
  unmount = undefined
  document.body.replaceChildren()
})

const mountPanel = () => {
  let lastStart: { checkpoint: ReplayCheckpoint; context: ReplayContext } | undefined
  let backCount = 0
  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp({
    render: () => h(GoldenSlicePanel, {
      onStart: (checkpoint: ReplayCheckpoint, context: ReplayContext) => { lastStart = { checkpoint, context } },
      onBack: () => { backCount += 1 },
    }),
  })
  app.mount(host)
  unmount = () => app.unmount()
  return { host, getLastStart: () => lastStart, getBackCount: () => backCount }
}

describe('GoldenSlicePanel 内测入口', () => {
  it('明确说明纯内存隔离范围', () => {
    const { host } = mountPanel()
    expect(host.textContent).toContain('不会写入存档、收藏、结局或正式主线进度')
  })

  it('使用输入的玩家名启动唯一检查点', async () => {
    const { host, getLastStart } = mountPanel()
    const input = host.querySelector<HTMLInputElement>('input[aria-label="黄金样板玩家名"]')!
    input.value = '黄金测试员'
    input.dispatchEvent(new Event('input'))
    await nextTick()

    host.querySelector<HTMLButtonElement>('button.start-action')!.click()
    await nextTick()
    expect(getLastStart()?.checkpoint.id).toBe('gs1-golden-slice')
    expect(getLastStart()?.context.playerName).toBe('黄金测试员')
  })

  it('可以启动事件二代表性样板', async () => {
    const { host, getLastStart } = mountPanel()
    const buttons = host.querySelectorAll<HTMLButtonElement>('button.start-action')
    buttons[1]!.click()
    await nextTick()
    expect(getLastStart()?.checkpoint.id).toBe('gs2-golden-slice')
    expect(host.textContent).toContain('三组＋心跳成瘾代表性路线')
  })

  it('返回按钮触发 back 事件', async () => {
    const { host, getBackCount } = mountPanel()
    host.querySelector<HTMLButtonElement>('button.back-action')!.click()
    await nextTick()
    expect(getBackCount()).toBe(1)
  })
})
