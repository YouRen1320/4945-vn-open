import type { Effect, StoryNode } from '@/engine/types'

export const S2_AUGUST_ENTRY = 's2-august-entry'

const organizationMapEffects: Effect[] = [
  { type: 'flag', key: 's2AugustOrganizationNamesPublished' },
  { type: 'variable', key: 's2Org1Name', value: '云山乱清雪' },
  { type: 'variable', key: 's2Org2Name', value: '云梦仙踪' },
  { type: 'variable', key: 's2Org3Name', value: '虚妄月华' },
  { type: 'variable', key: 's2Org4Name', value: '镜花水月' },
  { type: 'variable', key: 's2Org5Name', value: '心之所向' },
  { type: 'variable', key: 's2Org1Leader', value: '心跳成瘾' },
  { type: 'variable', key: 's2Org2Leader', value: '夏娜' },
  { type: 'variable', key: 's2Org4Leader', value: '铁碎牙' },
  { type: 'variable', key: 's2Org5Leader', value: '困醒' },
]

const transferResultEffects: Effect[] = [
  ...organizationMapEffects,
  { type: 'flag', key: 's2PasserKTransferredOrg3' },
  { type: 'flag', key: 's2DaiguTransferredOrg3' },
  { type: 'flag', key: 's2PasserKLeadsOrg3' },
  { type: 'flag', key: 's2WenxianRetired' },
  { type: 'flag', key: 's2AugustLeadershipClarified' },
  { type: 'variable', key: 's2Org3Leader', value: '路人K' },
  { type: 'variable', key: 's2Org5Successor', value: '困醒' },
  { type: 'variable', key: 's2Org5Coordinator', value: '剑问白玉京' },
]

const reorganizationEffects: Effect[] = [
  { type: 'flag', key: 's2AugustReorganizationComplete' },
  { type: 'flag', key: 's2QifuLeftOrg1' },
  { type: 'flag', key: 's2HeartbeatLeadsOrg1' },
  { type: 'flag', key: 's2PasserKTransferredOrg3' },
  { type: 'flag', key: 's2DaiguTransferredOrg3' },
  { type: 'flag', key: 's2PasserKLeadsOrg3' },
  { type: 'flag', key: 's2WenxianRetired' },
  { type: 'flag', key: 's2AugustLeadershipClarified' },
  { type: 'flag', key: 's2AugustOrganizationNamesPublished' },
  { type: 'variable', key: 's2Org1Name', value: '云山乱清雪' },
  { type: 'variable', key: 's2Org2Name', value: '云梦仙踪' },
  { type: 'variable', key: 's2Org3Name', value: '虚妄月华' },
  { type: 'variable', key: 's2Org4Name', value: '镜花水月' },
  { type: 'variable', key: 's2Org5Name', value: '心之所向' },
  { type: 'variable', key: 's2Org1Leader', value: '心跳成瘾' },
  { type: 'variable', key: 's2Org2Leader', value: '夏娜' },
  { type: 'variable', key: 's2Org3Leader', value: '路人K' },
  { type: 'variable', key: 's2Org4Leader', value: '铁碎牙' },
  { type: 'variable', key: 's2Org5Leader', value: '困醒' },
  { type: 'variable', key: 's2Org5Successor', value: '困醒' },
  { type: 'variable', key: 's2Org5Coordinator', value: '剑问白玉京' },
]

// 暑假桥接篇只把截图能确认的事件写成事实；争议性指控始终保留为角色说法。
export const s2AugustNodes: StoryNode[] = [
  {
    id: S2_AUGUST_ENTRY,
    chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-07-21',
    title: '一份没有发出去的单子', location: '4945区 · 私聊', mode: 'chat',
    speaker: 'narrator',
    text: '火2之后的第二天，几张私聊截图被转到你面前。祈福——也就是群里有人叫的“风吹雪”——提出用红包请代练苏铭替一组打听消息。',
    background: 'nightMessage', historical: 'confirmed', next: 's2-august-qifu-pressure',
  },
  {
    id: 's2-august-qifu-pressure', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-07-21',
    title: '可信度', location: '4945区 · 私聊', mode: 'chat', speaker: 'qifu', portrait: 'qifu',
    text: '“你不接也可以。”祈福没有立刻收手，“但这件事得说清楚。新区的单以后也别接了，谁知道你到底替哪边做事。”',
    background: 'nightMessage', historical: 'adapted', next: 's2-august-suming-refusal',
  },
  {
    id: 's2-august-suming-refusal', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-07-21',
    title: '不接', location: '苏铭 · 私聊', mode: 'chat', speaker: 'suming', portrait: 'suming',
    text: '“我就是做单赚钱，不想掺和组织之间的事。”苏铭把红包退了回来，“事情越扯越大，钱也挣不到，我不想再处理。”',
    background: 'nightMessage', historical: 'adapted', next: 's2-august-evidence-choice',
  },
  {
    id: 's2-august-evidence-choice', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-07-21',
    title: '截图怎么处理', location: '4945区 · 私聊', mode: 'chat', speaker: 'player',
    text: '截图已经到了你手里。你不可能让它没发生，只能决定先把它交给谁。',
    background: 'nightMessage', historical: 'adapted', choices: [
      {
        id: 's2-august-evidence-full', label: '“保留完整上下文，只传原图。”', tone: 'calm',
        effects: [{ type: 'variable', key: 's2AugustEvidenceStance', value: 'full-context' }, { type: 'stat', key: 'evidence', value: 1 }],
        next: 's2-august-evidence-full-reply',
      },
      {
        id: 's2-august-evidence-leader', label: '“先交给夏娜，不在公群扩散。”', tone: 'warm',
        effects: [{ type: 'variable', key: 's2AugustEvidenceStance', value: 'leader-first' }, { type: 'relationship', character: 'shana', key: 'trust', value: 1 }],
        next: 's2-august-evidence-leader-reply',
      },
      {
        id: 's2-august-evidence-hold', label: '“先压住，别让代练变成公敌。”', tone: 'secret',
        effects: [{ type: 'variable', key: 's2AugustEvidenceStance', value: 'hold' }, { type: 'stat', key: 'cohesion', value: 1 }],
        next: 's2-august-evidence-hold-reply',
      },
    ],
  },
  {
    id: 's2-august-evidence-full-reply', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-07-21',
    title: '原图', location: '4945区 · 私聊', mode: 'chat', speaker: 'shana', portrait: 'shana',
    text: '夏娜逐张看完：“原图留着。苏铭拒绝了什么、别人要求了什么，分开写。群里后来那些‘内鬼’和‘伪代’说法，没有证据就只能算当事人的指控。”',
    background: 'nightMessage', historical: 'adapted', next: 's2-august-august-first',
  },
  {
    id: 's2-august-evidence-leader-reply', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-07-21',
    title: '先别发', location: '4945区 · 私聊', mode: 'chat', speaker: 'shana', portrait: 'shana',
    text: '“先别发公群。”夏娜把截图收进管理记录，“这不是替谁遮，是不拿苏铭做站队材料。真需要回应，我来回应。”',
    background: 'nightMessage', historical: 'adapted', next: 's2-august-august-first',
  },
  {
    id: 's2-august-evidence-hold-reply', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-07-21',
    title: '先停在这里', location: '4945区 · 私聊', mode: 'chat', speaker: 'narrator',
    text: '你没有把截图送进公群。苏铭的名字暂时从争论中心退开了，但祈福与二组之间那条裂缝并没有合上。它只是等着下一场要塞，把所有话重新翻出来。',
    background: 'nightMessage', historical: 'adapted', next: 's2-august-august-first',
  },
  {
    id: 's2-august-august-first', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-01',
    title: '火要塞换旗', location: '4945区 · 火要塞', mode: 'battle', speaker: 'system',
    text: '【战报】江南击败群雄逐鹿。战斗结束后，祈福离开一组首领位置；原三组首领心跳成瘾接过一组。七月二十一日没说完的话，在要塞结果面前失去了遮掩。',
    background: 'fortress', historical: 'confirmed', next: 's2-august-evidence-echo-router',
  },
  {
    id: 's2-august-evidence-echo-router', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-01',
    title: '旧截图的新重量', location: '4945区 · 战后记录', mode: 'system', speaker: 'system',
    text: '七月二十一日的处理方式，在战后决定了这份记录现在由谁解释。',
    background: 'aftermath', historical: 'adapted',
    next: {
      type: 'conditional',
      cases: [
        { when: { type: 'variable', key: 's2AugustEvidenceStance', operator: 'eq', value: 'full-context' }, next: 's2-august-evidence-full-echo' },
        { when: { type: 'variable', key: 's2AugustEvidenceStance', operator: 'eq', value: 'leader-first' }, next: 's2-august-evidence-leader-echo' },
      ],
      fallback: 's2-august-evidence-hold-echo',
    },
  },
  {
    id: 's2-august-evidence-full-echo', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-01',
    title: '上下文还在', location: '4945区 · 战后记录', mode: 'chat', speaker: 'narrator',
    text: '原图和完整上下文成了最早的一份战后记录。没人能用一张裁剪截图把苏铭写成已经答应，也没人能抹掉祈福提出过什么。',
    background: 'aftermath', historical: 'adapted', next: 's2-august-qifu-exit',
  },
  {
    id: 's2-august-evidence-leader-echo', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-01',
    title: '管理记录', location: '4945区 · 战后记录', mode: 'chat', speaker: 'shana', portrait: 'shana',
    text: '夏娜把那份没有公开的截图放进战后记录：“当时不发，不代表永远不记。现在至少能说明，这场冲突不是八月一日突然发生。”',
    background: 'aftermath', historical: 'adapted', next: 's2-august-qifu-exit',
  },
  {
    id: 's2-august-evidence-hold-echo', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-01',
    title: '没有公开版本', location: '4945区 · 战后记录', mode: 'chat', speaker: 'narrator',
    text: '你当时压住了截图，苏铭也没有成为公群里的靶子。代价是战后每个人都带着自己的版本解释七月二十一日，没有一份公开上下文能立刻让争论停下。',
    background: 'aftermath', historical: 'adapted', next: 's2-august-qifu-exit',
  },
  {
    id: 's2-august-qifu-exit', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-01',
    title: '退群之前', location: '4945区 · 一组管理群', mode: 'chat', speaker: 'qifu', portrait: 'qifu',
    text: '祈福没有留下交接长文。首领权限空出来时，他只说这区先到这里。心跳成瘾接下权限，也接下了一份已经打散的名单。',
    background: 'organization', historical: 'adapted', next: 's2-august-reorg-choice',
  },
  {
    id: 's2-august-reorg-choice', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-01',
    title: '先看什么', location: '4945区 · 重组临时群', mode: 'chat', speaker: 'player',
    text: '成员开始自行找位置。没有哪个组织被整块搬走，真正移动的是一张张名单。你先盯哪一件事？',
    background: 'organization', historical: 'adapted', choices: [
      {
        id: 's2-august-reorg-roster', label: '“先把每个人去了哪里记清。”', tone: 'calm',
        effects: [{ type: 'variable', key: 's2AugustReorgStance', value: 'roster' }, { type: 'stat', key: 'evidence', value: 1 }],
        next: 's2-august-reorg-roster-reply',
      },
      {
        id: 's2-august-reorg-people', label: '“先问本人，别替成员决定归属。”', tone: 'warm',
        effects: [{ type: 'variable', key: 's2AugustReorgStance', value: 'people' }, { type: 'stat', key: 'cohesion', value: 1 }],
        next: 's2-august-reorg-people-reply',
      },
      {
        id: 's2-august-reorg-names', label: '“先把新组名和负责人定下来。”', tone: 'bold',
        effects: [{ type: 'variable', key: 's2AugustReorgStance', value: 'names' }, { type: 'stat', key: 'reputation', value: 1 }],
        next: 's2-august-reorg-names-reply',
      },
    ],
  },
  {
    id: 's2-august-reorg-roster-reply', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-01',
    title: '名单不是箭头', location: '4945区 · 重组临时群', mode: 'chat', speaker: 'heartbeat', portrait: 'heartbeat',
    text: '“记流向可以，别画成整组吞并。”心跳成瘾把表格拆到成员级，“有人跟首领走，有人留原位，也有人去了第三个地方。写错一个人，后面就是一段假历史。”',
    background: 'organization', historical: 'adapted', next: 's2-august-new-map',
  },
  {
    id: 's2-august-reorg-people-reply', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-01',
    title: '本人确认', location: '4945区 · 重组临时群', mode: 'chat', speaker: 'shana', portrait: 'shana',
    text: '“就按本人确认。”夏娜撤回第一版总表，“首领换组，不等于所有成员跟着走。没有回话的人先留空，别为了让表好看替他们选。”',
    background: 'organization', historical: 'adapted', next: 's2-august-new-map',
  },
  {
    id: 's2-august-reorg-names-reply', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-01',
    title: '先挂牌', location: '4945区 · 重组临时群', mode: 'chat', speaker: 'heartbeat', portrait: 'heartbeat',
    text: '“名字先挂，但成员表不能跟着省略。”心跳成瘾把新群公告置顶，“今天定的是入口，不是谁自动属于谁。”',
    background: 'organization', historical: 'adapted', next: 's2-august-new-map',
  },
  {
    id: 's2-august-new-map', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-02',
    title: '五张新牌', location: '4945区 · 组织列表', mode: 'system', speaker: 'system',
    text: '【组织名单更新】一组：云山乱清雪，首领心跳成瘾。二组：云梦仙踪，首领夏娜。三组：虚妄月华。四组：镜花水月，首领铁碎牙。五组：心之所向，首领困醒。重组由部分成员分别流入新组完成，不代表原组织整体并入。',
    background: 'organization', historical: 'confirmed', onEnter: organizationMapEffects,
    next: 's2-august-reorg-echo-router',
  },
  {
    id: 's2-august-reorg-echo-router', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-02',
    title: '表怎么留下', location: '4945区 · 组织列表', mode: 'system', speaker: 'system',
    text: '新组名已经生效；你在重组时先抓住的东西，决定了名单旁留下哪条注释。',
    background: 'organization', historical: 'adapted',
    next: {
      type: 'conditional',
      cases: [
        { when: { type: 'variable', key: 's2AugustReorgStance', operator: 'eq', value: 'roster' }, next: 's2-august-reorg-roster-echo' },
        { when: { type: 'variable', key: 's2AugustReorgStance', operator: 'eq', value: 'people' }, next: 's2-august-reorg-people-echo' },
      ],
      fallback: 's2-august-reorg-names-echo',
    },
  },
  {
    id: 's2-august-reorg-roster-echo', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-02',
    title: '逐人流向', location: '4945区 · 组织列表', mode: 'chat', speaker: 'truth', portrait: 'truth',
    text: '真理保留了逐人流向表。后来有人说“一三整体合并”，她只把表发回去：“请指出哪一行写了整体。”',
    background: 'organization', historical: 'adapted', next: 's2-august-fire-two',
  },
  {
    id: 's2-august-reorg-people-echo', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-02',
    title: '本人回执', location: '4945区 · 组织列表', mode: 'chat', speaker: 'shana', portrait: 'shana',
    text: '最终表格每一行都附了本人确认。没有回执的名字保持空白；看起来不够整齐，却没有谁被一张总表替着转组。',
    background: 'organization', historical: 'adapted', next: 's2-august-fire-two',
  },
  {
    id: 's2-august-reorg-names-echo', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-02',
    title: '挂牌之后', location: '4945区 · 组织列表', mode: 'chat', speaker: 'heartbeat', portrait: 'heartbeat',
    text: '五张新牌先挂了出去，也招来最多误解。心跳成瘾后来在公告第二行补了一句：“组名代表入口，不代表旧组成员自动归并。”',
    background: 'organization', historical: 'adapted', next: 's2-august-fire-two',
  },
  {
    id: 's2-august-fire-two', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-08',
    title: '第二名被拿走', location: '4945区 · 火2要塞', mode: 'battle', speaker: 'system',
    text: '【火2结算】二组没有选择与一组争夺火2。第二名奖励最终被三十五组拿走。结算刚落地，心跳成瘾在QQ空间发出一句嘲讽：“致敬4945传奇二组，火二被35组抢了。”',
    background: 'fortress', historical: 'confirmed', next: 's2-august-public-choice',
  },
  {
    id: 's2-august-public-choice', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-08',
    title: '要不要回', location: '4945区 · 二组群', mode: 'chat', speaker: 'player',
    text: '动态已经被转进群里。有人等夏娜回应，也有人开始把没抢火2说成整个二组的失败。',
    background: 'worldChat', historical: 'adapted', choices: [
      {
        id: 's2-august-public-answer', label: '“把战术决定和丢奖励分开说明。”', tone: 'bold',
        effects: [{ type: 'variable', key: 's2AugustPublicStance', value: 'answer' }, { type: 'stat', key: 'reputation', value: 1 }],
        next: 's2-august-public-answer-reply',
      },
      {
        id: 's2-august-public-internal', label: '“先稳住群里，不去空间对线。”', tone: 'calm',
        effects: [{ type: 'variable', key: 's2AugustPublicStance', value: 'internal' }, { type: 'stat', key: 'cohesion', value: 1 }],
        next: 's2-august-public-internal-reply',
      },
    ],
  },
  {
    id: 's2-august-public-answer-reply', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-08',
    title: '只说决定', location: '4945区 · 二组群', mode: 'chat', speaker: 'shana', portrait: 'shana',
    text: '夏娜删掉了第一版带情绪的回复，只留下结果：“没抢一组是我们的选择；第二名被三十五组拿走，是我们的失误。两件事都认，不和空间吵。”',
    background: 'worldChat', historical: 'adapted', next: 's2-august-kick-start',
  },
  {
    id: 's2-august-public-internal-reply', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-08',
    title: '群里先停', location: '4945区 · 二组群', mode: 'chat', speaker: 'shana', portrait: 'shana',
    text: '“不去空间对线。”夏娜把群公告改成了复盘时间，“但第二名丢了就是丢了，明天管理和成员都到。谁也别把不说话当没事。”',
    background: 'worldChat', historical: 'adapted', next: 's2-august-kick-start',
  },
  {
    id: 's2-august-kick-start', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-09',
    title: '一句“回三组”', location: '4945区 · 二组群', mode: 'chat', speaker: 'narrator',
    text: '复盘没有按公告里的方式开始。夏娜当时还在医院处理现实里的事，群里又起争执。路人K说到“回三组”，还与yyT吵了起来；情绪顶到最高处时，夏娜把路人K和大古踢出了二组。',
    background: 'organization', historical: 'confirmed', next: 's2-august-passerk-outburst',
  },
  {
    id: 's2-august-passerk-outburst', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-09',
    title: '气头上的话', location: '路人K · 私聊', mode: 'chat', speaker: 'passerk', portrait: 'passerk',
    text: '“我说回三组，是当时在气头上。”路人K没有把那句话说成正式申请，“和yyT吵归吵，直接把我和大古踢出去，是另一回事。”',
    background: 'nightMessage', historical: 'adapted', next: 's2-august-kick-choice',
  },
  {
    id: 's2-august-kick-choice', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-09',
    title: '先做哪一步', location: '4945区 · 管理私聊', mode: 'chat', speaker: 'player',
    text: '踢人已经发生。现在能改变的不是事实，而是这件事会以什么方式收尾。',
    background: 'nightMessage', historical: 'adapted', choices: [
      {
        id: 's2-august-kick-support', label: '“先替夏娜把管理群稳住。”', tone: 'warm',
        effects: [{ type: 'variable', key: 's2AugustKickStance', value: 'support' }, { type: 'relationship', character: 'shana', key: 'trust', value: 1 }],
        next: 's2-august-kick-support-reply',
      },
      {
        id: 's2-august-kick-review', label: '“把原聊天翻出来，再决定怎么解释。”', tone: 'calm',
        effects: [{ type: 'variable', key: 's2AugustKickStance', value: 'review' }, { type: 'stat', key: 'evidence', value: 1 }],
        next: 's2-august-kick-review-reply',
      },
      {
        id: 's2-august-kick-contact', label: '“先联系路人K和大古。”', tone: 'warm',
        effects: [{ type: 'variable', key: 's2AugustKickStance', value: 'contact' }, { type: 'stat', key: 'cohesion', value: 1 }],
        next: 's2-august-kick-contact-reply',
      },
    ],
  },
  {
    id: 's2-august-kick-support-reply', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-09',
    title: '先接住管理', location: '4945区 · 管理私聊', mode: 'chat', speaker: 'shana', portrait: 'shana',
    text: '“谢谢，但别替我说这是正确决定。”夏娜停了很久，“群可以先稳，踢人是我情绪上来的处理。我得自己认。”',
    background: 'nightMessage', historical: 'adapted', next: 's2-august-obito-advice',
  },
  {
    id: 's2-august-kick-review-reply', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-09',
    title: '原话', location: '路人K · 私聊', mode: 'chat', speaker: 'passerk', portrait: 'passerk',
    text: '你把聊天记录按时间排好后发给路人K。对方只圈出“回三组”那句：“这句我说过，当时在气头上。但它不是退组申请。”',
    background: 'nightMessage', historical: 'adapted', next: 's2-august-obito-advice',
  },
  {
    id: 's2-august-kick-contact-reply', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-09',
    title: '游戏而已', location: '路人K · 私聊', mode: 'chat', speaker: 'passerk', portrait: 'passerk',
    text: '“没事，游戏而已。”路人K没有继续追责。这句话让争吵停了一拍，却没有让已经发生的转组消失。',
    background: 'nightMessage', historical: 'confirmed', next: 's2-august-obito-advice',
  },
  {
    id: 's2-august-obito-advice', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-09',
    title: '把人留下', location: '宇智波带土 · 私聊', mode: 'chat', speaker: 'obito', portrait: 'obito',
    text: '“路人K说回三组，也可能只是气话。”宇智波带土没有替谁抹掉争吵，“每个人都有性格缺点。你应该先试着包容、挽留，而不是事情还没做完就直接做绝。”',
    background: 'nightMessage', historical: 'adapted', next: 's2-august-obito-apology-line',
  },
  {
    id: 's2-august-obito-apology-line', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-09',
    title: '谁去道歉', location: '宇智波带土 · 私聊', mode: 'chat', speaker: 'obito', portrait: 'obito',
    text: '夏娜说，可以帮她转达一句对不起。宇智波带土没有接：“这次是你犯错，不是我犯错。你应该自己去道歉，不能让别人替你说。”',
    background: 'nightMessage', historical: 'confirmed', next: 's2-august-apology',
  },
  {
    id: 's2-august-apology', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-09',
    title: '道歉', location: '4945区 · 私聊', mode: 'chat', speaker: 'shana', portrait: 'shana',
    text: '“那天是我情绪上来了，直接踢人不对。”夏娜单独把话发给路人K，“对不起。”',
    background: 'nightMessage', historical: 'confirmed', next: 's2-august-apology-received',
  },
  {
    id: 's2-august-apology-received', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-09',
    title: '收到', location: '路人K · 私聊', mode: 'chat', speaker: 'passerk', portrait: 'passerk',
    text: '“行，我知道了。”路人K没有把事情继续扩大。道歉修复了说话的方式，却没有把成员送回原来的名单。',
    background: 'nightMessage', historical: 'adapted', next: 's2-august-transfer-result',
  },
  {
    id: 's2-august-transfer-result', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-09',
    title: '名单落定', location: '4945区 · 组织列表', mode: 'system', speaker: 'system',
    text: '【成员变动】路人K、大古进入三组“虚妄月华”；路人K接任三组首领。原五组首领温陷退游；困醒接任“心之所向”首领，剑问白玉京继续承担日常与外联事务。',
    background: 'organization', historical: 'adapted', onEnter: transferResultEffects,
    next: 's2-august-finalize',
  },
  {
    id: 's2-august-finalize', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-09',
    title: '暑假之后', location: '4945区 · 新组织列表', mode: 'novel', speaker: 'narrator',
    text: '九天里，首领、组名和成员位置全部变过一次。真正留下来的不是“谁吞并了谁”，而是谁在冲突后去了哪里、谁接过权限、谁退出了游戏。九月的新局势，会从这张名单继续。',
    background: 'aftermath', historical: 'adapted', onEnter: reorganizationEffects,
    next: {
      type: 'conditional',
      cases: [
        { when: { type: 'route', value: 'org2' }, next: 's2-august-route-org2' },
        { when: { type: 'route', value: 'org3' }, next: 's2-august-route-org3' },
        { when: { type: 'route', value: 'org4' }, next: 's2-august-route-org4' },
        { when: { type: 'route', value: 'org5' }, next: 's2-august-route-org5' },
      ],
      fallback: 's2-august-route-org6',
    },
  },
  {
    id: 's2-august-route-org2', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-09',
    title: '云梦仙踪', location: '4945区 · 二组', mode: 'system', speaker: 'system',
    text: '你当前所在组织更新为：二组“云梦仙踪”。', background: 'organization', historical: 'confirmed',
    onEnter: [{ type: 'organizationName', value: '云梦仙踪' }], next: 's2-prologue-entry',
  },
  {
    id: 's2-august-route-org3', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-09',
    title: '虚妄月华', location: '4945区 · 三组', mode: 'system', speaker: 'system',
    text: '你当前所在组织更新为：三组“虚妄月华”，首领路人K。', background: 'organization', historical: 'confirmed',
    onEnter: [{ type: 'organizationName', value: '虚妄月华' }], next: 's2-prologue-entry',
  },
  {
    id: 's2-august-route-org4', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-09',
    title: '镜花水月', location: '镜花水月 · 组织群', mode: 'chat', speaker: 'tiesuiya', portrait: 'tiesuiya',
    text: '“镜花水月的首领权限由我接。”铁碎牙把新名单置顶，“成员流向按本人确认，不把任何旧组写成整体并入。”', background: 'organization', historical: 'adapted',
    onEnter: [{ type: 'organizationName', value: '镜花水月' }], next: 's2-prologue-entry',
  },
  {
    id: 's2-august-route-org5', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-09',
    title: '心之所向', location: '心之所向 · 组织群', mode: 'chat', speaker: 'kunxing', portrait: 'kunxing',
    text: '“心之所向的首领权限由我接。”困醒确认了新名单，“剑问白玉京继续管日常和外联。温陷退游，不等于留下的人没有组织。”', background: 'organization', historical: 'adapted',
    onEnter: [{ type: 'organizationName', value: '心之所向' }], next: 's2-prologue-entry',
  },
  {
    id: 's2-august-route-org6', chapter: 'prologue', actLabel: '事件二 · 暑假桥接篇', date: '2026-08-09',
    title: '第六席', location: '4945区 · 六组', mode: 'system', speaker: 'system',
    text: '你的第六席保持原名；前五组的重组结果已经写入组织列表。', background: 'organization', historical: 'confirmed',
    next: 's2-prologue-entry',
  },
]
