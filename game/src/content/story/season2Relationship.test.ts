import { describe, expect, it } from 'vitest'

import { romanceCandidates } from '@/content/characters'
import { applyEffects, createInitialGameState, resolveTarget } from '@/engine/state'
import { storyById } from './index'

describe('事件二关系继承合同', () => {
  it.each(romanceCandidates)('2.6 与 2.7 的关系代价只落到真实伴侣 %s', (partner) => {
    let state = createInitialGameState({ playerName: '关系测试' })
    state.activePartner = partner
    const mentorBefore = state.relationships.mentor.trust
    const partnerBefore = state.relationships[partner].trust

    const orgPriority = storyById['s2-2.6-decide']!.choices!.find((choice) => choice.id === 's2-2.6-org-priority')!
    state = applyEffects(state, orgPriority.effects)
    expect(state.relationships[partner].trust).toBe(partnerBefore - 2)
    expect(state.relationships.mentor.trust).toBe(mentorBefore)

    const cutLosses = storyById['s2-2.7-decide']!.choices!.find((choice) => choice.id === 's2-2.7-cut-losses')!
    state = applyEffects(state, cutLosses.effects)
    expect(state.relationships[partner].trust).toBe(partnerBefore - 3)
    expect(state.relationships.mentor.trust).toBe(mentorBefore)
  })

  it.each(romanceCandidates)('2.9 为合法伴侣 %s 提供真实收束，不进入独行', (partner) => {
    let state = createInitialGameState({ playerName: '尾声测试' })
    state.activePartner = partner
    state.route = 'org4'
    state.organization = 'org4'
    state.variables.s2MainEnding = 's2-ending-org4-triumph'
    const toneId = resolveTarget(storyById['s2-2.9-rel-closure']!.next!, state)
    expect(toneId).toBe('s2-2.9-rel-tone-triumph')
    state = applyEffects(state, storyById[toneId]!.onEnter)
    const targetId = resolveTarget(storyById['s2-2.9-partner-router']!.next!, state)
    expect(targetId).toBe(`s2-2.9-rel-${partner}`)
    expect(targetId).not.toBe('s2-2.9-rel-none')

    const target = storyById[targetId]!
    state = applyEffects(state, target.onEnter)
    expect(state.variables.s2RelationshipResolved).toBe(partner)
    expect(state.activePartner).toBe(partner)
  })

  it('只有无伴侣状态进入独行收束', () => {
    const state = createInitialGameState({ playerName: '独行测试' })
    expect(resolveTarget(storyById['s2-2.9-partner-router']!.next!, state)).toBe('s2-2.9-rel-none')
  })
})
