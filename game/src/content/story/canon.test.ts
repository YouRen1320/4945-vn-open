import { describe, expect, it } from 'vitest'

import { storyById } from './index'
import { route3Nodes } from './route3'
import { route4Nodes } from './route4'
import { route5Nodes } from './route5'
import { ENDING_REGISTRY } from '@/content/endingRegistry'

const node = (id: string) => {
  const result = storyById[id]
  expect(result, id).toBeDefined()
  return result!
}

describe('跨路线固定史实', () => {
  it('8 月改名后，共通事件二场景不再把二组旧名当作全区地名', () => {
    const formalSeason2Nodes = Object.values(storyById).filter((item) => (
      item.id.startsWith('s2-prologue-') || item.id.startsWith('s2-2.')
    ))
    for (const event of formalSeason2Nodes) {
      expect(event.location, event.id).not.toBe('江南')
      expect(event.text, event.id).not.toMatch(/江南(?:下了|在脚下|的灯|多了一间)/)
    }
  })

  it('事件二结局画廊使用重组后的组织称谓且保持稳定 ID', () => {
    const expected = {
      org2: '云梦仙踪', org3: '虚妄月华', org4: '镜花水月', org5: '心之所向',
    } as const
    for (const [route, name] of Object.entries(expected)) {
      const entries = ENDING_REGISTRY.filter((ending) => ending.id.startsWith(`s2-ending-${route}-`))
      expect(entries.map((ending) => ending.id).sort()).toEqual([
        `s2-ending-${route}-compromise`, `s2-ending-${route}-triumph`,
      ])
      expect(entries.every((ending) => ending.subtitle.startsWith(`${name} ·`))).toBe(true)
    }
  })

  it('把爆群固定在7月20日，并明确骗权与清空成员的过程', () => {
    const explosionIds = [
      'r3-07-group-explosion',
      'r4-10-xilufei-burst',
      'r5-09-xilufei',
      'r6-08-xilufei',
    ]

    for (const id of explosionIds) {
      const event = node(id)
      expect(event.date, id).toBe('2026-07-20')
      expect(event.text, id).toContain('老区')
      expect(event.text, id).toContain('祈福')
      expect(event.text, id).toContain('管理员')
      expect(event.text, id).toContain('所有能够移除的成员')
    }
  })

  it('把拒战与希露菲退出固定在7月21日', () => {
    const exitIds = [
      'r3-09-xilufei-exits',
      'r4-10b-xilufei-leaves',
      'r5-09b-xilufei-leaves',
      'r6-08b-xilufei-leaves',
    ]

    for (const id of exitIds) {
      const event = node(id)
      expect(event.date, id).toBe('2026-07-21')
      expect(event.text, id).toMatch(/二组首领拒绝向一组开战|江南首领拒绝开战/)
      expect(event.text, id).toContain('退出二组群')
    }
  })

  it('拆分节点后仍按20日爆群、21日群策略与退出的顺序推进', () => {
    expect(node('r4-07-fixed-facts').next).toBe('r4-10-xilufei-burst')
    expect(node('r4-10-xilufei-burst').next).toBe('r4-08-two-groups')
    expect(node('r4-09-group-policy').choices?.map((choice) => choice.next)).toEqual([
      'r4-09c-external-groups-reply',
      'r4-09d-old-group-reply',
      'r4-09e-both-groups-reply',
    ])
    for (const responseId of ['r4-09c-external-groups-reply', 'r4-09d-old-group-reply', 'r4-09e-both-groups-reply']) {
      expect(node(responseId).next).toBe('r4-09b-policy-posted')
    }
    expect(node('r4-09b-policy-posted').next).toMatchObject({ fallback: 'r4-10b-xilufei-leaves' })

    expect(node('r5-06-fixed-demotions').next).toBe('r5-09-xilufei')
    expect(node('r5-09-xilufei').next).toBe('r5-07-two-groups')
    expect(node('r5-08-choose-channel').choices?.map((choice) => choice.next)).toEqual([
      'r5-08a-own-source-reply',
      'r5-08b-old-group-reply',
      'r5-08c-new-group-reply',
    ])
    for (const responseId of ['r5-08a-own-source-reply', 'r5-08b-old-group-reply', 'r5-08c-new-group-reply']) {
      expect(node(responseId).next).toBe('r5-09b-xilufei-leaves')
    }

    expect(node('r6-05-fixed-resolution').next).toBe('r6-08-xilufei')
    expect(node('r6-08-xilufei').next).toBe('r6-06-two-groups')
    expect(node('r6-07-legitimacy').choices?.map((choice) => choice.next)).toEqual([
      'r6-07c-independent-authority-reply',
      'r6-07d-dual-channel-reply',
      'r6-07e-old-group-reply',
    ])
    for (const responseId of ['r6-07c-independent-authority-reply', 'r6-07d-dual-channel-reply', 'r6-07e-old-group-reply']) {
      expect(node(responseId).next).toBe('r6-07b-channel-rule-pinned')
    }
    expect(node('r6-07b-channel-rule-pinned').next).toBe('r6-08b-xilufei-leaves')
  })

  it('固定告白与OguriC在7月26日进入三组、告白在7月28日进入一组', () => {
    expect(node('r3-16-merger-offer').date).toBe('2026-07-26')
    expect(node('r3-19-gaobai-leaves').date).toBe('2026-07-28')
    expect(node('r3-19-gaobai-leaves').text).toContain('我去一组')

    expect(node('r4-14-merger-news').date).toBe('2026-07-26')
    expect(node('r4-14-merger-news').text).toContain('OguriC（小栗帽）与告白于7月26日加入三组')
    expect(node('r4-14-merger-news').text).not.toContain('两天后')
    expect(node('r4-22-sixth-falls').date).toBe('2026-07-28')
    expect(node('r4-22a-gaobai-to-org1').date).toBe('2026-07-28')
    expect(node('r4-22a-gaobai-to-org1').text).toMatch(/告白.*一组.*7月26日.*28日/)

    expect(node('r5-17-after-transfer').date).toBe('2026-07-26')
    expect(node('r5-17-after-transfer').text).toContain('OguriC与告白于7月26日转入三组')
    expect(node('r5-19-gaobai-moves-again').date).toBe('2026-07-28')
    expect(node('r5-19-gaobai-moves-again').text).toMatch(/告白.*两天后.*一组/)
  })

  it('每条相关路线只在首次出现时标注OguriC的小栗帽别名', () => {
    // 序列化包含正文、选项与CG说明，可防止同一路线后文重新切回另一昵称。
    for (const route of [route3Nodes, route4Nodes, route5Nodes]) {
      const serialized = JSON.stringify(route)
      expect(serialized).toContain('OguriC（小栗帽）')
      expect(serialized.match(/小栗帽/g)).toHaveLength(1)
    }
  })

  it('同一场与世界为敌事件不再使用互相冲突的罗马编号', () => {
    for (const id of ['r2-09-world-enemy-starts', 'r3-04-world-enemy', 'r4-04-world-enemy', 'r6-03-world-enemy']) {
      expect(node(id).title, id).toBe('与世界为敌')
    }
  })
})
