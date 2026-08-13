import type { RomanceCandidateId } from '@/content/romanceProfiles'
import type { StoryChoice } from '@/engine/types'

export type RomanceAfterEpisodeKind = 'secondDate' | 'conflict' | 'reconciliation'

export interface RomanceAfterChoiceScript {
  id: string
  label: string
  tone: NonNullable<StoryChoice['tone']>
  reply: string
  /** Short player-facing phrase persisted as a relationship-style memory. */
  styleValue: string
}

export interface RomanceAfterEpisodeScript {
  title: string
  location: string
  opening: string
  firstChoices: readonly [RomanceAfterChoiceScript, RomanceAfterChoiceScript]
  middle: string
  secondChoices: readonly [RomanceAfterChoiceScript, RomanceAfterChoiceScript]
  closing: string
}

export interface RomanceAfterStoryScript {
  secondDate: RomanceAfterEpisodeScript
  conflict: RomanceAfterEpisodeScript
  reconciliation: RomanceAfterEpisodeScript
}

export type RomanceAfterStoryScripts = Record<RomanceCandidateId, RomanceAfterStoryScript>

export const romanceAfterEpisodeKinds = [
  'secondDate',
  'conflict',
  'reconciliation',
] as const satisfies readonly RomanceAfterEpisodeKind[]

export const romanceStyleAxes: Record<
  RomanceAfterEpisodeKind,
  readonly [string, string]
> = {
  secondDate: ['pace', 'care'],
  conflict: ['friction', 'space'],
  reconciliation: ['apology', 'future'],
}

export const romanceStyleAxisLabels: Record<string, string> = {
  pace: '亲密节奏',
  care: '照顾方式',
  friction: '面对分歧',
  space: '暂停方式',
  apology: '修复表达',
  future: '以后约定',
}

export const romanceStyleVariable = (
  character: RomanceCandidateId,
  axis: string,
) => `romanceStyle_${character}_${axis}`
