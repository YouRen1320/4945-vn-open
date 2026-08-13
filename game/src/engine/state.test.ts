import { describe, expect, it } from 'vitest'
import { reactive } from 'vue'

import { storyById } from '@/content/story'
import { settleButterflyThresholds } from '@/content/butterflyConfig'

import {
  activateSupportAbility,
  applyEffects,
  commitChoice,
  commitTextEntry,
  createInitialGameState,
  deactivateSupportAbility,
  enterNode,
  GAME_APP_VERSION,
  renderText,
  resolveTarget,
} from './state'
import { createSaveRecord, migrateGameState } from './storage'

import type { CharacterId, StoryNode } from './types'

const getNode = (id: string) => {
  const node = storyById[id]
  if (!node) throw new Error(`测试找不到节点 ${id}`)
  return node
}

const setup = {
  playerName: '测试玩家',
}

describe('剧情状态引擎', () => {
  it('第六组织名只在玩家选择自建路线后写入', () => {
    let state = applyEffects(createInitialGameState(setup), [{ type: 'route', route: 'org6', organization: 'org6' }])
    const node = getNode('p10-route6-name')
    state = enterNode(state, node)
    state = commitTextEntry(state, node, '夜航社').state
    expect(renderText('{{player}}建立{{sixthOrganizationName}}，余额{{money}}元。', state))
      .toBe('测试玩家建立夜航社，余额50元。')
    expect(state.organizationName).toBe('夜航社')
  })

  it('同一节点重复进入不会重复应用副作用或历史', () => {
    let state = createInitialGameState(setup)
    const node = getNode('p00-opening')
    state = enterNode(state, node)
    state = enterNode(state, node)
    expect(state.unlockedCgs.filter((id) => id === 'cg00-invitation')).toHaveLength(1)
    expect(state.history.filter((entry) => entry.nodeId === node.id)).toHaveLength(1)
  })

  it.each([
    ['s2-august-suming-refusal', 'suming', '苏铭'],
    ['s2-august-obito-advice', 'obito', '宇智波带土（漂泊浪客）'],
  ] as const)('剧情演员 %s 进入历史但不会扩充关系状态', (nodeId, speaker, speakerName) => {
    const before = createInitialGameState(setup)
    const state = enterNode(before, getNode(nodeId))

    expect(state.history.at(-1)).toMatchObject({
      speaker,
      speakerName,
    })
    expect(Object.keys(state.relationships)).toEqual(Object.keys(before.relationships))
    expect(Object.hasOwn(state.relationships, speaker)).toBe(false)
  })

  it('选择会写入历史且数值保持边界', () => {
    const choiceNode = getNode('p01-mentor-call')
    let state = enterNode(createInitialGameState(setup), choiceNode)
    const result = commitChoice(state, choiceNode, 'ask-growth')
    state = applyEffects(result.state, [
      { type: 'stat', key: 'money', value: -999 },
      { type: 'stat', key: 'reputation', value: 999 },
      { type: 'relationship', character: 'mentor', key: 'affinity', value: 999 },
    ])
    expect(result.next).toBe('p01a-growth-reply')
    expect(state.history.at(-1)?.choiceLabel).toBe('“老区没玩好，这次新区我要认真地玩一下。”')
    expect(state.stats.money).toBe(0)
    expect(state.stats.reputation).toBe(5)
    expect(state.relationships.mentor.affinity).toBe(8)
  })

  it('心跳攻略值满100后可消耗本幕支援，不会消耗关系进度', () => {
    const choiceNode = getNode('p01-mentor-call')
    let state = enterNode(createInitialGameState(setup), choiceNode)
    state = applyEffects(state, [{ type: 'relationshipProgress', character: 'heartbeat', value: 100 }])
    expect(state.relationships.heartbeat.progress).toBe(100)
    expect(state.supportAbilities.heartbeat).toMatchObject({ unlocked: true, charges: 1, active: false })

    state = activateSupportAbility(state, 'heartbeat')
    const result = commitChoice(state, choiceNode, 'ask-growth')
    expect(result.state.stats.reputation).toBe(1)
    expect(result.state.stats.cohesion).toBe(1)
    expect(result.state.relationships.heartbeat.progress).toBe(100)
    expect(result.state.supportAbilities.heartbeat).toMatchObject({ charges: 0, active: false })
    expect(result.state.history.at(-1)?.choiceLabel).toContain('[心跳支援]')

    const nextChapter = enterNode(result.state, getNode('r3-03-incomplete-screenshot'))
    expect(nextChapter.supportAbilities.heartbeat).toMatchObject({ charges: 1, active: false, lastRechargeChapter: 'act1' })
    const repeatEntry = enterNode(nextChapter, getNode('r3-03-incomplete-screenshot'))
    expect(repeatEntry.supportAbilities.heartbeat?.charges).toBe(1)
  })

  it('已解锁支援可无消耗取消，未知与原型键支援均不能启用', () => {
    let state = applyEffects(createInitialGameState(setup), [
      { type: 'relationshipProgress', character: 'heartbeat', value: 100 },
    ])
    state = activateSupportAbility(state, 'heartbeat')
    expect(state.supportAbilities.heartbeat).toMatchObject({ active: true, charges: 1 })

    const cancelled = deactivateSupportAbility(state, 'heartbeat')
    expect(cancelled.supportAbilities.heartbeat).toMatchObject({ active: false, charges: 1 })
    expect(state.supportAbilities.heartbeat?.active).toBe(true)

    for (const key of ['missing-support', 'toString', 'constructor', '__proto__']) {
      expect(() => activateSupportAbility(cancelled, key as CharacterId)).toThrow(/尚未解锁|次数已用完/)

      const poisoned = createInitialGameState(setup)
      Object.defineProperty(poisoned.supportAbilities, key, {
        value: { unlocked: true, charges: 1, active: true, lastRechargeChapter: null },
        enumerable: true,
        configurable: true,
      })
      expect(Object.keys(poisoned.supportAbilities)).toContain(key)
      const normalized = applyEffects(poisoned)
      expect(Object.hasOwn(normalized.supportAbilities, key)).toBe(false)
    }
  })

  it('支援目标属性全部封顶时不消耗次数，并在选择后自动取消待命', () => {
    const choiceNode = getNode('p01-mentor-call')
    let state = enterNode(createInitialGameState(setup), choiceNode)
    state = applyEffects(state, [
      { type: 'relationshipProgress', character: 'heartbeat', value: 100 },
      { type: 'stat', key: 'reputation', operation: 'set', value: 5 },
      { type: 'stat', key: 'cohesion', operation: 'set', value: 5 },
    ])
    state = activateSupportAbility(state, 'heartbeat')

    const result = commitChoice(state, choiceNode, 'ask-growth')
    expect(result.supportResult).toEqual({
      character: 'heartbeat',
      name: '心跳支援',
      appliedBonuses: {},
      consumed: false,
    })
    expect(result.usedSupport).toBeUndefined()
    expect(result.state.supportAbilities.heartbeat).toMatchObject({ charges: 1, active: false })
    expect(result.state.history.at(-1)?.choiceLabel).not.toContain('[心跳支援]')
  })

  it('支援属性部分封顶时只报告实际增量，并正常消耗一次', () => {
    const choiceNode = getNode('p01-mentor-call')
    let state = enterNode(createInitialGameState(setup), choiceNode)
    state = applyEffects(state, [
      { type: 'relationshipProgress', character: 'heartbeat', value: 100 },
      { type: 'stat', key: 'reputation', operation: 'set', value: 5 },
      { type: 'stat', key: 'cohesion', operation: 'set', value: 4 },
    ])
    state = activateSupportAbility(state, 'heartbeat')

    const result = commitChoice(state, choiceNode, 'ask-growth')
    expect(result.supportResult).toMatchObject({ appliedBonuses: { cohesion: 1 }, consumed: true })
    expect(result.state.stats).toMatchObject({ reputation: 5, cohesion: 5 })
    expect(result.state.supportAbilities.heartbeat).toMatchObject({ charges: 0, active: false })
    expect(result.state.history.at(-1)?.choiceLabel).toContain('[心跳支援]')
  })

  it('响应式 Proxy 状态可生成纯 JSON 存档快照', () => {
    const proxied = reactive(createInitialGameState(setup))
    const record = createSaveRecord('quick', proxied)
    expect(record.state.playerName).toBe('测试玩家')
    expect(JSON.parse(JSON.stringify(record)).state.nodeId).toBe('p00-opening')
  })

  it('V1存档会移除无效建档字段并升级为当前契约', () => {
    const legacy = {
      ...createInitialGameState(setup),
      schemaVersion: 1,
      appVersion: '1.0.0',
      gender: 'female',
      publicIdentity: 'open',
      tone: 'formal',
    }
    const migrated = migrateGameState(legacy)
    expect(migrated?.schemaVersion).toBe(4)
    expect(migrated?.appVersion).toBe(GAME_APP_VERSION)
    expect(migrated).not.toHaveProperty('gender')
    expect(migrated).not.toHaveProperty('publicIdentity')
    expect(migrated).not.toHaveProperty('tone')
  })

  it('V2存档保留信任好感，为新成员补齐默认值并保住旧结局资格', () => {
    const legacy = createInitialGameState(setup) as ReturnType<typeof createInitialGameState> & { supportAbilities?: unknown }
    legacy.schemaVersion = 2
    legacy.appVersion = '1.4.0'
    legacy.relationships.heartbeat = { trust: 4, affinity: 3, stance: 'support' } as typeof legacy.relationships.heartbeat
    Reflect.deleteProperty(legacy.relationships, 'lan')
    Reflect.deleteProperty(legacy.relationships, 'xingqing')
    Reflect.deleteProperty(legacy, 'supportAbilities')

    const migrated = migrateGameState(legacy)
    expect(migrated?.relationships.heartbeat).toMatchObject({ trust: 4, affinity: 3, progress: 100 })
    expect(migrated?.relationships.lan.progress).toBe(0)
    expect(migrated?.relationships.xingqing.progress).toBe(0)
    expect(migrated?.supportAbilities).toEqual({})
  })

  it('V3存档升级到V4时从已解锁关系结局推断唯一伴侣', () => {
    const legacy = createInitialGameState(setup)
    legacy.schemaVersion = 3
    legacy.appVersion = '1.5.0'
    legacy.unlockedEndings = ['bond-heartbeat']
    Reflect.deleteProperty(legacy, 'activePartner')

    const migrated = migrateGameState(legacy)
    expect(migrated).toMatchObject({
      schemaVersion: 4,
      appVersion: GAME_APP_VERSION,
      activePartner: 'heartbeat',
    })
  })

  it('V3已有攻略值不会再次套用V1.4旧资格而被刷成100', () => {
    const legacy = createInitialGameState(setup)
    legacy.schemaVersion = 3
    legacy.appVersion = '1.5.0'
    legacy.relationships.shana = {
      trust: 3,
      affinity: 3,
      progress: 42,
      stance: 'support',
    }
    Reflect.deleteProperty(legacy, 'activePartner')

    expect(migrateGameState(legacy)?.relationships.shana.progress).toBe(42)
  })

  it('显式清空伴侣不会被普通状态规范化重新回填', () => {
    const state = createInitialGameState(setup)
    state.unlockedEndings = ['bond-shana']
    state.activePartner = null

    expect(applyEffects(state).activePartner).toBeNull()
  })

  it('首次解锁关系结局会登记伴侣，但不会覆盖已有伴侣', () => {
    let state = applyEffects(createInitialGameState(setup), [
      { type: 'unlockEnding', id: 'bond-shana' },
    ])
    expect(state.activePartner).toBe('shana')

    state.activePartner = 'qifu'
    state = applyEffects(state, [{ type: 'unlockEnding', id: 'bond-heartbeat' }])
    expect(state.activePartner).toBe('qifu')
  })

  it('季间关系效果优先落到真实伴侣，无伴侣时才使用默认角色', () => {
    let state = createInitialGameState(setup)
    state.activePartner = 'heartbeat'
    const mentorBefore = state.relationships.mentor.trust
    state = applyEffects(state, [
      { type: 'activePartnerRelationship', key: 'trust', value: 3, fallbackCharacter: 'mentor' },
    ])
    expect(state.relationships.heartbeat.trust).toBe(3)
    expect(state.relationships.mentor.trust).toBe(mentorBefore)

    state.activePartner = null
    state = applyEffects(state, [
      { type: 'activePartnerRelationship', key: 'trust', value: -2, fallbackCharacter: 'mentor' },
    ])
    expect(state.relationships.mentor.trust).toBe(mentorBefore - 2)
  })

  it('状态变量目标返回进入支线前节点，缺失时使用安全回退', () => {
    const state = createInitialGameState(setup)
    const target = {
      type: 'stateVariable' as const,
      key: 'romanceReturnNode',
      fallback: 'credits-first-season',
    }

    state.variables.romanceReturnNode = 'p01-mentor-call'
    expect(resolveTarget(target, state)).toBe('p01-mentor-call')

    state.variables.romanceReturnNode = ''
    expect(resolveTarget(target, state)).toBe('credits-first-season')
  })

  it('关系支线保留主线日期与章节，首次奖励在重复进入时不会叠加', () => {
    const sideStory: StoryNode = {
      id: 'test-romance-side-story',
      chapter: 'epilogue',
      actLabel: '测试 · 关系支线',
      date: '2026-07-29',
      location: '测试夜市',
      mode: 'novel',
      speaker: 'shana',
      text: '这段支线不推动主线时间。',
      sideStory: 'romance',
      background: 'nightMessage',
      onEnter: [
        { type: 'flag', key: 'testRomanceRewarded' },
        { type: 'relationshipProgress', character: 'shana', value: 20 },
      ],
      next: 'p01-mentor-call',
    }
    const mainline = createInitialGameState(setup)
    mainline.date = '2026-07-20'
    mainline.chapter = 'act2'
    mainline.relationships.shana.progress = 10

    const firstEntry = enterNode(mainline, sideStory)
    const repeatEntry = enterNode(firstEntry, sideStory)

    expect(firstEntry).toMatchObject({
      date: '2026-07-20',
      chapter: 'act2',
      flags: { testRomanceRewarded: true },
    })
    expect(firstEntry.relationships.shana.progress).toBe(30)
    expect(repeatEntry.relationships.shana.progress).toBe(30)
    expect(repeatEntry.processedNodes.filter((id) => id === sideStory.id)).toHaveLength(1)
  })
})

describe('RandomTarget 加权随机分支', () => {
  const baseState = createInitialGameState(setup)

  it('所有权重集中在同一个 case 时必然命中该分支', () => {
    const target = {
      type: 'random' as const,
      cases: [
        { weight: 1, next: 'p01-mentor-call' },
        { weight: 0, next: 'p02-server-open' },
      ],
      fallback: 'credits-first-season',
    }
    expect(resolveTarget(target, baseState)).toBe('p01-mentor-call')
  })

  it('condition 未满足的 case 被排除出随机池', () => {
    const state = applyEffects(baseState, [{ type: 'flag', key: 'prepared' }])
    const target = {
      type: 'random' as const,
      cases: [
        { weight: 1, next: 'p01-mentor-call', condition: { type: 'flag' as const, key: 'notReady' } },
        { weight: 1, next: 'p02-server-open', condition: { type: 'flag' as const, key: 'prepared' } },
      ],
      fallback: 'credits-first-season',
    }
    // notReady 的 flag 不存在 → 权重归零；prepared 存在 → 必然命中
    expect(resolveTarget(target, state)).toBe('p02-server-open')
  })

  it('全部条件不满足时走 fallback', () => {
    const target = {
      type: 'random' as const,
      cases: [
        { weight: 10, next: 'p01-mentor-call', condition: { type: 'flag' as const, key: 'impossible' } },
        { weight: 5, next: 'p02-server-open', condition: { type: 'flag' as const, key: 'alsoImpossible' } },
      ],
      fallback: 'credits-first-season',
    }
    expect(resolveTarget(target, baseState)).toBe('credits-first-season')
  })

  it('总权重为 0 时走 fallback', () => {
    const target = {
      type: 'random' as const,
      cases: [
        { weight: 0, next: 'p01-mentor-call' },
        { weight: 0, next: 'p02-server-open' },
      ],
      fallback: 'credits-first-season',
    }
    expect(resolveTarget(target, baseState)).toBe('credits-first-season')
  })

  it('seedKey 提供确定性随机：相同 seed 必然命中同一结果', () => {
    const state = createInitialGameState(setup)
    state.variables.randomSeedX = 42
    const target = {
      type: 'random' as const,
      cases: [
        { weight: 50, next: 'p01-mentor-call' },
        { weight: 50, next: 'p02-server-open' },
      ],
      fallback: 'credits-first-season',
      seedKey: 'randomSeedX',
    }
    // 多次解析在同一 state 下结果必然一致
    const results = Array.from({ length: 20 }, () => resolveTarget(target, state))
    const unique = [...new Set(results)]
    expect(unique).toHaveLength(1)
    expect(['p01-mentor-call', 'p02-server-open']).toContain(unique[0])
  })

  it('不同 seed 值确定的随机分支必然落在合法池内', () => {
    const validIds = new Set(['p01-mentor-call', 'p02-server-open'])
    const target = {
      type: 'random' as const,
      cases: [
        { weight: 50, next: 'p01-mentor-call' },
        { weight: 50, next: 'p02-server-open' },
      ],
      fallback: 'credits-first-season',
      seedKey: 'randomSeedX',
    }
    for (let seed = 1; seed <= 20; seed++) {
      const state = createInitialGameState(setup)
      state.variables.randomSeedX = seed
      const result = resolveTarget(target, state)
      expect(validIds.has(result)).toBe(true)
      // 同一种子多次调用必然一致
      for (let j = 0; j < 10; j++) {
        expect(resolveTarget(target, state)).toBe(result)
      }
    }
  })

  it('无 seedKey 时使用真随机，多次调用落在合法池内', () => {
    const target = {
      type: 'random' as const,
      cases: [
        { weight: 50, next: 'p01-mentor-call' },
        { weight: 50, next: 'p02-server-open' },
      ],
      fallback: 'credits-first-season',
    }
    const validIds = new Set(['p01-mentor-call', 'p02-server-open'])
    for (let i = 0; i < 50; i++) {
      expect(validIds.has(resolveTarget(target, baseState))).toBe(true)
    }
  })

  it('只返回 condition 满足的 case 中的节点', () => {
    const state = applyEffects(baseState, [
      { type: 'flag', key: 'isEvil' },
      { type: 'flag', key: 'isGood' },
    ])
    const target = {
      type: 'random' as const,
      cases: [
        { weight: 10, next: 'p01-mentor-call', condition: { type: 'flag' as const, key: 'isEvil' } },
        { weight: 10, next: 'p02-server-open', condition: { type: 'flag' as const, key: 'isGood' } },
        { weight: 1, next: 'p99-never', condition: { type: 'flag' as const, key: 'impossible' } },
      ],
      fallback: 'credits-first-season',
    }
    const valid = new Set(['p01-mentor-call', 'p02-server-open'])
    for (let i = 0; i < 30; i++) {
      expect(valid.has(resolveTarget(target, state))).toBe(true)
    }
  })

  it('与 ConditionalTarget / StateVariableTarget / string 共存不互扰', () => {
    const state = createInitialGameState(setup)
    // string target
    expect(resolveTarget('p00-opening', state)).toBe('p00-opening')
    // stateVariable target
    state.variables.romanceReturnNode = 'p01-mentor-call'
    expect(resolveTarget({ type: 'stateVariable', key: 'romanceReturnNode', fallback: 'credits-first-season' }, state))
      .toBe('p01-mentor-call')
    // conditional target
    expect(resolveTarget({
      type: 'conditional',
      cases: [{ when: { type: 'flag', key: 'alwaysFalse' }, next: 'never' }],
      fallback: 'p02-server-open',
    }, state)).toBe('p02-server-open')
  })
})

describe('butterflyDelta 蝴蝶效应变量', () => {
  const baseState = createInitialGameState(setup)

  it('butterflyDelta 在 variables 中累积值', () => {
    const state = applyEffects(baseState, [
      { type: 'butterflyDelta', key: 'bf_cruelty', delta: 2 },
      { type: 'butterflyDelta', key: 'bf_cruelty', delta: 1 },
      { type: 'butterflyDelta', key: 'bf_loyalty', delta: -1 },
    ])
    expect(state.variables.bf_cruelty).toBe(3)
    expect(state.variables.bf_loyalty).toBe(-1)
  })

  it('delta 值夹紧在 [-10, 10] 范围内', () => {
    const state = applyEffects(baseState, [
      { type: 'butterflyDelta', key: 'bf_cruelty', delta: 15 },
      { type: 'butterflyDelta', key: 'bf_heart', delta: -20 },
    ])
    expect(state.variables.bf_cruelty).toBe(10)
    expect(state.variables.bf_heart).toBe(-10)
  })

  it('到达正阈值自动设置 flag', () => {
    const state = applyEffects(baseState, [
      { type: 'butterflyDelta', key: 'bf_cruelty', delta: 2 },
      { type: 'butterflyDelta', key: 'bf_cruelty', delta: 2 },
    ])
    expect(state.variables.bf_cruelty).toBe(4)
    expect(state.flags.bf_ruthless).toBe(true)
    // 未到达的阈值不触发
    expect(state.flags.bf_schemer).toBeUndefined()
  })

  it('到达负阈值自动设置 flag', () => {
    const state = applyEffects(baseState, [
      { type: 'butterflyDelta', key: 'bf_loyalty', delta: -2 },
      { type: 'butterflyDelta', key: 'bf_loyalty', delta: -2 },
    ])
    expect(state.variables.bf_loyalty).toBe(-4)
    expect(state.flags.bf_opportunist).toBe(true)
  })

  it('阈值 flag 已设置时不会重复触发', () => {
    // 模拟已经触发过 bf_ruthless 的状态
    let state = applyEffects(baseState, [
      { type: 'butterflyDelta', key: 'bf_cruelty', delta: 5 },
    ])
    expect(state.flags.bf_ruthless).toBe(true)

    // 再次应用 delta，flag 不应变化（但值正常累积）
    const beforeFlags = { ...state.flags }
    state = applyEffects(state, [
      { type: 'butterflyDelta', key: 'bf_cruelty', delta: 2 },
    ])
    expect(state.variables.bf_cruelty).toBe(7)
    expect(state.flags.bf_ruthless).toBe(true)
    // 没有新的 flag 被意外触发
    expect(Object.keys(state.flags).filter((k) => !beforeFlags[k])).toEqual([])
  })

  it('阶梯阈值按顺序触发（先低后高）', () => {
    // bf_chaos: 3 → bf_unstable, 6 → bf_anarchy
    let state = applyEffects(baseState, [
      { type: 'butterflyDelta', key: 'bf_chaos', delta: 3 },
    ])
    expect(state.variables.bf_chaos).toBe(3)
    expect(state.flags.bf_unstable).toBe(true)
    expect(state.flags.bf_anarchy).toBeUndefined()

    state = applyEffects(state, [
      { type: 'butterflyDelta', key: 'bf_chaos', delta: 3 },
    ])
    expect(state.variables.bf_chaos).toBe(6)
    expect(state.flags.bf_anarchy).toBe(true)
  })

  it('enterNode 自动结算蝴蝶阈值', () => {
    // 找一个真实节点，进入前先手工填入 butterfly 变量
    const node = getNode('p00-opening')
    let state = createInitialGameState(setup)
    state.variables.bf_cruelty = 5 // 已经 >= 4，应触发 bf_ruthless
    state.variables.bf_shadow = 3   // 已经 >= 3，应触发 bf_schemer

    state = enterNode(state, node)
    expect(state.flags.bf_ruthless).toBe(true)
    expect(state.flags.bf_schemer).toBe(true)
    expect(state.flags.bf_merciful).toBeUndefined() // 未到达
  })

  it('多个蝴蝶维度同时结算各自独立', () => {
    let state = createInitialGameState(setup)
    state.variables.bf_cruelty = 4   // → bf_ruthless
    state.variables.bf_heart = 4     // → bf_devoted_heart
    state.variables.bf_diplomacy = -4 // → bf_warmonger
    state.variables.bf_chaos = 3     // → bf_unstable

    state = enterNode(state, getNode('p00-opening'))
    expect(state.flags.bf_ruthless).toBe(true)
    expect(state.flags.bf_devoted_heart).toBe(true)
    expect(state.flags.bf_warmonger).toBe(true)
    expect(state.flags.bf_unstable).toBe(true)
  })

  it('butterflyDelta 不改变存量,仅增量修改变量', () => {
    // 与 variable effect 的区别：variable 是 set，butterflyDelta 是 add
    const stateA = applyEffects(baseState, [
      { type: 'variable', key: 'bf_cruelty', value: 2 },
    ])
    const stateB = applyEffects(baseState, [
      { type: 'butterflyDelta', key: 'bf_cruelty', delta: 2 },
    ])
    expect(stateA.variables.bf_cruelty).toBe(2) // set
    expect(stateB.variables.bf_cruelty).toBe(2) // add (from 0)

    // 叠加第二个 variable 会覆盖
    const stateA2 = applyEffects(stateA, [
      { type: 'variable', key: 'bf_cruelty', value: 5 },
    ])
    expect(stateA2.variables.bf_cruelty).toBe(5) // 覆盖为 5

    // 叠加第二个 butterflyDelta 会累积
    const stateB2 = applyEffects(stateB, [
      { type: 'butterflyDelta', key: 'bf_cruelty', delta: 3 },
    ])
    expect(stateB2.variables.bf_cruelty).toBe(5) // 2 + 3
  })

  it('settleButterflyThresholds 独立可用，返回新 flag 列表', () => {
    const variables: Record<string, string | number> = { bf_cruelty: 4, bf_loyalty: -5 }
    const flags: Record<string, boolean> = {}
    const newlySet = settleButterflyThresholds(variables, flags)
    expect(newlySet).toContain('bf_ruthless')
    expect(newlySet).toContain('bf_opportunist')
    expect(flags.bf_ruthless).toBe(true)
    expect(flags.bf_opportunist).toBe(true)
    // 再次调用不返回已设置的 flag
    expect(settleButterflyThresholds(variables, flags)).toEqual([])
  })
})
