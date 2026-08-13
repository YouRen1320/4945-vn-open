import { cloneGameState } from '@/engine/state'
import { organizations } from '@/content/organizations'

import type { GameState, OrganizationId, RouteId } from '@/engine/types'

/** 8 月重组后的稳定组织称谓；route id 保持不变，避免破坏既有存档和结局合同。 */
export const SEASON2_ORGANIZATION_NAMES: Partial<Record<RouteId, string>> = {
  org1: '云山乱清雪',
  org2: '云梦仙踪',
  org3: '虚妄月华',
  org4: '镜花水月',
  org5: '心之所向',
}

export const SEASON2_ORGANIZATION_LEADERS: Partial<Record<RouteId, string>> = {
  org1: '心跳成瘾',
  org2: '夏娜',
  org3: '路人K',
  org4: '铁碎牙',
  org5: '困醒',
}

/** 只规范化玩家可见名称，不改历史档案里参与 digest 的原始 organizationName。 */
export const season2OrganizationNameForRoute = (route: RouteId | null, fallback: string) => (
  (route && SEASON2_ORGANIZATION_NAMES[route]) || fallback
)

/** 兼容已停在桥接篇中途的旧存档：这些节点可能在名单标记加入前就已处理。 */
export const season2OrganizationNamesPublished = (state: GameState) => Boolean(
  state.flags.s2AugustOrganizationNamesPublished
  || state.flags.s2AugustReorganizationComplete
  || (state.nodeId.startsWith('s2-august-') && state.date >= '2026-08-02'),
)

/**
 * 组织客户端与状态页共用同一套时点规则：8 月挂牌前显示事件一名称，
 * 挂牌后显示新名称；六组始终保留玩家自定义名。
 */
export const organizationDisplayName = (state: GameState, id: OrganizationId) => {
  const namesPublished = season2OrganizationNamesPublished(state)
  if (namesPublished && SEASON2_ORGANIZATION_NAMES[id]) return SEASON2_ORGANIZATION_NAMES[id]!
  if (id === state.organization && state.organizationName) return state.organizationName
  return organizations[id].name
}

/** 重组后用确认过的首领身份替代事件一主题，避免新组名继续挂旧组织说明。 */
export const organizationDisplaySubtitle = (state: GameState, id: OrganizationId) => {
  const leader = season2OrganizationNamesPublished(state) ? SEASON2_ORGANIZATION_LEADERS[id] : undefined
  return leader ? `首领 · ${leader}` : organizations[id].theme
}

/**
 * 为已经进入事件二的旧 v5 存档补齐 8 月固定史实。
 * 这里只迁移身份与称谓，不改玩家选择、数值、节点或 episode 完成状态。
 */
export const applySeason2AugustContinuity = <T extends GameState>(source: T): T => {
  const state = cloneGameState(source) as T
  if (!state.flags.s2AugustReorganizationComplete) {
    state.flags.s2AugustReorganizationComplete = true
    state.flags.s2AugustOrganizationNamesPublished = true
    state.flags.s2AugustContinuityBackfilled = true
    state.flags.s2QifuLeftOrg1 = true
    state.flags.s2HeartbeatLeadsOrg1 = true
    state.flags.s2PasserKTransferredOrg3 = true
    state.flags.s2DaiguTransferredOrg3 = true
    state.flags.s2PasserKLeadsOrg3 = true
    state.flags.s2WenxianRetired = true

    state.variables.s2Org1Name = SEASON2_ORGANIZATION_NAMES.org1!
    state.variables.s2Org2Name = SEASON2_ORGANIZATION_NAMES.org2!
    state.variables.s2Org3Name = SEASON2_ORGANIZATION_NAMES.org3!
    state.variables.s2Org4Name = SEASON2_ORGANIZATION_NAMES.org4!
    state.variables.s2Org5Name = SEASON2_ORGANIZATION_NAMES.org5!
    state.variables.s2Org1Leader = '心跳成瘾'
    state.variables.s2Org2Leader = '夏娜'
    state.variables.s2Org3Leader = '路人K'

    const migratedName = state.route ? SEASON2_ORGANIZATION_NAMES[state.route] : undefined
    if (migratedName) state.organizationName = migratedName
  }

  // 早期事件二档把日常负责人误当成五组继任首领；此补丁只校正身份字段。
  if (!state.flags.s2AugustLeadershipClarified) {
    state.flags.s2AugustLeadershipClarified = true
    state.variables.s2Org4Leader = '铁碎牙'
    state.variables.s2Org5Leader = '困醒'
    state.variables.s2Org5Successor = '困醒'
    state.variables.s2Org5Coordinator = '剑问白玉京'
  }
  return state
}
