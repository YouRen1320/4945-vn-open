import { expect, test } from '@playwright/test'

const openGoldenSlice = async (page: import('@playwright/test').Page) => {
  await page.goto('/?preview=golden-slice')
  await page.getByRole('button', { name: /更多内容/ }).click()
  await page.getByRole('dialog', { name: '更多内容' }).getByRole('button', { name: /剧情黄金样板/ }).click()
}

const storageSnapshot = (page: import('@playwright/test').Page) => page.evaluate(() => (
  Object.keys(localStorage).sort().map((key) => [key, localStorage.getItem(key)])
))

const chooseWhenVisible = async (
  page: import('@playwright/test').Page,
  label: RegExp,
) => {
  const choice = page.getByRole('button', { name: label })
  for (let i = 0; i < 80; i += 1) {
    if (await choice.isVisible().catch(() => false)) {
      await choice.click()
      return
    }
    await page.keyboard.press('Space')
    await page.waitForTimeout(20)
  }
  throw new Error(`未抵达选择：${label}`)
}

test('黄金样板只通过内部参数显示，并以不写存档的沙盒启动', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /更多内容/ }).click()
  await expect(page.getByRole('button', { name: /剧情黄金样板/ })).toHaveCount(0)

  await openGoldenSlice(page)
  await expect(page.getByText(/不会写入存档、收藏、结局或正式主线进度/)).toBeVisible()
  await page.getByRole('button', { name: '开始事件一七场试玩' }).click()

  await expect(page.getByText('黄金样板试玩 · 不写存档')).toBeVisible()
  await expect(page.getByRole('button', { name: '退出回放' })).toBeVisible()
})

test('公开表态后回一组仍需排队，完整试玩不改变浏览器存储', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('gs1-e2e-sentinel', 'unchanged')
  })
  await openGoldenSlice(page)
  const before = await storageSnapshot(page)
  await page.getByRole('button', { name: '开始事件一七场试玩' }).click()

  await chooseWhenVisible(page, /首领叫祈福吗/)
  await chooseWhenVisible(page, /告诉我先升哪个最划算/)
  await chooseWhenVisible(page, /能不能再给一天/)
  await chooseWhenVisible(page, /先跟你们把活动打完/)
  await chooseWhenVisible(page, /他现在在我们组/)
  await chooseWhenVisible(page, /现在够了，我想回去试试/)

  await expect(page.getByText(/当前排队：第2位/)).toBeVisible()

  for (let i = 0; i < 20; i += 1) {
    if (await page.getByRole('heading', { name: '剧情黄金样板 · 内测' }).isVisible().catch(() => false)) break
    await page.keyboard.press('Space')
    await page.waitForTimeout(20)
  }

  await expect(page.getByRole('heading', { name: '剧情黄金样板 · 内测' })).toBeVisible()
  expect(await storageSnapshot(page)).toEqual(before)
})

test('主动退出回到黄金样板入口', async ({ page }) => {
  await openGoldenSlice(page)
  await page.getByRole('button', { name: '开始事件一七场试玩' }).click()
  await page.getByRole('button', { name: '退出回放' }).click()
  await expect(page.getByRole('heading', { name: '剧情黄金样板 · 内测' })).toBeVisible()
})

test('事件二代表性样板兑现两次选择回响且不改变浏览器存储', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('gs2-e2e-sentinel', 'unchanged'))
  await openGoldenSlice(page)
  const before = await storageSnapshot(page)
  await page.getByRole('button', { name: '开始事件二 2.6—2.9 试玩' }).click()

  await chooseWhenVisible(page, /公开必要字段/)
  await chooseWhenVisible(page, /先交临时复核表/)
  await chooseWhenVisible(page, /要求封存说明/)

  // 分支回响由内容矩阵测试精确断言；浏览器验收负责真实 UI 收敛与存储隔离。
  for (let i = 0; i < 80; i += 1) {
    if (await page.getByRole('heading', { name: '剧情黄金样板 · 内测' }).isVisible().catch(() => false)) break
    await page.keyboard.press('Space')
    await page.waitForTimeout(20)
  }
  await expect(page.getByRole('heading', { name: '剧情黄金样板 · 内测' })).toBeVisible()
  expect(await storageSnapshot(page)).toEqual(before)
})
