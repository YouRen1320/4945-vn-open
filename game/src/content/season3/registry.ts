import type { SeasonEpisodeDefinition } from '@/content/season2/registry'

/** 事件三 episode 编号与应用版本解耦；每集以显式完成哨兵进入下一集。 */
export const SEASON3_EPISODES: readonly SeasonEpisodeDefinition[] = Object.freeze([
  {
    id: 's3-prologue',
    seasonId: 'season-3',
    index: 0,
    title: '北岸来客',
    isPrologue: true,
    entryNodeId: 's3-prologue-entry',
    completionNodeId: 's3-prologue-exit',
  },
  {
    id: 's3-72h', seasonId: 'season-3', index: 1, title: '七十二小时',
    entryNodeId: 's3-72h-entry', completionNodeId: 's3-72h-exit',
  },
  {
    id: 's3-commitment', seasonId: 'season-3', index: 2, title: '第一次承诺',
    entryNodeId: 's3-commitment-entry', completionNodeId: 's3-commitment-exit',
  },
  {
    id: 's3-midpoint', seasonId: 'season-3', index: 3, title: '旧账中点',
    entryNodeId: 's3-midpoint-entry', completionNodeId: 's3-midpoint-exit',
  },
  {
    id: 's3-trust', seasonId: 'season-3', index: 4, title: '信任重排',
    entryNodeId: 's3-trust-entry', completionNodeId: 's3-trust-exit',
  },
  {
    id: 's3-crisis', seasonId: 'season-3', index: 5, title: '最终立场',
    entryNodeId: 's3-crisis-entry', completionNodeId: 's3-crisis-exit',
  },
  {
    id: 's3-finale', seasonId: 'season-3', index: 6, title: '北岸表决',
    entryNodeId: 's3-finale-entry', completionNodeId: 's3-finale-exit',
  },
  {
    id: 's3-epilogue', seasonId: 'season-3', index: 7, title: '六月三十日',
    entryNodeId: 's3-epilogue-entry', completionNodeId: 's3-epilogue-exit',
  },
])

export const isSeason3Complete = (completion: Record<string, boolean> = {}): boolean => (
  SEASON3_EPISODES.every((episode) => completion[episode.id] === true)
)
