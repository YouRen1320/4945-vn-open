#!/usr/bin/env node
/**
 * 源码备份：把 game/src、构建配置与剧情/设计文档打成带时间戳的 tar.gz，
 * 输出到项目根 backups/。用于发版或大改前的快速回退点，不替代 Git。
 */
import { execFileSync } from 'node:child_process'
import { chmodSync, existsSync, lstatSync, mkdirSync, renameSync, statSync, unlinkSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const gameRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const projectRoot = path.resolve(gameRoot, '..')
const backupDir = path.join(projectRoot, 'backups')
if (existsSync(backupDir)) {
  const info = lstatSync(backupDir)
  if (!info.isDirectory() || info.isSymbolicLink()) throw new Error('backups 必须是真实目录，不能是文件或符号链接。')
} else {
  mkdirSync(backupDir, { recursive: true, mode: 0o700 })
}
chmodSync(backupDir, 0o700)

const now = new Date()
const stamp = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0'),
  '-',
  String(now.getHours()).padStart(2, '0'),
  String(now.getMinutes()).padStart(2, '0'),
  String(now.getSeconds()).padStart(2, '0'),
  '-',
  String(now.getMilliseconds()).padStart(3, '0'),
  '-',
  String(process.pid),
].join('')

const target = path.join(backupDir, `game-src-${stamp}.tar.gz`)
const temporaryTarget = `${target}.tmp`

const includes = [
  'game/src',
  'game/e2e',
  'game/scripts',
  'game/package.json',
  'game/package-lock.json',
  'game/public',
  'game/deploy',
  'game/docs',
  'game/tsconfig.json',
  'game/tsconfig.app.json',
  'game/tsconfig.node.json',
  'game/vite.config.ts',
  'game/vitest.config.ts',
  'game/playwright.config.ts',
  'game/index.html',
  'docs',
  // The release asset audit reads these manifests outside game/, so a restorable source backup must include them.
  'artifacts/imagegen-v18/PROMPTS.md',
  'artifacts/imagegen-v18/BACKGROUND-PROMPTS.md',
  'artifacts/imagegen-v18/EXPRESSION-PROMPTS.md',
  '.github',
  '.gitignore',
  'AGENTS.md',
]

try {
  execFileSync('tar', ['-czf', temporaryTarget, '--', ...includes], { cwd: projectRoot, stdio: 'inherit' })
  const members = execFileSync('tar', ['-tzf', temporaryTarget], { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean)
  if (members.some((member) => member.startsWith('/') || member.split('/').includes('..'))) {
    throw new Error('备份归档包含不安全路径。')
  }
  for (const expected of includes) {
    if (!members.some((member) => member === expected || member.startsWith(`${expected}/`))) {
      throw new Error(`备份归档缺少：${expected}`)
    }
  }
  renameSync(temporaryTarget, target)
  chmodSync(target, 0o600)
} catch (error) {
  if (existsSync(temporaryTarget)) unlinkSync(temporaryTarget)
  throw error
}

const size = statSync(target).size
if (size < 1024) throw new Error(`备份产物异常（${size} 字节），请检查 tar 输出。`)
console.log(`备份完成：${path.relative(projectRoot, target)}（${(size / 1024 / 1024).toFixed(1)} MB）`)
