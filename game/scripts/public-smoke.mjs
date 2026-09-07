import { readFileSync } from 'node:fs'

import { chromium } from '@playwright/test'

// 期望版本直接取 package.json（应用内版本号也由它经 vite define 注入），发版无需手工同步本脚本。
const appVersion = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version

const target = process.env.PUBLIC_URL ?? 'https://4945.iyouren.top'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 })
const errors = []
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
await page.addInitScript(() => {
  localStorage.setItem('4945-vn:settings', JSON.stringify({ reducedMotion: true, textSpeed: 8 }))
})

// Deep public checks reuse the real autosave contract instead of exposing a production debug route.
const jumpToPublicNode = async (nodeId) => {
  await page.evaluate((target) => {
    const key = '4945-vn:v4:save:auto'
    const record = JSON.parse(localStorage.getItem(key) ?? 'null')
    if (!record?.state) throw new Error('公网自动存档尚未建立')
    record.nodeId = target
    record.state.nodeId = target
    localStorage.setItem(key, JSON.stringify(record))
  }, nodeId)
  await page.reload({ waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /继续主线/ }).click()
}

// Prime the released support contract through the current autosave, then exercise it through public UI.
const primeHeartbeatSupport = async () => {
  await page.evaluate(() => {
    const key = '4945-vn:v4:save:auto'
    const record = JSON.parse(localStorage.getItem(key) ?? 'null')
    if (!record?.state?.relationships?.heartbeat) throw new Error('公网自动存档缺少心跳关系数据')
    record.state.relationships.heartbeat.progress = 100
    record.state.stats.reputation = 0
    record.state.stats.cohesion = 0
    record.state.supportAbilities.heartbeat = {
      unlocked: true,
      charges: 1,
      active: false,
      lastRechargeChapter: record.state.chapter,
    }
    localStorage.setItem(key, JSON.stringify(record))
  })
}

// Seed one legitimate invitation without exposing a production-only debug route.
const primeShanaInvitation = async () => {
  await page.evaluate(() => {
    const key = '4945-vn:v4:save:auto'
    const record = JSON.parse(localStorage.getItem(key) ?? 'null')
    if (!record?.state?.relationships?.shana) throw new Error('公网自动存档缺少夏娜关系数据')
    record.state.relationships.shana.progress = 30
    record.state.activePartner = null
    for (const flag of Object.keys(record.state.flags)) {
      if (flag.startsWith('bonded')) delete record.state.flags[flag]
    }
    delete record.state.flags.romanceNightMarketDate_shana
    delete record.state.flags.romanceNightMarketPartner_shana
    delete record.state.flags.bondedShana
    localStorage.setItem(key, JSON.stringify(record))
  })
}

// Public QA waits for decoded artwork and completed scene transitions before accepting or capturing a frame.
const waitForPublicSprite = async (selector) => {
  await page.waitForFunction(async (target) => {
    const element = document.querySelector(target)
    if (!(element instanceof HTMLImageElement) || !element.isConnected) return false
    try { await element.decode() } catch { return false }
    return document.querySelector(target) === element && element.complete && element.naturalWidth > 0
  }, selector)
}

const waitForPublicScene = async (fileName) => {
  const selector = `.scene-image[data-image-state="ready"][data-image-url*="${fileName}"]`
  const scene = page.locator(selector)
  await scene.waitFor()
  await page.waitForFunction((target) => {
    const element = document.querySelector(target)
    return Boolean(element && Number.parseFloat(getComputedStyle(element).opacity) >= .99)
  }, selector)
}

try {
  const response = await page.goto(target, { waitUntil: 'networkidle', timeout: 30_000 })
  if (!response?.ok()) throw new Error(`首页响应异常：${response?.status() ?? '无响应'}`)
  await page.getByRole('heading', { name: '4945区', exact: true }).waitFor()
  await page.getByRole('button', { name: /开始主线/ }).waitFor()

  // The public title must expose a mobile-safe group entry with both the official link and numeric fallback.
  const communityButton = page.getByRole('button', { name: '加入4945区区群，QQ群1075594288' })
  await communityButton.waitFor()
  await communityButton.click()
  const communityDialog = page.getByRole('dialog', { name: '加入4945区区群' })
  await communityDialog.getByText('1075594288', { exact: true }).waitFor()
  await communityDialog.getByRole('link', { name: '一键加入QQ群' }).waitFor()
  await communityDialog.getByRole('button', { name: '复制群号' }).waitFor()
  await page.keyboard.press('Escape')
  await communityButton.waitFor()

  // 标题页将非主线入口收进“更多内容”；公网验收仍需穿过真实层级验证更新说明与设置。
  const moreButton = page.getByRole('button', { name: /更多内容/ })
  await moreButton.click()
  const extrasDialog = page.getByRole('dialog', { name: '更多内容' })
  const releaseNotesButton = extrasDialog.getByRole('button', { name: /本次更新/ })
  await releaseNotesButton.getByText('NEW', { exact: true }).waitFor()
  await releaseNotesButton.click()
  const releaseNotesDialog = page.getByRole('dialog', { name: '本次更新' })
  await releaseNotesDialog.getByText(`VERSION ${appVersion}`, { exact: true }).waitFor()
  // 历史版本说明会继续累积；公网门禁只固定当前稳定版不可缺少的核心章节。
  for (const heading of ['事件三完整季', '完整结局与失败余波', '十五种关系状态完整收束', '第三季独立结局档案']) {
    await releaseNotesDialog.getByRole('heading', { name: heading, exact: true }).waitFor()
  }
  await page.keyboard.press('Escape')
  await moreButton.waitFor()
  if (await page.evaluate(() => localStorage.getItem('4945-vn:release-notes-seen')) !== appVersion) {
    throw new Error('公网更新说明已读版本未正确保存')
  }

  await moreButton.click()
  const reopenedExtrasDialog = page.getByRole('dialog', { name: '更多内容' })
  const readReleaseNotesButton = reopenedExtrasDialog.getByRole('button', { name: /本次更新/ })
  if (await readReleaseNotesButton.getByText('NEW', { exact: true }).count()) {
    throw new Error('公网更新说明已读后仍显示 NEW')
  }

  await reopenedExtrasDialog.getByRole('button', { name: /设置/ }).click()
  const settingsDialog = page.getByRole('dialog', { name: '设置' })
  await settingsDialog.getByText(`免费同人创作 · v${appVersion}`, { exact: true }).waitFor()
  await settingsDialog.getByRole('button', { name: '关闭' }).click()
  const manifest = await page.evaluate(async () => {
    const result = await fetch('/manifest.webmanifest')
    if (!result.ok) throw new Error(`manifest 响应异常：${result.status}`)
    return result.json()
  })
  const serviceWorker = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return { supported: false, active: false, scriptURL: null }
    const registration = await navigator.serviceWorker.ready
    return {
      supported: true,
      active: Boolean(registration.active),
      scriptURL: registration.active?.scriptURL ?? null,
    }
  })
  if (!serviceWorker.supported || !serviceWorker.active || !serviceWorker.scriptURL?.endsWith('/sw.js')) {
    throw new Error(`Service Worker 未正确激活：${JSON.stringify(serviceWorker)}`)
  }
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller), undefined, { timeout: 10_000 })
  const serviceWorkerReady = true
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
  if (overflow > 1) throw new Error(`公网页面横向溢出 ${overflow}px`)
  await page.screenshot({ path: 'artifacts/qa-public-mobile.png' })

  // 公网冒烟必须走过真实建档和首个聊天选择，避免只有标题页更新、剧情包仍旧的假通过。
  await page.getByRole('button', { name: /开始主线/ }).click()
  await page.getByRole('button', { name: '查看消息' }).click()
  await page.getByRole('button', { name: '接受邀请' }).click()
  await page.getByLabel('这次准备叫什么？').fill('公网验收')
  await page.getByRole('button', { name: '进入4945区' }).click()
  await page.locator('.dialogue-zone > p').filter({ hasText: /电脑刚关掉/ }).waitFor()
  const openingDialogue = page.locator('.dialogue-zone')
  // 低动态模式会直接完成文字动画；普通模式则可能需要第一次点击先补全文字。
  for (let attempt = 0; attempt < 2 && await openingDialogue.count(); attempt += 1) {
    await openingDialogue.click()
    await page.waitForTimeout(100)
  }
  await page.locator('.chat-stage .message.current p').filter({ hasText: /开服就冲榜，先把一组占住/ }).waitFor()
  await page.locator('.phone-shell').click()
  await page.locator('.chat-stage .reply-list').waitFor()
  if (await page.locator('.dialogue-zone').count()) throw new Error('聊天场景仍叠加底部对白框')
  if (await page.locator('.choice-panel').count()) throw new Error('聊天场景仍叠加全局选项层')
  await page.getByRole('button', { name: /老区没玩好/ }).click()
  await page.locator('.chat-stage .message.current p').filter({ hasText: /一起冲击本服排行榜/ }).waitFor()
  await page.screenshot({ path: 'artifacts/qa-public-game-mobile.png' })

  await jumpToPublicNode('p08-shana-invite')
  await page.locator('.dialogue-zone > p').filter({ hasText: /江南今晚八点带日常/ }).waitFor()
  await page.locator('.dialogue-zone').click()
  await waitForPublicSprite('.character-stage img[src*="expression-determined-v1.webp"]')
  await page.locator('.choice-panel').waitFor()
  await page.screenshot({ path: 'artifacts/qa-public-candidate-mobile.png' })

  await jumpToPublicNode('r2-13-an-resigns')
  await page.locator('.dialogue-zone > p').filter({ hasText: /我就是不想当高层了/ }).waitFor()
  await waitForPublicScene('council-reshuffle-v1.webp')
  await page.locator('.cg-mark').waitFor()
  await page.screenshot({ path: 'artifacts/qa-public-r2-mobile.png' })

  // New route releases get representative public checks so a valid title cannot hide stale chapter assets.
  await jumpToPublicNode('r3-17-management-seats')
  await waitForPublicSprite('.character-stage img[src*="/sprites/truth/"]')
  await waitForPublicSprite('.character-stage img[src*="/sprites/oguri/"]')
  await page.locator('.dialogue-zone').click()
  await page.locator('.choice-panel').waitFor()
  await page.screenshot({ path: 'artifacts/qa-public-r3-mobile.png' })

  await jumpToPublicNode('r4-06-private-aftermath')
  await waitForPublicSprite('.character-stage img[src*="/sprites/takemehand/expression-soft-v1.webp"]')
  await page.locator('.dialogue-zone').click()
  await page.locator('.choice-panel').waitFor()
  await page.screenshot({ path: 'artifacts/qa-public-r4-mobile.png' })

  await jumpToPublicNode('r4-22-sixth-falls')
  await waitForPublicScene('yyt-avucii-handoff-v1.webp')
  await jumpToPublicNode('r4-22b-chenyi-exit')
  await waitForPublicScene('chenyi-leaves-v1.webp')
  await page.screenshot({ path: 'artifacts/qa-public-r4-double-beat-mobile.png' })

  // v1.4 verifies the corrected fifth-group leader plus both newly playable relationship endings.
  await jumpToPublicNode('p08-wenxian-invite')
  await waitForPublicSprite('.character-stage img[src*="/sprites/wenxian/expression-soft-v1.webp"]')
  await page.locator('.dialogue-zone').click()
  await page.locator('.choice-panel').waitFor()
  await page.screenshot({ path: 'artifacts/qa-public-wenxian-female-mobile.png' })

  await jumpToPublicNode('r5-01a-empty-seat-chat')
  await waitForPublicSprite('.featured-character img[src*="/sprites/wenxian/expression-concerned-v1.webp"]')
  await jumpToPublicNode('r6-09b-qifu-acknowledges')
  await waitForPublicSprite('.featured-character img[src*="/sprites/qifu/expression-concerned-v1.webp"]')

  await jumpToPublicNode('r2-28-remnants')
  await waitForPublicScene('r2-org6-remnants-v1.webp')
  await jumpToPublicNode('r2-31-bond-swordheart')
  await waitForPublicScene('bond-swordheart-v1.webp')
  await jumpToPublicNode('r4-24-bond-huayue')
  await waitForPublicScene('bond-huayue-v1.webp')
  await page.screenshot({ path: 'artifacts/qa-public-v1.4-bonds-mobile.png' })

  // v1.5 representative member scenes, fictional branches and romance CGs must all survive packaging.
  await jumpToPublicNode('r2-30ah-lan-night-talk')
  await waitForPublicSprite('.featured-character img[src*="/sprites/lan/"]')
  await page.locator('.phone-shell').click()
  await page.locator('.chat-stage .message.current p').filter({ hasText: /红白请柬/ }).waitFor()
  await page.locator('.chat-stage .reply-list').waitFor()
  await page.getByRole('button', { name: /活着回来/ }).waitFor()
  await page.screenshot({ path: 'artifacts/qa-public-v1.5-lan-mobile.png' })
  await jumpToPublicNode('r6-23i-xingqing-night')
  await waitForPublicSprite('.featured-character img[src*="/sprites/xingqing/"]')
  await page.locator('.phone-shell').click()
  await page.locator('.chat-stage .message.current p').filter({ hasText: /猫替我试了/ }).waitFor()
  await page.locator('.chat-stage .reply-list').waitFor()
  await page.screenshot({ path: 'artifacts/qa-public-v1.5-xingqing-mobile.png' })

  await jumpToPublicNode('r2-31-bond-chenyi')
  await waitForPublicScene('bond-chenyi-v1.webp')
  await jumpToPublicNode('r6-24-bond-yyt')
  await waitForPublicScene('bond-yyt-v1.webp')
  await jumpToPublicNode('r3-20f2-pet-contracted')
  await waitForPublicScene('pet-jiangjinjiu-v1.webp')
  await jumpToPublicNode('r6-24-bond-avucii')
  await waitForPublicScene('bond-avucii-v1.webp')
  await page.screenshot({ path: 'artifacts/qa-public-v1.5-new-cg-mobile.png' })

  // v1.6 opens the in-game bond stage and a real full-screen night-market date.
  await primeShanaInvitation()
  await jumpToPublicNode('p01-mentor-call')
  await page.getByRole('button', { name: '羁绊与约会' }).click()
  const romanceDialog = page.getByRole('dialog', { name: '羁绊 · 幻想夜市' })
  await romanceDialog.getByRole('button', { name: '赴约 · 不谈要塞的晚饭' }).waitFor()
  await page.waitForFunction(() => {
    const backdrop = document.querySelector('.modal-backdrop')
    return Boolean(backdrop && getComputedStyle(backdrop).opacity === '1')
  })
  await page.screenshot({ path: 'artifacts/qa-public-v1.6-romance-panel-mobile.png' })
  await romanceDialog.getByRole('button', { name: '赴约 · 不谈要塞的晚饭' }).click()
  // 夏娜约会背景是 v1.8 已就绪的雨版美食街（romanceFoodStreetRain），断言最终图而非旧占位。
  await waitForPublicScene('romance-food-street-rain-v1.webp')
  await page.locator('.dialogue-zone > p').filter({ hasText: /情侣套餐，还是临时同盟套餐/ }).waitFor()
  await page.locator('.choice-panel').waitFor()
  await page.screenshot({ path: 'artifacts/qa-public-v1.6-romance-date-mobile.png' })

  // v1.7 must serve a real per-character payoff CG and unlock it through the released story node.
  await jumpToPublicNode('romance-shana-first-date-complete')
  await waitForPublicScene('romance-shana-first-date-v1.webp')
  await page.locator('.dialogue-zone > p').filter({ hasText: /整晚没有讨论一次组织战/ }).waitFor()
  await page.screenshot({ path: 'artifacts/qa-public-v1.7-first-date-cg-mobile.png' })

  await primeHeartbeatSupport()
  await jumpToPublicNode('p08-heartbeat-invite')
  await page.locator('.dialogue-zone').click()
  await page.locator('.choice-panel').waitFor()
  await page.getByRole('button', { name: '心跳支援·1' }).click()
  await page.getByRole('button', { name: /先把我排普通成员/ }).click()
  await page.getByText(/心跳支援协助了这次回应/).waitFor()

  const gameplayOverflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
  if (gameplayOverflow > 1) throw new Error(`公网游戏横向溢出 ${gameplayOverflow}px`)
  if (errors.length) throw new Error(`浏览器错误：${errors.join(' | ')}`)
  console.log(JSON.stringify({
    url: page.url(), status: response.status(), title: await page.title(), manifest: manifest.name,
    serviceWorkerReady,
    gameplay: 'title community entry + official QQ invite + changelog + setup + all route visuals + romance + heartbeat support passed',
  }, null, 2))
} finally {
  await browser.close()
}
