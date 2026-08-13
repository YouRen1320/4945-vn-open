import { describe, expect, it } from 'vitest'

import { createInitialGameState, enterNode, commitChoice, resolveTarget } from '@/engine/state'
import { storyById } from './index'

const node = (id: string) => {
  const result = storyById[id]
  expect(result, id).toBeDefined()
  return result!
}

describe('第一季共通序章', () => {
  it('用玩家认可的三种开区动机开场，并保留稳定 choice id', () => {
    const openingChoice = node('p01-mentor-call')
    expect(openingChoice.choices?.map((choice) => [choice.id, choice.label])).toEqual([
      ['ask-growth', '“老区没玩好，这次新区我要认真地玩一下。”'],
      ['just-login', '“开新区我也要来，老区太无聊了。”'],
      ['ask-organizations', '“首领叫祈福吗？他和你关系怎么样？你们都是老区来的吗？”'],
    ])

    expect(node('p01a-growth-reply').text).toContain('一起冲击本服排行榜，冲个一组')
    expect(node('p01c-login-reply').text).toContain('一起开新区，正好缺人')
    expect(node('p01b-organization-reply').text).toContain('等4999区开服就走')
  })

  it.each([
    ['ask-growth', 'serious', 'p06c-next-evening'],
    ['just-login', 'together', 'p06b-together-echo'],
    ['ask-organizations', 'curious', 'p06b-curious-echo'],
  ])('让开场选择 %s 在被一组换下后形成后续回响', (choiceId, motive, expectedNext) => {
    const openingChoice = node('p01-mentor-call')
    let state = enterNode(createInitialGameState({ playerName: '新手' }), openingChoice)
    state = commitChoice(state, openingChoice, choiceId).state

    expect(state.variables.s1OpeningMotive).toBe(motive)
    expect(resolveTarget(node('p06b-mentor-kick').next!, state)).toBe(expectedNext)
  })

  it('为开服资源选择提供当场角色回应', () => {
    const resourceChoice = node('p02b-first-fight')
    expect(resourceChoice.choices?.map((choice) => choice.next)).toEqual([
      'p02b-grind-reply',
      'p02b-guide-reply',
    ])
    expect(node('p02b-grind-reply')).toMatchObject({ speaker: 'mentor', mode: 'chat' })
    expect(node('p02b-guide-reply')).toMatchObject({ speaker: 'bottle', mode: 'chat' })
  })

  it('让第二晚的升级选择先得到回应，再进入组织招募', () => {
    const levelChoice = node('p06d-level-sprint')
    expect(levelChoice.choices?.map((choice) => choice.next)).toEqual([
      'p06d-mentor-reply',
      'p06d-solo-reply',
    ])
    expect(node('p06d-mentor-reply').next).toBe('p07-recruitment-feed')
    expect(node('p06d-solo-reply').next).toBe('p07-recruitment-feed')
  })

  it.each([
    ['ask-growth', 'p08-motive-serious'],
    ['just-login', 'p08-motive-together'],
    ['ask-organizations', 'p08-motive-curious'],
  ])('在最终选择组织前再次回收开场选择 %s', (choiceId, expectedNext) => {
    const openingChoice = node('p01-mentor-call')
    let state = enterNode(createInitialGameState({ playerName: '新手' }), openingChoice)
    state = commitChoice(state, openingChoice, choiceId).state
    expect(resolveTarget(node('p08-second-wenxian').next!, state)).toBe(expectedNext)
    expect(node(expectedNext).next).toBe('p08-mentor-debrief')
  })

  it('保留六条正式路线的稳定选择 id 和入口', () => {
    expect(node('p10-route-choice').choices?.map((choice) => [choice.id, choice.next])).toEqual([
      ['join-org1', 'r1-00-joined'],
      ['lead-org2', 'r2-00-founded'],
      ['lead-org3', 'r3-00-founded'],
      ['lead-org4', 'r4-00-founded'],
      ['lead-org5', 'r5-00-founded'],
      ['lead-org6', 'p10-route6-name'],
    ])
  })
})
