/**
 * 《4945区》2.2 集注册表与选择回报账本（架构阶段，canon 未签认）。
 *
 * 仅定义类型与纯函数助手 + 空注册表。序章与后续集在 canon 签认后才登记；
 * 本模块不创建任何 `s2-` 剧情节点，也不写入具体回报内容。
 *
 * 约束（SOL-PLAN-2.2 §7）：
 *  - 序章登记为第一个 SeasonEpisodeDefinition；
 *  - 序章每个选择写入 payoff ledger，至少含即时结果；
 *  - 继承字段按 flavor / scene / structural / ending 分级，序章不得擅自扩大级别；
 *  - episode completion 使用显式字段，不以「看过某文本节点」猜测。
 */

// ---------------------------------------------------------------------------
// 继承分级
// ---------------------------------------------------------------------------

export type InheritanceLevel = 'flavor' | 'scene' | 'structural' | 'ending'

export const INHERITANCE_LEVELS: readonly InheritanceLevel[] = ['flavor', 'scene', 'structural', 'ending']

// ---------------------------------------------------------------------------
// 集定义
// ---------------------------------------------------------------------------

export interface SeasonEpisodeDefinition {
  /** 稳定 id（如 's2-prologue'）。 */
  id: string
  seasonId: string
  /** 集序号，从 0 开始；序章为 0。 */
  index: number
  title: string
  isPrologue?: boolean
  /** 集入口节点（s2- 前缀，canon 签认后填真实节点）。 */
  entryNodeId: string
  /** 显式收束节点；到达即标记完成，不靠看文本猜测。 */
  completionNodeId: string
}

/** 序章与后续集登记；canon 架空拟定后，共通序章作为首个 episode 登记。 */
export const SEASON2_EPISODES: readonly SeasonEpisodeDefinition[] = Object.freeze([
  {
    id: 's2-prologue',
    seasonId: 'season-2',
    index: 0,
    title: '事件二共通序章',
    isPrologue: true,
    entryNodeId: 's2-august-entry',
    completionNodeId: 's2-prologue-exit',
  },
  {
    id: 's2-2.3',
    seasonId: 'season-2',
    index: 1,
    title: '新局势成形',
    entryNodeId: 's2-2.3-entry',
    completionNodeId: 's2-2.3-exit',
  },
  {
    id: 's2-2.4',
    seasonId: 'season-2',
    index: 2,
    title: '首次实质分歧',
    entryNodeId: 's2-2.4-entry',
    completionNodeId: 's2-2.4-exit',
  },
  {
    id: 's2-2.5',
    seasonId: 'season-2',
    index: 3,
    title: '后果与中点',
    entryNodeId: 's2-2.5-entry',
    completionNodeId: 's2-2.5-exit',
  },
  {
    id: 's2-2.6',
    seasonId: 'season-2',
    index: 4,
    title: '组织与关系压力交汇',
    entryNodeId: 's2-2.6-entry',
    completionNodeId: 's2-2.6-exit',
  },
  {
    id: 's2-2.7',
    seasonId: 'season-2',
    index: 5,
    title: '后期危机与终局前置',
    entryNodeId: 's2-2.7-entry',
    completionNodeId: 's2-2.7-exit',
  },
  {
    id: 's2-2.8',
    seasonId: 'season-2',
    index: 6,
    title: '高潮与主要结局',
    entryNodeId: 's2-2.8-entry',
    completionNodeId: 's2-2.8-exit',
  },
  {
    id: 's2-2.9',
    seasonId: 'season-2',
    index: 7,
    title: '路线尾声与关系收束',
    entryNodeId: 's2-2.9-entry',
    completionNodeId: 's2-2.9-exit',
  },
] as SeasonEpisodeDefinition[])

export const registerEpisode = (
  episodes: readonly SeasonEpisodeDefinition[],
  episode: SeasonEpisodeDefinition,
): SeasonEpisodeDefinition[] => {
  if (episodes.some((e) => e.id === episode.id)) return [...episodes]
  return [...episodes, episode]
}

export const findEpisodeById = (
  episodes: readonly SeasonEpisodeDefinition[],
  id: string,
): SeasonEpisodeDefinition | null => episodes.find((e) => e.id === id) ?? null

export const findPrologue = (episodes: readonly SeasonEpisodeDefinition[]): SeasonEpisodeDefinition | null => (
  episodes.find((e) => e.isPrologue === true) ?? null
)

/** 用显式完成标记判断是否完成；与「看过某文本节点」无关。 */
export const isEpisodeComplete = (
  completion: Record<string, boolean>,
  episode: SeasonEpisodeDefinition,
): boolean => completion[episode.id] === true

export const markEpisodeComplete = (
  completion: Record<string, boolean>,
  episode: SeasonEpisodeDefinition,
): Record<string, boolean> => ({ ...completion, [episode.id]: true })

/** 单一季完成判定：标题、进度面板与 store 必须对“可继续”保持同一理解。 */
export const isSeason2Complete = (completion: Record<string, boolean> = {}): boolean => (
  SEASON2_EPISODES.every((episode) => isEpisodeComplete(completion, episode))
)

// ---------------------------------------------------------------------------
// 选择回报账本
// ---------------------------------------------------------------------------

export interface ChoicePayoffLedgerEntry {
  episodeId: string
  nodeId: string
  choiceId: string
  /** 至少包含即时结果描述。 */
  immediateResult: string
  inheritanceLevel: InheritanceLevel
  /** 继承到的 durableFact id 或关系键（按 canon 合同填）。 */
  inherits?: string[]
}

/** 序章与后续集的选择回报登记；canon 架空拟定后，共通序章两个选择节点的回报已登记。 */
export const SEASON2_PAYOFF_LEDGER: readonly ChoicePayoffLedgerEntry[] = Object.freeze([
  {
    episodeId: 's2-prologue',
    nodeId: 's2-august-evidence-choice',
    choiceId: 's2-august-evidence-full',
    immediateResult: '你保留完整上下文，战后记录能区分已确认事实与群聊指控。',
    inheritanceLevel: 'scene',
    inherits: [],
  },
  {
    episodeId: 's2-prologue',
    nodeId: 's2-august-evidence-choice',
    choiceId: 's2-august-evidence-leader',
    immediateResult: '截图先进入夏娜的管理记录，不在公群扩散。',
    inheritanceLevel: 'scene',
    inherits: [],
  },
  {
    episodeId: 's2-prologue',
    nodeId: 's2-august-evidence-choice',
    choiceId: 's2-august-evidence-hold',
    immediateResult: '苏铭暂时离开争论中心，但战后缺少统一公开上下文。',
    inheritanceLevel: 'scene',
    inherits: [],
  },
  {
    episodeId: 's2-prologue',
    nodeId: 's2-august-reorg-choice',
    choiceId: 's2-august-reorg-roster',
    immediateResult: '重组记录采用逐人流向表，明确不是整组吞并。',
    inheritanceLevel: 'structural',
    inherits: ['s1-route-complete'],
  },
  {
    episodeId: 's2-prologue',
    nodeId: 's2-august-reorg-choice',
    choiceId: 's2-august-reorg-people',
    immediateResult: '名单以本人确认作为归属依据，未回复者保持空白。',
    inheritanceLevel: 'structural',
    inherits: ['s1-route-complete'],
  },
  {
    episodeId: 's2-prologue',
    nodeId: 's2-august-reorg-choice',
    choiceId: 's2-august-reorg-names',
    immediateResult: '新组织先挂牌，并补充“名称不代表整体归并”的公告。',
    inheritanceLevel: 'structural',
    inherits: ['s1-route-complete'],
  },
  {
    episodeId: 's2-prologue', nodeId: 's2-august-public-choice', choiceId: 's2-august-public-answer',
    immediateResult: '夏娜公开区分战术选择与奖励失误。', inheritanceLevel: 'scene', inherits: [],
  },
  {
    episodeId: 's2-prologue', nodeId: 's2-august-public-choice', choiceId: 's2-august-public-internal',
    immediateResult: '二组不去空间对线，改为内部复盘。', inheritanceLevel: 'scene', inherits: [],
  },
  {
    episodeId: 's2-prologue', nodeId: 's2-august-kick-choice', choiceId: 's2-august-kick-support',
    immediateResult: '你先稳住管理群，但夏娜坚持亲自承担踢人决定。', inheritanceLevel: 'scene', inherits: [],
  },
  {
    episodeId: 's2-prologue', nodeId: 's2-august-kick-choice', choiceId: 's2-august-kick-review',
    immediateResult: '原记录证明“回三组”更接近气话而非正式退组申请。', inheritanceLevel: 'scene', inherits: [],
  },
  {
    episodeId: 's2-prologue', nodeId: 's2-august-kick-choice', choiceId: 's2-august-kick-contact',
    immediateResult: '你先联系当事人，路人K以“游戏而已”停止升级冲突。', inheritanceLevel: 'scene', inherits: [],
  },
  {
    episodeId: 's2-prologue',
    nodeId: 's2-prologue-choice',
    choiceId: 's2-prologue-stabilize',
    immediateResult: '你决定先稳住内部，再对外表态。',
    inheritanceLevel: 'flavor',
    inherits: [],
  },
  {
    episodeId: 's2-prologue',
    nodeId: 's2-prologue-choice',
    choiceId: 's2-prologue-lead',
    immediateResult: '你主动牵头联合活动室，抢先表态。',
    inheritanceLevel: 'structural',
    inherits: ['s1-cross-org-tie'],
  },
  {
    episodeId: 's2-prologue',
    nodeId: 's2-prologue-goal',
    choiceId: 's2-prologue-accept',
    immediateResult: '你接过代表名录，正式成为联合评议代表。',
    inheritanceLevel: 'structural',
    inherits: ['s1-route-complete'],
  },
  {
    episodeId: 's2-prologue',
    nodeId: 's2-prologue-goal',
    choiceId: 's2-prologue-hold',
    immediateResult: '你选择先观望，暂不公开站队。',
    inheritanceLevel: 'flavor',
    inherits: [],
  },
  {
    episodeId: 's2-2.3',
    nodeId: 's2-2.3-choice',
    choiceId: 's2-2.3-assert',
    immediateResult: '你把所在组织的立场写足，给跨组织协作留了一句模糊的余地。',
    inheritanceLevel: 'structural',
    inherits: ['s1-route-complete'],
  },
  {
    episodeId: 's2-2.3',
    nodeId: 's2-2.3-choice',
    choiceId: 's2-2.3-balance',
    immediateResult: '你把协作写在前面，组织立场克制，保住了旧伙伴的脸面。',
    inheritanceLevel: 'structural',
    inherits: ['s1-cross-org-tie'],
  },
  {
    episodeId: 's2-2.4',
    nodeId: 's2-2.4-diverge',
    choiceId: 's2-2.4-confront',
    immediateResult: '你一个人扛下所有反对声，主导权在握但全部压力归你。',
    inheritanceLevel: 'structural',
    inherits: ['s1-route-complete'],
  },
  {
    episodeId: 's2-2.4',
    nodeId: 's2-2.4-diverge',
    choiceId: 's2-2.4-coalition',
    immediateResult: '你牵头跨组织联盟共同表态，压力被分摊但让渡了部分主导权。',
    inheritanceLevel: 'structural',
    inherits: ['s1-cross-org-tie'],
  },
  {
    episodeId: 's2-2.5',
    nodeId: 's2-2.5-respond',
    choiceId: 's2-2.5-guard',
    immediateResult: '后半季优先稳住所在组织立场与既有关系，谨慎出牌。',
    inheritanceLevel: 'structural',
    inherits: ['s1-route-complete'],
  },
  {
    episodeId: 's2-2.5',
    nodeId: 's2-2.5-respond',
    choiceId: 's2-2.5-pivot',
    immediateResult: '后半季借联席协调席争取主动，承担更大但可能改写局势的风险。',
    inheritanceLevel: 'structural',
    inherits: ['s1-cross-org-tie'],
  },
  {
    episodeId: 's2-2.6',
    nodeId: 's2-2.6-decide',
    choiceId: 's2-2.6-org-priority',
    immediateResult: '在协调席坚持组织立场，短期获得主导权但损伤关键关系的信任。',
    inheritanceLevel: 'structural',
    inherits: ['s1-route-complete'],
  },
  {
    episodeId: 's2-2.6',
    nodeId: 's2-2.6-decide',
    choiceId: 's2-2.6-rel-priority',
    immediateResult: '在方案中让步以维护伙伴关系网络，但让渡了部分组织协调权。',
    inheritanceLevel: 'structural',
    inherits: ['s1-cross-org-tie'],
  },
  {
    episodeId: 's2-2.7',
    nodeId: 's2-2.7-decide',
    choiceId: 's2-2.7-stand-firm',
    immediateResult: '坚持到底：全押在自己选的方向上，赢则全赢，输则扛全部后果。',
    inheritanceLevel: 'ending',
    inherits: ['s1-route-complete'],
  },
  {
    episodeId: 's2-2.7',
    nodeId: 's2-2.7-decide',
    choiceId: 's2-2.7-cut-losses',
    immediateResult: '止损重组：牺牲局部目标保核心，代价是对手看到你的底线。',
    inheritanceLevel: 'ending',
    inherits: ['s1-cross-org-tie'],
  },
  {
    episodeId: 's2-2.8',
    nodeId: 's2-2.8-org2',
    choiceId: 's2-2.8-org2-strike',
    immediateResult: '二组 triumph：拒绝出卖成员，以人心为最优先，赢得信任但付出人员流失代价。',
    inheritanceLevel: 'ending',
    inherits: ['s1-route-complete'],
  },
  {
    episodeId: 's2-2.8',
    nodeId: 's2-2.8-org2',
    choiceId: 's2-2.8-org2-settle',
    immediateResult: '二组 compromise：锁死保护线，所有人都在但评估权重下降。',
    inheritanceLevel: 'ending',
    inherits: ['s1-cross-org-tie'],
  },
  {
    episodeId: 's2-2.8',
    nodeId: 's2-2.8-org3',
    choiceId: 's2-2.8-org3-strike',
    immediateResult: '三组 triumph：申请重新评定，赌战绩翻盘，全组下半季押在数据上。',
    inheritanceLevel: 'ending',
    inherits: ['s1-route-complete'],
  },
  {
    episodeId: 's2-2.8',
    nodeId: 's2-2.8-org3',
    choiceId: 's2-2.8-org3-settle',
    immediateResult: '三组 compromise：接受评估但附加说明函，为未来复议留窗口。',
    inheritanceLevel: 'ending',
    inherits: ['s1-cross-org-tie'],
  },
  {
    episodeId: 's2-2.8',
    nodeId: 's2-2.8-org4',
    choiceId: 's2-2.8-org4-strike',
    immediateResult: '四组 triumph：拆分精英赛道独立计分，以四组标准制胜但树敌。',
    inheritanceLevel: 'ending',
    inherits: ['s1-route-complete'],
  },
  {
    episodeId: 's2-2.8',
    nodeId: 's2-2.8-org4',
    choiceId: 's2-2.8-org4-settle',
    immediateResult: '四组 compromise：接受统一标准但加赛保留，精英成员的尺藏于体系之下。',
    inheritanceLevel: 'ending',
    inherits: ['s1-cross-org-tie'],
  },
  {
    episodeId: 's2-2.8',
    nodeId: 's2-2.8-org5',
    choiceId: 's2-2.8-org5-strike',
    immediateResult: '五组 triumph：拒绝公示外联网络，两年织的网成为独立调配权的城墙。',
    inheritanceLevel: 'ending',
    inherits: ['s1-route-complete'],
  },
  {
    episodeId: 's2-2.8',
    nodeId: 's2-2.8-org5',
    choiceId: 's2-2.8-org5-settle',
    immediateResult: '五组 compromise：公示六成但核心三条不交，表面合规内核攥在手里。',
    inheritanceLevel: 'ending',
    inherits: ['s1-cross-org-tie'],
  },
  {
    episodeId: 's2-2.8',
    nodeId: 's2-2.8-org6',
    choiceId: 's2-2.8-org6-strike',
    immediateResult: '六组 triumph：反向定义独立表决位，六组名字从此印在每一页章程上。',
    inheritanceLevel: 'ending',
    inherits: ['s1-route-complete'],
  },
  {
    episodeId: 's2-2.8',
    nodeId: 's2-2.8-org6',
    choiceId: 's2-2.8-org6-settle',
    immediateResult: '六组 compromise：接受观察员席位，锁定一年后自动升级条款。',
    inheritanceLevel: 'ending',
    inherits: ['s1-cross-org-tie'],
  },
] as ChoicePayoffLedgerEntry[])

export const registerPayoff = (
  ledger: readonly ChoicePayoffLedgerEntry[],
  entry: ChoicePayoffLedgerEntry,
): ChoicePayoffLedgerEntry[] => {
  if (ledger.some((e) => e.episodeId === entry.episodeId && e.choiceId === entry.choiceId)) return [...ledger]
  return [...ledger, entry]
}

export const findPayoffsForEpisode = (
  ledger: readonly ChoicePayoffLedgerEntry[],
  episodeId: string,
): ChoicePayoffLedgerEntry[] => ledger.filter((e) => e.episodeId === episodeId)

export const findPayoff = (
  ledger: readonly ChoicePayoffLedgerEntry[],
  episodeId: string,
  choiceId: string,
): ChoicePayoffLedgerEntry | null => (
  ledger.find((e) => e.episodeId === episodeId && e.choiceId === choiceId) ?? null
)

// ---------------------------------------------------------------------------
// 验证
// ---------------------------------------------------------------------------

export const isInheritanceLevel = (value: unknown): value is InheritanceLevel => (
  INHERITANCE_LEVELS.includes(value as InheritanceLevel)
)

export const isChoicePayoffLedgerEntry = (value: unknown): value is ChoicePayoffLedgerEntry => {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  if (typeof v.episodeId !== 'string' || typeof v.nodeId !== 'string' || typeof v.choiceId !== 'string') return false
  if (typeof v.immediateResult !== 'string') return false
  if (!isInheritanceLevel(v.inheritanceLevel)) return false
  if (v.inherits !== undefined && (!Array.isArray(v.inherits) || !v.inherits.every((x) => typeof x === 'string'))) {
    return false
  }
  return true
}

export const isSeasonEpisodeDefinition = (value: unknown): value is SeasonEpisodeDefinition => {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  if (typeof v.id !== 'string' || typeof v.seasonId !== 'string') return false
  if (typeof v.index !== 'number' || !Number.isInteger(v.index) || v.index < 0) return false
  if (typeof v.title !== 'string' || typeof v.entryNodeId !== 'string' || typeof v.completionNodeId !== 'string') {
    return false
  }
  if (v.isPrologue !== undefined && typeof v.isPrologue !== 'boolean') return false
  return true
}
