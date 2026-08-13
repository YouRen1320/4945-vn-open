/**
 * 《4945区》2.2 数据契约（canon 已架空拟定，见 docs/season2/S2-CANON.md）。
 *
 * 本模块只定义第二季开局消费的「值类型、验证器和纯函数助手」：
 *  - Season1OutcomeSummary（第一季结果摘要，白名单值快照）
 *  - Season1OutcomeRecord（不可变结果档案，进入独立 outcome archive）
 *  - schema5 GameStateV5（在 schema4 GameState 上的非破坏性叠加字段）
 *  - DurableFact 枚举白名单（值待 S2-INHERITANCE-CONTRACT 签认后填充）
 *
 * canon 已由用户授权架空拟定（docs/season2/S2-CANON.md），第二季序章节点（s2-）与
 * 标题页「第二季」来源档选择流已在 2.2 内容阶段落地；全部复用既有角色与背景资产，
 * 未新增任何 CharacterId / 路线。durableFacts 白名单见 S2-INHERITANCE-CONTRACT.md。
 */

import type { CharacterId, GameState, OrganizationId, RouteId } from './types'
import { characters, romanceCandidates } from '@/content/characters'
import { organizations } from '@/content/organizations'
import { isStructurallyValidState } from './storage'

// ---------------------------------------------------------------------------
// 基础白名单
// ---------------------------------------------------------------------------

/** 第二季 canon 仅将 org2–org6 定义为活跃路线；org1 是跨路线公共机构。 */
export const SEASON2_ACTIVE_ROUTES = ['org2', 'org3', 'org4', 'org5', 'org6'] as const satisfies readonly RouteId[]
export type Season2ActiveRoute = (typeof SEASON2_ACTIVE_ROUTES)[number]
const ORGANIZATION_IDS: readonly OrganizationId[] = ['org1', 'org2', 'org3', 'org4', 'org5', 'org6']
const ROMANCE_CANDIDATES: readonly CharacterId[] = romanceCandidates

/**
 * 可继承的「持久事实」枚举白名单。
 *
 * 已由 docs/season2/S2-INHERITANCE-CONTRACT.md 签认（架空拟定）。`durableFacts` 仅接受
 * 下列值；任何非白名单值都会被 `validateSeason1OutcomeSummary` 拒绝。新增值须回到
 * canon 变更流程，不得临时注入。
 *
 * 前七个为 structural/ending 级（路线、组织结局、伴侣、议会、导师、跨组织纽带）；
 * 后三个（s1-charter-written / s1-confession-transferred / s1-fire-two）为 flavor 级，
 * 供第二季序章「回望」节点按上一季具体事件做散文变体，不解锁任何机制——
 * 严格遵守 S2-INHERITANCE-CONTRACT.md「序章不得擅自扩大级别」约束。
 */
export const KNOWN_DURABLE_FACTS = Object.freeze([
  's1-org-ending',
  's1-route-complete',
  's1-partner-bonded',
  's1-partner-none',
  's1-high-council',
  's1-mentor-trust',
  's1-cross-org-tie',
  's1-charter-written',
  's1-confession-transferred',
  's1-fire-two',
] as const) satisfies readonly string[]

export type DurableFact = string

// ---------------------------------------------------------------------------
// 来源（save 槽 / 回顾建档）
// ---------------------------------------------------------------------------

export type OutcomeSource =
  | { kind: 'save'; slot: string; savedAt: number }
  | { kind: 'recap'; contractVersion: number }

// ---------------------------------------------------------------------------
// Season1OutcomeSummary
// ---------------------------------------------------------------------------

export interface Season1OutcomeSummary {
  /** 摘要契约版本；与 appVersion 解耦，单独演进。 */
  summaryVersion: number
  source: OutcomeSource
  route: RouteId | null
  organization: OrganizationId | null
  organizationName: string
  organizationEndingId: string
  /** 显式伴侣或 'none'（无伴侣线）。沿用 GameState.activePartner 语义但强制二选一。 */
  activePartner: CharacterId | 'none'
  /** 继承的关系层级（0–100），仅含第二季实际消费的角色。 */
  relationshipTiers: Partial<Record<CharacterId, number>>
  /** 枚举白名单，不接受任意 flags。 */
  durableFacts: DurableFact[]
  /** 一组结局转入事件二活跃组织时，保留原始路线与组织身份。 */
  routeTransfer?: {
    kind: 'org1-to-active-route'
    fromRoute: 'org1'
    fromOrganization: 'org1'
    fromOrganizationName: string
  }
  createdAt: number
}

// ---------------------------------------------------------------------------
// Season1OutcomeRecord（不可变，进 outcome archive）
// ---------------------------------------------------------------------------

export interface Season1OutcomeRecord {
  /** 稳定 id；由 digest 派生，重复内容得到相同 id（去重）。 */
  recordId: string
  /** 对「内容」而非「来源/创建时间」的稳定摘要；相同结果幂等。 */
  digest: string
  /** 值快照，写入后不再变更。 */
  summary: Season1OutcomeSummary
  /** 比 summary.source 更完整的来源描述（record 级元信息）。 */
  source: OutcomeSource
  /** 内容修订标记，用于区分同一 contract 版本内的剧情改动。 */
  contentRevision: string
  createdAt: number
  /** 被某个 season2 campaign 复用后回填，便于反向定位。 */
  campaignId?: string
  lineageId?: string
}

// ---------------------------------------------------------------------------
// schema5 / GameStateV5（在 schema4 上的非破坏性叠加）
// ---------------------------------------------------------------------------

export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | readonly JsonValue[] | { readonly [key: string]: JsonValue }
export type ContinuityProfile = Readonly<Record<string, JsonValue>>

export interface Season5Fields {
  /** 第二季标识，例如 'season-2'。 */
  seasonId: string
  /** 内容修订标记（同 Season1OutcomeRecord.contentRevision 语义，但作用于本季内容）。 */
  contentRevision: string
  /** 跨季稳定的 campaign 标识。 */
  campaignId: string
  /** 跨季稳定的 lineage 标识（同一次第一季结果衍生的所有存档共享）。 */
  lineageId: string
  /** 版本化的连续性画像，第二季按需读取；不复制第一季原始变量。 */
  continuityProfile: ContinuityProfile
  /** 显式 episode 完成标记，不靠「看过某文本节点」猜测。 */
  episodeCompletion: Record<string, boolean>
  /** 作为 season1 outcome payload 嵌入，而不是唯一不可扩展的跨季字段。 */
  season1Outcome: Season1OutcomeSummary
  /** 最近一次选择的稳定 choiceId（schema5 新增；s2- 节点启用前恒为空）。 */
  lastChoiceId?: string
}

export interface GameStateV5 extends GameState, Season5Fields {
  schemaVersion: 5
}

// ---------------------------------------------------------------------------
// 通用验证助手
// ---------------------------------------------------------------------------

const isPlainObject = (value: unknown): value is Record<string, unknown> => (
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)
)
const isJsonObject = (value: unknown): value is Record<string, unknown> => {
  if (!isPlainObject(value)) return false
  const prototype = Object.getPrototypeOf(value)
  if (prototype !== Object.prototype && prototype !== null) return false
  return Reflect.ownKeys(value).every((key) => (
    typeof key === 'string' && Object.prototype.propertyIsEnumerable.call(value, key)
  ))
}
const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const isJsonValueInternal = (value: unknown, seen: Set<object>, depth: number): value is JsonValue => {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true
  if (typeof value === 'number') return Number.isFinite(value)
  if (depth > 32 || typeof value !== 'object' || value === null || seen.has(value)) return false

  seen.add(value)
  const valid = Array.isArray(value)
    ? Reflect.ownKeys(value).every((key) => key === 'length'
      || (typeof key === 'string' && /^(0|[1-9]\d*)$/.test(key) && Number(key) < value.length))
      && Object.keys(value).length === value.length
      && value.every((entry) => isJsonValueInternal(entry, seen, depth + 1))
    : isJsonObject(value)
      && Object.values(value).every((entry) => isJsonValueInternal(entry, seen, depth + 1))
  seen.delete(value)
  return valid
}

/** Continuity snapshots are JSON data: recursive arrays/objects are allowed, cycles and non-finite numbers are not. */
export const isJsonValue = (value: unknown): value is JsonValue => {
  try { return isJsonValueInternal(value, new Set(), 0) } catch { return false }
}
export const isContinuityProfile = (value: unknown): value is ContinuityProfile => {
  try { return isJsonObject(value) && Object.values(value).every((entry) => isJsonValue(entry)) } catch { return false }
}

/** Return an isolated JSON snapshot so a running campaign cannot mutate its source profile by alias. */
export const cloneContinuityProfile = (value: ContinuityProfile): ContinuityProfile => {
  if (!isContinuityProfile(value)) throw new Error('continuityProfile 必须是可安全序列化的 JSON 对象。')
  return JSON.parse(JSON.stringify(value)) as ContinuityProfile
}
const isKnownCharacter = (value: unknown): value is CharacterId => (
  typeof value === 'string' && Object.hasOwn(characters, value)
)
export const isSeason2ActiveRoute = (value: unknown): value is (typeof SEASON2_ACTIVE_ROUTES)[number] => (
  SEASON2_ACTIVE_ROUTES.includes(value as (typeof SEASON2_ACTIVE_ROUTES)[number])
)
const isKnownOrganization = (value: unknown): value is OrganizationId => (
  ORGANIZATION_IDS.includes(value as OrganizationId)
)
const isKnownRomanceCandidate = (value: unknown): value is CharacterId => (
  ROMANCE_CANDIDATES.includes(value as CharacterId)
)

// ---------------------------------------------------------------------------
// OutcomeSource 验证
// ---------------------------------------------------------------------------

export const isOutcomeSource = (value: unknown): value is OutcomeSource => {
  if (!isPlainObject(value)) return false
  if (value.kind === 'save') {
    return typeof value.slot === 'string'
      && isFiniteNumber(value.savedAt)
      && value.savedAt >= 0
      && value.savedAt <= 8.64e15
  }
  if (value.kind === 'recap') {
    return isFiniteNumber(value.contractVersion) && value.contractVersion >= 0
  }
  return false
}

// ---------------------------------------------------------------------------
// durableFacts 验证（十项跨季事实白名单）
// ---------------------------------------------------------------------------

export const isDurableFact = (value: unknown): value is DurableFact => (
  typeof value === 'string' && KNOWN_DURABLE_FACTS.includes(value as (typeof KNOWN_DURABLE_FACTS)[number])
)
export const isDurableFactList = (value: unknown): value is DurableFact[] => (
  Array.isArray(value) && value.every(isDurableFact)
)

// ---------------------------------------------------------------------------
// relationshipTiers 验证
// ---------------------------------------------------------------------------

export const isRelationshipTierMap = (
  value: unknown,
): value is Partial<Record<CharacterId, number>> => {
  if (!isPlainObject(value)) return false
  for (const [key, val] of Object.entries(value)) {
    if (!isKnownCharacter(key)) return false
    if (!isFiniteNumber(val) || val < 0 || val > 100) return false
  }
  return true
}

// ---------------------------------------------------------------------------
// Season1OutcomeSummary 验证（详细 + 守卫两种入口）
// ---------------------------------------------------------------------------

export interface SummaryValidationResult {
  ok: boolean
  errors: string[]
}

export const validateSeason1OutcomeSummary = (value: unknown): SummaryValidationResult => {
  const errors: string[] = []
  if (!isPlainObject(value)) return { ok: false, errors: ['summary 必须是对象'] }

  if (!isFiniteNumber(value.summaryVersion) || value.summaryVersion < 0) {
    errors.push('summaryVersion 必须是非负数字')
  }
  if (!isOutcomeSource(value.source)) errors.push('source 必须是合法的 save/recap 来源')
  if (!isSeason2ActiveRoute(value.route) && value.route !== null) {
    errors.push('route 必须是第二季活跃路线 org2–org6 或 null')
  }
  if (!isKnownOrganization(value.organization) && value.organization !== null) {
    errors.push('organization 必须是已知组织或 null')
  }
  if (typeof value.organizationName !== 'string') errors.push('organizationName 必须是字符串')
  if (typeof value.organizationEndingId !== 'string') errors.push('organizationEndingId 必须是字符串')
  if (value.activePartner !== 'none' && !isKnownRomanceCandidate(value.activePartner)) {
    errors.push('activePartner 必须是已知可恋爱角色或 "none"')
  }
  if (!isRelationshipTierMap(value.relationshipTiers)) {
    errors.push('relationshipTiers 必须是 角色→0–100 数值 的已知角色映射')
  }
  if (!isDurableFactList(value.durableFacts)) {
    errors.push('durableFacts 必须是 DurableFact 白名单数组（当前仅允许空列表，值待 canon 签认）')
  }
  if (value.routeTransfer !== undefined) {
    if (!isPlainObject(value.routeTransfer)
      || value.routeTransfer.kind !== 'org1-to-active-route'
      || value.routeTransfer.fromRoute !== 'org1'
      || value.routeTransfer.fromOrganization !== 'org1'
      || typeof value.routeTransfer.fromOrganizationName !== 'string'
      || !value.routeTransfer.fromOrganizationName.trim()) {
      errors.push('routeTransfer 必须是合法的一组转线记录')
    }
    if (!isFiniteNumber(value.summaryVersion) || value.summaryVersion < 2) {
      errors.push('含 routeTransfer 的摘要版本必须不低于 2')
    }
    if (!isSeason2ActiveRoute(value.route) || value.organization !== value.route) {
      errors.push('一组转线后的 route / organization 必须是同一条事件二活跃路线')
    }
    if (typeof value.organizationEndingId !== 'string' || !/^r1-/.test(value.organizationEndingId)) {
      errors.push('一组转线摘要必须保留 r1-* 组织结局')
    }
  }
  if (!isFiniteNumber(value.createdAt) || value.createdAt < 0) {
    errors.push('createdAt 必须是非负时间戳')
  }

  return { ok: errors.length === 0, errors }
}

export const isSeason1OutcomeSummary = (value: unknown): value is Season1OutcomeSummary => (
  validateSeason1OutcomeSummary(value).ok
)

// ---------------------------------------------------------------------------
// Season1OutcomeRecord 验证
// ---------------------------------------------------------------------------

export const isSeason1OutcomeRecord = (value: unknown): value is Season1OutcomeRecord => {
  if (!isPlainObject(value)) return false
  if (typeof value.recordId !== 'string' || !value.recordId) return false
  if (typeof value.digest !== 'string' || !value.digest) return false
  if (!isSeason1OutcomeSummary(value.summary)) return false
  if (!isOutcomeSource(value.source)) return false
  if (typeof value.contentRevision !== 'string') return false
  if (!isFiniteNumber(value.createdAt) || value.createdAt < 0) return false
  if (value.campaignId !== undefined && typeof value.campaignId !== 'string') return false
  if (value.lineageId !== undefined && typeof value.lineageId !== 'string') return false
  return true
}

// ---------------------------------------------------------------------------
// schema5 结构验证（复用运行时 GameState 形状检查）
// ---------------------------------------------------------------------------

/**
 * 轻量结构检查：验证 schema5 叠加字段 + 关键 GameState 字段。
 * 完整 GameState 形状由 storage.ts 的 isStructurallyValidState 把关；
 * 此处聚焦第二季新增字段，避免重复整套关系校验逻辑。
 */
export const isStructuralV5State = (value: unknown): value is GameStateV5 => {
  if (!isPlainObject(value)) return false
  if (value.schemaVersion !== 5) return false
  if (!isStructurallyValidState(value as Partial<GameState>, 5)) return false
  if (typeof value.seasonId !== 'string' || !value.seasonId) return false
  if (typeof value.contentRevision !== 'string') return false
  if (typeof value.campaignId !== 'string' || !value.campaignId) return false
  if (typeof value.lineageId !== 'string' || !value.lineageId) return false
  if (!isContinuityProfile(value.continuityProfile)) return false
  if (!isPlainObject(value.episodeCompletion)) return false
  for (const [key, val] of Object.entries(value.episodeCompletion as Record<string, unknown>)) {
    if (typeof key !== 'string' || typeof val !== 'boolean') return false
  }
  if (!isSeason1OutcomeSummary(value.season1Outcome)) return false
  if (value.lastChoiceId !== undefined && typeof value.lastChoiceId !== 'string') return false
  return true
}

// ---------------------------------------------------------------------------
// 摘要提取（从第一季 GameState 提取白名单值快照）
// ---------------------------------------------------------------------------

/**
 * 从第一季 GameState 提取 Season1OutcomeSummary（source 取 save）。
 * 只复制第二季实际消费的白名单字段，不复制完整 history / processedNodes /
 * variables 或原始关系数值。
 *
 * 修正（连续感）：此前 `durableFacts` 写死为空，导致 `buildSeason2InitialState`
 * 中 `summary.durableFacts.includes('s1-org-ending')` 恒为 false，组织结局 ID
 * 从未被带入第二季。现在按 S2-INHERITANCE-CONTRACT.md 派生全部 structural/ending
 * 级事实，以及三个 flavor 级事实（章程 / 告白转组 / 火2），供序章「回望」节点
 * 做散文变体引用。
 */
export const extractSeason1Summary = (state: GameState, slot: string, savedAt: number): Season1OutcomeSummary => {
  const activePartner = state.activePartner === null ? 'none' : state.activePartner
  const relationshipTiers: Partial<Record<CharacterId, number>> = {}
  if (state.activePartner && isKnownRomanceCandidate(state.activePartner)) {
    relationshipTiers[state.activePartner] = state.relationships[state.activePartner]?.progress ?? 0
  }

  // 派生当前路线对应的组织结局 ID（如已解锁）。
  const routeSuffix = state.route ? state.route.slice(-1) : ''
  const routeEndingPrefix = routeSuffix ? `r${routeSuffix}-` : ''
  const orgEndingId = routeEndingPrefix
    ? (state.unlockedEndings.find((id) => id.startsWith(routeEndingPrefix)) ?? '')
    : ''

  const durableFacts: DurableFact[] = []

  // structural / ending 级
  if (state.route && orgEndingId) {
    durableFacts.push('s1-org-ending')
  }
  if (state.route && state.unlockedEndings.some((id) => id.startsWith(routeEndingPrefix))) {
    durableFacts.push('s1-route-complete')
  }
  if (state.activePartner && isKnownRomanceCandidate(state.activePartner)) {
    durableFacts.push('s1-partner-bonded')
  } else {
    durableFacts.push('s1-partner-none')
  }
  if (state.highCouncil.length > 0) {
    durableFacts.push('s1-high-council')
  }
  if ((state.relationships.mentor?.trust ?? 0) >= 6) {
    durableFacts.push('s1-mentor-trust')
  }
  // 跨组织纽带：高层议会成员来自不止一个组织。
  if (state.highCouncil.length > 0) {
    const councilOrgs = new Set(
      state.highCouncil
        .map((id) => characters[id]?.organization)
        .filter((o): o is OrganizationId => Boolean(o)),
    )
    if (councilOrgs.size > 1) durableFacts.push('s1-cross-org-tie')
  }

  // flavor 级（仅供序章散文变体引用，不解锁机制）
  if (state.flags.org6WrittenCharter) durableFacts.push('s1-charter-written')
  if (state.flags.gaobaiLeftForOrg1) durableFacts.push('s1-confession-transferred')
  if (state.flags.org5FoughtFireTwo || state.flags.org5UpsetFireTwo || state.flags.org5VotedFireTwo) {
    durableFacts.push('s1-fire-two')
  }

  return {
    summaryVersion: 1,
    source: { kind: 'save', slot, savedAt },
    route: state.route,
    organization: state.organization,
    organizationName: state.organizationName,
    organizationEndingId: orgEndingId,
    activePartner,
    relationshipTiers,
    durableFacts,
    createdAt: savedAt,
  }
}

/**
 * 将已完成的一组结局桥接到事件二活跃路线，同时保留原始一组结局与身份记录。
 * `route` / `organization` 表示事件二的当前归属；`routeTransfer` 记录事件一来源。
 */
export const bridgeOrg1SummaryToSeason2 = (
  summary: Season1OutcomeSummary,
  destination: Season2ActiveRoute,
): Season1OutcomeSummary => {
  if (summary.route !== 'org1' || summary.organization !== 'org1') {
    throw new Error('只有已完成的一组结局可以使用转线传承。')
  }
  if (!/^r1-/.test(summary.organizationEndingId)) {
    throw new Error('一组结局记录不完整，无法建立转线传承。')
  }

  const bridged: Season1OutcomeSummary = {
    ...summary,
    summaryVersion: Math.max(2, summary.summaryVersion),
    route: destination,
    organization: destination,
    organizationName: organizations[destination].name,
    routeTransfer: {
      kind: 'org1-to-active-route',
      fromRoute: 'org1',
      fromOrganization: 'org1',
      fromOrganizationName: summary.organizationName || organizations.org1.name,
    },
  }
  const result = validateSeason1OutcomeSummary(bridged)
  if (!result.ok) throw new Error(`一组转线摘要不合法：${result.errors.join('；')}`)
  return bridged
}

/**
 * 回顾建档（recap）入口：无合法第一季完成档时，玩家显式选择路线与伴侣状态，
 * 构建一份仅含 canon 允许合法组合的 Season1OutcomeSummary（source 取 recap）。
 *
 * 严格遵守 S2-RECAP-CONTRACT.md：
 *  - route 限定五条活跃路线，organization 必须等于 route；
 *  - organizationName 由 organizations 固定映射，不接受自由文本；
 *  - organizationEndingId 恒为空（回顾建档不声称具体结局）；
 *  - 若 bonded，relationshipTiers 仅填该伴侣的 100 层级，否则为空；
 *  - durableFacts 仅取白名单子集，不伪造未达成结局；
 *  - 不写入任何 v4 来源存档，只产出 summary 供 startSeason2 消费。
 *
 * 构建结果会经过 validateSeason1OutcomeSummary 校验；非法输入直接抛错，
 * 不让 UI 把不合法组合静默传入第二季。
 */
export const RECP_CONTRACT_VERSION = 1

export const buildRecapSummary = (
  route: RouteId,
  activePartner: CharacterId | 'none',
  organizations: Record<OrganizationId, { name: string }>,
): Season1OutcomeSummary => {
  if (!isSeason2ActiveRoute(route)) throw new Error(`回顾建档不支持该路线：${String(route)}`)
  if (activePartner !== 'none' && !isKnownRomanceCandidate(activePartner)) {
    throw new Error(`回顾建档不支持该伴侣：${String(activePartner)}`)
  }
  const orgDef = organizations[route]
  if (!orgDef) throw new Error(`回顾建档找不到组织定义：${String(route)}`)

  const bonded = activePartner !== 'none'
  const relationshipTiers: Partial<Record<CharacterId, number>> = bonded
    ? { [activePartner]: 100 }
    : {}
  const durableFacts: DurableFact[] = ['s1-route-complete', bonded ? 's1-partner-bonded' : 's1-partner-none']

  const summary: Season1OutcomeSummary = {
    summaryVersion: 1,
    source: { kind: 'recap', contractVersion: RECP_CONTRACT_VERSION },
    route,
    organization: route,
    organizationName: orgDef.name,
    organizationEndingId: '',
    activePartner,
    relationshipTiers,
    durableFacts,
    createdAt: Date.now(),
  }
  const result = validateSeason1OutcomeSummary(summary)
  if (!result.ok) throw new Error(`回顾建档结果不合法：${result.errors.join('；')}`)
  return summary
}

/**
 * 片段跳过建档（skip）：玩家在标题页选择「片段跳过前往第二季」时，声明主路线、
 * 伴侣状态，并勾选若干 flavor 级「片段」（章程 / 告白转组 / 火2 等已发生事件），
 * 构建一份含 canon 允许合法组合的 Season1OutcomeSummary（source 取 recap）。
 *
 * 与 `buildRecapSummary` 区别：recap 只给最小 structural 事实；skip 允许玩家补声明
 * flavor 级片段，使第二季序章「回望」节点能引用更多上一季事件、提升连续感。
 * 仍遵守 S2-INHERITANCE-CONTRACT.md：只接受白名单 durableFacts，不伪造结局 ID，
 * 不写入 v4 来源存档，仅产出 summary 供 startSeason2 消费。
 */
export const buildSkipSummary = (
  route: RouteId,
  activePartner: CharacterId | 'none',
  flavorFacts: DurableFact[],
  organizations: Record<OrganizationId, { name: string }>,
): Season1OutcomeSummary => {
  if (!isSeason2ActiveRoute(route)) throw new Error(`片段跳过不支持该路线：${String(route)}`)
  if (activePartner !== 'none' && !isKnownRomanceCandidate(activePartner)) {
    throw new Error(`片段跳过不支持该伴侣：${String(activePartner)}`)
  }
  const orgDef = organizations[route]
  if (!orgDef) throw new Error(`片段跳过找不到组织定义：${String(route)}`)

  const bonded = activePartner !== 'none'
  const relationshipTiers: Partial<Record<CharacterId, number>> = bonded
    ? { [activePartner]: 100 }
    : {}
  const durableFacts: DurableFact[] = ['s1-route-complete', bonded ? 's1-partner-bonded' : 's1-partner-none']
  // 仅接受白名单内的 flavor 事实，去重追加。
  for (const fact of flavorFacts) {
    if (isDurableFact(fact) && !durableFacts.includes(fact)) durableFacts.push(fact)
  }

  const summary: Season1OutcomeSummary = {
    summaryVersion: 1,
    source: { kind: 'recap', contractVersion: RECP_CONTRACT_VERSION },
    route,
    organization: route,
    organizationName: orgDef.name,
    organizationEndingId: '',
    activePartner,
    relationshipTiers,
    durableFacts,
    createdAt: Date.now(),
  }
  const result = validateSeason1OutcomeSummary(summary)
  if (!result.ok) throw new Error(`片段跳过建档结果不合法：${result.errors.join('；')}`)
  return summary
}

// ---------------------------------------------------------------------------
// 摘要规范化与 digest（幂等去重）
// ---------------------------------------------------------------------------

const canonicalize = (value: unknown): string => {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`
  const obj = value as Record<string, unknown>
  const keys = Object.keys(obj).sort()
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalize(obj[k])}`).join(',')}}`
}

/** 仅对「内容」做规范化，排除 source / createdAt 等会变meta，使相同结果幂等。 */
const canonicalOutcomeContent = (summary: Season1OutcomeSummary) => ({
  route: summary.route,
  organization: summary.organization,
  organizationName: summary.organizationName,
  organizationEndingId: summary.organizationEndingId,
  activePartner: summary.activePartner,
  relationshipTiers: summary.relationshipTiers,
  durableFacts: [...summary.durableFacts].sort(),
  routeTransfer: summary.routeTransfer,
})

const fnv1aHex = (input: string): string => {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

/** 稳定 digest：相同内容（不论 source / createdAt）得到相同字符串。 */
export const computeOutcomeDigest = (summary: Season1OutcomeSummary): string => (
  fnv1aHex(canonicalize(canonicalOutcomeContent(summary)))
)

// ---------------------------------------------------------------------------
// Record 构建与去重
// ---------------------------------------------------------------------------

export const buildOutcomeRecord = (
  summary: Season1OutcomeSummary,
  contentRevision: string,
): Season1OutcomeRecord => {
  const digest = computeOutcomeDigest(summary)
  return {
    recordId: `outcome-${digest}`,
    digest,
    summary,
    source: summary.source,
    contentRevision,
    createdAt: summary.createdAt,
  }
}

/** 按 digest 去重，保留首次出现的 record。相同内容幂等。 */
export const dedupeByDigest = (records: Season1OutcomeRecord[]): Season1OutcomeRecord[] => {
  const seen = new Set<string>()
  const result: Season1OutcomeRecord[] = []
  for (const record of records) {
    if (seen.has(record.digest)) continue
    seen.add(record.digest)
    result.push(record)
  }
  return result
}

/** 把某个 campaign 复用的 record 回填 campaignId / lineageId（返回新对象，不修改入参）。 */
export const attachCampaignToRecord = (
  record: Season1OutcomeRecord,
  campaignId: string,
  lineageId: string,
): Season1OutcomeRecord => ({
  ...record,
  campaignId,
  lineageId,
})

// ---------------------------------------------------------------------------
// Season2OutcomeSummary（第二季结局摘要，来源第二季完成时 GameState）
// ---------------------------------------------------------------------------

interface Season2OutcomeSummaryFields {
  s2MainEnding: string
  s2EpilogueEnding: string
  s2RelationshipResolved: string
  activePartner: CharacterId | null
  route: RouteId | null
  organization: OrganizationId | null
  organizationName: string
  stats: { cohesion: number; reputation: number; resources: number }
  unlockedEndings: string[]
  createdAt: number
}

/** 3.1.1 及更早版本写入的记录，仅用于读取迁移。 */
export interface Season2OutcomeSummaryV1 extends Season2OutcomeSummaryFields {
  summaryVersion: 1
}

/** 自包含的第二季结果；S3 不再依赖已被删除的普通存档或 S1 archive。 */
export type Season2OutcomeSource = OutcomeSource | {
  kind: 'legacy'
  originalSummaryVersion: 1 | 2
}

export type Season2CompletionEvidence = 'explicit' | 'legacy-derived' | 'recap-declared'

export interface Season2OutcomeSummary extends Season2OutcomeSummaryFields {
  summaryVersion: 2
  source: Season2OutcomeSource
  durableFacts: DurableFact[]
  s2Complete: boolean
  s2EpilogueComplete: boolean
  finaleEndingId: 's2-finale-complete' | null
  completionEvidence: Season2CompletionEvidence
}

/** 一条记录被另一条取代的元数据 */
export interface SupersededInfo {
  /** 取代者的 recordId */
  byRecordId: string
  supersededAt: number
  reason: string
}

interface Season2OutcomeRecordFields {
  recordId: string
  digest: string
  contentRevision: string
  createdAt: number
  campaignId?: string
  lineageId?: string
  /** 当此记录被另一条取代时存在 */
  supersededBy?: SupersededInfo
}

export interface Season2OutcomeRecordV1 extends Season2OutcomeRecordFields {
  summary: Season2OutcomeSummaryV1
}

export interface Season2OutcomeRecord extends Season2OutcomeRecordFields {
  summary: Season2OutcomeSummary
}

export interface ExtractSeason2SummaryOptions {
  source?: Season2OutcomeSource
  durableFacts?: readonly DurableFact[]
  createdAt?: number
}

export const extractSeason2Summary = (
  state: GameState,
  options: ExtractSeason2SummaryOptions = {},
): Season2OutcomeSummary => {
  const createdAt = options.createdAt ?? Date.now()
  const embeddedS1 = 'season1Outcome' in state && isSeason1OutcomeSummary(state.season1Outcome)
    ? state.season1Outcome
    : null
  // Callers that persist an outcome must pass the S2 slot explicitly. The legacy marker prevents
  // a generic extraction helper from silently claiming either the S1 source or a made-up save slot.
  const source = options.source ?? { kind: 'legacy', originalSummaryVersion: 2 }
  const durableFacts = [...new Set(options.durableFacts ?? embeddedS1?.durableFacts ?? [])]
    .filter(isDurableFact)
    .sort()
  const finaleEndingId = state.unlockedEndings.includes('s2-finale-complete')
    ? 's2-finale-complete'
    : null

  return {
    summaryVersion: 2,
    source,
    durableFacts,
    s2Complete: state.flags.s2Complete === true,
    s2EpilogueComplete: state.flags.s2EpilogueComplete === true,
    finaleEndingId,
    completionEvidence: 'explicit',
    s2MainEnding: String(state.variables.s2MainEnding ?? ''),
    s2EpilogueEnding: String(state.variables.s2EpilogueEnding ?? ''),
    s2RelationshipResolved: String(state.variables.s2RelationshipResolved ?? 'none'),
    activePartner: state.activePartner,
    route: state.route,
    organization: state.organization,
    organizationName: state.organizationName,
    stats: { cohesion: state.stats.cohesion, reputation: state.stats.reputation, resources: state.stats.resources },
    unlockedEndings: state.unlockedEndings.filter((id) => id.startsWith('s2-')),
    createdAt,
  }
}

const canonicalizeS2Outcome = (summary: Season2OutcomeSummary) => ({
  durableFacts: [...new Set(summary.durableFacts)].sort(),
  s2Complete: summary.s2Complete,
  s2EpilogueComplete: summary.s2EpilogueComplete,
  finaleEndingId: summary.finaleEndingId,
  s2MainEnding: summary.s2MainEnding,
  s2EpilogueEnding: summary.s2EpilogueEnding,
  s2RelationshipResolved: summary.s2RelationshipResolved,
  activePartner: summary.activePartner,
  route: summary.route,
  organization: summary.organization,
  organizationName: summary.organizationName,
  stats: summary.stats,
  unlockedEndings: [...summary.unlockedEndings].sort(),
})

const canonicalizeS2OutcomeV1 = (summary: Season2OutcomeSummaryV1 | Season2OutcomeSummary) => ({
  s2MainEnding: summary.s2MainEnding,
  s2EpilogueEnding: summary.s2EpilogueEnding,
  s2RelationshipResolved: summary.s2RelationshipResolved,
  activePartner: summary.activePartner,
  route: summary.route,
  organization: summary.organization,
  organizationName: summary.organizationName,
  stats: summary.stats,
  unlockedEndings: [...summary.unlockedEndings].sort(),
})

export const computeSeason2OutcomeDigest = (summary: Season2OutcomeSummary): string =>
  fnv1aHex(canonicalize(canonicalizeS2Outcome(summary)))

/** Legacy digest is retained only to authenticate v1 archive identities during read migration. */
export const computeSeason2OutcomeDigestV1 = (summary: Season2OutcomeSummaryV1 | Season2OutcomeSummary): string =>
  fnv1aHex(canonicalize(canonicalizeS2OutcomeV1(summary)))

export const buildSeason2OutcomeRecord = (
  summary: Season2OutcomeSummary,
  contentRevision: string,
  lineageId?: string,
  campaignId?: string,
): Season2OutcomeRecord => {
  const digest = computeSeason2OutcomeDigest(summary)
  return {
    recordId: `s2-outcome-${digest}`,
    digest,
    summary,
    contentRevision,
    createdAt: summary.createdAt,
    ...(lineageId ? { lineageId } : {}),
    ...(campaignId ? { campaignId } : {}),
  }
}

// ---------------------------------------------------------------------------
// Season2OutcomeSummary 验证
// ---------------------------------------------------------------------------

const hasValidSeason2OutcomeFields = (value: Record<string, unknown>): boolean => {
  if (typeof value.s2MainEnding !== 'string') return false
  if (typeof value.s2EpilogueEnding !== 'string') return false
  if (typeof value.s2RelationshipResolved !== 'string') return false
  if (value.activePartner !== null && !isKnownRomanceCandidate(value.activePartner)) return false
  if (!isSeason2ActiveRoute(value.route) && value.route !== null) return false
  if (!isKnownOrganization(value.organization) && value.organization !== null) return false
  if (typeof value.organizationName !== 'string') return false
  if (!isPlainObject(value.stats) || !isFiniteNumber(value.stats.cohesion) || !isFiniteNumber(value.stats.reputation) || !isFiniteNumber(value.stats.resources)) return false
  if (!Array.isArray(value.unlockedEndings) || !value.unlockedEndings.every((e: unknown) => typeof e === 'string')) return false
  if (!isFiniteNumber(value.createdAt) || value.createdAt < 0) return false
  return true
}

export const isSeason2OutcomeSummaryV1 = (value: unknown): value is Season2OutcomeSummaryV1 => {
  if (!isPlainObject(value)) return false
  return value.summaryVersion === 1 && hasValidSeason2OutcomeFields(value)
}

export const isSeason2OutcomeSummary = (value: unknown): value is Season2OutcomeSummary => {
  if (!isPlainObject(value) || value.summaryVersion !== 2 || !hasValidSeason2OutcomeFields(value)) return false
  if (!isSeason2OutcomeSource(value.source) || !isDurableFactList(value.durableFacts)) return false
  if (typeof value.s2Complete !== 'boolean' || typeof value.s2EpilogueComplete !== 'boolean') return false
  if (value.s2EpilogueComplete && !value.s2Complete) return false
  if (value.finaleEndingId !== null && value.finaleEndingId !== 's2-finale-complete') return false
  if (!['explicit', 'legacy-derived', 'recap-declared'].includes(String(value.completionEvidence))) return false
  return true
}

export const isSeason2OutcomeSource = (value: unknown): value is Season2OutcomeSource => (
  isOutcomeSource(value)
  || (isPlainObject(value)
    && value.kind === 'legacy'
    && (value.originalSummaryVersion === 1 || value.originalSummaryVersion === 2))
)

/** Only a three-part proof can open S3; a non-empty ending string alone is never sufficient. */
export const isCompleteSeason2OutcomeSummary = (summary: Season2OutcomeSummary): boolean => (
  summary.s2Complete
  && summary.s2EpilogueComplete
  && summary.finaleEndingId === 's2-finale-complete'
  && summary.unlockedEndings.includes('s2-finale-complete')
  && summary.s2MainEnding.trim().length > 0
)

/** Archive writes are stricter than shape validation: only a coherent, completed active route is durable. */
export const isArchivableSeason2OutcomeRecord = (record: Season2OutcomeRecord): boolean => {
  const { summary } = record
  if (!isCompleteSeason2OutcomeSummary(summary)) return false
  if (summary.source.kind === 'save' && summary.completionEvidence !== 'explicit') return false
  if (summary.source.kind === 'recap' && summary.completionEvidence !== 'recap-declared') return false
  if (summary.source.kind === 'legacy' && (
    summary.source.originalSummaryVersion !== 1 || summary.completionEvidence !== 'legacy-derived'
  )) return false
  if (!isSeason2ActiveRoute(summary.route) || summary.organization !== summary.route) return false
  if (!summary.organizationName.trim()) return false
  return new RegExp(`^s2-ending-${summary.route}-(triumph|compromise)$`).test(summary.s2MainEnding)
}

const hasValidSeason2OutcomeRecordFields = (value: Record<string, unknown>): boolean => {
  if (typeof value.recordId !== 'string' || !value.recordId) return false
  if (typeof value.digest !== 'string' || !value.digest) return false
  if (typeof value.contentRevision !== 'string') return false
  if (!isFiniteNumber(value.createdAt) || value.createdAt < 0) return false
  if (value.campaignId !== undefined && typeof value.campaignId !== 'string') return false
  if (value.lineageId !== undefined && typeof value.lineageId !== 'string') return false
  if (value.supersededBy !== undefined) {
    if (!isPlainObject(value.supersededBy)) return false
    if (typeof value.supersededBy.byRecordId !== 'string' || !value.supersededBy.byRecordId) return false
    if (!isFiniteNumber(value.supersededBy.supersededAt) || value.supersededBy.supersededAt < 0) return false
    if (typeof value.supersededBy.reason !== 'string') return false
  }
  return true
}

export const isSeason2OutcomeRecordV1 = (value: unknown): value is Season2OutcomeRecordV1 => {
  if (!isPlainObject(value) || !hasValidSeason2OutcomeRecordFields(value)) return false
  if (!isSeason2OutcomeSummaryV1(value.summary)) return false
  const digest = computeSeason2OutcomeDigestV1(value.summary)
  return value.digest === digest && value.recordId === `s2-outcome-${digest}`
}

export const isSeason2OutcomeRecord = (value: unknown): value is Season2OutcomeRecord => {
  if (!isPlainObject(value)) return false
  if (!hasValidSeason2OutcomeRecordFields(value) || !isSeason2OutcomeSummary(value.summary)) return false
  const digest = value.summary.source.kind === 'legacy' && value.summary.source.originalSummaryVersion === 1
    ? computeSeason2OutcomeDigestV1(value.summary)
    : computeSeason2OutcomeDigest(value.summary)
  return value.digest === digest && value.recordId === `s2-outcome-${digest}`
}

/** Pure read-time summary migration. Unknown future versions are isolated instead of downgraded. */
export const migrateSeason2OutcomeSummary = (value: unknown): Season2OutcomeSummary | null => {
  if (isSeason2OutcomeSummary(value)) {
    return {
      ...value,
      source: { ...value.source },
      durableFacts: [...new Set(value.durableFacts)].sort(),
      stats: { ...value.stats },
      unlockedEndings: [...value.unlockedEndings],
    }
  }
  if (!isSeason2OutcomeSummaryV1(value)) return null
  const hasCompletionProof = value.s2MainEnding.trim().length > 0
    && value.s2EpilogueEnding.trim().length > 0
    && value.unlockedEndings.includes('s2-finale-complete')
  return {
    ...value,
    summaryVersion: 2,
    source: { kind: 'legacy', originalSummaryVersion: 1 },
    durableFacts: [],
    s2Complete: hasCompletionProof,
    s2EpilogueComplete: hasCompletionProof,
    finaleEndingId: hasCompletionProof ? 's2-finale-complete' : null,
    completionEvidence: 'legacy-derived',
    stats: { ...value.stats },
    unlockedEndings: [...value.unlockedEndings],
  }
}

/** Read-time record migration preserves legacy identity/digest and never rewrites storage implicitly. */
export const migrateSeason2OutcomeRecord = (value: unknown): Season2OutcomeRecord | null => {
  if (!isPlainObject(value) || !hasValidSeason2OutcomeRecordFields(value)) return null
  const rawIsV1 = isSeason2OutcomeSummaryV1(value.summary)
  if (rawIsV1 && !isSeason2OutcomeRecordV1(value)) return null
  const summary = migrateSeason2OutcomeSummary(value.summary)
  if (!summary) return null
  // Both generations are tamper-evident under their own canonical digest. A verified v1 identity
  // stays unchanged and receives an explicit legacy source instead of a newly computed v2 identity.
  const digest = summary.source.kind === 'legacy' && summary.source.originalSummaryVersion === 1
    ? computeSeason2OutcomeDigestV1(summary)
    : computeSeason2OutcomeDigest(summary)
  if (value.digest !== digest || value.recordId !== `s2-outcome-${digest}`) return null
  return {
    ...(value as unknown as Season2OutcomeRecordFields),
    summary,
    ...(value.supersededBy && isPlainObject(value.supersededBy)
      ? {
          supersededBy: {
            byRecordId: String(value.supersededBy.byRecordId),
            supersededAt: Number(value.supersededBy.supersededAt),
            reason: String(value.supersededBy.reason),
          },
        }
      : {}),
  }
}
