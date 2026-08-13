import { describe, expect, it } from 'vitest'

import { romanceCandidates } from '@/content/characters'
import { s3PrologueNodes } from './s3-prologue'
import { availableChoices, commitChoice, createInitialGameState, enterNode, resolveTarget } from '@/engine/state'
import type { StoryNode } from '@/engine/types'

const byId = Object.fromEntries(s3PrologueNodes.map((node) => [node.id, node])) as Record<string, StoryNode>
const routes = ['org2', 'org3', 'org4', 'org5', 'org6'] as const
const partners = [...romanceCandidates, 'bottle', 'truth', 'none'] as const
const responses = ['s3-demand-evidence', 's3-conditional-acceptance', 's3-public-refusal', 's3-hold-and-investigate']
const responseNodes: Record<string, string> = {
  's3-demand-evidence': 's3-prologue-reply-evidence',
  's3-conditional-acceptance': 's3-prologue-reply-conditional',
  's3-public-refusal': 's3-prologue-reply-refusal',
  's3-hold-and-investigate': 's3-prologue-reply-investigate',
}

const run = (route: typeof routes[number], partner: typeof partners[number], response: string) => {
  let state = createInitialGameState({ playerName: '事件三测试员' })
  state.route = route
  state.organization = route
  state.organizationName = route === 'org6' ? '自定义六组' : `组织-${route}`
  state.variables.s3Partner = partner
  state.variables.s3EndingLabel = '继承结果'
  const seen: string[] = []
  let guard = 0
  let node = byId['s3-prologue-entry']!
  state = enterNode(state, node)
  while (node.id !== 's3-prologue-exit') {
    if (guard++ > 80) throw new Error('事件三序章未收敛')
    seen.push(node.id)
    const choices = availableChoices(node, state)
    if (choices.length) {
      const choice = choices.find((item) => item.id === response)
      if (!choice) throw new Error(`找不到公开回应 ${response}`)
      const result = commitChoice(state, node, response)
      state = result.state
      node = byId[result.next]!
    } else {
      if (!node.next) throw new Error(`意外终点 ${node.id}`)
      node = byId[resolveTarget(node.next, state)]!
    }
    state = enterNode(state, node)
  }
  seen.push(node.id)
  return { state, seen }
}

describe('事件三共通序章', () => {
  it('所有节点保持独立 s3 图且只有一个完成哨兵', () => {
    expect(s3PrologueNodes.every((node) => node.id.startsWith('s3-prologue-'))).toBe(true)
    expect(new Set(s3PrologueNodes.map((node) => node.id)).size).toBe(s3PrologueNodes.length)
    expect(s3PrologueNodes.filter((node) => !node.next && !node.choices)).toEqual([
      expect.objectContaining({ id: 's3-prologue-exit' }),
    ])
  })

  it.each(routes)('%s 承受不同的具体冻结损失', (route) => {
    const { seen } = run(route, 'none', 's3-demand-evidence')
    expect(seen).toContain(`s3-prologue-${route}-return`)
    expect(seen).toContain(`s3-prologue-impact-${route}`)
  })

  it.each(partners)('%s 有专属关系承认且不会落入错误人物', (partner) => {
    const { seen } = run('org3', partner, 's3-conditional-acceptance')
    expect(seen).toContain(`s3-prologue-partner-${partner}`)
  })

  it('穷举五路线、十五关系状态、四个回应共 300 条路径', () => {
    let count = 0
    for (const route of routes) {
      for (const partner of partners) {
        for (const response of responses) {
          const { state, seen } = run(route, partner, response)
          expect(seen).toContain(responseNodes[response])
          expect(state.flags.s3PrologueComplete).toBe(true)
          expect(state.variables.s3OpeningResponse).toBeTruthy()
          expect(state.nodeId).toBe('s3-prologue-exit')
          count++
        }
      }
    }
    expect(count).toBe(300)
  })

  it('非法路线不会被静默伪造成二组', () => {
    const state = createInitialGameState({ playerName: '损坏档' })
    state.variables.s3Partner = 'none'
    const entered = enterNode(state, byId['s3-prologue-entry']!)
    expect(resolveTarget(byId['s3-prologue-entry']!.next!, entered)).toBe('s3-prologue-route-repair')
  })
})
