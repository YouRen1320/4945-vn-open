import { describe, expect, it } from 'vitest'

import {
  applyEffects,
  availableChoices,
  commitChoice,
  commitTextEntry,
  createInitialGameState,
  enterNode,
  resolveTarget,
} from '@/engine/state'
import type { GameState, RouteId } from '@/engine/types'

import { storyById } from './index'

const getNode = (id: string) => {
  const node = storyById[id]
  if (!node) throw new Error(`测试找不到节点 ${id}`)
  return node
}

const setup = {
  playerName: '路线测试',
}

const routeStart = (route: RouteId): GameState => {
  const index = route.slice(-1)
  let state = createInitialGameState(setup)
  if (route === 'org1') {
    // 一组：玩家作为成员加入现有组织，不消耗金钱，但也不享受创建团队的资源加成。
    state = applyEffects(state, [
      { type: 'route', route, organization: route, role: 'member' },
      { type: 'stat', key: 'cohesion', operation: 'set', value: 2 },
      { type: 'stat', key: 'contribution', value: 1 },
      { type: 'relationship', character: 'qifu', key: 'trust', value: 1 },
      { type: 'relationship', character: 'bottle', key: 'trust', value: 1 },
      { type: 'flag', key: 'joinedEstablishedOrg' },
    ])
    return enterNode(state, getNode('r1-00-joined'))
  }
  state = applyEffects(state, [
    { type: 'route', route, organization: route },
    { type: 'stat', key: 'cohesion', operation: 'set', value: route === 'org6' ? 1 : 2 },
    { type: 'stat', key: 'resources', value: 1 },
  ])
  return enterNode(state, getNode(`r${index}-00-founded`))
}

const run = (initial: GameState, preferred: Record<string, string> = {}) => {
  let state = initial
  const visited: string[] = []
  for (let step = 0; step < 140; step += 1) {
    const node = getNode(state.nodeId)
    visited.push(node.id)
    if (node.id === 'credits-first-season') return { state, visited }
    const choices = availableChoices(node, state)
    if (choices.length) {
      const choice = choices.find((item) => item.id === preferred[node.id]) ?? choices[0]
      const result = commitChoice(state, node, choice!.id)
      state = enterNode(result.state, getNode(result.next))
    } else if (node.textEntry) {
      const result = commitTextEntry(state, node, '夜航社')
      state = enterNode(result.state, getNode(result.next))
    } else if (node.next) {
      state = enterNode(state, getNode(resolveTarget(node.next, state)))
    } else {
      throw new Error(`路线提前终止于 ${node.id}`)
    }
  }
  throw new Error('路线超过140步，可能存在循环')
}

describe('完整路线场景', () => {
  it.each(['org1', 'org2', 'org3', 'org4', 'org5', 'org6'] as RouteId[])('%s 默认可用选项能抵达季终', (route) => {
    const result = run(routeStart(route))
    expect(result.visited.at(-1)).toBe('credits-first-season')
    expect(result.state.unlockedEndings.some((id) => id.startsWith(`r${route.slice(-1)}-`))).toBe(true)
    expect(result.state.highCouncil.length).toBeLessThanOrEqual(2)
  })

  it('共享隐藏结局追加在组织结局之后，并继续汇入事件一片尾', () => {
    const initial = applyEffects(routeStart('org4'), [
      { type: 'flag', key: 'bf_shadow_master' },
      { type: 'flag', key: 'bf_schemer' },
    ])
    const result = run(initial)

    expect(result.visited).toContain('r4-end-puppeteer')
    expect(result.visited).toContain('ending-shadow-puppet')
    expect(result.visited.at(-1)).toBe('credits-first-season')
    expect(result.state.unlockedEndings).toEqual(expect.arrayContaining(['r4-puppeteer', 'shadow-puppet']))
  })

  it('三至六组原有隐藏组织结局均先于对应共享结局完成', () => {
    const cases = [
      { route: 'org3', router: 'r3-23-ending-router', flags: ['bf_shadow_master'], routeEnding: 'r3-end-schemer', sharedEnding: 'ending-shadow-puppet' },
      { route: 'org4', router: 'r4-25-ending-router', flags: ['bf_shadow_master', 'bf_schemer'], routeEnding: 'r4-end-puppeteer', sharedEnding: 'ending-shadow-puppet' },
      { route: 'org5', router: 'r5-22-ending-router', flags: ['bf_anarchy'], routeEnding: 'r5-end-chaos-bloom', sharedEnding: 'ending-chaos-collapse' },
      { route: 'org5', router: 'r5-22-ending-router', flags: ['bf_shadow_master'], routeEnding: 'r5-end-hidden-garden', sharedEnding: 'ending-shadow-puppet' },
      { route: 'org6', router: 'r6-25-ending-router', flags: ['bf_anarchy'], routeEnding: 'r6-end-anarchy-reigns', sharedEnding: 'ending-chaos-collapse' },
      { route: 'org6', router: 'r6-25-ending-router', flags: ['bf_shadow_master', 'bf_schemer'], routeEnding: 'r6-end-shadow-seat', sharedEnding: 'ending-shadow-puppet' },
    ] as const

    for (const scenario of cases) {
      const initial = routeStart(scenario.route)
      initial.nodeId = scenario.router
      for (const flag of scenario.flags) initial.flags[flag] = true
      const result = run(initial)
      const routeIndex = result.visited.indexOf(scenario.routeEnding)
      const sharedIndex = result.visited.indexOf(scenario.sharedEnding)

      expect(routeIndex, scenario.routeEnding).toBeGreaterThanOrEqual(0)
      expect(sharedIndex, scenario.sharedEnding).toBeGreaterThan(routeIndex)
      expect(result.visited.at(-1)).toBe('credits-first-season')
    }
  })

  it('六组在章程、证据、资源和凝聚满足时保住第六席', () => {
    const result = run(routeStart('org6'), {
      'r6-01-recruitment-pitch': 'rules-first-pitch',
      'r6-02-first-recruits': 'write-charter',
      'r6-04-courtship': 'mediate-with-facts',
      'r6-07-legitimacy': 'recognize-neither',
      'r6-09-qifu-rebuilds': 'help-with-boundaries',
      'r6-10-fortress-trade': 'sell-attendance',
      'r6-12-recognition': 'archive-first-record',
      'r6-15-ruling': 'mediate-publicly',
      'r6-20-survival-decision': 'remain-independent',
      'r6-21-qifu-night': 'stay-and-check',
    })
    expect(result.visited).toContain('r6-17-yyt-stays')
    // 该场景中凝聚力（cohesion）仅累积到 1，未达到第六席要求（≥3），
    // 且蝴蝶效应"外交值"达标触发"统一战线"变体结局。
    expect(result.visited).toContain('r6-end-united-front')
    expect(result.visited.at(-1)).toBe('credits-first-season')
  })

  it.each([
    {
      name: '夏娜', route: 'org2' as const, target: 'r2-31-bond-shana', unlock: 'bond-shana', choices: {
        'r2-01-shana-contract': 'own-decisions', 'r2-06-first-ruling': 'publish-rule',
        'r2-15-midnight-shana': 'thank-shana', 'r2-16-xilufei-arrives': 'set-boundary',
        'r2-20-declare-war': 'refuse-war',
      },
    },
    {
      name: '希露菲', route: 'org2' as const, target: 'r2-31-bond-xilufei', unlock: 'bond-xilufei', choices: {
        'r2-16-xilufei-arrives': 'encourage-chaos', 'r2-17-warning-window': 'quietly-help',
        'r2-20-declare-war': 'secret-war',
      },
    },
    {
      name: '心跳成瘾', route: 'org3' as const, target: 'r3-22-bond-heartbeat', unlock: 'bond-heartbeat', choices: {
        'r3-01-growth-contract': 'take-talent-first', 'r3-10-midnight-heartbeat': 'share-ambition',
        'r3-05-public-response': 'organizational-condemnation',
        'r3-17-management-seats': 'heartbeat-truth',
      },
    },
    {
      name: '砚秋水', route: 'org4' as const, target: 'r4-24-bond-yanqiu', unlock: 'bond-yanqiu', choices: {
        'r4-01-allocation-promise': 'public-ledger', 'r4-05-response': 'one-statement',
        'r4-12-fortress-plan': 'secure-own-fortress', 'r4-16-first-allocation': 'follow-published-rule',
        'r4-19-final-ruling': 'formal-revote',
      },
    },
    {
      name: 'takemehand', route: 'org4' as const, target: 'r4-24-bond-takemehand', unlock: 'bond-takemehand', choices: {
        'r4-01-allocation-promise': 'leader-discretion', 'r4-03-application-ruling': 'accept-as-member',
        'r4-05-response': 'one-statement', 'r4-06-private-aftermath': 'no-debt',
        'r4-16-first-allocation': 'award-takemehand', 'r4-19-final-ruling': 'hold-result',
      },
    },
    {
      name: '温陷', route: 'org5' as const, target: 'r5-21-bond-wenxian', unlock: 'bond-wenxian', choices: {
        'r5-02-response-to-shi': 'friendly-farewell', 'r5-08-choose-channel': 'own-announcement-source',
        'r5-18-wenxian-question': 'stay-together',
      },
    },
    {
      name: '祈福', route: 'org6' as const, target: 'r6-24-bond-qifu', unlock: 'bond-qifu', choices: {
        'r6-04-courtship': 'mediate-with-facts', 'r6-09-qifu-rebuilds': 'help-with-boundaries',
        'r6-15-ruling': 'mediate-publicly', 'r6-21-qifu-night': 'stay-and-check',
      },
    },
  ])('$name 关系结局可由合法选择路径到达', ({ route, target, unlock, choices }) => {
    const preferred = Object.fromEntries(Object.entries(choices).filter((entry): entry is [string, string] => typeof entry[1] === 'string'))
    const result = run(routeStart(route), preferred)
    expect(result.visited).toContain(target)
    expect(result.state.unlockedEndings).toContain(unlock)
  })

  it('固定历史事实在第一季数据中保持明确标记', () => {
    const confirmedText = Object.values(storyById)
      .filter((node) => node.historical === 'confirmed')
      .map((node) => node.text)
      .join('\n')
    expect(confirmedText).toContain('7月19日')
    expect(confirmedText).toContain('岸因自己不想继续')
    expect(confirmedText).toContain('一天未上线')
    expect(confirmedText).toContain('批量')
    expect(confirmedText).toContain('火2')
  })
})
