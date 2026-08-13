import type { CharacterId, GameState, OrganizationId, RouteId } from './types'
import { romanceCandidates } from '@/content/characters'

export const S3_MAIN_ENDINGS = [
  's3-ending-org2-autonomy', 's3-ending-org2-safeguard',
  's3-ending-org3-autonomy', 's3-ending-org3-safeguard',
  's3-ending-org4-autonomy', 's3-ending-org4-safeguard',
  's3-ending-org5-autonomy', 's3-ending-org5-safeguard',
  's3-ending-org6-autonomy', 's3-ending-org6-safeguard',
  's3-ending-third-way', 's3-ending-absorbed',
] as const

export type Season3MainEnding = typeof S3_MAIN_ENDINGS[number]
export type Season3RelationshipResolution = 'together' | 'apart-understood' | 'broken' | 'none'
export type Season3RelationshipSubject = CharacterId | 'none'

const S3_RELATIONSHIP_SUBJECTS = [...romanceCandidates, 'bottle', 'truth', 'none'] as const

export interface Season3OutcomeSummary {
  summaryVersion: 1
  route: RouteId
  organization: OrganizationId
  organizationName: string
  mainEnding: Season3MainEnding
  relationshipSubject: Season3RelationshipSubject
  relationshipResolution: Season3RelationshipResolution
  activePartner: CharacterId | null
  commitment: string
  pledge: string
  midpointGoal: string
  finalStance: string
  stats: { cohesion: number; reputation: number; resources: number }
  parentOutcomeIds: string[]
  lineageId: string
  campaignId: string
  completedAt: number
}

export interface Season3OutcomeRecord {
  recordId: string
  digest: string
  contentRevision: string
  createdAt: number
  summary: Season3OutcomeSummary
}

const routeEndingMatches = (route: RouteId, ending: Season3MainEnding): boolean => (
  ending === 's3-ending-third-way'
  || ending === 's3-ending-absorbed'
  || ending.startsWith(`s3-ending-${route}-`)
)

const stable = (value: unknown): string => {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`
  const entry = value as Record<string, unknown>
  return `{${Object.keys(entry).sort().map((key) => `${JSON.stringify(key)}:${stable(entry[key])}`).join(',')}}`
}

const digest = (value: unknown): string => {
  let hash = 0x811c9dc5
  for (const char of stable(value)) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

export const isSeason3OutcomeSummary = (value: unknown): value is Season3OutcomeSummary => {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<Season3OutcomeSummary>
  if (item.summaryVersion !== 1 || !item.route || !['org2', 'org3', 'org4', 'org5', 'org6'].includes(item.route)) return false
  if (item.organization !== item.route || typeof item.organizationName !== 'string' || !item.organizationName.trim()) return false
  if (!S3_MAIN_ENDINGS.includes(item.mainEnding as Season3MainEnding) || !routeEndingMatches(item.route, item.mainEnding as Season3MainEnding)) return false
  if (!S3_RELATIONSHIP_SUBJECTS.includes(item.relationshipSubject as typeof S3_RELATIONSHIP_SUBJECTS[number])) return false
  if (!['together', 'apart-understood', 'broken', 'none'].includes(String(item.relationshipResolution))) return false
  if (item.activePartner !== null && !romanceCandidates.includes(item.activePartner as typeof romanceCandidates[number])) return false
  if (!item.stats || !Object.values(item.stats).every((entry) => typeof entry === 'number' && Number.isFinite(entry))) return false
  return Array.isArray(item.parentOutcomeIds)
    && item.parentOutcomeIds.every((entry) => typeof entry === 'string')
    && typeof item.lineageId === 'string'
    && typeof item.campaignId === 'string'
    && typeof item.completedAt === 'number'
}

export const isSeason3OutcomeRecord = (value: unknown): value is Season3OutcomeRecord => {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<Season3OutcomeRecord>
  return typeof item.recordId === 'string'
    && typeof item.digest === 'string'
    && typeof item.contentRevision === 'string'
    && typeof item.createdAt === 'number'
    && isSeason3OutcomeSummary(item.summary)
    && digest(item.summary) === item.digest
    && item.recordId === `s3-outcome-${item.digest}`
}

export const buildSeason3OutcomeRecord = (params: {
  state: GameState
  sourceOutcomeRecordId: string
  lineageId: string
  campaignId: string
  contentRevision: string
  completedAt?: number
}): Season3OutcomeRecord => {
  const { state } = params
  if (!state.flags.s3Complete || !state.flags.s3EpilogueComplete || !state.unlockedEndings.includes('s3-finale-complete')) {
    throw new Error('事件三尚未完整收束，拒绝生成结果档案。')
  }
  const mainEnding = String(state.variables.s3MainEnding ?? '') as Season3MainEnding
  const relationshipResolution = String(state.variables.s3RelationshipResolution ?? '') as Season3RelationshipResolution
  // 关系对象与最终是否仍为伴侣分开归档，避免“分开/破裂”把当事人错误显示成独行。
  const relationshipSubject = String(state.variables.s3Partner ?? state.activePartner ?? 'none') as Season3RelationshipSubject
  const completedAt = params.completedAt ?? Date.now()
  const summary: Season3OutcomeSummary = {
    summaryVersion: 1,
    route: state.route!, organization: state.organization!, organizationName: state.organizationName,
    mainEnding, relationshipSubject, relationshipResolution, activePartner: state.activePartner,
    commitment: String(state.variables.s3Commitment ?? ''),
    pledge: String(state.variables.s3Pledge ?? ''),
    midpointGoal: String(state.variables.s3MidpointGoal ?? ''),
    finalStance: String(state.variables.s3FinalStance ?? ''),
    stats: { cohesion: state.stats.cohesion, reputation: state.stats.reputation, resources: state.stats.resources },
    parentOutcomeIds: [params.sourceOutcomeRecordId], lineageId: params.lineageId,
    campaignId: params.campaignId, completedAt,
  }
  if (!isSeason3OutcomeSummary(summary)) throw new Error('事件三结局状态不满足归档合同。')
  const hash = digest(summary)
  return {
    recordId: `s3-outcome-${hash}`,
    digest: hash,
    contentRevision: params.contentRevision,
    createdAt: completedAt,
    summary,
  }
}
