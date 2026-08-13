import { access, readFile, rename, unlink, writeFile } from 'node:fs/promises'
import { dirname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const manifestPath = new URL('../dist/.vite/manifest.json', import.meta.url)
const serviceWorkerPath = new URL('../dist/sw.js', import.meta.url)
const distDir = fileURLToPath(new URL('../dist/', import.meta.url))
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))

// Vite 的哈希文件名每次构建都会变化；部署前将真实入口、CSS 与静态依赖写入离线壳。
const buildAssets = new Set()
for (const entry of Object.values(manifest)) {
  if (entry.file) buildAssets.add(`/${entry.file}`)
  for (const css of entry.css ?? []) buildAssets.add(`/${css}`)
  for (const asset of entry.assets ?? []) buildAssets.add(`/${asset}`)
}

const assets = [...buildAssets].sort()
if (assets.length === 0) throw new Error('Vite manifest 未包含可缓存的构建资源。')
for (const asset of assets) {
  const absolutePath = resolve(distDir, asset.slice(1))
  if (!absolutePath.startsWith(`${resolve(distDir)}${sep}`)) {
    throw new Error(`构建资源越出 dist：${asset}`)
  }
  await access(absolutePath)
}

const marker = /const BUILD_ASSETS = \[[\s\S]*?\]/
const source = await readFile(serviceWorkerPath, 'utf8')
const markerMatches = source.match(new RegExp(marker.source, 'g')) ?? []
if (markerMatches.length !== 1) {
  throw new Error(`sw.js 必须且只能包含一个 BUILD_ASSETS 标记，当前为 ${markerMatches.length} 个。`)
}

const injected = source.replace(marker, `const BUILD_ASSETS = ${JSON.stringify(assets)}`)
const outputPath = fileURLToPath(serviceWorkerPath)
const temporaryPath = resolve(dirname(outputPath), `.sw.js.${process.pid}.tmp`)
try {
  await writeFile(temporaryPath, injected)
  await rename(temporaryPath, outputPath)
} catch (error) {
  try { await unlink(temporaryPath) } catch { /* 临时文件可能尚未创建。 */ }
  throw error
}
