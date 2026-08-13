import type { NodeTarget, StoryNode } from '@/engine/types'

import { prologueNodes } from './prologue'
import { romanceAfterStoryEntryPoints, romanceAfterStoryNodes } from './romanceAfterStory'
import { romanceNightMarketEntryPoints, romanceNightMarketNodes } from './romanceNightMarket'
import { route1Nodes } from './route1'
import { route2Nodes } from './route2'
import { route3Nodes } from './route3'
import { route4Nodes } from './route4'
import { route5Nodes } from './route5'
import { route6Nodes } from './route6'
import { sharedNodes } from './shared'
import { s1xNodes } from './s1x'
import { GOLDEN_SLICE_ENTRY, goldenSliceNodes } from './goldenSlice'
import { GOLDEN_SLICE_S2_ENTRY, goldenSliceS2Nodes } from './goldenSliceS2'
import { S2_AUGUST_ENTRY, s2AugustNodes } from './s2-august'
import { s2PrologueNodes } from './s2-prologue'
import { s2_2_3_Nodes } from './s2-2.3'
import { s2_2_4_Nodes } from './s2-2.4'
import { s2_2_5_Nodes } from './s2-2.5'
import { s2_2_6_Nodes } from './s2-2.6'
import { s2_2_7_Nodes } from './s2-2.7'
import { s2_2_8_Nodes } from './s2-2.8'
import { s2_2_9_Nodes } from './s2-2.9'
import { s3PrologueNodes } from './s3-prologue'
import { s3SeasonNodes } from './s3-season'

export const storyNodes: StoryNode[] = [
  ...prologueNodes,
  ...route1Nodes,
  ...route2Nodes,
  ...route3Nodes,
  ...route4Nodes,
  ...route5Nodes,
  ...route6Nodes,
  ...romanceNightMarketNodes,
  ...romanceAfterStoryNodes,
  ...sharedNodes,
  ...s1xNodes,
  ...goldenSliceNodes,
  ...goldenSliceS2Nodes,
  ...s2AugustNodes,
  ...s2PrologueNodes,
  ...s2_2_3_Nodes,
  ...s2_2_4_Nodes,
  ...s2_2_5_Nodes,
  ...s2_2_6_Nodes,
  ...s2_2_7_Nodes,
  ...s2_2_8_Nodes,
  ...s2_2_9_Nodes,
  ...s3PrologueNodes,
  ...s3SeasonNodes,
]

export const storyEntryNodeIds = [
  'p00-opening',
  // 黄金样板是标题页显式启动的独立沙盒，不从正式序章连入。
  GOLDEN_SLICE_ENTRY,
  GOLDEN_SLICE_S2_ENTRY,
  S2_AUGUST_ENTRY,
  's3-prologue-entry',
  's3-72h-entry',
  's3-commitment-entry',
  's3-midpoint-entry',
  's3-trust-entry',
  's3-crisis-entry',
  's3-finale-entry',
  's3-epilogue-entry',
  ...Object.values(romanceNightMarketEntryPoints).flatMap((entry) => [
    entry.firstDate,
    entry.confession,
    entry.daily,
  ]),
  ...Object.values(romanceAfterStoryEntryPoints).flatMap((entry) => [
    entry.secondDate,
    entry.conflict,
    entry.reconciliation,
  ]),
]

export const storyById = Object.fromEntries(storyNodes.map((node) => [node.id, node])) as Record<string, StoryNode>

const targetIds = (target: NodeTarget | undefined): string[] => {
  if (!target) return []
  if (typeof target === 'string') return [target]
  if (target.type === 'stateVariable') return [target.fallback]
  return [...target.cases.map((item) => item.next), target.fallback]
}

// 合法终点只允许共用片尾与各章节 `-exit` 哨兵；事件一的组织/隐藏结局必须继续汇入片尾。
const isDesignatedTerminal = (id: string) =>
  id === 'credits-first-season' || id.endsWith('-exit')

// 构建期与测试共用的图检查，避免长篇数据剧本出现重复 ID 或断链。
export const validateStoryGraph = () => {
  const errors: string[] = []
  const ids = new Set<string>()

  for (const node of storyNodes) {
    if (ids.has(node.id)) errors.push(`重复节点：${node.id}`)
    ids.add(node.id)
  }

  for (const node of storyNodes) {
    const targets = [
      ...targetIds(node.next),
      ...(node.choices ?? []).flatMap((choice) => targetIds(choice.next)),
      ...targetIds(node.textEntry?.next),
    ]
    for (const target of targets) {
      if (!ids.has(target)) errors.push(`断链：${node.id} -> ${target}`)
    }
    const exits = Number(Boolean(node.next)) + Number(Boolean(node.choices?.length)) + Number(Boolean(node.textEntry))
    if (exits > 1) errors.push(`节点存在多个互斥出口：${node.id}`)
    if (exits === 0 && !isDesignatedTerminal(node.id)) errors.push(`意外终点：${node.id}`)
  }

  return errors
}

const graphErrors = validateStoryGraph()
if (graphErrors.length) throw new Error(`剧情图无效：\n${graphErrors.join('\n')}`)
