// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h } from 'vue'

import type { Season2OutcomeRecord } from '@/engine/season2-outcome'

const relationshipIds = ['heartbeat', 'avucii'] as const

vi.mock('@/engine/season2-storage', () => ({
  deleteSeason2OutcomeRecord: vi.fn(),
  readSeason2OutcomeArchive: () => relationshipIds.map((relationshipId, index) => ({
    recordId: `record-${relationshipId}`,
    lineageId: `lineage-${relationshipId}`,
    campaignId: `campaign-${relationshipId}`,
    contentRevision: 'test',
    digest: `digest-${relationshipId}`,
    createdAt: index + 1,
    summary: {
      summaryVersion: 2,
      source: { kind: 'save', slot: String(index + 1), savedAt: index + 1 },
      durableFacts: [],
      s2Complete: true,
      s2EpilogueComplete: true,
      finaleEndingId: 's2-finale-complete',
      completionEvidence: 'explicit',
      s2MainEnding: index === 0 ? 's2-ending-org3-compromise' : 's2-ending-org6-compromise',
      s2EpilogueEnding: index === 0 ? 's2-ending-org3-compromise' : 's2-ending-org6-compromise',
      s2RelationshipResolved: relationshipId,
      activePartner: relationshipId,
      route: index === 0 ? 'org3' : 'org6',
      organization: index === 0 ? 'org3' : 'org6',
      organizationName: index === 0 ? '抚梅观清雪' : '自定义第六组',
      stats: { cohesion: 1, reputation: 1, resources: 1 },
      unlockedEndings: [],
      createdAt: index + 1,
    },
  })) as Season2OutcomeRecord[],
}))

import OutcomeArchivePanel from './OutcomeArchivePanel.vue'

let unmount: (() => void) | undefined

afterEach(() => {
  unmount?.()
  unmount = undefined
  document.body.replaceChildren()
})

describe('OutcomeArchivePanel 关系标签', () => {
  it('为全部角色表中的合法伴侣显示昵称，而不是占位符', () => {
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp({ render: () => h(OutcomeArchivePanel) })
    app.mount(host)
    unmount = () => app.unmount()

    expect(host.textContent).toContain('心跳成瘾')
    expect(host.textContent).toContain('AVUCII')
    expect(host.textContent).toContain('虚妄月华 · 埋线')
    expect(host.textContent).toContain('自定义第六组')
    expect(host.textContent).not.toContain('抚梅观清雪')
    expect(host.textContent).not.toContain('—')
  })
})
