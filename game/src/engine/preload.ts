import { backgrounds } from '@/content/assets'
import { getSpriteAsset } from '@/content/sprites'
import { storyById } from '@/content/story'
import { resolveSceneDirection } from '@/engine/presentation'
import { availableChoices, resolveTarget } from '@/engine/state'

import type { GameState, StoryNode } from '@/engine/types'

export interface ScenePreloadPlan {
  current: string[]
  next: string[]
}

const startedUrls = new Set<string>()

const unique = (urls: Array<string | undefined>) => [
  ...new Set(urls.filter((url): url is string => Boolean(url))),
]

/** Returns only runtime-resolved assets; pending final art is never requested by a preview build. */
export const getSceneAssetUrls = (node: StoryNode) => {
  const background = backgrounds[node.background]
  const direction = resolveSceneDirection(node)
  return unique([
    background.src,
    direction.cg,
    direction.cgPortrait,
    ...direction.sprites.map((sprite) => getSpriteAsset(
      sprite.character,
      sprite.expression,
      sprite.pose,
    )),
  ])
}

const getTargetIds = (node: StoryNode, state: GameState) => unique([
  node.next ? resolveTarget(node.next, state) : undefined,
  ...availableChoices(node, state).map((choice) => resolveTarget(choice.next, state)),
  node.textEntry ? resolveTarget(node.textEntry.next, state) : undefined,
])

export const createScenePreloadPlan = (node: StoryNode, state: GameState): ScenePreloadPlan => {
  const current = getSceneAssetUrls(node)
  const next = unique(getTargetIds(node, state).flatMap((id) => {
    const target = storyById[id]
    return target ? getSceneAssetUrls(target) : []
  })).filter((url) => !current.includes(url))
  return { current, next }
}

const requestImage = (url: string, priority: 'high' | 'auto') => {
  if (startedUrls.has(url) || typeof Image === 'undefined') return
  startedUrls.add(url)
  const image = new Image()
  // fetchPriority is advisory and ignored safely by older browsers.
  image.fetchPriority = priority
  image.decoding = 'async'
  image.src = url
}

/**
 * The renderer decodes the current frame; this warm-up additionally gives the
 * browser current assets high priority and one-hop story assets normal priority.
 */
export const preloadCurrentAndNextScenes = (node: StoryNode, state: GameState) => {
  const plan = createScenePreloadPlan(node, state)
  plan.current.forEach((url) => requestImage(url, 'high'))
  plan.next.forEach((url) => requestImage(url, 'auto'))
  return plan
}

export const resetScenePreloadCacheForTests = () => startedUrls.clear()
