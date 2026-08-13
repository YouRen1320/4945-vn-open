/**
 * 《4945区》2.2 空数据夹具（架构阶段，canon 未签认）。
 *
 * 提供：空注册表 / 空档案 / 一个合法（最小）摘要与 record / 一个结构合法的 v5 状态工厂。
 * 这些夹具用于单元测试；它们不包含任何未确认的具体剧情或事实。
 */

import { createInitialGameState } from '@/engine/state'
import type { GameStateV5, Season1OutcomeSummary, Season1OutcomeRecord } from '@/engine/season2-outcome'
import {
  buildOutcomeRecord,
  computeOutcomeDigest,
  type ContinuityProfile,
  type Season5Fields,
} from '@/engine/season2-outcome'
import type {
  ChoicePayoffLedgerEntry,
  SeasonEpisodeDefinition,
} from '@/content/season2/registry'

// 空注册表 / 空档案
export const EMPTY_COLLECTION_V2 = { seenNodes: [], unlockedCgs: [], unlockedEndings: [] }
export const EMPTY_OUTCOME_ARCHIVE: Season1OutcomeRecord[] = []
export const EMPTY_EPISODE_REGISTRY: readonly SeasonEpisodeDefinition[] = []
export const EMPTY_PAYOFF_LEDGER: readonly ChoicePayoffLedgerEntry[] = []

// 一个最小合法摘要（durableFacts 为空，符合 canon 签认前约束）
export const SAMPLE_SUMMARY: Season1OutcomeSummary = {
  summaryVersion: 1,
  source: { kind: 'save', slot: '1', savedAt: 1700000000000 },
  route: 'org2',
  organization: 'org2',
  organizationName: '二组',
  organizationEndingId: '',
  activePartner: 'none',
  relationshipTiers: {},
  durableFacts: [],
  createdAt: 1700000000000,
}

export const SAMPLE_RECORD: Season1OutcomeRecord = buildOutcomeRecord(SAMPLE_SUMMARY, 'r0')
export const SAMPLE_DIGEST = computeOutcomeDigest(SAMPLE_SUMMARY)

const SAMPLE_CONTINUITY: ContinuityProfile = { seasonStartMood: 'calm' }

const SAMPLE_SEASON5: Season5Fields = {
  seasonId: 'season-2',
  contentRevision: 'r0',
  campaignId: 'campaign-sample',
  lineageId: 'lineage-sample',
  continuityProfile: SAMPLE_CONTINUITY,
  episodeCompletion: { 's2-prologue': false },
  season1Outcome: SAMPLE_SUMMARY,
}

/** 结构合法的 v5 状态工厂；仅用于测试，不表达任何真实第二季内容。 */
export const makeV5State = (overrides: Partial<GameStateV5> = {}): GameStateV5 => {
  const base = createInitialGameState({ playerName: '夹具玩家' })
  return {
    ...base,
    ...SAMPLE_SEASON5,
    schemaVersion: 5,
    ...overrides,
  }
}
