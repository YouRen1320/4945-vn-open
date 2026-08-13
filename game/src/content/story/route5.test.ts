import { describe, expect, it } from 'vitest'

import {
  availableChoices,
  commitChoice,
  createInitialGameState,
  enterNode,
  resolveTarget,
} from '@/engine/state'
import type { GameState, NodeTarget, StoryNode } from '@/engine/types'

import { prologueNodes } from './prologue'
import { route5Nodes } from './route5'

const nodes: StoryNode[] = route5Nodes
const byId = Object.fromEntries(nodes.map((node) => [node.id, node])) as Record<string, StoryNode>

const addedScenes = [
  'r5-01a-empty-seat-chat',
  'r5-03a-gaobai-first-shift',
  'r5-04a-cropped-screenshot',
  'r5-05a-stance-posted',
  'r5-07a-kicked-window',
  'r5-09c-after-exit',
  'r5-10a-war-table',
  'r5-11a-roll-call',
  'r5-13a-final-order',
  'r5-14a-after-report',
  'r5-17a-jianwen-handover',
  'r5-19a-two-roster-rows',
  'r5-20-member-night-hub',
  'r5-20a-wenxian-night',
  'r5-20b-wenxian-reply',
  'r5-20c-gaobai-night',
  'r5-20d-gaobai-reply',
  'r5-20e-jianwen-night',
  'r5-20f-jianwen-reply',
] as const

const p0StanceScenes = [
  'r5-05b-principled-reply',
  'r5-05c-backed-org1',
  'r5-05d-stayed-silent',
  'r5-07b-neutral-echo',
  'r5-07c-org1-echo',
  'r5-07d-silent-echo',
] as const

const expectedStanceScenes = (plan: RoutePlan) => {
  if (plan.choices.includes('principled-neutral')) return ['r5-05b-principled-reply', 'r5-07b-neutral-echo']
  if (plan.choices.includes('back-org1')) return ['r5-05c-backed-org1', 'r5-07c-org1-echo']
  return ['r5-05d-stayed-silent', 'r5-07d-silent-echo']
}

const getNode = (id: string) => {
  const node = byId[id]
  if (!node) throw new Error(`测试找不到节点 ${id}`)
  return node
}

const targets = (target: NodeTarget | undefined): string[] => {
  if (!target) return []
  if (typeof target === 'string') return [target]
  if (target.type === 'stateVariable') return [target.fallback]
  return [...target.cases.map((item) => item.next), target.fallback]
}

const exits = (node: StoryNode) => [
  ...targets(node.next),
  ...(node.choices ?? []).flatMap((choice) => targets(choice.next)),
]

type RoutePlan = {
  name: string
  ending: string
  organizationEnding: string
  choices: string[]
  bond?: boolean
  nightVariant?: 'first' | 'second'
}

type RouteReplay = {
  state: GameState
  path: string[]
  availableChoices: Set<string>
}

const routePlans: RoutePlan[] = [
  {
    name: '火2战败后继续独立',
    ending: 'r5-end-still-here',
    organizationEnding: 'r5-still-here',
    choices: [
      'quietly-update-roster',
      'keep-seat-open',
      'stay-silent',
      'follow-old-group',
      'approve-glory',
      'fight-fire-two',
      'allow-personal-transfer',
      'give-operational-control',
    ],
  },
  {
    name: '反对转组但个人申请仍然生效',
    ending: 'r5-end-still-here',
    organizationEnding: 'r5-still-here',
    choices: [
      'quietly-update-roster',
      'keep-seat-open',
      'stay-silent',
      'follow-old-group',
      'approve-glory',
      'fight-fire-two',
      'refuse-transfer',
      'give-operational-control',
    ],
  },
  {
    name: '避开火2并建立保护协议',
    ending: 'r5-end-protected-flower',
    organizationEnding: 'r5-protected-flower',
    bond: true,
    nightVariant: 'second',
    choices: [
      'friendly-farewell',
      'trial-role',
      'principled-neutral',
      'own-announcement-source',
      'member-vote-fire-two',
      'withdraw-before-start',
      'conditional-alliance',
      'stay-together',
    ],
  },
  {
    name: '满足条件后奇袭火2',
    ending: 'r5-end-fire-two-proof',
    organizationEnding: 'r5-fire-two-proof',
    choices: [
      'friendly-farewell',
      'appoint-gaobai',
      'principled-neutral',
      'own-announcement-source',
      'approve-with-threshold',
      'counter-plan',
      'allow-personal-transfer',
      'give-operational-control',
    ],
  },
  {
    name: '换标后提交全并申请',
    ending: 'r5-end-name-only',
    organizationEnding: 'r5-name-only',
    choices: [
      'call-disloyalty',
      'keep-seat-open',
      'back-org1',
      'follow-new-group',
      'change-target',
      'full-merge-org3',
      'admit-exhaustion',
    ],
  },
]

// 见证路径从真实序章入口开始，完整执行节点副作用、条件选项和条件路由。
const replayRoutePlan = (plan: RoutePlan): RouteReplay => {
  const routeChoiceNode = (prologueNodes as StoryNode[]).find((node) => node.id === 'p10-route-choice')
  if (!routeChoiceNode) throw new Error('测试找不到五组入口选择节点')

  const prologueState = enterNode(createInitialGameState({ playerName: '验收玩家' }), routeChoiceNode)
  const routeEntry = commitChoice(prologueState, routeChoiceNode, 'lead-org5')
  if (routeEntry.next !== 'r5-00-founded') throw new Error(`五组入口错误地指向 ${routeEntry.next}`)

  let state = enterNode(routeEntry.state, getNode(routeEntry.next))
  const path = [state.nodeId]
  const witnessed = new Set<string>()
  let choiceCursor = 0

  for (let guard = 0; guard < 100; guard += 1) {
    const node = getNode(state.nodeId)
    if (node.id.startsWith('r5-end-')) {
      if (choiceCursor !== plan.choices.length) {
        throw new Error(`${plan.name} 尚有未消费选择：${plan.choices.slice(choiceCursor).join(', ')}`)
      }
      return { state, path, availableChoices: witnessed }
    }

    let nextId: string
    if (node.choices?.length) {
      const choices = availableChoices(node, state)
      choices.forEach((choice) => witnessed.add(`${node.id}/${choice.id}`))
      // v1.5 的夜话hub会多次回环，且关系结局改为显式选择；它们不消费旧路线的顺序选择表。
      const isNightHub = node.id === 'r5-20-member-night-hub'
      const isNightScene = /^r5-20[ace]-/.test(node.id)
      const isBondChoice = node.id === 'r5-20-bond-router'
      const choiceId = isNightHub
        ? choices[0]?.id
        : isNightScene
          ? choices[plan.nightVariant === 'second' ? 1 : 0]?.id
          : isBondChoice
            ? (plan.bond ? 'choose-wenxian-bond' : 'keep-ordinary-relationship')
            : plan.choices[choiceCursor]
      if (!choiceId) throw new Error(`${plan.name} 在 ${node.id} 缺少选择`)
      if (!choices.some((choice) => choice.id === choiceId)) {
        throw new Error(`${plan.name} 在 ${node.id} 的条件未满足：${choiceId}`)
      }
      const result = commitChoice(state, node, choiceId)
      state = result.state
      nextId = result.next
      if (!isNightHub && !isNightScene && !isBondChoice) choiceCursor += 1
    } else {
      if (!node.next) throw new Error(`${plan.name} 在 ${node.id} 遇到死路`)
      nextId = resolveTarget(node.next, state)
    }

    const next = byId[nextId]
    if (!next) throw new Error(`${plan.name} 从 ${node.id} 指向不存在的节点 ${nextId}`)
    state = enterNode(state, next)
    path.push(next.id)
  }

  throw new Error(`${plan.name} 超过100步，疑似存在循环`)
}

// FNV-1a keeps the legacy contract snapshot deterministic without adding a Node-only test dependency.
const digest = (value: unknown) => {
  const serialized = JSON.stringify(value)
  let hash = 2166136261
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

describe('未闻花名线沉浸化合同', () => {
  it('不向玩家暴露作者层术语或数值结果说明', () => {
    const visibleText = nodes.flatMap((node) => [
      node.actLabel,
      node.title ?? '',
      node.location ?? '',
      node.text,
      ...(node.choices ?? []).map((choice) => `${choice.label} ${choice.detail ?? ''}`),
    ]).join('\n')

    expect(nodes.flatMap((node) => node.choices ?? []).some((choice) => Boolean(choice.detail))).toBe(false)
    expect(visibleText).not.toMatch(/世界线|历史原点|状态结算|局部改写|默认历史|复现默认|关系结局|组织结局|五组结算|世界状态/)
  })

  it('大多数选项是玩家会说的话或可直接执行的动作', () => {
    const labels = nodes.flatMap((node) => node.choices ?? []).map((choice) => choice.label)
    const natural = labels.filter((label) => label.includes('“') || /^(?:把|在|关|给|按|撤)/.test(label))
    expect(natural.length / labels.length).toBeGreaterThanOrEqual(0.7)
  })

  it('系统和旁白节点低于四成，且不连续播报两段纯事实', () => {
    const expository = nodes.filter((node) => node.speaker === 'system' || node.speaker === 'narrator')
    expect(expository.length / nodes.length).toBeLessThan(0.4)

    const consecutive = expository.flatMap((node) => {
      if (node.id.startsWith('r5-end-')) return []
      return exits(node)
        .map((id) => byId[id])
        .filter((next): next is StoryNode => Boolean(next))
        .filter((next) => next.speaker === 'system' || next.speaker === 'narrator')
        .map((next) => `${node.id} -> ${next.id}`)
    })
    expect(consecutive).toEqual([])
  })

  it('每个五组出口都不让日期倒退', () => {
    for (const node of nodes) {
      for (const id of exits(node)) {
        const next = byId[id]
        if (!next) continue
        expect(Date.parse(next.date), `${node.id} -> ${id}`).toBeGreaterThanOrEqual(Date.parse(node.date))
      }
    }
  })

  it('固定事实、未知边界与人物声线由具体现场承载', () => {
    expect(getNode('r5-01-shi-leaves').date).toBe('2026-07-19')
    expect(getNode('r5-01-shi-leaves').text).toMatch(/时.*7月19日.*二组江南.*未填写公开理由/s)

    expect(getNode('r5-04-world-enemy').title).toBe('与世界为敌')
    expect(getNode('r5-04-world-enemy').text).toMatch(/被裁过的截图.*能看见.*开头缺了/s)
    expect(getNode('r5-04a-cropped-screenshot').text).toMatch(/能确认.*权限.*禁言.*为什么.*空着/s)

    expect(getNode('r5-09-xilufei').date).toBe('2026-07-20')
    expect(getNode('r5-09-xilufei').text).toMatch(/老区.*祈福.*管理员.*所有能够移除的成员/s)
    expect(getNode('r5-09b-xilufei-leaves').date).toBe('2026-07-21')
    expect(getNode('r5-09b-xilufei-leaves').text).toMatch(/江南首领拒绝开战.*退出二组群/s)

    expect(getNode('r5-10-fire-two-proposal').text).toMatch(/拒绝.*道歉.*火2/s)
    expect(getNode('r5-10a-war-table').text).toMatch(/在线.*替补.*掉线补位/s)
    expect(getNode('r5-11a-roll-call').text).toMatch(/主队.*替补.*掉线补位/s)

    expect(getNode('r5-17-after-transfer').date).toBe('2026-07-26')
    expect(getNode('r5-17-after-transfer').text).toContain('OguriC与告白于7月26日转入三组')
    expect(getNode('r5-17-after-transfer').speaker).toBe('jianwen')
    expect(getNode('r5-17a-jianwen-handover').text).toMatch(/公告.*招募.*值班.*报名/s)

    expect(getNode('r5-19-gaobai-moves-again').date).toBe('2026-07-28')
    expect(getNode('r5-19-gaobai-moves-again').text).toMatch(/告白.*两天后.*一组.*直接原因没有公开/s)
    expect(getNode('r5-19-gaobai-moves-again').text).toMatch(/辰逸.*一天未上线.*不想继续玩/s)
    expect(getNode('r5-19a-two-roster-rows').text).toMatch(/告白.*原因未知.*辰逸.*不想继续玩/s)

    expect(JSON.stringify(nodes).match(/小栗帽/g)).toHaveLength(1)
  })

  it('五组三种立场各有即时回应，且不改写原选项效果', () => {
    const stance = getNode('r5-05-neutrality')
    expect(stance.choices?.map((choice) => choice.id)).toEqual([
      'principled-neutral', 'back-org1', 'stay-silent',
    ])
    expect(stance.choices?.map((choice) => choice.next)).toEqual([
      'r5-05b-principled-reply', 'r5-05c-backed-org1', 'r5-05d-stayed-silent',
    ])
    expect(stance.choices?.find((choice) => choice.id === 'back-org1')?.effects).toEqual([
      { type: 'organizationRelation', organization: 'org1', value: 2 },
      { type: 'organizationRelation', organization: 'org2', value: -2 },
      { type: 'relationship', character: 'qifu', key: 'trust', value: 1 },
      { type: 'butterflyDelta', key: 'bf_cruelty', delta: 1 },
    ])
    expect(stance.choices?.find((choice) => choice.id === 'stay-silent')?.effects).toEqual([
      { type: 'stat', key: 'power', value: 1 },
      { type: 'stat', key: 'reputation', value: -1 },
      { type: 'butterflyDelta', key: 'bf_shadow', delta: 1 },
    ])

    const start = enterNode(createInitialGameState({ playerName: '立场验收员' }), stance)
    const backed = commitChoice(start, stance, 'back-org1')
    const backedReply = enterNode(backed.state, getNode(backed.next))
    const silent = commitChoice(start, stance, 'stay-silent')
    const silentReply = enterNode(silent.state, getNode(silent.next))
    expect(backedReply.flags.org5BackedOrg1).toBe(true)
    expect(silentReply.flags.org5StayedSilent).toBe(true)
    expect(getNode(backed.next).next).toBe('r5-05a-stance-posted')
    expect(getNode(silent.next).next).toBe('r5-05a-stance-posted')
  })

  it('七组关键决策都先进入不同人物回应，再回到原主事件', () => {
    const contracts = [
      ['r5-02-response-to-shi', ['r5-02a-friendly-reply', 'r5-02b-blame-reply', 'r5-02c-quiet-reply'], 'r5-03-fill-position'],
      ['r5-03-fill-position', ['r5-03b-gaobai-appointed', 'r5-03c-gaobai-trial', 'r5-03d-seat-kept-open'], 'r5-03a-gaobai-first-shift'],
      ['r5-08-choose-channel', ['r5-08a-own-source-reply', 'r5-08b-old-group-reply', 'r5-08c-new-group-reply'], 'r5-09b-xilufei-leaves'],
      ['r5-11-council', ['r5-11b-threshold-reply', 'r5-11c-glory-reply', 'r5-11d-change-target-reply', 'r5-11e-member-vote-reply'], 'r5-11a-roll-call'],
      ['r5-13-last-confirmation', ['r5-13b-fight-call', 'r5-13c-withdraw-call', 'r5-13d-counter-call'], 'r5-13a-final-order'],
      ['r5-16-merger-decision', ['r5-16a-personal-transfer-reply', 'r5-16b-alliance-terms-reply', 'r5-16c-block-transfer-reply', 'r5-16d-full-merge-reply'], 'r5-17-after-transfer'],
      ['r5-18-wenxian-question', ['r5-18a-stay-reply', 'r5-18b-operational-reply', 'r5-18c-handoff-reply'], 'r5-19-gaobai-moves-again'],
    ] as const

    for (const [choiceNodeId, replyIds, continuation] of contracts) {
      const choiceNode = getNode(choiceNodeId)
      expect(choiceNode.choices?.map((choice) => choice.next), choiceNodeId).toEqual(replyIds)
      for (const replyId of replyIds) {
        const reply = getNode(replyId)
        expect(['system', 'narrator'], replyId).not.toContain(reply.speaker)
        expect(reply.next, replyId).toBe(continuation)
        expect(reply.date, replyId).toBe(choiceNode.date)
        expect(reply.chapter, replyId).toBe(choiceNode.chapter)
      }
    }
  })

  it('真实状态引擎可抵达四个组织结尾、温陷关系现场、全部新现场和所有条件选项', () => {
    const replays = routePlans.map((plan) => ({ plan, result: replayRoutePlan(plan) }))
    const allChoices = nodes.flatMap((node) => (node.choices ?? [])
      .map((choice) => `${node.id}/${choice.id}`))
    const conditionalChoices = nodes.flatMap((node) => (node.choices ?? [])
      .filter((choice) => choice.condition)
      .map((choice) => `${node.id}/${choice.id}`))
    const reachedNodes = new Set(replays.flatMap(({ result }) => result.path))
    const witnessedChoices = new Set(replays.flatMap(({ result }) => [...result.availableChoices]))
    const structuralDeadEnds = nodes.flatMap((node) => {
      if (node.id.startsWith('r5-end-')) return []
      const outgoing = exits(node)
      if (!outgoing.length) return [`${node.id}: 没有出口`]
      return outgoing.filter((id) => !byId[id] && !id.startsWith('ending-')).map((id) => `${node.id} -> ${id}`)
    })

    expect(structuralDeadEnds).toEqual([])
    for (const { plan, result } of replays) {
      expect(result.state.nodeId, plan.name).toBe(plan.ending)
      expect(result.state.unlockedEndings, plan.name).toContain(plan.organizationEnding)
      expect(addedScenes.filter((id) => !result.path.includes(id)), plan.name).toEqual([])
      expect(expectedStanceScenes(plan).filter((id) => !result.path.includes(id)), plan.name).toEqual([])
    }
    const bondReplay = replays.find(({ plan }) => plan.bond)
    expect(bondReplay?.result.path).toContain('r5-21-bond-wenxian')
    expect(bondReplay?.result.state.unlockedEndings).toContain('bond-wenxian')

    // 蝴蝶效应 · 路线变体结局作为见证节点存在，不参与正式路径验证。
    const variantNodeIds = new Set(['r5-end-chaos-bloom', 'r5-end-hidden-garden', 'r5-end-cold-bloom'])
    expect(nodes.filter((node) => !reachedNodes.has(node.id) && !variantNodeIds.has(node.id)).map((node) => node.id)).toEqual([])
    expect(conditionalChoices.filter((key) => !witnessedChoices.has(key))).toEqual([])
    expect(allChoices.filter((key) => !witnessedChoices.has(key))).toEqual([])
    expect(Math.min(...replays.map(({ result }) => result.path.length))).toBeGreaterThanOrEqual(35)
    expect(replays.flatMap(({ result }) => result.path)).toContain('r5-14-default-defeat')
    expect(replays.flatMap(({ result }) => result.path)).toContain('r5-14-alternate-result')
    expect(replays.flatMap(({ result }) => result.path)).toContain('r5-14-upset-result')
  })

  it('成员夜话覆盖温陷、告白与剑问，每段选择后由本人回应并返回hub', () => {
    const result = replayRoutePlan(routePlans[0]!)
    const scenes = [
      ['r5-20a-wenxian-night', 'r5-20b-wenxian-reply', 'r5NightWenxianSeen'],
      ['r5-20c-gaobai-night', 'r5-20d-gaobai-reply', 'r5NightGaobaiSeen'],
      ['r5-20e-jianwen-night', 'r5-20f-jianwen-reply', 'r5NightJianwenSeen'],
    ] as const

    for (const [sceneId, responseId, flag] of scenes) {
      const scene = getNode(sceneId)
      expect(result.path).toEqual(expect.arrayContaining([sceneId, responseId]))
      expect(scene.historical).toBe('fictional')
      expect(scene.choices).toHaveLength(2)
      expect(scene.choices?.every((choice) => choice.next === responseId)).toBe(true)
      expect(getNode(responseId).next).toBe('r5-20-member-night-hub')
      expect(result.state.flags[flag]).toBe(true)
    }
  })

  it('温陷达成后仍由玩家显式选择关系结局，普通关系不会被顺序偷选', () => {
    const router = getNode('r5-20-bond-router')
    expect(router.next).toBeUndefined()
    expect(router.choices?.map((choice) => choice.id)).toEqual([
      'choose-wenxian-bond',
      'keep-ordinary-relationship',
    ])
    expect(router.choices?.[0]?.condition).toEqual({ type: 'all', conditions: [
      { type: 'flag', key: 'playerPromisedOrg5Stay' },
      { type: 'relationshipProgress', character: 'wenxian', operator: 'gte', value: 100 },
      { type: 'relationship', character: 'wenxian', key: 'trust', operator: 'gte', value: 5 },
      { type: 'relationship', character: 'wenxian', key: 'affinity', operator: 'gte', value: 4 },
    ] })

    const romantic = replayRoutePlan(routePlans.find((plan) => plan.bond)!)
    const ordinaryPlan = { ...routePlans.find((plan) => plan.bond)!, bond: false }
    const ordinary = replayRoutePlan(ordinaryPlan)
    expect(romantic.path).toContain('r5-21-bond-wenxian')
    expect(ordinary.path).not.toContain('r5-21-bond-wenxian')
    expect(ordinary.state.relationships.wenxian.progress).toBe(100)
  })

  it('关键对话按视觉审计使用合法立绘组合，并让空席CG明确不叠立绘', () => {
    const spriteContract = Object.fromEntries(nodes
      .filter((node) => node.presentation?.sprites !== undefined)
      .map((node) => [node.id, node.presentation!.sprites]))

    expect(spriteContract).toEqual({
      'r5-00-founded': [
        { character: 'wenxian', expression: 'soft', pose: 'phone', position: 'left', scale: 1.02 },
        { character: 'oguri', expression: 'neutral', pose: 'thinking', position: 'right', scale: .98 },
      ],
      'r5-01a-empty-seat-chat': [
        { character: 'wenxian', expression: 'concerned', pose: 'phone', position: 'left', scale: 1.02 },
      ],
      'r5-02-response-to-shi': [],
      'r5-03-fill-position': [
        { character: 'oguri', expression: 'neutral', pose: 'thinking', position: 'left' },
        { character: 'gaobai', expression: 'determined', pose: 'command', position: 'right' },
      ],
      'r5-03a-gaobai-first-shift': [
        { character: 'oguri', expression: 'neutral', pose: 'thinking', position: 'left' },
      ],
      'r5-04a-cropped-screenshot': [
        { character: 'oguri', expression: 'concerned', pose: 'thinking', position: 'left' },
      ],
      'r5-05a-stance-posted': [
        { character: 'wenxian', expression: 'soft', pose: 'phone', position: 'left', scale: 1.02 },
      ],
      'r5-07a-kicked-window': [
        { character: 'jianwen', expression: 'neutral', pose: 'phone', position: 'left' },
      ],
      'r5-09c-after-exit': [
        { character: 'jianwen', expression: 'neutral', pose: 'thinking', position: 'left' },
      ],
      'r5-10-fire-two-proposal': [
        { character: 'gaobai', expression: 'determined', pose: 'command', position: 'right', scale: 1.03 },
      ],
      'r5-10a-war-table': [
        { character: 'oguri', expression: 'concerned', pose: 'thinking', position: 'left' },
        { character: 'gaobai', expression: 'determined', pose: 'command', position: 'right', scale: 1.03 },
      ],
      'r5-11a-roll-call': [
        { character: 'oguri', expression: 'determined', pose: 'command', position: 'center', scale: 1.02 },
      ],
      'r5-12-readiness': [
        { character: 'oguri', expression: 'concerned', pose: 'command', position: 'center', scale: 1.02 },
      ],
      'r5-13-last-confirmation': [
        { character: 'wenxian', expression: 'determined', pose: 'command', position: 'center', scale: 1.03 },
      ],
      'r5-13a-final-order': [
        { character: 'gaobai', expression: 'determined', pose: 'command', position: 'center', scale: 1.04 },
      ],
      'r5-14a-after-report': [
        { character: 'wenxian', expression: 'sad', pose: 'phone', position: 'center', scale: 1.02 },
      ],
      'r5-16-merger-decision': [
        { character: 'oguri', expression: 'neutral', pose: 'relaxed', position: 'left' },
        { character: 'wenxian', expression: 'sad', pose: 'base', position: 'right', scale: 1.02 },
      ],
      'r5-17a-jianwen-handover': [
        { character: 'jianwen', expression: 'neutral', pose: 'command', position: 'left' },
        { character: 'wenxian', expression: 'soft', pose: 'phone', position: 'right', scale: 1.02 },
      ],
      'r5-18-wenxian-question': [
        { character: 'wenxian', expression: 'concerned', pose: 'thinking', position: 'center', scale: 1.03 },
      ],
      'r5-19a-two-roster-rows': [
        { character: 'jianwen', expression: 'neutral', pose: 'thinking', position: 'center' },
      ],
      'r5-20-bond-router': [
        { character: 'wenxian', expression: 'soft', pose: 'phone', position: 'center', scale: 1.03 },
      ],
      'r5-20-member-night-hub': [
        { character: 'jianwen', expression: 'soft', pose: 'phone', position: 'center', scale: 1.03 },
      ],
      'r5-20a-wenxian-night': [
        { character: 'wenxian', expression: 'soft', pose: 'phone', position: 'center', scale: 1.05 },
      ],
      'r5-20c-gaobai-night': [
        { character: 'gaobai', expression: 'soft', pose: 'phone', position: 'center', scale: 1.03 },
      ],
      'r5-20e-jianwen-night': [
        { character: 'jianwen', expression: 'soft', pose: 'thinking', position: 'center', scale: 1.03 },
      ],
      'r5-22-ending-router': [
        { character: 'wenxian', expression: 'determined', pose: 'command', position: 'center', scale: 1.04 },
      ],
    })
  })

  it('v1.5显式关系迁移后，五组旧CG、组织结局优先级与有意变更指纹均被锁定', () => {
    const addedIds = new Set<string>([...addedScenes, ...p0StanceScenes])
    const legacyNodes = nodes.filter((node) => !addedIds.has(node.id))
    const choiceContract = legacyNodes.flatMap((node) => (node.choices ?? []).map((choice) => ({
      node: node.id,
      id: choice.id,
      condition: choice.condition ?? null,
      effects: choice.effects ?? [],
    })))
    // v1.5 有意把温陷旧关系路由迁移为100攻略值显式选择，并为原达成路径补记攻略进度；其余旧CG演出继续锁定。
    const nodeSideEffectsAndPresentation = legacyNodes.map((node) => {
      if (!node.presentation) return { id: node.id, onEnter: node.onEnter ?? [], presentation: null }
      const { sprites: _sprites, ...presentation } = node.presentation
      return {
        id: node.id,
        onEnter: node.onEnter ?? [],
        presentation: Object.keys(presentation).length ? presentation : null,
      }
    })

    expect(legacyNodes).toHaveLength(76)
    expect(choiceContract).toHaveLength(28)
    expect(digest(legacyNodes.map((node) => node.id))).toBe('b95dc146')
    expect(digest(choiceContract)).toBe('75cdf559')
    // 全路线沉浸化节点纳入新基线；原选项 effects 与旧CG契约仍保持冻结。
    expect(digest(nodeSideEffectsAndPresentation)).toBe('e3a6de3e')
    expect(getNode('r5-20-bond-router').next).toBeUndefined()
    expect(digest(getNode('r5-20-bond-router').choices)).toBe('19a537a3')
    // 3.1.3 先结算“狂花/秘境”等组织结局，再由共用网关追加全局隐藏结局。
    expect(digest(getNode('r5-22-ending-router').next)).toBe('42ba5e56')
  })
})
