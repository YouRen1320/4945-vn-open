import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GAME_APP_VERSION } from '@/engine/state'
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

const V4_AUTO_SAVE_KEY = '4945-vn:v4:save:auto'
const V3_AUTO_SAVE_KEY = '4945-vn:v3:save:auto'
const MAIN_NODE_ID = 'p01-mentor-call'
const FIRST_DATE_ID = 'romance-shana-first-date'
const CONFESSION_ID = 'romance-shana-confession'
const DAILY_ID = 'romance-shana-daily'
const SECOND_DATE_ID = 'romance-shana-second-date'

let storage: MemoryStorage

beforeEach(() => {
  storage = new MemoryStorage()
  vi.stubGlobal('localStorage', storage)
  vi.stubGlobal('window', { localStorage: storage })
  setActivePinia(createPinia())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// Tests enter a real choice-bearing main-story node so the side-story return point
// exercises the same contract used by an in-progress play session.
const startAtMainChoice = () => {
  const store = useGameStore()
  store.start({ playerName: '夜市测试' })
  if (!store.state) throw new Error('测试开局失败')
  store.state.nodeId = MAIN_NODE_ID
  store.state.date = '2026-07-16'
  store.state.chapter = 'prologue'
  return store
}

const finishCurrentTwoStepEpisode = (store: ReturnType<typeof useGameStore>, choiceIndex = 0) => {
  const choice = store.choices[choiceIndex]
  if (!choice) throw new Error('约会入口缺少选择')
  store.choose(choice.id)
  expect(store.advance()).toBe(true)
}

const finishCurrentAfterStoryEpisode = (
  store: ReturnType<typeof useGameStore>,
  firstChoiceIndex = 0,
  secondChoiceIndex = 1,
) => {
  const firstChoice = store.choices[firstChoiceIndex]
  if (!firstChoice) throw new Error('关系续篇第一轮缺少选择')
  store.choose(firstChoice.id)
  expect(store.advance()).toBe(true)
  const secondChoice = store.choices[secondChoiceIndex]
  if (!secondChoice) throw new Error('关系续篇第二轮缺少选择')
  store.choose(secondChoice.id)
  expect(store.advance()).toBe(true)
  expect(store.advance()).toBe(true)
}

describe('约会入口与主线回程', () => {
  it('从有选择的主线节点记录返回点，并进入达到资格的首次约会', () => {
    const store = startAtMainChoice()
    if (!store.state) throw new Error('测试状态缺失')
    store.state.relationships.shana.progress = 30

    expect(store.choices.map((choice) => choice.id)).toContain('ask-growth')
    store.startRomanceEpisode(FIRST_DATE_ID)

    expect(store.state).toMatchObject({
      nodeId: FIRST_DATE_ID,
      date: '2026-07-16',
      chapter: 'prologue',
      variables: { romanceReturnNode: MAIN_NODE_ID },
    })
    expect(store.inRomanceScene).toBe(true)
    expect(readSave('auto')?.state).toMatchObject({
      nodeId: FIRST_DATE_ID,
      variables: { romanceReturnNode: MAIN_NODE_ID },
    })
  })

  it('拒绝未达资格、未知邀约与约会支线嵌套', () => {
    const lockedStore = startAtMainChoice()
    if (!lockedStore.state) throw new Error('测试状态缺失')
    lockedStore.state.relationships.shana.progress = 29

    expect(() => lockedStore.startRomanceEpisode(FIRST_DATE_ID)).toThrow(/达到30/)
    expect(lockedStore.state.nodeId).toBe(MAIN_NODE_ID)
    expect(lockedStore.state.variables.romanceReturnNode).toBeUndefined()
    expect(() => lockedStore.startRomanceEpisode('romance-missing-episode')).toThrow(/邀约不存在/)

    lockedStore.state.relationships.shana.progress = 30
    lockedStore.startRomanceEpisode(FIRST_DATE_ID)
    expect(() => lockedStore.startRomanceEpisode(CONFESSION_ID)).toThrow(/先完成正在进行的约会/)
    expect(lockedStore.state.nodeId).toBe(FIRST_DATE_ID)
  })

  it('首次约会结尾回到进入前的主线选择，并只结算一次完成奖励', () => {
    const store = startAtMainChoice()
    if (!store.state) throw new Error('测试状态缺失')
    store.state.relationships.shana.progress = 30
    const trustBefore = store.state.relationships.shana.trust
    const affinityBefore = store.state.relationships.shana.affinity

    store.startRomanceEpisode(FIRST_DATE_ID)
    finishCurrentTwoStepEpisode(store)
    expect(store.state?.nodeId).toBe(`${FIRST_DATE_ID}-complete`)
    expect(store.state?.relationships.shana).toMatchObject({
      progress: 50,
      trust: trustBefore + 1,
      affinity: affinityBefore + 1,
    })

    expect(store.advance()).toBe(true)
    expect(store.state).toMatchObject({
      nodeId: MAIN_NODE_ID,
      date: '2026-07-16',
      chapter: 'prologue',
    })
    expect(store.choices.map((choice) => choice.id)).toContain('ask-growth')
  })

  it('刷新并从V3检查点迁移约会状态后仍能返回原主线节点', () => {
    const firstSession = startAtMainChoice()
    if (!firstSession.state) throw new Error('测试状态缺失')
    firstSession.state.relationships.shana.progress = 30
    firstSession.startRomanceEpisode(FIRST_DATE_ID)

    // Simulate a refresh whose only usable checkpoint still carries the v1.5 schema.
    const record = JSON.parse(storage.getItem(V4_AUTO_SAVE_KEY) ?? 'null')
    if (!record?.state) throw new Error('自动存档尚未建立')
    record.schemaVersion = 3
    record.state.schemaVersion = 3
    record.state.appVersion = '1.5.0'
    Reflect.deleteProperty(record.state, 'activePartner')
    storage.setItem(V3_AUTO_SAVE_KEY, JSON.stringify(record))
    storage.removeItem(V4_AUTO_SAVE_KEY)

    setActivePinia(createPinia())
    const refreshedStore = useGameStore()
    refreshedStore.continueAutoSave()

    expect(refreshedStore.state).toMatchObject({
      schemaVersion: 4,
      appVersion: GAME_APP_VERSION,
      nodeId: FIRST_DATE_ID,
      variables: { romanceReturnNode: MAIN_NODE_ID },
    })
    finishCurrentTwoStepEpisode(refreshedStore, 1)
    expect(refreshedStore.advance()).toBe(true)
    expect(refreshedStore.state?.nodeId).toBe(MAIN_NODE_ID)
    expect(storage.getItem(V4_AUTO_SAVE_KEY)).not.toBeNull()
  })
})

describe('恋爱日常幂等结算', () => {
  it('同一恋爱日常可以重玩，但不会重复增加关系值', () => {
    const store = startAtMainChoice()
    if (!store.state) throw new Error('测试状态缺失')
    store.state.activePartner = 'shana'
    store.state.relationships.shana.progress = 100
    const before = { ...store.state.relationships.shana }

    store.startRomanceEpisode(DAILY_ID)
    expect(store.state.relationships.shana).toMatchObject({
      trust: before.trust + 1,
      affinity: before.affinity + 1,
    })
    finishCurrentTwoStepEpisode(store)
    expect(store.state.nodeId).toBe(MAIN_NODE_ID)
    const afterFirstDate = { ...store.state.relationships.shana }

    store.startRomanceEpisode(DAILY_ID)
    expect(store.state.relationships.shana).toEqual(afterFirstDate)
    finishCurrentTwoStepEpisode(store, 1)

    expect(store.state.nodeId).toBe(MAIN_NODE_ID)
    expect(store.state.relationships.shana).toEqual(afterFirstDate)
    expect(store.state.processedNodes.filter((nodeId) => nodeId === DAILY_ID)).toHaveLength(1)
  })
})

describe('v1.9 关系续篇与隔离回忆', () => {
  it('第二次约会两轮选择记录相处风格，公共结尾一次结算并安全回主线', () => {
    const store = startAtMainChoice()
    if (!store.state) throw new Error('测试状态缺失')
    store.state.activePartner = 'shana'
    store.state.relationships.shana.progress = 100
    const affinityBefore = store.state.relationships.shana.affinity

    store.startRomanceEpisode(SECOND_DATE_ID)
    expect(store.state.nodeId).toBe(SECOND_DATE_ID)
    finishCurrentAfterStoryEpisode(store, 0, 1)

    expect(store.state.nodeId).toBe(MAIN_NODE_ID)
    expect(store.state.flags.romanceAfterSecondDate_shana).toBe(true)
    expect(store.state.relationships.shana.affinity).toBe(affinityBefore + 1)
    expect(store.state.variables.romanceStyle_shana_pace).toBe('慢慢照顾彼此')
    expect(store.state.variables.romanceStyle_shana_care).toBe('尊重停留与退出')
    expect(readSave('auto')?.state.nodeId).toBe(MAIN_NODE_ID)
  })

  it('关系回忆在内存快照中重温，选择、奖励、收藏和自动存档全部复原', () => {
    const store = startAtMainChoice()
    if (!store.state) throw new Error('测试状态缺失')
    store.state.activePartner = 'shana'
    store.state.relationships.shana.progress = 100
    store.state.flags.romanceAfterSecondDate_shana = true
    store.state.variables.romanceStyle_shana_pace = '原有节奏'
    store.save('auto')
    const beforeState = JSON.parse(JSON.stringify(store.state))
    const beforeCollection = JSON.parse(JSON.stringify(store.collection))
    const beforeAutoSave = storage.getItem(V4_AUTO_SAVE_KEY)

    store.startRomanceReplay(SECOND_DATE_ID)
    expect(store.inRomanceReplay).toBe(true)
    expect(() => store.save('quick')).toThrow(/不会写入存档/)
    finishCurrentAfterStoryEpisode(store, 1, 0)

    expect(store.inRomanceReplay).toBe(false)
    expect(store.state).toEqual(beforeState)
    expect(store.collection).toEqual(beforeCollection)
    expect(storage.getItem(V4_AUTO_SAVE_KEY)).toBe(beforeAutoSave)
    expect(storage.getItem('4945-vn:v4:save:quick')).toBeNull()
  })

  it('中途退出关系回忆也恢复原节点和变量', () => {
    const store = startAtMainChoice()
    if (!store.state) throw new Error('测试状态缺失')
    store.state.activePartner = 'shana'
    store.state.flags.romanceAfterSecondDate_shana = true
    const before = JSON.parse(JSON.stringify(store.state))

    store.startRomanceReplay(SECOND_DATE_ID)
    store.choose(store.choices[0]!.id)
    expect(store.cancelRomanceReplay()).toBe(true)

    expect(store.inRomanceReplay).toBe(false)
    expect(store.state).toEqual(before)
    expect(store.cancelRomanceReplay()).toBe(false)
  })
})
