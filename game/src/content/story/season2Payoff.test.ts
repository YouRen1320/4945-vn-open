import { describe, expect, it } from 'vitest'

import { romanceCandidates } from '@/content/characters'
import { applyEffects, createInitialGameState, enterNode, resolveTarget } from '@/engine/state'
import type { GameState, RouteId } from '@/engine/types'
import { storyById } from './index'

const season2State = (route: RouteId): GameState => {
  const state = createInitialGameState({ playerName: '回响测试' })
  state.route = route
  state.organization = route
  return state
}

const routeContracts = [
  { route: 'org2', pressure: 'member-extraction', orgArtifact: 'org2-extraction-suspended', relArtifact: 'org2-extraction-capped', orgArtifactNode: 's2-2.7-artifact-org2-suspended', relArtifactNode: 's2-2.7-artifact-org2-capped' },
  { route: 'org3', pressure: 'public-records', orgArtifact: 'org3-records-sealed', relArtifact: 'org3-records-limited', orgArtifactNode: 's2-2.7-artifact-org3-sealed', relArtifactNode: 's2-2.7-artifact-org3-limited' },
  { route: 'org4', pressure: 'unified-standard', orgArtifact: 'org4-standard-split', relArtifact: 'org4-standard-appeal', orgArtifactNode: 's2-2.7-artifact-org4-split', relArtifactNode: 's2-2.7-artifact-org4-appeal' },
  { route: 'org5', pressure: 'schedule-access', orgArtifact: 'org5-schedule-closed', relArtifact: 'org5-schedule-window', orgArtifactNode: 's2-2.7-artifact-org5-closed', relArtifactNode: 's2-2.7-artifact-org5-window' },
  { route: 'org6', pressure: 'seat-legitimacy', orgArtifact: 'org6-seat-independent', relArtifact: 'org6-seat-provisional', orgArtifactNode: 's2-2.7-artifact-org6-independent', relArtifactNode: 's2-2.7-artifact-org6-provisional' },
] as const

describe('事件二 2.5—2.7 正式回响合同', () => {
  it('2.5 同时回收 2.3 立场与 2.4 分歧，旧档仍有中性入口', () => {
    const router = storyById['s2-2.5-stance-router']!
    const state = season2State('org4')

    state.variables.s2Stance = 'assert'
    expect(resolveTarget(router.next!, state)).toBe('s2-2.5-stance-assert-echo')
    state.variables.s2Stance = 'balance'
    expect(resolveTarget(router.next!, state)).toBe('s2-2.5-stance-balance-echo')
    delete state.variables.s2Stance
    expect(resolveTarget(router.next!, state)).toBe('s2-2.5-stance-unrecorded')

    state.variables.s2Diverge = 'confront'
    expect(resolveTarget(storyById['s2-2.5-entry']!.next!, state)).toBe('s2-2.5-cons-confront')
    state.variables.s2Diverge = 'coalition'
    expect(resolveTarget(storyById['s2-2.5-entry']!.next!, state)).toBe('s2-2.5-cons-coalition')
  })

  it.each(routeContracts)('2.5 为 $route 留下可跨集消费的路线压力', ({ route, pressure }) => {
    const state = enterNode(season2State(route), storyById[`s2-2.5-${route}`]!)
    expect(state.variables.s2RoutePressure).toBe(pressure)
    // 2.6 优先消费持久压力；route 条件仅作为旧档回退。
    state.route = 'org2'
    expect(resolveTarget(storyById['s2-2.6-guard-open']!.next!, state)).toBe(`s2-2.6-${route}`)
  })

  it.each(romanceCandidates)('2.6 让真实伴侣 %s 亲自参与排序', (partner) => {
    const state = season2State('org3')
    state.activePartner = partner
    const target = resolveTarget(storyById['s2-2.6-pressure']!.next!, state)
    expect(target).toBe(`s2-2.6-partner-${partner}`)
    expect(storyById[target]!.speaker).toBe(partner)
    expect(storyById[target]!.portrait).toBe(partner)
  })

  it('2.6 无伴侣时才由老朋友承接关系压力', () => {
    const state = season2State('org3')
    expect(resolveTarget(storyById['s2-2.6-pressure']!.next!, state)).toBe('s2-2.6-relation')
  })

  it.each(routeContracts)('2.6 的 $route 两种排序产生两份不同会议产物', ({ route, orgArtifact, relArtifact }) => {
    for (const [choiceId, resultId, expected] of [
      ['s2-2.6-org-priority', 's2-2.6-result-org', orgArtifact],
      ['s2-2.6-rel-priority', 's2-2.6-result-rel', relArtifact],
    ] as const) {
      const choice = storyById['s2-2.6-decide']!.choices!.find((item) => item.id === choiceId)!
      let state = applyEffects(season2State(route), choice.effects)
      const artifactNodeId = resolveTarget(storyById[resultId]!.next!, state)
      state = enterNode(state, storyById[artifactNodeId]!)
      expect(state.variables.s2MeetingArtifact).toBe(expected)
      expect(storyById[artifactNodeId]!.text.length).toBeGreaterThan(35)
    }
  })

  it.each(routeContracts)('2.7 会重新使用 $route 的两份会议产物', ({ route, orgArtifact, relArtifact, orgArtifactNode, relArtifactNode }) => {
    const router = storyById['s2-2.7-artifact-router']!
    for (const [artifact, expected] of [[orgArtifact, orgArtifactNode], [relArtifact, relArtifactNode]] as const) {
      const state = season2State(route)
      state.variables.s2MeetingArtifact = artifact
      expect(resolveTarget(router.next!, state)).toBe(expected)
    }
  })

  it.each(routeContracts)('2.7 的 $route 两种终局承诺产生不同路线落点', ({ route }) => {
    for (const [choiceId, resultId, entry, artifact, suffix] of [
      ['s2-2.7-stand-firm', 's2-2.7-result-stand', 'stand-firm', 'all-lines-defended', 'stand'],
      ['s2-2.7-cut-losses', 's2-2.7-result-cut', 'cut-losses', 'core-line-protected', 'cut'],
    ] as const) {
      const choice = storyById['s2-2.7-decide']!.choices!.find((item) => item.id === choiceId)!
      const state = applyEffects(season2State(route), choice.effects)
      expect(state.variables.s2FinaleEntry).toBe(entry)
      expect(state.variables.s2FinaleArtifact).toBe(artifact)
      expect(resolveTarget(storyById[resultId]!.next!, state)).toBe('s2-2.7-outcome-router')
      expect(resolveTarget(storyById['s2-2.7-outcome-router']!.next!, state)).toBe(`s2-2.7-outcome-${route}-${suffix}`)
    }
  })

  it('旧档没有会议产物或终局变量时不会被伪造成某条新因果', () => {
    const state = season2State('org5')
    expect(resolveTarget(storyById['s2-2.7-artifact-router']!.next!, state)).toBe('s2-2.7-stakes')
    expect(resolveTarget(storyById['s2-2.7-outcome-router']!.next!, state)).toBe('s2-2.7-consequence')
  })
})
