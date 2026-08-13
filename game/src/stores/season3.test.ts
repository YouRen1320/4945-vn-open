import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { buildS3RecapOutcomeRecord } from '@/engine/season3-continuity'
import { readSeason2OutcomeArchive } from '@/engine/season2-storage'
import { readSeason3Save } from '@/engine/season3-storage'
import { readSeason3OutcomeArchive } from '@/engine/season3-outcome-storage'
import { SEASON3_EPISODES } from '@/content/season3/registry'
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

let storage: MemoryStorage
beforeEach(() => {
  storage = new MemoryStorage()
  vi.stubGlobal('localStorage', storage)
  vi.stubGlobal('window', { localStorage: storage })
  setActivePinia(createPinia())
})
afterEach(() => vi.unstubAllGlobals())

const complete = (store: ReturnType<typeof useGameStore>, response = 's3-demand-evidence') => {
  let guard = 0
  while (store.inSeason3) {
    if (guard++ > 500) throw new Error(`事件三未收敛：${store.state?.nodeId}`)
    if (store.choices.length) {
      const desired = store.state?.nodeId === 's3-prologue-first-response'
        ? store.choices.find((choice) => choice.id === response)
        : store.choices[0]
      store.choose(desired!.id)
    }
    else expect(store.advance()).toBe(true)
  }
}

describe('事件三 campaign', () => {
  it('从明确 recap 启动、独立保存并完整收束', () => {
    const store = useGameStore()
    store.startSeason3Recap({
      selection: { route: 'org4', endingKind: 'compromise', partner: 'yanqiu', createdAt: 10 },
      playerName: '事件三玩家', slot: '1', overwrite: false,
    })
    expect(store.inSeason3).toBe(true)
    expect(store.state?.nodeId).toBe('s3-prologue-entry')
    expect(store.state?.organizationName).toBe('镜花水月')
    expect(readSeason3Save('1')?.state.continuityProfile.activePartner).toBe('yanqiu')
    expect(readSeason2OutcomeArchive()).toHaveLength(1)

    complete(store, 's3-conditional-acceptance')
    expect(store.inSeason3).toBe(false)
    expect(store.state).toBeNull()
    expect(readSeason3Save('1')?.state.episodeCompletion).toEqual(
      Object.fromEntries(SEASON3_EPISODES.map((episode) => [episode.id, true])),
    )
    expect(readSeason3Save('1')?.state.variables.s3OpeningResponse).toBe('conditional')
    expect(readSeason3Save('1')?.state.flags.s3Complete).toBe(true)
    expect(readSeason3OutcomeArchive()).toHaveLength(1)
  })

  it('事件三写入不改变已有事件一、事件二和结局档案字节', () => {
    const store = useGameStore()
    storage.setItem('4945-vn:v4:save:1', 's1-source')
    storage.setItem('4945-vn:v5:save:2', 's2-source')
    storage.setItem('4945-vn:v1:outcomes', 's1-outcomes')
    const source = buildS3RecapOutcomeRecord({ route: 'org2', endingKind: 'triumph', partner: 'shana', createdAt: 20 })
    storage.setItem('4945-vn:v2:outcomes', JSON.stringify([source]))
    const protectedBefore = [...storage.values.entries()].filter(([key]) => (
      !key.startsWith('4945-vn:s3:') && key !== '4945-vn:v2:collection' && key !== '4945-vn:v1:s3-outcomes'
    ))

    store.startSeason3({ record: source, playerName: '隔离玩家', slot: '3', overwrite: false })
    complete(store, 's3-public-refusal')

    const protectedAfter = [...storage.values.entries()].filter(([key]) => (
      !key.startsWith('4945-vn:s3:') && key !== '4945-vn:v2:collection' && key !== '4945-vn:v1:s3-outcomes'
    ))
    expect(protectedAfter).toEqual(protectedBefore)
  })

  it('来源档案删除后仍可从事件三快照继续', () => {
    const store = useGameStore()
    const source = buildS3RecapOutcomeRecord({ route: 'org5', endingKind: 'compromise', partner: 'none', createdAt: 30 })
    store.startSeason3({ record: source, playerName: '快照玩家', slot: '1', overwrite: false })
    store.advance()
    store.returnToTitle()
    storage.removeItem('4945-vn:v2:outcomes')

    store.loadSeason3('1')
    expect(store.inSeason3).toBe(true)
    expect(store.state?.route).toBe('org5')
    expect(store.state?.organizationName).toBe('心之所向')
  })

  it('多个结局并存时全部列出，不自动替玩家选择', () => {
    const a = buildS3RecapOutcomeRecord({ route: 'org2', endingKind: 'triumph', partner: 'shana', createdAt: 10 })
    const b = buildS3RecapOutcomeRecord({ route: 'org4', endingKind: 'compromise', partner: 'yanqiu', createdAt: 20 })
    storage.setItem('4945-vn:v2:outcomes', JSON.stringify([a, b]))
    const store = useGameStore()
    expect(store.scanSeason2OutcomesForSeason3().map((record) => record.recordId)).toEqual([b.recordId, a.recordId])
    expect(store.season3Saves).toEqual([])
  })

  it('已发布的序章完成档升级后直接进入七十二小时，不要求重开', () => {
    const source = buildS3RecapOutcomeRecord({ route: 'org3', endingKind: 'triumph', partner: 'heartbeat', createdAt: 40 })
    const store = useGameStore()
    store.startSeason3({ record: source, playerName: '旧序章玩家', slot: '2', overwrite: false })
    while (store.state?.nodeId !== 's3-72h-entry') {
      if (store.choices.length) store.choose(store.choices[0]!.id)
      else store.advance()
    }
    store.returnToTitle()
    const key = '4945-vn:s3:save:2'
    const old = JSON.parse(storage.getItem(key)!)
    old.state.nodeId = 's3-prologue-exit'
    old.state.episodeCompletion = { 's3-prologue': true }
    storage.setItem(key, JSON.stringify(old))

    store.loadSeason3('2')
    expect(store.state?.nodeId).toBe('s3-72h-entry')
    expect(store.state?.variables.s3OpeningResponse).toBeTruthy()
  })
})
