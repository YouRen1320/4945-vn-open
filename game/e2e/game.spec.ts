import { expect, test } from '@playwright/test'

const startGame = async (page: import('@playwright/test').Page) => {
  await page.goto('/')
  await page.getByRole('button', { name: /开始主线/ }).click()
  await page.getByRole('button', { name: '查看消息' }).click()
  await page.getByRole('button', { name: '接受邀请' }).click()
  await page.getByLabel('这次准备叫什么？').fill('浏览器测试')
  await page.getByRole('button', { name: '进入4945区' }).click()
  await expect(page.locator('.dialogue-zone > p[aria-hidden="true"]')).toContainText(/电脑刚关掉/)
}

const expectNoHorizontalOverflow = async (page: import('@playwright/test').Page) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)
}

// Screenshots wait for decoded art, preventing cold-cache black frames from passing visual QA.
const expectSceneImageReady = async (
  page: import('@playwright/test').Page,
  fileName: string,
) => {
  const scene = page.locator(`.scene-image[data-image-url*="${fileName}"]`)
  await expect(scene).toHaveAttribute('data-image-state', 'ready')
  await expect(scene).toHaveAttribute('data-image-url', new RegExp(fileName.replaceAll('.', '\\.')))
  // Wait for the overlapping scene transition to settle before visual QA captures a frame.
  await expect.poll(() => scene.evaluate((element) => getComputedStyle(element).opacity)).toBe('1')
  await expect(page.locator('.scene-image')).toHaveCount(1)
}

// Full-size introductions must resolve to a decoded sprite rather than the avatar fallback card.
const expectSpriteImageReady = async (
  page: import('@playwright/test').Page,
  character: string,
  fileName: string,
) => {
  const sprite = page.locator(
    `.character-stage .sprite img[src*="/sprites/${character}/"][src*="${fileName}"]`,
  )
  await expect(sprite).toBeVisible()
  await expect.poll(() => sprite.evaluate((element) => {
    const image = element as HTMLImageElement
    return image.complete && image.naturalWidth > 0
  })).toBe(true)
  await expect(page.locator('.character-stage .fallback-card')).toHaveCount(0)
}

// QA can enter late historical nodes through the public save contract without adding a production debug route.
const jumpToSavedNode = async (page: import('@playwright/test').Page, nodeId: string) => {
  await page.evaluate((target) => {
    const key = '4945-vn:v4:save:auto'
    const record = JSON.parse(localStorage.getItem(key) ?? 'null')
    if (!record?.state) throw new Error('自动存档尚未建立')
    record.nodeId = target
    record.state.nodeId = target
    localStorage.setItem(key, JSON.stringify(record))
  }, nodeId)
  await page.reload()
  await page.getByRole('button', { name: /继续主线/ }).click()
}

test('手机竖屏可从标题建档、阅读、选择并快速存读档', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: '4945区', exact: true })).toBeVisible()
  await expect(page.getByText('影·银角 · 新区开服篇')).toBeVisible()
  await expect(page.getByText(/S1|第一季完整版|历史会发生/)).toHaveCount(0)
  await expectNoHorizontalOverflow(page)
  await page.screenshot({ path: 'artifacts/qa-title-mobile.png' })

  await startGame(page)
  await expectNoHorizontalOverflow(page)
  await page.locator('.dialogue-zone').click()
  await page.locator('.dialogue-zone').click()
  await expect(page.locator('.chat-stage .message.current p')).toContainText(/开服就冲榜，先把一组占住/)
  await expect(page.locator('.dialogue-zone')).toHaveCount(0)
  await page.locator('.phone-shell').click()
  await page.getByRole('button', { name: /老区没玩好/ }).click()
  await expect(page.locator('.chat-stage .message.current p')).toContainText(/一起冲击本服排行榜，冲个一组/)
  await page.locator('.phone-shell').click()
  await expect(page.locator('.system-stage .system-interaction > p[aria-hidden="true"]')).toContainText(/九点零三分/)
  await page.screenshot({ path: 'artifacts/qa-game-mobile.png' })

  await page.keyboard.press('s')
  await expect(page.getByText('已写入快速记录')).toBeVisible()
  await page.getByRole('button', { name: '菜单' }).click()
  await page.getByRole('button', { name: '存档与读取' }).click()
  await expect(page.getByText('快速记录', { exact: true })).toBeVisible()
  await expect(page.getByRole('article').filter({ hasText: '快速记录' }).getByRole('heading', { name: /浏览器测试/ })).toBeVisible()
  await page.getByRole('button', { name: '关闭' }).click()
})

test('手机横屏的对话、选择与安全区不溢出', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 })
  await startGame(page)
  await expectNoHorizontalOverflow(page)
  await page.screenshot({ path: 'artifacts/qa-game-desktop.png' })
  await expect(page.locator('.dialogue-zone')).toBeVisible()
  const box = await page.locator('.dialogue-zone').boundingBox()
  expect(box?.y ?? 999).toBeGreaterThanOrEqual(0)
  expect((box?.y ?? 0) + (box?.height ?? 999)).toBeLessThanOrEqual(390)

  await page.locator('.dialogue-zone').click()
  await page.locator('.dialogue-zone').click()
  await page.locator('.phone-shell').click()
  await expect(page.getByRole('button', { name: /老区没玩好/ })).toBeVisible()
  await expect(page.locator('.dialogue-zone')).toHaveCount(0)
  await expectNoHorizontalOverflow(page)
})

test('桌面端可打开状态、历史、鉴赏和设置', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await startGame(page)
  await expectNoHorizontalOverflow(page)

  await page.getByRole('button', { name: '状态' }).click()
  await expect(page.getByRole('heading', { name: '玩家与组织' })).toBeVisible()
  await expect(page.getByText('浏览器测试')).toBeVisible()
  await page.getByRole('button', { name: '关闭' }).click()

  await page.getByRole('button', { name: '历史' }).click()
  await expect(page.getByRole('dialog', { name: '历史记录' }).getByText(/电脑刚关掉/)).toBeVisible()
  await page.getByRole('button', { name: '关闭' }).click()

  await page.getByRole('button', { name: '菜单' }).click()
  await page.getByRole('button', { name: '鉴赏' }).click()
  await expect(page.getByRole('heading', { name: '场景鉴赏' })).toBeVisible()
  await expect(page.getByText('老朋友喊你进区', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '关闭' }).click()

  await page.getByRole('button', { name: '菜单' }).click()
  await page.getByRole('button', { name: '设置' }).click()
  await expect(page.getByText('文字速度')).toBeVisible()
  await expect(page.getByRole('heading', { name: '关于' })).toBeVisible()
  await expect(page.getByText('《4945区》· 影·银角 · 新区开服篇')).toBeVisible()
  await expect(page.getByText(/免费同人创作 · v4\.0\.0/)).toBeVisible()
  await page.getByRole('button', { name: '全部静音' }).click()
  await expect(page.getByRole('button', { name: '恢复声音' })).toBeVisible()
})

test('生产版 PWA 在首次加载后可断网刷新标题页', async ({ page, context }) => {
  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.evaluate(async () => { await navigator.serviceWorker.ready })
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true)
  const cachedUrls = await page.evaluate(async () => {
    const urls: string[] = []
    for (const name of await caches.keys()) {
      const cache = await caches.open(name)
      urls.push(...(await cache.keys()).map((request) => request.url))
    }
    return urls
  })
  expect(cachedUrls.length).toBeGreaterThan(0)
  expect(cachedUrls.some((url) => url.endsWith('.js'))).toBe(true)
  expect(cachedUrls.some((url) => url.endsWith('.css'))).toBe(true)
  await context.setOffline(true)
  await page.reload()
  expect(pageErrors).toEqual([])
  await expect(page.getByRole('heading', { name: '4945区', exact: true })).toBeVisible()
})

test('聊天与系统场景各自承载选择，不出现重复对白层', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await startGame(page)

  await page.locator('.dialogue-zone').click()
  await page.locator('.dialogue-zone').click()
  await page.locator('.phone-shell').click()
  await expect(page.locator('.chat-stage .reply-list')).toBeVisible()
  await expect(page.locator('.choice-panel')).toHaveCount(0)
  await expect(page.locator('.dialogue-zone')).toHaveCount(0)

  await jumpToSavedNode(page, 'p05-first-day')
  await page.locator('.system-stage .client').click()
  await expect(page.locator('.system-stage .system-actions')).toBeVisible()
  await expect(page.locator('.choice-panel')).toHaveCount(0)
  await expect(page.locator('.dialogue-zone')).toHaveCount(0)
})

test('一组关键选择先显示角色回应，再继续原有事件', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await startGame(page)

  // 通过正式存档合同进入代表性节点，验证内容图分支能在真实舞台正常呈现。
  await jumpToSavedNode(page, 'r1-03-world-enemy')
  await page.getByRole('button', { name: /截图发给祈福/ }).click()
  await expect(page.getByText(/继续截，别只截骂人的那句/)).toBeVisible()

  await jumpToSavedNode(page, 'r1-09-fortress-day')
  await page.getByRole('button', { name: /我守祈福标的点/ }).click()
  await expect(page.locator('.dialogue-zone > p[aria-hidden="true"]')).toContainText(/最后三十秒，对面仍没把旗压下去/)
  await expectNoHorizontalOverflow(page)
})

test('V1 自动存档会移除无效建档字段并在原节点继续', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await startGame(page)

  await page.evaluate(() => {
    const key = '4945-vn:v4:save:auto'
    const record = JSON.parse(localStorage.getItem(key) ?? 'null')
    if (!record?.state) throw new Error('自动存档尚未建立')
    record.schemaVersion = 1
    record.nodeId = 'p03-first-red-dots'
    record.state.schemaVersion = 1
    record.state.nodeId = 'p03-first-red-dots'
    record.state.gender = 'female'
    record.state.publicIdentity = true
    record.state.tone = 'formal'
    localStorage.setItem(key, JSON.stringify(record))
  })

  await page.reload()
  await page.getByRole('button', { name: /继续主线/ }).click()
  await expect(page.getByText(/先别乱点/)).toBeVisible()
  await expect(page.locator('.chat-stage')).toBeVisible()

  const migrated = await page.evaluate(() => {
    const record = JSON.parse(localStorage.getItem('4945-vn:v4:save:auto') ?? 'null')
    return {
      recordSchema: record?.schemaVersion,
      stateSchema: record?.state?.schemaVersion,
      hasGender: Object.hasOwn(record?.state ?? {}, 'gender'),
      hasPublicIdentity: Object.hasOwn(record?.state ?? {}, 'publicIdentity'),
      hasTone: Object.hasOwn(record?.state ?? {}, 'tone'),
    }
  })
  expect(migrated).toEqual({
    recordSchema: 4,
    stateSchema: 4,
    hasGender: false,
    hasPublicIdentity: false,
    hasTone: false,
  })
})

test('爆群与退组历史节点加载专属事件CG并进入鉴赏', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await startGame(page)

  await jumpToSavedNode(page, 'r2-18-explosion-full')
  await expect(page.getByText(/管理员「希露菲」开始批量移除群成员/)).toBeVisible()
  await expect(page.locator('.cg-mark')).toContainText('EVENT CG')
  await expectSceneImageReady(page, 'xilufei-group-explosion-v1.webp')
  await page.screenshot({ path: 'artifacts/qa-xilufei-explosion-desktop.png' })

  await jumpToSavedNode(page, 'r2-21-xilufei-leaves')
  await expect(page.getByText(/希露菲退出江南组织群/)).toBeVisible()
  await expectSceneImageReady(page, 'xilufei-exit-v1.webp')
  await page.screenshot({ path: 'artifacts/qa-xilufei-exit-desktop.png' })

  await page.getByRole('button', { name: '菜单' }).click()
  await page.getByRole('button', { name: '鉴赏' }).click()
  await expect(page.getByRole('img', { name: '管理员的第一次政变' })).toBeVisible()
  await expect(page.getByRole('img', { name: '拒战后的离开' })).toBeVisible()
})

test('路线开场、中段决策、六组交接与季终使用各自事件CG', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await startGame(page)

  // A representative node from each act catches cache omissions and cinematic UI regressions.
  await jumpToSavedNode(page, 'r3-00-founded')
  await expectSceneImageReady(page, 'route3-founding-v1.webp')
  await page.screenshot({ path: 'artifacts/qa-route3-founding-desktop.png' })

  await jumpToSavedNode(page, 'r4-15-reward-drops')
  await expectSceneImageReady(page, 'rare-accessory-v1.webp')
  await page.screenshot({ path: 'artifacts/qa-rare-accessory-desktop.png' })

  await jumpToSavedNode(page, 'r6-17-yyt-leaves')
  await expectSceneImageReady(page, 'yyt-avucii-handoff-v1.webp')
  await page.screenshot({ path: 'artifacts/qa-yyt-handoff-desktop.png' })

  await jumpToSavedNode(page, 'credits-first-season')
  await expect(page.getByText('先上号，再说')).toBeVisible()
  await expectSceneImageReady(page, 'season1-finale-v1.webp')
  await page.screenshot({ path: 'artifacts/qa-season1-finale-desktop.png' })
  await expectNoHorizontalOverflow(page)
})

test('候选立绘与手机历史事件CG使用正确舞台且不溢出', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await startGame(page)

  const candidates = [
    ['p08-shana-invite', 'shana', 'expression-determined-v1.webp', 'qa-candidate-shana-classic.png'],
    ['p08-heartbeat-invite', 'heartbeat', 'expression-smile-v1.webp', 'qa-candidate-heartbeat-classic.png'],
    ['p08-yanqiu-invite', 'yanqiu', 'expression-concerned-v1.webp', 'qa-candidate-yanqiu-classic.png'],
    ['p08-wenxian-invite', 'wenxian', 'expression-soft-v1.webp', 'qa-candidate-wenxian-classic.png'],
  ] as const

  for (const [nodeId, character, spriteFile, screenshot] of candidates) {
    await jumpToSavedNode(page, nodeId)
    await expectSpriteImageReady(page, character, spriteFile)
    await page.locator('.dialogue-zone').click()
    await expect(page.locator('.choice-panel')).toBeVisible()
    await expect(page.locator('.chat-stage')).toHaveCount(0)
    await expect(page.locator('.phone-shell')).toHaveCount(0)
    await expectNoHorizontalOverflow(page)
    await page.screenshot({ path: `artifacts/${screenshot}` })
  }

  await page.setViewportSize({ width: 390, height: 844 })
  const mobileCgs = [
    ['r2-13-an-resigns', 'council-reshuffle-v1.webp', 'qa-r2-an-resigns-mobile.png'],
    ['r2-28-remnants', 'r2-org6-remnants-v1.webp', 'qa-r2-remnants-mobile.png'],
  ] as const

  for (const [nodeId, cgFile, screenshot] of mobileCgs) {
    await jumpToSavedNode(page, nodeId)
    await expectSceneImageReady(page, cgFile)
    await expect(page.locator('.cg-mark')).toContainText('EVENT CG')
    await page.locator('.dialogue-zone').click()
    await expect(page.locator('.choice-panel')).toBeVisible()
    await expectNoHorizontalOverflow(page)
    const choices = await page.locator('.choice-panel').boundingBox()
    expect(choices?.x ?? -1).toBeGreaterThanOrEqual(0)
    expect((choices?.x ?? 391) + (choices?.width ?? 391)).toBeLessThanOrEqual(390)
    await page.screenshot({ path: `artifacts/${screenshot}` })
  }
})

test('三四组关键人物与双拍历史节点在桌面和手机正确呈现', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await startGame(page)

  // Representative single- and two-character tableaux catch wrong sprite mappings and chat UI regressions.
  const desktopScenes = [
    {
      nodeId: 'r3-11-jiangjinjiu-arrives',
      sprites: [['jiangjinjiu', 'base-neutral-v1.webp']],
      hasChoices: true,
      screenshot: 'qa-r3-jiangjinjiu-classic.png',
    },
    {
      nodeId: 'r3-17-management-seats',
      sprites: [['truth', 'base-neutral-v1.webp'], ['oguri', 'base-neutral-v1.webp']],
      hasChoices: true,
      screenshot: 'qa-r3-management-seats-classic.png',
    },
    {
      nodeId: 'r4-06-private-aftermath',
      sprites: [['takemehand', 'expression-soft-v1.webp']],
      hasChoices: true,
      screenshot: 'qa-r4-takemehand-private-classic.png',
    },
    {
      nodeId: 'r4-18-yanqiu-answer',
      sprites: [['yanqiu', 'expression-sad-v1.webp'], ['takemehand', 'expression-concerned-v1.webp']],
      hasChoices: false,
      screenshot: 'qa-r4-yanqiu-answer-classic.png',
    },
  ] as const

  for (const scene of desktopScenes) {
    await jumpToSavedNode(page, scene.nodeId)
    for (const [character, file] of scene.sprites) {
      await expectSpriteImageReady(page, character, file)
    }
    await expect(page.locator('.chat-stage')).toHaveCount(0)
    await expect(page.locator('.phone-shell')).toHaveCount(0)
    await expectNoHorizontalOverflow(page)
    if (scene.hasChoices) {
      await page.locator('.dialogue-zone').click()
      await expect(page.locator('.choice-panel')).toBeVisible()
    }
    await page.screenshot({ path: `artifacts/${scene.screenshot}` })
  }

  await page.setViewportSize({ width: 390, height: 844 })
  // July 28 now has two distinct beats: the sixth-group handoff, then Chenyi's unrelated quiet exit.
  const mobileCgs = [
    ['r3-09-xilufei-exits', 'xilufei-exit-v1.webp', 'qa-r3-xilufei-exit-mobile.png'],
    ['r4-10b-xilufei-leaves', 'xilufei-exit-v1.webp', 'qa-r4-xilufei-exit-mobile.png'],
    ['r4-22-sixth-falls', 'yyt-avucii-handoff-v1.webp', 'qa-r4-yyt-handoff-mobile.png'],
    ['r4-22b-chenyi-exit', 'chenyi-leaves-v1.webp', 'qa-r4-chenyi-exit-mobile.png'],
  ] as const

  for (const [nodeId, cgFile, screenshot] of mobileCgs) {
    await jumpToSavedNode(page, nodeId)
    await expectSceneImageReady(page, cgFile)
    await expect(page.locator('.cg-mark')).toContainText('EVENT CG')
    await expectNoHorizontalOverflow(page)
    await page.screenshot({ path: `artifacts/${screenshot}` })
  }

  await jumpToSavedNode(page, 'r4-06-private-aftermath')
  await expectSpriteImageReady(page, 'takemehand', 'expression-soft-v1.webp')
  await page.locator('.dialogue-zone').click()
  await expect(page.locator('.choice-panel')).toBeVisible()
  await expectNoHorizontalOverflow(page)
  const mobileChoices = await page.locator('.choice-panel').boundingBox()
  expect(mobileChoices?.x ?? -1).toBeGreaterThanOrEqual(0)
  expect((mobileChoices?.x ?? 391) + (mobileChoices?.width ?? 391)).toBeLessThanOrEqual(390)
  await page.screenshot({ path: 'artifacts/qa-r4-takemehand-private-mobile.png' })
})
