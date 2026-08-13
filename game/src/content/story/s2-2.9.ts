import type { StoryNode } from '@/engine/types'

// 2.9 事件二 · 路线尾声、关系收束与 3.0 RC（SOL-PLAN-2.9）。
//
// 回收 s2MainEnding 路由到 10 个结局各一个可玩尾声，包含路线余波、成员反应、
// 可见代价与成果、玩家最终回应。关系收束反映 2.6 交汇和 2.8 主要结局。
// 全部 convergent 到季总结后关闭。所有 dueIn <= 2.9 的选择清零。
//
// 零新增 CharacterId / 路线 / 托管视觉；复用 aftermath 与既有立绘。

const aftermathBg = 'aftermath'
const endingBg = 'ending'

export const s2_2_9_Nodes: StoryNode[] = [
  // ───────── 进场：按 s2MainEnding 路由 ─────────
  {
    id: 's2-2.9-entry',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-11-01',
    title: '之后',
    location: '4945区', mode: 'novel',
    speaker: 'narrator',
    text: '评议散场后的第二周，4945区下了第一场秋雨。联合活动室的灯白天还亮着，但坐在里面的人少了很多——各组织回到了各自的日常里。你也是。只是有些东西不太一样了：你的桌上多了新的文件，通讯录里少了一些人，又多了一些人。你打开窗透气，远处有人在喊你。故事还没讲完，但你站在这里了。',
    background: aftermathBg, historical: 'fictional',
    onEnter: [
      { type: 'flag', key: 's2EpilogueEntered' },
    ],
    next: {
      type: 'conditional',
      cases: [
        { when: { type: 'all', conditions: [{ type: 'route', value: 'org2' }, { type: 'variable', key: 's2MainEnding', operator: 'eq', value: 's2-ending-org2-triumph' }] }, next: 's2-2.9-org2-triumph' },
        { when: { type: 'all', conditions: [{ type: 'route', value: 'org2' }, { type: 'variable', key: 's2MainEnding', operator: 'eq', value: 's2-ending-org2-compromise' }] }, next: 's2-2.9-org2-compromise' },
        { when: { type: 'all', conditions: [{ type: 'route', value: 'org3' }, { type: 'variable', key: 's2MainEnding', operator: 'eq', value: 's2-ending-org3-triumph' }] }, next: 's2-2.9-org3-triumph' },
        { when: { type: 'all', conditions: [{ type: 'route', value: 'org3' }, { type: 'variable', key: 's2MainEnding', operator: 'eq', value: 's2-ending-org3-compromise' }] }, next: 's2-2.9-org3-compromise' },
        { when: { type: 'all', conditions: [{ type: 'route', value: 'org4' }, { type: 'variable', key: 's2MainEnding', operator: 'eq', value: 's2-ending-org4-triumph' }] }, next: 's2-2.9-org4-triumph' },
        { when: { type: 'all', conditions: [{ type: 'route', value: 'org4' }, { type: 'variable', key: 's2MainEnding', operator: 'eq', value: 's2-ending-org4-compromise' }] }, next: 's2-2.9-org4-compromise' },
        { when: { type: 'all', conditions: [{ type: 'route', value: 'org5' }, { type: 'variable', key: 's2MainEnding', operator: 'eq', value: 's2-ending-org5-triumph' }] }, next: 's2-2.9-org5-triumph' },
        { when: { type: 'all', conditions: [{ type: 'route', value: 'org5' }, { type: 'variable', key: 's2MainEnding', operator: 'eq', value: 's2-ending-org5-compromise' }] }, next: 's2-2.9-org5-compromise' },
        { when: { type: 'all', conditions: [{ type: 'route', value: 'org6' }, { type: 'variable', key: 's2MainEnding', operator: 'eq', value: 's2-ending-org6-triumph' }] }, next: 's2-2.9-org6-triumph' },
        { when: { type: 'all', conditions: [{ type: 'route', value: 'org6' }, { type: 'variable', key: 's2MainEnding', operator: 'eq', value: 's2-ending-org6-compromise' }] }, next: 's2-2.9-org6-compromise' },
      ],
      fallback: 's2-2.9-ending-repair',
    },
  },

  // 缺失或路线不匹配的主结局必须由玩家重新确认，避免归档伪造结局。
  {
    id: 's2-2.9-ending-repair',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-11-01',
    title: '结局记录待确认', location: '4945区 · 档案室', mode: 'chat', speaker: 'player',
    text: '档案中的组织与主结局无法对应。归档前，请按这一季的真实结果重新确认：',
    background: aftermathBg, historical: 'fictional',
    choices: [
      { id: 's2-2.9-repair-org2-triumph', label: '二组：重谈条款，承担人员流失', tone: 'bold', condition: { type: 'route', value: 'org2' }, effects: [{ type: 'variable', key: 's2MainEnding', value: 's2-ending-org2-triumph' }, { type: 'flag', key: 's2ContinuityRepaired' }], next: 's2-2.9-org2-triumph' },
      { id: 's2-2.9-repair-org2-compromise', label: '二组：保住全员，接受权重下调', tone: 'warm', condition: { type: 'route', value: 'org2' }, effects: [{ type: 'variable', key: 's2MainEnding', value: 's2-ending-org2-compromise' }, { type: 'flag', key: 's2ContinuityRepaired' }], next: 's2-2.9-org2-compromise' },
      { id: 's2-2.9-repair-org3-triumph', label: '三组：拒签并申请重新评定', tone: 'bold', condition: { type: 'route', value: 'org3' }, effects: [{ type: 'variable', key: 's2MainEnding', value: 's2-ending-org3-triumph' }, { type: 'flag', key: 's2ContinuityRepaired' }], next: 's2-2.9-org3-triumph' },
      { id: 's2-2.9-repair-org3-compromise', label: '三组：接受评估并附说明函', tone: 'warm', condition: { type: 'route', value: 'org3' }, effects: [{ type: 'variable', key: 's2MainEnding', value: 's2-ending-org3-compromise' }, { type: 'flag', key: 's2ContinuityRepaired' }], next: 's2-2.9-org3-compromise' },
      { id: 's2-2.9-repair-org4-triumph', label: '四组：拆分精英赛道', tone: 'bold', condition: { type: 'route', value: 'org4' }, effects: [{ type: 'variable', key: 's2MainEnding', value: 's2-ending-org4-triumph' }, { type: 'flag', key: 's2ContinuityRepaired' }], next: 's2-2.9-org4-triumph' },
      { id: 's2-2.9-repair-org4-compromise', label: '四组：统一标准并保留加赛', tone: 'warm', condition: { type: 'route', value: 'org4' }, effects: [{ type: 'variable', key: 's2MainEnding', value: 's2-ending-org4-compromise' }, { type: 'flag', key: 's2ContinuityRepaired' }], next: 's2-2.9-org4-compromise' },
      { id: 's2-2.9-repair-org5-triumph', label: '五组：拒绝公示外联网络', tone: 'bold', condition: { type: 'route', value: 'org5' }, effects: [{ type: 'variable', key: 's2MainEnding', value: 's2-ending-org5-triumph' }, { type: 'flag', key: 's2ContinuityRepaired' }], next: 's2-2.9-org5-triumph' },
      { id: 's2-2.9-repair-org5-compromise', label: '五组：公示六成并保留核心', tone: 'warm', condition: { type: 'route', value: 'org5' }, effects: [{ type: 'variable', key: 's2MainEnding', value: 's2-ending-org5-compromise' }, { type: 'flag', key: 's2ContinuityRepaired' }], next: 's2-2.9-org5-compromise' },
      { id: 's2-2.9-repair-org6-triumph', label: '六组：取得独立表决位', tone: 'bold', condition: { type: 'route', value: 'org6' }, effects: [{ type: 'variable', key: 's2MainEnding', value: 's2-ending-org6-triumph' }, { type: 'flag', key: 's2ContinuityRepaired' }], next: 's2-2.9-org6-triumph' },
      { id: 's2-2.9-repair-org6-compromise', label: '六组：接受观察期与自动评审', tone: 'warm', condition: { type: 'route', value: 'org6' }, effects: [{ type: 'variable', key: 's2MainEnding', value: 's2-ending-org6-compromise' }, { type: 'flag', key: 's2ContinuityRepaired' }], next: 's2-2.9-org6-compromise' },
      { id: 's2-2.9-repair-route', label: '组织记录也不完整，先重新确认组织', tone: 'calm', condition: { type: 'not', condition: { type: 'any', conditions: [{ type: 'route', value: 'org2' }, { type: 'route', value: 'org3' }, { type: 'route', value: 'org4' }, { type: 'route', value: 'org5' }, { type: 'route', value: 'org6' }] } }, effects: [], next: 's2-2.9-route-repair' },
    ],
  },
  {
    id: 's2-2.9-route-repair',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-11-01',
    title: '组织记录待确认', location: '4945区 · 档案室', mode: 'chat', speaker: 'player',
    text: '事件二的组织记录也不完整。确认组织后，系统会返回结局确认页，不会自动选择结局。',
    background: aftermathBg, historical: 'fictional',
    choices: [
      { id: 's2-2.9-repair-route-org2', label: '二组', tone: 'calm', effects: [{ type: 'route', route: 'org2', organization: 'org2' }, { type: 'flag', key: 's2ContinuityRepaired' }], next: 's2-2.9-ending-repair' },
      { id: 's2-2.9-repair-route-org3', label: '三组', tone: 'calm', effects: [{ type: 'route', route: 'org3', organization: 'org3' }, { type: 'flag', key: 's2ContinuityRepaired' }], next: 's2-2.9-ending-repair' },
      { id: 's2-2.9-repair-route-org4', label: '四组', tone: 'calm', effects: [{ type: 'route', route: 'org4', organization: 'org4' }, { type: 'flag', key: 's2ContinuityRepaired' }], next: 's2-2.9-ending-repair' },
      { id: 's2-2.9-repair-route-org5', label: '五组', tone: 'calm', effects: [{ type: 'route', route: 'org5', organization: 'org5' }, { type: 'flag', key: 's2ContinuityRepaired' }], next: 's2-2.9-ending-repair' },
      { id: 's2-2.9-repair-route-org6', label: '六组', tone: 'calm', effects: [{ type: 'route', route: 'org6', organization: 'org6', organizationName: '第六组织' }, { type: 'flag', key: 's2ContinuityRepaired' }], next: 's2-2.9-ending-repair' },
    ],
  },

  // ───────── 二组 · triumph 尾声 —— 铁锻之后 ─────────
  {
    id: 's2-2.9-org2-triumph',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-11-01',
    title: '二组 · 锻',
    location: '4945区 · 二组活动室', mode: 'chat',
    speaker: 'shana', portrait: 'shana',
    text: '夏娜把评议归档文件合上。二组的人少了三个——你改那张表决书的时候，就知道会有人走。她把新排的座位表推给你：留下的人一个个重新落位，每个名字旁边都有手写的训练计划。“人少了，力气没少。”她说，“走的人留了信——等你赢到第三季，他们回来。”你数了数那张表。这不是原来的二组，是你亲手打出来的这个。',
    background: aftermathBg, historical: 'fictional',
    onEnter: [
      { type: 'unlockEnding', id: 's2-ending-org2-triumph' },
      { type: 'variable', key: 's2EpilogueEnding', value: 's2-ending-org2-triumph' },
      { type: 'stat', key: 'cohesion', operation: 'add', value: 1 },
    ],
    next: 's2-2.9-rel-closure',
  },

  // ───────── 二组 · compromise 尾声 —— 全守之后 ─────────
  {
    id: 's2-2.9-org2-compromise',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-11-01',
    title: '二组 · 守',
    location: '4945区 · 二组活动室', mode: 'chat',
    speaker: 'bottle', portrait: 'bottle',
    text: '瓶靠在门口，扬了扬手里的月度排班表——所有人都在，一个没少。“你把人员条款锁死了，代价是评估权重下调。我知道。”他把排班表拍在桌上，“末席就末席。人齐了，路就长。六个月后翻回来。”你这才看见，表上每个名字旁边都画了一颗星——不是评估给的，是他画的。二组没赢这一轮。但它没有散。',
    background: aftermathBg, historical: 'fictional',
    onEnter: [
      { type: 'unlockEnding', id: 's2-ending-org2-compromise' },
      { type: 'variable', key: 's2EpilogueEnding', value: 's2-ending-org2-compromise' },
      { type: 'stat', key: 'reputation', operation: 'add', value: 1 },
    ],
    next: 's2-2.9-rel-closure',
  },

  // ───────── 三组 · triumph 尾声 —— 赌局开牌 ─────────
  {
    id: 's2-2.9-org3-triumph',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-11-01',
    title: '三组 · 开',
    location: '4945区 · 三组数据中心', mode: 'chat',
    speaker: 'truth', portrait: 'truth',
    text: '真理把未来三个月的赛程表摊在你面前，每一场旁边都标了数据目标——你在评议上拒签换来的评定窗口，全在这张表上。她没说“加油”，也没说“别输”，只把一支红色记号笔放在表上：“第一场，我记。”三组的人围过来，一人拿了一支笔。接下来九十天，每一秒都会被记下来——不是用来怀念的，是用来翻盘的。',
    background: aftermathBg, historical: 'fictional',
    onEnter: [
      { type: 'unlockEnding', id: 's2-ending-org3-triumph' },
      { type: 'variable', key: 's2EpilogueEnding', value: 's2-ending-org3-triumph' },
      { type: 'stat', key: 'cohesion', operation: 'add', value: 2 },
    ],
    next: 's2-2.9-rel-closure',
  },

  // ───────── 三组 · compromise 尾声 —— 策略之后 ─────────
  {
    id: 's2-2.9-org3-compromise',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-11-01',
    title: '三组 · 策',
    location: '4945区 · 三组数据中心', mode: 'chat',
    speaker: 'truth', portrait: 'truth',
    text: '真理把你签的那份评估报告翻到最后一页——你附加的说明函归档在原始数据旁边，页码相连。“这页纸比前面几十页都重要。”她说，“下次有人翻三组的档案，先看到的是你的字。”封面上标着“暂定评级”，你知道那行字旁边藏着你的入口。三组没有翻盘——它给自己留了一扇翻盘的窗。',
    background: aftermathBg, historical: 'fictional',
    onEnter: [
      { type: 'unlockEnding', id: 's2-ending-org3-compromise' },
      { type: 'variable', key: 's2EpilogueEnding', value: 's2-ending-org3-compromise' },
      { type: 'stat', key: 'resources', operation: 'add', value: 2 },
    ],
    next: 's2-2.9-rel-closure',
  },

  // ───────── 四组 · triumph 尾声 —— 峰之后 ─────────
  {
    id: 's2-2.9-org4-triumph',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-11-01',
    title: '四组 · 立',
    location: '4945区 · 四组训练场', mode: 'chat',
    speaker: 'yanqiu', portrait: 'yanqiu',
    text: '铁碎牙在拆分案末页签下首领确认，砚秋才把精英赛道评估表挂上训练场的墙——一票优势通过的拆分案，现在是白纸黑字的新规则。有人路过多看两眼，有人冷笑，没人能无视它。她递给你一张排期表：顶线和底线分开后，每一层都有了独立的时钟。“树敌没关系。”她说，“只要你的尺够硬。”表上每一格都标着标准——四组的，不是别人的。',
    background: aftermathBg, historical: 'fictional',
    onEnter: [
      { type: 'unlockEnding', id: 's2-ending-org4-triumph' },
      { type: 'variable', key: 's2EpilogueEnding', value: 's2-ending-org4-triumph' },
      { type: 'stat', key: 'reputation', operation: 'add', value: 2 },
    ],
    next: 's2-2.9-rel-closure',
  },

  // ───────── 四组 · compromise 尾声 —— 脉之后 ─────────
  {
    id: 's2-2.9-org4-compromise',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-11-01',
    title: '四组 · 藏',
    location: '4945区 · 四组训练场', mode: 'chat',
    speaker: 'yanqiu', portrait: 'yanqiu',
    text: '统一标准已经生效。铁碎牙签下执行名单，砚秋把你争取来的加赛条款打印出来，贴在精英成员的训练柜里——不对外，只有他们自己看得到。“尺子可以藏，但不能丢。”她说。你看见几个精英成员在条款下面签了名——没人要求，是他们自己签的。四组没赢这一轮。它把最锋利的东西，藏在了下一次亮相的帘子后面。',
    background: aftermathBg, historical: 'fictional',
    onEnter: [
      { type: 'unlockEnding', id: 's2-ending-org4-compromise' },
      { type: 'variable', key: 's2EpilogueEnding', value: 's2-ending-org4-compromise' },
      { type: 'stat', key: 'cohesion', operation: 'add', value: 2 },
    ],
    next: 's2-2.9-rel-closure',
  },

  // ───────── 五组 · triumph 尾声 —— 网之后 ─────────
  {
    id: 's2-2.9-org5-triumph',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-11-01',
    title: '五组 · 独',
    location: '4945区 · 五组联络站', mode: 'chat',
    speaker: 'jianwen', portrait: 'jianwen',
    text: '困醒确认拒绝公示，剑问白玉京才把外联网络拓扑图更新了一版——心之所向的外部通道全部转入暗线。每条通道旁边都补上了两名交接人，不再只有首领知道。温陷退游留下一个空位；留下的人把它改成了不依赖任何单个人的网络。',
    background: aftermathBg, historical: 'fictional',
    onEnter: [
      { type: 'unlockEnding', id: 's2-ending-org5-triumph' },
      { type: 'variable', key: 's2EpilogueEnding', value: 's2-ending-org5-triumph' },
      { type: 'stat', key: 'resources', operation: 'add', value: 2 },
    ],
    next: 's2-2.9-rel-closure',
  },

  // ───────── 五组 · compromise 尾声 —— 守之后 ─────────
  {
    id: 's2-2.9-org5-compromise',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-11-01',
    title: '五组 · 表里',
    location: '4945区 · 五组联络站', mode: 'chat',
    speaker: 'jianwen', portrait: 'jianwen',
    text: '困醒签下六成公示的方案，剑问白玉京把通道挂到联合行动登记册上，评议方随后确认。核心三条被写进双人交接表：桌面上一份合规，抽屉里一把成员共同保管的钥匙。其他组织以为五组的牌摊完了；心之所向第一次证明，首领换过以后，网络仍能继续运转。',
    background: aftermathBg, historical: 'fictional',
    onEnter: [
      { type: 'unlockEnding', id: 's2-ending-org5-compromise' },
      { type: 'variable', key: 's2EpilogueEnding', value: 's2-ending-org5-compromise' },
      { type: 'stat', key: 'cohesion', operation: 'add', value: 1 },
      { type: 'stat', key: 'resources', operation: 'add', value: 1 },
    ],
    next: 's2-2.9-rel-closure',
  },

  // ───────── 六组 · triumph 尾声 —— 立之后 ─────────
  {
    id: 's2-2.9-org6-triumph',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-11-01',
    title: '六组 · 印',
    location: '4945区 · 联合活动室', mode: 'novel',
    speaker: 'narrator',
    text: '新修订的联合活动章程印出来了。你翻到表决权条款那一页——六组的独立表决位被写进了正文，不是附录，不是说明函，是正文。有人在你旁边走过，扫了一眼章程的封面，然后看到了那一页的章——那是所有人的章，包括在评议上沉默了很久的那些人。你没有请求任何人承认你。你只是让这张桌子不得不写下一个新名字。以后每一次翻开章程，六组都在上面。不是争取来的位置，是站出来的。',
    background: aftermathBg, historical: 'fictional',
    onEnter: [
      { type: 'unlockEnding', id: 's2-ending-org6-triumph' },
      { type: 'variable', key: 's2EpilogueEnding', value: 's2-ending-org6-triumph' },
      { type: 'stat', key: 'reputation', operation: 'add', value: 3 },
    ],
    next: 's2-2.9-rel-closure',
  },

  // ───────── 六组 · compromise 尾声 —— 种之后 ─────────
  {
    id: 's2-2.9-org6-compromise',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-11-01',
    title: '六组 · 期',
    location: '4945区 · 联合活动室', mode: 'novel',
    speaker: 'narrator',
    text: '一年的观察期从今天开始计时。你的桌上放着那份写着升级条款的决议——十二个月后，自动评审。评审委员会到时候会来翻今天的记录，他们会看到：这个组织在所有人都觉得它应该等的时候，已经在算日子了。你没有赢在今天。但你在日历上画的那个圈，不是等来的——是用一整季换来的。',
    background: aftermathBg, historical: 'fictional',
    onEnter: [
      { type: 'unlockEnding', id: 's2-ending-org6-compromise' },
      { type: 'variable', key: 's2EpilogueEnding', value: 's2-ending-org6-compromise' },
      { type: 'stat', key: 'cohesion', operation: 'add', value: 2 },
      { type: 'stat', key: 'resources', operation: 'add', value: 1 },
    ],
    next: 's2-2.9-rel-closure',
  },

  // ───────── 关系收束：按 activePartner 分流 ─────────
  {
    id: 's2-2.9-rel-closure',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-11-03',
    title: '归处',
    location: '4945区 · 傍晚', mode: 'novel',
    speaker: 'narrator',
    text: '连续几天的雨后，傍晚终于放晴了。你把手头最后一份文件归档，起身走到外面。这一季走过的人、做过的事、签过字和改过字的那些文件——都过去了。但有一些人留下来了。不是以组织的名义，是以别的什么。',
    background: aftermathBg, historical: 'fictional',
    next: {
      type: 'conditional',
      cases: [
        { when: { type: 'any', conditions: [
          { type: 'variable', key: 's2MainEnding', operator: 'eq', value: 's2-ending-org2-triumph' },
          { type: 'variable', key: 's2MainEnding', operator: 'eq', value: 's2-ending-org3-triumph' },
          { type: 'variable', key: 's2MainEnding', operator: 'eq', value: 's2-ending-org4-triumph' },
          { type: 'variable', key: 's2MainEnding', operator: 'eq', value: 's2-ending-org5-triumph' },
          { type: 'variable', key: 's2MainEnding', operator: 'eq', value: 's2-ending-org6-triumph' },
        ] }, next: 's2-2.9-rel-tone-triumph' },
        { when: { type: 'any', conditions: [
          { type: 'variable', key: 's2MainEnding', operator: 'eq', value: 's2-ending-org2-compromise' },
          { type: 'variable', key: 's2MainEnding', operator: 'eq', value: 's2-ending-org3-compromise' },
          { type: 'variable', key: 's2MainEnding', operator: 'eq', value: 's2-ending-org4-compromise' },
          { type: 'variable', key: 's2MainEnding', operator: 'eq', value: 's2-ending-org5-compromise' },
          { type: 'variable', key: 's2MainEnding', operator: 'eq', value: 's2-ending-org6-compromise' },
        ] }, next: 's2-2.9-rel-tone-compromise' },
      ],
      fallback: 's2-2.9-rel-tone-unrecorded',
    },
  },

  // 主结局先改变关系场景的情绪底色，再由真实伴侣本人完成收束。
  {
    id: 's2-2.9-rel-tone-triumph',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-11-03',
    title: '赢下以后', location: '4945区 · 傍晚', mode: 'novel', speaker: 'narrator',
    text: '你赢下了最响的那一仗，也让身边的人看见胜利留下的缺口：空掉的位置、冻结的资源、被重新计算的关系。等在外面的人不是来庆功。他们要确认，赢完以后，你还愿不愿意一起收拾代价。',
    background: aftermathBg, historical: 'fictional',
    onEnter: [{ type: 'variable', key: 's2RelationshipTone', value: 'hard-won' }],
    next: 's2-2.9-partner-router',
  },
  {
    id: 's2-2.9-rel-tone-compromise',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-11-03',
    title: '保住以后', location: '4945区 · 傍晚', mode: 'novel', speaker: 'narrator',
    text: '你没有把所有东西都赢回来，却保住了最不能失去的那部分。等在外面的人知道你让出了什么，也知道那一步是为谁留下的。今晚没有庆功，他们只想和你确认：下一次不必再由你一个人决定牺牲哪边。',
    background: aftermathBg, historical: 'fictional',
    onEnter: [{ type: 'variable', key: 's2RelationshipTone', value: 'protected-core' }],
    next: 's2-2.9-partner-router',
  },
  {
    id: 's2-2.9-rel-tone-unrecorded',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-11-03',
    title: '未写全的余波', location: '4945区 · 傍晚', mode: 'novel', speaker: 'narrator',
    text: '结局的细节没有完整留在这份旧记录里。你没有替过去补上一场胜利或妥协，只带着能确认的部分走出去，去见仍然等在那里的人。',
    background: aftermathBg, historical: 'fictional',
    onEnter: [{ type: 'variable', key: 's2RelationshipTone', value: 'legacy-unrecorded' }],
    next: 's2-2.9-partner-router',
  },
  {
    id: 's2-2.9-partner-router',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-11-03',
    title: '留下的人', location: '4945区 · 傍晚', mode: 'system', speaker: 'narrator',
    text: '你抬起头，看见真正留下来等你的人。',
    background: aftermathBg, historical: 'fictional',
    next: {
      type: 'conditional',
      cases: [
        { when: { type: 'activePartner', value: 'shana' }, next: 's2-2.9-rel-shana' },
        { when: { type: 'activePartner', value: 'qifu' }, next: 's2-2.9-rel-qifu' },
        { when: { type: 'activePartner', value: 'chenyi' }, next: 's2-2.9-rel-chenyi' },
        { when: { type: 'activePartner', value: 'swordheart' }, next: 's2-2.9-rel-swordheart' },
        { when: { type: 'activePartner', value: 'heartbeat' }, next: 's2-2.9-rel-heartbeat' },
        { when: { type: 'activePartner', value: 'yanqiu' }, next: 's2-2.9-rel-yanqiu' },
        { when: { type: 'activePartner', value: 'huayue' }, next: 's2-2.9-rel-huayue' },
        { when: { type: 'activePartner', value: 'wenxian' }, next: 's2-2.9-rel-wenxian' },
        { when: { type: 'activePartner', value: 'takemehand' }, next: 's2-2.9-rel-takemehand' },
        { when: { type: 'activePartner', value: 'xilufei' }, next: 's2-2.9-rel-xilufei' },
        { when: { type: 'activePartner', value: 'yyt' }, next: 's2-2.9-rel-yyt' },
        { when: { type: 'activePartner', value: 'avucii' }, next: 's2-2.9-rel-avucii' },
        // 瓶与真理仅作为早期回顾字段兼容；不属于当前 activePartner 合法集合。
        { when: { type: 'variable', key: 's2RelationshipResolved', operator: 'eq', value: 'bottle' }, next: 's2-2.9-rel-bottle' },
        { when: { type: 'variable', key: 's2RelationshipResolved', operator: 'eq', value: 'truth' }, next: 's2-2.9-rel-truth' },
      ],
      fallback: 's2-2.9-rel-none',
    },
  },

  // ───────── 关系：夏娜 ─────────
  {
    id: 's2-2.9-rel-shana',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-11-03',
    title: '夏娜',
    location: '4945区 · 傍晚的走廊', mode: 'chat',
    speaker: 'shana', portrait: 'shana',
    text: '夏娜站在走廊尽头，手里还拿着二组的新排班表。看到你过来，她把表折起来放进口袋——不是藏，是不想让它挡在你们中间。“你签的那些东西，我看过了。你改的那些，我也看了。”她顿了顿，“二组会记住这一季。我也会。”走廊的灯在头顶闪了一下，然后稳稳地亮了。你知道这句话不是告别——是锚。',
    background: aftermathBg, historical: 'fictional',
    onEnter: [
      { type: 'relationship', character: 'shana', key: 'trust', value: 2 },
      { type: 'variable', key: 's2RelationshipResolved', value: 'shana' },
    ],
    next: 's2-2.9-summary',
  },

  // ───────── 关系：瓶 ─────────
  {
    id: 's2-2.9-rel-bottle',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-11-03',
    title: '瓶',
    location: '4945区 · 天台', mode: 'chat',
    speaker: 'bottle', portrait: 'bottle',
    text: '瓶在天台上等你——他说过这里最适合看整个4945区。你上来的时候，他已经站了很久。“你在评议上说的那些话，我一句都没忘。”他说，“不是因为你说的对——是因为你说了。”他把手里的汽水递给你，瓶身上还凝着水珠。新区的灯在脚下一盏一盏亮起来。“明年呢？”他问。你知道这不是在问组织——是在问你们。',
    background: aftermathBg, historical: 'fictional',
    onEnter: [
      { type: 'relationship', character: 'bottle', key: 'trust', value: 2 },
      { type: 'variable', key: 's2RelationshipResolved', value: 'bottle' },
    ],
    next: 's2-2.9-summary',
  },

  {
    id: 's2-2.9-rel-qifu',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-11-03',
    title: '祈福', location: '4945区 · 夜间私聊', mode: 'chat',
    speaker: 'qifu', portrait: 'qifu',
    text: '祈福把评议期间的权限记录发给你，最后一页却只有一句话：“这次不是首领留你，也不是谁批准你回来。”过了一会儿，他又发来一条：“是我想问，下一季还一起吗？”你没有再去看那张权限表。',
    background: aftermathBg, historical: 'fictional',
    onEnter: [
      { type: 'relationship', character: 'qifu', key: 'trust', value: 2 },
      { type: 'variable', key: 's2RelationshipResolved', value: 'qifu' },
    ],
    next: 's2-2.9-summary',
  },
  {
    id: 's2-2.9-rel-chenyi',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-11-03',
    title: '辰逸', location: '4945区 · 联合活动室外', mode: 'chat',
    speaker: 'chenyi', portrait: 'chenyi',
    text: '辰逸没有催你回复，只把一杯热饮放到门边。“这次我等你把事情做完了。”他说，“所以现在这句不是通知，也不是要求——忙完以后，来找我。”他先走了，杯子还热着。',
    background: aftermathBg, historical: 'fictional',
    onEnter: [
      { type: 'relationship', character: 'chenyi', key: 'trust', value: 2 },
      { type: 'variable', key: 's2RelationshipResolved', value: 'chenyi' },
    ],
    next: 's2-2.9-summary',
  },
  {
    id: 's2-2.9-rel-swordheart',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-11-03',
    title: '剑斩凡人心', location: '4945区 · 活动签到处', mode: 'chat',
    speaker: 'swordheart', portrait: 'swordheart',
    text: '剑斩凡人心把下周的签到表递给你。你的名字不在值班栏，而在最下面一行：“休息，必须到场。”他指了指旁边自己的名字：“我也一样。事件结束了，接下来这场别缺勤。”',
    background: aftermathBg, historical: 'fictional',
    onEnter: [
      { type: 'relationship', character: 'swordheart', key: 'trust', value: 2 },
      { type: 'variable', key: 's2RelationshipResolved', value: 'swordheart' },
    ],
    next: 's2-2.9-summary',
  },
  {
    id: 's2-2.9-rel-heartbeat',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-11-03',
    title: '心跳成瘾', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'heartbeat', portrait: 'heartbeat',
    text: '心跳成瘾把最后一份成员名单合上，第一次没有统计去留。“这次不算留存率。”他说，“我只确认一件事：你还在，我也还在。”他把名单推远，给你空出旁边的位置。',
    background: aftermathBg, historical: 'fictional',
    onEnter: [
      { type: 'relationship', character: 'heartbeat', key: 'trust', value: 2 },
      { type: 'variable', key: 's2RelationshipResolved', value: 'heartbeat' },
    ],
    next: 's2-2.9-summary',
  },

  // ───────── 关系：真理 ─────────
  {
    id: 's2-2.9-rel-truth',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-11-03',
    title: '真理',
    location: '4945区 · 数据中心夜景', mode: 'chat',
    speaker: 'truth', portrait: 'truth',
    text: '数据中心只剩真理一个人在跑最后一组数据。看见你进来，她没停手，只把屏幕往你这边转了转——三组未来三个月的赛程表，每一格都标了颜色。“红的，你需要来现场看。黄的，可以远程看。绿的——”她顿了顿，“我替你看了。”说完她安静了几秒，才又开口：“数据不会骗人。我也不会。”你知道这句话比任何数字都重。',
    background: aftermathBg, historical: 'fictional',
    onEnter: [
      { type: 'relationship', character: 'truth', key: 'trust', value: 2 },
      { type: 'variable', key: 's2RelationshipResolved', value: 'truth' },
    ],
    next: 's2-2.9-summary',
  },

  // ───────── 关系：砚秋 ─────────
  {
    id: 's2-2.9-rel-yanqiu',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-11-03',
    title: '砚秋',
    location: '4945区 · 四组训练场夜', mode: 'chat',
    speaker: 'yanqiu', portrait: 'yanqiu',
    text: '训练场已经关了，砚秋还在——她习惯在所有人走之后，自己再走一遍今天的动作。今天她走得很慢。“你在评议上站的那一次，我看到了。”她说，“不是看到结果——是看到你站起来的样子。”她把最后一把椅子推进桌下，房间里只剩你们两个人。“四组的尺是我量的。能站在尺旁边的人——是你。”灯灭了，她没有去开。黑暗里，她的声音比灯光更确定。',
    background: aftermathBg, historical: 'fictional',
    onEnter: [
      { type: 'relationship', character: 'yanqiu', key: 'trust', value: 2 },
      { type: 'variable', key: 's2RelationshipResolved', value: 'yanqiu' },
    ],
    next: 's2-2.9-summary',
  },

  // ───────── 关系：温陷 ─────────
  {
    id: 's2-2.9-rel-wenxian',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-11-03',
    title: '温陷',
    location: '私聊 · 离线留言', mode: 'chat',
    speaker: 'wenxian', portrait: 'wenxian',
    text: '温陷退游后，头像灰了很久。季末那天，她忽然回了一条离线消息：“我看见心之所向的新名单了。你们没有拿我的离开当结局，这很好。”隔了几秒，又来一条：“我不回去当首领，也不替他们保管底牌。至于你——等你忙完，来跟我说说这一季。”',
    background: aftermathBg, historical: 'fictional',
    onEnter: [
      { type: 'relationship', character: 'wenxian', key: 'trust', value: 2 },
      { type: 'variable', key: 's2RelationshipResolved', value: 'wenxian' },
    ],
    next: 's2-2.9-summary',
  },

  {
    id: 's2-2.9-rel-huayue',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-11-03',
    title: '华月', location: '4945区 · 夜班活动室', mode: 'chat',
    speaker: 'huayue', portrait: 'huayue',
    text: '华月把最后一栏核对完，却没有关掉表格。“这一栏不归档。”她说着，把你的名字和她的名字留在同一行，“职位、票数和结果都算完了。剩下这件事，不按表走。”',
    background: aftermathBg, historical: 'fictional',
    onEnter: [
      { type: 'relationship', character: 'huayue', key: 'trust', value: 2 },
      { type: 'variable', key: 's2RelationshipResolved', value: 'huayue' },
    ],
    next: 's2-2.9-summary',
  },
  {
    id: 's2-2.9-rel-takemehand',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-11-03',
    title: 'takemehand', location: '4945区 · 活动室门口', mode: 'chat',
    speaker: 'takemehand', portrait: 'takemehand',
    text: 'takemehand比约好的时间晚了两分钟，手里没有申请表，也没有截图。“这次没人替我承诺，我也不拿身份问你。”他说，“只是想和你一起走回去。晚两分钟，算不算还来得及？”',
    background: aftermathBg, historical: 'fictional',
    onEnter: [
      { type: 'relationship', character: 'takemehand', key: 'trust', value: 2 },
      { type: 'variable', key: 's2RelationshipResolved', value: 'takemehand' },
    ],
    next: 's2-2.9-summary',
  },
  {
    id: 's2-2.9-rel-xilufei',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-11-03',
    title: '希露菲', location: '4945区 · 夜间频道', mode: 'chat',
    speaker: 'xilufei', portrait: 'xilufei',
    text: '希露菲发来一张已经归还所有权限的截图，紧接着又撤回。“算了，证明给别人看就行。”她重新发来一句，“你这里我不装无害，也不装陌生。事情结束了，出来玩吗？”',
    background: aftermathBg, historical: 'fictional',
    onEnter: [
      { type: 'relationship', character: 'xilufei', key: 'trust', value: 2 },
      { type: 'variable', key: 's2RelationshipResolved', value: 'xilufei' },
    ],
    next: 's2-2.9-summary',
  },
  {
    id: 's2-2.9-rel-yyt',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-11-03',
    title: 'yyT', location: '4945区 · 夜间讨论群', mode: 'chat',
    speaker: 'yyt', portrait: 'yyt',
    text: 'yyT给你的评议总结连发了七条反对意见，最后又补了一条：“以上都不同意。”你正要回复，他发来第九条：“但我还是站你这边。别误会——这两件事不冲突。”',
    background: aftermathBg, historical: 'fictional',
    onEnter: [
      { type: 'relationship', character: 'yyt', key: 'trust', value: 2 },
      { type: 'variable', key: 's2RelationshipResolved', value: 'yyt' },
    ],
    next: 's2-2.9-summary',
  },
  {
    id: 's2-2.9-rel-avucii',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-11-03',
    title: 'AVUCII', location: '4945区 · 联合活动室', mode: 'chat',
    speaker: 'avucii', portrait: 'avucii',
    text: 'AVUCII把善后清单划到最后一项：“交接完成。”他停了一下，又在下面加了一行：“明日同行——未完成。”他把笔递给你：“这一项不是工作。时间你填。”',
    background: aftermathBg, historical: 'fictional',
    onEnter: [
      { type: 'relationship', character: 'avucii', key: 'trust', value: 2 },
      { type: 'variable', key: 's2RelationshipResolved', value: 'avucii' },
    ],
    next: 's2-2.9-summary',
  },

  // ───────── 无伴侣收束 —— 独行者的路 ─────────
  {
    id: 's2-2.9-rel-none',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-11-03',
    title: '独行',
    location: '4945区 · 联合活动室夜', mode: 'novel',
    speaker: 'narrator',
    text: '联合活动室只剩你一个人。你把这一季所有的决议副本理好、归档、锁进抽屉——每一份都有你签过的字。门外没有人等你，你也不需要回头确认。窗外4945区的灯一盏盏亮起来：有些是自家组织点的，有些是对面那些人点的。你把最后一把椅子摆正，关灯，带上门。走廊很长，脚步声只有一个人的——走久了，倒也听出了节奏。',
    background: aftermathBg, historical: 'fictional',
    onEnter: [
      { type: 'variable', key: 's2RelationshipResolved', value: 'none' },
    ],
    next: 's2-2.9-summary',
  },

  // ───────── 事件二总结 ─────────
  {
    id: 's2-2.9-summary',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-12-31',
    title: '事件二 · 终',
    location: '4945区 · 联合活动室', mode: 'ending',
    speaker: 'narrator',
    text: '九月，你第一次推开联合活动室的门。十二月，你最后一个关灯。中间这三个月：评议席、三分钟自由发言、落槌。有人走了，有人留了；有些仗赢了，有些没赢——但保住了最重要的东西。门口那块北岸评议委员会的牌子还在，明年还会开张。你把章程合上，放回架上属于它的那一格。事件二，归档。你的那一页，新起。',
    background: endingBg, historical: 'fictional',
    onEnter: [
      { type: 'flag', key: 's2Complete' },
      { type: 'flag', key: 's2EpilogueComplete' },
      { type: 'unlockEnding', id: 's2-finale-complete' },
    ],
    next: 's2-2.9-exit',
  },

  // ───────── 完成哨兵 ─────────
  {
    id: 's2-2.9-exit',
    chapter: 'epilogue', actLabel: '事件二 · 尾声', date: '2026-12-31',
    title: '2.9 · 完',
    location: '4945区 · 联合活动室', mode: 'system',
    speaker: 'system',
    text: '（事件二完整版 · 收束。）',
    background: endingBg, historical: 'fictional',
    onEnter: [{ type: 'archiveSeason2Outcome' }],
  },
]
