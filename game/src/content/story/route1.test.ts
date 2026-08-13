import { describe, expect, it } from 'vitest'

import {
  applyEffects,
  availableChoices,
  commitChoice,
  createInitialGameState,
  enterNode,
  resolveTarget,
} from '@/engine/state'
import type { GameState, StoryNode } from '@/engine/types'

import { storyById } from './index'

const getNode = (id: string): StoryNode => {
  const result = storyById[id]
  if (!result) throw new Error(`测试找不到节点 ${id}`)
  return result
}

const routeStart = (extraFlags: string[] = []): GameState => {
  let state = createInitialGameState({ playerName: '一组测试' })
  state = applyEffects(state, [
    { type: 'route', route: 'org1', organization: 'org1', role: 'member' },
    { type: 'flag', key: 'joinedEstablishedOrg' },
    ...extraFlags.map((key) => ({ type: 'flag' as const, key })),
  ])
  return enterNode(state, getNode('r1-00-joined'))
}

// 真实引擎推进保证新增的短回应不仅静态连通，也会正确消费前序 flags。
const runRoute = (
  preferred: Record<string, string>,
  activePartner: GameState['activePartner'] = null,
) => {
  let state = routeStart()
  state.activePartner = activePartner
  const visited: string[] = []

  for (let step = 0; step < 100; step += 1) {
    const current = getNode(state.nodeId)
    visited.push(current.id)
    if (current.id === 'credits-first-season') return { state, visited }

    const choices = availableChoices(current, state)
    if (choices.length) {
      const choice = choices.find((item) => item.id === preferred[current.id]) ?? choices[0]
      const result = commitChoice(state, current, choice!.id)
      state = enterNode(result.state, getNode(result.next))
      continue
    }

    if (!current.next) throw new Error(`路线提前终止于 ${current.id}`)
    state = enterNode(state, getNode(resolveTarget(current.next, state)))
  }

  throw new Error('一组路线超过100步，可能存在循环')
}

const decisions = [
  ['r1-00-joined', ['r1-join-earn', 'r1-join-humble']],
  ['r1-03-world-enemy', ['r1-world-silence', 'r1-world-defend']],
  ['r1-05-fortress-hint', ['r1-grind-power', 'r1-intel-route']],
  ['r1-07-representation', ['r1-charter-yes', 'r1-charter-no']],
  ['r1-09-fortress-day', ['r1-fortress-hold', 'r1-fortress-flex']],
  ['r1-11-outsider-arrives', ['r1-vet-strict', 'r1-vet-trust']],
  ['r1-13-final-choice', ['r1-defend-order', 'r1-claim-voice']],
] as const

describe('一组路线选择回响', () => {
  it('保留六个章节回放入口与两个组织结局', () => {
    expect(getNode('r1-00-joined').onEnter).toEqual(expect.arrayContaining([
      { type: 'unlockCg', id: 'cg66-route1-join' },
    ]))
    expect(getNode('r1-09-fortress-day').onEnter).toEqual(expect.arrayContaining([
      { type: 'unlockCg', id: 'cg67-route1-fortress' },
    ]))
    expect(getNode('r1-end-order').onEnter).toEqual(expect.arrayContaining([
      { type: 'unlockEnding', id: 'r1-order' },
    ]))
    expect(getNode('r1-end-voice').onEnter).toEqual(expect.arrayContaining([
      { type: 'unlockEnding', id: 'r1-voice' },
    ]))
  })

  it.each([
    ['r1-00-joined', 'r1-join-earn', 'r1-00a-earn-reply'],
    ['r1-00-joined', 'r1-join-humble', 'r1-00b-humble-reply'],
    ['r1-03-world-enemy', 'r1-world-silence', 'r1-03a-silence-reply'],
    ['r1-03-world-enemy', 'r1-world-defend', 'r1-03b-defend-reply'],
    ['r1-05-fortress-hint', 'r1-grind-power', 'r1-05a-power-plan'],
    ['r1-05-fortress-hint', 'r1-intel-route', 'r1-05b-intel-plan'],
    ['r1-07-representation', 'r1-charter-yes', 'r1-07a-charter-reply'],
    ['r1-07-representation', 'r1-charter-no', 'r1-07b-silent-reply'],
    ['r1-09-fortress-day', 'r1-fortress-hold', 'r1-09a-hold-live'],
    ['r1-09-fortress-day', 'r1-fortress-flex', 'r1-09b-flex-live'],
    ['r1-11-outsider-arrives', 'r1-vet-strict', 'r1-11a-strict-ack'],
    ['r1-11-outsider-arrives', 'r1-vet-trust', 'r1-11b-trust-ack'],
    ['r1-13-final-choice', 'r1-defend-order', 'r1-13a-order-reply'],
    ['r1-13-final-choice', 'r1-claim-voice', 'r1-13b-voice-reply'],
  ])('%s 的选择 %s 先进入角色即时回应', (nodeId, choiceId, responseId) => {
    const choice = getNode(nodeId).choices?.find((item) => item.id === choiceId)
    expect(choice?.next).toBe(responseId)
    expect(getNode(responseId)).toMatchObject({ mode: expect.stringMatching(/chat|battle/) })
    expect(getNode(responseId).onEnter).toBeUndefined()
  })

  it('区分曾被换下、主动拒绝和没有学员记录的入组背景', () => {
    const resolveEntryEcho = (flags: string[]) => {
      const entry = getNode('r1-00-joined')
      const result = commitChoice(routeStart(flags), entry, 'r1-join-earn')
      const response = getNode(result.next)
      return resolveTarget(response.next!, result.state)
    }

    expect(resolveEntryEcho(['kickedFromGroupOne'])).toBe('r1-00c-replaced-echo')
    expect(resolveEntryEcho(['declinedGroupOneTrial'])).toBe('r1-00d-declined-echo')
    expect(resolveEntryEcho([])).toBe('r1-01-bottle-test')
  })

  it('穷举128种关键选择组合，均回收对应回应并抵达原组织结局', () => {
    for (let mask = 0; mask < 2 ** decisions.length; mask += 1) {
      const preferred: Record<string, string> = {}
      decisions.forEach(([nodeId, choices], index) => {
        preferred[nodeId] = choices[(mask >> index) & 1]!
      })

      const { state, visited } = runRoute(preferred)
      expect(visited.at(-1), String(mask)).toBe('credits-first-season')
      expect(visited, String(mask)).toContain('r1-14-epilogue')
      expect(visited, String(mask)).toContain(mask & 1 ? 'r1-00b-humble-reply' : 'r1-00a-earn-reply')
      expect(visited, String(mask)).toContain(mask & 2 ? 'r1-03b-defend-reply' : 'r1-03a-silence-reply')
      expect(visited, String(mask)).toContain(mask & 4 ? 'r1-08b-intel-ready' : 'r1-08a-power-ready')
      expect(visited, String(mask)).toContain(mask & 8 ? 'r1-10d-silent-echo' : 'r1-10c-charter-echo')
      expect(visited, String(mask)).toContain(mask & 16 ? 'r1-10b-flex-reward' : 'r1-10a-hold-reward')
      expect(visited, String(mask)).toContain(mask & 32 ? 'r1-12b-trust-outcome' : 'r1-12a-strict-outcome')
      expect(visited, String(mask)).toContain(mask & 2 ? 'r1-12c-public-voice-echo' : 'r1-12d-discipline-echo')

      const expectedEnding = mask & 64 ? 'r1-voice' : 'r1-order'
      expect(state.unlockedEndings, String(mask)).toContain(expectedEnding)
    }
  })

  it.each([
    ['r1-defend-order', 'r1-14-bond-order-record', 'r1-order'],
    ['r1-claim-voice', 'r1-14-bond-voice-record', 'r1-voice'],
  ])('祈福羁绊与组织选择 %s 同时结算', (finalChoice, recordNode, organizationEnding) => {
    const { state, visited } = runRoute({ 'r1-13-final-choice': finalChoice }, 'qifu')
    expect(visited).toContain('r1-14-bond-organization')
    expect(visited).toContain(recordNode)
    expect(visited).toContain('r1-end-bond-qifu')
    expect(state.unlockedEndings).toEqual(expect.arrayContaining([
      organizationEnding,
      'bond-qifu',
    ]))
  })
})
