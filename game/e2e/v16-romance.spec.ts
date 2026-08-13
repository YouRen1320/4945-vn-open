import { expect, test } from '@playwright/test'

import type { Locator, Page } from '@playwright/test'

const AUTO_SAVE_KEY = '4945-vn:v4:save:auto'
const MAIN_NODE_ID = 'p01-mentor-call'
const SHANA_FIRST_DATE_ID = 'romance-shana-first-date'
const SHANA_CONFESSION_ID = 'romance-shana-confession'
const SHANA_DAILY_ID = 'romance-shana-daily'

interface RomanceSeed {
  progress: number
  completedFirstDate?: boolean
  activePartner?: 'shana' | null
  completedAfterStory?: boolean
}

interface RomanceSavedState {
  nodeId: string
  activePartner: string | null
  flags: Record<string, boolean>
  relationships: {
    shana: {
      trust: number
      affinity: number
      progress: number
    }
  }
  unlockedEndings: string[]
}

const startGame = async (page: Page) => {
  // Removing reveal/transition timing keeps this test about the complete mobile flow.
  await page.addInitScript(() => {
    localStorage.setItem('4945-vn:settings', JSON.stringify({ reducedMotion: true, textSpeed: 8 }))
  })
  await page.goto('/')
  await page.getByRole('button', { name: /开始主线/ }).click()
  await page.getByRole('button', { name: '查看消息' }).click()
  await page.getByRole('button', { name: '接受邀请' }).click()
  await page.getByLabel('这次准备叫什么？').fill('夜市验收')
  await page.getByRole('button', { name: '进入4945区' }).click()
  await expect(page.locator('.game-shell')).toBeVisible()
}

// QA enters a stable, choice-bearing story node through the public persisted-save contract.
const seedRomanceAtMain = async (page: Page, setup: RomanceSeed) => {
  await page.evaluate(({ key, mainNodeId, setup }) => {
    const record = JSON.parse(localStorage.getItem(key) ?? 'null')
    if (!record?.state) throw new Error('V4自动存档尚未建立')

    record.nodeId = mainNodeId
    record.date = '2026-07-16'
    record.chapter = 'prologue'
    record.state.nodeId = mainNodeId
    record.state.date = '2026-07-16'
    record.state.chapter = 'prologue'
    record.state.relationships.shana.progress = setup.progress
    record.state.activePartner = setup.activePartner ?? null
    record.state.variables.romanceReturnNode = mainNodeId

    if (setup.completedFirstDate) record.state.flags.romanceNightMarketDate_shana = true
    else delete record.state.flags.romanceNightMarketDate_shana
    delete record.state.flags.romanceNightMarketDaily_shana
    delete record.state.flags.romanceNightMarketPartner_shana
    delete record.state.flags.bondedShana
    if (setup.completedAfterStory) {
      record.state.flags.romanceAfterSecondDate_shana = true
      record.state.flags.romanceAfterConflict_shana = true
      record.state.flags.romanceAfterReconciliation_shana = true
    }

    // Reset only the episodes under test; unrelated history and collection data remain realistic.
    const resetPrefixes = [
      'romance-shana-confession',
      'romance-shana-daily',
    ]
    record.state.processedNodes = (record.state.processedNodes ?? [])
      .filter((id: string) => !resetPrefixes.some((prefix) => id.startsWith(prefix)))
    record.state.seenNodes = (record.state.seenNodes ?? [])
      .filter((id: string) => !resetPrefixes.some((prefix) => id.startsWith(prefix)))
    record.state.unlockedCgs = (record.state.unlockedCgs ?? []).filter((id: string) => id !== 'cg16-bond-shana')
    record.state.unlockedEndings = (record.state.unlockedEndings ?? []).filter((id: string) => id !== 'bond-shana')

    localStorage.setItem(key, JSON.stringify(record))
  }, { key: AUTO_SAVE_KEY, mainNodeId: MAIN_NODE_ID, setup })

  await page.reload()
  await page.getByRole('button', { name: /继续主线/ }).click()
  await expect(page.locator('.game-shell')).toBeVisible()
  await expect.poll(() => readSavedNode(page)).toBe(MAIN_NODE_ID)
}

const readSavedState = async (page: Page): Promise<RomanceSavedState> => page.evaluate((key) => {
  const record = JSON.parse(localStorage.getItem(key) ?? 'null')
  if (!record?.state) throw new Error('自动存档缺失')
  return record.state
}, AUTO_SAVE_KEY)

const readSavedNode = async (page: Page) => (await readSavedState(page)).nodeId

const expectSavedNode = async (page: Page, nodeId: string) => {
  await expect.poll(() => readSavedNode(page)).toBe(nodeId)
}

const expectNoHorizontalOverflow = async (page: Page) => {
  const overflow = await page.evaluate(() => (
    Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth
  ))
  expect(overflow).toBeLessThanOrEqual(1)
}

const expectMinimumTarget = async (locator: Locator, minimum = 44) => {
  await locator.scrollIntoViewIfNeeded()
  const box = await locator.boundingBox()
  expect(box, 'CTA应有可见布局盒').not.toBeNull()
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(minimum)
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(minimum)
}

const openRomancePanel = async (page: Page) => {
  await page.getByRole('button', { name: '羁绊与约会' }).click()
  const dialog = page.getByRole('dialog', { name: '羁绊 · 幻想夜市' })
  await expect(dialog).toBeVisible()
  await expect.poll(() => page.locator('.modal-backdrop').evaluate((element) => (
    getComputedStyle(element).opacity
  ))).toBe('1')
  await expectNoHorizontalOverflow(page)
  return dialog
}

const expectSettledScene = async (page: Page, fileName: string) => {
  const scene = page.locator(`.scene-image[data-image-url*="${fileName}"]`)
  await expect(scene).toHaveAttribute('data-image-state', 'ready')
  await expect.poll(() => scene.evaluate((element) => getComputedStyle(element).opacity)).toBe('1')
  await expect(page.locator('.scene-image')).toHaveCount(1)
  return scene
}

test('375×812完整体验首次约会、告白与不可刷值的恋爱日常', async ({ page }) => {
  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  await page.setViewportSize({ width: 375, height: 812 })
  await startGame(page)

  await seedRomanceAtMain(page, { progress: 30 })
  let dialog = await openRomancePanel(page)
  const firstDateCta = dialog.getByRole('button', { name: '赴约 · 不谈要塞的晚饭' })
  await expect(firstDateCta).toBeVisible()
  await expectMinimumTarget(firstDateCta)
  await expect(dialog.getByRole('progressbar', { name: '灼眼の夏娜攻略进度' })).toHaveAttribute('aria-valuenow', '30')
  await page.screenshot({ path: 'artifacts/qa-v16-romance-panel-mobile.png' })

  await firstDateCta.click()
  await expect(dialog).toHaveCount(0)
  await expectSavedNode(page, SHANA_FIRST_DATE_ID)
  await expect(page.getByRole('button', { name: '羁绊与约会' })).toHaveCount(0)
  await expect(page.locator('.game-shell')).toBeVisible()
  await expectSettledScene(page, 'romance-food-street-rain-v1.webp')
  await expect(page.locator('.dialogue-zone > p[aria-hidden="true"]')).toContainText(/情侣套餐，还是临时同盟套餐/)
  await expectNoHorizontalOverflow(page)
  await page.screenshot({ path: 'artifacts/qa-v16-romance-date-mobile.png' })

  await page.getByRole('button', { name: /一人一半，职位不参与分配/ }).click()
  await page.locator('.dialogue-zone').click()
  await expectSavedNode(page, `${SHANA_FIRST_DATE_ID}-complete`)
  await page.locator('.dialogue-zone').click()
  await expectSavedNode(page, MAIN_NODE_ID)
  let state = await readSavedState(page)
  expect(state.relationships.shana.progress).toBe(50)
  expect(state.flags.romanceNightMarketDate_shana).toBe(true)

  await seedRomanceAtMain(page, { progress: 100, completedFirstDate: true })
  dialog = await openRomancePanel(page)
  const confessionCta = dialog.getByRole('button', { name: '回应 · 属于自己的决定' })
  await expect(confessionCta).toBeVisible()
  await expectMinimumTarget(confessionCta)
  await confessionCta.click()
  await expectSavedNode(page, SHANA_CONFESSION_ID)
  await expectSettledScene(page, 'romance-lantern-bridge-after-hours-v1.webp')
  await expect(page.locator('.dialogue-zone > p[aria-hidden="true"]')).toContainText(/喜欢你是我自己做的决定/)
  await expectNoHorizontalOverflow(page)

  await page.getByRole('button', { name: /正式交往/ }).click()
  state = await readSavedState(page)
  expect(state.activePartner).toBe('shana')
  expect(state.unlockedEndings).toContain('bond-shana')
  await page.locator('.dialogue-zone').click()
  await expectSavedNode(page, MAIN_NODE_ID)

  // 当前关系流程在成为伴侣后依次解锁二约会、冲突与和解；日常要在三者完成后才出现。
  // 这里直接补齐后日谈三集完成标志，验证日常本身的可重玩与不刷值，后日谈流程由单测覆盖。
  await seedRomanceAtMain(page, { progress: 100, completedFirstDate: true, activePartner: 'shana', completedAfterStory: true })

  dialog = await openRomancePanel(page)
  const firstDailyCta = dialog.getByRole('button', { name: '去见 Ta · 一人一半的夜宵' })
  await expect(firstDailyCta).toBeVisible()
  await expectMinimumTarget(firstDailyCta)
  const beforeDaily = (await readSavedState(page)).relationships.shana

  await firstDailyCta.click()
  await expectSavedNode(page, SHANA_DAILY_ID)
  await page.getByRole('button', { name: /沿用第一次约会的规则/ }).click()
  await page.locator('.dialogue-zone').click()
  await expectSavedNode(page, MAIN_NODE_ID)
  const afterFirstDaily = (await readSavedState(page)).relationships.shana
  expect(afterFirstDaily).toMatchObject({
    trust: beforeDaily.trust + 1,
    affinity: beforeDaily.affinity + 1,
  })

  dialog = await openRomancePanel(page)
  const repeatDailyCta = dialog.getByRole('button', { name: '去见 Ta · 一人一半的夜宵' })
  await expect(repeatDailyCta).toBeVisible()
  await expectMinimumTarget(repeatDailyCta)
  await repeatDailyCta.click()
  await page.getByRole('button', { name: /共享饥饿值/ }).click()
  await page.locator('.dialogue-zone').click()
  await expectSavedNode(page, MAIN_NODE_ID)
  const afterRepeatDaily = (await readSavedState(page)).relationships.shana
  expect(afterRepeatDaily).toEqual(afterFirstDaily)

  await expectNoHorizontalOverflow(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  dialog = await openRomancePanel(page)
  await page.screenshot({ path: 'artifacts/qa-v16-romance-panel-desktop.png' })
  await expect(dialog).toBeVisible()
  await expectNoHorizontalOverflow(page)
  expect(pageErrors).toEqual([])
})
