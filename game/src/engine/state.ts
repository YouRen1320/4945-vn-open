import { backgrounds } from '@/content/assets'
import { characters, romanceCandidates } from '@/content/characters'
import { getActor } from '@/content/storyActors'
import { computeWorldlineDeviation, settleButterflyThresholds, settleWorldlineThresholds } from '@/content/butterflyConfig'
import { organizations } from '@/content/organizations'
import { supportAbilities } from '@/content/supportAbilities'

import type {
  CharacterId,
  Condition,
  Effect,
  GameSetup,
  GameState,
  NodeTarget,
  NumericStat,
  OrganizationId,
  RandomTarget,
  RelationshipState,
  StoryChoice,
  StoryNode,
  SupportUseResult,
} from './types'

export const GAME_SCHEMA_VERSION = 4
// 版本号唯一数据源是 package.json，由 vite define 注入，发版无需再手工同步此常量。
export const GAME_APP_VERSION = __APP_VERSION__

// GameState 的契约本身就是 JSON 存档数据；JSON 快照也能安全剥离 Vue/Pinia 的响应式 Proxy。
export const cloneGameState = (source: GameState): GameState => JSON.parse(JSON.stringify(source)) as GameState

const statBounds: Record<NumericStat, [number, number]> = {
  level: [1, 99],
  power: [0, 12],
  skill: [0, 12],
  money: [0, 50],
  reputation: [-5, 5],
  cohesion: [0, 5],
  resources: [0, 5],
  evidence: [0, 5],
  contribution: [0, 5],
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const getSupportDefinition = (character: CharacterId) => (
  Object.hasOwn(supportAbilities, character) ? supportAbilities[character] : undefined
)

const createRelationships = (): Record<CharacterId, RelationshipState> =>
  Object.fromEntries(
    (Object.keys(characters) as CharacterId[]).map((id) => [
      id,
      { trust: id === 'mentor' ? 1 : 0, affinity: 0, progress: 0, stance: 'unknown' },
    ]),
  ) as Record<CharacterId, RelationshipState>

export const createInitialGameState = (setup: GameSetup): GameState => ({
  schemaVersion: GAME_SCHEMA_VERSION,
  appVersion: GAME_APP_VERSION,
  nodeId: 'p00-opening',
  playerName: setup.playerName.trim() || '新手',
  route: null,
  organization: null,
  organizationName: '无组织',
  role: 'none',
  date: '2026-07-17',
  chapter: 'prologue',
  stats: {
    level: 1,
    power: 1,
    skill: 0,
    money: 50,
    reputation: 0,
    cohesion: 0,
    resources: 0,
    evidence: 0,
    contribution: 0,
  },
  organizationRelations: { org1: 0, org2: 0, org3: 0, org4: 0, org5: 0, org6: 0 },
  relationships: createRelationships(),
  activePartner: null,
  supportAbilities: {},
  highCouncil: [],
  flags: {},
  variables: {},
  processedNodes: [],
  seenNodes: [],
  unlockedCgs: [],
  unlockedEndings: [],
  history: [],
})

const compare = (actual: number, operator: 'gte' | 'lte' | 'eq', expected: number) => {
  if (operator === 'gte') return actual >= expected
  if (operator === 'lte') return actual <= expected
  return actual === expected
}

export const evaluateCondition = (condition: Condition, state: GameState): boolean => {
  switch (condition.type) {
    case 'flag':
      return Boolean(state.flags[condition.key]) === (condition.value ?? true)
    case 'route':
      return state.route === condition.value
    case 'organization':
      return state.organization === condition.value
    case 'stat':
      return compare(state.stats[condition.key], condition.operator, condition.value)
    case 'organizationRelation':
      return compare(state.organizationRelations[condition.organization], condition.operator, condition.value)
    case 'relationship':
      return compare(state.relationships[condition.character][condition.key], condition.operator, condition.value)
    case 'relationshipProgress':
      return compare(state.relationships[condition.character].progress, condition.operator, condition.value)
    case 'variable': {
      const actual = state.variables[condition.key]
      if (condition.operator === 'eq') return actual === condition.value
      if (condition.operator === 'neq') return actual !== condition.value
      if (typeof actual !== 'number' || typeof condition.value !== 'number') return false
      return condition.operator === 'gte' ? actual >= condition.value : actual <= condition.value
    }
    case 'activePartner':
      return state.activePartner === condition.value
    case 'all':
      return condition.conditions.every((item) => evaluateCondition(item, state))
    case 'any':
      return condition.conditions.some((item) => evaluateCondition(item, state))
    case 'not':
      return !evaluateCondition(condition.condition, state)
  }
}

/**
 * Simple deterministic PRNG (mulberry32) for repeatable random branching.
 * Seedable random lets the same save always land on the same branch,
 * while Math.random (no seed) lets the player re-roll by reloading.
 */
const seededRandom = (seed: number): (() => number) => {
  let s = seed | 0
  return () => {
    s = (s + 0x6D2B79F5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 从 state 的多个维度哈希出一个确定性种子，不依赖 Math.random。 */
const hashSeed = (state: GameState, seedKey: string): number => {
  const parts = [
    seedKey,
    state.variables[seedKey] ?? 0,
    state.nodeId,
    state.date,
    ...Object.entries(state.flags).filter(([, v]) => v).map(([k]) => k),
  ]
  const raw = parts.join('|')
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0
  }
  return hash
}

/**
 * 按加权随机从 RandomTarget.cases 中选择下一节点。
 * - condition 未满足的 case 自动排除（权重归零）
 * - 总权重为 0 时走 fallback
 * - 有 seedKey 时使用确定性随机（存档可复现），否则使用真随机（读档重选可改命）
 */
const resolveRandomTarget = (target: RandomTarget, state: GameState): string => {
  const pool = target.cases
    .filter((c) => !c.condition || evaluateCondition(c.condition, state))
    .map((c) => ({ next: c.next, weight: Math.max(0, c.weight) }))

  const totalWeight = pool.reduce((sum, c) => sum + c.weight, 0)
  if (totalWeight <= 0) return target.fallback

  const roll = target.seedKey
    ? seededRandom(hashSeed(state, target.seedKey))() * totalWeight
    : Math.random() * totalWeight

  let cumulative = 0
  for (const c of pool) {
    cumulative += c.weight
    if (roll < cumulative) return c.next
  }
  return target.fallback
}

export const resolveTarget = (target: NodeTarget, state: GameState): string => {
  if (typeof target === 'string') return target
  if (target.type === 'random') return resolveRandomTarget(target, state)
  if (target.type === 'stateVariable') {
    const savedTarget = state.variables[target.key]
    return typeof savedTarget === 'string' && savedTarget.trim() ? savedTarget : target.fallback
  }
  return target.cases.find(({ when }) => evaluateCondition(when, state))?.next ?? target.fallback
}

const normalizeState = (state: GameState) => {
  state.schemaVersion = GAME_SCHEMA_VERSION
  state.appVersion = GAME_APP_VERSION

  // 只遍历引擎声明的统计项；迁移层会拒绝未知键，双重防止污染存档触发解构错误。
  for (const key of Object.keys(statBounds) as NumericStat[]) {
    const [min, max] = statBounds[key]
    state.stats[key] = clamp(state.stats[key], min, max)
  }

  for (const id of Object.keys(state.organizationRelations) as OrganizationId[]) {
    state.organizationRelations[id] = clamp(state.organizationRelations[id], -2, 2)
  }

  for (const relationship of Object.values(state.relationships)) {
    relationship.trust = clamp(relationship.trust, -3, 8)
    relationship.affinity = clamp(relationship.affinity, -3, 8)
    relationship.progress = clamp(relationship.progress, 0, 100)
  }

  if (state.activePartner !== null && !(romanceCandidates as readonly CharacterId[]).includes(state.activePartner)) {
    state.activePartner = null
  }

  let hasActiveSupport = false
  for (const [rawId, ability] of Object.entries(state.supportAbilities)) {
    if (!ability) continue
    const id = rawId as CharacterId
    if (!getSupportDefinition(id)) {
      delete state.supportAbilities[id]
      continue
    }
    ability.charges = clamp(Math.floor(ability.charges), 0, 1)
    if (!ability.unlocked || ability.charges === 0) ability.active = false
    if (ability.active && hasActiveSupport) ability.active = false
    else if (ability.active) hasActiveSupport = true
  }

  // Reaching a data-defined threshold unlocks the ability once; romance progress is never spent.
  for (const [rawId, definition] of Object.entries(supportAbilities)) {
    if (!definition) continue
    const id = rawId as CharacterId
    if (state.relationships[id].progress < definition.unlockAt) continue
    const current = state.supportAbilities[id]
    if (!current?.unlocked) {
      state.supportAbilities[id] = {
        unlocked: true,
        charges: 1,
        active: false,
        lastRechargeChapter: state.chapter,
      }
    }
  }

  // 蝴蝶效应阈值结算：每次规范化时检查六维度累积值是否触发新 flag。
  settleButterflyThresholds(state.variables, state.flags)

  // 世界线异变结算：计算总偏差并检查阈值。
  const deviation = computeWorldlineDeviation(state.variables)
  state.variables['worldlineDeviation'] = deviation
  settleWorldlineThresholds(deviation, state.flags)
}

export const applyEffects = (source: GameState, effects: Effect[] = []): GameState => {
  const state = cloneGameState(source)

  for (const effect of effects) {
    switch (effect.type) {
      case 'stat':
        state.stats[effect.key] = effect.operation === 'set' ? effect.value : state.stats[effect.key] + effect.value
        break
      case 'organizationRelation':
        state.organizationRelations[effect.organization] += effect.value
        break
      case 'relationship':
        state.relationships[effect.character][effect.key] += effect.value
        break
      case 'activePartnerRelationship': {
        // 季间剧情必须把关系代价落到真实伴侣；无伴侣时才使用剧情声明的默认角色。
        const character = state.activePartner ?? effect.fallbackCharacter
        if (character) state.relationships[character][effect.key] += effect.value
        break
      }
      case 'relationshipProgress':
        state.relationships[effect.character].progress += effect.value
        break
      case 'activePartner':
        state.activePartner = effect.character
        break
      case 'stance':
        state.relationships[effect.character].stance = effect.value
        break
      case 'flag':
        state.flags[effect.key] = effect.value ?? true
        break
      case 'variable':
        state.variables[effect.key] = effect.value
        break
      case 'route':
        state.route = effect.route
        state.organization = effect.organization
        state.organizationName = effect.organizationName ?? organizations[effect.organization].name
        state.role = effect.role ?? 'leader'
        break
      case 'organizationName':
        state.organizationName = effect.value
        break
      case 'highCouncil':
        state.highCouncil = [...effect.members]
        break
      case 'unlockCg':
        if (!state.unlockedCgs.includes(effect.id)) state.unlockedCgs.push(effect.id)
        break
      case 'unlockEnding':
        if (!state.unlockedEndings.includes(effect.id)) state.unlockedEndings.push(effect.id)
        if (state.activePartner === null && effect.id.startsWith('bond-')) {
          const candidate = effect.id.slice('bond-'.length) as CharacterId
          if ((romanceCandidates as readonly CharacterId[]).includes(candidate)) state.activePartner = candidate
        }
        break
      case 'butterflyDelta': {
        const cur = (state.variables[effect.key] as number) ?? 0
        state.variables[effect.key] = clamp(cur + effect.delta, -10, 10)
        break
      }
      case 'archiveSeason2Outcome':
        // 纯标记；不修改状态。实际写入由 store/game.ts 在 enterNode 后触发。
        break
    }
  }

  normalizeState(state)
  return state
}

/** Arm one unlocked companion ability; its charge is consumed only when a choice is committed. */
export const activateSupportAbility = (source: GameState, character: CharacterId): GameState => {
  const definition = getSupportDefinition(character)
  const current = source.supportAbilities[character]
  if (!definition || !current?.unlocked || current.charges <= 0) {
    throw new Error('当前支援尚未解锁，或本幕次数已用完。')
  }

  const state = cloneGameState(source)
  for (const ability of Object.values(state.supportAbilities)) {
    if (ability) ability.active = false
  }
  state.supportAbilities[character] = { ...current, active: true }
  return state
}

/** Cancel an armed ability without spending its chapter charge. */
export const deactivateSupportAbility = (source: GameState, character: CharacterId): GameState => {
  const current = source.supportAbilities[character]
  if (!current?.active) return cloneGameState(source)
  const state = cloneGameState(source)
  state.supportAbilities[character] = { ...current, active: false }
  return state
}

const rechargeSupportAbilities = (state: GameState) => {
  for (const ability of Object.values(state.supportAbilities)) {
    if (!ability?.unlocked || ability.lastRechargeChapter === state.chapter) continue
    ability.charges = Math.max(ability.charges, 1)
    ability.active = false
    ability.lastRechargeChapter = state.chapter
  }
}

export const renderText = (text: string, state: GameState): string => {
  // 剧本可读取玩家在剧情中确认的安全变量；内置字段最后覆盖同名变量，避免伪造核心状态。
  const replacements: Record<string, string> = {
    ...Object.fromEntries(Object.entries(state.variables).map(([key, value]) => [key, String(value)])),
    player: state.playerName,
    org: state.organizationName,
    money: String(state.stats.money),
    route: state.route ? organizations[state.route].name : '无组织',
  }

  return text.replace(/\{\{(\w+)\}\}/g, (match, key: string) => replacements[key] ?? match)
}

export const availableChoices = (node: StoryNode, state: GameState): StoryChoice[] =>
  (node.choices ?? []).filter((choice) => !choice.condition || evaluateCondition(choice.condition, state))

// 进入节点时只应用一次副作用，确保读档和界面重绘不会重复加好感或资源。
export const enterNode = (source: GameState, node: StoryNode): GameState => {
  let state = cloneGameState(source)
  const firstEntry = !state.processedNodes.includes(node.id)

  if (firstEntry) {
    state = applyEffects(state, node.onEnter)
    state.processedNodes.push(node.id)
    const collectionId = backgrounds[node.background].collectionId
    if (collectionId && !state.unlockedCgs.includes(collectionId)) state.unlockedCgs.push(collectionId)
  }

  state.nodeId = node.id
  if (!node.sideStory) {
    state.date = node.date
    state.chapter = node.chapter
  }
  // Loading a processed node still normalizes migrated fields and unlock thresholds.
  normalizeState(state)
  rechargeSupportAbilities(state)
  if (!state.seenNodes.includes(node.id)) state.seenNodes.push(node.id)

  const rendered = renderText(node.text, state)
  const previous = state.history.at(-1)
  if (!previous || previous.nodeId !== node.id) {
    const definition = getActor(node.speaker)
    state.history.push({
      nodeId: node.id,
      date: state.date,
      speaker: node.speaker,
      speakerName: node.speaker === 'player' ? state.playerName : definition.name,
      text: rendered,
      timestamp: Date.now(),
    })
    if (state.history.length > 500) state.history.splice(0, state.history.length - 500)
  }

  return state
}

export const commitChoice = (
  source: GameState,
  node: StoryNode,
  choiceId: string,
): { state: GameState; next: string; usedSupport?: CharacterId; supportResult?: SupportUseResult } => {
  const choice = availableChoices(node, source).find((item) => item.id === choiceId)
  if (!choice) throw new Error(`节点 ${node.id} 不存在可用选项 ${choiceId}`)

  const state = applyEffects(source, choice.effects)
  let usedSupportName: string | null = null
  let supportResult: SupportUseResult | undefined
  // Support bonuses belong to historical route decisions; optional relationship scenes never consume them.
  const activeSupport = node.sideStory
    ? undefined
    : (Object.entries(state.supportAbilities) as Array<[CharacterId, GameState['supportAbilities'][CharacterId]]>)
        .find(([character, ability]) => Boolean(getSupportDefinition(character) && ability?.active && ability.charges > 0))
  let usedSupport: CharacterId | undefined
  if (activeSupport) {
    const [character, ability] = activeSupport
    const definition = getSupportDefinition(character)
    if (ability && definition) {
      const before = { ...state.stats }
      for (const [rawKey, value] of Object.entries(definition.bonuses)) {
        const key = rawKey as NumericStat
        state.stats[key] += value ?? 0
      }
      normalizeState(state)
      const appliedBonuses = Object.fromEntries(
        (Object.keys(definition.bonuses) as NumericStat[])
          .map((key) => [key, state.stats[key] - before[key]])
          .filter(([, value]) => value !== 0),
      ) as Partial<Record<NumericStat, number>>
      const consumed = Object.keys(appliedBonuses).length > 0
      if (consumed) {
        usedSupport = character
        usedSupportName = definition.name
        ability.charges -= 1
      }
      ability.active = false
      normalizeState(state)
      supportResult = { character, name: definition.name, appliedBonuses, consumed }
    }
  }
  const historyEntry = state.history.findLast((entry) => entry.nodeId === node.id)
  if (historyEntry) {
    const supportPrefix = usedSupportName ? `[${usedSupportName}] ` : ''
    historyEntry.choiceLabel = `${supportPrefix}${renderText(choice.label, state)}`
  }
  return { state, next: resolveTarget(choice.next, state), usedSupport, supportResult }
}

export const commitTextEntry = (
  source: GameState,
  node: StoryNode,
  rawValue: string,
): { state: GameState; next: string } => {
  const entry = node.textEntry
  if (!entry) throw new Error(`节点 ${node.id} 不接受文本输入`)

  const value = rawValue.trim()
  const length = [...value].length
  if (!value || length > entry.maxLength) throw new Error(`请输入1—${entry.maxLength}个字符`)

  // 文本入口只写入剧本声明的变量；组织名同步由显式 applyTo 控制，避免任意字段注入。
  let state = applyEffects(source, [{ type: 'variable', key: entry.key, value }])
  if (entry.applyTo === 'organizationName') {
    state = applyEffects(state, [{ type: 'organizationName', value }])
  }
  const historyEntry = state.history.findLast((item) => item.nodeId === node.id)
  if (historyEntry) historyEntry.choiceLabel = `确认「${value}」`
  return { state, next: resolveTarget(entry.next, state) }
}
