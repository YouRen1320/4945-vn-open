export type DistrictEvidenceKind = 'confirmed' | 'adapted' | 'claim'
export type DistrictRosterGroup = 'org1' | 'org2' | 'org3' | 'guest' | 'bridge'

export interface DistrictTimelineEntry {
  id: string
  date: string
  title: string
  summary: string
  sourceFile: string
  storyNodes: readonly string[]
}

export interface DistrictEvidenceRecord {
  id: string
  date: string
  event: '苏铭事件' | '二组首领踢人事件'
  sourceFile: string
  sourceHash: string
  title: string
  summary: string
  kind: DistrictEvidenceKind
  storyNode: string
}

export interface DistrictRosterEntry {
  id: string
  name: string
  group: DistrictRosterGroup
  role: string
  note: string
  asset: string
  sourceFile: string
  privacy: 'source-avatar' | 'fictionalized-replacement'
}

const TIMELINE_SOURCE = '1.8月1日江南在火要塞打赢群雄逐鹿，群雄逐鹿首领祈福跑路，三组首领来到群雄逐鹿，成为一组首领.8月1日江南在火要塞打赢群雄逐鹿，群雄逐鹿首领祈福跑路，三组首领来到群雄逐鹿，成为一组首领'

export const districtTimeline: readonly DistrictTimelineEntry[] = [
  {
    id: 'aug-01-fortress', date: '2026-08-01', title: '火要塞与一组交接',
    summary: '江南在火要塞战胜群雄逐鹿；祈福离开后，原三组首领心跳成瘾接任一组首领。',
    sourceFile: TIMELINE_SOURCE,
    storyNodes: ['s2-august-august-first', 's2-august-qifu-exit'],
  },
  {
    id: 'aug-02-reorganization', date: '2026-08-02', title: '五组重组完成',
    summary: '部分成员分别进入新组，组织名称更新为云山乱清雪、云梦仙踪、虚妄月华、镜花水月与心之所向。',
    sourceFile: TIMELINE_SOURCE,
    storyNodes: ['s2-august-reorg-choice', 's2-august-new-map'],
  },
  {
    id: 'aug-08-fire-two', date: '2026-08-08', title: '火2奖励旁落',
    summary: '二组没有与一组争抢火要塞，第二名奖励由三十五组取得；新一组首领随后发布公开动态。',
    sourceFile: TIMELINE_SOURCE,
    storyNodes: ['s2-august-fire-two', 's2-august-public-choice'],
  },
  {
    id: 'aug-09-transfer', date: '2026-08-09', title: '踢人、道歉与成员流动',
    summary: '夏娜与成员发生冲突后踢出路人K和大古；二人进入三组，路人K接任虚妄月华首领，温陷退游。',
    sourceFile: TIMELINE_SOURCE,
    storyNodes: ['s2-august-kick-start', 's2-august-apology', 's2-august-transfer-result'],
  },
]

export const districtEvidenceRecords: readonly DistrictEvidenceRecord[] = [
  {
    id: 'suming-01', date: '2026-07-21', event: '苏铭事件', sourceFile: '苏铭事件/5DF8778A30F262090F7989EFF564EA57.png', sourceHash: '6f96517b0984f10b8991dc5a89cf01c7c7933125d8ac6c8df7fa35bad645ac71',
    title: '新区接单争执', summary: '祈福要求苏铭不要继续在新区接单；苏铭明确表示仍会按代练工作接单。', kind: 'confirmed', storyNode: 's2-august-suming-refusal',
  },
  {
    id: 'suming-02', date: '2026-07-21', event: '苏铭事件', sourceFile: '苏铭事件/629CC7C6E9CAB3288AC8283B0782BC85.png', sourceHash: 'bc6ad623f6381c2edd701b5efe5b15345fb9ca338fedd702c6d34ad577bac3ee',
    title: '打听高层与组织动向', summary: '祈福转述自己向其他组织高层打听的内容，并提出拉人；苏铭表示不想处理这些组织事务。', kind: 'confirmed', storyNode: 's2-august-qifu-pressure',
  },
  {
    id: 'suming-03', date: '2026-07-21', event: '苏铭事件', sourceFile: '苏铭事件/6EB7F4093CB25E1C84882E172FC7EC32.png', sourceHash: 'b44fd4f430f44a24d9ffd39245e9fb6daf617b441eba3f16a1b65be806d55e4f',
    title: '拒绝发布材料', summary: '双方围绕是否发布材料发生争执；苏铭连续拒绝，并坚持继续接单。', kind: 'confirmed', storyNode: 's2-august-suming-refusal',
  },
  {
    id: 'suming-04', date: '2026-07-21', event: '苏铭事件', sourceFile: '苏铭事件/8EEB4E65F037B4870A4F88479831BD58.png', sourceHash: 'ffff904b23d7c5d7ba72439d09a08b5c8585ec53904c4c5860bd09666519bd3e',
    title: '是否继续留区', summary: '祈福谈到其他高层的公开态度并询问苏铭是否继续游玩；苏铭回应自己主要为了接单赚钱。', kind: 'confirmed', storyNode: 's2-august-suming-refusal',
  },
  {
    id: 'suming-05', date: '2026-07-21', event: '苏铭事件', sourceFile: '苏铭事件/C9B72E640F0CBF748146B1EDE9D2A635.png', sourceHash: '72c5344e5bde4eadcece2a816a1a3e55e6d52a13f0fdd3d693c574c4a6b829f0',
    title: '群聊中的争议指控', summary: '群聊中出现“造谣”“内鬼”“伪代”等说法；档案仅确认这些指控曾被提出，不判定其真假。', kind: 'claim', storyNode: 's2-august-evidence-choice',
  },
  {
    id: 'suming-06', date: '2026-07-21', event: '苏铭事件', sourceFile: '苏铭事件/EA4F56CECB37770B85238B9B7DAF22E8.png', sourceHash: '7a621d0234dadb213b5721a7071d288062dabce94d0f69104fb1404405298452',
    title: '红包与火要塞请求', summary: '祈福提出发送红包，并要求苏铭把相关内容交给首领，同时谈及当周火要塞。', kind: 'confirmed', storyNode: 's2-august-qifu-pressure',
  },
  {
    id: 'suming-07', date: '2026-07-21', event: '苏铭事件', sourceFile: '苏铭事件/F593B72E6CA98653487F650F74CE254F.png', sourceHash: '904a5132b2bce9025d6dd3496abb86e7d69c4814e42897bb97719af224d051b8',
    title: '提供事情原委', summary: '祈福表示会提供事情原委；苏铭说明自己一直在打单，尚未了解争执全貌。', kind: 'confirmed', storyNode: 's2-august-entry',
  },
  {
    id: 'kick-01', date: '2026-08-09', event: '二组首领踢人事件', sourceFile: '2组首领踢人事件/0823732C3AEB3401A5BDA93852820F2A.png', sourceHash: '5c0f9e9dae502ca61b548183cb6e9f5a5b696e65bda80ec35847feff0f89fa38',
    title: '“回三组”是否只是玩笑', summary: '夏娜认为高层在当时说“回三组”不合适；带土追问具体情境与信息是否充分。', kind: 'confirmed', storyNode: 's2-august-kick-start',
  },
  {
    id: 'kick-02', date: '2026-08-09', event: '二组首领踢人事件', sourceFile: '2组首领踢人事件/3202D0F569CBDA7879B618CD0A02893F.png', sourceHash: '2efc469c8989f211e7cab65d10fcb9aa6c60d671d4b1d8039038d91a59d89b43',
    title: '挽留与组织责任', summary: '带土以其他高战成员为例，劝夏娜先挽留，不要让个人性格毁掉辛苦建立的组织。', kind: 'confirmed', storyNode: 's2-august-obito-advice',
  },
  {
    id: 'kick-03', date: '2026-08-09', event: '二组首领踢人事件', sourceFile: '2组首领踢人事件/36BBEC6F335687D690EE3DAA5ADD1AC9.png', sourceHash: 'aebb3323c3e94a6c3ee96ad4c3d5c26401575944223c49328c22d383b1a163fa',
    title: '包容与改变', summary: '带土主张在事情发生前先尝试改变而非直接做绝；夏娜承认当天的处理有问题。', kind: 'confirmed', storyNode: 's2-august-obito-advice',
  },
  {
    id: 'kick-04', date: '2026-08-09', event: '二组首领踢人事件', sourceFile: '2组首领踢人事件/75E8949AC2687B7F33316C49539EEBD5.png', sourceHash: 'b2e0dc048584c61a11e6e78b8838a546a19cbeff8cdd0802cf5c74122c0ced5e',
    title: '气话不等于行动', summary: '带土用自己曾说“跑路”却未离开的经历说明，气话不能自动当成正式退组决定。', kind: 'confirmed', storyNode: 's2-august-passerk-outburst',
  },
  {
    id: 'kick-05', date: '2026-08-09', event: '二组首领踢人事件', sourceFile: '2组首领踢人事件/91BE81DF84031711460AA408749CEC3C.png', sourceHash: '99a5a6a4874fbd9a83f4cc21e22744ca5f0f612ebf4e8ad9a24a6a07a1897389',
    title: '“滚回三组”与受伤', summary: '带土指出路人K的话可能只是气话，并认为公开驱赶让对方受伤，劝夏娜包容性格缺点。', kind: 'adapted', storyNode: 's2-august-obito-advice',
  },
  {
    id: 'kick-06', date: '2026-08-09', event: '二组首领踢人事件', sourceFile: '2组首领踢人事件/A5A7D5ECB270703F088B649847A17E1B.png', sourceHash: '1c7a4fe259dadb2261ab8fa665047a03028c463df22b699e23956fd69a42920d',
    title: '必须亲自道歉', summary: '带土拒绝代为传话，要求犯错的一方亲自道歉，并指出公开场合造成的面子损失。', kind: 'confirmed', storyNode: 's2-august-obito-apology-line',
  },
  {
    id: 'kick-07', date: '2026-08-09', event: '二组首领踢人事件', sourceFile: '2组首领踢人事件/AF27E314BDDE490824AD6269181975D8.png', sourceHash: 'ab57bef7a36b93701d518f66caa429c13e36b586ca5148c8faa846e0d45014e7',
    title: '复看聊天记录', summary: '夏娜说明自己看完前一晚聊天后被激怒，随后承认这是自己的处理问题。', kind: 'confirmed', storyNode: 's2-august-kick-review-reply',
  },
  {
    id: 'kick-08', date: '2026-08-09', event: '二组首领踢人事件', sourceFile: '2组首领踢人事件/C475AD6E812D01BFC5199623869473B8.png', sourceHash: 'c9162aec85439c8cfc994293eaaff82e08fa9a95c0314f86d36617d0013b8e58',
    title: '短期游玩不等于立即踢出', summary: '夏娜以“不打算长期玩”为由解释处理；带土认为应等成员真正离开，而不是提前做绝。', kind: 'confirmed', storyNode: 's2-august-obito-advice',
  },
  {
    id: 'kick-09', date: '2026-08-09', event: '二组首领踢人事件', sourceFile: '2组首领踢人事件/CC7B1F29CBEEEE1D5BFE6E6797EDDDB4.png', sourceHash: '6659b6e6252cac612a7250fdeec88f3a1772ac7af7b915b8155a20474e74cd2b',
    title: '医院中的复盘开端', summary: '夏娜说明自己在医院，并讲述路人K说回三组、随后与 yyT 争吵及踢人经过。', kind: 'confirmed', storyNode: 's2-august-kick-start',
  },
  {
    id: 'kick-10', date: '2026-08-09', event: '二组首领踢人事件', sourceFile: '2组首领踢人事件/EA583B81917B19D6370482B54292C578.png', sourceHash: '6355f3ca2a065d6e717a09084583d39b290ec580eaf2644d24551248d69aca16',
    title: '夏娜的公开道歉', summary: '夏娜承认情绪上头和现实压力影响处理，向当事人道歉，并表示后续愿意提供帮助。', kind: 'confirmed', storyNode: 's2-august-apology',
  },
  {
    id: 'kick-11', date: '2026-08-09', event: '二组首领踢人事件', sourceFile: '2组首领踢人事件/EBC56E840483F92983444A4C5302279B.png', sourceHash: '4c9d26d99adb4a6204db0f1a445bc5fc6b2e9563573b9868e6964e97e6bb1db6',
    title: '“人民的组织”', summary: '带土援引“人民的组织”，主张改变成员而非看不惯就换人；夏娜再次承认没有做好。', kind: 'confirmed', storyNode: 's2-august-obito-advice',
  },
  {
    id: 'kick-12', date: '2026-08-09', event: '二组首领踢人事件', sourceFile: '2组首领踢人事件/F68FCBD082E3283F2B437ED2889D8C30.png', sourceHash: 'f14b90bbb9573d9d1df7c32d175310cdc1687704693a57bbaf73b755f5144c31',
    title: '情绪消磨后的承认', summary: '夏娜表示长期压力已经消磨耐心；带土认为成员的错误并不严重，夏娜随后承认处理有误。', kind: 'adapted', storyNode: 's2-august-obito-advice',
  },
  {
    id: 'kick-13', date: '2026-08-09', event: '二组首领踢人事件', sourceFile: '2组首领踢人事件/F6BA9E2F45551A112EE31501D0EC8A88.png', sourceHash: '8e5c43e99d81dd87647d42fb5db9ac0210a5049d5797777a61daa6f315e73bae',
    title: '组织最后的目标是团结', summary: '带土认为区服格局已经基本稳定，组织除提升战力外，更重要的是团结而非持续制造矛盾。', kind: 'confirmed', storyNode: 's2-august-transfer-result',
  },
]

const rosterAsset = (name: string) => `/assets/archive/roster/${name}.webp`

export const districtRoster: readonly DistrictRosterEntry[] = [
  { id: 'org1-ellipsis', name: '..', group: 'org1', role: '一组高层', note: '文件名确认高层身份；不补写具体职务。', asset: rosterAsset('org1-ellipsis'), sourceFile: '1组成员/ ..（一组高层）.jpg', privacy: 'source-avatar' },
  { id: 'org1-old-shenli', name: 'old神力', group: 'org1', role: '成员', note: '素材备注为 4945 战力榜一。', asset: rosterAsset('org1-old-shenli'), sourceFile: '1组成员/old神力（4945战力榜一）.png', privacy: 'source-avatar' },
  { id: 'org1-promise', name: '拉过勾的誓言', group: 'org1', role: '成员', note: '仅确认目录时点所属组织。', asset: rosterAsset('org1-promise'), sourceFile: '1组成员/拉过勾的誓言.jpg', privacy: 'source-avatar' },
  { id: 'org1-truth', name: '真理', group: 'org1', role: '成员 / 现有角色', note: '作为区史头像保留，不覆盖游戏当前立绘。', asset: rosterAsset('org1-truth'), sourceFile: '1组成员/真理.jpg', privacy: 'source-avatar' },
  { id: 'org1-bottle', name: '顶级奶瓶', group: 'org1', role: '高层 / 现有角色', note: '作为区史头像保留，不覆盖游戏当前立绘。', asset: rosterAsset('org1-bottle'), sourceFile: '1组成员/顶级奶瓶.jpg', privacy: 'source-avatar' },
  { id: 'org2-91', name: '91', group: 'org2', role: '成员', note: '仅确认目录时点所属组织。', asset: rosterAsset('org2-91'), sourceFile: '2组成员/91.jpg', privacy: 'source-avatar' },
  { id: 'org2-opyyc', name: 'opyyc', group: 'org2', role: '成员', note: '仅确认目录时点所属组织。', asset: rosterAsset('org2-opyyc'), sourceFile: '2组成员/opyyc.jpg', privacy: 'source-avatar' },
  { id: 'org2-lingluan', name: '凌乱的节奏', group: 'org2', role: '成员', note: '仅确认目录时点所属组织。', asset: rosterAsset('org2-lingluan'), sourceFile: '2组成员/凌乱的节奏.jpg', privacy: 'source-avatar' },
  { id: 'org2-nanbei', name: '南北', group: 'org2', role: '成员', note: '仅确认目录时点所属组织。', asset: rosterAsset('org2-nanbei'), sourceFile: '2组成员/南北.jpg', privacy: 'source-avatar' },
  { id: 'org2-fugang', name: '富冈', group: 'org2', role: '成员', note: '仅确认目录时点所属组织。', asset: rosterAsset('org2-fugang'), sourceFile: '2组成员/富冈.jpg', privacy: 'source-avatar' },
  { id: 'org2-zhangyuge', name: '忧郁的章鱼哥', group: 'org2', role: '成员', note: '仅确认目录时点所属组织。', asset: rosterAsset('org2-zhangyuge'), sourceFile: '2组成员/忧郁的章鱼哥.jpg', privacy: 'source-avatar' },
  { id: 'org2-zhaozilong', name: '我奶常扇赵子龙', group: 'org2', role: '成员', note: '仅确认目录时点所属组织。', asset: rosterAsset('org2-zhaozilong'), sourceFile: '2组成员/我奶常扇赵子龙.jpg', privacy: 'source-avatar' },
  { id: 'org2-xingqing', name: '星晴', group: 'org2', role: '成员 / 现有角色', note: '只记录此目录时点；不改写当前六组剧情身份。', asset: rosterAsset('org2-xingqing'), sourceFile: '2组成员/星晴.jpg', privacy: 'source-avatar' },
  { id: 'org2-wanan', name: '晚安', group: 'org2', role: '成员', note: '仅确认目录时点所属组织。', asset: rosterAsset('org2-wanan'), sourceFile: '2组成员/晚安.jpg', privacy: 'source-avatar' },
  { id: 'org2-tenshi', name: '比那名居天子', group: 'org2', role: '成员', note: '仅确认目录时点所属组织。', asset: rosterAsset('org2-tenshi'), sourceFile: '2组成员/比那名居天子.jpg', privacy: 'source-avatar' },
  { id: 'org2-liechen', name: '猎辰', group: 'org2', role: '成员', note: '原图疑似真人素材；公开版使用全新虚构二次元替代头像。', asset: rosterAsset('org2-liechen'), sourceFile: '2组成员/猎辰.jpg', privacy: 'fictionalized-replacement' },
  { id: 'org2-lihong', name: '离鸿', group: 'org2', role: '成员', note: '仅确认目录时点所属组织。', asset: rosterAsset('org2-lihong'), sourceFile: '2组成员/离鸿.jpg', privacy: 'source-avatar' },
  { id: 'org2-vitamin', name: '维生素', group: 'org2', role: '岸的游戏代练', note: '性格形容词仅是素材备注，未写成游戏事实。', asset: rosterAsset('org2-vitamin'), sourceFile: '2组成员/维生素（岸的游戏代练，温柔大方漂亮 有素质 温和）.jpg', privacy: 'source-avatar' },
  { id: 'org2-funina', name: '芙尼娜', group: 'org2', role: '成员', note: '仅确认目录时点所属组织。', asset: rosterAsset('org2-funina'), sourceFile: '2组成员/芙尼娜.jpg', privacy: 'source-avatar' },
  { id: 'org2-jiejian', name: '芥剑', group: 'org2', role: '成员', note: '仅确认目录时点所属组织。', asset: rosterAsset('org2-jiejian'), sourceFile: '2组成员/芥剑.jpg', privacy: 'source-avatar' },
  { id: 'org2-moli', name: '茉莉奶绿', group: 'org2', role: '成员', note: '仅确认目录时点所属组织。', asset: rosterAsset('org2-moli'), sourceFile: '2组成员/茉莉奶绿.jpg', privacy: 'source-avatar' },
  { id: 'org2-lan', name: '蓝', group: 'org2', role: '成员 / 现有角色', note: '作为区史头像保留，不覆盖游戏当前立绘。', asset: rosterAsset('org2-lan'), sourceFile: '2组成员/蓝.png', privacy: 'source-avatar' },
  { id: 'org2-qimukaka', name: '齐木卡卡豪', group: 'org2', role: '成员', note: '仅确认目录时点所属组织。', asset: rosterAsset('org2-qimukaka'), sourceFile: '2组成员/齐木卡卡豪.jpg', privacy: 'source-avatar' },
  { id: 'org3-qishiba', name: '其实吧', group: 'org3', role: '成员', note: '仅确认目录时点所属组织。', asset: rosterAsset('org3-qishiba'), sourceFile: '3组成员/其实吧.jpg', privacy: 'source-avatar' },
  { id: 'org3-xiaoxin', name: '小欣ovo', group: 'org3', role: '成员', note: '不与宇智波带土绑定，两者同一性没有得到证明。', asset: rosterAsset('org3-xiaoxin'), sourceFile: '3组成员/小欣ovo（带土显现.jpg', privacy: 'source-avatar' },
  { id: 'org3-passerk', name: '路人K', group: 'org3', role: '后任首领', note: '从二组流入虚妄月华，8 月 9 日接任首领。', asset: rosterAsset('org3-passerk'), sourceFile: '3组成员/路人K.jpg', privacy: 'source-avatar' },
  { id: 'guest-herechuyue', name: '何人初见月', group: 'guest', role: '3510 区二组首领', note: '素材备注为来新区找乐子；未虚构其参与 4945 主事件。', asset: rosterAsset('guest-herechuyue'), sourceFile: '何人初见月（3510区二组首领，来新区找乐子）.jpg', privacy: 'source-avatar' },
  { id: 'guest-pride', name: '傲慢与偏见', group: 'guest', role: '3510 区原一组首领', note: '原图疑似真人素材；公开版使用全新虚构二次元替代头像。', asset: rosterAsset('guest-pride'), sourceFile: '傲慢与偏见（3510区原一组首领，乐子人，喜欢玩三角洲）.jpg', privacy: 'fictionalized-replacement' },
  { id: 'bridge-kunxing', name: '困醒', group: 'bridge', role: '心之所向首领', note: '温陷退游后承担五组首领确认与季终签字。', asset: rosterAsset('bridge-kunxing'), sourceFile: '困醒（心之所向首领）.jpg', privacy: 'source-avatar' },
  { id: 'guest-critking', name: '无敌暴击大王', group: 'guest', role: '4902 区一组成员', note: '素材备注为认识夏娜并来新区；未虚构具体事件。', asset: rosterAsset('guest-critking'), sourceFile: '无敌暴击大王（4902区一组成员，认识夏娜，来新区找乐子）.jpg', privacy: 'source-avatar' },
  { id: 'bridge-suming', name: '苏铭', group: 'bridge', role: '代练 / 原一组成员', note: '拒绝把代练工作卷入组织争斗，后来进入二组。', asset: rosterAsset('bridge-suming'), sourceFile: '苏铭事件/苏铭（代练，前1组成员，后来去了2组）.jpg', privacy: 'source-avatar' },
  { id: 'bridge-tiesuiya', name: '铁碎牙', group: 'bridge', role: '镜花水月首领', note: '8 月重组后承担四组首领确认与季终签字。', asset: rosterAsset('bridge-tiesuiya'), sourceFile: '铁碎牙（镜花水月4组首领）.jpg', privacy: 'source-avatar' },
]

export const districtArchiveAssetUrls = districtRoster.map((entry) => entry.asset)

/** Every valid source file has exactly one archive owner; duplicated ownership is a release-contract failure. */
export const districtArchiveSourceFiles = [
  TIMELINE_SOURCE,
  ...districtEvidenceRecords.map((record) => record.sourceFile),
  ...districtRoster.map((entry) => entry.sourceFile),
] as const
