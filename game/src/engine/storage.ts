import { characters, romanceCandidates } from '@/content/characters'
import { romanceProfiles } from '@/content/romanceProfiles'
import { storyById } from '@/content/story'
import { isActorId, isCharacterId } from '@/content/storyActors'
import { supportAbilities as supportAbilityDefinitions } from '@/content/supportAbilities'

import type {
  CharacterId,
  CoreStats,
  GameSettings,
  GameState,
  OrganizationId,
  RelationshipState,
  SaveMetadata,
  SaveRecord,
} from './types'
import { cloneGameState, GAME_APP_VERSION, GAME_SCHEMA_VERSION } from './state'

export const SAVE_SLOTS = ['auto', 'quick', '1', '2', '3', '4', '5', '6'] as const
export type SaveSlot = (typeof SAVE_SLOTS)[number]

// v1.6+ writes schema-4 saves while keeping both v1.5 and v1.4 checkpoints read-only.
// A server rollback therefore never asks older code to understand the partner field.
const SAVE_PREFIX = '4945-vn:v4:save:'
const V15_SAVE_PREFIX = '4945-vn:v3:save:'
const LEGACY_SAVE_PREFIX = '4945-vn:save:'
const SETTINGS_KEY = '4945-vn:settings'
const COLLECTION_KEY = '4945-vn:collection'

export const defaultSettings: GameSettings = {
  textSpeed: 28,
  autoDelay: 1900,
  musicVolume: 0.55,
  soundVolume: 0.7,
  muted: false,
  reducedMotion: false,
  skipUnread: false,
}

const hasStorage = () => typeof window !== 'undefined' && 'localStorage' in window

const statKeys: Array<keyof CoreStats> = [
  'level', 'power', 'skill', 'money', 'reputation', 'cohesion', 'resources', 'evidence', 'contribution',
]
const organizationIds: OrganizationId[] = ['org1', 'org2', 'org3', 'org4', 'org5', 'org6']
const roles = new Set(['none', 'member', 'elite', 'executive', 'leader'])
const chapters = new Set(['prologue', 'act1', 'act2', 'act3', 'act4', 'epilogue'])
const stances = new Set(['unknown', 'support', 'watch', 'oppose', 'left'])

// 这三个结构守卫同时被 season2-storage 复用，是全存储层共享的单一实现。
export const isPlainObject = (value: unknown): value is Record<string, unknown> => (
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)
)
export const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
export const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every((item) => typeof item === 'string')
const isKnownStoryNode = (value: unknown): value is string => (
  typeof value === 'string' && Object.hasOwn(storyById, value)
)
const isKnownCharacter = isCharacterId
const isKnownSupport = (value: unknown): value is CharacterId => (
  typeof value === 'string' && Object.hasOwn(supportAbilityDefinitions, value)
)

const clampSetting = (value: unknown, fallback: number, min: number, max: number) => (
  isFiniteNumber(value) ? Math.min(max, Math.max(min, value)) : fallback
)

/** Local storage is untrusted; every setting is type-checked and bounded before audio or UI reads it. */
export const normalizeSettings = (value: unknown): GameSettings => {
  const saved = isPlainObject(value) ? value : {}
  return {
    textSpeed: clampSetting(saved.textSpeed, defaultSettings.textSpeed, 8, 70),
    autoDelay: clampSetting(saved.autoDelay, defaultSettings.autoDelay, 800, 4000),
    musicVolume: clampSetting(saved.musicVolume, defaultSettings.musicVolume, 0, 1),
    soundVolume: clampSetting(saved.soundVolume, defaultSettings.soundVolume, 0, 1),
    muted: typeof saved.muted === 'boolean' ? saved.muted : defaultSettings.muted,
    reducedMotion: typeof saved.reducedMotion === 'boolean' ? saved.reducedMotion : defaultSettings.reducedMotion,
    skipUnread: typeof saved.skipUnread === 'boolean' ? saved.skipUnread : defaultSettings.skipUnread,
  }
}

/** Runtime validation prevents a partially shaped import from being accepted and crashing only after load. */
export const isStructurallyValidState = (
  candidate: Partial<GameState>,
  expectedSchemaVersion = GAME_SCHEMA_VERSION,
) => {
  if (
    candidate.schemaVersion !== expectedSchemaVersion
    || !isKnownStoryNode(candidate.nodeId)
    || typeof candidate.playerName !== 'string'
    || typeof candidate.organizationName !== 'string'
    || typeof candidate.date !== 'string'
    || (candidate.activePartner !== null
      && (!isKnownCharacter(candidate.activePartner)
        || !(romanceCandidates as readonly CharacterId[]).includes(candidate.activePartner)))
    || (candidate.route !== null && !['org1', 'org2', 'org3', 'org4', 'org5', 'org6'].includes(candidate.route ?? ''))
    || (candidate.organization !== null && !organizationIds.includes(candidate.organization as OrganizationId))
    || !roles.has(candidate.role ?? '')
    || !chapters.has(candidate.chapter ?? '')
  ) return false

  if (!isPlainObject(candidate.stats)
    || !statKeys.every((key) => isFiniteNumber(candidate.stats?.[key]))
    || !Object.keys(candidate.stats).every((key) => statKeys.includes(key as keyof CoreStats))) return false
  if (!isPlainObject(candidate.organizationRelations)
    || !organizationIds.every((id) => isFiniteNumber(candidate.organizationRelations?.[id]))
    || !Object.keys(candidate.organizationRelations).every((id) => organizationIds.includes(id as OrganizationId))) return false
  if (!isPlainObject(candidate.relationships)) return false
  if (!Object.keys(candidate.relationships).every(isKnownCharacter)) return false
  for (const id of Object.keys(characters) as CharacterId[]) {
    const relationship = candidate.relationships[id]
    if (!relationship
      || !isFiniteNumber(relationship.trust)
      || !isFiniteNumber(relationship.affinity)
      || !isFiniteNumber(relationship.progress)
      || !stances.has(relationship.stance)) return false
  }

  if (!isPlainObject(candidate.supportAbilities)) return false
  if (!Object.keys(candidate.supportAbilities).every(isKnownSupport)) return false
  for (const value of Object.values(candidate.supportAbilities)) {
    if (!isPlainObject(value)
      || typeof value.unlocked !== 'boolean'
      || !isFiniteNumber(value.charges)
      || typeof value.active !== 'boolean'
      || (value.lastRechargeChapter !== null && !chapters.has(String(value.lastRechargeChapter)))) return false
  }

  if (!Array.isArray(candidate.highCouncil)
    || !candidate.highCouncil.every(isKnownCharacter)
    || !isPlainObject(candidate.flags)
    || !Object.values(candidate.flags).every((value) => typeof value === 'boolean')
    || !isPlainObject(candidate.variables)
    || !Object.values(candidate.variables).every((value) => typeof value === 'string' || isFiniteNumber(value))
    || (candidate.variables.romanceReturnNode !== undefined
      && !isKnownStoryNode(candidate.variables.romanceReturnNode))
    || !isStringArray(candidate.processedNodes)
    || !candidate.processedNodes.every(isKnownStoryNode)
    || !isStringArray(candidate.seenNodes)
    || !candidate.seenNodes.every(isKnownStoryNode)
    || !isStringArray(candidate.unlockedCgs)
    || !isStringArray(candidate.unlockedEndings)
    || !Array.isArray(candidate.history)) return false

  return candidate.history.every((entry) => (
    isPlainObject(entry)
    && isKnownStoryNode(entry.nodeId)
    && typeof entry.date === 'string'
    && isActorId(entry.speaker)
    && typeof entry.speakerName === 'string'
    && typeof entry.text === 'string'
    && (entry.choiceLabel === undefined || typeof entry.choiceLabel === 'string')
    && isFiniteNumber(entry.timestamp)
  ))
}

const migratedProgress = (trust: number, affinity: number) => Math.round(
  (Math.max(0, Math.min(8, trust)) / 8) * 45
  + (Math.max(0, Math.min(8, affinity)) / 8) * 55,
)

/**
 * Upgrade persisted profiles while filling newly introduced characters and
 * relationship fields. Existing trust/affinity becomes partial visible progress.
 */
export const migrateGameState = (value: unknown): GameState | null => {
  if (!value || typeof value !== 'object') return null
  let candidate: Partial<GameState> & Record<string, unknown>
  try {
    candidate = JSON.parse(JSON.stringify(value)) as Partial<GameState> & Record<string, unknown>
  } catch {
    return null
  }
  if (![1, 2, 3, GAME_SCHEMA_VERSION].includes(Number(candidate.schemaVersion))) return null
  const sourceSchema = Number(candidate.schemaVersion)

  // Current-schema imports must already contain every relationship; only old saves may gain newly added cast members.
  if (!isPlainObject(candidate.relationships)) return null
  if (sourceSchema === GAME_SCHEMA_VERSION) {
    const ids = Object.keys(characters) as CharacterId[]
    if (!ids.every((id) => isPlainObject(candidate.relationships?.[id]))) return null
  } else if (Object.keys(candidate.relationships).length === 0) return null

  if (candidate.schemaVersion === 1) {
    delete candidate.gender
    delete candidate.publicIdentity
    delete candidate.tone
  }

  const savedRelationships = (candidate.relationships ?? {}) as Partial<Record<CharacterId, Partial<RelationshipState>>>
  candidate.relationships = Object.fromEntries(
    (Object.keys(characters) as CharacterId[]).map((id) => {
      const saved = savedRelationships[id]
      const trust = typeof saved?.trust === 'number' ? saved.trust : id === 'mentor' ? 1 : 0
      const affinity = typeof saved?.affinity === 'number' ? saved.affinity : 0
      return [id, {
        trust,
        affinity,
        progress: typeof saved?.progress === 'number' ? saved.progress : migratedProgress(trust, affinity),
        stance: saved?.stance ?? 'unknown',
      }]
    }),
  ) as Record<CharacterId, RelationshipState>
  const migratedRelationships = candidate.relationships as Record<CharacterId, RelationshipState>

  if (sourceSchema <= 2) {
    const flags = isPlainObject(candidate.flags) ? candidate.flags : {}
    const hasFlag = (key: string) => flags[key] === true
    const qualifies = (id: CharacterId, trust: number, affinity: number) => (
      migratedRelationships[id].trust >= trust && migratedRelationships[id].affinity >= affinity
    )

    // Preserve every v1.4 pre-ending romance choice after progress becomes a v1.5 gate.
    const legacyEligible: Partial<Record<CharacterId, boolean>> = {
      shana: qualifies('shana', 3, 3),
      swordheart: hasFlag('swordheartRosterChecked')
        && hasFlag('swordheartReconnectedRoster')
        && hasFlag('swordheartLastCheck')
        && qualifies('swordheart', 6, 5),
      xilufei: hasFlag('xilufeiAccomplice') && qualifies('xilufei', 3, 3),
      takemehand: qualifies('takemehand', 2, 2),
      heartbeat: qualifies('heartbeat', 4, 3),
      qifu: (hasFlag('privateTalkWithQifu') && qualifies('qifu', 3, 2))
        || (hasFlag('stayedWithQifuAfterRebuild') && qualifies('qifu', 6, 4)),
      yanqiu: hasFlag('yanqiuStayed') && qualifies('yanqiu', 5, 1),
      huayue: hasFlag('huayueSharedVulnerability')
        && hasFlag('huayueSharedNightShift')
        && hasFlag('huayueTrustedWithWeakness')
        && qualifies('huayue', 6, 6),
      wenxian: hasFlag('playerPromisedOrg5Stay') && qualifies('wenxian', 5, 4),
    }
    for (const [rawId, eligible] of Object.entries(legacyEligible)) {
      if (eligible) migratedRelationships[rawId as CharacterId].progress = 100
    }
  }

  if (!candidate.supportAbilities || typeof candidate.supportAbilities !== 'object') candidate.supportAbilities = {}
  // A relationship ending already reached in 1.4 migrates as complete, so visible progress and support unlocks agree.
  for (const id of romanceCandidates) {
    if (candidate.unlockedEndings?.includes(`bond-${id}`) || candidate.flags?.[`bonded${id[0]?.toUpperCase()}${id.slice(1)}`]) {
      candidate.relationships[id].progress = 100
    }
  }
  if (sourceSchema < GAME_SCHEMA_VERSION) {
    candidate.activePartner = romanceCandidates.find((id) => candidate.unlockedEndings?.includes(`bond-${id}`)) ?? null
  }
  // 旧版一组祈福羁绊会绕过组织结局，导致事件二缺少必需的 r1-* 继承键。
  // 依据终局旗标补齐原本应并存的组织结局；异常或更早的存档沿用路线默认的 order。
  if (candidate.route === 'org1'
    && candidate.organization === 'org1'
    && Array.isArray(candidate.unlockedEndings)
    && candidate.unlockedEndings.includes('bond-qifu')
    && !candidate.unlockedEndings.some((id) => typeof id === 'string' && id.startsWith('r1-'))
    && isPlainObject(candidate.flags)) {
    const flags = candidate.flags as Record<string, unknown>
    const endingId = flags.org1DefendOrder === true || flags.org1ClaimVoice !== true
      ? 'r1-order'
      : 'r1-voice'
    const endingFlag = endingId === 'r1-order' ? 'org1EndingOrder' : 'org1EndingVoice'
    candidate.unlockedEndings = [...new Set([...candidate.unlockedEndings, endingId])]
    flags[endingFlag] = true
  }
  if (isPlainObject(candidate.flags) && Array.isArray(candidate.unlockedCgs)) {
    // v1.7 keeps schema 4 and the v4 key; completed v1.6 dates derive their newly added gallery unlock here.
    for (const id of romanceCandidates) {
      const profile = romanceProfiles[id]
      if (candidate.flags[profile.completionFlag] === true
        && !candidate.unlockedCgs.includes(profile.firstDateCgId)) {
        candidate.unlockedCgs.push(profile.firstDateCgId)
      }
    }
  }
  candidate.schemaVersion = GAME_SCHEMA_VERSION
  candidate.appVersion = GAME_APP_VERSION
  if (!candidate.variables || typeof candidate.variables !== 'object') candidate.variables = {}
  return isStructurallyValidState(candidate) ? candidate as GameState : null
}

export const createSaveRecord = (slot: SaveSlot, state: GameState): SaveRecord => ({
  slot,
  savedAt: Date.now(),
  nodeId: state.nodeId,
  date: state.date,
  chapter: state.chapter,
  route: state.route,
  playerName: state.playerName,
  organizationName: state.organizationName,
  preview: state.history.at(-1)?.text.slice(0, 72) ?? '新的记录',
  schemaVersion: GAME_SCHEMA_VERSION,
  state: cloneGameState(state),
})

export const writeSave = (slot: SaveSlot, state: GameState): SaveRecord => {
  const record = createSaveRecord(slot, state)
  if (hasStorage()) localStorage.setItem(`${SAVE_PREFIX}${slot}`, JSON.stringify(record))
  return record
}

export const readSave = (slot: SaveSlot): SaveRecord | null => {
  if (!hasStorage()) return null
  const canonicalKey = `${SAVE_PREFIX}${slot}`
  const canonicalRaw = localStorage.getItem(canonicalKey)
  const v15Raw = localStorage.getItem(`${V15_SAVE_PREFIX}${slot}`)
  const legacyRaw = localStorage.getItem(`${LEGACY_SAVE_PREFIX}${slot}`)
  const candidates = [
    { raw: canonicalRaw, fallback: false },
    { raw: v15Raw, fallback: true },
    { raw: legacyRaw, fallback: true },
  ]

  for (const source of candidates) {
    if (!source.raw) continue
    try {
      const record = JSON.parse(source.raw) as Partial<SaveRecord>
      if (!isPlainObject(record)
        || record.slot !== slot
        || !isFiniteNumber(record.savedAt)
        || record.savedAt < 0
        || record.savedAt > 8.64e15
        || typeof record.preview !== 'string') continue
      const state = migrateGameState(record.state)
      if (!state) continue
      const migrated: SaveRecord = {
        slot,
        savedAt: record.savedAt,
        nodeId: state.nodeId,
        date: state.date,
        chapter: state.chapter,
        route: state.route,
        playerName: state.playerName,
        organizationName: state.organizationName,
        preview: record.preview.slice(0, 200),
        schemaVersion: GAME_SCHEMA_VERSION,
        state,
      }
      if (source.fallback
        || record.schemaVersion !== GAME_SCHEMA_VERSION
        || record.nodeId !== state.nodeId
        || record.date !== state.date
        || record.chapter !== state.chapter
        || record.route !== state.route
        || record.playerName !== state.playerName
        || record.organizationName !== state.organizationName
        || record.preview !== migrated.preview) {
        localStorage.setItem(canonicalKey, JSON.stringify(migrated))
      }
      return migrated
    } catch {
      // A damaged v1.5 record falls back to the untouched v1.4 checkpoint when available.
    }
  }
  return null
}

export const listSaves = (): Array<SaveMetadata | null> =>
  SAVE_SLOTS.map((slot) => {
    const save = readSave(slot)
    if (!save) return null
    const { state: _state, schemaVersion: _schemaVersion, ...metadata } = save
    return metadata
  })

export const deleteSave = (slot: SaveSlot) => {
  if (!hasStorage()) return
  localStorage.removeItem(`${SAVE_PREFIX}${slot}`)
  // Explicit deletion removes rollback checkpoints so an old save cannot unexpectedly reappear.
  localStorage.removeItem(`${V15_SAVE_PREFIX}${slot}`)
  localStorage.removeItem(`${LEGACY_SAVE_PREFIX}${slot}`)
}

export const exportSave = (slot: SaveSlot): string => {
  const record = readSave(slot)
  if (!record) throw new Error('该存档槽为空。')
  return JSON.stringify({ product: '4945-vn', exportedAt: Date.now(), record }, null, 2)
}

export const importSave = (raw: string, targetSlot: SaveSlot): SaveRecord => {
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    throw new Error('文件不是有效的 JSON 存档。')
  }

  const envelope = data as { product?: string; record?: Partial<SaveRecord> }
  const state = migrateGameState(envelope.record?.state)
  if (envelope.product !== '4945-vn' || !state) {
    throw new Error('这不是可识别的《4945区》存档，或版本已经不兼容。')
  }

  const record = createSaveRecord(targetSlot, state)
  if (hasStorage()) localStorage.setItem(`${SAVE_PREFIX}${targetSlot}`, JSON.stringify(record))
  return record
}

export const readSettings = (): GameSettings => {
  if (!hasStorage()) return { ...defaultSettings }
  try {
    return normalizeSettings(JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}'))
  } catch {
    return { ...defaultSettings }
  }
}

export const writeSettings = (settings: GameSettings): GameSettings => {
  const normalized = normalizeSettings(settings)
  if (hasStorage()) localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalized))
  return normalized
}

export interface CollectionState {
  seenNodes: string[]
  unlockedCgs: string[]
  unlockedEndings: string[]
}

export const readCollection = (): CollectionState => {
  if (!hasStorage()) return { seenNodes: [], unlockedCgs: [], unlockedEndings: [] }
  try {
    const value = JSON.parse(localStorage.getItem(COLLECTION_KEY) ?? '{}') as unknown
    if (!isPlainObject(value)) return { seenNodes: [], unlockedCgs: [], unlockedEndings: [] }
    const strings = (entry: unknown) => Array.isArray(entry)
      ? [...new Set(entry.filter((item): item is string => typeof item === 'string'))]
      : []
    return {
      seenNodes: strings(value.seenNodes).filter(isKnownStoryNode),
      unlockedCgs: strings(value.unlockedCgs),
      unlockedEndings: strings(value.unlockedEndings),
    }
  } catch {
    return { seenNodes: [], unlockedCgs: [], unlockedEndings: [] }
  }
}

export const mergeCollection = (state: GameState): CollectionState => {
  const existing = readCollection()
  const merged = {
    seenNodes: [...new Set([...existing.seenNodes, ...state.seenNodes])],
    unlockedCgs: [...new Set([...existing.unlockedCgs, ...state.unlockedCgs])],
    unlockedEndings: [...new Set([...existing.unlockedEndings, ...state.unlockedEndings])],
  }
  if (hasStorage()) localStorage.setItem(COLLECTION_KEY, JSON.stringify(merged))
  return merged
}

/**
 * 追加单个节点到收藏 seenNodes（用于补遗完成记录等定向标记）。不触碰组织结局、关系值或
 * 任何来源存档；仅在该节点尚未记录时写入并返回新收藏。节点须为已知剧情节点。
 */
export const appendCollectionSeen = (nodeId: string): CollectionState => {
  const existing = readCollection()
  if (!storyById[nodeId]) return existing
  if (existing.seenNodes.includes(nodeId)) return existing
  const merged: CollectionState = {
    seenNodes: [...existing.seenNodes, nodeId],
    unlockedCgs: existing.unlockedCgs,
    unlockedEndings: existing.unlockedEndings,
  }
  if (hasStorage()) localStorage.setItem(COLLECTION_KEY, JSON.stringify(merged))
  return merged
}
