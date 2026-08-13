#!/usr/bin/env node

import { execFile } from 'node:child_process'
import { constants as fsConstants } from 'node:fs'
import { access, mkdir, mkdtemp, rename, rm, stat } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const gameRoot = resolve(scriptDirectory, '..')
const projectRoot = resolve(gameRoot, '..')
const sourceRoot = resolve(projectRoot, 'artifacts/imagegen-v17')
const outputRoot = resolve(gameRoot, 'public/assets/cg')
const MAX_OUTPUT_BYTES = 500 * 1024
const WEBP_QUALITY_STEPS = Object.freeze([90, 86, 82, 78, 74])

// This whitelist is both the v1.7 content roster and the filesystem write boundary.
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

// Source and destination paths are derived exclusively from trusted IDs, never CLI paths.
const jobsByCharacter = new Map(
  CHARACTER_IDS.map((characterId) => [
    characterId,
    Object.freeze({
      characterId,
      sourcePath: resolve(sourceRoot, `romance-${characterId}-first-date-v1-source.png`),
      outputPath: resolve(outputRoot, `romance-${characterId}-first-date-v1.webp`),
    }),
  ]),
)
const allowedOutputPaths = new Set(
  [...jobsByCharacter.values()].map(({ outputPath }) => outputPath),
)

function printHelp() {
  console.log(`Package the fixed v1.7 first-date romance CG roster.

Usage:
  npm run package:v17-cgs
  npm run package:v17-cgs -- --character <id>
  npm run package:v17-cgs -- --help

Characters:
  ${CHARACTER_IDS.join(', ')}

Source directory:
  ${sourceRoot}

Output directory:
  ${outputRoot}

Each source must be named:
  romance-<id>-first-date-v1-source.png

Each output is written as:
  romance-<id>-first-date-v1.webp
`)
}

function parseArguments(args) {
  if (args.length === 0) {
    return { characterIds: CHARACTER_IDS, showHelp: false }
  }

  if (args.length === 1 && (args[0] === '--help' || args[0] === '-h')) {
    return { characterIds: [], showHelp: true }
  }

  if (args.length === 2 && args[0] === '--character') {
    const characterId = args[1]
    if (!jobsByCharacter.has(characterId)) {
      throw new Error(
        `Unknown character "${characterId}". Allowed IDs: ${CHARACTER_IDS.join(', ')}`,
      )
    }
    return { characterIds: [characterId], showHelp: false }
  }

  throw new Error(
    'Invalid arguments. Use no arguments for all 12 characters, or --character <id> for one.',
  )
}

function assertAllowedOutput(outputPath) {
  const resolvedOutputPath = resolve(outputPath)
  if (!allowedOutputPaths.has(resolvedOutputPath)) {
    throw new Error(`Refusing to write outside the v1.7 CG whitelist: ${resolvedOutputPath}`)
  }
}

async function pathIsReadable(filePath) {
  try {
    await access(filePath, fsConstants.R_OK)
    return true
  } catch {
    return false
  }
}

async function runMagick(args, context) {
  try {
    return await execFileAsync('magick', args, {
      encoding: 'utf8',
      maxBuffer: 4 * 1024 * 1024,
    })
  } catch (error) {
    const detail = error?.stderr?.trim() || error?.message || String(error)
    throw new Error(`${context}\n${detail}`)
  }
}

async function preflightSources(jobs) {
  // Batch mode reports every missing source before creating directories or partial output.
  const checks = await Promise.all(
    jobs.map(async (job) => ({
      job,
      readable: await pathIsReadable(job.sourcePath),
    })),
  )
  const missingJobs = checks.filter(({ readable }) => !readable).map(({ job }) => job)

  if (missingJobs.length > 0) {
    const details = missingJobs
      .map(({ characterId, sourcePath }) => `  - ${characterId}: ${sourcePath}`)
      .join('\n')
    throw new Error(
      `Missing ${missingJobs.length} required source image${missingJobs.length === 1 ? '' : 's'}:\n${details}\nNo CG files were created.`,
    )
  }
}

async function verifyStagedImage(stagedPath, characterId) {
  const { stdout } = await runMagick(
    ['identify', '-format', '%w %h %m', stagedPath],
    `Could not inspect the staged CG for "${characterId}".`,
  )
  const identity = stdout.trim()

  if (identity !== '1600 900 WEBP') {
    throw new Error(
      `Invalid staged CG for "${characterId}": expected "1600 900 WEBP", received "${identity}".`,
    )
  }
}

async function stageJob(job, stagingDirectory) {
  const stagedPath = join(stagingDirectory, basename(job.outputPath))

  let packagedBytes = Number.POSITIVE_INFINITY
  for (const quality of WEBP_QUALITY_STEPS) {
    await runMagick(
      [
        job.sourcePath,
        '-auto-orient',
        '-resize',
        '1600x900^',
        '-gravity',
        'center',
        '-extent',
        '1600x900',
        '-strip',
        '-colorspace',
        'sRGB',
        '-quality',
        String(quality),
        '-define',
        'webp:method=6',
        stagedPath,
      ],
      `Could not package the CG for "${job.characterId}".`,
    )
    packagedBytes = (await stat(stagedPath)).size
    if (packagedBytes <= MAX_OUTPUT_BYTES) break
  }
  if (packagedBytes > MAX_OUTPUT_BYTES) {
    throw new Error(
      `Packaged CG for "${job.characterId}" is ${(packagedBytes / 1024).toFixed(1)} KiB; `
      + 'the v1.7 release limit is 500 KiB.',
    )
  }
  await verifyStagedImage(stagedPath, job.characterId)

  return { ...job, stagedPath }
}

async function main() {
  const { characterIds, showHelp } = parseArguments(process.argv.slice(2))
  if (showHelp) {
    printHelp()
    return
  }

  const jobs = characterIds.map((characterId) => jobsByCharacter.get(characterId))
  jobs.forEach(({ outputPath }) => assertAllowedOutput(outputPath))
  await preflightSources(jobs)
  await runMagick(['-version'], 'ImageMagick is required, but the "magick" command is unavailable.')

  await mkdir(outputRoot, { recursive: true })
  const stagingDirectory = await mkdtemp(join(outputRoot, '.package-v17-cgs-'))

  try {
    // Every selected image is converted and validated before any formal CG is replaced.
    const stagedJobs = []
    for (const job of jobs) {
      stagedJobs.push(await stageJob(job, stagingDirectory))
    }

    for (const { characterId, outputPath, stagedPath } of stagedJobs) {
      assertAllowedOutput(outputPath)
      await rename(stagedPath, outputPath)
      console.log(`Packaged ${characterId}: ${outputPath}`)
    }

    console.log(`Packaged ${stagedJobs.length} v1.7 CG${stagedJobs.length === 1 ? '' : 's'}.`)
  } finally {
    await rm(stagingDirectory, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error(`package:v17-cgs failed:\n${error.message}`)
  process.exitCode = 1
})
