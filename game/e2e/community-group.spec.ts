import { expect, test } from '@playwright/test'

test('375×812 首页区群入口无需滚动即可加入或复制群号', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')

  const entry = page.getByRole('button', { name: '加入4945区区群，QQ群1075594288' })
  await expect(entry).toBeInViewport()
  const entryBox = await entry.boundingBox()
  expect(entryBox?.height ?? 0).toBeGreaterThanOrEqual(44)

  await entry.click()
  const dialog = page.getByRole('dialog', { name: '加入4945区区群' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByText('1075594288', { exact: true })).toBeVisible()
  await expect(dialog.getByRole('link', { name: '一键加入QQ群' })).toHaveAttribute(
    'href',
    'https://qm.qq.com/q/eHUS6rTboI',
  )
  await expect(dialog.getByRole('button', { name: '复制群号' })).toBeVisible()
  await expect(dialog.locator('.group-qr')).toBeHidden()

  await page.waitForTimeout(250)
  const sheetBox = await dialog.boundingBox()
  expect(Math.abs(812 - ((sheetBox?.y ?? 0) + (sheetBox?.height ?? 0)))).toBeLessThanOrEqual(1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1)

  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(entry).toBeFocused()
})

test('桌面端加入面板显示官方二维码', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/')
  await page.getByRole('button', { name: '加入4945区区群，QQ群1075594288' }).click()

  const dialog = page.getByRole('dialog', { name: '加入4945区区群' })
  const qr = dialog.getByRole('img', { name: '4945区QQ群二维码，群号1075594288' })
  await expect(qr).toBeVisible()
  await expect(qr).toHaveJSProperty('complete', true)
})
