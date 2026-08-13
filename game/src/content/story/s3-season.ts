import type { ActorId, BackgroundId, ChapterId, StoryNode } from '@/engine/types'

type ActiveRoute = 'org2' | 'org3' | 'org4' | 'org5' | 'org6'

interface RouteStory {
  name: string
  lead: ActorId
  background: BackgroundId
  task: string
  actionA: string
  actionB: string
  artifactA: string
  artifactB: string
  midpoint: string
  trustPressure: string
  crisis: string
  autonomyTitle: string
  autonomyText: string
  safeguardTitle: string
  safeguardText: string
}

const routes: Record<ActiveRoute, RouteStory> = {
  org2: {
    name: '云梦仙踪', lead: 'shana', background: 'organization',
    task: '恢复被冻结的联合活动名单；十二名待审核成员今晚必须知道自己能不能上场。',
    actionA: '按真实出勤提交最低必要名单', actionB: '先组一支不经过联席系统的替补队',
    artifactA: '最小责任名册', artifactB: '线下替补队记录',
    midpoint: '名单里有三个人被重复登记，北岸掌握的并不是空穴来风；但它用三处错漏冻结了整支队伍。',
    trustPressure: '夏娜愿意为名单签字，却不愿再让所有风险只写在首领一个人的名字下。',
    crisis: '北岸要求将二组主力纳入统一调度；拒绝意味着联合活动资格一并暂停。',
    autonomyTitle: '自己的队伍', autonomyText: '二组保住独立调度权，也承担一年内不再调用全区公共名额的代价。',
    safeguardTitle: '有边界的指挥', safeguardText: '二组接受联合调度，但每次抽调都需要本人确认和七十二小时撤回权。',
  },
  org3: {
    name: '虚妄月华', lead: 'passerk', background: 'twoGroups',
    task: '恢复五条外联线路，并核清那份被删去身份的事故记录究竟经过谁的手。',
    actionA: '公开脱敏记录，请各组织共同核对', actionB: '先用私人联络网逐条交叉验证',
    artifactA: '公开核验页', artifactB: '私下交叉证词',
    midpoint: '事故指令确实从三组的旧联络口发出，但账号在当晚被多人共用；北岸把责任归给了整张网络。',
    trustPressure: '路人K要你决定：外交是让所有人看见过程，还是替所有人保留退路。',
    crisis: '北岸要求三组交出全部联系人原表，否则认定其外联网络不具备继续运作资格。',
    autonomyTitle: '不交出的名字', autonomyText: '三组拒交联系人原表，失去北岸官方通道，却保住每个联络人的选择权。',
    safeguardTitle: '封存而非上交', safeguardText: '三组接受第三方封存，北岸只能查责任链，不能复制联系人名册。',
  },
  org4: {
    name: '镜花水月', lead: 'tiesuiya', background: 'rewardHall',
    task: '证明成员投票不只是意见收集，并在冻结期间完成一次真正有效的执行。',
    actionA: '让观察员见证重新投票并当场执行', actionB: '先执行成员原决议，再公开承担违规责任',
    artifactA: '见证投票记录', artifactB: '先执行后申诉记录',
    midpoint: '旧投票页有一次管理员代点确认，北岸据此否定全部票权；问题真实存在，结论却越过了每个成员。',
    trustPressure: '铁碎牙要求你把“成员说了算”写成谁都能推翻、也谁都必须执行的程序。',
    crisis: '北岸提出增设常任理事否决权；若通过，成员投票仍存在，但无法单独生效。',
    autonomyTitle: '没有常任否决', autonomyText: '四组拒绝常任否决权，退出统一快速执行通道，保留完整成员表决。',
    safeguardTitle: '双重确认', safeguardText: '四组接受紧急复核，但任何否决都必须在四十八小时内交回成员二次表决。',
  },
  org5: {
    name: '心之所向', lead: 'kunxing', background: 'nightMessage',
    task: '保护温陷离开后留下的联络表，同时让接手的人不再依赖一个已经退游的名字。',
    actionA: '拆分联络表，只提交职责不提交私人身份', actionB: '轮换三名接手人，让每条线都有人能独立完成',
    artifactA: '分层联络索引', artifactB: '三人轮换交接表',
    midpoint: '旧表里确实有两条无人接手的权限仍挂在温陷名下；北岸发现了漏洞，也顺势要求拿走整张网。',
    trustPressure: '困醒不愿让五组永远靠一个离线头像证明自己，却也不肯把留下的人交成一张名单。',
    crisis: '北岸要求五组公开全部外联关系，否则冻结其跨组协作资格。',
    autonomyTitle: '网留在人手里', autonomyText: '五组放弃官方跨组权限，以分散的人际网络继续运作，没人被迫公开私人关系。',
    safeguardTitle: '可撤回的托管', safeguardText: '五组接受加密托管，只有事故发生时才能由三方共同解封。',
  },
  org6: {
    name: '{{organizationName}}', lead: 'avucii', background: 'sixthSeat',
    task: '阻止独立席位被降为“临时观察组织”，并证明新组织能为自己的决定负责。',
    actionA: '提交成立以来的独立决议与责任记录', actionB: '直接质询观察组织标签的授权来源',
    artifactA: '独立责任档案', artifactB: '席位授权质询书',
    midpoint: '第六席第一次备案时漏签了一页责任人确认；北岸抓住的是程序缺口，却想借它撤回整个承认。',
    trustPressure: 'AVUCII愿意补齐每一页手续，但不接受“因为年轻，所以别人可以替你决定”。',
    crisis: '北岸要求第六席接受一年观察期；期间可发言、无表决权，也不得否决合并提案。',
    autonomyTitle: '第六席仍是席位', autonomyText: '第六席拒绝观察期，以放弃北岸资源换回完整表决权。',
    safeguardTitle: '观察者也能否决', safeguardText: '第六席接受半年复核，但保留表决权与对强制合并的一票否决。',
  },
}

const partners = [
  ['shana', 'shana', '夏娜把责任表折成两半：“组织可以赢，但别再让我最后才知道你准备失去什么。”'],
  ['qifu', 'qifu', '祈福把旧一组印章推回来：“位置会换，答应过要负责的人不能只在顺风时出现。”'],
  ['chenyi', 'chenyi', '辰逸盯着你的方案：“你可以质疑我，也可以不选我；但别用沉默让我猜你还把不把我算在未来里。”'],
  ['swordheart', 'swordheart', '剑斩凡人心关掉倒计时：“活动能重开，关系不能每次都等打完再补。”'],
  ['heartbeat', 'heartbeat', '心跳成瘾把椅子拉到你旁边：“我能和你意见不一样。你只要别把我放在决定之外。”'],
  ['yanqiu', 'yanqiu', '砚秋水收起尺：“原则不是不受伤；是受伤以后，仍知道这一步是谁选的。”'],
  ['huayue', 'huayue', '华月乌大王按住你要合上的文件：“你冲前面可以，至少给我一个跟上或留下的选择。”'],
  ['wenxian', 'wenxian', '温陷隔了很久才上线：“退游不是消失。你若还把我当未来的一部分，就别只替我保留过去。”'],
  ['takemehand', 'takemehand', 'takemehand把权限页划到最底：“我跟你走过被别人替我决定的路。今天别替我决定要不要留下。”'],
  ['xilufei', 'xilufei', '希露菲笑得很轻：“我喜欢敢碰规则的人，不喜欢拿关系当免死牌的人。”'],
  ['yyt', 'yyt', 'yyT摘下耳机：“后手我都准备好了。现在只差你告诉我，里面有没有我们两个。”'],
  ['avucii', 'avucii', 'AVUCII把风险表最后一栏留空：“这格叫我们。你填什么，我就按什么承担。”'],
  ['bottle', 'bottle', '顶级奶瓶把两份名单并排放好：“搭档也要对账。你若只想我执行，就别把那叫一起。”'],
  ['truth', 'truth', '真理把结论栏留白：“数据可以说明损失，不能说明你愿不愿和一个人继续走。”'],
] as const

const routeCases = (suffix: string) => (Object.keys(routes) as ActiveRoute[]).map((route) => ({
  when: { type: 'route' as const, value: route }, next: `s3-${suffix}-${route}`,
}))

const node = (
  id: string,
  chapter: ChapterId,
  actLabel: string,
  date: string,
  text: string,
  next?: StoryNode['next'],
  options: Partial<StoryNode> = {},
): StoryNode => ({
  id, chapter, actLabel, date, text, next,
  location: '4945区 · 联合会客厅', mode: 'novel', speaker: 'narrator',
  background: 'warRoom', historical: 'fictional', ...options,
})

const s3_33: StoryNode[] = [
  node('s3-72h-entry', 'act1', '事件三 · 七十二小时', '2027-01-05', '冻结后的第一个清晨，四种公开回应换来了四种不同入口。沈知行没有撤回倒计时。', {
    cases: [
      { when: { type: 'variable', key: 's3OpeningResponse', operator: 'eq', value: 'evidence' }, next: 's3-72h-open-evidence' },
      { when: { type: 'variable', key: 's3OpeningResponse', operator: 'eq', value: 'conditional' }, next: 's3-72h-open-conditional' },
      { when: { type: 'variable', key: 's3OpeningResponse', operator: 'eq', value: 'refusal' }, next: 's3-72h-open-refusal' },
      { when: { type: 'variable', key: 's3OpeningResponse', operator: 'eq', value: 'investigate' }, next: 's3-72h-open-investigate' },
    ], fallback: 's3-72h-continuity-repair',
  }, { mode: 'system', speaker: 'system', background: 'aftermath' }),
  node('s3-72h-continuity-repair', 'act1', '事件三 · 七十二小时', '2027-01-05', '旧版记录没有保存第一次公开回应。请选择当时最接近你的立场；这次补记会明确写入连续性记录。', undefined, {
    mode: 'system', speaker: 'system', background: 'aftermath', choices: [
      { id: 's3-72h-repair-evidence', label: '要求先公开证据', effects: [{ type: 'variable', key: 's3OpeningResponse', value: 'evidence' }, { type: 'flag', key: 's3ContinuityRepaired' }], next: 's3-72h-open-evidence' },
      { id: 's3-72h-repair-conditional', label: '接受有期限的临时措施', effects: [{ type: 'variable', key: 's3OpeningResponse', value: 'conditional' }, { type: 'flag', key: 's3ContinuityRepaired' }], next: 's3-72h-open-conditional' },
      { id: 's3-72h-repair-refusal', label: '公开拒绝冻结', effects: [{ type: 'variable', key: 's3OpeningResponse', value: 'refusal' }, { type: 'flag', key: 's3ContinuityRepaired' }], next: 's3-72h-open-refusal' },
      { id: 's3-72h-repair-investigate', label: '暂不表态并调查', effects: [{ type: 'variable', key: 's3OpeningResponse', value: 'investigate' }, { type: 'flag', key: 's3ContinuityRepaired' }], next: 's3-72h-open-investigate' },
    ],
  }),
  node('s3-72h-open-evidence', 'act1', '事件三 · 七十二小时', '2027-01-05', '十八点前，沈知行依约开放事故摘要。你比其他人多看见一页被删去身份的原始记录，也因此必须先判断它是否足以支撑冻结。', 's3-72h-route-router', { speaker: 'shen-zhixing', portrait: 'shen-zhixing' }),
  node('s3-72h-open-conditional', 'act1', '事件三 · 七十二小时', '2027-01-05', '倒计时被写进正式文件，冻结将在七十二小时后自动失效。观察员同时把你的名字写进监督栏：延期时，你必须第一个签字或反对。', 's3-72h-route-router', { speaker: 'north-observer', portrait: 'north-observer' }),
  node('s3-72h-open-refusal', 'act1', '事件三 · 七十二小时', '2027-01-05', '你的反对意见在全区公告下获得最多回应。北岸没有撤回冻结，却不得不逐项公开损失；沈知行也开始逐字核对你说的每个数字。', 's3-72h-route-router', { speaker: 'shen-zhixing', portrait: 'shen-zhixing' }),
  node('s3-72h-open-investigate', 'act1', '事件三 · 七十二小时', '2027-01-05', '访客权限里多了一份三年前的离区名单。它没有直接答案，却显示同一事故记录曾在沈知行离开前后被改过两次。', 's3-72h-route-router', { speaker: 'mentor', portrait: 'mentor', background: 'nightMessage' }),
  node('s3-72h-route-router', 'act1', '事件三 · 七十二小时', '2027-01-05', '倒计时剩余五十九小时。现在轮到你处理本组织正在失去的那项具体权利。', { cases: routeCases('72h-task'), fallback: 's3-season-route-error' }, { mode: 'system', speaker: 'system' }),
  ...Object.entries(routes).flatMap(([route, cfg]): StoryNode[] => [
    node(`s3-72h-task-${route}`, 'act1', '事件三 · 七十二小时', '2027-01-05', `${cfg.task} ${cfg.name}只能先做一件事。`, undefined, {
      speaker: cfg.lead, portrait: cfg.lead, background: cfg.background, choices: [
        { id: `s3-72h-${route}-a`, label: cfg.actionA, effects: [{ type: 'variable', key: 's3RouteMethod', value: 'accountable' }, { type: 'variable', key: 's3RouteArtifact', value: cfg.artifactA }, { type: 'stat', key: 'evidence', value: 1 }], next: `s3-72h-reply-${route}-a` },
        { id: `s3-72h-${route}-b`, label: cfg.actionB, effects: [{ type: 'variable', key: 's3RouteMethod', value: 'protective' }, { type: 'variable', key: 's3RouteArtifact', value: cfg.artifactB }, { type: 'stat', key: 'resources', value: 1 }], next: `s3-72h-reply-${route}-b` },
      ],
    }),
    node(`s3-72h-reply-${route}-a`, 'act1', '事件三 · 七十二小时', '2027-01-05', `“${cfg.artifactA}我来签。”对方没有把你的选择当口号；第一份可核对的结果在午后交到观察员手里。`, 's3-72h-incident', { speaker: cfg.lead, portrait: cfg.lead, background: cfg.background }),
    node(`s3-72h-reply-${route}-b`, 'act1', '事件三 · 七十二小时', '2027-01-05', `“${cfg.artifactB}先保住人。”这条路绕开了冻结，也让你们承担一次未备案行动的完整责任。`, 's3-72h-incident', { speaker: cfg.lead, portrait: cfg.lead, background: cfg.background }),
  ]),
  node('s3-72h-incident', 'act1', '事件三 · 七十二小时', '2027-01-06', '事故摘要终于公开：一条跨组织指令曾在责任人退出后继续生效，导致成员被重复调度、奖励去向无人确认。冻结有依据，但北岸把一条失控指令扩大成了对所有组织的预先不信任。', 's3-72h-incident-route', { mode: 'system', speaker: 'system', background: 'mutedKey' }),
  node('s3-72h-incident-route', 'act1', '事件三 · 七十二小时', '2027-01-06', '你回到组织，发现同一份事故摘要在不同路线留下了不同伤口。', { cases: routeCases('72h-fact'), fallback: 's3-season-route-error' }),
  ...Object.entries(routes).map(([route, cfg]) => node(`s3-72h-fact-${route}`, 'act1', '事件三 · 七十二小时', '2027-01-06', cfg.midpoint, 's3-72h-commitment', { speaker: cfg.lead, portrait: cfg.lead, background: cfg.background })),
  node('s3-72h-commitment', 'act1', '事件三 · 七十二小时', '2027-01-07', '冻结只剩最后六小时。你必须决定接下来以什么方式对抗统一方案；这不是结局，却会决定谁愿意和你共享筹码。', undefined, {
    speaker: 'player', portrait: 'player', background: 'worldChat', choices: [
      { id: 's3-72h-public-coalition', label: '公开组建跨组织联盟，共同提出替代方案', detail: '更容易获得公开支持，也会把内部差异暴露在所有人面前。', tone: 'bold', effects: [{ type: 'variable', key: 's3Commitment', value: 'coalition' }, { type: 'stat', key: 'cohesion', value: 1 }], next: 's3-72h-commitment-coalition' },
      { id: 's3-72h-conditional-negotiation', label: '承认问题存在，与沈知行谈可撤回的边界', detail: '保留谈判通道，但必须接受阶段性监督。', tone: 'calm', effects: [{ type: 'variable', key: 's3Commitment', value: 'negotiation' }, { type: 'stat', key: 'reputation', value: 1 }], next: 's3-72h-commitment-negotiation' },
      { id: 's3-72h-secret-investigation', label: '不提前摊牌，继续追查事故记录被改写的原因', detail: '能获得更深证据，但公开合法性最弱。', tone: 'secret', effects: [{ type: 'variable', key: 's3Commitment', value: 'investigation' }, { type: 'stat', key: 'evidence', value: 1 }], next: 's3-72h-commitment-investigation' },
    ],
  }),
  node('s3-72h-commitment-coalition', 'act1', '事件三 · 七十二小时', '2027-01-07', '五张组织席位第一次同时亮起。沈知行没有阻止，只提醒：“联盟会把你们彼此的漏洞也变成共同责任。”', 's3-72h-closing', { speaker: 'shen-zhixing', portrait: 'shen-zhixing' }),
  node('s3-72h-commitment-negotiation', 'act1', '事件三 · 七十二小时', '2027-01-07', '沈知行同意把统一方案拆成可逐条撤回的条款，但要求你在第一次谈判前提交责任人名单。', 's3-72h-closing', { speaker: 'shen-zhixing', portrait: 'shen-zhixing' }),
  node('s3-72h-commitment-investigation', 'act1', '事件三 · 七十二小时', '2027-01-07', '老朋友把三年前的备份入口发给你：“查可以。查到自己人时，也别把真相关掉。”', 's3-72h-closing', { speaker: 'mentor', portrait: 'mentor', background: 'nightMessage' }),
  node('s3-72h-closing', 'act1', '事件三 · 七十二小时', '2027-01-07', '七十二小时到期，临时冻结自动解除。名单、投票、外联与席位重新亮起；统一方案却没有撤回。你保住了今天，也正式选定了接下来承担风险的方式。', 's3-72h-exit', { mode: 'system', speaker: 'system', background: 'aftermath', onEnter: [{ type: 'flag', key: 's3SeventyTwoHoursComplete' }] }),
  node('s3-72h-exit', 'act1', '事件三 · 七十二小时', '2027-01-07', '第一章完成。你的行动方法、证据与长期策略已经保存。', undefined, { mode: 'system', speaker: 'system', background: 'ending' }),
]

const s3_34: StoryNode[] = [
  node('s3-commitment-entry', 'act1', '事件三 · 第一次承诺', '2027-02-02', '统一方案第一次闭门说明会开始。你此前选定的长期策略，决定了谁先把要求摆到你面前。', {
    cases: [
      { when: { type: 'variable', key: 's3Commitment', operator: 'eq', value: 'coalition' }, next: 's3-commitment-open-coalition' },
      { when: { type: 'variable', key: 's3Commitment', operator: 'eq', value: 'negotiation' }, next: 's3-commitment-open-negotiation' },
      { when: { type: 'variable', key: 's3Commitment', operator: 'eq', value: 'investigation' }, next: 's3-commitment-open-investigation' },
    ], fallback: 's3-commitment-repair',
  }, { mode: 'system', speaker: 'system' }),
  node('s3-commitment-repair', 'act1', '事件三 · 第一次承诺', '2027-02-02', '这份旧记录缺少七十二小时后的长期策略。请选择要继续承担的方式。', undefined, { mode: 'system', speaker: 'system', choices: [
    { id: 's3-commitment-repair-coalition', label: '公开联盟', effects: [{ type: 'variable', key: 's3Commitment', value: 'coalition' }, { type: 'flag', key: 's3ContinuityRepaired' }], next: 's3-commitment-open-coalition' },
    { id: 's3-commitment-repair-negotiation', label: '有条件谈判', effects: [{ type: 'variable', key: 's3Commitment', value: 'negotiation' }, { type: 'flag', key: 's3ContinuityRepaired' }], next: 's3-commitment-open-negotiation' },
    { id: 's3-commitment-repair-investigation', label: '秘密调查', effects: [{ type: 'variable', key: 's3Commitment', value: 'investigation' }, { type: 'flag', key: 's3ContinuityRepaired' }], next: 's3-commitment-open-investigation' },
  ] }),
  node('s3-commitment-open-coalition', 'act1', '事件三 · 第一次承诺', '2027-02-02', '联盟成员要求你先承诺：任何组织遭遇强制接管，其他组织必须共同暂停合作。这个承诺能挡住北岸，也可能让一个人的失误拖住所有人。', 's3-commitment-route-router', { speaker: 'heartbeat', portrait: 'heartbeat' }),
  node('s3-commitment-open-negotiation', 'act1', '事件三 · 第一次承诺', '2027-02-02', '沈知行拿出逐条谈判表，第一条就是“责任名单共享”。你争来的谈判通道开始索要真实代价。', 's3-commitment-route-router', { speaker: 'shen-zhixing', portrait: 'shen-zhixing' }),
  node('s3-commitment-open-investigation', 'act1', '事件三 · 第一次承诺', '2027-02-02', '三年前的备份显示事故记录最后一次修改来自联合会客厅内部。继续调查意味着你必须暂时隐瞒一个本组织成员的名字。', 's3-commitment-route-router', { speaker: 'truth', portrait: 'truth', background: 'nightMessage' }),
  node('s3-commitment-route-router', 'act1', '事件三 · 第一次承诺', '2027-02-02', '每条路线都被要求交出一项真实权力作为信用。', { cases: routeCases('commitment-demand'), fallback: 's3-season-route-error' }, { mode: 'system', speaker: 'system' }),
  ...Object.entries(routes).map(([route, cfg]) => node(`s3-commitment-demand-${route}`, 'act1', '事件三 · 第一次承诺', '2027-02-02', `${cfg.trustPressure} 北岸给出的期限是今晚。`, 's3-commitment-choice', { speaker: cfg.lead, portrait: cfg.lead, background: cfg.background })),
  node('s3-commitment-choice', 'act1', '事件三 · 第一次承诺', '2027-02-02', '这项承诺不会锁死结局，但后续任何人都能拿今天的签字追问你。', undefined, { speaker: 'player', portrait: 'player', choices: [
    { id: 's3-commit-shared-accountability', label: '共同签字：权力和责任都由多人承担', detail: '降低个人失控风险，也会放慢每一次行动。', effects: [{ type: 'variable', key: 's3Pledge', value: 'shared' }, { type: 'stat', key: 'cohesion', value: 2 }], next: 's3-commitment-result-shared' },
    { id: 's3-commit-limited-authority', label: '限定授权：只交出本次行动所需的最小权限', detail: '保留效率和退路，但容易被认为缺乏诚意。', effects: [{ type: 'variable', key: 's3Pledge', value: 'limited' }, { type: 'stat', key: 'resources', value: 2 }], next: 's3-commitment-result-limited' },
    { id: 's3-commit-personal-guarantee', label: '个人担保：所有责任先记在我名下', detail: '最快，也最接近曾经造成事故的单点权力。', tone: 'danger', effects: [{ type: 'variable', key: 's3Pledge', value: 'personal' }, { type: 'flag', key: 's3SoftFailureRisk' }, { type: 'stat', key: 'reputation', value: 2 }, { type: 'stat', key: 'cohesion', value: -2 }], next: 's3-commitment-result-personal' },
  ] }),
  node('s3-commitment-result-shared', 'act1', '事件三 · 第一次承诺', '2027-02-02', '三个人的名字同时落在责任栏。行动慢了二十分钟，却没有任何一个人能再单独删除记录。', 's3-commitment-closing', { speaker: 'north-observer', portrait: 'north-observer' }),
  node('s3-commitment-result-limited', 'act1', '事件三 · 第一次承诺', '2027-02-02', '你只交出一次性权限。沈知行接受了本次行动，也把“拒绝长期授权”标成下一轮重点质询。', 's3-commitment-closing', { speaker: 'shen-zhixing', portrait: 'shen-zhixing' }),
  node('s3-commitment-result-personal', 'act1', '事件三 · 第一次承诺', '2027-02-02', '行动立即恢复。所有人松了一口气，责任表却重新只剩一个名字——和三年前事故发生前一模一样。', 's3-commitment-closing', { speaker: 'mentor', portrait: 'mentor', background: 'mutedKey' }),
  node('s3-commitment-closing', 'act1', '事件三 · 第一次承诺', '2027-02-02', '第一份承诺生效。收益今天就能看见，代价会在下一次事故到来时被重新打开。', 's3-commitment-exit', { mode: 'system', speaker: 'system', onEnter: [{ type: 'flag', key: 's3CommitmentComplete' }] }),
  node('s3-commitment-exit', 'act1', '事件三 · 第一次承诺', '2027-02-02', '第二章完成。责任结构已经写入本季进度。', undefined, { mode: 'system', speaker: 'system', background: 'ending' }),
]

const s3_35: StoryNode[] = [
  node('s3-midpoint-entry', 'act2', '事件三 · 旧账中点', '2027-03-15', '北岸公开第二批审计记录。你在二月作出的承诺，第一次被真实事故检验。', {
    cases: [
      { when: { type: 'variable', key: 's3Pledge', operator: 'eq', value: 'shared' }, next: 's3-midpoint-pledge-shared' },
      { when: { type: 'variable', key: 's3Pledge', operator: 'eq', value: 'limited' }, next: 's3-midpoint-pledge-limited' },
      { when: { type: 'variable', key: 's3Pledge', operator: 'eq', value: 'personal' }, next: 's3-midpoint-pledge-personal' },
    ], fallback: 's3-midpoint-state-repair',
  }, { mode: 'system', speaker: 'system' }),
  node('s3-midpoint-state-repair', 'act2', '事件三 · 旧账中点', '2027-03-15', '旧进度缺少第一次承诺，无法替你猜测责任结构。请选择当前实际使用的方式。', undefined, { mode: 'system', speaker: 'system', choices: [
    { id: 's3-midpoint-repair-shared', label: '多人共同负责', effects: [{ type: 'variable', key: 's3Pledge', value: 'shared' }, { type: 'flag', key: 's3ContinuityRepaired' }], next: 's3-midpoint-pledge-shared' },
    { id: 's3-midpoint-repair-limited', label: '限定授权', effects: [{ type: 'variable', key: 's3Pledge', value: 'limited' }, { type: 'flag', key: 's3ContinuityRepaired' }], next: 's3-midpoint-pledge-limited' },
    { id: 's3-midpoint-repair-personal', label: '个人担保', effects: [{ type: 'variable', key: 's3Pledge', value: 'personal' }, { type: 'flag', key: 's3ContinuityRepaired' }, { type: 'flag', key: 's3SoftFailureRisk' }], next: 's3-midpoint-pledge-personal' },
  ] }),
  node('s3-midpoint-pledge-shared', 'act2', '事件三 · 旧账中点', '2027-03-15', '事故指令被第二名责任人及时驳回，损失停在一场活动。多人签字救了你们，也暴露出所有行动都开始变慢。', 's3-midpoint-route-router', { speaker: 'north-observer', portrait: 'north-observer' }),
  node('s3-midpoint-pledge-limited', 'act2', '事件三 · 旧账中点', '2027-03-15', '一次性权限在事故发生前自动失效，没有扩大损失；北岸却以此证明你们“不愿建立稳定责任体系”。', 's3-midpoint-route-router', { speaker: 'shen-zhixing', portrait: 'shen-zhixing' }),
  node('s3-midpoint-pledge-personal', 'act2', '事件三 · 旧账中点', '2027-03-15', '个人担保让处理速度最快，也让所有追责都落到你身上。组织保住活动，你暂时被移出联合会客厅表决席。', 's3-midpoint-route-router', { speaker: 'system', mode: 'system', background: 'mutedKey', onEnter: [{ type: 'flag', key: 's3SoftFailureTriggered' }] }),
  node('s3-midpoint-route-router', 'act2', '事件三 · 旧账中点', '2027-03-15', '同一场事故撕开每条路线不同的旧伤。', { cases: routeCases('midpoint-route'), fallback: 's3-season-route-error' }),
  ...Object.entries(routes).map(([route, cfg]) => node(`s3-midpoint-route-${route}`, 'act2', '事件三 · 旧账中点', '2027-03-15', cfg.midpoint, 's3-midpoint-shen-history', { speaker: cfg.lead, portrait: cfg.lead, background: cfg.background })),
  node('s3-midpoint-shen-history', 'act2', '事件三 · 旧账中点', '2027-03-15', '沈知行终于补完三年前的空白：那时他用一份没有完整签名的临时授权救下活动，却让后续责任无人承认。北岸因此接管善后；他离开4945区，是去建立一套“再也不靠相信某个人”的制度。', 's3-midpoint-response', { speaker: 'shen-zhixing', portrait: 'shen-zhixing' }),
  node('s3-midpoint-response', 'act2', '事件三 · 旧账中点', '2027-03-15', '这解释了他的动机，却不能证明今天的统一方案就是唯一答案。你必须重新排序后半季目标。', undefined, { speaker: 'player', portrait: 'player', choices: [
    { id: 's3-midpoint-reform-system', label: '承认旧制度失败，先拿出能替代北岸的责任体系', effects: [{ type: 'variable', key: 's3MidpointGoal', value: 'reform' }, { type: 'stat', key: 'evidence', value: 2 }], next: 's3-midpoint-result-reform' },
    { id: 's3-midpoint-protect-people', label: '先保护被制度当作风险的人，再谈统一规则', effects: [{ type: 'variable', key: 's3MidpointGoal', value: 'protect' }, { type: 'stat', key: 'cohesion', value: 2 }], next: 's3-midpoint-result-protect' },
    { id: 's3-midpoint-expose-north', label: '继续追查北岸为何把有限事故扩大成全面接管', effects: [{ type: 'variable', key: 's3MidpointGoal', value: 'expose' }, { type: 'stat', key: 'resources', value: 2 }], next: 's3-midpoint-result-expose' },
  ] }),
  node('s3-midpoint-result-reform', 'act2', '事件三 · 旧账中点', '2027-03-15', '你公开承认4945区自己的漏洞，并宣布四月前交出一套由各组织共同维护的替代章程。沈知行第一次没有立刻反驳。', 's3-midpoint-closing', { speaker: 'shen-zhixing', portrait: 'shen-zhixing' }),
  node('s3-midpoint-result-protect', 'act2', '事件三 · 旧账中点', '2027-03-15', '你把被重复登记、被迫公开关系和被降格的成员名单放到会议桌中央：“先让他们恢复选择，制度才有资格要求信任。”', 's3-midpoint-closing', { speaker: 'player', portrait: 'player' }),
  node('s3-midpoint-result-expose', 'act2', '事件三 · 旧账中点', '2027-03-15', '你没有接受沈知行提供的完整叙事。备份显示北岸在事故结束后仍延长过权限接管；下一步要查的是谁批准了延期。', 's3-midpoint-closing', { speaker: 'truth', portrait: 'truth', background: 'nightMessage' }),
  node('s3-midpoint-closing', 'act2', '事件三 · 旧账中点', '2027-03-15', '前半季的问题从“要不要接受统一”变成了“谁有资格定义安全，以及责任能否不等于接管”。', 's3-midpoint-exit', { mode: 'system', speaker: 'system', onEnter: [{ type: 'flag', key: 's3MidpointComplete' }] }),
  node('s3-midpoint-exit', 'act2', '事件三 · 旧账中点', '2027-03-15', '第三章完成。后半季目标已经更新。', undefined, { mode: 'system', speaker: 'system', background: 'ending' }),
]

const s3_36: StoryNode[] = [
  node('s3-trust-entry', 'act3', '事件三 · 信任重排', '2027-04-12', '替代章程进入公开起草期。组织需要你的决定，与你并肩的人也终于要求被放进决定本身。', { cases: routeCases('trust-route'), fallback: 's3-season-route-error' }, { mode: 'system', speaker: 'system' }),
  ...Object.entries(routes).map(([route, cfg]) => node(`s3-trust-route-${route}`, 'act3', '事件三 · 信任重排', '2027-04-12', cfg.trustPressure, 's3-trust-partner-router', { speaker: cfg.lead, portrait: cfg.lead, background: cfg.background })),
  node('s3-trust-partner-router', 'act3', '事件三 · 信任重排', '2027-04-12', '散会后，真正难回答的问题不在章程里。', {
    cases: partners.map(([id]) => ({ when: { type: 'variable' as const, key: 's3Partner', operator: 'eq' as const, value: id }, next: `s3-trust-partner-${id}` })),
    fallback: 's3-trust-partner-none',
  }, { background: 'nightMessage' }),
  ...partners.map(([id, speaker, text]) => node(`s3-trust-partner-${id}`, 'act3', '事件三 · 信任重排', '2027-04-12', text, 's3-trust-choice', { speaker, portrait: speaker, background: 'nightMessage' })),
  node('s3-trust-partner-none', 'act3', '事件三 · 信任重排', '2027-04-12', '老朋友没有把“一个人”说成缺少什么：“没人替你承担亲密关系的答案，也不等于你只能独自承担公共责任。”', 's3-trust-choice-none', { speaker: 'mentor', portrait: 'mentor', background: 'nightMessage' }),
  node('s3-trust-choice', 'act3', '事件三 · 信任重排', '2027-04-12', '你必须给这段关系一个能被后续检验的回答。', undefined, { speaker: 'player', portrait: 'player', background: 'nightMessage', choices: [
    { id: 's3-trust-stay-together', label: '“把风险和决定都告诉你，我们继续一起承担。”', effects: [{ type: 'variable', key: 's3RelationshipPromise', value: 'together' }, { type: 'activePartnerRelationship', key: 'trust', value: 2, fallbackCharacter: 'mentor' }], next: 's3-trust-result-together' },
    { id: 's3-trust-take-space', label: '“先拉开一点距离，但不把理解和尊重一起丢掉。”', effects: [{ type: 'variable', key: 's3RelationshipPromise', value: 'apart-understood' }], next: 's3-trust-result-apart' },
    { id: 's3-trust-break', label: '“我不能再让这段关系替我的公共选择付代价。”', tone: 'danger', effects: [{ type: 'variable', key: 's3RelationshipPromise', value: 'broken' }, { type: 'activePartnerRelationship', key: 'trust', value: -3, fallbackCharacter: 'mentor' }], next: 's3-trust-result-broken' },
  ] }),
  node('s3-trust-choice-none', 'act3', '事件三 · 信任重排', '2027-04-12', '没有伴侣线时，你仍要决定怎样分配自己的责任。', undefined, { speaker: 'player', portrait: 'player', choices: [
    { id: 's3-trust-none-team', label: '把决定过程交给可靠成员共同承担', effects: [{ type: 'variable', key: 's3RelationshipPromise', value: 'none-team' }, { type: 'stat', key: 'cohesion', value: 1 }], next: 's3-trust-result-none-team' },
    { id: 's3-trust-none-self', label: '保留个人空间，但公开每一步责任', effects: [{ type: 'variable', key: 's3RelationshipPromise', value: 'none-self' }, { type: 'stat', key: 'reputation', value: 1 }], next: 's3-trust-result-none-self' },
  ] }),
  node('s3-trust-result-together', 'act3', '事件三 · 信任重排', '2027-04-12', '对方没有要求你保证永远正确，只要求下次风险到来时，自己不是最后一个知道的人。', 's3-trust-closing', { speaker: 'narrator', background: 'nightMessage' }),
  node('s3-trust-result-apart', 'act3', '事件三 · 信任重排', '2027-04-12', '你们没有把距离包装成圆满。对方保留理解，也保留不再替你承担每一次后果的权利。', 's3-trust-closing', { speaker: 'narrator', background: 'nightMessage' }),
  node('s3-trust-result-broken', 'act3', '事件三 · 信任重排', '2027-04-12', '对话结束得很安静。没有谁被写成反派；你们只是承认，继续下去已经比结束更不诚实。', 's3-trust-closing', { speaker: 'narrator', background: 'nightMessage' }),
  node('s3-trust-result-none-team', 'act3', '事件三 · 信任重排', '2027-04-12', '成员群里第一次出现一份没有首领名字也能继续执行的责任表。你不再把独立误写成孤立。', 's3-trust-closing', { speaker: 'system', mode: 'system', background: 'organization' }),
  node('s3-trust-result-none-self', 'act3', '事件三 · 信任重排', '2027-04-12', '你保留自己的房间，也把每项公共决定完整公开。没人替你兜底，但所有人都知道门在哪里。', 's3-trust-closing', { speaker: 'mentor', portrait: 'mentor', background: 'nightMessage' }),
  node('s3-trust-closing', 'act3', '事件三 · 信任重排', '2027-04-12', '替代章程完成第一稿。它既记录组织如何分权，也记录人可以拒绝替另一个人无限承担。', 's3-trust-exit', { mode: 'system', speaker: 'system', onEnter: [{ type: 'flag', key: 's3TrustComplete' }] }),
  node('s3-trust-exit', 'act3', '事件三 · 信任重排', '2027-04-12', '第四章完成。关系承诺与替代章程已经保存。', undefined, { mode: 'system', speaker: 'system', background: 'ending' }),
]

const s3_37: StoryNode[] = [
  node('s3-crisis-entry', 'act4', '事件三 · 最终立场', '2027-05-31', '北岸提前公布六月三十日表决文本：若统一方案通过，各组织现有权限将在当夜转入联席理事会。', { cases: routeCases('crisis-route'), fallback: 's3-season-route-error' }, { mode: 'system', speaker: 'system', background: 'mutedKey', onEnter: [{ type: 'flag', key: 's3CrisisEntered' }] }),
  ...Object.entries(routes).map(([route, cfg]) => node(`s3-crisis-route-${route}`, 'act4', '事件三 · 最终立场', '2027-05-31', cfg.crisis, 's3-crisis-prior-router', { speaker: cfg.lead, portrait: cfg.lead, background: cfg.background })),
  node('s3-crisis-prior-router', 'act4', '事件三 · 最终立场', '2027-05-31', '你早先选择的长期策略，现在决定了手里最强的筹码。', {
    cases: [
      { when: { type: 'variable', key: 's3Commitment', operator: 'eq', value: 'coalition' }, next: 's3-crisis-prior-coalition' },
      { when: { type: 'variable', key: 's3Commitment', operator: 'eq', value: 'negotiation' }, next: 's3-crisis-prior-negotiation' },
      { when: { type: 'variable', key: 's3Commitment', operator: 'eq', value: 'investigation' }, next: 's3-crisis-prior-investigation' },
    ], fallback: 's3-crisis-prior-missing',
  }),
  node('s3-crisis-prior-coalition', 'act4', '事件三 · 最终立场', '2027-05-31', '五组织已有共同签名页；它足以提出全区替代案，也意味着任何一组退出都会被所有人看见。', 's3-crisis-warning', { speaker: 'heartbeat', portrait: 'heartbeat' }),
  node('s3-crisis-prior-negotiation', 'act4', '事件三 · 最终立场', '2027-05-31', '逐条谈判已留下六项北岸书面让步；你可以逼它继续后退，也可能因保留框架而失去最激进的支持者。', 's3-crisis-warning', { speaker: 'shen-zhixing', portrait: 'shen-zhixing' }),
  node('s3-crisis-prior-investigation', 'act4', '事件三 · 最终立场', '2027-05-31', '备份证明北岸曾在事故结束后越权延长接管。公开它能击穿统一方案的正当性，也会同时暴露4945区内部最早的违规授权。', 's3-crisis-warning', { speaker: 'truth', portrait: 'truth' }),
  node('s3-crisis-prior-missing', 'act4', '事件三 · 最终立场', '2027-05-31', '旧档缺少长期策略记录。你没有获得额外筹码，但仍能以当前组织立场进入终局。', 's3-crisis-warning', { mode: 'system', speaker: 'system', onEnter: [{ type: 'flag', key: 's3LegacyCommitmentMissing' }] }),
  node('s3-crisis-warning', 'act4', '事件三 · 最终立场', '2027-05-31', '【最终立场确认】继续后，本进度将锁定进入六月三十日表决的方式。你仍可保存并返回标题，但不能在同一进度中重选此前承诺。', 's3-crisis-choice', { mode: 'system', speaker: 'system', background: 'aftermath' }),
  node('s3-crisis-choice', 'act4', '事件三 · 最终立场', '2027-05-31', '你把最后一页放到桌上。', undefined, { speaker: 'player', portrait: 'player', choices: [
    { id: 's3-crisis-unite', label: '确认：以五组织替代章程进入表决', detail: '争取第三道路；需要公开承担彼此漏洞。', effects: [{ type: 'variable', key: 's3FinalStance', value: 'unite' }, { type: 'flag', key: 's3PointOfNoReturn' }, { type: 'stat', key: 'cohesion', value: 1 }], next: 's3-crisis-result-unite' },
    { id: 's3-crisis-bargain', label: '确认：以本组织保护条款与北岸逐项交换', detail: '优先保住组织核心权利，接受部分共同架构。', effects: [{ type: 'variable', key: 's3FinalStance', value: 'bargain' }, { type: 'flag', key: 's3PointOfNoReturn' }, { type: 'stat', key: 'resources', value: 1 }], next: 's3-crisis-result-bargain' },
    { id: 's3-crisis-expose', label: '确认：公开越权证据，要求统一方案整体撤回', detail: '冲击最大；若单独行动失败，组织会失去最后议价空间。', tone: 'danger', effects: [{ type: 'variable', key: 's3FinalStance', value: 'expose' }, { type: 'flag', key: 's3PointOfNoReturn' }, { type: 'stat', key: 'evidence', value: 1 }], next: 's3-crisis-result-expose' },
  ] }),
  node('s3-crisis-result-unite', 'act4', '事件三 · 最终立场', '2027-05-31', '五张签名页合成一份提案。联盟不再只是反对北岸，而是第一次承诺如何共同处理下一次事故。', 's3-crisis-closing', { speaker: 'north-observer', portrait: 'north-observer' }),
  node('s3-crisis-result-bargain', 'act4', '事件三 · 最终立场', '2027-05-31', '你的组织保护条款被写入正式议程。其他组织不会替你保证结果，这场表决从共同抵抗变成了各自守住底线。', 's3-crisis-closing', { speaker: 'shen-zhixing', portrait: 'shen-zhixing' }),
  node('s3-crisis-result-expose', 'act4', '事件三 · 最终立场', '2027-05-31', '越权记录进入全区公示。北岸失去道德高地，也停止一切非正式沟通：六月三十日，只剩赞成或否决。', 's3-crisis-closing', { speaker: 'truth', portrait: 'truth', background: 'worldChat' }),
  node('s3-crisis-closing', 'act4', '事件三 · 最终立场', '2027-05-31', '终局入口已锁定。你知道自己准备守住什么，也知道最坏会失去什么。', 's3-crisis-exit', { mode: 'system', speaker: 'system', onEnter: [{ type: 'flag', key: 's3CrisisComplete' }] }),
  node('s3-crisis-exit', 'act4', '事件三 · 最终立场', '2027-05-31', '第五章完成。六月三十日表决已解锁。', undefined, { mode: 'system', speaker: 'system', background: 'ending' }),
]

const endingIds = Object.fromEntries((Object.keys(routes) as ActiveRoute[]).map((route) => [route, {
  autonomy: `s3-ending-${route}-autonomy`, safeguard: `s3-ending-${route}-safeguard`,
}])) as Record<ActiveRoute, { autonomy: string; safeguard: string }>

const s3_38: StoryNode[] = [
  node('s3-finale-entry', 'act4', '事件三 · 北岸表决', '2027-06-30', '联合会客厅所有席位亮起。沈知行宣读统一方案，观察员同时展示你们提交的替代文件、保护条款或越权证据。', {
    cases: [
      { when: { type: 'variable', key: 's3FinalStance', operator: 'eq', value: 'unite' }, next: 's3-finale-open-unite' },
      { when: { type: 'variable', key: 's3FinalStance', operator: 'eq', value: 'bargain' }, next: 's3-finale-open-bargain' },
      { when: { type: 'variable', key: 's3FinalStance', operator: 'eq', value: 'expose' }, next: 's3-finale-open-expose' },
    ], fallback: 's3-finale-state-error',
  }, { mode: 'system', speaker: 'system', background: 'warRoom' }),
  node('s3-finale-state-error', 'act4', '事件三 · 北岸表决', '2027-06-30', '当前进度没有完成最终立场确认，无法替你生成结局。请返回章节中心完成上一章。', 's3-finale-error-exit', { mode: 'system', speaker: 'system', background: 'aftermath' }),
  node('s3-finale-error-exit', 'act4', '事件三 · 北岸表决', '2027-06-30', '连续性检查未通过；本章未被标记完成。', undefined, { mode: 'system', speaker: 'system', background: 'aftermath' }),
  node('s3-finale-open-unite', 'act4', '事件三 · 北岸表决', '2027-06-30', '五组织替代章程获得正式陈述资格。你可以争取第三道路，也可以在最后一刻优先保护本组织。', 's3-finale-route-router', { speaker: 'heartbeat', portrait: 'heartbeat' }),
  node('s3-finale-open-bargain', 'act4', '事件三 · 北岸表决', '2027-06-30', '逐条谈判留下的保护条款全部摆在桌上。你可以守住组织自治，也可以接受带撤回权的共同架构。', 's3-finale-route-router', { speaker: 'shen-zhixing', portrait: 'shen-zhixing' }),
  node('s3-finale-open-expose', 'act4', '事件三 · 北岸表决', '2027-06-30', '越权证据让北岸失去两票。你可以把证据用于谈判，也可以独自要求整体否决——后者若失败，将失去所有保护条款。', 's3-finale-route-router', { speaker: 'truth', portrait: 'truth' }),
  node('s3-finale-route-router', 'act4', '事件三 · 北岸表决', '2027-06-30', '最后行动必须由你的组织提出。', { cases: routeCases('finale-route'), fallback: 's3-season-route-error' }, { mode: 'system', speaker: 'system' }),
  ...Object.entries(routes).map(([route, cfg]) => node(`s3-finale-route-${route}`, 'act4', '事件三 · 北岸表决', '2027-06-30', cfg.crisis, 's3-finale-choice', { speaker: cfg.lead, portrait: cfg.lead, background: cfg.background })),
  node('s3-finale-choice', 'act4', '事件三 · 北岸表决', '2027-06-30', '这是本季最后一次结构选择。结果不会被关系线或旧结局替你改写。', undefined, { speaker: 'player', portrait: 'player', choices: [
    { id: 's3-finale-route-autonomy', label: '否决本组织受控条款，承担退出共同资源的代价', detail: '路线自治结局。', effects: [{ type: 'variable', key: 's3FinalAction', value: 'autonomy' }], next: 's3-finale-autonomy-router' },
    { id: 's3-finale-route-safeguard', label: '接受共同架构，但写入不可绕过的撤回与复核权', detail: '路线保护条款结局。', effects: [{ type: 'variable', key: 's3FinalAction', value: 'safeguard' }], next: 's3-finale-safeguard-router' },
    { id: 's3-finale-third-way', label: '提交五组织替代章程，让责任共享而权力可撤回', detail: '仅最终立场为联合时可用；跨路线统一结局。', condition: { type: 'variable', key: 's3FinalStance', operator: 'eq', value: 'unite' }, effects: [{ type: 'variable', key: 's3FinalAction', value: 'third-way' }, { type: 'variable', key: 's3MainEnding', value: 's3-ending-third-way' }], next: 's3-finale-ending-third-way' },
    { id: 's3-finale-solo-rejection', label: '独自公开全部证据，要求全案立即否决', detail: '仅公开证据路线可选；已明确警告，若无共同提案将失去全部保护。', tone: 'danger', condition: { type: 'variable', key: 's3FinalStance', operator: 'eq', value: 'expose' }, effects: [{ type: 'variable', key: 's3FinalAction', value: 'solo-rejection' }, { type: 'variable', key: 's3MainEnding', value: 's3-ending-absorbed' }], next: 's3-finale-ending-absorbed' },
  ] }),
  node('s3-finale-autonomy-router', 'act4', '事件三 · 北岸表决', '2027-06-30', '你选择用真实资源代价换回组织自治。', { cases: (Object.keys(routes) as ActiveRoute[]).map((route) => ({ when: { type: 'route', value: route }, next: `s3-finale-ending-${route}-autonomy` })), fallback: 's3-season-route-error' }),
  node('s3-finale-safeguard-router', 'act4', '事件三 · 北岸表决', '2027-06-30', '你选择进入共同架构，并把撤回权写进正文。', { cases: (Object.keys(routes) as ActiveRoute[]).map((route) => ({ when: { type: 'route', value: route }, next: `s3-finale-ending-${route}-safeguard` })), fallback: 's3-season-route-error' }),
  ...Object.entries(routes).flatMap(([routeValue, cfg]): StoryNode[] => {
    const route = routeValue as ActiveRoute
    return [
      node(`s3-finale-ending-${route}-autonomy`, 'act4', '事件三 · 北岸表决', '2027-06-30', cfg.autonomyText, 's3-finale-closing', { title: cfg.autonomyTitle, mode: 'ending', speaker: cfg.lead, portrait: cfg.lead, background: 'ending', onEnter: [{ type: 'variable', key: 's3MainEnding', value: endingIds[route].autonomy }, { type: 'unlockEnding', id: endingIds[route].autonomy }] }),
      node(`s3-finale-ending-${route}-safeguard`, 'act4', '事件三 · 北岸表决', '2027-06-30', cfg.safeguardText, 's3-finale-closing', { title: cfg.safeguardTitle, mode: 'ending', speaker: cfg.lead, portrait: cfg.lead, background: 'ending', onEnter: [{ type: 'variable', key: 's3MainEnding', value: endingIds[route].safeguard }, { type: 'unlockEnding', id: endingIds[route].safeguard }] }),
    ]
  }),
  node('s3-finale-ending-third-way', 'act4', '事件三 · 北岸表决', '2027-06-30', '替代章程以一票优势通过：联席机构保留事故协调权，却没有永久常任理事；所有备案可撤回，所有紧急授权都有公开期限。北岸没有被赶走，4945区也没有被接管。', 's3-finale-closing', { title: '第三道路', mode: 'ending', speaker: 'shen-zhixing', portrait: 'shen-zhixing', background: 'ending', onEnter: [{ type: 'unlockEnding', id: 's3-ending-third-way' }] }),
  node('s3-finale-ending-absorbed', 'act4', '事件三 · 北岸表决', '2027-06-30', '证据击穿了北岸的道德优势，却没有形成可执行替代案。统一方案在混乱中以最低门槛通过；你的组织获得申诉权，却在今夜失去独立决策资格。', 's3-finale-closing', { title: '被吸收的席位', mode: 'ending', speaker: 'north-observer', portrait: 'north-observer', background: 'ending', onEnter: [{ type: 'unlockEnding', id: 's3-ending-absorbed' }, { type: 'flag', key: 's3FinaleFailure' }] }),
  node('s3-finale-closing', 'act4', '事件三 · 北岸表决', '2027-06-30', '表决结束。沈知行收起北岸印章，没有替你解释胜负：“制度会留下，人也会。接下来该看你们怎样一起活在结果里。”', 's3-finale-exit', { speaker: 'shen-zhixing', portrait: 'shen-zhixing', onEnter: [{ type: 'flag', key: 's3MainConflictResolved' }] }),
  node('s3-finale-exit', 'act4', '事件三 · 北岸表决', '2027-06-30', '第六章完成。主要结局已锁定，路线余波与关系收束已解锁。', undefined, { mode: 'system', speaker: 'system', background: 'ending' }),
]

const mainEndingCases = [
  ...(Object.keys(routes) as ActiveRoute[]).flatMap((route) => ([
    { id: endingIds[route].autonomy, next: `s3-epilogue-main-${route}-autonomy` },
    { id: endingIds[route].safeguard, next: `s3-epilogue-main-${route}-safeguard` },
  ])),
  { id: 's3-ending-third-way', next: 's3-epilogue-main-third-way' },
  { id: 's3-ending-absorbed', next: 's3-epilogue-main-absorbed' },
]

const s3_39: StoryNode[] = [
  node('s3-epilogue-entry', 'epilogue', '事件三 · 六月三十日', '2027-06-30', '人群散去以后，表决结果才开始变成生活。', { cases: mainEndingCases.map(({ id, next }) => ({ when: { type: 'variable', key: 's3MainEnding', operator: 'eq', value: id }, next })), fallback: 's3-epilogue-ending-error' }, { background: 'aftermath' }),
  node('s3-epilogue-ending-error', 'epilogue', '事件三 · 六月三十日', '2027-06-30', '当前存档缺少合法的第三季主要结局，无法生成他人的尾声。进度已安全停下。', 's3-epilogue-error-exit', { mode: 'system', speaker: 'system' }),
  node('s3-epilogue-error-exit', 'epilogue', '事件三 · 六月三十日', '2027-06-30', '连续性检查未通过；事件三未被标记完成。', undefined, { mode: 'system', speaker: 'system', background: 'aftermath' }),
  ...Object.entries(routes).flatMap(([route, cfg]): StoryNode[] => [
    node(`s3-epilogue-main-${route}-autonomy`, 'epilogue', '事件三 · 六月三十日', '2027-06-30', `${cfg.name}失去一部分公共资源，却第一次把每项代价写在自己的决定下面。${cfg.autonomyText}`, 's3-epilogue-partner-router', { speaker: cfg.lead, portrait: cfg.lead, background: cfg.background }),
    node(`s3-epilogue-main-${route}-safeguard`, 'epilogue', '事件三 · 六月三十日', '2027-06-30', `${cfg.name}进入新的共同架构。${cfg.safeguardText} 第一张撤回申请表被放在所有人都看得见的位置。`, 's3-epilogue-partner-router', { speaker: cfg.lead, portrait: cfg.lead, background: cfg.background }),
  ]),
  node('s3-epilogue-main-third-way', 'epilogue', '事件三 · 六月三十日', '2027-06-30', '五个组织没有变成一个组织。新的联席会只在事故发生时获得限期授权，任何组织都能公开退出。你们保留了分歧，也终于学会让分歧不等于失控。', 's3-epilogue-partner-router', { speaker: 'mentor', portrait: 'mentor', background: 'rewardHall' }),
  node('s3-epilogue-main-absorbed', 'epilogue', '事件三 · 六月三十日', '2027-06-30', '组织名仍在，确认键却先经过北岸。失败没有删掉你做过的事；成员开始整理申诉、保留私人联络，并约定下一次不只带证据，还要带一份能执行的替代方案。', 's3-epilogue-partner-router', { speaker: 'mentor', portrait: 'mentor', background: 'aftermath' }),
  node('s3-epilogue-partner-router', 'epilogue', '事件三 · 六月三十日', '2027-06-30', '公共结果已经确定，最后一段话只属于你与一路同行的人。', { cases: partners.map(([id]) => ({ when: { type: 'variable' as const, key: 's3Partner', operator: 'eq' as const, value: id }, next: `s3-epilogue-partner-${id}` })), fallback: 's3-epilogue-partner-none' }, { background: 'nightMessage' }),
  ...partners.map(([id, speaker]) => node(`s3-epilogue-partner-${id}`, 'epilogue', '事件三 · 六月三十日', '2027-06-30', '对方没有问你赢了多少票，只问四月那句承诺现在还算不算。你们都知道，答案不能再由季终气氛替代。', 's3-epilogue-relation-router', { speaker, portrait: speaker, background: 'nightMessage' })),
  node('s3-epilogue-partner-none', 'epilogue', '事件三 · 六月三十日', '2027-06-30', '你独自走出会客厅，却不是无人同行。成员把新的责任表传到群里，老朋友只回了一个“收到”。', 's3-epilogue-relation-none', { speaker: 'mentor', portrait: 'mentor', background: 'nightMessage' }),
  node('s3-epilogue-relation-router', 'epilogue', '事件三 · 六月三十日', '2027-06-30', '四月的关系承诺在这里兑现。', {
    cases: [
      { when: { type: 'variable', key: 's3RelationshipPromise', operator: 'eq', value: 'together' }, next: 's3-epilogue-relation-together' },
      { when: { type: 'variable', key: 's3RelationshipPromise', operator: 'eq', value: 'apart-understood' }, next: 's3-epilogue-relation-apart' },
      { when: { type: 'variable', key: 's3RelationshipPromise', operator: 'eq', value: 'broken' }, next: 's3-epilogue-relation-broken' },
    ], fallback: 's3-epilogue-relation-apart',
  }),
  node('s3-epilogue-relation-together', 'epilogue', '事件三 · 六月三十日', '2027-06-30', '“算。”你把下一份风险表先发给对方。你们没有承诺永远站在同一边，只承诺不再把彼此排除在决定之外。', 's3-epilogue-summary', { speaker: 'player', portrait: 'player', background: 'nightMessage', onEnter: [{ type: 'variable', key: 's3RelationshipResolution', value: 'together' }] }),
  node('s3-epilogue-relation-apart', 'epilogue', '事件三 · 六月三十日', '2027-06-30', '你们没有恢复原来的距离，也没有否定走过的路。理解被保留下来，未来不再被强迫写成同一个方向。', 's3-epilogue-summary', { speaker: 'narrator', background: 'nightMessage', onEnter: [{ type: 'variable', key: 's3RelationshipResolution', value: 'apart-understood' }] }),
  node('s3-epilogue-relation-broken', 'epilogue', '事件三 · 六月三十日', '2027-06-30', '最后一次对话没有争输赢。你们归还彼此的权限、称呼和期待，让结束成为一项共同承认的事实。', 's3-epilogue-summary', { speaker: 'narrator', background: 'nightMessage', onEnter: [{ type: 'variable', key: 's3RelationshipResolution', value: 'broken' }, { type: 'activePartner', character: null }] }),
  node('s3-epilogue-relation-none', 'epilogue', '事件三 · 六月三十日', '2027-06-30', '没有伴侣结局并不等于留白。你把自己的名字写进新责任表，也保留了随时离开任何位置的权利。', 's3-epilogue-summary', { speaker: 'player', portrait: 'player', background: 'nightMessage', onEnter: [{ type: 'variable', key: 's3RelationshipResolution', value: 'none' }] }),
  node('s3-epilogue-summary', 'epilogue', '事件三 · 六月三十日', '2027-06-30', '【事件三总结】你继承了前两季留下的组织与关系，在北岸冻结中选择回应，以自己的方式承担责任，经历旧账、信任与最终表决，并把主要结局和关系收束留在同一条连续记录里。这是第三季的结束，不是所有故事的永久终点。', 's3-epilogue-exit', { mode: 'ending', speaker: 'system', background: 'ending', onEnter: [{ type: 'flag', key: 's3Complete' }, { type: 'flag', key: 's3EpilogueComplete' }, { type: 'unlockEnding', id: 's3-finale-complete' }] }),
  node('s3-epilogue-exit', 'epilogue', '事件三 · 六月三十日', '2027-06-30', '事件三已完成。主要结局、关系收束与三季连续性已保存。', undefined, { mode: 'system', speaker: 'system', background: 'ending' }),
]

const common: StoryNode[] = [
  node('s3-season-route-error', 'act1', '事件三 · 连续性检查', '2027-01-05', '当前进度缺少合法的二至六组路线，系统没有把你静默分配到其他组织。请返回标题选择有效的事件二结局档案。', 's3-season-error-exit', { mode: 'system', speaker: 'system', background: 'aftermath' }),
  node('s3-season-error-exit', 'act1', '事件三 · 连续性检查', '2027-01-05', '连续性检查未通过；当前章节未被标记完成。', undefined, { mode: 'system', speaker: 'system', background: 'aftermath' }),
]

/** 第三季正式主线：每集由显式完成哨兵隔开，状态只通过登记变量跨集消费。 */
export const s3SeasonNodes: StoryNode[] = [
  ...common,
  ...s3_33,
  ...s3_34,
  ...s3_35,
  ...s3_36,
  ...s3_37,
  ...s3_38,
  ...s3_39,
]

export const S3_MAIN_ENDING_IDS = [
  ...Object.values(endingIds).flatMap((entry) => [entry.autonomy, entry.safeguard]),
  's3-ending-third-way',
  's3-ending-absorbed',
] as const
