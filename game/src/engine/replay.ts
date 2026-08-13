import type { ChapterId, GameState, OrganizationId, RouteId } from './types'

// 2.0 通用回放内核合同：关系回忆与章节沙盒共用同一套隔离会话，
// 避免复制第二套保存/收藏/退出规则。详见 SOL-PLAN-2.0-3.0.md §5。

export type ReplayKind = 'romance' | 'chapter' | 'season1-supplement' | 'golden-slice' | 'season2' | 'season3'
export type ReplayOrigin = 'title' | 'game-snapshot'

export interface ReplayPolicy {
  writeSave: boolean
  mergeCollection: boolean
  grantRewards: boolean
  allowNestedReplay: boolean
}

export interface ReplaySession {
  kind: ReplayKind
  origin: ReplayOrigin
  /** 进入回放前的游戏状态快照；game-snapshot 来源在退出时精确恢复。 */
  snapshot: GameState | null
  /** 独立样板各自声明结束哨兵，避免与正式季/集完成节点耦合。 */
  exitNodeId?: string
}

export interface ReplayContext {
  playerName: string
  /** 六组沙盒允许在进入前填写本次使用的组织名；不写入任何存档。 */
  organizationName?: string
}

export interface ReplayCheckpoint {
  id: string
  seasonId: 'season1' | 'season2'
  route: RouteId | null
  organization: OrganizationId | null
  chapter: ChapterId
  label: string
  startNodeId: string
  /** 仅纯沙盒样板需要；抵达后直接丢弃内存状态。 */
  exitNodeId?: string
  buildState(context: ReplayContext): GameState
}

/** 2.0 两类回放都是纯沙盒：不写存档、不合并收藏、不发奖励、不允许嵌套回放。 */
export const policyForKind = (_kind: ReplayKind): ReplayPolicy => ({
  writeSave: false,
  mergeCollection: false,
  grantRewards: false,
  allowNestedReplay: false,
})
