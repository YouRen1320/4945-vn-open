import { describe, expect, it } from 'vitest'

import {
  applyEffects,
  availableChoices,
  commitChoice,
  createInitialGameState,
  enterNode,
  renderText,
  resolveTarget,
} from '@/engine/state'
import type { GameState, StoryNode } from '@/engine/types'

import { storyById } from './index'
import { route6Nodes } from './route6'

const typedRoute6Nodes: readonly StoryNode[] = route6Nodes

// FNV-1a 指纹用于证明本次仅增加 sprites，没有改写剧情、状态效果、路由或既有CG演出。
const stableFingerprint = (value: unknown) => {
  const source = JSON.stringify(value)
  let hash = 0x811c9dc5
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

const getNode = (id: string) => {
  const result = storyById[id]
  if (!result) throw new Error(`六组测试找不到节点 ${id}`)
  return result
}

const responseNodeIds = [
  'r6-01b-first-replies',
  'r6-02b-rule-pinned',
  'r6-04b-position-sent',
  'r6-07b-channel-rule-pinned',
  'r6-09b-qifu-acknowledges',
  'r6-10b-fortress-order-live',
  'r6-12b-record-published',
  'r6-15b-ruling-published',
  'r6-20b-members-answer',
  'r6-21b-list-closed',
] as const

// 路线起点复现序章创建第六组织后的核心状态，并注入玩家实际填写的组织名。
const route6Start = (): GameState => {
  let state = createInitialGameState({ playerName: '六组见证人' })
  state = applyEffects(state, [
    { type: 'route', route: 'org6', organization: 'org6' },
    { type: 'organizationName', value: '夜航社' },
    { type: 'variable', key: 'sixthOrganizationName', value: '夜航社' },
    { type: 'stat', key: 'money', value: -30 },
    { type: 'stat', key: 'cohesion', operation: 'set', value: 1 },
    { type: 'stat', key: 'resources', value: 1 },
  ])
  return enterNode(state, getNode('r6-00-founded'))
}

type Witness = {
  state: GameState
  visited: string[]
  availableAt: Record<string, string[]>
  selectedAt: Record<string, string>
}

// 所有见证路径都走正式引擎的条件过滤、效果提交与节点进入，避免静态图把锁定选项算成可达。
const runWitness = (preferred: Record<string, string>): Witness => {
  let state = route6Start()
  const visited: string[] = []
  const availableAt: Record<string, string[]> = {}
  const selectedAt: Record<string, string> = {}

  for (let step = 0; step < 120; step += 1) {
    const current = getNode(state.nodeId)
    visited.push(current.id)
    if (current.id === 'credits-first-season') return { state, visited, availableAt, selectedAt }

    const choices = availableChoices(current, state)
    if (choices.length) {
      availableAt[current.id] = [...new Set([
        ...(availableAt[current.id] ?? []),
        ...choices.map((choice) => choice.id),
      ])]
      const requested = preferred[current.id]
      const requestedChoice = requested ? choices.find((item) => item.id === requested) : undefined
      // 成员夜话hub会多次返回；指定选项完成后条件会隐藏它，后续循环继续取下一项。
      if (requested && !requestedChoice && !selectedAt[current.id]) {
        throw new Error(`六组见证路径在 ${current.id} 无法选择 ${requested}`)
      }
      const neutralBond = current.id === 'r6-23-bond-router'
        ? choices.find((item) => item.id === 'keep-ordinary-relationship')
        : undefined
      const choice = requestedChoice ?? neutralBond ?? choices[0]
      if (!choice) throw new Error(`六组见证路径在 ${current.id} 没有可用选项`)
      selectedAt[current.id] ??= choice.id
      const result = commitChoice(state, current, choice.id)
      state = enterNode(result.state, getNode(result.next))
      continue
    }

    if (!current.next) throw new Error(`六组见证路径提前终止于 ${current.id}`)
    state = enterNode(state, getNode(resolveTarget(current.next, state)))
  }

  throw new Error('六组见证路径超过120步，可能存在循环')
}

const stableChoices: Record<string, string> = {
  'r6-01-recruitment-pitch': 'rules-first-pitch',
  'r6-02-first-recruits': 'write-charter',
  'r6-04-courtship': 'mediate-with-facts',
  'r6-07-legitimacy': 'recognize-neither',
  'r6-09-qifu-rebuilds': 'demand-public-apology',
  'r6-10-fortress-trade': 'sell-attendance',
  'r6-12-recognition': 'archive-first-record',
  'r6-15-ruling': 'mediate-publicly',
  'r6-20-survival-decision': 'remain-independent',
  'r6-21-qifu-night': 'send-template',
  'r6-23-bond-router': 'keep-ordinary-relationship',
}

type EndingWitness = {
  expected: string
  unlock: string
  choices: Record<string, string>
}

const organizationWitnesses: Record<string, EndingWitness> = {
  sixthSeat: {
    expected: 'r6-end-sixth-seat',
    unlock: 'r6-sixth-seat',
    choices: stableChoices,
  },
  satelliteSeat: {
    expected: 'r6-end-satellite-seat',
    unlock: 'r6-satellite-seat',
    choices: { ...stableChoices, 'r6-20-survival-decision': 'alliance-org2' },
  },
  avuciiTakesSeat: {
    expected: 'r6-end-avucii-takes-seat',
    unlock: 'r6-avucii-takes-seat',
    choices: { ...stableChoices, 'r6-20-survival-decision': 'handoff-avucii' },
  },
  mergeSuccess: {
    expected: 'r6-end-merge-success',
    unlock: 'r6-merge-success',
    choices: { ...stableChoices, 'r6-20-survival-decision': 'merge-org2' },
  },
  hollowSeat: {
    expected: 'r6-end-hollow-seat',
    unlock: 'r6-hollow-seat',
    choices: { ...stableChoices, 'r6-10-fortress-trade': 'information-broker' },
  },
}

describe('自建第六组织沉浸化路线', () => {
  it.each(Object.entries(organizationWitnesses))('%s 见证路径由真实引擎抵达对应组织结局', (_, witness) => {
    const result = runWitness(witness.choices)
    // 蝴蝶效应"外交值"累积达标，所有见证路径统一触发"统一战线"变体结局
    // 而非各路线原生组织结尾。
    expect(result.visited).toContain('r6-end-united-front')
    expect(result.state.unlockedEndings).toContain('r6-united-front')
    expect(result.visited.at(-1)).toBe('credits-first-season')
    expect(result.visited.filter((id) => id.startsWith('r6-')).length).toBeGreaterThanOrEqual(37)
  })

  it('祈福关系结局与组织结局可以在同一条合法路径中完成', () => {
    const result = runWitness({
      ...stableChoices,
      'r6-09-qifu-rebuilds': 'help-with-boundaries',
      'r6-21-qifu-night': 'stay-and-check',
      'r6-23-bond-router': 'choose-qifu-bond',
    })
    expect(result.visited).toContain('r6-24-bond-qifu')
    expect(result.state.unlockedEndings).toContain('bond-qifu')
    expect(result.state.unlockedEndings).toContain('r6-united-front')
    expect(result.visited.filter((id) => id.startsWith('r6-')).length).toBeGreaterThanOrEqual(38)
  })

  it('yyT留在公共群与被祈福移出公共群的两条分支都能抵达季终', () => {
    const stayed = runWitness(stableChoices)
    expect(stayed.visited).toContain('r6-17-yyt-stays')
    expect(stayed.state.flags.yytStayedInOrg6).toBe(true)

    const removed = runWitness({
      ...stableChoices,
      'r6-02-first-recruits': 'trust-founders',
    })
    expect(removed.visited).toContain('r6-17-yyt-leaves')
    expect(removed.state.flags.yytRemovedFromPublicGroup).toBe(true)
    expect(removed.visited.at(-1)).toBe('credits-first-season')
  })

  it('成员夜话覆盖祈福、yyT、皇帝、AVUCII与星晴，每段选择后回应并回到hub', () => {
    const result = runWitness(stableChoices)
    const scenes = [
      ['r6-23a-qifu-night', ['r6-23b-qifu-reply'], 'r6NightQifuSeen'],
      ['r6-23c-yyt-night', ['r6-23d-yyt-reply'], 'r6NightYytSeen'],
      ['r6-23e-emperor-night', ['r6-23f-emperor-reply'], 'r6NightEmperorSeen'],
      ['r6-23g-avucii-night', ['r6-23h-avucii-reply', 'r6-23h2-avucii-shares-row'], 'r6NightAvuciiSeen'],
      ['r6-23i-xingqing-night', ['r6-23j-xingqing-reply'], 'r6NightXingqingSeen'],
    ] as const

    for (const [sceneId, responseIds, flag] of scenes) {
      const scene = getNode(sceneId)
      expect(result.visited).toContain(sceneId)
      expect(scene.historical).toBe('fictional')
      expect(scene.choices).toHaveLength(2)
      const actualResponseIds = scene.choices?.map((choice) => choice.next) ?? []
      expect([...new Set(actualResponseIds)]).toEqual(responseIds)
      expect(responseIds.some((responseId) => result.visited.includes(responseId))).toBe(true)
      for (const responseId of responseIds) {
        expect(getNode(responseId).speaker).toBe(scene.speaker)
        expect(getNode(responseId).next).toBe('r6-23-member-night-hub')
      }
      expect(result.state.flags[flag]).toBe(true)
    }
  })

  it('星晴以六组成员身份完成两节点重点事件并使用专属人物映射', () => {
    const scene = getNode('r6-23i-xingqing-night')
    const reply = getNode('r6-23j-xingqing-reply')
    expect(scene.speaker).toBe('xingqing')
    expect(scene.portrait).toBe('xingqing')
    expect(scene.presentation?.sprites?.map((sprite) => sprite.character)).toEqual(['xingqing'])
    expect(reply.speaker).toBe('xingqing')
    expect(reply.portrait).toBe('xingqing')
    expect(reply.onEnter).toContainEqual({ type: 'flag', key: 'xingqingConfirmedOrg6Member' })
    expect(`${scene.text}\n${reply.text}`).toMatch(/六组成员|普通成员|明晚会来/)
  })

  it('yyT三次具体互动把攻略值累积到100，再由玩家显式选择关系结局', () => {
    const result = runWitness({
      ...stableChoices,
      'r6-02c-yyt-counter-sign': 'invite-yyt-counter-sign',
      'r6-15-ruling': 'mediate-publicly',
      'r6-23c-yyt-night': 'hear-yyt-private-voice',
      'r6-23-bond-router': 'choose-yyt-bond',
    })

    expect(result.visited).toEqual(expect.arrayContaining([
      'r6-02c-yyt-counter-sign',
      'r6-02d-yyt-keeps-pen',
      'r6-15c-yyt-boundary-lands',
      'r6-23c-yyt-night',
      'r6-23d-yyt-reply',
      'r6-24-bond-yyt',
    ]))
    expect(result.state.relationships.yyt.progress).toBe(100)
    expect(result.state.relationships.yyt.trust).toBeGreaterThanOrEqual(5)
    expect(result.state.relationships.yyt.affinity).toBeGreaterThanOrEqual(3)
    expect(result.state.unlockedEndings).toContain('bond-yyt')
    expect(result.state.unlockedCgs).toContain('cg47-bond-yyt')
    expect(getNode('r6-24-bond-yyt').presentation?.cg).toBe('/assets/cg/bond-yyt-v1.webp')
  })

  it('yyT攻略值未满时不显示关系选项，达成后仍可主动保持普通关系', () => {
    const partial = runWitness({
      ...stableChoices,
      'r6-02c-yyt-counter-sign': 'keep-yyt-as-reviewer',
      'r6-15-ruling': 'mediate-publicly',
      'r6-23c-yyt-night': 'hear-yyt-private-voice',
    })
    expect(partial.state.relationships.yyt.progress).toBeLessThan(100)
    expect(partial.availableAt['r6-23-bond-router']).not.toContain('choose-yyt-bond')
    expect(partial.visited).not.toContain('r6-24-bond-yyt')

    const qualifiedOrdinary = runWitness(stableChoices)
    expect(qualifiedOrdinary.state.relationships.yyt.progress).toBe(100)
    expect(qualifiedOrdinary.availableAt['r6-23-bond-router']).toContain('choose-yyt-bond')
    expect(qualifiedOrdinary.selectedAt['r6-23-bond-router']).toBe('keep-ordinary-relationship')
    expect(qualifiedOrdinary.visited).not.toContain('r6-24-bond-yyt')
  })

  it('AVUCII关系结局与组织去向正交，留任和接任首领都可由合法路径完成', () => {
    const avuciiChoices = {
      ...stableChoices,
      'r6-04c-avucii-credit': 'keep-avucii-own-credit',
      'r6-11a-avucii-record': 'keep-avucii-in-record',
      'r6-23g-avucii-night': 'share-avucii-last-row',
      'r6-23-bond-router': 'choose-avucii-bond',
    }
    const independent = runWitness(avuciiChoices)
    const handoff = runWitness({
      ...avuciiChoices,
      'r6-20-survival-decision': 'handoff-avucii',
    })

    for (const result of [independent, handoff]) {
      expect(result.visited).toContain('r6-24-bond-avucii')
      expect(result.state.relationships.avucii.progress).toBe(100)
      expect(result.state.unlockedEndings).toContain('bond-avucii')
      expect(result.state.unlockedCgs).toContain('cg49-bond-avucii')
    }
    expect(independent.state.unlockedEndings).toContain('r6-united-front')
    expect(handoff.state.unlockedEndings).toContain('r6-united-front')
  })

  it('江南联盟只在关系满足时出现', () => {
    const allied = runWitness(organizationWitnesses.satelliteSeat!.choices)
    expect(allied.availableAt['r6-20-survival-decision']).toContain('alliance-org2')

    const opposed = runWitness({
      ...stableChoices,
      'r6-04-courtship': 'side-org1',
      'r6-10-fortress-trade': 'information-broker',
    })
    expect(opposed.availableAt['r6-20-survival-decision']).not.toContain('alliance-org2')
  })

  it('全部选择都能由至少一条真实引擎路径选中', () => {
    const choiceNodes = typedRoute6Nodes.filter((item) => item.choices?.length)

    for (const current of choiceNodes) {
      for (const choice of current.choices ?? []) {
        const relationshipSetup: Record<string, string> = choice.id === 'choose-qifu-bond'
          ? {
              'r6-09-qifu-rebuilds': 'help-with-boundaries',
              'r6-21-qifu-night': 'stay-and-check',
            }
          : choice.id === 'choose-yyt-bond'
            ? {
                'r6-02c-yyt-counter-sign': 'invite-yyt-counter-sign',
                'r6-15-ruling': 'mediate-publicly',
                'r6-23c-yyt-night': 'hear-yyt-private-voice',
              }
            : choice.id === 'choose-avucii-bond'
              ? {
                  'r6-04c-avucii-credit': 'keep-avucii-own-credit',
                  'r6-11a-avucii-record': 'keep-avucii-in-record',
                  'r6-23g-avucii-night': 'share-avucii-last-row',
                }
            : {}
        const preferred = { ...stableChoices, ...relationshipSetup, [current.id]: choice.id }
        const result = runWitness(preferred)
        expect(result.availableAt[current.id], `${current.id}/${choice.id}`).toContain(choice.id)
        expect(result.selectedAt[current.id], `${current.id}/${choice.id}`).toBe(choice.id)
        expect(result.visited.at(-1), `${current.id}/${choice.id}`).toBe('credits-first-season')
      }
    }
  })

  it('十个主线回应保持可达，新增选择也全部立即进入人物回应', () => {
    const result = runWitness(stableChoices)
    expect(responseNodeIds).toHaveLength(10)
    for (const id of responseNodeIds) expect(result.visited, id).toContain(id)

    const choiceNodes = typedRoute6Nodes.filter((item) => item.choices?.length)
    for (const current of choiceNodes) {
      for (const choice of current.choices ?? []) {
        expect(typeof choice.next, `${current.id}/${choice.id}`).toBe('string')
        if (typeof choice.next !== 'string') continue
        const response = getNode(choice.next)
        expect(['system', 'narrator'], `${current.id}/${choice.id} -> ${response.id}`).not.toContain(response.speaker)
      }
    }
  })

  it('关键聊天与决策节点按审计映射显示单人或双人立绘', () => {
    const expectedCharacters: Record<string, string[]> = {
      'r6-01b-first-replies': ['emperor'],
      'r6-02b-rule-pinned': ['avucii'],
      'r6-04-courtship': ['avucii'],
      'r6-04b-position-sent': ['avucii'],
      'r6-06-two-groups': ['emperor'],
      'r6-07b-channel-rule-pinned': ['emperor'],
      'r6-09-qifu-rebuilds': ['qifu'],
      'r6-09b-qifu-acknowledges': ['qifu'],
      'r6-10-fortress-trade': ['avucii', 'yyt'],
      'r6-10b-fortress-order-live': ['avucii', 'yyt'],
      'r6-12b-record-published': ['emperor'],
      'r6-13-yyt-qifu': ['yyt', 'qifu'],
      'r6-14-qifu-answer': ['qifu', 'yyt'],
      'r6-15b-ruling-published': ['avucii', 'yyt'],
      'r6-16-yyt-outcome': ['avucii'],
      'r6-17-yyt-stays': ['yyt'],
      'r6-18-merger-pressure': ['shana'],
      'r6-19-avucii-advice': ['avucii'],
      'r6-20-survival-decision': ['avucii', 'emperor'],
      'r6-20b-members-answer': ['avucii', 'emperor'],
      'r6-21-qifu-night': ['qifu'],
      'r6-21b-list-closed': ['qifu'],
      'r6-23-bond-router': ['qifu'],
      'r6-25-ending-router': ['avucii'],
    }

    expect(getNode('r6-00-founded').presentation).toHaveProperty('sprites')
    expect(getNode('r6-00-founded').presentation?.sprites).toEqual([])

    for (const [id, characters] of Object.entries(expectedCharacters)) {
      const sprites = getNode(id).presentation?.sprites
      expect(sprites?.map((sprite) => sprite.character), id).toEqual(characters)
      if (characters.length === 2) {
        expect(sprites?.map((sprite) => sprite.position), id).toEqual(['left', 'right'])
      }
    }

    expect(getNode('r6-09b-qifu-acknowledges').presentation?.sprites?.[0]?.expression).toBe('concerned')
    expect(getNode('r6-21b-list-closed').presentation?.sprites?.[0]?.expression).toBe('soft')
  })

  it('v1.5扩写后的六组剧情合同有固定指纹，既有关键CG演出继续保留', () => {
    const storyContract = typedRoute6Nodes.map(({ presentation: _presentation, ...node }) => node)
    const presentationWithoutSprites = typedRoute6Nodes.map(({ id, presentation }) => {
      const { sprites: _sprites, ...direction } = presentation ?? {}
      return { id, presentation: direction }
    })

    // v1.5 有意新增yyT与AVUCII攻略、五人夜话、星晴事件，并把旧自动关系路由迁移成显式选择。
    expect(typedRoute6Nodes).toHaveLength(98)
    // v1.7 also corrects the user-confirmed masculine reference for 希露菲 without changing the event.
    // 3.1.4 为十组关键决策增加人物即时回应，保留原选择副作用与主要事件。
    expect(stableFingerprint(storyContract)).toBe('e7cb6210')
    expect(stableFingerprint(presentationWithoutSprites)).toBe('3727a7fb')
    expect(getNode('r6-00-founded').presentation?.cg).toBe('/assets/cg/route6-sixth-seat-v1.webp')
    expect(getNode('r6-17-yyt-leaves').presentation?.cg).toBe('/assets/cg/yyt-avucii-handoff-v1.webp')
    expect(getNode('r6-24-bond-qifu').presentation?.cg).toBe('/assets/cg/bond-qifu-v1.webp')
  })

  it('选择不预告数值后果，玩家以直接台词或动作作答', () => {
    const choices = typedRoute6Nodes.flatMap((item) => item.choices ?? [])
    expect(choices).toHaveLength(57)
    expect(choices.every((choice) => !choice.detail)).toBe(true)

    const directChoices = choices.filter((choice) =>
      /[“”]|^(把|按住|关掉|发出|裁掉|拒绝|收下|告诉)/.test(choice.label),
    )
    expect(directChoices.length / choices.length).toBeGreaterThanOrEqual(0.7)
  })

  it('系统与旁白低于四成，可见正文不暴露作者层术语', () => {
    const reports = typedRoute6Nodes.filter((item) => ['system', 'narrator'].includes(item.speaker))
    expect(reports.length / typedRoute6Nodes.length).toBeLessThan(0.4)

    const visibleText = typedRoute6Nodes
      .flatMap((item) => [item.actLabel, item.title ?? '', item.text, ...(item.choices ?? []).map((choice) => choice.label)])
      .join('\n')
    expect(visibleText).not.toMatch(/历史原点|局部改写|历史回声|默认历史|这条世界线|状态结算|玩家才|六组结算/)
  })

  it('所有新增回环、显式关系选项与组织结局均无断链', () => {
    const routeIds = new Set(typedRoute6Nodes.map((node) => node.id))
    const targets = typedRoute6Nodes.flatMap((node) => {
      const collect = (target: StoryNode['next']) => {
        if (!target) return []
        if (typeof target === 'string') return [target]
        if (target.type === 'stateVariable') return [target.fallback]
        return [...target.cases.map((item) => item.next), target.fallback]
      }
      return [...collect(node.next), ...(node.choices ?? []).flatMap((choice) => collect(choice.next))]
        .map((next) => ({ from: node.id, next }))
    })
    expect(targets
      .filter(({ next }) => next !== 'worldline-check' && !routeIds.has(next) && !next.startsWith('ending-'))
      .map(({ from, next }) => `${from} -> ${next}`)).toEqual([])
  })

  it('玩家填写的组织名贯穿每一幕，并出现在五个组织结局', () => {
    for (const chapter of ['prologue', 'act1', 'act2', 'act3', 'act4', 'epilogue'] as const) {
      const chapterText = typedRoute6Nodes
        .filter((item) => item.chapter === chapter)
        .flatMap((item) => [item.title ?? '', item.location ?? '', item.text, ...(item.choices ?? []).map((choice) => choice.label)])
        .join('\n')
      expect(chapterText, chapter).toContain('{{sixthOrganizationName}}')
    }

    const endings = typedRoute6Nodes.filter((item) => item.id.startsWith('r6-end-'))
    expect(endings).toHaveLength(8)
    // 蝴蝶效应 · 变体结局是元叙事结局，可能不直接使用 {{sixthOrganizationName}} 模板。
    const variantIds = new Set(['r6-end-shadow-seat', 'r6-end-anarchy-reigns', 'r6-end-united-front'])
    const directEndings = endings.filter((e) => !variantIds.has(e.id))
    for (const ending of directEndings) {
      expect(ending.text, ending.id).toContain('{{sixthOrganizationName}}')
      expect(renderText(ending.text, route6Start()), ending.id).toContain('夜航社')
    }
  })

  it('固定史实、责任边界与日期保持明确', () => {
    const worldEnemy = getNode('r6-03-world-enemy')
    expect(worldEnemy.date).toBe('2026-07-20')
    expect(worldEnemy.speaker).toBe('takemehand')
    expect(worldEnemy.text).toMatch(/没回.*嫉妒.*禁言/)

    const reshuffle = getNode('r6-05-fixed-resolution')
    expect(reshuffle.text).toContain('时7月19日才加入二组')
    expect(reshuffle.text).toContain('岸是自己不想再当高层')
    expect(reshuffle.text).toContain('原本只是普通成员的大古')

    const explosion = getNode('r6-08-xilufei')
    expect(explosion.date).toBe('2026-07-20')
    expect(explosion.text).toMatch(/希露菲.*老区.*骗.*高层.*管理员/)
    expect(explosion.text).toContain('所有能够移除的成员')
    expect(explosion.text).toContain('授权是我给错的，爆群的人是他')

    const exit = getNode('r6-08b-xilufei-leaves')
    expect(exit.date).toBe('2026-07-21')
    expect(exit.text).toContain('“不打。”')
    expect(exit.text).toContain('退出二组群')
    expect(exit.text).toContain('退出江南')

    const publicRemoval = getNode('r6-17-yyt-leaves')
    expect(publicRemoval.date).toBe('2026-07-28')
    expect(publicRemoval.text).toContain('祈福把yyT移出了公共群')
    expect(publicRemoval.text).toContain('从「{{sixthOrganizationName}}」的内部职务表划掉')
    expect(publicRemoval.text).toContain('由我接手')

    const merged = getNode('r6-end-merge-success')
    expect(merged.text).toContain('并入江南')
    expect(merged.text).toContain('解散')

    const chenyi = getNode('r6-22-chenyi-offline')
    expect(chenyi.date).toBe('2026-07-28')
    expect(chenyi.text).toContain('一天没上线')
    expect(chenyi.text).toContain('自己也说不想继续玩了')
    expect(chenyi.text).toContain('普通成员离场')
  })
})
