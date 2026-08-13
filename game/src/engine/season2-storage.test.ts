import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { deleteSave, writeSave } from '@/engine/storage'
import { createInitialGameState } from '@/engine/state'
import {
  appendCollectionV2Seen,
  deleteOutcomeRecord,
  deleteSaveV5,
  deleteSeason2OutcomeRecord,
  exportS2OutcomeArchive,
  findOutcomeRecordByDigest,
  findSeason2OutcomeRecordByDigest,
  importS2OutcomeArchive,
  listSavesV5,
  mergeCollectionV2,
  readCollectionV2,
  readOutcomeArchive,
  readSaveV5,
  readSeason2OutcomeArchive,
  supersedeS2OutcomeRecord,
  writeOutcomeRecord,
  writeSaveV5,
  writeSeason2OutcomeRecord,
} from './season2-storage'
import { makeV5State, SAMPLE_DIGEST, SAMPLE_RECORD, SAMPLE_SUMMARY } from '@/content/season2/fixtures'
import { buildOutcomeRecord, computeSeason2OutcomeDigestV1, extractSeason2Summary, buildSeason2OutcomeRecord } from './season2-outcome'

class MemoryStorage implements Storage {
  readonly values = new Map<string, string>()
  get length() { return this.values.size }
  clear() { this.values.clear() }
  getItem(key: string) { return this.values.get(key) ?? null }
  key(index: number) { return [...this.values.keys()][index] ?? null }
  removeItem(key: string) { this.values.delete(key) }
  setItem(key: string, value: string) { this.values.set(key, String(value)) }
}

beforeEach(() => {
  const storage = new MemoryStorage()
  vi.stubGlobal('localStorage', storage)
  vi.stubGlobal('window', { localStorage: storage })
})
afterEach(() => vi.unstubAllGlobals())

describe('2.2 收藏 v2', () => {
  it('mergeCollectionV2 去重并写入独立键', () => {
    const v5 = makeV5State()
    v5.seenNodes = ['s2-prologue-entry', 's2-prologue-entry']
    v5.unlockedEndings = ['s2-bond-qifu']
    const merged = mergeCollectionV2(v5)
    expect(merged.seenNodes).toEqual(['s2-prologue-entry'])
    expect(merged.unlockedEndings).toEqual(['s2-bond-qifu'])
    // 再次读取仍来自 v2 键
    expect(readCollectionV2()).toEqual(merged)
  })

  it('appendCollectionV2Seen 仅追加 s2- 节点，非法前缀被忽略', () => {
    const after = appendCollectionV2Seen('s2-prologue-entry')
    expect(after.seenNodes).toEqual(['s2-prologue-entry'])
    const unchanged = appendCollectionV2Seen('p00-opening')
    expect(unchanged.seenNodes).toEqual(['s2-prologue-entry'])
  })

  it('v2 缺失时回退只读旧收藏，不写入 v2', () => {
    // 旧收藏键存在
    localStorage.setItem('4945-vn:collection', JSON.stringify({
      seenNodes: ['old-node'], unlockedCgs: ['cg-x'], unlockedEndings: ['end-y'],
    }))
    const fallback = readCollectionV2()
    expect(fallback.seenNodes).toContain('old-node')
    // 回退读取不应创建 v2 键
    expect(localStorage.getItem('4945-vn:v2:collection')).toBeNull()
  })
})

describe('2.2 outcome archive', () => {
  it('写入并去重（相同 digest 幂等）', () => {
    const r1 = writeOutcomeRecord(SAMPLE_RECORD)
    const r2 = writeOutcomeRecord(buildOutcomeRecord(SAMPLE_SUMMARY, 'r0'))
    expect(r1.recordId).toBe(r2.recordId)
    expect(readOutcomeArchive()).toHaveLength(1)
    expect(findOutcomeRecordByDigest(SAMPLE_DIGEST)?.recordId).toBe(SAMPLE_RECORD.recordId)
  })

  it('不同 digest 追加为第二条', () => {
    const other = buildOutcomeRecord({ ...SAMPLE_SUMMARY, route: 'org3' }, 'r0')
    writeOutcomeRecord(SAMPLE_RECORD)
    writeOutcomeRecord(other)
    expect(readOutcomeArchive()).toHaveLength(2)
  })

  it('按 recordId 删除单条档案', () => {
    writeOutcomeRecord(SAMPLE_RECORD)
    expect(deleteOutcomeRecord(SAMPLE_RECORD.recordId)).toBe(true)
    expect(readOutcomeArchive()).toHaveLength(0)
    expect(deleteOutcomeRecord(SAMPLE_RECORD.recordId)).toBe(false)
  })
})

describe('2.2 v5 存档与隔离不变量', () => {
  it('writeSaveV5 / readSaveV5 往返', () => {
    const v5 = makeV5State()
    const record = writeSaveV5('1', v5)
    expect(record.schemaVersion).toBe(5)
    const read = readSaveV5('1')
    expect(read?.state.campaignId).toBe('campaign-sample')
    expect(read?.state.schemaVersion).toBe(5)
    expect(listSavesV5().some((m) => m?.slot === '1')).toBe(true)
  })

  it('非结构合法 v5 状态被拒写入', () => {
    const bad = { ...makeV5State(), seasonId: '' }
    expect(() => writeSaveV5('2', bad)).toThrow()
    expect(readSaveV5('2')).toBeNull()
  })

  it('删除 v5 存档不触碰 v4 来源档', () => {
    const v4 = createInitialGameState({ playerName: 'v4' })
    writeSave('1', v4)
    writeSaveV5('1', makeV5State())
    deleteSaveV5('1')
    expect(readSaveV5('1')).toBeNull()
    // v4 来源档仍在（不同键，互不干扰）
    expect(localStorage.getItem('4945-vn:v4:save:1')).not.toBeNull()
  })

  it('删除普通 v4 存档不删除 outcome archive', () => {
    writeOutcomeRecord(SAMPLE_RECORD)
    const v4 = createInitialGameState({ playerName: 'v4' })
    writeSave('auto', v4)
    deleteSave('auto')
    expect(localStorage.getItem('4945-vn:v4:save:auto')).toBeNull()
    expect(readOutcomeArchive()).toHaveLength(1)
    expect(findOutcomeRecordByDigest(SAMPLE_DIGEST)).not.toBeNull()
  })
})

// ─── 第二季结局档案 · 存储隔离 ───

describe('S2 outcome archive 存储', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  const makeS2Record = () => {
    const base = createInitialGameState({ playerName: 'S2-Archive' })
    const summary = extractSeason2Summary({
      ...base,
      route: 'org4' as const,
      organization: 'org4' as const,
      organizationName: '天上白玉京',
      activePartner: 'yanqiu' as const,
      flags: { ...base.flags, s2Complete: true, s2EpilogueComplete: true },
      variables: {
        ...base.variables,
        s2MainEnding: 's2-ending-org4-triumph',
        s2EpilogueEnding: 's2-ending-org4-triumph',
        s2RelationshipResolved: 'yanqiu',
      },
      stats: {
        ...base.stats,
        cohesion: 88,
        reputation: 65,
        resources: 95,
      },
      unlockedEndings: ['s2-ending-org4-triumph', 's2-finale-complete'],
    }, { source: { kind: 'save', slot: '1', savedAt: 1 }, createdAt: 1 })
    return buildSeason2OutcomeRecord(summary, '3.0.0-rc.1')
  }

  it('写入 S2 record → 读回', () => {
    const r = makeS2Record()
    const written = writeSeason2OutcomeRecord(r)
    expect(written.recordId).toBe(r.recordId)

    const archive = readSeason2OutcomeArchive()
    expect(archive).toHaveLength(1)
    expect(archive[0]!.digest).toBe(r.digest)
  })

  it('相同 digest 幂等写入不重复', () => {
    const r = makeS2Record()
    writeSeason2OutcomeRecord(r)
    writeSeason2OutcomeRecord(r)
    expect(readSeason2OutcomeArchive()).toHaveLength(1)
  })

  it('按 digest 查找', () => {
    const r = makeS2Record()
    writeSeason2OutcomeRecord(r)
    const found = findSeason2OutcomeRecordByDigest(r.digest)
    expect(found).not.toBeNull()
    expect(found!.summary.route).toBe('org4')
  })

  it('删除单条', () => {
    const r = makeS2Record()
    writeSeason2OutcomeRecord(r)
    expect(readSeason2OutcomeArchive()).toHaveLength(1)
    const ok = deleteSeason2OutcomeRecord(r.recordId)
    expect(ok).toBe(true)
    expect(readSeason2OutcomeArchive()).toHaveLength(0)
  })

  it('删除不存在的 recordId 返回 false', () => {
    expect(deleteSeason2OutcomeRecord('absent')).toBe(false)
  })

  it('S2 archive 键与 v1 outcome archive 键互不干扰', () => {
    writeSeason2OutcomeRecord(makeS2Record())
    writeOutcomeRecord(SAMPLE_RECORD)
    expect(readSeason2OutcomeArchive()).toHaveLength(1)
    expect(readOutcomeArchive()).toHaveLength(1)
    deleteSeason2OutcomeRecord(makeS2Record().recordId)
    // 仅 S2 档案被删，v1 outcome 毫发无伤
    expect(readOutcomeArchive()).toHaveLength(1)
  })

  it('空 localStorage 读回空数组', () => {
    expect(readSeason2OutcomeArchive()).toEqual([])
    expect(findSeason2OutcomeRecordByDigest('nonexistent')).toBeNull()
  })

  // ─── V3.1: lineageId / campaignId 传播 ───
  it('buildSeason2OutcomeRecord 携带 lineageId 和 campaignId', () => {
    const withLineage = buildSeason2OutcomeRecord(
      extractSeason2Summary({
        ...createInitialGameState({ playerName: 'lineage-test' }),
        route: 'org4' as const,
        organization: 'org4' as const,
        organizationName: 'lineage org',
        activePartner: null,
        variables: {
          s2MainEnding: 's2-ending-org4-compromise',
          s2EpilogueEnding: 's2-ending-org4-compromise',
          s2RelationshipResolved: 'none',
        },
        stats: { level: 5, power: 50, skill: 50, money: 500, reputation: 50, cohesion: 50, resources: 50, evidence: 0, contribution: 100 },
        unlockedEndings: ['s2-ending-org4-compromise'],
      }),
      '3.0.0-rc.1',
      'lineage-sample-abc',
      'campaign-sample-xyz',
    )
    expect(withLineage.lineageId).toBe('lineage-sample-abc')
    expect(withLineage.campaignId).toBe('campaign-sample-xyz')
  })

  it('不传 lineageId/campaignId 时字段不存在', () => {
    const r = makeS2Record()
    expect(r.lineageId).toBeUndefined()
    expect(r.campaignId).toBeUndefined()
  })

  // ─── V3.1: 导出/导入 ───
  it('导出空归档产生合法 JSON', () => {
    const json = exportS2OutcomeArchive()
    const parsed = JSON.parse(json)
    expect(parsed.format).toBe('4945-s2-outcome-archive')
    expect(parsed.recordCount).toBe(0)
    expect(parsed.records).toEqual([])
  })

  it('导出/导入往返：digest 去重', () => {
    const r = makeS2Record()
    writeSeason2OutcomeRecord(r)
    const exported = exportS2OutcomeArchive()
    // 清空再导入
    localStorage.clear()
    const result = importS2OutcomeArchive(exported)
    expect(result.imported).toBe(1)
    expect(result.skipped).toBe(0)
    expect(readSeason2OutcomeArchive()).toHaveLength(1)
  })

  it('重复导入已有的 record 被跳过', () => {
    const r = makeS2Record()
    writeSeason2OutcomeRecord(r)
    const exported = exportS2OutcomeArchive()
    const result = importS2OutcomeArchive(exported)
    expect(result.imported).toBe(0)
    expect(result.skipped).toBe(1)
  })

  it('导入非法 JSON 返回 0/0', () => {
    const result = importS2OutcomeArchive('not json')
    expect(result.imported).toBe(0)
    expect(result.skipped).toBe(0)
  })

  it('导入格式不对（缺少 format 字段）返回 0/0', () => {
    const result = importS2OutcomeArchive(JSON.stringify({ records: [] }))
    expect(result.imported).toBe(0)
    expect(result.skipped).toBe(0)
  })

  it('导入部分新 + 部分已有混合计数正确', () => {
    const r1 = makeS2Record()
    writeSeason2OutcomeRecord(r1)
    const exported = exportS2OutcomeArchive()
    localStorage.clear()
    // 先导入一次，再导入第二次（全量重复）
    importS2OutcomeArchive(exported)
    const result2 = importS2OutcomeArchive(exported)
    expect(result2.imported).toBe(0)
    expect(result2.skipped).toBe(1)
  })

  // ─── V3.1: supersede ───
  it('supersedeS2OutcomeRecord 标记记录为被取代', () => {
    const r = makeS2Record()
    writeSeason2OutcomeRecord(r)

    const ok = supersedeS2OutcomeRecord(r.recordId, 'new-record-id', '重新游玩同一路线得到不同结局')
    expect(ok).toBe(true)

    const archive = readSeason2OutcomeArchive()
    const superseded = archive.find((x) => x.recordId === r.recordId)!
    expect(superseded.supersededBy).toBeDefined()
    expect(superseded.supersededBy!.byRecordId).toBe('new-record-id')
    expect(superseded.supersededBy!.reason).toBe('重新游玩同一路线得到不同结局')
    expect(superseded.supersededBy!.supersededAt).toBeGreaterThan(0)
  })

  it('supersede 不存在的 recordId 返回 false', () => {
    const ok = supersedeS2OutcomeRecord('nonexistent', 'x', 'reason')
    expect(ok).toBe(false)
  })

  it('读取 v1 归档只迁移内存视图，不改写原始 JSON', () => {
    const current = makeS2Record()
    const { source: _source, durableFacts: _facts, s2Complete: _complete, s2EpilogueComplete: _epilogue,
      finaleEndingId: _finale, completionEvidence: _evidence, ...legacyFields } = current.summary
    const legacySummary = { ...legacyFields, summaryVersion: 1 as const }
    const digest = computeSeason2OutcomeDigestV1(legacySummary)
    const legacy = { ...current, recordId: `s2-outcome-${digest}`, digest, summary: legacySummary }
    const raw = JSON.stringify([legacy], null, 2)
    localStorage.setItem('4945-vn:v2:outcomes', raw)

    const migrated = readSeason2OutcomeArchive()
    expect(migrated[0]?.summary.summaryVersion).toBe(2)
    expect(migrated[0]?.summary.source.kind).toBe('legacy')
    expect(localStorage.getItem('4945-vn:v2:outcomes')).toBe(raw)
  })

  it('同内容新 v2 写入会复用 legacy 记录并保持原始字节', () => {
    const current = makeS2Record()
    const { source: _source, durableFacts: _facts, s2Complete: _complete, s2EpilogueComplete: _epilogue,
      finaleEndingId: _finale, completionEvidence: _evidence, ...legacyFields } = current.summary
    const legacySummary = { ...legacyFields, summaryVersion: 1 as const }
    const digest = computeSeason2OutcomeDigestV1(legacySummary)
    const legacy = { ...current, recordId: `s2-outcome-${digest}`, digest, summary: legacySummary }
    const raw = JSON.stringify([legacy], null, 2)
    localStorage.setItem('4945-vn:v2:outcomes', raw)

    expect(writeSeason2OutcomeRecord(current).recordId).toBe(`s2-outcome-${digest}`)
    expect(localStorage.getItem('4945-vn:v2:outcomes')).toBe(raw)
  })

  it('重复导入不触发归档重写', () => {
    const record = makeS2Record()
    writeSeason2OutcomeRecord(record)
    const rawBefore = localStorage.getItem('4945-vn:v2:outcomes')
    const result = importS2OutcomeArchive(JSON.stringify({ format: '4945-s2-outcome-archive', records: [record] }))
    expect(result).toEqual({ imported: 0, skipped: 1 })
    expect(localStorage.getItem('4945-vn:v2:outcomes')).toBe(rawBefore)
  })

  it('未来版本与损坏项被隔离但不删除', () => {
    const raw = JSON.stringify([{ recordId: 'future', digest: 'x', contentRevision: 'x', createdAt: 1, summary: { summaryVersion: 99 } }])
    localStorage.setItem('4945-vn:v2:outcomes', raw)
    expect(readSeason2OutcomeArchive()).toEqual([])
    expect(localStorage.getItem('4945-vn:v2:outcomes')).toBe(raw)
  })

  it('拒绝写入缺完成证明的 v2 record', () => {
    const record = makeS2Record()
    record.summary.s2Complete = false
    expect(() => writeSeason2OutcomeRecord(record)).toThrow(/不完整/)
    expect(localStorage.getItem('4945-vn:v2:outcomes')).toBeNull()
  })
})

describe('schema5 continuityProfile JSON 隔离', () => {
  it('嵌套 profile 可往返且读取结果与源对象隔离', () => {
    const state = makeV5State()
    state.continuityProfile = { source: { kind: 'recap', facts: ['a', null] }, warnings: [] }
    writeSaveV5('1', state)
    const loaded = readSaveV5('1')!.state
    expect(loaded.continuityProfile).toEqual(state.continuityProfile)
    ;(state.continuityProfile.warnings as string[]).push('late mutation')
    expect(loaded.continuityProfile.warnings).toEqual([])
  })

  it('拒绝会在 JSON 序列化中丢失的 profile 值', () => {
    const state = makeV5State()
    state.continuityProfile = { invalid: new Date() } as never
    expect(() => writeSaveV5('2', state)).toThrow(/结构合法/)
  })
})
