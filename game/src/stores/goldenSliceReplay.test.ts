import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { goldenSliceCheckpoint } from '@/content/goldenSliceCheckpoint'
import { prologueCheckpoint } from '@/content/replayCheckpoints'
import { useGameStore } from './game'

class MemoryStorage implements Storage {
  readonly values = new Map<string, string>()
  get length() { return this.values.size }
  clear() { this.values.clear() }
  getItem(key: string) { return this.values.get(key) ?? null }
  key(index: number) { return [...this.values.keys()][index] ?? null }
  removeItem(key: string) { this.values.delete(key) }
  setItem(key: string, value: string) { this.values.set(key, String(value)) }
  snapshot() { return [...this.values.entries()].sort(([a], [b]) => a.localeCompare(b)) }
}

let storage: MemoryStorage

beforeEach(() => {
  storage = new MemoryStorage()
  vi.stubGlobal('localStorage', storage)
  vi.stubGlobal('window', { localStorage: storage })
  setActivePinia(createPinia())
})
afterEach(() => vi.unstubAllGlobals())

const playToEnd = (
  store: ReturnType<typeof useGameStore>,
  choiceIds: string[],
) => {
  const visited: string[] = []
  let choiceIndex = 0
  let guard = 0
  while (store.inReplay) {
    if (guard++ > 160) throw new Error('黄金样板未收敛')
    if (store.state) visited.push(store.state.nodeId)
    if (store.choices.length) {
      const choiceId = choiceIds[choiceIndex++]
      if (!choiceId) throw new Error(`缺少第 ${choiceIndex} 个选择`)
      expect(store.choices.map((choice) => choice.id)).toContain(choiceId)
      store.choose(choiceId)
    } else {
      expect(store.advance()).toBe(true)
    }
  }
  expect(choiceIndex).toBe(choiceIds.length)
  return visited
}

const openingChoices = ['gs1-opening-serious', 'gs1-opening-together', 'gs1-opening-curious']
const nightChoices = ['gs1-night-grind', 'gs1-night-guide']
const kickChoices = ['gs1-kick-return', 'gs1-kick-together', 'gs1-kick-ask']
const stayChoices = ['gs1-stay-transparent', 'gs1-stay-quiet']
const worldChoices = ['gs1-world-silent', 'gs1-world-public']
const finalChoices = ['gs1-final-return', 'gs1-final-stay']

describe('黄金样板纯沙盒', () => {
  it('以独立 replay kind 启动并支持主动退出', () => {
    const store = useGameStore()
    store.startGoldenSliceReplay(goldenSliceCheckpoint, { playerName: '试玩员' })

    expect(store.inReplay).toBe(true)
    expect(store.inGoldenSliceReplay).toBe(true)
    expect(store.inChapterReplay).toBe(false)
    expect(store.inSupplementReplay).toBe(false)
    expect(store.inRomanceReplay).toBe(false)
    expect(store.state?.nodeId).toBe('gs1-s1-opening')

    expect(store.exitReplay()).toBe(true)
    expect(store.inReplay).toBe(false)
    expect(store.state).toBeNull()
  })

  // 全路径矩阵在共享 CI 机器上会明显慢于本地，为这条穷举测试保留独立预算。
  it('穷举 144 种选择组合，均能完成七场并兑现关键回响', () => {
    const store = useGameStore()
    let paths = 0

    for (const opening of openingChoices) {
      for (const night of nightChoices) {
        for (const kick of kickChoices) {
          for (const stay of stayChoices) {
            for (const world of worldChoices) {
              for (const finalChoice of finalChoices) {
                store.startGoldenSliceReplay(goldenSliceCheckpoint, { playerName: '矩阵测试' })
                const visited = playToEnd(store, [opening, night, kick, stay, world, finalChoice])
                paths += 1

                expect(visited).toContain(night === 'gs1-night-guide'
                  ? 'gs1-s3-guide-callback'
                  : 'gs1-s3-grind-callback')
                expect(visited.includes('gs1-s3-together-motive')).toBe(opening === 'gs1-opening-together')
                expect(visited.includes('gs1-s7-4999')).toBe(opening === 'gs1-opening-curious')
                expect(visited).toContain(world === 'gs1-world-public'
                  ? 'gs1-s6-public-shana'
                  : 'gs1-s6-silent-mentor')

                if (finalChoice === 'gs1-final-stay') {
                  expect(visited).toContain('gs1-s7-stay')
                } else if (world === 'gs1-world-public') {
                  expect(visited).toContain('gs1-s7-return-queue')
                  expect(visited).not.toContain('gs1-s7-return-accepted')
                } else {
                  expect(visited).toContain('gs1-s7-return-accepted')
                  expect(visited).not.toContain('gs1-s7-return-queue')
                }

                expect(store.state).toBeNull()
                expect(store.inReplay).toBe(false)
              }
            }
          }
        }
      }
    }

    expect(paths).toBe(144)
  }, 15_000)

  it('完整游玩前后所有本地存储和收藏逐字节不变', () => {
    const store = useGameStore()
    store.start({ playerName: '正式进度' })
    store.applyDebugEffects([
      { type: 'unlockCg', id: 'cg-before-gs1' },
      { type: 'unlockEnding', id: 'org2-end-before-gs1' },
    ])
    store.save('quick')
    store.returnToTitle()

    const storageBefore = storage.snapshot()
    const collectionBefore = JSON.stringify(store.collection)

    store.startGoldenSliceReplay(goldenSliceCheckpoint, { playerName: '隔离测试' })
    playToEnd(store, [
      'gs1-opening-curious',
      'gs1-night-guide',
      'gs1-kick-ask',
      'gs1-stay-quiet',
      'gs1-world-public',
      'gs1-final-return',
    ])

    expect(storage.snapshot()).toEqual(storageBefore)
    expect(JSON.stringify(store.collection)).toBe(collectionBefore)
    expect(store.collection.seenNodes.some((id) => id.startsWith('gs1-'))).toBe(false)
  })

  it('试玩中阻止保存、读取、关系剧情、支援和嵌套试玩', () => {
    const store = useGameStore()
    store.startGoldenSliceReplay(goldenSliceCheckpoint, { playerName: '守护测试' })
    store.advance()
    store.advance() // 到第一处选择

    expect(() => store.save('quick')).toThrow(/回放/)
    expect(() => store.load('auto')).toThrow(/回放/)
    expect(() => store.startRomanceEpisode('any')).toThrow(/回放/)
    expect(() => store.toggleSupport('heartbeat')).toThrow(/回放/)
    expect(() => store.startGoldenSliceReplay(goldenSliceCheckpoint, { playerName: '嵌套' })).toThrow(/返回标题/)
  })

  it('中途退出不写存储，且活动主线状态下拒绝覆盖启动', () => {
    const store = useGameStore()
    const before = storage.snapshot()
    store.startGoldenSliceReplay(goldenSliceCheckpoint, { playerName: '提前退出' })
    store.advance()
    store.exitReplay()
    expect(storage.snapshot()).toEqual(before)

    store.start({ playerName: '活动主线' })
    expect(() => store.startGoldenSliceReplay(goldenSliceCheckpoint, { playerName: '错误入口' })).toThrow(/返回标题/)
    expect(store.state?.nodeId).toBe(prologueCheckpoint.startNodeId)
  })
})
