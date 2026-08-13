import { describe, expect, it } from 'vitest'

import { GOLDEN_SLICE_S2_ENTRY, GOLDEN_SLICE_S2_EXIT, goldenSliceS2Nodes } from './goldenSliceS2'

const targets = (target: typeof goldenSliceS2Nodes[number]['next']): string[] => {
  if (!target) return []
  if (typeof target === 'string') return [target]
  if (target.type === 'stateVariable' || target.type === 'random') return [target.fallback]
  return [...target.cases.map((item) => item.next), target.fallback]
}

describe('事件二黄金样板剧情图', () => {
  it('完全隔离在 gs2 命名空间且只以自身哨兵结束', () => {
    const ids = goldenSliceS2Nodes.map((node) => node.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.every((id) => id.startsWith('gs2-'))).toBe(true)
    expect(ids).toContain(GOLDEN_SLICE_S2_ENTRY)
    expect(ids).toContain(GOLDEN_SLICE_S2_EXIT)
    for (const node of goldenSliceS2Nodes) {
      const outgoing = [
        ...targets(node.next),
        ...(node.choices ?? []).flatMap((choice) => targets(choice.next)),
      ]
      expect(outgoing.every((id) => id.startsWith('gs2-'))).toBe(true)
      expect(node.onEnter?.some((effect) => ['unlockEnding', 'unlockCg', 'archiveSeason2Outcome'].includes(effect.type)) ?? false).toBe(false)
    }
  })

  it('覆盖 2.6 到 2.9 四个连续场次', () => {
    const labels = new Set(goldenSliceS2Nodes.map((node) => node.actLabel))
    expect(labels).toEqual(new Set([
      '事件二样板 · 2.6', '事件二样板 · 2.7', '事件二样板 · 2.8',
      '事件二样板 · 2.9', '事件二样板 · 完成',
    ]))
  })
})
