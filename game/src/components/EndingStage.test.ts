// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'

import { sharedNodes } from '@/content/story/shared'
import { s2_2_9_Nodes } from '@/content/story/s2-2.9'
import { resolveSceneDirection } from '@/engine/presentation'
import { createInitialGameState } from '@/engine/state'

import EndingStage from './EndingStage.vue'

let unmount: (() => void) | undefined

afterEach(() => {
  unmount?.()
  unmount = undefined
  document.body.replaceChildren()
  vi.useRealTimers()
})

describe('EndingStage 主线衔接', () => {
  it('事件一片尾署名正确，并只提供继续事件二的单一出口', async () => {
    vi.useFakeTimers()
    const node = sharedNodes.find((entry) => entry.id === 'credits-first-season')!
    const state = createInitialGameState({ playerName: '测试玩家' })
    state.nodeId = node.id
    state.route = 'org2'
    state.history.push({
      nodeId: 'choice-node',
      date: '2026-07-21',
      speaker: 'player',
      speakerName: '测试玩家',
      text: '选择后的记录',
      choiceLabel: '守住江南二组的长期利益',
      timestamp: 1,
    })

    let continued = 0
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp({
      render: () => h(EndingStage, {
        node,
        state,
        direction: resolveSceneDirection(node),
        onContinueSeason2: () => { continued += 1 },
      }),
    })
    app.mount(host)
    unmount = () => app.unmount()

    await vi.advanceTimersByTimeAsync(4500)
    expect(host.textContent).toContain('开发者 · YouRen')
    expect(host.textContent).toContain('QQ 1670615595')
    expect(host.textContent).not.toContain('4945区开发组')

    await vi.advanceTimersByTimeAsync(6000)
    const buttons = host.querySelectorAll<HTMLButtonElement>('.ending-actions button')
    expect(buttons).toHaveLength(1)
    expect(buttons[0]?.textContent).toContain('继续主线 · 事件二')
    expect(host.textContent).not.toContain('返回标题')
    buttons[0]?.click()
    expect(continued).toBe(1)
  })

  it('事件一组织或隐藏结局演出结束后自动进入片尾', async () => {
    vi.useFakeTimers()
    const node = sharedNodes.find((entry) => entry.id === 'ending-shadow-puppet')!
    const state = createInitialGameState({ playerName: '旧存档玩家' })
    state.nodeId = node.id
    state.route = 'org2'

    let advanced = 0
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp({
      render: () => h(EndingStage, {
        node,
        state,
        direction: resolveSceneDirection(node),
        onAdvance: () => { advanced += 1 },
      }),
    })
    app.mount(host)
    unmount = () => app.unmount()

    await vi.advanceTimersByTimeAsync(11_000)
    expect(host.textContent).toContain('提线木偶')
    expect(advanced).toBe(1)
  })

  it('事件二季终必须先进入完成哨兵，不能直接返回标题跳过归档', async () => {
    vi.useFakeTimers()
    const node = s2_2_9_Nodes.find((entry) => entry.id === 's2-2.9-summary')!
    const state = createInitialGameState({ playerName: '事件二玩家' })
    state.schemaVersion = 5
    state.nodeId = node.id

    let advanced = 0
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp({
      render: () => h(EndingStage, {
        node,
        state,
        direction: resolveSceneDirection(node),
        onAdvance: () => { advanced += 1 },
      }),
    })
    app.mount(host)
    unmount = () => app.unmount()

    await vi.advanceTimersByTimeAsync(3500)
    const complete = [...host.querySelectorAll<HTMLButtonElement>('.ending-actions button')]
      .find((button) => button.textContent?.includes('封存结局并返回标题'))
    expect(complete).toBeTruthy()
    expect(host.querySelector('.ending-return-btn')).toBeNull()
    complete?.click()
    expect(advanced).toBe(1)
  })

  it('一组片尾选择新组织后携带目标路线进入事件二', async () => {
    vi.useFakeTimers()
    const node = sharedNodes.find((entry) => entry.id === 'credits-first-season')!
    const state = createInitialGameState({ playerName: '一组玩家' })
    state.nodeId = node.id
    state.route = 'org1'

    let destination = ''
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp({
      render: () => h(EndingStage, {
        node,
        state,
        direction: resolveSceneDirection(node),
        onContinueSeason2: (route?: string) => { destination = route ?? '' },
      }),
    })
    app.mount(host)
    unmount = () => app.unmount()

    await vi.advanceTimersByTimeAsync(10_500)
    expect(host.textContent).toContain('第一席的结局已经保存')
    const openButton = [...host.querySelectorAll<HTMLButtonElement>('.ending-actions button')]
      .find((button) => button.textContent?.includes('选择事件二去向'))
    openButton?.click()
    await nextTick()

    expect(host.textContent).toContain('一组结局与第一席身份会完整保留')
    const org4 = [...host.querySelectorAll<HTMLButtonElement>('.route-bridge-option')]
      .find((button) => button.textContent?.includes('4组'))
    org4?.click()
    await nextTick()
    const confirm = host.querySelector<HTMLButtonElement>('.route-bridge-confirm')
    expect(confirm?.disabled).toBe(false)
    expect(confirm?.textContent).toContain('天上白玉京')
    confirm?.click()
    expect(destination).toBe('org4')
  })
})
