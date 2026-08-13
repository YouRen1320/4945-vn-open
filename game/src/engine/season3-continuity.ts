/**
 * Third-season continuity is a value snapshot built only from a completed S2 outcome record.
 * It deliberately does not read live saves or the S1 archive, so deleting a source cannot mutate
 * an already-started S3 campaign.
 */
import type { CharacterId } from './types'
import { romanceCandidates } from '@/content/characters'
import { season2OrganizationNameForRoute } from '@/content/season2/augustContinuity'
import {
  KNOWN_DURABLE_FACTS,
  SEASON2_ACTIVE_ROUTES,
  buildSeason2OutcomeRecord,
  computeSeason2OutcomeDigest,
  isArchivableSeason2OutcomeRecord,
  isContinuityProfile,
  isDurableFact,
  isSeason2ActiveRoute,
  isSeason2OutcomeSource,
  migrateSeason2OutcomeRecord,
  type ContinuityProfile,
  type DurableFact,
  type Season2CompletionEvidence,
  type Season2OutcomeRecord,
  type Season2OutcomeSource,
} from './season2-outcome'

// 第三季必须接受第一季能够合法写入的全部伴侣；瓶/真理继续作为回顾建档兼容关系保留。
export const S3_CORE_PARTNERS = [
  ...romanceCandidates,
  'bottle',
  'truth',
] as const
export type S3CorePartner = (typeof S3_CORE_PARTNERS)[number]
export type S3Partner = S3CorePartner | 'none'
export type S3ActiveRoute = (typeof SEASON2_ACTIVE_ROUTES)[number]
export type S2EndingKind = 'triumph' | 'compromise'

export interface S2FlavorHook {
  hookId: string
  fromEnding: string
  label: string
}

export type S3ContinuityProfile = Readonly<{
  profileVersion: 1
  source: Season2OutcomeSource
  route: S3ActiveRoute
  organization: S3ActiveRoute
  organizationName: string
  activePartner: S3Partner
  s2MainEnding: string
  s2Triumph: boolean
  s2EpilogueEnding: string
  s2RelationshipResolved: S3Partner
  durableFacts: DurableFact[]
  s2FlavorHooks: S2FlavorHook[]
  cohesion: number
  reputation: number
  resources: number
  summaryVersion: 2
  completionEvidence: Season2CompletionEvidence
  contentRevision: string
  createdAt: number
  warnings: string[]
}> & ContinuityProfile

export interface S3ProfileValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export type MakeS3ProfileResult =
  | { ok: true; profile: S3ContinuityProfile }
  | { ok: false; errors: string[] }

const CORE_PARTNER_SET = new Set<string>(S3_CORE_PARTNERS)
const ACTIVE_PARTNER_COMPATIBLE = new Set<CharacterId>(romanceCandidates)
const DURABLE_FACT_SET = new Set<string>(KNOWN_DURABLE_FACTS)
const PROFILE_KEYS = new Set([
  'profileVersion', 'source', 'route', 'organization', 'organizationName', 'activePartner',
  's2MainEnding', 's2Triumph', 's2EpilogueEnding', 's2RelationshipResolved', 'durableFacts',
  's2FlavorHooks', 'cohesion', 'reputation', 'resources', 'summaryVersion',
  'completionEvidence', 'contentRevision', 'createdAt', 'warnings',
])

const FLAVOR_HOOKS: readonly S2FlavorHook[] = Object.freeze([
  { hookId: 's2-org2-triumph-line', fromEnding: 's2-ending-org2-triumph', label: '“等你赢到第三季”——夏娜的伏笔' },
  { hookId: 's2-org5-undercurrent', fromEnding: 's2-ending-org5-triumph', label: '心之所向的北岸暗线' },
  { hookId: 's2-org5-undercurrent', fromEnding: 's2-ending-org5-compromise', label: '心之所向的北岸暗线' },
  { hookId: 's2-org4-appendix', fromEnding: 's2-ending-org4-compromise', label: '附录加赛条款的后续' },
])

const isPlainObject = (value: unknown): value is Record<string, unknown> => (
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)
)
const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const isCorePartner = (value: unknown): value is S3CorePartner => (
  typeof value === 'string' && CORE_PARTNER_SET.has(value)
)
const isS3Partner = (value: unknown): value is S3Partner => value === 'none' || isCorePartner(value)
const mainEndingFor = (route: S3ActiveRoute, kind: S2EndingKind) => `s2-ending-${route}-${kind}`

const normalizeStat = (
  name: 'cohesion' | 'reputation' | 'resources',
  value: number,
  min: number,
  max: number,
  warnings: string[],
): number => {
  const normalized = Math.min(max, Math.max(min, value))
  if (normalized !== value) warnings.push(`${name} 超出引擎范围，已收敛到 ${normalized}`)
  return normalized
}

const deriveFlavorHooks = (ending: string): S2FlavorHook[] => (
  FLAVOR_HOOKS.filter((hook) => hook.fromEnding === ending).map((hook) => ({ ...hook }))
)

/** Validate a detached S3 profile, including JSON round-trip safety and route/ending coherence. */
export const validateS3ContinuityProfile = (value: unknown): S3ProfileValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []
  if (!isContinuityProfile(value) || !isPlainObject(value)) {
    return { valid: false, errors: ['profile 必须是可安全序列化的 JSON 对象'], warnings }
  }
  if (Object.keys(value).some((key) => !PROFILE_KEYS.has(key))) errors.push('profile 含未声明字段')
  if (value.profileVersion !== 1) errors.push('profileVersion 必须为 1')
  if (!isSeason2OutcomeSource(value.source)) errors.push('source 不合法')
  if (!isSeason2ActiveRoute(value.route)) errors.push('route 必须是 org2–org6')
  if (!isSeason2ActiveRoute(value.organization) || value.organization !== value.route) {
    errors.push('organization 必须与活跃 route 一致')
  }
  if (typeof value.organizationName !== 'string' || !value.organizationName.trim()) errors.push('organizationName 不能为空')
  if (!isS3Partner(value.activePartner)) errors.push('activePartner 必须是已登记伴侣之一或 none')
  if (!isS3Partner(value.s2RelationshipResolved)) errors.push('s2RelationshipResolved 不合法')
  if (typeof value.s2MainEnding !== 'string') {
    errors.push('s2MainEnding 必须是字符串')
  } else if (isSeason2ActiveRoute(value.route)) {
    const validEndings = [mainEndingFor(value.route, 'triumph'), mainEndingFor(value.route, 'compromise')]
    if (!validEndings.includes(value.s2MainEnding)) errors.push('s2MainEnding 与 route 不一致')
  }
  if (typeof value.s2Triumph !== 'boolean') errors.push('s2Triumph 必须是布尔值')
  if (typeof value.s2MainEnding === 'string' && typeof value.s2Triumph === 'boolean') {
    if (value.s2Triumph !== value.s2MainEnding.endsWith('-triumph')) errors.push('s2Triumph 与主结局不一致')
  }
  if (typeof value.s2EpilogueEnding !== 'string' || !value.s2EpilogueEnding) errors.push('s2EpilogueEnding 不能为空')
  if (!Array.isArray(value.durableFacts) || !value.durableFacts.every(isDurableFact)) errors.push('durableFacts 含非白名单值')
  if (!Array.isArray(value.s2FlavorHooks) || !value.s2FlavorHooks.every((hook) => {
    if (!isPlainObject(hook)) return false
    return typeof hook.hookId === 'string' && typeof hook.fromEnding === 'string' && typeof hook.label === 'string'
      && FLAVOR_HOOKS.some((known) => known.hookId === hook.hookId
        && known.fromEnding === hook.fromEnding && known.label === hook.label)
  })) errors.push('s2FlavorHooks 含未知钩子')
  const statRanges = [
    ['cohesion', value.cohesion, 0, 5],
    ['reputation', value.reputation, -5, 5],
    ['resources', value.resources, 0, 5],
  ] as const
  for (const [name, stat, min, max] of statRanges) {
    if (!isFiniteNumber(stat) || stat < min || stat > max) errors.push(`${name} 必须位于 ${min}–${max}`)
  }
  if (value.summaryVersion !== 2) errors.push('summaryVersion 必须为 2')
  if (!['explicit', 'legacy-derived', 'recap-declared'].includes(String(value.completionEvidence))) {
    errors.push('completionEvidence 不合法')
  }
  if (isSeason2OutcomeSource(value.source)) {
    if (value.source.kind === 'save' && value.completionEvidence !== 'explicit') errors.push('save 来源必须使用 explicit 完成证明')
    if (value.source.kind === 'recap' && value.completionEvidence !== 'recap-declared') errors.push('recap 来源必须使用 recap-declared 完成证明')
    if (value.source.kind === 'legacy' && value.completionEvidence !== 'legacy-derived') errors.push('legacy 来源必须使用 legacy-derived 完成证明')
  }
  if (typeof value.contentRevision !== 'string') errors.push('contentRevision 必须是字符串')
  if (!isFiniteNumber(value.createdAt) || value.createdAt < 0) errors.push('createdAt 不合法')
  if (!Array.isArray(value.warnings) || !value.warnings.every((entry) => typeof entry === 'string')) {
    errors.push('warnings 必须是字符串数组')
  } else {
    warnings.push(...value.warnings)
  }
  return { valid: errors.length === 0, errors, warnings }
}

/** Build a self-contained S3 snapshot. Superseded, incomplete, org1, and contradictory records are blocked. */
export const makeS3ContinuityProfile = (value: unknown): MakeS3ProfileResult => {
  const record = migrateSeason2OutcomeRecord(value)
  if (!record) return { ok: false, errors: ['无法识别该第二季结局记录或版本过新'] }
  if (record.supersededBy) return { ok: false, errors: ['该第二季结局已被其他记录取代'] }
  if (!isArchivableSeason2OutcomeRecord(record)) return { ok: false, errors: ['第二季完成证明或路线/结局组合不完整'] }

  const { summary } = record
  if (!isSeason2ActiveRoute(summary.route) || summary.organization !== summary.route) {
    return { ok: false, errors: ['第三季只接受 organization 与 route 一致的 org2–org6 结果'] }
  }
  if (!isS3Partner(summary.s2RelationshipResolved)) {
    return { ok: false, errors: ['第二季关系收束不属于第三季已登记伴侣或 none'] }
  }

  const warnings: string[] = []
  let activePartner: S3Partner = summary.s2RelationshipResolved
  if (activePartner === 'none' && isCorePartner(summary.activePartner)) activePartner = summary.activePartner
  if (summary.activePartner && !isCorePartner(summary.activePartner)) {
    warnings.push(`非核心 activePartner ${summary.activePartner} 未进入第三季 structural 画像`)
  }
  const epilogue = summary.s2EpilogueEnding || summary.s2MainEnding
  if (!summary.s2EpilogueEnding) warnings.push('s2EpilogueEnding 为空，已回退到 s2MainEnding')
  if (summary.source.kind === 'legacy') warnings.push('来源为旧版第二季档案，无法还原真实存档槽')

  const profile = {
    profileVersion: 1,
    source: { ...summary.source },
    route: summary.route,
    organization: summary.route,
    organizationName: season2OrganizationNameForRoute(summary.route, summary.organizationName),
    activePartner,
    s2MainEnding: summary.s2MainEnding,
    s2Triumph: summary.s2MainEnding.endsWith('-triumph'),
    s2EpilogueEnding: epilogue,
    s2RelationshipResolved: summary.s2RelationshipResolved,
    durableFacts: [...new Set(summary.durableFacts.filter((fact) => DURABLE_FACT_SET.has(fact)))].sort(),
    s2FlavorHooks: deriveFlavorHooks(summary.s2MainEnding),
    cohesion: normalizeStat('cohesion', summary.stats.cohesion, 0, 5, warnings),
    reputation: normalizeStat('reputation', summary.stats.reputation, -5, 5, warnings),
    resources: normalizeStat('resources', summary.stats.resources, 0, 5, warnings),
    summaryVersion: 2,
    completionEvidence: summary.completionEvidence,
    contentRevision: record.contentRevision,
    createdAt: record.createdAt,
    warnings,
  } as S3ContinuityProfile
  const validation = validateS3ContinuityProfile(profile)
  return validation.valid ? { ok: true, profile } : { ok: false, errors: validation.errors }
}

export interface S3RecapSelection {
  route: S3ActiveRoute
  endingKind: S2EndingKind
  partner: S3Partner
  /** 六组没有公共默认名，回顾建档必须显式保留玩家自己的组织名。 */
  organizationName?: string
  createdAt?: number
}

/** Recap records are synthetic and visibly marked；瓶/真理只通过 relationshipResolved 表达。 */
export const buildS3RecapOutcomeRecord = (selection: S3RecapSelection): Season2OutcomeRecord => {
  const createdAt = selection.createdAt ?? Date.now()
  const mainEnding = mainEndingFor(selection.route, selection.endingKind)
  const activePartner = selection.partner !== 'none' && ACTIVE_PARTNER_COMPATIBLE.has(selection.partner)
    ? selection.partner
    : null
  return buildSeason2OutcomeRecord({
    summaryVersion: 2,
    source: { kind: 'recap', contractVersion: 1 },
    durableFacts: [],
    s2Complete: true,
    s2EpilogueComplete: true,
    finaleEndingId: 's2-finale-complete',
    completionEvidence: 'recap-declared',
    s2MainEnding: mainEnding,
    s2EpilogueEnding: mainEnding,
    s2RelationshipResolved: selection.partner,
    activePartner,
    route: selection.route,
    organization: selection.route,
    organizationName: selection.route === 'org6'
      ? (selection.organizationName?.trim() || '第六组织')
      : season2OrganizationNameForRoute(selection.route, selection.route),
    stats: { cohesion: 0, reputation: 0, resources: 0 },
    unlockedEndings: [mainEnding, 's2-finale-complete'],
    createdAt,
  }, 's3-recap-1')
}

/** Logical dedupe ignores source/time and keeps the newest identity without deleting any archive record. */
export const dedupeSeason2OutcomesForS3 = (values: readonly unknown[]): Season2OutcomeRecord[] => {
  const newest = new Map<string, Season2OutcomeRecord>()
  for (const value of values) {
    const record = migrateSeason2OutcomeRecord(value)
    if (!record || record.supersededBy || !isArchivableSeason2OutcomeRecord(record)) continue
    const digest = computeSeason2OutcomeDigest(record.summary)
    const current = newest.get(digest)
    if (!current || record.createdAt > current.createdAt) newest.set(digest, record)
  }
  return [...newest.values()].sort((left, right) => right.createdAt - left.createdAt)
}
