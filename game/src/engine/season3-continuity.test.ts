import { describe, expect, it } from 'vitest'
import { romanceCandidates } from '@/content/characters'
import { computeSeason2OutcomeDigest, type Season2OutcomeRecord } from './season2-outcome'

import {
  buildS3RecapOutcomeRecord,
  dedupeSeason2OutcomesForS3,
  makeS3ContinuityProfile,
  validateS3ContinuityProfile,
  type S2EndingKind,
  type S3ActiveRoute,
  type S3Partner,
} from './season3-continuity'

const ROUTES: S3ActiveRoute[] = ['org2', 'org3', 'org4', 'org5', 'org6']
const KINDS: S2EndingKind[] = ['triumph', 'compromise']
const ENDING_CASES = ROUTES.flatMap((route) => KINDS.map((endingKind) => ({ route, endingKind })))
const PARTNERS: S3Partner[] = [...romanceCandidates, 'bottle', 'truth', 'none']

const recap = (
  route: S3ActiveRoute = 'org3',
  endingKind: S2EndingKind = 'triumph',
  partner: S3Partner = 'shana',
  createdAt = 100,
) => buildS3RecapOutcomeRecord({ route, endingKind, partner, createdAt })

const profileOf = (value: unknown) => {
  const result = makeS3ContinuityProfile(value)
  if (!result.ok) throw new Error(result.errors.join('; '))
  return result.profile
}

const resign = (record: Season2OutcomeRecord): Season2OutcomeRecord => {
  record.digest = computeSeason2OutcomeDigest(record.summary)
  record.recordId = `s2-outcome-${record.digest}`
  return record
}

describe('S3 continuity · 10 个主结局', () => {
  it.each(ENDING_CASES)('$route/$endingKind 生成合法画像', ({ route, endingKind }) => {
    const profile = profileOf(recap(route, endingKind))
    expect(profile.route).toBe(route)
    expect(profile.organization).toBe(route)
    expect(profile.s2MainEnding).toBe(`s2-ending-${route}-${endingKind}`)
    expect(profile.s2Triumph).toBe(endingKind === 'triumph')
    expect(validateS3ContinuityProfile(profile).valid).toBe(true)
  })
})

describe('S3 continuity · 回顾建档伴侣语义', () => {
  it.each(PARTNERS)('%s 可通过明确标记的 recap 建档', (partner) => {
    const record = recap('org4', 'compromise', partner)
    const profile = profileOf(resign(record))
    expect(record.summary.source).toEqual({ kind: 'recap', contractVersion: 1 })
    expect(record.summary.completionEvidence).toBe('recap-declared')
    expect(profile.activePartner).toBe(partner)
    expect(profile.s2RelationshipResolved).toBe(partner)
  })

  it.each(romanceCandidates)('%s 从真实事件二摘要完整进入第三季画像', (partner) => {
    const record = recap('org4', 'compromise', partner)
    record.summary.activePartner = partner
    record.summary.s2RelationshipResolved = partner
    const profile = profileOf(resign(record))
    expect(profile.activePartner).toBe(partner)
    expect(profile.s2RelationshipResolved).toBe(partner)
  })

  it.each(['bottle', 'truth'] as const)('%s 通过 relationshipResolved 表达，不扩张旧 activePartner 契约', (partner) => {
    const record = recap('org3', 'triumph', partner)
    expect(record.summary.activePartner).toBeNull()
    expect(record.summary.s2RelationshipResolved).toBe(partner)
    expect(profileOf(record).activePartner).toBe(partner)
  })
})

describe('S3 continuity · flavor 与 durable facts', () => {
  it.each([
    ['org2', 'triumph', 's2-org2-triumph-line'],
    ['org4', 'compromise', 's2-org4-appendix'],
    ['org5', 'triumph', 's2-org5-undercurrent'],
    ['org5', 'compromise', 's2-org5-undercurrent'],
  ] as const)('%s/%s 推导 %s', (route, kind, hookId) => {
    expect(profileOf(recap(route, kind)).s2FlavorHooks.map((hook) => hook.hookId)).toContain(hookId)
  })

  it('五组伏笔使用重组后的心之所向称谓', () => {
    expect(profileOf(recap('org5', 'triumph')).s2FlavorHooks).toContainEqual(expect.objectContaining({
      hookId: 's2-org5-undercurrent', label: '心之所向的北岸暗线',
    }))
  })

  it('无匹配结局时 hooks 为空', () => {
    expect(profileOf(recap('org3', 'triumph')).s2FlavorHooks).toEqual([])
  })

  it('durable facts 为自包含、排序后的快照', () => {
    const record = recap()
    record.summary.durableFacts = ['s1-route-complete', 's1-org-ending', 's1-route-complete']
    const profile = profileOf(resign(record))
    expect(profile.durableFacts).toEqual(['s1-org-ending', 's1-route-complete'])
    record.summary.durableFacts.push('s1-mentor-trust')
    expect(profile.durableFacts).toEqual(['s1-org-ending', 's1-route-complete'])
  })
})

describe('S3 continuity · 阻断规则', () => {
  it('拒绝 org1', () => {
    const record = recap()
    record.summary.route = 'org1'
    record.summary.organization = 'org1'
    expect(makeS3ContinuityProfile(record).ok).toBe(false)
  })

  it('拒绝 route/organization 不一致', () => {
    const record = recap()
    record.summary.organization = 'org4'
    expect(makeS3ContinuityProfile(record).ok).toBe(false)
  })

  it('拒绝主结局与 route 不一致', () => {
    const record = recap()
    record.summary.s2MainEnding = 's2-ending-org4-triumph'
    expect(makeS3ContinuityProfile(record).ok).toBe(false)
  })

  it('拒绝缺 s2Complete', () => {
    const record = recap()
    record.summary.s2Complete = false
    expect(makeS3ContinuityProfile(record).ok).toBe(false)
  })

  it('拒绝缺 s2EpilogueComplete', () => {
    const record = recap()
    record.summary.s2EpilogueComplete = false
    expect(makeS3ContinuityProfile(record).ok).toBe(false)
  })

  it('拒绝缺 finale 证明', () => {
    const record = recap()
    record.summary.finaleEndingId = null
    record.summary.unlockedEndings = record.summary.unlockedEndings.filter((id) => id !== 's2-finale-complete')
    expect(makeS3ContinuityProfile(record).ok).toBe(false)
  })

  it('拒绝未知关系收束', () => {
    const record = recap()
    record.summary.s2RelationshipResolved = 'qifu'
    expect(makeS3ContinuityProfile(record).ok).toBe(false)
  })

  it('拒绝 superseded 来源', () => {
    const record = recap()
    record.supersededBy = { byRecordId: 'new', supersededAt: 200, reason: 'replacement' }
    expect(makeS3ContinuityProfile(record).ok).toBe(false)
  })

  it('拒绝未知未来版本', () => {
    const record = recap() as unknown as { summary: { summaryVersion: number } }
    record.summary.summaryVersion = 99
    expect(makeS3ContinuityProfile(record).ok).toBe(false)
  })

  it('拒绝 digest 与 summary 不一致的篡改记录', () => {
    const record = recap()
    record.digest = 'tampered'
    expect(makeS3ContinuityProfile(record).ok).toBe(false)
  })
})

describe('S3 continuity · 回退、数值与 JSON 契约', () => {
  it('epilogue 为空时回退主结局并留下 warning', () => {
    const record = recap()
    record.summary.s2EpilogueEnding = ''
    const profile = profileOf(resign(record))
    expect(profile.s2EpilogueEnding).toBe(record.summary.s2MainEnding)
    expect(profile.warnings.some((warning) => warning.includes('回退'))).toBe(true)
  })

  it.each([
    ['cohesion', 99, 5],
    ['cohesion', -2, 0],
    ['reputation', 99, 5],
    ['reputation', -99, -5],
    ['resources', 99, 5],
    ['resources', -2, 0],
  ] as const)('%s=%s 收敛为 %s', (field, input, expected) => {
    const record = recap()
    record.summary.stats[field] = input
    const profile = profileOf(resign(record))
    expect(profile[field]).toBe(expected)
    expect(profile.warnings.some((warning) => warning.includes(field))).toBe(true)
  })

  it('profile JSON round-trip 保持等价', () => {
    const profile = profileOf(recap('org5', 'compromise', 'truth'))
    const roundTrip = JSON.parse(JSON.stringify(profile))
    expect(roundTrip).toEqual(profile)
    expect(validateS3ContinuityProfile(roundTrip).valid).toBe(true)
  })

  it('validator 拒绝 NaN', () => {
    const profile = profileOf(recap())
    expect(validateS3ContinuityProfile({ ...profile, cohesion: Number.NaN }).valid).toBe(false)
  })

  it('validator 拒绝未知 flavor hook', () => {
    const profile = profileOf(recap())
    expect(validateS3ContinuityProfile({ ...profile, s2FlavorHooks: [{ hookId: 'x', fromEnding: 'x', label: 'x' }] }).valid).toBe(false)
  })

  it('validator 拒绝 organization 与 route 冲突', () => {
    const profile = profileOf(recap())
    expect(validateS3ContinuityProfile({ ...profile, organization: 'org4' }).valid).toBe(false)
  })

  it('validator 拒绝白名单外的额外字段', () => {
    const profile = profileOf(recap())
    expect(validateS3ContinuityProfile({ ...profile, hiddenMechanic: true }).valid).toBe(false)
  })
})

describe('S3 continuity · 去重与快照', () => {
  it('同内容保留 createdAt 最新记录', () => {
    const older = recap('org2', 'triumph', 'shana', 10)
    const newer = recap('org2', 'triumph', 'shana', 20)
    const result = dedupeSeason2OutcomesForS3([older, newer])
    expect(result).toHaveLength(1)
    expect(result[0]?.createdAt).toBe(20)
  })

  it('不同内容不会误去重', () => {
    expect(dedupeSeason2OutcomesForS3([recap('org2'), recap('org3')])).toHaveLength(2)
  })

  it('superseded 与 incomplete 记录不进入候选', () => {
    const superseded = recap()
    superseded.supersededBy = { byRecordId: 'x', supersededAt: 2, reason: 'x' }
    const incomplete = recap('org4')
    incomplete.summary.s2Complete = false
    expect(dedupeSeason2OutcomesForS3([superseded, incomplete])).toEqual([])
  })
})
