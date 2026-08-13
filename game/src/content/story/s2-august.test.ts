import { describe, expect, it } from 'vitest'

import { createInitialGameState, availableChoices, commitChoice, enterNode, resolveTarget } from '@/engine/state'
import type { GameState, NodeTarget } from '@/engine/types'
import { storyById } from './index'
import { S2_AUGUST_ENTRY, s2AugustNodes } from './s2-august'

const targets = (target: NodeTarget | undefined): string[] => {
  if (!target) return []
  if (typeof target === 'string') return [target]
  if (target.type === 'stateVariable') return [target.fallback]
  return [...target.cases.map((item) => item.next), target.fallback]
}

const play = (choiceIds: string[], route: GameState['route'] = 'org2') => {
  let state = createInitialGameState({ playerName: '试玩者' })
  state.route = route
  state.organization = route
  state.organizationName = route === 'org6' ? '自定义六组' : '旧组织名'
  state = enterNode(state, storyById[S2_AUGUST_ENTRY]!)
  const visited: string[] = [state.nodeId]
  let choiceIndex = 0

  for (let guard = 0; guard < 100 && state.nodeId !== 's2-prologue-entry'; guard += 1) {
    const node = storyById[state.nodeId]!
    const choices = availableChoices(node, state)
    const next = choices.length
      ? commitChoice(state, node, choiceIds[choiceIndex++] ?? choices[0]!.id)
      : { state, next: resolveTarget(node.next!, state) }
    state = enterNode(next.state, storyById[next.next]!)
    visited.push(state.nodeId)
  }
  return { state, visited }
}

describe('事件二暑假桥接篇', () => {
  it('剧情图只连接桥接篇内部与正式序章，固定史实没有被选项分叉', () => {
    expect(s2AugustNodes[0]?.id).toBe(S2_AUGUST_ENTRY)
    for (const node of s2AugustNodes) {
      const exits = [
        ...targets(node.next),
        ...(node.choices ?? []).flatMap((choice) => targets(choice.next)),
      ]
      expect(exits.every((id) => id.startsWith('s2-august-') || id === 's2-prologue-entry'), node.id).toBe(true)
    }
    expect(s2AugustNodes.filter((node) => node.historical === 'confirmed').length).toBeGreaterThanOrEqual(8)
    expect(storyById['s2-august-suming-refusal']).toMatchObject({ speaker: 'suming', portrait: 'suming' })
    expect(storyById['s2-august-passerk-outburst']).toMatchObject({ speaker: 'passerk', portrait: 'passerk' })
    expect(storyById['s2-august-obito-advice']).toMatchObject({ speaker: 'obito', portrait: 'obito' })
    expect(storyById['s2-august-obito-apology-line']).toMatchObject({
      speaker: 'obito', portrait: 'obito', historical: 'confirmed', next: 's2-august-apology',
    })
    expect(storyById['s2-august-apology-received']).toMatchObject({ speaker: 'passerk', portrait: 'passerk' })
    expect(storyById['s2-august-route-org4']).toMatchObject({ speaker: 'tiesuiya', portrait: 'tiesuiya' })
    expect(storyById['s2-august-route-org5']).toMatchObject({ speaker: 'kunxing', portrait: 'kunxing' })
    expect(storyById['s2-2.3-org4']).toMatchObject({ next: 's2-2.3-org4-leader' })
    expect(storyById['s2-2.3-org4-leader']).toMatchObject({ speaker: 'tiesuiya', portrait: 'tiesuiya', next: 's2-2.3-choice' })
    expect(storyById['s2-2.3-org5']).toMatchObject({ next: 's2-2.3-org5-leader' })
    expect(storyById['s2-2.3-org5-leader']).toMatchObject({ speaker: 'kunxing', portrait: 'kunxing', next: 's2-2.3-choice' })
    expect(storyById['s2-2.9-org4-triumph']?.text).toContain('铁碎牙')
    expect(storyById['s2-2.9-org5-triumph']?.text).toContain('困醒')
  })

  it('不同选择都经过五个固定事件并在九月前写入重组状态', () => {
    const plans = [
      ['s2-august-evidence-full', 's2-august-reorg-roster', 's2-august-public-answer', 's2-august-kick-support'],
      ['s2-august-evidence-leader', 's2-august-reorg-people', 's2-august-public-internal', 's2-august-kick-review'],
      ['s2-august-evidence-hold', 's2-august-reorg-names', 's2-august-public-answer', 's2-august-kick-contact'],
    ]

    for (const plan of plans) {
      const { state, visited } = play(plan)
      expect(visited).toEqual(expect.arrayContaining([
        's2-august-qifu-pressure',
        's2-august-august-first',
        's2-august-new-map',
        's2-august-fire-two',
        's2-august-kick-start',
        's2-august-transfer-result',
      ]))
      const newMapIndex = visited.indexOf('s2-august-new-map')
      expect(newMapIndex).toBeGreaterThanOrEqual(0)
      expect(state.nodeId).toBe('s2-prologue-entry')
      expect(state.flags).toMatchObject({
        s2AugustReorganizationComplete: true,
        s2QifuLeftOrg1: true,
        s2HeartbeatLeadsOrg1: true,
        s2PasserKTransferredOrg3: true,
        s2DaiguTransferredOrg3: true,
        s2PasserKLeadsOrg3: true,
        s2WenxianRetired: true,
        s2AugustLeadershipClarified: true,
        s2AugustOrganizationNamesPublished: true,
      })
      expect(state.variables).toMatchObject({
        s2Org4Leader: '铁碎牙',
        s2Org5Leader: '困醒',
        s2Org5Successor: '困醒',
        s2Org5Coordinator: '剑问白玉京',
      })
      expect(state.organizationName).toBe('云梦仙踪')
    }
  })

  it('8 月 2 日挂牌时立即发布新组织名，尚不提前宣告重组全部完成', () => {
    let state = createInitialGameState({ playerName: '试玩者' })
    state.route = 'org2'
    state.organization = 'org2'
    state.organizationName = '江南'

    state = enterNode(state, storyById['s2-august-new-map']!)

    expect(state.flags.s2AugustOrganizationNamesPublished).toBe(true)
    expect(state.flags.s2AugustReorganizationComplete).not.toBe(true)
    expect(state.variables).toMatchObject({
      s2Org1Name: '云山乱清雪',
      s2Org2Name: '云梦仙踪',
      s2Org3Name: '虚妄月华',
      s2Org4Name: '镜花水月',
      s2Org5Name: '心之所向',
    })
  })

  it('五条事件二活跃路线得到新称谓，六组自定义名不被覆盖', () => {
    const expected: Partial<Record<NonNullable<GameState['route']>, string>> = {
      org2: '云梦仙踪', org3: '虚妄月华', org4: '镜花水月', org5: '心之所向', org6: '自定义六组',
    }
    for (const route of ['org2', 'org3', 'org4', 'org5', 'org6'] as const) {
      expect(play([], route).state.organizationName).toBe(expected[route])
    }
  })
})
