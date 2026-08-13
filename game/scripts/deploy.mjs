#!/usr/bin/env node
/**
 * 部署到阿里云轻量服务器（SSH 别名 aliyun-4945）。
 *
 * 流程：构建 → rsync dist 到 releases/<version>（同版本已存在则追加 -rN 修订号）
 * → 原子切换 current 软链。旧版本目录全部保留，回退只需把软链指回去。
 *
 * 用法：npm run deploy [-- --skip-build] [-- --dry-run]
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const HOST = 'aliyun-4945'
const REMOTE_ROOT = '/srv/4945-vn'

const skipBuild = process.argv.includes('--skip-build')
const dryRun = process.argv.includes('--dry-run')
const gameRoot = dirname(fileURLToPath(new URL('../package.json', import.meta.url)))
const distRoot = resolve(gameRoot, 'dist')

const run = (cmd, args, options = {}) => execFileSync(cmd, args, { stdio: 'inherit', ...options })
const ssh = (script) => run('ssh', [HOST, script])
const sshCapture = (script) => execFileSync('ssh', [HOST, script], { encoding: 'utf8' }).trim()
const quoteSh = (value) => `'${String(value).replaceAll("'", "'\"'\"'")}'`

const version = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version
if (!/^[A-Za-z0-9][A-Za-z0-9._+-]*$/.test(version)) throw new Error(`非法发布版本号：${version}`)

if (!skipBuild) run('npm', ['run', 'build'], { cwd: gameRoot })

// --skip-build 也必须验证完整制品，防止从错误目录或陈旧 dist 发布。
const requiredFiles = ['index.html', '.vite/manifest.json', 'sw.js']
for (const relativePath of requiredFiles) {
  const file = resolve(distRoot, relativePath)
  if (!existsSync(file) || !statSync(file).isFile()) throw new Error(`发布制品缺失：dist/${relativePath}`)
}
const manifest = JSON.parse(readFileSync(resolve(distRoot, '.vite/manifest.json'), 'utf8'))
const manifestAssets = new Set()
for (const entry of Object.values(manifest)) {
  if (entry.file) manifestAssets.add(entry.file)
  for (const css of entry.css ?? []) manifestAssets.add(css)
  for (const asset of entry.assets ?? []) manifestAssets.add(asset)
}
if (manifestAssets.size === 0) throw new Error('发布 manifest 未包含任何构建资源。')
for (const relativePath of manifestAssets) {
  const file = resolve(distRoot, relativePath)
  if (!file.startsWith(`${distRoot}${sep}`) || !existsSync(file) || !statSync(file).isFile()) {
    throw new Error(`manifest 引用的制品无效：${relativePath}`)
  }
}
const serviceWorker = readFileSync(resolve(distRoot, 'sw.js'), 'utf8')
if (!/const BUILD_ASSETS = \[\s*['"]\//.test(serviceWorker)) {
  throw new Error('dist/sw.js 的 BUILD_ASSETS 为空或未注入。')
}

// 同版本重复发布时自动追加修订号，保留历史目录作为回退点。
const releasesDir = `${REMOTE_ROOT}/releases`
const existingOutput = sshCapture(`find ${quoteSh(releasesDir)} -mindepth 1 -maxdepth 1 -type d -printf '%f\\n' 2>/dev/null || true`)
const existing = existingOutput ? existingOutput.split('\n') : []
let release = version
if (existing.includes(release)) {
  let revision = 1
  while (existing.includes(`${version}-r${revision}`)) revision += 1
  release = `${version}-r${revision}`
}
const target = `${REMOTE_ROOT}/releases/${release}`
const staging = `${REMOTE_ROOT}/.staging/${release}-${Date.now()}-${process.pid}`

if (dryRun) {
  console.log(`[dry-run] 将发布版本 ${version} 到 ${HOST}:${target} 并切换 current 软链。`)
  process.exit(0)
}

ssh(`mkdir -p ${quoteSh(staging)}`)
run('rsync', ['-az', '--delete', '--exclude', '.DS_Store', '-e', 'ssh', `${distRoot}/`, `${HOST}:${staging}/`])
// 上传完成后再把 staging 提升为不可变 release，并用唯一临时软链原子切换 current。
const temporaryLink = `${REMOTE_ROOT}/.current-${release}-${process.pid}`
ssh([
  `mkdir -p ${quoteSh(releasesDir)}`,
  `test ! -e ${quoteSh(target)}`,
  `test -f ${quoteSh(`${staging}/index.html`)}`,
  `test -f ${quoteSh(`${staging}/sw.js`)}`,
  `mv ${quoteSh(staging)} ${quoteSh(target)}`,
  `ln -s ${quoteSh(target)} ${quoteSh(temporaryLink)}`,
  `mv -T ${quoteSh(temporaryLink)} ${quoteSh(`${REMOTE_ROOT}/current`)}`,
].join(' && '))

const deployed = sshCapture(`readlink ${quoteSh(`${REMOTE_ROOT}/current`)}`)
if (deployed !== target) throw new Error(`软链校验失败：current -> ${deployed}，期望 ${target}`)

console.log(`部署完成：https://4945.iyouren.top （${release}）`)
console.log(`回退命令：为旧版本创建唯一临时软链，再用 mv -T 原子替换 ${REMOTE_ROOT}/current。`)
console.log('建议随后运行 npm run smoke:public 做公网冒烟验收。')
