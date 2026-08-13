import { romanceProfiles } from '@/content/romanceProfiles'

import type { NodeTarget, StoryNode } from '@/engine/types'
import type { RomanceCandidateId } from '@/content/romanceProfiles'

type RomanceStoryNode = StoryNode & { sideStory: 'romance' }

export const romanceReturnTarget = {
  type: 'stateVariable',
  key: 'romanceReturnNode',
  fallback: 'credits-first-season',
} satisfies NodeTarget

interface ChoiceScript {
  id: string
  label: string
  tone: 'calm' | 'bold' | 'warm' | 'danger' | 'secret'
  reply: string
}

interface RomanceNightMarketScript {
  dateLocation: string
  dateText: string
  dateChoices: [ChoiceScript, ChoiceScript]
  dateClosing: string
  confessionLocation: string
  confessionText: string
  acceptLabel: string
  acceptReply: string
  deferLabel: string
  deferReply: string
  dailyLocation: string
  dailyText: string
  dailyChoices: [ChoiceScript, ChoiceScript]
}

const scripts: Record<RomanceCandidateId, RomanceNightMarketScript> = {
  shana: {
    dateLocation: '幻想夜市 · 辣味食摊',
    dateText: '摊主举起两块木牌：“情侣套餐，还是临时同盟套餐？”夏娜扫了一眼价目表：“临时同盟要填三张表，情侣套餐只要付钱。今晚选手续少的。”她把要塞提醒扣在桌上，等你决定这顿饭怎么吃。',
    dateChoices: [
      { id: 'share-no-spice', label: '把没辣椒的半碗推给她：“一人一半，职位不参与分配。”', tone: 'warm', reply: '“可以。谁先提要塞，谁洗碗。”夏娜拆开第二双筷子，又把你的手机一起翻了个面。' },
      { id: 'challenge-spice-card', label: '接下摊主的辣味符卡：“输的人负责买饮料。”', tone: 'bold', reply: '夏娜面不改色地吃完，随后买了两杯饮料：“我没输。这杯是防止首领在第一次约会当场阵亡。”' },
    ],
    dateClosing: '灯笼从食摊一路亮到河边。你们整晚没有讨论一次组织战，服务器也没有因此停服。夏娜评价：“看来新区偶尔允许两个人只吃饭。”',
    confessionLocation: '幻想夜市 · 符卡烟火台',
    confessionText: '最后一枚符卡烟火散开，夏娜没有替你分析利弊：“建议是我给你的，喜欢你是我自己做的决定。你不用把答案写成组织决议。”',
    acceptLabel: '“那就正式交往。决定由我们两个人一起负责。”',
    acceptReply: '“通过。”夏娜停了一下，“不是表决通过，是我答应。下次约会仍然禁止临时插入要塞会议。”',
    deferLabel: '“我很在意你，但想再慢一点确认。”',
    deferReply: '“这也算答案。”夏娜把烟火票根交给你，“不用现在通过，下一次照样可以只吃饭。”',
    dailyLocation: '幻想夜市 · 夜宵摊',
    dailyText: '夏娜占住靠窗的位置，桌上仍然只有一份夜宵：“系统说情侣共享仓库。我认为系统在骗第二份餐费。今晚怎么分？”',
    dailyChoices: [
      { id: 'daily-split', label: '把筷子拆成两双：“沿用第一次约会的规则。”', tone: 'warm', reply: '“规则有效。”她把更大的一半推给你，“但份量由现场负责人解释。”' },
      { id: 'daily-order-another', label: '再点一份：“恋爱不等于共享饥饿值。”', tone: 'calm', reply: '夏娜点头：“这是你上任以来最没有争议的资源决策。”' },
    ],
  },
  qifu: {
    dateLocation: '幻想夜市 · 御守神社',
    dateText: '御守摊把平安、胜运与姻缘画成三种管理员图标。祈福下意识想把说明置顶，摊主提醒：“普通游客没有群公告权限。”祈福盯着空下来的手：“那今晚，我自己选？”',
    dateChoices: [
      { id: 'choose-own-charm', label: '“自己挑。没有人等你代表整个一组。”', tone: 'warm', reply: '祈福取下最普通的平安御守：“原来只替自己选，反而要想更久。”' },
      { id: 'draw-private-fortune', label: '和祈福共抽一张不公开的签：“这次不发群。”', tone: 'secret', reply: '签上只写“别把软话做成公告”。祈福把它折好：“难得有一条规定，我愿意不公开执行。”' },
    ],
    dateClosing: '离开神社时，祈福没有带走任何权限形状的御守，只把那张私人签放进衣袋。摊主失去一笔企业版套餐订单，显得十分遗憾。',
    confessionLocation: '幻想夜市 · 鸟居外',
    confessionText: '祈福在鸟居内侧站定，把管理员徽章摘下来挂在栏杆上——这已经是她今晚第二次摘它。“戴着它，我说什么你都分不清是公告还是私信。”她转过身，“所以现在听好：我想留你。发送对象，一个人。”',
    acceptLabel: '牵住祈福的手：“那就以自己的名字，和我交往。”',
    acceptReply: '“好。”祈福没有补充组织前缀，“这条消息只发送给你，也不撤回。”',
    deferLabel: '“先保留这句私人邀请，我想再走近一点。”',
    deferReply: '“可以。”祈福收起徽章却没有重新戴上，“我第一次发现，等待不一定要开全员提醒。”',
    dailyLocation: '幻想夜市 · 神社石阶',
    dailyText: '祈福写好三版约会通知，又全部删掉：“两个人的行程好像不需要公告格式。今天你来教我怎么只发一条消息。”',
    dailyChoices: [
      { id: 'daily-one-message', label: '替祈福删到只剩：“我在石阶等你。”', tone: 'warm', reply: '祈福按下发送：“比三百字公告难写，但收到回复快得多。”' },
      { id: 'daily-no-message', label: '直接在祈福身边坐下：“已经见面，不用再通知。”', tone: 'calm', reply: '祈福关掉编辑框：“原来最及时的公告，是人已经来了。”' },
    ],
  },
  chenyi: {
    dateLocation: '幻想夜市 · 延迟信箱',
    dateText: '这里的消息十分钟后才会送达，没有已读，也禁止催促。摊主补充：“@全体成员另收二十。”辰逸把手从发送键移开：“这摊位靠治疗我的坏习惯盈利，商业模式很精准。”',
    dateChoices: [
      { id: 'send-and-wait', label: '写一张短笺投进去，陪他等满十分钟', tone: 'warm', reply: '辰逸看了三次钟，却没有碰信箱：“原来不追问，十分钟也会自己走完。”' },
      { id: 'walk-without-phone', label: '关掉手机：“今晚让消息找不到我们。”', tone: 'calm', reply: '“行。”辰逸把手机塞进口袋，“第一次约会失联十分钟，听着比全区禁言健康多了。”' },
    ],
    dateClosing: '信箱在身后亮起送达提示。辰逸没有回头，只问你下一盏灯想往哪边走。那盏灯一直亮着，亮到你们拐过街角，也没人去取。',
    confessionLocation: '幻想夜市 · 回声井',
    confessionText: '辰逸没有把话说成改过自新的奖状：“我不会说因为喜欢你才做错事，也不会拿改变换你的答复。我喜欢你，但这条消息不要求立即回复。”',
    acceptLabel: '“我现在回答，是因为我愿意和你交往。”',
    acceptReply: '辰逸先深呼吸，才说“收到”：“不是权限确认。我只是……很高兴，而且会记得你以后仍然可以说不。”',
    deferLabel: '“我听见了，但现在还不能答应交往。”',
    deferReply: '“明白。”辰逸没有追问原因，“这次我负责让答案停在它该停的位置。”',
    dailyLocation: '幻想夜市 · 无已读小径',
    dailyText: '辰逸递来两张写到一半的明信片：“今天的练习是不猜你为什么没立刻说话。我们可以寄，也可以留白。”',
    dailyChoices: [
      { id: 'daily-mail-card', label: '写下今天最好笑的一件事，和他交换寄出', tone: 'warm', reply: '他读完笑了一声：“没有隐藏意思？太好了，我终于不用给标点符号开庭。”' },
      { id: 'daily-leave-blank', label: '把空白明信片收好：“沉默也可以只是沉默。”', tone: 'calm', reply: '“那就留白。”辰逸把笔帽扣上，“今天不替空白编理由。”' },
    ],
  },
  swordheart: {
    dateLocation: '幻想夜市 · 符卡靶场',
    dateText: '剑斩凡人心提前十分钟抵达，替你检查完靶场、箭羽和紧急出口，却忘了在约会签到表签名。系统因此判定两人双双缺勤。她看着红字：“很好，第一次约会先创造一项共同违纪。”',
    dateChoices: [
      { id: 'shoot-together', label: '和她共用一张符卡，挑战双人靶', tone: 'bold', reply: '最后一箭擦过靶心。她记下成绩：“配合合格，约会表现不录入战力排行。”' },
      { id: 'write-rest-task', label: '在签到表补写：“今日任务：休息。”', tone: 'warm', reply: '剑斩凡人心认真盖章：“任务已接。困难等级暂定最高，因为我们都不熟练。”' },
    ],
    dateClosing: '靶场关灯时，她没有补签缺勤记录，只把票根夹进出勤表最后一页：“这页不交组织。”',
    confessionLocation: '幻想夜市 · 巡夜桥',
    confessionText: '剑斩凡人心合上表：“活动结束我会下线，职责结束我会休息。但见你这件事，我不想写成任务。没有奖励，我也会来。”',
    acceptLabel: '“那以后以恋人的身份，继续提前十分钟见面。”',
    acceptReply: '“确认。”她把你的名字移到自己旁边，“这一栏不统计缺勤，只记录想不想来。”',
    deferLabel: '“先保留那十分钟，我还没准备好定义关系。”',
    deferReply: '“可以。”她划掉截止日期，“私人事项不设强制完成时间。”',
    dailyLocation: '幻想夜市 · 休息登记处',
    dailyText: '休息登记处要求填写“不工作证明”。剑斩凡人心握着笔：“系统让人证明自己没在加班，本身就很像加班。”',
    dailyChoices: [
      { id: 'daily-refuse-form', label: '拉她离开登记处：“不填，本次休息无组织批准。”', tone: 'bold', reply: '她收起笔：“第一次无审批休息，执行成功。风险由恋人共同承担。”' },
      { id: 'daily-write-each-other', label: '在理由栏写：“今天有人陪。”', tone: 'warm', reply: '她看了一会才落章：“这个理由可以长期复用。”' },
    ],
  },
  heartbeat: {
    dateLocation: '幻想夜市 · 妖怪食街',
    dateText: '心跳成瘾试吃了十个摊位，身后却跟来十一名询问入组的摊主。她还在计算转化率：“这不叫工作，叫夜市自然增长。”第十二名摊主递来报名表，你决定先救谁。',
    dateChoices: [
      { id: 'take-away-survey', label: '收走统计表：“现在只问你想吃什么。”', tone: 'warm', reply: '心跳愣了两秒，指向最不起眼的糖摊：“这个。别记，我不想让个人偏好进入招募模型。”' },
      { id: 'draw-mystery-snack', label: '陪她抽一次神秘点心签，但拒绝附赠入组二维码', tone: 'bold', reply: '抽中“报名人数减一”。心跳叹气：“约会运气不错，运营数据遭到重创。”' },
    ],
    dateClosing: '你们终于甩掉报名队伍，坐到没有摊主营业的河边。心跳第一次没有数空位，只数两个人手里的糖够不够分。',
    confessionLocation: '幻想夜市 · 空白招募板',
    confessionText: '心跳把招募板翻到背面：“这次不是扩张目标，也不计算七日留存。我只是想长期给你留一个位置。”',
    acceptLabel: '“可以交往，但恋爱不设KPI，也不做日报。”',
    acceptReply: '“成交。”心跳撕掉表格，“唯一指标是想见就来。这个指标暂时一百。”',
    deferLabel: '“位置先留着，但别把等待做成考核。”',
    deferReply: '“明白。”她在空白板上只画了一颗心，“没有截止时间，也没有催填机器人。”',
    dailyLocation: '幻想夜市 · 回访茶摊',
    dailyText: '心跳递来一份“恋爱满意度回访”，第一题是“是否同意销毁本问卷”。她已经替你把“同意”圈了三遍。',
    dailyChoices: [
      { id: 'daily-destroy-survey', label: '把问卷折成纸鹤放走', tone: 'warm', reply: '“回收率零，满意度未知。”心跳靠过来，“这是我见过最让人安心的坏数据。”' },
      { id: 'daily-one-question', label: '只留下一个问题：“今晚还想一起走吗？”', tone: 'calm', reply: '她写下“想”，又补一句：“这题可以每天重复，不算骚扰样本。”' },
    ],
  },
  yanqiu: {
    dateLocation: '幻想夜市 · 旧书占卜摊',
    dateText: '你们只买了两块点心，砚秋水却已经替“最后一块归谁”写出申诉、复核和回滚流程。占卜师看完规则，宣布今晚不预测未来：“未来说它压力很大。”',
    dateChoices: [
      { id: 'write-revisable-rule', label: '和她写一条可共同修订的约定', tone: 'calm', reply: '砚秋水在末尾加上双方签名栏：“可以变更，不许失踪。至少这条比占卜可靠。”' },
      { id: 'leave-blank-page', label: '合上规则册：“最后一页留给实际发生的事。”', tone: 'warm', reply: '“空白不是没有规则。”她把书交给你，“是承认我们现在还不知道。”' },
    ],
    dateClosing: '点心最终一人一半，没有举行复核。砚秋水把这次未经审议的分配记录为“罕见但可接受的成功案例”。',
    confessionLocation: '幻想夜市 · 河灯桥',
    confessionText: '砚秋水划掉“制度顾问”，在账本之外写下一栏：“我想知道你以后怎么选，不只是因为规则，也因为那个人是你。”',
    acceptLabel: '写下“恋人”：“可以修订相处方式，不随意抹掉彼此。”',
    acceptReply: '她收好笔：“条款成立。第一项权利：任何一方都可以说累，不触发退出组织。”',
    deferLabel: '保留空栏：“这次先不落笔，但我会继续来。”',
    deferReply: '“空栏保留。”砚秋水没有写截止日期，“不确定可以被记录，不必被处罚。”',
    dailyLocation: '幻想夜市 · 双人修订席',
    dailyText: '摊主送来“情侣争议标准答案”，砚秋水翻了两页：“没有申诉入口，属于无效文件。我们自己写今天的版本。”',
    dailyChoices: [
      { id: 'daily-add-rest-clause', label: '增加“争论累了可以先吃东西”条款', tone: 'warm', reply: '“全票通过。”她把点心推来，“本条立即生效，而且不接受空腹上诉。”' },
      { id: 'daily-tear-template', label: '撕掉标准答案：“我们不用别人代写。”', tone: 'bold', reply: '砚秋水把碎纸折成河灯：“销毁有点激进，但程序完整——双方都同意。”' },
    ],
  },
  huayue: {
    dateLocation: '幻想夜市 · 打烊清点处',
    dateText: '华月乌大王说只是顺路核对摊位，却提前买了两杯饮料。她指着清单：“别叫约会。表格听见以后会自动多生一列。”屏幕随即弹出“同行人”，气氛陷入短暂的技术性沉默。',
    dateChoices: [
      { id: 'finish-last-sheet', label: '陪她清完最后一张表，再一起离开', tone: 'calm', reply: '“行，一人一半。”华月分给你最乱的那半张，“这是信任，不是报复。大概。”' },
      { id: 'leave-firework-row', label: '故意留下最后一栏：“烟火结束再填。”', tone: 'warm', reply: '华月看向夜空：“一次。明天表格追责，我就说首领被符卡劫持了。”' },
    ],
    dateClosing: '夜市完全熄灯后，最后一栏仍然空着。华月没有催，只把第二杯饮料推到你手边：“今晚允许一件事不收尾。”',
    confessionLocation: '幻想夜市 · 无人值班台',
    confessionText: '华月把首领徽章放在清单旁：“残局我能接，决定我也能下。我缺的是做完以后，愿意看见我手还在抖的人。”',
    acceptLabel: '“以后站在同一行。不是上下级，是恋人。”',
    acceptReply: '“好。”华月终于关掉表格，“明晚八点，只@你一次。然后直接去好友列表抓人。”',
    deferLabel: '“我会陪你收尾，但想再慢一点走到恋人。”',
    deferReply: '“可以。”她重新拿起饮料而不是徽章，“慢不等于缺席，我分得清。”',
    dailyLocation: '幻想夜市 · 夜班休息区',
    dailyText: '系统又生成“情侣共同值班表”。华月盯着它：“谈恋爱以后自动增加劳动量，这功能究竟是谁验收的？”',
    dailyChoices: [
      { id: 'daily-delete-roster', label: '删除表格：“今晚共同休息。”', tone: 'bold', reply: '“批准。”华月按下永久删除，“恋人权限第一次使用，结果是少干一份活。”' },
      { id: 'daily-add-dessert', label: '把任务改成：“一起吃完两份甜点。”', tone: 'warm', reply: '她签上两个人的名字：“这个排班可以每天复制。”' },
    ],
  },
  wenxian: {
    dateLocation: '幻想夜市 · 花灯街',
    dateText: '八点整，温陷站在一排即将熄灭的花灯下。摊主的招牌写着“没人来，名字也算营业”。温陷看了很久：“这句话像安慰，也像一份经营事故报告。”',
    dateChoices: [
      { id: 'buy-unnamed-lanterns', label: '买下两盏没有组织名字的花灯', tone: 'warm', reply: '温陷接过其中一盏：“不写五组，也不写首领。原来一盏灯只写两个人，也能亮。”' },
      { id: 'promise-next-eight', label: '和她约定明晚八点再来，不拿人数作保证', tone: 'calm', reply: '“我记时间，不记战力。”温陷把提醒设成私人消息，“这次不需要招募文案。”' },
    ],
    dateClosing: '花灯街熄掉大半，你们手中的两盏仍亮着。没有人统计在线人数，也没有人因此宣布组织复兴。',
    confessionLocation: '幻想夜市 · 最后一盏花灯',
    confessionText: '温陷轻声说：“别人都问五组还剩几个人。你问我几点上线。那句只留给你的欢迎回来，我不想再装成组织公告。”',
    acceptLabel: '“我回来不是补人数。我想以恋人的身份留下。”',
    acceptReply: '温陷终于笑了：“欢迎回来。只有四个字，不招募任何别人。”',
    deferLabel: '“我会继续赴约，但不想因为害怕空下就仓促交往。”',
    deferReply: '“这样才对。”温陷护住灯火，“你不是拿来填空位的人，我会记住。”',
    dailyLocation: '幻想夜市 · 花灯长椅',
    dailyText: '温陷带来两盏新灯，一盏写“还在”，另一盏空着：“今天不讨论组织名字。空的这盏，你想写什么？”',
    dailyChoices: [
      { id: 'daily-write-tomorrow', label: '写下“明天八点”', tone: 'warm', reply: '“时间比口号可靠。”温陷把两盏灯挂在一起，“明天我也会来。”' },
      { id: 'daily-draw-flower', label: '不写字，只画一朵没有名字的花', tone: 'calm', reply: '温陷看着花笑：“没有名字也不会消失。至少今晚不会。”' },
    ],
  },
  takemehand: {
    dateLocation: '幻想夜市 · 静铃巷',
    dateText: '静铃巷的消息会随机延迟。摊主兜售“高级版已读隐藏”，takemehand看了一眼价格：“免费版就是别盯着别人有没有回。这个功能人类本来就自带。”',
    dateChoices: [
      { id: 'wait-one-ring', label: '只敲一次铃，安静等回应', tone: 'calm', reply: '两分钟后铃才亮。takemehand笑了：“你真的没按第二次。这个巷子应该给你发成就。”' },
      { id: 'walk-before-reply', label: '先往前走：“回复可以追上我们。”', tone: 'warm', reply: 'takemehand跟上来：“好。消息不是绳子，人不必拴在输入框旁边。”' },
    ],
    dateClosing: '离开巷子时，最后一声铃才迟到。你们谁也没有回头处罚它，系统被迫承认延迟不构成叛变。',
    confessionLocation: '幻想夜市 · 无禁言钟楼',
    confessionText: 'takemehand故意晚了两分钟才说：“我想确认你会不会因为没被立刻回应就改变。你没有。那我现在认真回答——下一段路，我想跟你。”',
    acceptLabel: '“不是以成员身份。以恋人的身份一起走。”',
    acceptReply: '“好。”takemehand把静音按钮交给你又收回，“不需要互相掌握权限，也能确定关系。”',
    deferLabel: '“我愿意等，但现在先保持这份信任。”',
    deferReply: '“谢谢你没有把等待说成债。”takemehand敲响一次铃，“以后想回答时，我会回答。”',
    dailyLocation: '幻想夜市 · 延迟茶馆',
    dailyText: '茶馆规定下单后两分钟不能催。takemehand把计时器倒扣：“我们已经学会了，今天可以把两分钟拿来做别的。”',
    dailyChoices: [
      { id: 'daily-watch-lanterns', label: '一起看窗外灯笼，不检查进度', tone: 'warm', reply: '茶先到了，谁也没注意。takemehand端起杯子：“看，不盯着也会来。”' },
      { id: 'daily-late-reply-game', label: '约定谁先催谁买单', tone: 'secret', reply: '两个人同时保持沉默，最后被店员判定恶意占桌。takemehand笑到先认输。' },
    ],
  },
  xilufei: {
    dateLocation: '幻想夜市 · 面具与权限摊',
    dateText: '希露菲戴着狐狸面具，手里是一张“管理员体验券”。摊主强调只能改菜单名、不能踢客人。他遗憾地说：“权限被设计得这么安全，乐趣至少下降百分之六十。”',
    dateChoices: [
      { id: 'rename-menu', label: '陪他把菜单改成荒唐的组织公告', tone: 'bold', reply: '“稀有饰品味烤团子”三分钟卖空。希露菲郑重总结：“诈骗不行，标题党仍然是生产力。”' },
      { id: 'remove-masks', label: '摘下面具，认真和他吃完一顿', tone: 'warm', reply: '希露菲也摘下面具：“原来不伪装身份还能吃饭。老区从来没人教这个高级玩法。”' },
    ],
    dateClosing: '离开前，希露菲主动归还体验券，还把改乱的菜单恢复原状。摊主反复检查成员列表，似乎不相信今晚竟然没人被踢。',
    confessionLocation: '幻想夜市 · 服务器边界',
    confessionText: '希露菲晃着两张空白身份卡：“下个新区还玩吗？以前我们会先决定谁假装不认识谁。这次你想怎么演？”',
    acceptLabel: '“公开场合可以拆台，私聊里别装陌生。和我交往。”',
    acceptReply: '“这个剧本不错。”希露菲撕掉空白身份卡，“恋人身份是真的，其他角色随时换皮。”',
    deferLabel: '“先不固定身份，但别再用消失制造悬念。”',
    deferReply: '“成交。”他把暗号发给你，“混乱可以演，失联不拿来当剧情。”',
    dailyLocation: '幻想夜市 · 安全权限体验馆',
    dailyText: '今天的管理员体验券只允许修改自己的昵称。希露菲十分失望：“这个权限甚至不能伤害无辜，只能伤害审美。”',
    dailyChoices: [
      { id: 'daily-couple-names', label: '和他互换一分钟情侣昵称', tone: 'secret', reply: '一分钟后两人立刻改回。希露菲评价：“甜度超标，作为黑历史永久保留。”' },
      { id: 'daily-audit-prank', label: '设计一个所有人都能一眼看穿的假公告', tone: 'bold', reply: '公告写“今晚禁止上线”，群里瞬间全员上线反对。希露菲鼓掌：“无害，而且提升活跃。”' },
    ],
  },
  yyt: {
    dateLocation: '幻想夜市 · 符卡辩论擂台',
    dateText: '擂台把每条反对意见做成一枚弹幕。裁判看见你们并肩入场，先开出“情侣争执罚单”。yyT把罚单拍回去：“还不是。即使以后是，也不归你提前执法。”',
    dateChoices: [
      { id: 'attack-real-blindspot', label: '请她攻击你真正忽略的一条规则', tone: 'bold', reply: 'yyT的弹幕直穿防线：“你总替沉默的人做决定。看见没？约会也不影响我指出这个。”' },
      { id: 'argue-opposite-side', label: '替自己不赞同的立场辩一次，让她负责反驳', tone: 'calm', reply: '三轮后你输得很完整。yyT收起符卡：“至少你愿意证明，理解不等于投降。”' },
    ],
    dateClosing: '裁判最终撤销情侣罚单，理由是“双方争论过于专业，不像情侣”。yyT把撤销通知留作纪念：“这种偏见以后再一起推翻。”',
    confessionLocation: '幻想夜市 · 章程背面',
    confessionText: 'yyT把最早的章程翻到空白背面：“我公开反对你的时候，你还会喜欢我吗？我要的不是允许反对，是反对以后仍然被当成完整的人。”',
    acceptLabel: '“会。正式交往，但谁也没有否决对方的权限。”',
    acceptReply: 'yyT签下自己的名字：“通过。提醒你，我以后仍会在公共群说你错了。私聊里也会。”',
    deferLabel: '“我尊重你的反对，但还需要时间确认恋爱关系。”',
    deferReply: '“合理。”yyT没有要求复议，“能说不，本来就是这份关系值不值得继续的第一项测试。”',
    dailyLocation: '幻想夜市 · 双人反方席',
    dailyText: '今日题目是“恋人是否必须保持意见一致”。yyT抽到正方，脸色比输掉要塞还难看：“这题库需要立刻整改。”',
    dailyChoices: [
      { id: 'daily-switch-sides', label: '和她交换立场，论证“不一致也能相爱”', tone: 'warm', reply: 'yyT赢下反方后牵住你的手：“论证成立。动作属于补充证据。”' },
      { id: 'daily-refuse-premise', label: '一起拒绝题目：“恋人不是合并组织。”', tone: 'bold', reply: '裁判判双方消极比赛。yyT收下罚单：“第一次共同违规，理由写得不错。”' },
    ],
  },
  avucii: {
    dateLocation: '幻想夜市 · 失物招领处',
    dateText: 'AVUCII替别人整理了钥匙、徽章、排班表和一名“轻度使用过的首领”，却忘了自己的晚饭。她还在贴标签：“先处理完最后三件。”你数了数，桌上明显还有十九件。',
    dateChoices: [
      { id: 'share-lost-found', label: '把清单分成两半：“你的名字也写进承担者。”', tone: 'warm', reply: 'AVUCII接过一半：“好。但先更正，不是你帮我，是我们共同负责。包括那名首领。”' },
      { id: 'confiscate-checklist', label: '暂时收走工作表，陪她走完整条夜市', tone: 'bold', reply: 'AVUCII跟出两步又回头确认门锁，随后才笑：“失物招领处第一次把负责人也弄丢了。”' },
    ],
    dateClosing: '你们回来时，十九件失物一件没逃跑。AVUCII终于吃到凉透的晚饭，并把“负责人需要吃饭”加入永久流程。',
    confessionLocation: '幻想夜市 · 最后一行',
    confessionText: 'AVUCII把今天的表格都存了档，唯独摊开的这张，最后一行空着。她用笔帽点了点那行空白：“我数过，今天替别人收了十九件东西，没有一件是我的。”她把笔放下，“这行我不想写‘待办’。我想写——明天你上线，能不能先来见我？”',
    acceptLabel: '在“明日同行”写下两个人的名字：“以恋人的身份。”',
    acceptReply: 'AVUCII看了很久才按保存：“收到。第一次有一张表，不需要提交给任何组织。”',
    deferLabel: '“我会先来见你，但关系名称再等等。”',
    deferReply: '“可以。”她保留空白，没有填上“待办”，“想见面不是欠下的任务。”',
    dailyLocation: '幻想夜市 · 明日清单桌',
    dailyText: 'AVUCII准备了约会、交接、仓库与休息四张表。最上面一张却只写：“今天先看你想做什么。”',
    dailyChoices: [
      { id: 'daily-close-all-sheets', label: '关掉四张表，牵她去看河灯', tone: 'warm', reply: '她没有回头：“所有文件已保存。现在执行唯一未编号的行程。”' },
      { id: 'daily-write-shared-row', label: '在休息表写下两个人的名字', tone: 'calm', reply: 'AVUCII把状态改成“共同进行中”：“这次不用等我交接完才开始。”' },
    ],
  },
}

const baseNode = (
  node: Omit<RomanceStoryNode, 'chapter' | 'actLabel' | 'date' | 'historical' | 'sideStory'>,
  actLabel: string,
): RomanceStoryNode => ({
  chapter: 'epilogue',
  actLabel,
  date: '2026-07-29',
  historical: 'fictional',
  sideStory: 'romance',
  ...node,
})

const buildCharacterNodes = (character: RomanceCandidateId): RomanceStoryNode[] => {
  const profile = romanceProfiles[character]
  const script = scripts[character]
  const dateReplyIds = [
    `${profile.firstDateNodeId}-reply-a`,
    `${profile.firstDateNodeId}-reply-b`,
  ] as const
  const dateCompleteId = `${profile.firstDateNodeId}-complete`
  const acceptedId = `${profile.confessionNodeId}-accepted`
  const deferredId = `${profile.confessionNodeId}-deferred`
  const dailyReplyIds = [
    `${profile.dailyNodeId}-reply-a`,
    `${profile.dailyNodeId}-reply-b`,
  ] as const

  return [
    baseNode({
      id: profile.firstDateNodeId,
      title: profile.dateTitle,
      location: script.dateLocation,
      mode: 'chat',
      speaker: character,
      portrait: character,
      text: script.dateText,
      background: profile.sceneBackgrounds.date,
      presentation: {
        ui: 'classic',
        transition: 'crossfade',
        camera: 'push-in',
        atmosphere: 'petals',
        sprites: [{ character, expression: 'shy', pose: 'base', position: 'center', scale: 1.02 }],
      },
      choices: script.dateChoices.map((choice, index) => ({
        id: `romance-${character}-${choice.id}`,
        label: choice.label,
        tone: choice.tone,
        next: dateReplyIds[index]!,
      })),
    }, `幻想夜市 · ${profile.dateTitle}`),
    ...script.dateChoices.map((choice, index) => baseNode({
      id: dateReplyIds[index]!,
      location: script.dateLocation,
      mode: 'chat',
      speaker: character,
      portrait: character,
      text: choice.reply,
      background: profile.sceneBackgrounds.date,
      presentation: {
        ui: 'classic',
        transition: 'crossfade',
        camera: 'hold',
        atmosphere: 'petals',
        sprites: [{ character, expression: index === 0 ? 'relaxed' : 'surprised', pose: 'relaxed', position: 'center', scale: 1.02 }],
      },
      next: dateCompleteId,
    }, `幻想夜市 · ${profile.dateTitle}`)),
    baseNode({
      id: dateCompleteId,
      location: script.dateLocation,
      mode: 'novel',
      speaker: character,
      portrait: character,
      text: script.dateClosing,
      background: profile.sceneBackgrounds.date,
      presentation: {
        // The first-date CG is reserved for the shared emotional payoff after either player choice.
        cg: profile.firstDateCg,
        cgAlt: profile.firstDateCgAlt,
        ui: 'cinematic',
        transition: 'crossfade',
        camera: 'pull-back',
        atmosphere: 'petals',
        focus: 'center',
      },
      onEnter: [
        { type: 'flag', key: profile.completionFlag },
        { type: 'unlockCg', id: profile.firstDateCgId },
        { type: 'relationshipProgress', character, value: 20 },
        { type: 'relationship', character, key: 'trust', value: 1 },
        { type: 'relationship', character, key: 'affinity', value: 1 },
      ],
      next: romanceReturnTarget,
    }, `幻想夜市 · ${profile.dateTitle}`),
    baseNode({
      id: profile.confessionNodeId,
      title: profile.confessionTitle,
      location: script.confessionLocation,
      mode: 'chat',
      speaker: character,
      portrait: character,
      text: script.confessionText,
      background: profile.sceneBackgrounds.confession,
      presentation: {
        ui: 'classic',
        transition: 'crossfade',
        camera: 'push-in',
        atmosphere: 'petals',
        sprites: [{ character, expression: 'serious', pose: 'base', position: 'center', scale: 1.04 }],
      },
      choices: [
        {
          id: `romance-${character}-accept`,
          label: script.acceptLabel,
          tone: 'warm',
          effects: [
            { type: 'activePartner', character },
            { type: 'flag', key: profile.partnerFlag },
            { type: 'unlockEnding', id: profile.bondEndingId },
            { type: 'unlockCg', id: profile.bondCgId },
          ],
          next: acceptedId,
        },
        {
          id: `romance-${character}-defer`,
          label: script.deferLabel,
          tone: 'calm',
          next: deferredId,
        },
      ],
    }, `幻想夜市 · ${profile.confessionTitle}`),
    baseNode({
      id: acceptedId,
      location: script.confessionLocation,
      mode: 'chat',
      speaker: character,
      portrait: character,
      text: script.acceptReply,
      background: profile.sceneBackgrounds.confession,
      presentation: {
        cg: profile.confessionCg,
        cgAlt: profile.confessionCgAlt,
        cgPlaceholderFor: profile.confessionCgFinal,
        cgPromptRef: profile.confessionCgPromptRef,
        ui: 'cinematic',
        transition: 'crossfade',
        camera: 'push-in',
        atmosphere: 'petals',
        focus: 'center',
      },
      onEnter: [{ type: 'unlockCg', id: profile.confessionCgId }],
      next: romanceReturnTarget,
    }, `幻想夜市 · ${profile.confessionTitle}`),
    baseNode({
      id: deferredId,
      location: script.confessionLocation,
      mode: 'chat',
      speaker: character,
      portrait: character,
      text: script.deferReply,
      background: profile.sceneBackgrounds.confession,
      presentation: {
        ui: 'classic',
        transition: 'crossfade',
        camera: 'pull-back',
        atmosphere: 'petals',
        sprites: [{ character, expression: 'relaxed', pose: 'relaxed', position: 'center', scale: 1.02 }],
      },
      next: romanceReturnTarget,
    }, `幻想夜市 · ${profile.confessionTitle}`),
    baseNode({
      id: profile.dailyNodeId,
      title: profile.dailyTitle,
      location: script.dailyLocation,
      mode: 'chat',
      speaker: character,
      portrait: character,
      text: script.dailyText,
      background: profile.sceneBackgrounds.daily,
      presentation: {
        ui: 'classic',
        transition: 'crossfade',
        camera: 'push-in',
        atmosphere: 'petals',
        sprites: [{ character, expression: 'relaxed', pose: 'relaxed', position: 'center', scale: 1.03 }],
      },
      // enterNode processes this only once; later replays keep the scene but cannot farm relationship values.
      onEnter: [
        { type: 'flag', key: profile.dailyFlag },
        { type: 'relationship', character, key: 'trust', value: 1 },
        { type: 'relationship', character, key: 'affinity', value: 1 },
      ],
      choices: script.dailyChoices.map((choice, index) => ({
        id: `romance-${character}-${choice.id}`,
        label: choice.label,
        tone: choice.tone,
        next: dailyReplyIds[index]!,
      })),
    }, `恋爱日常 · ${profile.dailyTitle}`),
    ...script.dailyChoices.map((choice, index) => baseNode({
      id: dailyReplyIds[index]!,
      location: script.dailyLocation,
      mode: 'chat',
      speaker: character,
      portrait: character,
      text: choice.reply,
      background: profile.sceneBackgrounds.daily,
      presentation: {
        ui: 'classic',
        transition: 'crossfade',
        camera: 'hold',
        atmosphere: 'petals',
        sprites: [{ character, expression: index === 0 ? 'shy' : 'surprised', pose: 'relaxed', position: 'center', scale: 1.03 }],
      },
      next: romanceReturnTarget,
    }, `恋爱日常 · ${profile.dailyTitle}`)),
  ]
}

export const romanceNightMarketEntryPoints = Object.fromEntries(
  (Object.keys(romanceProfiles) as RomanceCandidateId[]).map((character) => {
    const profile = romanceProfiles[character]
    return [character, {
      firstDate: profile.firstDateNodeId,
      confession: profile.confessionNodeId,
      daily: profile.dailyNodeId,
    }]
  }),
) as Record<RomanceCandidateId, { firstDate: string; confession: string; daily: string }>

export const romanceNightMarketNodes: RomanceStoryNode[] = (
  Object.keys(romanceProfiles) as RomanceCandidateId[]
).flatMap(buildCharacterNodes)
