import { describe, it, expect } from 'vitest'
import {
  CONTINUITY_DEBT_LEDGER,
  filterDebtsByCategory,
  getResolvedDebts,
  getUnresolvedDebts,
  getEffectiveDebts,
  validateLedger,
  type ContinuityDebtLedger,
} from './continuity-ledger'

describe('ContinuityDebtLedger', () => {
  describe('总账结构', () => {
    it('版本号为 3.1.0', () => {
      expect(CONTINUITY_DEBT_LEDGER.version).toBe('3.1.0')
    })

    it('包含 10 条债务', () => {
      expect(CONTINUITY_DEBT_LEDGER.totalDebts).toBe(10)
      expect(CONTINUITY_DEBT_LEDGER.entries).toHaveLength(10)
    })

    it('类别覆盖完整', () => {
      const categories = ['fix-only', 'retire', 'promote-to-s3', 'close-in-3.1', 'reject'] as const
      for (const cat of categories) {
        expect(CONTINUITY_DEBT_LEDGER.byCategory).toHaveProperty(cat)
      }
    })

    it('所有条目 id 唯一', () => {
      const ids = CONTINUITY_DEBT_LEDGER.entries.map((e) => e.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('所有条目有 resolution', () => {
      for (const entry of CONTINUITY_DEBT_LEDGER.entries) {
        expect(entry.resolution).toBeTruthy()
        expect(entry.resolution.trim().length).toBeGreaterThan(0)
      }
    })

    it('所有条目 resolvedAt = 2026-08-06（3.1 发布日）', () => {
      for (const entry of CONTINUITY_DEBT_LEDGER.entries) {
        expect(entry.resolvedAt).toBe('2026-08-06')
      }
    })
  })

  describe('类别分类', () => {
    it('fix-only: 3 条', () => {
      const items = filterDebtsByCategory(CONTINUITY_DEBT_LEDGER, 'fix-only')
      expect(items).toHaveLength(3)
      const ids = items.map((i) => i.id).sort()
      expect(ids).toEqual(['cd-001', 'cd-002', 'cd-003'])
    })

    it('retire: 2 条', () => {
      const items = filterDebtsByCategory(CONTINUITY_DEBT_LEDGER, 'retire')
      expect(items).toHaveLength(2)
      const ids = items.map((i) => i.id).sort()
      expect(ids).toEqual(['cd-004', 'cd-005'])
    })

    it('promote-to-s3: 2 条', () => {
      const items = filterDebtsByCategory(CONTINUITY_DEBT_LEDGER, 'promote-to-s3')
      expect(items).toHaveLength(2)
      const ids = items.map((i) => i.id).sort()
      expect(ids).toEqual(['cd-006', 'cd-007'])
    })

    it('close-in-3.1: 2 条', () => {
      const items = filterDebtsByCategory(CONTINUITY_DEBT_LEDGER, 'close-in-3.1')
      expect(items).toHaveLength(2)
      const ids = items.map((i) => i.id).sort()
      expect(ids).toEqual(['cd-008', 'cd-009'])
    })

    it('reject: 1 条', () => {
      const items = filterDebtsByCategory(CONTINUITY_DEBT_LEDGER, 'reject')
      expect(items).toHaveLength(1)
      expect(items[0]!.id).toBe('cd-010')
    })
  })

  describe('fix-only 条目内容', () => {
    const fixOnly = filterDebtsByCategory(CONTINUITY_DEBT_LEDGER, 'fix-only')

    it('cd-001: S2 结局注册已补登', () => {
      const e = fixOnly.find((x) => x.id === 'cd-001')!
      expect(e.source).toBe('s2-postmortem-3')
      expect(e.relatedIds).toBeDefined()
      expect(e.relatedIds!.length).toBe(11) // 10 endings + 1 finale marker
    })

    it('cd-002: 羁绊结局详情已补全', () => {
      const e = fixOnly.find((x) => x.id === 'cd-002')!
      expect(e.source).toBe('s2-postmortem-3')
      expect(e.relatedIds).toBeDefined()
      expect(e.relatedIds!.length).toBe(12)
    })

    it('cd-003: s2EpilogueEnding 变量已验证写入', () => {
      const e = fixOnly.find((x) => x.id === 'cd-003')!
      expect(e.source).toBe('s2-postmortem-3')
      expect(e.resolution).toContain('无遗漏')
    })
  })

  describe('retire 条目内容', () => {
    const retired = filterDebtsByCategory(CONTINUITY_DEBT_LEDGER, 'retire')

    it('cd-004/cd-005: 都有 effectiveFrom = 2026-11-30', () => {
      for (const e of retired) {
        expect(e.effectiveFrom).toBe('2026-11-30')
      }
    })
  })

  describe('promote-to-s3 条目内容', () => {
    const promoted = filterDebtsByCategory(CONTINUITY_DEBT_LEDGER, 'promote-to-s3')

    it('cd-006/cd-007: 都标记为 S3 canon 待决', () => {
      for (const e of promoted) {
        expect(e.resolution).toMatch(/S3.*canon/i)
      }
    })
  })

  describe('close-in-3.1 条目内容', () => {
    it('cd-008: KNOWN_DURABLE_FACTS 已定义', () => {
      const e = filterDebtsByCategory(CONTINUITY_DEBT_LEDGER, 'close-in-3.1').find(
        (x) => x.id === 'cd-008',
      )!
      expect(e.relatedIds).toContain('KNOWN_DURABLE_FACTS')
      expect(e.resolution).toMatch(/KNOWN_DURABLE_FACTS.*白名单/)
    })

    it('cd-009: org2 triumph 伏笔不产生补遗内容', () => {
      const e = filterDebtsByCategory(CONTINUITY_DEBT_LEDGER, 'close-in-3.1').find(
        (x) => x.id === 'cd-009',
      )!
      expect(e.resolution).toContain('不产生补遗内容')
    })
  })

  describe('reject 条目内容', () => {
    it('cd-010: S2 结局 CG 拒绝，不做资产新增', () => {
      const e = filterDebtsByCategory(CONTINUITY_DEBT_LEDGER, 'reject')[0]!
      expect(e.title).toContain('CG')
      expect(e.resolution).toContain('不做资产新增')
    })
  })

  describe('filterDebtsByCategory', () => {
    it('返回空数组对于不存在类别', () => {
      const empty = filterDebtsByCategory(
        { version: '1', createdAt: '', totalDebts: 0, byCategory: { 'fix-only': 0, retire: 0, 'promote-to-s3': 0, 'close-in-3.1': 0, reject: 0 }, entries: [] },
        'fix-only',
      )
      expect(empty).toEqual([])
    })
  })

  describe('getResolvedDebts', () => {
    it('所有 10 条都已处理', () => {
      const resolved = getResolvedDebts(CONTINUITY_DEBT_LEDGER)
      expect(resolved).toHaveLength(10)
    })

    it('条目有 resolvedAt 就算已处理', () => {
      const ledger: ContinuityDebtLedger = {
        version: '1',
        createdAt: '',
        totalDebts: 2,
        byCategory: { 'fix-only': 2, retire: 0, 'promote-to-s3': 0, 'close-in-3.1': 0, reject: 0 },
        entries: [
          { id: 'a', category: 'fix-only', source: 's2-postmortem-3', title: '', description: '', resolution: 'r', resolvedAt: 'today' },
          { id: 'b', category: 'fix-only', source: 's2-postmortem-3', title: '', description: '', resolution: 'r' },
        ],
      }
      expect(getResolvedDebts(ledger)).toHaveLength(1)
    })
  })

  describe('getUnresolvedDebts', () => {
    it('3.1 账本全部已处理，无未处理项', () => {
      expect(getUnresolvedDebts(CONTINUITY_DEBT_LEDGER)).toHaveLength(0)
    })
  })

  describe('getEffectiveDebts', () => {
    it('当前日期（2026-08-06）不返回未到期的 retire 条目', () => {
      const effective = getEffectiveDebts(CONTINUITY_DEBT_LEDGER, '2026-08-06')
      const retireIds = effective
        .filter((e) => e.category === 'retire')
        .map((e) => e.id)
      // cd-004 和 cd-005 的 effectiveFrom 是 2026-11-30，当前不应返回
      expect(retireIds).toHaveLength(0)
    })

    it('2026-12-01 返回全部条目', () => {
      const effective = getEffectiveDebts(CONTINUITY_DEBT_LEDGER, '2026-12-01')
      expect(effective).toHaveLength(10)
    })
  })

  describe('validateLedger', () => {
    it('总账通过验证', () => {
      const result = validateLedger(CONTINUITY_DEBT_LEDGER)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('检测 totalDebts 不匹配', () => {
      const ledger: ContinuityDebtLedger = {
        ...CONTINUITY_DEBT_LEDGER,
        totalDebts: 999,
      }
      const result = validateLedger(ledger)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('totalDebts'))).toBe(true)
    })

    it('检测重复 ID', () => {
      const ledger: ContinuityDebtLedger = {
        ...CONTINUITY_DEBT_LEDGER,
        entries: [
          ...CONTINUITY_DEBT_LEDGER.entries,
          { ...CONTINUITY_DEBT_LEDGER.entries[0]! },
        ],
        totalDebts: 11,
      }
      const result = validateLedger(ledger)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('重复'))).toBe(true)
    })

    it('检测空 resolution', () => {
      const ledger: ContinuityDebtLedger = {
        ...CONTINUITY_DEBT_LEDGER,
        entries: [
          { id: 'empty', category: 'fix-only', source: 's2-postmortem-3', title: '', description: '', resolution: '' },
        ],
        totalDebts: 1,
        byCategory: { 'fix-only': 1, retire: 0, 'promote-to-s3': 0, 'close-in-3.1': 0, reject: 0 },
      }
      const result = validateLedger(ledger)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('resolution'))).toBe(true)
    })

    it('检测 byCategory 计数不匹配', () => {
      const ledger: ContinuityDebtLedger = {
        ...CONTINUITY_DEBT_LEDGER,
        byCategory: { ...CONTINUITY_DEBT_LEDGER.byCategory, 'fix-only': 999 },
      }
      const result = validateLedger(ledger)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('byCategory'))).toBe(true)
    })
  })
})
