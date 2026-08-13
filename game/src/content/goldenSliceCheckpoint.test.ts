import { describe, expect, it } from 'vitest'

import { GOLDEN_SLICE_ENTRY } from '@/content/story/goldenSlice'
import { goldenSliceCheckpoint } from './goldenSliceCheckpoint'

describe('黄金样板检查点', () => {
  it('从全新共通状态进入唯一的 gs1 沙盒入口', () => {
    expect(goldenSliceCheckpoint.id).toBe('gs1-golden-slice')
    expect(goldenSliceCheckpoint.startNodeId).toBe(GOLDEN_SLICE_ENTRY)
    expect(goldenSliceCheckpoint.route).toBeNull()
    expect(goldenSliceCheckpoint.organization).toBeNull()

    const state = goldenSliceCheckpoint.buildState({ playerName: '  试玩员  ' })
    expect(state.playerName).toBe('试玩员')
    expect(state.nodeId).toBe(GOLDEN_SLICE_ENTRY)
    expect(state.route).toBeNull()
    expect(state.organization).toBeNull()
    expect(state.role).toBe('none')
    expect(state.processedNodes).toContain(GOLDEN_SLICE_ENTRY)
  })

  it('空白玩家名使用沙盒默认名', () => {
    expect(goldenSliceCheckpoint.buildState({ playerName: '   ' }).playerName).toBe('新手')
  })
})
