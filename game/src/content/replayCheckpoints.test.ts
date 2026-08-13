import { describe, expect, it } from 'vitest'

import { storyById } from '@/content/story'
import { resolveTarget } from '@/engine/state'
import type { GameState, NodeTarget, RouteId, StoryNode } from '@/engine/types'

import {
  isCheckpointUnlocked,
  isRouteUnlocked,
  prologueCheckpoint,
  replayCheckpoints,
} from './replayCheckpoints'

const CREDITS_ID = 'credits-first-season'

const candidateTargets = (node: StoryNode): string[] => {
  const ids: string[] = []
  const collect = (target: NodeTarget | undefined) => {
    if (!target) return
    if (typeof target === 'string') {
      ids.push(target)
      return
    }
    if (target.type === 'conditional') {
      target.cases.forEach((c) => collect(c.next))
      collect(target.fallback)
    } else if (target.type === 'stateVariable') {
      collect(target.fallback)
    }
  }
  collect(node.next)
  // 文本入口与每个选项的所有分支都纳入可达性探索（含条件分支），保证不遗漏潜在路径。
  if (node.textEntry) collect(node.textEntry.next)
  ;(node.choices ?? []).forEach((choice) => collect(choice.next))
  return ids
}

// 沿“确定性主轴（node.next 用标准状态解析）+ 全选项分支”做 BFS，
// 只要任一分支能抵达季终节点即认为该检查点存在完整路径。
const reachesCredits = (startId: string, state: GameState): boolean => {
  const visited = new Set<string>()
  const queue: string[] = [startId]
  while (queue.length) {
    const id = queue.shift() as string
    if (id === CREDITS_ID) return true
    if (visited.has(id)) continue
    visited.add(id)
    const node = storyById[id]
    if (!node) continue
    const edges: string[] = []
    if (node.next) edges.push(resolveTarget(node.next, state))
    edges.push(...candidateTargets(node).filter((target) => typeof target === 'string'))
    for (const nextId of edges) {
      if (storyById[nextId]) queue.push(nextId)
    }
  }
  return false
}

describe('2.0 章节回放检查点注册表', () => {
  it('登记恰好 37 个标准入口（1 共通序章 + 六路线各六章节）', () => {
    expect(replayCheckpoints).toHaveLength(37)
  })

  it('id 全局唯一', () => {
    const ids = replayCheckpoints.map((checkpoint) => checkpoint.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('每个检查点的 seasonId 固定为 season1，且 route / organization / chapter 自洽', () => {
    for (const checkpoint of replayCheckpoints) {
      expect(checkpoint.seasonId).toBe('season1')
      if (checkpoint.route === null) {
        expect(checkpoint.organization).toBeNull()
      } else {
        expect(checkpoint.organization).toBe(checkpoint.route)
      }
    }
  })

  it('每个 startNodeId 都存在，且章节与路线字段与剧情节点一致', () => {
    // 剧情节点按路线使用 r2-/r3-/… 前缀（共通序章为 p00-），用来交叉校验入口归属。
    const routeNodePrefix: Record<RouteId, string> = {
      org1: 'r1', org2: 'r2', org3: 'r3', org4: 'r4', org5: 'r5', org6: 'r6',
    }
    for (const checkpoint of replayCheckpoints) {
      const node = storyById[checkpoint.startNodeId]
      expect(node, `起点缺失：${checkpoint.id} -> ${checkpoint.startNodeId}`).toBeDefined()
      if (!node) continue
      expect(node.chapter, `章节不符：${checkpoint.id}`).toBe(checkpoint.chapter)
      if (checkpoint.route !== null) {
        // 路线检查点的入口节点在剧情图中属于对应组织路线（前缀交叉校验）。
        expect(checkpoint.startNodeId.startsWith(routeNodePrefix[checkpoint.route]),
          `入口节点前缀与路线不符：${checkpoint.id}`).toBe(true)
      }
    }
  })

  it('buildState 产出与检查点一致的 route / organization / chapter，且入口可选项有效', () => {
    for (const checkpoint of replayCheckpoints) {
      const state = checkpoint.buildState({ playerName: '回放测试员' })
      expect(state.nodeId).toBe(checkpoint.startNodeId)
      expect(state.route).toBe(checkpoint.route)
      expect(state.organization).toBe(checkpoint.organization)
      expect(state.chapter).toBe(checkpoint.chapter)
      expect(state.processedNodes).toContain(checkpoint.startNodeId)

      const node = storyById[state.nodeId]
      if (!node) throw new Error(`入口节点缺失：${state.nodeId}`)
      if (node.choices?.length) {
        // 至少有选项在当前标准状态下可用，不能因缺少前置 flags 而断路。
        expect(node.choices.some((choice) => !choice.condition)).toBe(true)
      }
      // 主轴 next 必须解析到真实存在的节点，不能因条件/变量缺失而脱靶。
      if (node.next) expect(storyById[resolveTarget(node.next, state)]).toBeDefined()
    }
  })

  it('每个检查点至少存在一条到 credits-first-season 的可达路径', () => {
    for (const checkpoint of replayCheckpoints) {
      const state = checkpoint.buildState({ playerName: '回放测试员' })
      const ok = reachesCredits(checkpoint.startNodeId, state)
      expect(ok, `无法从 ${checkpoint.id} (${checkpoint.startNodeId}) 抵达季终`).toBe(true)
    }
  })

  it('六组沙盒允许覆盖组织名，写入 state.organizationName 但不依赖存档', () => {
    const org6 = replayCheckpoints.find((c) => c.id === 'cp-org6-prologue')!
    const named = org6.buildState({ playerName: '回放测试员', organizationName: '自定义第六组' })
    expect(named.organizationName).toBe('自定义第六组')
    const unnamed = org6.buildState({ playerName: '回放测试员' })
    expect(unnamed.organizationName).toBe('第六组织')
  })

  it('解锁门控：共通序章始终可用，组织路线需对应结局', () => {
    expect(isCheckpointUnlocked(prologueCheckpoint, [])).toBe(true)
    expect(isRouteUnlocked('org2', [])).toBe(false)
    expect(isRouteUnlocked('org2', ['r2-second-pole'])).toBe(true)
    expect(isRouteUnlocked('org2', ['bond-qifu'])).toBe(false)
    const org2 = replayCheckpoints.find((c) => c.id === 'cp-org2-prologue')!
    expect(isCheckpointUnlocked(org2, [])).toBe(false)
    expect(isCheckpointUnlocked(org2, ['r2-second-pole'])).toBe(true)
  })
})
