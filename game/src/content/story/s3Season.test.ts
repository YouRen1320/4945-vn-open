import { describe, expect, it } from 'vitest'

import { romanceCandidates } from '@/content/characters'
import { SEASON3_EPISODES } from '@/content/season3/registry'
import { availableChoices, commitChoice, createInitialGameState, enterNode, resolveTarget } from '@/engine/state'
import type { CharacterId, GameState, StoryNode } from '@/engine/types'
import { S3_MAIN_ENDING_IDS, s3SeasonNodes } from './s3-season'

const byId = Object.fromEntries(s3SeasonNodes.map((node) => [node.id, node])) as Record<string, StoryNode>
const routes = ['org2', 'org3', 'org4', 'org5', 'org6'] as const
const partners = [...romanceCandidates, 'bottle', 'truth', 'none'] as const

interface Plan {
  routeAction: 'a' | 'b'
  commitment: 'coalition' | 'negotiation' | 'investigation'
  pledge: 'shared' | 'limited' | 'personal'
  midpoint: 'reform' | 'protect' | 'expose'
  relationship: 'together' | 'apart' | 'broken'
  stance: 'unite' | 'bargain' | 'expose'
  finale: 'autonomy' | 'safeguard' | 'third-way' | 'absorbed'
}

const defaults: Plan = {
  routeAction: 'a', commitment: 'coalition', pledge: 'shared', midpoint: 'reform',
  relationship: 'together', stance: 'unite', finale: 'autonomy',
}

const choiceFor = (node: StoryNode, route: typeof routes[number], plan: Plan): string => {
  if (node.id.startsWith('s3-72h-task-')) return `s3-72h-${route}-${plan.routeAction}`
  if (node.id === 's3-72h-commitment') return `s3-72h-${plan.commitment === 'coalition' ? 'public-coalition' : plan.commitment === 'negotiation' ? 'conditional-negotiation' : 'secret-investigation'}`
  if (node.id === 's3-commitment-choice') return `s3-commit-${plan.pledge === 'shared' ? 'shared-accountability' : plan.pledge === 'limited' ? 'limited-authority' : 'personal-guarantee'}`
  if (node.id === 's3-midpoint-response') return `s3-midpoint-${plan.midpoint === 'reform' ? 'reform-system' : plan.midpoint === 'protect' ? 'protect-people' : 'expose-north'}`
  if (node.id === 's3-trust-choice') return `s3-trust-${plan.relationship === 'together' ? 'stay-together' : plan.relationship === 'apart' ? 'take-space' : 'break'}`
  if (node.id === 's3-trust-choice-none') return 's3-trust-none-team'
  if (node.id === 's3-crisis-choice') return `s3-crisis-${plan.stance}`
  if (node.id === 's3-finale-choice') return `s3-finale-${plan.finale === 'autonomy' ? 'route-autonomy' : plan.finale === 'safeguard' ? 'route-safeguard' : plan.finale === 'third-way' ? 'third-way' : 'solo-rejection'}`
  return availableChoices(node, currentState).at(0)?.id ?? ''
}

let currentState: GameState

const run = (
  route: typeof routes[number],
  partner: typeof partners[number],
  response: 'evidence' | 'conditional' | 'refusal' | 'investigate' = 'evidence',
  overrides: Partial<Plan> = {},
) => {
  const plan = { ...defaults, ...overrides }
  let state = createInitialGameState({ playerName: '第三季测试员' })
  state.route = route
  state.organization = route
  state.organizationName = route === 'org6' ? '自定义六组' : `组织-${route}`
  state.variables.s3Partner = partner
  state.variables.s3OpeningResponse = response
  state.activePartner = romanceCandidates.includes(partner as typeof romanceCandidates[number]) ? partner as CharacterId : null
  const seen: string[] = []
  let episodeIndex = 1
  let node = byId[SEASON3_EPISODES[episodeIndex]!.entryNodeId]!
  state = enterNode(state, node)
  let guard = 0

  while (node.id !== 's3-epilogue-exit') {
    if (guard++ > 500) throw new Error(`第三季路径未收敛：${node.id}`)
    seen.push(node.id)
    currentState = state
    const choices = availableChoices(node, state)
    if (choices.length) {
      const id = choiceFor(node, route, plan)
      const result = commitChoice(state, node, id)
      state = result.state
      node = byId[result.next]!
    } else if (node.id === SEASON3_EPISODES[episodeIndex]!.completionNodeId) {
      episodeIndex++
      node = byId[SEASON3_EPISODES[episodeIndex]!.entryNodeId]!
    } else {
      if (!node.next) throw new Error(`意外终点：${node.id}`)
      node = byId[resolveTarget(node.next, state)]!
    }
    state = enterNode(state, node)
  }
  seen.push(node.id)
  return { state, seen }
}

describe('事件三完整季', () => {
  it('七个正式单元按日期连续登记，且每个入口和完成哨兵都存在', () => {
    expect(SEASON3_EPISODES).toHaveLength(8)
    expect(SEASON3_EPISODES.map((episode) => episode.id)).toEqual([
      's3-prologue', 's3-72h', 's3-commitment', 's3-midpoint',
      's3-trust', 's3-crisis', 's3-finale', 's3-epilogue',
    ])
    for (const episode of SEASON3_EPISODES.slice(1)) {
      expect(byId[episode.entryNodeId], episode.entryNodeId).toBeDefined()
      expect(byId[episode.completionNodeId], episode.completionNodeId).toBeDefined()
    }
  })

  it.each(['evidence', 'conditional', 'refusal', 'investigate'] as const)('序章回应 %s 在七十二小时入口得到可见回收', (response) => {
    const { seen } = run('org2', 'none', response)
    expect(seen).toContain(`s3-72h-open-${response}`)
  })

  it('五路线各两种组织结局、第三道路与失败结局全部可达', () => {
    const reached = new Set<string>()
    for (const route of routes) {
      for (const finale of ['autonomy', 'safeguard'] as const) {
        const { state } = run(route, 'none', 'evidence', { finale, stance: 'bargain' })
        reached.add(String(state.variables.s3MainEnding))
      }
    }
    reached.add(String(run('org3', 'none', 'conditional', { finale: 'third-way', stance: 'unite' }).state.variables.s3MainEnding))
    reached.add(String(run('org4', 'none', 'refusal', { finale: 'absorbed', stance: 'expose' }).state.variables.s3MainEnding))
    expect(reached).toEqual(new Set(S3_MAIN_ENDING_IDS))
  })

  it.each(partners)('%s 关系状态有本人余波并完整收束', (partner) => {
    const { state, seen } = run('org5', partner, 'investigate', { relationship: 'together', finale: 'third-way' })
    expect(seen).toContain(partner === 'none' ? 's3-epilogue-partner-none' : `s3-epilogue-partner-${partner}`)
    expect(state.variables.s3RelationshipResolution).toBe(partner === 'none' ? 'none' : 'together')
    expect(state.flags.s3Complete).toBe(true)
    expect(state.unlockedEndings).toContain('s3-finale-complete')
  })

  it('早期方法、承诺、中点与最终立场均被后续场景读取', () => {
    const { state, seen } = run('org6', 'avucii', 'conditional', {
      routeAction: 'b', commitment: 'investigation', pledge: 'personal', midpoint: 'expose',
      relationship: 'apart', stance: 'expose', finale: 'safeguard',
    })
    expect(seen).toEqual(expect.arrayContaining([
      's3-72h-reply-org6-b', 's3-commitment-open-investigation',
      's3-midpoint-pledge-personal', 's3-crisis-prior-investigation',
      's3-epilogue-relation-apart',
    ]))
    expect(state.flags.s3SoftFailureTriggered).toBe(true)
    expect(state.variables.s3MainEnding).toBe('s3-ending-org6-safeguard')
  })
})
