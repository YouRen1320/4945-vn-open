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
const sourceRoot = resolve(projectRoot, 'artifacts/imagegen-v18')
const outputRoot = resolve(gameRoot, 'public/assets/cg')
const MAX_OUTPUT_BYTES = 500 * 1024
const WEBP_QUALITY_STEPS = Object.freeze([90, 86, 82, 78, 74])

// The roster doubles as a strict write boundary while v1.8 CGs are produced in phases.
const CHARACTER_IDS = Object.freeze([
  'shana', 'qifu', 'chenyi', 'swordheart', 'heartbeat', 'yanqiu',
  'huayue', 'wenxian', 'takemehand', 'xilufei', 'yyt', 'avucii',
])

const jobsByCharacter = new Map(CHARACTER_IDS.map((characterId) => [
  characterId,
  Object.freeze({
    characterId,
    sourcePath: resolve(sourceRoot, `romance-${characterId}-confession-v1-source.png`),
    outputPath: resolve(outputRoot, `romance-${characterId}-confession-v1.webp`),
  }),
]))
const allowedOutputPaths = new Set([...jobsByCharacter.values()].map(({ outputPath }) => outputPath))

function parseArguments(args) {
  if (args.length === 0) return CHARACTER_IDS
  if (args.length === 2 && args[0] === '--character' && jobsByCharacter.has(args[1])) return [args[1]]
  throw new Error(`Use no arguments or --character <id>. Allowed IDs: ${CHARACTER_IDS.join(', ')}`)
}

async function readable(filePath) {
  try {
    await access(filePath, fsConstants.R_OK)
    return true
  } catch {
    return false
  }
}

async function magick(args, context) {
  try {
    return await execFileAsync('magick', args, { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 })
  } catch (error) {
    const detail = error?.stderr?.trim() || error?.message || String(error)
    throw new Error(`${context}\n${detail}`)
  }
}

function assertOutputPath(outputPath) {
  if (!allowedOutputPaths.has(resolve(outputPath))) {
    throw new Error(`Refusing to write outside the v1.8 CG whitelist: ${outputPath}`)
  }
}

async function packageJob(job, stagingDirectory) {
  const stagedPath = join(stagingDirectory, basename(job.outputPath))
  let outputBytes = Number.POSITIVE_INFINITY
  for (const quality of WEBP_QUALITY_STEPS) {
    await magick([
      job.sourcePath, '-auto-orient', '-resize', '1600x900^', '-gravity', 'center', '-extent', '1600x900',
      '-strip', '-colorspace', 'sRGB', '-quality', String(quality), '-define', 'webp:method=6', stagedPath,
    ], `Could not package the v1.8 confession CG for "${job.characterId}".`)
    outputBytes = (await stat(stagedPath)).size
    if (outputBytes <= MAX_OUTPUT_BYTES) break
  }
  const { stdout } = await magick(['identify', '-format', '%w %h %m', stagedPath], `Could not inspect "${job.characterId}".`)
  if (stdout.trim() !== '1600 900 WEBP' || outputBytes > MAX_OUTPUT_BYTES) {
    throw new Error(`Invalid v1.8 CG for "${job.characterId}"; expected 1600x900 WEBP at most 500 KiB.`)
  }
  return { ...job, stagedPath, outputBytes }
}

async function main() {
  const ids = parseArguments(process.argv.slice(2))
  const jobs = ids.map((id) => jobsByCharacter.get(id))
  const missing = (await Promise.all(jobs.map(async (job) => ({ job, ready: await readable(job.sourcePath) }))))
    .filter(({ ready }) => !ready)
    .map(({ job }) => job.sourcePath)
  if (missing.length) throw new Error(`Missing v1.8 confession sources:\n${missing.map((path) => `  - ${path}`).join('\n')}`)
  await magick(['-version'], 'ImageMagick is required to package CGs.')
  await mkdir(outputRoot, { recursive: true })
  const stagingDirectory = await mkdtemp(join(outputRoot, '.package-v18-cgs-'))
  try {
    const stagedJobs = []
    for (const job of jobs) stagedJobs.push(await packageJob(job, stagingDirectory))
    for (const job of stagedJobs) {
      assertOutputPath(job.outputPath)
      await rename(job.stagedPath, job.outputPath)
      console.log(`Packaged ${job.characterId}: ${(job.outputBytes / 1024).toFixed(1)} KiB`)
    }
  } finally {
    await rm(stagingDirectory, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error(`package:v18-cgs failed:\n${error.message}`)
  process.exitCode = 1
})
