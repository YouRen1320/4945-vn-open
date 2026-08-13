import { characters, romanceCandidates } from '@/content/characters'
import { cgPath } from '@/content/cgAssets'
import { romanceAfterStoryScripts } from '@/content/romanceAfterStoryContent'
import { resolveManagedVisual, v18ConfessionVisuals } from '@/content/visualAssets'

import type { BackgroundId, CharacterId, GameState } from '@/engine/types'

export const ROMANCE_FIRST_DATE_UNLOCK = 30
export const ROMANCE_CONFESSION_UNLOCK = 100

export type RomanceCandidateId = (typeof romanceCandidates)[number]
export type RomanceEpisodeId = string
export type RomanceEpisodeKind =
  | 'firstDate'
  | 'confession'
  | 'daily'
  | 'secondDate'
  | 'conflict'
  | 'reconciliation'
export type RomanceStage =
  | 'locked'
  | 'dateable'
  | 'dated'
  | 'confessable'
  | 'partner'
  | 'partnered-elsewhere'

export interface RomanceProfile {
  character: RomanceCandidateId
  dateTitle: string
  confessionTitle: string
  dailyTitle: string
  secondDateTitle: string
  conflictTitle: string
  reconciliationTitle: string
  completionFlag: string
  dailyFlag: string
  secondDateFlag: string
  conflictFlag: string
  reconciliationFlag: string
  partnerFlag: string
  bondedFlag: string
  bondEndingId: `bond-${RomanceCandidateId}`
  bondCgId: string
  firstDateCgId: `cg${number}-romance-${RomanceCandidateId}-first-date`
  firstDateCg: string
  firstDateCgAlt: string
  confessionCgId: `cg${number}-romance-${RomanceCandidateId}-confession`
  confessionCg: string
  confessionCgFinal: string
  confessionCgAlt: string
  confessionCgPromptRef: string
  firstDateNodeId: string
  confessionNodeId: string
  dailyNodeId: string
  secondDateNodeId: string
  conflictNodeId: string
  reconciliationNodeId: string
  sceneBackgrounds: {
    date: BackgroundId
    confession: BackgroundId
    daily: BackgroundId
  }
}

type RomanceAvailabilityState = Pick<GameState, 'relationships' | 'flags'> & {
  activePartner?: CharacterId | null
}

export interface RomanceAvailability {
  character: RomanceCandidateId
  stage: RomanceStage
  progress: number
  effectiveActivePartner: RomanceCandidateId | null
  canFirstDate: boolean
  canConfess: boolean
  canDaily: boolean
  canSecondDate: boolean
  canConflict: boolean
  canReconcile: boolean
}

export interface RomanceEpisodeDefinition {
  id: RomanceEpisodeId
  character: RomanceCandidateId
  kind: RomanceEpisodeKind
  nodeId: string
  title: string
}

export interface RomanceAction {
  enabled: boolean
  kind: RomanceEpisodeKind | 'disabled'
  nodeId: string | null
  title: string
  reason: string
}

// Each route receives location-appropriate art while sharing one coherent night-market palette.
const romanceSceneBackgrounds: Record<RomanceCandidateId, RomanceProfile['sceneBackgrounds']> = {
  shana: { date: 'romanceFoodStreetRain', confession: 'romanceLanternBridgeAfterHours', daily: 'romanceFoodStreetAfterHours' },
  qifu: { date: 'romanceGateRain', confession: 'romanceLanternBridgeRain', daily: 'romanceGateAfterHours' },
  chenyi: { date: 'romanceGateAfterHours', confession: 'romanceLanternBridgeRain', daily: 'romanceFoodStreetRain' },
  swordheart: { date: 'romanceArcadeAfterHours', confession: 'romanceLanternBridgeAfterHours', daily: 'romanceArcadeRain' },
  heartbeat: { date: 'romanceFoodStreetRain', confession: 'romanceLanternBridgeAfterHours', daily: 'romanceFoodStreetAfterHours' },
  yanqiu: { date: 'romanceGateAfterHours', confession: 'romanceLanternBridgeRain', daily: 'romanceGateRain' },
  huayue: { date: 'romanceFoodStreetAfterHours', confession: 'romanceLanternBridgeAfterHours', daily: 'romanceFoodStreetRain' },
  wenxian: { date: 'romanceLanternBridgeRain', confession: 'romanceLanternBridgeAfterHours', daily: 'romanceLanternBridgeRain' },
  takemehand: { date: 'romanceGateRain', confession: 'romanceLanternBridgeAfterHours', daily: 'romanceFoodStreetAfterHours' },
  xilufei: { date: 'romanceArcadeRain', confession: 'romanceGateAfterHours', daily: 'romanceArcadeAfterHours' },
  yyt: { date: 'romanceArcadeAfterHours', confession: 'romanceLanternBridgeRain', daily: 'romanceArcadeRain' },
  avucii: { date: 'romanceFoodStreetAfterHours', confession: 'romanceLanternBridgeAfterHours', daily: 'romanceLanternBridgeRain' },
}

const defineProfile = (
  character: RomanceCandidateId,
  dateTitle: string,
  confessionTitle: string,
  dailyTitle: string,
  firstDateCgId: RomanceProfile['firstDateCgId'],
  confessionCgId: RomanceProfile['confessionCgId'],
  bondedFlag: string,
  bondCgId: string,
): RomanceProfile => {
  const confessionVisual = v18ConfessionVisuals[character]
  const afterStory = romanceAfterStoryScripts[character]
  return ({
  character,
  dateTitle,
  confessionTitle,
  dailyTitle,
  secondDateTitle: afterStory.secondDate.title,
  conflictTitle: afterStory.conflict.title,
  reconciliationTitle: afterStory.reconciliation.title,
  completionFlag: `romanceNightMarketDate_${character}`,
  dailyFlag: `romanceNightMarketDaily_${character}`,
  secondDateFlag: `romanceAfterSecondDate_${character}`,
  conflictFlag: `romanceAfterConflict_${character}`,
  reconciliationFlag: `romanceAfterReconciliation_${character}`,
  partnerFlag: `romanceNightMarketPartner_${character}`,
  bondedFlag,
  bondEndingId: `bond-${character}`,
  bondCgId,
  // The numeric collection ID is supplied explicitly so save data remains stable if candidate order changes.
  firstDateCgId,
  // 路径统一走 content/cgAssets 注册表，不再按命名约定现场拼接。
  firstDateCg: cgPath(firstDateCgId),
  firstDateCgAlt: `${characters[character].name}与玩家完成“${dateTitle}”第一次约会的夜市场景`,
  confessionCgId,
  confessionCg: resolveManagedVisual(confessionVisual),
  confessionCgFinal: confessionVisual.final,
  confessionCgAlt: `${characters[character].name}在“${confessionTitle}”告白前等待玩家回答的夜市场景`,
  confessionCgPromptRef: confessionVisual.promptRef,
  firstDateNodeId: `romance-${character}-first-date`,
  confessionNodeId: `romance-${character}-confession`,
  dailyNodeId: `romance-${character}-daily`,
  secondDateNodeId: `romance-${character}-second-date`,
  conflictNodeId: `romance-${character}-conflict`,
  reconciliationNodeId: `romance-${character}-reconciliation`,
  sceneBackgrounds: romanceSceneBackgrounds[character],
  })
}

export const romanceProfiles: Record<RomanceCandidateId, RomanceProfile> = {
  shana: defineProfile('shana', '不谈要塞的晚饭', '属于自己的决定', '一人一半的夜宵', 'cg54-romance-shana-first-date', 'cg66-romance-shana-confession', 'bondedShana', 'cg16-bond-shana'),
  qifu: defineProfile('qifu', '管理员之外的御守', '不靠权限的挽留', '今天只发一条消息', 'cg55-romance-qifu-first-date', 'cg67-romance-qifu-confession', 'bondedQifu', 'cg17-bond-qifu'),
  chenyi: defineProfile('chenyi', '十分钟后送达', '不要求立即回复', '没有已读的散步', 'cg56-romance-chenyi-first-date', 'cg68-romance-chenyi-confession', 'bondedChenyi', 'cg46-bond-chenyi'),
  swordheart: defineProfile('swordheart', '缺勤的约会', '职责以外的上线', '今日任务：休息', 'cg57-romance-swordheart-first-date', 'cg69-romance-swordheart-confession', 'bondedSwordheart', 'cg43-bond-swordheart'),
  heartbeat: defineProfile('heartbeat', '不统计留存率', '没有KPI的位置', '只发给你的名单', 'cg58-romance-heartbeat-first-date', 'cg70-romance-heartbeat-confession', 'bondedHeartbeat', 'cg18-bond-heartbeat'),
  yanqiu: defineProfile('yanqiu', '允许修订的夜市规则', '账本之外的一栏', '两个人的修订会', 'cg59-romance-yanqiu-first-date', 'cg71-romance-yanqiu-confession', 'bondedYanqiu', 'cg19-bond-yanqiu'),
  huayue: defineProfile('huayue', '最后一栏不清点', '与职位无关的同行', '表格没有新增列', 'cg60-romance-huayue-first-date', 'cg72-romance-huayue-confession', 'bondedHuayue', 'cg44-bond-huayue'),
  wenxian: defineProfile('wenxian', '八点亮起的花灯', '只留给你的欢迎回来', '名字还在灯下', 'cg61-romance-wenxian-first-date', 'cg73-romance-wenxian-confession', 'bondedWenxian', 'cg20-bond-wenxian'),
  takemehand: defineProfile('takemehand', '随机延迟的铃声', '不是成员身份', '允许晚两分钟', 'cg62-romance-takemehand-first-date', 'cg74-romance-takemehand-confession', 'bondedTakemehand', 'cg21-bond-takemehand'),
  xilufei: defineProfile('xilufei', '归还权限以前', '私聊里不装陌生', '无害管理员体验券', 'cg63-romance-xilufei-first-date', 'cg75-romance-xilufei-confession', 'bondedXilufei', 'cg22-bond-xilufei'),
  yyt: defineProfile('yyt', '反对意见弹幕赛', '不同意时也喜欢', '恋爱关系反方审阅', 'cg64-romance-yyt-first-date', 'cg76-romance-yyt-confession', 'bondedYyt', 'cg47-bond-yyt'),
  avucii: defineProfile('avucii', '失物招领处的晚饭', '不是交接的最后一行', '明日同行清单', 'cg65-romance-avucii-first-date', 'cg77-romance-avucii-confession', 'bondedAvucii', 'cg49-bond-avucii'),
}

export const romanceEpisodeById: Record<RomanceEpisodeId, RomanceEpisodeDefinition> = Object.fromEntries(
  (Object.values(romanceProfiles) as RomanceProfile[]).flatMap((profile) => ([
    {
      id: `romance-${profile.character}-first-date`,
      character: profile.character,
      kind: 'firstDate' as const,
      nodeId: profile.firstDateNodeId,
      title: profile.dateTitle,
    },
    {
      id: `romance-${profile.character}-confession`,
      character: profile.character,
      kind: 'confession' as const,
      nodeId: profile.confessionNodeId,
      title: profile.confessionTitle,
    },
    {
      id: `romance-${profile.character}-daily`,
      character: profile.character,
      kind: 'daily' as const,
      nodeId: profile.dailyNodeId,
      title: profile.dailyTitle,
    },
    {
      id: profile.secondDateNodeId,
      character: profile.character,
      kind: 'secondDate' as const,
      nodeId: profile.secondDateNodeId,
      title: profile.secondDateTitle,
    },
    {
      id: profile.conflictNodeId,
      character: profile.character,
      kind: 'conflict' as const,
      nodeId: profile.conflictNodeId,
      title: profile.conflictTitle,
    },
    {
      id: profile.reconciliationNodeId,
      character: profile.character,
      kind: 'reconciliation' as const,
      nodeId: profile.reconciliationNodeId,
      title: profile.reconciliationTitle,
    },
  ])).map((episode) => [episode.id, episode]),
)

const isRomanceCandidate = (character: CharacterId | null | undefined): character is RomanceCandidateId =>
  Boolean(character && Object.hasOwn(romanceProfiles, character))

/**
 * Old first-season saves already record a single bonded character as a flag.
 * Until the save is migrated, that flag is treated exactly like activePartner.
 */
export const getEffectiveActivePartner = (state: RomanceAvailabilityState): RomanceCandidateId | null => {
  if (isRomanceCandidate(state.activePartner)) return state.activePartner
  return romanceCandidates.find((character) => Boolean(state.flags[romanceProfiles[character].bondedFlag])) ?? null
}

export const getRomanceAvailability = (
  state: RomanceAvailabilityState,
  character: RomanceCandidateId,
): RomanceAvailability => {
  const profile = romanceProfiles[character]
  const progress = state.relationships[character].progress
  const effectiveActivePartner = getEffectiveActivePartner(state)
  const isCurrentPartner = effectiveActivePartner === character
  const hasOtherPartner = effectiveActivePartner !== null && !isCurrentPartner
  const completedFirstDate = Boolean(state.flags[profile.completionFlag])
  const completedSecondDate = Boolean(state.flags[profile.secondDateFlag])
  const completedConflict = Boolean(state.flags[profile.conflictFlag])
  const completedReconciliation = Boolean(state.flags[profile.reconciliationFlag])

  const canSecondDate = isCurrentPartner && !completedSecondDate
  const canConflict = isCurrentPartner && completedSecondDate && !completedConflict
  const canReconcile = isCurrentPartner && completedConflict && !completedReconciliation
  // Existing partners keep their v1.6 daily replay; the recommended action still prioritizes the new sequence.
  const canDaily = isCurrentPartner
  const canConfess = !effectiveActivePartner
    && completedFirstDate
    && progress >= ROMANCE_CONFESSION_UNLOCK
  const canFirstDate = !effectiveActivePartner
    && !completedFirstDate
    && progress >= ROMANCE_FIRST_DATE_UNLOCK

  const stage: RomanceStage = isCurrentPartner
    ? 'partner'
    : hasOtherPartner
      ? 'partnered-elsewhere'
      : canConfess
        ? 'confessable'
        : completedFirstDate
          ? 'dated'
          : canFirstDate
            ? 'dateable'
            : 'locked'

  return {
    character,
    stage,
    progress,
    effectiveActivePartner,
    canFirstDate,
    canConfess,
    canDaily,
    canSecondDate,
    canConflict,
    canReconcile,
  }
}

export const getRomanceStage = (
  state: RomanceAvailabilityState,
  character: RomanceCandidateId,
): RomanceStage => getRomanceAvailability(state, character).stage

/**
 * Returns the single best action for a character card. Keeping this decision
 * beside the unlock rules prevents the title UI and in-game menu from drifting.
 */
export const getRomanceAction = (
  profileOrCharacter: RomanceProfile | RomanceCandidateId,
  state: RomanceAvailabilityState,
): RomanceAction => {
  const profile = typeof profileOrCharacter === 'string'
    ? romanceProfiles[profileOrCharacter]
    : profileOrCharacter
  const availability = getRomanceAvailability(state, profile.character)

  if (availability.canSecondDate) {
    return {
      enabled: true,
      kind: 'secondDate',
      nodeId: profile.secondDateNodeId,
      title: profile.secondDateTitle,
      reason: '关系确认后的第二次约会已经送达，选择只记录你们的相处方式。',
    }
  }
  if (availability.canConflict) {
    return {
      enabled: true,
      kind: 'conflict',
      nodeId: profile.conflictNodeId,
      title: profile.conflictTitle,
      reason: '第二次约会已经完成，可以面对不会靠一句误会解除的真实分歧。',
    }
  }
  if (availability.canReconcile) {
    return {
      enabled: true,
      kind: 'reconciliation',
      nodeId: profile.reconciliationNodeId,
      title: profile.reconciliationTitle,
      reason: '分歧已经被看见，现在可以共同决定怎样修复以及怎样继续。',
    }
  }
  if (availability.canDaily) {
    return {
      enabled: true,
      kind: 'daily',
      nodeId: profile.dailyNodeId,
      title: profile.dailyTitle,
      reason: '已经确认恋爱关系，可以回到只属于你们的夜市日常。',
    }
  }
  if (availability.canConfess) {
    return {
      enabled: true,
      kind: 'confession',
      nodeId: profile.confessionNodeId,
      title: profile.confessionTitle,
      reason: '第一次约会已经完成，攻略值达到100，可以认真回答彼此。',
    }
  }
  if (availability.canFirstDate) {
    return {
      enabled: true,
      kind: 'firstDate',
      nodeId: profile.firstDateNodeId,
      title: profile.dateTitle,
      reason: '攻略值达到30，幻想夜市的第一次约会邀请已经送达。',
    }
  }

  const reason = availability.stage === 'partnered-elsewhere'
    ? '这个存档已经与另一位角色确认关系；可在其他存档体验这条路线。'
    : availability.stage === 'dated'
      ? `第一次约会已经完成；攻略值达到100后，才能进入正式告白（当前${availability.progress}）。`
      : `攻略值达到30后，第一次约会邀请才会出现（当前${availability.progress}）。`
  return {
    enabled: false,
    kind: 'disabled',
    nodeId: null,
    title: profile.dateTitle,
    reason,
  }
}

/** Completion checks power relationship memories and replay authorization from one source of truth. */
export const isRomanceEpisodeCompleted = (
  episode: RomanceEpisodeDefinition,
  state: RomanceAvailabilityState,
) => {
  const profile = romanceProfiles[episode.character]
  switch (episode.kind) {
    case 'firstDate': return Boolean(state.flags[profile.completionFlag])
    case 'confession': return getEffectiveActivePartner(state) === profile.character
    case 'daily': return Boolean(state.flags[profile.dailyFlag])
    case 'secondDate': return Boolean(state.flags[profile.secondDateFlag])
    case 'conflict': return Boolean(state.flags[profile.conflictFlag])
    case 'reconciliation': return Boolean(state.flags[profile.reconciliationFlag])
  }
}
