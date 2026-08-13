/**
 * 《4945区》2.2 存储层（架构阶段，canon 未签认）。
 *
 * 在 schema4 存储之上「非破坏性叠加」三个独立的键，全部与旧键并存：
 *  - 4945-vn:v2:collection     收藏 v2（独立键，旧 4945-vn:collection 保留）
 *  - 4945-vn:v1:outcomes       Season1OutcomeRecord 档案（独立，不占普通存档槽）
 *  - 4945-vn:v5:save:*         事件二 campaign 存档（schema5）
 *
 * 设计约束（SOL-PLAN-2.2 §5/§10）：
 *  - 所有 v4 / v3 / legacy 存档与旧收藏键保留，绝不删除或覆盖来源。
 *  - 损坏或矛盾来源不可选择，但不得被删除、覆盖或静默修复。
 *  - 普通存档删除与 outcome archive 删除彼此隔离（不同键）。
 *  - 本模块不接入运行时 UI；仅由单测与未来（canon 签认后）的 campaign 流程调用。
 */

import type { GameStateV5, Season1OutcomeRecord } from './season2-outcome'
import { isSeason1OutcomeRecord, isStructuralV5State } from './season2-outcome'
import { isFiniteNumber, isPlainObject, isStringArray, isStructurallyValidState, SAVE_SLOTS, type SaveSlot } from './storage'

// 槽位清单与结构守卫统一来自 ./storage，本模块只维护 v5 专属键与读写逻辑。
export type { SaveSlot } from './storage'

const V5_SAVE_PREFIX = '4945-vn:v5:save:'
const COLLECTION_V2_KEY = '4945-vn:v2:collection'
const LEGACY_COLLECTION_KEY = '4945-vn:collection'
const OUTCOME_ARCHIVE_KEY = '4945-vn:v1:outcomes'

const hasStorage = () => typeof window !== 'undefined' && 'localStorage' in window

// ---------------------------------------------------------------------------
// 收藏 v2
// ---------------------------------------------------------------------------

export interface CollectionStateV2 {
  seenNodes: string[]
  unlockedCgs: string[]
  unlockedEndings: string[]
}

const emptyCollectionV2 = (): CollectionStateV2 => ({ seenNodes: [], unlockedCgs: [], unlockedEndings: [] })

const coerceCollection = (value: unknown): CollectionStateV2 => {
  if (!isPlainObject(value)) return emptyCollectionV2()
  const strings = (entry: unknown) => (isStringArray(entry) ? [...new Set(entry)] : [])
  return {
    seenNodes: strings(value.seenNodes),
    unlockedCgs: strings(value.unlockedCgs),
    unlockedEndings: strings(value.unlockedEndings),
  }
}

/**
 * 读收藏 v2。若 v2 键不存在，回退只读旧收藏（不写入 v2），保证旧画廊可见且旧键不被改写。
 */
export const readCollectionV2 = (): CollectionStateV2 => {
  if (!hasStorage()) return emptyCollectionV2()
  const rawV2 = localStorage.getItem(COLLECTION_V2_KEY)
  if (rawV2) {
    try {
      return coerceCollection(JSON.parse(rawV2))
    } catch {
      // 损坏的 v2 键不静默修复，回退旧收藏
    }
  }
  const rawLegacy = localStorage.getItem(LEGACY_COLLECTION_KEY)
  if (rawLegacy) {
    try {
      return coerceCollection(JSON.parse(rawLegacy))
    } catch {
      return emptyCollectionV2()
    }
  }
  return emptyCollectionV2()
}

const writeCollectionV2 = (state: CollectionStateV2): CollectionStateV2 => {
  if (hasStorage()) localStorage.setItem(COLLECTION_V2_KEY, JSON.stringify(state))
  return state
}

/** 合并一次游玩后的收藏到 v2（去重）。不触碰旧键。 */
export const mergeCollectionV2 = (state: Pick<GameStateV5, 'seenNodes' | 'unlockedCgs' | 'unlockedEndings'>): CollectionStateV2 => {
  const existing = readCollectionV2()
  const merged: CollectionStateV2 = {
    seenNodes: [...new Set([...existing.seenNodes, ...state.seenNodes])],
    unlockedCgs: [...new Set([...existing.unlockedCgs, ...state.unlockedCgs])],
    unlockedEndings: [...new Set([...existing.unlockedEndings, ...state.unlockedEndings])],
  }
  return writeCollectionV2(merged)
}

/** 定向追加单个已知节点到 seenNodes（与 2.1 appendCollectionSeen 同语义，作用于 v2）。 */
export const appendCollectionV2Seen = (nodeId: string): CollectionStateV2 => {
  const existing = readCollectionV2()
  if (!/^s[23]-/.test(nodeId)) return existing
  if (existing.seenNodes.includes(nodeId)) return existing
  return writeCollectionV2({
    seenNodes: [...existing.seenNodes, nodeId],
    unlockedCgs: existing.unlockedCgs,
    unlockedEndings: existing.unlockedEndings,
  })
}

// ---------------------------------------------------------------------------
// Outcome archive（Season1OutcomeRecord 档案）
// ---------------------------------------------------------------------------

/** 读全部 record；损坏项跳过（不静默修复、不删除来源）。 */
export const readOutcomeArchive = (): Season1OutcomeRecord[] => {
  if (!hasStorage()) return []
  const raw = localStorage.getItem(OUTCOME_ARCHIVE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isSeason1OutcomeRecord)
  } catch {
    return []
  }
}

const writeOutcomeArchive = (records: Season1OutcomeRecord[]): Season1OutcomeRecord[] => {
  if (hasStorage()) localStorage.setItem(OUTCOME_ARCHIVE_KEY, JSON.stringify(records))
  return records
}

/**
 * 写入（或复用）一条 record：按 digest 去重；相同内容幂等，返回既有 record。
 * 与 2.1 一致：损坏/矛盾来源不会被静默修复成另一结果，也不会覆盖既有不同摘要。
 */
export const writeOutcomeRecord = (record: Season1OutcomeRecord): Season1OutcomeRecord => {
  const archive = readOutcomeArchive()
  const existing = archive.find((r) => r.digest === record.digest)
  if (existing) return existing
  writeOutcomeArchive([...archive, record])
  return record
}

export const findOutcomeRecordByDigest = (digest: string): Season1OutcomeRecord | null => (
  readOutcomeArchive().find((r) => r.digest === digest) ?? null
)

/** 按 recordId 删除单条档案。普通存档删除与此完全隔离（不同键）。 */
export const deleteOutcomeRecord = (recordId: string): boolean => {
  const archive = readOutcomeArchive()
  const next = archive.filter((r) => r.recordId !== recordId)
  if (next.length === archive.length) return false
  writeOutcomeArchive(next)
  return true
}

// ---------------------------------------------------------------------------
// Season2 outcome archive（事件二结局档案，独立键）
// ---------------------------------------------------------------------------

const S2_OUTCOME_ARCHIVE_KEY = '4945-vn:v2:outcomes'

import {
  type Season2OutcomeRecord,
  computeSeason2OutcomeDigest,
  isArchivableSeason2OutcomeRecord,
  isSeason2OutcomeRecord,
  migrateSeason2OutcomeRecord,
} from './season2-outcome'

const readRawS2OutcomeArchive = (): unknown[] => {
  if (!hasStorage()) return []
  const raw = localStorage.getItem(S2_OUTCOME_ARCHIVE_KEY)
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/** 读全部 S2 outcome record；损坏项跳过。 */
export const readSeason2OutcomeArchive = (): Season2OutcomeRecord[] => {
  return readRawS2OutcomeArchive()
    .map(migrateSeason2OutcomeRecord)
    .filter((record): record is Season2OutcomeRecord => record !== null)
}

// Keep legacy objects in their original summary version; migration is a read-only in-memory view.
const writeRawS2OutcomeArchive = (records: unknown[]): unknown[] => {
  if (hasStorage()) localStorage.setItem(S2_OUTCOME_ARCHIVE_KEY, JSON.stringify(records))
  return records
}

/** 写入（或复用）一条 S2 record：按 digest 去重；相同内容幂等。 */
export const writeSeason2OutcomeRecord = (record: Season2OutcomeRecord): Season2OutcomeRecord => {
  if (!isSeason2OutcomeRecord(record) || !isArchivableSeason2OutcomeRecord(record)) {
    throw new Error('拒绝写入不完整或不一致的事件二结局档案。')
  }
  if (record.summary.source.kind === 'legacy') {
    throw new Error('legacy 记录只能保留为原始 v1 数据，不能作为 v2 回写。')
  }
  const rawArchive = readRawS2OutcomeArchive()
  const normalizedDigest = computeSeason2OutcomeDigest(record.summary)
  const existing = rawArchive
    .map(migrateSeason2OutcomeRecord)
    .find((entry) => entry && (
      entry.digest === record.digest
      || computeSeason2OutcomeDigest(entry.summary) === normalizedDigest
    ))
  if (existing) return existing
  writeRawS2OutcomeArchive([...rawArchive, record])
  return record
}

export const findSeason2OutcomeRecordByDigest = (digest: string): Season2OutcomeRecord | null =>
  readSeason2OutcomeArchive().find((r) => r.digest === digest) ?? null

/** 按 recordId 删除单条 S2 档案。与普通存档删除完全隔离。 */
export const deleteSeason2OutcomeRecord = (recordId: string): boolean => {
  const rawArchive = readRawS2OutcomeArchive()
  const next = rawArchive.filter((entry) => migrateSeason2OutcomeRecord(entry)?.recordId !== recordId)
  if (next.length === rawArchive.length) return false
  writeRawS2OutcomeArchive(next)
  return true
}

/** 导出 S2 结局档案原始对象；v1 entry 保持 v1，便于跨设备迁移和回滚。 */
export const exportS2OutcomeArchive = (): string => {
  const records = readRawS2OutcomeArchive()
  return JSON.stringify({
    format: '4945-s2-outcome-archive',
    version: 1,
    exportedAt: Date.now(),
    recordCount: records.length,
    records,
  })
}

/** 导入 S2 结局档案 JSON，按 digest 去重，返回导入/跳过计数。 */
export const importS2OutcomeArchive = (json: string): { imported: number; skipped: number } => {
  let parsed: unknown
  try { parsed = JSON.parse(json) } catch { return { imported: 0, skipped: 0 } }
  if (!isPlainObject(parsed) || parsed.format !== '4945-s2-outcome-archive' || !Array.isArray(parsed.records)) {
    return { imported: 0, skipped: 0 }
  }
  const existingRaw = readRawS2OutcomeArchive()
  const existingDigests = new Set(
    existingRaw.map(migrateSeason2OutcomeRecord).flatMap((record) => (
      record ? [computeSeason2OutcomeDigest(record.summary)] : []
    )),
  )
  let imported = 0
  let skipped = 0
  for (const rawRecord of parsed.records) {
    const record = migrateSeason2OutcomeRecord(rawRecord)
    if (!record || !isArchivableSeason2OutcomeRecord(record)) { skipped++; continue }
    const normalizedDigest = computeSeason2OutcomeDigest(record.summary)
    if (existingDigests.has(normalizedDigest)) { skipped++; continue }
    existingRaw.push(rawRecord)
    existingDigests.add(normalizedDigest)
    imported++
  }
  if (imported > 0) writeRawS2OutcomeArchive(existingRaw)
  return { imported, skipped }
}

/** 将一条 S2 记录标记为被另一条取代（会回写存储）。 */
export const supersedeS2OutcomeRecord = (
  targetRecordId: string,
  byRecordId: string,
  reason: string,
): boolean => {
  const rawArchive = readRawS2OutcomeArchive()
  const targetIndex = rawArchive.findIndex((entry) => migrateSeason2OutcomeRecord(entry)?.recordId === targetRecordId)
  if (targetIndex < 0) return false
  const target = rawArchive[targetIndex]
  if (!isPlainObject(target)) return false
  rawArchive[targetIndex] = {
    ...target,
    supersededBy: {
      byRecordId,
      supersededAt: Date.now(),
      reason,
    },
  }
  writeRawS2OutcomeArchive(rawArchive)
  return true
}

// ---------------------------------------------------------------------------
// v5 存档（schema5 campaign）
// ---------------------------------------------------------------------------

export const createV5SaveRecord = (slot: SaveSlot, state: GameStateV5) => ({
  slot,
  savedAt: Date.now(),
  nodeId: state.nodeId,
  date: state.date,
  chapter: state.chapter,
  route: state.route,
  playerName: state.playerName,
  organizationName: state.organizationName,
  preview: state.history.at(-1)?.text.slice(0, 72) ?? '新的事件二记录',
  schemaVersion: 5 as const,
  state,
})

export const writeSaveV5 = (slot: SaveSlot, state: GameStateV5) => {
  if (!isStructuralV5State(state)) throw new Error('拒绝写入非结构合法的 schema5 存档。')
  const record = createV5SaveRecord(slot, state)
  if (hasStorage()) localStorage.setItem(`${V5_SAVE_PREFIX}${slot}`, JSON.stringify(record))
  return record
}

export const readSaveV5 = (slot: SaveSlot) => {
  if (!hasStorage()) return null
  const raw = localStorage.getItem(`${V5_SAVE_PREFIX}${slot}`)
  if (!raw) return null
  try {
    const record = JSON.parse(raw) as Partial<ReturnType<typeof createV5SaveRecord>>
    if (!isPlainObject(record) || record.slot !== slot || !isFiniteNumber(record.savedAt)) return null
    if (!isStructuralV5State(record.state)) return null
    return record as ReturnType<typeof createV5SaveRecord>
  } catch {
    return null
  }
}

export const listSavesV5 = () => SAVE_SLOTS.map((slot) => {
  const save = readSaveV5(slot)
  if (!save) return null
  const { state: _state, schemaVersion: _schemaVersion, ...metadata } = save
  return { ...metadata, episodeCompletion: save.state.episodeCompletion }
})

/** 仅删除 v5 键；不触碰 v4/v3/legacy 或 outcome archive。 */
export const deleteSaveV5 = (slot: SaveSlot) => {
  if (!hasStorage()) return
  localStorage.removeItem(`${V5_SAVE_PREFIX}${slot}`)
}

export { isStructurallyValidState }
