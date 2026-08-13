import type { StoryNode } from '@/engine/types'

// 2.2 事件二共通序章（SOL-PLAN-2.2 §3；canon 见 docs/season2/S2-CANON.md）。
//
// 完整 episode：入口 → 以受控变体确认「上一季结果被看见」 → 建立事件二日常与关系位置
// → 经确认的扰动（北岸评议）提出公共压力 → 玩家第一个具即时结果的选择 → 形成新目标
// → 局部分裂解决并标记完成，返回季/集中心（s2-prologue-exit 哨兵）。
//
// 全部复用既有背景/立绘，未新增任何 CharacterId / 路线 / 托管视觉；historical 标 fictional。
// 继承字段按 S2-INHERITANCE-CONTRACT.md 分级：route/org/伴侣为 structural，措辞为 flavor。

export const S2_PROLOGUE_ENTRY = 's2-prologue-entry'
export const S2_PROLOGUE_COMPLETION = 's2-prologue-exit'

export const s2PrologueNodes: StoryNode[] = [
  // ───────────────────────── 入口：事件二日常 ─────────────────────────
  {
    id: 's2-prologue-entry',
    chapter: 'prologue',
    actLabel: '事件二共通序章',
    date: '2026-09-05',
    title: '联合活动室',
    location: '4945区 · 联合活动室',
    mode: 'novel',
    speaker: 'narrator',
    text: '暑假过去，4945区多了一间「联合活动室」。各组织的日常仍在继续，只是门口多了一块北岸评议委员会的牌子。你推开活动室的门，空气里还留着事件一收束后的余温。',
    background: 'organization',
    historical: 'fictional',
    next: {
      type: 'conditional',
      cases: [
        { when: { type: 'flag', key: 's1Org1RouteTransfer' }, next: 's2-prologue-seen-org1-transfer' },
        { when: { type: 'route', value: 'org2' }, next: 's2-prologue-seen-org2' },
        { when: { type: 'route', value: 'org3' }, next: 's2-prologue-seen-org3' },
        { when: { type: 'route', value: 'org4' }, next: 's2-prologue-seen-org4' },
        { when: { type: 'route', value: 'org5' }, next: 's2-prologue-seen-org5' },
        { when: { type: 'route', value: 'org6' }, next: 's2-prologue-seen-org6' },
      ],
      fallback: 's2-prologue-seen-org2',
    },
  },

  {
    id: 's2-prologue-seen-org1-transfer',
    chapter: 'prologue', actLabel: '事件二共通序章', date: '2026-09-05',
    title: '第一席之后', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'narrator',
    text: '第一席的经历没有被抹去。你以一组成员的身份完成了事件一，如今带着那份结局走进{{org}}的新席位。旧秩序仍是你的来处，而眼前的选择将决定事件二的方向。',
    background: 'organization', historical: 'fictional', next: 's2-prologue-daily',
  },

  // ───────── 受控 flavor 变体：确认上季结果被看见（不解锁新机制） ─────────
  // 五个 seen-orgN 节点先按路线收束上一季日常；其中 org6/org3/org5 再按 flavor 级
  // durableFact（章程 / 告白转组 / 火2）做散文变体，使序章「记得」上一季具体事件。
  {
    id: 's2-prologue-seen-org2',
    chapter: 'prologue', actLabel: '事件二共通序章', date: '2026-09-05',
    title: '回望', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'narrator', text: '你的杯子还在二组那张桌子的老位置，杯底压着一张要塞排班表——边角都磨圆了，是时留在那的。新学年换了很多东西，没换这张桌子。',
    background: 'organization', historical: 'fictional', next: 's2-prologue-daily',
  },
  {
    id: 's2-prologue-seen-org3',
    chapter: 'prologue', actLabel: '事件二共通序章', date: '2026-09-05',
    title: '回望', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'narrator', text: '虚妄月华的人看见你进来，熟稔地让出半张桌子。路人K接过首领以后，真理把成员流向和新赛季数据分成了两张表——桌上摊着的正是后一张。',
    background: 'organization', historical: 'fictional',
    next: {
      type: 'conditional',
      cases: [{ when: { type: 'flag', key: 's1ConfessionTransferred' }, next: 's2-prologue-recall-confession' }],
      fallback: 's2-prologue-daily',
    },
  },
  {
    id: 's2-prologue-seen-org4',
    chapter: 'prologue', actLabel: '事件二共通序章', date: '2026-09-05',
    title: '回望', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'narrator', text: '砚秋在角落朝你点了下头，手边摊着一本新账册，第一页还空着。四组与五组那段旧账，在秋日的光线里显得远了些——她没提，只把笔递过来，像什么事都还能从第一页记起。',
    background: 'organization', historical: 'fictional', next: 's2-prologue-daily',
  },
  {
    id: 's2-prologue-seen-org5',
    chapter: 'prologue', actLabel: '事件二共通序章', date: '2026-09-05',
    title: '回望', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'narrator', text: '心之所向的人递来一杯你常点的，温度刚好。温陷退游后，靠窗的位置一直空着；剑问白玉京把日常排班放在旁边，没有假装那把椅子从未有人坐过。',
    background: 'organization', historical: 'fictional',
    next: {
      type: 'conditional',
      cases: [{ when: { type: 'flag', key: 's1FireTwo' }, next: 's2-prologue-recall-fire-two' }],
      fallback: 's2-prologue-daily',
    },
  },
  {
    id: 's2-prologue-seen-org6',
    chapter: 'prologue', actLabel: '事件二共通序章', date: '2026-09-05',
    title: '回望', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'narrator', text: '六组那张第六席位，如今贴着你自己的名字。',
    background: 'organization', historical: 'fictional',
    next: {
      type: 'conditional',
      cases: [{ when: { type: 'flag', key: 's1CharterWritten' }, next: 's2-prologue-recall-charter' }],
      fallback: 's2-prologue-daily',
    },
  },

  // ───────── flavor 级回忆变体：上一季具体事件的「被记得」片段（不解锁机制） ─────────
  {
    id: 's2-prologue-recall-charter',
    chapter: 'prologue', actLabel: '事件二共通序章', date: '2026-09-05',
    title: '章程的墨迹', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'narrator',
    text: '桌角还留着当时手写章程的墨迹，擦不掉了——从被创立到立住，那张桌子替你记着每一步。新学期的章程协作页还开着，谁也没去关它。',
    background: 'organization', historical: 'fictional', next: 's2-prologue-daily',
  },
  {
    id: 's2-prologue-recall-confession',
    chapter: 'prologue', actLabel: '事件二共通序章', date: '2026-09-05',
    title: '没人再提的风波', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'narrator',
    text: '事件一那场告白与转组的风波，如今谁也不提——只在给你倒茶的时候，多放了一块糖。有些事收束了，不代表它没发生过；只是没人再拿它当筹码。',
    background: 'organization', historical: 'fictional', next: 's2-prologue-daily',
  },
  {
    id: 's2-prologue-recall-fire-two',
    chapter: 'prologue', actLabel: '事件二共通序章', date: '2026-09-05',
    title: '战报转发过的那口气', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'narrator',
    text: '事件一你替他们扛下的那口气，他们从不说——都记在这种地方。火2的战报早已被转发过太多遍，连截图标题都替人省了问题；现在的桌子，是用那次昂贵的证明换来的。',
    background: 'organization', historical: 'fictional', next: 's2-prologue-daily',
  },

  // ───────── 建立事件二日常与关系位置 ─────────
  {
    id: 's2-prologue-daily',
    chapter: 'prologue', actLabel: '事件二共通序章', date: '2026-09-05',
    title: '新学期', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'bottle', portrait: 'bottle',
    text: '“回来了？”顶级奶瓶靠在门框上，让出半个身位，“暑假各组织都没闲着——现在北岸那帮人，盯上咱们了。”他朝屋里抬抬下巴，“先坐。我慢慢跟你说，这事不小。”',
    background: 'organization', historical: 'fictional', next: 's2-prologue-perturb',
  },

  // ───────── 经确认的扰动：北岸评议委员会 ─────────
  {
    id: 's2-prologue-perturb',
    chapter: 'prologue', actLabel: '事件二共通序章', date: '2026-09-05',
    title: '评议来临', location: '4945区 · 联合活动室', mode: 'system',
    speaker: 'mentor', portrait: 'mentor',
    text: '老朋友把一份红头文件拍在你面前，封面印着「北岸评议委员会 · 第一号」：“翻译一下：各组织要交年度联合自评，结果跟往后的资源分配挂钩。”他往椅背上一靠，“还有件事——他们推举你当你们组织的『联合评议代表』。别看我，票是别人投的。”',
    background: 'warRoom', historical: 'fictional', next: 's2-prologue-choice',
  },

  // ───────── 玩家第一个具即时结果的选择 ─────────
  {
    id: 's2-prologue-choice',
    chapter: 'prologue', actLabel: '事件二共通序章', date: '2026-09-05',
    title: '怎么接', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'player',
    text: '代表的名头落你头上。你打算怎么接这一局？',
    background: 'warRoom', historical: 'fictional',
    choices: [
      {
        id: 's2-prologue-stabilize',
        label: '“先稳住内部，再对外表态。”',
        tone: 'calm',
        detail: '先把所在组织的立场理顺，不急着对外亮底牌。',
        effects: [
          { type: 'variable', key: 's2Stance', value: 'internal' },
          { type: 'relationship', character: 'mentor', key: 'trust', value: 1 },
        ],
        next: 's2-prologue-result-stabilize',
      },
      {
        id: 's2-prologue-lead',
        label: '“主动牵头联合活动室，抢先表态。”',
        tone: 'bold',
        detail: '借联合活动室把各组织拉到一张桌上，抢在评议前定调。',
        effects: [
          { type: 'variable', key: 's2Stance', value: 'lead' },
          { type: 'flag', key: 's2TookLead' },
        ],
        next: 's2-prologue-result-lead',
      },
    ],
  },
  {
    id: 's2-prologue-result-stabilize',
    chapter: 'prologue', actLabel: '事件二共通序章', date: '2026-09-05',
    title: '稳一手', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'mentor', portrait: 'mentor',
    text: '“稳一手，行。”老朋友点点头，抽走你手里半叠文件，“先把自家门口扫干净，外面的风就灌不进来。内部议程我帮你理。”他把文件码齐，“你只管想明白一件事——真要表态那天，你说什么。”',
    background: 'warRoom', historical: 'fictional', next: 's2-prologue-goal',
  },
  {
    id: 's2-prologue-result-lead',
    chapter: 'prologue', actLabel: '事件二共通序章', date: '2026-09-05',
    title: '抢先', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'bottle', portrait: 'bottle',
    text: '“够冲。”瓶把活动室的钥匙抛给你，“那这间屋子，就归你牵头了。”他走到门口又回头，“各组织的脸面，端平了是本事——端不平，也是新闻。”',
    background: 'warRoom', historical: 'fictional', next: 's2-prologue-goal',
  },

  // ───────── 选择形成清晰新目标；局部问题：是否进入新局面 ─────────
  {
    id: 's2-prologue-goal',
    chapter: 'prologue', actLabel: '事件二共通序章', date: '2026-09-05',
    title: '新目标', location: '4945区 · 联合活动室', mode: 'novel',
    speaker: 'narrator',
    text: '桌上的代表名录摊开在第一页，名字后面空着一行：公开表态。维护所在组织的立场，还是不破坏既有关系——评议要的是一个能摆上台面的答案。日历上有个红笔圈的日期，就在下周。',
    background: 'aftermath', historical: 'fictional',
    choices: [
      {
        id: 's2-prologue-accept',
        label: '（接受）接过代表名录。',
        tone: 'warm',
        detail: '正式成为联合评议代表，承担这次表态。',
        effects: [
          { type: 'variable', key: 's2Role', value: 'representative' },
          { type: 'flag', key: 's2Accepted' },
        ],
        next: 's2-prologue-accept-reply',
      },
      {
        id: 's2-prologue-hold',
        label: '（暂观望）先不公开站队。',
        tone: 'calm',
        detail: '保留余地，问题留到评议现场再决。',
        effects: [{ type: 'variable', key: 's2Role', value: 'observer' }],
        next: 's2-prologue-hold-reply',
      },
    ],
  },

  {
    id: 's2-prologue-accept-reply',
    chapter: 'prologue', actLabel: '事件二共通序章', date: '2026-09-05',
    title: '签名', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'mentor', portrait: 'mentor',
    text: '老朋友看着你在代表名录上签完名字，把下一周的议程推到你面前：“行。名字落下去，就不是替别人占座了。下周第一轮，你自己开口。”',
    background: 'aftermath', historical: 'fictional', next: 's2-prologue-closing',
  },
  {
    id: 's2-prologue-hold-reply',
    chapter: 'prologue', actLabel: '事件二共通序章', date: '2026-09-05',
    title: '留白', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'mentor', portrait: 'mentor',
    text: '你把笔放回名录旁边，没有签。老朋友看了眼那行空白：“可以。先旁听一轮。但别人会把空白当成犹豫——下周你得亲口告诉他们，这不是躲。”',
    background: 'aftermath', historical: 'fictional', next: 's2-prologue-closing-held',
  },

  // ───────── 收束叙述（展示后，推进即触发完成哨兵） ─────────
  {
    id: 's2-prologue-closing',
    chapter: 'prologue', actLabel: '事件二共通序章', date: '2026-09-05',
    title: '帷幕拉开', location: '4945区 · 联合活动室', mode: 'novel',
    speaker: 'narrator',
    text: '你在名录上签下名字的那一刻，窗外正好落下来一片叶子。倒计时不会因为一片叶子停。你把名录折好放进口袋，推门出去——秋天已经站满了整条街，事件二的牌，刚发到你手里。',
    background: 'aftermath', historical: 'fictional',
    next: 's2-prologue-exit',
  },
  {
    id: 's2-prologue-closing-held',
    chapter: 'prologue', actLabel: '事件二共通序章', date: '2026-09-05',
    title: '帷幕拉开', location: '4945区 · 联合活动室', mode: 'novel',
    speaker: 'narrator',
    text: '名录上的那一行仍然空着。你拍下议程，把名录留在桌上，推门出去。下周你先坐旁听席——但评议不会因为你没有签名，就不问你的答案。',
    background: 'aftermath', historical: 'fictional', next: 's2-prologue-exit',
  },

  // ───────── 完成哨兵：标记 episode 完成并返回季/集中心 ─────────
  {
    id: 's2-prologue-exit',
    chapter: 'prologue', actLabel: '事件二共通序章', date: '2026-09-05',
    title: '序章 · 完', location: '4945区 · 联合活动室', mode: 'system',
    speaker: 'system',
    text: '（序章收束。）',
    background: 'aftermath', historical: 'fictional',
  },
]
