import type { StoryNode } from '@/engine/types'

// 2.7 事件二 · 后期危机与终局前置（SOL-PLAN-2.7）。
//
// 回收 2.6 的 s2PressureStance（org-first / rel-first），在第二次协调席会晤中
// 触发由累积因果推动的危机：联合行动计划表决截止，票数算不过来，
// 玩家必须做出终局入口承诺。后果写入 variables.s2FinaleEntry，供 2.8 高潮回收。
//
// 全部复用既有背景/立绘，零新增 CharacterId / 路线 / 托管视觉；historical 标 fictional。

export const S2_2_7_ENTRY = 's2-2.7-entry'
export const S2_2_7_COMPLETION = 's2-2.7-exit'

export const s2_2_7_Nodes: StoryNode[] = [
  // ───────── 开场：回收 2.6 选择，分流入场危机 ─────────
  {
    id: 's2-2.7-entry',
    chapter: 'act1',
    actLabel: '事件二 · 后期危机',
    date: '2026-10-10',
    title: '第二次会晤',
    location: '4945区 · 联合评议厅',
    mode: 'novel',
    speaker: 'narrator',
    text: '一周前你在协调席上排出了次序——组织还是人情，那一轮你已经押了注。今天联合行动计划第一阶段表决截止，所有组织的代表都坐在这张桌子前面。空气比上次更重，每个人桌上的议程都比上次更厚。你扫了一眼，发现有些人看你的目光和上周不一样了。',
    background: 'warRoom',
    historical: 'fictional',
    onEnter: [
      { type: 'flag', key: 's2CrisisFaced' },
    ],
    next: {
      type: 'conditional',
      cases: [
        { when: { type: 'variable', key: 's2PressureStance', operator: 'eq', value: 'org-first' }, next: 's2-2.7-crisis-org' },
        { when: { type: 'variable', key: 's2PressureStance', operator: 'eq', value: 'rel-first' }, next: 's2-2.7-crisis-rel' },
      ],
      fallback: 's2-2.7-crisis-org',
    },
  },

  // ───────── 危机 A：组织优先的代价 —— 反制联盟 ─────────
  {
    id: 's2-2.7-crisis-org',
    chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '桌对面的眼睛',
    location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'bottle', portrait: 'bottle',
    text: '瓶在你旁边坐下，声音压到只有你能听见：“你上周守住了组织的底线——干得漂亮。但你看对面。”他朝长桌另一端努嘴，“被你搁置的那些人，今天座位是重新排过的。他们不恨你，只是在保护自己的组织。”他把议程推过来，“今天的票，光靠你手里的，不够。”',
    background: 'warRoom', historical: 'fictional',
    next: {
      type: 'conditional',
      cases: [
        { when: { type: 'route', value: 'org2' }, next: 's2-2.7-org2' },
        { when: { type: 'route', value: 'org3' }, next: 's2-2.7-org3' },
        { when: { type: 'route', value: 'org4' }, next: 's2-2.7-org4' },
        { when: { type: 'route', value: 'org5' }, next: 's2-2.7-org5' },
        { when: { type: 'route', value: 'org6' }, next: 's2-2.7-org6' },
      ],
      fallback: 's2-2.7-org2',
    },
  },

  // ───────── 危机 B：关系优先的代价 —— 被让渡的协调权 ─────────
  {
    id: 's2-2.7-crisis-rel',
    chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '人情与票数',
    location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'mentor', portrait: 'mentor',
    text: '老朋友把议程翻开，手指点着其中一页：“你上周为身边的人让了一步——他们记着，今天会帮你说话。”他顿了顿，“但你让出去的那部分协调权，被对面拿了。你的组织在这场表决里的分量，被摊薄了。”他合上议程，“光靠人情翻不了盘。接着借人情撑，还是换个打法——今天得定。”',
    background: 'warRoom', historical: 'fictional',
    next: {
      type: 'conditional',
      cases: [
        { when: { type: 'route', value: 'org2' }, next: 's2-2.7-org2' },
        { when: { type: 'route', value: 'org3' }, next: 's2-2.7-org3' },
        { when: { type: 'route', value: 'org4' }, next: 's2-2.7-org4' },
        { when: { type: 'route', value: 'org5' }, next: 's2-2.7-org5' },
        { when: { type: 'route', value: 'org6' }, next: 's2-2.7-org6' },
      ],
      fallback: 's2-2.7-org2',
    },
  },

  // ───────── 路线同期危机：各组织在表决中承受的具体压力 ─────────
  {
    id: 's2-2.7-org2',
    chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '二组的裂痕',
    location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'shana', portrait: 'shana',
    text: '夏娜把一张纸推到你面前——退组申请，名字你认识。“扩编抽人的消息传出去之后，这是第三个。”她的手指压在签名栏上，“二组刚稳下来的摊子，经不住从里面裂。今天的表决要是再压一轮——”她把纸收回去，“这张就不是最后一张。”',
    background: 'warRoom', historical: 'fictional',
    next: 's2-2.7-artifact-router',
  },
  {
    id: 's2-2.7-org3',
    chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '三组的旧账',
    location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'truth', portrait: 'truth',
    text: '真理的手指悬在屏幕上方，半天没有点下去。“公开出勤数据的第一轮报告出来了。三组的历史数字，被评议委员标了红。”她抬眼，“他们没说禁赛。但每一行红字，都等于一句『你们不配』。”她把屏幕转过来，“你上周选的路，决定了我们今天能带多少底气坐在这。”',
    background: 'warRoom', historical: 'fictional',
    next: 's2-2.7-artifact-router',
  },
  {
    id: 's2-2.7-org4',
    chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '四组的标尺',
    location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'yanqiu', portrait: 'yanqiu',
    text: '砚秋水合上方案草稿，声音压到只够你听见：“统一战功标准的细则出来了——精英门槛被砍三成，理由是『照顾大多数』。”她把草稿推到你手边，“四组的核心竞争力不是刁难，是我们的尺度。被人拿平均值来量，就不再是我们了。”她抬眼，“表决前，这句话替四组说清楚。”',
    background: 'warRoom', historical: 'fictional',
    next: 's2-2.7-artifact-router',
  },
  {
    id: 's2-2.7-org5',
    chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '五组的筹码',
    location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'jianwen', portrait: 'jianwen',
    text: '剑问白玉京的手指在桌面上轻叩：“开放日程协调权以后，心之所向手里能谈的东西被摊薄了一大半。温陷留下的是旧网络，不是替我们做好的决定。”他停下手，“这场表决拿什么换什么，由现在的人定。”',
    background: 'warRoom', historical: 'fictional',
    next: 's2-2.7-artifact-router',
  },
  {
    id: 's2-2.7-org6',
    chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '六组的席',
    location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'player',
    text: '六组是你从零拉起来的——桌上最年轻的席位。没有历史战绩做背书，没有前辈欠的人情可以翻。今天这张表决桌看你的眼神跟看老牌组织不一样：他们不是怕你，是还没决定要不要把你当回事。这个印象，今天你来定。',
    background: 'warRoom', historical: 'fictional',
    next: 's2-2.7-artifact-router',
  },

  // 2.6 的表决产物必须在本轮成为危机证据；旧档缺字段时走原共通场景。
  {
    id: 's2-2.7-artifact-router',
    chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '上次会议的回执', location: '4945区 · 联合评议厅', mode: 'system', speaker: 'narrator',
    text: '评议员把上次会议的回执放到每个席位前。纸上的条款没有停在上周，它已经变成今天票数的一部分。',
    background: 'warRoom', historical: 'fictional',
    next: {
      type: 'conditional',
      cases: [
        { when: { type: 'variable', key: 's2MeetingArtifact', operator: 'eq', value: 'org2-extraction-suspended' }, next: 's2-2.7-artifact-org2-suspended' },
        { when: { type: 'variable', key: 's2MeetingArtifact', operator: 'eq', value: 'org2-extraction-capped' }, next: 's2-2.7-artifact-org2-capped' },
        { when: { type: 'variable', key: 's2MeetingArtifact', operator: 'eq', value: 'org3-records-sealed' }, next: 's2-2.7-artifact-org3-sealed' },
        { when: { type: 'variable', key: 's2MeetingArtifact', operator: 'eq', value: 'org3-records-limited' }, next: 's2-2.7-artifact-org3-limited' },
        { when: { type: 'variable', key: 's2MeetingArtifact', operator: 'eq', value: 'org4-standard-split' }, next: 's2-2.7-artifact-org4-split' },
        { when: { type: 'variable', key: 's2MeetingArtifact', operator: 'eq', value: 'org4-standard-appeal' }, next: 's2-2.7-artifact-org4-appeal' },
        { when: { type: 'variable', key: 's2MeetingArtifact', operator: 'eq', value: 'org5-schedule-closed' }, next: 's2-2.7-artifact-org5-closed' },
        { when: { type: 'variable', key: 's2MeetingArtifact', operator: 'eq', value: 'org5-schedule-window' }, next: 's2-2.7-artifact-org5-window' },
        { when: { type: 'variable', key: 's2MeetingArtifact', operator: 'eq', value: 'org6-seat-independent' }, next: 's2-2.7-artifact-org6-independent' },
        { when: { type: 'variable', key: 's2MeetingArtifact', operator: 'eq', value: 'org6-seat-provisional' }, next: 's2-2.7-artifact-org6-provisional' },
      ],
      fallback: 's2-2.7-stakes',
    },
  },
  {
    id: 's2-2.7-artifact-org2-suspended', chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '暂缓的账单', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'shana', portrait: 'shana',
    text: '抽调虽然暂缓，联合资源也真的停了。夏娜指着空掉的补给栏：“人留下来不是句号。今天要是再硬顶，我们得证明少这份资源也能把班排完。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.7-stakes',
  },
  {
    id: 's2-2.7-artifact-org2-capped', chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '七日到期', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'shana', portrait: 'shana',
    text: '轮换今天正好到第七天，评议席却要求续期。夏娜把原协议推到桌中央：“上次写的是返回。今天如果连签过的期限都守不住，以后没人会信我们的自愿。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.7-stakes',
  },
  {
    id: 's2-2.7-artifact-org3-sealed', chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '待复核的红字', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'truth', portrait: 'truth',
    text: '“证据不足，待复核”已经被对面念了三遍。真理把封存袋放在桌上：“不开，它就是他们口中的可疑；打开，旧账就会重新定义我们。今天这票是在决定谁有权拆封。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.7-stakes',
  },
  {
    id: 's2-2.7-artifact-org3-limited', chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '越过权限的截图', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'truth', portrait: 'truth',
    text: '限定查阅的页面还是流出了一张截图。真理把转发链摆出来：“数据本身没说谎，越权的人也是真的。今天如果只谈数字，不谈权限，上周那条边界就等于没写。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.7-stakes',
  },
  {
    id: 's2-2.7-artifact-org4-split', chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '两把尺的奖励', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '两套标准保住了，统一奖励却只按基础线发。砚秋水把缺口标红：“他们承认我们不同，又让不同的人少拿。今天要守的不是尺，是差价由谁承担。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.7-stakes',
  },
  {
    id: 's2-2.7-artifact-org4-appeal', chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '第一次申诉', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '四组递交的第一份申诉被排到季末复核。砚秋水把回执压在尺下：“入口有了，时间却能把人拖死。今天要么逼他们给期限，要么承认这条入口只是装饰。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.7-stakes',
  },
  {
    id: 's2-2.7-artifact-org5-closed', chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '没人敲门', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'jianwen', portrait: 'jianwen',
    text: '日程守住了，三次联合行动也都绕开了五组。剑问白玉京拨亮灯芯：“门还在，但没人来敲。今天若继续关着，我们得接受别人会把心之所向从地图上绕过去。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.7-stakes',
  },
  {
    id: 's2-2.7-artifact-org5-window', chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '窗口外的要求', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'jianwen', portrait: 'jianwen',
    text: '协调方在窗口外临时加了一场行动，要求五组破例开放。剑问白玉京把预约表摊开：“第一次破例叫救急，第二次就会被写成惯例。今天得决定这扇窗是谁在开。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.7-stakes',
  },
  {
    id: 's2-2.7-artifact-org6-independent', chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '没有票的席位', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: '六组有独立名牌，却仍没有表决权。AVUCII把票数算给你看：“身份已确认，权限延迟。今天我们只能改变别人的投票，不能投自己的票。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.7-stakes',
  },
  {
    id: 's2-2.7-artifact-org6-provisional', chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '季末复核', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: '临时席位让六组有了票，也把“季末取消”写进每一次发言背后。AVUCII指向复核栏：“今天每一次妥协都会被当成不成熟，每一次强硬也会被当成不稳定。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.7-stakes',
  },

  // ───────── 共通：算账 —— 危机完全摊开 ─────────
  {
    id: 's2-2.7-stakes',
    chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '算账',
    location: '4945区 · 联合评议厅', mode: 'system',
    speaker: 'narrator',
    text: '表决钟声敲响前，有三分钟自由发言。你扫过桌面：左边是自己组织的人——出勤表、底线、经不起再裂的人心；右边是那些欠你人情的脸，和不欠你、但愿意信你的脸。两边的分量，今天在这张桌子上不一样重。三分钟，一只手只能按住一边。',
    background: 'warRoom', historical: 'fictional',
    next: 's2-2.7-decide',
  },

  // ───────── 核心决策：终局入口 ─────────
  {
    id: 's2-2.7-decide',
    chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '你的路',
    location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'player',
    text: '全场静下来，轮到你。要么把筹码全押在你认为对的方向上——赢就全赢，输就扛全部后果；要么承认有些仗今天打不赢，牺牲局部换一个守得住的核心——代价是让对手看清你的底线。你听见自己的心跳，也听见对面翻纸的声音。你选。',
    background: 'warRoom', historical: 'fictional',
    choices: [
      {
        id: 's2-2.7-stand-firm',
        label: '「不退。每条线我都要守住。」',
        tone: 'bold',
        detail: '坚持到底：把所有筹码押在你认为对的方向上，赢则全赢，输则承担全部后果。',
        effects: [
          { type: 'variable', key: 's2FinaleEntry', value: 'stand-firm' },
          { type: 'variable', key: 's2FinaleArtifact', value: 'all-lines-defended' },
          { type: 'stat', key: 'reputation', operation: 'add', value: 3 },
          { type: 'stat', key: 'cohesion', operation: 'add', value: -2 },
          { type: 'stat', key: 'resources', operation: 'add', value: -3 },
          { type: 'activePartnerRelationship', key: 'trust', value: 1, fallbackCharacter: 'mentor' },
        ],
        next: 's2-2.7-result-stand',
      },
      {
        id: 's2-2.7-cut-losses',
        label: '「有的仗今天打不赢，先护住核心。」',
        tone: 'warm',
        detail: '止损重组：牺牲局部目标保全核心，代价是让对手看到你的底线并撤到你的阵地。',
        effects: [
          { type: 'variable', key: 's2FinaleEntry', value: 'cut-losses' },
          { type: 'variable', key: 's2FinaleArtifact', value: 'core-line-protected' },
          { type: 'stat', key: 'cohesion', operation: 'add', value: 2 },
          { type: 'stat', key: 'resources', operation: 'add', value: 1 },
          { type: 'stat', key: 'reputation', operation: 'add', value: -2 },
          { type: 'activePartnerRelationship', key: 'trust', value: -1, fallbackCharacter: 'mentor' },
        ],
        next: 's2-2.7-result-cut',
      },
    ],
  },

  // ───────── 后果展示：坚持到底 ─────────
  {
    id: 's2-2.7-result-stand',
    chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '不退',
    location: '4945区 · 联合评议厅', mode: 'novel',
    speaker: 'narrator',
    text: '你没有退，一个字都没有。组织的每一条核心诉求，都被你钉在了表决桌上。对面有人叹气，有人收笔，有人只是静静看着你——你分辨得出，那不是服气，是在重新给你估价。散场时，没有人跟你同路。你守住了每一条线，也花光了所有余地。',
    background: 'warRoom', historical: 'fictional',
    next: 's2-2.7-outcome-router',
  },

  // ───────── 后果展示：止损重组 ─────────
  {
    id: 's2-2.7-result-cut',
    chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '断尾',
    location: '4945区 · 联合评议厅', mode: 'novel',
    speaker: 'narrator',
    text: '你主动撤了三条线——不是守不住，是算过之后，决定不在今天全押。对面有人松了口气，也有人立刻记下了你让出的空档。散场时，你自己组织的人围过来，没人问为什么。他们还在，阵地还在。你知道下一次对面会瞄准核心打。但那是下一次的事。',
    background: 'warRoom', historical: 'fictional',
    next: 's2-2.7-outcome-router',
  },

  // 同一个终局姿态，在五条路线里要留下不同、可复述的保住与失去。
  {
    id: 's2-2.7-outcome-router',
    chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '各自的落槌', location: '4945区 · 联合评议厅', mode: 'system', speaker: 'narrator',
    text: '票数落定后，通用条款只有一行。真正改变各组织生活的，是它下面那一条路线附注。',
    background: 'warRoom', historical: 'fictional',
    next: {
      type: 'conditional',
      cases: [
        { when: { type: 'all', conditions: [{ type: 'route', value: 'org2' }, { type: 'variable', key: 's2FinaleEntry', operator: 'eq', value: 'stand-firm' }] }, next: 's2-2.7-outcome-org2-stand' },
        { when: { type: 'all', conditions: [{ type: 'route', value: 'org2' }, { type: 'variable', key: 's2FinaleEntry', operator: 'eq', value: 'cut-losses' }] }, next: 's2-2.7-outcome-org2-cut' },
        { when: { type: 'all', conditions: [{ type: 'route', value: 'org3' }, { type: 'variable', key: 's2FinaleEntry', operator: 'eq', value: 'stand-firm' }] }, next: 's2-2.7-outcome-org3-stand' },
        { when: { type: 'all', conditions: [{ type: 'route', value: 'org3' }, { type: 'variable', key: 's2FinaleEntry', operator: 'eq', value: 'cut-losses' }] }, next: 's2-2.7-outcome-org3-cut' },
        { when: { type: 'all', conditions: [{ type: 'route', value: 'org4' }, { type: 'variable', key: 's2FinaleEntry', operator: 'eq', value: 'stand-firm' }] }, next: 's2-2.7-outcome-org4-stand' },
        { when: { type: 'all', conditions: [{ type: 'route', value: 'org4' }, { type: 'variable', key: 's2FinaleEntry', operator: 'eq', value: 'cut-losses' }] }, next: 's2-2.7-outcome-org4-cut' },
        { when: { type: 'all', conditions: [{ type: 'route', value: 'org5' }, { type: 'variable', key: 's2FinaleEntry', operator: 'eq', value: 'stand-firm' }] }, next: 's2-2.7-outcome-org5-stand' },
        { when: { type: 'all', conditions: [{ type: 'route', value: 'org5' }, { type: 'variable', key: 's2FinaleEntry', operator: 'eq', value: 'cut-losses' }] }, next: 's2-2.7-outcome-org5-cut' },
        { when: { type: 'all', conditions: [{ type: 'route', value: 'org6' }, { type: 'variable', key: 's2FinaleEntry', operator: 'eq', value: 'stand-firm' }] }, next: 's2-2.7-outcome-org6-stand' },
        { when: { type: 'all', conditions: [{ type: 'route', value: 'org6' }, { type: 'variable', key: 's2FinaleEntry', operator: 'eq', value: 'cut-losses' }] }, next: 's2-2.7-outcome-org6-cut' },
      ],
      fallback: 's2-2.7-consequence',
    },
  },
  {
    id: 's2-2.7-outcome-org2-stand', chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '二组全线守住', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'shana', portrait: 'shana',
    text: '二组保住抽调期限和成员返回权，但补给继续冻结。夏娜拿走空白排班表：“人都在，三条线都得自己补。今晚开始。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.7-consequence',
  },
  {
    id: 's2-2.7-outcome-org2-cut', chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '二组守住核心', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'shana', portrait: 'shana',
    text: '二组放弃一条外围资源线，换回轮换成员全部返岗。夏娜把两张退组申请撕掉：“少拿一块地，至少名单上的人还愿意留下。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.7-consequence',
  },
  {
    id: 's2-2.7-outcome-org3-stand', chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '三组封住原档', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'truth', portrait: 'truth',
    text: '三组守住原档权限，却被加上一季观察标记。真理把封存袋收回：“证据没被偷走。接下来每一场，我们都得用新数据把红字压下去。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.7-consequence',
  },
  {
    id: 's2-2.7-outcome-org3-cut', chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '三组交出摘要', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'truth', portrait: 'truth',
    text: '三组提交一份删去个人名的历史摘要，换回本季数据的解释权。真理关掉转发链：“旧账让了一页，活人的名字留住了。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.7-consequence',
  },
  {
    id: 's2-2.7-outcome-org4-stand', chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '四组保住双轨', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '双轨标准继续生效，四组也正式失去统一奖励资格。砚秋水收起两把尺：“尺度保住了。缺的资源，从明天的账开始补。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.7-consequence',
  },
  {
    id: 's2-2.7-outcome-org4-cut', chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '四组护住申诉', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '四组接受统一基础线，换来七日内公开复核的硬期限。砚秋水把“季末”划掉：“尺先共用，至少申诉不再等到人都走了。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.7-consequence',
  },
  {
    id: 's2-2.7-outcome-org5-stand', chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '五组守住门', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'jianwen', portrait: 'jianwen',
    text: '五组保住完整日程权限，也被移出联合优先调度。剑问白玉京把钥匙放回袖中：“门由留下的人开。以后路远一点，自己走。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.7-consequence',
  },
  {
    id: 's2-2.7-outcome-org5-cut', chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '五组留下一扇窗', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'jianwen', portrait: 'jianwen',
    text: '五组增加一个紧急窗口，换来其余时间不得临时征用的条款。剑问白玉京在新窗口旁画了一盏灯：“这一盏给别人，其余还照自己人。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.7-consequence',
  },
  {
    id: 's2-2.7-outcome-org6-stand', chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '六组争到正式席', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: '六组的独立席位写进正式名录，表决权仍延后三个月。AVUCII核对完章程：“身份成为常量，权限仍是待完成项。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.7-consequence',
  },
  {
    id: 's2-2.7-outcome-org6-cut', chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '六组保住当前票', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: '六组保住本季表决权，正式身份延后到下一季复核。AVUCII收起临时名牌：“接口继续运行，身份问题留到我们有更多结果时再解。”',
    background: 'warRoom', historical: 'fictional', next: 's2-2.7-consequence',
  },

  // ───────── 即时可见后果：组织与关系 ─────────
  {
    id: 's2-2.7-consequence',
    chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '落槌',
    location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'mentor', portrait: 'mentor',
    text: '评议委员收起议程，落槌。槌声不大，满屋子却静了一瞬。老朋友坐在斜对面，没说话，只看着你——缓缓点了一下头，又或者没有，你分辨不出。你忽然意识到：三个月前刚进联合活动室的那个人，不会在这种安静里坐得这么稳。',
    background: 'warRoom', historical: 'fictional',
    next: 's2-2.7-closing',
  },

  // ───────── 收束：关闭危机，指向高潮 ─────────
  {
    id: 's2-2.7-closing',
    chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '之后',
    location: '4945区 · 联合活动室', mode: 'novel',
    speaker: 'narrator',
    text: '表决通过了——一部分。你留下印记，也留下代价。走出评议厅时天已经黑透，联合活动室的灯还亮着，像特意给你留的。下一次你走进这里，不再是代表谁、选什么。是结束它。',
    background: 'aftermath', historical: 'fictional',
    next: 's2-2.7-exit',
  },

  // ───────── 完成哨兵 ─────────
  {
    id: 's2-2.7-exit',
    chapter: 'act1', actLabel: '事件二 · 后期危机', date: '2026-10-10',
    title: '2.7 · 完',
    location: '4945区 · 联合活动室', mode: 'system',
    speaker: 'system',
    text: '（后期危机与终局前置 · 收束。）',
    background: 'aftermath', historical: 'fictional',
  },
]
