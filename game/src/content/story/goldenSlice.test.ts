import { describe, expect, it } from 'vitest'

import { backgrounds } from '@/content/assets'
import type { NodeTarget } from '@/engine/types'
import { GOLDEN_SLICE_ENTRY, GOLDEN_SLICE_EXIT, goldenSliceNodes } from './goldenSlice'

const targets = (target: NodeTarget | undefined): string[] => {
  if (!target) return []
  if (typeof target === 'string') return [target]
  if (target.type === 'stateVariable') return [target.fallback]
  return [...target.cases.map((item) => item.next), target.fallback]
}

describe('新区开场黄金样板内容图', () => {
  it('使用独立 gs1 命名空间，且所有分支只在样板内部闭合', () => {
    expect(goldenSliceNodes[0]?.id).toBe(GOLDEN_SLICE_ENTRY)
    expect(goldenSliceNodes.at(-1)?.id).toBe(GOLDEN_SLICE_EXIT)

    const ids = goldenSliceNodes.map((node) => node.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.every((id) => id.startsWith('gs1-'))).toBe(true)

    for (const node of goldenSliceNodes) {
      const exits = [
        ...targets(node.next),
        ...(node.choices ?? []).flatMap((choice) => targets(choice.next)),
      ]
      expect(exits.every((id) => id.startsWith('gs1-')), node.id).toBe(true)
      if (node.id !== GOLDEN_SLICE_EXIT) expect(exits.length, node.id).toBeGreaterThan(0)
    }
  })

  it('保留六处玩家选择和七场结构，不写正式结局或收藏效果', () => {
    const choiceNodes = goldenSliceNodes.filter((node) => node.choices?.length)
    expect(choiceNodes.map((node) => node.id)).toEqual([
      'gs1-s1-choice',
      'gs1-s2-choice',
      'gs1-s3-choice',
      'gs1-s4-choice',
      'gs1-s5-choice',
      'gs1-s7-choice',
    ])
    // 聊天界面的选择提示必须由现场角色自然发问，不能渲染成玩家自言自语的气泡。
    expect(choiceNodes.map((node) => node.speaker)).toEqual([
      'mentor',
      'mentor',
      'mentor',
      'saoji',
      'saoji',
      'shana',
    ])
    const choiceNodeById = Object.fromEntries(choiceNodes.map((node) => [node.id, node]))
    expect(choiceNodeById['gs1-s5-choice']).toMatchObject({
      mode: 'chat',
      speaker: 'saoji',
      location: '夏娜所在组织',
    })
    expect(choiceNodeById['gs1-s7-choice']).toMatchObject({
      mode: 'chat',
      speaker: 'shana',
      location: '夏娜所在组织',
    })
    expect(choiceNodes.reduce((count, node) => count + (node.choices?.length ?? 0), 0)).toBe(14)

    const acts = new Set(goldenSliceNodes
      .filter((node) => node.id !== GOLDEN_SLICE_EXIT)
      .map((node) => node.actLabel))
    expect(acts).toEqual(new Set([
      '黄金样板 · 第一场',
      '黄金样板 · 第二场',
      '黄金样板 · 第三场',
      '黄金样板 · 第四场',
      '黄金样板 · 第五场',
      '黄金样板 · 第六场',
      '黄金样板 · 第七场',
    ]))

    const effects = goldenSliceNodes.flatMap((node) => [
      ...(node.onEnter ?? []),
      ...(node.choices ?? []).flatMap((choice) => choice.effects ?? []),
    ])
    expect(effects.some((effect) => effect.type === 'unlockEnding' || effect.type === 'unlockCg')).toBe(false)
  })

  it('只复用现有背景资源，不引入新美术路径', () => {
    for (const node of goldenSliceNodes) {
      expect(backgrounds[node.background], `${node.id}/${node.background}`).toBeDefined()
      expect(node.presentation?.cg, node.id).toBeUndefined()
      expect(node.presentation?.cgPortrait, node.id).toBeUndefined()
    }
  })
})
