import { expect, test } from '@playwright/test'

const firstDateCgs = [
  'shana',
  'qifu',
  'chenyi',
  'swordheart',
  'heartbeat',
  'yanqiu',
  'huayue',
  'wenxian',
  'takemehand',
  'xilufei',
  'yyt',
  'avucii',
].map((character) => ({
  character,
  path: `/assets/cg/romance-${character}-first-date-v1.webp`,
}))

test('十二张首次约会 CG 均由生产站点以真实 1600×900 WebP 提供', async ({ page, request }) => {
  await page.goto('/')

  for (const asset of firstDateCgs) {
    const response = await request.get(asset.path)
    expect(response.status(), `${asset.character} 不应落入 200 HTML 的 SPA fallback`).toBe(200)
    expect(response.headers()['content-type'], `${asset.character} 响应类型`).toContain('image/webp')
  }

  // Browser decoding is the final contract: a valid-looking response header alone cannot unlock a broken CG.
  const decoded = await page.evaluate(async (assets) => Promise.all(assets.map(async (asset) => {
    const image = new Image()
    image.src = asset.path
    await image.decode()
    return {
      character: asset.character,
      complete: image.complete,
      width: image.naturalWidth,
      height: image.naturalHeight,
    }
  })), firstDateCgs)

  for (const image of decoded) {
    expect(image.complete, `${image.character} 浏览器解码状态`).toBe(true)
    expect(image.width, `${image.character} 宽度`).toBe(1600)
    expect(image.height, `${image.character} 高度`).toBe(900)
  }
})
