import { expect, test } from '@playwright/test'

const startEventOne = async (page: import('@playwright/test').Page) => {
  await page.getByRole('button', { name: /开始主线/ }).click()
  await page.getByRole('button', { name: '查看消息' }).click()
  await page.getByRole('button', { name: '接受邀请' }).click()
  await page.getByLabel('这次准备叫什么？').fill('主线验收')
  await page.getByRole('button', { name: '进入4945区' }).click()
}

test('手机首页以统一主线为中心，并正确展示独立开发者身份', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')

  await expect(page.getByRole('button', { name: /开始主线/ })).toBeInViewport()
  await expect(page.getByRole('button', { name: /主线进度/ })).toBeInViewport()
  await expect(page.getByText('YouRen 独立制作')).toBeVisible()
  await expect(page.getByText('第二季', { exact: true })).toHaveCount(0)
  await expect(page.locator('.title-actions button')).toHaveCount(2)
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1)
  await page.screenshot({ path: 'artifacts/qa-mainline-title-mobile.png' })

  await page.getByRole('button', { name: /更多内容/ }).click()
  const extrasDialog = page.getByRole('dialog', { name: '更多内容' })
  await expect(extrasDialog).toBeVisible()
  await expect.poll(() => extrasDialog.evaluate((element) => (
    getComputedStyle(element.parentElement as HTMLElement).opacity
  ))).toBe('1')
  await page.screenshot({ path: 'artifacts/qa-mainline-extras-mobile.png' })
  await page.getByRole('button', { name: /设置/ }).click()
  await expect(page.getByText('由YouRen独立开发与维护')).toBeVisible()
  await expect(page.getByText('开发者 QQ：1670615595')).toBeVisible()
  await page.getByRole('button', { name: '关闭' }).click()
  await page.setViewportSize({ width: 1440, height: 900 })
  await expect(page.locator('.title-actions button')).toHaveCount(2)
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1)
  await page.screenshot({ path: 'artifacts/qa-mainline-title-desktop.png' })
})

test('没有旧存档时，主线进度仍可通过回顾建档进入事件二', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /主线进度/ }).click()

  const progress = page.getByRole('dialog', { name: '主线进度 · 事件一与事件二' })
  await expect(progress.getByText(/没有可读取的事件一结局存档/)).toBeVisible()
  await expect(progress.getByRole('button', { name: '以回顾建档进入事件二' })).toBeEnabled()
  await expect(progress.getByRole('button', { name: '查看事件一存档' })).toBeVisible()
})

test('事件二季终必须封存结局后再返回标题', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /主线进度/ }).click()
  const progress = page.getByRole('dialog', { name: '主线进度 · 事件一与事件二' })
  await progress.getByLabel('你的名字').fill('季终验收')
  await progress.getByRole('button', { name: '天上白玉京', exact: true }).click()
  await progress.getByRole('button', { name: '砚秋水', exact: true }).click()
  await progress.getByRole('button', { name: '以回顾建档进入事件二' }).click()

  // 从正式回顾入口生成结构合法的 v5 档，再定位到季终卡；只缩短前置剧情，不伪造存储结构。
  await page.evaluate(() => {
    const key = Object.keys(localStorage).find((candidate) => candidate.startsWith('4945-vn:v5:save:'))
    const record = key ? JSON.parse(localStorage.getItem(key) ?? 'null') : null
    if (!key || !record?.state) throw new Error('事件二存档尚未建立')
    const state = record.state
    state.nodeId = 's2-2.9-summary'
    state.date = '2026-12-31'
    state.chapter = 'epilogue'
    state.route = 'org4'
    state.organization = 'org4'
    state.organizationName = '天上白玉京'
    state.activePartner = 'yanqiu'
    state.variables.s2MainEnding = 's2-ending-org4-triumph'
    state.variables.s2EpilogueEnding = 's2-ending-org4-triumph'
    state.variables.s2RelationshipResolved = 'yanqiu'
    state.variables.s2RelationshipTone = 'hard-won'
    state.unlockedEndings = [...new Set([...state.unlockedEndings, 's2-ending-org4-triumph'])]
    state.processedNodes = state.processedNodes.filter((id: string) => id !== 's2-2.9-summary' && id !== 's2-2.9-exit')
    state.episodeCompletion = {
      's2-prologue': true,
      's2-2.3': true,
      's2-2.4': true,
      's2-2.5': true,
      's2-2.6': true,
      's2-2.7': true,
      's2-2.8': true,
      's2-2.9': false,
    }
    record.nodeId = state.nodeId
    record.date = state.date
    record.chapter = state.chapter
    record.route = state.route
    record.organizationName = state.organizationName
    localStorage.setItem(key, JSON.stringify(record))
  })

  await page.reload()
  await page.getByRole('button', { name: /继续主线/ }).click()
  const complete = page.getByRole('button', { name: '封存结局并返回标题' })
  await expect(complete).toBeVisible({ timeout: 12_000 })
  await complete.click()

  const completedProgress = page.getByRole('dialog', { name: '主线进度 · 事件一与事件二' })
  await expect(completedProgress.getByText('已完成', { exact: true })).toBeVisible()
  await expect(completedProgress.getByRole('button', { name: /槽 1 季终验收/ })).toHaveCount(0)
  await page.getByRole('button', { name: '关闭' }).click()
  await expect(page.getByRole('button', { name: /继续主线/ })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /开始主线/ })).toBeVisible()
  await page.getByRole('button', { name: '更多内容' }).click()
  await page.getByRole('dialog', { name: '更多内容' }).getByRole('button', { name: /多季结局档案/ }).click()
  const archive = page.getByRole('article', { name: '多季结局档案' })
  await expect(archive.getByText('镜花水月 · 峰顶')).toBeVisible()
  await expect(archive.getByText('砚秋水', { exact: true })).toBeVisible()
  await expect.poll(() => page.evaluate(() => localStorage.getItem('4945-vn:v2:outcomes'))).not.toBeNull()
})

test('事件一片尾无滚动条和返回标题分流，可直接继续到事件二', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  await startEventOne(page)

  // 通过公开存档结构构造已完成的二组事件一，用于只验证片尾与跨事件衔接。
  await page.evaluate(() => {
    const key = '4945-vn:v4:save:auto'
    const record = JSON.parse(localStorage.getItem(key) ?? 'null')
    if (!record?.state) throw new Error('自动存档尚未建立')
    record.nodeId = 'credits-first-season'
    record.state.nodeId = 'credits-first-season'
    record.state.route = 'org2'
    record.state.organization = 'org2'
    record.state.organizationName = '二组'
    record.state.unlockedEndings = ['r2-second-pole']
    record.state.history.push({
      nodeId: 'r2-20-declare-war',
      date: '2026-07-21',
      speaker: 'player',
      speakerName: '主线验收',
      text: '拒绝把冲突升级成战争。',
      choiceLabel: '不宣战。先把谁能踢人查清楚。',
      timestamp: Date.now(),
    })
    localStorage.setItem(key, JSON.stringify(record))
  })
  await page.reload()
  await page.getByRole('button', { name: /继续主线/ }).click()

  const stage = page.locator('.ending-stage')
  await expect(stage).toBeVisible()
  await expect(stage.getByText('开发者 · YouRen')).toBeVisible({ timeout: 6_000 })
  await expect(stage.getByText('QQ 1670615595')).toBeVisible()
  const continueButton = stage.getByRole('button', { name: /继续主线 · 事件二/ })
  await expect(continueButton).toBeVisible({ timeout: 8_000 })
  await expect(stage.getByRole('button', { name: '返回标题' })).toHaveCount(0)
  expect(await page.evaluate(() => ({
    horizontal: document.documentElement.scrollWidth - innerWidth,
    vertical: document.documentElement.scrollHeight - innerHeight,
  }))).toEqual({ horizontal: 0, vertical: 0 })
  await expect(stage.locator('.ending-credits-scroll')).toHaveCount(0)
  await expect.poll(() => continueButton.evaluate((element) => getComputedStyle(element).opacity)).toBe('1')
  const continueBox = await continueButton.boundingBox()
  expect(continueBox?.y ?? -1).toBeGreaterThanOrEqual(0)
  expect((continueBox?.y ?? 999) + (continueBox?.height ?? 999)).toBeLessThanOrEqual(812)
  await page.screenshot({ path: 'artifacts/qa-mainline-ending-mobile.png' })

  await continueButton.click()
  await expect(stage).toHaveCount(0)
  await expect(page.locator('.chapter-mark')).toContainText('事件二')
  await expect.poll(() => page.evaluate(() => (
    Object.keys(localStorage).some((key) => key.startsWith('4945-vn:v5:save:'))
  ))).toBe(true)

  await page.getByRole('button', { name: '保存并返回标题' }).click()
  await expect(page.getByRole('button', { name: /继续主线/ })).toBeVisible()
  await page.getByRole('button', { name: /继续主线/ }).click()
  await expect(page.locator('.chapter-mark')).toContainText('事件二')
})

test('一组结局选择新组织后保留第一席传承并进入事件二', async ({ page }) => {
  test.setTimeout(60_000)
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  await startEventOne(page)

  await page.evaluate(() => {
    const key = '4945-vn:v4:save:auto'
    const record = JSON.parse(localStorage.getItem(key) ?? 'null')
    if (!record?.state) throw new Error('自动存档尚未建立')
    record.nodeId = 'credits-first-season'
    record.state.nodeId = 'credits-first-season'
    record.state.route = 'org1'
    record.state.organization = 'org1'
    record.state.organizationName = '群雄逐鹿'
    record.state.unlockedEndings = ['r1-order']
    record.state.history = []
    localStorage.setItem(key, JSON.stringify(record))
  })
  await page.reload()
  await page.getByRole('button', { name: /继续主线/ }).click()

  const stage = page.locator('.ending-stage')
  await expect(stage.getByText('第一席的结局已经保存')).toBeVisible({ timeout: 6_000 })
  await stage.getByRole('button', { name: '选择事件二去向' }).click()
  const bridge = stage.locator('.route-bridge')
  await expect(bridge).toBeVisible()
  await expect(bridge.getByText('一组结局与第一席身份会完整保留')).toBeVisible()
  await bridge.getByRole('radio', { name: /4组 · 天上白玉京/ }).click()
  const confirm = bridge.getByRole('button', { name: /加入天上白玉京，进入事件二/ })
  await expect(confirm).toBeEnabled()

  const bridgeBox = await bridge.boundingBox()
  expect(bridgeBox?.y ?? -1).toBeGreaterThanOrEqual(0)
  expect((bridgeBox?.y ?? 999) + (bridgeBox?.height ?? 999)).toBeLessThanOrEqual(812)
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1)
  await page.screenshot({ path: 'artifacts/qa-org1-route-bridge-mobile.png' })

  await confirm.click()
  await expect(page.locator('.chapter-mark')).toContainText('事件二')
  await expect.poll(() => page.evaluate(() => {
    const key = Object.keys(localStorage).find((candidate) => candidate.startsWith('4945-vn:v5:save:'))
    const record = key ? JSON.parse(localStorage.getItem(key) ?? 'null') : null
    return {
      route: record?.state?.route,
      ending: record?.state?.season1Outcome?.organizationEndingId,
      origin: record?.state?.season1Outcome?.routeTransfer?.fromRoute,
    }
  })).toEqual({ route: 'org4', ending: 'r1-order', origin: 'org1' })

  // 事件一转线会先完整经过暑假桥接篇，再由事件二序章确认第一席身份。
  let inheritedIdentitySeen = false
  for (let step = 0; step < 80; step++) {
    if (await page.getByText(/第一席的经历没有被抹去/).isVisible().catch(() => false)) {
      inheritedIdentitySeen = true
      break
    }
    const storyControls = page.locator([
      '.chat-stage .reply-list button:visible',
      '.chat-stage .continue-message:visible',
      '.system-stage .system-actions button:visible',
      '.choice-panel button:visible',
      '.dialogue-zone:visible',
    ].join(', '))
    if (await storyControls.count()) await storyControls.first().click()
    else await page.keyboard.press('Enter')
  }
  expect(inheritedIdentitySeen).toBe(true)
})

test('旧版提线木偶存档补齐组织结局后继续片尾并进入事件二', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  await startEventOne(page)

  await page.evaluate(() => {
    const key = '4945-vn:v4:save:auto'
    const record = JSON.parse(localStorage.getItem(key) ?? 'null')
    if (!record?.state) throw new Error('自动存档尚未建立')
    record.nodeId = 'ending-shadow-puppet'
    record.state.nodeId = 'ending-shadow-puppet'
    record.state.route = 'org4'
    record.state.organization = 'org4'
    record.state.organizationName = '天上白玉京'
    record.state.flags.bf_shadow_master = true
    record.state.flags.bf_schemer = true
    record.state.processedNodes = ['ending-shadow-puppet']
    record.state.unlockedEndings = ['shadow-puppet']
    record.state.history = []
    localStorage.setItem(key, JSON.stringify(record))
  })
  await page.reload()
  await page.getByRole('button', { name: /继续主线/ }).click()

  const stage = page.locator('.ending-stage')
  await expect(stage).toHaveAttribute('aria-label', '结局：提线木偶')
  await expect(stage.getByRole('button', { name: '返回标题' })).toHaveCount(0)

  await expect.poll(() => page.evaluate(() => {
    const record = JSON.parse(localStorage.getItem('4945-vn:v4:save:auto') ?? 'null')
    return {
      nodeId: record?.state?.nodeId,
      endings: record?.state?.unlockedEndings ?? [],
    }
  }), { timeout: 12_000 }).toEqual({ nodeId: 'credits-first-season', endings: expect.arrayContaining(['shadow-puppet', 'r4-puppeteer']) })

  const continueMainline = stage.getByRole('button', { name: /继续主线 · 事件二/ })
  await expect(continueMainline).toBeVisible({ timeout: 6_000 })
  await continueMainline.click()
  await expect(page.locator('.chapter-mark')).toContainText('事件二')
})
