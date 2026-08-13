import type { StoryNode } from '@/engine/types'

import { bondEndingNode } from './bondEnding'
import { cgPath } from '../cgAssets'

// 四组线以账本为视觉线索，让玩家从成员对话与现场反应中承担分配选择。
export const route4Nodes = [
  {
    id: 'r4-00-founded', chapter: 'prologue', actLabel: '序章 · 账本之外', date: '2026-07-19',
    title: '天上白玉京成立', location: '组织大厅', mode: 'novel', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '“天上白玉京。”砚秋水把新组织的名字念了一遍，随后将一本空白账本放到你面前。华月乌大王和将进酒已经戴上高层徽章，她自己只留了一支笔：“首领是你。我负责在你忘记承诺时，把原话翻出来。”',
    background: 'organization', music: 'groupChat', historical: 'adapted',
    presentation: {
      cg: cgPath('cg24-route4-ledger'),
      cgAlt: '天上白玉京成立之夜，砚秋水在空着的高层席位前打开第一本奖励分配账本',
      ui: 'cinematic',
      transition: 'ink',
      camera: 'pull-back',
      atmosphere: 'paper',
      focus: 'center',
    },
    onEnter: [
      { type: 'highCouncil', members: ['huayue', 'jiangjinjiu'] },
      { type: 'stance', character: 'yanqiu', value: 'support' },
      { type: 'relationship', character: 'yanqiu', key: 'trust', value: 1 },
      { type: 'relationship', character: 'huayue', key: 'trust', value: 1 },
      { type: 'unlockCg', id: 'cg24-route4-ledger' },
    ],
    next: 'r4-01-allocation-promise',
  },
  {
    id: 'r4-01-allocation-promise', chapter: 'prologue', actLabel: '序章 · 账本之外', date: '2026-07-19',
    location: '四组管理私聊', mode: 'chat', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '砚秋水把三枚木签摆成一排：“出勤、需求、轮换。新区第一件稀有饰品还没掉，争它的人已经在路上了。现在定，还是到时候凭你一句话？”',
    background: 'organization', historical: 'fictional',
    presentation: {
      cg: cgPath('cg24-route4-ledger'),
      cgAlt: '砚秋水把空白账本和三枚分配标记推向玩家，要求在第一次胜利前先确定规则',
      ui: 'classic',
      transition: 'crossfade',
      camera: 'push-in',
      atmosphere: 'paper',
      focus: 'right',
    },
    choices: [
      {
        id: 'public-ledger', label: '“把表公开。出勤、需求、轮换，一栏都别藏。”', tone: 'calm',
        effects: [
          { type: 'flag', key: 'org4PublicLedger' }, { type: 'stat', key: 'cohesion', value: 1 },
          { type: 'stat', key: 'evidence', value: 1 }, { type: 'relationship', character: 'yanqiu', key: 'trust', value: 2 },
          { type: 'relationship', character: 'yanqiu', key: 'affinity', value: 1 },
          { type: 'relationshipProgress', character: 'yanqiu', value: 35 },
          { type: 'butterflyDelta', key: 'bf_diplomacy', delta: 2 },
        ], next: 'r4-01c-public-ledger-reply',
      },
      {
        id: 'leader-discretion', label: '“先不许诺。真掉东西时，我看当场战力。”', tone: 'bold',
        effects: [
          { type: 'flag', key: 'org4LeaderDiscretion' }, { type: 'stat', key: 'resources', value: 1 },
          { type: 'relationship', character: 'yanqiu', key: 'trust', value: -1 },
          { type: 'butterflyDelta', key: 'bf_cruelty', delta: 1 },
        ], next: 'r4-01d-discretion-reply',
      },
      {
        id: 'member-vote', label: '“让参战的人投票，我负责把每一票记清。”', tone: 'warm',
        effects: [
          { type: 'flag', key: 'org4MemberVote' }, { type: 'stat', key: 'reputation', value: 1 },
          { type: 'relationship', character: 'huayue', key: 'trust', value: 1 },
          { type: 'butterflyDelta', key: 'bf_heart', delta: 1 }, { type: 'butterflyDelta', key: 'bf_chaos', delta: 1 },
        ], next: 'r4-01e-member-vote-reply',
      },
    ],
  },
  {
    id: 'r4-01c-public-ledger-reply', chapter: 'prologue', actLabel: '序章 · 账本之外', date: '2026-07-19',
    location: '四组管理私聊', mode: 'chat', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '好。公开表里我会把例外单列，免得“有特殊情况”最后变成谁嗓门大谁有理。',
    background: 'organization', historical: 'fictional', next: 'r4-01b-promise-received',
  },
  {
    id: 'r4-01d-discretion-reply', chapter: 'prologue', actLabel: '序章 · 账本之外', date: '2026-07-19',
    location: '四组管理私聊', mode: 'chat', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '你要留现场裁量，我就把“看什么”和“不能越过什么”写在旁边。到时候别只剩一句战力高。',
    background: 'organization', historical: 'fictional', next: 'r4-01b-promise-received',
  },
  {
    id: 'r4-01e-member-vote-reply', chapter: 'prologue', actLabel: '序章 · 账本之外', date: '2026-07-19',
    location: '四组管理私聊', mode: 'chat', speaker: 'huayue', portrait: 'huayue',
    text: '参战的人投票可以。候选、票数、缺席的人怎么算，都要一起公开，不然“大家决定”只是另一种甩锅。',
    background: 'organization', historical: 'fictional', next: 'r4-01b-promise-received',
  },
  {
    // 第一项组织承诺立即得到人物回应，让玩家先感到关系变化，再进入固定事件。
    id: 'r4-01b-promise-received', chapter: 'prologue', actLabel: '序章 · 账本之外', date: '2026-07-19',
    location: '四组管理私聊', mode: 'chat', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '砚秋水在第一页写下时间，又在旁边留出一条窄窄的空栏：“我记住了。例外当然可以有，但临时照顾一个人时，也得把谁会因此少拿写在这里。”',
    background: 'organization', historical: 'fictional', next: 'r4-02-muted-applicant',
  },
  {
    id: 'r4-02-muted-applicant', chapter: 'act1', actLabel: '第一幕 · 与世界为敌', date: '2026-07-20',
    title: '一份带着禁言记录的申请', location: '成员申请', mode: 'chat', speaker: 'takemehand', portrait: 'takemehand',
    text: '一份入组申请跳出来，备注写得很短：“我想来四组。刚才没看见辰逸问话，他直接把我禁言了。你们要是只想要截图，不想要我这个人，就当我没申请。”',
    background: 'mutedKey', music: 'worldEnemy', historical: 'confirmed',
    // The route's central applicant appears in person before the organization rules on his request.
    presentation: {
      ui: 'classic', transition: 'slide', camera: 'push-in', atmosphere: 'messages',
      sprites: [{ character: 'takemehand', expression: 'concerned', pose: 'relaxed', position: 'right', scale: 1.02 }],
    },
    onEnter: [{ type: 'flag', key: 'takemehandMuted' }], next: 'r4-03-application-ruling',
  },
  {
    id: 'r4-03-application-ruling', chapter: 'act1', actLabel: '第一幕 · 与世界为敌', date: '2026-07-20',
    location: '四组管理群', mode: 'novel', speaker: 'huayue', portrait: 'huayue',
    text: '华月乌大王盯着申请栏：“人可以收，截图也可以留。但你得先选一件——让他从今天开始当普通成员，还是让他永远背着‘二组证人’四个字？”',
    background: 'mutedKey', choices: [
      {
        id: 'accept-as-member', label: '“让他进来。进了四组，就只按四组成员算。”', tone: 'warm',
        effects: [
          { type: 'flag', key: 'takemehandJoinedOrg4' }, { type: 'flag', key: 'org4ProtectedTakemehand' },
          { type: 'relationship', character: 'takemehand', key: 'trust', value: 3 },
          { type: 'relationship', character: 'takemehand', key: 'affinity', value: 1 },
          { type: 'relationshipProgress', character: 'takemehand', value: 35 }, { type: 'stat', key: 'cohesion', value: 1 },
          { type: 'butterflyDelta', key: 'bf_heart', delta: 1 },
        ], next: 'r4-03b-takemehand-enters',
      },
      {
        id: 'accept-after-record', label: '“先收人，把完整记录封存，谁都不拿它带节奏。”', tone: 'calm',
        effects: [
          { type: 'flag', key: 'takemehandJoinedOrg4' }, { type: 'flag', key: 'org4RecordedMute' },
          { type: 'relationship', character: 'takemehand', key: 'trust', value: 2 }, { type: 'stat', key: 'evidence', value: 2 },
          { type: 'butterflyDelta', key: 'bf_diplomacy', delta: 1 },
        ], next: 'r4-03b-takemehand-enters',
      },
      {
        id: 'observe-first', label: '“先在外群待一天，我要确认二组会不会追过来。”', tone: 'calm',
        effects: [
          { type: 'flag', key: 'takemehandJoinedOrg4', value: false }, { type: 'relationship', character: 'takemehand', key: 'trust', value: -1 },
          { type: 'organizationRelation', organization: 'org2', value: 1 },
          { type: 'butterflyDelta', key: 'bf_diplomacy', delta: 1 },
        ], next: 'r4-03c-takemehand-observed',
      },
    ],
  },
  {
    id: 'r4-03b-takemehand-enters', chapter: 'act1', actLabel: '第一幕 · 与世界为敌', date: '2026-07-20',
    location: '四组组织群', mode: 'chat', speaker: 'takemehand', portrait: 'takemehand',
    text: '“知道了。”takemehand的头像在输入中和静止之间闪了两次，“我不会拿那张禁言截图换位置。你们也别拿我去换一个对二组开战的理由。”',
    background: 'mutedKey', historical: 'adapted',
    presentation: {
      ui: 'classic', transition: 'crossfade', camera: 'hold', atmosphere: 'messages',
      sprites: [{ character: 'takemehand', expression: 'soft', pose: 'relaxed', position: 'left', scale: 1.01 }],
    },
    next: 'r4-04-world-enemy',
  },
  {
    // 观察期保留在外群，直到公频冲突给出可验证的后果。
    id: 'r4-03c-takemehand-observed', chapter: 'act1', actLabel: '第一幕 · 与世界为敌', date: '2026-07-20',
    location: '四组外群', mode: 'chat', speaker: 'takemehand', portrait: 'takemehand',
    text: '知道了，我今天不进四组名单。截图和在线记录我都留着；二组要是追着我来，你们再决定这个位置值不值得给。',
    background: 'mutedKey', historical: 'fictional',
    presentation: {
      ui: 'classic', transition: 'crossfade', camera: 'hold', atmosphere: 'messages',
      sprites: [{ character: 'takemehand', expression: 'concerned', pose: 'relaxed', position: 'left', scale: 1.01 }],
    },
    next: 'r4-04-world-enemy',
  },
  {
    id: 'r4-04-world-enemy', chapter: 'act1', actLabel: '第一幕 · 与世界为敌', date: '2026-07-20',
    title: '与世界为敌', location: '4945区群', mode: 'chat', speaker: 'chenyi', portrait: 'chenyi',
    text: '四组捡个人就当自己主持公道了？他不回我消息，我禁个言怎么了。砚秋水、你们首领、还有三组，谁不服都直接来。',
    background: 'worldChat', sound: 'warning', historical: 'confirmed',
    presentation: {
      cg: cgPath('cg27-world-enemy'),
      cgAlt: '辰逸在公共群点名四组、砚秋水和三组，私人冲突沿多条消息流扩散',
      ui: 'classic',
      transition: 'glitch',
      camera: 'push-in',
      atmosphere: 'messages',
      focus: 'left',
    },
    onEnter: [
      { type: 'flag', key: 'worldEnemyStartedOnJuly20' },
      { type: 'unlockCg', id: 'cg27-world-enemy' },
    ],
    next: 'r4-05-response',
  },
  {
    id: 'r4-05-response', chapter: 'act1', actLabel: '第一幕 · 与世界为敌', date: '2026-07-20',
    location: '4945区群', mode: 'novel', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '砚秋水把输入框里的长段文字全部删掉，只留下一行：“他在等我们把四组写成敌人。回一句，是接住成员；回十句，就是替他把戏唱完。”',
    background: 'worldChat', choices: [
      {
        id: 'one-statement', label: '只发一句：“四组成员，四组自己保护。”', tone: 'calm',
        effects: [
          { type: 'flag', key: 'org4SingleStatement' }, { type: 'stat', key: 'reputation', value: 1 },
          { type: 'relationship', character: 'yanqiu', key: 'trust', value: 2 }, { type: 'relationship', character: 'takemehand', key: 'trust', value: 1 },
          { type: 'butterflyDelta', key: 'bf_diplomacy', delta: 1 },
        ], next: 'r4-05c-one-statement-reply',
      },
      {
        id: 'publish-record', label: '发出完整记录：“请江南首领处理辰逸。”', tone: 'bold',
        condition: { type: 'flag', key: 'org4RecordedMute' },
        effects: [
          { type: 'flag', key: 'org4PublishedMuteRecord' }, { type: 'stat', key: 'reputation', value: 2 },
          { type: 'organizationRelation', organization: 'org2', value: -2 }, { type: 'relationship', character: 'takemehand', key: 'trust', value: -1 },
          { type: 'butterflyDelta', key: 'bf_cruelty', delta: 1 }, { type: 'butterflyDelta', key: 'bf_diplomacy', delta: 1 },
        ], next: 'r4-05d-publish-record-reply',
      },
      {
        id: 'fight-back', label: '@全组：“都在吗？跟我回。”', tone: 'danger',
        effects: [
          { type: 'flag', key: 'org4JoinedFlameWar' }, { type: 'stat', key: 'cohesion', value: 1 },
          { type: 'stat', key: 'reputation', value: -1 }, { type: 'organizationRelation', organization: 'org2', value: -2 },
          { type: 'butterflyDelta', key: 'bf_cruelty', delta: 2 },
        ], next: 'r4-05e-fight-back-reply',
      },
    ],
  },
  {
    id: 'r4-05c-one-statement-reply', chapter: 'act1', actLabel: '第一幕 · 与世界为敌', date: '2026-07-20',
    location: '4945区群', mode: 'chat', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '这一句够了：四组保护自己的人，但不替任何人要求二组先认错。后面再有人点名，先把事实贴回来。',
    background: 'worldChat', historical: 'fictional', next: 'r4-05b-public-reply-lands',
  },
  {
    id: 'r4-05d-publish-record-reply', chapter: 'act1', actLabel: '第一幕 · 与世界为敌', date: '2026-07-20',
    location: '4945区群', mode: 'chat', speaker: 'xuanmo', portrait: 'xuanmo',
    text: '记录已经发了，时间和数字都能反查。二组要说这是公审，就先指出哪一条记录是错的。',
    background: 'worldChat', historical: 'fictional', next: 'r4-05b-public-reply-lands',
  },
  {
    id: 'r4-05e-fight-back-reply', chapter: 'act1', actLabel: '第一幕 · 与世界为敌', date: '2026-07-20',
    location: '4945区群', mode: 'chat', speaker: 'xuanmo', portrait: 'xuanmo',
    text: '行，我把在线的人叫齐。但这十句是今晚替成员接火，别让它明天变成四组的新规。',
    background: 'worldChat', historical: 'fictional', next: 'r4-05b-public-reply-lands',
  },
  {
    id: 'r4-05b-public-reply-lands', chapter: 'act1', actLabel: '第一幕 · 与世界为敌', date: '2026-07-20',
    location: '四组管理群', mode: 'chat', speaker: 'xuanmo', portrait: 'xuanmo',
    text: '玄末之缘盯着不断上跳的新消息：“话已经发出去了。二组接不接是他们的事；要是辰逸再点四组，我不会替他找第二个借口。”',
    background: 'worldChat', historical: 'adapted',
    next: 'r4-05f-response-echo-router',
  },
  {
    id: 'r4-05f-response-echo-router', chapter: 'act1', actLabel: '第一幕 · 与世界为敌', date: '2026-07-20',
    location: '四组管理群', mode: 'chat', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '消息还在涨，先把刚才选择的代价说清，再决定成员私聊怎么接。',
    background: 'worldChat', historical: 'fictional',
    next: {
      cases: [
        { when: { type: 'flag', key: 'org4SingleStatement' }, next: 'r4-05g-single-echo' },
        { when: { type: 'flag', key: 'org4PublishedMuteRecord' }, next: 'r4-05h-record-echo' },
        { when: { type: 'flag', key: 'org4JoinedFlameWar' }, next: 'r4-05i-fight-echo' },
      ],
      fallback: 'r4-05j-membership-router',
    },
  },
  {
    id: 'r4-05g-single-echo', chapter: 'act1', actLabel: '第一幕 · 与世界为敌', date: '2026-07-20',
    location: '四组管理群', mode: 'chat', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '辰逸又点了四组，我把“保护成员、别扩大战线”原样贴回去，没有追加第二段。',
    background: 'worldChat', historical: 'fictional', next: 'r4-05j-membership-router',
  },
  {
    id: 'r4-05h-record-echo', chapter: 'act1', actLabel: '第一幕 · 与世界为敌', date: '2026-07-20',
    location: '四组管理群', mode: 'chat', speaker: 'xuanmo', portrait: 'xuanmo',
    text: '二组说证据不完整，我已经让他们指出缺哪一段。takemehand不用先替截图辩护，记录自己站住。',
    background: 'worldChat', historical: 'fictional', next: 'r4-05j-membership-router',
  },
  {
    id: 'r4-05i-fight-echo', chapter: 'act1', actLabel: '第一幕 · 与世界为敌', date: '2026-07-20',
    location: '四组管理群', mode: 'chat', speaker: 'huayue', portrait: 'huayue',
    text: '群里涨得最快，名单也最乱。我先锁住发言人，别让一场火把普通成员都变成燃料。',
    background: 'worldChat', historical: 'fictional', next: 'r4-05j-membership-router',
  },
  {
    id: 'r4-05j-membership-router', chapter: 'act1', actLabel: '第一幕 · 与世界为敌', date: '2026-07-20',
    location: '四组管理群', mode: 'chat', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '公频先停在这里。接下来只按他现在是不是四组成员处理。',
    background: 'worldChat', historical: 'fictional',
    // 只有已录取分支进入成员私聊；外群观察分支保持未入组状态。
    next: {
      cases: [{ when: { type: 'flag', key: 'takemehandJoinedOrg4' }, next: 'r4-06-private-aftermath' }],
      fallback: 'r4-06a-observation-hold',
    },
  },
  {
    id: 'r4-06a-observation-hold', chapter: 'act1', actLabel: '第一幕 · 与世界为敌', date: '2026-07-20',
    location: '四组外群', mode: 'chat', speaker: 'takemehand', portrait: 'takemehand',
    text: '今晚我继续留在外群。你们替我接住了公频那句话，但没有提前把我写进名单；明天观察期过了，再说我要不要正式进。',
    background: 'nightMessage', historical: 'fictional',
    presentation: {
      ui: 'classic', transition: 'crossfade', camera: 'hold', atmosphere: 'messages',
      sprites: [{ character: 'takemehand', expression: 'concerned', pose: 'relaxed', position: 'left', scale: 1.01 }],
    },
    next: 'r4-07-fixed-facts',
  },
  {
    id: 'r4-06-private-aftermath', chapter: 'act1', actLabel: '第一幕 · 与世界为敌', date: '2026-07-20',
    location: '四组组织群', mode: 'chat', speaker: 'takemehand', portrait: 'takemehand',
    text: '我不是因为输不起才走。他问话时我在切游戏，回来就只剩禁言提示。谢谢你们收我。以后我没回消息，可以再问一次，也可以等我上线——别替我猜理由，更别先碰那个按钮。',
    background: 'nightMessage', historical: 'adapted',
    // Keep the relationship choice above his face on portrait screens by centering the upper-body silhouette.
    presentation: {
      ui: 'classic', transition: 'crossfade', camera: 'push-in', atmosphere: 'rain',
      sprites: [{ character: 'takemehand', expression: 'soft', pose: 'relaxed', position: 'center', scale: .98 }],
    },
    choices: [
      {
        id: 'no-debt', label: '“加入不是欠债，你只按四组规则来。”', tone: 'warm',
        effects: [
          { type: 'relationship', character: 'takemehand', key: 'trust', value: 2 },
          { type: 'relationship', character: 'takemehand', key: 'affinity', value: 2 },
          { type: 'relationshipProgress', character: 'takemehand', value: 35 },
          { type: 'butterflyDelta', key: 'bf_heart', delta: 1 },
        ], next: 'r4-06b-huayue-aftercare',
      },
      {
        id: 'need-presence', label: '“下次要塞准时来，就算回答。”', tone: 'warm',
        effects: [
          { type: 'relationship', character: 'takemehand', key: 'affinity', value: 1 }, { type: 'stat', key: 'contribution', value: 1 },
          { type: 'butterflyDelta', key: 'bf_loyalty', delta: 1 },
        ], next: 'r4-06b-huayue-aftercare',
      },
    ],
  },
  {
    // 华月关系线从善后开始；默认项保持工作边界，避免旧路线自动进入攻略结局。
    id: 'r4-06b-huayue-aftercare', chapter: 'act1', actLabel: '第一幕 · 与世界为敌', date: '2026-07-20',
    location: '四组管理私聊', mode: 'chat', speaker: 'huayue', portrait: 'huayue',
    text: '华月把区群消息截到今晚最后一条，又发来明天的值班表：“外面已经替你宣布赢了。里面还缺一句实话——你是真没事，还是怕耽误排班，所以先装成没事？”',
    background: 'nightMessage', historical: 'fictional',
    presentation: {
      ui: 'classic', transition: 'crossfade', camera: 'push-in', atmosphere: 'rain',
      sprites: [{ character: 'huayue', expression: 'neutral', pose: 'thinking', position: 'center', scale: 1.01 }],
    },
    choices: [
      {
        id: 'keep-the-list-moving', label: '“我没事。把明天名单发来，我们继续。”', tone: 'calm',
        effects: [{ type: 'relationship', character: 'huayue', key: 'trust', value: 1 }, { type: 'butterflyDelta', key: 'bf_cruelty', delta: 1 }],
        next: 'r4-06c-huayue-keeps-list',
      },
      {
        id: 'share-the-fear', label: '把手机扣在桌上：“我怕收错一个人，把四组也拖进火里。”', tone: 'warm',
        effects: [
          { type: 'flag', key: 'huayueSharedVulnerability' },
          { type: 'relationship', character: 'huayue', key: 'trust', value: 1 },
          { type: 'relationship', character: 'huayue', key: 'affinity', value: 2 },
          { type: 'relationshipProgress', character: 'huayue', value: 30 },
          { type: 'butterflyDelta', key: 'bf_heart', delta: 1 }, { type: 'butterflyDelta', key: 'bf_shadow', delta: 1 },
        ],
        next: 'r4-06d-huayue-stays',
      },
    ],
  },
  {
    id: 'r4-06c-huayue-keeps-list', chapter: 'act1', actLabel: '第一幕 · 与世界为敌', date: '2026-07-20',
    location: '四组管理私聊', mode: 'chat', speaker: 'huayue', portrait: 'huayue',
    text: '“行，名单发你。”华月把文件钉在聊天顶端，“但说完没事就别半夜失踪。临时找替班的人，比处理辰逸还费时间——辰逸至少会自己@全区。”',
    background: 'nightMessage', historical: 'fictional',
    presentation: {
      ui: 'classic', transition: 'crossfade', camera: 'hold', atmosphere: 'rain',
      sprites: [{ character: 'huayue', expression: 'neutral', pose: 'phone', position: 'center', scale: 1.01 }],
    },
    next: 'r4-07-fixed-facts',
  },
  {
    id: 'r4-06d-huayue-stays', chapter: 'act1', actLabel: '第一幕 · 与世界为敌', date: '2026-07-20',
    location: '四组管理私聊', mode: 'chat', speaker: 'huayue', portrait: 'huayue',
    text: '华月隔了几秒才回：“怕有用，藏着才会让排班出错。人是我们一起收的，真烧起来也不是你一个人站门口。今晚我在，你先把手从禁言键上拿开。”',
    background: 'nightMessage', historical: 'fictional',
    presentation: {
      ui: 'classic', transition: 'crossfade', camera: 'push-in', atmosphere: 'rain',
      sprites: [{ character: 'huayue', expression: 'soft', pose: 'phone', position: 'center', scale: 1.03 }],
    },
    next: 'r4-07-fixed-facts',
  },
  {
    id: 'r4-07-fixed-facts', chapter: 'act2', actLabel: '第二幕 · 两个官方群', date: '2026-07-20',
    location: '四组管理群', mode: 'chat', speaker: 'huayue', portrait: 'huayue',
    text: '华月乌大王把江南的新名单发进群里：“岸是自己不想当高层，主动卸任；辰逸是被降为成员。新高层是7月19日加入的时，还有原本只是普通成员的大古。别把四件事压成一句‘二组换人’。”',
    background: 'aftermath', historical: 'confirmed',
    presentation: {
      cg: cgPath('cg28-council-reshuffle'),
      cgAlt: '岸主动放下高层徽章，7月19日加入的时与原普通成员大古站到新高层席位旁',
      ui: 'cinematic',
      transition: 'crossfade',
      camera: 'pull-back',
      atmosphere: 'dust',
      focus: 'right',
    },
    onEnter: [
      { type: 'flag', key: 'anVoluntarilySteppedDown' }, { type: 'flag', key: 'chenyiDemotedOnJuly20' },
      { type: 'flag', key: 'shiAndDaiguPromoted' },
      { type: 'unlockCg', id: 'cg28-council-reshuffle' },
    ], next: 'r4-10-xilufei-burst',
  },
  {
    id: 'r4-08-two-groups', chapter: 'act2', actLabel: '第二幕 · 两个官方群', date: '2026-07-21',
    title: '两个4945官方群', location: '四组组织群', mode: 'chat', speaker: 'huayue', portrait: 'huayue',
    text: '华月把两张群名片并排转发：旧群写着“4945官方群”，江南新群也写着“4945官方群”。“一个有旧成员，一个有二组的人。成员都在问到底该留哪边。”',
    background: 'twoGroups', historical: 'confirmed',
    // 观察分支在次日才正式入组，其他分支保持原路径。
    next: {
      cases: [{ when: { type: 'flag', key: 'takemehandJoinedOrg4' }, next: 'r4-09-group-policy' }],
      fallback: 'r4-08a-observation-complete',
    },
  },
  {
    id: 'r4-08a-observation-complete', chapter: 'act2', actLabel: '第二幕 · 两个官方群', date: '2026-07-21',
    location: '四组组织群', mode: 'chat', speaker: 'takemehand', portrait: 'takemehand',
    text: '一天过了，该看的记录也看完了。我今天正式进四组，先按普通成员算；昨天的边界仍然有效，我不拿禁言截图换位置。',
    background: 'twoGroups', historical: 'fictional',
    presentation: {
      ui: 'classic', transition: 'crossfade', camera: 'hold', atmosphere: 'messages',
      sprites: [{ character: 'takemehand', expression: 'soft', pose: 'relaxed', position: 'left', scale: 1.01 }],
    },
    onEnter: [{ type: 'flag', key: 'takemehandJoinedOrg4' }],
    next: 'r4-09-group-policy',
  },
  {
    id: 'r4-09-group-policy', chapter: 'act2', actLabel: '第二幕 · 两个官方群', date: '2026-07-21',
    location: '四组公告', mode: 'novel', speaker: 'huayue', portrait: 'huayue',
    text: '华月把置顶公告留在发送键上：“别争谁名字更真。你给我一句成员照着做不会走丢的话，我现在就发。”', background: 'twoGroups',
    choices: [
      {
        id: 'both-are-external', label: '“两个都只是联络群。四组的决定回自己群确认。”', tone: 'calm',
        effects: [
          { type: 'flag', key: 'org4SeparatedGroupAuthority' }, { type: 'stat', key: 'cohesion', value: 1 },
          { type: 'relationship', character: 'yanqiu', key: 'trust', value: 1 },
          { type: 'butterflyDelta', key: 'bf_diplomacy', delta: 1 },
        ], next: 'r4-09c-external-groups-reply',
      },
      {
        id: 'recognize-old', label: '“留旧群。二组那个新群先不进。”', tone: 'bold',
        effects: [
          { type: 'organizationRelation', organization: 'org1', value: 1 }, { type: 'organizationRelation', organization: 'org2', value: -1 },
          { type: 'butterflyDelta', key: 'bf_loyalty', delta: 1 },
        ], next: 'r4-09d-old-group-reply',
      },
      {
        id: 'join-both', label: '“两边都留人，只转能互相核对的消息。”', tone: 'secret',
        effects: [
          { type: 'stat', key: 'evidence', value: 1 }, { type: 'relationship', character: 'huayue', key: 'trust', value: 1 },
          { type: 'butterflyDelta', key: 'bf_shadow', delta: 1 },
        ], next: 'r4-09e-both-groups-reply',
      },
    ],
  },
  {
    id: 'r4-09c-external-groups-reply', chapter: 'act2', actLabel: '第二幕 · 两个官方群', date: '2026-07-21',
    location: '四组公告', mode: 'chat', speaker: 'huayue', portrait: 'huayue',
    text: '明白。两个群都只做联络，任何命令都回四组群确认，我把这句放在公告第一行。',
    background: 'twoGroups', historical: 'fictional', next: 'r4-09b-policy-posted',
  },
  {
    id: 'r4-09d-old-group-reply', chapter: 'act2', actLabel: '第二幕 · 两个官方群', date: '2026-07-21',
    location: '四组公告', mode: 'chat', speaker: 'huayue', portrait: 'huayue',
    text: '旧群先留，我会每天核管理员名单；二组新群的消息先问出处，不直接下到成员。',
    background: 'twoGroups', historical: 'fictional',
    onEnter: [{ type: 'flag', key: 'org4RecognizesOldGroup' }], next: 'r4-09b-policy-posted',
  },
  {
    id: 'r4-09e-both-groups-reply', chapter: 'act2', actLabel: '第二幕 · 两个官方群', date: '2026-07-21',
    location: '四组公告', mode: 'chat', speaker: 'huayue', portrait: 'huayue',
    text: '两边都留联络员，但转发前要交叉核对；一张截图不能直接变成四组命令。',
    background: 'twoGroups', historical: 'fictional',
    onEnter: [{ type: 'flag', key: 'org4MaintainsBothGroups' }], next: 'r4-09b-policy-posted',
  },
  {
    id: 'r4-09b-policy-posted', chapter: 'act2', actLabel: '第二幕 · 两个官方群', date: '2026-07-21',
    location: '四组组织群', mode: 'chat', speaker: 'huayue', portrait: 'huayue',
    text: '公告发出后，华月又补了一句：“我置顶了。以后谁拿一张群截图来下命令，先让他把同一条消息发回天上白玉京。”',
    background: 'twoGroups', historical: 'fictional',
    next: {
      cases: [
        { when: { type: 'flag', key: 'org4SeparatedGroupAuthority' }, next: 'r4-09f-external-groups-echo' },
        { when: { type: 'flag', key: 'org4RecognizesOldGroup' }, next: 'r4-09g-old-group-echo' },
        { when: { type: 'flag', key: 'org4MaintainsBothGroups' }, next: 'r4-09h-both-groups-echo' },
      ],
      fallback: 'r4-10b-xilufei-leaves',
    },
  },
  {
    id: 'r4-09f-external-groups-echo', chapter: 'act2', actLabel: '第二幕 · 两个官方群', date: '2026-07-21',
    location: '四组组织群', mode: 'chat', speaker: 'huayue', portrait: 'huayue',
    text: '两边都有人催四组确认，我只贴了组织群原话。今天没有一张外群截图直接变成命令。',
    background: 'twoGroups', historical: 'fictional', next: 'r4-10b-xilufei-leaves',
  },
  {
    id: 'r4-09g-old-group-echo', chapter: 'act2', actLabel: '第二幕 · 两个官方群', date: '2026-07-21',
    location: '四组组织群', mode: 'chat', speaker: 'huayue', portrait: 'huayue',
    text: '旧群管理员又变了一次，名单已经重核。二组新群的通知仍停在待确认，没有往下发。',
    background: 'twoGroups', historical: 'fictional', next: 'r4-10b-xilufei-leaves',
  },
  {
    id: 'r4-09h-both-groups-echo', chapter: 'act2', actLabel: '第二幕 · 两个官方群', date: '2026-07-21',
    location: '四组组织群', mode: 'chat', speaker: 'huayue', portrait: 'huayue',
    text: '两边的说法对不上，我把差异并排贴回四组群。联络员都在，但最后只认组织群确认。',
    background: 'twoGroups', historical: 'fictional', next: 'r4-10b-xilufei-leaves',
  },
  {
    id: 'r4-10-xilufei-burst', chapter: 'act2', actLabel: '第二幕 · 两个官方群', date: '2026-07-20',
    title: '管理员验证', location: '旧4945区群', mode: 'chat', speaker: 'qifu', portrait: 'qifu',
    text: '祈福的消息连续跳出：“希露菲说自己是高层，我把管理员给他了。他是老区过来找乐子的——等一下，成员怎么在掉？”群人数每刷新一次就少一截，直到所有能够移除的成员都被踢出。',
    background: 'twoGroups', sound: 'warning', historical: 'confirmed',
    presentation: {
      cg: cgPath('cg14-xilufei-explosion'),
      cgAlt: '希露菲向祈福骗到群管理员权限，清空所有能够移除的区群成员',
      transition: 'glitch', atmosphere: 'paper', focus: 'center',
    },
    onEnter: [
      { type: 'flag', key: 'xilufeiExplodedOldGroup' },
      { type: 'unlockCg', id: 'cg14-xilufei-explosion' },
    ],
    next: 'r4-08-two-groups',
  },
  {
    // 将爆群与次日拒战、退组拆开，保证玩家看到的日期与固定历史一致。
    id: 'r4-10b-xilufei-leaves', chapter: 'act2', actLabel: '第二幕 · 两个官方群', date: '2026-07-21',
    title: '拒绝开战', location: '二组新群', mode: 'system', speaker: 'system',
    text: '希露菲试图拱火二组向一组宣战。江南首领拒绝开战；7月21日，希露菲退出二组群，随后退出江南。',
    background: 'twoGroups', historical: 'confirmed',
    presentation: {
      cg: cgPath('cg15-xilufei-exit'),
      cgAlt: '江南首领拒绝向一组开战后，希露菲于7月21日退出二组群并离开江南',
      ui: 'cinematic', transition: 'crossfade', camera: 'pull-back', atmosphere: 'dust', focus: 'right',
    },
    onEnter: [
      { type: 'flag', key: 'xilufeiLeftOrg2OnJuly21' },
      { type: 'unlockCg', id: 'cg15-xilufei-exit' },
    ],
    next: 'r4-10c-xuanmo-dispute',
  },
  {
    id: 'r4-10c-xuanmo-dispute', chapter: 'act2', actLabel: '第二幕 · 离开四组的人', date: '2026-07-23',
    location: '四组组织群', mode: 'chat', speaker: 'xuanmo', portrait: 'xuanmo',
    text: '玄末之缘把将进酒那句“个人行为别扩大”截了出来：“辰逸点过四组，也点过砚秋水。你这时候替二组收话，是觉得我们还不够像软柿子？”',
    background: 'worldChat', historical: 'confirmed', next: 'r4-10d-jiangjinjiu-leaves',
  },
  {
    id: 'r4-10d-jiangjinjiu-leaves', chapter: 'act2', actLabel: '第二幕 · 离开四组的人', date: '2026-07-23',
    location: '将进酒私聊', mode: 'chat', speaker: 'jiangjinjiu', portrait: 'jiangjinjiu',
    text: '将进酒把高层徽章摘了下来：“我不是替辰逸。我只是不想把一个人的脾气，继续算成两个组织的仇。玄末不会信这句话，我也不想每天逼她信。三组愿意收我——我走得安静一点。”',
    background: 'nightMessage', historical: 'confirmed',
    presentation: {
      ui: 'classic', transition: 'crossfade', camera: 'pull-back', atmosphere: 'rain',
      sprites: [{ character: 'jiangjinjiu', expression: 'neutral', pose: 'thinking', position: 'center', scale: .98 }],
    },
    onEnter: [{ type: 'flag', key: 'jiangjinjiuLeftOrg4ForOrg3' }],
    next: 'r4-11-alliance-offer',
  },
  {
    id: 'r4-11-alliance-offer', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-24',
    location: '三组首领私聊', mode: 'chat', speaker: 'heartbeat', portrait: 'heartbeat',
    text: '心跳成瘾发来一张被涂得五颜六色的要塞表：“五组要打江南火2。三组和四组各算各的分，但可以错开时间、别撞同一个门。你想长期合作，还是今晚互相让一步？”',
    background: 'warRoom', music: 'fortressNight',
    presentation: {
      ui: 'classic', transition: 'slide', camera: 'push-in', atmosphere: 'paper',
      sprites: [{ character: 'heartbeat', expression: 'determined', pose: 'phone', position: 'left', scale: 1.02 }],
    },
    choices: [
      {
        id: 'formal-alliance', label: '“长期合作。目标和退出条件今晚写清。”', tone: 'warm',
        effects: [
          { type: 'flag', key: 'org4AlliedOrg3' }, { type: 'organizationRelation', organization: 'org3', value: 2 },
          { type: 'stat', key: 'resources', value: 1 },
          { type: 'butterflyDelta', key: 'bf_diplomacy', delta: 2 },
        ], next: 'r4-11c-formal-alliance-reply',
      },
      {
        id: 'one-night-pact', label: '“只约这一次，彼此别撞目标。”', tone: 'calm',
        effects: [{ type: 'organizationRelation', organization: 'org3', value: 1 }, { type: 'butterflyDelta', key: 'bf_diplomacy', delta: 1 }], next: 'r4-11d-one-night-reply',
      },
      {
        id: 'stay-independent', label: '“不用协调。四组打自己的。”', tone: 'bold',
        effects: [{ type: 'stat', key: 'reputation', value: 1 }, { type: 'stat', key: 'resources', value: -1 }, { type: 'butterflyDelta', key: 'bf_cruelty', delta: 1 }], next: 'r4-11e-independent-reply',
      },
    ],
  },
  {
    id: 'r4-11c-formal-alliance-reply', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-24',
    location: '三组首领私聊', mode: 'chat', speaker: 'heartbeat', portrait: 'heartbeat',
    text: '长期合作我来起草，目标、联络人和退出条件今晚都写清。谁改口，先回自己组织解释。',
    background: 'warRoom', historical: 'fictional', next: 'r4-11b-alliance-answer',
  },
  {
    id: 'r4-11d-one-night-reply', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-24',
    location: '三组首领私聊', mode: 'chat', speaker: 'heartbeat', portrait: 'heartbeat',
    text: '就这一晚。结算后各走各的账，我不会拿“盟友”两个字把这次让路续成长期承诺。',
    background: 'warRoom', historical: 'fictional',
    onEnter: [{ type: 'flag', key: 'org4OneNightPact' }], next: 'r4-11b-alliance-answer',
  },
  {
    id: 'r4-11e-independent-reply', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-24',
    location: '三组首领私聊', mode: 'chat', speaker: 'heartbeat', portrait: 'heartbeat',
    text: '好，四组打自己的。资源少一格、有人迟到，都由你们自己接，我不替你留位置。',
    background: 'warRoom', historical: 'fictional',
    onEnter: [{ type: 'flag', key: 'org4StayedIndependent' }], next: 'r4-11b-alliance-answer',
  },
  {
    id: 'r4-11b-alliance-answer', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-24',
    location: '三组首领私聊', mode: 'chat', speaker: 'heartbeat', portrait: 'heartbeat',
    text: '心跳成瘾回了一个“收到”，很快又补上一句：“我按你说的排。明晚谁临时改口，谁先回自己组织解释；别拿盟友两个字替迟到的人补位。”',
    background: 'warRoom', historical: 'fictional',
    next: {
      cases: [
        { when: { type: 'flag', key: 'org4AlliedOrg3' }, next: 'r4-11f-formal-alliance-echo' },
        { when: { type: 'flag', key: 'org4OneNightPact' }, next: 'r4-11g-one-night-echo' },
        { when: { type: 'flag', key: 'org4StayedIndependent' }, next: 'r4-11h-independent-echo' },
      ],
      fallback: 'r4-12-fortress-plan',
    },
  },
  {
    id: 'r4-11f-formal-alliance-echo', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-24',
    location: '三四组联盟群', mode: 'chat', speaker: 'heartbeat', portrait: 'heartbeat',
    text: '长期合作表已经双方确认，连退出条件也在。明晚临时改标的人，不能再说自己没看见。',
    background: 'warRoom', historical: 'fictional', next: 'r4-12-fortress-plan',
  },
  {
    id: 'r4-11g-one-night-echo', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-24',
    location: '三四组临时联络', mode: 'chat', speaker: 'heartbeat', portrait: 'heartbeat',
    text: '今晚的目标已经错开，结算后联络群就归档。临时让路不会自动变成长线关系。',
    background: 'warRoom', historical: 'fictional', next: 'r4-12-fortress-plan',
  },
  {
    id: 'r4-11h-independent-echo', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-24',
    location: '四组作战桌', mode: 'chat', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '三组没有给我们留目标。四组单打，资源和迟到都记自己的账，今晚没人替我们补位。',
    background: 'warRoom', historical: 'fictional', next: 'r4-12-fortress-plan',
  },
  {
    id: 'r4-12-fortress-plan', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-25',
    location: '天上白玉京作战桌', mode: 'battle', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '砚秋水在四组标记旁压住一枚木签：“火2那边会很热闹，可热闹不会替我们领奖励。要保自己的点，还是抽人帮五组，你现在下令。”',
    background: 'warRoom', choices: [
      {
        id: 'secure-own-fortress', label: '按住四组标记：“先守我们自己的点。”', tone: 'calm',
        effects: [
          { type: 'flag', key: 'org4SecuredOwnTarget' }, { type: 'stat', key: 'resources', value: 2 },
          { type: 'stat', key: 'contribution', value: 2 }, { type: 'relationship', character: 'yanqiu', key: 'trust', value: 1 },
          { type: 'butterflyDelta', key: 'bf_cruelty', delta: 1 },
        ], next: 'r4-12c-secure-reply',
      },
      {
        id: 'support-org5', label: '把两名核心拖向火2：“替五组撕开一条缝。”', tone: 'bold',
        effects: [
          { type: 'flag', key: 'org4SupportedOrg5' }, { type: 'organizationRelation', organization: 'org5', value: 2 },
          { type: 'stat', key: 'resources', value: -1 }, { type: 'stat', key: 'reputation', value: 1 },
          { type: 'butterflyDelta', key: 'bf_loyalty', delta: 1 }, { type: 'butterflyDelta', key: 'bf_heart', delta: 1 },
        ], next: 'r4-12d-support-reply',
      },
      {
        id: 'spectacle-first', label: '关掉本组地图：“今晚都去看火2。”', tone: 'warm',
        effects: [
          { type: 'flag', key: 'org4WatchedFireTwo' }, { type: 'stat', key: 'cohesion', value: 1 }, { type: 'stat', key: 'resources', value: -2 },
          { type: 'butterflyDelta', key: 'bf_chaos', delta: 1 },
        ], next: 'r4-12e-spectacle-reply',
      },
    ],
  },
  {
    id: 'r4-12c-secure-reply', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-25',
    location: '天上白玉京作战桌', mode: 'chat', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '收到。今晚不追别人，先让四组自己的点不丢；五组再求援，我也按这条命令回复。',
    background: 'warRoom', historical: 'fictional', next: 'r4-12b-fortress-live',
  },
  {
    id: 'r4-12d-support-reply', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-25',
    location: '天上白玉京作战桌', mode: 'chat', speaker: 'xuanmo', portrait: 'xuanmo',
    text: '两名核心已经拖去火2。四组自己领奖的空位少一格，这个代价我会写进战报。',
    background: 'warRoom', historical: 'fictional', next: 'r4-12b-fortress-live',
  },
  {
    id: 'r4-12e-spectacle-reply', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-25',
    location: '天上白玉京作战桌', mode: 'chat', speaker: 'huayue', portrait: 'huayue',
    text: '全组观战也是决定。四组分数掉下去时，战报会明确写“没有守本点”，不写成意外。',
    background: 'warRoom', historical: 'fictional', next: 'r4-12b-fortress-live',
  },
  {
    id: 'r4-12b-fortress-live', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-25',
    location: '要塞语音', mode: 'battle', speaker: 'xuanmo', portrait: 'xuanmo',
    text: '玄末之缘的声音从技能音效里挤出来：“火2亮了。江南主队没乱，五组已经开始掉人。我们的命令也发出去了——这时候再改，掉的是自己人的位置。”',
    background: 'fortress', historical: 'adapted',
    next: {
      cases: [
        { when: { type: 'flag', key: 'org4SecuredOwnTarget' }, next: 'r4-12f-secure-echo' },
        { when: { type: 'flag', key: 'org4SupportedOrg5' }, next: 'r4-12g-support-echo' },
        { when: { type: 'flag', key: 'org4WatchedFireTwo' }, next: 'r4-12h-spectacle-echo' },
      ],
      fallback: 'r4-13-fire-two-result',
    },
  },
  {
    id: 'r4-12f-secure-echo', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-25',
    location: '要塞语音', mode: 'chat', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '四组自己的点保住了。五组求援没有接，今晚的资源和缺席援线都会一起写进战报。',
    background: 'fortress', historical: 'fictional', next: 'r4-13-fire-two-result',
  },
  {
    id: 'r4-12g-support-echo', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-25',
    location: '要塞语音', mode: 'chat', speaker: 'xuanmo', portrait: 'xuanmo',
    text: '拖去火2的两个人都进过点，五组知道谁来过。但固定结算不会替他们加分，四组也少拿了自己的资源。',
    background: 'fortress', historical: 'fictional', next: 'r4-13-fire-two-result',
  },
  {
    id: 'r4-12h-spectacle-echo', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-25',
    location: '要塞语音', mode: 'chat', speaker: 'huayue', portrait: 'huayue',
    text: '全组都看见火2怎么结束，也看见四组自己的点没人守。两件事我都会写，不拿热闹遮掉空白。',
    background: 'fortress', historical: 'fictional', next: 'r4-13-fire-two-result',
  },
  {
    id: 'r4-13-fire-two-result', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-25',
    title: '火2结算', location: '要塞语音', mode: 'chat', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '积分停下时，砚秋水先看四组这一列：“五组挑战火2失败，江南守住了。三组、四组做过的牵制只会留在各自战报里——别往五组分数上加，也别把我们的出勤抹掉。”',
    background: 'fortress', historical: 'confirmed',
    presentation: {
      cg: cgPath('cg29-second-fortress'),
      cgAlt: '火2结算前，夏娜守在城墙上指挥江南承受多组织分线牵制',
      ui: 'cinematic',
      transition: 'flash',
      camera: 'pull-back',
      atmosphere: 'embers',
      focus: 'left',
    },
    onEnter: [{ type: 'unlockCg', id: 'cg29-second-fortress' }],
    next: 'r4-13b-huayue-night-duty',
  },
  {
    id: 'r4-13b-huayue-night-duty', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-25',
    location: '天上白玉京值班语音', mode: 'chat', speaker: 'huayue', portrait: 'huayue',
    text: '语音里只剩键盘声。华月还在核对最后三个人的出勤：“你去睡，还是陪我等最后一个头像回话？先声明，别把这叫约会。表格听见了，会自动多生一列。”',
    background: 'nightMessage', historical: 'fictional',
    presentation: {
      ui: 'classic', transition: 'crossfade', camera: 'push-in', atmosphere: 'messages',
      sprites: [{ character: 'huayue', expression: 'neutral', pose: 'thinking', position: 'right', scale: 1.02 }],
    },
    choices: [
      {
        id: 'sleep-after-handoff', label: '“名单交给你，我去睡。明早第一件事看结果。”', tone: 'calm',
        effects: [{ type: 'relationship', character: 'huayue', key: 'trust', value: 1 }, { type: 'butterflyDelta', key: 'bf_cruelty', delta: 1 }],
        next: 'r4-13c-huayue-sends-to-sleep',
      },
      {
        id: 'stay-for-last-reply', label: '“我留下。不是首领陪高层，是我想陪你等最后一个头像亮起来。”', tone: 'warm',
        effects: [
          { type: 'flag', key: 'huayueSharedNightShift' },
          { type: 'relationship', character: 'huayue', key: 'trust', value: 2 },
          { type: 'relationship', character: 'huayue', key: 'affinity', value: 2 },
          { type: 'relationshipProgress', character: 'huayue', value: 30 },
          { type: 'butterflyDelta', key: 'bf_heart', delta: 1 },
        ],
        next: 'r4-13d-huayue-shares-shift',
      },
    ],
  },
  {
    id: 'r4-13c-huayue-sends-to-sleep', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-25',
    location: '天上白玉京值班语音', mode: 'chat', speaker: 'huayue', portrait: 'huayue',
    text: '“收到，八点前给你结果。”华月把麦克风静音了一瞬，又亮回来，“手机别静音。不是想你，是怕最后一个人只会找首领——这两件事目前很好区分。”',
    background: 'nightMessage', historical: 'fictional',
    presentation: {
      ui: 'classic', transition: 'crossfade', camera: 'hold', atmosphere: 'messages',
      sprites: [{ character: 'huayue', expression: 'neutral', pose: 'phone', position: 'right', scale: 1.02 }],
    },
    next: 'r4-14-merger-news',
  },
  {
    id: 'r4-13d-huayue-shares-shift', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-25',
    location: '天上白玉京值班语音', mode: 'chat', speaker: 'huayue', portrait: 'huayue',
    text: '“那就坐稳。”华月把你的名字拖到自己旁边，“最后一个回话以前，我负责核数字，你负责别睡着。要是真睡了，我会在记录里写：首领战后阵亡，死因是陪我值班。”',
    background: 'nightMessage', historical: 'fictional',
    presentation: {
      ui: 'classic', transition: 'crossfade', camera: 'push-in', atmosphere: 'messages',
      sprites: [{ character: 'huayue', expression: 'soft', pose: 'thinking', position: 'right', scale: 1.04 }],
    },
    next: 'r4-14-merger-news',
  },
  {
    id: 'r4-14-merger-news', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-26',
    location: '心跳成瘾私聊', mode: 'chat', speaker: 'heartbeat', portrait: 'heartbeat',
    text: '心跳成瘾把两份新成员申请推给你看：“OguriC（小栗帽）与告白于7月26日加入三组。五组还在，温陷留下，剑问白玉京接高层。别急着说谁吞了谁——两个人换组，不等于一整个组织消失。”',
    background: 'aftermath', historical: 'confirmed',
    presentation: {
      cg: cgPath('cg33-partial-transfer'),
      cgAlt: 'OguriC与告白带着个人行李走向三组，温陷仍守在亮灯的五组门口',
      ui: 'cinematic',
      transition: 'crossfade',
      camera: 'pull-back',
      atmosphere: 'petals',
      focus: 'right',
    },
    onEnter: [{ type: 'unlockCg', id: 'cg33-partial-transfer' }],
    next: 'r4-15-reward-drops',
  },
  {
    id: 'r4-15-reward-drops', chapter: 'act4', actLabel: '第四幕 · 稀有饰品', date: '2026-07-27',
    title: '一件不够分的饰品', location: '天上白玉京组织大厅', mode: 'chat', speaker: 'takemehand', portrait: 'takemehand',
    text: '稀有饰品只掉了一件。takemehand把自己的出勤截图放到桌上：“我每一场都在，而且正好缺这个。砚秋水说要照之前的表，我只想知道——表里有没有看见我今天真的来了？”',
    background: 'rewardHall', music: 'afterOnline', historical: 'confirmed',
    presentation: {
      cg: cgPath('cg30-rare-accessory'),
      cgAlt: '四组奖励桌上只有一件稀有饰品，takemehand指向本次贡献，砚秋水守着事先公布的账本',
      ui: 'cinematic',
      transition: 'ink',
      camera: 'pull-back',
      atmosphere: 'dust',
      focus: 'center',
    },
    onEnter: [{ type: 'unlockCg', id: 'cg30-rare-accessory' }],
    // 开场承诺在奖励真正落地时重新出现；旧档没有承诺旗标则保持原流程。
    next: {
      cases: [
        { when: { type: 'flag', key: 'org4PublicLedger' }, next: 'r4-15b-public-ledger-memory' },
        { when: { type: 'flag', key: 'org4LeaderDiscretion' }, next: 'r4-15c-discretion-memory' },
        { when: { type: 'flag', key: 'org4MemberVote' }, next: 'r4-15d-member-vote-memory' },
      ],
      fallback: 'r4-16-first-allocation',
    },
  },
  {
    id: 'r4-15b-public-ledger-memory', chapter: 'act4', actLabel: '第四幕 · 稀有饰品', date: '2026-07-27',
    location: '天上白玉京组织大厅', mode: 'chat', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '第一页的公开表还在，这件又只有一件。先把出勤、需求和轮换顺序读完，再碰确认键。',
    background: 'rewardHall', historical: 'fictional', next: 'r4-16-first-allocation',
  },
  {
    id: 'r4-15c-discretion-memory', chapter: 'act4', actLabel: '第四幕 · 稀有饰品', date: '2026-07-27',
    location: '天上白玉京组织大厅', mode: 'chat', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '你开区时留的是现场裁量，不是“战力最高自动拿”。现在把指标念出来，我才知道这次例外越过了谁。',
    background: 'rewardHall', historical: 'fictional', next: 'r4-16-first-allocation',
  },
  {
    id: 'r4-15d-member-vote-memory', chapter: 'act4', actLabel: '第四幕 · 稀有饰品', date: '2026-07-27',
    location: '天上白玉京组织大厅', mode: 'chat', speaker: 'huayue', portrait: 'huayue',
    text: '你说参战的人投票。候选、票数和缺席者怎么处理，我都留了空栏；现在别漏掉任何一项。',
    background: 'rewardHall', historical: 'fictional', next: 'r4-16-first-allocation',
  },
  {
    id: 'r4-16-first-allocation', chapter: 'act4', actLabel: '第四幕 · 稀有饰品', date: '2026-07-27',
    location: '分配界面', mode: 'novel', speaker: 'player',
    text: '饰品盒被推到桌子中央。公开账本翻在第一页，takemehand的出勤截图亮在另一边，最强成员的战力数字则悬在屏幕上。确认键只接受一个名字。',
    background: 'rewardHall',
    presentation: {
      cg: cgPath('cg30-rare-accessory'),
      cgAlt: '砚秋水与takemehand站在同一件稀有饰品两侧，把最终分配决定交给玩家',
      ui: 'classic',
      transition: 'crossfade',
      camera: 'push-in',
      atmosphere: 'dust',
      focus: 'center',
    },
    choices: [
      {
        id: 'follow-published-rule', label: '把饰品放到按账本排在最前的人面前', tone: 'calm',
        condition: { type: 'flag', key: 'org4PublicLedger' },
        effects: [
          { type: 'flag', key: 'org4FollowedLedger' }, { type: 'stat', key: 'reputation', value: 2 },
          { type: 'relationship', character: 'yanqiu', key: 'trust', value: 2 }, { type: 'relationship', character: 'takemehand', key: 'trust', value: 1 },
          { type: 'butterflyDelta', key: 'bf_diplomacy', delta: 1 },
        ], next: 'r4-16b-ledger-allocation-reply',
      },
      {
        id: 'award-takemehand', label: '把饰品推过去：“takemehand，按这次出勤和需求。”', tone: 'warm',
        effects: [
          { type: 'flag', key: 'org4AwardedTakemehand' }, { type: 'relationship', character: 'takemehand', key: 'trust', value: 2 },
          { type: 'relationship', character: 'takemehand', key: 'affinity', value: 1 }, { type: 'relationship', character: 'yanqiu', key: 'trust', value: -2 },
          { type: 'butterflyDelta', key: 'bf_heart', delta: 1 },
        ], next: 'r4-16c-takemehand-allocation-reply',
      },
      {
        id: 'award-core-power', label: '“给战力最高的。今晚就要变强。”', tone: 'bold',
        effects: [
          { type: 'flag', key: 'org4AwardedPower' }, { type: 'stat', key: 'power', value: 2 },
          { type: 'relationship', character: 'takemehand', key: 'trust', value: -2 }, { type: 'relationship', character: 'yanqiu', key: 'trust', value: -1 },
          { type: 'butterflyDelta', key: 'bf_cruelty', delta: 1 },
        ], next: 'r4-16d-power-allocation-reply',
      },
      {
        id: 'open-revote', label: '把候选记录投到群里：“参战的人，现在投票。”', tone: 'secret',
        effects: [
          { type: 'flag', key: 'org4OpenedVote' }, { type: 'stat', key: 'cohesion', value: 1 },
          { type: 'relationship', character: 'huayue', key: 'trust', value: 2 },
          { type: 'butterflyDelta', key: 'bf_chaos', delta: 1 }, { type: 'butterflyDelta', key: 'bf_heart', delta: 1 },
        ], next: 'r4-16e-vote-allocation-reply',
      },
    ],
  },
  {
    id: 'r4-16b-ledger-allocation-reply', chapter: 'act4', actLabel: '第四幕 · 稀有饰品', date: '2026-07-27',
    location: '分配界面', mode: 'chat', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '第一页顺序和本次出勤截图一起公开。按既定表发，不代表没人失望，但至少标准没有等确认键亮起才换。',
    background: 'rewardHall', historical: 'fictional', next: 'r4-17-objection',
  },
  {
    id: 'r4-16c-takemehand-allocation-reply', chapter: 'act4', actLabel: '第四幕 · 稀有饰品', date: '2026-07-27',
    location: '分配界面', mode: 'chat', speaker: 'takemehand', portrait: 'takemehand',
    text: '我收下，但按出勤和需求给我就是一次例外。第一页顺序落空，下次怎么写，不能等别人追问。',
    background: 'rewardHall', historical: 'fictional', next: 'r4-17-objection',
  },
  {
    id: 'r4-16d-power-allocation-reply', chapter: 'act4', actLabel: '第四幕 · 稀有饰品', date: '2026-07-27',
    location: '分配界面', mode: 'chat', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '战力最高的人拿了。所有人都看见你为今晚改了标准，这不能被当成没有人反对的共识。',
    background: 'rewardHall', historical: 'fictional', next: 'r4-17-objection',
  },
  {
    id: 'r4-16e-vote-allocation-reply', chapter: 'act4', actLabel: '第四幕 · 稀有饰品', date: '2026-07-27',
    location: '分配界面', mode: 'chat', speaker: 'huayue', portrait: 'huayue',
    text: '票数公开了，缺席的人没有投票却也要承受结果。我把这句补在记录下面，不让“大家决定”替我们省掉责任。',
    background: 'rewardHall', historical: 'fictional', next: 'r4-17-objection',
  },
  {
    id: 'r4-17-objection', chapter: 'act4', actLabel: '第四幕 · 稀有饰品', date: '2026-07-27',
    location: '天上白玉京组织群', mode: 'chat', speaker: 'takemehand', portrait: 'takemehand',
    text: 'takemehand没有去碰饰品盒，只把出勤截图重新放大：“我不是非要拿。我想知道，下次我把晚上留给四组，最后看的到底是什么。要是到确认前才换标准，就直接说看首领心情。”',
    background: 'rewardHall', historical: 'adapted',
    presentation: {
      ui: 'classic', transition: 'crossfade', camera: 'push-in', atmosphere: 'paper',
      sprites: [{ character: 'takemehand', expression: 'determined', pose: 'relaxed', position: 'right', scale: 1.01 }],
    },
    next: {
      cases: [
        { when: { type: 'flag', key: 'org4FollowedLedger' }, next: 'r4-17b-ledger-echo' },
        { when: { type: 'flag', key: 'org4AwardedTakemehand' }, next: 'r4-17c-takemehand-echo' },
        { when: { type: 'flag', key: 'org4AwardedPower' }, next: 'r4-17d-power-echo' },
        { when: { type: 'flag', key: 'org4OpenedVote' }, next: 'r4-17e-vote-echo' },
      ],
      fallback: 'r4-18-yanqiu-answer',
    },
  },
  {
    id: 'r4-17b-ledger-echo', chapter: 'act4', actLabel: '第四幕 · 稀有饰品', date: '2026-07-27',
    location: '天上白玉京组织群', mode: 'chat', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '第一页和本次名单已经并排发出。takemehand没拿到，但这次不是确认前才临时改口。',
    background: 'rewardHall', historical: 'fictional', next: 'r4-18-yanqiu-answer',
  },
  {
    id: 'r4-17c-takemehand-echo', chapter: 'act4', actLabel: '第四幕 · 稀有饰品', date: '2026-07-27',
    location: '天上白玉京组织群', mode: 'chat', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '按出勤和需求把饰品推过去，第一页的轮换顺序就落空了。例外可以成立，但下一次标准必须重写。',
    background: 'rewardHall', historical: 'fictional', next: 'r4-18-yanqiu-answer',
  },
  {
    id: 'r4-17d-power-echo', chapter: 'act4', actLabel: '第四幕 · 稀有饰品', date: '2026-07-27',
    location: '天上白玉京组织群', mode: 'chat', speaker: 'takemehand', portrait: 'takemehand',
    text: '战力最高的人已经拿了。大家看见你为今晚换规则了，至少把“以后也这样”说清，别留成无声共识。',
    background: 'rewardHall', historical: 'fictional', next: 'r4-18-yanqiu-answer',
  },
  {
    id: 'r4-17e-vote-echo', chapter: 'act4', actLabel: '第四幕 · 稀有饰品', date: '2026-07-27',
    location: '天上白玉京组织群', mode: 'chat', speaker: 'huayue', portrait: 'huayue',
    text: '票数和候选都贴了，缺席者也被单独标出。投票没有消掉争议，只让争议有一份能复核的记录。',
    background: 'rewardHall', historical: 'fictional', next: 'r4-18-yanqiu-answer',
  },
  {
    id: 'r4-18-yanqiu-answer', chapter: 'act4', actLabel: '第四幕 · 稀有饰品', date: '2026-07-27',
    location: '天上白玉京组织群', mode: 'chat', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '砚秋水合上账本：“规则不是为了让每个人满意，是为了让我能提前告诉没拿到的人：为什么不是他。例外可以有，可例外的代价不能等别人追问才承认。我解释不了这次结果。”',
    background: 'rewardHall', historical: 'adapted',
    presentation: {
      ui: 'classic', transition: 'crossfade', camera: 'hold', atmosphere: 'paper',
      sprites: [
        { character: 'yanqiu', expression: 'sad', pose: 'thinking', position: 'left', scale: .92 },
        { character: 'takemehand', expression: 'concerned', pose: 'relaxed', position: 'right', scale: .9, dimmed: true },
      ],
    },
    next: 'r4-19-final-ruling',
  },
  {
    id: 'r4-19-final-ruling', chapter: 'act4', actLabel: '第四幕 · 稀有饰品', date: '2026-07-27',
    title: '谁来承担结果', location: '四组管理私聊', mode: 'novel', speaker: 'huayue', portrait: 'huayue',
    text: '华月乌大王把吵到一半的群暂时禁言：“现在再补一件饰品，也补不了刚才那句为什么。你可以把过程重开，可以坚持结果。要是你已经不想收这个残局，就把徽章给我——我接。”',
    background: 'rewardHall', choices: [
      {
        id: 'publish-and-compensate', label: '“聊天和记录全公开。没拿到的人补偿，规则先冻结。”', tone: 'calm',
        effects: [
          { type: 'flag', key: 'org4RepairedAllocation' }, { type: 'stat', key: 'resources', value: -2 },
          { type: 'stat', key: 'reputation', value: 1 }, { type: 'relationship', character: 'yanqiu', key: 'trust', value: 2 },
          { type: 'relationship', character: 'takemehand', key: 'trust', value: 2 },
          { type: 'relationshipProgress', character: 'yanqiu', value: 35 },
          { type: 'butterflyDelta', key: 'bf_diplomacy', delta: 1 }, { type: 'butterflyDelta', key: 'bf_heart', delta: 1 },
        ], next: 'r4-20-yanqiu-decision',
      },
      {
        id: 'formal-revote', label: '“刚才那次不算。按写下来的标准重新投。”', tone: 'bold',
        effects: [
          { type: 'flag', key: 'org4ReversedAllocation' }, { type: 'stat', key: 'reputation', value: 2 },
          { type: 'relationship', character: 'yanqiu', key: 'trust', value: 3 }, { type: 'relationship', character: 'huayue', key: 'trust', value: 1 },
          { type: 'relationshipProgress', character: 'yanqiu', value: 35 },
          { type: 'butterflyDelta', key: 'bf_diplomacy', delta: 1 },
        ], next: 'r4-20-yanqiu-decision',
      },
      {
        id: 'hold-result', label: '“结果不变。下一件开始用新规则。”', tone: 'danger',
        effects: [
          { type: 'flag', key: 'org4HeldAllocation' }, { type: 'stat', key: 'cohesion', value: -2 },
          { type: 'relationship', character: 'yanqiu', key: 'trust', value: -2 },
          { type: 'butterflyDelta', key: 'bf_cruelty', delta: 2 },
        ], next: 'r4-20-yanqiu-decision',
      },
      {
        id: 'handoff-leadership', label: '把首领徽章放到华月面前：“残局交给你。”', tone: 'secret',
        effects: [
          { type: 'flag', key: 'org4VoluntaryHandoff' }, { type: 'stat', key: 'reputation', value: 1 },
          { type: 'relationship', character: 'huayue', key: 'trust', value: 3 }, { type: 'relationship', character: 'yanqiu', key: 'trust', value: 1 },
          { type: 'butterflyDelta', key: 'bf_shadow', delta: 1 },
        ], next: 'r4-20-yanqiu-decision',
      },
    ],
  },
  {
    id: 'r4-20-yanqiu-decision', chapter: 'act4', actLabel: '第四幕 · 稀有饰品', date: '2026-07-27',
    location: '四组管理群', mode: 'chat', speaker: 'huayue', portrait: 'huayue',
    text: '华月把禁言解除，先对砚秋水说：“你要留下，我给你把账本搬回来；你要走，我替你把门打开。谁都不准把主动离开写成被降级。至于首领的位置——真空下来，我坐。”',
    background: 'aftermath', historical: 'confirmed',
    // This two-person tableau visually bridges the ruling to either stay or handoff branch.
    presentation: {
      ui: 'classic', transition: 'crossfade', camera: 'pull-back', atmosphere: 'paper',
      sprites: [
        { character: 'huayue', expression: 'neutral', pose: 'thinking', position: 'left', scale: .9 },
        { character: 'yanqiu', expression: 'sad', pose: 'thinking', position: 'right', scale: .9, dimmed: true },
      ],
    },
    next: {
      cases: [
        {
          when: { type: 'all', conditions: [
            { type: 'relationship', character: 'yanqiu', key: 'trust', operator: 'gte', value: 4 },
            { type: 'any', conditions: [{ type: 'flag', key: 'org4RepairedAllocation' }, { type: 'flag', key: 'org4ReversedAllocation' }] },
          ] }, next: 'r4-21-yanqiu-stays',
        },
      ], fallback: 'r4-21-yanqiu-leaves',
    },
  },
  {
    id: 'r4-21-yanqiu-stays', chapter: 'act4', actLabel: '第四幕 · 留在账本里', date: '2026-07-27',
    location: '四组管理私聊', mode: 'chat', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '砚秋水重新打开账本：“我留下，不是因为补偿够了。是因为你肯让自己按下的确认键失效一次。明天开始，两个人共同确认；有例外，就当场写清谁承担。”',
    background: 'rewardHall', historical: 'fictional',
    presentation: {
      ui: 'classic', transition: 'crossfade', camera: 'push-in', atmosphere: 'petals',
      sprites: [{ character: 'yanqiu', expression: 'soft', pose: 'thinking', position: 'center', scale: 1.02 }],
    },
    onEnter: [{ type: 'flag', key: 'yanqiuStayed' }, { type: 'stance', character: 'yanqiu', value: 'support' }],
    next: 'r4-21b-huayue-after-handoff',
  },
  {
    id: 'r4-21-yanqiu-leaves', chapter: 'act4', actLabel: '第四幕 · 主动离开', date: '2026-07-27',
    location: '四组管理群', mode: 'chat', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '砚秋水把账本权限转给华月：“没人撤我的职，是我不想再替这个结果背书。下一张分配表我已经起了头，你接着写。”她退出后，华月没有发接任宣言，只把那张表补完。',
    background: 'aftermath', historical: 'confirmed',
    presentation: {
      cg: cgPath('cg39-yanqiu-handoff'),
      cgAlt: '砚秋水站在门口主动交出账本，华月乌大王坐到管理桌前接任并翻开下一份分配表',
      ui: 'cinematic',
      transition: 'crossfade',
      camera: 'pull-back',
      atmosphere: 'paper',
      focus: 'center',
    },
    onEnter: [
      { type: 'flag', key: 'yanqiuLeftOrg4' },
      { type: 'stance', character: 'yanqiu', value: 'left' },
      { type: 'unlockCg', id: 'cg39-yanqiu-handoff' },
    ],
    next: 'r4-21b-huayue-after-handoff',
  },
  {
    id: 'r4-21b-huayue-after-handoff', chapter: 'act4', actLabel: '第四幕 · 收尾的人', date: '2026-07-27',
    location: '四组管理私聊', mode: 'chat', speaker: 'huayue', portrait: 'huayue',
    text: '华月把明早的值班名单贴到聊天里，把首领徽章留在桌面中央：“职位照刚才说的办，我不会替你改口。但你手还在抖——要我当没看见，还是把你真正怕的那句听完？”',
    background: 'nightMessage', historical: 'fictional',
    presentation: {
      ui: 'classic', transition: 'crossfade', camera: 'push-in', atmosphere: 'paper',
      sprites: [{ character: 'huayue', expression: 'concerned', pose: 'thinking', position: 'center', scale: 1.03 }],
    },
    choices: [
      {
        id: 'leave-it-unspoken', label: '“谢谢。今晚先收尾，其他话明天再说。”', tone: 'calm',
        effects: [{ type: 'relationship', character: 'huayue', key: 'trust', value: 1 }, { type: 'butterflyDelta', key: 'bf_cruelty', delta: 1 }],
        next: 'r4-21c-huayue-sets-reminder',
      },
      {
        id: 'entrust-the-shaking-hands', label: '“职位照刚才的决定；害怕和手抖，我想让你看见。”', tone: 'warm',
        effects: [
          { type: 'flag', key: 'huayueTrustedWithWeakness' },
          { type: 'relationship', character: 'huayue', key: 'trust', value: 2 },
          { type: 'relationship', character: 'huayue', key: 'affinity', value: 3 },
          { type: 'relationshipProgress', character: 'huayue', value: 20 },
          { type: 'butterflyDelta', key: 'bf_heart', delta: 1 }, { type: 'butterflyDelta', key: 'bf_shadow', delta: 1 },
        ],
        next: 'r4-21d-huayue-takes-the-truth',
      },
    ],
  },
  {
    id: 'r4-21c-huayue-sets-reminder', chapter: 'act4', actLabel: '第四幕 · 收尾的人', date: '2026-07-27',
    location: '四组管理私聊', mode: 'chat', speaker: 'huayue', portrait: 'huayue',
    text: '“可以，明天再说。”华月给那句话设了八点提醒，“我只提醒一次。第二次就算催债，四组目前的预算还请不起这么温柔的催收员。”',
    background: 'nightMessage', historical: 'fictional',
    presentation: {
      ui: 'classic', transition: 'crossfade', camera: 'hold', atmosphere: 'paper',
      sprites: [{ character: 'huayue', expression: 'neutral', pose: 'phone', position: 'center', scale: 1.02 }],
    },
    next: 'r4-22-sixth-falls',
  },
  {
    id: 'r4-21d-huayue-takes-the-truth', chapter: 'act4', actLabel: '第四幕 · 收尾的人', date: '2026-07-27',
    location: '四组管理私聊', mode: 'chat', speaker: 'huayue', portrait: 'huayue',
    text: '华月把徽章放回刚才决定的那一侧，只把手覆在你发抖的手背上：“那就这么分。职位按约定，害怕别再独吞。明早八点一起上线——排班表把我们放在同一行，暂时比情话可靠。”',
    background: 'nightMessage', historical: 'fictional',
    presentation: {
      ui: 'classic', transition: 'crossfade', camera: 'push-in', atmosphere: 'petals',
      sprites: [{ character: 'huayue', expression: 'soft', pose: 'thinking', position: 'center', scale: 1.05 }],
    },
    next: 'r4-22-sixth-falls',
  },
  {
    // Keep the legacy node ID as the route entry, then give each fixed July 28 event its own matching CG.
    id: 'r4-22-sixth-falls', chapter: 'epilogue', actLabel: '尾声 · 下线之前', date: '2026-07-28',
    location: '六组管理交接', mode: 'interlude', speaker: 'narrator',
    text: '7月28日，yyT与祈福冲突后被移出公共群，AVUCII接手六组日常管理。成员随后并入江南，六组解散；旧组织名从列表熄灭前，管理权限先完成了最后一次交接。',
    background: 'nightMessage', historical: 'confirmed',
    presentation: {
      cg: cgPath('cg40-yyt-avucii-handoff'),
      cgAlt: 'yyT离开公共群入口，AVUCII在六组管理桌前接过日常管理钥匙，成员准备并入江南',
      ui: 'cinematic',
      transition: 'ink',
      camera: 'pull-back',
      atmosphere: 'paper',
      focus: 'center',
    },
    onEnter: [
      { type: 'flag', key: 'yytRemovedFromPublicGroup' },
      { type: 'flag', key: 'avuciiTookOverOrg6' },
      { type: 'flag', key: 'org6MergedOrg2' },
      { type: 'unlockCg', id: 'cg40-yyt-avucii-handoff' },
    ],
    next: 'r4-22b-chenyi-exit',
  },
  {
    id: 'r4-22b-chenyi-exit', chapter: 'epilogue', actLabel: '尾声 · 没有新的争吵', date: '2026-07-28',
    location: '江南成员列表', mode: 'interlude', speaker: 'narrator',
    text: '同一天，辰逸只是一天没上线，也明确不想继续玩。他以普通成员身份被江南移出，没有新的冲突，也没有再开一场会。',
    background: 'nightMessage', historical: 'confirmed',
    presentation: {
      cg: cgPath('cg32-chenyi-leaves'),
      cgAlt: '7月28日，辰逸以普通成员身份放下令牌，因一天未上线且不想继续玩而平静离场',
      ui: 'cinematic', transition: 'crossfade', camera: 'pull-back', atmosphere: 'dust', focus: 'center',
    },
    onEnter: [
      { type: 'flag', key: 'chenyiRemovedInactiveOnJuly28' },
      { type: 'unlockCg', id: 'cg32-chenyi-leaves' },
    ],
    next: 'r4-22a-gaobai-to-org1',
  },
  {
    id: 'r4-22a-gaobai-to-org1', chapter: 'epilogue', actLabel: '尾声 · 两天', date: '2026-07-28',
    location: '心跳成瘾私聊', mode: 'chat', speaker: 'heartbeat', portrait: 'heartbeat',
    text: '心跳成瘾又发来一张退组通知：“告白去一组了。7月26日才和OguriC进三组，今天28日——正好两天。别问我为什么，我也只来得及把高层名单改回去。”',
    background: 'nightMessage', historical: 'confirmed', next: 'r4-23-member-night-hub',
  },
  {
    // 每名成员的夜话只结算一次；回应后返回本节点，玩家可自行决定看几段再进入关系选择。
    id: 'r4-23-member-night-hub', chapter: 'epilogue', actLabel: '尾声 · 成员夜话', date: '2026-07-28',
    location: '天上白玉京 · 在线列表', mode: 'chat', speaker: 'huayue', portrait: 'huayue',
    text: '过了零点，四组群终于不再滚动。华月把仍亮着的四个头像排到你面前：“账可以明天算，人今晚还醒着。你想先敲谁的窗口？”',
    background: 'nightMessage', historical: 'fictional',
    presentation: {
      ui: 'private-chat', transition: 'crossfade', camera: 'push-in', atmosphere: 'messages',
      sprites: [{ character: 'huayue', expression: 'soft', pose: 'phone', position: 'center', scale: 1.03 }],
    },
    choices: [
      {
        id: 'night-yanqiu', label: '敲开砚秋水的账本私聊', tone: 'calm',
        condition: { type: 'flag', key: 'r4NightYanqiuSeen', value: false },
        effects: [], next: 'r4-23a-yanqiu-night',
      },
      {
        id: 'night-huayue', label: '问华月为什么还没下线', tone: 'warm',
        condition: { type: 'flag', key: 'r4NightHuayueSeen', value: false },
        effects: [], next: 'r4-23c-huayue-night',
      },
      {
        id: 'night-xuanmo', label: '回复玄末之缘的撤回消息', tone: 'secret',
        condition: { type: 'flag', key: 'r4NightXuanmoSeen', value: false },
        effects: [], next: 'r4-23e-xuanmo-night',
      },
      {
        id: 'night-takemehand', label: '给takemehand发一句“在吗”', tone: 'warm',
        condition: { type: 'flag', key: 'r4NightTakemehandSeen', value: false },
        effects: [], next: 'r4-23g-takemehand-night',
      },
      {
        id: 'finish-member-night', label: '关掉群聊，看看谁还在等你的私人回答', tone: 'calm',
        effects: [], next: 'r4-23-bond-router',
      },
    ],
  },
  {
    id: 'r4-23a-yanqiu-night', chapter: 'epilogue', actLabel: '成员夜话 · 砚秋水', date: '2026-07-28',
    location: '共享账本私聊', mode: 'chat', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '砚秋水发来一张没保存的表。最后一栏不是贡献，而是“今天想退出、但没有退出的次数”。她说：“我记了自己，没记你。你的那一格，要空着还是补上？”',
    background: 'nightMessage', historical: 'fictional',
    presentation: { sprites: [{ character: 'yanqiu', expression: 'soft', pose: 'thinking', position: 'center', scale: 1.03 }] },
    choices: [
      {
        id: 'write-one-count', label: '在空格里写下“1”：“我也想过，只是没敢说。”', tone: 'warm',
        effects: [
          { type: 'flag', key: 'r4NightYanqiuSeen' },
          { type: 'relationship', character: 'yanqiu', key: 'trust', value: 1 },
          { type: 'relationship', character: 'yanqiu', key: 'affinity', value: 1 },
          { type: 'relationshipProgress', character: 'yanqiu', value: 30 },
        ], next: 'r4-23b-yanqiu-reply',
      },
      {
        id: 'leave-count-blank', label: '“先空着。不是否认，是我还没学会把它写准。”', tone: 'calm',
        effects: [
          { type: 'flag', key: 'r4NightYanqiuSeen' },
          { type: 'relationship', character: 'yanqiu', key: 'trust', value: 1 },
          { type: 'relationshipProgress', character: 'yanqiu', value: 15 },
        ], next: 'r4-23b-yanqiu-reply',
      },
    ],
  },
  {
    id: 'r4-23b-yanqiu-reply', chapter: 'epilogue', actLabel: '成员夜话 · 砚秋水', date: '2026-07-28',
    location: '共享账本私聊', mode: 'chat', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '她把表另存为“不要公开.xlsx”，又补了一句：“很好，四组今晚终于有一份不拿来证明谁正确的账。文件名很不专业，所以大概最诚实。”',
    background: 'nightMessage', historical: 'fictional', next: 'r4-23-member-night-hub',
  },
  {
    id: 'r4-23c-huayue-night', chapter: 'epilogue', actLabel: '成员夜话 · 华月', date: '2026-07-28',
    location: '四组值班私聊', mode: 'chat', speaker: 'huayue', portrait: 'huayue',
    text: '华月发来一张定到早上六点的提醒：“别误会，我没打算通宵。我只是设置了七个闹钟，准备每响一个就关掉一个，以此证明组织管理具有阶段性成果。”',
    background: 'nightMessage', historical: 'fictional',
    presentation: { sprites: [{ character: 'huayue', expression: 'soft', pose: 'phone', position: 'center', scale: 1.04 }] },
    choices: [
      {
        id: 'take-one-alarm', label: '“把三点那个给我。你只需要负责真的睡着。”', tone: 'warm',
        effects: [
          { type: 'flag', key: 'r4NightHuayueSeen' },
          { type: 'relationship', character: 'huayue', key: 'trust', value: 1 },
          { type: 'relationship', character: 'huayue', key: 'affinity', value: 1 },
          { type: 'relationshipProgress', character: 'huayue', value: 20 },
        ], next: 'r4-23d-huayue-reply',
      },
      {
        id: 'audit-seven-alarms', label: '“先删六个。七个闹钟不是制度，是电子形式的焦虑。”', tone: 'calm',
        effects: [
          { type: 'flag', key: 'r4NightHuayueSeen' },
          { type: 'relationship', character: 'huayue', key: 'trust', value: 1 },
          { type: 'relationshipProgress', character: 'huayue', value: 10 },
        ], next: 'r4-23d-huayue-reply',
      },
    ],
  },
  {
    id: 'r4-23d-huayue-reply', chapter: 'epilogue', actLabel: '成员夜话 · 华月', date: '2026-07-28',
    location: '四组值班私聊', mode: 'chat', speaker: 'huayue', portrait: 'huayue',
    text: '华月真的删到只剩一个，随后把截图发给你：“成交。明早谁先醒谁发早安，后醒的那个人不得以首领权限追究。”',
    background: 'nightMessage', historical: 'fictional', next: 'r4-23-member-night-hub',
  },
  {
    id: 'r4-23e-xuanmo-night', chapter: 'epilogue', actLabel: '成员夜话 · 玄末之缘', date: '2026-07-28',
    location: '玄末之缘私聊', mode: 'chat', speaker: 'xuanmo', portrait: 'xuanmo',
    text: '玄末之缘把撤回的那句重新发来：“我白天说‘随便’，其实是怕一开口又被算成站队。一个群里连随便都要选阵营，这游戏的聊天系统比决斗场难。”',
    background: 'nightMessage', historical: 'fictional',
    presentation: { sprites: [{ character: 'xuanmo', expression: 'concerned', pose: 'phone', position: 'center', scale: 1.02 }] },
    choices: [
      {
        id: 'promise-non-vote', label: '“以后你说累了，就只算累了，不自动折算成一票。”', tone: 'warm',
        effects: [
          { type: 'flag', key: 'r4NightXuanmoSeen' },
          { type: 'relationship', character: 'xuanmo', key: 'trust', value: 2 },
          { type: 'relationship', character: 'xuanmo', key: 'affinity', value: 1 },
        ], next: 'r4-23f-xuanmo-reply',
      },
      {
        id: 'offer-private-channel', label: '“不想在群里说，就私聊我。沉默不用提交理由。”', tone: 'calm',
        effects: [
          { type: 'flag', key: 'r4NightXuanmoSeen' },
          { type: 'relationship', character: 'xuanmo', key: 'trust', value: 2 },
        ], next: 'r4-23f-xuanmo-reply',
      },
    ],
  },
  {
    id: 'r4-23f-xuanmo-reply', chapter: 'epilogue', actLabel: '成员夜话 · 玄末之缘', date: '2026-07-28',
    location: '玄末之缘私聊', mode: 'chat', speaker: 'xuanmo', portrait: 'xuanmo',
    text: '“那我先试一句：今天很累，但没想退。”玄末之缘发完就把在线状态改成隐身，“看，隐身也不是叛变。技术上只是把绿点关了。”',
    background: 'nightMessage', historical: 'fictional', next: 'r4-23-member-night-hub',
  },
  {
    id: 'r4-23g-takemehand-night', chapter: 'epilogue', actLabel: '成员夜话 · takemehand', date: '2026-07-28',
    location: 'takemehand私聊', mode: 'chat', speaker: 'takemehand', portrait: 'takemehand',
    text: '“在。”takemehand秒回，又故意停了十秒，“我想试试晚回会不会出事。结果除了你发了第二个问号，世界没有毁灭。这个功能建议全区安装。”',
    background: 'nightMessage', historical: 'fictional',
    presentation: { sprites: [{ character: 'takemehand', expression: 'soft', pose: 'relaxed', position: 'center', scale: 1.03 }] },
    choices: [
      {
        id: 'wait-for-reply', label: '删掉准备发出的第三个问号：“那我继续等。”', tone: 'warm',
        effects: [
          { type: 'flag', key: 'r4NightTakemehandSeen' },
          { type: 'relationship', character: 'takemehand', key: 'trust', value: 1 },
          { type: 'relationship', character: 'takemehand', key: 'affinity', value: 1 },
          { type: 'relationshipProgress', character: 'takemehand', value: 30 },
        ], next: 'r4-23h-takemehand-reply',
      },
      {
        id: 'schedule-silence', label: '“下次超过十分钟，我们就默认彼此都在打本。”', tone: 'calm',
        effects: [
          { type: 'flag', key: 'r4NightTakemehandSeen' },
          { type: 'relationship', character: 'takemehand', key: 'trust', value: 1 },
          { type: 'relationshipProgress', character: 'takemehand', value: 15 },
        ], next: 'r4-23h-takemehand-reply',
      },
    ],
  },
  {
    id: 'r4-23h-takemehand-reply', chapter: 'epilogue', actLabel: '成员夜话 · takemehand', date: '2026-07-28',
    location: 'takemehand私聊', mode: 'chat', speaker: 'takemehand', portrait: 'takemehand',
    text: '他发来一个“已阅”，紧跟着撤回：“这个词看着太像高层。重来——晚安。明天我上线以后再回你，顺序别搞反。”',
    background: 'nightMessage', historical: 'fictional', next: 'r4-23-member-night-hub',
  },
  {
    id: 'r4-23-bond-router', chapter: 'epilogue', actLabel: '尾声 · 私聊窗口', date: '2026-07-28',
    location: '好友列表', mode: 'chat', speaker: 'huayue', portrait: 'huayue',
    text: '华月把最后一份名单保存：“组织群我盯着。今晚有几扇私聊窗口还亮着；要不要推开其中一扇，由你自己选。没亮的就别硬敲，明天还有明天的话。”', background: 'nightMessage',
    choices: [
      {
        id: 'choose-huayue-bond', label: '留下来，和华月一起守完这班', tone: 'warm',
        condition: { type: 'all', conditions: [
          { type: 'flag', key: 'huayueSharedVulnerability' },
          { type: 'flag', key: 'huayueSharedNightShift' },
          { type: 'flag', key: 'huayueTrustedWithWeakness' },
          { type: 'relationshipProgress', character: 'huayue', operator: 'gte', value: 100 },
          { type: 'relationship', character: 'huayue', key: 'trust', operator: 'gte', value: 6 },
          { type: 'relationship', character: 'huayue', key: 'affinity', operator: 'gte', value: 6 },
        ] },
        effects: [], next: 'r4-24-bond-huayue',
      },
      {
        id: 'choose-yanqiu-bond', label: '敲开砚秋水没有写进账本的窗口', tone: 'warm',
        condition: { type: 'all', conditions: [
          { type: 'flag', key: 'yanqiuStayed' },
          { type: 'relationshipProgress', character: 'yanqiu', operator: 'gte', value: 100 },
          { type: 'relationship', character: 'yanqiu', key: 'trust', operator: 'gte', value: 5 },
          { type: 'relationship', character: 'yanqiu', key: 'affinity', operator: 'gte', value: 1 },
        ] },
        effects: [], next: 'r4-24-bond-yanqiu',
      },
      {
        id: 'choose-takemehand-bond', label: '等takemehand把那句认真回答发完', tone: 'warm',
        condition: { type: 'all', conditions: [
          { type: 'flag', key: 'org4ProtectedTakemehand' },
          { type: 'relationshipProgress', character: 'takemehand', operator: 'gte', value: 100 },
          { type: 'relationship', character: 'takemehand', key: 'trust', operator: 'gte', value: 5 },
          { type: 'relationship', character: 'takemehand', key: 'affinity', operator: 'gte', value: 3 },
        ] },
        effects: [], next: 'r4-24-bond-takemehand',
      },
      {
        id: 'keep-ordinary-relationship', label: '把今晚留在朋友和成员的位置', tone: 'calm',
        effects: [], next: 'r4-25-ending-router',
      },
    ],
  },
  bondEndingNode({
    id: 'r4-24-bond-huayue', actLabel: '尾声 · 华月乌大王',
    location: '天上白玉京夜班', character: 'huayue',
    text: '华月发来第二天的值班表，你和她的名字仍在同一行：“首领徽章在谁手里，都只是系统里的一格。我缺的是下完决定以后，肯告诉我手还在抖的人。明天你是不是首领，都不影响八点和我一起上线。迟到的话，我只@你一次——然后去你好友列表里抓人。”',
    cg: cgPath('cg44-bond-huayue'),
    cgAlt: '夜班结束后，华月乌大王与玩家并肩核对第二天名单，两人的名字留在同一行而首领徽章放在一旁',
    cgId: 'cg44-bond-huayue',
    atmosphere: 'petals',
    focus: 'right',
    next: 'r4-25-ending-router',
  }),
  bondEndingNode({
    id: 'r4-24-bond-yanqiu', actLabel: '尾声 · 砚秋水',
    location: '共享账本之外', character: 'yanqiu',
    text: '最后一栏我没写进表里。下次你犹豫的时候，先私聊我。不是战术顾问的意见——是我想知道，你准备怎么选。',
    cg: cgPath('cg19-bond-yanqiu'),
    cgAlt: '夜晚的温室书房里，砚秋水合上共享账本，把最后一栏留给两个人的私聊',
    cgId: 'cg19-bond-yanqiu',
    atmosphere: 'petals',
    next: 'r4-25-ending-router',
  }),
  // 二组与四组攻略线复用人物结局母图，避免同一关系主题出现互相矛盾的视觉设定。
  bondEndingNode({
    id: 'r4-24-bond-takemehand', actLabel: '尾声 · takemehand',
    location: '四组语音房', character: 'takemehand',
    text: '我今天看见你消息了，故意晚了两分钟回。想确认你会不会也按禁言。你没按。那我现在认真回答：下一季，我还跟你。',
    cg: cgPath('cg21-bond-takemehand'),
    cgAlt: '四组语音房里，takemehand展示晚了两分钟的回复，确认玩家没有再次滥用禁言权限',
    cgId: 'cg21-bond-takemehand',
    atmosphere: 'messages',
    next: 'r4-25-ending-router',
  }),
  {
    id: 'r4-25-ending-router', chapter: 'epilogue', actLabel: '尾声 · 天上白玉京', date: '2026-07-28',
    location: '天上白玉京组织大厅', mode: 'novel', speaker: 'player',
    text: '你合上账本。那件饰品早已有主，桌边的人却仍在等另一件事：下一次稀有掉落出现时，今晚说过的话还算不算数。', background: 'ending',
    next: {
      cases: [
        // ── 蝴蝶效应 · 路线变体结局 ──
        { when: { type: 'flag', key: 'bf_devoted_heart' }, next: 'r4-end-pilgrim' },
        { when: { type: 'flag', key: 'bf_warmonger' }, next: 'r4-end-warmonger' },
        { when: { type: 'flag', key: 'bf_schemer' }, next: 'r4-end-puppeteer' },
        // ── 原有分流逻辑 ──
        { when: { type: 'flag', key: 'org4VoluntaryHandoff' }, next: 'r4-end-voluntary-handoff' },
        { when: { type: 'flag', key: 'yanqiuStayed' }, next: 'r4-end-reversible-rule' },
        { when: { type: 'stat', key: 'cohesion', operator: 'lte', value: 1 }, next: 'r4-end-correct-accounts-empty-room' },
      ], fallback: 'r4-end-moderate-exit',
    },
  },
  {
    id: 'r4-end-reversible-rule', chapter: 'epilogue', actLabel: '终幕 · 可以推翻的决定', date: '2026-07-28',
    title: '可以推翻的决定', location: '4945区', mode: 'ending', speaker: 'narrator',
    text: '四组第一次把首领已经确认的结果重新打开。有人说这是软弱，有人把它记成新区第一套真正约束首领的程序。砚秋水留下，takemehand也没有再问“下次看什么”。',
    background: 'ending', music: 'afterOnline',
    presentation: {
      cg: cgPath('cg36-ending-route4'),
      cgAlt: '天上白玉京的账本重新打开，三枚分配标记与空饰品盒仍留在两把有人使用过的椅子之间',
      ui: 'ending', transition: 'crossfade', camera: 'push-in', atmosphere: 'paper', focus: 'center',
    },
    onEnter: [
      { type: 'unlockEnding', id: 'r4-reversible-rule' },
      { type: 'unlockCg', id: 'cg36-ending-route4' },
    ],
    next: 'worldline-check',
  },
  {
    id: 'r4-end-moderate-exit', chapter: 'epilogue', actLabel: '终幕 · 温和的离开', date: '2026-07-28',
    title: '温和的离开', location: '4945区', mode: 'ending', speaker: 'narrator',
    text: '争议没有变成全区战争，砚秋水仍选择离开。四组保住了大多数成员，也终于承认：没有爆群、没有骂战，并不等于没有损失。华月乌大王接过秩序，你留下了一份可供修订的账本。',
    background: 'ending', music: 'afterOnline',
    presentation: {
      cg: cgPath('cg36-ending-route4'),
      cgAlt: '账本仍在天上白玉京桌上，一把椅子朝向敞开的出口，另一把留给接手秩序的人',
      ui: 'ending', transition: 'slide', camera: 'pull-back', atmosphere: 'petals', focus: 'left',
    },
    onEnter: [
      { type: 'unlockEnding', id: 'r4-moderate-exit' },
      { type: 'unlockCg', id: 'cg36-ending-route4' },
    ],
    next: 'worldline-check',
  },
  {
    id: 'r4-end-correct-accounts-empty-room', chapter: 'epilogue', actLabel: '终幕 · 正确的空房间', date: '2026-07-28',
    title: '正确的空房间', location: '4945区', mode: 'ending', speaker: 'narrator',
    text: '每一笔贡献都有记录，每一次分配都有理由，成员却逐渐不再上线。你证明所有数字可以对得上，也证明一份没有人愿意继续参与的规则同样可以完全正确。',
    background: 'ending', music: 'afterOnline',
    presentation: {
      cg: cgPath('cg36-ending-route4'),
      cgAlt: '所有数字都整齐留在天上白玉京账本上，饰品盒和两把椅子却在黎明前完全空着',
      ui: 'ending', transition: 'crossfade', camera: 'pull-back', atmosphere: 'dust', focus: 'center',
    },
    onEnter: [
      { type: 'unlockEnding', id: 'r4-correct-accounts-empty-room' },
      { type: 'unlockCg', id: 'cg36-ending-route4' },
    ],
    next: 'worldline-check',
  },
  {
    id: 'r4-end-voluntary-handoff', chapter: 'epilogue', actLabel: '终幕 · 把首领还给组织', date: '2026-07-28',
    title: '把首领还给组织', location: '4945区', mode: 'ending', speaker: 'narrator',
    text: '你没有等到被迫下台。华月乌大王接任首领，四组没有因此重开，也没有把交接写成背叛。你失去最高权限，却第一次能以普通成员身份问：下一件饰品，规则是什么？',
    background: 'ending', music: 'afterOnline',
    presentation: {
      cg: cgPath('cg36-ending-route4'),
      cgAlt: '天上白玉京首领徽章被放在两把椅子之间，旧首领留下账本并把决定权交回组织',
      ui: 'ending', transition: 'ink', camera: 'drift-right', atmosphere: 'paper', focus: 'right',
    },
    onEnter: [
      { type: 'unlockEnding', id: 'r4-voluntary-handoff' },
      { type: 'unlockCg', id: 'cg36-ending-route4' },
    ],
    next: 'worldline-check',
  },

  // ──────────────── 蝴蝶效应 · 变体结局 ────────────────
  {
    id: 'r4-end-pilgrim',
    chapter: 'epilogue', actLabel: '终幕 · 朝圣者', date: '2026-07-28',
    title: '朝圣者', location: '4945区', mode: 'ending', speaker: 'narrator',
    text: '天上白玉京的规则不止写在账本上，也刻在成员的信任里。你没有把首领当成权力，而是当成一份每天需要重新赢得的承诺。饰品分得出，旧账翻得开，交出首领时，没有人把它当成背叛。',
    background: 'ending', music: 'afterOnline',
    presentation: {
      cg: cgPath('cg36-ending-route4'),
      cgAlt: '天上白玉京账本打开在清晨光线中，徽章、饰品盒与自愿签下的交接书并列',
      ui: 'ending-triumph', transition: 'ink', camera: 'pull-back', atmosphere: 'petals', focus: 'center',
    },
    onEnter: [
      { type: 'unlockEnding', id: 'r4-pilgrim' },
      { type: 'unlockCg', id: 'cg36-ending-route4' },
    ],
    next: 'worldline-check',
  },
  {
    id: 'r4-end-puppeteer',
    chapter: 'epilogue', actLabel: '隐藏 · 提线者', date: '2026-07-28',
    title: '提线者', location: '？？？', mode: 'ending', speaker: 'narrator',
    text: '华月乌大王以为自己是规则的主人。砚秋水以为离开是自主选择。takemehand以为下一件饰品还值得等。账本每一页都对，却没有人意识到——所有"他们自己的决定"，都是你提前放好的唯一选项。',
    background: 'ending', music: 'afterOnline',
    presentation: {
      cg: cgPath('cg36-ending-route4'),
      cgAlt: '天上白玉京昏暗账房，饰品盒如棋子排列，首领椅的影子落在每一页账目上',
      ui: 'ending-secret', transition: 'crossfade', camera: 'drift-left', atmosphere: 'none', focus: 'left',
    },
    onEnter: [
      { type: 'unlockEnding', id: 'r4-puppeteer' },
      { type: 'unlockCg', id: 'cg36-ending-route4' },
    ],
    next: 'worldline-check',
  },
  {
    id: 'r4-end-warmonger',
    chapter: 'epilogue', actLabel: '终幕 · 好战者', date: '2026-07-28',
    title: '好战者', location: '4945区', mode: 'ending', speaker: 'narrator',
    text: '天上白玉京的战书比账本先传开。每一件稀有饰品的分配都变成一场竞拍，每一次讨论都以投票结束——不是规则允许，而是没有人愿意先喊停。四组活得比谁都热闹，也累得比谁都早。',
    background: 'ending', music: 'afterOnline',
    presentation: {
      cg: cgPath('cg36-ending-route4'),
      cgAlt: '天上白玉京大厅嘈杂如战场，散落的战书、饰品和空椅子铺满地面',
      ui: 'ending-chaos', transition: 'flash', camera: 'drift-right', atmosphere: 'danmaku', focus: 'right',
    },
    onEnter: [
      { type: 'unlockEnding', id: 'r4-warmonger' },
      { type: 'unlockCg', id: 'cg36-ending-route4' },
    ],
    next: 'worldline-check',
  },
] satisfies StoryNode[]
