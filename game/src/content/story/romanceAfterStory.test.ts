import { describe, expect, it } from 'vitest'

import { romanceCandidates } from '@/content/characters'
import { romanceAfterEpisodeKinds, romanceStyleAxes, romanceStyleVariable } from '@/content/romanceAfterStoryTypes'
import {
  getRomanceAction,
  getRomanceAvailability,
  romanceProfiles,
} from '@/content/romanceProfiles'
import { romanceAfterStoryNodes } from '@/content/story/romanceAfterStory'
import { storyById, validateStoryGraph } from '@/content/story'
import { createInitialGameState } from '@/engine/state'

const getNode = (id: string) => {
  const node = storyById[id]
  if (!node) throw new Error(`测试缺少节点：${id}`)
  return node
}

describe('v1.9 关系续篇剧情合同', () => {
  it('12条路线各有第二次约会、矛盾、和解三段共21个节点且全图无断链', () => {
    expect(romanceAfterStoryNodes).toHaveLength(12 * 21)
    expect(validateStoryGraph()).toEqual([])

    for (const character of romanceCandidates) {
      const nodes = romanceAfterStoryNodes.filter((node) => node.id.startsWith(`romance-${character}-`))
      expect(nodes, character).toHaveLength(21)
      expect(nodes.every((node) => node.sideStory === 'romance')).toBe(true)
      expect(nodes.every((node) => node.historical === 'fictional')).toBe(true)
      expect(nodes.every((node) => node.chapter === 'epilogue')).toBe(true)
    }
  })

  it('每段有两轮等价二选一，选择只记录不同相处风格，公共收束才结算', () => {
    for (const character of romanceCandidates) {
      const profile = romanceProfiles[character]
      const entries = {
        secondDate: profile.secondDateNodeId,
        conflict: profile.conflictNodeId,
        reconciliation: profile.reconciliationNodeId,
      }

      for (const kind of romanceAfterEpisodeKinds) {
        const entryId = entries[kind]
        const entry = getNode(entryId)
        const middle = getNode(`${entryId}-middle`)
        const complete = getNode(`${entryId}-complete`)
        const [firstAxis, secondAxis] = romanceStyleAxes[kind]

        expect(entry.choices, entryId).toHaveLength(2)
        expect(middle.choices, `${entryId}-middle`).toHaveLength(2)
        expect(entry.choices?.map((choice) => choice.tone).every(Boolean)).toBe(true)
        expect(middle.choices?.map((choice) => choice.tone).every(Boolean)).toBe(true)

        const firstValues = entry.choices?.map((choice) => choice.effects?.[0]).filter(Boolean) ?? []
        const secondValues = middle.choices?.map((choice) => choice.effects?.[0]).filter(Boolean) ?? []
        expect(firstValues).toHaveLength(2)
        expect(secondValues).toHaveLength(2)
        expect(firstValues.every((effect) => (
          effect?.type === 'variable'
          && effect.key === romanceStyleVariable(character, firstAxis)
        ))).toBe(true)
        expect(secondValues.every((effect) => (
          effect?.type === 'variable'
          && effect.key === romanceStyleVariable(character, secondAxis)
        ))).toBe(true)
        expect(new Set(firstValues.map((effect) => effect?.type === 'variable' && effect.value)).size).toBe(2)
        expect(new Set(secondValues.map((effect) => effect?.type === 'variable' && effect.value)).size).toBe(2)
        expect(complete.onEnter?.some((effect) => effect.type === 'flag')).toBe(true)
        expect(complete.next).toEqual({
          type: 'stateVariable',
          key: 'romanceReturnNode',
          fallback: 'credits-first-season',
        })
      }
    }
  })

  it('伴侣按第二次约会→矛盾→和解→日常推荐，旧日常资格仍保留', () => {
    for (const character of romanceCandidates) {
      const state = createInitialGameState({ playerName: `续篇-${character}` })
      const profile = romanceProfiles[character]
      state.activePartner = character
      state.relationships[character].progress = 100

      expect(getRomanceAvailability(state, character)).toMatchObject({
        canSecondDate: true,
        canConflict: false,
        canReconcile: false,
        canDaily: true,
      })
      expect(getRomanceAction(profile, state)).toMatchObject({ kind: 'secondDate', nodeId: profile.secondDateNodeId })

      state.flags[profile.secondDateFlag] = true
      expect(getRomanceAction(profile, state)).toMatchObject({ kind: 'conflict', nodeId: profile.conflictNodeId })
      state.flags[profile.conflictFlag] = true
      expect(getRomanceAction(profile, state)).toMatchObject({ kind: 'reconciliation', nodeId: profile.reconciliationNodeId })
      state.flags[profile.reconciliationFlag] = true
      expect(getRomanceAction(profile, state)).toMatchObject({ kind: 'daily', nodeId: profile.dailyNodeId })
    }
  })
})
