import { expect, test } from '@playwright/test'

test('375×812 区史档案与成员名册完整展示且不横向溢出', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')

  await page.getByRole('button', { name: /更多内容/ }).click()
  await page.getByRole('dialog', { name: '更多内容' }).getByRole('button', { name: /鉴赏/ }).click()

  const dialog = page.getByRole('dialog', { name: '鉴赏' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: /区史档案/ }).click()
  await expect(dialog.getByRole('heading', { name: '区史档案', exact: true })).toBeVisible()
  await expect(dialog.locator('.timeline-list li')).toHaveCount(4)
  await expect(dialog.locator('.evidence-grid article')).toHaveCount(20)
  await expect(dialog.getByText('原截图不随游戏发布')).toBeVisible()

  await dialog.getByRole('button', { name: /成员名册/ }).click()
  await expect(dialog.getByRole('heading', { name: '成员名册', exact: true })).toBeVisible()
  await expect(dialog.locator('.roster-grid article')).toHaveCount(32)
  await expect(dialog.locator('.roster-grid img')).toHaveCount(32)
  await expect(dialog.getByText('隐私保护 · 虚构替代头像')).toHaveCount(2)

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)
})
