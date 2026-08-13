import { storyById } from '@/content/story'
import { GOLDEN_SLICE_S2_ENTRY, GOLDEN_SLICE_S2_EXIT } from '@/content/story/goldenSliceS2'
import { applyEffects, createInitialGameState, enterNode } from '@/engine/state'
import type { ReplayCheckpoint, ReplayContext } from '@/engine/replay'

// 代表性样板固定为三组 + 心跳成瘾，避免把路线矩阵选择塞进内测入口。
const buildGoldenSliceS2State = (context: ReplayContext) => {
  const initial = createInitialGameState({ playerName: context.playerName.trim() || '新手' })
  const configured = applyEffects(initial, [
    { type: 'route', route: 'org3', organization: 'org3', role: 'leader' },
    { type: 'activePartner', character: 'heartbeat' },
    { type: 'relationshipProgress', character: 'heartbeat', value: 100 },
  ])
  const entry = storyById[GOLDEN_SLICE_S2_ENTRY]
  if (!entry) throw new Error(`事件二黄金样板入口不存在：${GOLDEN_SLICE_S2_ENTRY}`)
  return enterNode(configured, entry)
}

export const goldenSliceS2Checkpoint: ReplayCheckpoint = {
  id: 'gs2-golden-slice',
  seasonId: 'season2',
  route: 'org3',
  organization: 'org3',
  chapter: 'act1',
  label: '事件二 · 2.6—2.9 黄金样板',
  startNodeId: GOLDEN_SLICE_S2_ENTRY,
  exitNodeId: GOLDEN_SLICE_S2_EXIT,
  buildState: buildGoldenSliceS2State,
}
