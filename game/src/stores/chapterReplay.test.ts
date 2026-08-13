import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { storyById } from '@/content/story'
import { prologueCheckpoint, replayCheckpoints } from '@/content/replayCheckpoints'
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

// 找一个主图里直接 next 到季终的节点，用来验证“抵达季终自动退出”。
const creditsPrecursor = Object.values(storyById).find(
  (node) => typeof node.next === 'string' && node.next === 'credits-first-season',
)

beforeEach(() => {
  const storage = new MemoryStorage()
  vi.stubGlobal('localStorage', storage)
  vi.stubGlobal('window', { localStorage: storage })
  setActivePinia(createPinia())
})
afterEach(() => vi.unstubAllGlobals())

describe('2.0 章节沙盒回放', () => {
  it('从标题沙盒启动共通序章，route/org 为空且进入正确节点', () => {
    const store = useGameStore()
    store.startChapterReplay(prologueCheckpoint, { playerName: '回放员' })
    expect(store.inReplay).toBe(true)
    expect(store.inChapterReplay).toBe(true)
    expect(store.inRomanceReplay).toBe(false)
    expect(store.state?.nodeId).toBe('p00-opening')
    expect(store.state?.route).toBeNull()
    expect(store.state?.organization).toBeNull()
  })

  it('路线检查点按 route 注入 route/org，章节由入口节点定', () => {
    const store = useGameStore()
    const org2 = replayCheckpoints.find((c) => c.id === 'cp-org2-prologue')!
    store.startChapterReplay(org2, { playerName: '回放员' })
    expect(store.state?.route).toBe('org2')
    expect(store.state?.organization).toBe('org2')
    expect(store.state?.chapter).toBe('prologue')
    expect(store.state?.nodeId).toBe('r2-00-founded')
  })

  it('回放期间保存、读取、约会均被阻止', () => {
    const store = useGameStore()
    store.start({ playerName: '正常进度' })
    store.save('auto')
    store.startChapterReplay(prologueCheckpoint, { playerName: '回放员' })

    expect(() => store.save('quick')).toThrow(/回放/)
    expect(() => store.load('auto')).toThrow(/回放/)
    expect(() => store.startRomanceEpisode('any')).toThrow(/回放/)
  })

  it('隔离不变量：回放前后自动存档与收藏逐字节等价', () => {
    const store = useGameStore()
    store.start({ playerName: '正常进度' })
    // 制造一些会被回放触发的收藏/存档差异源，确保它们不被回放污染。
    store.applyDebugEffects([{ type: 'unlockCg', id: 'cg-isolation' }])
    store.save('auto')
    const beforeAuto = JSON.stringify(readSave('auto'))
    const beforeCollection = JSON.stringify(store.collection)

    store.startChapterReplay(prologueCheckpoint, { playerName: '回放员' })
    // 在沙盒里推进若干步，验证不会写回任何持久层。
    store.advance()
    store.exitReplay()

    expect(JSON.stringify(readSave('auto'))).toBe(beforeAuto)
    expect(JSON.stringify(store.collection)).toBe(beforeCollection)
  })

  it('主动退出章节回放清场且不残留回放会话', () => {
    const store = useGameStore()
    store.start({ playerName: '正常进度' })
    store.save('auto')
    store.startChapterReplay(prologueCheckpoint, { playerName: '回放员' })
    const exited = store.exitReplay()
    expect(exited).toBe(true)
    expect(store.inReplay).toBe(false)
    expect(store.inChapterReplay).toBe(false)
    expect(store.state).toBeNull()
  })

  it('抵达季终节点自动退出章节回放，回到标题态', () => {
    if (!creditsPrecursor) throw new Error('未找到指向季终的前置节点')
    const store = useGameStore()
    store.start({ playerName: '正常进度' })
    store.save('auto')
    store.startChapterReplay(prologueCheckpoint, { playerName: '回放员' })
    // 将沙盒当前节点移到季终前置节点，模拟玩家走到章节终点。
    if (!store.state) throw new Error('沙盒状态缺失')
    store.state = { ...store.state, nodeId: creditsPrecursor.id }
    store.advance()
    expect(store.inReplay).toBe(false)
    expect(store.state).toBeNull()
  })
})
