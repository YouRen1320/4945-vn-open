import fs from 'node:fs'
import path from 'node:path'

import { readWebpDimensions } from './webp-metadata.mjs'

const projectRoot = process.cwd()
const sourceRoot = path.join(projectRoot, 'src')
const publicRoot = path.join(projectRoot, 'public')
const assetPattern = /\/assets\/[A-Za-z0-9_./-]+\.(?:webp|png|jpe?g|svg|mp3|ogg|wav)/g

// Asset references live across Vue components, story data and the shared cache catalog.
const walkFiles = (directory, predicate) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const target = path.join(directory, entry.name)
  if (entry.isDirectory()) return walkFiles(target, predicate)
  return predicate(target) ? [target] : []
})

// Test fixtures may intentionally reference synthetic URLs to exercise fallback rendering;
// only production source files should participate in the deployable asset audit.
const sourceFiles = walkFiles(sourceRoot, (file) => /\.(?:ts|vue|css)$/.test(file) && !/\.test\.ts$/.test(file))
const sourceText = sourceFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n')
const referencedAssets = [...new Set(sourceText.match(assetPattern) ?? [])]

const assetCatalog = fs.readFileSync(path.join(sourceRoot, 'content/assets.ts'), 'utf8')
const spriteCatalog = fs.readFileSync(path.join(sourceRoot, 'content/sprites.ts'), 'utf8')
const storyText = walkFiles(path.join(sourceRoot, 'content/story'), (file) => file.endsWith('.ts'))
  .map((file) => fs.readFileSync(file, 'utf8'))
  .join('\n')
const collectionText = fs.readFileSync(path.join(sourceRoot, 'components/CollectionPanel.vue'), 'utf8')
const cgRegistryText = fs.readFileSync(path.join(sourceRoot, 'content/cgAssets.ts'), 'utf8')
const romanceProfilesText = fs.readFileSync(path.join(sourceRoot, 'content/romanceProfiles.ts'), 'utf8')
const managedVisualsText = fs.readFileSync(path.join(sourceRoot, 'content/visualAssets.ts'), 'utf8')
const imagegenV18Root = path.resolve(projectRoot, '..', 'artifacts/imagegen-v18')
const managedPromptDocuments = {
  CG: fs.readFileSync(path.join(imagegenV18Root, 'PROMPTS.md'), 'utf8'),
  BG: fs.readFileSync(path.join(imagegenV18Root, 'BACKGROUND-PROMPTS.md'), 'utf8'),
  EX: fs.readFileSync(path.join(imagegenV18Root, 'EXPRESSION-PROMPTS.md'), 'utf8'),
}
const projectAssetUrlsText = assetCatalog.match(
  /export const projectAssetUrls\s*=\s*\[([\s\S]*?)\n\]/,
)?.[1] ?? ''

// 剧情/羁绊 CG 的显式登记已集中到 content/cgAssets.ts 单一注册表，
// 图鉴面板与剧情节点均从这里取数，审计同样以注册表为准。
const cgRegistryEntries = [
  ...cgRegistryText.matchAll(/\{ id: '([^']+)', name: '[^']*', src: '(\/assets\/cg\/[^']+)'([^}]*)\}/g),
].map((match) => ({
  id: match[1],
  path: match[2],
  placeholderFor: match[3].match(/placeholderFor: '([^']+)'/)?.[1],
  promptRef: match[3].match(/promptRef: '([^']+)'/)?.[1],
}))
const cgRegistryPathById = new Map(cgRegistryEntries.map((entry) => [entry.id, entry.path]))

const FIRST_DATE_CG_COUNT = 12
const FIRST_DATE_MIN_WIDTH = 1600
const FIRST_DATE_MIN_HEIGHT = 900
const FIRST_DATE_TARGET_RATIO = 16 / 9
const FIRST_DATE_RATIO_TOLERANCE = 0.01
const FIRST_DATE_MAX_BYTES = 500 * 1024
const firstDateAssetPattern = /^\/assets\/cg\/romance-([a-z0-9]+)-first-date-v1\.webp$/
const requireManagedFinal = process.argv.includes('--require-managed-final')
const duplicates = (values) => [...new Set(values.filter((value, index) => values.indexOf(value) !== index))]

const directManagedVisuals = [
  ...managedVisualsText.matchAll(
    /\b(pendingVisual|readyVisual)\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'(V18-(CG|BG)-\d{2})'\s*\)/g,
  ),
].map((match) => ({
  status: match[1] === 'readyVisual' ? 'ready' : 'pending',
  id: match[2],
  final: match[3],
  fallback: match[4],
  promptRef: match[5],
  category: match[6],
}))

const expressionManagedVisuals = [
  ...managedVisualsText.matchAll(
    /expressionVisual\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(\d+)\s*,\s*'(pending|ready)'\s*\)/g,
  ),
].map((match) => ({
  status: match[4],
  id: `v18-expression-${match[1]}-${match[2]}`,
  final: `/assets/sprites/${match[1]}/expression-${match[2]}-v1.webp`,
  fallback: `/assets/sprites/${match[1]}/base-neutral-v1.webp`,
  promptRef: `V18-EX-${String(Number(match[3])).padStart(2, '0')}`,
  category: 'EX',
}))

const managedVisuals = [...directManagedVisuals, ...expressionManagedVisuals]
const managedFinalPathSet = new Set(managedVisuals.map((asset) => asset.final))
const managedVisualFailures = []

for (const [category, expected] of [['CG', 12], ['BG', 8], ['EX', 16]]) {
  const actual = managedVisuals.filter((asset) => asset.category === category).length
  if (actual !== expected) managedVisualFailures.push(`v1.8 ${category} 托管素材必须为 ${expected} 条，实际 ${actual}`)
}

for (const [label, values] of [
  ['ID', managedVisuals.map((asset) => asset.id)],
  ['正式路径', managedVisuals.map((asset) => asset.final)],
  ['提示词编号', managedVisuals.map((asset) => asset.promptRef)],
]) {
  const repeated = duplicates(values)
  if (repeated.length) managedVisualFailures.push(`v1.8 托管素材${label}重复：${repeated.join('、')}`)
}

for (const asset of managedVisuals) {
  const fallbackFile = path.join(publicRoot, asset.fallback.slice(1))
  const finalFile = path.join(publicRoot, asset.final.slice(1))
  const finalExists = fs.existsSync(finalFile)
  if (!fs.existsSync(fallbackFile)) managedVisualFailures.push(`视觉占位回退文件不存在：${asset.fallback}`)
  if (!managedPromptDocuments[asset.category]?.includes(asset.promptRef)) {
    managedVisualFailures.push(`视觉提示词包缺少 ${asset.promptRef}：${asset.id}`)
  }
  if (asset.status === 'ready' && !finalExists) {
    managedVisualFailures.push(`视觉素材已标记 ready 但文件不存在：${asset.final}`)
  }
  if (asset.status === 'pending' && finalExists) {
    managedVisualFailures.push(`视觉素材文件已存在但仍标记 pending：${asset.final}`)
  }
  if (requireManagedFinal && asset.status !== 'ready') {
    managedVisualFailures.push(`正式发布仍有视觉占位：${asset.promptRef} -> ${asset.final}`)
  }
  if (!finalExists) continue

  const bytes = fs.statSync(finalFile).size
  const maxBytes = asset.category === 'EX' ? 300 * 1024 : 500 * 1024
  if (bytes > maxBytes) {
    managedVisualFailures.push(`托管素材超过 ${(maxBytes / 1024).toFixed(0)} KiB：${asset.final}`)
  }
  let dimensions
  try {
    dimensions = readWebpDimensions(fs.readFileSync(finalFile))
  } catch (error) {
    managedVisualFailures.push(`托管素材不是有效 WebP：${asset.final}（${error.message}）`)
    continue
  }
  if (asset.category === 'EX') {
    if (dimensions.width < 800 || dimensions.height < 1600 || dimensions.height <= dimensions.width) {
      managedVisualFailures.push(`表情立绘尺寸不足或非竖版（至少 800×1600）：${asset.final}`)
    }
  } else {
    const ratioDeviation = Math.abs((dimensions.width / dimensions.height) / FIRST_DATE_TARGET_RATIO - 1)
    if (dimensions.width < 1600 || dimensions.height < 900 || ratioDeviation > FIRST_DATE_RATIO_TOLERANCE) {
      managedVisualFailures.push(`CG/背景必须为 ≥1600×900、16:9±1%：${asset.final}`)
    }
  }
}

if (!assetCatalog.includes('...runtimeManagedVisualUrls')) {
  managedVisualFailures.push('v1.8 运行时托管素材未并入 projectAssetUrls 离线目录')
}

// This release gate is intentionally independent from runtime data so a coordinated typo cannot pass all catalogs.
const expectedFirstDateCgs = [
  ['shana', 'cg54-romance-shana-first-date'],
  ['qifu', 'cg55-romance-qifu-first-date'],
  ['chenyi', 'cg56-romance-chenyi-first-date'],
  ['swordheart', 'cg57-romance-swordheart-first-date'],
  ['heartbeat', 'cg58-romance-heartbeat-first-date'],
  ['yanqiu', 'cg59-romance-yanqiu-first-date'],
  ['huayue', 'cg60-romance-huayue-first-date'],
  ['wenxian', 'cg61-romance-wenxian-first-date'],
  ['takemehand', 'cg62-romance-takemehand-first-date'],
  ['xilufei', 'cg63-romance-xilufei-first-date'],
  ['yyt', 'cg64-romance-yyt-first-date'],
  ['avucii', 'cg65-romance-avucii-first-date'],
].map(([character, id]) => ({
  character,
  id,
  path: `/assets/cg/romance-${character}-first-date-v1.webp`,
}))

const profileFirstDateCgs = [
  ...romanceProfilesText.matchAll(
    /^\s*([a-z][a-z0-9]*):\s*defineProfile\(\s*'([a-z][a-z0-9]*)'\s*,\s*'[^']*'\s*,\s*'[^']*'\s*,\s*'[^']*'\s*,\s*'(cg\d+-romance-[a-z0-9]+-first-date)'/gm,
  ),
].map((match) => ({
  key: match[1],
  character: match[2],
  id: match[3],
  path: `/assets/cg/romance-${match[2]}-first-date-v1.webp`,
}))

const galleryFirstDateCgs = [
  ...cgRegistryText.matchAll(
    /\{ id: '(cg\d+-romance-([a-z0-9]+)-first-date)', name: '[^']*', src: '([^']+)' \}/g,
  ),
].map((match) => ({ id: match[1], character: match[2], path: match[3] }))

const catalogFirstDatePaths = projectAssetUrlsText.match(
  /\/assets\/cg\/romance-[a-z0-9]+-first-date-v1\.webp/g,
) ?? []

const firstDateRegistrationFailures = []
if (profileFirstDateCgs.length !== FIRST_DATE_CG_COUNT) {
  firstDateRegistrationFailures.push(
    `首次约会 CG 配置数量必须为 ${FIRST_DATE_CG_COUNT}，实际 ${profileFirstDateCgs.length}`,
  )
}
if (galleryFirstDateCgs.length !== FIRST_DATE_CG_COUNT) {
  firstDateRegistrationFailures.push(
    `首次约会 CG 图鉴条目必须为 ${FIRST_DATE_CG_COUNT}，实际 ${galleryFirstDateCgs.length}`,
  )
}
if (catalogFirstDatePaths.length !== FIRST_DATE_CG_COUNT) {
  firstDateRegistrationFailures.push(
    `projectAssetUrls 首次约会 CG 必须为 ${FIRST_DATE_CG_COUNT} 条，实际 ${catalogFirstDatePaths.length}`,
  )
}

for (const [label, values] of [
  ['配置 ID', profileFirstDateCgs.map(({ id }) => id)],
  ['配置路径', profileFirstDateCgs.map(({ path: asset }) => asset)],
  ['图鉴 ID', galleryFirstDateCgs.map(({ id }) => id)],
  ['图鉴路径', galleryFirstDateCgs.map(({ path: asset }) => asset)],
  ['projectAssetUrls 路径', catalogFirstDatePaths],
]) {
  const repeated = duplicates(values)
  if (repeated.length) {
    firstDateRegistrationFailures.push(`首次约会 CG ${label}重复：${repeated.join('、')}`)
  }
}

if (!romanceProfilesText.includes('firstDateCg: cgPath(firstDateCgId)')) {
  firstDateRegistrationFailures.push('首次约会 CG 配置路径必须经 cgPath(firstDateCgId) 从注册表解析')
}

const profileFirstDateByCharacter = new Map(profileFirstDateCgs.map((entry) => [entry.character, entry]))
const galleryFirstDateById = new Map(galleryFirstDateCgs.map((entry) => [entry.id, entry]))
const catalogFirstDatePathSet = new Set(catalogFirstDatePaths)
const expectedFirstDateCharacters = new Set(expectedFirstDateCgs.map(({ character }) => character))
const expectedFirstDateIds = new Set(expectedFirstDateCgs.map(({ id }) => id))
const expectedFirstDatePaths = new Set(expectedFirstDateCgs.map(({ path: asset }) => asset))

for (const expected of expectedFirstDateCgs) {
  const profile = profileFirstDateByCharacter.get(expected.character)
  if (!profile) {
    firstDateRegistrationFailures.push(`首次约会 CG 缺少角色配置：${expected.character}`)
  } else {
    if (profile.key !== expected.character) {
      firstDateRegistrationFailures.push(
        `首次约会 CG 配置键与角色不一致：${profile.key} -> ${profile.character}`,
      )
    }
    if (profile.id !== expected.id) {
      firstDateRegistrationFailures.push(
        `首次约会 CG 配置 ID 不一致：${expected.character}，期望 ${expected.id}，实际 ${profile.id}`,
      )
    }
  }

  const gallery = galleryFirstDateById.get(expected.id)
  if (!gallery) {
    firstDateRegistrationFailures.push(`首次约会 CG 未显式登记到图鉴：${expected.id} -> ${expected.path}`)
  } else if (gallery.path !== expected.path) {
    firstDateRegistrationFailures.push(
      `首次约会 CG 图鉴路径不一致：${expected.id}，期望 ${expected.path}，实际 ${gallery.path}`,
    )
  }

  if (!catalogFirstDatePathSet.has(expected.path)) {
    firstDateRegistrationFailures.push(`首次约会 CG 未登记到 projectAssetUrls：${expected.path}`)
  }
}

for (const profile of profileFirstDateCgs) {
  if (!expectedFirstDateCharacters.has(profile.character)) {
    firstDateRegistrationFailures.push(`首次约会 CG 含未约定角色配置：${profile.character}`)
  }
}
for (const gallery of galleryFirstDateCgs) {
  if (!expectedFirstDateIds.has(gallery.id)) {
    firstDateRegistrationFailures.push(`图鉴含未约定的首次约会 CG：${gallery.id} -> ${gallery.path}`)
  }
}
for (const asset of catalogFirstDatePaths) {
  if (!expectedFirstDatePaths.has(asset)) {
    firstDateRegistrationFailures.push(`projectAssetUrls 含未约定的首次约会 CG：${asset}`)
  }
}

const firstDateDeliverableFailures = []
for (const entry of expectedFirstDateCgs) {
  const file = path.join(publicRoot, entry.path.slice(1))
  if (!fs.existsSync(file)) {
    firstDateDeliverableFailures.push(`首次约会 CG 文件不存在：${entry.path}`)
    continue
  }

  const size = fs.statSync(file).size
  if (size > FIRST_DATE_MAX_BYTES) {
    firstDateDeliverableFailures.push(
      `首次约会 CG 超过 500 KiB 发布硬上限（实际 ${(size / 1024).toFixed(1)} KiB）：${entry.path}`,
    )
  }

  let dimensions
  try {
    dimensions = readWebpDimensions(fs.readFileSync(file))
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    firstDateDeliverableFailures.push(`首次约会 CG 不是有效 WebP：${entry.path}（${reason}）`)
    continue
  }

  if (dimensions.width < FIRST_DATE_MIN_WIDTH || dimensions.height < FIRST_DATE_MIN_HEIGHT) {
    firstDateDeliverableFailures.push(
      `首次约会 CG 分辨率不足（至少 1600×900，实际 ${dimensions.width}×${dimensions.height}）：${entry.path}`,
    )
  }
  const ratioDeviation = Math.abs((dimensions.width / dimensions.height) / FIRST_DATE_TARGET_RATIO - 1)
  if (ratioDeviation > FIRST_DATE_RATIO_TOLERANCE) {
    firstDateDeliverableFailures.push(
      `首次约会 CG 画幅超出 16:9±1%（实际 ${dimensions.width}×${dimensions.height}，偏差 ${(ratioDeviation * 100).toFixed(2)}%）：${entry.path}`,
    )
  }
}

const cataloguedProjectAssets = new Set(assetCatalog.match(assetPattern) ?? [])
// 剧情节点经 cgPath(id) 引用注册表；保留字面量匹配以兼容 cgPortrait 等直写路径。
const storyCgLiterals = [...storyText.matchAll(/\b(?:cg|cgPortrait):\s*(['"])([^'"]+)\1/g)]
  .map((match) => match[2])
  .filter((asset) => asset.startsWith('/'))
const storyCgRegistryIds = [...storyText.matchAll(/\bcg:\s*cgPath\('([^']+)'\)/g)].map((match) => match[1])
const unresolvedStoryCgIds = [...new Set(storyCgRegistryIds.filter((id) => !cgRegistryPathById.has(id)))]
const storyCgAssets = [...new Set([
  ...storyCgLiterals,
  ...storyCgRegistryIds.map((id) => cgRegistryPathById.get(id)).filter(Boolean),
])]
const uncachedStoryCgs = storyCgAssets.filter((asset) => !cataloguedProjectAssets.has(asset))

// 显式图鉴 CG 以 content/cgAssets.ts 注册表为准；背景派生条目仍由 assets.ts 覆盖。
const collectionCgAssets = [...new Set(cgRegistryEntries.map((entry) => entry.path))]
const collectionCgAssetSet = new Set(collectionCgAssets)
const uncachedCollectionCgs = collectionCgAssets.filter((asset) => !cataloguedProjectAssets.has(asset))
const missingCollectionCgs = collectionCgAssets.filter((asset) => (
  !firstDateAssetPattern.test(asset)
  && !fs.existsSync(path.join(publicRoot, asset.slice(1)))
))

// Collection-specific failures are reported below with more useful labels instead of duplicate generic messages.
const missingAssets = referencedAssets.filter((asset) => (
  !collectionCgAssetSet.has(asset)
  && !managedFinalPathSet.has(asset)
  && !fs.existsSync(path.join(publicRoot, asset.slice(1)))
))

const publicWebps = (relativeDirectory) => walkFiles(
  path.join(publicRoot, relativeDirectory),
  (file) => file.endsWith('.webp'),
)
const spriteFiles = publicWebps('assets/sprites')
const backgroundFiles = publicWebps('assets/backgrounds/galgame')
const cgFiles = publicWebps('assets/cg')
const acceptedMasterCount = spriteFiles.length + backgroundFiles.length + cgFiles.length

// Base anchors are intentionally composed through baseSprite(id), while expression files are literals.
const cataloguedSpriteAssets = new Set([
  ...[...spriteCatalog.matchAll(/baseSprite\('([^']+)'\)/g)]
    .map((match) => `/assets/sprites/${match[1]}/base-neutral-v1.webp`),
  ...(spriteCatalog.match(assetPattern) ?? []),
  ...managedVisuals.filter((asset) => asset.category === 'EX').map((asset) => asset.final),
])
const uncataloguedSpriteFiles = spriteFiles.filter((file) => {
  const asset = `/${path.relative(publicRoot, file).split(path.sep).join('/')}`
  return !cataloguedSpriteAssets.has(asset)
})
const uncataloguedCgFiles = cgFiles.filter((file) => {
  const asset = `/${path.relative(publicRoot, file).split(path.sep).join('/')}`
  return !assetCatalog.includes(`'${asset}'`) && !managedFinalPathSet.has(asset)
})

const unlockedCgIds = [...new Set(
  [...storyText.matchAll(/type:\s*'unlockCg',\s*id:\s*'([^']+)'/g)].map((match) => match[1]),
)]
const knownGalleryIds = new Set([
  ...[...assetCatalog.matchAll(/collectionId:\s*'([^']+)'/g)].map((match) => match[1]),
  ...cgRegistryEntries.map((entry) => entry.id),
  ...[...collectionText.matchAll(/\{\s*id:\s*'([^']+)'/g)].map((match) => match[1]),
  ...[...romanceProfilesText.matchAll(/'(cg\d+-romance-[a-z0-9]+-confession)'/g)].map((match) => match[1]),
])
const missingGalleryIds = unlockedCgIds.filter((id) => !knownGalleryIds.has(id))

const failures = [
  ...managedVisualFailures,
  ...(requireManagedFinal
    ? cgRegistryEntries
      .filter((entry) => entry.placeholderFor)
      .map((entry) => `正式发布仍有图鉴 CG 占位：${entry.id}（${entry.promptRef ?? entry.placeholderFor}）`)
    : []),
  ...firstDateRegistrationFailures,
  ...firstDateDeliverableFailures,
  ...unresolvedStoryCgIds.map((id) => `剧情引用了未登记的 CG：${id}（请先在 content/cgAssets.ts 登记）`),
  ...missingAssets.map((asset) => `源码引用不存在：${asset}`),
  ...uncachedStoryCgs.map((asset) => `剧情 CG 未进入离线资源目录：${asset}`),
  ...uncachedCollectionCgs.map((asset) => `图鉴 CG 未进入离线资源目录：${asset}`),
  ...missingCollectionCgs.map((asset) => `图鉴 CG 文件不存在：${asset}`),
  ...uncataloguedSpriteFiles.map((file) => `立绘未登记：${path.relative(projectRoot, file)}`),
  ...uncataloguedCgFiles.map((file) => `CG 未登记：${path.relative(projectRoot, file)}`),
  ...missingGalleryIds.map((id) => `剧情解锁项不在图鉴：${id}`),
]

if (acceptedMasterCount < 100) {
  failures.push(`正式母图少于质量门槛：${acceptedMasterCount}/100`)
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

const readyManagedCount = managedVisuals.filter((asset) => asset.status === 'ready').length
console.log(`资产审计通过：${acceptedMasterCount} 张正式母图（立绘 ${spriteFiles.length} / 背景 ${backgroundFiles.length} / CG ${cgFiles.length}），${referencedAssets.length} 个源码资源引用、${storyCgAssets.length} 个剧情 CG 引用（含竖版）与 ${collectionCgAssets.length} 个显式图鉴 CG 登记均有效；${FIRST_DATE_CG_COUNT} 张首次约会 CG 均为 ≥1600×900、16:9±1%、≤500 KiB 的有效 WebP；v1.8 托管视觉 ${readyManagedCount}/${managedVisuals.length} 已就绪，其余均有有效回退和提示词。`)
