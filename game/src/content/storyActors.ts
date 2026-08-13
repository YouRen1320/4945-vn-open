import { characters } from '@/content/characters'

import type {
  ActorDefinition,
  ActorId,
  CharacterId,
  StoryActorDefinition,
  StoryActorId,
} from '@/engine/types'

const avatar = (id: string) => `/assets/avatars/${id}.webp`

/**
 * 剧情演员只负责署名、头像与演出信息；它们不会被写进 GameState.relationships。
 * 真实关系角色继续由 characters.ts 单独管理，避免新增配角破坏旧存档结构。
 */
export const storyActors: Record<StoryActorId, StoryActorDefinition> = {
  suming: {
    id: 'suming',
    name: '苏铭',
    organization: 'org2',
    role: '代练 / 原一组成员',
    avatar: avatar('suming'),
    color: '#83a8d8',
    description: '拒绝把代练工作卷入组织争斗，后来进入二组的剧情人物',
  },
  passerk: {
    id: 'passerk',
    name: '路人K',
    organization: 'org3',
    role: '成员 / 后任首领',
    avatar: avatar('passerk'),
    color: '#c6a8e8',
    description: '从二组流入虚妄月华并接任三组首领的剧情人物',
  },
  obito: {
    id: 'obito',
    name: '宇智波带土（漂泊浪客）',
    role: '老区旁观者',
    color: '#9eb58b',
    description: '在踢人事件后提醒夏娜区分气话与正式退组、先挽留成员的剧情人物',
  },
  tiesuiya: {
    id: 'tiesuiya',
    name: '铁碎牙',
    organization: 'org4',
    role: '镜花水月首领',
    avatar: avatar('tiesuiya'),
    color: '#8ea1bd',
    description: '8 月重组后接任四组“镜花水月”的剧情人物',
  },
  kunxing: {
    id: 'kunxing',
    name: '困醒',
    organization: 'org5',
    role: '心之所向首领',
    avatar: avatar('kunxing'),
    color: '#c6a083',
    description: '温陷退游后接任五组“心之所向”的剧情人物',
  },
  'shen-zhixing': {
    id: 'shen-zhixing',
    name: '沈知行',
    role: '北岸评议委员会执行主任',
    avatar: avatar('shen-zhixing'),
    color: '#8fb6d9',
    description: '三年前离开4945区、如今代表北岸推动统一管理草案的早期组织者',
  },
  'north-observer': {
    id: 'north-observer',
    name: '北岸观察员',
    role: '评议委员会监察员',
    avatar: avatar('north-observer'),
    color: '#aab6c8',
    description: '负责执行临时审计措施并记录各组织回应的委员会观察员',
  },
}

export const isCharacterId = (value: unknown): value is CharacterId => (
  typeof value === 'string' && Object.hasOwn(characters, value)
)

export const isStoryActorId = (value: unknown): value is StoryActorId => (
  typeof value === 'string' && Object.hasOwn(storyActors, value)
)

export const isActorId = (value: unknown): value is ActorId => (
  isCharacterId(value) || isStoryActorId(value)
)

/** 演出层统一读取角色；关系层不得反向使用该合集创建好感数据。 */
export const actors: Record<ActorId, ActorDefinition> = {
  ...characters,
  ...storyActors,
}

export const getActor = (id: ActorId): ActorDefinition => actors[id]
