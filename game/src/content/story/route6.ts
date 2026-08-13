import type { StoryNode } from '@/engine/types'

import { bondEndingNode } from './bondEnding'
import { cgPath } from '../cgAssets'

// 六组线检验新组织能否把“反对旧秩序”转化成可持续规则；自定义组织名由 setup 变量注入。
export const route6Nodes = [
  {
    id: 'r6-00-founded', chapter: 'prologue', actLabel: '序章 · 第六席', date: '2026-07-19',
    title: '{{sixthOrganizationName}}成立', location: '组织创建页', mode: 'novel', speaker: 'avucii', portrait: 'avucii',
    text: 'AVUCII把创建成功的截图和余额并排发进群：“「{{sixthOrganizationName}}」过审。yyT说名字是你建的，首领也由{{player}}来当；yyT和我先替你盯群。开服带来的五十元已经花掉一截，现在还剩{{money}}元——皇帝说，够买一张不存在的福利截图。”',
    background: 'sixthSeat', music: 'duskLogin', historical: 'fictional',
    presentation: {
      cg: cgPath('cg26-route6-sixth-seat'),
      cgAlt: '五个既有组织席位之外，yyT和AVUCII站在刚点亮的第六席与一只很小的钱袋旁',
      ui: 'cinematic',
      transition: 'ink',
      camera: 'pull-back',
      atmosphere: 'dust',
      focus: 'center',
      sprites: [],
    },
    onEnter: [
      { type: 'highCouncil', members: ['yyt', 'avucii'] }, { type: 'stance', character: 'yyt', value: 'support' },
      { type: 'stance', character: 'avucii', value: 'support' }, { type: 'relationship', character: 'yyt', key: 'trust', value: 1 },
      { type: 'relationship', character: 'avucii', key: 'trust', value: 1 }, { type: 'unlockCg', id: 'cg07-sixth-seat' },
      { type: 'unlockCg', id: 'cg26-route6-sixth-seat' },
    ], next: 'r6-01-recruitment-pitch',
  },
  {
    id: 'r6-01-recruitment-pitch', chapter: 'prologue', actLabel: '序章 · 第六席', date: '2026-07-19',
    location: '世界招募频道', mode: 'novel', speaker: 'emperor', portrait: 'emperor',
    text: '前五组都能给人一个现成故事。我们要招人，得先说「{{sixthOrganizationName}}」存在是为了什么。别写“福利多”，咱们现在连福利截图都没有。',
    background: 'recruitment', choices: [
      {
        id: 'rules-first-pitch', label: '“权限透明，不因不回消息处罚人。”', tone: 'calm',
        effects: [
          { type: 'flag', key: 'org6RulesPitch' }, { type: 'stat', key: 'reputation', value: 1 },
          { type: 'stat', key: 'cohesion', value: 1 }, { type: 'relationship', character: 'avucii', key: 'trust', value: 2 },
          { type: 'butterflyDelta', key: 'bf_diplomacy', delta: 1 },
        ], next: 'r6-01c-rules-pitch-reply',
      },
      {
        id: 'outsider-pitch', label: '“不想给前五组当背景板，就来第六席。”', tone: 'bold',
        effects: [
          { type: 'flag', key: 'org6OutsiderPitch' }, { type: 'stat', key: 'resources', value: 2 },
          { type: 'stat', key: 'reputation', value: -1 }, { type: 'relationship', character: 'yyt', key: 'trust', value: 2 },
          { type: 'butterflyDelta', key: 'bf_cruelty', delta: 1 },
        ], next: 'r6-01d-outsider-pitch-reply',
      },
      {
        id: 'social-pitch', label: '“先聊天再打本，拒绝把上线变考勤。”', tone: 'warm',
        effects: [
          { type: 'flag', key: 'org6SocialPitch' }, { type: 'stat', key: 'cohesion', value: 2 },
          { type: 'stat', key: 'power', value: -1 }, { type: 'relationship', character: 'emperor', key: 'trust', value: 2 },
        ], next: 'r6-01e-social-pitch-reply',
      },
    ],
  },
  {
    id: 'r6-01c-rules-pitch-reply', chapter: 'prologue', actLabel: '序章 · 第六席', date: '2026-07-19',
    location: '世界招募频道', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: '权限透明这句我置顶。第一个追问已经来了：首领自己犯错时由谁撤权限？这个问题比福利截图值钱。',
    background: 'recruitment', historical: 'fictional', next: 'r6-01b-first-replies',
  },
  {
    id: 'r6-01d-outsider-pitch-reply', chapter: 'prologue', actLabel: '序章 · 第六席', date: '2026-07-19',
    location: '世界招募频道', mode: 'chat', speaker: 'yyt', portrait: 'yyt',
    text: '这句会招来不服前五组的人，也会招来只想找下一场架的人。人能来，边界得跟着写。',
    background: 'recruitment', historical: 'fictional', next: 'r6-01b-first-replies',
  },
  {
    id: 'r6-01e-social-pitch-reply', chapter: 'prologue', actLabel: '序章 · 第六席', date: '2026-07-19',
    location: '世界招募频道', mode: 'chat', speaker: 'emperor', portrait: 'emperor',
    text: '已经有人问能不能只聊天。可以，但“拒绝考勤”不等于活动永远有人补位，今晚就把这句也说了。',
    background: 'recruitment', historical: 'fictional', next: 'r6-01b-first-replies',
  },
  {
    // 招募反馈承接三种文案；不替玩家预告数值，只让第一批真实回复落到群里。
    id: 'r6-01b-first-replies', chapter: 'prologue', actLabel: '序章 · 第六席', date: '2026-07-19',
    location: '{{sixthOrganizationName}}组织群', mode: 'chat', speaker: 'emperor', portrait: 'emperor',
    text: '三个“在吗”几乎同时冒出来。皇帝把截图圈好：“收到。有人问管理员是谁，有人问能不能只聊天。至少他们把「{{sixthOrganizationName}}」念全了——第一场胜利。”',
    background: 'recruitment',
    // 聊天模式不会自动推断立绘，因此关键回应显式声明舞台角色与站位。
    presentation: {
      sprites: [{ character: 'emperor', expression: 'neutral', pose: 'command', position: 'center', scale: 1.02 }],
    },
    next: 'r6-02-first-recruits',
  },
  {
    id: 'r6-02-first-recruits', chapter: 'prologue', actLabel: '序章 · 第六席', date: '2026-07-19',
    location: '{{sixthOrganizationName}}组织群', mode: 'chat', speaker: 'yyt', portrait: 'yyt',
    text: '现在人少，谁说话都像高层。等人多了，你还认今天说的规则吗？', background: 'organization',
    presentation: {
      cg: cgPath('cg26-route6-sixth-seat'),
      cgAlt: 'yyT和AVUCII把空白章程放到新第六席前，要求玩家决定组织扩张后的权限规则',
      ui: 'classic',
      transition: 'crossfade',
      camera: 'push-in',
      atmosphere: 'dust',
      focus: 'left',
    },
    choices: [
      {
        id: 'write-charter', label: '“我先写三条：谁能踢人、谁能发公告、谁来交接。”', tone: 'calm',
        effects: [
          { type: 'flag', key: 'org6WrittenCharter' }, { type: 'stat', key: 'cohesion', value: 1 },
          { type: 'stat', key: 'evidence', value: 1 }, { type: 'relationship', character: 'avucii', key: 'trust', value: 1 },
          { type: 'butterflyDelta', key: 'bf_diplomacy', delta: 1 },
        ], next: 'r6-02f-charter-reply',
      },
      {
        id: 'trust-founders', label: '“先别写合同；我、yyT和AVUCII当面说定。”', tone: 'warm',
        effects: [
          { type: 'flag', key: 'org6FounderTrust' }, { type: 'relationship', character: 'yyt', key: 'affinity', value: 1 },
          { type: 'stat', key: 'resources', value: 1 },
          { type: 'butterflyDelta', key: 'bf_heart', delta: 1 },
        ], next: 'r6-02g-founder-trust-reply',
      },
    ],
  },
  {
    id: 'r6-02f-charter-reply', chapter: 'prologue', actLabel: '序章 · 第六席', date: '2026-07-19',
    location: '{{sixthOrganizationName}}组织群', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: '三条先写：踢人、公告、交接。我会保留每次修改记录，免得人多以后谁都记得自己看过另一版。',
    background: 'organization', historical: 'fictional', next: 'r6-02b-rule-pinned',
  },
  {
    id: 'r6-02g-founder-trust-reply', chapter: 'prologue', actLabel: '序章 · 第六席', date: '2026-07-19',
    location: '{{sixthOrganizationName}}组织群', mode: 'chat', speaker: 'yyt', portrait: 'yyt',
    text: '当面说定我可以记，但新成员听不见。以后我们三个说法不同时，别拿“创始人都懂”堵别人。',
    background: 'organization', historical: 'fictional', next: 'r6-02b-rule-pinned',
  },
  {
    id: 'r6-02b-rule-pinned', chapter: 'prologue', actLabel: '序章 · 第六席', date: '2026-07-19',
    location: '{{sixthOrganizationName}}组织群', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: 'AVUCII把你刚才的原话置顶：“我不替你润色。以后有人说没见过，就让他往上翻；置顶消息最大的用途，就是证明大家确实不看置顶。”',
    background: 'organization',
    presentation: {
      sprites: [{ character: 'avucii', expression: 'neutral', pose: 'command', position: 'center', scale: 1.02 }],
    },
    next: 'r6-02c-yyt-counter-sign',
  },
  {
    // yyT攻略弧第一段：把“亲近”建立在允许她公开指出首领漏洞上，而不是无条件站队。
    id: 'r6-02c-yyt-counter-sign', chapter: 'prologue', actLabel: '序章 · 第六席', date: '2026-07-19',
    location: '章程协作页', mode: 'chat', speaker: 'yyt', portrait: 'yyt',
    text: 'yyT在置顶下面圈出三处空白：“能踢人的犯错怎么办？首领失踪谁接？我和你意见相反时，是高层先闭嘴，还是首领先证明自己没写错？”',
    background: 'organization', historical: 'fictional',
    presentation: { sprites: [{ character: 'yyt', expression: 'neutral', pose: 'thinking', position: 'center', scale: 1.04 }] },
    choices: [
      {
        id: 'invite-yyt-counter-sign', label: '把编辑权限递给她：“你做反方签字人，每条先找我的漏洞。”', tone: 'warm',
        effects: [
          { type: 'flag', key: 'yytRuleCounterSigner' },
          { type: 'relationship', character: 'yyt', key: 'trust', value: 2 },
          { type: 'relationship', character: 'yyt', key: 'affinity', value: 1 },
          { type: 'relationshipProgress', character: 'yyt', value: 30 },
          { type: 'butterflyDelta', key: 'bf_diplomacy', delta: 1 },
        ], next: 'r6-02d-yyt-keeps-pen',
      },
      {
        id: 'keep-yyt-as-reviewer', label: '“先照这版执行。你保留批注，不必替它背书。”', tone: 'calm',
        effects: [
          { type: 'flag', key: 'yytStayedReviewer' },
          { type: 'relationship', character: 'yyt', key: 'trust', value: 1 },
          { type: 'butterflyDelta', key: 'bf_cruelty', delta: 1 },
        ], next: 'r6-02e-yyt-folds-note',
      },
    ],
  },
  {
    id: 'r6-02d-yyt-keeps-pen', chapter: 'prologue', actLabel: '序章 · 第六席', date: '2026-07-19',
    location: '章程协作页', mode: 'chat', speaker: 'yyt', portrait: 'yyt',
    text: '她没有客气，直接把“首领最终解释”改成“争议时公开原记录”：“先说好，我以后拆你的台，不代表我站到你这边。也可能只是你真的写错了。”',
    background: 'organization', historical: 'fictional', next: 'r6-03-world-enemy',
  },
  {
    id: 'r6-02e-yyt-folds-note', chapter: 'prologue', actLabel: '序章 · 第六席', date: '2026-07-19',
    location: '章程协作页', mode: 'chat', speaker: 'yyt', portrait: 'yyt',
    text: '“行，我不签。”yyT把批注保留下来，“哪天这三处真的炸了，别说我乌鸦嘴。新区最稳定的机制，就是所有人事后都记得自己提醒过。”',
    background: 'organization', historical: 'fictional', next: 'r6-03-world-enemy',
  },
  {
    id: 'r6-03-world-enemy', chapter: 'act1', actLabel: '第一幕 · 第六个旁观者', date: '2026-07-20',
    title: '与世界为敌', location: '转发截图', mode: 'chat', speaker: 'takemehand', portrait: 'takemehand',
    text: '“我当时在游戏里，没回辰逸群里那句话。他因为没被搭理而嫉妒，赌气按了禁言；后来又把火烧到一、三、四组。”7月20日，这串截图被叫作“与世界为敌”。「{{sixthOrganizationName}}」随后收到三份拉票私聊。',
    background: 'worldChat', music: 'worldEnemy', historical: 'confirmed',
    presentation: {
      cg: cgPath('cg27-world-enemy'),
      cgAlt: '第六组从所有阵营之外看见辰逸的个人争执扩向一、三、四组',
      ui: 'cinematic',
      transition: 'glitch',
      camera: 'pull-back',
      atmosphere: 'messages',
      focus: 'left',
    },
    onEnter: [
      { type: 'flag', key: 'worldEnemyStartedOnJuly20' },
      { type: 'unlockCg', id: 'cg27-world-enemy' },
    ],
    next: 'r6-04-courtship',
  },
  {
    id: 'r6-04-courtship', chapter: 'act1', actLabel: '第一幕 · 第六个旁观者', date: '2026-07-20',
    location: '三个私聊窗口', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: '一组让我们签联合声明，二组让我们别“被带节奏”，三组问能不能提供完整截图。「{{sixthOrganizationName}}」第一次被所有人叫出全名，是因为他们都缺一票。',
    background: 'worldChat',
    presentation: {
      sprites: [{ character: 'avucii', expression: 'neutral', pose: 'command', position: 'center', scale: 1.03 }],
    },
    choices: [
      {
        id: 'mediate-with-facts', label: '把三张截图按时间排好：“先核对，再谈谁道歉。”', tone: 'calm',
        effects: [
          { type: 'flag', key: 'org6MediatedWorldEnemy' }, { type: 'stat', key: 'evidence', value: 2 },
          { type: 'stat', key: 'reputation', value: 2 }, { type: 'relationship', character: 'avucii', key: 'trust', value: 2 },
          { type: 'organizationRelation', organization: 'org3', value: 1 }, { type: 'organizationRelation', organization: 'org4', value: 1 },
          { type: 'butterflyDelta', key: 'bf_diplomacy', delta: 2 },
        ], next: 'r6-04e-facts-reply',
      },
      {
        id: 'side-org1', label: '“我支持处分辰逸；先把禁言说清楚。”', tone: 'bold',
        effects: [
          { type: 'flag', key: 'org6BackedOrg1' }, { type: 'organizationRelation', organization: 'org1', value: 2 },
          { type: 'organizationRelation', organization: 'org2', value: -2 }, { type: 'relationship', character: 'qifu', key: 'trust', value: 2 },
          { type: 'butterflyDelta', key: 'bf_loyalty', delta: 1 },
        ], next: 'r6-04f-org1-reply',
      },
      {
        id: 'trade-neutrality', label: '“我不站队。谁要截图，用招募入口来换。”', tone: 'secret',
        effects: [
          { type: 'flag', key: 'org6TradedNeutrality' }, { type: 'stat', key: 'resources', value: 2 },
          { type: 'stat', key: 'reputation', value: -2 }, { type: 'relationship', character: 'yyt', key: 'trust', value: 1 },
          { type: 'butterflyDelta', key: 'bf_shadow', delta: 1 },
        ], next: 'r6-04g-trade-reply',
      },
      {
        id: 'side-org2', label: '“这件事由二组内部处理，我不签联合施压。”', tone: 'danger',
        effects: [
          { type: 'flag', key: 'org6BackedOrg2' }, { type: 'organizationRelation', organization: 'org2', value: 2 },
          { type: 'organizationRelation', organization: 'org1', value: -2 }, { type: 'stat', key: 'cohesion', value: 1 },
          { type: 'butterflyDelta', key: 'bf_cruelty', delta: 1 },
        ], next: 'r6-04h-org2-reply',
      },
    ],
  },
  {
    id: 'r6-04e-facts-reply', chapter: 'act1', actLabel: '第一幕 · 第六个旁观者', date: '2026-07-20',
    location: '三个私聊窗口', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: '时间线已发，已知和缺口分开列。三边如果只想要一句站队，这份记录至少会让他们多看两行。',
    background: 'worldChat', historical: 'fictional', next: 'r6-04b-position-sent',
  },
  {
    id: 'r6-04f-org1-reply', chapter: 'act1', actLabel: '第一幕 · 第六个旁观者', date: '2026-07-20',
    location: '三个私聊窗口', mode: 'chat', speaker: 'qifu', portrait: 'qifu',
    text: '第六组支持处理辰逸，我收到了。联合声明只写禁言与权限，不替你追加对二组所有人的判断。',
    background: 'worldChat', historical: 'fictional', next: 'r6-04b-position-sent',
  },
  {
    id: 'r6-04g-trade-reply', chapter: 'act1', actLabel: '第一幕 · 第六个旁观者', date: '2026-07-20',
    location: '三个私聊窗口', mode: 'chat', speaker: 'yyt', portrait: 'yyt',
    text: '截图换入口，资源会来，信誉也会掉。至少把价码公开给自己人，别让中立变成私下收钱。',
    background: 'worldChat', historical: 'fictional', next: 'r6-04b-position-sent',
  },
  {
    id: 'r6-04h-org2-reply', chapter: 'act1', actLabel: '第一幕 · 第六个旁观者', date: '2026-07-20',
    location: '三个私聊窗口', mode: 'chat', speaker: 'shana', portrait: 'shana',
    text: '不签联合施压，收到。二组会自己处理；如果处理结果难看，也不会把责任改写成第六组同意。',
    background: 'worldChat', historical: 'fictional', next: 'r6-04b-position-sent',
  },
  {
    id: 'r6-04b-position-sent', chapter: 'act1', actLabel: '第一幕 · 第六个旁观者', date: '2026-07-20',
    location: '三个私聊窗口', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: 'AVUCII逐字把你的答复发进三个窗口，没有替你改得更圆滑。三处“正在输入”同时亮起，她把手机扣在桌上：“很好，至少这回没人能说没收到。”',
    background: 'worldChat',
    presentation: {
      sprites: [{ character: 'avucii', expression: 'neutral', pose: 'command', position: 'center', scale: 1.03 }],
    },
    next: 'r6-04c-avucii-credit',
  },
  {
    // AVUCII攻略弧第一段：让长期负责转发和留档的人，也在记录里拥有自己的名字。
    id: 'r6-04c-avucii-credit', chapter: 'act1', actLabel: '第一幕 · 转发人也有名字', date: '2026-07-20',
    location: '三个私聊窗口', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: 'AVUCII把记录末尾写成：“决定人：{{player}}；转发人：略。”她说转发人不重要，反正出问题时所有人只会找首领。',
    background: 'worldChat', historical: 'fictional',
    choices: [
      {
        id: 'keep-avucii-own-credit', label: '把“略”改成AVUCII：“原话和你的名字都留下。”', tone: 'warm',
        effects: [
          { type: 'flag', key: 'avuciiKeptOwnCredit' },
          { type: 'relationship', character: 'avucii', key: 'trust', value: 1 },
          { type: 'relationship', character: 'avucii', key: 'affinity', value: 1 },
          { type: 'relationshipProgress', character: 'avucii', value: 30 },
          { type: 'butterflyDelta', key: 'bf_heart', delta: 1 },
        ], next: 'r6-04d-avucii-credit-reply',
      },
      {
        id: 'archive-avucii-anonymously', label: '照她习惯的格式归档：“先把三个窗口盯完。”', tone: 'calm',
        effects: [{ type: 'relationship', character: 'avucii', key: 'trust', value: 1 }, { type: 'butterflyDelta', key: 'bf_cruelty', delta: 1 }],
        next: 'r6-05-fixed-resolution',
      },
    ],
  },
  {
    id: 'r6-04d-avucii-credit-reply', chapter: 'act1', actLabel: '第一幕 · 转发人也有名字', date: '2026-07-20',
    location: '三个私聊窗口', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: 'AVUCII盯了那行两秒，没有删：“那出了错也算我们两个。到时候别又只在结尾找首领——也别只在出错时找我。”',
    background: 'worldChat', historical: 'fictional', next: 'r6-05-fixed-resolution',
  },
  {
    id: 'r6-05-fixed-resolution', chapter: 'act1', actLabel: '第一幕 · 第六个旁观者', date: '2026-07-20',
    location: '二组管理群转发', mode: 'chat', speaker: 'shana', portrait: 'shana',
    text: '夏娜发来人事变动截图：“岸是自己不想再当高层，主动卸任；时7月19日才加入二组，今天和原本只是普通成员的大古一起升为高层。辰逸降为普通成员。你在外面怎么表态，是「{{sixthOrganizationName}}」的事；这些原因别替我们改。”',
    background: 'aftermath', historical: 'confirmed',
    presentation: {
      cg: cgPath('cg28-council-reshuffle'),
      cgAlt: '第六组观察到岸主动卸下高层身份，时与原普通成员大古成为二组新高层',
      ui: 'cinematic',
      transition: 'crossfade',
      camera: 'pull-back',
      atmosphere: 'dust',
      focus: 'center',
    },
    onEnter: [{ type: 'unlockCg', id: 'cg28-council-reshuffle' }],
    next: 'r6-08-xilufei',
  },
  {
    id: 'r6-06-two-groups', chapter: 'act2', actLabel: '第二幕 · 官方之外', date: '2026-07-21',
    title: '两个官方群，一支新组织', location: '群列表', mode: 'chat', speaker: 'emperor', portrait: 'emperor',
    text: '皇帝把两个都叫“4945官方群”的邀请并排截图：“一个旧，一个新；共同点是都说另一个不算数。「{{sixthOrganizationName}}」哪个都管不了，倒是两个群都想管我们。”',
    background: 'twoGroups', historical: 'confirmed',
    presentation: {
      sprites: [{ character: 'emperor', expression: 'neutral', pose: 'command', position: 'center', scale: 1.02 }],
    },
    next: 'r6-07-legitimacy',
  },
  {
    id: 'r6-07-legitimacy', chapter: 'act2', actLabel: '第二幕 · 官方之外', date: '2026-07-21',
    location: '{{sixthOrganizationName}}公告', mode: 'novel', speaker: 'player',
    text: '两张群邀请都停在屏幕上。你需要告诉成员：消息从哪里看，决定又在哪里算数。', background: 'twoGroups', choices: [
      {
        id: 'recognize-neither', label: '“群管理员不管游戏内决定；我们自己留联络表。”', tone: 'bold',
        effects: [
          { type: 'flag', key: 'org6IndependentAuthority' }, { type: 'stat', key: 'cohesion', value: 2 },
          { type: 'stat', key: 'resources', value: -1 }, { type: 'relationship', character: 'avucii', key: 'trust', value: 2 },
          { type: 'butterflyDelta', key: 'bf_loyalty', delta: 1 },
        ], next: 'r6-07c-independent-authority-reply',
      },
      {
        id: 'use-both', label: '“两个群都看，决定只在「{{sixthOrganizationName}}」内部确认。”', tone: 'calm',
        effects: [
          { type: 'flag', key: 'org6DualChannel' }, { type: 'stat', key: 'evidence', value: 2 },
          { type: 'stat', key: 'reputation', value: 1 },
          { type: 'butterflyDelta', key: 'bf_diplomacy', delta: 1 },
        ], next: 'r6-07d-dual-channel-reply',
      },
      {
        id: 'recognize-old', label: '“旧群暂作公共入口；谁给管理员，谁公开负责。”', tone: 'warm',
        effects: [
          { type: 'organizationRelation', organization: 'org1', value: 2 }, { type: 'relationship', character: 'qifu', key: 'trust', value: 1 },
          { type: 'butterflyDelta', key: 'bf_diplomacy', delta: 1 },
        ], next: 'r6-07e-old-group-reply',
      },
    ],
  },
  {
    id: 'r6-07c-independent-authority-reply', chapter: 'act2', actLabel: '第二幕 · 官方之外', date: '2026-07-21',
    location: '{{sixthOrganizationName}}公告', mode: 'chat', speaker: 'emperor', portrait: 'emperor',
    text: '两个区群都只收消息，游戏内决定回我们自己的联络表确认。代价是多做一遍核对，但管理员不能替我们下令。',
    background: 'twoGroups', historical: 'fictional', next: 'r6-07b-channel-rule-pinned',
  },
  {
    id: 'r6-07d-dual-channel-reply', chapter: 'act2', actLabel: '第二幕 · 官方之外', date: '2026-07-21',
    location: '{{sixthOrganizationName}}公告', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: '两边都看，差异并排存；决定只回内部确认。单张截图不能直接变成第六组命令。',
    background: 'twoGroups', historical: 'fictional', next: 'r6-07b-channel-rule-pinned',
  },
  {
    id: 'r6-07e-old-group-reply', chapter: 'act2', actLabel: '第二幕 · 官方之外', date: '2026-07-21',
    location: '旧4945区群', mode: 'chat', speaker: 'qifu', portrait: 'qifu',
    text: '旧群暂作入口，我负责公开每次管理员变更。给错权限也由授权的人留名，不再只写“群出事了”。',
    background: 'twoGroups', historical: 'fictional', next: 'r6-07b-channel-rule-pinned',
  },
  {
    id: 'r6-07b-channel-rule-pinned', chapter: 'act2', actLabel: '第二幕 · 官方之外', date: '2026-07-21',
    location: '{{sixthOrganizationName}}公告', mode: 'chat', speaker: 'emperor', portrait: 'emperor',
    text: '皇帝照原话发出公告，又在末尾补了一行日期：“我没加‘最终解释权归本群所有’。这种句子一般只负责证明解释权已经没人信了。”',
    background: 'twoGroups',
    presentation: {
      sprites: [{ character: 'emperor', expression: 'neutral', pose: 'command', position: 'center', scale: 1.02 }],
    },
    next: 'r6-08b-xilufei-leaves',
  },
  {
    id: 'r6-08-xilufei', chapter: 'act2', actLabel: '第二幕 · 官方之外', date: '2026-07-20',
    title: '权限的现场教学', location: '旧4945区群', mode: 'chat', speaker: 'qifu', portrait: 'qifu',
    text: '祈福盯着突然变空的成员列表：“希露菲是从老区来新区找乐子的。他骗我说自己是高层，我把管理员给了他；拿到权限后，是他把所有能够移除的成员逐个踢出了区群。授权是我给错的，爆群的人是他。”',
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
    next: 'r6-06-two-groups',
  },
  {
    // 20日爆群后，希露菲在21日因江南拒战而退出，两个事实分别落在各自日期。
    id: 'r6-08b-xilufei-leaves', chapter: 'act2', actLabel: '第二幕 · 官方之外', date: '2026-07-21',
    title: '拒绝开战', location: '二组新群', mode: 'chat', speaker: 'xilufei', portrait: 'xilufei',
    text: '希露菲又在二组群里催江南向一组宣战。江南首领拒绝开战，夏娜只回了两个字：“不打。”7月21日，希露菲丢下一句“那就没意思了”，先退出二组群，随后退出江南。',
    background: 'twoGroups', historical: 'confirmed',
    onEnter: [{ type: 'flag', key: 'xilufeiLeftOrg2OnJuly21' }],
    next: 'r6-09-qifu-rebuilds',
  },
  {
    id: 'r6-09-qifu-rebuilds', chapter: 'act2', actLabel: '第二幕 · 官方之外', date: '2026-07-22',
    location: '祈福私聊', mode: 'chat', speaker: 'qifu', portrait: 'qifu',
    text: '管理员是我给错的。战区群里我也因为一直@全体被撤了权限。你要笑就现在笑；笑完告诉我，第六组愿不愿意一起重建成员名单。',
    background: 'nightMessage',
    presentation: {
      sprites: [{ character: 'qifu', expression: 'concerned', pose: 'base', position: 'center', scale: 1.03 }],
    },
    choices: [
      {
        id: 'help-with-boundaries', label: '“我帮你核名单，但只转本人确认过的名字。”', tone: 'warm',
        effects: [
          { type: 'flag', key: 'org6HelpedQifuRebuild' }, { type: 'relationship', character: 'qifu', key: 'trust', value: 3 },
          { type: 'relationship', character: 'qifu', key: 'affinity', value: 2 },
          { type: 'relationshipProgress', character: 'qifu', value: 40 }, { type: 'stat', key: 'reputation', value: 1 },
          { type: 'butterflyDelta', key: 'bf_heart', delta: 1 },
        ], next: 'r6-09c-help-rebuild-reply',
      },
      {
        id: 'demand-public-apology', label: '“先在公共群说清：管理员是你给错的。”', tone: 'calm',
        effects: [
          { type: 'flag', key: 'qifuPubliclyApologized' }, { type: 'stat', key: 'reputation', value: 2 },
          { type: 'relationship', character: 'qifu', key: 'trust', value: 1 }, { type: 'relationship', character: 'qifu', key: 'affinity', value: -1 },
          { type: 'butterflyDelta', key: 'bf_diplomacy', delta: 1 },
        ], next: 'r6-09d-public-apology-reply',
      },
      {
        id: 'decline-rebuild', label: '“名单你们自己重建；别把一组的责任算到我们头上。”', tone: 'bold',
        effects: [{ type: 'organizationRelation', organization: 'org1', value: -1 }, { type: 'stat', key: 'cohesion', value: 1 }, { type: 'butterflyDelta', key: 'bf_cruelty', delta: 1 }],
        next: 'r6-09e-decline-rebuild-reply',
      },
    ],
  },
  {
    id: 'r6-09c-help-rebuild-reply', chapter: 'act2', actLabel: '第二幕 · 官方之外', date: '2026-07-22',
    location: '祈福私聊', mode: 'chat', speaker: 'qifu', portrait: 'qifu',
    text: '那就只收本人确认。我把旧名单当线索，不当事实；你核到谁，我再单独问一遍。',
    background: 'nightMessage', historical: 'fictional', next: 'r6-09b-qifu-acknowledges',
  },
  {
    id: 'r6-09d-public-apology-reply', chapter: 'act2', actLabel: '第二幕 · 官方之外', date: '2026-07-22',
    location: '祈福私聊', mode: 'chat', speaker: 'qifu', portrait: 'qifu',
    text: '我会公开写：管理员是我核错身份后给的，爆群是希露菲做的。先把两件责任分清，再重建名单。',
    background: 'nightMessage', historical: 'fictional', next: 'r6-09b-qifu-acknowledges',
  },
  {
    id: 'r6-09e-decline-rebuild-reply', chapter: 'act2', actLabel: '第二幕 · 官方之外', date: '2026-07-22',
    location: '祈福私聊', mode: 'chat', speaker: 'qifu', portrait: 'qifu',
    text: '明白，一组自己重建。第六组没有答应帮忙，我不会在公告里把你们写成协作方。',
    background: 'nightMessage', historical: 'fictional', next: 'r6-09b-qifu-acknowledges',
  },
  {
    id: 'r6-09b-qifu-acknowledges', chapter: 'act2', actLabel: '第二幕 · 官方之外', date: '2026-07-22',
    location: '祈福私聊', mode: 'chat', speaker: 'qifu', portrait: 'qifu',
    text: '祈福停了几秒：“收到。该公开的我公开，该不碰的名单我不碰；你拒绝的部分，我也不会改写成‘「{{sixthOrganizationName}}」同意’。这次不靠管理员替我省事。”',
    background: 'nightMessage',
    presentation: {
      sprites: [{ character: 'qifu', expression: 'concerned', pose: 'base', position: 'center', scale: 1.03 }],
    },
    next: 'r6-10-fortress-trade',
  },
  {
    id: 'r6-10-fortress-trade', chapter: 'act3', actLabel: '第三幕 · 被计算的第六票', date: '2026-07-24',
    location: '首领联合私聊', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: '名单按你划的边界处理完了。第二次要塞前，一组要情报，三四组要错峰，五组要协助打火2，二组愿意用物资换我们不参战。所有人终于承认「{{sixthOrganizationName}}」是一组人——因为这一组人现在可以被交易。',
    background: 'warRoom', music: 'fortressNight',
    presentation: {
      sprites: [
        { character: 'avucii', expression: 'neutral', pose: 'command', position: 'left', scale: 1.02 },
        { character: 'yyt', expression: 'neutral', pose: 'command', position: 'right', scale: .94, dimmed: true },
      ],
    },
    choices: [
      {
        id: 'sell-attendance', label: '“收下二组物资，今晚不碰火2；协议截图留档。”', tone: 'secret',
        effects: [
          { type: 'flag', key: 'org6NonAggressionOrg2' }, { type: 'stat', key: 'resources', value: 3 },
          { type: 'organizationRelation', organization: 'org2', value: 2 }, { type: 'stat', key: 'reputation', value: -1 },
          { type: 'butterflyDelta', key: 'bf_shadow', delta: 1 },
        ], next: 'r6-10c-nonaggression-reply',
      },
      {
        id: 'information-broker', label: '“只发可验证的时间表，不替任何一边站队。”', tone: 'calm',
        effects: [
          { type: 'flag', key: 'org6InformationBroker' }, { type: 'stat', key: 'evidence', value: 2 },
          { type: 'stat', key: 'reputation', value: 2 }, { type: 'relationship', character: 'avucii', key: 'trust', value: 2 },
          { type: 'butterflyDelta', key: 'bf_diplomacy', delta: 2 },
        ], next: 'r6-10d-information-reply',
      },
      {
        id: 'support-org5', label: '“告诉五组：我们牵制火2，各记各的分。”', tone: 'warm',
        effects: [
          { type: 'flag', key: 'org6SupportedOrg5' }, { type: 'organizationRelation', organization: 'org5', value: 2 },
          { type: 'stat', key: 'contribution', value: 2 }, { type: 'stat', key: 'resources', value: -1 },
          { type: 'butterflyDelta', key: 'bf_loyalty', delta: 1 }, { type: 'butterflyDelta', key: 'bf_heart', delta: 1 },
        ], next: 'r6-10e-support-five-reply',
      },
      {
        id: 'claim-own-target', label: '“拒绝四份交易；给「{{sixthOrganizationName}}」报自己的目标。”', tone: 'bold',
        effects: [
          { type: 'flag', key: 'org6ClaimedOwnTarget' }, { type: 'stat', key: 'contribution', value: 2 },
          { type: 'stat', key: 'reputation', value: 1 },
          { type: 'butterflyDelta', key: 'bf_cruelty', delta: 1 },
        ], next: 'r6-10f-own-target-reply',
      },
    ],
  },
  {
    id: 'r6-10c-nonaggression-reply', chapter: 'act3', actLabel: '第三幕 · 被计算的第六票', date: '2026-07-24',
    location: '首领联合私聊', mode: 'chat', speaker: 'shana', portrait: 'shana',
    text: '物资今晚转，协议也留档。第六组不碰火2，二组不把你们写进胜利或失利稿。',
    background: 'warRoom', historical: 'fictional', next: 'r6-10b-fortress-order-live',
  },
  {
    id: 'r6-10d-information-reply', chapter: 'act3', actLabel: '第三幕 · 被计算的第六票', date: '2026-07-24',
    location: '首领联合私聊', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: '只发可验证的时间和人数，不发“应该会”。每一边拿到同一份表，谁裁掉内容谁自己留痕。',
    background: 'warRoom', historical: 'fictional', next: 'r6-10b-fortress-order-live',
  },
  {
    id: 'r6-10e-support-five-reply', chapter: 'act3', actLabel: '第三幕 · 被计算的第六票', date: '2026-07-24',
    location: '五六组联络', mode: 'chat', speaker: 'wenxian', portrait: 'wenxian',
    text: '牵制收到，各记各的分。五组输了不会把你们写成没来，赢了也不会把第六组分数并进来。',
    background: 'warRoom', historical: 'fictional', next: 'r6-10b-fortress-order-live',
  },
  {
    id: 'r6-10f-own-target-reply', chapter: 'act3', actLabel: '第三幕 · 被计算的第六票', date: '2026-07-24',
    location: '{{sixthOrganizationName}}战备频道', mode: 'chat', speaker: 'yyt', portrait: 'yyt',
    text: '四份交易都拒了，那就报自己的目标。资源少拿一点，但战报里终于不用解释我们替谁站台。',
    background: 'warRoom', historical: 'fictional', next: 'r6-10b-fortress-order-live',
  },
  {
    id: 'r6-10b-fortress-order-live', chapter: 'act3', actLabel: '第三幕 · 被计算的第六票', date: '2026-07-24',
    location: '首领联合私聊', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: 'AVUCII按下发送，把你的原话和时间一起截进记录：“命令发出去了。今晚谁替我们多写一个战果，我就把完整截图贴在他那条下面。免费的宣传通常最贵。”',
    background: 'warRoom',
    presentation: {
      sprites: [
        { character: 'avucii', expression: 'neutral', pose: 'command', position: 'left', scale: 1.02 },
        { character: 'yyt', expression: 'neutral', pose: 'command', position: 'right', scale: .94, dimmed: true },
      ],
    },
    next: 'r6-11-battle-role',
  },
  {
    id: 'r6-11-battle-role', chapter: 'act3', actLabel: '第三幕 · 被计算的第六票', date: '2026-07-25',
    location: '要塞战场', mode: 'battle', speaker: 'avucii', portrait: 'avucii',
    text: '五组挑战二组火2并失败。AVUCII盯着结算页逐行核对：“目标能协调，牵制和情报也能互换，积分还是各算各的。「{{sixthOrganizationName}}」那一行照你的命令记，没塞进任何人的胜利稿。”',
    background: 'fortress', historical: 'confirmed',
    presentation: {
      cg: cgPath('cg29-second-fortress'),
      cgAlt: '第六组从独立战线看见夏娜指挥江南守卫火2，协同牵制没有合并任何组织的积分',
      ui: 'cinematic',
      transition: 'flash',
      camera: 'pull-back',
      atmosphere: 'embers',
      focus: 'left',
    },
    onEnter: [{ type: 'unlockCg', id: 'cg29-second-fortress' }],
    next: 'r6-11a-avucii-record',
  },
  {
    // AVUCII攻略弧第二段：战功记录不能只记被管理的人，也要记下承担管理的人。
    id: 'r6-11a-avucii-record', chapter: 'act3', actLabel: '第三幕 · 空着的署名栏', date: '2026-07-25',
    location: '要塞结算页', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: '结算表里每个人的贡献都有名字，只有整理表格的人那栏空着。AVUCII把光标移过去：“不用填。记录能证明发生过什么，不负责证明我也在场。”',
    background: 'aftermath', historical: 'fictional',
    choices: [
      {
        id: 'keep-avucii-in-record', label: '先补上AVUCII：“记录也该证明你在。最后一页我们一起核。”', tone: 'warm',
        effects: [
          { type: 'flag', key: 'avuciiNameKeptInRecord' },
          { type: 'relationship', character: 'avucii', key: 'trust', value: 2 },
          { type: 'relationship', character: 'avucii', key: 'affinity', value: 1 },
          { type: 'relationshipProgress', character: 'avucii', value: 30 },
          { type: 'butterflyDelta', key: 'bf_heart', delta: 1 },
        ], next: 'r6-11b-avucii-record-reply',
      },
      {
        id: 'leave-avucii-record-blank', label: '尊重她的归档方式，直接封存结算表', tone: 'calm',
        effects: [{ type: 'relationship', character: 'avucii', key: 'trust', value: 1 }, { type: 'butterflyDelta', key: 'bf_cruelty', delta: 1 }],
        next: 'r6-12-recognition',
      },
    ],
  },
  {
    id: 'r6-11b-avucii-record-reply', chapter: 'act3', actLabel: '第三幕 · 空着的署名栏', date: '2026-07-25',
    location: '要塞结算页', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: '“好，名字留着。”AVUCII把你的署名并排补在旁边，“那你负责记得我也会上线，不只在表格出错时想起我。”',
    background: 'aftermath', historical: 'fictional', next: 'r6-12-recognition',
  },
  {
    id: 'r6-12-recognition', chapter: 'act3', actLabel: '第三幕 · 被计算的第六票', date: '2026-07-25',
    location: '{{sixthOrganizationName}}组织群', mode: 'chat', speaker: 'emperor', portrait: 'emperor',
    text: '世界频道第一次在战报里写了我们的全名。不是“那几个新来的”，是「{{sixthOrganizationName}}」。要不要截图做群公告？',
    background: 'aftermath', choices: [
      {
        id: 'archive-first-record', label: '“原图保存；再写一句，各组分数没有合并。”', tone: 'calm',
        effects: [
          { type: 'flag', key: 'org6ArchivedFirstRecord' }, { type: 'stat', key: 'reputation', value: 1 },
          { type: 'stat', key: 'cohesion', value: 1 }, { type: 'relationship', character: 'emperor', key: 'trust', value: 2 },
          { type: 'butterflyDelta', key: 'bf_diplomacy', delta: 1 },
        ], next: 'r6-12c-archive-reply',
      },
      {
        id: 'make-propaganda', label: '裁掉失利部分：“标题写——我们改变了战局。”', tone: 'bold',
        effects: [
          { type: 'flag', key: 'org6InflatedBattleRole' }, { type: 'stat', key: 'resources', value: 2 },
          { type: 'stat', key: 'reputation', value: -1 },
          { type: 'butterflyDelta', key: 'bf_shadow', delta: 1 },
        ], next: 'r6-12d-propaganda-reply',
      },
    ],
  },
  {
    id: 'r6-12c-archive-reply', chapter: 'act3', actLabel: '第三幕 · 被计算的第六票', date: '2026-07-25',
    location: '{{sixthOrganizationName}}组织群', mode: 'chat', speaker: 'emperor', portrait: 'emperor',
    text: '原图和各组独立积分说明一起发。第一次被写出全名，先保证下周还能翻到完整版本。',
    background: 'aftermath', historical: 'fictional', next: 'r6-12b-record-published',
  },
  {
    id: 'r6-12d-propaganda-reply', chapter: 'act3', actLabel: '第三幕 · 被计算的第六票', date: '2026-07-25',
    location: '{{sixthOrganizationName}}组织群', mode: 'chat', speaker: 'emperor', portrait: 'emperor',
    text: '标题够响，失利部分也确实被裁掉了。我会把原稿留在内部；外面追问时别说这张图从来没剪过。',
    background: 'aftermath', historical: 'fictional', next: 'r6-12b-record-published',
  },
  {
    id: 'r6-12b-record-published', chapter: 'act3', actLabel: '第三幕 · 被计算的第六票', date: '2026-07-25',
    location: '{{sixthOrganizationName}}组织群', mode: 'chat', speaker: 'emperor', portrait: 'emperor',
    text: '皇帝照你选的版本发了出去：“原稿留在我们群里。外面再转成什么样，我可管不住。”不到十分钟，一张只剩半截的转发图出现在公共群，下面已经排出两行问号。',
    background: 'aftermath',
    presentation: {
      sprites: [{ character: 'emperor', expression: 'neutral', pose: 'command', position: 'center', scale: 1.02 }],
    },
    next: 'r6-13-yyt-qifu',
  },
  {
    id: 'r6-13-yyt-qifu', chapter: 'act4', actLabel: '第四幕 · 谁代表第六组', date: '2026-07-28',
    title: 'yyT与祈福', location: '公共群', mode: 'chat', speaker: 'yyt', portrait: 'yyt',
    text: '“祈福，希露菲骗你拿到管理员，把旧群清空；现在一张被人裁过的战报，你又要替全区定真假？「{{sixthOrganizationName}}」不归一组，你也不是全区首领。”',
    background: 'worldChat', sound: 'warning', historical: 'adapted',
    presentation: {
      sprites: [
        { character: 'yyt', expression: 'neutral', pose: 'command', position: 'left', scale: 1.03 },
        { character: 'qifu', expression: 'concerned', pose: 'base', position: 'right', scale: .94, dimmed: true },
      ],
    },
    next: 'r6-14-qifu-answer',
  },
  {
    id: 'r6-14-qifu-answer', chapter: 'act4', actLabel: '第四幕 · 谁代表第六组', date: '2026-07-28',
    location: '公共群', mode: 'chat', speaker: 'qifu', portrait: 'qifu',
    text: '“管理员是我给错的，爆群是希露菲做的，这两件事我分得清。我现在说的是外面这张图不完整。yyT，你要代表整个「{{sixthOrganizationName}}」骂，就让你们首领出来确认。”',
    background: 'worldChat', historical: 'adapted',
    presentation: {
      sprites: [
        { character: 'qifu', expression: 'determined', pose: 'base', position: 'left', scale: 1.03 },
        { character: 'yyt', expression: 'neutral', pose: 'command', position: 'right', scale: .94, dimmed: true },
      ],
    },
    next: 'r6-15-ruling',
  },
  {
    id: 'r6-15-ruling', chapter: 'act4', actLabel: '第四幕 · 谁代表第六组', date: '2026-07-28',
    location: '{{sixthOrganizationName}}管理群', mode: 'novel', speaker: 'avucii', portrait: 'avucii',
    text: 'AVUCII发来一张公共群成员列表：“祈福的鼠标已经停在移出成员上。yyT刚才那句算个人发言，还是算我们组织的正式立场？现在说清，我照原话发。”',
    background: 'worldChat', choices: [
      {
        id: 'mediate-publicly', label: '“yyT是个人发言；双方停手，我公开贴完整记录。”', tone: 'calm',
        effects: [
          { type: 'flag', key: 'org6MediatedYytQifu' }, { type: 'stat', key: 'reputation', value: 2 },
          { type: 'flag', key: 'yytVoiceProtectedWithBoundary' },
          { type: 'relationship', character: 'yyt', key: 'trust', value: 1 },
          { type: 'relationship', character: 'yyt', key: 'affinity', value: 1 },
          { type: 'relationshipProgress', character: 'yyt', value: 35 },
          { type: 'relationship', character: 'qifu', key: 'trust', value: 1 },
          { type: 'butterflyDelta', key: 'bf_diplomacy', delta: 1 },
        ], next: 'r6-15c-yyt-boundary-lands',
      },
      {
        id: 'back-yyt', label: '“yyT代表我们。祈福，撤回质问并道歉。”', tone: 'danger',
        effects: [
          { type: 'flag', key: 'org6BackedYyt' }, { type: 'stat', key: 'cohesion', value: 2 },
          { type: 'organizationRelation', organization: 'org1', value: -2 }, { type: 'relationship', character: 'yyt', key: 'trust', value: 3 },
          { type: 'relationship', character: 'qifu', key: 'trust', value: -3 },
          { type: 'butterflyDelta', key: 'bf_loyalty', delta: 1 },
        ], next: 'r6-15d-back-yyt-reply',
      },
      {
        id: 'remove-yyt-authority', label: '“收回yyT的高层权限；AVUCII接管公告。”', tone: 'bold',
        effects: [
          { type: 'flag', key: 'org6RemovedYytAuthority' }, { type: 'highCouncil', members: ['avucii', 'emperor'] },
          { type: 'relationship', character: 'yyt', key: 'trust', value: -3 }, { type: 'relationship', character: 'avucii', key: 'trust', value: 3 },
          { type: 'organizationRelation', organization: 'org1', value: 1 },
          { type: 'butterflyDelta', key: 'bf_cruelty', delta: 1 },
        ], next: 'r6-15e-remove-yyt-reply',
      },
      {
        id: 'private-apology', label: '“yyT私下道歉；公开只发停战，不复述争吵。”', tone: 'secret',
        effects: [
          { type: 'flag', key: 'org6PrivateYytSettlement' }, { type: 'relationship', character: 'qifu', key: 'trust', value: 2 },
          { type: 'relationship', character: 'qifu', key: 'affinity', value: 1 }, { type: 'stat', key: 'reputation', value: -1 },
          { type: 'butterflyDelta', key: 'bf_shadow', delta: 1 },
        ], next: 'r6-15f-private-settlement-reply',
      },
    ],
  },
  {
    id: 'r6-15d-back-yyt-reply', chapter: 'act4', actLabel: '第四幕 · 谁代表第六组', date: '2026-07-28',
    location: '{{sixthOrganizationName}}管理群', mode: 'chat', speaker: 'yyt', portrait: 'yyt',
    text: '那我就按组织立场继续说。你替我盖了公章，祈福要求道歉时也会把整组一起算进去。',
    background: 'worldChat', historical: 'fictional', next: 'r6-15b-ruling-published',
  },
  {
    id: 'r6-15e-remove-yyt-reply', chapter: 'act4', actLabel: '第四幕 · 谁代表第六组', date: '2026-07-28',
    location: '{{sixthOrganizationName}}管理群', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: '权限现在转给我，我会先发交接记录。收回她的按钮能阻止下一次越权，不能把刚才那句话从公共群删掉。',
    background: 'worldChat', historical: 'fictional', next: 'r6-15b-ruling-published',
  },
  {
    id: 'r6-15f-private-settlement-reply', chapter: 'act4', actLabel: '第四幕 · 谁代表第六组', date: '2026-07-28',
    location: '祈福私聊', mode: 'chat', speaker: 'qifu', portrait: 'qifu',
    text: '私下道歉我收，公开只发停战。外面看不见完整争执，这个安静的代价也由你们自己承担。',
    background: 'worldChat', historical: 'fictional', next: 'r6-15b-ruling-published',
  },
  {
    // yyT攻略弧第二段直接回应玩家的公开边界，随后再由AVUCII执行同一份裁定。
    id: 'r6-15c-yyt-boundary-lands', chapter: 'act4', actLabel: '第四幕 · 谁代表第六组', date: '2026-07-28',
    location: '{{sixthOrganizationName}}管理群', mode: 'chat', speaker: 'yyt', portrait: 'yyt',
    text: 'yyT先撤回了“代表全组”那句：“你没让我闭嘴，也没把我的气话盖成组织公章。这个分法我认。下次我还是会顶你——但先写清楚我只代表自己。”',
    background: 'worldChat', historical: 'fictional',
    presentation: { sprites: [{ character: 'yyt', expression: 'soft', pose: 'phone', position: 'center', scale: 1.04 }] },
    next: 'r6-15b-ruling-published',
  },
  {
    id: 'r6-15b-ruling-published', chapter: 'act4', actLabel: '第四幕 · 谁代表第六组', date: '2026-07-28',
    location: '{{sixthOrganizationName}}管理群', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: 'AVUCII逐字贴出你的决定，连标点都没有替你改：“发完了。现在别看谁正在输入，先看公共群成员列表。权限落下来的速度，通常比道歉快。”',
    background: 'worldChat',
    presentation: {
      sprites: [
        { character: 'avucii', expression: 'neutral', pose: 'command', position: 'left', scale: 1.02 },
        { character: 'yyt', expression: 'neutral', pose: 'command', position: 'right', scale: .94, dimmed: true },
      ],
    },
    next: 'r6-16-yyt-outcome',
  },
  {
    id: 'r6-16-yyt-outcome', chapter: 'act4', actLabel: '第四幕 · 谁代表第六组', date: '2026-07-28',
    location: '公共群成员列表', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: '“决定和截图都发出去了，我不替结果加标题。事先写过权限、当众把双方拦住、拿得出完整记录——三样缺一项，管理员手里的移出键都不会自己消失。”AVUCII刷新了成员列表。',
    background: 'aftermath', historical: 'confirmed',
    presentation: {
      sprites: [{ character: 'avucii', expression: 'neutral', pose: 'command', position: 'center', scale: 1.03 }],
    },
    next: {
      cases: [{ when: { type: 'all', conditions: [
        { type: 'flag', key: 'org6WrittenCharter' }, { type: 'flag', key: 'org6MediatedYytQifu' }, { type: 'stat', key: 'evidence', operator: 'gte', value: 2 },
      ] }, next: 'r6-17-yyt-stays' }], fallback: 'r6-17-yyt-leaves',
    },
  },
  {
    id: 'r6-17-yyt-stays', chapter: 'act4', actLabel: '第四幕 · 名字换了位置', date: '2026-07-28',
    location: '{{sixthOrganizationName}} · 内部群', mode: 'chat', speaker: 'yyt', portrait: 'yyt',
    text: '公共群的成员列表里，yyT的名字已经被祈福移出；「{{sixthOrganizationName}}」的内部名单仍保留着她。“我撤回‘代表组织’那句，公共群也不回了。你把章程和原图都贴出来，我认；以后我只在这里做反方签字人。”',
    background: 'worldChat', historical: 'adapted',
    presentation: {
      sprites: [{ character: 'yyt', expression: 'neutral', pose: 'command', position: 'center', scale: 1.03 }],
    },
    onEnter: [
      { type: 'flag', key: 'yytRemovedFromPublicGroup' },
      { type: 'flag', key: 'yytStayedInOrg6' },
      { type: 'stance', character: 'yyt', value: 'support' },
    ],
    next: 'r6-18-merger-pressure',
  },
  {
    id: 'r6-17-yyt-leaves', chapter: 'act4', actLabel: '第四幕 · 公共群门外', date: '2026-07-28',
    location: '公共群成员列表', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: '祈福把yyT移出了公共群；yyT随后也把自己从「{{sixthOrganizationName}}」的内部职务表划掉，只留下早先的批注。AVUCII接过日常管理：“公共群的权限由祈福处理，我们自己的交接自己写。公告、名单和明天的排班，先由我接手。”',
    background: 'aftermath', historical: 'confirmed',
    presentation: {
      cg: cgPath('cg40-yyt-avucii-handoff'),
      cgAlt: 'yyT离开公共群入口，祈福留在公共侧，AVUCII在六组管理桌前接过日常管理钥匙',
      ui: 'cinematic',
      transition: 'glitch',
      camera: 'pull-back',
      atmosphere: 'messages',
      focus: 'center',
    },
    onEnter: [
      { type: 'flag', key: 'yytRemovedFromPublicGroup' }, { type: 'flag', key: 'yytLeftOrg6' },
      { type: 'flag', key: 'avuciiTookOverOrg6' },
      { type: 'stance', character: 'yyt', value: 'left' }, { type: 'highCouncil', members: ['avucii', 'emperor'] },
      { type: 'unlockCg', id: 'cg40-yyt-avucii-handoff' },
    ],
    next: 'r6-18-merger-pressure',
  },
  {
    id: 'r6-18-merger-pressure', chapter: 'act4', actLabel: '第四幕 · 并入江南', date: '2026-07-28',
    title: '二组的条件', location: '首领私聊', mode: 'chat', speaker: 'shana', portrait: 'shana',
    text: '“「{{sixthOrganizationName}}」继续独立，需要稳定出勤和两个能执行管理的人。并入江南，成员立刻有活动物资。不是吞并宣传，条件就这一条：你们放弃独立组织名。”',
    background: 'warRoom',
    presentation: {
      sprites: [{ character: 'shana', expression: 'determined', pose: 'phone', position: 'center', scale: 1.03 }],
    },
    next: 'r6-19-avucii-advice',
  },
  {
    id: 'r6-19-avucii-advice', chapter: 'act4', actLabel: '第四幕 · 并入江南', date: '2026-07-28',
    location: '{{sixthOrganizationName}}管理私聊', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: '“别因为不喜欢‘解散’两个字就硬撑，也别因为江南仓库满，就把创建时说的话全删掉。”AVUCII把明日排班、仓库截图和成员回复数排成三列，“先看「{{sixthOrganizationName}}」有没有人接得住明天。”',
    background: 'warRoom',
    presentation: {
      sprites: [{ character: 'avucii', expression: 'neutral', pose: 'command', position: 'center', scale: 1.03 }],
    },
    next: 'r6-20-survival-decision',
  },
  {
    id: 'r6-20-survival-decision', chapter: 'act4', actLabel: '第四幕 · 并入江南', date: '2026-07-28',
    location: '组织设置', mode: 'novel', speaker: 'player',
    text: '屏幕上摆着四样东西：明日排班、江南协议、成员确认表和首领转让键。你把最终决定发进「{{sixthOrganizationName}}」群。',
    background: 'sixthSeat',
    presentation: {
      sprites: [
        { character: 'avucii', expression: 'neutral', pose: 'command', position: 'left', scale: 1.01 },
        { character: 'emperor', expression: 'neutral', pose: 'command', position: 'right', scale: .96 },
      ],
    },
    choices: [
      {
        id: 'remain-independent', label: '“「{{sixthOrganizationName}}」不解散。我把三十天排班发出来。”', tone: 'bold',
        effects: [
          { type: 'flag', key: 'org6AttemptedIndependence' }, { type: 'stat', key: 'cohesion', value: 1 },
          { type: 'relationship', character: 'avucii', key: 'trust', value: 2 },
          { type: 'butterflyDelta', key: 'bf_loyalty', delta: 1 },
        ], next: 'r6-20c-independent-reply',
      },
      {
        id: 'alliance-org2', label: '“名字留下；我和江南签一份可以退出的物资协议。”', tone: 'calm',
        condition: { type: 'organizationRelation', organization: 'org2', operator: 'gte', value: 1 },
        effects: [
          { type: 'flag', key: 'org6AlliedOrg2' }, { type: 'stat', key: 'resources', value: 2 },
          { type: 'organizationRelation', organization: 'org2', value: 1 },
          { type: 'butterflyDelta', key: 'bf_diplomacy', delta: 1 },
        ], next: 'r6-20d-alliance-org2-reply',
      },
      {
        id: 'merge-org2', label: '“先逐个确认去留，再把愿意的人并入江南。”', tone: 'danger',
        effects: [
          { type: 'flag', key: 'org6MergedOrg2' }, { type: 'stat', key: 'cohesion', value: -2 },
          { type: 'organizationRelation', organization: 'org2', value: 2 },
          { type: 'butterflyDelta', key: 'bf_diplomacy', delta: 1 },
        ], next: 'r6-20e-merge-org2-reply',
      },
      {
        id: 'handoff-avucii', label: '“AVUCII，首领权限交给你；我退回成员位。”', tone: 'secret',
        effects: [
          { type: 'flag', key: 'org6HandoffAvucii' }, { type: 'relationship', character: 'avucii', key: 'trust', value: 3 },
          { type: 'stat', key: 'reputation', value: 1 },
          { type: 'butterflyDelta', key: 'bf_shadow', delta: 1 },
        ], next: 'r6-20a-avucii-accepts-key',
      },
    ],
  },
  {
    id: 'r6-20c-independent-reply', chapter: 'act4', actLabel: '第四幕 · 并入江南', date: '2026-07-28',
    location: '{{sixthOrganizationName}}组织群', mode: 'chat', speaker: 'emperor', portrait: 'emperor',
    text: '三十天排班我来逐个确认。名字留下不是一句口号，明天没人上线时也得有人接第一班。',
    background: 'sixthSeat', historical: 'fictional', next: 'r6-20b-members-answer',
  },
  {
    id: 'r6-20d-alliance-org2-reply', chapter: 'act4', actLabel: '第四幕 · 并入江南', date: '2026-07-28',
    location: '六组与江南协议页', mode: 'chat', speaker: 'shana', portrait: 'shana',
    text: '名字和成员位都保留，物资协议写明退出条件。江南提供仓库，不替第六组接管理。',
    background: 'sixthSeat', historical: 'fictional', next: 'r6-20b-members-answer',
  },
  {
    id: 'r6-20e-merge-org2-reply', chapter: 'act4', actLabel: '第四幕 · 并入江南', date: '2026-07-28',
    location: '成员确认表', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: '我会逐个问去留，愿意的人才进江南。没确认的人不自动迁移，第六组的旧名单也不会被一句“合并完成”抹掉。',
    background: 'sixthSeat', historical: 'fictional', next: 'r6-20b-members-answer',
  },
  {
    // AVUCII攻略弧第三段：接任不是替玩家收尾，而是双方接受新的权力边界。
    id: 'r6-20a-avucii-accepts-key', chapter: 'act4', actLabel: '第四幕 · 钥匙换手', date: '2026-07-28',
    location: '{{sixthOrganizationName}}管理私聊', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: 'AVUCII没有立刻按确认：“我接，但不是替你收拾退场。我会删掉没必要的表，也会在你以普通成员身份越权时驳回你。你把钥匙交给这样的我，我才签。”你把转让页推回去：“正因为是这样的你。”',
    background: 'sixthSeat', historical: 'fictional',
    presentation: { sprites: [{ character: 'avucii', expression: 'soft', pose: 'command', position: 'center', scale: 1.04 }] },
    onEnter: [
      { type: 'flag', key: 'avuciiAcceptedLeaderKey' },
      { type: 'relationship', character: 'avucii', key: 'affinity', value: 2 },
    ],
    next: 'r6-20b-members-answer',
  },
  {
    id: 'r6-20b-members-answer', chapter: 'act4', actLabel: '第四幕 · 并入江南', date: '2026-07-28',
    location: '{{sixthOrganizationName}}组织群', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: 'AVUCII把你的原话存进最后一版成员表：“决定收到。先别发鼓掌表情，按这句话改名单、权限和仓库。皇帝，你负责问最难的问题——明天到底谁上线？”',
    background: 'sixthSeat',
    presentation: {
      sprites: [
        { character: 'avucii', expression: 'neutral', pose: 'command', position: 'left', scale: 1.02 },
        { character: 'emperor', expression: 'neutral', pose: 'command', position: 'right', scale: .96, dimmed: true },
      ],
    },
    next: 'r6-21-qifu-night',
  },
  {
    id: 'r6-21-qifu-night', chapter: 'epilogue', actLabel: '尾声 · 管理员之外', date: '2026-07-28',
    location: '祈福私聊', mode: 'chat', speaker: 'qifu', portrait: 'qifu',
    text: '我今天没@全体，也没给任何人管理员。你们最后怎么选，我不会再替第六组宣布。只是……如果你还在线，陪我把这份名单核完。',
    background: 'nightMessage',
    presentation: {
      sprites: [{ character: 'qifu', expression: 'concerned', pose: 'base', position: 'center', scale: 1.04 }],
    },
    choices: [
      {
        id: 'stay-and-check', label: '“我不接管理员；坐下吧，我们一起把名字核完。”', tone: 'warm',
        effects: [
          { type: 'relationship', character: 'qifu', key: 'trust', value: 2 }, { type: 'relationship', character: 'qifu', key: 'affinity', value: 2 },
          { type: 'relationshipProgress', character: 'qifu', value: 40 },
          { type: 'flag', key: 'stayedWithQifuAfterRebuild' },
          { type: 'butterflyDelta', key: 'bf_heart', delta: 1 },
        ], next: 'r6-21c-stay-reply',
      },
      {
        id: 'send-template', label: '“模板发你。我先回「{{sixthOrganizationName}}」，有漏项再找我。”', tone: 'calm',
        effects: [{ type: 'relationship', character: 'qifu', key: 'trust', value: 1 }, { type: 'stat', key: 'cohesion', value: 1 }, { type: 'butterflyDelta', key: 'bf_cruelty', delta: 1 }],
        next: 'r6-21d-template-reply',
      },
    ],
  },
  {
    id: 'r6-21c-stay-reply', chapter: 'epilogue', actLabel: '尾声 · 管理员之外', date: '2026-07-28',
    location: '祈福私聊', mode: 'chat', speaker: 'qifu', portrait: 'qifu',
    text: '好，不给你管理员。你读本人确认，我对旧名单；谁没回，我们明天再问，不从表里直接删。',
    background: 'nightMessage', historical: 'fictional', next: 'r6-21b-list-closed',
  },
  {
    id: 'r6-21d-template-reply', chapter: 'epilogue', actLabel: '尾声 · 管理员之外', date: '2026-07-28',
    location: '祈福私聊', mode: 'chat', speaker: 'qifu', portrait: 'qifu',
    text: '模板收到，你先回第六组。缺项我单独找你，不再拿@全体当作有人负责。',
    background: 'nightMessage', historical: 'fictional', next: 'r6-21b-list-closed',
  },
  {
    id: 'r6-21b-list-closed', chapter: 'epilogue', actLabel: '尾声 · 管理员之外', date: '2026-07-28',
    location: '祈福私聊', mode: 'chat', speaker: 'qifu', portrait: 'qifu',
    text: '最后一行被打上勾。祈福没有再弹出管理员邀请：“核完了。今天这份名单里，没有人因为少回一句话被删掉——这句话听着像常识，我居然花了一个空群才学会。”',
    background: 'nightMessage',
    presentation: {
      sprites: [{ character: 'qifu', expression: 'soft', pose: 'base', position: 'center', scale: 1.04 }],
    },
    next: 'r6-22-chenyi-offline',
  },
  {
    id: 'r6-22-chenyi-offline', chapter: 'epilogue', actLabel: '尾声 · 普通退游', date: '2026-07-28',
    location: '二组组织群', mode: 'chat', speaker: 'shana', portrait: 'shana',
    text: '夏娜在二组群里补了一条名单说明：“辰逸今天一天没上线，他自己也说不想继续玩了，所以从成员表移出。现在他只是普通成员离场，没有新冲突，别再替他编一场政变。”',
    background: 'nightMessage', historical: 'confirmed',
    presentation: {
      cg: cgPath('cg32-chenyi-leaves'),
      cgAlt: '辰逸以普通成员身份放下令牌，没有新政变或审判，只因一天未上线且不想继续玩而离场',
      ui: 'cinematic',
      transition: 'crossfade',
      camera: 'pull-back',
      atmosphere: 'dust',
      focus: 'center',
    },
    onEnter: [
      { type: 'flag', key: 'chenyiRemovedInactiveOnJuly28' },
      { type: 'unlockCg', id: 'cg32-chenyi-leaves' },
    ],
    next: 'r6-23-member-night-hub',
  },
  {
    // 第六组成员夜话是可选支线清单：事件完成后写入已读旗标，再回到清单继续或结束。
    id: 'r6-23-member-night-hub', chapter: 'epilogue', actLabel: '尾声 · 成员夜话', date: '2026-07-28',
    location: '{{sixthOrganizationName}} · 夜间频道', mode: 'chat', speaker: 'emperor', portrait: 'emperor',
    text: '皇帝把夜间频道改名为“还有人类在线吗”：“五个头像亮着，未必五个人都在。你挑一个确认；全点一遍也行，但那就很像另一种形式的@全体。”',
    background: 'nightMessage', historical: 'fictional',
    presentation: { sprites: [{ character: 'emperor', expression: 'soft', pose: 'phone', position: 'center', scale: 1.03 }] },
    choices: [
      {
        id: 'night-qifu', label: '帮祈福核对最后一行权限', tone: 'warm',
        condition: { type: 'flag', key: 'r6NightQifuSeen', value: false },
        effects: [], next: 'r6-23a-qifu-night',
      },
      {
        id: 'night-yyt', label: '打开yyT留给你的反方批注', tone: 'warm',
        condition: { type: 'flag', key: 'r6NightYytSeen', value: false },
        effects: [], next: 'r6-23c-yyt-night',
      },
      {
        id: 'night-emperor', label: '回复皇帝那份“不像报告”的报告', tone: 'calm',
        condition: { type: 'flag', key: 'r6NightEmperorSeen', value: false },
        effects: [], next: 'r6-23e-emperor-night',
      },
      {
        id: 'night-avucii', label: '去管理桌把AVUCII叫停一次', tone: 'secret',
        condition: { type: 'flag', key: 'r6NightAvuciiSeen', value: false },
        effects: [], next: 'r6-23g-avucii-night',
      },
      {
        id: 'night-xingqing', label: '听星晴发来的猫叫语音', tone: 'warm',
        condition: { type: 'flag', key: 'r6NightXingqingSeen', value: false },
        effects: [], next: 'r6-23i-xingqing-night',
      },
      {
        id: 'finish-member-night', label: '退出夜间频道，处理最后一条私人消息', tone: 'calm',
        effects: [], next: 'r6-23-bond-router',
      },
    ],
  },
  {
    id: 'r6-23a-qifu-night', chapter: 'epilogue', actLabel: '成员夜话 · 祈福', date: '2026-07-28',
    location: '祈福私聊', mode: 'chat', speaker: 'qifu', portrait: 'qifu',
    text: '祈福把管理员名单拉到最底：“我现在每删一个权限都截图，结果相册像一部犯罪纪录片。最后一行是我自己——要不要也删？”',
    background: 'nightMessage', historical: 'fictional',
    presentation: { sprites: [{ character: 'qifu', expression: 'concerned', pose: 'base', position: 'center', scale: 1.04 }] },
    choices: [
      {
        id: 'keep-qifu-with-check', label: '“保留，但以后新增管理员要第二个人确认。”', tone: 'calm',
        effects: [
          { type: 'flag', key: 'r6NightQifuSeen' },
          { type: 'relationship', character: 'qifu', key: 'trust', value: 1 },
          { type: 'relationshipProgress', character: 'qifu', value: 20 },
        ], next: 'r6-23b-qifu-reply',
      },
      {
        id: 'qifu-rests-tonight', label: '“今晚先删。明天需要时，再由大家把它交还给你。”', tone: 'warm',
        effects: [
          { type: 'flag', key: 'r6NightQifuSeen' },
          { type: 'relationship', character: 'qifu', key: 'affinity', value: 1 },
          { type: 'relationshipProgress', character: 'qifu', value: 20 },
        ], next: 'r6-23b-qifu-reply',
      },
    ],
  },
  {
    id: 'r6-23b-qifu-reply', chapter: 'epilogue', actLabel: '成员夜话 · 祈福', date: '2026-07-28',
    location: '祈福私聊', mode: 'chat', speaker: 'qifu', portrait: 'qifu',
    text: '她把鼠标从红色按钮上移开：“原来权限也可以明天再决定。以前我总怕晚一分钟，群就不听我的；现在才知道，真正听人的群不靠那一分钟。”',
    background: 'nightMessage', historical: 'fictional', next: 'r6-23-member-night-hub',
  },
  {
    // yyT攻略弧第三段将规则、公开边界与私人选择合流；合理路径在这里刚好达到100。
    id: 'r6-23c-yyt-night', chapter: 'epilogue', actLabel: '成员夜话 · yyT', date: '2026-07-28',
    location: 'yyT私聊', mode: 'chat', speaker: 'yyt', portrait: 'yyt',
    text: 'yyT把那份章程翻到最早的批注：“你让我当反方，后来又在公共群说我只代表自己。现在不谈组织——如果我说想留下，你准备把它当建议、命令，还是一句私话？”',
    background: 'nightMessage', historical: 'fictional',
    presentation: { sprites: [{ character: 'yyt', expression: 'soft', pose: 'phone', position: 'center', scale: 1.05 }] },
    choices: [
      {
        id: 'hear-yyt-private-voice', label: '合上章程：“当私话听。我的回答也不盖组织章。”', tone: 'warm',
        effects: [
          { type: 'flag', key: 'r6NightYytSeen' },
          { type: 'flag', key: 'yytPrivateVoiceHeard' },
          { type: 'relationship', character: 'yyt', key: 'trust', value: 2 },
          { type: 'relationship', character: 'yyt', key: 'affinity', value: 2 },
          { type: 'relationshipProgress', character: 'yyt', value: 35 },
        ], next: 'r6-23d-yyt-reply',
      },
      {
        id: 'keep-yyt-on-record', label: '“我会记住，但今晚还不能给私人回答。”', tone: 'calm',
        effects: [
          { type: 'flag', key: 'r6NightYytSeen' },
          { type: 'relationship', character: 'yyt', key: 'trust', value: 1 },
          { type: 'relationshipProgress', character: 'yyt', value: 10 },
        ], next: 'r6-23d-yyt-reply',
      },
    ],
  },
  {
    id: 'r6-23d-yyt-reply', chapter: 'epilogue', actLabel: '成员夜话 · yyT', date: '2026-07-28',
    location: 'yyT私聊', mode: 'chat', speaker: 'yyt', portrait: 'yyt',
    text: 'yyT把“反方签字人”的标签从昵称后面摘掉，又单独发来一句：“那我也不用高层身份等。你慢慢答，但别拿下一版章程当情书糊弄我。”',
    background: 'nightMessage', historical: 'fictional', next: 'r6-23-member-night-hub',
  },
  {
    id: 'r6-23e-emperor-night', chapter: 'epilogue', actLabel: '成员夜话 · 皇帝', date: '2026-07-28',
    location: '皇帝私聊', mode: 'chat', speaker: 'emperor', portrait: 'emperor',
    text: '皇帝的日报只有一句：“今日重大成果：群还在，人也大致都在。”附件却有十二页。他解释：“一句给成员看，十二页留给下次有人说‘当时没人知道’。”',
    background: 'nightMessage', historical: 'fictional',
    presentation: { sprites: [{ character: 'emperor', expression: 'soft', pose: 'thinking', position: 'center', scale: 1.03 }] },
    choices: [
      {
        id: 'read-emperor-appendix', label: '“十二页发我。我来当第二个知道的人。”', tone: 'warm',
        effects: [
          { type: 'flag', key: 'r6NightEmperorSeen' },
          { type: 'relationship', character: 'emperor', key: 'trust', value: 2 },
          { type: 'relationship', character: 'emperor', key: 'affinity', value: 1 },
        ], next: 'r6-23f-emperor-reply',
      },
      {
        id: 'compress-emperor-report', label: '“明天教你把十二页压成两页，剩下十页拿来睡觉。”', tone: 'calm',
        effects: [
          { type: 'flag', key: 'r6NightEmperorSeen' },
          { type: 'relationship', character: 'emperor', key: 'trust', value: 1 },
          { type: 'relationship', character: 'emperor', key: 'affinity', value: 1 },
        ], next: 'r6-23f-emperor-reply',
      },
    ],
  },
  {
    id: 'r6-23f-emperor-reply', chapter: 'epilogue', actLabel: '成员夜话 · 皇帝', date: '2026-07-28',
    location: '皇帝私聊', mode: 'chat', speaker: 'emperor', portrait: 'emperor',
    text: '“批准。”皇帝把文件名从“最终绝密”改成“有人一起看”，“报告一旦有第二个读者，就从遗书升级成档案了。听着没那么吉利，但更容易活到明天。”',
    background: 'nightMessage', historical: 'fictional', next: 'r6-23-member-night-hub',
  },
  {
    id: 'r6-23g-avucii-night', chapter: 'epilogue', actLabel: '成员夜话 · AVUCII', date: '2026-07-28',
    location: '第六席管理桌', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: 'AVUCII还在核仓库，屏幕上四列都是绿色，只有她的在线时长红得像事故：“别劝我休息。先告诉我，哪个任务明天不做也不会死人。”',
    background: 'nightMessage', historical: 'fictional',
    presentation: { sprites: [{ character: 'avucii', expression: 'concerned', pose: 'thinking', position: 'center', scale: 1.04 }] },
    choices: [
      {
        id: 'cancel-avucii-perfect-table', label: '划掉“把表格对齐”：“这个不做，组织甚至不会察觉。”', tone: 'warm',
        effects: [
          { type: 'flag', key: 'r6NightAvuciiSeen' },
          { type: 'relationship', character: 'avucii', key: 'trust', value: 2 },
          { type: 'relationship', character: 'avucii', key: 'affinity', value: 1 },
        ], next: 'r6-23h-avucii-reply',
      },
      {
        id: 'share-avucii-last-row', label: '“最后一行给我。你下线以后，我才开始做。”', tone: 'warm',
        effects: [
          { type: 'flag', key: 'r6NightAvuciiSeen' },
          { type: 'flag', key: 'avuciiAllowedSharedBurden' },
          { type: 'relationship', character: 'avucii', key: 'trust', value: 2 },
          { type: 'relationship', character: 'avucii', key: 'affinity', value: 2 },
          { type: 'relationshipProgress', character: 'avucii', value: 40 },
        ], next: 'r6-23h2-avucii-shares-row',
      },
    ],
  },
  {
    id: 'r6-23h-avucii-reply', chapter: 'epilogue', actLabel: '成员夜话 · AVUCII', date: '2026-07-28',
    location: '第六席管理桌', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: '她盯着被划掉的格子，像第一次发现空白也能保存：“行。明早它要是自己长回来，我就承认表格已经具备生命，可以接任首领。”',
    background: 'nightMessage', historical: 'fictional', next: 'r6-23-member-night-hub',
  },
  {
    id: 'r6-23h2-avucii-shares-row', chapter: 'epilogue', actLabel: '成员夜话 · AVUCII', date: '2026-07-28',
    location: '第六席管理桌', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: 'AVUCII把最后一行推给你：“这一行归你，明早第一行归我。谁先醒，谁先说早安——不准用任务编号开头。”',
    background: 'nightMessage', historical: 'fictional', next: 'r6-23-member-night-hub',
  },
  {
    // 星晴重点事件（1/2）：用猫的语音垫场，再试着主动发言。
    id: 'r6-23i-xingqing-night', chapter: 'epilogue', actLabel: '成员夜话 · 星晴', date: '2026-07-28',
    location: '星晴私聊', mode: 'chat', speaker: 'xingqing', portrait: 'xingqing',
    text: '星晴发来七秒语音，前六秒全是猫呼噜，最后一秒才听见：“我一直在，只是不知道群里什么时候轮到普通成员说话。猫替我试了，它没被踢。”',
    background: 'nightMessage', historical: 'fictional',
    presentation: { sprites: [{ character: 'xingqing', expression: 'soft', pose: 'phone', position: 'center', scale: 1.04 }] },
    choices: [
      {
        id: 'invite-xingqing-own-voice', label: '按住语音键：“下次不用让猫先试。你的话不用排高层队列。”', tone: 'warm',
        effects: [
          { type: 'flag', key: 'r6NightXingqingSeen' },
          { type: 'flag', key: 'xingqingSpokeInOwnVoice' },
          { type: 'relationship', character: 'xingqing', key: 'trust', value: 2 },
          { type: 'relationship', character: 'xingqing', key: 'affinity', value: 2 },
        ], next: 'r6-23j-xingqing-reply',
      },
      {
        id: 'appoint-cat-moderator', label: '“猫先保留发言权，你负责翻译；明天我们再练本人版。”', tone: 'warm',
        effects: [
          { type: 'flag', key: 'r6NightXingqingSeen' },
          { type: 'relationship', character: 'xingqing', key: 'trust', value: 1 },
          { type: 'relationship', character: 'xingqing', key: 'affinity', value: 2 },
        ], next: 'r6-23j-xingqing-reply',
      },
    ],
  },
  {
    // 星晴重点事件（2/2）：即时回应把这个昵称正式留在六组成员群像里。
    id: 'r6-23j-xingqing-reply', chapter: 'epilogue', actLabel: '成员夜话 · 星晴', date: '2026-07-28',
    location: '星晴私聊', mode: 'chat', speaker: 'xingqing', portrait: 'xingqing',
    text: '这次没有猫叫垫场：“那我先报到。星晴，六组成员，明晚会来。”停了两秒，背景里猫叫了一声。星晴补充：“它不是高层，只是坚持旁听。”',
    background: 'nightMessage', historical: 'fictional',
    onEnter: [{ type: 'flag', key: 'xingqingConfirmedOrg6Member' }],
    next: 'r6-23-member-night-hub',
  },
  {
    id: 'r6-23-bond-router', chapter: 'epilogue', actLabel: '尾声 · 私人名单', date: '2026-07-28',
    location: '好友列表', mode: 'chat', speaker: 'qifu', portrait: 'qifu',
    text: '公共群成员名单已经核完。祈福没有再发组织公告，只让与你的私聊窗口停在最上面：“还有一句，不用管理员身份说。”', background: 'nightMessage',
    presentation: {
      sprites: [{ character: 'qifu', expression: 'soft', pose: 'base', position: 'center', scale: 1.04 }],
    },
    choices: [
      {
        id: 'choose-qifu-bond', label: '让祈福以自己的名字说完那句话', tone: 'warm',
        condition: { type: 'all', conditions: [
          { type: 'flag', key: 'stayedWithQifuAfterRebuild' },
          { type: 'relationshipProgress', character: 'qifu', operator: 'gte', value: 100 },
          { type: 'relationship', character: 'qifu', key: 'trust', operator: 'gte', value: 6 },
          { type: 'relationship', character: 'qifu', key: 'affinity', operator: 'gte', value: 4 },
        ] },
        effects: [], next: 'r6-24-bond-qifu',
      },
      {
        id: 'choose-yyt-bond', label: '把yyT那句私话认真回答完', tone: 'warm',
        condition: { type: 'all', conditions: [
          { type: 'flag', key: 'yytRuleCounterSigner' },
          { type: 'flag', key: 'yytVoiceProtectedWithBoundary' },
          { type: 'flag', key: 'yytPrivateVoiceHeard' },
          { type: 'flag', key: 'yytStayedInOrg6' },
          { type: 'relationshipProgress', character: 'yyt', operator: 'gte', value: 100 },
          { type: 'relationship', character: 'yyt', key: 'trust', operator: 'gte', value: 5 },
          { type: 'relationship', character: 'yyt', key: 'affinity', operator: 'gte', value: 3 },
        ] },
        effects: [], next: 'r6-24-bond-yyt',
      },
      {
        id: 'choose-avucii-bond', label: '把最后一行留空，问AVUCII愿不愿意一起等明天', tone: 'warm',
        condition: { type: 'all', conditions: [
          { type: 'flag', key: 'avuciiKeptOwnCredit' },
          { type: 'flag', key: 'avuciiNameKeptInRecord' },
          { type: 'flag', key: 'avuciiAllowedSharedBurden' },
          { type: 'flag', key: 'r6NightAvuciiSeen' },
          { type: 'relationshipProgress', character: 'avucii', operator: 'gte', value: 100 },
          { type: 'relationship', character: 'avucii', key: 'trust', operator: 'gte', value: 6 },
          { type: 'relationship', character: 'avucii', key: 'affinity', operator: 'gte', value: 3 },
        ] },
        effects: [], next: 'r6-24-bond-avucii',
      },
      {
        id: 'keep-ordinary-relationship', label: '把今晚留在成员和朋友的位置', tone: 'calm',
        effects: [], next: 'r6-25-ending-router',
      },
    ],
  },
  // 祈福的两条攻略路径共用同一张结局母图，文字与状态仍由各路线独立结算。
  bondEndingNode({
    id: 'r6-24-bond-qifu', actLabel: '尾声 · 祈福',
    location: '名单最后一行', character: 'qifu',
    text: '最后一个名字核完了。管理员列表里没有你，首领列表里我们也各在一边。这样很好——我想留你，不需要先给你一个权限。',
    cg: cgPath('cg17-bond-qifu'),
    cgAlt: '名单核对结束后的夜晚，祈福把权限徽章放到一旁，只以私人身份挽留玩家',
    cgId: 'cg17-bond-qifu',
    next: 'r6-25-ending-router',
  }),
  bondEndingNode({
    id: 'r6-24-bond-yyt', actLabel: '尾声 · yyT',
    location: '章程最后一页', character: 'yyt',
    text: 'yyT把你们最早那份章程翻到背面。正面写权限，背面只写两行：“我留下，不代表我永远同意你。你留下，也别只在我同意时喜欢我。”她把笔递过来：“这次不是反方签字。签你自己的名字。”',
    cg: cgPath('cg47-bond-yyt'),
    cgAlt: '第六组夜间管理桌前，yyT把写满批注的章程翻到空白背面，邀请玩家以私人身份签下自己的名字',
    cgId: 'cg47-bond-yyt',
    atmosphere: 'paper',
    next: 'r6-25-ending-router',
  }),
  bondEndingNode({
    id: 'r6-24-bond-avucii', actLabel: '尾声 · AVUCII',
    location: '第六席管理桌', character: 'avucii',
    text: 'AVUCII保存了首领、成员、仓库和排班四张表，唯独没有关掉与你的私聊：“明天组织叫什么、钥匙在谁手里，都先放一边。你上线的时候先来找我。不是催表，也不是交接——是我想见你。”',
    cg: cgPath('cg49-bond-avucii'),
    cgAlt: '第六席的夜间管理桌前，AVUCII把首领钥匙放在工作区，将一份空白的明日清单推到玩家面前发出私人邀请',
    cgId: 'cg49-bond-avucii',
    atmosphere: 'paper',
    next: 'r6-25-ending-router',
  }),
  {
    id: 'r6-25-ending-router', chapter: 'epilogue', actLabel: '尾声 · 最后一张清单', date: '2026-07-28',
    location: '{{sixthOrganizationName}}管理桌', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: 'AVUCII把最后一张清单摊开：“明天谁上线，仓库还剩什么，外面还信不信我们上一条公告，钥匙交给谁——创建组织只按一次确认，活过下一周得把这四行都填上。”',
    background: 'ending',
    presentation: {
      sprites: [{ character: 'avucii', expression: 'neutral', pose: 'command', position: 'center', scale: 1.03 }],
    },
    next: {
      cases: [
        // ── 蝴蝶效应 · 路线变体结局 ──
        { when: { type: 'flag', key: 'bf_anarchy' }, next: 'r6-end-anarchy-reigns' },
        { when: { type: 'flag', key: 'bf_schemer' }, next: 'r6-end-shadow-seat' },
        { when: { type: 'flag', key: 'bf_peacemaker' }, next: 'r6-end-united-front' },
        // ── 原有分流逻辑 ──
        { when: { type: 'flag', key: 'org6MergedOrg2' }, next: 'r6-end-merge-success' },
        { when: { type: 'flag', key: 'org6AlliedOrg2' }, next: 'r6-end-satellite-seat' },
        { when: { type: 'flag', key: 'org6HandoffAvucii' }, next: 'r6-end-avucii-takes-seat' },
        { when: { type: 'all', conditions: [
          { type: 'flag', key: 'org6AttemptedIndependence' }, { type: 'stat', key: 'cohesion', operator: 'gte', value: 3 },
          { type: 'stat', key: 'resources', operator: 'gte', value: 1 }, { type: 'stat', key: 'reputation', operator: 'gte', value: 0 },
        ] }, next: 'r6-end-sixth-seat' },
      ], fallback: 'r6-end-hollow-seat',
    },
  },
  {
    id: 'r6-end-sixth-seat', chapter: 'epilogue', actLabel: '终幕 · 第六席', date: '2026-07-28',
    title: '{{sixthOrganizationName}}', location: '4945区', mode: 'ending', speaker: 'narrator',
    text: '7月28日，「{{sixthOrganizationName}}」的席位仍然亮着。明日排班有人签名，仓库够撑过下一轮，最后一条公告也没有被所有人当成笑话。它还谈不上完美，只是终于具备了活过下一周的最低条件。',
    background: 'ending', music: 'afterOnline',
    presentation: {
      cg: cgPath('cg38-ending-route6'),
      cgAlt: '五个旧席位之外，第六席在自己的平台上迎来日出，章程、预算与首领徽章都仍可运转',
      ui: 'ending', transition: 'crossfade', camera: 'push-in', atmosphere: 'dust', focus: 'center',
    },
    onEnter: [
      { type: 'unlockEnding', id: 'r6-sixth-seat' },
      { type: 'unlockCg', id: 'cg38-ending-route6' },
    ],
    next: 'worldline-check',
  },
  {
    id: 'r6-end-satellite-seat', chapter: 'epilogue', actLabel: '终幕 · 卫星席位', date: '2026-07-28',
    title: '卫星席位', location: '4945区', mode: 'ending', speaker: 'narrator',
    text: '「{{sixthOrganizationName}}」保住了名字，活动物资主要来自江南。协议把边界写得很清楚，也让每次续约都像一次存在证明。你们不是江南的分组，却还没学会在没有江南时怎么继续。',
    background: 'ending', music: 'afterOnline',
    presentation: {
      cg: cgPath('cg38-ending-route6'),
      cgAlt: '第六席保持自己的平台，却由一座窄桥连接江南方向，独立边界与资源依赖同时可见',
      ui: 'ending', transition: 'slide', camera: 'drift-right', atmosphere: 'paper', focus: 'right',
    },
    onEnter: [
      { type: 'unlockEnding', id: 'r6-satellite-seat' },
      { type: 'unlockCg', id: 'cg38-ending-route6' },
    ],
    next: 'worldline-check',
  },
  {
    id: 'r6-end-avucii-takes-seat', chapter: 'epilogue', actLabel: '终幕 · AVUCII接手', date: '2026-07-28',
    title: 'AVUCII接手', location: '4945区', mode: 'ending', speaker: 'narrator',
    text: '你把「{{sixthOrganizationName}}」的首领权限交给已经承担日常管理的AVUCII。她没有先发表接任感言，只重新核对成员、仓库和明日排班。组织能否活过下一周不再由你选择；至少这一次，职位追上了责任。',
    background: 'ending', music: 'afterOnline',
    presentation: {
      cg: cgPath('cg38-ending-route6'),
      cgAlt: '可转交的首领徽章放在第六席前，空白章程与预算等待AVUCII重新核对',
      ui: 'ending', transition: 'ink', camera: 'drift-left', atmosphere: 'paper', focus: 'left',
    },
    onEnter: [
      { type: 'unlockEnding', id: 'r6-avucii-takes-seat' },
      { type: 'unlockCg', id: 'cg38-ending-route6' },
    ],
    next: 'worldline-check',
  },
  {
    id: 'r6-end-merge-success', chapter: 'epilogue', actLabel: '终幕 · 成功解散', date: '2026-07-28',
    title: '成功解散', location: '4945区', mode: 'ending', speaker: 'narrator',
    text: '「{{sixthOrganizationName}}」按确认名单并入江南，随后解散。成员得到稳定活动物资，原组织名停止更新。你没有把结束包装成胜利，也没有把它当作失败：没人被漏在旧群里，也没人被一张合并公告替着同意。',
    background: 'ending', music: 'afterOnline',
    presentation: {
      cg: cgPath('cg38-ending-route6'),
      cgAlt: '第六席通向江南的桥完全展开，首领徽章与确认后的名单留在平台上完成最后一次治理',
      ui: 'ending', transition: 'crossfade', camera: 'pull-back', atmosphere: 'paper', focus: 'right',
    },
    onEnter: [
      { type: 'unlockEnding', id: 'r6-merge-success' },
      { type: 'unlockCg', id: 'cg38-ending-route6' },
    ],
    next: 'worldline-check',
  },
  {
    id: 'r6-end-hollow-seat', chapter: 'epilogue', actLabel: '终幕 · 空心席位', date: '2026-07-28',
    title: '空心席位', location: '4945区', mode: 'ending', speaker: 'narrator',
    text: '你拒绝合并，席位因此没有立刻熄灭。可排班没人签，仓库见底，上一条公告也没有人愿意转发。「{{sixthOrganizationName}}」仍在组织列表里，群里最后一条消息是：“所以明天谁上线？”',
    background: 'ending', music: 'afterOnline',
    presentation: {
      cg: cgPath('cg38-ending-route6'),
      cgAlt: '第六席仍然亮着，窄桥收起，空章程和小钱袋却无人继续使用',
      ui: 'ending', transition: 'crossfade', camera: 'pull-back', atmosphere: 'dust', focus: 'center',
    },
    onEnter: [
      { type: 'unlockEnding', id: 'r6-hollow-seat' },
      { type: 'unlockCg', id: 'cg38-ending-route6' },
    ],
    next: 'worldline-check',
  },

  // ──────────────── 蝴蝶效应 · 变体结局 ────────────────
  {
    id: 'r6-end-shadow-seat',
    chapter: 'epilogue', actLabel: '隐藏 · 第七席', date: '2026-07-28',
    title: '第七席', location: '？？？', mode: 'ending', speaker: 'narrator',
    text: '第六席之外还有一个席位——没有挂在组织列表，没有在搜索结果里出现。它由六个旧组织里某个从未公开表态的人掌握。每天群里的公告在你看到之前，都先经过一版你看不到的修订。你仍在决定，只是先被决定了你的决定。',
    background: 'ending', music: 'afterOnline',
    presentation: {
      cg: cgPath('cg38-ending-route6'),
      cgAlt: '六个已知席位之外，昏暗屏幕上映出第七条无名的线，所有公告都经它折射后再抵达第六席',
      ui: 'ending-secret', transition: 'crossfade', camera: 'drift-left', atmosphere: 'none', focus: 'left',
    },
    onEnter: [
      { type: 'unlockEnding', id: 'r6-shadow-seat' },
      { type: 'unlockCg', id: 'cg38-ending-route6' },
    ],
    next: 'worldline-check',
  },
  {
    id: 'r6-end-united-front',
    chapter: 'epilogue', actLabel: '终幕 · 统一战线', date: '2026-07-28',
    title: '统一战线', location: '4945区', mode: 'ending', speaker: 'narrator',
    text: '旧组织之间的边界没有消失，却第一次在为同一件事签名时不再计较谁先开口问。江南收到你写的第一条不要求回报的支援公告，三组把它写进了谈判备忘，第五、第六组织的名字被列在同一行。4945区第一次在区群公告里使用"我们"。',
    background: 'ending', music: 'afterOnline',
    presentation: {
      cg: cgPath('cg38-ending-route6'),
      cgAlt: '六把椅子围着圆桌，各组织信物摆成环形，4945区公告栏首次出现六席联署的签名',
      ui: 'ending-triumph', transition: 'crossfade', camera: 'pull-back', atmosphere: 'petals', focus: 'center',
    },
    onEnter: [
      { type: 'unlockEnding', id: 'r6-united-front' },
      { type: 'unlockCg', id: 'cg38-ending-route6' },
    ],
    next: 'worldline-check',
  },
  {
    id: 'r6-end-anarchy-reigns',
    chapter: 'epilogue', actLabel: '终幕 · 混乱纪元', date: '2026-07-28',
    title: '混乱纪元', location: '4945区', mode: 'ending', speaker: 'narrator',
    text: '第六席在混乱中找到了一丝缝隙。没有人能统治4945区，但也没有人能在混乱中比你更快作出反应。你不再建立规则，只建立本能。秩序塌了，你仍在——代价是没有人相信明天还会和今天一样。',
    background: 'ending', music: 'afterOnline',
    presentation: {
      cg: cgPath('cg38-ending-route6'),
      cgAlt: '第六席在全区混乱中亮着孤灯，椅子面向无限刷新公告的屏幕，其他席位信号全灭',
      ui: 'ending-chaos', transition: 'glitch', camera: 'hold', atmosphere: 'danmaku', focus: 'center',
    },
    onEnter: [
      { type: 'unlockEnding', id: 'r6-anarchy-reigns' },
      { type: 'unlockCg', id: 'cg38-ending-route6' },
    ],
    next: 'worldline-check',
  },
] satisfies StoryNode[]
