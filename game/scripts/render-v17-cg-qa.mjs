#!/usr/bin/env node

import { execFile } from 'node:child_process'
import { constants as fsConstants } from 'node:fs'
import { access, mkdir, mkdtemp, rename, rm } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const gameRoot = resolve(scriptDirectory, '..')
const projectRoot = resolve(gameRoot, '..')
const cgRoot = resolve(gameRoot, 'public/assets/cg')
const qaRoot = resolve(projectRoot, 'artifacts/imagegen-v17')
const landscapeOutput = resolve(qaRoot, 'v17-romance-landscape-contact-sheet.png')
const mobileOutput = resolve(qaRoot, 'v17-romance-mobile-cover-contact-sheet.png')

const CHARACTER_IDS = Object.freeze([
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
])

const jobs = CHARACTER_IDS.map((characterId) => ({
  characterId,
  input: resolve(cgRoot, `romance-${characterId}-first-date-v1.webp`),
}))

const readable = async (filePath) => {
  try {
    await access(filePath, fsConstants.R_OK)
    return true
  } catch {
    return false
  }
}

const runMagick = async (args, context) => {
  try {
    return await execFileAsync('magick', args, { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 })
  } catch (error) {
    const detail = error?.stderr?.trim() || error?.message || String(error)
    throw new Error(`${context}\n${detail}`)
  }
}

const preflight = async () => {
  const states = await Promise.all(jobs.map(async (job) => ({ ...job, exists: await readable(job.input) })))
  const missing = states.filter(({ exists }) => !exists)
  if (!missing.length) return
  throw new Error(
    `Missing ${missing.length} formal v1.7 CG files:\n`
    + missing.map(({ characterId, input }) => `  - ${characterId}: ${input}`).join('\n')
    + '\nNo QA contact sheets were changed.',
  )
}

const montageArguments = (variant, outputPath) => {
  const args = []
  for (let rowStart = 0; rowStart < jobs.length; rowStart += 4) {
    args.push('(')
    for (const { input } of jobs.slice(rowStart, rowStart + 4)) {
      args.push('(', input)
      if (variant === 'landscape') {
        args.push('-thumbnail', '480x270^', '-gravity', 'center', '-extent', '480x270')
      } else {
        // This exactly mirrors SceneBackdrop's 375×812 `cover` crop at centered focus.
        args.push('-resize', '375x812^', '-gravity', 'center', '-extent', '375x812')
      }
      // Font-free borders keep the contact sheet portable when ImageMagick has no fonts.
      args.push('-bordercolor', '#100e18', '-border', '7x7', ')')
    }
    args.push('+append', ')')
  }
  // Rows and tiles follow CHARACTER_IDS order, printed after rendering for identification.
  args.push('-append', outputPath)
  return args
}

const verifyPng = async (filePath, label) => {
  const { stdout } = await runMagick(
    ['identify', '-format', '%w %h %m', filePath],
    `Could not inspect ${label}.`,
  )
  const [width, height, format] = stdout.trim().split(/\s+/)
  if (format !== 'PNG' || Number(width) <= 0 || Number(height) <= 0) {
    throw new Error(`Invalid ${label}: ${stdout.trim()}`)
  }
}

const main = async () => {
  await preflight()
  await runMagick(['-version'], 'ImageMagick is required, but the "magick" command is unavailable.')
  await mkdir(qaRoot, { recursive: true })
  const stagingRoot = await mkdtemp(join(tmpdir(), '4945-v17-cg-qa-'))
  const stagedLandscape = join(stagingRoot, 'landscape.png')
  const stagedMobile = join(stagingRoot, 'mobile.png')

  try {
    // Both sheets finish and validate before either previous QA artifact is replaced.
    await runMagick(
      montageArguments('landscape', stagedLandscape),
      'Could not render the v1.7 landscape contact sheet.',
    )
    await runMagick(
      montageArguments('mobile', stagedMobile),
      'Could not render the v1.7 mobile cover contact sheet.',
    )
    await verifyPng(stagedLandscape, 'landscape contact sheet')
    await verifyPng(stagedMobile, 'mobile cover contact sheet')
    await rename(stagedLandscape, landscapeOutput)
    await rename(stagedMobile, mobileOutput)
    console.log(`Rendered v1.7 landscape QA: ${landscapeOutput}`)
    console.log(`Rendered v1.7 mobile-cover QA: ${mobileOutput}`)
    console.log(`Tile order: ${CHARACTER_IDS.join(', ')}`)
  } finally {
    await rm(stagingRoot, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error(`qa:v17-cgs failed:\n${error.message}`)
  process.exitCode = 1
})
