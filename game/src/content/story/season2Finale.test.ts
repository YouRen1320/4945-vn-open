import { describe, expect, it } from 'vitest'

import { romanceCandidates } from '@/content/characters'
import { applyEffects, availableChoices, createInitialGameState, enterNode, resolveTarget } from '@/engine/state'
import type { GameState, RouteId } from '@/engine/types'
import { storyById } from './index'

const routeContracts = [
  { route: 'org2', orgArtifact: 'org2-extraction-suspended', relArtifact: 'org2-extraction-capped' },
  { route: 'org3', orgArtifact: 'org3-records-sealed', relArtifact: 'org3-records-limited' },
  { route: 'org4', orgArtifact: 'org4-standard-split', relArtifact: 'org4-standard-appeal' },
  { route: 'org5', orgArtifact: 'org5-schedule-closed', relArtifact: 'org5-schedule-window' },
  { route: 'org6', orgArtifact: 'org6-seat-independent', relArtifact: 'org6-seat-provisional' },
] as const

const finaleContracts = [
  { entry: 'stand-firm', artifact: 'all-lines-defended', entryNode: 's2-2.8-entry-stand' },
  { entry: 'cut-losses', artifact: 'core-line-protected', entryNode: 's2-2.8-entry-cut' },
] as const

const actionContracts = [
  { suffix: 'triumph', choiceSuffix: 'strike', endingSuffix: 'strike' },
  { suffix: 'compromise', choiceSuffix: 'settle', endingSuffix: 'settle' },
] as const

const endingContinuation = (route: RouteId, endingSuffix: string) => (
  route === 'org4' || route === 'org5'
    ? `s2-2.8-${route}-${endingSuffix}-ratified`
    : 's2-2.8-closing'
)

const stateFor = (route: RouteId): GameState => {
  const state = createInitialGameState({ playerName: '终局测试' })
  state.route = route
  state.organization = route
  return state
}

describe('事件二 2.8—2.9 终局合同', () => {
  it.each(routeContracts)('$route 的 8 条合法高潮组合都保留稳定主结局', ({ route, orgArtifact, relArtifact }) => {
    for (const [pressure, meetingArtifact] of [['org-first', orgArtifact], ['rel-first', relArtifact]] as const) {
      for (const finale of finaleContracts) {
        for (const action of actionContracts) {
          let state = stateFor(route)
          state.variables.s2PressureStance = pressure
          state.variables.s2MeetingArtifact = meetingArtifact
          state.variables.s2FinaleEntry = finale.entry
          state.variables.s2FinaleArtifact = finale.artifact

          const entryNodeId = resolveTarget(storyById['s2-2.8-entry']!.next!, state)
          expect(entryNodeId).toBe(finale.entryNode)
          expect(resolveTarget(storyById[entryNodeId]!.next!, state)).toBe('s2-2.8-meeting-router')

          const meetingNodeId = resolveTarget(storyById['s2-2.8-meeting-router']!.next!, state)
          expect(meetingNodeId).toContain(`s2-2.8-meeting-${route}-`)
          expect(storyById[meetingNodeId]!.next).toBe('s2-2.8-pressure-router')

          const climaxId = resolveTarget(storyById['s2-2.8-pressure-router']!.next!, state)
          expect(climaxId).toBe(pressure === 'org-first' ? 's2-2.8-climax-org' : 's2-2.8-climax-rel')
          const routeNodeId = resolveTarget(storyById[climaxId]!.next!, state)
          expect(routeNodeId).toBe(`s2-2.8-${route}`)

          const choice = storyById[routeNodeId]!.choices!.find((item) => item.id === `s2-2.8-${route}-${action.choiceSuffix}`)!
          state = applyEffects(state, choice.effects)
          expect(state.variables.s2MainEnding).toBe(`s2-ending-${route}-${action.suffix}`)
          expect(choice.next).toBe(`s2-2.8-ending-${route}-${action.endingSuffix}`)
          const outcomeNext = endingContinuation(route, action.endingSuffix)
          expect(storyById[choice.next as string]!.next).toBe(outcomeNext)
          if (outcomeNext !== 's2-2.8-closing') {
            expect(storyById[outcomeNext]).toMatchObject({
              speaker: route === 'org4' ? 'tiesuiya' : 'kunxing',
              portrait: route === 'org4' ? 'tiesuiya' : 'kunxing',
              next: 's2-2.8-closing',
            })
          }
        }
      }
    }
  })

  it('缺失、错配的终局状态进入显式修复，不再默认强硬路线', () => {
    const missing = stateFor('org4')
    expect(resolveTarget(storyById['s2-2.8-entry']!.next!, missing)).toBe('s2-2.8-entry-repair-router')
    expect(resolveTarget(storyById['s2-2.8-entry-repair-router']!.next!, missing)).toBe('s2-2.8-entry-repair-choice')

    const mismatched = stateFor('org4')
    mismatched.variables.s2FinaleEntry = 'stand-firm'
    mismatched.variables.s2FinaleArtifact = 'core-line-protected'
    expect(resolveTarget(storyById['s2-2.8-entry-stand']!.next!, mismatched)).toBe('s2-2.8-entry-repair-choice')

    const recoverable = stateFor('org4')
    recoverable.variables.s2FinaleArtifact = 'all-lines-defended'
    const repairId = resolveTarget(storyById['s2-2.8-entry-repair-router']!.next!, recoverable)
    const repaired = enterNode(recoverable, storyById[repairId]!)
    expect(repaired.variables.s2FinaleEntry).toBe('stand-firm')
    expect(repaired.flags.s2ContinuityRepaired).toBe(true)
  })

  it('缺少会议、排序或组织记录时均有可见修复路径', () => {
    const state = stateFor('org4')
    expect(resolveTarget(storyById['s2-2.8-meeting-router']!.next!, state)).toBe('s2-2.8-meeting-unrecorded')
    expect(resolveTarget(storyById['s2-2.8-pressure-router']!.next!, state)).toBe('s2-2.8-pressure-repair')

    state.route = null
    expect(resolveTarget(storyById['s2-2.8-climax-org']!.next!, state)).toBe('s2-2.8-route-repair')
    expect(availableChoices(storyById['s2-2.8-route-repair']!, state)).toHaveLength(5)
  })

  it.each(routeContracts)('2.9 只接受 $route 与本路线两个稳定主结局的配对', ({ route }) => {
    for (const action of actionContracts) {
      const state = stateFor(route)
      state.variables.s2MainEnding = `s2-ending-${route}-${action.suffix}`
      const target = resolveTarget(storyById['s2-2.9-entry']!.next!, state)
      expect(target).toBe(`s2-2.9-${route}-${action.suffix}`)

      const epilogue = storyById[target]!
      const unlocked = epilogue.onEnter?.find((effect) => effect.type === 'unlockEnding')
      const recorded = epilogue.onEnter?.find((effect) => effect.type === 'variable' && effect.key === 's2EpilogueEnding')
      expect(unlocked).toEqual({ type: 'unlockEnding', id: `s2-ending-${route}-${action.suffix}` })
      expect(recorded).toEqual({ type: 'variable', key: 's2EpilogueEnding', value: `s2-ending-${route}-${action.suffix}` })
    }
  })

  it('2.9 的主结局错配与组织缺失不会伪装成二组妥协', () => {
    const mismatch = stateFor('org4')
    mismatch.variables.s2MainEnding = 's2-ending-org2-compromise'
    expect(resolveTarget(storyById['s2-2.9-entry']!.next!, mismatch)).toBe('s2-2.9-ending-repair')
    expect(availableChoices(storyById['s2-2.9-ending-repair']!, mismatch).map((choice) => choice.id)).toEqual([
      's2-2.9-repair-org4-triumph', 's2-2.9-repair-org4-compromise',
    ])

    const missingRoute = stateFor('org4')
    missingRoute.route = null
    missingRoute.organization = null
    expect(availableChoices(storyById['s2-2.9-ending-repair']!, missingRoute).map((choice) => choice.id))
      .toEqual(['s2-2.9-repair-route'])
    expect(availableChoices(storyById['s2-2.9-route-repair']!, missingRoute)).toHaveLength(5)
  })

  it.each(routeContracts)('$route 的两个主结局都会改变全部合法伴侣与独行收束的情绪底色', ({ route }) => {
    for (const action of actionContracts) {
      const expectedTone = action.suffix === 'triumph' ? 'hard-won' : 'protected-core'
      const expectedToneNode = action.suffix === 'triumph' ? 's2-2.9-rel-tone-triumph' : 's2-2.9-rel-tone-compromise'
      for (const partner of [...romanceCandidates, null] as const) {
        let state = stateFor(route)
        state.activePartner = partner
        state.variables.s2MainEnding = `s2-ending-${route}-${action.suffix}`

        const toneNodeId = resolveTarget(storyById['s2-2.9-rel-closure']!.next!, state)
        expect(toneNodeId).toBe(expectedToneNode)
        state = enterNode(state, storyById[toneNodeId]!)
        expect(state.variables.s2RelationshipTone).toBe(expectedTone)

        const relationNodeId = resolveTarget(storyById['s2-2.9-partner-router']!.next!, state)
        expect(relationNodeId).toBe(partner ? `s2-2.9-rel-${partner}` : 's2-2.9-rel-none')
        state = enterNode(state, storyById[relationNodeId]!)
        expect(state.variables.s2RelationshipResolved).toBe(partner ?? 'none')
      }
    }
  })

  it('瓶与真理只通过早期回顾字段兼容，不作为非法 activePartner', () => {
    for (const legacy of ['bottle', 'truth'] as const) {
      const state = stateFor('org2')
      state.variables.s2RelationshipResolved = legacy
      expect(resolveTarget(storyById['s2-2.9-partner-router']!.next!, state)).toBe(`s2-2.9-rel-${legacy}`)
    }
  })

  it('季终归档标记与稳定 ID 保持不变', () => {
    expect(storyById['s2-2.9-summary']!.onEnter).toEqual(expect.arrayContaining([
      { type: 'flag', key: 's2Complete' },
      { type: 'flag', key: 's2EpilogueComplete' },
      { type: 'unlockEnding', id: 's2-finale-complete' },
    ]))
    expect(storyById['s2-2.9-exit']!.onEnter).toContainEqual({ type: 'archiveSeason2Outcome' })
  })
})
