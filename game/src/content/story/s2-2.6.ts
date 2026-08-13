import type { StoryNode } from '@/engine/types'

// 2.6 事件二 · 组织与关系压力交汇（SOL-PLAN-2.6）。
//
// 回收 2.5 的 s2Midpoint（guard/pivot），在协调席第一次正式交锋中
// 把组织责任和人物关系摆到同一决策里相互施压。
// 玩家必须在「守住组织立场」和「维护伙伴信任」之间首次做实质排序。
// 后果写入 variables.s2PressureStance，供 2.7 危机回收。
//
// 全部复用既有背景/立绘，零新增 CharacterId / 路线 / 托管视觉；historical 标 fictional。

export const S2_2_6_ENTRY = 's2-2.6-entry'
export const S2_2_6_COMPLETION = 's2-2.6-exit'

export const s2_2_6_Nodes: StoryNode[] = [
  // ───────── 开场：回收 2.5 中点选择，分流入场姿态 ─────────
  {
    id: 's2-2.6-entry',
    chapter: 'act1',
    actLabel: '事件二 · 压力交汇',
    date: '2026-10-03',
    title: '协调席',
    location: '4945区 · 联合评议厅',
    mode: 'novel',
    speaker: 'narrator',
    text: '联席协调席第一次正式会晤在今天召开。你进门时看到各个组织的人陆续落座——你那前半季的选择，让这座位的分量变得不一样。有人靠近，有人审视。你深吸一口气，走向自己的位置。',
    background: 'warRoom',
    historical: 'fictional',
    next: {
      type: 'conditional',
      cases: [
        { when: { type: 'variable', key: 's2Midpoint', operator: 'eq', value: 'guard' }, next: 's2-2.6-guard-open' },
        { when: { type: 'variable', key: 's2Midpoint', operator: 'eq', value: 'pivot' }, next: 's2-2.6-pivot-open' },
      ],
      fallback: 's2-2.6-guard-open',
    },
  },

  // ───────── 守成者进场：谨慎出牌 ─────────
  {
    id: 's2-2.6-guard-open',
    chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: '守成', location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'mentor', portrait: 'mentor',
    text: '“你选了稳，那今天就稳到底。”老朋友替你理了理领口——他从来没这么正经过，“不做第一个说话的，不亮最后的底牌。他们想看你什么态度？”他退后半步，“让他们猜。”',
    background: 'warRoom', historical: 'fictional',
    next: {
      type: 'conditional',
      cases: [
        { when: { type: 'variable', key: 's2RoutePressure', operator: 'eq', value: 'member-extraction' }, next: 's2-2.6-org2' },
        { when: { type: 'variable', key: 's2RoutePressure', operator: 'eq', value: 'public-records' }, next: 's2-2.6-org3' },
        { when: { type: 'variable', key: 's2RoutePressure', operator: 'eq', value: 'unified-standard' }, next: 's2-2.6-org4' },
        { when: { type: 'variable', key: 's2RoutePressure', operator: 'eq', value: 'schedule-access' }, next: 's2-2.6-org5' },
        { when: { type: 'variable', key: 's2RoutePressure', operator: 'eq', value: 'seat-legitimacy' }, next: 's2-2.6-org6' },
        { when: { type: 'route', value: 'org2' }, next: 's2-2.6-org2' },
        { when: { type: 'route', value: 'org3' }, next: 's2-2.6-org3' },
        { when: { type: 'route', value: 'org4' }, next: 's2-2.6-org4' },
        { when: { type: 'route', value: 'org5' }, next: 's2-2.6-org5' },
        { when: { type: 'route', value: 'org6' }, next: 's2-2.6-org6' },
      ],
      fallback: 's2-2.6-org2',
    },
  },

  // ───────── 翻局者进场：主动出击 ─────────
  {
    id: 's2-2.6-pivot-open',
    chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: '翻局', location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'bottle', portrait: 'bottle',
    text: '“选了翻局，今天就是亮剑的日子。”瓶在走廊拦住你，声音压低，“协调席的位子你抢来了——现在的问题是，你敢不敢第一轮就把棋摆上台面。”他咧嘴一笑，让开路，“别急着答。进去了，用棋回答。”',
    background: 'warRoom', historical: 'fictional',
    next: {
      type: 'conditional',
      cases: [
        { when: { type: 'variable', key: 's2RoutePressure', operator: 'eq', value: 'member-extraction' }, next: 's2-2.6-org2' },
        { when: { type: 'variable', key: 's2RoutePressure', operator: 'eq', value: 'public-records' }, next: 's2-2.6-org3' },
        { when: { type: 'variable', key: 's2RoutePressure', operator: 'eq', value: 'unified-standard' }, next: 's2-2.6-org4' },
        { when: { type: 'variable', key: 's2RoutePressure', operator: 'eq', value: 'schedule-access' }, next: 's2-2.6-org5' },
        { when: { type: 'variable', key: 's2RoutePressure', operator: 'eq', value: 'seat-legitimacy' }, next: 's2-2.6-org6' },
        { when: { type: 'route', value: 'org2' }, next: 's2-2.6-org2' },
        { when: { type: 'route', value: 'org3' }, next: 's2-2.6-org3' },
        { when: { type: 'route', value: 'org4' }, next: 's2-2.6-org4' },
        { when: { type: 'route', value: 'org5' }, next: 's2-2.6-org5' },
        { when: { type: 'route', value: 'org6' }, next: 's2-2.6-org6' },
      ],
      fallback: 's2-2.6-org2',
    },
  },

  // ───────── 路线同期处境变体：各组织在协调席承受的不同压力 ─────────
  {
    id: 's2-2.6-org2',
    chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: '二组的席', location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'shana', portrait: 'shana',
    text: '夏娜翻开议程，笔尖点在第一条上：“联合行动计划第一项：大幅扩编协调组。”她抬眼，“说好听是整合资源，说难听——从各组织抽人。”她把议程推过来，“二组刚稳下来的人心，经不住第二轮抽血。这句话，你替我带到桌上去。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.6-pressure',
  },
  {
    id: 's2-2.6-org3',
    chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: '三组的席', location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'truth', portrait: 'truth',
    text: '真理推了推眼镜，把议程上“公开出勤数据”那行指给你看：“三组那条旧账，好不容易才翻篇。”她的指尖在那行字上停了两秒，“数据一公开，整组都得被人拿前半季的事重新定义。”她合上文件，“你想清楚了，再开口。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.6-pressure',
  },
  {
    id: 's2-2.6-org4',
    chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: '四组的席', location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'yanqiu', portrait: 'yanqiu',
    text: '“方案写得漂亮——统一战功标准。”砚秋水把议程从头看到尾，只用了一遍，“但四组走的是精英路线。框进一个模子里，不是帮助，是削足适履。”她抬眼，“你坐在这个席上，代表的就是我们对外的姿态。‘削足适履’这四个字，我不希望出现在今天的记录里。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.6-pressure',
  },
  {
    id: 's2-2.6-org5',
    chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: '五组的席', location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'jianwen', portrait: 'jianwen',
    text: '剑问白玉京把议程压在掌下：“协调席要各组织开放内部日程协调权。心之所向刚接完退游后的日常，不能因为别人想看，就把留下的人全部翻开。”他抬起眼，“这席话，不借温陷的名义——你替现在的五组说。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.6-pressure',
  },
  {
    id: 's2-2.6-org6',
    chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: '六组的席', location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'player',
    text: '六组是你从零拉起来的。联合行动计划的每一行都在问同一件事：这个新成立的席位，是真正的桌角，还是只是别人桌上的一张请柬？你的回答会决定六组在事件二的坐标。',
    background: 'warRoom', historical: 'fictional', next: 's2-2.6-pressure',
  },

  // ───────── 共通压力场景：方案宣讲 ─────────
  {
    id: 's2-2.6-pressure',
    chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: '方案宣讲',
    location: '4945区 · 联合评议厅', mode: 'system',
    speaker: 'mentor', portrait: 'mentor',
    text: '评议委员宣读联合行动计划纲要，声音平稳得像在念天气预报：公开核心日程、统一战功标准、抽调骨干进联合执行组，三轮质询后表决。老朋友在你旁边没记笔记，只在手机上敲了一行字推给你：“每一条都踩在你最疼的边界上。不是巧合。”',
    background: 'warRoom', historical: 'fictional',
    onEnter: [
      { type: 'variable', key: 's2PressureStance', value: 'undecided' },
    ],
    next: {
      type: 'conditional',
      cases: [
        { when: { type: 'activePartner', value: 'shana' }, next: 's2-2.6-partner-shana' },
        { when: { type: 'activePartner', value: 'qifu' }, next: 's2-2.6-partner-qifu' },
        { when: { type: 'activePartner', value: 'chenyi' }, next: 's2-2.6-partner-chenyi' },
        { when: { type: 'activePartner', value: 'swordheart' }, next: 's2-2.6-partner-swordheart' },
        { when: { type: 'activePartner', value: 'heartbeat' }, next: 's2-2.6-partner-heartbeat' },
        { when: { type: 'activePartner', value: 'yanqiu' }, next: 's2-2.6-partner-yanqiu' },
        { when: { type: 'activePartner', value: 'huayue' }, next: 's2-2.6-partner-huayue' },
        { when: { type: 'activePartner', value: 'wenxian' }, next: 's2-2.6-partner-wenxian' },
        { when: { type: 'activePartner', value: 'takemehand' }, next: 's2-2.6-partner-takemehand' },
        { when: { type: 'activePartner', value: 'xilufei' }, next: 's2-2.6-partner-xilufei' },
        { when: { type: 'activePartner', value: 'yyt' }, next: 's2-2.6-partner-yyt' },
        { when: { type: 'activePartner', value: 'avucii' }, next: 's2-2.6-partner-avucii' },
      ],
      fallback: 's2-2.6-relation',
    },
  },

  // 继承的伴侣要亲自参与这次排序；没有伴侣时才由老朋友兜底。
  {
    id: 's2-2.6-partner-shana', chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: '夏娜的反对', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'shana', portrait: 'shana',
    text: '夏娜把抽调名单按在桌上：“评议加分可以以后挣，人被当成名额抽走，就未必回得来。”她看着你，“我不是要你替我赢。我只要你别把成员写成一串可以交换的数字。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.6-decide',
  },
  {
    id: 's2-2.6-partner-qifu', chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: '祈福的边界', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'qifu', portrait: 'qifu',
    text: '祈福在议程边缘画了一道线：“组织的责任不能拿我们的关系来绕，也不能拿制度当借口不管人。”他把笔放到你面前，“今天你划的边界，我会支持；但代价也要写你的名字。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.6-decide',
  },
  {
    id: 's2-2.6-partner-chenyi', chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: '辰逸的追问', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'chenyi', portrait: 'chenyi',
    text: '辰逸把手机扣在桌上：“群里都在等一句能听懂的话。你要守组织，我陪你扛；你要让步，也告诉我让到哪里。”他没有移开视线，“别只给评议席答案，把我们留在猜测里。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.6-decide',
  },
  {
    id: 's2-2.6-partner-swordheart', chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: '剑心的名单', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'swordheart', portrait: 'swordheart',
    text: '剑心把排班表递给你：“这里每个名字后面都有一周的时间，不是空位。”她指了指联合计划，“要交人就说清轮换和回来的日期；说不清，我宁可这轮少拿资源。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.6-decide',
  },
  {
    id: 's2-2.6-partner-heartbeat', chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: '心跳成瘾的提醒', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'heartbeat', portrait: 'heartbeat',
    text: '心跳成瘾把出勤图关掉：“图上只看得见谁来了，看不见谁是硬撑着来的。”他把空白页翻到你面前，“你可以算组织收益，但别把人的信任当成自动续期。今天至少留一条让他们能回头的路。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.6-decide',
  },
  {
    id: 's2-2.6-partner-yanqiu', chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: '砚秋水的例外', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '砚秋水把尺压在统一标准那一栏：“规则可以统一，例外必须留下申诉入口。”她抬眼看你，“你若只守组织，我会问谁来承担被规则刮伤的人；你若只顾人情，我会问这把尺以后还算不算数。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.6-decide',
  },
  {
    id: 's2-2.6-partner-huayue', chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: '华月的账页', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'huayue', portrait: 'huayue',
    text: '华月把预算表翻到最后一页：“能换回来的资源我算过，补不上成员之间那条裂缝。”她用指节轻敲合计栏，“你可以选收益，也可以选信任。只是别把其中一项写成免费。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.6-decide',
  },
  {
    id: 's2-2.6-partner-wenxian', chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: '温陷的离线消息', location: '私聊 · 离线留言', mode: 'chat', speaker: 'wenxian', portrait: 'wenxian',
    text: '温陷退游后很少再上线。这次她看完你传去的议程，只回了一段语音：“我已经不能替五组开门，但我知道把钥匙交出去意味着什么。你替现在的人做决定，别拿我们的关系当一张自动同意票。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.6-decide',
  },
  {
    id: 's2-2.6-partner-takemehand', chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: '带我一个的名额', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'takemehand', portrait: 'takemehand',
    text: '带我一个看着抽调名单，忽然笑了一下：“我以前最怕自己只是别人顺手收下的名额。”他把名单推回去，“今天别为了证明组织有用，又把谁变成一张能交出去的票。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.6-decide',
  },
  {
    id: 's2-2.6-partner-xilufei', chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: '希露菲的许可', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'xilufei', portrait: 'xilufei',
    text: '希露菲把“统一权限”四个字圈起来：“他们会说只是借用，直到所有人习惯不再问许可。”她靠回椅背，“你要合作就把权限期限写死。别因为我站你这边，就假装我不会介意你替我答应。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.6-decide',
  },
  {
    id: 's2-2.6-partner-yyt', chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: 'yyT的异议', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'yyt', portrait: 'yyt',
    text: 'yyT把反对票压在掌心：“我反对这套方案，不等于反对你。”他看着你，“你若要组织先赢，我会继续反对；你若为关系让步，我也不会假装那就是正确。我们之间要能容得下这两件事同时成立。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.6-decide',
  },
  {
    id: 's2-2.6-partner-avucii', chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: 'AVUCII的映射', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: 'AVUCII在纸上画出三条箭头：“组织优先，损耗落在信任；关系优先，损耗落在权限。两种都能运行，但不能假设损耗为零。”他把笔递给你，“选一个，然后把补偿机制一起写进去。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.6-decide',
  },

  // ───────── 关系压力场景：无伴侣存档由老朋友持有对立立场 ─────────
  {
    id: 's2-2.6-relation',
    chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: '对立的关切',
    location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'mentor', portrait: 'mentor',
    text: '老朋友把手机屏幕转向你，上面是一张手算的账：“全面配合，组织拿评议加分，还有额外的协调资源。”他划到下一页，“代价在这——你得压着你的人让步。”他把手机收回去，“跟你走到现在的人，会怎么看这个决定？账我只负责算。选，你来。”',
    background: 'warRoom', historical: 'fictional',
    next: 's2-2.6-decide',
  },

  // ───────── 核心选择：组织优先 vs 关系优先 ─────────
  {
    id: 's2-2.6-decide',
    chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: '你的排序',
    location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'player',
    text: '所有人的眼睛都落在你身上。协调席上，你要么为组织的利益拿下这一票——要么为那些跟你走到现在的人，把计划往回拨一寸。这两边的分量，只能你来掂。',
    background: 'warRoom', historical: 'fictional',
    choices: [
      {
        id: 's2-2.6-org-priority',
        label: '「组织立场不能动摇。」',
        tone: 'bold',
        detail: '在协调席坚持组织核心诉求，联合计划可以谈但底线不让。',
        effects: [
          { type: 'variable', key: 's2PressureStance', value: 'org-first' },
          { type: 'flag', key: 's2OrgFirst' },
          { type: 'stat', key: 'cohesion', operation: 'add', value: 3 },
          { type: 'stat', key: 'reputation', operation: 'add', value: 2 },
          { type: 'activePartnerRelationship', key: 'trust', value: -2, fallbackCharacter: 'mentor' },
        ],
        next: 's2-2.6-result-org',
      },
      {
        id: 's2-2.6-rel-priority',
        label: '「先把人稳住，方案可以谈。」',
        tone: 'warm',
        detail: '在方案中主动让步以保护伙伴网络与内部信任。',
        effects: [
          { type: 'variable', key: 's2PressureStance', value: 'rel-first' },
          { type: 'flag', key: 's2RelFirst' },
          { type: 'stat', key: 'cohesion', operation: 'add', value: 1 },
          { type: 'stat', key: 'resources', operation: 'add', value: -2 },
          { type: 'activePartnerRelationship', key: 'trust', value: 2, fallbackCharacter: 'mentor' },
        ],
        next: 's2-2.6-result-rel',
      },
    ],
  },

  // ───────── 后果展示：组织优先 ─────────
  {
    id: 's2-2.6-result-org',
    chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: '底线之上',
    location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'bottle', portrait: 'bottle',
    text: '一轮谈完，你没退一步。瓶在散会时跟上来，声音压得很低：“底线顶住了，漂亮。”他顿了顿，“但你看见没有——刚才你表态的时候，平时最挺你的那两个人，一个低头记笔记，一个看窗外。”他拍拍你肩膀，“门守住了。门里凉了几分，自己想办法暖回来。”',
    background: 'warRoom', historical: 'fictional',
    next: {
      type: 'conditional',
      cases: [
        { when: { type: 'route', value: 'org2' }, next: 's2-2.6-org2-result-org' },
        { when: { type: 'route', value: 'org3' }, next: 's2-2.6-org3-result-org' },
        { when: { type: 'route', value: 'org4' }, next: 's2-2.6-org4-result-org' },
        { when: { type: 'route', value: 'org5' }, next: 's2-2.6-org5-result-org' },
        { when: { type: 'route', value: 'org6' }, next: 's2-2.6-org6-result-org' },
      ],
      fallback: 's2-2.6-closing',
    },
  },

  // ───────── 后果展示：关系优先 ─────────
  {
    id: 's2-2.6-result-rel',
    chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: '回头的人',
    location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'mentor', portrait: 'mentor',
    text: '老朋友明明就走在你旁边，还是给你发了消息：“你把方案往回拨了一寸，为的是身边的人。他们看到了，也看懂了——这一寸不是软弱，是算过轻重的。”隔了几秒又来一条，“但桌上其他人也看到了：你有软肋。下一次，他们会瞄准这里打。提前想好怎么接。”',
    background: 'warRoom', historical: 'fictional',
    next: {
      type: 'conditional',
      cases: [
        { when: { type: 'route', value: 'org2' }, next: 's2-2.6-org2-result-rel' },
        { when: { type: 'route', value: 'org3' }, next: 's2-2.6-org3-result-rel' },
        { when: { type: 'route', value: 'org4' }, next: 's2-2.6-org4-result-rel' },
        { when: { type: 'route', value: 'org5' }, next: 's2-2.6-org5-result-rel' },
        { when: { type: 'route', value: 'org6' }, next: 's2-2.6-org6-result-rel' },
      ],
      fallback: 's2-2.6-closing',
    },
  },

  // 路线会议产物会作为 2.7 的危机证据继续使用。
  {
    id: 's2-2.6-org2-result-org', chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: '抽调案搁置', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'shana', portrait: 'shana',
    text: '表决结果写得很清楚：二组骨干抽调案暂缓一轮，代价是二组退出本月联合资源加成。夏娜把回执折好：“人留下了。资源缺口，我回去和你一起补。”',
    background: 'warRoom', historical: 'fictional', onEnter: [{ type: 'variable', key: 's2MeetingArtifact', value: 'org2-extraction-suspended' }], next: 's2-2.6-closing',
  },
  {
    id: 's2-2.6-org2-result-rel', chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: '抽调设限', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'shana', portrait: 'shana',
    text: '二组接受一名短期轮换，换来“自愿、七日、原岗返回”三条限制。夏娜在名单旁签字：“不是全赢，但至少每个被写上去的人，都知道什么时候回来。”',
    background: 'warRoom', historical: 'fictional', onEnter: [{ type: 'variable', key: 's2MeetingArtifact', value: 'org2-extraction-capped' }], next: 's2-2.6-closing',
  },
  {
    id: 's2-2.6-org3-result-org', chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: '旧账封存', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'truth', portrait: 'truth',
    text: '三组拒绝公开历史明细，只提交本季汇总。评议席在记录上写下“证据不足，待复核”。真理收起原始表：“旧账没被搬上桌，但这一行红字会跟到下次。”',
    background: 'warRoom', historical: 'fictional', onEnter: [{ type: 'variable', key: 's2MeetingArtifact', value: 'org3-records-sealed' }], next: 's2-2.6-closing',
  },
  {
    id: 's2-2.6-org3-result-rel', chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: '限定公开', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'truth', portrait: 'truth',
    text: '三组同意公开本季数据，但旧记录只允许评议员现场查阅，不得转发。真理在权限栏画了框：“门开了一条缝。接下来要守的是谁能从这条缝里伸手。”',
    background: 'warRoom', historical: 'fictional', onEnter: [{ type: 'variable', key: 's2MeetingArtifact', value: 'org3-records-limited' }], next: 's2-2.6-closing',
  },
  {
    id: 's2-2.6-org4-result-org', chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: '标准拆分', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '统一标准被拆成基础线与精英附加线，四组保住自己的门槛，也失去部分统一奖励。砚秋水把两把尺并排放好：“至少他们承认，不同的东西不能只用一把尺量。”',
    background: 'warRoom', historical: 'fictional', onEnter: [{ type: 'variable', key: 's2MeetingArtifact', value: 'org4-standard-split' }], next: 's2-2.6-closing',
  },
  {
    id: 's2-2.6-org4-result-rel', chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: '申诉条款', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '四组接受统一标准，换来一次公开申诉和一轮加赛复核。砚秋水在附录上签名：“尺暂时共用，但被量错的人还有地方开口。”',
    background: 'warRoom', historical: 'fictional', onEnter: [{ type: 'variable', key: 's2MeetingArtifact', value: 'org4-standard-appeal' }], next: 's2-2.6-closing',
  },
  {
    id: 's2-2.6-org5-result-org', chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: '日程封闭', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'jianwen', portrait: 'jianwen',
    text: '五组拒绝交出内部日程，只承诺在联合行动前二十四小时报可用席位。剑问白玉京收回钥匙：“门还在留下的人手里。代价是以后每一次合作，都要自己去敲门。”',
    background: 'warRoom', historical: 'fictional', onEnter: [{ type: 'variable', key: 's2MeetingArtifact', value: 'org5-schedule-closed' }], next: 's2-2.6-closing',
  },
  {
    id: 's2-2.6-org5-result-rel', chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: '预约窗口', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'jianwen', portrait: 'jianwen',
    text: '五组开放两个固定协调窗口，窗口外的日程仍不公开。剑问白玉京把钥匙收进袖口：“他们能在约好的时候进门，但不能顺手翻我们的抽屉。”',
    background: 'warRoom', historical: 'fictional', onEnter: [{ type: 'variable', key: 's2MeetingArtifact', value: 'org5-schedule-window' }], next: 's2-2.6-closing',
  },
  {
    id: 's2-2.6-org6-result-org', chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: '独立席位', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: '六组拒绝以“观察成员”身份并席，换来一张独立席位和三个月无表决权的代价。AVUCII在章程边写下结果：“坐标确认。权限延迟，但身份不再借用别人。”',
    background: 'warRoom', historical: 'fictional', onEnter: [{ type: 'variable', key: 's2MeetingArtifact', value: 'org6-seat-independent' }], next: 's2-2.6-closing',
  },
  {
    id: 's2-2.6-org6-result-rel', chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: '临时席位', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: '六组接受一季临时席位，立刻获得表决权，身份在季末复核。AVUCII把期限写进正文：“先取得接口，再争取永久权限。前提是我们记得这不是终点。”',
    background: 'warRoom', historical: 'fictional', onEnter: [{ type: 'variable', key: 's2MeetingArtifact', value: 'org6-seat-provisional' }], next: 's2-2.6-closing',
  },

  // ───────── 收束：关闭当前冲突，指向 2.7 ─────────
  {
    id: 's2-2.6-closing',
    chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: '散会之后',
    location: '4945区 · 联合活动室', mode: 'novel',
    speaker: 'narrator',
    text: '散会后，你在评议厅门口站了一会儿。厅里的人三三两两散开，有人刻意绕开你，也有人刻意路过你。第一次正式交锋结束了——你排出了次序，也被所有人看见了次序。下一次的浪更大。你今天护住的那一边还撑不撑得住，只有你知道答案。',
    background: 'aftermath', historical: 'fictional',
    next: 's2-2.6-exit',
  },

  // ───────── 完成哨兵 ─────────
  {
    id: 's2-2.6-exit',
    chapter: 'act1', actLabel: '事件二 · 压力交汇', date: '2026-10-03',
    title: '2.6 · 完',
    location: '4945区 · 联合评议厅', mode: 'system',
    speaker: 'system',
    text: '（组织与关系压力交汇 · 收束。）',
    background: 'aftermath', historical: 'fictional',
  },
]
