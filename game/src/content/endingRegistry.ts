import type { RouteId, SceneUiSkin } from '@/engine/types'

export interface EndingEntry {
  id: string
  title: string
  subtitle: string
  skin: SceneUiSkin
  route?: RouteId
  /** 隐藏结局，需满足蝴蝶效应条件才显示 */
  conditionFlags?: string[]
  /** 0 = 基础结局，1 = 蝴蝶变体，2 = 隐藏结局 */
  tier: 0 | 1 | 2
}

export const ENDING_REGISTRY: EndingEntry[] = [
  // ──────────────── 第一组织（route1）─ 2 个基础结局 ────────────────
  { id: 'r1-order', title: '秩序的起点', subtitle: '第一席 · 持剑而立', skin: 'ending', route: 'org1', tier: 0 },
  { id: 'r1-voice', title: '未竟之声', subtitle: '第一席 · 振聋发聩', skin: 'ending', route: 'org1', tier: 0 },

  // ──────────────── 第二组织（route2 / 江南）─ 4 基础 + 3 变体 ────────────────
  { id: 'r2-second-pole', title: '第二极', subtitle: '江南 · 双星同辉', skin: 'ending', route: 'org2', tier: 0 },
  { id: 'r2-war-machine', title: '战争机器', subtitle: '江南 · 铁与血', skin: 'ending', route: 'org2', tier: 0 },
  { id: 'r2-won-lost-chat', title: '赢下要塞，输掉群聊', subtitle: '江南 · 胜者的孤独', skin: 'ending-lament', route: 'org2', tier: 0 },
  { id: 'r2-alone', title: '一个人的江南', subtitle: '江南 · 人去楼空', skin: 'ending-lament', route: 'org2', tier: 0 },
  { id: 'r2-tyrant', title: '霸王', subtitle: '江南 · 铁腕之下', skin: 'ending-dark', route: 'org2', tier: 1, conditionFlags: ['bf_ruthless'] },
  { id: 'r2-peacemaker', title: '调停者', subtitle: '江南 · 化干戈为玉帛', skin: 'ending-triumph', route: 'org2', tier: 1, conditionFlags: ['bf_peacemaker'] },
  { id: 'r2-lonely', title: '孤城', subtitle: '江南 · 所有人都离开了', skin: 'ending-lament', route: 'org2', tier: 1, conditionFlags: ['bf_opportunist'] },

  // ──────────────── 第三组织（route3）─ 4 基础 + 3 变体 ────────────────
  { id: 'r3-alliance-hub', title: '联盟中枢', subtitle: '抚梅观清雪 · 群雄来朝', skin: 'ending', route: 'org3', tier: 0 },
  { id: 'r3-talent-market', title: '人才市场', subtitle: '抚梅观清雪 · 人尽其才', skin: 'ending', route: 'org3', tier: 0 },
  { id: 'r3-expansion-empire', title: '扩张帝国', subtitle: '抚梅观清雪 · 版图无垠', skin: 'ending', route: 'org3', tier: 0 },
  { id: 'r3-successful-refusal', title: '一次成功的拒绝', subtitle: '抚梅观清雪 · 婉拒也是力量', skin: 'ending-lament', route: 'org3', tier: 0 },
  { id: 'r3-diplomat', title: '外交家', subtitle: '抚梅观清雪 · 纵横四海', skin: 'ending-triumph', route: 'org3', tier: 1, conditionFlags: ['bf_peacemaker'] },
  { id: 'r3-cold-tyranny', title: '冷血经营', subtitle: '抚梅观清雪 · 效率即正义', skin: 'ending-dark', route: 'org3', tier: 1, conditionFlags: ['bf_ruthless'] },
  { id: 'r3-schemer', title: '棋手', subtitle: '抚梅观清雪 · 无人知晓的胜利', skin: 'ending-secret', route: 'org3', tier: 2, conditionFlags: ['bf_shadow_master'] },

  // ──────────────── 第四组织（route4）─ 4 基础 + 3 变体 ────────────────
  { id: 'r4-reversible-rule', title: '可以推翻的决定', subtitle: '天上白玉京 · 这一票，你有', skin: 'ending', route: 'org4', tier: 0 },
  { id: 'r4-moderate-exit', title: '温和的离开', subtitle: '天上白玉京 · 体面告别', skin: 'ending-lament', route: 'org4', tier: 0 },
  { id: 'r4-correct-accounts-empty-room', title: '正确的空房间', subtitle: '天上白玉京 · 账目分明', skin: 'ending', route: 'org4', tier: 0 },
  { id: 'r4-voluntary-handoff', title: '把首领还给组织', subtitle: '天上白玉京 · 权力的交接', skin: 'ending', route: 'org4', tier: 0 },
  { id: 'r4-pilgrim', title: '朝圣者', subtitle: '天上白玉京 · 信仰之路', skin: 'ending-triumph', route: 'org4', tier: 1, conditionFlags: ['bf_devoted_heart'] },
  { id: 'r4-puppeteer', title: '提线者', subtitle: '天上白玉京 · 民主只是表象', skin: 'ending-secret', route: 'org4', tier: 2, conditionFlags: ['bf_schemer'] },
  { id: 'r4-warmonger', title: '好战者', subtitle: '天上白玉京 · 四面树敌', skin: 'ending-chaos', route: 'org4', tier: 1, conditionFlags: ['bf_warmonger'] },

  // ──────────────── 第五组织（route5）─ 4 基础 + 3 变体 ────────────────
  { id: 'r5-still-here', title: '还在', subtitle: '未闻花名 · 我还在，花还开', skin: 'ending', route: 'org5', tier: 0 },
  { id: 'r5-fire-two-proof', title: '火2证明', subtitle: '未闻花名 · 以火为证', skin: 'ending', route: 'org5', tier: 0 },
  { id: 'r5-protected-flower', title: '有条件的花', subtitle: '未闻花名 · 代价与守护', skin: 'ending', route: 'org5', tier: 0 },
  { id: 'r5-name-only', title: '只剩名字', subtitle: '未闻花名 · 花落无声', skin: 'ending-lament', route: 'org5', tier: 0 },
  { id: 'r5-chaos-bloom', title: '狂花', subtitle: '未闻花名 · 无秩序的花海', skin: 'ending-chaos', route: 'org5', tier: 1, conditionFlags: ['bf_anarchy'] },
  { id: 'r5-hidden-garden', title: '秘境', subtitle: '未闻花名 · 无人知晓的花园', skin: 'ending-secret', route: 'org5', tier: 2, conditionFlags: ['bf_shadow_master'] },
  { id: 'r5-cold-bloom', title: '霜华', subtitle: '未闻花名 · 心如铁石，花亦凋零', skin: 'ending-dark', route: 'org5', tier: 1, conditionFlags: ['bf_cold_heart'] },

  // ──────────────── 第六组织（route6）─ 5 基础 + 3 变体 ────────────────
  { id: 'r6-sixth-seat', title: '第六席', subtitle: '第六席 · 一个都不能少', skin: 'ending', route: 'org6', tier: 0 },
  { id: 'r6-satellite-seat', title: '卫星席位', subtitle: '第六席 · 环绕而不附庸', skin: 'ending', route: 'org6', tier: 0 },
  { id: 'r6-avucii-takes-seat', title: 'AVUCII接手', subtitle: '第六席 · 交接', skin: 'ending', route: 'org6', tier: 0 },
  { id: 'r6-merge-success', title: '成功解散', subtitle: '第六席 · 散作满天星', skin: 'ending-lament', route: 'org6', tier: 0 },
  { id: 'r6-hollow-seat', title: '空心席位', subtitle: '第六席 · 席位犹在，人已空', skin: 'ending-lament', route: 'org6', tier: 0 },
  { id: 'r6-shadow-seat', title: '第七席', subtitle: '第六席 · 看不见的力量', skin: 'ending-secret', route: 'org6', tier: 2, conditionFlags: ['bf_schemer'] },
  { id: 'r6-united-front', title: '统一战线', subtitle: '第六席 · 4945区大和解', skin: 'ending-triumph', route: 'org6', tier: 1, conditionFlags: ['bf_peacemaker'] },
  { id: 'r6-anarchy-reigns', title: '混乱纪元', subtitle: '第六席 · 无主之地', skin: 'ending-chaos', route: 'org6', tier: 1, conditionFlags: ['bf_anarchy'] },

  // ──────────────── 羁绊结局（12 个）─ tier 0 ────────────────
  { id: 'bond-shana', title: '夏娜 · 永恒的约定', subtitle: '羁绊 · 暮色露台', skin: 'cinematic', tier: 0 },
  { id: 'bond-heartbeat', title: '心跳支援 · 心跳不止', subtitle: '羁绊 · 战场后方', skin: 'cinematic', tier: 0 },
  { id: 'bond-qifu', title: 'Qifu · 棋逢对手', subtitle: '羁绊 · 深夜复盘', skin: 'cinematic', tier: 0 },
  { id: 'bond-yanqiu', title: '言秋 · 秋日私语', subtitle: '羁绊 · 落叶长椅', skin: 'cinematic', tier: 0 },
  { id: 'bond-wenxian', title: '文显 · 笔墨传情', subtitle: '羁绊 · 案前共读', skin: 'cinematic', tier: 0 },
  { id: 'bond-huayue', title: '花月 · 花间一梦', subtitle: '羁绊 · 河灯桥畔', skin: 'cinematic', tier: 0 },
  { id: 'bond-xilufei', title: '希露菲 · 不屈之翼', subtitle: '羁绊 · 风雨同行', skin: 'cinematic', tier: 0 },
  { id: 'bond-chenyi', title: '辰逸 · 并肩而立', subtitle: '羁绊 · 训练场外', skin: 'cinematic', tier: 0 },
  { id: 'bond-swordheart', title: '剑心 · 心剑合一', subtitle: '羁绊 · 道场余晖', skin: 'cinematic', tier: 0 },
  { id: 'bond-takemehand', title: '带我走 · 牵手', subtitle: '羁绊 · 夜市灯火', skin: 'cinematic', tier: 0 },
  { id: 'bond-avucii', title: 'AVUCII · 音乐与代码', subtitle: '羁绊 · 深夜频道', skin: 'cinematic', tier: 0 },
  { id: 'bond-yyt', title: 'YYT · 同行之路', subtitle: '羁绊 · 黎明时分', skin: 'cinematic', tier: 0 },

  // ──────────────── 隐藏/特殊结局（5 个）─ tier 2 ────────────────
  { id: 'pet-jiangjinjiu', title: '将进酒的小窝', subtitle: '隐藏 · 杯莫停', skin: 'ending-secret', tier: 2, conditionFlags: ['bf_devoted_heart'] },
  { id: 'chaos-collapse', title: '崩坏', subtitle: '4945区 · 一切皆有可能', skin: 'ending-chaos', tier: 2, conditionFlags: ['bf_anarchy'] },
  { id: 'shadow-puppet', title: '提线木偶', subtitle: '你以为你在选择？', skin: 'ending-secret', tier: 2, conditionFlags: ['bf_shadow_master'] },
  { id: 'aberration-converge', title: '收束', subtitle: '隐藏 · 世界线归一', skin: 'ending-secret', tier: 2, conditionFlags: ['wl_divergence'] },
  { id: 'aberration-diverge', title: '发散', subtitle: '隐藏 · 世界线分裂', skin: 'ending-chaos', tier: 2, conditionFlags: ['wl_aberration'] },

  // ──────────────── 事件二主线结局（10 个）─ tier 0 ────────────────
  { id: 's2-ending-org2-triumph', title: '铁血', subtitle: '云梦仙踪 · 重谈三项核心条款', skin: 'ending-triumph', route: 'org2', tier: 0 },
  { id: 's2-ending-org2-compromise', title: '守门', subtitle: '云梦仙踪 · 锁死人员保护线', skin: 'ending-lament', route: 'org2', tier: 0 },
  { id: 's2-ending-org3-triumph', title: '孤注', subtitle: '虚妄月华 · 拒绝签字', skin: 'ending-triumph', route: 'org3', tier: 0 },
  { id: 's2-ending-org3-compromise', title: '埋线', subtitle: '虚妄月华 · 附加说明函', skin: 'ending-lament', route: 'org3', tier: 0 },
  { id: 's2-ending-org4-triumph', title: '峰顶', subtitle: '镜花水月 · 独立计分', skin: 'ending-triumph', route: 'org4', tier: 0 },
  { id: 's2-ending-org4-compromise', title: '脉藏', subtitle: '镜花水月 · 附录加赛条款', skin: 'ending-lament', route: 'org4', tier: 0 },
  { id: 's2-ending-org5-triumph', title: '网成', subtitle: '心之所向 · 独立调配权', skin: 'ending-triumph', route: 'org5', tier: 0 },
  { id: 's2-ending-org5-compromise', title: '暗守', subtitle: '心之所向 · 公示六成', skin: 'ending-lament', route: 'org5', tier: 0 },
  { id: 's2-ending-org6-triumph', title: '立威', subtitle: '第六席 · 独立表决位', skin: 'ending-triumph', route: 'org6', tier: 0 },
  { id: 's2-ending-org6-compromise', title: '深耕', subtitle: '第六席 · 观察员席', skin: 'ending-lament', route: 'org6', tier: 0 },

  // ──────────────── 事件二季终标记（1 个）─ tier 0 ────────────────
  { id: 's2-finale-complete', title: '季终', subtitle: '4945区 · 事件二完结', skin: 'ending', tier: 0 },

  // ──────────────── 事件三主线结局（12 个）+ 季终标记 ────────────────
  { id: 's3-ending-org2-autonomy', title: '自己的队伍', subtitle: '云梦仙踪 · 独立调度', skin: 'ending-triumph', route: 'org2', tier: 0 },
  { id: 's3-ending-org2-safeguard', title: '有边界的指挥', subtitle: '云梦仙踪 · 随时撤回', skin: 'ending', route: 'org2', tier: 0 },
  { id: 's3-ending-org3-autonomy', title: '不交出的名字', subtitle: '虚妄月华 · 联络自主', skin: 'ending-triumph', route: 'org3', tier: 0 },
  { id: 's3-ending-org3-safeguard', title: '封存而非上交', subtitle: '虚妄月华 · 三方解封', skin: 'ending', route: 'org3', tier: 0 },
  { id: 's3-ending-org4-autonomy', title: '没有常任否决', subtitle: '镜花水月 · 成员表决', skin: 'ending-triumph', route: 'org4', tier: 0 },
  { id: 's3-ending-org4-safeguard', title: '双重确认', subtitle: '镜花水月 · 二次表决', skin: 'ending', route: 'org4', tier: 0 },
  { id: 's3-ending-org5-autonomy', title: '网留在人手里', subtitle: '心之所向 · 私人选择', skin: 'ending-triumph', route: 'org5', tier: 0 },
  { id: 's3-ending-org5-safeguard', title: '可撤回的托管', subtitle: '心之所向 · 三方解封', skin: 'ending', route: 'org5', tier: 0 },
  { id: 's3-ending-org6-autonomy', title: '第六席仍是席位', subtitle: '第六席 · 完整表决', skin: 'ending-triumph', route: 'org6', tier: 0 },
  { id: 's3-ending-org6-safeguard', title: '观察者也能否决', subtitle: '第六席 · 合并否决权', skin: 'ending', route: 'org6', tier: 0 },
  { id: 's3-ending-third-way', title: '第三道路', subtitle: '4945区 · 责任共享，权力可撤', skin: 'ending-triumph', tier: 0 },
  { id: 's3-ending-absorbed', title: '被吸收的席位', subtitle: '4945区 · 下一次带上替代方案', skin: 'ending-lament', tier: 0 },
  { id: 's3-finale-complete', title: '选择之后', subtitle: '4945区 · 事件三完结', skin: 'ending', tier: 0 },
]

/** 事件一组织结局的唯一判定入口，避免 UI、回放和存档扫描各自猜测 ID 前缀。 */
export const isSeason1RouteEnding = (endingId: string, route?: RouteId): boolean => {
  const entry = ENDING_REGISTRY.find((candidate) => candidate.id === endingId)
  return Boolean(entry?.route
    && /^r[1-6]-/.test(entry.id)
    && (route === undefined || entry.route === route))
}

/** 皮肤到视觉参数的映射 */
export const ENDING_SKIN_STYLE: Record<SceneUiSkin, {
  border: string
  badge: string
  bgClass: string
}> = {
  classic: { border: '#e8bc78', badge: '', bgClass: '' },
  'private-chat': { border: '#e8bc78', badge: '', bgClass: '' },
  'group-chat': { border: '#e8bc78', badge: '', bgClass: '' },
  'world-chat': { border: '#e8bc78', badge: '', bgClass: '' },
  'game-client': { border: '#e8bc78', badge: '', bgClass: '' },
  organization: { border: '#e8bc78', badge: '', bgClass: '' },
  fortress: { border: '#e8bc78', badge: '', bgClass: '' },
  reward: { border: '#e8bc78', badge: '', bgClass: '' },
  cinematic: { border: '#e8bc78', badge: '', bgClass: '' },
  ending: { border: '#e8bc78', badge: '结局', bgClass: 'skin-ending' },
  'ending-triumph': { border: '#f4ce93', badge: '凯旋', bgClass: 'skin-ending-triumph' },
  'ending-lament': { border: '#8899aa', badge: '遗响', bgClass: 'skin-ending-lament' },
  'ending-dark': { border: '#6b3a5b', badge: '暗面', bgClass: 'skin-ending-dark' },
  'ending-chaos': { border: '#ef4444', badge: '混沌', bgClass: 'skin-ending-chaos' },
  'ending-secret': { border: '#8b5cf6', badge: '秘', bgClass: 'skin-ending-secret' },
}
