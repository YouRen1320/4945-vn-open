import type { StoryNode } from '@/engine/types'

// 2.5 事件二 · 后果与中点转折（SOL-PLAN-2.5）。
//
// 回收 2.3 的 s2Stance 与 2.4 的 s2Diverge，演出前期选择的真实代价；
// 由既有因果推动一个共享中点事实（评议余波升级为公开对峙），迫使重新排序优先事项，
// 并形成后半季新目标。中点后玩家作一次决策（s2Midpoint），供 2.6 回收。
//
// 全部复用既有背景/立绘，未新增任何 CharacterId / 路线 / 托管视觉；historical 标 fictional。

export const S2_2_5_ENTRY = 's2-2.5-entry'
export const S2_2_5_COMPLETION = 's2-2.5-exit'

export const s2_2_5_Nodes: StoryNode[] = [
  // ───────── 中点前夕：承接前期选择 ─────────
  {
    id: 's2-2.5-entry',
    chapter: 'act1',
    actLabel: '事件二 · 后果与中点',
    date: '2026-09-26',
    title: '余波',
    location: '4945区 · 联合活动室',
    mode: 'novel',
    speaker: 'narrator',
    text: '评议落槌后的第七天，你才发现真正响的不是槌声。是这一周里的小事：走廊上少了一半的招呼，私聊框里多出来的几句「在吗」，还有三条被撤回的消息——撤回的人，你都认得。',
    background: 'organization',
    historical: 'fictional',
    next: {
      type: 'conditional',
      cases: [
        { when: { type: 'variable', key: 's2Diverge', operator: 'eq', value: 'confront' }, next: 's2-2.5-cons-confront' },
        { when: { type: 'variable', key: 's2Diverge', operator: 'eq', value: 'coalition' }, next: 's2-2.5-cons-coalition' },
      ],
      fallback: 's2-2.5-cons-confront',
    },
  },

  // ───────── 后果到达：按 s2Diverge 分流（回收 2.4 选择） ─────────
  {
    id: 's2-2.5-cons-confront',
    chapter: 'act1', actLabel: '事件二 · 后果与中点', date: '2026-09-26',
    title: '独自承压', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'bottle', portrait: 'bottle',
    text: '一罐饮料抛过来，你伸手接住。“你那句『我上』，说得是痛快。”顶级奶瓶靠在门框上，“现在好了，枪都朝你一个人去。你那边想帮你挡的人，被你顶回去不止一次了。”他抬抬下巴，“下次再顶人，先想想谁替你捡东西。”',
    background: 'organization', historical: 'fictional',
    next: 's2-2.5-stance-router',
  },
  {
    id: 's2-2.5-cons-coalition',
    chapter: 'act1', actLabel: '事件二 · 后果与中点', date: '2026-09-26',
    title: '联盟内的博弈', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'yanqiu', portrait: 'yanqiu',
    text: '“联盟成立了，恭喜。附带后果一份，不另收费。”砚秋水在桌上摆出三只茶杯，“四组要话语权，五组要名分，你要主导。杯子只有这么多。”她给自己倒了茶，“别看我。账可以分着算，骂名通常一个人背。”',
    background: 'organization', historical: 'fictional',
    next: 's2-2.5-stance-router',
  },

  // 2.3 的立场必须在中点再次改变现场，而不只停留在存档变量里。
  {
    id: 's2-2.5-stance-router',
    chapter: 'act1', actLabel: '事件二 · 后果与中点', date: '2026-09-26',
    title: '前一页记录', location: '4945区 · 联合活动室', mode: 'system',
    speaker: 'narrator',
    text: '顶级奶瓶把评议记录翻回前一页。你在第一次联合自评里留下的那句话，已经被人用红笔圈了出来。',
    background: 'organization', historical: 'fictional',
    next: {
      type: 'conditional',
      cases: [
        { when: { type: 'variable', key: 's2Stance', operator: 'eq', value: 'assert' }, next: 's2-2.5-stance-assert-echo' },
        { when: { type: 'variable', key: 's2Stance', operator: 'eq', value: 'balance' }, next: 's2-2.5-stance-balance-echo' },
      ],
      fallback: 's2-2.5-stance-unrecorded',
    },
  },
  {
    id: 's2-2.5-stance-assert-echo',
    chapter: 'act1', actLabel: '事件二 · 后果与中点', date: '2026-09-26',
    title: '被圈出的硬话', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'bottle', portrait: 'bottle',
    text: '“你当时说，自己的组织自己负责。”顶级奶瓶点了点那圈红字，“现在每家都拿这句话问你：既然你不让别人替你负责，凭什么让他们替你的决定买单？硬话说出口，后面得有硬结果。”',
    background: 'organization', historical: 'fictional',
    next: {
      type: 'conditional',
      cases: [
        { when: { type: 'route', value: 'org2' }, next: 's2-2.5-org2' },
        { when: { type: 'route', value: 'org3' }, next: 's2-2.5-org3' },
        { when: { type: 'route', value: 'org4' }, next: 's2-2.5-org4' },
        { when: { type: 'route', value: 'org5' }, next: 's2-2.5-org5' },
        { when: { type: 'route', value: 'org6' }, next: 's2-2.5-org6' },
      ],
      fallback: 's2-2.5-org2',
    },
  },
  {
    id: 's2-2.5-stance-balance-echo',
    chapter: 'act1', actLabel: '事件二 · 后果与中点', date: '2026-09-26',
    title: '签名页的代价', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'yanqiu', portrait: 'yanqiu',
    text: '砚秋水把那张联署页推回来：“你当时保住了所有人的签名，所以今天每个人都觉得自己有资格改你的答案。”她用尺压住纸角，“联盟不是大家替你点头。是你答应，分歧也要留在纸上。”',
    background: 'organization', historical: 'fictional',
    next: {
      type: 'conditional',
      cases: [
        { when: { type: 'route', value: 'org2' }, next: 's2-2.5-org2' },
        { when: { type: 'route', value: 'org3' }, next: 's2-2.5-org3' },
        { when: { type: 'route', value: 'org4' }, next: 's2-2.5-org4' },
        { when: { type: 'route', value: 'org5' }, next: 's2-2.5-org5' },
        { when: { type: 'route', value: 'org6' }, next: 's2-2.5-org6' },
      ],
      fallback: 's2-2.5-org2',
    },
  },
  {
    id: 's2-2.5-stance-unrecorded',
    chapter: 'act1', actLabel: '事件二 · 后果与中点', date: '2026-09-26',
    title: '旧记录', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'mentor', portrait: 'mentor',
    text: '老朋友把旧记录合上：“前一页有些地方没写全。没关系，今天发生的事是真的。先把眼前这笔账看清，再决定后半季怎么走。”',
    background: 'organization', historical: 'fictional',
    next: {
      type: 'conditional',
      cases: [
        { when: { type: 'route', value: 'org2' }, next: 's2-2.5-org2' },
        { when: { type: 'route', value: 'org3' }, next: 's2-2.5-org3' },
        { when: { type: 'route', value: 'org4' }, next: 's2-2.5-org4' },
        { when: { type: 'route', value: 'org5' }, next: 's2-2.5-org5' },
        { when: { type: 'route', value: 'org6' }, next: 's2-2.5-org6' },
      ],
      fallback: 's2-2.5-org2',
    },
  },

  // ───────── 路线同期变体：不同代价（回收的可见结果） ─────────
  {
    id: 's2-2.5-org2',
    chapter: 'act1', actLabel: '事件二 · 后果与中点', date: '2026-09-26',
    title: '二组的处境', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'mentor', portrait: 'mentor',
    text: '老朋友的消息比平时晚了两小时：“说个事。昨天群里排要塞班，有人打了句『首领现在自己都顾不上了』，发出去三秒就撤回。”下一条紧跟着来，“撤回我也看见了。我不评价你选的路——但风是跟着你进群的，你自己得知道。”',
    background: 'organization', historical: 'fictional',
    onEnter: [{ type: 'variable', key: 's2RoutePressure', value: 'member-extraction' }],
    next: 's2-2.5-midpoint',
  },
  {
    id: 's2-2.5-org3',
    chapter: 'act1', actLabel: '事件二 · 后果与中点', date: '2026-09-26',
    title: '三组的处境', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'truth', portrait: 'truth',
    text: '真理把两版成员流向图并排摆开：“外面一版写‘一三合并’，另一版写‘二组成员投奔’。都省略了本人选择。”她把路人K和大古的名字单独圈出，“虚妄月华可以解释自己的成员，不能替所有旧组编一条整齐的故事。”',
    background: 'organization', historical: 'fictional',
    onEnter: [{ type: 'variable', key: 's2RoutePressure', value: 'public-records' }],
    next: 's2-2.5-midpoint',
  },
  {
    id: 's2-2.5-org4',
    chapter: 'act1', actLabel: '事件二 · 后果与中点', date: '2026-09-26',
    title: '四组的处境', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'yanqiu', portrait: 'yanqiu',
    text: '“四组的账本，这周多了一页，页名叫『应急』。”砚秋水把那一页撕下来，推给你看：左边写着“他要是扛不住，四组几时接手最划算”，右边写着“他要是翻了盘，四组几时站过去最体面”。她当着你面把它对折，“我批注了四个字：账可如此，人不可。”',
    background: 'organization', historical: 'fictional',
    onEnter: [{ type: 'variable', key: 's2RoutePressure', value: 'unified-standard' }],
    next: 's2-2.5-midpoint',
  },
  {
    id: 's2-2.5-org5',
    chapter: 'act1', actLabel: '事件二 · 后果与中点', date: '2026-09-26',
    title: '五组的处境', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'jianwen', portrait: 'jianwen',
    text: '“心之所向的灯，这两晚多留了一盏。”剑问白玉京把值班表压在灯座下，“不是等温陷回来，是让留下的人知道还有人接消息。你站哪边我们先不问；谁愿意在退游以后把日常做完，我们会记。”',
    background: 'organization', historical: 'fictional',
    onEnter: [{ type: 'variable', key: 's2RoutePressure', value: 'schedule-access' }],
    next: 's2-2.5-midpoint',
  },
  {
    id: 's2-2.5-org6',
    chapter: 'act1', actLabel: '事件二 · 后果与中点', date: '2026-09-26',
    title: '六组的处境', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'player',
    text: '六组没有元老，没有旧账，章程是你自己写的。所以这几天群里格外安静——没人退群，也没人替你说话。他们都在看：这个从「反对」开始的地方，接下来要把「反对」过成什么样子。',
    background: 'organization', historical: 'fictional',
    onEnter: [{ type: 'variable', key: 's2RoutePressure', value: 'seat-legitimacy' }],
    next: 's2-2.5-midpoint',
  },

  // ───────── 中点转折：共享 canon 中点事实，迫使重新排序优先事项 ─────────
  {
    id: 's2-2.5-midpoint',
    chapter: 'act1', actLabel: '事件二 · 后果与中点', date: '2026-09-26',
    title: '中点',
    location: '4945区 · 联合评议厅', mode: 'system',
    speaker: 'mentor', portrait: 'mentor',
    text: '老朋友把通告转给你，附了三个感叹号。【北岸评议委员会 · 第七号】书面自评阶段终止，改行「联合对峙」：各组织公开立场，并派一名代表入驻新设的联席协调席，发言计入评议记录。他的第二条消息紧跟着到：“翻译一下：以前各写各的检查，以后当面吵。你前半季干过的所有事，都会被搬到那张桌子上，当面念。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.5-respond',
  },

  // ───────── 中点后回应：玩家重新排序优先事项，形成后半季目标 ─────────
  {
    id: 's2-2.5-respond',
    chapter: 'act1', actLabel: '事件二 · 后果与中点', date: '2026-09-26',
    title: '你的后半季',
    location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'player',
    text: '协调席的铭牌还空着，座次已经排开了。前半季欠下的账在左边兜里，后半季想布的局在右边兜里——先顾哪头？',
    background: 'warRoom', historical: 'fictional',
    choices: [
      {
        id: 's2-2.5-guard',
        label: '“先护住自家组织与旧伙伴。”',
        tone: 'calm',
        detail: '后半季优先稳住所在组织立场与既有关系，不轻易为外部协调让渡。',
        effects: [
          { type: 'variable', key: 's2Midpoint', value: 'guard' },
          { type: 'flag', key: 's2MidGuard' },
        ],
        next: 's2-2.5-result-guard',
      },
      {
        id: 's2-2.5-pivot',
        label: '“借协调席把局面翻过来。”',
        tone: 'bold',
        detail: '后半季优先借联席协调席争取主动，承担更大但可能改写局势的风险。',
        effects: [
          { type: 'variable', key: 's2Midpoint', value: 'pivot' },
          { type: 'flag', key: 's2MidPivot' },
        ],
        next: 's2-2.5-result-pivot',
      },
    ],
  },
  {
    id: 's2-2.5-result-guard',
    chapter: 'act1', actLabel: '事件二 · 后果与中点', date: '2026-09-26',
    title: '守成', location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'mentor', portrait: 'mentor',
    text: '老朋友回得很快：“收着打，行。协调席上少说少错，守住自家一亩三分地。”隔了几秒又来一条，“丑话说前头：稳是稳。棋盘上不挪窝的子，有时候是被别人当路标用的。你想清楚这点就行。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.5-closing',
  },
  {
    id: 's2-2.5-result-pivot',
    chapter: 'act1', actLabel: '事件二 · 后果与中点', date: '2026-09-26',
    title: '翻局', location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'bottle', portrait: 'bottle',
    text: '顶级奶瓶听完，难得笑了一声：“哈。协调席的椅子还没坐热，你就想拿它撬桌子。”他把一罐饮料塞进你手里，“后半季不会太平——但方向盘在你手里，不在他们嘴里。”他替你拉开拉环，“喝了。翻局的人，手不能抖。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.5-closing',
  },

  // ───────── 收束：关闭「选择是否产生后果」与「下一步做什么」 ─────────
  {
    id: 's2-2.5-closing',
    chapter: 'act1', actLabel: '事件二 · 后果与中点', date: '2026-09-26',
    title: '转向',
    location: '4945区 · 联合评议厅', mode: 'novel',
    speaker: 'narrator',
    text: '通告还贴在评议厅门口，围观的人换了一拨又一拨。你在人群最后站了一会儿，把铭牌的事、座次的事、明天要先见谁，在心里排了个序。协调席的灯亮到后半夜——后半季，从这盏灯底下开场。',
    background: 'aftermath', historical: 'fictional',
    next: 's2-2.5-exit',
  },

  // ───────── 完成哨兵 ─────────
  {
    id: 's2-2.5-exit',
    chapter: 'act1', actLabel: '事件二 · 后果与中点', date: '2026-09-26',
    title: '2.5 · 完',
    location: '4945区 · 联合评议厅', mode: 'system',
    speaker: 'system',
    text: '（后果与中点 · 收束。）',
    background: 'aftermath', historical: 'fictional',
  },
]
