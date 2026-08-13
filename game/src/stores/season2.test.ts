import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createInitialGameState } from '@/engine/state'
import { readSave, writeSave } from '@/engine/storage'
import { readCollectionV2, readOutcomeArchive, readSaveV5 } from '@/engine/season2-storage'
import { S2_AUGUST_ENTRY } from '@/content/story/s2-august'
import { useGameStore } from './game'

import type { SaveSlot } from '@/engine/storage'

class MemoryStorage implements Storage {
  readonly values = new Map<string, string>()

  get length() { return this.values.size }
  clear() { this.values.clear() }
  getItem(key: string) { return this.values.get(key) ?? null }
  key(index: number) { return [...this.values.keys()][index] ?? null }
  removeItem(key: string) { this.values.delete(key) }
  setItem(key: string, value: string) { this.values.set(key, String(value)) }
}

const makeCompletedS1 = (slot: SaveSlot, route: 'org2' | 'org3' = 'org2') => {
  const state = createInitialGameState({ playerName: `S1玩家-${route}` })
  state.nodeId = 'credits-first-season'
  state.unlockedEndings = [route === 'org2' ? 'r2-second-pole' : 'r3-alliance-hub']
  state.route = route
  state.organization = route
  state.organizationName = route === 'org2' ? '二组' : '三组'
  return writeSave(slot, state)
}

const playPrologueToCompletion = (store: ReturnType<typeof useGameStore>) => {
  for (let i = 0; i < 60 && store.state; i += 1) {
    if (store.choices.length > 0) store.choose(store.choices[0]!.id)
    else if (store.node?.next) store.advance()
    else break
    const completion = store.state && 'episodeCompletion' in store.state
      ? (store.state as { episodeCompletion?: Record<string, boolean> }).episodeCompletion
      : undefined
    if (completion?.['s2-prologue']) break
  }
}

const playEpisodeToCompletion = (store: ReturnType<typeof useGameStore>, episodeId: string) => {
  for (let i = 0; i < 100 && store.state; i += 1) {
    if (store.choices.length > 0) store.choose(store.choices[0]!.id)
    else if (store.node?.next) store.advance()
    else break
    const completion = store.state && 'episodeCompletion' in store.state
      ? (store.state as { episodeCompletion?: Record<string, boolean> }).episodeCompletion
      : undefined
    if (completion?.[episodeId]) break
  }
}

beforeEach(() => {
  const storage = new MemoryStorage()
  vi.stubGlobal('localStorage', storage)
  vi.stubGlobal('window', { localStorage: storage })
  setActivePinia(createPinia())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('第二季（2.2）campaign 流程', () => {
  it('没有任何第一季完成档时，来源扫描为空', () => {
    const store = useGameStore()
    expect(store.scanSeason1Sources()).toHaveLength(0)
    expect(store.inSeason2).toBe(false)
  })

  it('写入第一季完成档后，扫描能提取路线与组织', () => {
    const store = useGameStore()
    makeCompletedS1('1', 'org2')
    const sources = store.scanSeason1Sources()
    expect(sources).toHaveLength(1)
    expect(sources[0]!.slot).toBe('1')
    expect(sources[0]!.summary.route).toBe('org2')
    expect(sources[0]!.summary.organization).toBe('org2')
    expect(sources[0]!.summary.organizationName).toBe('二组')
  })

  it('只有羁绊结局的进行中存档不能作为第二季来源', () => {
    const store = useGameStore()
    const state = createInitialGameState({ playerName: '未通关玩家' })
    state.route = 'org2'
    state.organization = 'org2'
    state.nodeId = 'r2-03-normal-chat'
    state.unlockedEndings = ['bond-qifu']
    writeSave('1', state)

    expect(store.scanSeason1Sources()).toHaveLength(0)
  })

  it('旧版提线木偶自动档补齐组织结局后可无损进入事件二', () => {
    const store = useGameStore()
    const state = createInitialGameState({ playerName: '提线木偶玩家' })
    state.route = 'org4'
    state.organization = 'org4'
    state.organizationName = '天上白玉京'
    state.nodeId = 'ending-shadow-puppet'
    state.flags.bf_shadow_master = true
    state.flags.bf_schemer = true
    state.processedNodes = ['ending-shadow-puppet']
    state.unlockedEndings = ['shadow-puppet']
    writeSave('auto', state)

    const [source] = store.scanSeason1Sources()
    expect(source?.summary.organizationEndingId).toBe('r4-puppeteer')
    expect(source?.summary.durableFacts).toContain('s1-route-complete')

    store.continueAutoSave()
    expect(store.state?.nodeId).toBe('ending-shadow-puppet')
    expect(store.advance()).toBe(true)
    expect(store.state?.nodeId).toBe('credits-first-season')
    expect(store.state?.unlockedEndings).toEqual(expect.arrayContaining(['shadow-puppet', 'r4-puppeteer']))

    expect(store.advance()).toBe(true)
    expect(store.inSeason2).toBe(true)
    expect(store.state?.schemaVersion).toBe(5)
    expect(readSaveV5('1')?.state.season1Outcome.organizationEndingId).toBe('r4-puppeteer')
    expect(readSave('auto')).toBeNull()
  })

  it('org1 一季存档不会被当作未选择目标的普通事件二来源', () => {
    const store = useGameStore()
    const state = createInitialGameState({ playerName: '一组玩家' })
    state.route = 'org1'
    state.organization = 'org1'
    state.organizationName = '群雄逐鹿'
    state.nodeId = 'credits-first-season'
    state.unlockedEndings = ['r1-order']
    writeSave('1', state)

    expect(store.scanSeason1Sources()).toHaveLength(0)
  })

  it('一组片尾选择新组织后保留原结局并进入事件二', () => {
    const store = useGameStore()
    const state = createInitialGameState({ playerName: '一组玩家' })
    state.route = 'org1'
    state.organization = 'org1'
    state.organizationName = '群雄逐鹿'
    state.nodeId = 'credits-first-season'
    state.unlockedEndings = ['r1-order']
    writeSave('auto', state)
    store.continueAutoSave()

    expect(() => store.transitionToSeason2()).toThrow(/请先选择事件二的新组织/)

    const result = store.transitionToSeason2('org4')
    expect(result.slot).toBe('1')
    expect(store.inSeason2).toBe(true)
    expect(store.state?.route).toBe('org4')
    expect(store.state?.organization).toBe('org4')
    expect(store.state?.organizationName).toBe('天上白玉京')
    expect(store.state?.unlockedEndings).toContain('r1-order')
    expect(store.state?.flags.s1Org1RouteTransfer).toBe(true)
    expect(store.state?.nodeId).toBe(S2_AUGUST_ENTRY)

    const inherited = readSaveV5('1')?.state.season1Outcome
    expect(inherited?.organizationEndingId).toBe('r1-order')
    expect(inherited?.routeTransfer).toEqual({
      kind: 'org1-to-active-route',
      fromRoute: 'org1',
      fromOrganization: 'org1',
      fromOrganizationName: '群雄逐鹿',
    })

    store.advance()
    expect(store.state?.nodeId).toBe('s2-august-qifu-pressure')
  })

  it('旧版祈福羁绊存档补齐原组织结局后可以转入事件二', () => {
    const store = useGameStore()
    const state = createInitialGameState({ playerName: '祈福羁绊玩家' })
    state.route = 'org1'
    state.organization = 'org1'
    state.organizationName = '群雄逐鹿'
    state.role = 'member'
    state.nodeId = 'credits-first-season'
    state.activePartner = 'qifu'
    state.flags.bondedQifu = true
    state.flags.org1ClaimVoice = true
    state.unlockedEndings = ['bond-qifu']
    writeSave('auto', state)

    store.continueAutoSave()
    expect(store.state?.unlockedEndings).toEqual(expect.arrayContaining(['bond-qifu', 'r1-voice']))

    store.transitionToSeason2('org4')
    const inherited = readSaveV5('1')?.state.season1Outcome
    expect(inherited?.organizationEndingId).toBe('r1-voice')
    expect(inherited?.activePartner).toBe('qifu')
    expect(inherited?.routeTransfer?.fromRoute).toBe('org1')
  })

  it('开启第二季后进入序章，并写入独立的 v5 存档（不触碰 v4 来源）', () => {
    const store = useGameStore()
    makeCompletedS1('1', 'org2')
    const summary = store.scanSeason1Sources()[0]!.summary

    store.startSeason2({ summary, playerName: 'S1玩家-org2', slot: '2', overwrite: false })

    expect(store.inSeason2).toBe(true)
    expect(store.state?.nodeId).toBe(S2_AUGUST_ENTRY)
    const v5 = readSaveV5('2')
    expect(v5).not.toBeNull()
    expect(v5!.state.seasonId).toBe('season-2')
    expect(v5!.state.schemaVersion).toBe(5)

    // v4 来源档保持原样（非破坏性叠加）。
    const v4 = readSave('1')
    expect(v4?.state.nodeId).toBe('credits-first-season')
    expect(v4?.state.route).toBe('org2')
  })

  it('遍历序章到完成哨兵后，自动进入下一集并回写完成标记', () => {
    const store = useGameStore()
    makeCompletedS1('1', 'org3')
    const summary = store.scanSeason1Sources()[0]!.summary
    store.startSeason2({ summary, playerName: 'S1玩家-org3', slot: '3', overwrite: false })

    playPrologueToCompletion(store)

    expect(store.state?.nodeId).toBe('s2-2.3-entry')
    expect(store.inSeason2).toBe(true)
    const v5 = readSaveV5('3')
    expect(v5).not.toBeNull()
    expect(v5!.state.episodeCompletion['s2-prologue']).toBe(true)
  })

  it('相同内容按 digest 去重，重复开启不写重复 outcome 档案', () => {
    const store = useGameStore()
    makeCompletedS1('1', 'org2')
    const summary = store.scanSeason1Sources()[0]!.summary
    store.startSeason2({ summary, playerName: 'A', slot: '2', overwrite: false })
    store.returnToTitle()
    store.startSeason2({ summary, playerName: 'A', slot: '4', overwrite: false })
    // 两次摘要内容相同 → digest 相同 → outcome archive 只保留一条。
    expect(readOutcomeArchive()).toHaveLength(1)
  })

  it('占用槽未确认覆盖时拒绝开启，确认覆盖后可续写', () => {
    const store = useGameStore()
    makeCompletedS1('1', 'org2')
    const summary = store.scanSeason1Sources()[0]!.summary
    store.startSeason2({ summary, playerName: 'A', slot: '2', overwrite: false })
    store.returnToTitle()

    const archiveBeforeRejectedStart = readOutcomeArchive()

    expect(() => store.startSeason2({ summary, playerName: 'A', slot: '2', overwrite: false }))
      .toThrow(/已有进度/)
    expect(readOutcomeArchive()).toEqual(archiveBeforeRejectedStart)

    expect(() => store.startSeason2({ summary, playerName: 'B', slot: '2', overwrite: true }))
      .not.toThrow()
    expect(readSaveV5('2')?.state.seasonId).toBe('season-2') // 覆盖后仍写入独立 v5 存档
    expect(readOutcomeArchive()).toHaveLength(1) // 摘要幂等，outcome 档案不重复
  })

  it('从 v5 存档续玩第二季，重建 campaign 上下文', () => {
    const store = useGameStore()
    makeCompletedS1('1', 'org2')
    const summary = store.scanSeason1Sources()[0]!.summary
    store.startSeason2({ summary, playerName: 'A', slot: '2', overwrite: false })
    playPrologueToCompletion(store)
    expect(store.state?.nodeId).toBe('s2-2.3-entry')

    store.loadSeason2('2')
    expect(store.inSeason2).toBe(true)
    expect(store.state?.nodeId).toBe('s2-2.3-entry')
    expect(readSaveV5('2')?.state.episodeCompletion['s2-prologue']).toBe(true)
  })

  it('旧事件二存档保持原节点并补齐八月重组后的身份与组织名', () => {
    const store = useGameStore()
    makeCompletedS1('1', 'org3')
    const summary = store.scanSeason1Sources()[0]!.summary
    store.startSeason2({ summary, playerName: '旧档玩家', slot: '2', overwrite: false })
    playPrologueToCompletion(store)
    expect(store.state?.nodeId).toBe('s2-2.3-entry')

    store.returnToTitle()
    const savedBefore = readSaveV5('2')!.state
    savedBefore.flags.s2AugustReorganizationComplete = false
    savedBefore.flags.s2AugustContinuityBackfilled = false
    savedBefore.organizationName = '抚梅观清雪'
    localStorage.setItem('4945-vn:v5:save:2', JSON.stringify({
      ...readSaveV5('2'),
      state: savedBefore,
    }))

    store.loadSeason2('2')
    expect(store.state?.nodeId).toBe('s2-2.3-entry')
    expect(store.state?.organizationName).toBe('虚妄月华')
    expect(store.state?.flags).toMatchObject({
      s2AugustContinuityBackfilled: true,
      s2PasserKLeadsOrg3: true,
      s2WenxianRetired: true,
    })
  })

  it('续玩空槽应抛出明确错误', () => {
    const store = useGameStore()
    expect(() => store.loadSeason2('5')).toThrow(/空/)
  })

  it('序章完成后，从集中心进入 2.3 并遍历到完成哨兵', () => {
    const store = useGameStore()
    makeCompletedS1('1', 'org2')
    const summary = store.scanSeason1Sources()[0]!.summary
    store.startSeason2({ summary, playerName: 'A', slot: '2', overwrite: false })
    playPrologueToCompletion(store)
    expect(readSaveV5('2')?.state.episodeCompletion['s2-prologue']).toBe(true)

    // 从既有 v5 存档进入 2.3（集中心）。
    store.playSeason2Episode('2', 's2-2.3')
    expect(store.inSeason2).toBe(true)
    expect(store.state?.nodeId).toBe('s2-2.3-entry')

    // 继承序章变量后，遍历 2.3 到完成哨兵。
    playEpisodeToCompletion(store, 's2-2.3')
    expect(store.state?.nodeId).toBe('s2-2.4-entry')
    expect(readSaveV5('2')?.state.episodeCompletion['s2-2.3']).toBe(true)
    expect(readSaveV5('2')?.state.episodeCompletion['s2-prologue']).toBe(true)
  })

  it('前置集未完成时，playSeason2Episode 进入后续集应被拒绝', () => {
    const store = useGameStore()
    makeCompletedS1('1', 'org2')
    const summary = store.scanSeason1Sources()[0]!.summary
    store.startSeason2({ summary, playerName: 'A', slot: '2', overwrite: false })
    // 序章尚未完成即尝试跳到 2.3。
    expect(() => store.playSeason2Episode('2', 's2-2.3')).toThrow(/前置集/)
  })

  it('序章→2.3→2.4 连续进入，2.4 继承 2.3 的 s2Stance 变量并标记完成', () => {
    const store = useGameStore()
    makeCompletedS1('1', 'org2')
    const summary = store.scanSeason1Sources()[0]!.summary
    store.startSeason2({ summary, playerName: 'A', slot: '2', overwrite: false })
    playPrologueToCompletion(store) // 走 stabilize → accept，s2Stance 未直接设；但 2.3 用 choices[0]=assert
    store.playSeason2Episode('2', 's2-2.3')
    playEpisodeToCompletion(store, 's2-2.3')
    expect(readSaveV5('2')?.state.episodeCompletion['s2-2.3']).toBe(true)

    // 进入 2.4：2.3 选择 assert（choices[0]）应使 s2Stance='assert'，2.4 开场分流到 stance-assert。
    store.playSeason2Episode('2', 's2-2.4')
    expect(store.state?.nodeId).toBe('s2-2.4-entry')
    // 推进一帧到 stance 分流节点。
    store.advance()
    expect(store.state?.nodeId).toBe('s2-2.4-stance-assert')

    playEpisodeToCompletion(store, 's2-2.4')
    expect(store.state?.nodeId).toBe('s2-2.5-entry')
    const v5 = readSaveV5('2')!.state
    expect(v5.episodeCompletion['s2-2.4']).toBe(true)
    expect(v5.variables?.s2Diverge).toBe('confront') // choices[0] 为 confront
  })

  it('序章→2.3→2.4→2.5 连续进入，2.5 回收 s2Diverge 并写入 s2Midpoint', () => {
    const store = useGameStore()
    makeCompletedS1('1', 'org2')
    const summary = store.scanSeason1Sources()[0]!.summary
    store.startSeason2({ summary, playerName: 'A', slot: '2', overwrite: false })
    playPrologueToCompletion(store)
    // 2.3 → 2.4 → 2.5 依次进入并遍历完成。
    for (const ep of ['s2-2.3', 's2-2.4', 's2-2.5']) {
      store.playSeason2Episode('2', ep)
      playEpisodeToCompletion(store, ep)
    }
    const v5 = readSaveV5('2')!.state
    expect(v5.episodeCompletion['s2-2.5']).toBe(true)
    // 2.4 选 confront（choices[0]）→ 2.5 开场按 s2Diverge=confront 分流到 cons-confront。
    expect(v5.variables?.s2Diverge).toBe('confront')
    // 2.5 回应选 guard（choices[0]）→ 写入 s2Midpoint=guard，供 2.6 回收。
    expect(v5.variables?.s2Midpoint).toBe('guard')
  })

  it('孤立升级：从 2.4 中途档（仅完成序章+2.3+2.4）升级继续 2.5 不丢分支状态', () => {
    const store = useGameStore()
    makeCompletedS1('1', 'org2')
    const summary = store.scanSeason1Sources()[0]!.summary
    store.startSeason2({ summary, playerName: 'A', slot: '2', overwrite: false })
    playPrologueToCompletion(store)
    store.playSeason2Episode('2', 's2-2.3')
    playEpisodeToCompletion(store, 's2-2.3')
    store.playSeason2Episode('2', 's2-2.4')
    playEpisodeToCompletion(store, 's2-2.4')
    // 仅完成到 2.4，s2Diverge 已落库；再进 2.5 应读到 confront 分流。
    expect(readSaveV5('2')?.state.variables?.s2Diverge).toBe('confront')
    store.playSeason2Episode('2', 's2-2.5')
    store.advance() // entry → cons-confront（按 s2Diverge）
    expect(store.state?.nodeId).toBe('s2-2.5-cons-confront')
  })

  it('完整第二季路线把主结局和季终标记合并到可见收藏', () => {
    const store = useGameStore()
    makeCompletedS1('1', 'org2')
    const summary = store.scanSeason1Sources()[0]!.summary
    store.startSeason2({ summary, playerName: 'A', slot: '2', overwrite: false })
    playPrologueToCompletion(store)

    for (const episodeId of ['s2-2.3', 's2-2.4', 's2-2.5', 's2-2.6', 's2-2.7', 's2-2.8', 's2-2.9']) {
      store.playSeason2Episode('2', episodeId)
      playEpisodeToCompletion(store, episodeId)
      if (episodeId !== 's2-2.9') {
        expect(store.state, `${episodeId} 未自动进入下一集`).not.toBeNull()
      }
    }

    expect(store.state).toBeNull()

    expect(readCollectionV2().unlockedEndings).toEqual(expect.arrayContaining([
      's2-ending-org2-triumph',
      's2-finale-complete',
    ]))
    expect(store.collection.unlockedEndings).toEqual(expect.arrayContaining([
      's2-ending-org2-triumph',
      's2-finale-complete',
    ]))
  })
})
