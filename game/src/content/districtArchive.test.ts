import { describe, expect, it } from 'vitest'

import { projectAssetUrls } from './assets'
import {
  districtArchiveAssetUrls,
  districtArchiveSourceFiles,
  districtEvidenceRecords,
  districtRoster,
  districtTimeline,
} from './districtArchive'

describe('4945 区史素材合同', () => {
  it('将一个时间线、二十张事件截图与三十二张人物图全部唯一登记', () => {
    expect(districtTimeline).toHaveLength(4)
    expect(districtEvidenceRecords).toHaveLength(20)
    expect(districtRoster).toHaveLength(32)
    expect(districtArchiveSourceFiles).toHaveLength(53)
    expect(new Set(districtArchiveSourceFiles).size).toBe(53)
  })

  it('每份聊天记录都有摘要、证据类别、剧情落点和原图指纹', () => {
    for (const record of districtEvidenceRecords) {
      expect(record.summary.length).toBeGreaterThan(20)
      expect(['confirmed', 'adapted', 'claim']).toContain(record.kind)
      expect(record.storyNode).toMatch(/^s2-august-/)
      expect(record.sourceHash).toMatch(/^[a-f0-9]{64}$/)
      expect(record.sourceFile).toMatch(/\.png$/)
    }
  })

  it('公开资源只包含名册安全头像，不包含原聊天截图', () => {
    expect(districtArchiveAssetUrls).toHaveLength(32)
    expect(new Set(districtArchiveAssetUrls).size).toBe(32)
    expect(projectAssetUrls).toEqual(expect.arrayContaining(districtArchiveAssetUrls))
    expect(projectAssetUrls.some((url) => /苏铭事件|踢人事件|\.png$/i.test(url))).toBe(false)
  })

  it('疑似真人素材使用虚构替代头像并明确标注', () => {
    expect(districtRoster.filter((entry) => entry.privacy === 'fictionalized-replacement').map((entry) => entry.name))
      .toEqual(['猎辰', '傲慢与偏见'])
  })
})
