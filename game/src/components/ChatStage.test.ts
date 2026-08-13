// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, reactive } from 'vue'

import { createInitialGameState } from '@/engine/state'

import ChatStage from './ChatStage.vue'

import type { HistoryEntry, StoryChoice, StoryNode } from '@/engine/types'

const makeNode = (id: string, text = '今晚还在吗？'): StoryNode => ({
  id,
  chapter: 'prologue',
  actLabel: '序章',
  date: '2026-07-17',
  location: '老朋友',
  mode: 'chat',
  speaker: 'mentor',
  text,
  background: 'nightMessage',
  next: 'p00-opening',
})

const choice: StoryChoice = {
  id: 'reply',
  label: '我在，继续说。',
  next: 'p00-opening',
}

const settle = async () => {
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

let unmount: (() => void) | undefined

afterEach(() => {
  unmount?.()
  unmount = undefined
  document.body.replaceChildren()
})

describe('ChatStage 最新消息跟随', () => {
  it('打字时跟随底部，用户回看时停留，新节点、历史和回复会重新贴底', async () => {
    const model = reactive<{
      node: StoryNode
      history: HistoryEntry[]
      visibleText: string
    }>({
      node: makeNode('chat-a'),
      history: [],
      visibleText: '今晚',
    })
    const selectedChoices: string[] = []
    let interactions = 0
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp({
      render: () => h(ChatStage, {
        node: model.node,
        state: createInitialGameState({ playerName: '测试玩家' }),
        history: model.history,
        visibleText: model.visibleText,
        revealComplete: true,
        canAdvance: false,
        choices: [choice],
        sprites: [],
        ui: 'private-chat',
        onInteract: () => { interactions += 1 },
        onChoose: (id: string) => selectedChoices.push(id),
      }),
    })
    app.mount(host)
    unmount = () => app.unmount()
    await settle()

    const list = host.querySelector<HTMLElement>('.message-list')
    expect(list).not.toBeNull()
    if (!list) return
    Object.defineProperties(list, {
      scrollHeight: { configurable: true, get: () => 480 },
      clientHeight: { configurable: true, get: () => 180 },
    })

    model.visibleText = '今晚还在吗？'
    await settle()
    expect(list.scrollTop).toBe(480)

    list.scrollTop = 80
    list.dispatchEvent(new Event('scroll'))
    model.visibleText = '今晚还在吗？我有话想说。'
    await settle()
    expect(list.scrollTop).toBe(80)

    model.node = makeNode('chat-b', '那就听我说完。')
    await settle()
    expect(list.scrollTop).toBe(480)

    list.scrollTop = 80
    list.dispatchEvent(new Event('scroll'))
    model.history.push({
      nodeId: 'chat-a',
      date: '2026-07-17',
      speaker: 'mentor',
      speakerName: '老朋友',
      text: '今晚还在吗？',
      choiceLabel: '我在。',
      timestamp: 1,
    })
    await settle()
    expect(list.scrollTop).toBe(480)

    list.scrollTop = 80
    list.dispatchEvent(new Event('scroll'))
    host.querySelector<HTMLButtonElement>('.reply-list button')?.click()
    await settle()
    expect(selectedChoices).toEqual(['reply'])
    expect(list.scrollTop).toBe(480)

    const ornaments = [...host.querySelectorAll<SVGElement>('.header-ornament')]
    expect(ornaments).toHaveLength(2)
    expect(ornaments.every((icon) => icon.getAttribute('aria-hidden') === 'true')).toBe(true)
    ornaments[0]?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(interactions).toBe(0)
  })

  it('剧情演员使用独立资料显示姓名与头像', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const actorNode: StoryNode = {
      ...makeNode('s2-august-suming-refusal', '我不想掺和组织之间的事。'),
      location: '苏铭 · 私聊',
      speaker: 'suming',
      portrait: 'suming',
    }
    const app = createApp({
      render: () => h(ChatStage, {
        node: actorNode,
        state: createInitialGameState({ playerName: '测试玩家' }),
        history: [],
        visibleText: actorNode.text,
        revealComplete: true,
        canAdvance: false,
        choices: [],
        sprites: [],
        ui: 'private-chat',
      }),
    })
    app.mount(host)
    unmount = () => app.unmount()
    await settle()

    expect(host.querySelector('.message.current small')?.textContent).toBe('苏铭')
    expect(host.querySelector<HTMLImageElement>('.message.current img')?.src).toContain('/assets/avatars/suming.webp')
  })
})
