import type { StoryNode } from '@/engine/types'

// 2.4 事件二 · 首次实质分歧（SOL-PLAN-2.4）。
//
// 承接 2.3 形成的选择（s2Stance: assert / balance），在「联合评议现场」让该选择到期：
// 玩家首次对事件二推进方式作出实质分歧——是硬刚到底（confront）还是拉起跨组织联盟（coalition）。
// 分歧改变「合作对象 / 承担代价」至少一项，并且持久状态 s2Diverge 延续到 2.5 回收。
//
// 路线同期变体（org2..org6）只修饰评议处境（flavor/scene），歧文本质共通，避免分支爆炸；
// 两条 structural 分支（confront / coalition）均有即时结果并登记持久状态，可完整测试。
// 全部复用既有背景/立绘，未新增任何 CharacterId / 路线 / 托管视觉；historical 标 fictional。

export const S2_2_4_ENTRY = 's2-2.4-entry'
export const S2_2_4_COMPLETION = 's2-2.4-exit'

export const s2_2_4_Nodes: StoryNode[] = [
  // ───────── 评议现场开场：2.3 的 stance 到期，收到不同反应 ─────────
  {
    id: 's2-2.4-entry',
    chapter: 'act1',
    actLabel: '事件二 · 首次实质分歧',
    date: '2026-09-19',
    title: '评议现场',
    location: '4945区 · 联合评议厅',
    mode: 'novel',
    speaker: 'narrator',
    text: '联合评议的日子到了。你攥着那页自评，走进挂满各组织牌子的评议厅。序章你接下的代表名头、2.3 你落下的那笔——今天都得念出口。',
    background: 'warRoom',
    historical: 'fictional',
    next: {
      type: 'conditional',
      cases: [
        { when: { type: 'variable', key: 's2Stance', operator: 'eq', value: 'assert' }, next: 's2-2.4-stance-assert' },
        { when: { type: 'variable', key: 's2Stance', operator: 'eq', value: 'balance' }, next: 's2-2.4-stance-balance' },
      ],
      fallback: 's2-2.4-stance-assert',
    },
  },
  {
    id: 's2-2.4-stance-assert',
    chapter: 'act1', actLabel: '事件二 · 首次实质分歧', date: '2026-09-19',
    title: '被盯着的开场', location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'bottle', portrait: 'bottle',
    text: '“你那页写得硬，厅里一半人都在看你。”瓶凑过来，声音压低，“砚秋那帮人没说话。”他朝那边抬了抬下巴，“不说是最麻烦的。等下圆场的词，你自己备着——我不替你想。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.4-common',
  },
  {
    id: 's2-2.4-stance-balance',
    chapter: 'act1', actLabel: '事件二 · 首次实质分歧', date: '2026-09-19',
    title: '被买账的开场', location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'mentor', portrait: 'mentor',
    text: '老朋友从前排回头，冲你比了个大拇指：“评议那几位点头了，我亲眼看见的。”他顿了顿，朝斜对面努嘴，“但那位硬派代表，眉头皱得能夹纸。太软的稿子，他们迟早逼你表态——硬话先备好，别现想。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.4-common',
  },

  // ───────── 共通：把两难转化为可行动选择，说明代价 ─────────
  {
    id: 's2-2.4-common',
    chapter: 'act1', actLabel: '事件二 · 首次实质分歧', date: '2026-09-19',
    title: '怎么念这一页',
    location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'yanqiu', portrait: 'yanqiu',
    text: '“念稿谁都会。”砚秋水坐在你旁边，手指在桌面上轻轻敲着，“难的是念完。”她抬眼，“一个人扛下所有反对声，还是把愿意对口径的组织拉起来——这两手的后果，写在不同的账本上。你先想好，翻哪本。”',
    background: 'warRoom', historical: 'fictional',
    next: {
      type: 'conditional',
      cases: [
        { when: { type: 'route', value: 'org2' }, next: 's2-2.4-org2' },
        { when: { type: 'route', value: 'org3' }, next: 's2-2.4-org3' },
        { when: { type: 'route', value: 'org4' }, next: 's2-2.4-org4' },
        { when: { type: 'route', value: 'org5' }, next: 's2-2.4-org5' },
        { when: { type: 'route', value: 'org6' }, next: 's2-2.4-org6' },
      ],
      fallback: 's2-2.4-org2',
    },
  },

  // ───────── 路线同期变体：评议处境差异（修饰，非替换分歧） ─────────
  {
    id: 's2-2.4-org2',
    chapter: 'act1', actLabel: '事件二 · 首次实质分歧', date: '2026-09-19',
    title: '二组的牌', location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'mentor', portrait: 'mentor',
    text: '老朋友发来现场直播：“二组的人全在台下，脖子伸得比谁都长。”下一条紧跟着，“你拉联盟，二组就是天然牵头；你硬扛——他们就得跟你一起接明枪。今天他们的眼神，归你管。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.4-diverge',
  },
  {
    id: 's2-2.4-org3',
    chapter: 'act1', actLabel: '事件二 · 首次实质分歧', date: '2026-09-19',
    title: '三组的夹缝', location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'truth', portrait: 'truth',
    text: '真理朝虚妄月华的席位看了一眼：“路人K接任以后，第一份公开文件不能把转组写成污点，也不能拿它换同情。你拉联盟，我们会要求各组统一使用成员级流向；你硬扛，三组就单独公开自己的原表。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.4-diverge',
  },
  {
    id: 's2-2.4-org4',
    chapter: 'act1', actLabel: '事件二 · 首次实质分歧', date: '2026-09-19',
    title: '四组的旧账', location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'yanqiu', portrait: 'yanqiu',
    text: '“四组要的不多：不被当成麻烦。”砚秋水伸手把你翘起来的稿角抚平，“你拉联盟，我第一个跟你，条件回去再谈。”她收回手，“你硬扛——四组只能自己护自己。账我记下了。两种，都记。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.4-diverge',
  },
  {
    id: 's2-2.4-org5',
    chapter: 'act1', actLabel: '事件二 · 首次实质分歧', date: '2026-09-19',
    title: '五组的记性', location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'jianwen', portrait: 'jianwen',
    text: '“心之所向刚换过名字，也刚送走首领。”剑问白玉京把五组的席卡扶正，“你拉联盟，我们要一个不会被当成空壳的位置；你硬扛，我们自己留灯。别借温陷的名字替我们下注。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.4-diverge',
  },
  {
    id: 's2-2.4-org6',
    chapter: 'act1', actLabel: '事件二 · 首次实质分歧', date: '2026-09-19',
    title: '六组的席位', location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'player',
    text: '六组的席位是你自己挣来的。你拉联盟，它是新局面的桌角；你硬扛，它就得独自顶住所有压力。台上的灯太亮，你眯了眯眼——这张桌子上，还缺一条你的规矩。',
    background: 'warRoom', historical: 'fictional', next: 's2-2.4-diverge',
  },

  // ───────── 实质分歧：confront 硬扛 vs coalition 拉联盟（structural 分支） ─────────
  {
    id: 's2-2.4-diverge',
    chapter: 'act1', actLabel: '事件二 · 首次实质分歧', date: '2026-09-19',
    title: '你的推进方式',
    location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'player',
    text: '稿子摊在桌上。你决定以什么方式把这页念出口、把这一季带向哪边？',
    background: 'warRoom', historical: 'fictional',
    choices: [
      {
        id: 's2-2.4-confront',
        label: '“一个人扛下所有反对声。”',
        tone: 'bold',
        detail: '代表所在组织硬碰硬，不依赖外部联盟，代价是自己接下全部压力。',
        effects: [
          { type: 'variable', key: 's2Diverge', value: 'confront' },
          { type: 'relationship', character: 'mentor', key: 'trust', value: 1 },
          { type: 'flag', key: 's2WentConfront' },
        ],
        next: 's2-2.4-result-confront',
      },
      {
        id: 's2-2.4-coalition',
        label: '“把愿意对口径的组织拉起来。”',
        tone: 'calm',
        detail: '牵头跨组织联盟共同表态，代价是得平衡多方立场、让渡部分主导权。',
        effects: [
          { type: 'variable', key: 's2Diverge', value: 'coalition' },
          { type: 'flag', key: 's2WentCoalition' },
        ],
        next: 's2-2.4-result-coalition',
      },
    ],
  },
  {
    id: 's2-2.4-result-confront',
    chapter: 'act1', actLabel: '事件二 · 首次实质分歧', date: '2026-09-19',
    title: '硬扛的回响', location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'bottle', portrait: 'bottle',
    text: '反对声被你一个人接完，台下安静得有点刺耳。散场的人流里，瓶挤过来，把一瓶水塞进你手里：“扛住了。”他难得没开玩笑，“但往后每一场硬仗，你都得第一个上。水拿着——以后口渴的日子多。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.4-closing',
  },
  {
    id: 's2-2.4-result-coalition',
    chapter: 'act1', actLabel: '事件二 · 首次实质分歧', date: '2026-09-19',
    title: '联盟的雏形', location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'yanqiu', portrait: 'yanqiu',
    text: '散场时，砚秋水把几家的签名页理成一小叠，递给你：“你肯拉人，这事就不止是你一个组织的事了。”她点了点那叠纸，“联盟刚起，话事权几家分。但比你一个人扛——”她难得地弯了下嘴角，“这局，稳。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.4-closing',
  },

  // ───────── 收束：选择已改变局面，持久状态留给 2.5 ─────────
  {
    id: 's2-2.4-closing',
    chapter: 'act1', actLabel: '事件二 · 首次实质分歧', date: '2026-09-19',
    title: '落槌',
    location: '4945区 · 联合评议厅', mode: 'novel',
    speaker: 'narrator',
    text: '评议的槌落下，厅里的人潮往外涌，议论声分成两股：一股在复述你念的那页，一股在打探你接下来站哪边。你把自评折好收进内袋——从这一刻起，你不只是接了名头的代表，是选过边的人。中点还远，但代价已经上路了。',
    background: 'aftermath', historical: 'fictional',
    next: 's2-2.4-exit',
  },

  // ───────── 完成哨兵 ─────────
  {
    id: 's2-2.4-exit',
    chapter: 'act1', actLabel: '事件二 · 首次实质分歧', date: '2026-09-19',
    title: '2.4 · 完',
    location: '4945区 · 联合评议厅', mode: 'system',
    speaker: 'system',
    text: '（首次实质分歧 · 收束。）',
    background: 'aftermath', historical: 'fictional',
  },
]
