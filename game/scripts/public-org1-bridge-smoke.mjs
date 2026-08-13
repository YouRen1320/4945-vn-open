import { chromium } from '@playwright/test'

const target = process.env.PUBLIC_URL ?? 'https://4945.iyouren.top'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 1 })
const errors = []

page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
await page.addInitScript(() => {
  localStorage.setItem('4945-vn:settings', JSON.stringify({ reducedMotion: true, textSpeed: 8 }))
})

try {
  const response = await page.goto(target, { waitUntil: 'networkidle', timeout: 30_000 })
  if (!response?.ok()) throw new Error(`首页响应异常：${response?.status() ?? '无响应'}`)

  // 通过公开建档流程生成结构完整的 v4 自动档，再只替换本次专项验收所需字段。
  await page.getByRole('button', { name: /开始主线/ }).click()
  await page.getByRole('button', { name: '查看消息' }).click()
  await page.getByRole('button', { name: '接受邀请' }).click()
  await page.getByLabel('这次准备叫什么？').fill('一组转线验收')
  await page.getByRole('button', { name: '进入4945区' }).click()
  await page.evaluate(() => {
    const key = '4945-vn:v4:save:auto'
    const record = JSON.parse(localStorage.getItem(key) ?? 'null')
    if (!record?.state) throw new Error('公网自动存档尚未建立')
    record.nodeId = 'credits-first-season'
    record.state.nodeId = 'credits-first-season'
    record.state.route = 'org1'
    record.state.organization = 'org1'
    record.state.organizationName = '群雄逐鹿'
    record.state.unlockedEndings = ['r1-order']
    record.state.history = []
    localStorage.setItem(key, JSON.stringify(record))
  })
  await page.reload({ waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /继续主线/ }).click()

  const stage = page.locator('.ending-stage')
  await stage.getByText('第一席的结局已经保存').waitFor()
  await stage.getByRole('button', { name: '选择事件二去向' }).click()
  await stage.getByRole('radio', { name: /4组 · 天上白玉京/ }).click()
  await stage.getByRole('button', { name: /加入天上白玉京，进入事件二/ }).click()
  await stage.waitFor({ state: 'detached' })
  await page.locator('.chapter-mark').filter({ hasText: '事件二' }).waitFor()

  const inherited = await page.evaluate(() => {
    const key = Object.keys(localStorage).find((candidate) => candidate.startsWith('4945-vn:v5:save:'))
    const record = key ? JSON.parse(localStorage.getItem(key) ?? 'null') : null
    return {
      route: record?.state?.route,
      ending: record?.state?.season1Outcome?.organizationEndingId,
      origin: record?.state?.season1Outcome?.routeTransfer?.fromRoute,
    }
  })
  if (JSON.stringify(inherited) !== JSON.stringify({ route: 'org4', ending: 'r1-order', origin: 'org1' })) {
    throw new Error(`一组转线摘要异常：${JSON.stringify(inherited)}`)
  }

  const dialogue = page.locator('.dialogue-zone')
  const transferMessage = page.locator('.chat-stage .message.current p').filter({ hasText: /第一席的经历没有被抹去/ })
  await page.waitForTimeout(500)
  if (await dialogue.isVisible()) {
    await dialogue.click()
    if (!await transferMessage.isVisible() && await dialogue.isVisible()) await dialogue.click()
  } else {
    // 移动端偶发在自动播放状态隐藏对白控件；键盘继续键走同一公开交互边界。
    await page.keyboard.press('Enter')
    await page.keyboard.press('Enter')
  }
  await transferMessage.waitFor()
  if (errors.length) throw new Error(`页面错误：${errors.join(' | ')}`)

  console.log(JSON.stringify({ url: target, status: response.status(), inherited, prologue: 'org1 transfer acknowledged' }, null, 2))
} finally {
  await browser.close()
}
