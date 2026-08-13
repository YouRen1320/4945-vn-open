import type { StoryNode } from '@/engine/types'

// 2.3 事件二 · 新局势成形（SOL-PLAN-2.3 §3）。
//
// 承接序章形成的第一个明确目标（作为所在组织的联合评议代表，给出公开表态），
// 执行「准备联合自评」这一行动，并以行动而非资料墙展示事件二核心约束：
//   - 维护所在组织立场（route）；
//   - 不破坏既有跨组织关系（s1-cross-org-tie / 伴侣）。
// 两个优先事项不能同时完全满足；玩家选择第一种应对方式并立即看到局部结果。
// 每条活跃路线（org2..org6）具备独立立场与代价，通往 2.4 分歧点的合法出口。
//
// 全部复用既有背景/立绘，未新增任何 CharacterId / 路线 / 托管视觉；historical 标 fictional。
// 继承字段按 S2-INHERITANCE-CONTRACT.md 分级：route/org/伴侣为 structural，措辞为 flavor。

export const S2_2_3_ENTRY = 's2-2.3-entry'
export const S2_2_3_COMPLETION = 's2-2.3-exit'

export const s2_2_3_Nodes: StoryNode[] = [
  // ───────────────────── 共通主干：从序章结果进入，不重复开局 ─────────────────────
  {
    id: 's2-2.3-entry',
    chapter: 'act1',
    actLabel: '事件二 · 新局势成形',
    date: '2026-09-12',
    title: '联合自评',
    location: '4945区 · 联合活动室',
    mode: 'novel',
    speaker: 'narrator',
    text: '评议的倒计时压到了第一周。你摊开代表名录，发现这次「联合自评」并不只是填表——它要各组织公开说明彼此的边界与协作。序章你接下的那个目标，现在要从纸面落到桌面上。',
    background: 'organization',
    historical: 'fictional',
    next: 's2-2.3-common',
  },

  // 共通：展示核心约束——两个不能同时完全满足的优先事项
  {
    id: 's2-2.3-common',
    chapter: 'act1',
    actLabel: '事件二 · 新局势成形',
    date: '2026-09-12',
    title: '两难',
    location: '4945区 · 联合活动室',
    mode: 'chat',
    speaker: 'bottle', portrait: 'bottle',
    text: '顶级奶瓶把一张空白自评表拍在你面前，自己先占了个座：“说白了就两件事。一，把咱自家立场写清楚，别让人拿捏；二，别把以前一起扛过事的人，写成对手。”他拿笔在表上点了两下，“这两件事，写顺了一件，另一件就硌得慌。你先想好——这页怎么落笔。”',
    background: 'warRoom',
    historical: 'fictional',
    next: {
      type: 'conditional',
      cases: [
        { when: { type: 'route', value: 'org2' }, next: 's2-2.3-org2' },
        { when: { type: 'route', value: 'org3' }, next: 's2-2.3-org3' },
        { when: { type: 'route', value: 'org4' }, next: 's2-2.3-org4' },
        { when: { type: 'route', value: 'org5' }, next: 's2-2.3-org5' },
        { when: { type: 'route', value: 'org6' }, next: 's2-2.3-org6' },
      ],
      fallback: 's2-2.3-org2',
    },
  },

  // ───────── 路线同期变体：每条路线独立立场 + 不同代价 ─────────
  {
    id: 's2-2.3-org2',
    chapter: 'act1', actLabel: '事件二 · 新局势成形', date: '2026-09-12',
    title: '二组的重量', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'mentor', portrait: 'mentor',
    text: '老朋友把二组的内部议程转给你，附了句“辛苦”：“这页自评要护住什么，你比谁都清楚。”第二条消息隔了一会才来，“提醒一句：砚秋的四组，当年和你们一起顶过北岸的场子。二组写得太硬，四组嘴上不说，心里会记。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.3-choice',
  },
  {
    id: 's2-2.3-org3',
    chapter: 'act1', actLabel: '事件二 · 新局势成形', date: '2026-09-12',
    title: '三组的余地', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'truth', portrait: 'truth',
    text: '真理把虚妄月华的新名单压在自评表下面：“路人K和大古刚从二组过来，外面已经有人把整次重组写成吞并。”她指了指空白栏，“写得太圆，他们会说三组在洗历史；写得太硬，又会把新成员当证据。事实先分开，立场再由你写。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.3-choice',
  },
  // 8 月已确认的新首领负责拍板；旧角色仍承担制度与执行解说。
  {
    id: 's2-2.3-org4',
    chapter: 'act1', actLabel: '事件二 · 新局势成形', date: '2026-09-12',
    title: '四组的旧账', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'yanqiu', portrait: 'yanqiu',
    text: '“水立组那笔旧账，评议那边可都记着。”砚秋水把你的草稿转了个方向，指着其中一行，“四组这回要的不是赢，是别被当成麻烦。”她顿了顿，“你若肯替我们说这句话——二组那边的人情，你自己掂量着还。我不催。我只记账。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.3-org4-leader',
  },
  {
    id: 's2-2.3-org4-leader',
    chapter: 'act1', actLabel: '事件二 · 新局势成形', date: '2026-09-12',
    title: '首领签字', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'tiesuiya', portrait: 'tiesuiya',
    text: '铁碎牙看完砚秋水划出的几行，在四组席位后签下名字：“制度和旧账由她说清。最后需要首领确认的东西，由我签。别把这两件事混在一起。”',
    background: 'warRoom', historical: 'adapted', next: 's2-2.3-choice',
  },
  {
    id: 's2-2.3-org5',
    chapter: 'act1', actLabel: '事件二 · 新局势成形', date: '2026-09-12',
    title: '五组的记性', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'jianwen', portrait: 'jianwen',
    text: '“温陷退了，不等于心之所向没有记性。”剑问白玉京把一杯热茶推到你手边，“这页自评别替离开的人说话，也别假装留下的人没有立场。你写明白，我们就按现在的名单站你这边。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.3-org5-leader',
  },
  {
    id: 's2-2.3-org5-leader',
    chapter: 'act1', actLabel: '事件二 · 新局势成形', date: '2026-09-12',
    title: '现在的五组', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'kunxing', portrait: 'kunxing',
    text: '困醒把剑问白玉京的值班表和五组席卡放在一起：“日常、外联由他继续做；需要首领拍板的决定，由我承担。这页写的是现在的心之所向，不是请已经退游的人回来替我们作证。”',
    background: 'warRoom', historical: 'adapted', next: 's2-2.3-choice',
  },
  {
    id: 's2-2.3-org6',
    chapter: 'act1', actLabel: '事件二 · 新局势成形', date: '2026-09-12',
    title: '六组的来路', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'player',
    text: '六组是你一手立起来的，这页自评写轻了像心虚，写重了又像要压过其他组织。你比谁都清楚：这席位是事件一一步步挣来的，事件二得用它护住也约束住自己。',
    background: 'warRoom', historical: 'fictional', next: 's2-2.3-choice',
  },

  // ───────── 玩家第一个有效选择：应对方式 + 即时结果 ─────────
  {
    id: 's2-2.3-choice',
    chapter: 'act1',
    actLabel: '事件二 · 新局势成形',
    date: '2026-09-12',
    title: '这一页怎么写',
    location: '4945区 · 联合活动室',
    mode: 'chat',
    speaker: 'player',
    text: '笔停在纸面上。你打算怎么落这一页？',
    background: 'warRoom', historical: 'fictional',
    choices: [
      {
        id: 's2-2.3-assert',
        label: '“先把立场写足，再留一句协作的活口。”',
        tone: 'bold',
        detail: '把所在组织的边界写得清楚，给跨组织协作留一个模糊的余地。',
        effects: [
          { type: 'variable', key: 's2Stance', value: 'assert' },
          { type: 'relationship', character: 'mentor', key: 'trust', value: 1 },
        ],
        next: 's2-2.3-result-assert',
      },
      {
        id: 's2-2.3-balance',
        label: '“先铺协作，再轻点立场。”',
        tone: 'calm',
        detail: '把跨组织关系放在前，组织立场写得克制，避免把旧伙伴写成对手。',
        effects: [
          { type: 'variable', key: 's2Stance', value: 'balance' },
          { type: 'flag', key: 's2KeptTies' },
        ],
        next: 's2-2.3-result-balance',
      },
    ],
  },
  {
    id: 's2-2.3-result-assert',
    chapter: 'act1', actLabel: '事件二 · 新局势成形', date: '2026-09-12',
    title: '硬的一手', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'bottle', portrait: 'bottle',
    text: '“立场够硬，咱自家的人今晚能睡踏实。”瓶把你的草稿举起来对着灯，指着末尾那句「协作余地」，“就是这句，写虚了。砚秋那帮人，一眼看得出你在留后手。”他把纸放下，“留后手不是错。可这口气迟早要还——你记着账就行。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.3-closing',
  },
  {
    id: 's2-2.3-result-balance',
    chapter: 'act1', actLabel: '事件二 · 新局势成形', date: '2026-09-12',
    title: '软的一手', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'mentor', portrait: 'mentor',
    text: '老朋友读完，先给你点了个赞，又撤回，改成一句：“协作写在前头，旧伙伴的脸面是保住了。”下一条紧跟着来，“但立场收着写，评议那帮人未必买账。你欠下的硬话，后面只会更多——攒着吧，迟早要一口气说完。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.3-closing',
  },

  // ───────── 收束：明确压力被缓解/转移/加重，并指向 2.4 ─────────
  {
    id: 's2-2.3-closing',
    chapter: 'act1',
    actLabel: '事件二 · 新局势成形',
    date: '2026-09-12',
    title: '落笔',
    location: '4945区 · 联合活动室',
    mode: 'novel',
    speaker: 'narrator',
    text: '草稿落在桌上，墨迹还没干。活动室里的人来了又走，没人问你写了什么——但每个人路过那张桌子，脚步都慢了半拍。下一回，评议现场会逼你把这页纸真正念出口。到那时，选择才到期。',
    background: 'aftermath', historical: 'fictional',
    next: 's2-2.3-exit',
  },

  // ───────── 完成哨兵：标记 episode 完成并返回季/集中心 ─────────
  {
    id: 's2-2.3-exit',
    chapter: 'act1',
    actLabel: '事件二 · 新局势成形',
    date: '2026-09-12',
    title: '2.3 · 完',
    location: '4945区 · 联合活动室',
    mode: 'system',
    speaker: 'system',
    text: '（新局势成形 · 收束。）',
    background: 'aftermath', historical: 'fictional',
  },
]
