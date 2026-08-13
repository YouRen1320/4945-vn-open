import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { goldenSliceS2Checkpoint } from '@/content/goldenSliceS2Checkpoint'
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

const play = (store: ReturnType<typeof useGameStore>, choices: string[]) => {
  const visited: string[] = []
  let index = 0
  let guard = 0
  while (store.inReplay) {
    if (guard++ > 80) throw new Error('事件二样板未收敛')
    if (store.state) visited.push(store.state.nodeId)
    if (store.choices.length) store.choose(choices[index++]!)
    else expect(store.advance()).toBe(true)
  }
  expect(index).toBe(choices.length)
  return visited
}

describe('事件二黄金样板纯沙盒', () => {
  it.each([
    ['gs2-org-first', 'gs2-stand-firm', 'gs2-final-independent', 'gs2-27-org-echo', 'gs2-29-org-echo'],
    ['gs2-org-first', 'gs2-cut-losses', 'gs2-final-standard', 'gs2-27-org-echo', 'gs2-29-org-echo'],
    ['gs2-rel-first', 'gs2-stand-firm', 'gs2-final-seal', 'gs2-27-rel-echo', 'gs2-29-rel-echo'],
    ['gs2-rel-first', 'gs2-cut-losses', 'gs2-final-seal', 'gs2-27-rel-echo', 'gs2-29-rel-echo'],
  ])('完整路径 %s / %s 正确回收选择并退出', (first, second, final, midEcho, endingEcho) => {
    const store = useGameStore()
    store.startGoldenSliceReplay(goldenSliceS2Checkpoint, { playerName: '试玩员' })
    const visited = play(store, [first, second, final])
    expect(visited).toContain(midEcho)
    expect(visited).toContain(endingEcho)
    expect(store.state).toBeNull()
    expect(store.inReplay).toBe(false)
  })

  it('正式存储与收藏在完整试玩前后逐字节不变', () => {
    storage.setItem('4945-vn:v4:save:auto', '{"formal":true}')
    storage.setItem('4945-vn:v5:save:season2-1', '{"eventTwo":true}')
    storage.setItem('4945-vn:collection', '{"seenNodes":["formal"]}')
    storage.setItem('4945-vn:v2:outcomes', '[{"formal":true}]')
    setActivePinia(createPinia())
    const store = useGameStore()
    const before = storage.snapshot()
    const collectionBefore = JSON.stringify(store.collection)

    store.startGoldenSliceReplay(goldenSliceS2Checkpoint, { playerName: '隔离测试' })
    play(store, ['gs2-rel-first', 'gs2-cut-losses', 'gs2-final-seal'])

    expect(storage.snapshot()).toEqual(before)
    expect(JSON.stringify(store.collection)).toBe(collectionBefore)
    expect(store.collection.seenNodes.some((id) => id.startsWith('gs2-'))).toBe(false)
  })

  it('样板中阻止保存读取、支援、关系剧情和嵌套回放', () => {
    const store = useGameStore()
    store.startGoldenSliceReplay(goldenSliceS2Checkpoint, { playerName: '守护测试' })
    expect(() => store.save('quick')).toThrow(/回放/)
    expect(() => store.load('auto')).toThrow(/回放/)
    expect(() => store.toggleSupport('heartbeat')).toThrow(/回放/)
    expect(() => store.startRomanceEpisode('any')).toThrow(/回放/)
    expect(() => store.startGoldenSliceReplay(goldenSliceS2Checkpoint, { playerName: '嵌套' })).toThrow(/返回标题/)
  })
})
