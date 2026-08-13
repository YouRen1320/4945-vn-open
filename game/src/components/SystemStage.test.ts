// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'

import { createInitialGameState } from '@/engine/state'

import SystemStage from './SystemStage.vue'

import type { StoryNode } from '@/engine/types'

const node: StoryNode = {
  id: 'system-stage-organization-test',
  chapter: 'prologue',
  actLabel: '事件二 · 暑假桥接篇',
  date: '2026-08-09',
  title: '名单落定',
  location: '4945区 · 组织列表',
  mode: 'system',
  speaker: 'system',
  text: '成员变动已确认。',
  background: 'organization',
  next: 's2-august-finalize',
}

let unmount: (() => void) | undefined

afterEach(() => {
  unmount?.()
  unmount = undefined
  document.body.replaceChildren()
})

const renderOrganizationClient = (namesPublished: boolean) => {
  const state = createInitialGameState({ playerName: '测试玩家' })
  state.route = 'org2'
  state.organization = 'org2'
  state.organizationName = '江南'
  if (namesPublished) state.flags.s2AugustOrganizationNamesPublished = true

  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp({
    render: () => h(SystemStage, {
      node,
      state,
      visibleText: node.text,
      revealComplete: true,
      canAdvance: true,
      choices: [],
      sceneRevision: 1,
      ui: 'organization',
    }),
  })
  app.mount(host)
  unmount = () => app.unmount()
  return host
}

const renderLegacyMidBridgeSave = () => {
  const state = createInitialGameState({ playerName: '测试玩家' })
  state.route = 'org2'
  state.organization = 'org2'
  state.organizationName = '江南'
  state.nodeId = 's2-august-transfer-result'
  state.date = '2026-08-09'

  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp({
    render: () => h(SystemStage, {
      node,
      state,
      visibleText: node.text,
      revealComplete: true,
      canAdvance: true,
      choices: [],
      sceneRevision: 1,
      ui: 'organization',
    }),
  })
  app.mount(host)
  unmount = () => app.unmount()
  return host
}

describe('SystemStage 组织名单时点', () => {
  it('事件一仍显示开服组织名', () => {
    const host = renderOrganizationClient(false)
    expect(host.textContent).toContain('群雄逐鹿')
    expect(host.textContent).toContain('江南')
    expect(host.textContent).not.toContain('云山乱清雪')
  })

  it('8 月挂牌后全席位同步显示新名单', () => {
    const host = renderOrganizationClient(true)
    expect(host.textContent).toContain('8月重组后')
    expect(host.textContent).toContain('云山乱清雪')
    expect(host.textContent).toContain('云梦仙踪')
    expect(host.textContent).toContain('虚妄月华')
    expect(host.textContent).toContain('镜花水月')
    expect(host.textContent).toContain('心之所向')
    expect(host.textContent).toContain('首领 · 心跳成瘾')
    expect(host.textContent).toContain('首领 · 夏娜')
    expect(host.textContent).toContain('首领 · 路人K')
    expect(host.textContent).toContain('首领 · 铁碎牙')
    expect(host.textContent).toContain('首领 · 困醒')
    expect(host.textContent).not.toContain('群雄逐鹿')
  })

  it('已停在 8 月桥接篇中途的旧存档无需重进节点也显示新名单', () => {
    const host = renderLegacyMidBridgeSave()
    expect(host.textContent).toContain('8月重组后')
    expect(host.textContent).toContain('云梦仙踪')
    expect(host.textContent).not.toContain('江南')
  })
})
