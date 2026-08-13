import { describe, expect, it } from 'vitest'

import { romanceCandidates } from '@/content/characters'
import {
  ROMANCE_CONFESSION_UNLOCK,
  ROMANCE_FIRST_DATE_UNLOCK,
  getEffectiveActivePartner,
  getRomanceAction,
  getRomanceAvailability,
  romanceEpisodeById,
  romanceProfiles,
} from '@/content/romanceProfiles'
import { commitChoice, createInitialGameState, enterNode } from '@/engine/state'

import {
  romanceNightMarketEntryPoints,
  romanceNightMarketNodes,
  romanceReturnTarget,
} from './romanceNightMarket'

const byId = new Map(romanceNightMarketNodes.map((node) => [node.id, node]))
const getNode = (id: string) => {
  const node = byId.get(id)
  if (!node) throw new Error(`测试找不到夜市节点 ${id}`)
  return node
}

describe('1.6 幻想夜市关系剧情', () => {
  it('十二名攻略对象都有配置与首次约会、告白、恋爱日常入口', () => {
    expect(Object.keys(romanceProfiles)).toEqual(expect.arrayContaining([...romanceCandidates]))
    expect(Object.keys(romanceProfiles)).toHaveLength(12)
    expect(romanceNightMarketNodes).toHaveLength(120)

    for (const character of romanceCandidates) {
      const profile = romanceProfiles[character]
      const entries = romanceNightMarketEntryPoints[character]
      expect(entries).toEqual({
        firstDate: profile.firstDateNodeId,
        confession: profile.confessionNodeId,
        daily: profile.dailyNodeId,
      })
      expect(getNode(entries.firstDate).speaker).toBe(character)
      expect(getNode(entries.confession).speaker).toBe(character)
      expect(getNode(entries.daily).speaker).toBe(character)
    }
  })

  it('十二张首次约会CG使用显式且唯一的收藏ID与约定文件名', () => {
    const expected = [
      ['shana', 'cg54-romance-shana-first-date', '/assets/cg/romance-shana-first-date-v1.webp'],
      ['qifu', 'cg55-romance-qifu-first-date', '/assets/cg/romance-qifu-first-date-v1.webp'],
      ['chenyi', 'cg56-romance-chenyi-first-date', '/assets/cg/romance-chenyi-first-date-v1.webp'],
      ['swordheart', 'cg57-romance-swordheart-first-date', '/assets/cg/romance-swordheart-first-date-v1.webp'],
      ['heartbeat', 'cg58-romance-heartbeat-first-date', '/assets/cg/romance-heartbeat-first-date-v1.webp'],
      ['yanqiu', 'cg59-romance-yanqiu-first-date', '/assets/cg/romance-yanqiu-first-date-v1.webp'],
      ['huayue', 'cg60-romance-huayue-first-date', '/assets/cg/romance-huayue-first-date-v1.webp'],
      ['wenxian', 'cg61-romance-wenxian-first-date', '/assets/cg/romance-wenxian-first-date-v1.webp'],
      ['takemehand', 'cg62-romance-takemehand-first-date', '/assets/cg/romance-takemehand-first-date-v1.webp'],
      ['xilufei', 'cg63-romance-xilufei-first-date', '/assets/cg/romance-xilufei-first-date-v1.webp'],
      ['yyt', 'cg64-romance-yyt-first-date', '/assets/cg/romance-yyt-first-date-v1.webp'],
      ['avucii', 'cg65-romance-avucii-first-date', '/assets/cg/romance-avucii-first-date-v1.webp'],
    ] as const
    const actual = romanceCandidates.map((character) => {
      const profile = romanceProfiles[character]
      return [character, profile.firstDateCgId, profile.firstDateCg] as const
    })

    expect(actual).toEqual(expected)
    expect(new Set(actual.map(([, id]) => id))).toHaveLength(12)
    expect(new Set(actual.map(([, , path]) => path))).toHaveLength(12)
    expect(romanceCandidates.every((character) => romanceProfiles[character].firstDateCgAlt.length > 0)).toBe(true)
  })

  it('提供72个稳定的UI剧集入口和唯一推荐动作', () => {
    expect(Object.keys(romanceEpisodeById)).toHaveLength(72)
    for (const character of romanceCandidates) {
      const profile = romanceProfiles[character]
      expect(romanceEpisodeById[`romance-${character}-first-date`]).toEqual({
        id: `romance-${character}-first-date`,
        character,
        kind: 'firstDate',
        nodeId: profile.firstDateNodeId,
        title: profile.dateTitle,
      })
      expect(romanceEpisodeById[`romance-${character}-confession`]?.kind).toBe('confession')
      expect(romanceEpisodeById[`romance-${character}-daily`]?.kind).toBe('daily')
      expect(romanceEpisodeById[`romance-${character}-second-date`]?.kind).toBe('secondDate')
      expect(romanceEpisodeById[`romance-${character}-conflict`]?.kind).toBe('conflict')
      expect(romanceEpisodeById[`romance-${character}-reconciliation`]?.kind).toBe('reconciliation')
    }
  })

  it('全部夜市节点均标记为虚构恋爱支线', () => {
    for (const node of romanceNightMarketNodes) {
      expect(node.historical, node.id).toBe('fictional')
      expect(node.sideStory, node.id).toBe('romance')
    }
  })

  it('首次约会、告白与恋爱日常使用专属夜市背景而不是复用主线聊天图', () => {
    const usedBackgrounds = new Set<string>()
    for (const character of romanceCandidates) {
      const profile = romanceProfiles[character]
      expect(getNode(profile.firstDateNodeId).background).toBe(profile.sceneBackgrounds.date)
      expect(getNode(profile.confessionNodeId).background).toBe(profile.sceneBackgrounds.confession)
      expect(getNode(profile.dailyNodeId).background).toBe(profile.sceneBackgrounds.daily)
      usedBackgrounds.add(profile.sceneBackgrounds.date)
      usedBackgrounds.add(profile.sceneBackgrounds.confession)
      usedBackgrounds.add(profile.sceneBackgrounds.daily)
    }
    expect(usedBackgrounds).toEqual(new Set([
      'romanceGateRain',
      'romanceGateAfterHours',
      'romanceFoodStreetRain',
      'romanceFoodStreetAfterHours',
      'romanceArcadeRain',
      'romanceArcadeAfterHours',
      'romanceLanternBridgeRain',
      'romanceLanternBridgeAfterHours',
    ]))
  })

  it('每名角色首次约会两选一、本人即时回应，公共结尾首次奖励固定数值', () => {
    for (const character of romanceCandidates) {
      const profile = romanceProfiles[character]
      const date = getNode(profile.firstDateNodeId)
      expect(date.choices, character).toHaveLength(2)
      const responseNodes = date.choices!.map((choice) => {
        expect(typeof choice.next, `${character}/${choice.id}`).toBe('string')
        return getNode(choice.next as string)
      })
      for (const response of responseNodes) {
        expect(response.speaker, response.id).toBe(character)
        expect(response.portrait, response.id).toBe(character)
      }
      expect(new Set(responseNodes.map((node) => node.next))).toHaveLength(1)

      const ending = getNode(responseNodes[0]!.next as string)
      expect(date.presentation?.cg, character).toBeUndefined()
      expect(responseNodes.every((node) => node.presentation?.cg === undefined), character).toBe(true)
      expect(ending.presentation).toMatchObject({
        cg: profile.firstDateCg,
        cgAlt: profile.firstDateCgAlt,
        ui: 'cinematic',
        focus: 'center',
      })
      expect(ending.presentation?.sprites, character).toBeUndefined()
      expect(ending.onEnter).toEqual([
        { type: 'flag', key: profile.completionFlag },
        { type: 'unlockCg', id: profile.firstDateCgId },
        { type: 'relationshipProgress', character, value: 20 },
        { type: 'relationship', character, key: 'trust', value: 1 },
        { type: 'relationship', character, key: 'affinity', value: 1 },
      ])
      expect(ending.next).toEqual(romanceReturnTarget)
    }
  })

  it('每名角色告白均可接受或暂缓，接受写入伴侣并登记既有关系结局与CG', () => {
    for (const character of romanceCandidates) {
      const profile = romanceProfiles[character]
      const confession = getNode(profile.confessionNodeId)
      expect(confession.choices, character).toHaveLength(2)

      const accept = confession.choices!.find((choice) => choice.id.endsWith('-accept'))
      const defer = confession.choices!.find((choice) => choice.id.endsWith('-defer'))
      expect(accept, character).toBeDefined()
      expect(defer, character).toBeDefined()
      expect(accept!.effects).toEqual(expect.arrayContaining([
        { type: 'activePartner', character },
        { type: 'flag', key: profile.partnerFlag },
        { type: 'unlockEnding', id: profile.bondEndingId },
        { type: 'unlockCg', id: profile.bondCgId },
      ]))

      for (const choice of [accept!, defer!]) {
        expect(typeof choice.next).toBe('string')
        const response = getNode(choice.next as string)
        expect(response.speaker).toBe(character)
        expect(response.portrait).toBe(character)
        expect(response.next).toEqual(romanceReturnTarget)
      }
      const accepted = getNode(accept!.next as string)
      expect(accepted.presentation?.cg).toBe(profile.confessionCg)
      expect(accepted.presentation?.cgPlaceholderFor).toBe(profile.confessionCgFinal)
      expect(accepted.presentation?.cgPromptRef).toBe(profile.confessionCgPromptRef)
      expect(accepted.onEnter).toContainEqual({ type: 'unlockCg', id: profile.confessionCgId })

      let state = createInitialGameState({ playerName: `告白测试-${character}` })
      state.relationships[character].progress = ROMANCE_CONFESSION_UNLOCK
      state.flags[profile.completionFlag] = true
      state = enterNode(state, confession)
      const result = commitChoice(state, confession, accept!.id)
      expect(result.state.activePartner).toBe(character)
      expect(result.state.flags[profile.partnerFlag]).toBe(true)
      expect(result.state.unlockedEndings).toContain(profile.bondEndingId)
      expect(result.state.unlockedCgs).toContain(profile.bondCgId)
    }
  })

  it('恋爱日常两选一并由本人回应，首次进入奖励不能挂在可重复选择上', () => {
    for (const character of romanceCandidates) {
      const profile = romanceProfiles[character]
      const daily = getNode(profile.dailyNodeId)
      expect(daily.choices, character).toHaveLength(2)
      expect(daily.onEnter).toEqual([
        { type: 'flag', key: profile.dailyFlag },
        { type: 'relationship', character, key: 'trust', value: 1 },
        { type: 'relationship', character, key: 'affinity', value: 1 },
      ])
      expect(daily.choices!.every((choice) => !(choice.effects?.length))).toBe(true)

      for (const choice of daily.choices!) {
        expect(typeof choice.next).toBe('string')
        const response = getNode(choice.next as string)
        expect(response.speaker).toBe(character)
        expect(response.portrait).toBe(character)
        expect(response.next).toEqual(romanceReturnTarget)
      }

      const initial = createInitialGameState({ playerName: `日常测试-${character}` })
      const firstEntry = enterNode(initial, daily)
      const repeatEntry = enterNode(firstEntry, daily)
      expect(firstEntry.relationships[character].trust).toBe(1)
      expect(firstEntry.relationships[character].affinity).toBe(1)
      expect(repeatEntry.relationships[character].trust).toBe(1)
      expect(repeatEntry.relationships[character].affinity).toBe(1)
    }
  })

  it('首次约会公共结尾重复进入不会重复获得攻略值或信任好感', () => {
    for (const character of romanceCandidates) {
      const date = getNode(romanceProfiles[character].firstDateNodeId)
      const response = getNode(date.choices![0]!.next as string)
      const ending = getNode(response.next as string)
      const initial = createInitialGameState({ playerName: `约会测试-${character}` })
      const firstEntry = enterNode(initial, ending)
      const repeatEntry = enterNode(firstEntry, ending)
      expect(firstEntry.relationships[character]).toMatchObject({ progress: 20, trust: 1, affinity: 1 })
      expect(repeatEntry.relationships[character]).toMatchObject({ progress: 20, trust: 1, affinity: 1 })
      expect(firstEntry.unlockedCgs.filter((id) => id === romanceProfiles[character].firstDateCgId)).toHaveLength(1)
      expect(repeatEntry.unlockedCgs.filter((id) => id === romanceProfiles[character].firstDateCgId)).toHaveLength(1)
    }
  })

  it('可用性严格执行30首约、完成首约后100告白、唯一伴侣和主线bond继承', () => {
    const character = 'shana'
    const other = 'qifu'
    const profile = romanceProfiles[character]
    let state = createInitialGameState({ playerName: '夜市测试' }) as ReturnType<typeof createInitialGameState> & {
      activePartner?: typeof character | typeof other | null
    }

    state.relationships[character].progress = ROMANCE_FIRST_DATE_UNLOCK - 1
    expect(getRomanceAvailability(state, character)).toMatchObject({
      stage: 'locked', canFirstDate: false, canConfess: false, canDaily: false,
    })
    expect(getRomanceAction(profile, state)).toMatchObject({
      enabled: false, kind: 'disabled', nodeId: null,
    })

    state.relationships[character].progress = ROMANCE_FIRST_DATE_UNLOCK
    expect(getRomanceAvailability(state, character)).toMatchObject({
      stage: 'dateable', canFirstDate: true, canConfess: false, canDaily: false,
    })
    expect(getRomanceAction(character, state)).toMatchObject({
      enabled: true, kind: 'firstDate', nodeId: profile.firstDateNodeId,
    })

    state.flags[profile.completionFlag] = true
    state.relationships[character].progress = ROMANCE_CONFESSION_UNLOCK - 1
    expect(getRomanceAvailability(state, character)).toMatchObject({
      stage: 'dated', canFirstDate: false, canConfess: false, canDaily: false,
    })

    state.relationships[character].progress = ROMANCE_CONFESSION_UNLOCK
    expect(getRomanceAvailability(state, character)).toMatchObject({
      stage: 'confessable', canFirstDate: false, canConfess: true, canDaily: false,
    })
    expect(getRomanceAction(profile, state)).toMatchObject({
      enabled: true, kind: 'confession', nodeId: profile.confessionNodeId,
    })

    state.activePartner = other
    expect(getRomanceAvailability(state, character)).toMatchObject({
      stage: 'partnered-elsewhere', canFirstDate: false, canConfess: false, canDaily: false,
    })

    state.activePartner = null
    state.flags[profile.bondedFlag] = true
    expect(getEffectiveActivePartner(state)).toBe(character)
    expect(getRomanceAvailability(state, character)).toMatchObject({
      stage: 'partner', canFirstDate: false, canConfess: false, canDaily: true,
    })
    expect(getRomanceAction(character, state)).toMatchObject({
      enabled: true, kind: 'secondDate', nodeId: profile.secondDateNodeId,
    })
  })
})
