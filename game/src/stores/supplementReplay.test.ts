import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { supplementCheckpoints, supplementCheckpointById } from '@/content/supplementCheckpoints'
import { readSave } from '@/engine/storage'
import { useGameStore } from './game'

class MemoryStorage implements Storage {
  readonly values = new Map<string, string>()
  get length() { return this.values.size }
  clear() { this.values.clear() }
  getItem(key: string) { return this.values.get(key) ?? null }
  key(index: number) { return [...this.values.keys()][index] ?? null }
  removeItem(key: string) { this.values.delete(key) }
  setItem(key: string, value: string) { this.values.set(key, String(value)) }
}

beforeEach(() => {
  const storage = new MemoryStorage()
  vi.stubGlobal('localStorage', storage)
  vi.stubGlobal('window', { localStorage: storage })
  setActivePinia(createPinia())
})
afterEach(() => vi.unstubAllGlobals())

// 通用走法：有选择就取第一项，否则前进；抵达 s1x-exit 哨兵时 store 自动退出回放，循环结束。
const playSupplementToEnd = (store: ReturnType<typeof useGameStore>) => {
  let guard = 0
  while (store.inReplay) {
    if (guard++ > 200) throw new Error('补遗回放未收敛（疑似无法抵达返回哨兵）')
    if (store.choices.length) {
      const first = store.choices[0]
      if (first) store.choose(first.id)
    } else store.advance()
  }
}

describe('2.1 第一季补遗隔离回放', () => {
  it('从标题沙盒启动某篇补遗，进入正确入口且 inSupplementReplay 为真', () => {
    const store = useGameStore()
    const cp = supplementCheckpointById('s1x-org2')!
    store.startSupplementReplay(cp, { playerName: '补遗测试' })

    expect(store.inReplay).toBe(true)
    expect(store.inSupplementReplay).toBe(true)
    expect(store.inChapterReplay).toBe(false)
    expect(store.inRomanceReplay).toBe(false)
    expect(store.state?.nodeId).toBe('s1x01-entry')
    expect(store.state?.route).toBe('org2')
    expect(store.state?.organization).toBe('org2')
  })

  it('五篇均可从沙盒走到收束，且恰好把对应 doneNodeId 写入收藏 seenNodes', () => {
    for (const cp of supplementCheckpoints) {
      const store = useGameStore()
      store.startSupplementReplay(cp, { playerName: '补遗测试' })
      playSupplementToEnd(store)

      expect(store.inReplay).toBe(false)
      expect(store.state).toBeNull() // 沙盒来自标题，退出后回到标题态
      expect(store.collection.seenNodes).toContain(cp.doneNodeId)
    }
  })

  it('隔离不变量：不写来源存档、不改结局/关系 CG、不泄露补遗中间节点', () => {
    const store = useGameStore()
    store.start({ playerName: '正常进度' })
    // 制造会被回放触发的收藏/存档差异源，确保不被污染。
    store.applyDebugEffects([
      { type: 'unlockCg', id: 'cg-isolation' },
      { type: 'unlockEnding', id: 'org2-end-isolation' },
    ])
    store.save('auto')
    const beforeAuto = JSON.stringify(readSave('auto'))
    const before = JSON.parse(JSON.stringify(store.collection))

    const cp = supplementCheckpointById('s1x-org2')!
    store.startSupplementReplay(cp, { playerName: '补遗测试' })
    playSupplementToEnd(store)

    // 来源存档逐字节不变（补遗是纯沙盒，绝不写存档）。
    expect(JSON.stringify(readSave('auto'))).toBe(beforeAuto)
    // 组织结局与关系 CG 不被补遗污染。
    expect(store.collection.unlockedEndings).toEqual(before.unlockedEndings)
    expect(store.collection.unlockedCgs).toEqual(before.unlockedCgs)
    // 收藏仅新增该篇收束节点，绝不泄露任何补遗中间节点（entry/opens/react 等）。
    const added = store.collection.seenNodes.filter((id) => !before.seenNodes.includes(id))
    expect(added).toEqual([cp.doneNodeId])
    expect(
      store.collection.seenNodes.filter((id) => id.startsWith('s1x') && id !== cp.doneNodeId),
    ).toEqual([])
  })

  it('完成标记幂等：重复游玩同一篇不会写入重复 id，也不回写存档', () => {
    const store = useGameStore()
    store.start({ playerName: '正常进度' })
    store.save('auto')
    const beforeAuto = JSON.stringify(readSave('auto'))
    const cp = supplementCheckpointById('s1x-org2')!

    store.startSupplementReplay(cp, { playerName: '补遗测试' })
    playSupplementToEnd(store)
    store.startSupplementReplay(cp, { playerName: '补遗测试' })
    playSupplementToEnd(store)

    expect(store.collection.seenNodes.filter((id) => id === cp.doneNodeId)).toHaveLength(1)
    expect(JSON.stringify(readSave('auto'))).toBe(beforeAuto)
  })

  it('提前退出守护：未走到收束就退出不写任何完成标记，也不改来源存档', () => {
    const store = useGameStore()
    store.start({ playerName: '正常进度' })
    store.save('auto')
    const beforeAuto = JSON.stringify(readSave('auto'))
    const before = JSON.parse(JSON.stringify(store.collection))

    const cp = supplementCheckpointById('s1x-org2')!
    store.startSupplementReplay(cp, { playerName: '补遗测试' })
    store.advance() // s1x01-entry -> s1x01-shi-opens
    store.advance() // s1x01-shi-opens -> s1x01-player-posture（有选择，下一步 advance 无操作）
    store.exitReplay()

    expect(store.inReplay).toBe(false)
    expect(store.collection.seenNodes).toEqual(before.seenNodes)
    expect(JSON.stringify(readSave('auto'))).toBe(beforeAuto)
  })
})
