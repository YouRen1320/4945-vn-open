// 2.0 标准检查点注册表（SOL-PLAN-2.0-3.0.md §5.2 / §5.3）。
//
// 31 个标准入口：1 个共通序章 + 五条组织路线各六个章节。
// 每个检查点只声明稳定 id、入口节点和相对初始状态的显式配方；
// 通用回放会话负责隔离、退出与错误恢复（见 @/engine/replay）。
//
// 配方规则（方案 B）：从 createInitialGameState 构建，先按 route 显式设好
// route / organization / organizationName / role（序章除外），再 enterNode 入口节点，
// 由节点的 onEnter 与 chapter/date 字段补齐本幕状态。绝不粘贴完整旧存档，
// 也不依赖玩家过去的精确选择——这是“标准状态”沙盒，不是个人历史复原。

import { storyById } from '@/content/story'
import { isSeason1RouteEnding } from '@/content/endingRegistry'
import { applyEffects, createInitialGameState, enterNode } from '@/engine/state'
import type { ChapterId, OrganizationId, RouteId } from '@/engine/types'
import type { ReplayCheckpoint, ReplayContext } from '@/engine/replay'

interface CheckpointSpec {
  route: RouteId | null
  organization: OrganizationId | null
  chapter: ChapterId
  startNodeId: string
  label: string
}

const PROLOGUE: CheckpointSpec = {
  route: null,
  organization: null,
  chapter: 'prologue',
  startNodeId: 'p00-opening',
  label: '共通 · 序章',
}

const ROUTE_CHECKPOINTS: CheckpointSpec[] = [
  // 一组
  { route: 'org1', organization: 'org1', chapter: 'prologue', startNodeId: 'r1-00-joined', label: '一组 · 路线序章' },
  { route: 'org1', organization: 'org1', chapter: 'act1', startNodeId: 'r1-03-world-enemy', label: '一组 · 第一幕' },
  { route: 'org1', organization: 'org1', chapter: 'act2', startNodeId: 'r1-05-fortress-hint', label: '一组 · 第二幕' },
  { route: 'org1', organization: 'org1', chapter: 'act3', startNodeId: 'r1-09-fortress-day', label: '一组 · 第三幕' },
  { route: 'org1', organization: 'org1', chapter: 'act4', startNodeId: 'r1-11-outsider-arrives', label: '一组 · 第四幕' },
  { route: 'org1', organization: 'org1', chapter: 'epilogue', startNodeId: 'r1-14-epilogue', label: '一组 · 尾声' },
  // 二组
  { route: 'org2', organization: 'org2', chapter: 'prologue', startNodeId: 'r2-00-founded', label: '二组 · 路线序章' },
  { route: 'org2', organization: 'org2', chapter: 'act1', startNodeId: 'r2-03-normal-chat', label: '二组 · 第一幕' },
  { route: 'org2', organization: 'org2', chapter: 'act2', startNodeId: 'r2-16-xilufei-arrives', label: '二组 · 第二幕' },
  { route: 'org2', organization: 'org2', chapter: 'act3', startNodeId: 'r2-23-war-letter', label: '二组 · 第三幕' },
  { route: 'org2', organization: 'org2', chapter: 'act4', startNodeId: 'r2-28-remnants', label: '二组 · 第四幕' },
  { route: 'org2', organization: 'org2', chapter: 'epilogue', startNodeId: 'r2-28b-chenyi-last-online', label: '二组 · 尾声' },
  // 三组
  { route: 'org3', organization: 'org3', chapter: 'prologue', startNodeId: 'r3-00-founded', label: '三组 · 路线序章' },
  { route: 'org3', organization: 'org3', chapter: 'act1', startNodeId: 'r3-03-incomplete-screenshot', label: '三组 · 第一幕' },
  { route: 'org3', organization: 'org3', chapter: 'act2', startNodeId: 'r3-07-group-explosion', label: '三组 · 第二幕' },
  { route: 'org3', organization: 'org3', chapter: 'act3', startNodeId: 'r3-11-jiangjinjiu-arrives', label: '三组 · 第三幕' },
  { route: 'org3', organization: 'org3', chapter: 'act4', startNodeId: 'r3-16a-oguri-gaobai-arrive', label: '三组 · 第四幕' },
  { route: 'org3', organization: 'org3', chapter: 'epilogue', startNodeId: 'r3-20-chenyi-offline', label: '三组 · 尾声' },
  // 四组
  { route: 'org4', organization: 'org4', chapter: 'prologue', startNodeId: 'r4-00-founded', label: '四组 · 路线序章' },
  { route: 'org4', organization: 'org4', chapter: 'act1', startNodeId: 'r4-02-muted-applicant', label: '四组 · 第一幕' },
  { route: 'org4', organization: 'org4', chapter: 'act2', startNodeId: 'r4-07-fixed-facts', label: '四组 · 第二幕' },
  { route: 'org4', organization: 'org4', chapter: 'act3', startNodeId: 'r4-11-alliance-offer', label: '四组 · 第三幕' },
  { route: 'org4', organization: 'org4', chapter: 'act4', startNodeId: 'r4-15-reward-drops', label: '四组 · 第四幕' },
  { route: 'org4', organization: 'org4', chapter: 'epilogue', startNodeId: 'r4-22-sixth-falls', label: '四组 · 尾声' },
  // 五组
  { route: 'org5', organization: 'org5', chapter: 'prologue', startNodeId: 'r5-00-founded', label: '五组 · 路线序章' },
  { route: 'org5', organization: 'org5', chapter: 'act1', startNodeId: 'r5-04-world-enemy', label: '五组 · 第一幕' },
  { route: 'org5', organization: 'org5', chapter: 'act2', startNodeId: 'r5-07-two-groups', label: '五组 · 第二幕' },
  { route: 'org5', organization: 'org5', chapter: 'act3', startNodeId: 'r5-10-fire-two-proposal', label: '五组 · 第三幕' },
  { route: 'org5', organization: 'org5', chapter: 'act4', startNodeId: 'r5-15-merger-offer', label: '五组 · 第四幕' },
  { route: 'org5', organization: 'org5', chapter: 'epilogue', startNodeId: 'r5-19-gaobai-moves-again', label: '五组 · 尾声' },
  // 六组
  { route: 'org6', organization: 'org6', chapter: 'prologue', startNodeId: 'r6-00-founded', label: '六组 · 路线序章' },
  { route: 'org6', organization: 'org6', chapter: 'act1', startNodeId: 'r6-03-world-enemy', label: '六组 · 第一幕' },
  { route: 'org6', organization: 'org6', chapter: 'act2', startNodeId: 'r6-06-two-groups', label: '六组 · 第二幕' },
  { route: 'org6', organization: 'org6', chapter: 'act3', startNodeId: 'r6-10-fortress-trade', label: '六组 · 第三幕' },
  { route: 'org6', organization: 'org6', chapter: 'act4', startNodeId: 'r6-13-yyt-qifu', label: '六组 · 第四幕' },
  { route: 'org6', organization: 'org6', chapter: 'epilogue', startNodeId: 'r6-21-qifu-night', label: '六组 · 尾声' },
]

const checkpointId = (route: RouteId | null, chapter: ChapterId): string => (
  route === null ? 'cp-common-prologue' : `cp-${route}-${chapter}`
)

const buildStateFromSpec = (spec: CheckpointSpec) => (context: ReplayContext) => {
  let state = createInitialGameState({ playerName: context.playerName.trim() || '新手' })
  if (spec.route && spec.organization) {
    state = applyEffects(state, [{
      type: 'route',
      route: spec.route,
      organization: spec.organization,
      // 六组沙盒允许在进入前填写本次使用的组织名；其它路线回落到组织规范名。
      organizationName: context.organizationName?.trim() || undefined,
      // 一组首领固定为祈福（canon基线），玩家以成员身份加入。
      role: spec.route === 'org1' ? 'member' : 'leader',
    }])
  }
  const startNode = storyById[spec.startNodeId]
  if (!startNode) throw new Error(`检查点 ${spec.startNodeId} 的入口节点不存在`)
  return enterNode(state, startNode)
}

const makeCheckpoint = (spec: CheckpointSpec): ReplayCheckpoint => ({
  id: checkpointId(spec.route, spec.chapter),
  seasonId: 'season1',
  route: spec.route,
  organization: spec.organization,
  chapter: spec.chapter,
  label: spec.label,
  startNodeId: spec.startNodeId,
  buildState: buildStateFromSpec(spec),
})

/** 2.0 全部 31 个标准章节回放入口，按序章优先、再按路线/章节顺序排列。 */
export const replayCheckpoints: ReplayCheckpoint[] = [
  makeCheckpoint(PROLOGUE),
  ...ROUTE_CHECKPOINTS.map(makeCheckpoint),
]

/** 共通序章检查点，标题页始终可用（不绑定某条组织路线）。 */
export const prologueCheckpoint: ReplayCheckpoint =
  replayCheckpoints.find((checkpoint) => checkpoint.id === 'cp-common-prologue')!

/** 按稳定 id 取检查点；章节选择 UI 与测试都用它定位。 */
export const replayCheckpointById = (id: string): ReplayCheckpoint | undefined =>
  replayCheckpoints.find((checkpoint) => checkpoint.id === id)

/**
 * 某条组织路线是否已解锁：收藏中存在该路线任一组织结局即解锁（SOL-PLAN §5.4）。
 * 共通序章（route === null）始终可用。
 */
export const isRouteUnlocked = (route: RouteId, unlockedEndings: string[]): boolean => (
  unlockedEndings.some((endingId) => isSeason1RouteEnding(endingId, route))
)

export const isCheckpointUnlocked = (
  checkpoint: ReplayCheckpoint,
  unlockedEndings: string[],
): boolean => (
  checkpoint.route === null || isRouteUnlocked(checkpoint.route, unlockedEndings)
)
