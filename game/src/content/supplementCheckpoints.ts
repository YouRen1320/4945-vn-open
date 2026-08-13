// 2.1 第一季补遗注册表（SOL-PLAN-2.1.md §6）。
//
// 五篇补遗各一个隔离入口，复用 2.0 通用回放会话（season1-supplement 类型）。
// 每篇在玩家完成对应组织路线任一结局后解锁（与章节回放同一规则）。
// 补遗只声明稳定 id、入口节点和配方；隔离、退出与错误恢复由 @/engine/replay 统一负责。

import { storyById } from '@/content/story'
import { applyEffects, createInitialGameState, enterNode } from '@/engine/state'
import type { ChapterId, OrganizationId, RouteId } from '@/engine/types'
import type { ReplayCheckpoint, ReplayContext } from '@/engine/replay'
import { isRouteUnlocked } from '@/content/replayCheckpoints'

export interface SupplementCheckpoint extends ReplayCheckpoint {
  /** 收束节点 id；抵达 s1x-exit 前由 store 写入收藏 seenNodes，用于面板完成态判定。 */
  doneNodeId: string
}

interface CheckpointSpec {
  route: RouteId
  organization: OrganizationId
  chapter: ChapterId
  startNodeId: string
  label: string
  doneNodeId: string
}

const SUPPLEMENT_SPECS: CheckpointSpec[] = [
  { route: 'org1', organization: 'org1', chapter: 'epilogue', startNodeId: 's1x06-entry', label: '一组 · 第一席为什么是第一席', doneNodeId: 's1x06-close' },
  { route: 'org2', organization: 'org2', chapter: 'epilogue', startNodeId: 's1x01-entry', label: '二组 · 值得跟的人', doneNodeId: 's1x01-close' },
  { route: 'org3', organization: 'org3', chapter: 'epilogue', startNodeId: 's1x02-entry', label: '三组 · 两次转组的人', doneNodeId: 's1x02-close' },
  { route: 'org4', organization: 'org4', chapter: 'epilogue', startNodeId: 's1x03-entry', label: '四组 · 空白账本之前', doneNodeId: 's1x03-close' },
  { route: 'org5', organization: 'org5', chapter: 'epilogue', startNodeId: 's1x04-entry', label: '五组 · 第一天就走了的人', doneNodeId: 's1x04-close' },
  { route: 'org6', organization: 'org6', chapter: 'epilogue', startNodeId: 's1x05-entry', label: '六组 · 第六个为什么', doneNodeId: 's1x05-close' },
]

const supplementId = (route: RouteId): string => `s1x-${route}`

const buildStateFromSpec = (spec: CheckpointSpec) => (context: ReplayContext) => {
  let state = createInitialGameState({ playerName: context.playerName.trim() || '新手' })
  state = applyEffects(state, [{
    type: 'route',
    route: spec.route,
    organization: spec.organization,
    organizationName: context.organizationName?.trim() || undefined,
    role: spec.route === 'org1' ? 'member' : 'leader',
  }])
  const startNode = storyById[spec.startNodeId]
  if (!startNode) throw new Error(`补遗入口节点不存在：${spec.startNodeId}`)
  return enterNode(state, startNode)
}

const makeCheckpoint = (spec: CheckpointSpec): SupplementCheckpoint => ({
  id: supplementId(spec.route),
  seasonId: 'season1',
  route: spec.route,
  organization: spec.organization,
  chapter: spec.chapter,
  label: spec.label,
  startNodeId: spec.startNodeId,
  doneNodeId: spec.doneNodeId,
  buildState: buildStateFromSpec(spec),
})

/** 2.1 五篇第一季补遗入口。 */
export const supplementCheckpoints: SupplementCheckpoint[] = SUPPLEMENT_SPECS.map(makeCheckpoint)

/** 按稳定 id 取补遗检查点。 */
export const supplementCheckpointById = (id: string): SupplementCheckpoint | undefined =>
  supplementCheckpoints.find((checkpoint) => checkpoint.id === id)

/**
 * 某篇补遗是否已解锁：收藏中存在该路线任一组织结局即解锁（与章节回放同一规则，SOL-PLAN §5.4）。
 * 共通序章（route === null）始终可用；补遗逐篇绑定路线。
 */
export const isSupplementUnlocked = (route: RouteId, unlockedEndings: string[]): boolean =>
  isRouteUnlocked(route, unlockedEndings)
