import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createInitialGameState } from './state'
import { buildSeason3OutcomeRecord, isSeason3OutcomeRecord } from './season3-outcome'
import { deleteSeason3OutcomeRecord, readSeason3OutcomeArchive, writeSeason3OutcomeRecord } from './season3-outcome-storage'

class MemoryStorage implements Storage {
  values = new Map<string, string>()
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

const completedState = () => {
  const state = createInitialGameState({ playerName: '档案玩家' })
  state.route = 'org4'
  state.organization = 'org4'
  state.organizationName = '镜花水月'
  state.activePartner = 'yanqiu'
  state.variables.s3Partner = 'yanqiu'
  state.variables.s3MainEnding = 's3-ending-org4-safeguard'
  state.variables.s3RelationshipResolution = 'together'
  state.variables.s3Commitment = 'coalition'
  state.variables.s3Pledge = 'shared'
  state.variables.s3MidpointGoal = 'reform'
  state.variables.s3FinalStance = 'unite'
  state.flags.s3Complete = true
  state.flags.s3EpilogueComplete = true
  state.unlockedEndings.push('s3-ending-org4-safeguard', 's3-finale-complete')
  return state
}

describe('第三季结果档案', () => {
  it('完整季终生成可验证、幂等且独立的不可变记录', () => {
    const record = buildSeason3OutcomeRecord({
      state: completedState(), sourceOutcomeRecordId: 's2-source', lineageId: 'lineage',
      campaignId: 'campaign', contentRevision: 'r2', completedAt: 100,
    })
    expect(isSeason3OutcomeRecord(record)).toBe(true)
    expect(record.summary.relationshipSubject).toBe('yanqiu')
    expect(writeSeason3OutcomeRecord(record)).toEqual(record)
    expect(writeSeason3OutcomeRecord(record)).toEqual(record)
    expect(readSeason3OutcomeArchive()).toEqual([record])
    expect(deleteSeason3OutcomeRecord(record.recordId)).toBe(true)
    expect(readSeason3OutcomeArchive()).toEqual([])
  })

  it('分开或破裂时仍保留关系对象，瓶与真理兼容关系也可归档', () => {
    const separated = completedState()
    separated.activePartner = null
    separated.variables.s3RelationshipResolution = 'apart-understood'
    const separatedRecord = buildSeason3OutcomeRecord({
      state: separated, sourceOutcomeRecordId: 's2', lineageId: 'l', campaignId: 'c', contentRevision: 'r2',
    })
    expect(separatedRecord.summary.relationshipSubject).toBe('yanqiu')
    expect(separatedRecord.summary.activePartner).toBeNull()

    const bottle = completedState()
    bottle.activePartner = null
    bottle.variables.s3Partner = 'bottle'
    const bottleRecord = buildSeason3OutcomeRecord({
      state: bottle, sourceOutcomeRecordId: 's2', lineageId: 'l', campaignId: 'c', contentRevision: 'r2',
    })
    expect(bottleRecord.summary.relationshipSubject).toBe('bottle')
  })

  it('缺少完成证明或路线与结局矛盾时拒绝归档', () => {
    const incomplete = completedState()
    incomplete.flags.s3Complete = false
    expect(() => buildSeason3OutcomeRecord({ state: incomplete, sourceOutcomeRecordId: 's2', lineageId: 'l', campaignId: 'c', contentRevision: 'r2' })).toThrow()

    const mismatch = completedState()
    mismatch.route = 'org3'
    mismatch.organization = 'org3'
    expect(() => buildSeason3OutcomeRecord({ state: mismatch, sourceOutcomeRecordId: 's2', lineageId: 'l', campaignId: 'c', contentRevision: 'r2' })).toThrow()
  })
})
