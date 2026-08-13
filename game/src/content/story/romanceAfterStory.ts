import { characters } from '@/content/characters'
import { romanceAfterStoryScripts } from '@/content/romanceAfterStoryContent'
import {
  romanceAfterEpisodeKinds,
  romanceStyleAxes,
  romanceStyleVariable,
} from '@/content/romanceAfterStoryTypes'
import { romanceProfiles } from '@/content/romanceProfiles'
import { romanceReturnTarget } from '@/content/story/romanceNightMarket'

import type { RomanceAfterEpisodeKind, RomanceAfterEpisodeScript } from '@/content/romanceAfterStoryTypes'
import type { RomanceCandidateId, RomanceProfile } from '@/content/romanceProfiles'
import type { BackgroundId, Effect, SpriteExpression, StoryNode } from '@/engine/types'

type RomanceAfterNode = StoryNode & { sideStory: 'romance' }

const episodeBackground = (
  profile: RomanceProfile,
  kind: RomanceAfterEpisodeKind,
): BackgroundId => ({
  secondDate: profile.sceneBackgrounds.date,
  conflict: profile.sceneBackgrounds.daily,
  reconciliation: profile.sceneBackgrounds.confession,
})[kind]

const episodeExpression = (
  kind: RomanceAfterEpisodeKind,
  beat: 'opening' | 'middle' | 'closing',
): SpriteExpression => {
  if (beat === 'middle') return 'serious'
  if (beat === 'closing') return 'relaxed'
  if (kind === 'conflict') return 'serious'
  if (kind === 'reconciliation') return 'shy'
  return 'relaxed'
}

const completionEffects = (
  profile: RomanceProfile,
  kind: RomanceAfterEpisodeKind,
): Effect[] => {
  const character = profile.character
  if (kind === 'secondDate') return [
    { type: 'flag', key: profile.secondDateFlag },
    { type: 'relationship', character, key: 'affinity', value: 1 },
  ]
  if (kind === 'conflict') return [
    { type: 'flag', key: profile.conflictFlag },
    { type: 'relationship', character, key: 'trust', value: 1 },
  ]
  return [
    { type: 'flag', key: profile.reconciliationFlag },
    { type: 'relationship', character, key: 'trust', value: 1 },
    { type: 'relationship', character, key: 'affinity', value: 1 },
  ]
}

const episodeFlag = (profile: RomanceProfile, kind: RomanceAfterEpisodeKind) => ({
  secondDate: profile.secondDateFlag,
  conflict: profile.conflictFlag,
  reconciliation: profile.reconciliationFlag,
})[kind]

const baseNode = (
  profile: RomanceProfile,
  script: RomanceAfterEpisodeScript,
  node: Omit<RomanceAfterNode, 'chapter' | 'actLabel' | 'date' | 'sideStory' | 'historical' | 'music'>,
): RomanceAfterNode => ({
  chapter: 'epilogue',
  actLabel: `关系续篇 · ${characters[profile.character].shortName ?? characters[profile.character].name}`,
  date: '2026-08-03',
  sideStory: 'romance',
  historical: 'fictional',
  music: 'afterOnline',
  ...node,
  title: node.title ?? script.title,
  location: node.location ?? script.location,
})

const buildEpisodeNodes = (
  profile: RomanceProfile,
  kind: RomanceAfterEpisodeKind,
  script: RomanceAfterEpisodeScript,
): RomanceAfterNode[] => {
  const character = profile.character
  const entryId = ({
    secondDate: profile.secondDateNodeId,
    conflict: profile.conflictNodeId,
    reconciliation: profile.reconciliationNodeId,
  })[kind]
  const firstReplyIds = [`${entryId}-first-a`, `${entryId}-first-b`] as const
  const middleId = `${entryId}-middle`
  const secondReplyIds = [`${entryId}-second-a`, `${entryId}-second-b`] as const
  const completeId = `${entryId}-complete`
  const [firstAxis, secondAxis] = romanceStyleAxes[kind]
  const background = episodeBackground(profile, kind)

  const sprite = (expression: SpriteExpression, scale = 1.03) => ({
    character,
    expression,
    pose: 'relaxed' as const,
    position: 'center' as const,
    scale,
  })

  return [
    baseNode(profile, script, {
      id: entryId,
      mode: 'novel',
      speaker: character,
      portrait: character,
      text: script.opening,
      background,
      presentation: {
        ui: 'classic',
        transition: 'crossfade',
        camera: 'push-in',
        atmosphere: kind === 'conflict' ? 'rain' : 'petals',
        sprites: [sprite(episodeExpression(kind, 'opening'), 1.04)],
      },
      choices: script.firstChoices.map((choice, index) => ({
        id: `${entryId}-${choice.id}`,
        label: choice.label,
        tone: choice.tone,
        effects: [{
          type: 'variable',
          key: romanceStyleVariable(character, firstAxis),
          value: choice.styleValue,
        }],
        next: firstReplyIds[index]!,
      })),
    }),
    ...script.firstChoices.map((choice, index) => baseNode(profile, script, {
      id: firstReplyIds[index]!,
      mode: 'novel',
      speaker: character,
      portrait: character,
      text: choice.reply,
      background,
      presentation: {
        ui: 'classic',
        transition: 'crossfade',
        camera: 'hold',
        atmosphere: kind === 'conflict' ? 'rain' : 'petals',
        sprites: [sprite(index === 0 ? 'relaxed' : 'surprised')],
      },
      next: middleId,
    })),
    baseNode(profile, script, {
      id: middleId,
      mode: 'novel',
      speaker: character,
      portrait: character,
      text: script.middle,
      background,
      presentation: {
        ui: 'classic',
        transition: 'crossfade',
        camera: 'push-in',
        atmosphere: kind === 'conflict' ? 'rain' : 'petals',
        sprites: [sprite(episodeExpression(kind, 'middle'), 1.04)],
      },
      choices: script.secondChoices.map((choice, index) => ({
        id: `${entryId}-${choice.id}`,
        label: choice.label,
        tone: choice.tone,
        effects: [{
          type: 'variable',
          key: romanceStyleVariable(character, secondAxis),
          value: choice.styleValue,
        }],
        next: secondReplyIds[index]!,
      })),
    }),
    ...script.secondChoices.map((choice, index) => baseNode(profile, script, {
      id: secondReplyIds[index]!,
      mode: 'novel',
      speaker: character,
      portrait: character,
      text: choice.reply,
      background,
      presentation: {
        ui: 'classic',
        transition: 'crossfade',
        camera: 'hold',
        atmosphere: kind === 'conflict' ? 'rain' : 'petals',
        sprites: [sprite(index === 0 ? 'shy' : 'relaxed')],
      },
      next: completeId,
    })),
    baseNode(profile, script, {
      id: completeId,
      mode: 'novel',
      speaker: character,
      portrait: character,
      text: script.closing,
      background,
      presentation: {
        ui: 'cinematic',
        transition: 'crossfade',
        camera: 'pull-back',
        atmosphere: 'petals',
        sprites: [sprite(episodeExpression(kind, 'closing'))],
      },
      onEnter: completionEffects(profile, kind),
      next: romanceReturnTarget,
    }),
  ]
}

const buildCharacterAfterStory = (character: RomanceCandidateId) => {
  const profile = romanceProfiles[character]
  const scripts = romanceAfterStoryScripts[character]
  return romanceAfterEpisodeKinds.flatMap((kind) => buildEpisodeNodes(profile, kind, scripts[kind]))
}

export const romanceAfterStoryEntryPoints = Object.fromEntries(
  (Object.keys(romanceProfiles) as RomanceCandidateId[]).map((character) => {
    const profile = romanceProfiles[character]
    return [character, {
      secondDate: profile.secondDateNodeId,
      conflict: profile.conflictNodeId,
      reconciliation: profile.reconciliationNodeId,
    }]
  }),
) as Record<RomanceCandidateId, Record<RomanceAfterEpisodeKind, string>>

export const romanceAfterStoryNodes: RomanceAfterNode[] = (
  Object.keys(romanceProfiles) as RomanceCandidateId[]
).flatMap(buildCharacterAfterStory)

export const romanceAfterStoryCompletionFlags = Object.fromEntries(
  (Object.values(romanceProfiles) as RomanceProfile[]).flatMap((profile) => (
    romanceAfterEpisodeKinds.map((kind) => [
      ({
        secondDate: profile.secondDateNodeId,
        conflict: profile.conflictNodeId,
        reconciliation: profile.reconciliationNodeId,
      })[kind],
      episodeFlag(profile, kind),
    ])
  )),
) as Record<string, string>
