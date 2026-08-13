import type { GameState } from './types'
import type { S3ContinuityProfile } from './season3-continuity'
import { validateS3ContinuityProfile } from './season3-continuity'
import { isFiniteNumber, isPlainObject, isStructurallyValidState, SAVE_SLOTS, type SaveSlot } from './storage'

const S3_SAVE_PREFIX = '4945-vn:s3:save:'

const hasStorage = () => typeof window !== 'undefined' && 'localStorage' in window

/** 事件三沿用 schema5 基础形状，但用独立键和 profile 快照，不污染事件二的 season1Outcome 合同。 */
export interface Season3CampaignState extends GameState {
  schemaVersion: 5
  seasonId: 'season-3'
  contentRevision: string
  campaignId: string
  lineageId: string
  sourceOutcomeRecordId: string
  sourceOutcomeDigest: string
  continuityProfile: S3ContinuityProfile
  episodeCompletion: Record<string, boolean>
  lastChoiceId?: string
}

export const isSeason3CampaignState = (value: unknown): value is Season3CampaignState => {
  if (!isPlainObject(value) || value.schemaVersion !== 5 || value.seasonId !== 'season-3') return false
  if (!isStructurallyValidState(value as Partial<GameState>, 5)) return false
  if (typeof value.contentRevision !== 'string'
    || typeof value.campaignId !== 'string'
    || typeof value.lineageId !== 'string'
    || typeof value.sourceOutcomeRecordId !== 'string'
    || typeof value.sourceOutcomeDigest !== 'string'
    || !isPlainObject(value.episodeCompletion)
    || !Object.values(value.episodeCompletion).every((entry) => typeof entry === 'boolean')) return false
  return validateS3ContinuityProfile(value.continuityProfile).valid
}

export const createSeason3SaveRecord = (slot: SaveSlot, state: Season3CampaignState) => ({
  slot,
  savedAt: Date.now(),
  nodeId: state.nodeId,
  date: state.date,
  chapter: state.chapter,
  route: state.route,
  playerName: state.playerName,
  organizationName: state.organizationName,
  preview: state.history.at(-1)?.text.slice(0, 72) ?? '新的事件三记录',
  schemaVersion: 5 as const,
  state,
})

export const writeSeason3Save = (slot: SaveSlot, state: Season3CampaignState) => {
  if (!isSeason3CampaignState(state)) throw new Error('拒绝写入不完整的事件三进度。')
  const record = createSeason3SaveRecord(slot, state)
  if (hasStorage()) localStorage.setItem(`${S3_SAVE_PREFIX}${slot}`, JSON.stringify(record))
  return record
}

export const readSeason3Save = (slot: SaveSlot) => {
  if (!hasStorage()) return null
  const raw = localStorage.getItem(`${S3_SAVE_PREFIX}${slot}`)
  if (!raw) return null
  try {
    const record: unknown = JSON.parse(raw)
    if (!isPlainObject(record) || record.slot !== slot || !isFiniteNumber(record.savedAt)) return null
    if (!isSeason3CampaignState(record.state)) return null
    return record as ReturnType<typeof createSeason3SaveRecord>
  } catch {
    return null
  }
}

export const listSeason3Saves = () => SAVE_SLOTS.map((slot) => {
  const save = readSeason3Save(slot)
  if (!save) return null
  const { state: _state, schemaVersion: _schemaVersion, ...metadata } = save
  return { ...metadata, episodeCompletion: save.state.episodeCompletion }
})

export const deleteSeason3Save = (slot: SaveSlot) => {
  if (hasStorage()) localStorage.removeItem(`${S3_SAVE_PREFIX}${slot}`)
}
