import { expect, test } from '@playwright/test'

import type { Locator, Page } from '@playwright/test'

const RELEASE_NOTES_SEEN_KEY = '4945-vn:release-notes-seen'
const releaseSections = [
  '事件三完整季',
  '完整结局与失败余波',
  '十五种关系状态完整收束',
  '第三季独立结局档案',
  '北岸来客',
  '完整继承事件二结果',
  '事件三独立进度',
  '选择立即得到回应',
  '关键决定留下后续回响',
  '修正选择与事实矛盾',
  '暑假事件进入事件二',
  '完整区史与成员名册',
  '原进度继续兼容',
] as const

const expectNoHorizontalOverflow = async (page: Page) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)
}

const expectMinimumTouchTarget = async (control: Locator) => {
  const box = await control.boundingBox()
  expect(box, '更新入口与弹窗控件应有可测量的触控区域').not.toBeNull()
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(44)
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)
}

test('375×812 本次更新入口记录 4.0.0 已读状态并保持键盘焦点', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  // Clear only the changelog receipt, then reload so App reads the intended first-visit state.
  await page.evaluate((key) => {
    localStorage.removeItem(key)
    localStorage.setItem('4945-vn:settings', JSON.stringify({ reducedMotion: true }))
  }, RELEASE_NOTES_SEEN_KEY)
  await page.reload()

  const moreButton = page.getByRole('button', { name: /更多内容/ })
  await moreButton.click()
  const releaseButton = page.getByRole('dialog', { name: '更多内容' }).getByRole('button', { name: /本次更新/ })
  await expect(releaseButton).toBeVisible()
  await expect(releaseButton.getByText('NEW', { exact: true })).toBeVisible()
  await expectMinimumTouchTarget(releaseButton)
  await expectNoHorizontalOverflow(page)

  await releaseButton.click()
  const dialog = page.getByRole('dialog', { name: '本次更新' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByText('VERSION 4.0.0', { exact: true })).toBeVisible()
  await expect(dialog.locator('article section')).toHaveCount(releaseSections.length)
  for (const heading of releaseSections) {
    await expect(dialog.getByRole('heading', { name: heading, exact: true })).toBeVisible()
  }
  await expectMinimumTouchTarget(dialog.getByRole('button', { name: '关闭' }))
  await expectNoHorizontalOverflow(page)

  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(moreButton).toBeFocused()
  await expect.poll(() => page.evaluate(
    (key) => localStorage.getItem(key),
    RELEASE_NOTES_SEEN_KEY,
  )).toBe('4.0.0')

  await page.reload()
  await page.getByRole('button', { name: /更多内容/ }).click()
  const readReleaseButton = page.getByRole('dialog', { name: '更多内容' }).getByRole('button', { name: /本次更新/ })
  await expect(readReleaseButton).toBeVisible()
  await expect(readReleaseButton.getByText('NEW', { exact: true })).toHaveCount(0)
  expect(await page.evaluate(
    (key) => localStorage.getItem(key),
    RELEASE_NOTES_SEEN_KEY,
  )).toBe('4.0.0')
  await expectNoHorizontalOverflow(page)
})
