import { describe, expect, it } from 'vitest'

import { GOLDEN_SLICE_S2_ENTRY, GOLDEN_SLICE_S2_EXIT } from '@/content/story/goldenSliceS2'
import { goldenSliceS2Checkpoint } from './goldenSliceS2Checkpoint'

describe('事件二黄金样板检查点', () => {
  it('以全新 schema4 内存状态装配固定的三组关系样板', () => {
    const state = goldenSliceS2Checkpoint.buildState({ playerName: '  试玩员  ' })
    expect(goldenSliceS2Checkpoint.seasonId).toBe('season2')
    expect(goldenSliceS2Checkpoint.startNodeId).toBe(GOLDEN_SLICE_S2_ENTRY)
    expect(goldenSliceS2Checkpoint.exitNodeId).toBe(GOLDEN_SLICE_S2_EXIT)
    expect(state.playerName).toBe('试玩员')
    expect(state.schemaVersion).toBe(4)
    expect(state.nodeId).toBe(GOLDEN_SLICE_S2_ENTRY)
    expect(state.route).toBe('org3')
    expect(state.organization).toBe('org3')
    expect(state.activePartner).toBe('heartbeat')
    expect(state.relationships.heartbeat.progress).toBe(100)
    expect('episodeCompletion' in state).toBe(false)
  })
})
