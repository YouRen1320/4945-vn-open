import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { storyById } from '@/content/story'
import { isSeason1RouteEnding } from '@/content/endingRegistry'
import {
  getRomanceAction,
  getEffectiveActivePartner,
  isRomanceEpisodeCompleted,
  romanceEpisodeById,
  romanceProfiles,
} from '@/content/romanceProfiles'
import {
  activateSupportAbility,
  applyEffects,
  availableChoices,
  commitChoice,
  commitTextEntry,
  cloneGameState,
  createInitialGameState,
  deactivateSupportAbility,
  enterNode,
  resolveTarget,
} from '@/engine/state'

import { type ReplayCheckpoint, type ReplayContext, type ReplaySession } from '@/engine/replay'
import { appendCollectionSeen } from '@/engine/storage'
import {
  defaultSettings,
  deleteSave,
  mergeCollection,
  readCollection,
  readSave,
  readSettings,
  writeSave,
  writeSettings,
} from '@/engine/storage'

import type { CharacterId, GameSetup, GameSettings, GameState, RouteId } from '@/engine/types'
import type { SaveSlot } from '@/engine/storage'

import { S2_AUGUST_ENTRY } from '@/content/story/s2-august'
import { applySeason2AugustContinuity } from '@/content/season2/augustContinuity'
import {
  bridgeOrg1SummaryToSeason2,
  buildOutcomeRecord,
  buildSeason2OutcomeRecord,
  cloneContinuityProfile,
  extractSeason1Summary,
  extractSeason2Summary,
  isSeason2ActiveRoute,
  isSeason1OutcomeSummary,
  type ContinuityProfile,
  type GameStateV5,
  type Season1OutcomeRecord,
  type Season1OutcomeSummary,
  type Season2ActiveRoute,
  type Season2OutcomeRecord,
} from '@/engine/season2-outcome'
import {
  appendCollectionV2Seen,
  listSavesV5,
  mergeCollectionV2,
  readCollectionV2,
  readSaveV5,
  writeOutcomeRecord,
  writeSaveV5,
  writeSeason2OutcomeRecord,
} from '@/engine/season2-storage'
import {
  SEASON2_EPISODES,
  findEpisodeById,
  findPrologue,
  isEpisodeComplete,
  isSeason2Complete,
  markEpisodeComplete,
  type SeasonEpisodeDefinition,
} from '@/content/season2/registry'
import {
  buildS3RecapOutcomeRecord,
  dedupeSeason2OutcomesForS3,
  makeS3ContinuityProfile,
  type S3ContinuityProfile,
  type S3RecapSelection,
} from '@/engine/season3-continuity'
import {
  listSeason3Saves,
  readSeason3Save,
  writeSeason3Save,
  type Season3CampaignState,
} from '@/engine/season3-storage'
import { readSeason2OutcomeArchive } from '@/engine/season2-storage'
import { SEASON3_EPISODES, isSeason3Complete } from '@/content/season3/registry'
import { buildSeason3OutcomeRecord } from '@/engine/season3-outcome'
import { writeSeason3OutcomeRecord } from '@/engine/season3-outcome-storage'
import { romanceCandidates } from '@/content/characters'

/** 事件二 campaign 会话上下文：保存 v5 元数据，使引擎在每次跳转后重新挂载 schema5 字段。 */
interface Season2CampaignContext {
  summary: Season1OutcomeSummary
  record: Season1OutcomeRecord
  campaignId: string
  lineageId: string
  contentRevision: string
  continuityProfile: ContinuityProfile
  episodeCompletion: Record<string, boolean>
  slot: SaveSlot
  playerName: string
  lastChoiceId?: string
  /** 最近一次 episode 完成时的游戏状态快照，供后续 episode 继承变量后进入。 */
  episodeState?: GameState
}

/** 事件三上下文只持有归一化 profile 快照；来源 outcome 后续变化不会改写在玩 campaign。 */
interface Season3CampaignContext {
  profile: S3ContinuityProfile
  sourceRecordId: string
  sourceDigest: string
  campaignId: string
  lineageId: string
  contentRevision: string
  episodeCompletion: Record<string, boolean>
  slot: SaveSlot
  playerName: string
  lastChoiceId?: string
  episodeState?: GameState
}

const S2_CONTENT_REVISION = 'r1-august-bridge'
const S3_CONTENT_REVISION = 'r2-complete-season-three'

const SEASON1_ROUTE_ENDING_ROUTERS: Partial<Record<RouteId, string>> = {
  org2: 'r2-32-world-router',
  org3: 'r3-23-ending-router',
  org4: 'r4-25-ending-router',
  org5: 'r5-22-ending-router',
  org6: 'r6-25-ending-router',
}

const SEASON1_SHARED_ENDING_NODES = new Set([
  'ending-chaos-collapse',
  'ending-shadow-puppet',
  'ending-aberration-converge',
  'ending-aberration-diverge',
])

const isSeason1SharedEndingNode = (nodeId: string): boolean => SEASON1_SHARED_ENDING_NODES.has(nodeId)

/**
 * 3.1.2 及更早版本会让共享隐藏结局抢先截断组织结局。旧存档仍保留完整路线状态，
 * 因此可用修正后的路线分流重新解析本应达成的组织结局，并只补做该结局的进入效果。
 */
const recoverLegacySeason1RouteEnding = (source: GameState): GameState => {
  if (!source.route || source.unlockedEndings.some((id) => isSeason1RouteEnding(id, source.route ?? undefined))) {
    return source
  }
  const routerId = SEASON1_ROUTE_ENDING_ROUTERS[source.route]
  const router = routerId ? storyById[routerId] : undefined
  if (!router?.next) return source
  const outcomeNode = storyById[resolveTarget(router.next, source)]
  if (!outcomeNode?.onEnter?.length) return source
  const recovered = applyEffects(source, outcomeNode.onEnter)
  return recovered.unlockedEndings.some((id) => isSeason1RouteEnding(id, recovered.route ?? undefined))
    ? recovered
    : source
}

/** 把 campaign 上下文挂载到引擎状态上，得到可写入 v5 存档的完整结构（单一组装点）。 */
const mountSeason2State = (
  base: GameState,
  ctx: Season2CampaignContext,
  lastChoiceId: string | undefined,
): GameStateV5 => ({
  ...base,
  schemaVersion: 5,
  seasonId: 'season-2',
  contentRevision: ctx.contentRevision,
  campaignId: ctx.campaignId,
  lineageId: ctx.lineageId,
  continuityProfile: cloneContinuityProfile(ctx.continuityProfile),
  episodeCompletion: { ...ctx.episodeCompletion },
  season1Outcome: ctx.summary,
  lastChoiceId,
})

const mountSeason3State = (
  base: GameState,
  ctx: Season3CampaignContext,
  lastChoiceId: string | undefined,
): Season3CampaignState => ({
  ...base,
  schemaVersion: 5,
  seasonId: 'season-3',
  contentRevision: ctx.contentRevision,
  campaignId: ctx.campaignId,
  lineageId: ctx.lineageId,
  sourceOutcomeRecordId: ctx.sourceRecordId,
  sourceOutcomeDigest: ctx.sourceDigest,
  continuityProfile: JSON.parse(JSON.stringify(ctx.profile)) as S3ContinuityProfile,
  episodeCompletion: { ...ctx.episodeCompletion },
  lastChoiceId,
})

/** 找到叙事优先续玩时第一个已解锁、未完成的事件二章节。 */
const nextSeason2Episode = (completion: Record<string, boolean>): SeasonEpisodeDefinition | null => (
  SEASON2_EPISODES.find((candidate) => {
    if (completion[candidate.id]) return false
    if (candidate.isPrologue) return true
    const previous = SEASON2_EPISODES.find((item) => item.index === candidate.index - 1)
    return previous ? isEpisodeComplete(completion, previous) : false
  }) ?? null
)

/** 找到事件三第一个已解锁未完成章节；已发布序章档也可无迁移直接进入新章。 */
const nextSeason3Episode = (completion: Record<string, boolean>): SeasonEpisodeDefinition | null => (
  SEASON3_EPISODES.find((candidate) => {
    if (completion[candidate.id]) return false
    if (candidate.isPrologue) return true
    const previous = SEASON3_EPISODES.find((item) => item.index === candidate.index - 1)
    return previous ? completion[previous.id] === true : false
  }) ?? null
)

/** v5 存档的写入路径唯一：合并收藏 v2 后落盘。 */
const writeSeason2Save = (v5: GameStateV5, slot: SaveSlot) => {
  const mergedCollection = mergeCollectionV2(v5)
  writeSaveV5(slot, v5)
  return mergedCollection
}

/** 收藏 v1/v2 只做内存并集展示，分别保留原存储键，避免跨季进度互相覆盖。 */
const mergePermanentCollections = (
  ...collections: Array<ReturnType<typeof readCollection>>
): ReturnType<typeof readCollection> => ({
  seenNodes: [...new Set(collections.flatMap((item) => item.seenNodes))],
  unlockedCgs: [...new Set(collections.flatMap((item) => item.unlockedCgs))],
  unlockedEndings: [...new Set(collections.flatMap((item) => item.unlockedEndings))],
})

const readPermanentCollection = () => mergePermanentCollections(readCollection(), readCollectionV2())

export const useGameStore = defineStore('game', () => {
  const state = ref<GameState | null>(null)
  const settings = ref<GameSettings>(readSettings())
  const collection = ref(readPermanentCollection())
  const wasSeenBeforeEntry = ref(false)
  const saveRevision = ref(0)
  const sceneRevision = ref(0)
  const replaySession = ref<ReplaySession | null>(null)
  const season2Campaign = ref<Season2CampaignContext | null>(null)
  const season3Campaign = ref<Season3CampaignContext | null>(null)

  const node = computed(() => (state.value ? storyById[state.value.nodeId] : null))
  const choices = computed(() => (node.value && state.value ? availableChoices(node.value, state.value) : []))
  const hasAutoSave = computed(() => {
    saveRevision.value
    return Boolean(readSave('auto'))
  })
  const isFinished = computed(() => {
    const id = node.value?.id
    return id === 'credits-first-season' || (id?.startsWith('ending-') ?? false)
  })
  const inRomanceScene = computed(() => node.value?.sideStory === 'romance')
  const inReplay = computed(() => replaySession.value !== null)
  const inRomanceReplay = computed(() => replaySession.value?.kind === 'romance')
  const inChapterReplay = computed(() => replaySession.value?.kind === 'chapter')
  const inSupplementReplay = computed(() => replaySession.value?.kind === 'season1-supplement')
  const inGoldenSliceReplay = computed(() => replaySession.value?.kind === 'golden-slice')
  const inSeason2 = computed(() => replaySession.value?.kind === 'season2')
  const inSeason3 = computed(() => replaySession.value?.kind === 'season3')
  const season2Saves = computed(() => {
    saveRevision.value
    return listSavesV5().filter((m): m is NonNullable<typeof m> => m !== null)
  })
  const season3Saves = computed(() => {
    saveRevision.value
    return listSeason3Saves().filter((m): m is NonNullable<typeof m> => m !== null)
  })
  const hasRomanceInvitation = computed(() => {
    if (!state.value) return false
    return Object.values(romanceProfiles).some((profile) => {
      const action = getRomanceAction(profile, state.value!)
      return action.enabled && (action.kind !== 'daily' || !state.value!.flags[profile.dailyFlag])
    })
  })

  // 所有内部与外部槽位写入都用这个信号刷新标题页“继续”状态。
  const refreshSaves = () => { saveRevision.value += 1 }
  const persistSave = (slot: SaveSlot, source: GameState) => {
    const record = writeSave(slot, source)
    refreshSaves()
    return record
  }

  // 每次跳转都在同一处执行进入副作用、收藏合并和自动存档，防止不同 UI 操作产生分叉行为。
  const enter = (source: GameState, nodeId: string, autoSave = true) => {
    const target = storyById[nodeId]
    if (!target) throw new Error(`找不到剧情节点：${nodeId}`)
    wasSeenBeforeEntry.value = collection.value.seenNodes.includes(nodeId)
    state.value = enterNode(source, target)
    // 同一节点读入不同存档也必须重建打字、模板文本和输入框。
    sceneRevision.value += 1

    // 回放运行在隔离的内存克隆上：绝不扩写收藏，也不覆盖任何存档/检查点。
    if (!replaySession.value) {
      collection.value = mergePermanentCollections(mergeCollection(state.value), readCollectionV2())
    }
    if (autoSave && !replaySession.value) persistSave('auto', state.value)
  }

  // 退出回放并精确恢复进入前的状态（game-snapshot 来源）或回到标题（title 来源）。
  // 这是关系回忆与章节回放共用的唯一退出契约，保证存档/收藏/当前游玩状态逐字节不变。
  const exitReplay = (): boolean => {
    const session = replaySession.value
    if (!session) return false
    if (session.origin === 'game-snapshot' && session.snapshot) {
      state.value = cloneGameState(session.snapshot)
    } else {
      state.value = null
    }
    replaySession.value = null
    sceneRevision.value += 1
    return true
  }

  const transition = (source: GameState, nodeId: string) => {
    const target = storyById[nodeId]
    // 关系回忆：离开 romance 子图即恢复到进入前的完整状态（不重复结算进入节点）。
    if (replaySession.value?.kind === 'romance' && target && target.sideStory !== 'romance') {
      exitReplay()
      return
    }
    // 章节回放：抵达季终/结局节点即自动退出，不进入制作人员画面。
    if (replaySession.value?.kind === 'chapter' && (nodeId === 'credits-first-season' || nodeId.startsWith('ending-'))) {
      exitReplay()
      return
    }
    // 事件一补遗：抵达返回哨兵即记录完成并退出。补遗完成标记（收束节点 id）追加到收藏
    // seenNodes，但不回写任何组织结局、关系值或来源存档——隔离会话逐字节不变。
    if (replaySession.value?.kind === 'season1-supplement' && nodeId === 's1x-exit') {
      if (state.value && !state.value.flags.s1x_supplementRecorded) {
        collection.value = mergePermanentCollections(appendCollectionSeen(state.value.nodeId), readCollectionV2())
        state.value.flags.s1x_supplementRecorded = true
      }
      exitReplay()
      return
    }
    // 黄金样板以纯内存哨兵结束，不追加完成收藏，也不进入正式片尾。
    if (replaySession.value?.kind === 'golden-slice'
      && replaySession.value.exitNodeId
      && nodeId === replaySession.value.exitNodeId) {
      exitReplay()
      return
    }
    // 事件二：抵达任一 episode 的完成哨兵即标记完成、写 v5 存档、返回季/集中心。
    if (replaySession.value?.kind === 'season2') {
      const finished = SEASON2_EPISODES.find((e) => e.completionNodeId === nodeId)
      if (finished) {
        // 选择效果已写入 source；先挂回 store，下一集和结局档案才能继承最新分支。
        state.value = source
        completeSeason2Episode(finished)
        return
      }
      enter(source, nodeId)
      persistSeason2()
      return
    }
    // 事件三使用自己的 campaign 快照与存储键；序章完成后回到标题进度中心。
    if (replaySession.value?.kind === 'season3') {
      const finished = SEASON3_EPISODES.find((episode) => episode.completionNodeId === nodeId)
      if (finished) {
        state.value = source
        completeSeason3Episode(finished)
        return
      }
      enter(source, nodeId, false)
      persistSeason3()
      return
    }
    enter(source, nodeId)
  }

  const start = (setup: GameSetup) => {
    replaySession.value = null
    season2Campaign.value = null
    season3Campaign.value = null
    const initial = createInitialGameState(setup)
    enter(initial, initial.nodeId)
  }

  const advance = () => {
    if (!state.value) return false
    // 事件一 credits 后自动传承到事件二：玩家读完致谢文案后点继续，无需手动选择来源档。
    if (!replaySession.value && node.value?.id === 'credits-first-season') {
      try {
        transitionToSeason2()
        return true
      } catch {
        // 传承失败（如状态不合法）则留在 credits，不吞掉这次点击。
        return false
      }
    }
    if (!node.value?.next) return false
    // 已停在旧版共享隐藏结局的存档会在首次继续时静默补齐被跳过的组织结局，再进入统一片尾。
    const source = isSeason1SharedEndingNode(node.value.id)
      ? recoverLegacySeason1RouteEnding(state.value)
      : state.value
    const nextId = resolveTarget(node.value.next, source)
    transition(source, nextId)
    return true
  }

  const choose = (choiceId: string) => {
    if (!state.value || !node.value) return
    if (season2Campaign.value) season2Campaign.value.lastChoiceId = choiceId
    if (season3Campaign.value) season3Campaign.value.lastChoiceId = choiceId
    const result = commitChoice(state.value, node.value, choiceId)
    transition(result.state, result.next)
    return result.supportResult
  }

  const submitTextEntry = (value: string) => {
    if (!state.value || !node.value?.textEntry) return
    // 剧情文本输入和普通选择共享同一进入/存档管线，保证刷新与读档结果一致。
    const result = commitTextEntry(state.value, node.value, value)
    transition(result.state, result.next)
  }

  const startRomanceEpisode = (episodeId: string) => {
    if (!state.value || !node.value) throw new Error('请先开始游戏。')
    if (replaySession.value) throw new Error('回放中无法开始约会；请先退出回放。')
    if (inRomanceScene.value) throw new Error('先完成正在进行的约会。')
    const episode = romanceEpisodeById[episodeId]
    if (!episode) throw new Error('这份邀约不存在。')
    const profile = romanceProfiles[episode.character]
    const action = getRomanceAction(profile, state.value)
    const canReplayDaily = episode.kind === 'daily'
      && getEffectiveActivePartner(state.value) === episode.character
    if ((!action.enabled || action.nodeId !== episode.nodeId) && !canReplayDaily) {
      throw new Error(action.reason)
    }

    const withReturnPoint = applyEffects(state.value, [
      { type: 'variable', key: 'romanceReturnNode', value: node.value.id },
    ])
    enter(withReturnPoint, episode.nodeId)
  }

  const startRomanceReplay = (episodeId: string) => {
    if (!state.value || !node.value) throw new Error('请先开始游戏。')
    if (replaySession.value) throw new Error('回放中不能叠加关系回忆；请先退出当前回放。')
    if (inRomanceScene.value) throw new Error('先完成正在进行的约会或回忆。')
    const episode = romanceEpisodeById[episodeId]
    if (!episode) throw new Error('这段关系回忆不存在。')
    if (!isRomanceEpisodeCompleted(episode, state.value)) throw new Error('这段关系回忆尚未完成。')

    const snapshot = cloneGameState(state.value)
    replaySession.value = { kind: 'romance', origin: 'game-snapshot', snapshot }
    const replayState = applyEffects(snapshot, [
      { type: 'variable', key: 'romanceReturnNode', value: node.value.id },
    ])
    enter(replayState, episode.nodeId, false)
  }

  // 2.0 章节沙盒：来自标题页，不依赖任何活动游戏，纯沙盒回放，绝不写存档/收藏/奖励。
  const startChapterReplay = (checkpoint: ReplayCheckpoint, context: ReplayContext) => {
    const replayState = checkpoint.buildState(context)
    replaySession.value = { kind: 'chapter', origin: 'title', snapshot: null }
    enter(replayState, checkpoint.startNodeId, false)
  }

  // 2.1 事件一补遗沙盒：复用同一套隔离会话，纯沙盒回放，绝不写存档/收藏/奖励；
  // 仅补遗收束时由 transition 的 s1x-exit 分支定向追加完成标记到收藏 seenNodes。
  const startSupplementReplay = (checkpoint: ReplayCheckpoint, context: ReplayContext) => {
    const replayState = checkpoint.buildState(context)
    replaySession.value = { kind: 'season1-supplement', origin: 'title', snapshot: null }
    enter(replayState, checkpoint.startNodeId, false)
  }

  // 黄金样板只能从标题页启动；全新内存状态保证它不继承或覆盖任何正式进度。
  const startGoldenSliceReplay = (checkpoint: ReplayCheckpoint, context: ReplayContext) => {
    if (replaySession.value || state.value) throw new Error('请先返回标题，再开始黄金样板试玩。')
    const replayState = checkpoint.buildState(context)
    if (!checkpoint.exitNodeId) throw new Error('黄金样板缺少结束标记。')
    replaySession.value = {
      kind: 'golden-slice',
      origin: 'title',
      snapshot: null,
      exitNodeId: checkpoint.exitNodeId,
    }
    enter(replayState, checkpoint.startNodeId, false)
  }

  // ───────────────────────── 事件二（2.2）─────────────────────────
  // 事件二复用引擎遍历，但每个跳转后都从 season2Campaign 重新挂载 schema5 字段并写入
  // 独立 v5 存档；来源 v4 存档与旧收藏键永不被读取、覆盖或删除（非破坏性叠加）。

  const persistSeason2 = () => {
    const ctx = season2Campaign.value
    if (!ctx || !state.value) return
    const v5 = mountSeason2State(state.value, ctx, ctx.lastChoiceId)
    state.value = v5
    collection.value = mergePermanentCollections(readCollection(), writeSeason2Save(v5, ctx.slot))
    refreshSaves()
  }

  const buildSeason2InitialState = (
    summary: Season1OutcomeSummary,
    playerName: string,
  ): GameStateV5 => {
    const base = createInitialGameState({ playerName: playerName || '玩家' })
    base.route = summary.route
    base.organization = summary.organization
    base.organizationName = summary.organizationName
    base.activePartner = summary.activePartner === 'none' ? null : summary.activePartner
    if (base.activePartner) {
      const tier = summary.relationshipTiers[base.activePartner]
      const rel = base.relationships[base.activePartner]
      if (rel && typeof tier === 'number') base.relationships[base.activePartner] = { ...rel, progress: tier }
    }
    if (summary.durableFacts.includes('s1-org-ending') && summary.organizationEndingId) {
      base.unlockedEndings = [...new Set([...base.unlockedEndings, summary.organizationEndingId])]
    }
    // flavor 级事实复制进 S2 flags，供序章「回望」节点用现有 flag 条件做散文变体
    // （S2-INHERITANCE-CONTRACT.md §1；级别仍为 flavor，不解锁机制）。
    if (summary.durableFacts.includes('s1-charter-written')) base.flags.s1CharterWritten = true
    if (summary.durableFacts.includes('s1-confession-transferred')) base.flags.s1ConfessionTransferred = true
    if (summary.durableFacts.includes('s1-fire-two')) base.flags.s1FireTwo = true
    // 一组转线只改变事件二活跃组织；事件一原始身份保存在摘要并供序章明确承认。
    if (summary.routeTransfer?.kind === 'org1-to-active-route') {
      base.flags.s1Org1RouteTransfer = true
      base.variables.s1OriginOrganizationName = summary.routeTransfer.fromOrganizationName
    }
    return {
      ...base,
      schemaVersion: 5,
      seasonId: 'season-2',
      contentRevision: S2_CONTENT_REVISION,
      campaignId: '',
      lineageId: '',
      continuityProfile: {},
      episodeCompletion: { 's2-prologue': false },
      season1Outcome: summary,
      lastChoiceId: undefined,
    }
  }

  const startSeason2 = (params: {
    summary: Season1OutcomeSummary
    playerName: string
    slot: SaveSlot
    overwrite: boolean
  }) => {
    const { summary, playerName, slot, overwrite } = params
    if (!isSeason1OutcomeSummary(summary)) throw new Error('来源摘要不合法，无法开始事件二。')
    // 覆盖确认必须先于任何持久化副作用；取消覆盖不能留下孤立的结果档案。
    if (readSaveV5(slot) && !overwrite) throw new Error('该事件二槽已有进度，需单独确认覆盖。')
    // 相同内容按 digest 去重：复用既有 Season1OutcomeRecord（不重复写 archive）。
    const record = writeOutcomeRecord(buildOutcomeRecord(summary, S2_CONTENT_REVISION))
    const campaignId = `camp-${record.digest}-${slot}`
    const lineageId = `lineage-${record.digest}`
    const ctx: Season2CampaignContext = {
      summary,
      record,
      campaignId,
      lineageId,
      contentRevision: S2_CONTENT_REVISION,
      continuityProfile: {},
      episodeCompletion: { 's2-prologue': false },
      slot,
      playerName,
      lastChoiceId: undefined,
    }
    season2Campaign.value = ctx
    replaySession.value = { kind: 'season2', origin: 'title', snapshot: null }
    const initial = buildSeason2InitialState(summary, playerName)
    enter(initial, S2_AUGUST_ENTRY, false)
    persistSeason2()
  }

  /** 抵达任一 episode 的完成哨兵：标记完成、写 v5 存档、返回季/集中心。 */
  const completeSeason2Episode = (episode: SeasonEpisodeDefinition) => {
    const ctx = season2Campaign.value
    if (!ctx) { replaySession.value = null; return }

    // 事件二结局归档：完成哨兵的 onEnter 含 archiveSeason2Outcome 时，在清场前写入结局档案。
    // 此前逻辑在 enter() 中检查，但 transition() 在到达哨兵时直接调 completeSeason2Episode()，
    // enter() 从未被调用，导致归档永不触发。此处移入 completeSeason2Episode 修复。
    const completionNode = storyById[episode.completionNodeId]
    if (state.value && completionNode?.onEnter?.some((e) => e.type === 'archiveSeason2Outcome')) {
      const createdAt = Date.now()
      // S2 outcome records describe the completed S2 campaign slot; the original S1 lineage
      // remains independently traceable through lineageId and the embedded S1 summary.
      const s2Summary = extractSeason2Summary(state.value, {
        source: { kind: 'save', slot: ctx.slot, savedAt: createdAt },
        createdAt,
      })
      const s2Record = buildSeason2OutcomeRecord(
        s2Summary,
        ctx.contentRevision,
        ctx.lineageId,
        ctx.campaignId,
      )
      writeSeason2OutcomeRecord(s2Record)
    }

    ctx.episodeCompletion = markEpisodeComplete(ctx.episodeCompletion, episode)
    ctx.lastChoiceId = undefined
    if (state.value) {
      const v5 = mountSeason2State(state.value, ctx, undefined)
      state.value = v5
      collection.value = mergePermanentCollections(readCollection(), writeSeason2Save(v5, ctx.slot))
    }
    appendCollectionV2Seen(episode.completionNodeId)
    appendCollectionV2Seen(episode.entryNodeId)
    // 保存完成时的状态快照，供后续 episode 继承变量进入；再清场返回集中心。
    if (ctx) ctx.episodeState = state.value ?? undefined

    // 连续主线：完成一集后直接进入下一集，章节中心只作为查看进度的辅助入口。
    const nextEpisode = nextSeason2Episode(ctx.episodeCompletion)
    if (nextEpisode) {
      season2Campaign.value = ctx
      replaySession.value = { kind: 'season2', origin: 'title', snapshot: null }
      const base = ctx.episodeState ?? buildSeason2InitialState(ctx.summary, ctx.playerName || '玩家')
      enter(base, nextEpisode.entryNodeId, false)
      persistSeason2()
      return
    }

    replaySession.value = null
    season2Campaign.value = null
    state.value = null
    sceneRevision.value += 1
    refreshSaves()
  }

  /** 序章收束后，从季/集中心进入后续 episode（如 2.3）。复用当前 campaign 上下文与已继承的变量。 */
  const enterSeason2Episode = (episodeId: string) => {
    const ctx = season2Campaign.value
    const episode = findEpisodeById(SEASON2_EPISODES, episodeId)
    if (!episode || episode.isPrologue) throw new Error('该集不可从集中心进入。')
    if (!ctx) throw new Error('请先从标题开始或续玩事件二。')
    if (ctx.episodeCompletion[episode.id]) throw new Error('该集已完成。')
    // 前置集必须已完成（序章为 0，后续按 index 单调递增解锁）。
    const previous = SEASON2_EPISODES.find((e) => e.index === episode.index - 1)
    if (previous && !ctx.episodeCompletion[previous.id]) throw new Error('前置集尚未完成。')
    // 续玩已存在的 campaign（loadSeason2）可能无 episodeState，回退重建初始态。
    const base = ctx.episodeState ?? buildSeason2InitialState(ctx.summary, ctx.playerName || '玩家')
    season2Campaign.value = ctx
    replaySession.value = { kind: 'season2', origin: 'title', snapshot: null }
    enter(base, episode.entryNodeId, false)
    persistSeason2()
  }

  const completePrologue = () => {
    const prologue = findPrologue(SEASON2_EPISODES)
    if (prologue) completeSeason2Episode(prologue)
  }

  // ───────────────────────── 事件三（3.3）─────────────────────────
  // 新季复用剧情状态引擎，但持久化到独立 s3 key；事件二 outcome 只在开局时读取一次。
  const persistSeason3 = () => {
    const ctx = season3Campaign.value
    if (!ctx || !state.value) return
    const current: GameState = state.value
    // Vue 会递归展开只读 ContinuityProfile；在持久化边界恢复为值对象，避免类型层无限展开。
    const valueContext = ctx as unknown as Season3CampaignContext
    const mounted: Season3CampaignState = mountSeason3State(current, valueContext, undefined)
    state.value = mounted
    collection.value = mergePermanentCollections(readCollection(), mergeCollectionV2(mounted))
    writeSeason3Save(ctx.slot, mounted)
    refreshSaves()
  }

  const buildSeason3InitialState = (
    profile: S3ContinuityProfile,
    playerName: string,
  ): GameState => {
    const base = createInitialGameState({ playerName: playerName || '玩家' })
    base.route = profile.route
    base.organization = profile.organization
    base.organizationName = profile.organizationName
    base.role = 'leader'
    base.date = '2027-01-04'
    base.chapter = 'prologue'
    base.stats.cohesion = profile.cohesion
    base.stats.reputation = profile.reputation
    base.stats.resources = profile.resources
    base.variables.s3Partner = profile.activePartner
    base.variables.s3EndingKind = profile.s2Triumph ? 'triumph' : 'compromise'
    base.variables.s3EndingLabel = profile.s2Triumph
      ? '上一季以强势结果收束：筹码更多，也被列为重点监管对象'
      : '上一季以保护条款收束：仍有操作空间，但旧条款正面临削弱'
    base.variables.s3SourceKind = profile.source.kind
    base.flags.s3InheritedTriumph = profile.s2Triumph
    base.flags.s3InheritedCompromise = !profile.s2Triumph
    const legalPartner = (romanceCandidates as readonly CharacterId[]).includes(profile.activePartner as CharacterId)
      ? profile.activePartner as CharacterId
      : null
    base.activePartner = legalPartner
    if (legalPartner) {
      base.relationships[legalPartner] = {
        ...base.relationships[legalPartner],
        trust: 2,
        affinity: 2,
        progress: 60,
        stance: 'support',
      }
    }
    return base
  }

  const startSeason3 = (params: {
    record: Season2OutcomeRecord
    playerName: string
    slot: SaveSlot
    overwrite: boolean
  }) => {
    const { record: sourceRecord, playerName, slot, overwrite } = params
    if (readSeason3Save(slot) && !overwrite) throw new Error('该事件三槽已有进度，需单独确认覆盖。')
    const made = makeS3ContinuityProfile(sourceRecord)
    if (!made.ok) throw new Error(made.errors.join('；'))
    // recap 同样写成明确标记的 outcome record；真实结局按 digest 幂等复用，均不修改来源 v5 存档。
    const record = writeSeason2OutcomeRecord(sourceRecord)
    const profile = made.profile
    const campaignId = `s3-camp-${record.digest}-${slot}`
    const lineageId = record.lineageId || `s3-lineage-${record.digest}`
    const ctx: Season3CampaignContext = {
      profile,
      sourceRecordId: record.recordId,
      sourceDigest: record.digest,
      campaignId,
      lineageId,
      contentRevision: S3_CONTENT_REVISION,
      episodeCompletion: Object.fromEntries(SEASON3_EPISODES.map((episode) => [episode.id, false])),
      slot,
      playerName: playerName.trim() || '玩家',
    }
    season2Campaign.value = null
    season3Campaign.value = ctx
    replaySession.value = { kind: 'season3', origin: 'title', snapshot: null }
    const initial = buildSeason3InitialState(profile, ctx.playerName)
    enter(initial, 's3-prologue-entry', false)
    persistSeason3()
  }

  const startSeason3Recap = (params: {
    selection: S3RecapSelection
    playerName: string
    slot: SaveSlot
    overwrite: boolean
  }) => startSeason3({
    record: buildS3RecapOutcomeRecord(params.selection),
    playerName: params.playerName,
    slot: params.slot,
    overwrite: params.overwrite,
  })

  const completeSeason3Episode = (episode: SeasonEpisodeDefinition) => {
    const ctx = season3Campaign.value
    if (!ctx) { replaySession.value = null; return }
    ctx.episodeCompletion = { ...ctx.episodeCompletion, [episode.id]: true }
    ctx.lastChoiceId = undefined
    if (state.value) {
      ctx.episodeState = state.value
      persistSeason3()
    }
    appendCollectionV2Seen(episode.entryNodeId)
    appendCollectionV2Seen(episode.completionNodeId)
    const nextEpisode = nextSeason3Episode(ctx.episodeCompletion)
    if (nextEpisode && state.value) {
      enter(state.value, nextEpisode.entryNodeId, false)
      persistSeason3()
      return
    }
    if (state.value?.flags.s3Complete) {
      writeSeason3OutcomeRecord(buildSeason3OutcomeRecord({
        state: state.value,
        sourceOutcomeRecordId: ctx.sourceRecordId,
        lineageId: ctx.lineageId,
        campaignId: ctx.campaignId,
        contentRevision: ctx.contentRevision,
      }))
    }
    replaySession.value = null
    season3Campaign.value = null
    state.value = null
    sceneRevision.value += 1
    refreshSaves()
  }

  const loadSeason3 = (slot: SaveSlot) => {
    const record = readSeason3Save(slot)
    if (!record) throw new Error('该事件三存档槽为空。')
    if (isSeason3Complete(record.state.episodeCompletion)) throw new Error('事件三已完成。')
    const saved = record.state
    const ctx: Season3CampaignContext = {
      profile: saved.continuityProfile,
      sourceRecordId: saved.sourceOutcomeRecordId,
      sourceDigest: saved.sourceOutcomeDigest,
      campaignId: saved.campaignId,
      lineageId: saved.lineageId,
      contentRevision: saved.contentRevision,
      episodeCompletion: { ...saved.episodeCompletion },
      slot,
      playerName: saved.playerName,
      lastChoiceId: saved.lastChoiceId,
      episodeState: saved,
    }
    season2Campaign.value = null
    season3Campaign.value = ctx
    replaySession.value = { kind: 'season3', origin: 'title', snapshot: null }
    const stoppedOnCompletion = SEASON3_EPISODES.some((episode) => (
      episode.completionNodeId === saved.nodeId && saved.episodeCompletion[episode.id] === true
    ))
    const resumeEpisode = stoppedOnCompletion ? nextSeason3Episode(saved.episodeCompletion) : null
    enter(saved, resumeEpisode?.entryNodeId ?? saved.nodeId, false)
    persistSeason3()
  }

  /** 标题页只展示可验证、未被取代的事件二结局；多个结果保持并列，由玩家手动选择。 */
  const scanSeason2OutcomesForSeason3 = () => dedupeSeason2OutcomesForS3(readSeason2OutcomeArchive())

  /**
   * 无缝衔接：事件一 credits 节点后自动传承到事件二序章。
   * 从当前 GameState 提取 Season1OutcomeSummary，按 digest 去重写入 outcome archive，
   * 再调用 startSeason2 载入事件二共通序章。当前 v4 存档保留在原槽位不动；
   * 事件二写入独立的 v5 槽（优先选空槽，否则回落到 '1' 并提示覆盖）。
   *
   * 仅供玩家在 credits-first-season 节点选择「继续前往事件二」时调用；不强制打断
   * 玩家回看制作人员的自由。
   */
  const transitionToSeason2 = (destination?: Season2ActiveRoute): { slot: SaveSlot; overwrite: boolean } => {
    if (!state.value) throw new Error('当前没有可继承的游戏状态。')
    if (state.value.schemaVersion !== 4) {
      throw new Error('仅事件一存档可传承到事件二；已在事件二中。')
    }
    const source = recoverLegacySeason1RouteEnding(state.value)
    if (source !== state.value) {
      state.value = source
      collection.value = mergePermanentCollections(mergeCollection(source), readCollectionV2())
    }
    const extracted = extractSeason1Summary(source, 'auto', Date.now())
    if (source.route === 'org1' && !destination) throw new Error('请先选择事件二的新组织。')
    const summary = source.route === 'org1' && destination
      ? bridgeOrg1SummaryToSeason2(extracted, destination)
      : extracted
    if (source.route !== 'org1' && !isSeason2ActiveRoute(source.route)) {
      throw new Error('当前路线无法进入事件二。')
    }
    if (!isSeason1OutcomeSummary(summary)) {
      throw new Error('当前状态不构成合法的事件一结局，无法传承。')
    }
    const saves = listSavesV5().filter((m): m is NonNullable<typeof m> => m !== null)
    const occupied = new Set(saves.map((s) => s.slot))
    const slots: SaveSlot[] = ['1', '2', '3', '4', '5', '6']
    const slot = slots.find((s) => !occupied.has(s)) ?? '1'
    const overwrite = occupied.has(slot)
    startSeason2({ summary, playerName: state.value.playerName, slot, overwrite })
    // S2 已建立独立 v5 存档；清除 stale v4 auto 存档，防止标题页「继续」重复进入 credits。
    try { deleteSave('auto'); refreshSaves() } catch { /* 清除失败不阻断传承 */ }
    return { slot, overwrite }
  }

  /** 扫描事件一已完成档，提取合法来源摘要（供标题页「事件二」来源选择使用）。 */
  const scanSeason1Sources = () => {
    const slots: SaveSlot[] = ['auto', 'quick', '1', '2', '3', '4', '5', '6']
    const sources: Array<{ slot: string; savedAt: number; summary: Season1OutcomeSummary; playerName: string }> = []
    for (const slot of slots) {
      const rec = readSave(slot)
      if (!rec) continue
      const s = rec.state
      // 共享隐藏结局节点本身就是事件一终幕；旧版存档会先按最终路线状态补齐组织结局。
      const completed = s.nodeId === 'credits-first-season'
        || isSeason1SharedEndingNode(s.nodeId)
        || s.unlockedEndings.some((endingId) => isSeason1RouteEnding(endingId, s.route ?? undefined))
      if (!completed) continue
      const summary = extractSeason1Summary(recoverLegacySeason1RouteEnding(s), slot, rec.savedAt)
      if (!isSeason1OutcomeSummary(summary)) continue
      sources.push({ slot, savedAt: rec.savedAt, summary, playerName: s.playerName })
    }
    return sources
  }

  /** 从既有 v5 存档续玩事件二：重建 campaign 上下文，绝不读/覆盖 v4 来源。 */
  const loadSeason2 = (slot: SaveSlot) => {
    const rec = readSaveV5(slot)
    if (!rec) throw new Error('该事件二存档槽为空。')
    // 已发布的事件二存档保持当前位置；只补齐它们在 8 月已经发生的身份与组织称谓。
    // 正在游玩新桥接篇的存档不提前迁移，固定史实由剧情收束节点正常写入。
    const v5 = rec.state.nodeId.startsWith('s2-august-')
      ? rec.state
      : applySeason2AugustContinuity(rec.state)
    if (isSeason2Complete(v5.episodeCompletion)) {
      throw new Error('该事件二记录已经完成，可在主线进度或结局档案中查看。')
    }
    const prologue = findPrologue(SEASON2_EPISODES)
    const ctx: Season2CampaignContext = {
      summary: v5.season1Outcome,
      record: writeOutcomeRecord(buildOutcomeRecord(v5.season1Outcome, v5.contentRevision)),
      campaignId: v5.campaignId,
      lineageId: v5.lineageId,
      contentRevision: v5.contentRevision,
      continuityProfile: cloneContinuityProfile(v5.continuityProfile),
      episodeCompletion: { ...(v5.episodeCompletion ?? (prologue ? { [prologue.id]: false } : {})) },
      slot,
      playerName: v5.playerName,
      lastChoiceId: v5.lastChoiceId,
      episodeState: v5,
    }
    season2Campaign.value = ctx
    replaySession.value = { kind: 'season2', origin: 'title', snapshot: null }
    // 旧 v5 存档可能停在完成哨兵；续玩时跳到下一集入口，标题按钮直接打开可玩的剧情。
    const stoppedOnCompletion = SEASON2_EPISODES.some((episode) => (
      episode.completionNodeId === v5.nodeId && isEpisodeComplete(ctx.episodeCompletion, episode)
    ))
    const resumeEpisode = stoppedOnCompletion ? nextSeason2Episode(ctx.episodeCompletion) : null
    if (resumeEpisode) enter(v5, resumeEpisode.entryNodeId, false)
    else enter(v5, v5.nodeId, false)
    persistSeason2()
  }

  /** 从既有 v5 存档进入指定 episode（集中心）：先重建 campaign 上下文，再进入该集入口。 */
  const playSeason2Episode = (slot: SaveSlot, episodeId: string) => {
    loadSeason2(slot)
    enterSeason2Episode(episodeId)
  }

  const cancelRomanceReplay = () => {
    if (replaySession.value?.kind !== 'romance') return false
    return exitReplay()
  }

  const toggleSupport = (character: CharacterId): 'activated' | 'deactivated' | false => {
    if (replaySession.value) throw new Error('回放中无法使用会写入存档的支援能力。')
    if (!state.value || !node.value?.choices?.length) return false
    const wasActive = Boolean(state.value.supportAbilities[character]?.active)
    // Arming/canceling persists immediately; cancel never spends the chapter charge.
    state.value = wasActive
      ? deactivateSupportAbility(state.value, character)
      : activateSupportAbility(state.value, character)
    persistSave('auto', state.value)
    return wasActive ? 'deactivated' : 'activated'
  }

  const save = (slot: SaveSlot) => {
    if (!state.value) throw new Error('当前没有可保存的游戏。')
    if (replaySession.value) throw new Error('回放内容不会写入存档；退出回放后再保存。')
    return persistSave(slot, state.value)
  }

  const load = (slot: SaveSlot) => {
    if (replaySession.value) throw new Error('回放中无法读取存档；请先退出回放。')
    season2Campaign.value = null
    season3Campaign.value = null
    const record = readSave(slot)
    if (!record) throw new Error('该存档槽为空。')
    collection.value = mergePermanentCollections(mergeCollection(record.state), readCollectionV2())
    enter(record.state, record.state.nodeId, false)
    // 读入任意槽后更新当前会话锚点；源槽保持不变，刷新也会回到刚读入的位置。
    if (state.value) persistSave('auto', state.value)
  }

  const continueAutoSave = () => load('auto')

  const updateSettings = (next: Partial<GameSettings>) => {
    settings.value = writeSettings({ ...settings.value, ...next })
  }

  const resetSettings = () => {
    settings.value = writeSettings(defaultSettings)
  }

  const returnToTitle = () => {
    // 事件二进行中返回标题前，先把当前进度落到 v5 存档，确保序章可续玩。
    if (season2Campaign.value && state.value) persistSeason2()
    if (season3Campaign.value && state.value) persistSeason3()
    replaySession.value = null
    season2Campaign.value = null
    season3Campaign.value = null
    state.value = null
  }

  // 调试和自动化测试可安全施加效果，无需绕过引擎边界。
  const applyDebugEffects = (effects: Parameters<typeof applyEffects>[1]) => {
    if (state.value) state.value = applyEffects(state.value, effects)
  }

  return {
    state,
    settings,
    collection,
    wasSeenBeforeEntry,
    sceneRevision,
    node,
    choices,
    hasAutoSave,
    isFinished,
    inRomanceScene,
    inReplay,
    inRomanceReplay,
    inChapterReplay,
    inSupplementReplay,
    inGoldenSliceReplay,
    inSeason2,
    inSeason3,
    season2Saves,
    season3Saves,
    hasRomanceInvitation,
    start,
    advance,
    choose,
    toggleSupport,
    startRomanceEpisode,
    startRomanceReplay,
    startChapterReplay,
    startSupplementReplay,
    startGoldenSliceReplay,
    startSeason2,
    loadSeason2,
    playSeason2Episode,
    enterSeason2Episode,
    scanSeason1Sources,
    completePrologue,
    transitionToSeason2,
    startSeason3,
    startSeason3Recap,
    loadSeason3,
    scanSeason2OutcomesForSeason3,
    cancelRomanceReplay,
    exitReplay,
    submitTextEntry,
    save,
    load,
    continueAutoSave,
    updateSettings,
    resetSettings,
    refreshSaves,
    returnToTitle,
    applyDebugEffects,
  }
})
