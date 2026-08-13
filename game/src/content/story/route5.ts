import type { StoryNode } from '@/engine/types'

import { bondEndingNode } from './bondEnding'
import { cgPath } from '../cgAssets'

// 五组线把“战败后是否仍算存在”变成可玩问题；成员转移不自动等于组织死亡。
export const route5Nodes = [
  {
    id: 'r5-00-founded', chapter: 'prologue', actLabel: '序章 · 名字先留下', date: '2026-07-19',
    title: '未闻花名成立', location: '未闻花名 · 管理群', mode: 'chat', speaker: 'wenxian', portrait: 'wenxian',
    text: '首领栏已经写上你的名字。时和OguriC（小栗帽）先接高层，我盯成员名单。未闻花名——挺好，哪怕排在最后，世界频道念出来也像句悼词。',
    background: 'organization', music: 'groupChat', historical: 'adapted',
    presentation: {
      sprites: [
        { character: 'wenxian', expression: 'soft', pose: 'phone', position: 'left', scale: 1.02 },
        { character: 'oguri', expression: 'neutral', pose: 'thinking', position: 'right', scale: .98 },
      ],
    },
    onEnter: [
      { type: 'highCouncil', members: ['shi', 'oguri'] }, { type: 'stance', character: 'wenxian', value: 'support' },
      { type: 'relationship', character: 'wenxian', key: 'trust', value: 1 }, { type: 'relationship', character: 'oguri', key: 'trust', value: 1 },
    ], next: 'r5-01-shi-leaves',
  },
  {
    id: 'r5-01-shi-leaves', chapter: 'prologue', actLabel: '序章 · 名字先留下', date: '2026-07-19',
    title: '第一个空位', location: '成员列表', mode: 'system', speaker: 'system',
    text: '【成员变动】高层「时」退出未闻花名，并于7月19日加入二组江南。转组申请未填写公开理由。',
    background: 'aftermath', sound: 'notice', historical: 'confirmed',
    presentation: {
      cg: cgPath('cg25-route5-empty-seat'),
      cgAlt: '未闻花名成立不久，温陷与OguriC站在已经熄灭名牌的高层空椅旁',
      ui: 'cinematic',
      transition: 'crossfade',
      camera: 'pull-back',
      atmosphere: 'petals',
      focus: 'center',
    },
    onEnter: [
      { type: 'flag', key: 'shiJoinedOrg2OnJuly19' },
      { type: 'unlockCg', id: 'cg25-route5-empty-seat' },
    ],
    next: 'r5-01a-empty-seat-chat',
  },
  {
    id: 'r5-01a-empty-seat-chat', chapter: 'prologue', actLabel: '序章 · 名字先留下', date: '2026-07-19',
    location: '未闻花名 · 组织群', mode: 'chat', speaker: 'wenxian', portrait: 'wenxian',
    text: '退组提示刚弹出来，群里已经有人问了三个版本：吵架、挖人、拿错申请。我们现在唯一知道的是时走了；第四个版本别由我们来编。',
    background: 'organization', sound: 'message', historical: 'fictional',
    presentation: {
      sprites: [{ character: 'wenxian', expression: 'concerned', pose: 'phone', position: 'left', scale: 1.02 }],
    },
    next: 'r5-02-response-to-shi',
  },
  {
    id: 'r5-02-response-to-shi', chapter: 'prologue', actLabel: '序章 · 名字先留下', date: '2026-07-19',
    location: '五组组织群', mode: 'novel', speaker: 'wenxian', portrait: 'wenxian',
    text: '高层位空了。你要发一句话，我就置顶；你不发，我只改名单。只是群里已经有人把“正在输入”当成公告了。',
    background: 'organization',
    presentation: {
      cg: cgPath('cg25-route5-empty-seat'),
      cgAlt: '温陷与OguriC留在空出的高层席位旁，等待玩家决定怎样向成员解释时的离开',
      ui: 'classic',
      transition: 'crossfade',
      camera: 'push-in',
      atmosphere: 'petals',
      focus: 'left',
      sprites: [],
    },
    choices: [
      {
        id: 'friendly-farewell', label: '“时的申请我批了。祝他在二组玩得顺利。”', tone: 'warm',
        effects: [
          { type: 'flag', key: 'org5FriendlyFarewell' }, { type: 'organizationRelation', organization: 'org2', value: 1 },
          { type: 'relationship', character: 'wenxian', key: 'trust', value: 2 }, { type: 'relationship', character: 'wenxian', key: 'affinity', value: 1 },
          { type: 'butterflyDelta', key: 'bf_heart', delta: 1 },
        ], next: 'r5-02a-friendly-reply',
      },
      {
        id: 'call-disloyalty', label: '“刚开区就转走，我会把这当成背弃。”', tone: 'danger',
        effects: [
          { type: 'flag', key: 'org5BlamedShi' }, { type: 'stat', key: 'cohesion', value: 1 },
          { type: 'organizationRelation', organization: 'org2', value: -2 }, { type: 'relationship', character: 'wenxian', key: 'trust', value: -1 },
          { type: 'butterflyDelta', key: 'bf_cruelty', delta: 2 },
        ], next: 'r5-02b-blame-reply',
      },
      {
        id: 'quietly-update-roster', label: '把时移出高层名单，不追加公告', tone: 'calm',
        effects: [
          { type: 'stat', key: 'reputation', value: 1 },
          { type: 'butterflyDelta', key: 'bf_shadow', delta: 1 },
        ], next: 'r5-02c-quiet-reply',
      },
    ],
  },
  {
    // 时的离开先产生人物回应，后面再回收为五组如何理解“转组”。
    id: 'r5-02a-friendly-reply', chapter: 'prologue', actLabel: '序章 · 名字先留下', date: '2026-07-19',
    location: '未闻花名 · 组织群', mode: 'chat', speaker: 'wenxian', portrait: 'wenxian',
    text: '公告发了。有人问时以后还能不能回来，我回了“能”——今天批的是转组，不是把这个人从好友列表里删掉。',
    background: 'organization', historical: 'fictional', next: 'r5-03-fill-position',
  },
  {
    id: 'r5-02b-blame-reply', chapter: 'prologue', actLabel: '序章 · 名字先留下', date: '2026-07-19',
    location: '未闻花名 · 组织群', mode: 'chat', speaker: 'wenxian', portrait: 'wenxian',
    text: '我照原话置顶了。但今天我们把离开写成背弃，以后每个想换组的人都会先问：说实话会不会被挂在公告上。',
    background: 'organization', historical: 'fictional', next: 'r5-03-fill-position',
  },
  {
    id: 'r5-02c-quiet-reply', chapter: 'prologue', actLabel: '序章 · 名字先留下', date: '2026-07-19',
    location: '未闻花名 · 管理群', mode: 'chat', speaker: 'oguri', portrait: 'oguri',
    text: '名单改完了，公告没发。这能让我们不编理由，不能让群里停止猜。今晚先把空出来的班填上。',
    background: 'organization', historical: 'fictional',
    onEnter: [{ type: 'flag', key: 'org5QuietShiExit' }],
    next: 'r5-03-fill-position',
  },
  {
    id: 'r5-03-fill-position', chapter: 'prologue', actLabel: '序章 · 名字先留下', date: '2026-07-19',
    location: '管理私聊', mode: 'chat', speaker: 'oguri', portrait: 'oguri',
    text: '告白在招募频道回了十几个人，也问了两次权限。高层只能留两个名额；要给，就把职责一起说清。',
    background: 'organization',
    presentation: {
      sprites: [
        { character: 'oguri', expression: 'neutral', pose: 'thinking', position: 'left' },
        { character: 'gaobai', expression: 'determined', pose: 'command', position: 'right' },
      ],
    },
    choices: [
      {
        id: 'appoint-gaobai', label: '把告白拉进管理群：“第二个高层位给你。”', tone: 'bold',
        effects: [
          { type: 'flag', key: 'gaobaiEarlyExecutive' }, { type: 'highCouncil', members: ['oguri', 'gaobai'] },
          { type: 'relationship', character: 'gaobai', key: 'trust', value: 2 }, { type: 'stat', key: 'resources', value: 1 },
          { type: 'butterflyDelta', key: 'bf_loyalty', delta: 1 },
          { type: 'butterflyDelta', key: 'bf_chaos', delta: 1 },
        ], next: 'r5-03b-gaobai-appointed',
      },
      {
        id: 'trial-role', label: '“先负责招募，名单做出来再开权限。”', tone: 'calm',
        effects: [
          { type: 'flag', key: 'gaobaiTrialRole' }, { type: 'relationship', character: 'gaobai', key: 'trust', value: 1 },
          { type: 'relationship', character: 'oguri', key: 'trust', value: 1 },
          { type: 'butterflyDelta', key: 'bf_diplomacy', delta: 1 },
        ], next: 'r5-03c-gaobai-trial',
      },
      {
        id: 'keep-seat-open', label: '“位置先空着，我来顶这几天。”', tone: 'calm',
        effects: [
          { type: 'stat', key: 'cohesion', value: 1 }, { type: 'relationship', character: 'wenxian', key: 'trust', value: 1 },
          { type: 'butterflyDelta', key: 'bf_cruelty', delta: 1 },
        ],
        next: 'r5-03d-seat-kept-open',
      },
    ],
  },
  {
    id: 'r5-03b-gaobai-appointed', chapter: 'prologue', actLabel: '序章 · 名字先留下', date: '2026-07-19',
    location: '未闻花名 · 管理群', mode: 'chat', speaker: 'gaobai', portrait: 'gaobai',
    text: '权限收到。招募、点名、掉线补位我都接；以后名单缺人，别等到开战五分钟才告诉我。',
    background: 'organization', historical: 'fictional', next: 'r5-03a-gaobai-first-shift',
  },
  {
    id: 'r5-03c-gaobai-trial', chapter: 'prologue', actLabel: '序章 · 名字先留下', date: '2026-07-19',
    location: '未闻花名 · 管理群', mode: 'chat', speaker: 'gaobai', portrait: 'gaobai',
    text: '行，先不要徽章。我把招募表做到你们挑不出空格，到时候权限是结果，不是奖品。',
    background: 'organization', historical: 'fictional', next: 'r5-03a-gaobai-first-shift',
  },
  {
    id: 'r5-03d-seat-kept-open', chapter: 'prologue', actLabel: '序章 · 名字先留下', date: '2026-07-19',
    location: '未闻花名 · 管理群', mode: 'chat', speaker: 'oguri', portrait: 'oguri',
    text: '那就在第二席写“首领代班”。空着不等于没人做事，但每项没做完的事都会直接回到你这里。',
    background: 'organization', historical: 'fictional',
    onEnter: [{ type: 'flag', key: 'org5KeptCouncilSeatOpen' }],
    next: 'r5-03a-gaobai-first-shift',
  },
  {
    id: 'r5-03a-gaobai-first-shift', chapter: 'prologue', actLabel: '序章 · 名字先留下', date: '2026-07-19',
    location: '未闻花名 · 管理群', mode: 'chat', speaker: 'oguri', portrait: 'oguri',
    text: '我把告白的名字、职责和权限拆成三栏，按你刚才的决定填了。以后谁说“我以为他能管”，先让他看这张表。',
    background: 'organization', historical: 'fictional',
    presentation: {
      sprites: [{ character: 'oguri', expression: 'neutral', pose: 'thinking', position: 'left' }],
    },
    next: 'r5-04-world-enemy',
  },
  {
    id: 'r5-04-world-enemy', chapter: 'act1', actLabel: '第一幕 · 与世界为敌', date: '2026-07-20',
    title: '与世界为敌', location: '未闻花名 · 管理群', mode: 'chat', speaker: 'wenxian', portrait: 'wenxian',
    text: '四组转来一张被裁过的截图：能看见takemehand被辰逸禁言，也能看见争执后来卷进一、三、四组。开头缺了，辰逸心里想什么更没有。7月20日，世界频道先替所有人判完了。',
    background: 'worldChat', music: 'worldEnemy', historical: 'adapted',
    presentation: {
      cg: cgPath('cg27-world-enemy'),
      cgAlt: '7月20日，五组从外围看见辰逸把一场禁言争议扩散到一、三、四组',
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
    next: 'r5-04a-cropped-screenshot',
  },
  {
    id: 'r5-04a-cropped-screenshot', chapter: 'act1', actLabel: '第一幕 · 与世界为敌', date: '2026-07-20',
    location: '未闻花名 · 管理群', mode: 'chat', speaker: 'oguri', portrait: 'oguri',
    text: '我把截图按时间顺序存了，缺口标红。现在能确认的是谁用了权限、谁被禁言；“为什么”那一栏暂时空着。五组要不要表态，是另一件事。',
    background: 'worldChat', historical: 'fictional',
    presentation: {
      sprites: [{ character: 'oguri', expression: 'concerned', pose: 'thinking', position: 'left' }],
    },
    next: 'r5-05-neutrality',
  },
  {
    id: 'r5-05-neutrality', chapter: 'act1', actLabel: '第一幕 · 与世界为敌', date: '2026-07-20',
    location: '五组管理群', mode: 'novel', speaker: 'gaobai', portrait: 'gaobai',
    text: '他们都在看谁站哪边。五组现在弱，说一句话能换来保护，也能换来下一张点名截图。你选立场，我去看谁先急。',
    background: 'worldChat', choices: [
      {
        id: 'principled-neutral', label: '“谁滥用权限，五组就反对谁。”', tone: 'calm',
        effects: [
          { type: 'flag', key: 'org5PrincipledNeutrality' }, { type: 'stat', key: 'reputation', value: 1 },
          { type: 'relationship', character: 'wenxian', key: 'trust', value: 2 },
          { type: 'butterflyDelta', key: 'bf_diplomacy', delta: 1 },
          { type: 'butterflyDelta', key: 'bf_heart', delta: 1 },
        ], next: 'r5-05b-principled-reply',
      },
      {
        id: 'back-org1', label: '在世界频道跟帖：“请二组处理辰逸。”', tone: 'bold',
        effects: [
          { type: 'organizationRelation', organization: 'org1', value: 2 }, { type: 'organizationRelation', organization: 'org2', value: -2 },
          { type: 'relationship', character: 'qifu', key: 'trust', value: 1 },
          { type: 'butterflyDelta', key: 'bf_cruelty', delta: 1 },
        ], next: 'r5-05c-backed-org1',
      },
      {
        id: 'stay-silent', label: '关掉公告框：“今天先把日常打完。”', tone: 'calm',
        effects: [
          { type: 'stat', key: 'power', value: 1 }, { type: 'stat', key: 'reputation', value: -1 },
          { type: 'butterflyDelta', key: 'bf_shadow', delta: 1 },
        ],
        next: 'r5-05d-stayed-silent',
      },
    ],
  },
  {
    id: 'r5-05a-stance-posted', chapter: 'act1', actLabel: '第一幕 · 与世界为敌', date: '2026-07-20',
    location: '未闻花名 · 组织群', mode: 'chat', speaker: 'wenxian', portrait: 'wenxian',
    text: '我按你的意思处理了。群里第一个问题不是站队，是“今天日常还带吗”。我回了一个“带”——组织政治暂时输给体力。',
    background: 'worldChat', historical: 'fictional',
    presentation: {
      sprites: [{ character: 'wenxian', expression: 'soft', pose: 'phone', position: 'left', scale: 1.02 }],
    },
    next: 'r5-06-fixed-demotions',
  },
  {
    id: 'r5-05b-principled-reply', chapter: 'act1', actLabel: '第一幕 · 与世界为敌', date: '2026-07-20',
    location: '未闻花名 · 管理群', mode: 'chat', speaker: 'wenxian', portrait: 'wenxian',
    text: '公告发了：不站一组，也不站二组，谁滥用权限就反对谁。这句话今天对辰逸有效，以后对我们自己也得有效。',
    background: 'worldChat', historical: 'fictional',
    next: 'r5-05a-stance-posted',
  },
  {
    // 公开偏向一组会立刻改变五组在外界的责任边界。
    id: 'r5-05c-backed-org1', chapter: 'act1', actLabel: '第一幕 · 与世界为敌', date: '2026-07-20',
    location: '未闻花名 · 管理群', mode: 'chat', speaker: 'wenxian', portrait: 'wenxian',
    text: '祈福回了一句“收到”。但我们这句话一发，下一张截图里也会有五组的名字。日常我照带，外面问我们是不是跟一组绑在一起，得由你回。',
    background: 'worldChat', historical: 'fictional',
    onEnter: [{ type: 'flag', key: 'org5BackedOrg1' }],
    next: 'r5-05a-stance-posted',
  },
  {
    // 沉默分支保留练度收益，同时把公信力代价写成可见反应。
    id: 'r5-05d-stayed-silent', chapter: 'act1', actLabel: '第一幕 · 与世界为敌', date: '2026-07-20',
    location: '未闻花名 · 组织群', mode: 'chat', speaker: 'oguri', portrait: 'oguri',
    text: '公告框关了，我把日常进度表发到群里。里面的人知道今晚打什么，外面的人只会看见五组没说话；他们会自己填一个理由。',
    background: 'worldChat', historical: 'fictional',
    onEnter: [{ type: 'flag', key: 'org5StayedSilent' }],
    next: 'r5-05a-stance-posted',
  },
  {
    id: 'r5-06-fixed-demotions', chapter: 'act1', actLabel: '第一幕 · 与世界为敌', date: '2026-07-20',
    location: '未闻花名 · 管理群', mode: 'chat', speaker: 'oguri', portrait: 'oguri',
    text: '二组管理表刷新了：辰逸降为成员；岸因自己不想继续当高层，主动申请卸下职位；时和原普通成员大古补上空位。四个名字、三种原因，挤在同一行里最容易被讲成同一件事。',
    background: 'aftermath', historical: 'confirmed',
    presentation: {
      cg: cgPath('cg28-council-reshuffle'),
      cgAlt: '岸按自己的意愿放下高层徽章，时与此前的普通成员大古接过两个高层席位',
      ui: 'cinematic',
      transition: 'crossfade',
      camera: 'pull-back',
      atmosphere: 'dust',
      focus: 'center',
    },
    onEnter: [
      { type: 'flag', key: 'anVoluntarilySteppedDown' },
      { type: 'flag', key: 'shiAndDaiguPromoted' },
      { type: 'unlockCg', id: 'cg28-council-reshuffle' },
    ],
    next: 'r5-09-xilufei',
  },
  {
    id: 'r5-07-two-groups', chapter: 'act2', actLabel: '第二幕 · 两个官方群', date: '2026-07-21',
    location: '未闻花名 · 组织群', mode: 'chat', speaker: 'jianwen', portrait: 'jianwen',
    text: '群列表里现在有两个“4945官方群”。我翻了半天，没找到哪一个有游戏客服盖章。祈福把争议带进战区群，@全体用得太勤，自己的管理员也没保住。',
    background: 'twoGroups', historical: 'confirmed', next: 'r5-07a-kicked-window',
  },
  {
    id: 'r5-07a-kicked-window', chapter: 'act2', actLabel: '第二幕 · 两个官方群', date: '2026-07-21',
    location: '未闻花名 · 组织群', mode: 'chat', speaker: 'jianwen', portrait: 'jianwen',
    text: '我刚回到旧群就看见成员列表被清空，点进新群又看见“唯一官方”。两个官方群，合计零份官方认证；五组的人倒是同时在问去哪里看通知。',
    background: 'twoGroups', sound: 'message', historical: 'fictional',
    presentation: {
      sprites: [{ character: 'jianwen', expression: 'neutral', pose: 'phone', position: 'left' }],
    },
    // 前一天的立场在“两个官方群”问题中再次产生代价，然后回到原有选择。
    next: {
      cases: [
        { when: { type: 'flag', key: 'org5PrincipledNeutrality' }, next: 'r5-07b-neutral-echo' },
        { when: { type: 'flag', key: 'org5BackedOrg1' }, next: 'r5-07c-org1-echo' },
        { when: { type: 'flag', key: 'org5StayedSilent' }, next: 'r5-07d-silent-echo' },
      ],
      fallback: 'r5-08-choose-channel',
    },
  },
  {
    id: 'r5-07b-neutral-echo', chapter: 'act2', actLabel: '第二幕 · 两个官方群', date: '2026-07-21',
    location: '未闻花名 · 组织群', mode: 'chat', speaker: 'wenxian', portrait: 'wenxian',
    text: '昨天我们说不按站队判人，今天就不能因为谁把群名改成“官方”就跟谁。五组得有自己的入口。',
    background: 'twoGroups', historical: 'fictional', next: 'r5-08-choose-channel',
  },
  {
    id: 'r5-07c-org1-echo', chapter: 'act2', actLabel: '第二幕 · 两个官方群', date: '2026-07-21',
    location: '未闻花名 · 组织群', mode: 'chat', speaker: 'jianwen', portrait: 'jianwen',
    text: '旧群已经有人问“五组昨天不是跟一组表态了吗”。我们借到了一句话的分量，现在他们想连通知入口也一起定。',
    background: 'twoGroups', historical: 'fictional', next: 'r5-08-choose-channel',
  },
  {
    id: 'r5-07d-silent-echo', chapter: 'act2', actLabel: '第二幕 · 两个官方群', date: '2026-07-21',
    location: '未闻花名 · 组织群', mode: 'chat', speaker: 'oguri', portrait: 'oguri',
    text: '昨天沉默还能让我们先打完日常，今天两个群同时发通知，成员已经在问听哪个。这次不选，就是让他们各自选。',
    background: 'twoGroups', historical: 'fictional', next: 'r5-08-choose-channel',
  },
  {
    id: 'r5-08-choose-channel', chapter: 'act2', actLabel: '第二幕 · 两个官方群', date: '2026-07-21',
    location: '五组公告', mode: 'novel', speaker: 'wenxian', portrait: 'wenxian',
    text: '外面的群名可以一天改三次，五组不能一天换三套命令。你定一个入口，我把成员全拉回同一张值班表。', background: 'twoGroups',
    choices: [
      {
        id: 'own-announcement-source', label: '把五组公告置顶：“外群只收消息，这里才下命令。”', tone: 'calm',
        effects: [
          { type: 'flag', key: 'org5OwnAnnouncementSource' }, { type: 'stat', key: 'cohesion', value: 2 },
          { type: 'relationship', character: 'wenxian', key: 'trust', value: 2 }, { type: 'relationship', character: 'wenxian', key: 'affinity', value: 1 },
          { type: 'butterflyDelta', key: 'bf_loyalty', delta: 2 },
        ], next: 'r5-08a-own-source-reply',
      },
      {
        id: 'follow-old-group', label: '给旧区群设特别关注：“先跟这里的通知。”', tone: 'bold',
        effects: [
          { type: 'organizationRelation', organization: 'org1', value: 1 }, { type: 'stat', key: 'resources', value: 1 },
          { type: 'butterflyDelta', key: 'bf_loyalty', delta: 1 },
        ], next: 'r5-08b-old-group-reply',
      },
      {
        id: 'follow-new-group', label: '把二组新群置顶：“火2消息从这里对。”', tone: 'secret',
        effects: [
          { type: 'organizationRelation', organization: 'org2', value: 1 }, { type: 'stat', key: 'resources', value: 1 },
          { type: 'butterflyDelta', key: 'bf_shadow', delta: 1 },
        ], next: 'r5-08c-new-group-reply',
      },
    ],
  },
  {
    // 通知入口的选择先改变成员行为，再在火2战书前回收它的政治代价。
    id: 'r5-08a-own-source-reply', chapter: 'act2', actLabel: '第二幕 · 两个官方群', date: '2026-07-21',
    location: '未闻花名 · 组织群', mode: 'chat', speaker: 'wenxian', portrait: 'wenxian',
    text: '置顶了。旧群和新群的消息都可以转进来，但只有我们自己的值班表能让五组成员出发。',
    background: 'twoGroups', historical: 'fictional', next: 'r5-09b-xilufei-leaves',
  },
  {
    id: 'r5-08b-old-group-reply', chapter: 'act2', actLabel: '第二幕 · 两个官方群', date: '2026-07-21',
    location: '未闻花名 · 组织群', mode: 'chat', speaker: 'jianwen', portrait: 'jianwen',
    text: '旧群特别关注已经开了。好处是一组的消息来得快；坏处是以后他们每次@ 全体，五组都得解释为什么跟或者不跟。',
    background: 'twoGroups', historical: 'fictional',
    onEnter: [{ type: 'flag', key: 'org5FollowedOldGroup' }],
    next: 'r5-09b-xilufei-leaves',
  },
  {
    id: 'r5-08c-new-group-reply', chapter: 'act2', actLabel: '第二幕 · 两个官方群', date: '2026-07-21',
    location: '未闻花名 · 组织群', mode: 'chat', speaker: 'oguri', portrait: 'oguri',
    text: '新群放到最上面了。火2的在线和换人消息会更准，但我们若是从这里报他们的点，每次点开都会先看见对手的群名。',
    background: 'twoGroups', historical: 'fictional',
    onEnter: [{ type: 'flag', key: 'org5FollowedNewGroup' }],
    next: 'r5-09b-xilufei-leaves',
  },
  {
    id: 'r5-09-xilufei', chapter: 'act2', actLabel: '第二幕 · 两个官方群', date: '2026-07-20',
    location: '旧4945区群', mode: 'interlude', speaker: 'narrator',
    text: '7月20日，来自老区、到新区找乐子的希露菲向祈福谎称自己是组织高层，骗到区群管理员后，把所有能够移除的成员逐个踢出。五组没有参加争吵，群聊入口却照样在眼前清空。',
    background: 'twoGroups', historical: 'confirmed',
    presentation: {
      cg: cgPath('cg14-xilufei-explosion'),
      cgAlt: '希露菲向祈福骗到群管理员权限，清空所有能够移除的区群成员',
      transition: 'glitch', atmosphere: 'paper', focus: 'center',
    },
    onEnter: [
      { type: 'flag', key: 'xilufeiExplodedOldGroup' },
      { type: 'unlockCg', id: 'cg14-xilufei-explosion' },
    ],
    next: 'r5-07-two-groups',
  },
  {
    // 爆群发生在20日；拒战与退出发生在21日，拆分后避免同一节点承担两个日期。
    id: 'r5-09b-xilufei-leaves', chapter: 'act2', actLabel: '第二幕 · 两个官方群', date: '2026-07-21',
    location: '二组新群', mode: 'system', speaker: 'system',
    text: '【成员变动】希露菲试图拱火二组向一组宣战，江南首领拒绝开战。7月21日，希露菲退出二组群，随后退出二组江南。',
    background: 'twoGroups', historical: 'confirmed',
    onEnter: [{ type: 'flag', key: 'xilufeiLeftOrg2OnJuly21' }],
    next: 'r5-09c-after-exit',
  },
  {
    id: 'r5-09c-after-exit', chapter: 'act2', actLabel: '第二幕 · 两个官方群', date: '2026-07-21',
    location: '未闻花名 · 组织群', mode: 'chat', speaker: 'jianwen', portrait: 'jianwen',
    text: '我把两条通知分开记了：先退群，后退组织。群里有人只截了第一条，已经在问她是不是还在二组——截图总能比当事人多留半条命。',
    background: 'twoGroups', historical: 'fictional',
    presentation: {
      sprites: [{ character: 'jianwen', expression: 'neutral', pose: 'thinking', position: 'left' }],
    },
    next: {
      cases: [
        { when: { type: 'flag', key: 'org5OwnAnnouncementSource' }, next: 'r5-09d-own-source-echo' },
        { when: { type: 'flag', key: 'org5FollowedOldGroup' }, next: 'r5-09e-old-group-echo' },
        { when: { type: 'flag', key: 'org5FollowedNewGroup' }, next: 'r5-09f-new-group-echo' },
      ],
      fallback: 'r5-10-fire-two-proposal',
    },
  },
  {
    id: 'r5-09d-own-source-echo', chapter: 'act2', actLabel: '第二幕 · 两个官方群', date: '2026-07-21',
    location: '未闻花名 · 公告', mode: 'chat', speaker: 'wenxian', portrait: 'wenxian',
    text: '两个外群都在转火2的消息，成员还是回到我们的公告下面问“打不打”。入口独立了，决定也得由我们自己做。',
    background: 'twoGroups', historical: 'fictional', next: 'r5-10-fire-two-proposal',
  },
  {
    id: 'r5-09e-old-group-echo', chapter: 'act2', actLabel: '第二幕 · 两个官方群', date: '2026-07-21',
    location: '旧4945区群', mode: 'chat', speaker: 'qifu', portrait: 'qifu',
    text: '火2的在线我会继续转，但五组要不要打，不能因为你关注了这个群就算我替你们答应。',
    background: 'twoGroups', historical: 'fictional', next: 'r5-10-fire-two-proposal',
  },
  {
    id: 'r5-09f-new-group-echo', chapter: 'act2', actLabel: '第二幕 · 两个官方群', date: '2026-07-21',
    location: '二组新群', mode: 'chat', speaker: 'gaobai', portrait: 'gaobai',
    text: '火2换人的表就在这里，情报够直接。现在问题是：我们要用他们的通知打他们的点，还是先把自己的名单做真。',
    background: 'twoGroups', historical: 'fictional', next: 'r5-10-fire-two-proposal',
  },
  {
    id: 'r5-10-fire-two-proposal', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-24',
    title: '告白的目标', location: '五组管理群', mode: 'chat', speaker: 'gaobai', portrait: 'gaobai',
    text: '江南首领拒绝让那名成员来道歉。那就火2见。第二次要塞我带主队，你只要告诉我：这份战书发不发。',
    background: 'warRoom', music: 'fortressNight', historical: 'adapted',
    presentation: {
      sprites: [{ character: 'gaobai', expression: 'determined', pose: 'command', position: 'right', scale: 1.03 }],
    },
    next: 'r5-10a-war-table',
  },
  {
    id: 'r5-10a-war-table', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-24',
    location: '未闻花名 · 战备语音', mode: 'chat', speaker: 'oguri', portrait: 'oguri',
    text: '主队表我核过：在线、替补和掉线补位都没告白说得那么满。公告一秒能发出去，一整队同时上线要每个人各自同意。',
    background: 'warRoom', sound: 'message', historical: 'fictional',
    presentation: {
      sprites: [
        { character: 'oguri', expression: 'concerned', pose: 'thinking', position: 'left' },
        { character: 'gaobai', expression: 'determined', pose: 'command', position: 'right', scale: 1.03 },
      ],
    },
    // 开区首日给告白的权限，在第二次要塞名单上变成具体后果。
    next: {
      cases: [
        { when: { type: 'flag', key: 'gaobaiEarlyExecutive' }, next: 'r5-10b-early-executive-echo' },
        { when: { type: 'flag', key: 'gaobaiTrialRole' }, next: 'r5-10c-trial-role-echo' },
        { when: { type: 'flag', key: 'org5KeptCouncilSeatOpen' }, next: 'r5-10d-open-seat-echo' },
      ],
      fallback: 'r5-11-council',
    },
  },
  {
    id: 'r5-10b-early-executive-echo', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-24',
    location: '未闻花名 · 战备语音', mode: 'chat', speaker: 'oguri', portrait: 'oguri',
    text: '告白从开区就有管理权限，这张主队表也是他定的。他可以直接换人，所以今晚“名单不够”不是招募员的抱怨，是高层要一起签的结论。',
    background: 'warRoom', historical: 'fictional', next: 'r5-11-council',
  },
  {
    id: 'r5-10c-trial-role-echo', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-24',
    location: '未闻花名 · 战备语音', mode: 'chat', speaker: 'gaobai', portrait: 'gaobai',
    text: '招募表我交了，空格也都标了原因。你当初说名单做出来再开权限；现在名单是真的，缺口也是真的，别只实现前半句。',
    background: 'warRoom', historical: 'fictional', next: 'r5-11-council',
  },
  {
    id: 'r5-10d-open-seat-echo', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-24',
    location: '未闻花名 · 战备语音', mode: 'chat', speaker: 'wenxian', portrait: 'wenxian',
    text: '第二席到现在还是你代班。告白做了招募，OguriC对了名单，最后判断打不打的工作没有第二个高层能替你接。',
    background: 'warRoom', historical: 'fictional', next: 'r5-11-council',
  },
  {
    id: 'r5-11-council', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-24',
    location: '五组管理群', mode: 'novel', speaker: 'oguri', portrait: 'oguri',
    text: '敢不敢不是战术指标。人数、在线和战力都差；如果真打，先定门槛，也先定这场失败由谁署名。',
    background: 'warRoom', choices: [
      {
        id: 'approve-with-threshold', label: '“名单达到门槛才点确认。”', tone: 'calm',
        effects: [
          { type: 'flag', key: 'org5ConditionalFireTwo' }, { type: 'stat', key: 'evidence', value: 1 },
          { type: 'relationship', character: 'oguri', key: 'trust', value: 2 }, { type: 'relationship', character: 'gaobai', key: 'trust', value: 1 },
          { type: 'butterflyDelta', key: 'bf_diplomacy', delta: 1 },
        ], next: 'r5-11b-threshold-reply',
      },
      {
        id: 'approve-glory', label: '“火2照打，输了我在公告里署名负责。”', tone: 'danger',
        effects: [
          { type: 'flag', key: 'org5GloryChallenge' }, { type: 'stat', key: 'cohesion', value: 1 },
          { type: 'relationship', character: 'gaobai', key: 'trust', value: 2 }, { type: 'relationship', character: 'oguri', key: 'trust', value: -1 },
          { type: 'butterflyDelta', key: 'bf_cruelty', delta: 1 }, { type: 'butterflyDelta', key: 'bf_heart', delta: 1 },
        ], next: 'r5-11c-glory-reply',
      },
      {
        id: 'change-target', label: '把目标改成普通要塞：“先拿得到的资源。”', tone: 'calm',
        effects: [
          { type: 'flag', key: 'org5ChangedTarget' }, { type: 'stat', key: 'resources', value: 2 },
          { type: 'relationship', character: 'oguri', key: 'trust', value: 2 }, { type: 'relationship', character: 'gaobai', key: 'trust', value: -2 },
          { type: 'butterflyDelta', key: 'bf_diplomacy', delta: 1 },
        ], next: 'r5-11d-change-target-reply',
      },
      {
        id: 'member-vote-fire-two', label: '把战力差和名单发群：“参战的人自己投。”', tone: 'warm',
        effects: [
          { type: 'flag', key: 'org5VotedFireTwo' }, { type: 'stat', key: 'reputation', value: 1 },
          { type: 'relationship', character: 'wenxian', key: 'trust', value: 1 },
          { type: 'butterflyDelta', key: 'bf_heart', delta: 1 }, { type: 'butterflyDelta', key: 'bf_chaos', delta: 1 },
        ], next: 'r5-11e-member-vote-reply',
      },
    ],
  },
  {
    // 战前四种管理方式分别落到名单、责任、目标和投票上。
    id: 'r5-11b-threshold-reply', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-24',
    location: '未闻花名 · 战备语音', mode: 'chat', speaker: 'oguri', portrait: 'oguri',
    text: '门槛写进表头：主队在线数、替补数、最低战力。明天差一个都算没到，别在倒计时里改口。',
    background: 'warRoom', historical: 'fictional', next: 'r5-11a-roll-call',
  },
  {
    id: 'r5-11c-glory-reply', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-24',
    location: '未闻花名 · 战备语音', mode: 'chat', speaker: 'gaobai', portrait: 'gaobai',
    text: '那就不撤。我负责把人带进场，你负责败了以后别把署名写成“全体决定”。',
    background: 'warRoom', historical: 'fictional', next: 'r5-11a-roll-call',
  },
  {
    id: 'r5-11d-change-target-reply', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-24',
    location: '未闻花名 · 战备语音', mode: 'chat', speaker: 'gaobai', portrait: 'gaobai',
    text: '改标我不同意，但会执行。明天拿到资源时别说这是火2的替代品；是你选了先让五组能继续报下一场。',
    background: 'warRoom', historical: 'fictional', next: 'r5-11a-roll-call',
  },
  {
    id: 'r5-11e-member-vote-reply', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-24',
    location: '未闻花名 · 组织群', mode: 'chat', speaker: 'wenxian', portrait: 'wenxian',
    text: '投票发了，战力差和缺口没藏。但最后点确认的人还是你；多数票能说明想打，不能替掉线的人上线。',
    background: 'warRoom', historical: 'fictional', next: 'r5-11a-roll-call',
  },
  {
    id: 'r5-11a-roll-call', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-24',
    location: '未闻花名 · 战备语音', mode: 'chat', speaker: 'oguri', portrait: 'oguri',
    text: '我按你刚才的口径重排了名单：主队、替补、掉线补位各一栏。七点五十看在线，不看群里谁把“必到”打了三个感叹号。',
    background: 'warRoom', historical: 'fictional',
    presentation: {
      sprites: [{ character: 'oguri', expression: 'determined', pose: 'command', position: 'center', scale: 1.02 }],
    },
    next: 'r5-12-readiness',
  },
  {
    id: 'r5-12-readiness', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-25',
    location: '未闻花名 · 战备语音', mode: 'chat', speaker: 'oguri', portrait: 'oguri',
    text: '开战前一小时，实际在线低于告白最初报的人数。三组、四组可以帮忙牵制，却不能把积分并到五组。我再点一次名，目标按你的决定锁。',
    background: 'warRoom',
    presentation: {
      sprites: [{ character: 'oguri', expression: 'concerned', pose: 'command', position: 'center', scale: 1.02 }],
    },
    // 前一天的战备决策在真实在线数出现后再次被检验。
    next: {
      cases: [
        { when: { type: 'flag', key: 'org5ChangedTarget' }, next: 'r5-12a-changed-target-echo' },
        { when: { type: 'flag', key: 'org5ConditionalFireTwo' }, next: 'r5-12b-threshold-echo' },
        { when: { type: 'flag', key: 'org5GloryChallenge' }, next: 'r5-12c-glory-echo' },
        { when: { type: 'flag', key: 'org5VotedFireTwo' }, next: 'r5-12d-vote-echo' },
      ],
      fallback: 'r5-13-last-confirmation',
    },
  },
  {
    id: 'r5-12a-changed-target-echo', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-25',
    location: '要塞报名界面', mode: 'chat', speaker: 'oguri', portrait: 'oguri',
    text: '普通要塞已经锁定，我把主队和替补都按资源点重排了。火2那边会说我们不敢来；结算时候，我们只看自己拿到了什么。',
    background: 'fortress', historical: 'fictional', next: 'r5-13a-final-order',
  },
  {
    id: 'r5-12b-threshold-echo', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-25',
    location: '要塞报名界面', mode: 'chat', speaker: 'oguri', portrait: 'oguri',
    text: '少两个主队，替补也只亮了一个头像。按昨天写的门槛，现在就该撤；你若要继续，先承认是你在最后一刻改了规则。',
    background: 'fortress', historical: 'fictional', next: 'r5-13-last-confirmation',
  },
  {
    id: 'r5-12c-glory-echo', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-25',
    location: '未闻花名 · 战备语音', mode: 'chat', speaker: 'gaobai', portrait: 'gaobai',
    text: '人没到齐，但我说过不撤。你的名字能写在败报上，不能补成战力；剩下的差距我进场后想办法。',
    background: 'fortress', historical: 'fictional', next: 'r5-13-last-confirmation',
  },
  {
    id: 'r5-12d-vote-echo', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-25',
    location: '未闻花名 · 组织群', mode: 'chat', speaker: 'wenxian', portrait: 'wenxian',
    text: '投赞成的人比现在在线的人多三个。我把两张名单并排发了：想打是真的，没上线也是真的。最后一步你来选。',
    background: 'fortress', historical: 'fictional', next: 'r5-13-last-confirmation',
  },
  {
    id: 'r5-13-last-confirmation', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-25',
    location: '要塞报名界面', mode: 'battle', speaker: 'wenxian', portrait: 'wenxian',
    text: '要塞界面只剩最后一次确认。现在取消，会留下截图；现在继续，也会留下截图。明天我们得向成员解释其中一张。',
    background: 'fortress',
    presentation: {
      sprites: [{ character: 'wenxian', expression: 'determined', pose: 'command', position: 'center', scale: 1.03 }],
    },
    choices: [
      {
        id: 'fight-fire-two', label: '按下确认：“火2不撤，责任写我名字。”', tone: 'bold',
        effects: [
          { type: 'flag', key: 'org5FoughtFireTwo' }, { type: 'stat', key: 'contribution', value: 2 },
          { type: 'relationship', character: 'wenxian', key: 'trust', value: 2 },
          { type: 'butterflyDelta', key: 'bf_cruelty', delta: 1 }, { type: 'butterflyDelta', key: 'bf_loyalty', delta: 1 },
        ], next: 'r5-13b-fight-call',
      },
      {
        id: 'withdraw-before-start', label: '撤掉火2报名，把队伍拉去资源点', tone: 'calm',
        effects: [
          { type: 'flag', key: 'org5WithdrewFireTwo' }, { type: 'stat', key: 'resources', value: 1 },
          { type: 'stat', key: 'reputation', value: -2 }, { type: 'relationship', character: 'gaobai', key: 'trust', value: -2 },
          { type: 'butterflyDelta', key: 'bf_diplomacy', delta: 1 },
        ], next: 'r5-13c-withdraw-call',
      },
      {
        id: 'counter-plan', label: '把联盟情报发给OguriC：“按这个时间差反打。”', tone: 'secret',
        condition: { type: 'all', conditions: [
          { type: 'stat', key: 'evidence', operator: 'gte', value: 1 }, { type: 'stat', key: 'resources', operator: 'gte', value: 2 },
        ] },
        effects: [
          { type: 'flag', key: 'org5UpsetFireTwo' }, { type: 'stat', key: 'resources', value: -2 },
          { type: 'stat', key: 'reputation', value: 2 }, { type: 'relationship', character: 'oguri', key: 'trust', value: 2 },
          { type: 'butterflyDelta', key: 'bf_shadow', delta: 1 }, { type: 'butterflyDelta', key: 'bf_chaos', delta: 1 },
        ], next: 'r5-13d-counter-call',
      },
    ],
  },
  {
    // 最后确认在结算前先让队友对玩家的命令作出现场反应。
    id: 'r5-13b-fight-call', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-25',
    location: '未闻花名 · 战备语音', mode: 'chat', speaker: 'gaobai', portrait: 'gaobai',
    text: '看见了，火2没撤。主队跟我进，替补盯着掉线位；输了公告写你的名字，进场以后命令听我的。',
    background: 'fortress', sound: 'warning', historical: 'fictional', next: 'r5-13a-final-order',
  },
  {
    id: 'r5-13c-withdraw-call', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-25',
    location: '未闻花名 · 战备语音', mode: 'chat', speaker: 'gaobai', portrait: 'gaobai',
    text: '撤标收到。我不会在语音里说这是胜利，但会把所有在线的人带去资源点。明天你得解释为什么今晚值得。',
    background: 'fortress', sound: 'notice', historical: 'fictional', next: 'r5-13a-final-order',
  },
  {
    id: 'r5-13d-counter-call', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-25',
    location: '未闻花名 · 战备语音', mode: 'chat', speaker: 'oguri', portrait: 'oguri',
    text: '时间差对上了，火2主队刚被三、四组的动向拉开。我现在发倒计时，这次不靠人多，靠我们比他们早十秒进门。',
    background: 'fortress', sound: 'warning', historical: 'fictional', next: 'r5-13a-final-order',
  },
  {
    id: 'r5-13a-final-order', chapter: 'act3', actLabel: '第三幕 · 第二次要塞', date: '2026-07-25',
    location: '未闻花名 · 战备语音', mode: 'chat', speaker: 'gaobai', portrait: 'gaobai',
    text: '目标锁了。主队按你刚才定的点进，掉线我直接换人。谁还有意见现在说；倒计时开始以后，世界频道会替我们总结。',
    background: 'fortress', sound: 'warning', historical: 'fictional',
    presentation: {
      sprites: [{ character: 'gaobai', expression: 'determined', pose: 'command', position: 'center', scale: 1.04 }],
    },
    // 战前现场统一承接“改标”和三种最终确认，随后按既有 flag 回到原结果分支。
    next: {
      cases: [
        { when: { type: 'flag', key: 'org5ChangedTarget' }, next: 'r5-14-alternate-result' },
        { when: { type: 'flag', key: 'org5WithdrewFireTwo' }, next: 'r5-14-alternate-result' },
        { when: { type: 'flag', key: 'org5UpsetFireTwo' }, next: 'r5-14-upset-result' },
      ],
      fallback: 'r5-14-default-defeat',
    },
  },
  {
    id: 'r5-14-default-defeat', chapter: 'act3', actLabel: '第三幕 · 火2战报', date: '2026-07-25',
    title: '挑战失败', location: '要塞结算界面', mode: 'battle', speaker: 'system',
    text: '【要塞结算】未闻花名挑战江南“火2”失败。三、四组的牵制改变了二组分兵，没有改变各组织独立结算。五组名称仍在，群里开始有人问下一场还报不报。',
    background: 'fortress', historical: 'confirmed',
    presentation: {
      cg: cgPath('cg29-second-fortress'),
      cgAlt: '五组挑战火2时，夏娜在城墙上调动江南防线应对多组织协同牵制',
      ui: 'cinematic',
      transition: 'flash',
      camera: 'pull-back',
      atmosphere: 'embers',
      focus: 'left',
    },
    onEnter: [
      { type: 'flag', key: 'org5LostFireTwo' },
      { type: 'stat', key: 'cohesion', value: -1 },
      { type: 'unlockCg', id: 'cg29-second-fortress' },
    ],
    next: 'r5-14a-after-report',
  },
  {
    id: 'r5-14-alternate-result', chapter: 'act3', actLabel: '第三幕 · 改换目标', date: '2026-07-25',
    title: '另一张战报', location: '要塞结算界面', mode: 'system', speaker: 'system',
    text: '【要塞结算】五组没有在火2留下失败记录，资源点正常结算。世界频道把临时换标截成了“临阵退缩”，一张没有比分的图照样被当成战报。',
    background: 'aftermath', historical: 'fictional', next: 'r5-14a-after-report',
  },
  {
    id: 'r5-14-upset-result', chapter: 'act3', actLabel: '第三幕 · 火2奇袭', date: '2026-07-25',
    title: '一次昂贵的胜利', location: '要塞结算界面', mode: 'battle', speaker: 'system',
    text: '【要塞结算】五组利用时间差与情报短暂拿下火2。盟友积分仍未并入五组；可调资源几乎耗尽，胜利截图已经先于补给表传遍区群。',
    background: 'fortress', historical: 'fictional',
    presentation: {
      cg: cgPath('cg29-second-fortress'),
      cgAlt: '火2三条战线同时交错，五组利用时间差从夏娜指挥的防线中完成一次昂贵反制',
      ui: 'cinematic',
      transition: 'flash',
      camera: 'push-in',
      atmosphere: 'embers',
      focus: 'left',
    },
    onEnter: [
      { type: 'unlockCg', id: 'cg05-fortress' },
      { type: 'unlockCg', id: 'cg29-second-fortress' },
    ],
    next: 'r5-14a-after-report',
  },
  {
    id: 'r5-14a-after-report', chapter: 'act3', actLabel: '第三幕 · 火2战报', date: '2026-07-25',
    location: '未闻花名 · 组织群', mode: 'chat', speaker: 'wenxian', portrait: 'wenxian',
    text: '战报已经被转了三遍。有人问我们下一场还报不报名，没人先问今天到底赢了什么、又丢了什么——截图标题替他们省了这一步。',
    background: 'aftermath', historical: 'fictional',
    presentation: {
      sprites: [{ character: 'wenxian', expression: 'sad', pose: 'phone', position: 'center', scale: 1.02 }],
    },
    next: 'r5-15-merger-offer',
  },
  {
    id: 'r5-15-merger-offer', chapter: 'act4', actLabel: '第四幕 · 部分合并', date: '2026-07-26',
    location: '三组首领私聊', mode: 'chat', speaker: 'heartbeat', portrait: 'heartbeat',
    text: 'OguriC和告白已经来问三组的位置。人可以转，合作也可以谈；三组不会把“两个成员申请”写成“五组全体收购”。你若真想结束未闻花名，得由你自己递申请。',
    background: 'aftermath',
    // 时在开区首日的离开，成为玩家处理第二次转组时的公开先例。
    next: {
      cases: [
        { when: { type: 'flag', key: 'org5FriendlyFarewell' }, next: 'r5-15a-friendly-transfer-echo' },
        { when: { type: 'flag', key: 'org5BlamedShi' }, next: 'r5-15b-blame-transfer-echo' },
        { when: { type: 'flag', key: 'org5QuietShiExit' }, next: 'r5-15c-quiet-transfer-echo' },
      ],
      fallback: 'r5-16-merger-decision',
    },
  },
  {
    id: 'r5-15a-friendly-transfer-echo', chapter: 'act4', actLabel: '第四幕 · 部分合并', date: '2026-07-26',
    location: '未闻花名 · 管理群', mode: 'chat', speaker: 'wenxian', portrait: 'wenxian',
    text: '时走的时候，你说转组不等于删掉一个人。今天这句话也得算数：OguriC和告白可以走，但五组怎么活不该由他们的退组提示代答。',
    background: 'aftermath', historical: 'fictional', next: 'r5-16-merger-decision',
  },
  {
    id: 'r5-15b-blame-transfer-echo', chapter: 'act4', actLabel: '第四幕 · 部分合并', date: '2026-07-26',
    location: '未闻花名 · 管理群', mode: 'chat', speaker: 'oguri', portrait: 'oguri',
    text: '时走时我们把“背弃”置顶过。现在轮到我和告白，你可以继续用同一个词，但别一边说是背叛，一边又把我们的转组当成合并筹码。',
    background: 'aftermath', historical: 'fictional', next: 'r5-16-merger-decision',
  },
  {
    id: 'r5-15c-quiet-transfer-echo', chapter: 'act4', actLabel: '第四幕 · 部分合并', date: '2026-07-26',
    location: '未闻花名 · 管理群', mode: 'chat', speaker: 'jianwen', portrait: 'jianwen',
    text: '时的那一行名单是安静删掉的，到现在群里还有三种理由。这次要是仍然只改名单，“个人转组”和“五组并入”会在一个晚上被传成同一件事。',
    background: 'aftermath', historical: 'fictional', next: 'r5-16-merger-decision',
  },
  {
    id: 'r5-16-merger-decision', chapter: 'act4', actLabel: '第四幕 · 部分合并', date: '2026-07-26',
    location: '五组管理群', mode: 'novel', speaker: 'oguri', portrait: 'oguri',
    text: '我去三组，战力更容易跟上。告白也准备走。你可以反对，可以谈条件，也可以提交全并方案；但别把我们的个人申请写成五组已经消失。',
    background: 'aftermath',
    presentation: {
      sprites: [
        { character: 'oguri', expression: 'neutral', pose: 'relaxed', position: 'left' },
        { character: 'wenxian', expression: 'sad', pose: 'base', position: 'right', scale: 1.02 },
      ],
    },
    choices: [
      {
        id: 'allow-personal-transfer', label: '“转组是你们自己的决定，五组名单我继续开。”', tone: 'calm',
        effects: [
          { type: 'flag', key: 'org5PartialTransfer' }, { type: 'organizationRelation', organization: 'org3', value: 2 },
          { type: 'relationship', character: 'oguri', key: 'trust', value: 2 }, { type: 'stat', key: 'resources', value: -1 },
          { type: 'butterflyDelta', key: 'bf_heart', delta: 1 },
        ], next: 'r5-16a-personal-transfer-reply',
      },
      {
        id: 'conditional-alliance', label: '“人可以去，但保护、情报和边界写进协议。”', tone: 'warm',
        effects: [
          { type: 'flag', key: 'org5ConditionalAlliance' }, { type: 'organizationRelation', organization: 'org3', value: 2 },
          { type: 'stat', key: 'resources', value: 2 }, { type: 'stat', key: 'reputation', value: -1 },
          { type: 'butterflyDelta', key: 'bf_diplomacy', delta: 2 },
        ], next: 'r5-16b-alliance-terms-reply',
      },
      {
        id: 'refuse-transfer', label: '“我不同意。再给五组一周，留下来重建。”', tone: 'bold',
        effects: [
          { type: 'flag', key: 'org5BlockedTransfer' }, { type: 'stat', key: 'power', value: 1 },
          { type: 'relationship', character: 'oguri', key: 'trust', value: -3 }, { type: 'relationship', character: 'gaobai', key: 'trust', value: -2 },
          { type: 'butterflyDelta', key: 'bf_cruelty', delta: 1 }, { type: 'butterflyDelta', key: 'bf_loyalty', delta: 1 },
        ], next: 'r5-16c-block-transfer-reply',
      },
      {
        id: 'full-merge-org3', label: '“统计全组意愿，我们向三组递并入申请。”', tone: 'danger',
        effects: [
          { type: 'flag', key: 'org5FullMerge' }, { type: 'stat', key: 'cohesion', value: -2 },
          { type: 'organizationRelation', organization: 'org3', value: 2 },
          { type: 'butterflyDelta', key: 'bf_diplomacy', delta: 1 },
        ], next: 'r5-16d-full-merge-reply',
      },
    ],
  },
  {
    // 转组决策分清“个人申请”与“组织方案”，避免四个选项都像同意合并。
    id: 'r5-16a-personal-transfer-reply', chapter: 'act4', actLabel: '第四幕 · 部分合并', date: '2026-07-26',
    location: '未闻花名 · 管理群', mode: 'chat', speaker: 'oguri', portrait: 'oguri',
    text: '谢谢。我和告白只带走自己的账号，不带走五组的名字。招募表和掉线补位我会交清，你要继续开名单，就别把空位藏起来。',
    background: 'aftermath', historical: 'fictional', next: 'r5-17-after-transfer',
  },
  {
    id: 'r5-16b-alliance-terms-reply', chapter: 'act4', actLabel: '第四幕 · 部分合并', date: '2026-07-26',
    location: '三五组首领私聊', mode: 'chat', speaker: 'heartbeat', portrait: 'heartbeat',
    text: '条件可以谈。人进三组后按三组名单出战，但五组的情报不会被我当入组费；保护和退出边界今晚写成文本。',
    background: 'aftermath', historical: 'fictional', next: 'r5-17-after-transfer',
  },
  {
    id: 'r5-16c-block-transfer-reply', chapter: 'act4', actLabel: '第四幕 · 部分合并', date: '2026-07-26',
    location: '未闻花名 · 管理群', mode: 'chat', speaker: 'oguri', portrait: 'oguri',
    text: '你不同意，我听见了。但这是我自己的账号，申请已经递了；你可以把重建计划发给每个人，不能把“首领不同意”当成锁住成员的权限。',
    background: 'aftermath', historical: 'fictional', next: 'r5-17-after-transfer',
  },
  {
    id: 'r5-16d-full-merge-reply', chapter: 'act4', actLabel: '第四幕 · 部分合并', date: '2026-07-26',
    location: '三五组首领私聊', mode: 'chat', speaker: 'heartbeat', portrait: 'heartbeat',
    text: '先收意愿表，再收并入申请。我不会因为OguriC和告白先进来，就把其他人默认成同意；每个留下的名字都得自己勾一次。',
    background: 'aftermath', historical: 'fictional', next: 'r5-17-after-transfer',
  },
  {
    id: 'r5-17-after-transfer', chapter: 'act4', actLabel: '第四幕 · 部分合并', date: '2026-07-26',
    location: '未闻花名 · 管理群', mode: 'chat', speaker: 'jianwen', portrait: 'jianwen',
    text: '名单刚刷新：OguriC与告白于7月26日转入三组。系统里的五组仍然存在；温陷把管理权限交给我一起值班。至于保留、结盟还是并入，你刚提交的方案还在等最后落地。',
    background: 'aftermath', historical: 'confirmed',
    presentation: {
      cg: cgPath('cg33-partial-transfer'),
      cgAlt: 'OguriC和告白各自走向三组，温陷留在未闻花名门口维持仍然存在的五组',
      ui: 'cinematic',
      transition: 'crossfade',
      camera: 'pull-back',
      atmosphere: 'petals',
      focus: 'right',
    },
    onEnter: [
      { type: 'flag', key: 'jianwenBecameOrg5Executive' },
      { type: 'highCouncil', members: ['wenxian', 'jianwen'] },
      { type: 'unlockCg', id: 'cg33-partial-transfer' },
    ],
    next: 'r5-17a-jianwen-handover',
  },
  {
    id: 'r5-17a-jianwen-handover', chapter: 'act4', actLabel: '第四幕 · 部分合并', date: '2026-07-26',
    location: '未闻花名 · 管理群', mode: 'chat', speaker: 'jianwen', portrait: 'jianwen',
    text: '成员名单少了两行，待办多了四项：公告、招募、值班、下一场报名。我和温陷一人接两项。五组要是只剩名字，至少不是因为今天没人点“保存”。',
    background: 'aftermath', historical: 'fictional',
    presentation: {
      sprites: [
        { character: 'jianwen', expression: 'neutral', pose: 'command', position: 'left' },
        { character: 'wenxian', expression: 'soft', pose: 'phone', position: 'right', scale: 1.02 },
      ],
    },
    // 名单实际变动后，让前一场的组织方案产生可见结果。
    next: {
      cases: [
        { when: { type: 'flag', key: 'org5PartialTransfer' }, next: 'r5-17b-personal-transfer-echo' },
        { when: { type: 'flag', key: 'org5ConditionalAlliance' }, next: 'r5-17c-alliance-echo' },
        { when: { type: 'flag', key: 'org5BlockedTransfer' }, next: 'r5-17d-blocked-echo' },
        { when: { type: 'flag', key: 'org5FullMerge' }, next: 'r5-17e-full-merge-echo' },
      ],
      fallback: 'r5-18-wenxian-question',
    },
  },
  {
    id: 'r5-17b-personal-transfer-echo', chapter: 'act4', actLabel: '第四幕 · 部分合并', date: '2026-07-26',
    location: '未闻花名 · 管理群', mode: 'chat', speaker: 'jianwen', portrait: 'jianwen',
    text: '两个人转组，五组名单继续开放，我分开写了。今晚缺的是两个值班人，不是一张组织死亡证明。',
    background: 'aftermath', historical: 'fictional', next: 'r5-18-wenxian-question',
  },
  {
    id: 'r5-17c-alliance-echo', chapter: 'act4', actLabel: '第四幕 · 部分合并', date: '2026-07-26',
    location: '三五组协议群', mode: 'chat', speaker: 'wenxian', portrait: 'wenxian',
    text: '保护、情报、退出条款都写好了。五组少了两个人，多了一条可以追责的边界；这不是合并，是我们为转组买的保险。',
    background: 'aftermath', historical: 'fictional', next: 'r5-18-wenxian-question',
  },
  {
    id: 'r5-17d-blocked-echo', chapter: 'act4', actLabel: '第四幕 · 部分合并', date: '2026-07-26',
    location: '未闻花名 · 管理群', mode: 'chat', speaker: 'jianwen', portrait: 'jianwen',
    text: '你的反对没有拦住个人申请，却把重建承诺留在了公告里。我们会按那句“再给一周”排班；七天后，它得有一个能查的结果。',
    background: 'aftermath', historical: 'fictional', next: 'r5-18-wenxian-question',
  },
  {
    id: 'r5-17e-full-merge-echo', chapter: 'act4', actLabel: '第四幕 · 部分合并', date: '2026-07-26',
    location: '未闻花名 · 管理群', mode: 'chat', speaker: 'wenxian', portrait: 'wenxian',
    text: '全并意愿表已经发出去了，还没收齐。在三组正式回复前，未闻花名仍然需要值班、招募和一个会回消息的首领。',
    background: 'aftermath', historical: 'fictional', next: 'r5-18-wenxian-question',
  },
  {
    id: 'r5-18-wenxian-question', chapter: 'act4', actLabel: '第四幕 · 部分合并', date: '2026-07-27',
    location: '五组首领私聊', mode: 'chat', speaker: 'wenxian', portrait: 'wenxian',
    text: '人少以后，群里每一句“还打吗”都像在问“还活吗”。维持组织我能做；可如果你也想留下，别让我从在线状态里猜。',
    background: 'nightMessage',
    presentation: {
      sprites: [{ character: 'wenxian', expression: 'concerned', pose: 'thinking', position: 'center', scale: 1.03 }],
    },
    choices: [
      {
        id: 'stay-together', label: '“我留下，不把你当维持器。”', tone: 'warm',
        effects: [
          { type: 'flag', key: 'playerPromisedOrg5Stay' }, { type: 'relationship', character: 'wenxian', key: 'trust', value: 3 },
          { type: 'relationship', character: 'wenxian', key: 'affinity', value: 3 },
          { type: 'relationshipProgress', character: 'wenxian', value: 70 }, { type: 'stat', key: 'cohesion', value: 1 },
          { type: 'butterflyDelta', key: 'bf_heart', delta: 2 },
        ], next: 'r5-18a-stay-reply',
      },
      {
        id: 'give-operational-control', label: '“你来定日常，我承担对外结果。”', tone: 'calm',
        effects: [
          { type: 'relationship', character: 'wenxian', key: 'trust', value: 3 }, { type: 'stat', key: 'cohesion', value: 1 },
          { type: 'butterflyDelta', key: 'bf_loyalty', delta: 1 }, { type: 'butterflyDelta', key: 'bf_diplomacy', delta: 1 },
        ], next: 'r5-18b-operational-reply',
      },
      {
        id: 'admit-exhaustion', label: '“我撑不住了。但交接做完前，我不会消失。”', tone: 'secret',
        effects: [
          { type: 'flag', key: 'org5PlannedHandoff' }, { type: 'relationship', character: 'wenxian', key: 'trust', value: 2 },
          { type: 'stat', key: 'reputation', value: 1 },
          { type: 'butterflyDelta', key: 'bf_heart', delta: 1 }, { type: 'butterflyDelta', key: 'bf_shadow', delta: 1 },
        ], next: 'r5-18c-handoff-reply',
      },
    ],
  },
  {
    // 首领是否留下的答案先改变温陷的反应，再改变尾声值班方式。
    id: 'r5-18a-stay-reply', chapter: 'act4', actLabel: '第四幕 · 部分合并', date: '2026-07-27',
    location: '五组首领私聊', mode: 'chat', speaker: 'wenxian', portrait: 'wenxian',
    text: '好。那我不用再把“你还在线”当成一次偶然。明天我留两个位置：一个给首领，一个给不想只当首领的你。',
    background: 'nightMessage', historical: 'fictional', next: 'r5-19-gaobai-moves-again',
  },
  {
    id: 'r5-18b-operational-reply', chapter: 'act4', actLabel: '第四幕 · 部分合并', date: '2026-07-27',
    location: '五组首领私聊', mode: 'chat', speaker: 'wenxian', portrait: 'wenxian',
    text: '可以。日常、值班和招募由我定，对外承诺由你签。但你不能只在失败时出现；我发表的时候，你也得回一句“看到了”。',
    background: 'nightMessage', historical: 'fictional',
    onEnter: [{ type: 'flag', key: 'org5SharedOperationsWithWenxian' }],
    next: 'r5-19-gaobai-moves-again',
  },
  {
    id: 'r5-18c-handoff-reply', chapter: 'act4', actLabel: '第四幕 · 部分合并', date: '2026-07-27',
    location: '五组首领私聊', mode: 'chat', speaker: 'wenxian', portrait: 'wenxian',
    text: '这比突然灰掉头像好。你把交接做完，我就不用一边猜你是不是走了，一边替你继续发首领公告。明天先把账算清。',
    background: 'nightMessage', historical: 'fictional', next: 'r5-19-gaobai-moves-again',
  },
  {
    id: 'r5-19-gaobai-moves-again', chapter: 'epilogue', actLabel: '尾声 · 第二次转组', date: '2026-07-28',
    location: '成员列表', mode: 'interlude', speaker: 'narrator',
    text: '7月28日，告白在加入三组两天后转入一组；直接原因没有公开。同一天，二组的辰逸因一天未上线且自己不想继续玩而被移出组织，没有新的冲突，只有一次普通退游。',
    background: 'nightMessage', historical: 'confirmed', onEnter: [{ type: 'flag', key: 'chenyiRemovedInactiveOnJuly28' }],
    next: 'r5-19a-two-roster-rows',
  },
  {
    id: 'r5-19a-two-roster-rows', chapter: 'epilogue', actLabel: '尾声 · 第二次转组', date: '2026-07-28',
    location: '未闻花名 · 管理群', mode: 'chat', speaker: 'jianwen', portrait: 'jianwen',
    text: '我把两条记录分开写：告白转一组，原因未知；辰逸一天没上线，也不想继续玩。别拿一个人的空白，去填另一个人的理由。',
    background: 'nightMessage', historical: 'fictional',
    presentation: {
      sprites: [{ character: 'jianwen', expression: 'neutral', pose: 'thinking', position: 'center' }],
    },
    next: {
      cases: [
        { when: { type: 'flag', key: 'playerPromisedOrg5Stay' }, next: 'r5-19b-stay-echo' },
        { when: { type: 'flag', key: 'org5SharedOperationsWithWenxian' }, next: 'r5-19c-operations-echo' },
        { when: { type: 'flag', key: 'org5PlannedHandoff' }, next: 'r5-19d-handoff-echo' },
      ],
      fallback: 'r5-20-member-night-hub',
    },
  },
  {
    id: 'r5-19b-stay-echo', chapter: 'epilogue', actLabel: '尾声 · 第二次转组', date: '2026-07-28',
    location: '未闻花名 · 管理群', mode: 'chat', speaker: 'jianwen', portrait: 'jianwen',
    text: '告白的名字又换了一行，你的还在原位。我把明天的值班表按“留下”来排，不按“暂时没退群”来排。',
    background: 'nightMessage', historical: 'fictional', next: 'r5-20-member-night-hub',
  },
  {
    id: 'r5-19c-operations-echo', chapter: 'epilogue', actLabel: '尾声 · 第二次转组', date: '2026-07-28',
    location: '未闻花名 · 管理群', mode: 'chat', speaker: 'wenxian', portrait: 'wenxian',
    text: '明天日常和招募我已经排了，对外公告留着你的署名栏。这次不是把事全丢给我，是把两种责任分开以后都留了人。',
    background: 'nightMessage', historical: 'fictional', next: 'r5-20-member-night-hub',
  },
  {
    id: 'r5-19d-handoff-echo', chapter: 'epilogue', actLabel: '尾声 · 第二次转组', date: '2026-07-28',
    location: '未闻花名 · 管理群', mode: 'chat', speaker: 'wenxian', portrait: 'wenxian',
    text: '交接表的最后一页收到了。你的头像还亮着，但我不再用它猜你明天会不会继续当首领；工作已经有了可以接住的人。',
    background: 'nightMessage', historical: 'fictional', next: 'r5-20-member-night-hub',
  },
  {
    // 夜话事件以已读旗标防止重复刷关系值；每段回应后都会回到同一个成员列表。
    id: 'r5-20-member-night-hub', chapter: 'epilogue', actLabel: '尾声 · 成员夜话', date: '2026-07-28',
    location: '未闻花名 · 夜间在线', mode: 'chat', speaker: 'jianwen', portrait: 'jianwen',
    text: '剑问把在线列表和跨组私聊截成一张很窄的图：“温陷和我还在线；告白转组前留下的交接草稿，也刚从一组那边补来一句批注。你想听谁的就点开，其他话留到明晚。”',
    background: 'nightMessage', historical: 'fictional',
    presentation: { sprites: [{ character: 'jianwen', expression: 'soft', pose: 'phone', position: 'center', scale: 1.03 }] },
    choices: [
      {
        id: 'night-wenxian', label: '去看温陷一直亮着的输入框', tone: 'warm',
        condition: { type: 'flag', key: 'r5NightWenxianSeen', value: false },
        effects: [], next: 'r5-20a-wenxian-night',
      },
      {
        id: 'night-gaobai', label: '打开告白转组前留下的招募交接稿', tone: 'calm',
        condition: { type: 'flag', key: 'r5NightGaobaiSeen', value: false },
        effects: [], next: 'r5-20c-gaobai-night',
      },
      {
        id: 'night-jianwen', label: '接过剑问没做完的交接表', tone: 'secret',
        condition: { type: 'flag', key: 'r5NightJianwenSeen', value: false },
        effects: [], next: 'r5-20e-jianwen-night',
      },
      {
        id: 'finish-member-night', label: '结束夜话，回答那句只属于自己的邀请', tone: 'calm',
        effects: [], next: 'r5-20-bond-router',
      },
    ],
  },
  {
    id: 'r5-20a-wenxian-night', chapter: 'epilogue', actLabel: '成员夜话 · 温陷', date: '2026-07-28',
    location: '温陷私聊', mode: 'chat', speaker: 'wenxian', portrait: 'wenxian',
    text: '温陷终于发来那句删了三次的话：“如果未闻花名明天只剩两个人，你来，是因为组织还在，还是因为我还在？”',
    background: 'nightMessage', historical: 'fictional',
    presentation: { sprites: [{ character: 'wenxian', expression: 'soft', pose: 'phone', position: 'center', scale: 1.05 }] },
    choices: [
      {
        id: 'answer-both-remain', label: '“两个答案都是真的，我不拿其中一个遮住另一个。”', tone: 'warm',
        effects: [
          { type: 'flag', key: 'r5NightWenxianSeen' },
          { type: 'relationship', character: 'wenxian', key: 'trust', value: 1 },
          { type: 'relationship', character: 'wenxian', key: 'affinity', value: 1 },
          { type: 'relationshipProgress', character: 'wenxian', value: 30 },
        ], next: 'r5-20b-wenxian-reply',
      },
      {
        id: 'answer-tomorrow-first', label: '“先为了你来。组织能不能留下，我们上线后再做。”', tone: 'warm',
        effects: [
          { type: 'flag', key: 'r5NightWenxianSeen' },
          { type: 'relationship', character: 'wenxian', key: 'affinity', value: 2 },
          { type: 'relationshipProgress', character: 'wenxian', value: 30 },
        ], next: 'r5-20b-wenxian-reply',
      },
    ],
  },
  {
    id: 'r5-20b-wenxian-reply', chapter: 'epilogue', actLabel: '成员夜话 · 温陷', date: '2026-07-28',
    location: '温陷私聊', mode: 'chat', speaker: 'wenxian', portrait: 'wenxian',
    text: '她回了一个很轻的“好”，然后把明晚的集合时间从公告草稿挪进你们的私聊：“八点。群里那份叫排班，这份才叫约定。”',
    background: 'nightMessage', historical: 'fictional', next: 'r5-20-member-night-hub',
  },
  {
    id: 'r5-20c-gaobai-night', chapter: 'epilogue', actLabel: '成员夜话 · 告白', date: '2026-07-28',
    location: '告白 · 跨组私聊', mode: 'chat', speaker: 'gaobai', portrait: 'gaobai',
    text: '告白从一组私聊转来他在五组时留下的第五版招募交接稿，标题从“强力五组”改成“目前仍有人回消息”。他说：“人已经转了，旧稿还得交清楚。前四版太像广告，第五版像事故通报，你觉得哪种更像实话？”',
    background: 'nightMessage', historical: 'fictional',
    presentation: { sprites: [{ character: 'gaobai', expression: 'soft', pose: 'phone', position: 'center', scale: 1.03 }] },
    choices: [
      {
        id: 'keep-honest-copy', label: '“就用第五版。至少进来的人不会被胜率骗到。”', tone: 'calm',
        effects: [
          { type: 'flag', key: 'r5NightGaobaiSeen' },
          { type: 'relationship', character: 'gaobai', key: 'trust', value: 2 },
          { type: 'relationship', character: 'gaobai', key: 'affinity', value: 1 },
        ], next: 'r5-20d-gaobai-reply',
      },
      {
        id: 'add-one-promise', label: '在末尾加一句：“来的人不会只被当战力。”', tone: 'warm',
        effects: [
          { type: 'flag', key: 'r5NightGaobaiSeen' },
          { type: 'relationship', character: 'gaobai', key: 'trust', value: 1 },
          { type: 'relationship', character: 'gaobai', key: 'affinity', value: 2 },
        ], next: 'r5-20d-gaobai-reply',
      },
    ],
  },
  {
    id: 'r5-20d-gaobai-reply', chapter: 'epilogue', actLabel: '成员夜话 · 告白', date: '2026-07-28',
    location: '告白 · 跨组私聊', mode: 'chat', speaker: 'gaobai', portrait: 'gaobai',
    text: '“收到。”告白把交接稿存成“最终版6”，又补了一句：“我不替五组招新，但这份旧账该留干净。最终版之所以有数字，是因为我们对‘最终’一直保持谨慎。”',
    background: 'nightMessage', historical: 'fictional', next: 'r5-20-member-night-hub',
  },
  {
    id: 'r5-20e-jianwen-night', chapter: 'epilogue', actLabel: '成员夜话 · 剑问', date: '2026-07-28',
    location: '剑问白玉京私聊', mode: 'chat', speaker: 'jianwen', portrait: 'jianwen',
    text: '剑问把交接表的最后一格留空：“这里本来写‘负责人’，后来我觉得该写‘明天还愿意回消息的人’。前者像职位，后者比较难伪造。”',
    background: 'nightMessage', historical: 'fictional',
    presentation: { sprites: [{ character: 'jianwen', expression: 'soft', pose: 'thinking', position: 'center', scale: 1.03 }] },
    choices: [
      {
        id: 'sign-with-jianwen', label: '把自己的名字写在他旁边：“先签明天，后天再续。”', tone: 'warm',
        effects: [
          { type: 'flag', key: 'r5NightJianwenSeen' },
          { type: 'relationship', character: 'jianwen', key: 'trust', value: 2 },
          { type: 'relationship', character: 'jianwen', key: 'affinity', value: 1 },
        ], next: 'r5-20f-jianwen-reply',
      },
      {
        id: 'remove-owner-column', label: '“把负责人那栏删掉，任务后面写两个能互相提醒的人。”', tone: 'calm',
        effects: [
          { type: 'flag', key: 'r5NightJianwenSeen' },
          { type: 'relationship', character: 'jianwen', key: 'trust', value: 2 },
        ], next: 'r5-20f-jianwen-reply',
      },
    ],
  },
  {
    id: 'r5-20f-jianwen-reply', chapter: 'epilogue', actLabel: '成员夜话 · 剑问', date: '2026-07-28',
    location: '剑问白玉京私聊', mode: 'chat', speaker: 'jianwen', portrait: 'jianwen',
    text: '剑问保存表格：“这样最好。五组最不缺空职位，缺的是发现另一个人没上线时，先问一句而不是先写讣告的人。”',
    background: 'nightMessage', historical: 'fictional', next: 'r5-20-member-night-hub',
  },
  {
    id: 'r5-20-bond-router', chapter: 'epilogue', actLabel: '尾声 · 还在的人', date: '2026-07-28',
    location: '五组首领私聊', mode: 'chat', speaker: 'wenxian', portrait: 'wenxian',
    text: '名单刷新完了。我头像还亮着。你要是也没关游戏，就回我一句。', background: 'nightMessage',
    presentation: {
      sprites: [{ character: 'wenxian', expression: 'soft', pose: 'phone', position: 'center', scale: 1.03 }],
    },
    choices: [
      {
        id: 'choose-wenxian-bond', label: '“我还在线。明晚八点，也会在。”', tone: 'warm',
        condition: { type: 'all', conditions: [
          { type: 'flag', key: 'playerPromisedOrg5Stay' },
          { type: 'relationshipProgress', character: 'wenxian', operator: 'gte', value: 100 },
          { type: 'relationship', character: 'wenxian', key: 'trust', operator: 'gte', value: 5 },
          { type: 'relationship', character: 'wenxian', key: 'affinity', operator: 'gte', value: 4 },
        ] },
        effects: [], next: 'r5-21-bond-wenxian',
      },
      {
        id: 'keep-ordinary-relationship', label: '“名单收到了。今晚先以成员身份说晚安。”', tone: 'calm',
        effects: [], next: 'r5-22-ending-router',
      },
    ],
  },
  bondEndingNode({
    id: 'r5-21-bond-wenxian', actLabel: '尾声 · 明晚八点',
    location: '未闻花名组织群', character: 'wenxian',
    text: '他们都问五组还剩几个人。你问我明天几点上线。这个问题比较好回答。明晚八点——如果你提前来，我把只留给你的那句欢迎回来补上。',
    cg: cgPath('cg20-bond-wenxian'),
    cgAlt: '只亮着一盏灯的五组房间里，温陷守着两张椅子，等待玩家在约定时间回来',
    cgId: 'cg20-bond-wenxian',
    next: 'r5-22-ending-router',
  }),
  {
    id: 'r5-22-ending-router', chapter: 'epilogue', actLabel: '尾声 · 名字下面', date: '2026-07-28',
    location: '未闻花名 · 公告栏', mode: 'chat', speaker: 'wenxian', portrait: 'wenxian',
    text: '战报、转组和两张名单都在这里了。明天还要不要以“未闻花名”集合，我不替你写最后一句。',
    background: 'ending',
    presentation: {
      sprites: [{ character: 'wenxian', expression: 'determined', pose: 'command', position: 'center', scale: 1.04 }],
    },
    next: {
      cases: [
        // ── 蝴蝶效应 · 路线变体结局（使用不冲突的独立 flag）──
        { when: { type: 'flag', key: 'bf_anarchy' }, next: 'r5-end-chaos-bloom' },
        { when: { type: 'flag', key: 'bf_shadow_master' }, next: 'r5-end-hidden-garden' },
        { when: { type: 'flag', key: 'bf_cold_heart' }, next: 'r5-end-cold-bloom' },
        // ── 原有分流逻辑 ──
        { when: { type: 'flag', key: 'org5FullMerge' }, next: 'r5-end-name-only' },
        { when: { type: 'flag', key: 'org5ConditionalAlliance' }, next: 'r5-end-protected-flower' },
        { when: { type: 'flag', key: 'org5UpsetFireTwo' }, next: 'r5-end-fire-two-proof' },
      ], fallback: 'r5-end-still-here',
    },
  },
  {
    id: 'r5-end-still-here', chapter: 'epilogue', actLabel: '尾声 · 还在', date: '2026-07-28',
    title: '还在', location: '4945区', mode: 'ending', speaker: 'narrator',
    text: '五组输过、走过人，也被统计表提前宣布过死亡。温陷和剑问白玉京仍在组织里，下一场活动仍以未闻花名报名。你们没有证明弱者必胜，只证明“还在”本身需要每天重新完成。',
    background: 'ending', music: 'afterOnline',
    presentation: {
      cg: cgPath('cg37-ending-route5'),
      cgAlt: '未闻花名大厅里多数椅子已经暗下，桌上两杯茶与一盏花灯仍然温暖',
      ui: 'ending', transition: 'crossfade', camera: 'push-in', atmosphere: 'petals', focus: 'center',
    },
    onEnter: [
      { type: 'unlockEnding', id: 'r5-still-here' },
      { type: 'unlockCg', id: 'cg37-ending-route5' },
    ],
    next: 'worldline-check',
  },
  {
    id: 'r5-end-fire-two-proof', chapter: 'epilogue', actLabel: '尾声 · 火2证明', date: '2026-07-28',
    title: '火2证明', location: '4945区', mode: 'ending', speaker: 'narrator',
    text: '那次奇袭被转发得比任何解释都久。五组获得了声望，也花光了能复制胜利的资源。你们证明弱者可以赢一次；下一场的问题变成，能不能活到不再只靠证明。',
    background: 'ending', music: 'afterOnline',
    presentation: {
      cg: cgPath('cg37-ending-route5'),
      cgAlt: '破损的火2战报框仍挂在未闻花名大厅，花灯和一株新花证明组织活过了那次战斗',
      ui: 'ending', transition: 'flash', camera: 'drift-left', atmosphere: 'embers', focus: 'left',
    },
    onEnter: [
      { type: 'unlockEnding', id: 'r5-fire-two-proof' },
      { type: 'unlockCg', id: 'cg37-ending-route5' },
    ],
    next: 'worldline-check',
  },
  {
    id: 'r5-end-protected-flower', chapter: 'epilogue', actLabel: '尾声 · 有条件的花', date: '2026-07-28',
    title: '有条件的花', location: '4945区', mode: 'ending', speaker: 'narrator',
    text: '五组保留名称，三组提供保护与情报。有人说这只是延迟合并，你把每一条边界写进协议：成员可以转，积分不合并，首领仍由五组决定。依赖是真实的，存在也是真实的。',
    background: 'ending', music: 'afterOnline',
    presentation: {
      cg: cgPath('cg37-ending-route5'),
      cgAlt: '未闻花名的门通向盟友走廊，但自己的花灯、桌椅与新花仍保留清楚边界',
      ui: 'ending', transition: 'slide', camera: 'drift-right', atmosphere: 'petals', focus: 'right',
    },
    onEnter: [
      { type: 'unlockEnding', id: 'r5-protected-flower' },
      { type: 'unlockCg', id: 'cg37-ending-route5' },
    ],
    next: 'worldline-check',
  },
  {
    id: 'r5-end-name-only', chapter: 'epilogue', actLabel: '尾声 · 只剩名字', date: '2026-07-28',
    title: '只剩名字', location: '4945区', mode: 'ending', speaker: 'narrator',
    text: '全体并入三组后，未闻花名留在搜索结果里，首领栏已经空白。这个决定减少了养成成本，也结束了一项共同承诺。名字没有被删除，只是不再有人用它集合。',
    background: 'ending', music: 'afterOnline',
    presentation: {
      cg: cgPath('cg37-ending-route5'),
      cgAlt: '未闻花名的花形灯仍亮在空大厅里，所有椅子已经冷却，只剩名字对应的空间',
      ui: 'ending', transition: 'crossfade', camera: 'pull-back', atmosphere: 'dust', focus: 'center',
    },
    onEnter: [
      { type: 'unlockEnding', id: 'r5-name-only' },
      { type: 'unlockCg', id: 'cg37-ending-route5' },
    ],
    next: 'worldline-check',
  },

  // ──────────────── 蝴蝶效应 · 变体结局 ────────────────
  {
    id: 'r5-end-chaos-bloom',
    chapter: 'epilogue', actLabel: '终幕 · 狂花', date: '2026-07-28',
    title: '狂花', location: '4945区', mode: 'ending', speaker: 'narrator',
    text: '未闻花名的活动没有计划，只有热情。每次有人问"明天几点"，回答都不一样。花灯仍亮着，只是没有人再确认它照向哪个方向。你们的公告栏比任何组织都活跃——因为谁都可以写。',
    background: 'ending', music: 'afterOnline',
    presentation: {
      cg: cgPath('cg37-ending-route5'),
      cgAlt: '未闻花名大厅里花灯狂舞，公告板被无数便签覆盖到看不清边界，桌上野花杂乱盛开',
      ui: 'ending-chaos', transition: 'glitch', camera: 'hold', atmosphere: 'danmaku', focus: 'center',
    },
    onEnter: [
      { type: 'unlockEnding', id: 'r5-chaos-bloom' },
      { type: 'unlockCg', id: 'cg37-ending-route5' },
    ],
    next: 'worldline-check',
  },
  {
    id: 'r5-end-hidden-garden',
    chapter: 'epilogue', actLabel: '隐藏 · 秘境', date: '2026-07-28',
    title: '秘境', location: '？？？', mode: 'ending', speaker: 'narrator',
    text: '五组有一条只有老成员才知道的公告。它不在管理群，不在世界频道，甚至不在搜索结果里。每次活动仍有人悄悄到场，他们没有报名，没有应战，只是习惯了每个星期天晚上从一个没有名字的链接进入。',
    background: 'ending', music: 'afterOnline',
    presentation: {
      cg: cgPath('cg37-ending-route5'),
      cgAlt: '五组废弃的管理频道角落有一扇半掩的门，门外是只有老成员私传链接的花园',
      ui: 'ending-secret', transition: 'crossfade', camera: 'push-in', atmosphere: 'petals', focus: 'right',
    },
    onEnter: [
      { type: 'unlockEnding', id: 'r5-hidden-garden' },
      { type: 'unlockCg', id: 'cg37-ending-route5' },
    ],
    next: 'worldline-check',
  },
  {
    id: 'r5-end-cold-bloom',
    chapter: 'epilogue', actLabel: '终幕 · 霜华', date: '2026-07-28',
    title: '霜华', location: '4945区', mode: 'ending', speaker: 'narrator',
    text: '未闻花名还叫未闻花名，但花灯的光已经冷到了只剩名字。你不再为每一个离开的人停下来，不再为每一次活动失眠。组织稳定了——稳定的意思是，它不再需要你真正在意。',
    background: 'ending', music: 'afterOnline',
    presentation: {
      cg: cgPath('cg37-ending-route5'),
      cgAlt: '未闻花名大厅只剩一个花灯亮着冷光，椅子排成静默的圆，新花在角落独自落了霜',
      ui: 'ending-dark', transition: 'crossfade', camera: 'drift-left', atmosphere: 'rain', focus: 'left',
    },
    onEnter: [
      { type: 'unlockEnding', id: 'r5-cold-bloom' },
      { type: 'unlockCg', id: 'cg37-ending-route5' },
    ],
    next: 'worldline-check',
  },
] satisfies StoryNode[]
