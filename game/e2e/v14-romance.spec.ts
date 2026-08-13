import { expect, test } from '@playwright/test'

import type { Locator, Page } from '@playwright/test'

const AUTO_SAVE_KEY = '4945-vn:v4:save:auto'
const COLLECTION_KEY = '4945-vn:collection'

interface SavedNodeSetup {
  route: 'org2' | 'org4' | 'org5' | 'org6'
  organizationName: string
  flags?: string[]
  relationship?: {
    character: 'swordheart' | 'huayue' | 'wenxian'
    trust: number
    affinity: number
  }
  resetUnlock?: { cg: string; ending: string }
}

const startGame = async (page: Page) => {
  // Reduced motion makes text and scene transitions deterministic in build-preview E2E runs.
  await page.addInitScript(() => {
    localStorage.setItem('4945-vn:settings', JSON.stringify({ reducedMotion: true, textSpeed: 0 }))
  })
  await page.goto('/')
  await page.getByRole('button', { name: /开始主线/ }).click()
  await page.getByRole('button', { name: '查看消息' }).click()
  await page.getByRole('button', { name: '接受邀请' }).click()
  await page.getByLabel('这次准备叫什么？').fill('V1.4验收')
  await page.getByRole('button', { name: '进入4945区' }).click()
  await expect(page.locator('.game-shell')).toBeVisible()
}

// QA enters late nodes through the same persisted-save contract used by Continue.
// Removing the target from processedNodes guarantees its real onEnter unlocks execute once on load.
const jumpToSavedNode = async (page: Page, nodeId: string, setup: SavedNodeSetup) => {
  await page.evaluate(({ key, target, setup }) => {
    const record = JSON.parse(localStorage.getItem(key) ?? 'null')
    if (!record?.state) throw new Error('自动存档尚未建立')

    record.nodeId = target
    record.state.nodeId = target
    record.state.route = setup.route
    record.state.organization = setup.route
    record.state.organizationName = setup.organizationName
    record.state.role = 'leader'
    if (setup.route === 'org6') {
      record.state.variables.sixthOrganizationName = setup.organizationName
    }
    record.state.processedNodes = (record.state.processedNodes ?? []).filter((id: string) => id !== target)
    record.state.seenNodes = (record.state.seenNodes ?? []).filter((id: string) => id !== target)

    for (const flag of setup.flags ?? []) record.state.flags[flag] = true
    if (setup.relationship) {
      const current = record.state.relationships[setup.relationship.character]
      record.state.relationships[setup.relationship.character] = {
        ...current,
        trust: setup.relationship.trust,
        affinity: setup.relationship.affinity,
      }
    }
    if (setup.resetUnlock) {
      record.state.unlockedCgs = record.state.unlockedCgs.filter((id: string) => id !== setup.resetUnlock!.cg)
      record.state.unlockedEndings = record.state.unlockedEndings.filter((id: string) => id !== setup.resetUnlock!.ending)
    }

    localStorage.setItem(key, JSON.stringify(record))
  }, { key: AUTO_SAVE_KEY, target: nodeId, setup })

  await page.reload()
  await page.getByRole('button', { name: /继续主线/ }).click()
  await expect(page.locator('.game-shell')).toBeVisible()
}

const expectNoHorizontalOverflow = async (page: Page) => {
  const overflow = await page.evaluate(() => (
    Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth
  ))
  expect(overflow).toBeLessThanOrEqual(1)
}

const expectDecodedImage = async (image: Locator) => {
  await expect(image).toBeVisible()
  await expect.poll(() => image.evaluate((element) => {
    const target = element as HTMLImageElement
    return target.complete && target.naturalWidth > 0 && target.naturalHeight > 0
  })).toBe(true)
}

const expectDecodedSceneCg = async (page: Page, fileName: string) => {
  const scene = page.locator(`.scene-image[data-image-url*="${fileName}"]`)
  await expect(scene).toHaveAttribute('data-image-state', 'ready')
  await expect.poll(() => scene.evaluate((element) => getComputedStyle(element).opacity)).toBe('1')
  await expect(page.locator('.cg-mark')).toContainText('EVENT CG')

  // SceneBackdrop renders CGs as CSS backgrounds, so decode the same URL explicitly as an image too.
  const dimensions = await page.evaluate(async (url) => {
    const image = new Image()
    image.src = url
    await image.decode()
    return { width: image.naturalWidth, height: image.naturalHeight }
  }, `/assets/cg/${fileName}`)
  expect(dimensions.width).toBeGreaterThan(0)
  expect(dimensions.height).toBeGreaterThan(0)
}

const readCollection = async (page: Page) => page.evaluate((key) => {
  const value = JSON.parse(localStorage.getItem(key) ?? 'null')
  if (!value) throw new Error('永久收藏尚未建立')
  return value as { unlockedCgs: string[]; unlockedEndings: string[] }
}, COLLECTION_KEY)

test('手机竖屏解码剑心与华月攻略CG，并由正式节点永久解锁关系结局和鉴赏', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await startGame(page)

  await jumpToSavedNode(page, 'r2-31-bond-swordheart', {
    route: 'org2',
    organizationName: '江南',
    flags: ['swordheartRosterChecked', 'swordheartReconnectedRoster', 'swordheartLastCheck'],
    relationship: { character: 'swordheart', trust: 6, affinity: 5 },
    resetUnlock: { cg: 'cg43-bond-swordheart', ending: 'bond-swordheart' },
  })
  await expect(page.locator('.dialogue-zone > p[aria-hidden="true"]')).toContainText(/那十分钟可以只留给你/)
  await expectDecodedSceneCg(page, 'bond-swordheart-v1.webp')
  await expectNoHorizontalOverflow(page)
  await page.screenshot({ path: 'artifacts/qa-v14-swordheart-bond-mobile.png' })

  let collection = await readCollection(page)
  expect(collection.unlockedCgs).toContain('cg43-bond-swordheart')
  expect(collection.unlockedEndings).toContain('bond-swordheart')

  await jumpToSavedNode(page, 'r4-24-bond-huayue', {
    route: 'org4',
    organizationName: '天上白玉京',
    flags: ['huayueSharedVulnerability', 'huayueSharedNightShift', 'huayueTrustedWithWeakness'],
    relationship: { character: 'huayue', trust: 6, affinity: 6 },
    resetUnlock: { cg: 'cg44-bond-huayue', ending: 'bond-huayue' },
  })
  await expect(page.locator('.dialogue-zone > p[aria-hidden="true"]')).toContainText(/然后去你好友列表里抓人/)
  await expectDecodedSceneCg(page, 'bond-huayue-v1.webp')
  await expectNoHorizontalOverflow(page)
  await page.screenshot({ path: 'artifacts/qa-v14-huayue-bond-mobile.png' })

  collection = await readCollection(page)
  expect(collection.unlockedCgs).toEqual(expect.arrayContaining([
    'cg43-bond-swordheart',
    'cg44-bond-huayue',
  ]))
  expect(collection.unlockedEndings).toEqual(expect.arrayContaining([
    'bond-swordheart',
    'bond-huayue',
  ]))

  await page.getByRole('button', { name: '菜单' }).click()
  await page.getByRole('button', { name: '鉴赏' }).click()
  await expectDecodedImage(page.getByRole('img', { name: '守到最后一轮' }))
  await expectDecodedImage(page.getByRole('img', { name: '接过残局以后' }))
  await expect(page.locator('.bond-grid article').filter({ hasText: '剑斩凡人心' })).not.toHaveClass(/locked/)
  await expect(page.locator('.bond-grid article').filter({ hasText: '华月乌大王' })).not.toHaveClass(/locked/)
  await expectNoHorizontalOverflow(page)
})

test('温陷在经典舞台使用女性角色专属立绘与头像，手机竖屏不产生横向溢出', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await startGame(page)

  // p08-wenxian-invite explicitly uses the classic stage; route5 chat nodes intentionally use chat UI instead.
  await jumpToSavedNode(page, 'p08-wenxian-invite', {
    route: 'org5',
    organizationName: '未闻花名',
    relationship: { character: 'wenxian', trust: 5, affinity: 4 },
  })

  const sprite = page.getByRole('img', { name: '温陷soft表情立绘' })
  await expect(sprite).toHaveAttribute('src', /\/assets\/sprites\/wenxian\/expression-soft-v1\.webp$/)
  await expectDecodedImage(sprite)
  await expect(page.locator('.character-stage .fallback-card')).toHaveCount(0)
  await expectNoHorizontalOverflow(page)

  await page.getByRole('button', { name: '状态' }).click()
  const wenxianRelation = page.locator('.bond-list > div').filter({ hasText: '温陷' })
  const avatar = wenxianRelation.locator('img')
  await expect(avatar).toHaveAttribute('src', /\/assets\/avatars\/wenxian\.webp$/)
  await expectDecodedImage(avatar)
  await expect(wenxianRelation.getByRole('progressbar', { name: '温陷攻略值' })).toHaveAttribute('aria-valuenow', '0')
  await expect(wenxianRelation.locator('strong')).toContainText('0%')
  await expect(wenxianRelation.locator('strong small')).toHaveText('5/4')
  await expectNoHorizontalOverflow(page)
  await page.getByRole('button', { name: '关闭' }).click()

  await jumpToSavedNode(page, 'r5-21-bond-wenxian', {
    route: 'org5',
    organizationName: '未闻花名',
    relationship: { character: 'wenxian', trust: 6, affinity: 6 },
  })
  await expectDecodedSceneCg(page, 'bond-wenxian-v1.webp')
  await page.screenshot({ path: 'artifacts/qa-v14-wenxian-bond-mobile.png' })

  await jumpToSavedNode(page, 'r5-17-after-transfer', {
    route: 'org5',
    organizationName: '未闻花名',
  })
  await expectDecodedSceneCg(page, 'partial-transfer-v1.webp')
  await page.screenshot({ path: 'artifacts/qa-v14-wenxian-transfer-mobile.png' })

  await jumpToSavedNode(page, 'r5-01-shi-leaves', {
    route: 'org5',
    organizationName: '未闻花名',
  })
  await expectDecodedSceneCg(page, 'route5-empty-seat-v1.webp')
  await page.screenshot({ path: 'artifacts/qa-v14-wenxian-empty-seat-mobile.png' })
})

test('第五与第六组显式聊天立绘进入手机演出区，不再只存在于剧情数据', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await startGame(page)

  await jumpToSavedNode(page, 'r5-01a-empty-seat-chat', {
    route: 'org5',
    organizationName: '未闻花名',
  })
  const wenxianChatSprite = page.getByRole('img', { name: '温陷concerned表情聊天演出立绘' })
  await expectDecodedImage(wenxianChatSprite)
  await expect(wenxianChatSprite).toHaveAttribute('src', /\/assets\/sprites\/wenxian\/expression-concerned-v1\.webp$/)
  await expect(page.getByLabel('聊天角色演出')).toContainText('温陷')
  await expectNoHorizontalOverflow(page)
  await page.screenshot({ path: 'artifacts/qa-v14-r5-chat-art-mobile.png' })

  await jumpToSavedNode(page, 'r6-09b-qifu-acknowledges', {
    route: 'org6',
    organizationName: '第六席',
  })
  const qifuChatSprite = page.getByRole('img', { name: '祈福concerned表情聊天演出立绘' })
  await expectDecodedImage(qifuChatSprite)
  await expect(qifuChatSprite).toHaveAttribute('src', /\/assets\/sprites\/qifu\/expression-concerned-v1\.webp$/)
  await expect(page.getByLabel('聊天角色演出')).toContainText('祈福')
  await expectNoHorizontalOverflow(page)
  await page.screenshot({ path: 'artifacts/qa-v14-r6-chat-art-mobile.png' })
})
