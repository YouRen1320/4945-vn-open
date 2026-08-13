import { expect, test } from '@playwright/test'

import type { Locator, Page } from '@playwright/test'

const COLLECTION_KEY = '4945-vn:collection'
const unlockedGallery = [
  { id: 'cg12-launch-login', name: '4945区开服' },
  { id: 'cg13-recruitment-square', name: '招募广场' },
  { id: 'cg11-organization-hall', name: '五组席位' },
] as const

const expectNoHorizontalOverflow = async (page: Page) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)
}

const expectMinimumTouchTarget = async (control: Locator) => {
  const box = await control.boundingBox()
  expect(box, '灯箱控件应有可测量的触控区域').not.toBeNull()
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(44)
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)
}

const expectOpenLightbox = async (page: Page, name: string) => {
  const dialog = page.getByRole('dialog', { name: `${name}全屏鉴赏` })
  await expect(dialog).toBeVisible()
  // Vue inserts the dialog before its transition frame settles; geometry is meaningful only at full opacity.
  await expect.poll(() => dialog.evaluate((element) => (
    getComputedStyle(element.parentElement as HTMLElement).opacity
  ))).toBe('1')
  return dialog
}

test('375×812 场景鉴赏支持响应式缩略图、全屏切换与键盘焦点归还', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  // The permanent collection is the public gallery source; seed only known IDs and preserve its schema.
  await page.addInitScript(({ key, unlockedCgs }) => {
    localStorage.setItem(key, JSON.stringify({
      seenNodes: [],
      unlockedCgs,
      unlockedEndings: [],
    }))
    localStorage.setItem('4945-vn:settings', JSON.stringify({ reducedMotion: true }))
  }, {
    key: COLLECTION_KEY,
    unlockedCgs: unlockedGallery.map(({ id }) => id),
  })

  await page.goto('/')
  await page.getByRole('button', { name: /更多内容/ }).click()
  await page.getByRole('dialog', { name: '更多内容' }).getByRole('button', { name: '鉴赏' }).click()
  const galleryDialog = page.locator('.modal-panel[aria-label="鉴赏"]')
  await expect(galleryDialog).toBeVisible()
  await expect(page.getByRole('img', { name: '未解锁' })).toHaveCount(0)
  await expectNoHorizontalOverflow(page)

  const firstThumbnail = page.getByRole('button', { name: `查看${unlockedGallery[0].name}大图` })
  const thumbnailImage = firstThumbnail.locator('img')
  await expect(firstThumbnail).toBeVisible()
  await expect(thumbnailImage).toHaveAttribute('loading', 'lazy')
  await expect(thumbnailImage).toHaveAttribute('decoding', 'async')
  const thumbnailBox = await thumbnailImage.boundingBox()
  expect(thumbnailBox, '已解锁 CG 应渲染可测量的缩略图').not.toBeNull()
  expect((thumbnailBox?.width ?? 0) / (thumbnailBox?.height ?? 1)).toBeCloseTo(16 / 9, 1)

  await firstThumbnail.focus()
  await expect(firstThumbnail).toBeFocused()
  await firstThumbnail.click()
  let lightbox = await expectOpenLightbox(page, unlockedGallery[0].name)
  await expect(galleryDialog).toHaveAttribute('aria-hidden', 'true')
  expect(await galleryDialog.evaluate((element) => (element as HTMLElement).inert)).toBe(true)
  await expectNoHorizontalOverflow(page)

  const close = lightbox.getByRole('button', { name: '关闭全屏鉴赏' })
  const previous = lightbox.getByRole('button', { name: '上一张' })
  const next = lightbox.getByRole('button', { name: '下一张' })
  await expectMinimumTouchTarget(close)
  await expectMinimumTouchTarget(previous)
  await expectMinimumTouchTarget(next)

  await next.click()
  lightbox = await expectOpenLightbox(page, unlockedGallery[1].name)
  await lightbox.getByRole('button', { name: '上一张' }).click()
  await expectOpenLightbox(page, unlockedGallery[0].name)

  await page.keyboard.press('ArrowRight')
  await expectOpenLightbox(page, unlockedGallery[1].name)
  await page.keyboard.press('ArrowLeft')
  await expectOpenLightbox(page, unlockedGallery[0].name)

  // Escape closes only the nested lightbox and returns keyboard users to the thumbnail that opened it.
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: `${unlockedGallery[0].name}全屏鉴赏` })).toHaveCount(0)
  await expect(page.getByRole('dialog', { name: '鉴赏' })).toBeVisible()
  await expect(galleryDialog).not.toHaveAttribute('aria-hidden', 'true')
  expect(await galleryDialog.evaluate((element) => (element as HTMLElement).inert)).toBe(false)
  await expect(firstThumbnail).toBeFocused()
  await expectNoHorizontalOverflow(page)

  await firstThumbnail.click()
  lightbox = await expectOpenLightbox(page, unlockedGallery[0].name)
  await lightbox.getByRole('button', { name: '关闭全屏鉴赏' }).click()
  await expect(lightbox).toHaveCount(0)
  await expect(firstThumbnail).toBeFocused()
})
