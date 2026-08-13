import { describe, expect, it } from 'vitest'

import { projectAssetUrls } from '@/content/assets'
import { characters, romanceCandidates } from '@/content/characters'
import { storyActors } from '@/content/storyActors'
import { organizations } from '@/content/organizations'
import { spriteCatalog } from '@/content/sprites'
import { ENDING_REGISTRY } from '@/content/endingRegistry'
import type { NodeTarget } from '@/engine/types'

import { storyEntryNodeIds, storyNodes, validateStoryGraph } from './index'

const targets = (target: NodeTarget | undefined): string[] => {
  if (!target) return []
  if (typeof target === 'string') return [target]
  if (target.type === 'stateVariable') return [target.fallback]
  return [...target.cases.map((item) => item.next), target.fallback]
}

describe('第一季剧情图', () => {
  it('没有重复、断链或意外终点', () => {
    expect(validateStoryGraph()).toEqual([])
    expect(storyNodes.length).toBeGreaterThan(160)
  })

  it('所有节点都能从共同序章（或各自补遗入口）在某种分支下到达', () => {
    const graph = new Map(storyNodes.map((node) => [
      node.id,
      [
        ...targets(node.next),
        ...(node.choices ?? []).flatMap((choice) => targets(choice.next)),
        ...targets(node.textEntry?.next),
      ],
    ]))
    // 2.1 第一季补遗节点（s1x-）是隔离回放内容，不挂在第一季主线图上，只能通过各自的
    // `s1x0X-entry` 入口进入。将它们一并作为 BFS 起点，验证补遗子图自身完全连通、无孤儿。
    const supplementEntries = storyNodes
      .filter((node) => /^s1x0\d+-entry$/.test(node.id))
      .map((node) => node.id)
    // 2.2/2.3 第二季各 episode 是隔离赛季内容，分别通过各自的 s2-*-entry 入口进入。
    const prologueEntries = storyNodes
      .filter((node) => /^s2-.*-entry$/.test(node.id))
      .map((node) => node.id)
    const visited = new Set<string>()
    const queue = [...storyEntryNodeIds, ...supplementEntries, ...prologueEntries]
    while (queue.length) {
      const id = queue.shift()!
      if (visited.has(id)) continue
      visited.add(id)
      queue.push(...(graph.get(id) ?? []))
    }
    const unreachable = [...graph.keys()].filter((id) => !visited.has(id))
    // 蝴蝶效应 · 路线变体结局：共享蝴蝶结局（如 ending-chaos-collapse）优先于路线专属版本，
    // 这些路线专属节点作为见证/参考保留，在运行时不参与正式路由。
    const knownWitness = ['r3-end-schemer', 'r5-end-chaos-bloom', 'r5-end-hidden-garden', 'r6-end-shadow-seat', 'r6-end-anarchy-reigns']
    expect(unreachable.filter((id) => !knownWitness.includes(id))).toEqual([])
  })

  it('每条首领路线至少提供两个组织结局', () => {
    for (const route of ['r1', 'r2', 'r3', 'r4', 'r5', 'r6']) {
      const endings = storyNodes.filter((node) => node.id.startsWith(`${route}-end-`))
      expect(endings.length, route).toBeGreaterThanOrEqual(2)
    }
  })

  it('一组特殊成员路线固定提供两个基础组织结局', () => {
    const route1Endings = ENDING_REGISTRY
      .filter((entry) => entry.route === 'org1')
      .map((entry) => entry.id)
    expect(route1Endings).toEqual(['r1-order', 'r1-voice'])
  })

  it('结局注册表中的每个条目都有剧情解锁效果', () => {
    const unlocked = new Set(
      storyNodes.flatMap((node) => [
        ...(node.onEnter ?? []),
        ...(node.choices ?? []).flatMap((choice) => choice.effects ?? []),
      ])
        .filter((effect) => effect.type === 'unlockEnding')
        .map((effect) => effect.type === 'unlockEnding' ? effect.id : ''),
    )
    expect(ENDING_REGISTRY.filter((entry) => !unlocked.has(entry.id))).toEqual([])
  })

  it('所有关系候选均标记可攻略且有可解锁结局', () => {
    // 角色元数据、公共候选清单和剧情结局必须保持同一组关系角色。
    const declaredCandidates = Object.values(characters)
      .filter((character) => character.romanceable)
      .map((character) => character.id)
    expect(new Set(declaredCandidates)).toEqual(new Set(romanceCandidates))

    const unlocked = new Set(
      storyNodes.flatMap((node) => (node.onEnter ?? []))
        .filter((effect) => effect.type === 'unlockEnding')
        .map((effect) => effect.type === 'unlockEnding' ? effect.id : ''),
    )
    for (const id of romanceCandidates) expect(unlocked.has(`bond-${id}`), id).toBe(true)
  })

  it('新增关系 CG 已进入共享离线资源清单', () => {
    expect(projectAssetUrls).toEqual(expect.arrayContaining([
      '/assets/cg/bond-swordheart-v1.webp',
      '/assets/cg/bond-huayue-v1.webp',
      '/assets/cg/r2-org6-remnants-v1.webp',
    ]))
  })

  it('剧情演员头像已离线登记且不会混入关系候选', () => {
    expect(projectAssetUrls).toEqual(expect.arrayContaining([
      '/assets/avatars/suming.webp',
      '/assets/avatars/passerk.webp',
      '/assets/avatars/tiesuiya.webp',
      '/assets/avatars/kunxing.webp',
    ]))
    expect(Object.keys(storyActors)).toEqual([
      'suming', 'passerk', 'obito', 'tiesuiya', 'kunxing', 'shen-zhixing', 'north-observer',
    ])
    expect(romanceCandidates).not.toEqual(expect.arrayContaining(Object.keys(storyActors)))
  })

  it('所有有头像的实名成员都有全身立绘锚点', () => {
    // Avatar-bearing entries are the named ensemble; system/narrator/player/crowd intentionally use UI treatment.
    const missing = Object.values(characters)
      .filter((character) => character.avatar)
      .map((character) => character.id)
      .filter((id) => !spriteCatalog[id])
    expect(missing).toEqual([])
  })

  it('28名实名组织角色都有可选择的个人互动，并由本人立即回应', () => {
    // 这张映射是群像覆盖合同：组织归属来自角色表，现场位置可以跨组织发生。
    const memberInteractionNodes: Record<string, string> = {
      qifu: 'r6-23a-qifu-night',
      bottle: 'r3-20e-bottle-night',
      shana: 'r2-30d-shana-night-talk',
      chenyi: 'r2-30g-chenyi-night-talk',
      an: 'r2-30j-an-night-talk',
      shi: 'r2-30p-shi-night-talk',
      daigu: 'r2-30m-daigu-night-talk',
      xilufei: 'r2-30y-xilufei-night-talk',
      saoji: 'r2-30ab-saoji-night-talk',
      swordheart: 'r2-30s-swordheart-night-talk',
      sixin: 'r2-30v-sixin-night-talk',
      haogeju: 'r2-30ae-haogeju-night-talk',
      lan: 'r2-30ah-lan-night-talk',
      heartbeat: 'r3-20b-heartbeat-night',
      truth: 'r3-20c-truth-night',
      oguri: 'r3-20d-oguri-night',
      yanqiu: 'r4-23a-yanqiu-night',
      huayue: 'r4-23c-huayue-night',
      xuanmo: 'r4-23e-xuanmo-night',
      jiangjinjiu: 'r3-20f-jiangjinjiu-night',
      takemehand: 'r4-23g-takemehand-night',
      wenxian: 'r5-20a-wenxian-night',
      gaobai: 'r5-20c-gaobai-night',
      jianwen: 'r5-20e-jianwen-night',
      yyt: 'r6-23c-yyt-night',
      emperor: 'r6-23e-emperor-night',
      avucii: 'r6-23g-avucii-night',
      xingqing: 'r6-23i-xingqing-night',
    }
    const organizationCharacters = Object.values(characters)
      .filter((character) => character.organization)
      .map((character) => character.id)
      .sort()
    expect(organizationCharacters).toHaveLength(28)
    expect(Object.keys(memberInteractionNodes).sort()).toEqual(organizationCharacters)

    const byId = new Map(storyNodes.map((node) => [node.id, node]))
    for (const [character, nodeId] of Object.entries(memberInteractionNodes)) {
      const scene = byId.get(nodeId)
      expect(scene, `${character}/${nodeId}`).toBeDefined()
      expect(scene?.speaker, nodeId).toBe(character)
      expect(scene?.portrait, nodeId).toBe(character)
      expect(scene?.historical, nodeId).toBe('fictional')
      expect(scene?.choices?.length, nodeId).toBeGreaterThanOrEqual(2)

      for (const choice of scene?.choices ?? []) {
        expect(typeof choice.next, `${nodeId}/${choice.id}`).toBe('string')
        if (typeof choice.next !== 'string') continue
        const reply = byId.get(choice.next)
        expect(reply, `${nodeId}/${choice.id} -> ${choice.next}`).toBeDefined()
        expect(reply?.speaker, `${nodeId}/${choice.id}`).toBe(character)
        expect(reply?.portrait, `${nodeId}/${choice.id}`).toBe(character)
      }
    }
  })

  it('任何高层变更都不超过两个正式名额', () => {
    const invalid = storyNodes.flatMap((node) => [
      ...(node.onEnter ?? []),
      ...(node.choices ?? []).flatMap((choice) => choice.effects ?? []),
    ]).filter((effect) => effect.type === 'highCouncil' && effect.members.length > 2)
    expect(invalid).toEqual([])
  })

  it('序章只在最终路线选择展示五项，其余选择保持两到三项且不泄露数值后果', () => {
    const interactive = storyNodes.filter((node) => node.id.startsWith('p') && node.choices?.length)
    for (const node of interactive) {
      expect(node.choices?.length, node.id).toBeGreaterThanOrEqual(2)
      expect(node.choices?.length, node.id).toBeLessThanOrEqual(node.id === 'p10-route-choice' ? 6 : 3)
      expect(node.choices?.some((choice) => Boolean(choice.detail)), node.id).toBe(false)
    }
    expect(storyNodes.find((node) => node.id === 'p10-route-choice')?.choices).toHaveLength(6)
  })

  it('序章每条出口都不让日期倒退', () => {
    const byId = new Map(storyNodes.map((node) => [node.id, node]))
    for (const node of storyNodes.filter((item) => item.id.startsWith('p'))) {
      const exits = [
        ...targets(node.next),
        ...(node.choices ?? []).flatMap((choice) => targets(choice.next)),
        ...targets(node.textEntry?.next),
      ]
      for (const id of exits) {
        const next = byId.get(id)
        expect(next, `${node.id} -> ${id}`).toBeDefined()
        expect(Date.parse(next!.date), `${node.id} -> ${id}`).toBeGreaterThanOrEqual(Date.parse(node.date))
      }
    }
  })

  it('开区日、四组正式名称与大纲固定事实一致', () => {
    const opening = storyNodes.find((node) => node.id === 'p02-server-open')
    const yanqiuInvite = storyNodes.find((node) => node.id === 'p08-yanqiu-invite')
    expect(opening?.date).toBe('2026-07-17')
    expect(organizations.org4.name).toBe('天上白玉京')
    expect(yanqiuInvite?.text).toContain(organizations.org4.name)
  })

  it('第六组只在选定自建路线后命名，并能进入六组首节点', () => {
    const routeChoice = storyNodes.find((node) => node.id === 'p10-route-choice')
    const createSixth = storyNodes.find((node) => node.id === 'p10-route6-name')
    expect(routeChoice?.choices?.find((choice) => choice.id === 'lead-org6')?.next).toBe('p10-route6-name')
    expect(createSixth?.textEntry).toMatchObject({
      key: 'sixthOrganizationName',
      applyTo: 'organizationName',
      next: 'r6-00-founded',
    })
    const prematureSixthNameInputs = storyNodes.filter((node) =>
      node.id.startsWith('p')
      && node.id !== 'p10-route6-name'
      && node.textEntry?.key === 'sixthOrganizationName')
    expect(prematureSixthNameInputs).toEqual([])
  })

  it('到首次路线决定前至少经过33个可见剧情推进', () => {
    const byId = new Map(storyNodes.map((node) => [node.id, node]))
    const queue: Array<{ id: string; length: number }> = [{ id: 'p00-opening', length: 1 }]
    const shortest = new Map<string, number>()

    while (queue.length) {
      const current = queue.shift()!
      if ((shortest.get(current.id) ?? Number.POSITIVE_INFINITY) <= current.length) continue
      shortest.set(current.id, current.length)
      if (current.id === 'p10-route-choice') continue
      const node = byId.get(current.id)
      if (!node) continue
      const exits = [
        ...targets(node.next),
        ...(node.choices ?? []).flatMap((choice) => targets(choice.next)),
        ...targets(node.textEntry?.next),
      ]
      queue.push(...exits.map((id) => ({ id, length: current.length + 1 })))
    }

    expect(shortest.get('p10-route-choice')).toBeGreaterThanOrEqual(33)
  })

  it('2.7 的 s2FinaleEntry 终局入口选择在 2.8 开场被回收', () => {
    const byId = new Map(storyNodes.map((node) => [node.id, node]))
    const entryNext = byId.get('s2-2.8-entry')?.next
    if (typeof entryNext !== 'object' || entryNext.type !== 'conditional') {
      throw new Error('s2-2.8-entry 应以条件分流回收 s2FinaleEntry')
    }
    const finaleCases = entryNext.cases.filter((item) => (
      item.when.type === 'variable' && item.when.key === 's2FinaleEntry'
    ))
    expect(finaleCases.map((item) => (item.when.type === 'variable' ? item.when.value : '')).sort())
      .toEqual(['cut-losses', 'stand-firm'])
    for (const targetId of [...finaleCases.map((item) => item.next), entryNext.fallback]) {
      const variantNext = byId.get(targetId)?.next
      expect(typeof variantNext === 'object' && variantNext.type, targetId).toBe('conditional')
    }
  })
})
