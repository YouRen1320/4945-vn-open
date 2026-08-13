import { storyById } from '@/content/story'
import { GOLDEN_SLICE_ENTRY, GOLDEN_SLICE_EXIT } from '@/content/story/goldenSlice'
import { createInitialGameState, enterNode } from '@/engine/state'
import type { ReplayCheckpoint, ReplayContext } from '@/engine/replay'

// 黄金样板始终从全新内存状态启动，不读取自动档，也不继承正式路线变量。
const buildGoldenSliceState = (context: ReplayContext) => {
  const initial = createInitialGameState({ playerName: context.playerName.trim() || '新手' })
  const entry = storyById[GOLDEN_SLICE_ENTRY]
  if (!entry) throw new Error(`黄金样板入口不存在：${GOLDEN_SLICE_ENTRY}`)
  return enterNode(initial, entry)
}

export const goldenSliceCheckpoint: ReplayCheckpoint = {
  id: 'gs1-golden-slice',
  seasonId: 'season1',
  route: null,
  organization: null,
  chapter: 'prologue',
  label: '新区开场 · 七场黄金样板',
  startNodeId: GOLDEN_SLICE_ENTRY,
  exitNodeId: GOLDEN_SLICE_EXIT,
  buildState: buildGoldenSliceState,
}
