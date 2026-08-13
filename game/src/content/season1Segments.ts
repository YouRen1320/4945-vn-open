/**
 * 第一季「片段跳过」分段表（SOL-PLAN-2.2 §3 连续感方案）。
 *
 * 供标题页「片段跳过前往第二季」入口使用。玩家在 Season1SkipPanel 中：
 *  - 必选一条主路线（决定 summary.route / organization / activePartner 来源）；
 *  - 可勾选若干「已发生片段」（flavor 级 DurableFact），声明上一季发生过哪些事件，
 *    使第二季序章「回望」节点能引用更多上一季情节，提升连续感。
 *
 * 这不是章节回放：跳过档不真正重玩第一季，只按玩家声明构建合法 Season1OutcomeSummary
 * （source=recap），交给 startSeason2 消费。严格不伪造路线结局 ID 或关系层级。
 */

import type { DurableFact } from '@/engine/season2-outcome'
import type { RouteId } from '@/engine/types'
import { organizations } from '@/content/organizations'

export interface Season1Segment {
  /** 稳定 id；与 durableFact 对应。 */
  id: string
  /** 关联路线（用于决定该片段在 UI 上归属哪条路线分组）。 */
  route: RouteId
  /** 玩家可读的片段标题。 */
  label: string
  /** 一句话说明该片段对应第一季哪个事件。 */
  detail: string
  /** 勾选后追加进 summary.durableFacts 的 flavor 级事实。 */
  fact: DurableFact
}

/**
 * 跨路线可选的 flavor 片段。每条片段对应序章「回望」节点散文里引用的一个上一季事件。
 * 玩家勾选表示「这件事在我这条线发生过」，序章据此做散文变体。
 */
export const SEASON1_FLAVOROR_SEGMENTS: Season1Segment[] = [
  {
    id: 'seg-charter',
    route: 'org6',
    label: '手写章程',
    detail: '六组在创立时手写权限章程，桌角墨迹留到了新学期。',
    fact: 's1-charter-written',
  },
  {
    id: 'seg-confession',
    route: 'org3',
    label: '告白转组风波',
    detail: '三组那场告白与转组的风波已经收束，如今没人再提。',
    fact: 's1-confession-transferred',
  },
  {
    id: 'seg-fire-two',
    route: 'org5',
    label: '火2要塞事件',
    detail: '五组打过火2要塞，无论胜负，战报已被转发过太多遍。',
    fact: 's1-fire-two',
  },
]

/** 标题页跳过入口可用的五条活跃路线（与 buildSkipSummary 一致）。 */
export const SKIP_ROUTES: RouteId[] = ['org1', 'org2', 'org3', 'org4', 'org5', 'org6']

/** 按路线取组织名，供跳过档 UI 显示。 */
export const segmentRouteName = (route: RouteId): string =>
  organizations[route]?.name ?? route
