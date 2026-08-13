// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, reactive } from 'vue'

import StartScreen from './StartScreen.vue'

let unmount: (() => void) | undefined

afterEach(() => {
  unmount?.()
  unmount = undefined
  document.body.replaceChildren()
})

describe('StartScreen 主线入口', () => {
  it('没有进度时突出开始主线，并把非主线功能收进更多内容', () => {
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp({
      render: () => h(StartScreen, {
        canContinue: false,
      }),
    })
    app.mount(host)
    unmount = () => app.unmount()

    expect(host.querySelector('.primary')?.textContent).toContain('开始主线')
    expect(host.textContent).toContain('主线进度')
    expect(host.textContent).toContain('更多内容')
    expect(host.textContent).not.toContain('第二季')
    expect(host.textContent).not.toContain('本次更新')
  })

  it('有任一主线进度时突出继续主线', async () => {
    const props = reactive({ canContinue: false })
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp({ render: () => h(StartScreen, props) })
    app.mount(host)
    unmount = () => app.unmount()

    props.canContinue = true
    await nextTick()
    expect(host.querySelector('.primary')?.textContent).toContain('继续主线')
    expect(host.textContent).toContain('重新开始')
  })

  it('保留轻量玩家社区入口并发出 community 事件', () => {
    let opened = 0
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp({
      render: () => h(StartScreen, {
        canContinue: false,
        onCommunity: () => { opened += 1 },
      }),
    })
    app.mount(host)
    unmount = () => app.unmount()

    const button = host.querySelector<HTMLButtonElement>('button[aria-label*="1075594288"]')
    expect(button?.textContent).toContain('玩家社区')
    button?.click()
    expect(opened).toBe(1)
  })
})
