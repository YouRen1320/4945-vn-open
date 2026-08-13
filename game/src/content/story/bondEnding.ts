import type { Atmosphere, CharacterId, SceneTransition, StoryNode } from '@/engine/types'

/**
 * 羁绊结局节点的统一工厂。
 *
 * 五条路线共 14 个羁绊结局节点结构完全同构：深夜私聊 +  cinematic CG + 四项结算
 * （羁绊 flag、关系进度补满、结局解锁、CG 解锁）。此前它们在各路线文件里复制粘贴，
 * 同一张 CG 的跨路线复用（如 takemehand、qifu）只能靠注释口头约定，现在由本工厂
 * 保证结算结构一致，路线文件只保留文本与舞台差异。
 */
interface BondEndingSpec {
  id: string
  actLabel: string
  location: string
  character: CharacterId
  text: string
  cg: string
  cgAlt: string
  cgId: string
  next: string
  atmosphere?: Atmosphere
  focus?: 'left' | 'center' | 'right'
  transition?: SceneTransition
}

const bondFlagKey = (character: CharacterId) => `bonded${character[0]!.toUpperCase()}${character.slice(1)}`

export const bondEndingNode = (spec: BondEndingSpec): StoryNode => ({
  id: spec.id,
  chapter: 'epilogue',
  actLabel: spec.actLabel,
  date: '2026-07-28',
  location: spec.location,
  mode: 'chat',
  speaker: spec.character,
  portrait: spec.character,
  text: spec.text,
  background: 'nightMessage',
  historical: 'fictional',
  presentation: {
    cg: spec.cg,
    cgAlt: spec.cgAlt,
    ui: 'cinematic',
    transition: spec.transition ?? 'crossfade',
    camera: 'push-in',
    atmosphere: spec.atmosphere ?? 'dust',
    focus: spec.focus ?? 'center',
  },
  onEnter: [
    { type: 'flag', key: bondFlagKey(spec.character) },
    { type: 'relationshipProgress', character: spec.character, value: 100 },
    { type: 'unlockEnding', id: `bond-${spec.character}` },
    { type: 'unlockCg', id: spec.cgId },
  ],
  next: spec.next,
})
