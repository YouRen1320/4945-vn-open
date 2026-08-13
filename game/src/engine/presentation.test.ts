import { describe, expect, it } from 'vitest'

import type { StoryNode } from './types'

import { resolveSceneDirection } from './presentation'

describe('场景导演解析', () => {
  it('同时透传桌面CG与竖屏CG，不改变故事节点契约', () => {
    const node: StoryNode = {
      id: 'test-portrait-cg',
      chapter: 'prologue',
      actLabel: '测试场景',
      date: '2026-07-29',
      mode: 'interlude',
      speaker: 'narrator',
      text: '测试双构图CG。',
      background: 'login',
      presentation: {
        cg: '/assets/cg/ending-route2-v1.webp',
        cgPortrait: '/assets/cg/invitation-phone-v1.webp',
      },
    }

    expect(resolveSceneDirection(node)).toMatchObject({
      cg: '/assets/cg/ending-route2-v1.webp',
      cgPortrait: '/assets/cg/invitation-phone-v1.webp',
    })
  })

  it('成员夜话聊天自动显示当前说话人，但普通聊天仍使用纯聊天界面', () => {
    const memberNight: StoryNode = {
      id: 'r6-23i-xingqing-night',
      chapter: 'epilogue',
      actLabel: '成员夜话 · 星晴',
      date: '2026-07-28',
      mode: 'chat',
      speaker: 'xingqing',
      portrait: 'xingqing',
      text: '星晴发来猫叫语音。',
      background: 'nightMessage',
    }
    const ordinaryChat: StoryNode = {
      ...memberNight,
      id: 'ordinary-private-chat',
      actLabel: '第一幕 · 私聊',
    }

    expect(resolveSceneDirection(memberNight).sprites).toEqual([
      expect.objectContaining({ character: 'xingqing' }),
    ])
    expect(resolveSceneDirection(ordinaryChat).sprites).toEqual([])
  })

  it('三组角色化幕名的夜话节点同样显示当前说话人', () => {
    const node: StoryNode = {
      id: 'r3-20b-heartbeat-night',
      chapter: 'epilogue',
      actLabel: '尾声 · 扩张派的算盘',
      date: '2026-07-28',
      mode: 'chat',
      speaker: 'heartbeat',
      portrait: 'heartbeat',
      text: '一起写回访名单。',
      background: 'nightMessage',
    }

    expect(resolveSceneDirection(node).sprites).toEqual([
      expect.objectContaining({ character: 'heartbeat' }),
    ])
  })

  it('带区服前缀的私聊仍优先使用私聊皮肤', () => {
    const node: StoryNode = {
      id: 's2-august-private-chat-test',
      chapter: 'prologue',
      actLabel: '事件二 · 暑假桥接篇',
      date: '2026-07-21',
      location: '4945区 · 私聊',
      mode: 'chat',
      speaker: 'qifu',
      text: '测试频道语义。',
      background: 'nightMessage',
    }

    expect(resolveSceneDirection(node).ui).toBe('private-chat')
  })
})
