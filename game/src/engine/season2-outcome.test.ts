import { describe, expect, it } from 'vitest'

import { createInitialGameState } from '@/engine/state'
import {
  attachCampaignToRecord,
  bridgeOrg1SummaryToSeason2,
  buildOutcomeRecord,
  buildRecapSummary,
  buildSeason2OutcomeRecord,
  buildSkipSummary,
  computeOutcomeDigest,
  computeSeason2OutcomeDigest,
  computeSeason2OutcomeDigestV1,
  dedupeByDigest,
  extractSeason1Summary,
  extractSeason2Summary,
  isDurableFact,
  isDurableFactList,
  isOutcomeSource,
  isRelationshipTierMap,
  isSeason1OutcomeRecord,
  isSeason1OutcomeSummary,
  isSeason2OutcomeRecord,
  isSeason2OutcomeSummary,
  isContinuityProfile,
  migrateSeason2OutcomeRecord,
  migrateSeason2OutcomeSummary,
  isStructuralV5State,
  validateSeason1OutcomeSummary,
} from './season2-outcome'
import { makeV5State, SAMPLE_DIGEST, SAMPLE_RECORD, SAMPLE_SUMMARY } from '@/content/season2/fixtures'
import { organizations } from '@/content/organizations'

describe('2.2 第一季结果摘要与记录 · 验证器', () => {
  it('合法最小摘要通过校验', () => {
    expect(validateSeason1OutcomeSummary(SAMPLE_SUMMARY).ok).toBe(true)
    expect(isSeason1OutcomeSummary(SAMPLE_SUMMARY)).toBe(true)
  })

  it('route / organization / activePartner 非法时被拒', () => {
    expect(validateSeason1OutcomeSummary({ ...SAMPLE_SUMMARY, route: 'org9' }).ok).toBe(false)
    expect(validateSeason1OutcomeSummary({ ...SAMPLE_SUMMARY, route: 'org1' }).ok).toBe(false)
    expect(validateSeason1OutcomeSummary({ ...SAMPLE_SUMMARY, organization: 'org9' }).ok).toBe(false)
    expect(validateSeason1OutcomeSummary({ ...SAMPLE_SUMMARY, activePartner: 'crowd' }).ok).toBe(false)
    expect(validateSeason1OutcomeSummary({ ...SAMPLE_SUMMARY, activePartner: 'qifu' }).ok).toBe(true)
  })

  it('relationshipTiers 越界或非已知角色时被拒', () => {
    expect(validateSeason1OutcomeSummary({ ...SAMPLE_SUMMARY, relationshipTiers: { qifu: 120 } }).ok).toBe(false)
    expect(validateSeason1OutcomeSummary({ ...SAMPLE_SUMMARY, relationshipTiers: { nope: 50 } }).ok).toBe(false)
    expect(validateSeason1OutcomeSummary({ ...SAMPLE_SUMMARY, relationshipTiers: { qifu: 80 } }).ok).toBe(true)
  })

  it('durableFacts 仅接受白名单值，非白名单被拒', () => {
    expect(isDurableFact('any-unratified-fact')).toBe(false)
    expect(isDurableFactList(['any-unratified-fact'])).toBe(false)
    expect(isDurableFactList([])).toBe(true)
    // 白名单内的 flavor 级事实应当被接受。
    expect(isDurableFact('s1-charter-written')).toBe(true)
    expect(isDurableFact('s1-confession-transferred')).toBe(true)
    expect(isDurableFact('s1-fire-two')).toBe(true)
    expect(validateSeason1OutcomeSummary({ ...SAMPLE_SUMMARY, durableFacts: ['x'] }).ok).toBe(false)
    expect(validateSeason1OutcomeSummary({ ...SAMPLE_SUMMARY, durableFacts: ['s1-fire-two'] }).ok).toBe(true)
  })

  it('source 校验区分 save / recap', () => {
    expect(isOutcomeSource({ kind: 'save', slot: '1', savedAt: 1 })).toBe(true)
    expect(isOutcomeSource({ kind: 'recap', contractVersion: 1 })).toBe(true)
    expect(isOutcomeSource({ kind: 'save', slot: 1, savedAt: 1 })).toBe(false)
    expect(isOutcomeSource({ kind: 'weird' })).toBe(false)
  })

  it('relationshipTiers 映射类型校验', () => {
    expect(isRelationshipTierMap({ qifu: 50 })).toBe(true)
    expect(isRelationshipTierMap({ qifu: -1 })).toBe(false)
    expect(isRelationshipTierMap('nope')).toBe(false)
  })

  it('非对象输入被拒并给出可读错误', () => {
    const result = validateSeason1OutcomeSummary(null)
    expect(result.ok).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('一组转线摘要保留原始身份和结局，同时采用事件二活跃路线', () => {
    const state = createInitialGameState({ playerName: '第一席' })
    state.route = 'org1'
    state.organization = 'org1'
    state.organizationName = '群雄逐鹿'
    state.unlockedEndings = ['r1-order']
    const source = extractSeason1Summary(state, '1', 1)

    const summary = bridgeOrg1SummaryToSeason2(source, 'org3')

    expect(validateSeason1OutcomeSummary(summary).ok).toBe(true)
    expect(summary.route).toBe('org3')
    expect(summary.organizationName).toBe('抚梅观清雪')
    expect(summary.organizationEndingId).toBe('r1-order')
    expect(summary.routeTransfer?.fromRoute).toBe('org1')
    expect(validateSeason1OutcomeSummary({ ...summary, summaryVersion: 1 }).ok).toBe(false)
    expect(validateSeason1OutcomeSummary({ ...summary, organizationEndingId: 'r3-legacy' }).ok).toBe(false)
  })
})

describe('2.2 digest 与去重（幂等）', () => {
  it('相同内容（不同 source / createdAt）得到相同 digest', () => {
    const a: typeof SAMPLE_SUMMARY = {
      ...SAMPLE_SUMMARY,
      source: { kind: 'save', slot: '1', savedAt: 1 },
      createdAt: 1,
    }
    const b: typeof SAMPLE_SUMMARY = {
      ...SAMPLE_SUMMARY,
      source: { kind: 'recap', contractVersion: 3 },
      createdAt: 999,
    }
    expect(computeOutcomeDigest(a)).toBe(computeOutcomeDigest(b))
  })

  it('内容不同则 digest 不同', () => {
    const a = { ...SAMPLE_SUMMARY, route: 'org2' as const }
    const b = { ...SAMPLE_SUMMARY, route: 'org3' as const }
    expect(computeOutcomeDigest(a)).not.toBe(computeOutcomeDigest(b))
  })

  it('buildOutcomeRecord 的 recordId 由 digest 派生，去重保留首次', () => {
    const r1 = buildOutcomeRecord(SAMPLE_SUMMARY, 'r0')
    const r2 = buildOutcomeRecord(SAMPLE_SUMMARY, 'r0')
    expect(r1.recordId).toBe(`outcome-${SAMPLE_DIGEST}`)
    expect(r1.digest).toBe(r2.digest)
    const deduped = dedupeByDigest([r1, r2, SAMPLE_RECORD])
    expect(deduped).toHaveLength(1)
  })
})

describe('2.2 摘要提取与 record 校验', () => {
  it('从第一季 GameState 提取白名单摘要（source=save）', () => {
    const state = createInitialGameState({ playerName: '提取测试' })
    state.route = 'org2'
    state.organization = 'org2'
    state.organizationName = '二组'
    state.activePartner = 'qifu'
    const summary = extractSeason1Summary(state, '2', 123)
    expect(summary.source).toEqual({ kind: 'save', slot: '2', savedAt: 123 })
    expect(summary.route).toBe('org2')
    expect(summary.activePartner).toBe('qifu')
    // 仅有伴侣无结局时，只派生 s1-partner-bonded（修正：此前写死空数组）。
    expect(summary.durableFacts).toEqual(['s1-partner-bonded'])
    expect(validateSeason1OutcomeSummary(summary).ok).toBe(true)
  })

  it('无伴侣 GameState 提取出 activePartner="none"', () => {
    const state = createInitialGameState({ playerName: '无伴侣' })
    const summary = extractSeason1Summary(state, '1', 1)
    expect(summary.activePartner).toBe('none')
    // 无路线无伴侣：仅 s1-partner-none。
    expect(summary.durableFacts).toEqual(['s1-partner-none'])
  })

  it('完整结局状态派生 structural/ending/flavor 全部事实', () => {
    const state = createInitialGameState({ playerName: '完整结局' })
    state.route = 'org5'
    state.organization = 'org5'
    state.organizationName = '未闻花名'
    state.activePartner = 'wenxian'
    state.unlockedEndings = ['r5-fire-two-proof']
    state.highCouncil = ['wenxian', 'shana'] // 跨组织（org5 + org2）
    state.relationships.mentor.trust = 7
    state.flags.org5FoughtFireTwo = true
    const summary = extractSeason1Summary(state, '1', 1)
    expect(summary.organizationEndingId).toBe('r5-fire-two-proof')
    expect(summary.durableFacts).toEqual([
      's1-org-ending',
      's1-route-complete',
      's1-partner-bonded',
      's1-high-council',
      's1-mentor-trust',
      's1-cross-org-tie',
      's1-fire-two',
    ])
    expect(validateSeason1OutcomeSummary(summary).ok).toBe(true)
  })

  it('record 校验守卫', () => {
    expect(isSeason1OutcomeRecord(SAMPLE_RECORD)).toBe(true)
    expect(isSeason1OutcomeRecord({ ...SAMPLE_RECORD, summary: { ...SAMPLE_SUMMARY, route: 'org9' } })).toBe(false)
  })

  it('attachCampaignToRecord 返回新对象且不修改入参', () => {
    const original = { ...SAMPLE_RECORD }
    const attached = attachCampaignToRecord(SAMPLE_RECORD, 'camp', 'line')
    expect(attached.campaignId).toBe('camp')
    expect(attached.lineageId).toBe('line')
    expect(SAMPLE_RECORD.campaignId).toBeUndefined()
    expect(SAMPLE_RECORD).toEqual(original)
  })
})

describe('2.2 schema5 结构校验', () => {
  it('makeV5State 生成结构合法的 v5 状态', () => {
    expect(isStructuralV5State(makeV5State())).toBe(true)
  })

  it('篡改 schemaVersion / seasonId 后被拒', () => {
    expect(isStructuralV5State({ ...makeV5State(), schemaVersion: 4 })).toBe(false)
    expect(isStructuralV5State({ ...makeV5State(), seasonId: '' })).toBe(false)
    expect(isStructuralV5State({ ...makeV5State(), season1Outcome: { ...SAMPLE_SUMMARY, route: 'org9' } })).toBe(false)
  })

  it('非对象被拒', () => {
    expect(isStructuralV5State(null)).toBe(false)
    expect(isStructuralV5State('x')).toBe(false)
  })

  it('缺少核心 GameState 字段的 schema5 存档被拒绝', () => {
    const { stats: _stats, ...withoutStats } = makeV5State()
    expect(isStructuralV5State(withoutStats)).toBe(false)
  })
})

describe('2.2 回顾建档 buildRecapSummary（S2-RECAP-CONTRACT）', () => {
  const legalRoutes = ['org2', 'org3', 'org4', 'org5', 'org6'] as const

  it('每条合法路线 + 无伴侣 生成通过校验的 recap 摘要', () => {
    for (const route of legalRoutes) {
      const summary = buildRecapSummary(route, 'none', organizations)
      expect(summary.source.kind).toBe('recap')
      expect(summary.route).toBe(route)
      expect(summary.organization).toBe(route)
      expect(summary.organizationName).toBe(organizations[route].name)
      expect(summary.organizationEndingId).toBe('')
      expect(summary.activePartner).toBe('none')
      expect(summary.relationshipTiers).toEqual({})
      expect(summary.durableFacts).toContain('s1-route-complete')
      expect(summary.durableFacts).toContain('s1-partner-none')
      expect(validateSeason1OutcomeSummary(summary).ok).toBe(true)
    }
  })

  it('org1 是公共机构而非第二季活跃路线，回顾建档显式拒绝', () => {
    expect(() => buildRecapSummary('org1', 'none', organizations)).toThrow(/不支持该路线/)
  })

  it('绑定伴侣时仅填该伴侣 100 层级，且不声称结局', () => {
    const summary = buildRecapSummary('org2', 'qifu', organizations)
    expect(summary.activePartner).toBe('qifu')
    expect(summary.relationshipTiers).toEqual({ qifu: 100 })
    expect(summary.durableFacts).toContain('s1-partner-bonded')
    expect(summary.durableFacts).not.toContain('s1-org-ending')
    expect(validateSeason1OutcomeSummary(summary).ok).toBe(true)
  })

  it('非法路线抛错', () => {
    expect(() => buildRecapSummary('org9' as never, 'none', organizations)).toThrow()
  })

  it('非可恋爱角色作为伴侣抛错', () => {
    expect(() => buildRecapSummary('org2', 'crowd' as never, organizations)).toThrow()
  })

  it('recap 与相同内容的 save 摘要 digest 去重，但 source 标记不同', () => {
    const recap = buildRecapSummary('org2', 'none', organizations)
    const fromSave = {
      ...recap,
      source: { kind: 'save', slot: '1', savedAt: 1700000000000 } as const,
      createdAt: 1700000000000,
    }
    expect(computeOutcomeDigest(recap)).toBe(computeOutcomeDigest(fromSave))
    expect(recap.source.kind).toBe('recap')
    expect(fromSave.source.kind).toBe('save')
  })
})

describe('2.2 片段跳过建档 buildSkipSummary', () => {
  const legalRoutes = ['org2', 'org3', 'org4', 'org5', 'org6'] as const

  it('仅路线 + 无伴侣 + 空 flavor 生成通过校验的 skip 摘要', () => {
    for (const route of legalRoutes) {
      const summary = buildSkipSummary(route, 'none', [], organizations)
      expect(summary.source.kind).toBe('recap')
      expect(summary.route).toBe(route)
      expect(summary.durableFacts).toContain('s1-route-complete')
      expect(summary.durableFacts).toContain('s1-partner-none')
      expect(validateSeason1OutcomeSummary(summary).ok).toBe(true)
    }
  })

  it('片段跳过同样拒绝非活跃的 org1 路线', () => {
    expect(() => buildSkipSummary('org1', 'none', [], organizations)).toThrow(/不支持该路线/)
  })

  it('勾选 flavor 片段被追加进 durableFacts', () => {
    const summary = buildSkipSummary('org6', 'yyt', ['s1-charter-written'], organizations)
    expect(summary.activePartner).toBe('yyt')
    expect(summary.durableFacts).toContain('s1-partner-bonded')
    expect(summary.durableFacts).toContain('s1-charter-written')
    expect(validateSeason1OutcomeSummary(summary).ok).toBe(true)
  })

  it('非白名单 flavor 事实被静默丢弃，不进入 durableFacts', () => {
    const summary = buildSkipSummary('org5', 'none', ['s1-fire-two', 'fake-fact'], organizations)
    expect(summary.durableFacts).toContain('s1-fire-two')
    expect(summary.durableFacts).not.toContain('fake-fact')
  })

  it('非法路线或伴侣抛错', () => {
    expect(() => buildSkipSummary('org9' as never, 'none', [], organizations)).toThrow()
    expect(() => buildSkipSummary('org2', 'crowd' as never, [], organizations)).toThrow()
  })
})

// ─── 第二季结局摘要与记录 · 验证与提取 ───

describe('2.9 第二季结局摘要与记录', () => {
  const makeState = (overrides: Partial<ReturnType<typeof createInitialGameState>> = {}) => ({
    ...createInitialGameState({ playerName: 'S2-Player' }),
    route: 'org3' as const,
    organization: 'org3' as const,
    organizationName: '抚梅观清雪',
    activePartner: 'shana' as const,
    flags: { ...createInitialGameState({ playerName: 'S2-Player' }).flags, s2Complete: true, s2EpilogueComplete: true },
    variables: {
      s2MainEnding: 's2-ending-org3-triumph',
      s2EpilogueEnding: 's2-ending-org3-triumph',
      s2RelationshipResolved: 'shana',
    },
    stats: { cohesion: 72, reputation: 58, resources: 90 },
    unlockedEndings: [
      's2-ending-org3-triumph',
      's2-ending-org3-compromise',
      's2-finale-complete',
      's1-old-ending-xyz',
    ],
    ...overrides,
  } as ReturnType<typeof createInitialGameState>)

  it('extractSeason2Summary 提取完整 S2 字段', () => {
    const state = makeState()
    const summary = extractSeason2Summary(state)
    expect(summary.s2MainEnding).toBe('s2-ending-org3-triumph')
    expect(summary.s2RelationshipResolved).toBe('shana')
    expect(summary.activePartner).toBe('shana')
    expect(summary.route).toBe('org3')
    expect(summary.stats.cohesion).toBe(72)
    expect(summary.summaryVersion).toBe(2)
    expect(summary.finaleEndingId).toBe('s2-finale-complete')
    expect(summary.s2Complete).toBe(true)
    expect(summary.unlockedEndings).toEqual([
      's2-ending-org3-triumph',
      's2-ending-org3-compromise',
      's2-finale-complete',
    ])
    expect(isSeason2OutcomeSummary(summary)).toBe(true)
  })

  it('extractSeason2Summary 过滤非 s2- 前缀的结局', () => {
    const state = makeState()
    const summary = extractSeason2Summary(state)
    expect(summary.unlockedEndings).not.toContain('s1-old-ending-xyz')
  })

  it('extractSeason2Summary 处理空变量（缺省值）', () => {
    const state = createInitialGameState({ playerName: 'Fresh' })
    const summary = extractSeason2Summary(state)
    expect(summary.s2MainEnding).toBe('')
    expect(summary.s2EpilogueEnding).toBe('')
    expect(summary.s2RelationshipResolved).toBe('none')
    expect(summary.activePartner).toBeNull()
    expect(summary.route).toBeNull()
    expect(summary.organization).toBeNull()
    expect(summary.unlockedEndings).toEqual([])
  })

  it('Season2OutcomeSummary 验证器拒绝非法字段', () => {
    const state = makeState()
    const valid = extractSeason2Summary(state)
    expect(isSeason2OutcomeSummary(valid)).toBe(true)

    expect(isSeason2OutcomeSummary({ ...valid, summaryVersion: -1 })).toBe(false)
    expect(isSeason2OutcomeSummary({ ...valid, s2MainEnding: 42 })).toBe(false)
    expect(isSeason2OutcomeSummary({ ...valid, activePartner: 'zeus' })).toBe(false)
    expect(isSeason2OutcomeSummary({ ...valid, activePartner: 'narrator' })).toBe(false)
  })

  it('Season2OutcomeRecord 验证器通过/拒绝', () => {
    const state = makeState()
    const summary = extractSeason2Summary(state)
    const record = buildSeason2OutcomeRecord(summary, 'r0')
    expect(record.recordId).toMatch(/^s2-outcome-/)
    expect(record.digest).toBe(record.recordId.slice('s2-outcome-'.length))
    expect(isSeason2OutcomeRecord(record)).toBe(true)

    expect(isSeason2OutcomeRecord({ ...record, digest: '' })).toBe(false)
    expect(isSeason2OutcomeRecord({ ...record, recordId: '' })).toBe(false)
    expect(isSeason2OutcomeRecord({ ...record, summary: { ...summary, s2MainEnding: 1 } })).toBe(false)
  })

  it('computeSeason2OutcomeDigest 相同内容幂等', () => {
    const state = makeState()
    const a = extractSeason2Summary(state)
    const b = extractSeason2Summary(state)
    expect(computeSeason2OutcomeDigest(a)).toBe(computeSeason2OutcomeDigest(b))
  })

  it('computeSeason2OutcomeDigest 不同内容应不同', () => {
    const a = extractSeason2Summary(makeState())
    const b = extractSeason2Summary(makeState({
      variables: { s2MainEnding: 's2-ending-org3-compromise', s2EpilogueEnding: 's2-ending-org3-compromise', s2RelationshipResolved: 'shana' },
    }))
    expect(computeSeason2OutcomeDigest(a)).not.toBe(computeSeason2OutcomeDigest(b))
  })

  it('v1 summary 只在三项完成证据齐全时迁移为完整 v2', () => {
    const current = extractSeason2Summary(makeState())
    const legacy = {
      ...current,
      summaryVersion: 1 as const,
      source: undefined,
      durableFacts: undefined,
      s2Complete: undefined,
      s2EpilogueComplete: undefined,
      finaleEndingId: undefined,
      completionEvidence: undefined,
    }
    const raw = JSON.parse(JSON.stringify(legacy))
    const migrated = migrateSeason2OutcomeSummary(raw)
    expect(migrated?.source).toEqual({ kind: 'legacy', originalSummaryVersion: 1 })
    expect(migrated?.s2Complete).toBe(true)
    expect(migrated?.completionEvidence).toBe('legacy-derived')
    expect(raw.summaryVersion).toBe(1)
  })

  it('v1 summary 缺 finale 证据时不会被冒充为完整通关', () => {
    const current = extractSeason2Summary(makeState())
    const { source: _source, durableFacts: _facts, s2Complete: _complete, s2EpilogueComplete: _epilogue,
      finaleEndingId: _finale, completionEvidence: _evidence, ...legacy } = current
    const migrated = migrateSeason2OutcomeSummary({ ...legacy, summaryVersion: 1, unlockedEndings: [] })
    expect(migrated?.s2Complete).toBe(false)
    expect(migrated?.finaleEndingId).toBeNull()
  })

  it('record 迁移保留 legacy identity/digest 且不修改输入', () => {
    const current = extractSeason2Summary(makeState())
    const { source: _source, durableFacts: _facts, s2Complete: _complete, s2EpilogueComplete: _epilogue,
      finaleEndingId: _finale, completionEvidence: _evidence, ...legacyFields } = current
    const legacySummary = { ...legacyFields, summaryVersion: 1 as const }
    const digest = computeSeason2OutcomeDigestV1(legacySummary)
    const legacy = { recordId: `s2-outcome-${digest}`, digest, summary: legacySummary, contentRevision: 'old', createdAt: 1 }
    const before = JSON.stringify(legacy)
    const migrated = migrateSeason2OutcomeRecord(legacy)
    expect(migrated?.recordId).toBe(`s2-outcome-${digest}`)
    expect(migrated?.digest).toBe(digest)
    expect(JSON.stringify(legacy)).toBe(before)
    expect(migrateSeason2OutcomeRecord(migrated)).toEqual(migrated)
  })

  it('未知未来 summary 版本被隔离', () => {
    expect(migrateSeason2OutcomeSummary({ summaryVersion: 99 })).toBeNull()
  })

  it('continuityProfile 接受嵌套 JSON，拒绝非 JSON 值和稀疏数组', () => {
    expect(isContinuityProfile({ source: { kind: 'recap', facts: ['a', null] } })).toBe(true)
    expect(isContinuityProfile({ bad: Number.NaN })).toBe(false)
    expect(isContinuityProfile({ bad: new Date() })).toBe(false)
    expect(isContinuityProfile({ bad: new Map() })).toBe(false)
    const sparse = Array(2) as unknown[]
    sparse[1] = 'x'
    expect(isContinuityProfile({ bad: sparse })).toBe(false)
  })
})
