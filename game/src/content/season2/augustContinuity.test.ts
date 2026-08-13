import { describe, expect, it } from 'vitest'

import { createInitialGameState } from '@/engine/state'
import {
  applySeason2AugustContinuity,
  organizationDisplayName,
  organizationDisplaySubtitle,
  season2OrganizationNameForRoute,
} from './augustContinuity'

describe('事件二暑假连续性迁移', () => {
  it('旧事件二存档只补身份和组织名，不改变节点、选择与完成状态', () => {
    const source = createInitialGameState({ playerName: '旧档' })
    source.schemaVersion = 5
    source.nodeId = 's2-2.5-entry'
    source.route = 'org3'
    source.organization = 'org3'
    source.organizationName = '抚梅观清雪'
    source.variables.s2Diverge = 'coalition'
    const completion = { 's2-prologue': true, 's2-2.3': true, 's2-2.4': true }
    Object.assign(source, { episodeCompletion: completion })

    const migrated = applySeason2AugustContinuity(source)
    expect(migrated.nodeId).toBe('s2-2.5-entry')
    expect(migrated.variables.s2Diverge).toBe('coalition')
    expect((migrated as typeof source & { episodeCompletion: Record<string, boolean> }).episodeCompletion).toEqual(completion)
    expect(migrated.organizationName).toBe('虚妄月华')
    expect(migrated.flags.s2AugustContinuityBackfilled).toBe(true)
    expect(migrated.flags.s2AugustLeadershipClarified).toBe(true)
    expect(migrated.variables).toMatchObject({
      s2Org4Leader: '铁碎牙',
      s2Org5Leader: '困醒',
      s2Org5Successor: '困醒',
      s2Org5Coordinator: '剑问白玉京',
    })
    expect(source.organizationName).toBe('抚梅观清雪')
  })

  it('已补过组织名的旧档仍会收到首领身份更正', () => {
    const source = createInitialGameState({ playerName: '早期事件二档' })
    source.flags.s2AugustReorganizationComplete = true
    source.variables.s2Org5Successor = '剑问白玉京'

    const migrated = applySeason2AugustContinuity(source)
    expect(migrated.flags.s2AugustContinuityBackfilled).toBeUndefined()
    expect(migrated.flags.s2AugustLeadershipClarified).toBe(true)
    expect(migrated.variables.s2Org4Leader).toBe('铁碎牙')
    expect(migrated.variables.s2Org5Leader).toBe('困醒')
    expect(migrated.variables.s2Org5Successor).toBe('困醒')
    expect(migrated.variables.s2Org5Coordinator).toBe('剑问白玉京')
  })

  it('迁移幂等且保留六组自定义名称', () => {
    const source = createInitialGameState({ playerName: '六组旧档' })
    source.route = 'org6'
    source.organization = 'org6'
    source.organizationName = '我自己的第六组'
    const once = applySeason2AugustContinuity(source)
    const twice = applySeason2AugustContinuity(once)
    expect(twice).toEqual(once)
    expect(twice.organizationName).toBe('我自己的第六组')
  })

  it('8 月挂牌前后切换组织客户端名称，且不覆盖六组自定义名', () => {
    const state = createInitialGameState({ playerName: '名单测试' })
    state.route = 'org6'
    state.organization = 'org6'
    state.organizationName = '夜航社'
    expect(organizationDisplayName(state, 'org1')).toBe('群雄逐鹿')
    expect(organizationDisplaySubtitle(state, 'org1')).toBe('秩序与代表权')
    expect(organizationDisplayName(state, 'org6')).toBe('夜航社')

    state.flags.s2AugustOrganizationNamesPublished = true
    expect(organizationDisplayName(state, 'org1')).toBe('云山乱清雪')
    expect(organizationDisplayName(state, 'org4')).toBe('镜花水月')
    expect(organizationDisplaySubtitle(state, 'org4')).toBe('首领 · 铁碎牙')
    expect(organizationDisplaySubtitle(state, 'org5')).toBe('首领 · 困醒')
    expect(organizationDisplayName(state, 'org6')).toBe('夜航社')
    expect(organizationDisplaySubtitle(state, 'org6')).toBe('创业、承认与吞并')
  })

  it('档案显示可规范化旧称谓，同时保留六组自定义名称', () => {
    expect(season2OrganizationNameForRoute('org3', '抚梅观清雪')).toBe('虚妄月华')
    expect(season2OrganizationNameForRoute('org6', '夜航社')).toBe('夜航社')
    expect(season2OrganizationNameForRoute(null, '未定组织')).toBe('未定组织')
  })
})
