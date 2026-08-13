import { expect, test } from '@playwright/test'

const chooseVisibleOption = async (page: import('@playwright/test').Page) => {
  const selectors = [
    '.chat-stage .reply-list button',
    '.system-stage .system-actions button',
    '.choice-panel button',
  ]
  for (const selector of selectors) {
    const options = page.locator(`${selector}:visible`)
    if (await options.count()) {
      await options.first().click()
      return true
    }
  }
  return false
}

test('事件三从回顾建档连续完成八章并生成独立结局档案', async ({ page }) => {
  test.setTimeout(60_000)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: /主线进度/ }).click()
  await page.getByRole('dialog', { name: '主线进度 · 事件一与事件二' }).getByRole('button', { name: /事件三 · 选择之后/ }).click()

  const season = page.getByRole('dialog', { name: '主线进度 · 事件三' })
  // 没有真实事件二档案时面板会直接进入回顾建档；有档案时再显式切换。
  const recapSwitch = season.getByText('没有要使用的档案，改用回顾建档')
  if (await recapSwitch.isVisible().catch(() => false)) await recapSwitch.click()
  await season.getByRole('button', { name: '镜花水月', exact: true }).click()
  await season.getByRole('button', { name: '砚秋水', exact: true }).click()
  await season.getByLabel('你的名字').fill('第三季验收')
  await season.getByRole('button', { name: /以回顾建档 · 开始事件三/ }).click()

  let finished = false
  for (let step = 0; step < 420; step++) {
    const heading = page.getByRole('heading', { name: '4945区', exact: true })
    if (await heading.isVisible().catch(() => false)) {
      finished = true
      break
    }
    if (await chooseVisibleOption(page)) continue
    await page.keyboard.press('Enter')
  }
  expect(finished, '第三季应在有限交互内返回标题').toBe(true)

  const snapshot = await page.evaluate(() => {
    const save = JSON.parse(localStorage.getItem('4945-vn:s3:save:1') ?? 'null')
    const outcomes = JSON.parse(localStorage.getItem('4945-vn:v1:s3-outcomes') ?? '[]')
    return { save, outcomes }
  })
  expect(snapshot.save?.state?.flags?.s3Complete).toBe(true)
  expect(snapshot.save?.state?.variables?.s3MainEnding).toMatch(/^s3-ending-/)
  expect(snapshot.outcomes).toHaveLength(1)
  expect(snapshot.outcomes[0].summary.relationshipResolution).toBe('together')
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1)
})
