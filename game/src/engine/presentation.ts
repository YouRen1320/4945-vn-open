import type {
  Atmosphere,
  CameraMotion,
  SceneDirection,
  SceneTransition,
  SceneUiSkin,
  SpriteCue,
  SpriteExpression,
  SpritePosition,
  StoryNode,
} from '@/engine/types'
import { isCharacterId } from '@/content/storyActors'

export interface ResolvedSceneDirection {
  cg?: string
  cgPortrait?: string
  cgAlt?: string
  cgPlaceholderFor?: string
  cgPromptRef?: string
  ui: SceneUiSkin
  transition: SceneTransition
  camera: CameraMotion
  atmosphere: Atmosphere
  sprites: SpriteCue[]
  hideDialogue: boolean
  focus: 'left' | 'center' | 'right'
}

const stableIndex = (value: string, modulo: number) => {
  let total = 0
  for (const char of value) total = (total * 31 + char.charCodeAt(0)) >>> 0
  return total % modulo
}

const inferUi = (node: StoryNode): SceneUiSkin => {
  if (node.mode === 'battle') return 'fortress'
  if (node.mode === 'ending') return 'ending'
  if (node.mode === 'interlude') return 'cinematic'
  if (node.mode === 'system') {
    if (/奖励|首饰|分配/.test(`${node.location ?? ''}${node.title ?? ''}`)) return 'reward'
    if (/组织|成员|申请/.test(`${node.location ?? ''}${node.title ?? ''}`)) return 'organization'
    return 'game-client'
  }
  if (node.mode === 'chat') {
    // “4945区 · 私聊”同时包含区服名与私聊语义；精确频道必须优先于宽泛区服匹配。
    if (/私聊|管理私聊|四条私聊/.test(node.location ?? '')) return 'private-chat'
    if (/世界|区群|新区群|4945/.test(node.location ?? '')) return 'world-chat'
    return 'group-chat'
  }
  return 'classic'
}

const inferExpression = (node: StoryNode): SpriteExpression => {
  const copy = `${node.title ?? ''}${node.text}`
  if (/突然|竟然|爆群|没想到|意外/.test(copy)) return 'surprised'
  if (/愤怒|生气|嫉妒|恼火|不满/.test(copy)) return 'angry'
  if (/宣战|踢|禁言|反对|敌/.test(copy)) return 'determined'
  if (/离开|退出|灰色|没上线|不想玩/.test(copy)) return 'sad'
  if (/？|\?|代价|能不能/.test(copy)) return 'concerned'
  if (/笑|开心|高兴|庆祝/.test(copy)) return 'smile'
  if (/谢谢|愿意|支持|喜欢/.test(copy)) return 'soft'
  return 'neutral'
}

const inferPosition = (node: StoryNode): SpritePosition => {
  const positions: SpritePosition[] = ['left', 'right', 'center']
  return positions[stableIndex(node.id, positions.length)] ?? 'center'
}

const isMemberNightChat = (node: StoryNode) => (
  node.mode === 'chat'
  && (
    /(?:成员|江南)夜话/.test(node.actLabel)
    // 三组夜话使用角色化幕名；节点前缀是该支线稳定的导演标记。
    || /^r3-20[b-f]/.test(node.id)
  )
)

const inferSprites = (node: StoryNode): SpriteCue[] => {
  const actor = node.portrait
    ?? (!['narrator', 'system', 'player', 'crowd'].includes(node.speaker) ? node.speaker : undefined)
  // 剧情演员只有聊天头像；全身立绘提示仍严格限制为关系角色目录中的 CharacterId。
  const character = isCharacterId(actor) ? actor : undefined
  // 普通聊天仍保留手机界面；成员夜话则让说话人进入舞台，避免支线只有聊天框没有人物。
  if (!character || node.mode === 'system' || node.mode === 'battle' || (node.mode === 'chat' && !isMemberNightChat(node))) return []
  return [{
    character,
    expression: inferExpression(node),
    pose: 'base',
    position: inferPosition(node),
  }]
}

const inferCamera = (node: StoryNode): CameraMotion => {
  if (node.mode === 'chat' || node.mode === 'system') return 'hold'
  const camera: CameraMotion[] = ['hold', 'push-in', 'drift-left', 'drift-right']
  return camera[stableIndex(node.id, camera.length)] ?? 'hold'
}

const inferAtmosphere = (node: StoryNode): Atmosphere => {
  if (node.mode === 'chat') return 'messages'
  if (node.mode === 'battle') return 'danmaku'
  if (node.background === 'fortress') return 'embers'
  if (node.background === 'nightMessage') return 'rain'
  if (node.mode === 'ending') return 'petals'
  if (node.historical === 'confirmed') return 'paper'
  return 'dust'
}

const inferTransition = (node: StoryNode): SceneTransition => {
  if (node.sound === 'warning') return 'flash'
  if (node.mode === 'chat') return 'slide'
  if (node.historical === 'confirmed') return 'ink'
  return 'crossfade'
}

/**
 * Story files may opt into precise direction. Missing fields receive stable,
 * semantic defaults so every legacy node immediately benefits from the new
 * stage without changing route IDs or save data.
 */
export const resolveSceneDirection = (node: StoryNode): ResolvedSceneDirection => {
  const explicit: SceneDirection = node.presentation ?? {}
  return {
    cg: explicit.cg,
    cgPortrait: explicit.cgPortrait,
    cgAlt: explicit.cgAlt,
    cgPlaceholderFor: explicit.cgPlaceholderFor,
    cgPromptRef: explicit.cgPromptRef,
    ui: explicit.ui ?? inferUi(node),
    transition: explicit.transition ?? inferTransition(node),
    camera: explicit.camera ?? inferCamera(node),
    atmosphere: explicit.atmosphere ?? inferAtmosphere(node),
    sprites: explicit.sprites ?? inferSprites(node),
    hideDialogue: explicit.hideDialogue ?? false,
    focus: explicit.focus ?? 'center',
  }
}
