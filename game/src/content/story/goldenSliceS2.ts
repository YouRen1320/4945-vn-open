import type { StoryNode } from '@/engine/types'

// 事件二黄金样板使用独立 gs2 图验证“具体冲突—即时回应—后续回响—结局差异”。
// 它不连接正式 s2 episode，不写结局/收藏，也不承担全路线内容合同。
export const GOLDEN_SLICE_S2_ENTRY = 'gs2-26-entry'
export const GOLDEN_SLICE_S2_EXIT = 'gs2-exit'

const common = {
  chapter: 'act1' as const,
  background: 'warRoom' as const,
  historical: 'fictional' as const,
}

export const goldenSliceS2Nodes: StoryNode[] = [
  {
    ...common,
    id: GOLDEN_SLICE_S2_ENTRY,
    actLabel: '事件二样板 · 2.6', date: '2026-10-03',
    title: '红字名单', location: '江南 · 联合评议厅外', mode: 'chat',
    speaker: 'heartbeat', portrait: 'heartbeat',
    text: '心跳成瘾把一张出勤表塞进你手里。三组有七个名字被标成红色，旁边写着“历史争议成员，建议降低联合权限”。“这不是统计，是先把人判完再找数字。”他压低声音，“三分钟后表决。你如果只说保护三组，他们会说你护短；你如果交出全部记录，这七个人以后每次申请都要解释一次。”',
    next: 'gs2-26-interruption',
  },
  {
    ...common,
    id: 'gs2-26-interruption',
    actLabel: '事件二样板 · 2.6', date: '2026-10-03',
    title: '先落下的笔', location: '江南 · 联合评议厅', mode: 'chat',
    speaker: 'yanqiu', portrait: 'yanqiu',
    text: '你刚坐下，砚秋已经在表决栏写了“同意公开”。她没有回避你的视线：“统一标准不能只在对自己有利时才统一。你要保这七个人，就拿出一条所有组织都能接受的规则。”记录员把笔停在你名字后面，等你的答复。',
    next: 'gs2-26-choice',
  },
  {
    ...common,
    id: 'gs2-26-choice',
    actLabel: '事件二样板 · 2.6', date: '2026-10-03',
    title: '先保什么', location: '江南 · 联合评议厅', mode: 'chat', speaker: 'player',
    text: '名单、原始记录和七个人都摆在桌面上。你必须先决定，哪一条不能动。',
    choices: [
      {
        id: 'gs2-org-first', label: '“完整记录不交。先撤掉红字，再谈统一标准。”', tone: 'bold',
        effects: [
          { type: 'variable', key: 'gs2PressureStance', value: 'org-first' },
          { type: 'activePartnerRelationship', key: 'trust', value: -2 },
        ],
        next: 'gs2-26-org-result',
      },
      {
        id: 'gs2-rel-first', label: '“公开必要字段，但红字必须改成待复核。”', tone: 'warm',
        effects: [
          { type: 'variable', key: 'gs2PressureStance', value: 'rel-first' },
          { type: 'activePartnerRelationship', key: 'trust', value: 2 },
        ],
        next: 'gs2-26-rel-result',
      },
    ],
  },
  {
    ...common,
    id: 'gs2-26-org-result',
    actLabel: '事件二样板 · 2.6', date: '2026-10-03',
    title: '撤回', location: '江南 · 联合评议厅', mode: 'chat',
    speaker: 'heartbeat', portrait: 'heartbeat',
    text: '红字名单被当场撤回，公开条款也被一并搁置。散会后，心跳成瘾把原始表收进文件袋：“人保住了。但你没给他们替代规则，下周他们会带着更硬的版本回来。”他没有像往常一样等你一起走。',
    next: 'gs2-27-entry',
  },
  {
    ...common,
    id: 'gs2-26-rel-result',
    actLabel: '事件二样板 · 2.6', date: '2026-10-03',
    title: '附录', location: '江南 · 联合评议厅', mode: 'chat',
    speaker: 'heartbeat', portrait: 'heartbeat',
    text: '表决通过了删减版：公开出勤次数，不公开旧争议标签；七个红字改成“待本人复核”。心跳成瘾在附录上签了字：“我不喜欢把人的事切成字段。但至少这次，他们能自己解释。”',
    next: 'gs2-27-entry',
  },
  {
    ...common,
    id: 'gs2-27-entry',
    actLabel: '事件二样板 · 2.7', date: '2026-10-10',
    title: '第二张名单', location: '三组 · 管理群', mode: 'chat',
    speaker: 'truth', portrait: 'truth',
    text: '一周后，真理把第二张名单投到群里。评议方没有再标红七个人，而是把三组整组的联合资源冻结到复核结束。她只发了一句：“他们学会了不点名。”',
    next: {
      cases: [
        { when: { type: 'variable', key: 'gs2PressureStance', operator: 'eq', value: 'org-first' }, next: 'gs2-27-org-echo' },
      ],
      fallback: 'gs2-27-rel-echo',
    },
  },
  {
    ...common,
    id: 'gs2-27-org-echo',
    actLabel: '事件二样板 · 2.7', date: '2026-10-10',
    title: '没有替代规则', location: '三组 · 管理群', mode: 'chat',
    speaker: 'heartbeat', portrait: 'heartbeat',
    text: '心跳成瘾回复：“上周我们撤了名单，却没留下评审办法。他们现在把缺口扩大到整组。”七个人都在线，没有一个人说退出。群里等着你决定，是继续顶住，还是先换回资源。',
    next: 'gs2-27-choice',
  },
  {
    ...common,
    id: 'gs2-27-rel-echo',
    actLabel: '事件二样板 · 2.7', date: '2026-10-10',
    title: '附录的代价', location: '三组 · 管理群', mode: 'chat',
    speaker: 'heartbeat', portrait: 'heartbeat',
    text: '心跳成瘾把你们签过的附录置顶：“他们违反了上周刚通过的复核流程。我们可以拿这页逼他们解冻，但七个人的必要字段会继续公开。”七个人都在线，等你决定要不要把附录推上桌。',
    next: 'gs2-27-choice',
  },
  {
    ...common,
    id: 'gs2-27-choice',
    actLabel: '事件二样板 · 2.7', date: '2026-10-10',
    title: '资源冻结', location: '三组 · 管理群', mode: 'chat', speaker: 'player',
    text: '冻结已经影响今晚的活动。你要守住完整边界，还是先拿回三组运行所需的资源？',
    choices: [
      {
        id: 'gs2-stand-firm', label: '“不接受整组冻结，今晚照常开活动。”', tone: 'bold',
        effects: [{ type: 'variable', key: 'gs2FinaleEntry', value: 'stand-firm' }],
        next: 'gs2-27-stand-result',
      },
      {
        id: 'gs2-cut-losses', label: '“先交临时复核表，把活动资源拿回来。”', tone: 'calm',
        effects: [{ type: 'variable', key: 'gs2FinaleEntry', value: 'cut-losses' }],
        next: 'gs2-27-cut-result',
      },
    ],
  },
  {
    ...common,
    id: 'gs2-27-stand-result',
    actLabel: '事件二样板 · 2.7', date: '2026-10-10',
    title: '自己开', location: '三组 · 活动频道', mode: 'chat',
    speaker: 'heartbeat', portrait: 'heartbeat',
    text: '没有联合资源，今晚的活动只开了两队。心跳成瘾把七个人全部排进主队：“你说照常开，我就不让他们坐替补。下周最终表决，我们拿今晚的成绩去换规则。”',
    next: 'gs2-28-entry',
  },
  {
    ...common,
    id: 'gs2-27-cut-result',
    actLabel: '事件二样板 · 2.7', date: '2026-10-10',
    title: '临时表', location: '三组 · 活动频道', mode: 'chat',
    speaker: 'heartbeat', portrait: 'heartbeat',
    text: '资源在开场前十分钟恢复。临时表上，七个人各自交了一次说明。心跳成瘾把表保存下来：“今晚能开满队，但最终表决前，这些说明会成为对方手里的样本。”',
    next: 'gs2-28-entry',
  },
  {
    ...common,
    id: 'gs2-28-entry',
    actLabel: '事件二样板 · 2.8', date: '2026-10-17',
    title: '最终表决', location: '江南 · 联合评议厅', mode: 'chat',
    speaker: 'yanqiu', portrait: 'yanqiu',
    text: '最终表决前，砚秋把两份方案并排放下：“第一份，三组退出统一评审，用昨晚的成绩承担一年观察期。第二份，三组留在统一体系，但你们上周交的临时说明全部封存，今后不得追加旧标签。”她把笔推给你，“这次不是态度。签哪份，哪份就生效。”',
    next: {
      cases: [
        { when: { type: 'variable', key: 'gs2FinaleEntry', operator: 'eq', value: 'stand-firm' }, next: 'gs2-28-stand-choice' },
      ],
      fallback: 'gs2-28-cut-choice',
    },
  },
  {
    ...common,
    id: 'gs2-28-stand-choice',
    actLabel: '事件二样板 · 2.8', date: '2026-10-17',
    title: '用成绩换规则', location: '江南 · 联合评议厅', mode: 'chat', speaker: 'player',
    text: '你守到现在，换来了独立评审的资格，也保留了回到统一体系的最后机会。',
    choices: [
      { id: 'gs2-final-independent', label: '签第一份：退出统一评审。', tone: 'bold', effects: [{ type: 'variable', key: 'gs2MainEnding', value: 'independent' }], next: 'gs2-28-independent-result' },
      { id: 'gs2-final-seal', label: '签第二份：封存旧标签，留在体系内。', tone: 'warm', effects: [{ type: 'variable', key: 'gs2MainEnding', value: 'sealed' }], next: 'gs2-28-sealed-result' },
    ],
  },
  {
    ...common,
    id: 'gs2-28-cut-choice',
    actLabel: '事件二样板 · 2.8', date: '2026-10-17',
    title: '从临时表里出来', location: '江南 · 联合评议厅', mode: 'chat', speaker: 'player',
    text: '临时复核让三组保住了活动，也让对方拿到了七份说明。现在你能争取封存，或者承认公开字段成为常规。',
    choices: [
      { id: 'gs2-final-seal', label: '要求封存说明，以后不得追加旧标签。', tone: 'bold', effects: [{ type: 'variable', key: 'gs2MainEnding', value: 'sealed' }], next: 'gs2-28-sealed-result' },
      { id: 'gs2-final-standard', label: '接受公开字段，换取长期资源席位。', tone: 'calm', effects: [{ type: 'variable', key: 'gs2MainEnding', value: 'standard' }], next: 'gs2-28-standard-result' },
    ],
  },
  {
    ...common,
    id: 'gs2-28-independent-result',
    actLabel: '事件二样板 · 2.8', date: '2026-10-17',
    title: '独立窗口', location: '江南 · 联合评议厅', mode: 'chat',
    speaker: 'truth', portrait: 'truth',
    text: '三组退出统一评审，昨晚的成绩成为独立评定起点。真理在一年观察期后面画了条红线：“这一年我们自己记。赢了，他们按我们的表看；输了，也没有别人替我们改数字。”',
    next: 'gs2-29-entry',
  },
  {
    ...common,
    id: 'gs2-28-sealed-result',
    actLabel: '事件二样板 · 2.8', date: '2026-10-17',
    title: '封存', location: '江南 · 联合评议厅', mode: 'chat',
    speaker: 'heartbeat', portrait: 'heartbeat',
    text: '七份说明被装进封存袋，编号留存，内容不得再进入成员评级。心跳成瘾盯着封条压实：“这不是删掉发生过的事。是让发生过的事，到这里为止。”',
    next: 'gs2-29-entry',
  },
  {
    ...common,
    id: 'gs2-28-standard-result',
    actLabel: '事件二样板 · 2.8', date: '2026-10-17',
    title: '统一字段', location: '江南 · 联合评议厅', mode: 'chat',
    speaker: 'heartbeat', portrait: 'heartbeat',
    text: '三组拿到长期资源席位，出勤和处分记录成为常规公开字段。心跳成瘾把七个人叫进群：“以后别人会先看表。我们要做的，是让他们看完表，还得承认你们是谁。”',
    next: 'gs2-29-entry',
  },
  {
    ...common,
    id: 'gs2-29-entry',
    chapter: 'epilogue', actLabel: '事件二样板 · 2.9', date: '2026-11-03',
    title: '名单之外', location: '江南 · 数据中心外', mode: 'chat',
    speaker: 'heartbeat', portrait: 'heartbeat',
    text: '心跳成瘾把最终名单合上。门外只剩你们两个。“这一季我统计过出勤、红字、说明和离开的人。”他把名单放到一边，“但有件事不在表里：你在最难选的时候，先保了什么。我记得。”',
    next: {
      cases: [
        { when: { type: 'variable', key: 'gs2PressureStance', operator: 'eq', value: 'org-first' }, next: 'gs2-29-org-echo' },
      ],
      fallback: 'gs2-29-rel-echo',
    },
  },
  {
    ...common,
    id: 'gs2-29-org-echo', chapter: 'epilogue', actLabel: '事件二样板 · 2.9', date: '2026-11-03',
    title: '先保三组', location: '江南 · 数据中心外', mode: 'chat', speaker: 'heartbeat', portrait: 'heartbeat',
    text: '“你先保了三组，我当时不高兴。”他坦白得很快，“后来那七个人告诉我，如果你没有先撤红字，他们连等到最终表决的资格都没有。所以下一次，别让我猜。把代价直接告诉我。”',
    next: 'gs2-29-ending-echo',
  },
  {
    ...common,
    id: 'gs2-29-rel-echo', chapter: 'epilogue', actLabel: '事件二样板 · 2.9', date: '2026-11-03',
    title: '先保人', location: '江南 · 数据中心外', mode: 'chat', speaker: 'heartbeat', portrait: 'heartbeat',
    text: '“你先给人留了解释的位置，我看见了。”他敲了敲封存后的名单，“但以后别一个人替所有人承担公开的代价。关系不是你替我们决定，是我们和你一起决定。”',
    next: 'gs2-29-ending-echo',
  },
  {
    ...common,
    id: 'gs2-29-ending-echo', chapter: 'epilogue', actLabel: '事件二样板 · 2.9', date: '2026-11-03',
    title: '留下什么', location: '江南 · 数据中心外', mode: 'novel', speaker: 'narrator',
    text: '评议留下了一份结果，也留下了一种你们以后做决定的方式。名单收起来了，发生过的选择没有。',
    next: GOLDEN_SLICE_S2_EXIT,
  },
  {
    ...common,
    id: GOLDEN_SLICE_S2_EXIT, chapter: 'epilogue', actLabel: '事件二样板 · 完成', date: '2026-11-03',
    title: '事件二样板 · 完', location: '江南', mode: 'system', speaker: 'system',
    text: '（事件二 2.6—2.9 黄金样板收束。）',
  },
]
