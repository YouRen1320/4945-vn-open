import { describe, expect, it } from 'vitest'

import {
  EMPTY_EPISODE_REGISTRY,
  EMPTY_PAYOFF_LEDGER,
} from '@/content/season2/fixtures'
import {
  SEASON2_EPISODES,
  SEASON2_PAYOFF_LEDGER,
  findEpisodeById,
  findPayoff,
  findPayoffsForEpisode,
  findPrologue,
  isChoicePayoffLedgerEntry,
  isEpisodeComplete,
  isSeason2Complete,
  isInheritanceLevel,
  isSeasonEpisodeDefinition,
  markEpisodeComplete,
  registerEpisode,
  registerPayoff,
  type ChoicePayoffLedgerEntry,
  type SeasonEpisodeDefinition,
} from '@/content/season2/registry'

const prologue: SeasonEpisodeDefinition = {
  id: 's2-prologue',
  seasonId: 'season-2',
  index: 0,
  title: '共通序章',
  isPrologue: true,
  entryNodeId: 's2-august-entry',
  completionNodeId: 's2-prologue-done',
}

const payoff: ChoicePayoffLedgerEntry = {
  episodeId: 's2-prologue',
  nodeId: 's2-prologue-choice',
  choiceId: 's2-prologue-c1',
  immediateResult: '你决定先稳住内部。',
  inheritanceLevel: 'flavor',
  inherits: [],
}

describe('2.2 集注册表', () => {
  it('空注册表为冻结数组', () => {
    expect(Array.isArray(EMPTY_EPISODE_REGISTRY)).toBe(true)
    expect(EMPTY_PAYOFF_LEDGER).toEqual([])
  })

  it('registerEpisode 追加且不重复 id', () => {
    const one = registerEpisode(EMPTY_EPISODE_REGISTRY, prologue)
    expect(one).toHaveLength(1)
    const two = registerEpisode(one, prologue)
    expect(two).toHaveLength(1)
  })

  it('findEpisodeById / findPrologue 定位', () => {
    const eps = registerEpisode(EMPTY_EPISODE_REGISTRY, prologue)
    expect(findEpisodeById(eps, 's2-prologue')?.title).toBe('共通序章')
    expect(findPrologue(eps)?.id).toBe('s2-prologue')
    expect(findPrologue(EMPTY_EPISODE_REGISTRY)).toBeNull()
  })

  it('episode completion 显式标记，与看文本无关', () => {
    const completion = markEpisodeComplete({}, prologue)
    expect(isEpisodeComplete(completion, prologue)).toBe(true)
    expect(isEpisodeComplete({}, prologue)).toBe(false)
  })

  it('整季完成必须由全部已注册 episode 的显式标记共同构成', () => {
    const complete = Object.fromEntries(SEASON2_EPISODES.map((episode) => [episode.id, true]))
    expect(isSeason2Complete(complete)).toBe(true)
    expect(isSeason2Complete({ ...complete, 's2-2.9': false })).toBe(false)
    expect(isSeason2Complete()).toBe(false)
  })

  it('isSeasonEpisodeDefinition 守卫', () => {
    expect(isSeasonEpisodeDefinition(prologue)).toBe(true)
    expect(isSeasonEpisodeDefinition({ ...prologue, index: -1 })).toBe(false)
    expect(isSeasonEpisodeDefinition(null)).toBe(false)
  })

  it('已注册 episode 含 2.3（序章 index=0，2.3 index=1）', () => {
    const prologue = findPrologue(SEASON2_EPISODES)
    expect(prologue?.index).toBe(0)
    const ep23 = findEpisodeById(SEASON2_EPISODES, 's2-2.3')
    expect(ep23).not.toBeNull()
    expect(ep23?.index).toBe(1)
    expect(ep23?.isPrologue).toBeUndefined()
    expect(ep23?.entryNodeId).toBe('s2-2.3-entry')
    expect(ep23?.completionNodeId).toBe('s2-2.3-exit')
  })

  it('2.3 两个选择的回报已登记且继承合法 durableFact', () => {
    const entries = findPayoffsForEpisode(SEASON2_PAYOFF_LEDGER, 's2-2.3')
    expect(entries).toHaveLength(2)
    const assert = findPayoff(SEASON2_PAYOFF_LEDGER, 's2-2.3', 's2-2.3-assert')
    const balance = findPayoff(SEASON2_PAYOFF_LEDGER, 's2-2.3', 's2-2.3-balance')
    expect(assert?.inherits).toContain('s1-route-complete')
    expect(balance?.inherits).toContain('s1-cross-org-tie')
  })

  it('已注册 episode 含 2.4（index=2，前置 2.3）', () => {
    const ep24 = findEpisodeById(SEASON2_EPISODES, 's2-2.4')
    expect(ep24?.index).toBe(2)
    expect(ep24?.entryNodeId).toBe('s2-2.4-entry')
    expect(ep24?.completionNodeId).toBe('s2-2.4-exit')
    const previous = SEASON2_EPISODES.find((e) => e.index === ep24!.index - 1)
    expect(previous?.id).toBe('s2-2.3')
  })

  it('2.4 实质分歧两个选项均 structural 且继承合法 durableFact', () => {
    const entries = findPayoffsForEpisode(SEASON2_PAYOFF_LEDGER, 's2-2.4')
    expect(entries).toHaveLength(2)
    expect(findPayoff(SEASON2_PAYOFF_LEDGER, 's2-2.4', 's2-2.4-confront')?.inherits).toContain('s1-route-complete')
    expect(findPayoff(SEASON2_PAYOFF_LEDGER, 's2-2.4', 's2-2.4-coalition')?.inherits).toContain('s1-cross-org-tie')
  })

  it('已注册 episode 含 2.5（index=3，前置 2.4），2.5 回应选择已登记', () => {
    const ep25 = findEpisodeById(SEASON2_EPISODES, 's2-2.5')
    expect(ep25?.index).toBe(3)
    expect(ep25?.completionNodeId).toBe('s2-2.5-exit')
    const previous = SEASON2_EPISODES.find((e) => e.index === ep25!.index - 1)
    expect(previous?.id).toBe('s2-2.4')
    const entries = findPayoffsForEpisode(SEASON2_PAYOFF_LEDGER, 's2-2.5')
    expect(entries).toHaveLength(2)
    expect(findPayoff(SEASON2_PAYOFF_LEDGER, 's2-2.5', 's2-2.5-guard')?.inherits).toContain('s1-route-complete')
    expect(findPayoff(SEASON2_PAYOFF_LEDGER, 's2-2.5', 's2-2.5-pivot')?.inherits).toContain('s1-cross-org-tie')
  })
})

describe('2.2 选择回报账本', () => {
  it('正式账本包含暑假桥接篇后的 35 个唯一选择', () => {
    expect(SEASON2_PAYOFF_LEDGER).toHaveLength(35)
    expect(new Set(SEASON2_PAYOFF_LEDGER.map((entry) => `${entry.episodeId}:${entry.choiceId}`)).size).toBe(35)
    expect(SEASON2_PAYOFF_LEDGER.every(isChoicePayoffLedgerEntry)).toBe(true)
    expect(SEASON2_PAYOFF_LEDGER.filter((entry) => entry.nodeId.startsWith('s2-august-'))).toHaveLength(11)
  })

  it('isInheritanceLevel 分级', () => {
    expect(isInheritanceLevel('flavor')).toBe(true)
    expect(isInheritanceLevel('ending')).toBe(true)
    expect(isInheritanceLevel('illegal')).toBe(false)
  })

  it('registerPayoff 按 episode+choice 去重', () => {
    const one = registerPayoff(EMPTY_PAYOFF_LEDGER, payoff)
    expect(one).toHaveLength(1)
    const two = registerPayoff(one, payoff)
    expect(two).toHaveLength(1)
  })

  it('findPayoffsForEpisode / findPayoff 检索', () => {
    const ledger = registerPayoff(EMPTY_PAYOFF_LEDGER, payoff)
    expect(findPayoffsForEpisode(ledger, 's2-prologue')).toHaveLength(1)
    expect(findPayoff(ledger, 's2-prologue', 's2-prologue-c1')?.immediateResult).toBe('你决定先稳住内部。')
    expect(findPayoff(ledger, 's2-prologue', 'missing')).toBeNull()
  })

  it('isChoicePayoffLedgerEntry 守卫', () => {
    expect(isChoicePayoffLedgerEntry(payoff)).toBe(true)
    expect(isChoicePayoffLedgerEntry({ ...payoff, inheritanceLevel: 'illegal' })).toBe(false)
    expect(isChoicePayoffLedgerEntry({ ...payoff, inherits: 'x' })).toBe(false)
  })
})
