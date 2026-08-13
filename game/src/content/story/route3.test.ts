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
import { route3Nodes } from './route3'

const nodes: StoryNode[] = route3Nodes
const byId = Object.fromEntries(nodes.map((node) => [node.id, node])) as Record<string, StoryNode>

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

const fnv1a = (source: string) => {
  let hash = 0x811c9dc5
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

const routeContractFingerprint = () => fnv1a(JSON.stringify(nodes.map((node) => ({
  id: node.id,
  next: node.next,
  onEnter: node.onEnter,
  cg: node.presentation?.cg,
  choices: node.choices?.map((choice) => ({
    id: choice.id,
    condition: choice.condition,
    effects: choice.effects,
    next: choice.next,
  })),
}))))

type RouteReplay = {
  state: GameState
  path: string[]
  availableChoices: Set<string>
  stateByNode: Map<string, GameState>
}

type RoutePlan = {
  ending: string
  choices: string[]
}

const routePlans: RoutePlan[] = [
  {
    ending: 'r3-end-diplomat',
    choices: [
      'rules-before-people',
      'request-complete-context',
      'publish-evidence-standard',
      'join-pressure',
      'stay-old-group',
      'keep-qifu-business-only',
      'share-ambition',
      'accept-without-testimony',
      'public-alliance',
      'support-five',
      'honor-plan',
      'equal-alliance',
      'heartbeat-truth',
      'release-transparently',
      'visit-heartbeat-night',
      'heartbeat-night-write-together',
      'visit-truth-night',
      'truth-night-sign-unknown',
      'visit-oguri-night',
      'oguri-night-send-rest-message',
      'visit-bottle-night',
      'bottle-night-delete-private-data',
      'visit-jiangjinjiu-night',
      'jiangjinjiu-pet-hear-terms',
      'jiangjinjiu-pet-contract',
      'release-pet-contract',
      'finish-member-night',
      'choose-heartbeat-bond',
    ],
  },
  {
    ending: 'r3-end-cold-tyranny',
    choices: [
      'take-talent-first',
      'use-partial-screenshot',
      'personal-response',
      'independent-position',
      'join-both-groups',
      'keep-qifu-business-only',
      'share-ambition',
      'ask-for-four-intel',
      'secret-coordination',
      'seize-own-target',
      'change-for-profit',
      'absorb-whole-org',
      'heartbeat-oguri',
      'offer-position-to-stay',
      'visit-heartbeat-night',
      'heartbeat-night-send-template',
      'visit-truth-night',
      'truth-night-use-spell-card',
      'visit-oguri-night',
      'oguri-night-rewrite-roster',
      'visit-bottle-night',
      'bottle-night-return-unopened',
      'visit-jiangjinjiu-night',
      'jiangjinjiu-pet-refuse-now',
      'finish-member-night',
      'keep-night-friendship',
    ],
  },
  {
    ending: 'r3-end-cold-tyranny',
    choices: [
      'take-talent-first',
      'use-partial-screenshot',
      'organizational-condemnation',
      'join-pressure',
      'join-both-groups',
      'keep-qifu-business-only',
      'challenge-ambition',
      'ask-for-four-intel',
      'secret-coordination',
      'seize-own-target',
      'change-for-profit',
      'recruit-core',
      'heartbeat-oguri',
      'release-transparently',
      'visit-heartbeat-night',
      'heartbeat-night-write-together',
      'visit-truth-night',
      'truth-night-use-spell-card',
      'visit-oguri-night',
      'oguri-night-rewrite-roster',
      'visit-bottle-night',
      'bottle-night-delete-private-data',
      'visit-jiangjinjiu-night',
      'jiangjinjiu-pet-hear-terms',
      'jiangjinjiu-pet-contract',
      'finish-member-night',
      'choose-heartbeat-bond',
    ],
  },
  {
    ending: 'r3-end-diplomat',
    choices: [
      'rules-before-people',
      'request-complete-context',
      'publish-evidence-standard',
      'private-qifu-talk',
      'stay-old-group',
      'respect-qifu-accountability',
      'challenge-ambition',
      'decline-sensitive-transfer',
      'non-aggression-only',
      'offer-neutral-mediation',
      'honor-plan',
      'refuse-absorption',
      'release-transparently',
      'visit-heartbeat-night',
      'heartbeat-night-send-template',
      'visit-truth-night',
      'truth-night-sign-unknown',
      'visit-oguri-night',
      'oguri-night-send-rest-message',
      'visit-bottle-night',
      'bottle-night-return-unopened',
      'visit-jiangjinjiu-night',
      'jiangjinjiu-pet-hear-terms',
      'jiangjinjiu-pet-decline-after-terms',
      'finish-member-night',
      'choose-qifu-bond',
    ],
  },
]

// 见证路径从真实序章选项进入，完整执行节点副作用、选项条件和条件跳转。
const replayRoutePlan = (plan: RoutePlan): RouteReplay => {
  const routeChoiceNode = (prologueNodes as StoryNode[]).find((node) => node.id === 'p10-route-choice')
  if (!routeChoiceNode) throw new Error('测试找不到三组入口选择节点')

  const prologueState = enterNode(createInitialGameState({ playerName: '验收玩家' }), routeChoiceNode)
  const routeEntry = commitChoice(prologueState, routeChoiceNode, 'lead-org3')
  if (routeEntry.next !== 'r3-00-founded') throw new Error(`三组入口错误地指向 ${routeEntry.next}`)

  let state = enterNode(routeEntry.state, getNode(routeEntry.next))
  const path = [state.nodeId]
  const witnessed = new Set<string>()
  const stateByNode = new Map<string, GameState>([[state.nodeId, state]])
  let choiceCursor = 0

  for (let guard = 0; guard < 100; guard += 1) {
    const node = getNode(state.nodeId)
    if (node.id.startsWith('r3-end-')) {
      if (choiceCursor !== plan.choices.length) {
        throw new Error(`${plan.ending} 尚有未消费选择：${plan.choices.slice(choiceCursor).join(', ')}`)
      }
      return { state, path, availableChoices: witnessed, stateByNode }
    }

    let nextId: string
    if (node.choices?.length) {
      const choices = availableChoices(node, state)
      choices.forEach((choice) => witnessed.add(`${node.id}/${choice.id}`))
      const choiceId = plan.choices[choiceCursor]
      if (!choiceId) throw new Error(`${plan.ending} 在 ${node.id} 缺少选择`)
      if (!choices.some((choice) => choice.id === choiceId)) {
        throw new Error(`${plan.ending} 在 ${node.id} 的条件未满足：${choiceId}`)
      }
      const result = commitChoice(state, node, choiceId)
      state = result.state
      nextId = result.next
      choiceCursor += 1
    } else {
      if (!node.next) throw new Error(`${plan.ending} 在 ${node.id} 遇到死路`)
      nextId = resolveTarget(node.next, state)
    }

    const next = byId[nextId]
    if (!next) throw new Error(`${plan.ending} 从 ${node.id} 指向不存在的节点 ${nextId}`)
    state = enterNode(state, next)
    path.push(next.id)
    stateByNode.set(next.id, state)
  }

  throw new Error(`${plan.ending} 超过100步，疑似存在循环`)
}

describe('抚梅观清雪线沉浸化合同', () => {
  it('不暴露作者层术语或数值结果说明', () => {
    const visibleText = nodes.flatMap((node) => [
      node.actLabel,
      node.title ?? '',
      node.location ?? '',
      node.text,
      ...(node.choices ?? []).map((choice) => `${choice.label} ${choice.detail ?? ''}`),
    ]).join('\n')

    expect(nodes.flatMap((node) => node.choices ?? []).some((choice) => Boolean(choice.detail))).toBe(false)
    expect(visibleText).not.toMatch(/世界线|历史原点|状态结算|局部改写|默认历史|复现默认|关系结局|组织结局/)
  })

  it('大多数选项是玩家会说的话或可直接执行的动作', () => {
    const labels = nodes.flatMap((node) => node.choices ?? []).map((choice) => choice.label)
    const natural = labels.filter((label) => label.includes('“') || /^(?:把|拿|收|在|私聊|留|两个|按|临时)/.test(label))
    expect(natural.length / labels.length).toBeGreaterThanOrEqual(0.7)
  })

  it('系统和旁白节点低于四成，且不连续播报两段纯事实', () => {
    const expository = nodes.filter((node) => node.speaker === 'system' || node.speaker === 'narrator')
    expect(expository.length / nodes.length).toBeLessThan(0.4)

    const consecutive = expository.flatMap((node) => {
      if (node.id.startsWith('r3-end-')) return []
      return exits(node)
        .map((id) => byId[id])
        .filter((next): next is StoryNode => Boolean(next))
        .filter((next) => next.speaker === 'system' || next.speaker === 'narrator')
        .map((next) => `${node.id} -> ${next.id}`)
    })
    expect(consecutive).toEqual([])
  })

  it('每个三组出口都不让日期倒退', () => {
    for (const node of nodes) {
      for (const id of exits(node)) {
        const next = byId[id]
        if (!next) continue
        expect(Date.parse(next.date), `${node.id} -> ${id}`).toBeGreaterThanOrEqual(Date.parse(node.date))
      }
    }
  })

  it('固定日期、别名与人物声线由具体现场承载', () => {
    expect(getNode('r3-04-world-enemy').title).toBe('与世界为敌')
    expect(getNode('r3-07-group-explosion').date).toBe('2026-07-20')
    expect(getNode('r3-07-group-explosion').text).toMatch(/老区.*祈福.*管理员.*所有能够移除的成员/s)
    expect(getNode('r3-09-xilufei-exits').date).toBe('2026-07-21')
    expect(getNode('r3-09-xilufei-exits').text).toMatch(/拒绝向一组开战.*退出二组群/s)

    expect(getNode('r3-16a-oguri-gaobai-arrive').date).toBe('2026-07-26')
    expect(getNode('r3-16a-oguri-gaobai-arrive').text).toMatch(/OguriC（小栗帽）.*告白.*进三组/s)
    expect(JSON.stringify(nodes).match(/小栗帽/g)).toHaveLength(1)
    expect(getNode('r3-17a-oguri-delivers').text).toMatch(/名单.*替补.*冷却.*对完/s)

    expect(getNode('r3-19a-gaobai-transfer').date).toBe('2026-07-28')
    expect(getNode('r3-19a-gaobai-transfer').text).toMatch(/告白.*7月28日.*一组/s)
    expect(getNode('r3-13-gaobai-request').text).toMatch(/拒绝.*道歉.*火2/s)
    expect(getNode('r3-01-growth-contract').text).toMatch(/能去聊.*不会先许/s)
    expect(getNode('r3-03a-truth-crosscheck').text).toMatch(/时间戳.*缺.*不会.*猜/s)
  })

  it('关键决策改用人物立绘，希露菲退组使用对应事件CG', () => {
    const classicScenes = [
      'r3-05-public-response',
      'r3-11-jiangjinjiu-arrives',
      'r3-11a-transfer-boundary',
      'r3-11b-transfer-declined',
      'r3-13-gaobai-request',
      'r3-16-merger-offer',
      'r3-17-management-seats',
      'r3-19-gaobai-leaves',
    ]

    for (const id of classicScenes) {
      expect(getNode(id).presentation?.ui, id).toBe('classic')
      expect(getNode(id).presentation?.sprites?.length, id).toBeGreaterThan(0)
    }

    expect(getNode('r3-11-jiangjinjiu-arrives').presentation?.sprites).toContainEqual(
      expect.objectContaining({ character: 'jiangjinjiu', expression: 'neutral', position: 'left' }),
    )
    expect(getNode('r3-17-management-seats').presentation?.sprites).toEqual(expect.arrayContaining([
      expect.objectContaining({ character: 'truth', position: 'left' }),
      expect.objectContaining({ character: 'oguri', position: 'right' }),
    ]))

    const xilufeiExit = getNode('r3-09-xilufei-exits')
    expect(xilufeiExit.presentation).toMatchObject({
      cg: '/assets/cg/xilufei-exit-v1.webp',
      ui: 'cinematic',
    })
    expect(xilufeiExit.onEnter).toContainEqual({ type: 'unlockCg', id: 'cg15-xilufei-exit' })
  })

  it('拒绝将进酒转组时不再把申请当作已通过', () => {
    const accepted = replayRoutePlan(routePlans[0]!)
    const declined = replayRoutePlan(routePlans[3]!)

    expect(accepted.path).toContain('r3-11a-transfer-boundary')
    expect(accepted.path).not.toContain('r3-11b-transfer-declined')
    expect(accepted.stateByNode.get('r3-11a-transfer-boundary')?.flags.jiangjinjiuJoinedOrg3).toBe(true)

    expect(declined.path).toEqual(expect.arrayContaining([
      'r3-11-jiangjinjiu-arrives',
      'r3-11b-transfer-declined',
      'r3-12-alliance-boundary',
    ]))
    expect(declined.path).not.toContain('r3-11a-transfer-boundary')
    expect(declined.stateByNode.get('r3-11b-transfer-declined')?.flags.declinedJiangjinjiu).toBe(true)
    expect(declined.stateByNode.get('r3-11b-transfer-declined')?.flags.jiangjinjiuJoinedOrg3).not.toBe(true)
    expect(declined.path).toContain('r3-20f-jiangjinjiu-night')
  })

  it('关键选择先获得不同的角色回应，再回到既定主要事件', () => {
    const responseChoiceNodes = [
      'r3-01-growth-contract',
      'r3-03-incomplete-screenshot',
      'r3-05-public-response',
      'r3-06-qifu-pressure',
      'r3-08-choose-public-group',
      'r3-12-alliance-boundary',
      'r3-13-gaobai-request',
      'r3-14-fortress-opens',
      'r3-16-merger-offer',
    ]

    for (const nodeId of responseChoiceNodes) {
      const node = getNode(nodeId)
      const replyIds = (node.choices ?? []).map((choice) => {
        expect(typeof choice.next, `${nodeId}/${choice.id}`).toBe('string')
        return choice.next as string
      })

      expect(new Set(replyIds).size, nodeId).toBe(replyIds.length)
      for (const replyId of replyIds) {
        const reply = getNode(replyId)
        expect(reply.speaker, replyId).not.toBe('system')
        expect(reply.speaker, replyId).not.toBe('narrator')
        expect(reply.date, replyId).toBe(node.date)
        expect(reply.chapter, replyId).toBe(node.chapter)
      }
    }

    for (const replyId of responseChoiceNodes.flatMap((nodeId) =>
      (getNode(nodeId).choices ?? []).map((choice) => choice.next as string))) {
      expect(exits(getNode(replyId)).length, replyId).toBeGreaterThan(0)
    }
  })

  it('五位夜话对象都有玩家选择、即时回应并返回成员 hub', () => {
    const eventContracts = [
      {
        event: 'r3-20b-heartbeat-night',
        choices: ['heartbeat-night-write-together', 'heartbeat-night-send-template'],
        replies: ['r3-20b1-heartbeat-reply', 'r3-20b2-heartbeat-reply'],
        doneFlag: 'r3NightHeartbeatDone',
      },
      {
        event: 'r3-20c-truth-night',
        choices: ['truth-night-sign-unknown', 'truth-night-use-spell-card'],
        replies: ['r3-20c1-truth-reply', 'r3-20c2-truth-reply'],
        doneFlag: 'r3NightTruthDone',
      },
      {
        event: 'r3-20d-oguri-night',
        choices: ['oguri-night-send-rest-message', 'oguri-night-rewrite-roster'],
        replies: ['r3-20d1-oguri-reply', 'r3-20d2-oguri-reply'],
        doneFlag: 'r3NightOguriDone',
      },
      {
        event: 'r3-20e-bottle-night',
        choices: ['bottle-night-delete-private-data', 'bottle-night-return-unopened'],
        replies: ['r3-20e1-bottle-reply', 'r3-20e2-bottle-reply'],
        doneFlag: 'r3NightBottleDone',
      },
    ]

    for (const contract of eventContracts) {
      const event = getNode(contract.event)
      expect(event.presentation?.sprites?.length, contract.event).toBeGreaterThan(0)
      expect(event.choices?.map((choice) => choice.id), contract.event).toEqual(contract.choices)
      expect(event.choices?.flatMap((choice) => choice.effects ?? []), contract.event)
        .toContainEqual({ type: 'flag', key: contract.doneFlag })
      contract.replies.forEach((reply) => expect(getNode(reply).next, reply).toBe('r3-20a-night-hub'))
    }

    const hub = getNode('r3-20a-night-hub')
    expect(hub.choices?.map((choice) => choice.id)).toEqual(expect.arrayContaining([
      'visit-heartbeat-night',
      'visit-truth-night',
      'visit-oguri-night',
      'visit-bottle-night',
      'visit-jiangjinjiu-night',
      'finish-member-night',
    ]))
  })

  it('一条克制扩张路线在管理席选择后把心跳攻略值推进到100', () => {
    const replay = replayRoutePlan(routePlans[0]!)
    const midgameState = replay.stateByNode.get('r3-17a-oguri-delivers')

    expect(midgameState).toBeDefined()
    expect(midgameState?.relationships.heartbeat.progress).toBe(100)
    expect(replay.path.indexOf('r3-17a-oguri-delivers')).toBeLessThan(replay.path.indexOf('r3-19-gaobai-leaves'))
    expect(replay.path).toEqual(expect.arrayContaining([
      'r3-19-gaobai-leaves',
      'r3-20a-night-hub',
      'r3-21-bond-router',
    ]))
  })

  it('将进酒灵兽契约可拒绝、可同意、可主动解除且收藏不回收', () => {
    const released = replayRoutePlan(routePlans[0]!)
    const refused = replayRoutePlan(routePlans[1]!)
    const active = replayRoutePlan(routePlans[2]!)
    const declinedAfterTerms = replayRoutePlan(routePlans[3]!)

    expect(refused.path).toContain('r3-20f0-pet-refused')
    expect(refused.state.flags.jiangjinjiuPetContracted).not.toBe(true)
    expect(refused.state.unlockedEndings).not.toContain('pet-jiangjinjiu')

    expect(active.path).toContain('r3-20f2-pet-contracted')
    expect(active.state.flags.jiangjinjiuPetContracted).toBe(true)
    expect(active.state.unlockedEndings).toContain('pet-jiangjinjiu')
    expect(active.state.unlockedCgs).toContain('cg48-pet-jiangjinjiu')

    expect(released.path).toContain('r3-20f4-pet-released')
    expect(released.state.flags.jiangjinjiuPetContracted).toBe(false)
    expect(released.state.unlockedEndings).toContain('pet-jiangjinjiu')
    expect(released.state.unlockedCgs).toContain('cg48-pet-jiangjinjiu')
    expect(getNode('r3-20f2-pet-contracted').presentation?.cg).toBe('/assets/cg/pet-jiangjinjiu-v1.webp')

    expect(declinedAfterTerms.path).toContain('r3-20f3-pet-declined-after-terms')
    expect(getNode('r3-20f1-pet-terms').text).toMatch(/仍然是.*能拒绝.*随时解除.*天亮.*自动解除/s)
  })

  it('关系结尾由玩家显式选择，心跳与祈福都必须先把攻略值推进到100', () => {
    const heartbeatReplay = replayRoutePlan(routePlans[0]!)
    const qifuReplay = replayRoutePlan(routePlans[3]!)
    const heartbeatState = heartbeatReplay.stateByNode.get('r3-21-bond-router')
    const qifuState = qifuReplay.stateByNode.get('r3-21-bond-router')
    if (!heartbeatState || !qifuState) throw new Error('关系选择节点未被真实路径抵达')

    const heartbeatChoices = availableChoices(getNode('r3-21-bond-router'), heartbeatState).map((choice) => choice.id)
    expect(heartbeatChoices).toEqual(expect.arrayContaining(['choose-heartbeat-bond', 'keep-night-friendship']))
    expect(heartbeatState.relationships.heartbeat.progress).toBe(100)

    const qifuChoices = availableChoices(getNode('r3-21-bond-router'), qifuState).map((choice) => choice.id)
    expect(qifuChoices).toEqual(expect.arrayContaining(['choose-qifu-bond', 'keep-night-friendship']))
    expect(qifuState.relationships.qifu.progress).toBe(100)

    const incompleteHeartbeatState = structuredClone(heartbeatState)
    incompleteHeartbeatState.relationships.heartbeat.progress = 99
    expect(availableChoices(getNode('r3-21-bond-router'), incompleteHeartbeatState).map((choice) => choice.id))
      .not.toContain('choose-heartbeat-bond')

    const incompleteQifuState = structuredClone(qifuState)
    incompleteQifuState.relationships.qifu.progress = 99
    expect(availableChoices(getNode('r3-21-bond-router'), incompleteQifuState).map((choice) => choice.id))
      .not.toContain('choose-qifu-bond')

    const bothAvailableState = structuredClone(qifuState)
    bothAvailableState.relationships.heartbeat = {
      ...bothAvailableState.relationships.heartbeat,
      progress: 100,
      trust: 4,
      affinity: 3,
    }
    expect(availableChoices(getNode('r3-21-bond-router'), bothAvailableState).map((choice) => choice.id))
      .toEqual(expect.arrayContaining(['choose-heartbeat-bond', 'choose-qifu-bond', 'keep-night-friendship']))
    expect(getNode('r3-21-bond-router').next).toBeUndefined()
  })

  it('真实状态引擎可抵达四个组织结尾、全部新现场和所有条件选项', () => {
    const replays = routePlans.map((plan) => ({ plan, result: replayRoutePlan(plan) }))
    const addedScenes = [
      'r3-01a-first-inbox',
      'r3-02a-shi-lesson',
      'r3-03a-truth-crosscheck',
      'r3-05a-public-room',
      'r3-07a-kicked-window',
      'r3-09a-qifu-after-admin',
      'r3-09b-qifu-accountability-reply',
      'r3-09c-qifu-business-reply',
      'r3-11a-transfer-boundary',
      'r3-11b-transfer-declined',
      'r3-13a-gaobai-war-room',
      'r3-14a-live-call',
      'r3-16a-oguri-gaobai-arrive',
      'r3-17a-oguri-delivers',
      'r3-19a-gaobai-transfer',
      ...nodes.filter((node) => /^r3-20[a-f]/.test(node.id)).map((node) => node.id),
    ]
    const allChoices = nodes.flatMap((node) => (node.choices ?? [])
      .map((choice) => `${node.id}/${choice.id}`))
    const conditionalChoices = nodes.flatMap((node) => (node.choices ?? [])
      .filter((choice) => choice.condition)
      .map((choice) => `${node.id}/${choice.id}`))
    const reachedNodes = new Set(replays.flatMap(({ result }) => result.path))
    const witnessedChoices = new Set(replays.flatMap(({ result }) => [...result.availableChoices]))
    const structuralDeadEnds = nodes.flatMap((node) => {
      if (node.id.startsWith('r3-end-')) return []
      const outgoing = exits(node)
      if (!outgoing.length) return [`${node.id}: 没有出口`]
      return outgoing.filter((id) => !byId[id] && !id.startsWith('ending-')).map((id) => `${node.id} -> ${id}`)
    })

    expect(structuralDeadEnds).toEqual([])
    for (const { plan, result } of replays) {
      expect(result.state.nodeId, plan.choices.join(' -> ')).toBe(plan.ending)
    }
    expect(addedScenes.filter((id) => !reachedNodes.has(id))).toEqual([])
    expect(conditionalChoices.filter((key) => !witnessedChoices.has(key))).toEqual([])
    expect(allChoices.filter((key) => !witnessedChoices.has(key))).toEqual([])
    expect(Math.min(...replays.map(({ result }) => result.path.length))).toBeGreaterThanOrEqual(35)
  })

  it('锁定 v1.5 有意迁移后的三组状态与路由指纹', () => {
    // v1.5 有意把自动关系路由迁成玩家显式选择，并插入可循环的成员夜话与可逆契约；
    // 3.1.3 再把组织结局与共享隐藏结局拆成连续片尾，并恢复“棋手”组织结局的可达性。
    // 3.1.4 为九组关键选择增加即时回应和后续回响，同时保留旧档的共享节点 fallback。
    expect(routeContractFingerprint()).toBe('f1e4d502')
  })
})
