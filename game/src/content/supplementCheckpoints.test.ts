import { describe, expect, it } from 'vitest'

import { storyById } from '@/content/story'
import {
  isSupplementUnlocked,
  supplementCheckpointById,
  supplementCheckpoints,
} from '@/content/supplementCheckpoints'

// 路线 → 补遗篇号映射：org2→01、org3→02、org4→03、org5→04、org6→05。
const routeToArticle: Record<string, string> = {
  org1: '06',
  org2: '01',
  org3: '02',
  org4: '03',
  org5: '04',
  org6: '05',
}

describe('2.1 第一季补遗注册表', () => {
  it('恰好六篇，稳定 id 为 s1x-org1..org6，doneNodeId 指向对应收束节点', () => {
    expect(supplementCheckpoints).toHaveLength(6)
    expect(supplementCheckpoints.map((c) => c.id))
      .toEqual(['s1x-org1', 's1x-org2', 's1x-org3', 's1x-org4', 's1x-org5', 's1x-org6'])

    for (const c of supplementCheckpoints) {
      const article = routeToArticle[c.route as string]
      expect(c.startNodeId).toBe(`s1x${article}-entry`)
      expect(c.doneNodeId).toBe(`s1x${article}-close`)
      // 入口与收束节点必须真实存在于剧情图，且收束确实指回返回哨兵。
      expect(storyById[c.startNodeId]).toBeDefined()
      expect(storyById[c.doneNodeId]).toBeDefined()
      expect(storyById[c.doneNodeId]?.next).toBe('s1x-exit')
    }
  })

  it('buildState 注入 route/org/chapter 并进入正确入口（隔离沙盒，不依赖旧存档）', () => {
    for (const c of supplementCheckpoints) {
      const state = c.buildState({ playerName: '补遗测试' })
      expect(state.route).toBe(c.route)
      expect(state.organization).toBe(c.organization)
      expect(state.nodeId).toBe(c.startNodeId)
      expect(state.chapter).toBe(c.chapter)
    }
  })

  it('解锁规则与章节回放一致：收藏存在该路线任一结局即解锁', () => {
    expect(isSupplementUnlocked('org2', ['r2-second-pole', 'r3-alliance-hub'])).toBe(true)
    expect(isSupplementUnlocked('org3', ['r3-alliance-hub'])).toBe(true)
    expect(isSupplementUnlocked('org6', ['r6-sixth-seat'])).toBe(true)
    // 不含该路线结局 → 未解锁
    expect(isSupplementUnlocked('org2', ['r3-alliance-hub'])).toBe(false)
    expect(isSupplementUnlocked('org5', [])).toBe(false)
  })

  it('byId 可取回每篇，且 doneNodeId 与注册表一致', () => {
    for (const c of supplementCheckpoints) {
      const got = supplementCheckpointById(c.id)
      expect(got).toBeDefined()
      expect(got?.doneNodeId).toBe(c.doneNodeId)
      expect(got?.route).toBe(c.route)
    }
    expect(supplementCheckpointById('s1x-nonexistent')).toBeUndefined()
  })
})
