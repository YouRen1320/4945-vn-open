import type { StoryNode } from '@/engine/types'

// 2.8 事件二 · 高潮、失败状态与主要结局（SOL-PLAN-2.8）。
//
// 回收 2.7 的 s2FinaleEntry（stand-firm / cut-losses）和 2.6 的 s2PressureStance
//（org-first / rel-first），在联合行动计划最终表决中触发各路线的高潮对决。
// 玩家采取最终行动（strike / settle），到达稳定主要结局 ID。
// 所有 ending 级选择在本集回收；开放项留给 2.9 尾声。
//
// 全部复用既有背景/立绘，零新增 CharacterId / 路线 / 托管视觉。

const warRoomBg = 'warRoom'
const aftermathBg = 'aftermath'

export const s2_2_8_Nodes: StoryNode[] = [
  // ───────── 进场：回收全部前置状态 ─────────
  {
    id: 's2-2.8-entry',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '最后一轮',
    location: '4945区 · 联合评议厅',
    mode: 'novel', speaker: 'narrator',
    text: '第三轮表决——也是最后一轮。联合评议厅里坐了比前两次更多的人，连旁听席都加了三排。你上周在那张表决桌上押了你的姿态：不退、或者止损。现在所有人的牌都摊开了——你组织里的人、你欠了人情的盟友、被你让渡了协调权的对手。没有人还能再等一轮。今天，一切都结束。',
    background: warRoomBg, historical: 'fictional',
    onEnter: [
      { type: 'flag', key: 's2ClimaxEntered' },
    ],
    next: {
      type: 'conditional',
      cases: [
        { when: { type: 'variable', key: 's2FinaleEntry', operator: 'eq', value: 'stand-firm' }, next: 's2-2.8-entry-stand' },
        { when: { type: 'variable', key: 's2FinaleEntry', operator: 'eq', value: 'cut-losses' }, next: 's2-2.8-entry-cut' },
      ],
      fallback: 's2-2.8-entry-repair-router',
    },
  },

  // ───────── 回收 2.7 终局入口：两种姿态各自的进场代价 ─────────
  {
    id: 's2-2.8-entry-stand',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '没有退路的人',
    location: '4945区 · 联合评议厅',
    mode: 'novel', speaker: 'narrator',
    text: '你上周一个字都没退。这一周对面把功课做足了——今天他们入座的方式都不一样：没人再试探你，开场就是底牌。老朋友发来一条消息：“你选的路我懂。但提醒一句：没退路的人，别人打你也不留手。”你回了个“知道”，把手机扣下。没有退路也有它的好处：这张桌子上，只有你不用猜自己是谁。',
    background: warRoomBg, historical: 'fictional',
    next: {
      type: 'conditional',
      cases: [
        { when: { type: 'variable', key: 's2FinaleArtifact', operator: 'eq', value: 'all-lines-defended' }, next: 's2-2.8-meeting-router' },
        { when: { type: 'variable', key: 's2FinaleArtifact', operator: 'eq', value: 'core-line-protected' }, next: 's2-2.8-entry-repair-choice' },
      ],
      fallback: 's2-2.8-entry-stand-legacy',
    },
  },
  {
    id: 's2-2.8-entry-cut',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '守得住的东西',
    location: '4945区 · 联合评议厅',
    mode: 'novel', speaker: 'narrator',
    text: '你上周主动撤了三条线。这一周对面把你的阵地研究得很透——谁让出了空档，空档就是邀请函。但有一样东西他们没算到：你身后的人，一个都没少。瓶路过你身边时丢下一句：“守得住的东西才配叫核心。今天让他们看看。”你把椅子拉近桌子。丢过外围的人，最清楚哪一寸不能再丢。',
    background: warRoomBg, historical: 'fictional',
    next: {
      type: 'conditional',
      cases: [
        { when: { type: 'variable', key: 's2FinaleArtifact', operator: 'eq', value: 'core-line-protected' }, next: 's2-2.8-meeting-router' },
        { when: { type: 'variable', key: 's2FinaleArtifact', operator: 'eq', value: 'all-lines-defended' }, next: 's2-2.8-entry-repair-choice' },
      ],
      fallback: 's2-2.8-entry-cut-legacy',
    },
  },

  // 旧档若缺少 2.7 的新结果字段，必须让玩家看见并重新确认，不能静默代选。
  {
    id: 's2-2.8-entry-repair-router',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '终局记录待确认', location: '4945区 · 联合评议厅', mode: 'system', speaker: 'narrator',
    text: '档案员发现上一轮表决的终局记录没有写全。进入最后一轮前，你需要重新确认当时留下的承诺。',
    background: warRoomBg, historical: 'fictional',
    next: {
      type: 'conditional',
      cases: [
        { when: { type: 'variable', key: 's2FinaleArtifact', operator: 'eq', value: 'all-lines-defended' }, next: 's2-2.8-entry-stand-artifact-repair' },
        { when: { type: 'variable', key: 's2FinaleArtifact', operator: 'eq', value: 'core-line-protected' }, next: 's2-2.8-entry-cut-artifact-repair' },
      ],
      fallback: 's2-2.8-entry-repair-choice',
    },
  },
  {
    id: 's2-2.8-entry-stand-artifact-repair',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '从结果补回承诺', location: '4945区 · 联合评议厅', mode: 'system', speaker: 'narrator',
    text: '上一轮的承诺字段缺失，但“全线坚守”的结果仍在。档案按这份可验证结果补回终局入口，并留下修复标记。',
    background: warRoomBg, historical: 'fictional',
    onEnter: [{ type: 'variable', key: 's2FinaleEntry', value: 'stand-firm' }, { type: 'flag', key: 's2ContinuityRepaired' }],
    next: 's2-2.8-entry-stand',
  },
  {
    id: 's2-2.8-entry-cut-artifact-repair',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '从结果补回承诺', location: '4945区 · 联合评议厅', mode: 'system', speaker: 'narrator',
    text: '上一轮的承诺字段缺失，但“保护核心”的结果仍在。档案按这份可验证结果补回终局入口，并留下修复标记。',
    background: warRoomBg, historical: 'fictional',
    onEnter: [{ type: 'variable', key: 's2FinaleEntry', value: 'cut-losses' }, { type: 'flag', key: 's2ContinuityRepaired' }],
    next: 's2-2.8-entry-cut',
  },
  {
    id: 's2-2.8-entry-repair-choice',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '重新确认', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'player',
    text: '你重新看过上一轮记录。那时你留下的承诺是——',
    background: warRoomBg, historical: 'fictional',
    choices: [
      {
        id: 's2-2.8-repair-stand', label: '“每条线都守住，不退。”', tone: 'bold',
        effects: [
          { type: 'variable', key: 's2FinaleEntry', value: 'stand-firm' },
          { type: 'variable', key: 's2FinaleArtifact', value: 'all-lines-defended' },
          { type: 'flag', key: 's2ContinuityRepaired' },
        ],
        next: 's2-2.8-entry-stand',
      },
      {
        id: 's2-2.8-repair-cut', label: '“放弃外围，护住核心。”', tone: 'calm',
        effects: [
          { type: 'variable', key: 's2FinaleEntry', value: 'cut-losses' },
          { type: 'variable', key: 's2FinaleArtifact', value: 'core-line-protected' },
          { type: 'flag', key: 's2ContinuityRepaired' },
        ],
        next: 's2-2.8-entry-cut',
      },
    ],
  },
  {
    id: 's2-2.8-entry-stand-legacy',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '补记：全线', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'mentor', portrait: 'mentor',
    text: '老朋友看过旧记录：“你上次写的是不退，只是后果栏没存下来。现在补记：所有未决条款一起带进终局，哪一条破了都算你的。”',
    background: warRoomBg, historical: 'fictional',
    onEnter: [
      { type: 'variable', key: 's2FinaleArtifact', value: 'all-lines-defended' },
      { type: 'flag', key: 's2ContinuityRepaired' },
    ],
    next: 's2-2.8-meeting-router',
  },
  {
    id: 's2-2.8-entry-cut-legacy',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '补记：核心', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'bottle', portrait: 'bottle',
    text: '瓶看过旧记录：“你上次写的是止损，只是后果栏没存下来。现在补记：外围让出去，终局只保核心。别等赢了以后又把让掉的东西说成还在。”',
    background: warRoomBg, historical: 'fictional',
    onEnter: [
      { type: 'variable', key: 's2FinaleArtifact', value: 'core-line-protected' },
      { type: 'flag', key: 's2ContinuityRepaired' },
    ],
    next: 's2-2.8-meeting-router',
  },

  // 2.6 的具体会议条款在高潮前最后一次落到桌面，形成可追溯的连续因果。
  {
    id: 's2-2.8-meeting-router',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '旧条款，最后一轮', location: '4945区 · 联合评议厅', mode: 'system', speaker: 'narrator',
    text: '最后一轮文件的第一页，附着第一次协调席留下的条款。那次通过或搁置的内容，今天成了最终提案的起点。',
    background: warRoomBg, historical: 'fictional',
    next: {
      type: 'conditional',
      cases: [
        { when: { type: 'variable', key: 's2MeetingArtifact', operator: 'eq', value: 'org2-extraction-suspended' }, next: 's2-2.8-meeting-org2-suspended' },
        { when: { type: 'variable', key: 's2MeetingArtifact', operator: 'eq', value: 'org2-extraction-capped' }, next: 's2-2.8-meeting-org2-capped' },
        { when: { type: 'variable', key: 's2MeetingArtifact', operator: 'eq', value: 'org3-records-sealed' }, next: 's2-2.8-meeting-org3-sealed' },
        { when: { type: 'variable', key: 's2MeetingArtifact', operator: 'eq', value: 'org3-records-limited' }, next: 's2-2.8-meeting-org3-limited' },
        { when: { type: 'variable', key: 's2MeetingArtifact', operator: 'eq', value: 'org4-standard-split' }, next: 's2-2.8-meeting-org4-split' },
        { when: { type: 'variable', key: 's2MeetingArtifact', operator: 'eq', value: 'org4-standard-appeal' }, next: 's2-2.8-meeting-org4-appeal' },
        { when: { type: 'variable', key: 's2MeetingArtifact', operator: 'eq', value: 'org5-schedule-closed' }, next: 's2-2.8-meeting-org5-closed' },
        { when: { type: 'variable', key: 's2MeetingArtifact', operator: 'eq', value: 'org5-schedule-window' }, next: 's2-2.8-meeting-org5-window' },
        { when: { type: 'variable', key: 's2MeetingArtifact', operator: 'eq', value: 'org6-seat-independent' }, next: 's2-2.8-meeting-org6-independent' },
        { when: { type: 'variable', key: 's2MeetingArtifact', operator: 'eq', value: 'org6-seat-provisional' }, next: 's2-2.8-meeting-org6-provisional' },
      ],
      fallback: 's2-2.8-meeting-unrecorded',
    },
  },
  {
    id: 's2-2.8-meeting-org2-suspended', chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17', title: '暂缓到期', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'shana', portrait: 'shana',
    text: '暂缓抽调的期限今天到期。夏娜把空补给栏和完整名单放在一起：“人留下了，资源也确实少了。最后一轮别假装两边都没付代价。”', background: warRoomBg, historical: 'fictional', next: 's2-2.8-pressure-router',
  },
  {
    id: 's2-2.8-meeting-org2-capped', chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17', title: '期限被追问', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'shana', portrait: 'shana',
    text: '七日轮换已经结束，最终提案却想把短期写成永久。夏娜把旧协议钉在新文件上：“今天签的不是人数，是上次的承诺还算不算数。”', background: warRoomBg, historical: 'fictional', next: 's2-2.8-pressure-router',
  },
  {
    id: 's2-2.8-meeting-org3-sealed', chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17', title: '封存袋上桌', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'truth', portrait: 'truth',
    text: '封存的原档被列为终局附件。真理按住封条：“他们要用没看过的东西定义三组。你若不开，就得用结果替它作证。”', background: warRoomBg, historical: 'fictional', next: 's2-2.8-pressure-router',
  },
  {
    id: 's2-2.8-meeting-org3-limited', chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17', title: '限定权限失守', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'truth', portrait: 'truth',
    text: '那张越权截图被写进最终报告，却没写谁越了权。真理把转发链附在后面：“今天要签，就连权限责任一起签。”', background: warRoomBg, historical: 'fictional', next: 's2-2.8-pressure-router',
  },
  {
    id: 's2-2.8-meeting-org4-split', chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17', title: '两把尺合并', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '终局提案想把基础线和精英线重新合并。砚秋水把两份旧标准压在桌上：“他们不是忘了上次的决定，是想看我们还守不守。”', background: warRoomBg, historical: 'fictional', next: 's2-2.8-pressure-router',
  },
  {
    id: 's2-2.8-meeting-org4-appeal', chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17', title: '申诉期限', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'yanqiu', portrait: 'yanqiu',
    text: '第一次申诉仍没有结果，终局文件却准备关闭入口。砚秋水把“季末处理”划掉：“如果入口等不到人，它就不是入口。”', background: warRoomBg, historical: 'fictional', next: 's2-2.8-pressure-router',
  },
  {
    id: 's2-2.8-meeting-org5-closed', chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17', title: '被绕开的门', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'jianwen', portrait: 'jianwen',
    text: '日程没有交出去，联合网络也已经学会绕开心之所向。剑问白玉京把无人敲过的记录合上：“门守住了。今天要决定，它是门，还是墙。”', background: warRoomBg, historical: 'fictional', next: 's2-2.8-pressure-router',
  },
  {
    id: 's2-2.8-meeting-org5-window', chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17', title: '窗口变成通道', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'jianwen', portrait: 'jianwen',
    text: '两个预约窗口被终局提案改成“随时协调”。剑问白玉京把旧时间表放在旁边：“他们想把我们让的一寸，写成整扇门。”', background: warRoomBg, historical: 'fictional', next: 's2-2.8-pressure-router',
  },
  {
    id: 's2-2.8-meeting-org6-independent', chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17', title: '名字与权限', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: '六组的名字已经独立，表决权仍被标成延期。AVUCII指向两个不同颜色的印章：“终局任务：让身份和权限第一次落在同一页。”', background: warRoomBg, historical: 'fictional', next: 's2-2.8-pressure-router',
  },
  {
    id: 's2-2.8-meeting-org6-provisional', chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17', title: '临时二字', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: '临时席位给了六组一张票，也让所有人把“临时”挂在嘴边。AVUCII把复核日圈出：“终局任务：保住接口，或删掉限定词。”', background: warRoomBg, historical: 'fictional', next: 's2-2.8-pressure-router',
  },
  {
    id: 's2-2.8-meeting-unrecorded', chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '未完整迁移的旧条款', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'mentor', portrait: 'mentor',
    text: '老朋友翻过附件：“第一次会议的详细条款没迁过来，但所在组织和最终提案还在。今天不替过去编答案，只按眼前这份文件继续。”',
    background: warRoomBg, historical: 'fictional', onEnter: [{ type: 'flag', key: 's2LegacyMeetingArtifactMissing' }], next: 's2-2.8-pressure-router',
  },
  {
    id: 's2-2.8-pressure-router',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '最后的排序', location: '4945区 · 联合评议厅', mode: 'system', speaker: 'narrator',
    text: '旧条款已经摆明。现在决定你如何进入最后交锋的，是第一次协调席上那次组织与关系的排序。',
    background: warRoomBg, historical: 'fictional',
    next: {
      type: 'conditional',
      cases: [
        { when: { type: 'variable', key: 's2PressureStance', operator: 'eq', value: 'org-first' }, next: 's2-2.8-climax-org' },
        { when: { type: 'variable', key: 's2PressureStance', operator: 'eq', value: 'rel-first' }, next: 's2-2.8-climax-rel' },
      ],
      fallback: 's2-2.8-pressure-repair',
    },
  },
  {
    id: 's2-2.8-pressure-repair',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '排序记录待确认', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'player',
    text: '第一次协调席的排序记录缺失。你需要明确当时优先守住的是——',
    background: warRoomBg, historical: 'fictional',
    choices: [
      { id: 's2-2.8-repair-org-first', label: '“组织底线优先。”', tone: 'bold', effects: [{ type: 'variable', key: 's2PressureStance', value: 'org-first' }, { type: 'flag', key: 's2ContinuityRepaired' }], next: 's2-2.8-climax-org' },
      { id: 's2-2.8-repair-rel-first', label: '“伙伴信任优先。”', tone: 'warm', effects: [{ type: 'variable', key: 's2PressureStance', value: 'rel-first' }, { type: 'flag', key: 's2ContinuityRepaired' }], next: 's2-2.8-climax-rel' },
    ],
  },

  // ───────── 高潮进场 A：组织优先 → 独自扛大旗 ─────────
  {
    id: 's2-2.8-climax-org',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '你的席',
    location: '4945区 · 联合评议厅',
    mode: 'chat', speaker: 'mentor', portrait: 'mentor',
    text: '老朋友在走廊拦住你。评议厅的声音隔着墙嗡嗡响。“最后问一次，准备好了没有。”他难得没开玩笑，“对面现在不把你当交涉对象了，他们在等你犯错。今天你说的每句话，都会被记下来，当成你们组织往后三年站在哪里的依据。”他拍拍你肩膀，“进去吧。别给他们好看——给你自己人好看。”',
    background: warRoomBg, historical: 'fictional',
    next: {
      type: 'conditional',
      cases: [
        { when: { type: 'route', value: 'org2' }, next: 's2-2.8-org2' },
        { when: { type: 'route', value: 'org3' }, next: 's2-2.8-org3' },
        { when: { type: 'route', value: 'org4' }, next: 's2-2.8-org4' },
        { when: { type: 'route', value: 'org5' }, next: 's2-2.8-org5' },
        { when: { type: 'route', value: 'org6' }, next: 's2-2.8-org6' },
      ],
      fallback: 's2-2.8-route-repair',
    },
  },

  // ───────── 高潮进场 B：关系优先 → 联盟撑腰但有限 ─────────
  {
    id: 's2-2.8-climax-rel',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '你的人',
    location: '4945区 · 联合评议厅',
    mode: 'chat', speaker: 'bottle', portrait: 'bottle',
    text: '瓶推开半扇门，朝身后努了努嘴——这一季你帮过的人，今天全到了。“你让出去的那些协调权，对面正拿来压你的组织。”他侧身让你看清走廊里那些人，“但欠你人情的，没忘。他们今天坐你这边，只是各家也有各家的线要守。”他把门完全推开，“人情能撑到哪一步，看你接下来怎么用。走。”',
    background: warRoomBg, historical: 'fictional',
    next: {
      type: 'conditional',
      cases: [
        { when: { type: 'route', value: 'org2' }, next: 's2-2.8-org2' },
        { when: { type: 'route', value: 'org3' }, next: 's2-2.8-org3' },
        { when: { type: 'route', value: 'org4' }, next: 's2-2.8-org4' },
        { when: { type: 'route', value: 'org5' }, next: 's2-2.8-org5' },
        { when: { type: 'route', value: 'org6' }, next: 's2-2.8-org6' },
      ],
      fallback: 's2-2.8-route-repair',
    },
  },

  // 事件二只接受二至六组；损坏来源必须由玩家显式确认，不得伪装成二组。
  {
    id: 's2-2.8-route-repair',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '组织记录待确认', location: '4945区 · 联合评议厅', mode: 'chat', speaker: 'player',
    text: '终局名册没有找到你的有效组织记录。先确认事件二的组织，再重新选择该路线的结局；系统不会替你归档到任何默认路线。',
    background: warRoomBg, historical: 'fictional',
    choices: [
      { id: 's2-2.8-repair-route-org2', label: '二组', tone: 'calm', effects: [{ type: 'route', route: 'org2', organization: 'org2' }, { type: 'flag', key: 's2ContinuityRepaired' }], next: 's2-2.8-org2' },
      { id: 's2-2.8-repair-route-org3', label: '三组', tone: 'calm', effects: [{ type: 'route', route: 'org3', organization: 'org3' }, { type: 'flag', key: 's2ContinuityRepaired' }], next: 's2-2.8-org3' },
      { id: 's2-2.8-repair-route-org4', label: '四组', tone: 'calm', effects: [{ type: 'route', route: 'org4', organization: 'org4' }, { type: 'flag', key: 's2ContinuityRepaired' }], next: 's2-2.8-org4' },
      { id: 's2-2.8-repair-route-org5', label: '五组', tone: 'calm', effects: [{ type: 'route', route: 'org5', organization: 'org5' }, { type: 'flag', key: 's2ContinuityRepaired' }], next: 's2-2.8-org5' },
      { id: 's2-2.8-repair-route-org6', label: '六组', tone: 'calm', effects: [{ type: 'route', route: 'org6', organization: 'org6', organizationName: '第六组织' }, { type: 'flag', key: 's2ContinuityRepaired' }], next: 's2-2.8-org6' },
    ],
  },

  // ───────── 路线高潮：各组织在最后一轮表决中的核心对决 ─────────
  // 每个路线节点包含最终行动选择（strike / settle），是事件二的最终玩家行动。

  // --- org2：二组的抉择 —— 人心与筹码 ---
  {
    id: 's2-2.8-org2',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '二组的门',
    location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'shana', portrait: 'shana',
    text: '夏娜把二组的表决文件推到你面前：“联合行动计划要求：二组出三个人进永久执行组，同时开放全部训练日程给评议方。”她的手指压在人员条款上，“人心刚稳住，再压这一轮，就真裂了。但不接受——二组会被定性为『不配合联合行动』，往后的资源分配里靠边站。”她抬眼，“这张纸只有一次签名机会。你签，还是改？”',
    background: warRoomBg, historical: 'fictional',
    choices: [
      {
        id: 's2-2.8-org2-strike',
        label: '「不签。我改完再交。」',
        tone: 'bold',
        detail: '拒绝原文，要求重谈三项核心条款——以二组的人心和自主决断力为最优先。赢了就全赢，输了有人走。',
        effects: [
          { type: 'variable', key: 's2MainEnding', value: 's2-ending-org2-triumph' },
          { type: 'stat', key: 'reputation', operation: 'add', value: 4 },
          { type: 'stat', key: 'cohesion', operation: 'add', value: -3 },
          { type: 'stat', key: 'resources', operation: 'add', value: -2 },
        ],
        next: 's2-2.8-ending-org2-strike',
      },
      {
        id: 's2-2.8-org2-settle',
        label: '「签。但人我一个都不放。」',
        tone: 'warm',
        detail: '接受框架，但把人员条款锁死在保护线上——你的人一个都不走，代价是二组在后续评估中权重下降。',
        effects: [
          { type: 'variable', key: 's2MainEnding', value: 's2-ending-org2-compromise' },
          { type: 'stat', key: 'cohesion', operation: 'add', value: 3 },
          { type: 'stat', key: 'resources', operation: 'add', value: 1 },
          { type: 'stat', key: 'reputation', operation: 'add', value: -3 },
        ],
        next: 's2-2.8-ending-org2-settle',
      },
    ],
  },
  {
    id: 's2-2.8-ending-org2-strike',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '二组 · 铁',
    location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'shana', portrait: 'shana',
    text: '夏娜接过你改完的文件，沉默了很久，然后直接转给对面。对面的表情告诉你：他们没想到你敢全改。评议委员最终默许了过渡期条款。散会后的走廊里，有人哭了，有人走了。留下的人看你的眼神和之前不一样——是服。“底线保住了。”夏娜说，“裂开的这条口子，会慢慢长回来。”',
    background: warRoomBg, historical: 'fictional',
    next: 's2-2.8-closing',
  },
  {
    id: 's2-2.8-ending-org2-settle',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '二组 · 全',
    location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'bottle', portrait: 'bottle',
    text: '散会后，瓶在走廊拍了拍你的肩。对面拿着签好的文件走了，二组没有一个人离开——你把人员条款锁死了。评议方在附件里加了一行“权重暂按下调”：未来六个月，二组排在末席。夏娜只说了一句：“有人，就有的是时间翻回来。”走廊里没有人哭。所有人都还在。',
    background: warRoomBg, historical: 'fictional',
    next: 's2-2.8-closing',
  },

  // --- org3：三组的抉择 —— 数据与代价 ---
  {
    id: 's2-2.8-org3',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '三组的账',
    location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'truth', portrait: 'truth',
    text: '真理把数据报告放在你面前，一页一页翻过去——每一页都有红笔标注：缺席、争议场次、赛季末低谷。“评议委员要的不是解释，是认账。”她把报告合上，“两个选择：接受评估结果写入附录；或者拒签、申请重新评定——赌三组未来三个月打出翻盘的战绩。”她抬眼，“数据意味着什么，你比我清楚。你选。”',
    background: warRoomBg, historical: 'fictional',
    choices: [
      {
        id: 's2-2.8-org3-strike',
        label: '「重评。我们用战绩说话。」',
        tone: 'bold',
        detail: '拒绝签字，申请临时评定窗口。三组三个月内必须打出能翻盘的数据。赌注是整个三组的赛季评级。',
        effects: [
          { type: 'variable', key: 's2MainEnding', value: 's2-ending-org3-triumph' },
          { type: 'stat', key: 'reputation', operation: 'add', value: 5 },
          { type: 'stat', key: 'resources', operation: 'add', value: -3 },
          { type: 'stat', key: 'cohesion', operation: 'add', value: -2 },
        ],
        next: 's2-2.8-ending-org3-strike',
      },
      {
        id: 's2-2.8-org3-settle',
        label: '「签字。但附加一份说明函。」',
        tone: 'warm',
        detail: '接受评估结果但争取书面说明权——保留三组立场在被归档的数据旁边，为未来复议留窗口。',
        effects: [
          { type: 'variable', key: 's2MainEnding', value: 's2-ending-org3-compromise' },
          { type: 'stat', key: 'cohesion', operation: 'add', value: 2 },
          { type: 'stat', key: 'resources', operation: 'add', value: 1 },
          { type: 'stat', key: 'reputation', operation: 'add', value: -3 },
        ],
        next: 's2-2.8-ending-org3-settle',
      },
    ],
  },
  {
    id: 's2-2.8-ending-org3-strike',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '三组 · 赌',
    location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'truth', portrait: 'truth',
    text: '真理合上报告，嘴角微微上扬。评议委员会对你的拒绝感到意外——他们习惯了别人签了就算。你赢得了三个月的评定窗口。散会后，真理看了你一眼。那一眼的意思是：接下来三个月，谁都不许拉下数据。三组的人表情复杂——他们把下半季，押在了你这句话上。',
    background: warRoomBg, historical: 'fictional',
    next: 's2-2.8-closing',
  },
  {
    id: 's2-2.8-ending-org3-settle',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '三组 · 策',
    location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'mentor', portrait: 'mentor',
    text: '数据报告签完了。评议委员收走原件，你附加的说明函一并归档——档案里，数据旁边多了一页你的字。老朋友的消息随后到：“看了。面子丢了，翻案的入口留下了。聪明。”隔了几秒又来一条，“但聪明不够。下次要赢。”',
    background: warRoomBg, historical: 'fictional',
    next: 's2-2.8-closing',
  },

  // --- org4：四组的抉择 —— 标准与生存 ---
  {
    id: 's2-2.8-org4',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '四组的尺',
    location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'yanqiu', portrait: 'yanqiu',
    text: '砚秋水把统一战功标准的最终版放在桌上：精英门槛被砍三成，核心赛道被合并成一条综合线。“四组的核心竞争力，被平均值稀释了。”她看着你，没催，“你代表四组。最后一次修正提案的机会——你改，还是不改？”',
    background: warRoomBg, historical: 'fictional',
    choices: [
      {
        id: 's2-2.8-org4-strike',
        label: '「拆分。核心赛道独立算。」',
        tone: 'bold',
        detail: '要求把精英级赛道从统一标准中拆分出来，四组的顶线不能和底线一起算。代价是成为众矢之的。',
        effects: [
          { type: 'variable', key: 's2MainEnding', value: 's2-ending-org4-triumph' },
          { type: 'stat', key: 'reputation', operation: 'add', value: 4 },
          { type: 'stat', key: 'cohesion', operation: 'add', value: -2 },
          { type: 'stat', key: 'resources', operation: 'add', value: -3 },
        ],
        next: 's2-2.8-ending-org4-strike',
      },
      {
        id: 's2-2.8-org4-settle',
        label: '「接受统一标准。但加赛保留。」',
        tone: 'warm',
        detail: '接受标准统一的大框架，但保护精英成员参加额外评估赛的权利——底线被尊重，尖子没有被埋没。',
        effects: [
          { type: 'variable', key: 's2MainEnding', value: 's2-ending-org4-compromise' },
          { type: 'stat', key: 'cohesion', operation: 'add', value: 3 },
          { type: 'stat', key: 'resources', operation: 'add', value: 1 },
          { type: 'stat', key: 'reputation', operation: 'add', value: -2 },
        ],
        next: 's2-2.8-ending-org4-settle',
      },
    ],
  },
  {
    id: 's2-2.8-ending-org4-strike',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '四组 · 峰',
    location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'yanqiu', portrait: 'yanqiu',
    text: '拆分案通过了——以一票优势。会议室安静了整整五秒。砚秋水第一个站起来，把你的提案推到对面每个人面前：从此，四组的顶线和底线分开计。对面有人摔了笔，有人冷笑。她的表情没有变化，只是走过去的每一步，都踩得很实。四组的精英没有被埋没。代价是，其他组织都记住了今天。',
    background: warRoomBg, historical: 'fictional',
    next: 's2-2.8-org4-strike-ratified',
  },
  {
    id: 's2-2.8-org4-strike-ratified',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '首领确认', location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'tiesuiya', portrait: 'tiesuiya',
    text: '铁碎牙在拆分案末页签下名字：“砚秋水把尺讲清，你把代价摆明。首领的名字不能只在赢的时候出现——其他组织要记，就连我一起记。”',
    background: warRoomBg, historical: 'fictional', next: 's2-2.8-closing',
  },
  {
    id: 's2-2.8-ending-org4-settle',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '四组 · 脉',
    location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'yanqiu', portrait: 'yanqiu',
    text: '统一标准通过了。但你争取的加赛条款写进了附录——四组的顶级成员，有了一条单独的评价赛道。砚秋水没多说什么，只把那页附录折起来收好。“尺没有丢。”她说，“只是藏到了体系下面。”你懂她的意思：藏住的尺，早晚要拿出来量。',
    background: warRoomBg, historical: 'fictional',
    next: 's2-2.8-org4-settle-ratified',
  },
  {
    id: 's2-2.8-org4-settle-ratified',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '附录落款', location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'tiesuiya', portrait: 'tiesuiya',
    text: '铁碎牙确认了加赛附录：“这不是退回旧标准，是给尖子留一扇门。执行细则由砚秋水盯，最终责任写我的名字。”',
    background: warRoomBg, historical: 'fictional', next: 's2-2.8-closing',
  },

  // --- org5：五组的抉择 —— 外联与筹码 ---
  {
    id: 's2-2.8-org5',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '五组的桥',
    location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'jianwen', portrait: 'jianwen',
    text: '剑问白玉京没有翻开你面前的文件：“温陷退游以后，五组能拿来谈的东西已经不多了。但最后一张牌还在留下的人手里：外联网络。”他顿了顿，“联合行动计划要公示全部通道。受得了，就签；受不了，就拒。别把决定推给已经离开的人。”',
    background: warRoomBg, historical: 'fictional',
    choices: [
      {
        id: 's2-2.8-org5-strike',
        label: '「拒绝。外联是我的底牌。」',
        tone: 'bold',
        detail: '拒绝公开外部网络，并以此作为五组在联合行动中的核心谈判筹码——不入池、不公示、独立调配。',
        effects: [
          { type: 'variable', key: 's2MainEnding', value: 's2-ending-org5-triumph' },
          { type: 'stat', key: 'reputation', operation: 'add', value: 3 },
          { type: 'stat', key: 'resources', operation: 'add', value: -2 },
          { type: 'stat', key: 'cohesion', operation: 'add', value: -2 },
        ],
        next: 's2-2.8-ending-org5-strike',
      },
      {
        id: 's2-2.8-org5-settle',
        label: '「公示六成。核心通道不交。」',
        tone: 'warm',
        detail: '公开大部分联络通道但保留核心三条——以合规赢得信任，同时保持最关键的对外触角。',
        effects: [
          { type: 'variable', key: 's2MainEnding', value: 's2-ending-org5-compromise' },
          { type: 'stat', key: 'cohesion', operation: 'add', value: 2 },
          { type: 'stat', key: 'resources', operation: 'add', value: 1 },
          { type: 'stat', key: 'reputation', operation: 'add', value: -2 },
        ],
        next: 's2-2.8-ending-org5-settle',
      },
    ],
  },
  {
    id: 's2-2.8-ending-org5-strike',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '五组 · 网',
    location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'jianwen', portrait: 'jianwen',
    text: '剑问白玉京替你拉开椅子。你对满桌子的人说：心之所向不开放外联。评议委员的脸色变了——没人能反驳，这张网属于仍在维护它的人。其他组织开始重新掂量五组的独立调配权。旧网络没有随着温陷退游消失，今天成了留下者的城墙。',
    background: warRoomBg, historical: 'fictional',
    next: 's2-2.8-org5-strike-ratified',
  },
  {
    id: 's2-2.8-org5-strike-ratified',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '拒绝公示', location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'kunxing', portrait: 'kunxing',
    text: '困醒在拒绝公示的文件上签字：“外联继续由剑问白玉京维护；断线也好、质疑也好，由我以首领身份解释。留下来的网，不能只让执行的人背。”',
    background: warRoomBg, historical: 'fictional', next: 's2-2.8-closing',
  },
  {
    id: 's2-2.8-ending-org5-settle',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '五组 · 守',
    location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'jianwen', portrait: 'jianwen',
    text: '公示了六成，评议方满意了。核心三条由剑问白玉京锁进心之所向的交接终端，不再属于某个首领的私人密码。五组看起来合规，内核仍在成员手里。你保住了最重要的牌；代价是，对手以为你已经没什么可藏。',
    background: warRoomBg, historical: 'fictional',
    next: 's2-2.8-org5-settle-ratified',
  },
  {
    id: 's2-2.8-org5-settle-ratified',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '六成方案', location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'kunxing', portrait: 'kunxing',
    text: '困醒签下六成公示：“核心三条由剑问白玉京管理，以后是否再开放，由我拍板。温陷已经退游，今天的决定不能再让离开的人替我们承担。”',
    background: warRoomBg, historical: 'fictional', next: 's2-2.8-closing',
  },

  // --- org6：六组的抉择 —— 席位与承认 ---
  {
    id: 's2-2.8-org6',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '六组的声',
    location: '4945区 · 联合评议厅', mode: 'chat',
    speaker: 'player',
    text: '全场的目光落在你身上。你代表六组——这张桌子上最年轻的席位。联合行动计划末轮有一项，被其他组织当成例行程序：是否承认六组的独立表决位。没有人觉得会有悬念，直到你站起来。接下来这句话，决定六组在这张桌子上是真正的席位，还是别人的添头。你开口。',
    background: warRoomBg, historical: 'fictional',
    choices: [
      {
        id: 's2-2.8-org6-strike',
        label: '「六组不是被承认的。是你被六组承认。」',
        tone: 'bold',
        detail: '反向定义：不是请求承认，而是要求全场面对六组今天的实力。赢得独立表决位，同时完成从新人到对手的身份转换。',
        effects: [
          { type: 'variable', key: 's2MainEnding', value: 's2-ending-org6-triumph' },
          { type: 'stat', key: 'reputation', operation: 'add', value: 5 },
          { type: 'stat', key: 'cohesion', operation: 'add', value: -2 },
          { type: 'stat', key: 'resources', operation: 'add', value: -2 },
        ],
        next: 's2-2.8-ending-org6-strike',
      },
      {
        id: 's2-2.8-org6-settle',
        label: '「给我一年。一年后你们自己来看。」',
        tone: 'warm',
        detail: '接受观察员表决议案，同时锁定一年后自动评审升级条款——不争眼下，把路线铺到明年。',
        effects: [
          { type: 'variable', key: 's2MainEnding', value: 's2-ending-org6-compromise' },
          { type: 'stat', key: 'cohesion', operation: 'add', value: 2 },
          { type: 'stat', key: 'resources', operation: 'add', value: 2 },
          { type: 'stat', key: 'reputation', operation: 'add', value: -1 },
        ],
        next: 's2-2.8-ending-org6-settle',
      },
    ],
  },
  {
    id: 's2-2.8-ending-org6-strike',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '六组 · 立',
    location: '4945区 · 联合评议厅', mode: 'novel',
    speaker: 'narrator',
    text: '全场安静的时间比在座所有人预想的都长。然后——不是鼓掌，不是反对。是有人在纸上写了什么，推过桌子。六组的独立表决位，今天写进了联合活动的章程。你没有请求任何人承认你——你只是让这张桌子不得不看你。以后每一次表决议程翻开，六组的名字都印在上面。不是你争取来的，是你站在这里赢的。',
    background: warRoomBg, historical: 'fictional',
    next: 's2-2.8-closing',
  },
  {
    id: 's2-2.8-ending-org6-settle',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '六组 · 种',
    location: '4945区 · 联合评议厅', mode: 'novel',
    speaker: 'narrator',
    text: '一年的观察期被写进了章程。不算最好，但那行字同时锁死了升级条款——明年这个时候，不需要再有人替六组开口。你种了一条根，而不是急着开花。对面有几个老代表看了你很久——他们知道一年之后你一定会回来。到那一天，你不再需要要求承认。你只需要站起来的这一秒。',
    background: warRoomBg, historical: 'fictional',
    next: 's2-2.8-closing',
  },

  // ───────── 共通收束：事件二的核心冲突已解决 ─────────
  {
    id: 's2-2.8-closing',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '散会',
    location: '4945区 · 联合活动室', mode: 'novel',
    speaker: 'narrator',
    text: '散会后的联合活动室比白天安静很多。灯还没全关，桌上摊着表决记录，你那份压在最上面，签名墨迹还没干透。旁听席的三排椅子空着，横七竖八，像刚退潮。你把椅子一张张摆回去——这一季教你的最后一件事：高潮散场以后，收拾屋子的人还是你。明天他们会用新的位置、新的约束、新的眼神对你。今晚先这样。灯留着，不关了。',
    background: aftermathBg, historical: 'fictional',
    onEnter: [
      { type: 'flag', key: 's2ClimaxComplete' },
    ],
    next: 's2-2.8-exit',
  },

  // ───────── 完成哨兵 ─────────
  {
    id: 's2-2.8-exit',
    chapter: 'act1', actLabel: '事件二 · 高潮', date: '2026-10-17',
    title: '2.8 · 完',
    location: '4945区 · 联合活动室', mode: 'system',
    speaker: 'system',
    text: '（高潮与主要结局 · 收束。）',
    background: aftermathBg, historical: 'fictional',
  },
]
