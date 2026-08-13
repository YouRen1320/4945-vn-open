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
import { route2Nodes } from './route2'

const nodes: StoryNode[] = route2Nodes
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

type RouteSearchItem = {
  state: GameState
  path: string[]
  choices: string[]
  availableChoices: Set<string>
}

type RoutePlan = {
  ending: string
  choices: string[]
}

const routePlans: RoutePlan[] = [
  {
    ending: 'r2-end-second-pole',
    choices: [
      'own-decisions',
      'welcome-with-boundary',
      'accept-roster-result',
      'publish-rule',
      'call-it-misunderstanding',
      'release-context',
      'publish-deadline',
      'blame-public-pressure',
      'accept-resignation',
      'appoint-daigu-sixin',
      'thank-shana',
      'set-boundary',
      'warn-qifu-full',
      'thank-swordheart-close',
      'refuse-war',
      'hold-fire-two',
      'lead-front',
      'send-swordheart-offline',
      'alliance-not-merge',
      'let-quit-end-discussion',
      'remove-after-confirmation',
      'continue-member-night',
      'keep-ordinary-bonds',
    ],
  },
  {
    ending: 'r2-end-war-machine',
    choices: [
      'share-blame',
      'welcome-with-boundary',
      'accept-roster-result',
      'support-chenyi',
      'call-it-misunderstanding',
      'keep-internal',
      'defend-chenyi',
      'blame-public-pressure',
      'force-transition',
      'keep-chenyi-appoint-daigu',
      'keep-distance',
      'set-boundary',
      'stay-silent',
      'thank-swordheart-close',
      'declare-with-plan',
      'hold-fire-two',
      'coordinate-roster',
      'send-swordheart-offline',
      'only-high-power',
      'let-quit-end-discussion',
      'hold-one-day',
      'continue-member-night',
      'keep-ordinary-bonds',
    ],
  },
  {
    ending: 'r2-end-alone',
    choices: [
      'share-blame',
      'promise-promotion',
      'accept-roster-result',
      'demote-immediately',
      'call-it-misunderstanding',
      'keep-internal',
      'defend-chenyi',
      'blame-public-pressure',
      'force-transition',
      'keep-chenyi-appoint-daigu',
      'keep-distance',
      'encourage-chaos',
      'quietly-help',
      'thank-swordheart-close',
      'secret-war',
      'split-five',
      'lead-front',
      'send-swordheart-offline',
      'accept-with-rules',
      'let-quit-end-discussion',
      'hold-one-day',
      'continue-member-night',
      'keep-ordinary-bonds',
    ],
  },
  {
    ending: 'r2-end-won-lost-chat',
    choices: [
      'share-blame',
      'promise-promotion',
      'accept-roster-result',
      'demote-immediately',
      'call-it-misunderstanding',
      'release-favorable',
      'apologize-demote',
      'blame-public-pressure',
      'force-transition',
      'appoint-shi-daigu',
      'keep-distance',
      'set-boundary',
      'public-warning',
      'thank-swordheart-close',
      'declare-with-plan',
      'split-five',
      'chase-org-one',
      'send-swordheart-offline',
      'alliance-not-merge',
      'let-quit-end-discussion',
      'remove-after-confirmation',
      'continue-member-night',
      'keep-ordinary-bonds',
    ],
  },
]

const swordheartPlan: RoutePlan = {
  ending: 'r2-end-second-pole',
  choices: [
    'own-decisions',
    'welcome-with-boundary',
    'check-roster-together',
    'publish-rule',
    'call-it-misunderstanding',
    'release-context',
    'publish-deadline',
    'blame-public-pressure',
    'accept-resignation',
    'appoint-daigu-sixin',
    'thank-shana',
    'set-boundary',
    'warn-qifu-full',
    'join-reconnect-list',
    'refuse-war',
    'hold-fire-two',
    'lead-front',
    'finish-last-check-together',
    'alliance-not-merge',
    'let-quit-end-discussion',
    'remove-after-confirmation',
    'continue-member-night',
    'choose-bond-swordheart',
  ],
}

const chenyiPlan: RoutePlan = {
  ending: 'r2-end-second-pole',
  choices: [
    'own-decisions',
    'welcome-with-boundary',
    'accept-roster-result',
    'publish-rule',
    'name-permission-harm',
    'release-context',
    'publish-deadline',
    'ask-for-account-not-template',
    'accept-resignation',
    'appoint-daigu-sixin',
    'thank-shana',
    'set-boundary',
    'warn-qifu-full',
    'thank-swordheart-close',
    'refuse-war',
    'hold-fire-two',
    'lead-front',
    'send-swordheart-offline',
    'alliance-not-merge',
    'separate-leaving-from-harm',
    'remove-after-confirmation',
    'continue-member-night',
    'choose-bond-chenyi',
  ],
}

// 每条见证路径都从真实序章选择进入，并让引擎依次处理 onEnter、条件、效果与条件跳转。
const replayRoutePlan = (plan: RoutePlan): RouteSearchItem => {
  const routeChoiceNode = (prologueNodes as StoryNode[]).find((node) => node.id === 'p10-route-choice')
  if (!routeChoiceNode) throw new Error('测试找不到二组入口选择节点')

  const prologueState = enterNode(createInitialGameState({ playerName: '验收玩家' }), routeChoiceNode)
  const routeEntry = commitChoice(prologueState, routeChoiceNode, 'lead-org2')
  if (routeEntry.next !== 'r2-00-founded') throw new Error(`二组入口错误地指向 ${routeEntry.next}`)

  let state = enterNode(routeEntry.state, getNode(routeEntry.next))
  const path = [state.nodeId]
  const chosen: string[] = []
  const available = new Set<string>()
  let choiceCursor = 0

  for (let guard = 0; guard < 100; guard += 1) {
    const node = getNode(state.nodeId)
    if (node.id.startsWith('r2-end-')) {
      if (choiceCursor !== plan.choices.length) {
        throw new Error(`${plan.ending} 尚有未消费选择：${plan.choices.slice(choiceCursor).join(', ')}`)
      }
      return { state, path, choices: chosen, availableChoices: available }
    }

    let nextId: string
    if (node.choices?.length) {
      const choices = availableChoices(node, state)
      choices.forEach((choice) => available.add(`${node.id}/${choice.id}`))
      const choiceId = plan.choices[choiceCursor]
      if (!choiceId) throw new Error(`${plan.ending} 在 ${node.id} 缺少选择`)
      const choiceKey = `${node.id}/${choiceId}`
      if (!choices.some((choice) => choice.id === choiceId)) {
        throw new Error(`${plan.ending} 在 ${node.id} 的条件未满足：${choiceId}`)
      }
      const result = commitChoice(state, node, choiceId)
      state = result.state
      nextId = result.next
      chosen.push(choiceKey)
      choiceCursor += 1
    } else {
      if (!node.next) throw new Error(`${plan.ending} 在 ${node.id} 遇到死路`)
      nextId = resolveTarget(node.next, state)
    }

    const next = byId[nextId]
    if (!next) throw new Error(`${plan.ending} 从 ${node.id} 指向不存在的节点 ${nextId}`)
    state = enterNode(state, next)
    path.push(next.id)
  }

  throw new Error(`${plan.ending} 超过100步，疑似存在循环`)
}

// FNV-1a keeps the legacy contract snapshot deterministic without requiring Node-only types.
const digest = (value: unknown) => {
  const serialized = JSON.stringify(value)
  let hash = 2166136261
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

describe('江南线沉浸化合同', () => {
  it('不向玩家暴露结果说明或作者层术语', () => {
    const visibleText = nodes.flatMap((node) => [
      node.actLabel,
      node.title ?? '',
      node.text,
      ...(node.choices ?? []).map((choice) => `${choice.label} ${choice.detail ?? ''}`),
    ]).join('\n')

    expect(nodes.flatMap((node) => node.choices ?? []).some((choice) => Boolean(choice.detail))).toBe(false)
    expect(visibleText).not.toMatch(/历史原点|默认历史|局部改写|世界线|状态结算|复现默认|组织结局|关系结局|隐藏关系/)
  })

  it('大多数选项是玩家会说的话或可直接执行的动作', () => {
    const labels = nodes.flatMap((node) => node.choices ?? []).map((choice) => choice.label)
    const natural = labels.filter((label) => label.includes('“') || /^(?:点|先|把|收|撤|私聊|关|在|保留|顺着|半开|给|带|守|临时|核对)/.test(label))
    expect(natural.length / labels.length).toBeGreaterThanOrEqual(0.7)
  })

  it('系统和旁白节点低于四成', () => {
    const expository = nodes.filter((node) => node.speaker === 'system' || node.speaker === 'narrator')
    expect(expository.length / nodes.length).toBeLessThan(0.4)
  })

  it('每个江南线出口都不让日期倒退', () => {
    for (const node of nodes) {
      for (const id of exits(node)) {
        const next = byId[id]
        if (!next) continue
        expect(Date.parse(next.date), `${node.id} -> ${id}`).toBeGreaterThanOrEqual(Date.parse(node.date))
      }
    }
  })

  it('单周目到任一江南结尾至少经过45个可见推进', () => {
    const queue: Array<{ id: string; length: number }> = [{ id: 'r2-00-founded', length: 1 }]
    const shortest = new Map<string, number>()

    while (queue.length) {
      const current = queue.shift()!
      if ((shortest.get(current.id) ?? Number.POSITIVE_INFINITY) <= current.length) continue
      shortest.set(current.id, current.length)
      const node = byId[current.id]
      if (!node || current.id.startsWith('r2-end-')) continue
      queue.push(...exits(node).map((id) => ({ id, length: current.length + 1 })))
    }

    const endingLengths = [...shortest]
      .filter(([id]) => id.startsWith('r2-end-'))
      .map(([, length]) => length)
    expect(endingLengths).toHaveLength(7)
    expect(Math.min(...endingLengths)).toBeGreaterThanOrEqual(45)
  })

  it('固定事实都由具体现场承载', () => {
    expect(getNode('r2-02-shi-arrives').date).toBe('2026-07-19')
    expect(getNode('r2-02-shi-arrives').text).toContain('当前职位：成员')
    expect(getNode('r2-04a-jealous-ping').text).toMatch(/回了大古.*不想理我/s)
    expect(getNode('r2-05-muted').onEnter).toContainEqual({ type: 'flag', key: 'takemehandMuted' })
    expect(getNode('r2-13-an-resigns').text).toContain('我就是不想当高层了')
    expect(getNode('r2-13a-daigu-before-promotion').text).toContain('普通成员')

    expect(getNode('r2-17a-admin-granted').text).toMatch(/拿到了.*权限/s)
    expect(getNode('r2-18-explosion-full').text).toContain('批量移除群成员')
    expect(getNode('r2-18a-player-removed').text).toMatch(/你也被踢了.*群人数/s)
    const refusedWar = getNode('r2-20-declare-war').choices?.find((choice) => choice.id === 'refuse-war')
    expect(refusedWar?.next).toBe('r2-21-xilufei-leaves')
    expect(refusedWar?.effects).toEqual(expect.arrayContaining([
      { type: 'stat', key: 'cohesion', value: 2 },
      { type: 'stat', key: 'resources', value: 1 },
      { type: 'stat', key: 'reputation', value: 1 },
    ]))
    expect(getNode('r2-21-xilufei-leaves').date).toBe('2026-07-21')
    expect(getNode('r2-21-xilufei-leaves').text).toContain('成员安全、资源与组织的长期利益')

    expect(getNode('r2-28b-chenyi-last-online').text).toContain('没别的事')
    expect(getNode('r2-29-chenyi-offline').text).toMatch(/未上线.*已满一天.*不想玩了/s)
    const removal = getNode('r2-29-chenyi-offline').choices?.find((choice) => choice.id === 'remove-after-confirmation')
    expect(removal?.effects).toContainEqual({ type: 'flag', key: 'chenyiRemovedOnJuly28' })
  })

  it('江南规划CG只在首次展示时解锁一次', () => {
    const unlocks = nodes.flatMap((node) => (node.onEnter ?? [])
      .filter((effect) => effect.type === 'unlockCg' && effect.id === 'cg42-jiangnan-planning')
      .map(() => node.id))
    expect(unlocks).toEqual(['r2-01-shana-contract'])
  })

  it('六组来访使用独立场景图，不再误显示五组转组成员', () => {
    const remnants = getNode('r2-28-remnants')
    expect(remnants.presentation?.cg).toBe('/assets/cg/r2-org6-remnants-v1.webp')
    expect(remnants.onEnter).toContainEqual({ type: 'unlockCg', id: 'cg45-org6-remnants' })
  })

  it('真实状态引擎可抵达四个组织结尾，新增主线现场无断链', () => {
    const replays = routePlans.map((plan) => ({
      plan,
      result: replayRoutePlan(plan),
    }))
    const expectedEndings = [
      'r2-end-alone',
      'r2-end-war-machine',
      'r2-end-won-lost-chat',
      'r2-end-second-pole',
    ]
    const addedScenes = [
      'r2-04a-jealous-ping',
      'r2-05a-muted-discovered',
      'r2-12a-shana-private',
      'r2-13a-daigu-before-promotion',
      'r2-17a-admin-granted',
      'r2-18a-player-removed',
      'r2-19a-new-group-notice',
      'r2-24a-roll-call',
      'r2-25a-turning-point',
      'r2-27a-after-silence',
      'r2-28a-life-fragment',
      'r2-28b-chenyi-last-online',
      'r2-03a-swordheart-roster',
      'r2-19b-swordheart-reconnect',
      'r2-27b-swordheart-last-check',
      'r2-07e-chenyi-account-one',
      'r2-12b-chenyi-account-two',
      'r2-28c-chenyi-account-three',
      'r2-30-member-night-hub',
      'r2-30-bond-router',
    ]
    const reachedNodes = new Set(replays.flatMap(({ result }) => result.path))
    const structuralDeadEnds = nodes.flatMap((node) => {
      if (node.id.startsWith('r2-end-')) return []
      const outgoing = exits(node)
      if (!outgoing.length) return [`${node.id}: 没有出口`]
      return outgoing
        .filter((id) => !byId[id] && !id.startsWith('ending-'))
        .map((id) => `${node.id} -> ${id}`)
    })
    expect(structuralDeadEnds).toEqual([])
    for (const { plan, result } of replays) {
      expect(result.state.nodeId, plan.choices.join(' -> ')).toBe(plan.ending)
    }
    expect(replays.map(({ result }) => result.state.nodeId).sort()).toEqual(expectedEndings.sort())
    expect(addedScenes.filter((id) => !reachedNodes.has(id))).toEqual([])
    expect(Math.min(...replays.map(({ result }) => result.path.length))).toBeGreaterThanOrEqual(45)
  })

  it('剑斩凡人心关系线可由三次具体协作抵达，并继续进入原组织结尾', () => {
    const result = replayRoutePlan(swordheartPlan)

    expect(result.path).toContain('r2-03a-swordheart-roster')
    expect(result.path).toContain('r2-19b-swordheart-reconnect')
    expect(result.path).toContain('r2-27b-swordheart-last-check')
    expect(result.path).toContain('r2-31-bond-swordheart')
    expect(result.state.nodeId).toBe('r2-end-second-pole')
    expect(result.state.flags.bondedSwordheart).toBe(true)
    expect(result.state.unlockedEndings).toContain('bond-swordheart')
    expect(result.state.unlockedCgs).toContain('cg43-bond-swordheart')
    expect(result.state.relationships.swordheart.trust).toBeGreaterThanOrEqual(6)
    expect(result.state.relationships.swordheart.affinity).toBeGreaterThanOrEqual(5)
  })

  it('未完成三次协作时不会误触剑斩凡人心关系结局', () => {
    for (const plan of routePlans) {
      const result = replayRoutePlan(plan)
      expect(result.path, plan.ending).not.toContain('r2-31-bond-swordheart')
      expect(result.state.flags.bondedSwordheart, plan.ending).not.toBe(true)
      expect(result.state.unlockedEndings, plan.ending).not.toContain('bond-swordheart')
    }
  })

  it('辰逸三次承担责任后进度满100，并由玩家亲手选择关系结局', () => {
    const result = replayRoutePlan(chenyiPlan)

    expect(result.path).toContain('r2-07f-chenyi-admits-jealousy')
    expect(result.path).toContain('r2-12c-chenyi-writes-record')
    expect(result.path).toContain('r2-28d-chenyi-finishes-handover')
    expect(result.path).toContain('r2-31-bond-chenyi')
    expect(result.state.relationships.chenyi.progress).toBe(100)
    expect(result.state.relationships.chenyi.trust).toBeGreaterThanOrEqual(2)
    expect(result.state.relationships.chenyi.affinity).toBeGreaterThanOrEqual(3)
    expect(result.state.flags.bondedChenyi).toBe(true)
    expect(result.state.unlockedEndings).toContain('bond-chenyi')
    expect(result.state.unlockedCgs).toContain('cg46-bond-chenyi')
    expect(getNode('r2-07f-chenyi-admits-jealousy').text).toMatch(/嫉妒.*心智不成熟.*权限/s)
    expect(getNode('r2-12c-chenyi-writes-record').text).toMatch(/降级.*后果/s)
  })

  it('辰逸少完成任何一次承担责任时，关系选择都不会出现', () => {
    const result = replayRoutePlan(routePlans[0]!)

    expect(result.state.relationships.chenyi.progress).toBe(0)
    expect(result.availableChoices).not.toContain('r2-30-bond-router/choose-bond-chenyi')
    expect(result.path).not.toContain('r2-31-bond-chenyi')
    expect(result.state.unlockedEndings).not.toContain('bond-chenyi')
  })

  it('全部成员夜话都可从分区入口抵达，选择后有即时回应并回到夜话大厅', () => {
    const scenarios = [
      ['r2-30a-management-night-hub', 'night-talk-shana', 'r2-30d-shana-night-talk', 'shana'],
      ['r2-30a-management-night-hub', 'night-talk-chenyi', 'r2-30g-chenyi-night-talk', 'chenyi'],
      ['r2-30a-management-night-hub', 'night-talk-an', 'r2-30j-an-night-talk', 'an'],
      ['r2-30a-management-night-hub', 'night-talk-daigu', 'r2-30m-daigu-night-talk', 'daigu'],
      ['r2-30b-war-room-night-hub', 'night-talk-shi', 'r2-30p-shi-night-talk', 'shi'],
      ['r2-30b-war-room-night-hub', 'night-talk-swordheart', 'r2-30s-swordheart-night-talk', 'swordheart'],
      ['r2-30b-war-room-night-hub', 'night-talk-sixin', 'r2-30v-sixin-night-talk', 'sixin'],
      ['r2-30c-voice-night-hub', 'night-talk-xilufei', 'r2-30y-xilufei-night-talk', 'xilufei'],
      ['r2-30c-voice-night-hub', 'night-talk-saoji', 'r2-30ab-saoji-night-talk', 'saoji'],
      ['r2-30c-voice-night-hub', 'night-talk-haogeju', 'r2-30ae-haogeju-night-talk', 'haogeju'],
      ['r2-30c-voice-night-hub', 'night-talk-lan', 'r2-30ah-lan-night-talk', 'lan'],
    ] as const

    for (const [hubId, entryChoiceId, eventId, character] of scenarios) {
      const hub = getNode(hubId)
      const hubState = enterNode(createInitialGameState({ playerName: '夜话验收' }), hub)
      const entry = commitChoice(hubState, hub, entryChoiceId)
      expect(entry.next).toBe(eventId)

      const event = getNode(entry.next)
      expect(event.speaker).toBe(character)
      expect(event.portrait).toBe(character)
      expect(event.historical).toBe('fictional')
      expect(event.choices).toHaveLength(2)

      for (const choice of event.choices ?? []) {
        const eventState = enterNode(entry.state, event)
        const reply = commitChoice(eventState, event, choice.id)
        const replyNode = getNode(reply.next)
        expect(replyNode.speaker).toBe(character)
        expect(replyNode.portrait).toBe(character)
        expect(replyNode.next).toBe('r2-30-member-night-hub')
      }
    }
  })

  it('v1.5新增现场全部明确标记为架空创作', () => {
    const added = nodes.filter((node) => (
      /^r2-(?:07[e-g]|12[b-d]|28[c-e])-/.test(node.id)
      || node.id.startsWith('r2-30')
      || node.id === 'r2-31-bond-chenyi'
    ))

    expect(added.length).toBeGreaterThan(40)
    expect(added.every((node) => node.historical === 'fictional')).toBe(true)
  })

  it('多名候选同时满足时不会被顺序抢占，玩家选择与目标一一对应', () => {
    const base = createInitialGameState({ playerName: '关系验收' })
    const qualified: GameState = {
      ...base,
      flags: {
        ...base.flags,
        swordheartRosterChecked: true,
        swordheartReconnectedRoster: true,
        swordheartLastCheck: true,
        xilufeiAccomplice: true,
      },
      relationships: {
        ...base.relationships,
        swordheart: { ...base.relationships.swordheart, progress: 100, trust: 6, affinity: 5 },
        xilufei: { ...base.relationships.xilufei, progress: 100, trust: 3, affinity: 3 },
        shana: { ...base.relationships.shana, progress: 100, trust: 3, affinity: 3 },
        takemehand: { ...base.relationships.takemehand, progress: 100, trust: 2, affinity: 2 },
        chenyi: { ...base.relationships.chenyi, progress: 100, trust: 2, affinity: 3 },
      },
    }
    const router = getNode('r2-30-bond-router')
    const state = enterNode(qualified, router)
    const visibleIds = availableChoices(router, state).map((choice) => choice.id)
    const expectedTargets = {
      'choose-bond-swordheart': 'r2-31-bond-swordheart',
      'choose-bond-xilufei': 'r2-31-bond-xilufei',
      'choose-bond-shana': 'r2-31-bond-shana',
      'choose-bond-takemehand': 'r2-31-bond-takemehand',
      'choose-bond-chenyi': 'r2-31-bond-chenyi',
      'keep-ordinary-bonds': 'r2-32-world-router',
    } as const

    expect(visibleIds).toEqual(Object.keys(expectedTargets))
    for (const [choiceId, target] of Object.entries(expectedTargets)) {
      expect(commitChoice(state, router, choiceId).next).toBe(target)
    }
  })

  it('关键选择都先进入不同的角色回应，再回到既定事件链', () => {
    const choiceNodeIds = [
      'r2-01-shana-contract', 'r2-02-shi-arrives', 'r2-03a-swordheart-roster',
      'r2-08-screenshot', 'r2-11-three-leaders', 'r2-14-council-choice',
      'r2-17-warning-window', 'r2-24-defense-plan', 'r2-25-fortress-opens', 'r2-28-remnants',
    ]

    for (const nodeId of choiceNodeIds) {
      const node = getNode(nodeId)
      const replyIds = (node.choices ?? []).map((choice) => choice.next)
      expect(replyIds.every((id) => typeof id === 'string'), nodeId).toBe(true)
      expect(new Set(replyIds).size, nodeId).toBe(replyIds.length)
      for (const replyId of replyIds) {
        if (typeof replyId !== 'string') continue
        const reply = getNode(replyId)
        expect(['system', 'narrator'], replyId).not.toContain(reply.speaker)
        expect(reply.date, replyId).toBe(node.date)
        expect(reply.chapter, replyId).toBe(node.chapter)
        expect(exits(reply).length, replyId).toBeGreaterThan(0)
      }
    }
  })

  it('冻结v1.5二组节点、选项副作用、关系入口与组织结局路由', () => {
    const choiceContract = nodes.flatMap((node) => (node.choices ?? []).map((choice) => ({
      node: node.id,
      id: choice.id,
      condition: choice.condition ?? null,
      effects: choice.effects ?? [],
    })))
    const nodeSideEffectsAndPresentation = nodes.map((node) => ({
      id: node.id,
      onEnter: node.onEnter ?? [],
      presentation: node.presentation ?? null,
    }))

    expect(nodes).toHaveLength(147)
    expect(choiceContract).toHaveLength(103)
    // 3.1.4 只新增无选项的角色回应/回响节点；旧选项副作用数量保持冻结。
    expect(digest(nodes.map((node) => node.id))).toBe('21a7f0de')
    expect(digest(choiceContract)).toBe('48c8cbc6')
    expect(digest(nodeSideEffectsAndPresentation)).toBe('5b95d007')
    expect(getNode('r2-30-bond-router').next).toBeUndefined()
    expect(getNode('r2-30-bond-router').choices?.map((choice) => choice.id)).toEqual([
      'choose-bond-swordheart',
      'choose-bond-xilufei',
      'choose-bond-shana',
      'choose-bond-takemehand',
      'choose-bond-chenyi',
      'keep-ordinary-bonds',
    ])
    // 3.1.3 路线分流只决定组织结局，共享隐藏结局改由后置网关追加。
    expect(digest(getNode('r2-32-world-router').next)).toBe('9f4228c0')

    expect(getNode('r2-03-normal-chat').next).toBe('r2-03a-swordheart-roster')
    expect(getNode('r2-19a-new-group-notice').next).toBe('r2-19b-swordheart-reconnect')
    expect(getNode('r2-27a-after-silence').next).toBe('r2-27b-swordheart-last-check')
    expect(getNode('r2-28b-chenyi-last-online').next).toBe('r2-28c-chenyi-account-three')
    expect(getNode('r2-29-chenyi-offline').choices?.every((choice) => choice.next === 'r2-30-member-night-hub')).toBe(true)
  })
})
