// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'

import { romanceProfiles } from '@/content/romanceProfiles'
import { storyById } from '@/content/story'
import { createInitialGameState } from '@/engine/state'

import {
  createScenePreloadPlan,
  preloadCurrentAndNextScenes,
  resetScenePreloadCacheForTests,
} from './preload'

class RecordedImage {
  static requests: Array<{ url: string; priority: string }> = []
  fetchPriority = 'auto'
  decoding = 'auto'

  set src(url: string) {
    RecordedImage.requests.push({ url, priority: this.fetchPriority })
  }
}

afterEach(() => {
  RecordedImage.requests = []
  resetScenePreloadCacheForTests()
  vi.unstubAllGlobals()
})

describe('场景资源预加载', () => {
  it('按当前帧与一跳可达节点生成去重优先级计划', () => {
    const state = createInitialGameState({ playerName: '测试玩家' })
    const node = storyById['p01a-growth-reply']!
    const plan = createScenePreloadPlan(node, state)

    expect(plan.current.length).toBeGreaterThan(0)
    expect(plan.next.length).toBeGreaterThan(0)
    expect(plan.next.some((url) => plan.current.includes(url))).toBe(false)
  })

  it('预览请求已生成的最终文件，但不提前请求待生成的最终文件', () => {
    vi.stubGlobal('Image', RecordedImage as unknown as typeof Image)

    // shana 的告白 CG 已通过 1.8 接入，预加载应直接请求最终文件。
    const readyProfile = romanceProfiles.shana
    const readyState = createInitialGameState({ playerName: '测试玩家' })
    const readyNode = storyById[`${readyProfile.confessionNodeId}-accepted`]!
    const readyPlan = preloadCurrentAndNextScenes(readyNode, readyState)
    expect(readyPlan.current).toContain(readyProfile.confessionCgFinal)
    expect(RecordedImage.requests).toContainEqual({ url: readyProfile.confessionCgFinal, priority: 'high' })

    // heartbeat 的告白 CG 也已通过 1.8 接入，预加载同样直接请求最终文件。
    const heartbeatProfile = romanceProfiles.heartbeat
    const heartbeatState = createInitialGameState({ playerName: '测试玩家' })
    const heartbeatNode = storyById[`${heartbeatProfile.confessionNodeId}-accepted`]!
    const heartbeatPlan = preloadCurrentAndNextScenes(heartbeatNode, heartbeatState)
    expect(heartbeatPlan.current).toContain(heartbeatProfile.confessionCgFinal)
    expect(heartbeatPlan.current).toContain(heartbeatProfile.confessionCg)
    expect(RecordedImage.requests).toContainEqual({ url: heartbeatProfile.confessionCgFinal, priority: 'high' })
  })
})
