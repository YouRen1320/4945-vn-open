import type { StoryNode } from '@/engine/types'

const actLabel = '事件三 · 序章'
const date = '2027-01-04'

/**
 * 事件三序章把制度压力落到可见损失：权限冻结、行动中断和成员去向。
 * S2 结果只改变开场筹码与人物语境，第一次公开回应仍完全交给玩家选择。
 */
export const s3PrologueNodes: StoryNode[] = [
  {
    id: 's3-prologue-entry', chapter: 'prologue', actLabel, date,
    title: '返校第一日', location: '4945区 · 联合会客厅', mode: 'system', speaker: 'system',
    text: '【事件三】第二季评议已经归档。你带着上一季的组织位置和关系回到联合会客厅；这一次，旧选择不会替你回答新问题。',
    background: 'organization', historical: 'fictional',
    onEnter: [{ type: 'flag', key: 's3PrologueEntered' }],
    next: {
      cases: [
        { when: { type: 'route', value: 'org2' }, next: 's3-prologue-org2-return' },
        { when: { type: 'route', value: 'org3' }, next: 's3-prologue-org3-return' },
        { when: { type: 'route', value: 'org4' }, next: 's3-prologue-org4-return' },
        { when: { type: 'route', value: 'org5' }, next: 's3-prologue-org5-return' },
        { when: { type: 'route', value: 'org6' }, next: 's3-prologue-org6-return' },
      ],
      fallback: 's3-prologue-route-repair',
    },
  },
  {
    id: 's3-prologue-route-repair', chapter: 'prologue', actLabel, date,
    title: '连续性中断', location: '事件三建档检查', mode: 'system', speaker: 'system',
    text: '这份连续性记录缺少有效的二至六组归属。事件三没有替你猜选组织，当前进度已安全停下。',
    background: 'aftermath', historical: 'fictional', next: 's3-prologue-exit',
  },
  {
    id: 's3-prologue-org2-return', chapter: 'prologue', actLabel, date,
    location: '云梦仙踪 · 组织群', mode: 'chat', speaker: 'shana', portrait: 'shana',
    text: '夏娜把新学期名单发给你：“上季赢下来的位置还在。但北岸把我们标成重点监管对象——人越多，越有人想替我们排队。”',
    background: 'organization', historical: 'adapted', next: 's3-prologue-ending-memory',
  },
  {
    id: 's3-prologue-org3-return', chapter: 'prologue', actLabel, date,
    location: '虚妄月华 · 组织群', mode: 'chat', speaker: 'passerk', portrait: 'passerk',
    text: '路人K把成员流向表翻到新的一页：“我们能和每一组说上话，所以北岸先问的也是我们。别让外交变成替别人签字。”',
    background: 'organization', historical: 'adapted', next: 's3-prologue-ending-memory',
  },
  {
    id: 's3-prologue-org4-return', chapter: 'prologue', actLabel, date,
    location: '镜花水月 · 组织群', mode: 'chat', speaker: 'tiesuiya', portrait: 'tiesuiya',
    text: '铁碎牙将新席位表置顶：“镜花水月的票由成员自己投。北岸若想加一把常任椅子，先说清那把椅子凭什么永远不换人。”',
    background: 'organization', historical: 'adapted', next: 's3-prologue-ending-memory',
  },
  {
    id: 's3-prologue-org5-return', chapter: 'prologue', actLabel, date,
    location: '心之所向 · 组织群', mode: 'chat', speaker: 'kunxing', portrait: 'kunxing',
    text: '困醒把温陷离开后的交接表合上：“留下的人刚学会自己保管这张网。北岸现在要我们把每条外联线都报上去。”',
    background: 'organization', historical: 'adapted', next: 's3-prologue-ending-memory',
  },
  {
    id: 's3-prologue-org6-return', chapter: 'prologue', actLabel, date,
    location: '{{organizationName}} · 组织群', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: 'AVUCII把刚确认不久的独立席位截图发来：“他们说统一备案不影响自治。一个刚被承认的组织，最经不起别人替它定义‘不影响’。”',
    background: 'sixthSeat', historical: 'adapted', next: 's3-prologue-ending-memory',
  },
  {
    id: 's3-prologue-ending-memory', chapter: 'prologue', actLabel, date,
    location: '联合会客厅 · 入场记录', mode: 'system', speaker: 'system',
    text: '【上一季结果】{{s3EndingLabel}}。这项结果只决定你今天带着多少筹码进门，不会替你决定如何回答北岸。',
    background: 'rewardHall', historical: 'confirmed',
    next: {
      cases: [
        { when: { type: 'variable', key: 's3Partner', operator: 'eq', value: 'shana' }, next: 's3-prologue-partner-shana' },
        { when: { type: 'variable', key: 's3Partner', operator: 'eq', value: 'qifu' }, next: 's3-prologue-partner-qifu' },
        { when: { type: 'variable', key: 's3Partner', operator: 'eq', value: 'chenyi' }, next: 's3-prologue-partner-chenyi' },
        { when: { type: 'variable', key: 's3Partner', operator: 'eq', value: 'swordheart' }, next: 's3-prologue-partner-swordheart' },
        { when: { type: 'variable', key: 's3Partner', operator: 'eq', value: 'heartbeat' }, next: 's3-prologue-partner-heartbeat' },
        { when: { type: 'variable', key: 's3Partner', operator: 'eq', value: 'yanqiu' }, next: 's3-prologue-partner-yanqiu' },
        { when: { type: 'variable', key: 's3Partner', operator: 'eq', value: 'huayue' }, next: 's3-prologue-partner-huayue' },
        { when: { type: 'variable', key: 's3Partner', operator: 'eq', value: 'wenxian' }, next: 's3-prologue-partner-wenxian' },
        { when: { type: 'variable', key: 's3Partner', operator: 'eq', value: 'takemehand' }, next: 's3-prologue-partner-takemehand' },
        { when: { type: 'variable', key: 's3Partner', operator: 'eq', value: 'xilufei' }, next: 's3-prologue-partner-xilufei' },
        { when: { type: 'variable', key: 's3Partner', operator: 'eq', value: 'yyt' }, next: 's3-prologue-partner-yyt' },
        { when: { type: 'variable', key: 's3Partner', operator: 'eq', value: 'avucii' }, next: 's3-prologue-partner-avucii' },
        { when: { type: 'variable', key: 's3Partner', operator: 'eq', value: 'bottle' }, next: 's3-prologue-partner-bottle' },
        { when: { type: 'variable', key: 's3Partner', operator: 'eq', value: 'truth' }, next: 's3-prologue-partner-truth' },
      ],
      fallback: 's3-prologue-partner-none',
    },
  },
  ...([
    ['shana', 'shana', '夏娜关掉管理表，只问你：“这次先别替组织回答。你自己想守住什么？”'],
    ['qifu', 'qifu', '祈福发来一句：“我现在不坐首领位，但你真要公开开口，我会听完。”'],
    ['chenyi', 'chenyi', '辰逸没有催你站队：“先看他动了谁的权限。别让一句态度盖过正在发生的事。”'],
    ['swordheart', 'swordheart', '剑斩凡人心把活动倒计时截给你：“你谈规则，我替你盯今晚到底少了谁。”'],
    ['heartbeat', 'heartbeat', '心跳成瘾把联合会客厅的位置发来：“坐我旁边。立场可以不同，别隔着群聊猜。”'],
    ['yanqiu', 'yanqiu', '砚秋水把旧尺放在桌边：“标准可以重写，但谁拿尺，必须先被人看见。”'],
    ['huayue', 'huayue', '华月乌大王回得很快：“你若想顶回去，我跟；你若想谈，也把底线先告诉我。”'],
    ['wenxian', 'wenxian', '温陷的头像仍是离线。过了很久，消息才亮起：“别用我的离开替现在的人做决定。说你自己的。”'],
    ['takemehand', 'takemehand', 'takemehand发来一张权限页：“我见过管理员按下去以后所有人装没看见。今天别装。”'],
    ['xilufei', 'xilufei', '希露菲只发来一句：“规则最有意思的时候，就是有人以为你不敢碰它。”'],
    ['yyt', 'yyt', 'yyT在语音里笑了一声：“独立不是别人发的奖状。你想怎么答，我就怎么准备后手。”'],
    ['avucii', 'avucii', 'AVUCII把风险拆成三行发来：“先保人，再保权限，最后才是面子。你做决定，我记代价。”'],
    ['bottle', 'bottle', '顶级奶瓶把出勤表发来：“旧档只剩我的名字也没关系。你看表，我看人，别让北岸替我们合计。”'],
    ['truth', 'truth', '真理把审计通知标成红黄绿三色：“我能替你核数据，不能替你决定什么值得公开。”'],
  ] as const).map(([suffix, speaker, text]): StoryNode => ({
    id: `s3-prologue-partner-${suffix}`,
    chapter: 'prologue', actLabel, date,
    location: '返校私聊', mode: 'chat', speaker, portrait: speaker,
    text, background: 'nightMessage', historical: 'fictional', next: 's3-prologue-shen-arrives',
  })),
  {
    id: 's3-prologue-partner-none', chapter: 'prologue', actLabel, date,
    location: '返校私聊', mode: 'chat', speaker: 'mentor', portrait: 'mentor',
    text: '老朋友问你：“这回没人替你兜答案。也好——至少你说出口的每句话，都真是你自己的。”',
    background: 'nightMessage', historical: 'fictional', next: 's3-prologue-shen-arrives',
  },
  {
    id: 's3-prologue-shen-arrives', chapter: 'prologue', actLabel, date,
    title: '北岸来客', location: '联合会客厅', mode: 'novel', speaker: 'shen-zhixing', portrait: 'shen-zhixing',
    text: '沈知行没有坐主位。他站在空着的常任理事席旁，把一份盖有北岸印章的临时措施推到桌中央：“三年前我从这里离开。今天回来，不是要大家相信我——是要这张名单在七十二小时内有人负责。”',
    background: 'warRoom', historical: 'fictional', next: 's3-prologue-freeze-notice',
  },
  {
    id: 's3-prologue-freeze-notice', chapter: 'prologue', actLabel, date,
    title: '临时冻结', location: '4945区 · 系统通知', mode: 'system', speaker: 'system',
    text: '【北岸临时措施】跨组织调度、联合活动报名与外部联系权限即刻冻结。各组织须在 72 小时内提交财政、人事与联络责任名单；审核完成前，不接受口头授权。',
    background: 'mutedKey', historical: 'fictional',
    onEnter: [{ type: 'flag', key: 's3NorthFreezeActive' }],
    next: {
      cases: [
        { when: { type: 'route', value: 'org2' }, next: 's3-prologue-impact-org2' },
        { when: { type: 'route', value: 'org3' }, next: 's3-prologue-impact-org3' },
        { when: { type: 'route', value: 'org4' }, next: 's3-prologue-impact-org4' },
        { when: { type: 'route', value: 'org5' }, next: 's3-prologue-impact-org5' },
        { when: { type: 'route', value: 'org6' }, next: 's3-prologue-impact-org6' },
      ],
      fallback: 's3-prologue-route-repair',
    },
  },
  {
    id: 's3-prologue-impact-org2', chapter: 'prologue', actLabel, date,
    location: '云梦仙踪 · 活动名单', mode: 'chat', speaker: 'shana', portrait: 'shana',
    text: '夏娜刷新了三次名单，仍有十二个人显示“待审核”：“今晚的联合活动少一整队。沈知行不是在讲以后——他已经把手按在今天的队伍上了。”',
    background: 'recruitment', historical: 'fictional', next: 's3-prologue-first-response',
  },
  {
    id: 's3-prologue-impact-org3', chapter: 'prologue', actLabel, date,
    location: '虚妄月华 · 联络台', mode: 'chat', speaker: 'truth', portrait: 'truth',
    text: '真理把五条外联线路一一点开，状态全变成灰色：“我们还能收到消息，但不能代表任何人回复。北岸先切掉的，正是三组最有用的那只手。”',
    background: 'twoGroups', historical: 'fictional', next: 's3-prologue-first-response',
  },
  {
    id: 's3-prologue-impact-org4', chapter: 'prologue', actLabel, date,
    location: '镜花水月 · 投票页', mode: 'chat', speaker: 'tiesuiya', portrait: 'tiesuiya',
    text: '铁碎牙打开成员投票，确认键却被锁成灰色：“北岸说冻结只针对执行权限。可一张不能执行的票，就是一张给别人看的纸。”',
    background: 'rewardHall', historical: 'fictional', next: 's3-prologue-first-response',
  },
  {
    id: 's3-prologue-impact-org5', chapter: 'prologue', actLabel, date,
    location: '心之所向 · 外联终端', mode: 'chat', speaker: 'jianwen', portrait: 'jianwen',
    text: '剑问白玉京盯着连续退回的三条消息：“联系人还在，通道也没丢。可现在每发一句，都要先交出是谁、替谁说话、还认识谁。”',
    background: 'nightMessage', historical: 'fictional', next: 's3-prologue-first-response',
  },
  {
    id: 's3-prologue-impact-org6', chapter: 'prologue', actLabel, date,
    location: '{{organizationName}} · 席位页', mode: 'chat', speaker: 'avucii', portrait: 'avucii',
    text: 'AVUCII把页面推给你：第六席仍亮着，下面却多了一行“临时观察组织”：“名字没删，决定权先被括号括起来了。”',
    background: 'sixthSeat', historical: 'fictional', next: 's3-prologue-first-response',
  },
  {
    id: 's3-prologue-first-response', chapter: 'prologue', actLabel, date,
    title: '第一次公开回应', location: '联合会客厅 · 全区直播', mode: 'chat', speaker: 'player', portrait: 'player',
    text: '沈知行把麦克风推到你面前。冻结已经造成损失；现在所有人都在等你先定义，这是一场保护、一次吞并，还是一份尚未证明必要的临时措施。',
    background: 'worldChat', historical: 'fictional',
    choices: [
      {
        id: 's3-demand-evidence', label: '“先公开触发冻结的证据，再谈备案。”', tone: 'calm',
        effects: [{ type: 'variable', key: 's3OpeningResponse', value: 'evidence' }, { type: 'stat', key: 'evidence', value: 1 }],
        next: 's3-prologue-reply-evidence',
      },
      {
        id: 's3-conditional-acceptance', label: '“可以临时执行，但写明期限、范围和自动失效条件。”', tone: 'warm',
        effects: [{ type: 'variable', key: 's3OpeningResponse', value: 'conditional' }, { type: 'stat', key: 'reputation', value: 1 }],
        next: 's3-prologue-reply-conditional',
      },
      {
        id: 's3-public-refusal', label: '“冻结立即停止。北岸无权先执行、后解释。”', tone: 'bold',
        effects: [{ type: 'variable', key: 's3OpeningResponse', value: 'refusal' }, { type: 'stat', key: 'cohesion', value: 1 }],
        next: 's3-prologue-reply-refusal',
      },
      {
        id: 's3-hold-and-investigate', label: '“我暂不替组织表态。七十二小时内，我先查清你们掌握了什么。”', tone: 'secret',
        effects: [{ type: 'variable', key: 's3OpeningResponse', value: 'investigate' }, { type: 'stat', key: 'resources', value: 1 }],
        next: 's3-prologue-reply-investigate',
      },
    ],
  },
  {
    id: 's3-prologue-reply-evidence', chapter: 'prologue', actLabel, date,
    location: '联合会客厅', mode: 'novel', speaker: 'shen-zhixing', portrait: 'shen-zhixing',
    text: '沈知行看了你两秒，把密封附件推到桌边：“可以。今天十八点公开事故摘要；作为交换，你来核对被删去身份的原始记录。要求证据的人，也要承担看完证据以后改口的责任。”',
    background: 'warRoom', historical: 'fictional', next: 's3-prologue-goal',
  },
  {
    id: 's3-prologue-reply-conditional', chapter: 'prologue', actLabel, date,
    location: '联合会客厅', mode: 'novel', speaker: 'shen-zhixing', portrait: 'shen-zhixing',
    text: '沈知行拿笔划掉“另行通知”：“七十二小时。到时没有书面延期，权限自动恢复。你替所有人争到一只钟，也把自己的名字写进了监督栏。”',
    background: 'warRoom', historical: 'fictional', next: 's3-prologue-goal',
  },
  {
    id: 's3-prologue-reply-refusal', chapter: 'prologue', actLabel, date,
    location: '联合会客厅', mode: 'novel', speaker: 'shen-zhixing', portrait: 'shen-zhixing',
    text: '会客厅里有人吸了口气。沈知行没有收回文件：“拒绝已记录。北岸不会因一句话撤销措施；但从现在起，每一项损失都会同时记在我的命令和你的反对意见下面。”',
    background: 'warRoom', historical: 'fictional', next: 's3-prologue-goal',
  },
  {
    id: 's3-prologue-reply-investigate', chapter: 'prologue', actLabel, date,
    location: '联合会客厅', mode: 'novel', speaker: 'shen-zhixing', portrait: 'shen-zhixing',
    text: '沈知行收回麦克风，却把访客权限留给了你：“可以观察。但七十二小时后，沉默也会被算成一种立场。你若想查，就从三年前那份没有归档的离区名单开始。”',
    background: 'warRoom', historical: 'fictional', next: 's3-prologue-goal',
  },
  {
    id: 's3-prologue-goal', chapter: 'prologue', actLabel, date,
    title: '七十二小时', location: '联合会客厅 · 散会后', mode: 'system', speaker: 'system',
    text: '【事件三目标】在临时冻结到期前，查明北岸启动审计的真实依据，保护本组织正在失去的具体权利，并决定是否联合其他组织重写这场表决的规则。你的第一次回应将在下一阶段改变证据、谈判和公开对抗的入口。',
    background: 'aftermath', historical: 'fictional',
    onEnter: [{ type: 'flag', key: 's3PrologueComplete' }], next: 's3-prologue-exit',
  },
  {
    id: 's3-prologue-exit', chapter: 'prologue', actLabel, date,
    location: '事件三 · 章节中心', mode: 'system', speaker: 'system',
    text: '事件三序章已完成。事件二结局快照与本次公开回应已保存；后续章节开放后将从七十二小时倒计时继续。',
    background: 'ending', historical: 'fictional',
  },
]
