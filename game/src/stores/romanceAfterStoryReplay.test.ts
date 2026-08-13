import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { romanceCandidates } from '@/content/characters'
import { romanceAfterEpisodeKinds, romanceStyleAxes, romanceStyleVariable } from '@/content/romanceAfterStoryTypes'
import { romanceProfiles, type RomanceCandidateId } from '@/content/romanceProfiles'
import { useGameStore } from '@/stores/game'
import { readSave } from '@/engine/storage'

import type { RomanceAfterEpisodeKind } from '@/content/romanceAfterStoryTypes'

const V4_AUTO_SAVE_KEY = '4945-vn:v4:save:auto'
const QUICK_SAVE_KEY = '4945-vn:v4:save:quick'
const MAIN_NODE_ID = 'p01-mentor-call'

class MemoryStorage implements Storage {
  readonly values = new Map<string, string>()

  get length() { return this.values.size }
  clear() { this.values.clear() }
  getItem(key: string) { return this.values.get(key) ?? null }
  key(index: number) { return [...this.values.keys()][index] ?? null }
  removeItem(key: string) { this.values.delete(key) }
  setItem(key: string, value: string) { this.values.set(key, String(value)) }
}

const FLAG_KEY: Record<RomanceAfterEpisodeKind, 'secondDateFlag' | 'conflictFlag' | 'reconciliationFlag'> = {
  secondDate: 'secondDateFlag',
  conflict: 'conflictFlag',
  reconciliation: 'reconciliationFlag',
}
const NODE_KEY: Record<RomanceAfterEpisodeKind, 'secondDateNodeId' | 'conflictNodeId' | 'reconciliationNodeId'> = {
  secondDate: 'secondDateNodeId',
  conflict: 'conflictNodeId',
  reconciliation: 'reconciliationNodeId',
}

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

const startAtMainChoice = () => {
  const store = useGameStore()
  store.start({ playerName: '回忆隔离测试' })
  if (!store.state) throw new Error('测试开局失败')
  store.state.nodeId = MAIN_NODE_ID
  store.state.date = '2026-07-16'
  store.state.chapter = 'prologue'
  return store
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

// PLAN-1.7-2.0 §5.3 要求：回忆不污染 processedNodes / seenNodes / 收藏 / 存档，且不重复结算关系值。
// 既有单测仅覆盖 shana 的二次约会。这里把隔离契约扩展到全部 12 名候选人的三段续篇。
describe('v1.9 关系回忆隔离覆盖全部路线与阶段', () => {
  for (const character of romanceCandidates) {
    const profile = romanceProfiles[character]
    describe(character, () => {
      for (const kind of romanceAfterEpisodeKinds) {
        it(`${kind} 回忆结束后状态、收藏与自动存档完全复原且不重复结算`, () => {
          const store = startAtMainChoice()
          if (!store.state) throw new Error('测试状态缺失')
          store.state.activePartner = character
          store.state.relationships[character].progress = 100
          store.state.flags[profile[FLAG_KEY[kind]]] = true
          // 预置已知风格变量，用于侦测回忆是否错误覆盖或重复结算。
          const [firstAxis] = romanceStyleAxes[kind]
          store.state.variables[romanceStyleVariable(character, firstAxis)] = '回忆前的已知值'
          store.save('auto')
          const beforeState = JSON.parse(JSON.stringify(store.state))
          const beforeAutoSave = storage.getItem(V4_AUTO_SAVE_KEY)

          store.startRomanceReplay(profile[NODE_KEY[kind]])
          expect(store.inRomanceReplay).toBe(true)
          // 回忆进行中禁止写入任何存档槽。
          expect(() => store.save('quick')).toThrow(/不会写入存档/)
          finishCurrentAfterStoryEpisode(store, 1, 0)

          expect(store.inRomanceReplay).toBe(false)
          // 状态整体复原：processedNodes / seenNodes / 关系值 / 风格变量均未被回忆改动。
          expect(store.state).toEqual(beforeState)
          expect(storage.getItem(V4_AUTO_SAVE_KEY)).toBe(beforeAutoSave)
          expect(storage.getItem(QUICK_SAVE_KEY)).toBeNull()
        })
      }
    })
  }

  it('未完成的关系续篇阶段不能进入回忆', () => {
    const store = startAtMainChoice()
    if (!store.state) throw new Error('测试状态缺失')
    store.state.activePartner = 'shana'
    store.state.relationships.shana.progress = 100
    expect(() => store.startRomanceReplay(romanceProfiles.shana.secondDateNodeId))
      .toThrow(/尚未完成/)
  })
})

// PLAN-1.7-2.0 §5.4 验收：关系续篇结算必须幂等——每个阶段只结算一次，
// 重玩（回忆）不重复增加 affinity/trust，processedNodes 中该收束节点仅出现一次。
// 既有单测仅以 shana 示范，这里把结算幂等契约扩展到全部 12 名候选人的三段续篇。
describe('v1.9 关系续篇结算幂等覆盖全部路线与阶段', () => {
  const AFTER_KINDS: RomanceAfterEpisodeKind[] = ['secondDate', 'conflict', 'reconciliation']
  const KIND_FLAG: Record<RomanceAfterEpisodeKind, 'secondDateFlag' | 'conflictFlag' | 'reconciliationFlag'> = {
    secondDate: 'secondDateFlag',
    conflict: 'conflictFlag',
    reconciliation: 'reconciliationFlag',
  }
  // 与 romanceAfterStory.ts 中 completionEffects 的契约保持一致（二次约会+affinity、矛盾+trust、和解+trust+affinity）。
  const SETTLEMENT_DELTA: Record<RomanceAfterEpisodeKind, { affinity: number; trust: number }> = {
    secondDate: { affinity: 1, trust: 0 },
    conflict: { affinity: 0, trust: 1 },
    reconciliation: { affinity: 1, trust: 1 },
  }

  const setupPrecondition = (
    store: ReturnType<typeof useGameStore>,
    character: RomanceCandidateId,
    kind: RomanceAfterEpisodeKind,
  ) => {
    const state = store.state
    if (!state) throw new Error('测试状态缺失')
    const profile = romanceProfiles[character]
    state.activePartner = character
    state.relationships[character].progress = 100
    // 把目标阶段之前的所有阶段标记为已完成，使目标阶段成为当前可执行的下一个动作。
    const targetIndex = AFTER_KINDS.indexOf(kind)
    AFTER_KINDS.forEach((k, index) => {
      state.flags[profile[KIND_FLAG[k]]] = index < targetIndex
    })
  }

  for (const character of romanceCandidates) {
    describe(character, () => {
      for (const kind of AFTER_KINDS) {
        it(`${kind} 首次结算只加一次关系值，重玩回忆不重复结算`, () => {
          const store = startAtMainChoice()
          const state = store.state
          if (!state) throw new Error('测试状态缺失')
          setupPrecondition(store, character, kind)
          const profile = romanceProfiles[character]
          const entryNodeId = profile[NODE_KEY[kind]]
          const completeNodeId = `${entryNodeId}-complete`
          // 进入前快照（数值为原始类型，enter() 重赋值 state.value 不影响这些值）。
          const affinityBefore = state.relationships[character].affinity
          const trustBefore = state.relationships[character].trust

          store.startRomanceEpisode(entryNodeId)
          // 此后 store.state 会被 enter() 重赋值，必须用 store.state! 实时读取。
          expect(store.state!.nodeId).toBe(entryNodeId)
          finishCurrentAfterStoryEpisode(store, 0, 1)

          // 收束后回到进入前的主线节点。
          expect(store.state!.nodeId).toBe(MAIN_NODE_ID)
          expect(store.state!.flags[profile[KIND_FLAG[kind]]]).toBe(true)
          // 关系结算恰好一次，且增量与契约一致。
          const delta = SETTLEMENT_DELTA[kind]
          expect(store.state!.relationships[character].affinity).toBe(affinityBefore + delta.affinity)
          expect(store.state!.relationships[character].trust).toBe(trustBefore + delta.trust)
          // 收束节点在 processedNodes 中只出现一次——这正是 enterNode 的 firstEntry 守卫。
          expect(store.state!.processedNodes.filter((nodeId) => nodeId === completeNodeId)).toHaveLength(1)
          // 两段二选一均记录风格变量（双轴落库），不污染主线选择。
          const [firstAxis, secondAxis] = romanceStyleAxes[kind]
          expect(store.state!.variables[romanceStyleVariable(character, firstAxis)]).toBeTypeOf('string')
          expect(store.state!.variables[romanceStyleVariable(character, secondAxis)]).toBeTypeOf('string')
          expect(readSave('auto')?.state.nodeId).toBe(MAIN_NODE_ID)

          // 重玩（回忆）应完全隔离：关系值与 processedNodes 计数均不变。
          const affinityAfterSettle = store.state!.relationships[character].affinity
          const trustAfterSettle = store.state!.relationships[character].trust
          const processedCount = store.state!.processedNodes.filter((nodeId) => nodeId === completeNodeId).length

          store.startRomanceReplay(entryNodeId)
          expect(store.inRomanceReplay).toBe(true)
          expect(() => store.save('quick')).toThrow(/不会写入存档/)
          finishCurrentAfterStoryEpisode(store, 1, 0)

          expect(store.inRomanceReplay).toBe(false)
          expect(store.state!.relationships[character].affinity).toBe(affinityAfterSettle)
          expect(store.state!.relationships[character].trust).toBe(trustAfterSettle)
          expect(store.state!.processedNodes.filter((nodeId) => nodeId === completeNodeId)).toHaveLength(processedCount)
        })
      }
    })
  }
})
