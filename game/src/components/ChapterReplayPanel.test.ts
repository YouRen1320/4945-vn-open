// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'

import ChapterReplayPanel from './ChapterReplayPanel.vue'
import { useGameStore } from '@/stores/game'

import type { ReplayCheckpoint, ReplayContext } from '@/engine/replay'

class MemoryStorage implements Storage {
  readonly values = new Map<string, string>()
  get length() { return this.values.size }
  clear() { this.values.clear() }
  getItem(key: string) { return this.values.get(key) ?? null }
  key(index: number) { return [...this.values.keys()][index] ?? null }
  removeItem(key: string) { this.values.delete(key) }
  setItem(key: string, value: string) { this.values.set(key, String(value)) }
}

let unmount: (() => void) | undefined

beforeEach(() => {
  const storage = new MemoryStorage()
  vi.stubGlobal('localStorage', storage)
  vi.stubGlobal('window', {
    localStorage: storage,
    addEventListener: () => {},
    removeEventListener: () => {},
  })
  setActivePinia(createPinia())
})
afterEach(() => {
  unmount?.()
  unmount = undefined
  document.body.replaceChildren()
  vi.unstubAllGlobals()
})

const mountPanel = (unlockedEndings: string[] = []) => {
  const store = useGameStore()
  store.collection.unlockedEndings = [...unlockedEndings]
  let lastStart: { checkpoint: ReplayCheckpoint; context: ReplayContext } | undefined
  let backCount = 0
  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp({
    render: () => h(ChapterReplayPanel, {
      onStart: (checkpoint: ReplayCheckpoint, context: ReplayContext) => { lastStart = { checkpoint, context } },
      onBack: () => { backCount += 1 },
    }),
  })
  app.mount(host)
  unmount = () => app.unmount()
  return { store, host, getLastStart: () => lastStart, getBackCount: () => backCount }
}

describe('ChapterReplayPanel 章节选择', () => {
  it('渲染全部 37 个章节入口', () => {
    const { host } = mountPanel(['r2-second-pole'])
    const chips = [...host.querySelectorAll<HTMLButtonElement>('button.chapter-chip')]
    expect(chips).toHaveLength(37)
  })

  it('仅解锁路线与序章可点，其余按门控禁用', () => {
    const { host } = mountPanel(['r2-second-pole'])
    const chips = [...host.querySelectorAll<HTMLButtonElement>('button.chapter-chip')]
    // 共通序章(1) + 二组(6) 解锁；其余四组锁定。
    const enabled = chips.filter((chip) => !chip.disabled)
    expect(enabled).toHaveLength(7)
    const disabled = chips.filter((chip) => chip.disabled)
    expect(disabled.length).toBe(37 - 7)
  })

  it('点击序章入口向上层传递检查点与玩家名 context', async () => {
    const { host, getLastStart } = mountPanel(['r2-second-pole'])
    const prologue = [...host.querySelectorAll<HTMLButtonElement>('button.chapter-chip')]
      .find((chip) => !chip.disabled && chip.textContent?.includes('序章'))
    prologue?.click()
    await nextTick()
    const last = getLastStart()
    expect(last?.checkpoint.id).toBe('cp-common-prologue')
    expect(last?.context.playerName).toBe('新手')
  })

  it('玩家名可编辑并进入 context', async () => {
    const { host, getLastStart } = mountPanel(['r2-second-pole'])
    const nameInput = host.querySelector<HTMLInputElement>('input[aria-label="回放使用的玩家名"]')!
    nameInput.value = '沙盒玩家'
    nameInput.dispatchEvent(new Event('input'))
    await nextTick()
    const prologue = [...host.querySelectorAll<HTMLButtonElement>('button.chapter-chip')]
      .find((chip) => !chip.disabled && chip.textContent?.includes('序章'))!
    prologue.click()
    await nextTick()
    expect(getLastStart()?.context.playerName).toBe('沙盒玩家')
  })

  it('六组分组提供可选组织名输入', () => {
    const { host } = mountPanel(['r6-sixth-seat'])
    const org6Input = host.querySelector<HTMLInputElement>('input[aria-label="六组沙盒组织名"]')
    expect(org6Input).toBeTruthy()
    expect(org6Input?.placeholder).toContain('第六组织')
  })

  it('返回按钮触发 back 事件', async () => {
    const { host, getBackCount } = mountPanel(['r2-second-pole'])
    const back = host.querySelector<HTMLButtonElement>('button.back-action')!
    back.click()
    await nextTick()
    expect(getBackCount()).toBe(1)
  })
})
