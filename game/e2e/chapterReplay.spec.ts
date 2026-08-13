import { expect, test } from '@playwright/test'

// 2.0 章节回放端到端：解锁入口、进入沙盒、隔离提示、退出回到章节选择。
// 浏览器端不可见的持久层在回放期间必须保持原状，这里用种子收藏解锁入口并验证 UI 契约。

const seedChapterReplayUnlocked = async (page: import('@playwright/test').Page) => {
  await page.addInitScript(() => {
    localStorage.setItem('4945-vn:collection', JSON.stringify({
      seenNodes: [],
      unlockedCgs: [],
      unlockedEndings: ['r2-second-pole'],
    }))
  })
  await page.goto('/')
}

const openChapterReplay = async (page: import('@playwright/test').Page) => {
  await page.getByRole('button', { name: /更多内容/ }).click()
  await page.getByRole('dialog', { name: '更多内容' }).getByRole('button', { name: '章节回放' }).click()
}

test('章节回放入口在解锁后出现，并进入标准沙盒', async ({ page }) => {
  await seedChapterReplayUnlocked(page)

  await page.getByRole('button', { name: /更多内容/ }).click()
  const chapterReplayButton = page.getByRole('dialog', { name: '更多内容' }).getByRole('button', { name: '章节回放' })
  await expect(chapterReplayButton).toBeVisible()
  await chapterReplayButton.click()

  await expect(page.getByRole('heading', { name: '共通序章' })).toBeVisible()
  // 共通序章分组内的“序章”入口始终可用。
  const prologueChip = page.locator('.route-group').first().getByRole('button', { name: '序章' })
  await expect(prologueChip).toBeEnabled()
  await prologueChip.click()

  // 进入沙盒后显示回放标识，且明确“不写存档”。
  await expect(page.getByText('标准章节回放 · 不写存档')).toBeVisible()
  await expect(page.getByRole('button', { name: '退出回放' })).toBeVisible()
})

test('回放期间保存被阻止，并提示不写存档', async ({ page }) => {
  await seedChapterReplayUnlocked(page)
  await openChapterReplay(page)
  await page.locator('.route-group').first().getByRole('button', { name: '序章' }).click()

  // 触发顶栏 Q.SAVE（键盘 S 在游戏控制下绑定快速保存）。
  await page.keyboard.press('s')
  await expect(page.getByText(/章节回放不会写入存档/)).toBeVisible()
})

test('主动退出章节回放回到章节选择', async ({ page }) => {
  await seedChapterReplayUnlocked(page)
  await openChapterReplay(page)
  await page.locator('.route-group').first().getByRole('button', { name: '序章' }).click()
  await page.getByRole('button', { name: '退出回放' }).click()

  // 退出后应重新看到章节选择面板。
  await expect(page.getByRole('heading', { name: '共通序章' })).toBeVisible()
})
