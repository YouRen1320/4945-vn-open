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
import { route4Nodes } from './route4'

const huayueNodeIds = new Set([
  'r4-06b-huayue-aftercare',
  'r4-06c-huayue-keeps-list',
  'r4-06d-huayue-stays',
  'r4-13b-huayue-night-duty',
  'r4-13c-huayue-sends-to-sleep',
  'r4-13d-huayue-shares-shift',
  'r4-21b-huayue-after-handoff',
  'r4-21c-huayue-sets-reminder',
  'r4-21d-huayue-takes-the-truth',
  'r4-24-bond-huayue',
])

const v15MemberNightIds = new Set([
  'r4-23-member-night-hub',
  'r4-23a-yanqiu-night',
  'r4-23b-yanqiu-reply',
  'r4-23c-huayue-night',
  'r4-23d-huayue-reply',
  'r4-23e-xuanmo-night',
  'r4-23f-xuanmo-reply',
  'r4-23g-takemehand-night',
  'r4-23h-takemehand-reply',
])

const p0ContinuityNodeIds = new Set([
  'r4-03c-takemehand-observed',
  'r4-06a-observation-hold',
  'r4-08a-observation-complete',
])

// 3.1.4 新增的选择回应与后续回响单独验收，不改变旧节点副作用指纹。
const narrativeEchoNodeIds = new Set([
  'r4-01c-public-ledger-reply', 'r4-01d-discretion-reply', 'r4-01e-member-vote-reply',
  'r4-05c-one-statement-reply', 'r4-05d-publish-record-reply', 'r4-05e-fight-back-reply',
  'r4-05f-response-echo-router', 'r4-05g-single-echo', 'r4-05h-record-echo',
  'r4-05i-fight-echo', 'r4-05j-membership-router',
  'r4-09c-external-groups-reply', 'r4-09d-old-group-reply', 'r4-09e-both-groups-reply',
  'r4-09f-external-groups-echo', 'r4-09g-old-group-echo', 'r4-09h-both-groups-echo',
  'r4-11c-formal-alliance-reply', 'r4-11d-one-night-reply', 'r4-11e-independent-reply',
  'r4-11f-formal-alliance-echo', 'r4-11g-one-night-echo', 'r4-11h-independent-echo',
  'r4-12c-secure-reply', 'r4-12d-support-reply', 'r4-12e-spectacle-reply',
  'r4-12f-secure-echo', 'r4-12g-support-echo', 'r4-12h-spectacle-echo',
  'r4-15b-public-ledger-memory', 'r4-15c-discretion-memory', 'r4-15d-member-vote-memory',
  'r4-16b-ledger-allocation-reply', 'r4-16c-takemehand-allocation-reply',
  'r4-16d-power-allocation-reply', 'r4-16e-vote-allocation-reply',
  'r4-17b-ledger-echo', 'r4-17c-takemehand-echo', 'r4-17d-power-echo', 'r4-17e-vote-echo',
])

// 轻量指纹锁定旧节点的效果、条件、入场副作用与CG映射，同时允许本次新增的桥接 next。
const stableFingerprint = (value: unknown) => {
  const source = JSON.stringify(value)
  let hash = 0x811c9dc5
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

const getNode = (id: string) => {
  const result = storyById[id]
  if (!result) throw new Error(`四组测试找不到节点 ${id}`)
  return result
}

const route4Start = (): GameState => {
  let state = createInitialGameState({ playerName: '四组见证人' })
  state = applyEffects(state, [
    { type: 'route', route: 'org4', organization: 'org4' },
    { type: 'stat', key: 'cohesion', operation: 'set', value: 2 },
    { type: 'stat', key: 'resources', value: 1 },
  ])
  return enterNode(state, getNode('r4-00-founded'))
}

type Witness = {
  state: GameState
  visited: string[]
  availableAt: Record<string, string[]>
  stateByNode: Map<string, GameState>
}

// 使用正式引擎的条件过滤、效果提交与节点进入流程，避免用静态图误判结局可达性。
const runWitness = (preferred: Record<string, string>): Witness => {
  let state = route4Start()
  const visited: string[] = []
  const availableAt: Record<string, string[]> = {}
  const stateByNode = new Map<string, GameState>()

  for (let step = 0; step < 100; step += 1) {
    const current = getNode(state.nodeId)
    visited.push(current.id)
    stateByNode.set(current.id, state)
    if (current.id === 'credits-first-season') return { state, visited, availableAt, stateByNode }

    const choices = availableChoices(current, state)
    if (choices.length) {
      availableAt[current.id] = choices.map((choice) => choice.id)
      const requested = preferred[current.id]
        ?? (current.id === 'r4-23-bond-router' ? 'keep-ordinary-relationship' : undefined)
      const choice = choices.find((item) => item.id === requested) ?? choices[0]
      const result = commitChoice(state, current, choice!.id)
      state = enterNode(result.state, getNode(result.next))
      continue
    }

    if (!current.next) throw new Error(`四组见证路径提前终止于 ${current.id}`)
    state = enterNode(state, getNode(resolveTarget(current.next, state)))
  }

  throw new Error('四组见证路径超过100步，可能存在循环')
}

describe('天上白玉京沉浸化路线', () => {
  const witnesses = {
    reversible: {
      expected: 'r4-end-reversible-rule',
      unlock: 'r4-reversible-rule',
      choices: {
        'r4-01-allocation-promise': 'public-ledger',
        'r4-03-application-ruling': 'accept-as-member',
        'r4-05-response': 'one-statement',
        'r4-06-private-aftermath': 'no-debt',
        'r4-09-group-policy': 'both-are-external',
        'r4-11-alliance-offer': 'formal-alliance',
        'r4-12-fortress-plan': 'secure-own-fortress',
        'r4-16-first-allocation': 'follow-published-rule',
        'r4-19-final-ruling': 'formal-revote',
      },
    },
    moderate: {
      expected: 'r4-end-moderate-exit',
      unlock: 'r4-moderate-exit',
      choices: {
        'r4-01-allocation-promise': 'leader-discretion',
        'r4-03-application-ruling': 'accept-after-record',
        'r4-05-response': 'publish-record',
        'r4-06-private-aftermath': 'no-debt',
        'r4-09-group-policy': 'recognize-old',
        'r4-11-alliance-offer': 'one-night-pact',
        'r4-12-fortress-plan': 'secure-own-fortress',
        'r4-16-first-allocation': 'award-core-power',
        'r4-19-final-ruling': 'publish-and-compensate',
      },
    },
    emptyRoom: {
      expected: 'r4-end-correct-accounts-empty-room',
      unlock: 'r4-correct-accounts-empty-room',
      choices: {
        'r4-01-allocation-promise': 'leader-discretion',
        'r4-03-application-ruling': 'observe-first',
        'r4-05-response': 'fight-back',
        'r4-06-private-aftermath': 'need-presence',
        'r4-09-group-policy': 'recognize-old',
        'r4-11-alliance-offer': 'stay-independent',
        'r4-12-fortress-plan': 'support-org5',
        'r4-16-first-allocation': 'award-core-power',
        'r4-19-final-ruling': 'hold-result',
      },
    },
    handoff: {
      expected: 'r4-end-voluntary-handoff',
      unlock: 'r4-voluntary-handoff',
      choices: {
        'r4-01-allocation-promise': 'member-vote',
        'r4-03-application-ruling': 'accept-as-member',
        'r4-05-response': 'one-statement',
        'r4-06-private-aftermath': 'need-presence',
        'r4-09-group-policy': 'join-both',
        'r4-11-alliance-offer': 'formal-alliance',
        'r4-12-fortress-plan': 'spectacle-first',
        'r4-16-first-allocation': 'open-revote',
        'r4-19-final-ruling': 'handoff-leadership',
      },
    },
  }

  const huayueRomanceChoices: Record<string, string> = {
    ...witnesses.reversible.choices,
    'r4-06b-huayue-aftercare': 'share-the-fear',
    'r4-13b-huayue-night-duty': 'stay-for-last-reply',
    'r4-21b-huayue-after-handoff': 'entrust-the-shaking-hands',
    'r4-23-bond-router': 'choose-huayue-bond',
  }

  const huayuePartialChoices: Record<string, string> = {
    ...witnesses.reversible.choices,
    'r4-06b-huayue-aftercare': 'share-the-fear',
    'r4-13b-huayue-night-duty': 'stay-for-last-reply',
    'r4-21b-huayue-after-handoff': 'leave-it-unspoken',
  }

  it.each(Object.entries(witnesses))('%s 见证路径由真实引擎抵达对应组织结局', (_, witness) => {
    const result = runWitness(witness.choices)
    expect(result.visited).toContain(witness.expected)
    expect(result.state.unlockedEndings).toContain(witness.unlock)
    expect(result.visited.at(-1)).toBe('credits-first-season')
    expect(result.visited.filter((id) => id.startsWith('r4-')).length).toBeGreaterThanOrEqual(36)
  })

  it('条件选项只在见证路径满足前置状态后由引擎放行', () => {
    const recorded = runWitness(witnesses.moderate.choices)
    expect(recorded.availableAt['r4-05-response']).toContain('publish-record')

    const ledger = runWitness(witnesses.reversible.choices)
    expect(ledger.availableAt['r4-16-first-allocation']).toContain('follow-published-rule')

    const noLedger = runWitness(witnesses.emptyRoom.choices)
    expect(noLedger.availableAt['r4-16-first-allocation']).not.toContain('follow-published-rule')
  })

  it('外群观察期不会提前把takemehand写进四组名单', () => {
    const accepted = runWitness(witnesses.reversible.choices)
    const observed = runWitness(witnesses.emptyRoom.choices)

    expect(accepted.visited).toEqual(expect.arrayContaining([
      'r4-03b-takemehand-enters',
      'r4-06-private-aftermath',
    ]))
    expect(accepted.visited).not.toContain('r4-03c-takemehand-observed')

    expect(observed.visited).toEqual(expect.arrayContaining([
      'r4-03c-takemehand-observed',
      'r4-06a-observation-hold',
      'r4-08a-observation-complete',
      'r4-09-group-policy',
    ]))
    expect(observed.visited).not.toContain('r4-03b-takemehand-enters')
    expect(observed.visited).not.toContain('r4-06-private-aftermath')
    expect(observed.stateByNode.get('r4-03c-takemehand-observed')?.flags.takemehandJoinedOrg4).toBe(false)
    expect(observed.stateByNode.get('r4-06a-observation-hold')?.flags.takemehandJoinedOrg4).toBe(false)
    expect(observed.stateByNode.get('r4-08a-observation-complete')?.flags.takemehandJoinedOrg4).toBe(true)
    expect(observed.state.flags.org4ProtectedTakemehand).not.toBe(true)
  })

  it('华月三次专属回应由真实状态引擎累积，并在不交出职位时抵达关系结局', () => {
    const result = runWitness(huayueRomanceChoices)

    expect(result.visited).toEqual(expect.arrayContaining([
      'r4-06d-huayue-stays',
      'r4-13d-huayue-shares-shift',
      'r4-21d-huayue-takes-the-truth',
      'r4-24-bond-huayue',
    ]))
    expect(result.state.flags.huayueSharedVulnerability).toBe(true)
    expect(result.state.flags.huayueSharedNightShift).toBe(true)
    expect(result.state.flags.huayueTrustedWithWeakness).toBe(true)
    expect(result.state.flags.org4VoluntaryHandoff).not.toBe(true)
    expect(result.state.relationships.huayue.trust).toBeGreaterThanOrEqual(6)
    expect(result.state.relationships.huayue.affinity).toBeGreaterThanOrEqual(6)
    expect(result.state.unlockedEndings).toContain('bond-huayue')
    expect(result.state.unlockedCgs).toContain('cg44-bond-huayue')
    // 华月线中蝴蝶效应"真心值"累积达标，触发"朝圣者"隐藏结局
    // 而非"可逆规则"路线原生结局。
    expect(result.visited).toContain('r4-end-pilgrim')
    expect(result.visited.at(-1)).toBe('credits-first-season')
  })

  it('少一次托付即使已有信任也不会误触华月关系结局', () => {
    const partial = runWitness(huayuePartialChoices)
    const neutral = runWitness(witnesses.handoff.choices)

    expect(partial.state.flags.huayueSharedVulnerability).toBe(true)
    expect(partial.state.flags.huayueSharedNightShift).toBe(true)
    expect(partial.state.flags.huayueTrustedWithWeakness).not.toBe(true)
    expect(partial.state.relationships.huayue.trust).toBeGreaterThanOrEqual(6)
    expect(partial.visited).not.toContain('r4-24-bond-huayue')
    expect(partial.state.unlockedEndings).not.toContain('bond-huayue')

    expect(neutral.state.flags.org4VoluntaryHandoff).toBe(true)
    expect(neutral.visited).not.toContain('r4-24-bond-huayue')
    expect(neutral.state.unlockedEndings).not.toContain('bond-huayue')
  })

  it('华月互动分散在前中后期，默认保留工作边界且每个选择立即得到她的回应', () => {
    const interactions = [
      {
        id: 'r4-06b-huayue-aftercare', neutral: 'keep-the-list-moving',
        neutralResponse: 'r4-06c-huayue-keeps-list', romanceResponse: 'r4-06d-huayue-stays', continuation: 'r4-07-fixed-facts',
      },
      {
        id: 'r4-13b-huayue-night-duty', neutral: 'sleep-after-handoff',
        neutralResponse: 'r4-13c-huayue-sends-to-sleep', romanceResponse: 'r4-13d-huayue-shares-shift', continuation: 'r4-14-merger-news',
      },
      {
        id: 'r4-21b-huayue-after-handoff', neutral: 'leave-it-unspoken',
        neutralResponse: 'r4-21c-huayue-sets-reminder', romanceResponse: 'r4-21d-huayue-takes-the-truth', continuation: 'r4-22-sixth-falls',
      },
    ]

    const romantic = runWitness(huayueRomanceChoices)
    const neutral = runWitness(witnesses.reversible.choices)
    for (const interaction of interactions) {
      const node = getNode(interaction.id)
      expect(node.choices).toHaveLength(2)
      expect(node.choices?.[0]?.id).toBe(interaction.neutral)
      expect(node.choices?.map((choice) => choice.next)).toEqual([
        interaction.neutralResponse,
        interaction.romanceResponse,
      ])

      for (const responseId of [interaction.neutralResponse, interaction.romanceResponse]) {
        const response = getNode(responseId)
        expect(response.speaker).toBe('huayue')
        expect(response.next).toBe(interaction.continuation)
      }

      expect(neutral.visited).toContain(interaction.neutralResponse)
      expect(romantic.visited).toContain(interaction.romanceResponse)
    }
  })

  it('关系候选由玩家显式选择，只显示满足原门槛的人和普通关系选项', () => {
    const router = getNode('r4-23-bond-router')
    expect(router.next).toBeUndefined()
    expect(router.choices).toEqual([
      {
        id: 'choose-huayue-bond',
        label: expect.any(String),
        tone: 'warm',
        condition: { type: 'all', conditions: [
        { type: 'flag', key: 'huayueSharedVulnerability' },
        { type: 'flag', key: 'huayueSharedNightShift' },
        { type: 'flag', key: 'huayueTrustedWithWeakness' },
        { type: 'relationshipProgress', character: 'huayue', operator: 'gte', value: 100 },
        { type: 'relationship', character: 'huayue', key: 'trust', operator: 'gte', value: 6 },
        { type: 'relationship', character: 'huayue', key: 'affinity', operator: 'gte', value: 6 },
        ] },
        effects: [],
        next: 'r4-24-bond-huayue',
      },
      {
        id: 'choose-yanqiu-bond',
        label: expect.any(String),
        tone: 'warm',
        condition: { type: 'all', conditions: [
          { type: 'flag', key: 'yanqiuStayed' },
          { type: 'relationshipProgress', character: 'yanqiu', operator: 'gte', value: 100 },
          { type: 'relationship', character: 'yanqiu', key: 'trust', operator: 'gte', value: 5 },
          { type: 'relationship', character: 'yanqiu', key: 'affinity', operator: 'gte', value: 1 },
        ] },
        effects: [],
        next: 'r4-24-bond-yanqiu',
      },
      {
        id: 'choose-takemehand-bond',
        label: expect.any(String),
        tone: 'warm',
        condition: { type: 'all', conditions: [
          { type: 'flag', key: 'org4ProtectedTakemehand' },
          { type: 'relationshipProgress', character: 'takemehand', operator: 'gte', value: 100 },
          { type: 'relationship', character: 'takemehand', key: 'trust', operator: 'gte', value: 5 },
          { type: 'relationship', character: 'takemehand', key: 'affinity', operator: 'gte', value: 3 },
        ] },
        effects: [],
        next: 'r4-24-bond-takemehand',
      },
      {
        id: 'keep-ordinary-relationship',
        label: expect.any(String),
        tone: 'calm',
        effects: [],
        next: 'r4-25-ending-router',
      },
    ])

    const qualified = runWitness(huayueRomanceChoices)
    expect(qualified.availableAt['r4-23-bond-router']).toEqual(expect.arrayContaining([
      'choose-huayue-bond', 'choose-yanqiu-bond', 'choose-takemehand-bond', 'keep-ordinary-relationship',
    ]))
    const ordinary = runWitness(witnesses.emptyRoom.choices)
    expect(ordinary.availableAt['r4-23-bond-router']).toEqual(['keep-ordinary-relationship'])
  })

  it('成员夜话覆盖砚秋水、华月、玄末之缘和takemehand，且每段选择后回应并回到hub', () => {
    const result = runWitness(witnesses.reversible.choices)
    const scenes = [
      ['r4-23a-yanqiu-night', 'r4-23b-yanqiu-reply', 'r4NightYanqiuSeen'],
      ['r4-23c-huayue-night', 'r4-23d-huayue-reply', 'r4NightHuayueSeen'],
      ['r4-23e-xuanmo-night', 'r4-23f-xuanmo-reply', 'r4NightXuanmoSeen'],
      ['r4-23g-takemehand-night', 'r4-23h-takemehand-reply', 'r4NightTakemehandSeen'],
    ] as const

    for (const [sceneId, responseId, flag] of scenes) {
      const scene = getNode(sceneId)
      expect(result.visited).toEqual(expect.arrayContaining([sceneId, responseId]))
      expect(scene.historical).toBe('fictional')
      expect(scene.choices).toHaveLength(2)
      expect(scene.choices?.every((choice) => choice.next === responseId)).toBe(true)
      expect(getNode(responseId).next).toBe('r4-23-member-night-hub')
      expect(result.state.flags[flag]).toBe(true)
    }
  })

  it('华月关系结局登记专属结局与CG，然后回到原组织结局路由', () => {
    const bond = getNode('r4-24-bond-huayue')
    expect(bond.presentation?.cg).toBe('/assets/cg/bond-huayue-v1.webp')
    expect(bond.presentation?.ui).toBe('cinematic')
    expect(bond.onEnter).toEqual([
      { type: 'flag', key: 'bondedHuayue' },
      { type: 'relationshipProgress', character: 'huayue', value: 100 },
      { type: 'unlockEnding', id: 'bond-huayue' },
      { type: 'unlockCg', id: 'cg44-bond-huayue' },
    ])
    expect(bond.next).toBe('r4-25-ending-router')
  })

  it('砚秋水与takemehand的旧达成路径迁移后仍可由显式选择解锁原结局', () => {
    const yanqiu = runWitness({
      ...witnesses.reversible.choices,
      'r4-23-bond-router': 'choose-yanqiu-bond',
    })
    const takemehand = runWitness({
      ...witnesses.reversible.choices,
      'r4-23-bond-router': 'choose-takemehand-bond',
    })

    expect(yanqiu.visited).toContain('r4-24-bond-yanqiu')
    expect(yanqiu.state.unlockedEndings).toContain('bond-yanqiu')
    expect(takemehand.visited).toContain('r4-24-bond-takemehand')
    expect(takemehand.state.unlockedEndings).toContain('bond-takemehand')
    expect(yanqiu.visited.at(-1)).toBe('credits-first-season')
    expect(takemehand.visited.at(-1)).toBe('credits-first-season')
  })

  it('v1.5显式关系迁移后，未改写的四组副作用与CG仍受冻结合同保护', () => {
    const legacyNodes = route4Nodes.filter((node) => !huayueNodeIds.has(node.id)
      && !v15MemberNightIds.has(node.id)
      && !p0ContinuityNodeIds.has(node.id)
      && !narrativeEchoNodeIds.has(node.id))
    const choiceContracts = legacyNodes.flatMap((node) => ((node as StoryNode).choices ?? []).map((choice) => ({
      node: node.id,
      id: choice.id,
      condition: choice.condition ?? null,
      effects: choice.effects ?? [],
    })))
    const enters = legacyNodes
      .map((node) => ({ id: node.id, onEnter: node.onEnter ?? [] }))
      .filter((entry) => entry.onEnter.length)
    const cgs = legacyNodes
      .map((node) => ({
        id: node.id,
        cg: node.presentation?.cg ?? null,
        unlocks: (node.onEnter ?? []).filter((effect) => effect.type === 'unlockCg'),
      }))
      .filter((entry) => entry.cg || entry.unlocks.length)

    // v1.5 有意新增九个成员夜话节点，并把旧关系入口统一迁移为100攻略值显式选择；
    // P0连续性修复只改写 observe-first 的矛盾 flag，其余旧选项副作用继续冻结。
    expect(route4Nodes).toHaveLength(108)
    expect(legacyNodes).toHaveLength(46)
    expect(choiceContracts).toHaveLength(32)
    expect(stableFingerprint(legacyNodes.map((node) => node.id))).toBe('5471bb42')
    expect(stableFingerprint(choiceContracts)).toBe('07c9b01d')
    expect(stableFingerprint(enters)).toBe('46e27d66')
    expect(stableFingerprint(cgs)).toBe('f70ca607')
  })

  it('选择不泄露后果，且每项决策后立即进入人物回应', () => {
    const choiceNodes = route4Nodes.filter((item) => item.choices?.length).map((item) => item as StoryNode)
    const choices = choiceNodes.flatMap((item) => item.choices ?? [])
    expect(choices.every((choice) => !choice.detail)).toBe(true)

    const directChoices = choices.filter((choice) => /[“”]|^(把|按住|关掉|@|只发|发出)/.test(choice.label))
    expect(directChoices.length / choices.length).toBeGreaterThanOrEqual(0.7)

    for (const current of choiceNodes) {
      for (const choice of current.choices ?? []) {
        expect(typeof choice.next, `${current.id}/${choice.id}`).toBe('string')
        if (typeof choice.next !== 'string') continue
        const response = getNode(choice.next)
        expect(['system', 'narrator'], `${current.id}/${choice.id} -> ${response.id}`).not.toContain(response.speaker)
      }
    }
  })

  it('系统与旁白低于四成，正文不暴露作者层术语', () => {
    const reports = route4Nodes.filter((item) => ['system', 'narrator'].includes(item.speaker))
    expect(reports.length / route4Nodes.length).toBeLessThan(0.4)

    const visibleText = route4Nodes
      .flatMap((item) => [item.actLabel, item.title ?? '', item.text, ...(item.choices ?? []).map((choice) => choice.label)])
      .join('\n')
    expect(visibleText).not.toMatch(/历史原点|局部改写|历史回声|默认历史|这条世界线|状态结算|玩家才/)
  })

  it('固定史实、组织名与跨组织日期保持清楚', () => {
    const text = route4Nodes.map((item) => item.text).join('\n')
    expect(getNode('r4-00-founded').text).toContain('天上白玉京')
    expect(getNode('r4-10-xilufei-burst').date).toBe('2026-07-20')
    expect(getNode('r4-10b-xilufei-leaves').date).toBe('2026-07-21')
    expect(text).toContain('岸是自己不想当高层')
    expect(text).toContain('原本只是普通成员的大古')
    expect(text).toContain('OguriC（小栗帽）与告白于7月26日加入三组')
    expect(text).toContain('告白去一组了')
    expect(text).toContain('只是一天没上线，也明确不想继续玩')
  })

  it('四组人物冲突使用立绘，7月28日两件事分镜且不混用CG', () => {
    const classicScenes = [
      'r4-02-muted-applicant',
      'r4-03b-takemehand-enters',
      'r4-03c-takemehand-observed',
      'r4-06a-observation-hold',
      'r4-08a-observation-complete',
      'r4-06-private-aftermath',
      'r4-10d-jiangjinjiu-leaves',
      'r4-11-alliance-offer',
      'r4-17-objection',
      'r4-18-yanqiu-answer',
      'r4-20-yanqiu-decision',
      'r4-21-yanqiu-stays',
    ]

    for (const id of classicScenes) {
      expect(getNode(id).presentation?.ui, id).toBe('classic')
      expect(getNode(id).presentation?.sprites?.length, id).toBeGreaterThan(0)
    }

    expect(getNode('r4-18-yanqiu-answer').presentation?.sprites).toEqual(expect.arrayContaining([
      expect.objectContaining({ character: 'yanqiu', expression: 'sad', position: 'left' }),
      expect.objectContaining({ character: 'takemehand', expression: 'concerned', position: 'right' }),
    ]))
    expect(getNode('r4-20-yanqiu-decision').presentation?.sprites).toEqual(expect.arrayContaining([
      expect.objectContaining({ character: 'huayue', position: 'left' }),
      expect.objectContaining({ character: 'yanqiu', position: 'right' }),
    ]))

    const xilufeiExit = getNode('r4-10b-xilufei-leaves')
    expect(xilufeiExit.presentation?.cg).toBe('/assets/cg/xilufei-exit-v1.webp')
    expect(xilufeiExit.onEnter).toContainEqual({ type: 'unlockCg', id: 'cg15-xilufei-exit' })

    const sixthHandoff = getNode('r4-22-sixth-falls')
    const chenyiExit = getNode('r4-22b-chenyi-exit')
    expect(sixthHandoff.next).toBe('r4-22b-chenyi-exit')
    expect(sixthHandoff.presentation?.cg).toBe('/assets/cg/yyt-avucii-handoff-v1.webp')
    expect(sixthHandoff.onEnter).toContainEqual({ type: 'unlockCg', id: 'cg40-yyt-avucii-handoff' })
    expect(chenyiExit.presentation?.cg).toBe('/assets/cg/chenyi-leaves-v1.webp')
    expect(chenyiExit.onEnter).toContainEqual({ type: 'unlockCg', id: 'cg32-chenyi-leaves' })

    for (const witness of Object.values(witnesses)) {
      expect(runWitness(witness.choices).visited).toContain('r4-22b-chenyi-exit')
    }
  })
})
