import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { readSave } from '@/engine/storage'

import { useGameStore } from './game'

import type { SaveSlot } from '@/engine/storage'

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

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('游戏 store 的读档刷新契约', () => {
  it('读入同一节点也递增 sceneRevision 并替换当前快照', () => {
    const store = useGameStore()
    store.start({ playerName: '同节点读档' })
    if (!store.state) throw new Error('测试开局失败')

    store.state.variables.snapshotMarker = '槽位版本'
    store.save('1')
    store.state.variables.snapshotMarker = '当前版本'
    const revisionBeforeLoad = store.sceneRevision
    const nodeBeforeLoad = store.state.nodeId

    store.load('1')

    expect(store.state?.nodeId).toBe(nodeBeforeLoad)
    expect(store.state?.variables.snapshotMarker).toBe('槽位版本')
    expect(store.sceneRevision).toBe(revisionBeforeLoad + 1)
  })

  it.each<SaveSlot>(['quick', '1', '2', '3', '4', '5', '6'])('从 %s 槽读入后同步当前会话到自动槽', (slot) => {
    const store = useGameStore()
    store.start({ playerName: `读取${slot}` })
    if (!store.state) throw new Error('测试开局失败')

    // Marker proves auto receives the loaded snapshot, rather than the state that existed immediately before load.
    store.state.variables.loadedFrom = slot
    store.save(slot)
    store.state.variables.loadedFrom = '未同步'
    store.load(slot)

    const auto = readSave('auto')
    expect(auto?.state.nodeId).toBe(store.state?.nodeId)
    expect(auto?.state.variables.loadedFrom).toBe(slot)
    expect(auto?.state.playerName).toBe(`读取${slot}`)
  })
})
