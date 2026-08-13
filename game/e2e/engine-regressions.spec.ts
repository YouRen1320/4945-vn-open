import { expect, test } from '@playwright/test'

import type { Locator, Page } from '@playwright/test'

const collectPageErrors = (page: Page) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  return errors
}

const startGame = async (page: Page) => {
  // Deterministic reveal timing keeps keyboard and geometry assertions about interaction, not animation frames.
  await page.addInitScript(() => {
    localStorage.setItem('4945-vn:settings', JSON.stringify({ reducedMotion: true, textSpeed: 8 }))
  })
  await page.goto('/')
  await page.getByRole('button', { name: /开始主线/ }).click()
  await page.getByRole('button', { name: '查看消息' }).click()
  await page.getByRole('button', { name: '接受邀请' }).click()
  await page.getByLabel('这次准备叫什么？').fill('引擎回归')
  await page.getByRole('button', { name: '进入4945区' }).click()
  await expect(page.locator('.game-shell')).toBeVisible()
}

const jumpToSavedNode = async (page: Page, nodeId: string) => {
  await page.evaluate((target) => {
    const key = '4945-vn:v4:save:auto'
    const record = JSON.parse(localStorage.getItem(key) ?? 'null')
    if (!record?.state) throw new Error('自动存档尚未建立')
    record.nodeId = target
    record.state.nodeId = target
    record.state.processedNodes = (record.state.processedNodes ?? []).filter((id: string) => id !== target)
    record.state.seenNodes = (record.state.seenNodes ?? []).filter((id: string) => id !== target)
    localStorage.setItem(key, JSON.stringify(record))
  }, nodeId)
  await page.reload()
  await page.getByRole('button', { name: /继续主线/ }).click()
  await expect(page.locator('.game-shell')).toBeVisible()
}

const expectMinimumTarget = async (locator: Locator, minimum = 44) => {
  const count = await locator.count()
  expect(count).toBeGreaterThan(0)
  for (let index = 0; index < count; index += 1) {
    const box = await locator.nth(index).boundingBox()
    expect(box, `第 ${index + 1} 个控件应有布局盒`).not.toBeNull()
    expect(box?.width ?? 0, `第 ${index + 1} 个控件宽度`).toBeGreaterThanOrEqual(minimum)
    expect(box?.height ?? 0, `第 ${index + 1} 个控件高度`).toBeGreaterThanOrEqual(minimum)
  }
}

const boxesIntersect = (
  first: { x: number; y: number; width: number; height: number },
  second: { x: number; y: number; width: number; height: number },
) => (
  first.x < second.x + second.width
  && first.x + first.width > second.x
  && first.y < second.y + second.height
  && first.y + first.height > second.y
)

test('带任意修饰键的 A/F/S 不触发游戏快捷键', async ({ page }) => {
  const pageErrors = collectPageErrors(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await startGame(page)

  const auto = page.locator('.quick-controls button').filter({ hasText: 'AUTO' })
  const skip = page.locator('.quick-controls button').filter({ hasText: 'SKIP' })
  await expect(auto).toHaveAttribute('aria-pressed', 'false')
  await expect(skip).toHaveAttribute('aria-pressed', 'false')

  await page.evaluate(() => {
    const modifiers = ['ctrlKey', 'metaKey', 'altKey', 'shiftKey'] as const
    for (const modifier of modifiers) {
      for (const key of ['a', 'f', 's']) {
        window.dispatchEvent(new KeyboardEvent('keydown', {
          key: modifier === 'shiftKey' ? key.toUpperCase() : key,
          [modifier]: true,
          bubbles: true,
          cancelable: true,
        }))
      }
    }
  })

  await expect(auto).toHaveAttribute('aria-pressed', 'false')
  await expect(skip).toHaveAttribute('aria-pressed', 'false')
  expect(await page.evaluate(() => localStorage.getItem('4945-vn:v4:save:quick'))).toBeNull()
  await expect(page.getByText('已写入快速记录')).toHaveCount(0)
  expect(pageErrors).toEqual([])
})

test('模态框用 Esc 关闭、圈住 Tab 焦点并归还触发按钮', async ({ page }) => {
  const pageErrors = collectPageErrors(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await startGame(page)

  const menuButton = page.getByRole('button', { name: '菜单' })
  await menuButton.click()
  const dialog = page.getByRole('dialog', { name: '暂停菜单' })
  const closeButton = dialog.getByRole('button', { name: '关闭' })
  const lastButton = dialog.getByRole('button', { name: '保存并返回标题' })
  await expect(dialog).toBeVisible()
  await expect(closeButton).toBeFocused()

  await page.keyboard.press('Shift+Tab')
  await expect(lastButton).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(closeButton).toBeFocused()

  await dialog.getByRole('button', { name: '存档与读取' }).click()
  const savesDialog = page.getByRole('dialog', { name: '存档记录' })
  const savesCloseButton = savesDialog.getByRole('button', { name: '关闭' })
  const hiddenFileInput = savesDialog.locator('input[type="file"]')
  const visibleSaveButtons = savesDialog.locator('.save-list button:visible')
  await expect(savesDialog).toBeVisible()
  await expect(savesCloseButton).toBeFocused()
  await expect(hiddenFileInput).toHaveAttribute('tabindex', '-1')

  await page.keyboard.press('Shift+Tab')
  await expect(visibleSaveButtons.last()).toBeFocused()
  await expect(hiddenFileInput).not.toBeFocused()
  await page.keyboard.press('Tab')
  await expect(savesCloseButton).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(savesDialog).toHaveCount(0)
  await expect(menuButton).toBeFocused()
  expect(pageErrors).toEqual([])
})

test('横竖屏顶部、选项与快捷控件均满足44px且顶部按钮不压住选项', async ({ page }) => {
  const pageErrors = collectPageErrors(page)
  await startGame(page)

  for (const viewport of [
    { width: 390, height: 844, label: '竖屏' },
    { width: 844, height: 390, label: '横屏' },
  ]) {
    await page.setViewportSize(viewport)

    await jumpToSavedNode(page, 'p01-mentor-call')
    const chatReplies = page.locator('.chat-stage .reply-list button:visible')
    await expect(chatReplies.first(), `${viewport.label}应显示聊天回复`).toBeVisible()
    await expectMinimumTarget(chatReplies)

    await jumpToSavedNode(page, 'p08-shana-invite')
    const choices = page.locator('.choice-panel button:visible')
    await expect(choices.first(), `${viewport.label}应显示路线选项`).toBeVisible()

    const topButtons = page.locator('.top-bar nav button:visible')
    const quickButtons = page.locator('.quick-controls button:visible')
    await expectMinimumTarget(topButtons)
    await expectMinimumTarget(choices)
    await expectMinimumTarget(quickButtons)

    const topCount = await topButtons.count()
    const choiceCount = await choices.count()
    for (let topIndex = 0; topIndex < topCount; topIndex += 1) {
      const topBox = await topButtons.nth(topIndex).boundingBox()
      if (!topBox) throw new Error(`${viewport.label}顶部按钮缺少布局盒`)
      for (let choiceIndex = 0; choiceIndex < choiceCount; choiceIndex += 1) {
        const choiceBox = await choices.nth(choiceIndex).boundingBox()
        if (!choiceBox) throw new Error(`${viewport.label}选项缺少布局盒`)
        expect(
          boxesIntersect(topBox, choiceBox),
          `${viewport.label}顶部按钮 ${topIndex + 1} 不应与选项 ${choiceIndex + 1} 相交`,
        ).toBe(false)
      }
    }

    await page.getByRole('button', { name: '菜单' }).click()
    await page.getByRole('dialog', { name: '暂停菜单' }).getByRole('button', { name: '存档与读取' }).click()
    const savesDialog = page.getByRole('dialog', { name: '存档记录' })
    const saveButtons = savesDialog.locator('.save-list button:visible')
    await expect(saveButtons.first(), `${viewport.label}应显示存档操作`).toBeVisible()
    await expectMinimumTarget(saveButtons)
    await savesDialog.getByRole('button', { name: '关闭' }).click()
  }

  expect(pageErrors).toEqual([])
})
