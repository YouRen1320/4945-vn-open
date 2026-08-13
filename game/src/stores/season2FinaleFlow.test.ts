import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createInitialGameState } from '@/engine/state'
import { extractSeason1Summary, type Season2ActiveRoute } from '@/engine/season2-outcome'
import { readSeason2OutcomeArchive, readSaveV5 } from '@/engine/season2-storage'
import { makeS3ContinuityProfile } from '@/engine/season3-continuity'
import { useGameStore } from './game'

import type { CharacterId } from '@/engine/types'

type RouteContract = {
  route: Season2ActiveRoute
  season1OrganizationName: string
  organizationName: string
  s1Ending: string
  partner: CharacterId
}

class MemoryStorage implements Storage {
  readonly values = new Map<string, string>()

  get length() { return this.values.size }
  clear() { this.values.clear() }
  getItem(key: string) { return this.values.get(key) ?? null }
  key(index: number) { return [...this.values.keys()][index] ?? null }
  removeItem(key: string) { this.values.delete(key) }
  setItem(key: string, value: string) { this.values.set(key, String(value)) }
}

const routeContracts = [
  { route: 'org2', season1OrganizationName: '江南', organizationName: '云梦仙踪', s1Ending: 'r2-second-pole', partner: 'shana' },
  { route: 'org3', season1OrganizationName: '抚梅观清雪', organizationName: '虚妄月华', s1Ending: 'r3-alliance-hub', partner: 'heartbeat' },
  { route: 'org4', season1OrganizationName: '天上白玉京', organizationName: '镜花水月', s1Ending: 'r4-reversible-rule', partner: 'yanqiu' },
  { route: 'org5', season1OrganizationName: '未闻花名', organizationName: '心之所向', s1Ending: 'r5-still-here', partner: 'wenxian' },
  { route: 'org6', season1OrganizationName: '第六席', organizationName: '第六席', s1Ending: 'r6-sixth-seat', partner: 'avucii' },
] as const satisfies ReadonlyArray<RouteContract>

const endingContracts = [
  { kind: 'triumph', choiceSuffix: 'strike', tone: 'hard-won' },
  { kind: 'compromise', choiceSuffix: 'settle', tone: 'protected-core' },
] as const

const episodeIds = [
  's2-prologue',
  's2-2.3',
  's2-2.4',
  's2-2.5',
  's2-2.6',
  's2-2.7',
  's2-2.8',
  's2-2.9',
] as const

const buildSeason1Source = (contract: RouteContract) => {
  const state = createInitialGameState({ playerName: `整季验收-${contract.route}` })
  state.nodeId = 'credits-first-season'
  state.route = contract.route
  state.organization = contract.route
  state.organizationName = contract.season1OrganizationName
  state.activePartner = contract.partner
  state.relationships[contract.partner].progress = 100
  state.unlockedEndings = [contract.s1Ending, `bond-${contract.partner}`]
  return extractSeason1Summary(state, '1', 1)
}

/**
 * Follow the same automatic episode hand-off used by the real store. Only the final 2.8 action
 * is selected explicitly; every earlier episode uses its canonical first available response.
 */
const playCurrentEpisode = (
  store: ReturnType<typeof useGameStore>,
  episodeId: string,
  preferredChoiceId?: string,
) => {
  for (let step = 0; step < 160 && store.state; step += 1) {
    if (store.choices.length > 0) {
      const choice = preferredChoiceId
        ? store.choices.find((candidate) => candidate.id === preferredChoiceId) ?? store.choices[0]
        : store.choices[0]
      store.choose(choice!.id)
    } else if (store.node?.next) {
      store.advance()
    } else {
      break
    }

    // The final episode intentionally clears the live campaign after persisting its completion.
    if (!store.state && episodeId === 's2-2.9') return
    const completion = store.state && 'episodeCompletion' in store.state
      ? (store.state as { episodeCompletion?: Record<string, boolean> }).episodeCompletion
      : undefined
    if (completion?.[episodeId]) return
  }
  throw new Error(`${episodeId} 未在步数上限内完成`)
}

beforeEach(() => {
  const storage = new MemoryStorage()
  vi.stubGlobal('localStorage', storage)
  vi.stubGlobal('window', { localStorage: storage })
  setActivePinia(createPinia())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('事件二 2.5—2.9 整季联调', () => {
  it.each(routeContracts.flatMap((route) => endingContracts.map((ending) => ({ ...route, ...ending }))))(
    '$route 的 $kind 结局从连续流程生成可供下一季读取的完整档案',
    ({ route, season1OrganizationName, organizationName, s1Ending, partner, kind, choiceSuffix, tone }) => {
      const store = useGameStore()
      const summary = buildSeason1Source({ route, season1OrganizationName, organizationName, s1Ending, partner })
      store.startSeason2({ summary, playerName: `整季验收-${route}`, slot: '2', overwrite: false })

      for (const episodeId of episodeIds) {
        const preferredChoiceId = episodeId === 's2-2.8'
          ? `s2-2.8-${route}-${choiceSuffix}`
          : undefined
        playCurrentEpisode(store, episodeId, preferredChoiceId)
      }

      expect(store.state).toBeNull()
      const saved = readSaveV5('2')!.state
      const expectedEnding = `s2-ending-${route}-${kind}`

      expect(saved.route).toBe(route)
      expect(saved.organization).toBe(route)
      expect(saved.organizationName).toBe(organizationName)
      expect(saved.activePartner).toBe(partner)
      expect(saved.variables.s2MainEnding).toBe(expectedEnding)
      expect(saved.variables.s2EpilogueEnding).toBe(expectedEnding)
      expect(saved.variables.s2RelationshipResolved).toBe(partner)
      expect(saved.variables.s2RelationshipTone).toBe(tone)
      expect(saved.flags.s2Complete).toBe(true)
      expect(saved.flags.s2EpilogueComplete).toBe(true)
      expect(saved.flags.s2ContinuityRepaired).not.toBe(true)
      expect(saved.flags.s2LegacyMeetingArtifactMissing).not.toBe(true)
      expect(saved.unlockedEndings).toEqual(expect.arrayContaining([expectedEnding, 's2-finale-complete']))
      expect(episodeIds.every((episodeId) => saved.episodeCompletion[episodeId] === true)).toBe(true)

      const archive = readSeason2OutcomeArchive()
      expect(archive).toHaveLength(1)
      expect(archive[0]!.summary).toMatchObject({
        route,
        organization: route,
        organizationName,
        activePartner: partner,
        s2MainEnding: expectedEnding,
        s2EpilogueEnding: expectedEnding,
        s2RelationshipResolved: partner,
        s2Complete: true,
        s2EpilogueComplete: true,
        finaleEndingId: 's2-finale-complete',
      })

      const s3 = makeS3ContinuityProfile(archive[0])
      expect(s3.ok).toBe(true)
      if (s3.ok) {
        expect(s3.profile.route).toBe(route)
        expect(s3.profile.organization).toBe(route)
        expect(s3.profile.activePartner).toBe(partner)
        expect(s3.profile.s2MainEnding).toBe(expectedEnding)
        expect(s3.profile.s2RelationshipResolved).toBe(partner)
        expect(s3.profile.s2Triumph).toBe(kind === 'triumph')
      }

      expect(() => store.loadSeason2('2')).toThrow(/已经完成/)
    },
  )
})
