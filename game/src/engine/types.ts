export type RouteId = 'org1' | 'org2' | 'org3' | 'org4' | 'org5' | 'org6'
export type OrganizationId = 'org1' | RouteId
export type RoleId = 'none' | 'member' | 'elite' | 'executive' | 'leader'

export type CharacterId =
  | 'narrator'
  | 'system'
  | 'player'
  | 'mentor'
  | 'qifu'
  | 'bottle'
  | 'shana'
  | 'chenyi'
  | 'an'
  | 'shi'
  | 'daigu'
  | 'xilufei'
  | 'saoji'
  | 'swordheart'
  | 'sixin'
  | 'heartbeat'
  | 'truth'
  | 'oguri'
  | 'yanqiu'
  | 'huayue'
  | 'xuanmo'
  | 'jiangjinjiu'
  | 'takemehand'
  | 'wenxian'
  | 'gaobai'
  | 'jianwen'
  | 'yyt'
  | 'emperor'
  | 'avucii'
  | 'haogeju'
  | 'lan'
  | 'xingqing'
  | 'crowd'

/** 只参与对白与历史显示，不进入好感、恋爱、支援或组织数值。 */
export type StoryActorId =
  | 'suming'
  | 'passerk'
  | 'obito'
  | 'tiesuiya'
  | 'kunxing'
  | 'shen-zhixing'
  | 'north-observer'
export type ActorId = CharacterId | StoryActorId

export type BackgroundId =
  | 'invitation'
  | 'login'
  | 'recruitment'
  | 'organization'
  | 'mutedKey'
  | 'worldChat'
  | 'twoGroups'
  | 'warRoom'
  | 'fortress'
  | 'aftermath'
  | 'rewardHall'
  | 'sixthSeat'
  | 'nightMessage'
  | 'romanceGate'
  | 'romanceFoodStreet'
  | 'romanceArcade'
  | 'romanceLanternBridge'
  | 'romanceGateRain'
  | 'romanceGateAfterHours'
  | 'romanceFoodStreetRain'
  | 'romanceFoodStreetAfterHours'
  | 'romanceArcadeRain'
  | 'romanceArcadeAfterHours'
  | 'romanceLanternBridgeRain'
  | 'romanceLanternBridgeAfterHours'
  | 'ending'

export type MusicId = 'duskLogin' | 'groupChat' | 'worldEnemy' | 'fortressNight' | 'afterOnline'
export type SoundId = 'tap' | 'message' | 'notice' | 'choice' | 'warning' | 'save'
export type PresentationMode = 'novel' | 'chat' | 'system' | 'interlude' | 'battle' | 'ending'
export type ChapterId = 'prologue' | 'act1' | 'act2' | 'act3' | 'act4' | 'epilogue'
export type SideStoryKind = 'romance'
export type SpriteExpression =
  | 'neutral'
  | 'soft'
  | 'smile'
  | 'concerned'
  | 'determined'
  | 'angry'
  | 'sad'
  | 'surprised'
  | 'shy'
  | 'serious'
  | 'relaxed'
export type SpritePose = 'base' | 'thinking' | 'phone' | 'command' | 'relaxed'
export type SpritePosition = 'far-left' | 'left' | 'center' | 'right' | 'far-right'
export type SceneTransition = 'cut' | 'crossfade' | 'slide' | 'ink' | 'flash' | 'glitch'
export type CameraMotion = 'hold' | 'push-in' | 'pull-back' | 'drift-left' | 'drift-right'
export type Atmosphere =
  | 'none'
  | 'petals'
  | 'rain'
  | 'embers'
  | 'danmaku'
  | 'paper'
  | 'messages'
  | 'dust'
export type SceneUiSkin =
  | 'classic'
  | 'private-chat'
  | 'group-chat'
  | 'world-chat'
  | 'game-client'
  | 'organization'
  | 'fortress'
  | 'reward'
  | 'cinematic'
  | 'ending'
  | 'ending-triumph'
  | 'ending-lament'
  | 'ending-dark'
  | 'ending-chaos'
  | 'ending-secret'

export interface SpriteCue {
  character: CharacterId
  expression?: SpriteExpression
  pose?: SpritePose
  position?: SpritePosition
  scale?: number
  mirror?: boolean
  dimmed?: boolean
}

export interface SceneDirection {
  /**
   * Optional full-screen event illustration. Text remains HTML so the same CG
   * can be reused by translated, accessible and mobile layouts.
  */
  cg?: string
  /** Optional portrait crop used by narrow portrait phones for composition-safe CG framing. */
  cgPortrait?: string
  cgAlt?: string
  /** Final asset path shown in preview builds when `cg` is an intentional fallback. */
  cgPlaceholderFor?: string
  /** Prompt identifier used to replace an intentional visual placeholder. */
  cgPromptRef?: string
  ui?: SceneUiSkin
  transition?: SceneTransition
  camera?: CameraMotion
  atmosphere?: Atmosphere
  sprites?: SpriteCue[]
  hideDialogue?: boolean
  focus?: 'left' | 'center' | 'right'
}

export interface CoreStats {
  level: number
  power: number
  skill: number
  money: number
  reputation: number
  cohesion: number
  resources: number
  evidence: number
  contribution: number
}

export interface RelationshipState {
  trust: number
  affinity: number
  /** Explicit 0–100 route progress shown to players; unlike trust it is never negative. */
  progress: number
  stance: 'unknown' | 'support' | 'watch' | 'oppose' | 'left'
}

export interface SupportAbilityState {
  unlocked: boolean
  charges: number
  active: boolean
  /** A support charge refreshes at most once when the story enters a new chapter. */
  lastRechargeChapter: ChapterId | null
}

export interface HistoryEntry {
  nodeId: string
  date: string
  speaker: ActorId
  speakerName: string
  text: string
  choiceLabel?: string
  timestamp: number
}

export interface GameSetup {
  playerName: string
}

export interface GameState {
  schemaVersion: number
  appVersion: string
  nodeId: string
  playerName: string
  route: RouteId | null
  organization: OrganizationId | null
  organizationName: string
  role: RoleId
  date: string
  chapter: ChapterId
  stats: CoreStats
  organizationRelations: Record<OrganizationId, number>
  relationships: Record<CharacterId, RelationshipState>
  /** One explicit partner per save; other routes remain available in separate saves. */
  activePartner: CharacterId | null
  supportAbilities: Partial<Record<CharacterId, SupportAbilityState>>
  highCouncil: CharacterId[]
  flags: Record<string, boolean>
  variables: Record<string, string | number>
  processedNodes: string[]
  seenNodes: string[]
  unlockedCgs: string[]
  unlockedEndings: string[]
  history: HistoryEntry[]
}

export type NumericStat = keyof CoreStats

export interface SupportUseResult {
  character: CharacterId
  name: string
  appliedBonuses: Partial<Record<NumericStat, number>>
  /** A charge is retained when every configured bonus is already at its cap. */
  consumed: boolean
}

export type Condition =
  | { type: 'flag'; key: string; value?: boolean }
  | { type: 'route'; value: RouteId }
  | { type: 'organization'; value: OrganizationId }
  | { type: 'stat'; key: NumericStat; operator: 'gte' | 'lte' | 'eq'; value: number }
  | { type: 'organizationRelation'; organization: OrganizationId; operator: 'gte' | 'lte'; value: number }
  | {
      type: 'relationship'
      character: CharacterId
      key: 'trust' | 'affinity'
      operator: 'gte' | 'lte'
      value: number
    }
  | {
      type: 'relationshipProgress'
      character: CharacterId
      operator: 'gte' | 'lte' | 'eq'
      value: number
    }
  | { type: 'variable'; key: string; operator: 'eq' | 'neq' | 'gte' | 'lte'; value: string | number }
  | { type: 'activePartner'; value: CharacterId | null }
  | { type: 'all'; conditions: Condition[] }
  | { type: 'any'; conditions: Condition[] }
  | { type: 'not'; condition: Condition }

export type Effect =
  | { type: 'stat'; key: NumericStat; operation?: 'add' | 'set'; value: number }
  | { type: 'organizationRelation'; organization: OrganizationId; value: number }
  | { type: 'relationship'; character: CharacterId; key: 'trust' | 'affinity'; value: number }
  | {
      type: 'activePartnerRelationship'
      key: 'trust' | 'affinity'
      value: number
      /** 无伴侣主线可显式指定承担该关系反馈的默认角色。 */
      fallbackCharacter?: CharacterId
    }
  | { type: 'relationshipProgress'; character: CharacterId; value: number }
  | { type: 'activePartner'; character: CharacterId | null }
  | { type: 'stance'; character: CharacterId; value: RelationshipState['stance'] }
  | { type: 'flag'; key: string; value?: boolean }
  | { type: 'variable'; key: string; value: string | number }
  | {
      type: 'route'
      route: RouteId
      organization: OrganizationId
      organizationName?: string
      role?: RoleId
    }
  | { type: 'organizationName'; value: string }
  | { type: 'highCouncil'; members: CharacterId[] }
  | { type: 'unlockCg'; id: string }
  | { type: 'unlockEnding'; id: string }
  | { type: 'butterflyDelta'; key: string; delta: number }
  | { type: 'archiveSeason2Outcome' }

export interface ConditionalTarget {
  type?: 'conditional'
  cases: Array<{ when: Condition; next: string }>
  fallback: string
}

export interface RandomCase {
  /** 相对权重（不必归一化）；condition 未满足时视为 0 */
  weight: number
  next: string
  condition?: Condition
}

export interface RandomTarget {
  type: 'random'
  cases: RandomCase[]
  /** 所有权重为 0 或 condition 全部不满足时的保底跳转 */
  fallback: string
  /** 可选：从 variables 读取确定性种子（真随机时留空，读档重选可改命） */
  seedKey?: string
}

export interface StateVariableTarget {
  type: 'stateVariable'
  key: string
  fallback: string
}

export type NodeTarget = string | ConditionalTarget | RandomTarget | StateVariableTarget

export interface StoryChoice {
  id: string
  label: string
  detail?: string
  tone?: 'calm' | 'bold' | 'warm' | 'danger' | 'secret'
  condition?: Condition
  effects?: Effect[]
  next: NodeTarget
}

export interface StoryTextEntry {
  /** State variable receiving the value; route scripts can reuse it in {{templates}}. */
  key: string
  label: string
  placeholder?: string
  maxLength: number
  submitLabel: string
  applyTo?: 'organizationName'
  next: NodeTarget
}

export interface StoryNode {
  id: string
  chapter: ChapterId
  actLabel: string
  date: string
  title?: string
  location?: string
  mode: PresentationMode
  speaker: ActorId
  text: string
  /** Optional stories pause the historical timeline and return to the caller afterwards. */
  sideStory?: SideStoryKind
  background: BackgroundId
  portrait?: ActorId
  music?: MusicId
  sound?: SoundId
  historical?: 'confirmed' | 'adapted' | 'fictional'
  presentation?: SceneDirection
  onEnter?: Effect[]
  next?: NodeTarget
  choices?: StoryChoice[]
  textEntry?: StoryTextEntry
}

export interface ActorDefinition {
  id: ActorId
  name: string
  shortName?: string
  organization?: OrganizationId
  role?: string
  avatar?: string
  color: string
  description: string
}

export interface CharacterDefinition extends ActorDefinition {
  id: CharacterId
  romanceable?: boolean
}

export interface StoryActorDefinition extends ActorDefinition {
  id: StoryActorId
}

export interface OrganizationDefinition {
  id: OrganizationId
  name: string
  index: number
  color: string
  initialPower: string
  defaultLeader: CharacterId
  theme: string
}

export interface BackgroundDefinition {
  id: BackgroundId
  src?: string
  collectionId?: string
  alt: string
  focalPoint?: string
  gradient: string
  /** Final asset path when this release intentionally renders a safe existing fallback. */
  placeholderFor?: string
  promptRef?: string
}

export interface SaveMetadata {
  slot: string
  savedAt: number
  nodeId: string
  date: string
  chapter: ChapterId
  route: RouteId | null
  playerName: string
  organizationName: string
  preview: string
}

export interface SaveRecord extends SaveMetadata {
  schemaVersion: number
  state: GameState
}

export interface GameSettings {
  textSpeed: number
  autoDelay: number
  musicVolume: number
  soundVolume: number
  muted: boolean
  reducedMotion: boolean
  skipUnread: boolean
}
