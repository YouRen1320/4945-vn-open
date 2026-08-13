import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { romanceCandidates } from '@/content/characters'
import { romanceProfiles } from '@/content/romanceProfiles'

import { createInitialGameState, GAME_APP_VERSION } from './state'
import {
  createSaveRecord,
  defaultSettings,
  deleteSave,
  migrateGameState,
  normalizeSettings,
  readSave,
  readSettings,
} from './storage'

import type { CharacterId, GameState, RelationshipState } from './types'

const SAVE_KEY = '4945-vn:v4:save:1'
const V15_SAVE_KEY = '4945-vn:v3:save:1'
const LEGACY_SAVE_KEY = '4945-vn:save:1'
const SETTINGS_KEY = '4945-vn:settings'

class MemoryStorage implements Storage {
  readonly values = new Map<string, string>()

  get length() { return this.values.size }
  clear() { this.values.clear() }
  getItem(key: string) { return this.values.get(key) ?? null }
  key(index: number) { return [...this.values.keys()][index] ?? null }
  removeItem(key: string) { this.values.delete(key) }
  setItem(key: string, value: string) { this.values.set(key, String(value)) }
}

let storage: MemoryStorage

beforeEach(() => {
  storage = new MemoryStorage()
  vi.stubGlobal('localStorage', storage)
  vi.stubGlobal('window', { localStorage: storage })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const validState = () => createInitialGameState({ playerName: '存档验收' })

const defineOwn = (target: object, key: string, value: unknown) => {
  Object.defineProperty(target, key, {
    value,
    enumerable: true,
    configurable: true,
    writable: true,
  })
}

describe('存档输入边界', () => {
  it.each([
    [['org1DefendOrder'], 'r1-order', 'org1EndingOrder'],
    [['org1ClaimVoice'], 'r1-voice', 'org1EndingVoice'],
    [[], 'r1-order', 'org1EndingOrder'],
  ])('补齐旧版祈福羁绊存档的组织结局：%j', (flags, endingId, endingFlag) => {
    const state = validState()
    state.route = 'org1'
    state.organization = 'org1'
    state.organizationName = '群雄逐鹿'
    state.role = 'member'
    state.nodeId = 'credits-first-season'
    state.activePartner = 'qifu'
    state.unlockedEndings = ['bond-qifu']
    for (const flag of flags) state.flags[flag] = true

    const migrated = migrateGameState(state)
    expect(migrated?.unlockedEndings).toEqual(['bond-qifu', endingId])
    expect(migrated?.flags[endingFlag]).toBe(true)
    expect(migrateGameState(migrated)?.unlockedEndings).toEqual(['bond-qifu', endingId])
  })

  it('旧版祈福羁绊存档同时存在两种终局旗标时沿用原路由的秩序优先级', () => {
    const state = validState()
    state.route = 'org1'
    state.organization = 'org1'
    state.role = 'member'
    state.nodeId = 'credits-first-season'
    state.unlockedEndings = ['bond-qifu']
    state.flags.org1DefendOrder = true
    state.flags.org1ClaimVoice = true

    expect(migrateGameState(state)?.unlockedEndings).toEqual(['bond-qifu', 'r1-order'])
  })

  it.each([
    ['缺少当前版本角色关系', (state: GameState) => { Reflect.deleteProperty(state.relationships, 'lan') }],
    ['支援表不是对象', (state: GameState) => { state.supportAbilities = [] as unknown as GameState['supportAbilities'] }],
    ['已处理节点包含未知节点', (state: GameState) => { state.processedNodes = ['missing-node'] }],
    ['历史记录角色未知', (state: GameState) => {
      state.history = [{
        nodeId: 'p00-opening',
        date: '2026-07-17',
        speaker: 'missing-character' as CharacterId,
        speakerName: '未知',
        text: '损坏记录',
        timestamp: 1,
      }]
    }],
  ])('拒绝 malformed schema4：%s', (_label, corrupt) => {
    const state = validState()
    corrupt(state)
    expect(migrateGameState(state)).toBeNull()
  })

  it('允许剧情演员出现在历史中，但不要求对应关系字段', () => {
    const state = validState()
    state.nodeId = 's2-august-suming-refusal'
    state.history = [{
      nodeId: 's2-august-suming-refusal',
      date: '2026-07-21',
      speaker: 'suming',
      speakerName: '苏铭',
      text: '我不想掺和组织之间的事。',
      timestamp: 1,
    }]

    const migrated = migrateGameState(state)
    expect(migrated?.history[0]?.speaker).toBe('suming')
    expect(Object.hasOwn(migrated?.relationships ?? {}, 'suming')).toBe(false)
  })

  it('允许无头像剧情演员保留可验证署名', () => {
    const state = validState()
    state.nodeId = 's2-august-obito-advice'
    state.history = [{
      nodeId: 's2-august-obito-advice',
      date: '2026-08-09',
      speaker: 'obito',
      speakerName: '宇智波带土（漂泊浪客）',
      text: '人家说跑路，万一不跑呢。',
      timestamp: 1,
    }]

    expect(migrateGameState(state)?.history[0]?.speaker).toBe('obito')
  })

  it.each(['toString', 'constructor', '__proto__'])('白名单重建会丢弃原型键 %s', (key) => {
    const state = validState()
    defineOwn(state.relationships, key, {
      trust: 0,
      affinity: 0,
      progress: 0,
      stance: 'unknown',
    } satisfies RelationshipState)

    expect(Object.keys(state.relationships)).toContain(key)
    const migrated = migrateGameState(state)
    expect(migrated).not.toBeNull()
    expect(Object.hasOwn(migrated?.relationships ?? {}, key)).toBe(false)
  })

  it.each(['toString', 'constructor', '__proto__'])('剧情 nodeId 原型键 %s 会被迁移与读档入口共同拒绝', (key) => {
    const state = validState()
    state.nodeId = key
    expect(migrateGameState(state)).toBeNull()

    storage.setItem(SAVE_KEY, JSON.stringify(createSaveRecord('1', state)))
    expect(readSave('1')).toBeNull()
  })

  it.each([
    ['字符串 savedAt', { savedAt: '刚刚' }],
    ['负数 savedAt', { savedAt: -1 }],
    ['超出日期范围的 savedAt', { savedAt: 8.64e15 + 1 }],
    ['数字 preview', { preview: 4945 }],
    ['缺少 preview', { preview: undefined }],
  ])('拒绝损坏的外层元数据：%s', (_label, patch) => {
    const record = { ...createSaveRecord('1', validState()), ...patch }
    if ('preview' in patch && patch.preview === undefined) Reflect.deleteProperty(record, 'preview')
    storage.setItem(SAVE_KEY, JSON.stringify(record))

    expect(readSave('1')).toBeNull()
  })

  it('只截断合法但过长的外层预览，并回写规范记录', () => {
    const record = createSaveRecord('1', validState())
    record.preview = '预'.repeat(250)
    storage.setItem(LEGACY_SAVE_KEY, JSON.stringify(record))

    expect(readSave('1')?.preview).toHaveLength(200)
    expect(JSON.parse(storage.getItem(SAVE_KEY) ?? 'null')?.preview).toHaveLength(200)
    expect(JSON.parse(storage.getItem(LEGACY_SAVE_KEY) ?? 'null')?.preview).toHaveLength(250)
  })

  it('损坏的V4关系返回节点会回退V3检查点并规范写回V4', () => {
    const damaged = validState()
    damaged.variables.romanceReturnNode = 'missing-romance-return-node'
    storage.setItem(SAVE_KEY, JSON.stringify(createSaveRecord('1', damaged)))

    const v15 = validState()
    v15.schemaVersion = 3
    v15.appVersion = '1.5.0'
    v15.playerName = 'V3回退玩家'
    Reflect.deleteProperty(v15, 'activePartner')
    const v15Record = {
      ...createSaveRecord('1', v15),
      schemaVersion: 3,
      state: v15,
    }
    storage.setItem(V15_SAVE_KEY, JSON.stringify(v15Record))

    const loaded = readSave('1')
    expect(loaded?.state).toMatchObject({
      schemaVersion: 4,
      appVersion: GAME_APP_VERSION,
      playerName: 'V3回退玩家',
    })
    expect(JSON.parse(storage.getItem(SAVE_KEY) ?? 'null')?.state.playerName).toBe('V3回退玩家')
    expect(JSON.parse(storage.getItem(V15_SAVE_KEY) ?? 'null')?.state.schemaVersion).toBe(3)
  })

  it('关系返回变量只接受剧情图中已知节点', () => {
    const valid = validState()
    valid.variables.romanceReturnNode = 'p01-mentor-call'
    expect(migrateGameState(valid)?.variables.romanceReturnNode).toBe('p01-mentor-call')

    const unknown = validState()
    unknown.variables.romanceReturnNode = 'missing-romance-return-node'
    expect(migrateGameState(unknown)).toBeNull()
  })

  it('显式删除存档会同时清除V4、V3与V1.4三代键', () => {
    storage.setItem(SAVE_KEY, 'v4')
    storage.setItem(V15_SAVE_KEY, 'v3')
    storage.setItem(LEGACY_SAVE_KEY, 'legacy')

    deleteSave('1')

    expect(storage.getItem(SAVE_KEY)).toBeNull()
    expect(storage.getItem(V15_SAVE_KEY)).toBeNull()
    expect(storage.getItem(LEGACY_SAVE_KEY)).toBeNull()
  })
})

describe('设置输入边界', () => {
  it('每个类型非法的设置字段都回到默认值', () => {
    expect(normalizeSettings({
      textSpeed: 'instant',
      autoDelay: Number.NaN,
      musicVolume: null,
      soundVolume: [],
      muted: 'yes',
      reducedMotion: 1,
      skipUnread: {},
    })).toEqual(defaultSettings)
  })

  it('损坏 JSON 设置整体回到默认值', () => {
    storage.setItem(SETTINGS_KEY, '{broken')
    expect(readSettings()).toEqual(defaultSettings)
  })
})

describe('旧版关系资格迁移', () => {
  const eligibleCases: Array<{
    character: CharacterId
    trust: number
    affinity: number
    flags?: string[]
  }> = [
    { character: 'shana', trust: 3, affinity: 3 },
    {
      character: 'swordheart', trust: 6, affinity: 5,
      flags: ['swordheartRosterChecked', 'swordheartReconnectedRoster', 'swordheartLastCheck'],
    },
    { character: 'xilufei', trust: 3, affinity: 3, flags: ['xilufeiAccomplice'] },
    { character: 'takemehand', trust: 2, affinity: 2 },
    { character: 'heartbeat', trust: 4, affinity: 3 },
    { character: 'qifu', trust: 3, affinity: 2, flags: ['privateTalkWithQifu'] },
    { character: 'yanqiu', trust: 5, affinity: 1, flags: ['yanqiuStayed'] },
    {
      character: 'huayue', trust: 6, affinity: 6,
      flags: ['huayueSharedVulnerability', 'huayueSharedNightShift', 'huayueTrustedWithWeakness'],
    },
    { character: 'wenxian', trust: 5, affinity: 4, flags: ['playerPromisedOrg5Stay'] },
  ]

  it.each(eligibleCases)('schema2 的 $character 结局前资格迁移为100', ({ character, trust, affinity, flags = [] }) => {
    const legacy = validState()
    legacy.schemaVersion = 2
    legacy.appVersion = '1.4.0'
    legacy.relationships[character].trust = trust
    legacy.relationships[character].affinity = affinity
    Reflect.deleteProperty(legacy.relationships[character], 'progress')
    for (const flag of flags) legacy.flags[flag] = true

    expect(migrateGameState(legacy)?.relationships[character].progress).toBe(100)
  })

  it('未达到旧结局门槛不会被误迁移成满进度', () => {
    const legacy = validState()
    legacy.schemaVersion = 2
    legacy.appVersion = '1.4.0'
    legacy.relationships.shana.trust = 2
    legacy.relationships.shana.affinity = 3
    Reflect.deleteProperty(legacy.relationships.shana, 'progress')

    expect(migrateGameState(legacy)?.relationships.shana.progress).not.toBe(100)
  })
})

describe('首次约会CG兼容回填', () => {
  it.each([4, 3, 2, 1])('schema%s 已完成的首次约会回填对应CG且保持幂等', (schemaVersion) => {
    const saved = validState()
    const profile = romanceProfiles.shana
    saved.schemaVersion = schemaVersion
    saved.flags[profile.completionFlag] = true
    saved.unlockedCgs = []

    const migrated = migrateGameState(saved)
    const migratedAgain = migrateGameState(migrated)
    expect(migrated?.schemaVersion).toBe(4)
    expect(migrated?.unlockedCgs.filter((id) => id === profile.firstDateCgId)).toHaveLength(1)
    expect(migratedAgain?.unlockedCgs.filter((id) => id === profile.firstDateCgId)).toHaveLength(1)
  })

  it('schema4 会为十二条已经完成的首约补齐十二个新收藏ID', () => {
    const saved = validState()
    for (const character of romanceCandidates) {
      saved.flags[romanceProfiles[character].completionFlag] = true
    }

    const migrated = migrateGameState(saved)
    const expected = romanceCandidates.map((character) => romanceProfiles[character].firstDateCgId)
    expect(migrated?.unlockedCgs).toEqual(expect.arrayContaining(expected))
    expect(expected.every((id) => migrated?.unlockedCgs.filter((savedId) => savedId === id).length === 1)).toBe(true)
  })

  it('未完成首次约会时不会凭攻略值或其他收藏误解锁', () => {
    const saved = validState()
    saved.relationships.shana.progress = 100
    saved.unlockedCgs = ['cg16-bond-shana']

    const migrated = migrateGameState(saved)
    const firstDateIds = new Set<string>(
      romanceCandidates.map((character) => romanceProfiles[character].firstDateCgId),
    )
    expect(migrated?.unlockedCgs).toContain('cg16-bond-shana')
    expect(migrated?.unlockedCgs.some((id) => firstDateIds.has(id))).toBe(false)
  })
})
