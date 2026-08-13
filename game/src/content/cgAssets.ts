/**
 * CG 资源的单一注册表。
 *
 * 此前 `/assets/cg/*.webp` 路径字面量散落在图鉴面板与全部剧情文件中，
 * 重命名或替换图片需要跨文件搜索。现在路径只登记在这里：
 * 剧情节点经 `cgPath(id)` 引用（未登记的 ID 会在模块加载时直接抛错），
 * 图鉴面板复用同一份条目，两处永远不会漂移。
 */

export interface GalleryCgEntry {
  id: string
  name: string
  src: string
  placeholderFor?: string
  promptRef?: string
}

// 显式登记的剧情/羁绊 CG。此顺序同时是图鉴的公开索引，更换美术时不得挪动既有 ID。
export const galleryCgEntries: GalleryCgEntry[] = [
  { id: 'cg14-xilufei-explosion', name: '管理员的第一次政变', src: '/assets/cg/xilufei-group-explosion-v1.webp' },
  { id: 'cg15-xilufei-exit', name: '拒战后的离开', src: '/assets/cg/xilufei-exit-v1.webp' },
  { id: 'cg16-bond-shana', name: '不是为了开战', src: '/assets/cg/bond-shana-v1.webp' },
  { id: 'cg17-bond-qifu', name: '下线以后，可以', src: '/assets/cg/bond-qifu-v1.webp' },
  { id: 'cg18-bond-heartbeat', name: '只告诉你', src: '/assets/cg/bond-heartbeat-v1.webp' },
  { id: 'cg19-bond-yanqiu', name: '账本之外', src: '/assets/cg/bond-yanqiu-v1.webp' },
  { id: 'cg20-bond-wenxian', name: '明晚八点', src: '/assets/cg/bond-wenxian-v1.webp' },
  { id: 'cg21-bond-takemehand', name: '等两分钟', src: '/assets/cg/bond-takemehand-v1.webp' },
  { id: 'cg22-bond-xilufei', name: '下个新区见', src: '/assets/cg/bond-xilufei-v1.webp' },
  { id: 'cg23-route3-founding', name: '吸收不是拥有', src: '/assets/cg/route3-founding-v1.webp' },
  { id: 'cg24-route4-ledger', name: '胜利以前的账本', src: '/assets/cg/route4-ledger-v1.webp' },
  { id: 'cg25-route5-empty-seat', name: '第一个空位', src: '/assets/cg/route5-empty-seat-v1.webp' },
  { id: 'cg26-route6-sixth-seat', name: '第六席亮起', src: '/assets/cg/route6-sixth-seat-v1.webp' },
  { id: 'cg27-world-enemy', name: '主语变成我们', src: '/assets/cg/world-enemy-v1.webp' },
  { id: 'cg28-council-reshuffle', name: '相同职位，不同原因', src: '/assets/cg/council-reshuffle-v1.webp' },
  { id: 'cg29-second-fortress', name: '火2三线合流', src: '/assets/cg/second-fortress-v1.webp' },
  { id: 'cg30-rare-accessory', name: '同一场战斗，两种正义', src: '/assets/cg/rare-accessory-v1.webp' },
  { id: 'cg31-shi-joins-org2', name: '先从成员开始', src: '/assets/cg/shi-joins-org2-v1.webp' },
  { id: 'cg32-chenyi-leaves', name: '最普通的离场', src: '/assets/cg/chenyi-leaves-v1.webp' },
  { id: 'cg33-partial-transfer', name: '人数像水位', src: '/assets/cg/partial-transfer-v1.webp' },
  { id: 'cg34-ending-route2', name: '江南结算', src: '/assets/cg/ending-route2-v1.webp' },
  { id: 'cg35-ending-route3', name: '抚梅观清雪结算', src: '/assets/cg/ending-route3-v1.webp' },
  { id: 'cg36-ending-route4', name: '天上白玉京结算', src: '/assets/cg/ending-route4-v1.webp' },
  { id: 'cg37-ending-route5', name: '未闻花名结算', src: '/assets/cg/ending-route5-v1.webp' },
  { id: 'cg38-ending-route6', name: '第六席结算', src: '/assets/cg/ending-route6-v1.webp' },
  { id: 'cg39-yanqiu-handoff', name: '把账本留下', src: '/assets/cg/yanqiu-handoff-v1.webp' },
  { id: 'cg40-yyt-avucii-handoff', name: '谁实际管理', src: '/assets/cg/yyt-avucii-handoff-v1.webp' },
  { id: 'cg41-season1-finale', name: '先上号，再说', src: '/assets/cg/season1-finale-v1.webp' },
  { id: 'cg42-jiangnan-planning', name: '江南的第一张值班表', src: '/assets/cg/jiangnan-planning-v1.webp' },
  { id: 'cg43-bond-swordheart', name: '守到最后一轮', src: '/assets/cg/bond-swordheart-v1.webp' },
  { id: 'cg44-bond-huayue', name: '接过残局以后', src: '/assets/cg/bond-huayue-v1.webp' },
  { id: 'cg45-org6-remnants', name: '带着来处加入江南', src: '/assets/cg/r2-org6-remnants-v1.webp' },
  { id: 'cg46-bond-chenyi', name: '权限之外', src: '/assets/cg/bond-chenyi-v1.webp' },
  { id: 'cg47-bond-yyt', name: '强硬之后', src: '/assets/cg/bond-yyt-v1.webp' },
  { id: 'cg48-pet-jiangjinjiu', name: '白猫符约', src: '/assets/cg/pet-jiangjinjiu-v1.webp' },
  { id: 'cg49-bond-avucii', name: '最后一行留空', src: '/assets/cg/bond-avucii-v1.webp' },
  { id: 'cg54-romance-shana-first-date', name: '夏娜 · 不谈要塞的晚饭', src: '/assets/cg/romance-shana-first-date-v1.webp' },
  { id: 'cg55-romance-qifu-first-date', name: '祈福 · 管理员之外的御守', src: '/assets/cg/romance-qifu-first-date-v1.webp' },
  { id: 'cg56-romance-chenyi-first-date', name: '辰逸 · 十分钟后送达', src: '/assets/cg/romance-chenyi-first-date-v1.webp' },
  { id: 'cg57-romance-swordheart-first-date', name: '剑斩凡人心 · 缺勤的约会', src: '/assets/cg/romance-swordheart-first-date-v1.webp' },
  { id: 'cg58-romance-heartbeat-first-date', name: '心跳成瘾 · 不统计留存率', src: '/assets/cg/romance-heartbeat-first-date-v1.webp' },
  { id: 'cg59-romance-yanqiu-first-date', name: '砚秋水 · 允许修订的夜市规则', src: '/assets/cg/romance-yanqiu-first-date-v1.webp' },
  { id: 'cg60-romance-huayue-first-date', name: '华月乌大王 · 最后一栏不清点', src: '/assets/cg/romance-huayue-first-date-v1.webp' },
  { id: 'cg61-romance-wenxian-first-date', name: '温陷 · 八点亮起的花灯', src: '/assets/cg/romance-wenxian-first-date-v1.webp' },
  { id: 'cg62-romance-takemehand-first-date', name: 'takemehand · 随机延迟的铃声', src: '/assets/cg/romance-takemehand-first-date-v1.webp' },
  { id: 'cg63-romance-xilufei-first-date', name: '希露菲 · 归还权限以前', src: '/assets/cg/romance-xilufei-first-date-v1.webp' },
  { id: 'cg64-romance-yyt-first-date', name: 'yyT · 反对意见弹幕赛', src: '/assets/cg/romance-yyt-first-date-v1.webp' },
  { id: 'cg65-romance-avucii-first-date', name: 'AVUCII · 失物招领处的晚饭', src: '/assets/cg/romance-avucii-first-date-v1.webp' },
  { id: 'cg66-route1-join', name: '群雄逐鹿 · 加入第一席', src: '/assets/cg/route1-join-v1.webp' },
  { id: 'cg67-route1-fortress', name: '群雄逐鹿 · 要塞指挥', src: '/assets/cg/route1-fortress-v1.webp' },
]

const cgPathsById = new Map(galleryCgEntries.map((entry) => [entry.id, entry.src]))

/** 剧情节点引用 CG 的唯一入口；未登记 ID 在模块加载/测试时立即失败，而非运行时白屏。 */
export const cgPath = (id: string): string => {
  const src = cgPathsById.get(id)
  if (!src) throw new Error(`未登记的 CG：${id}（请先在 content/cgAssets.ts 登记）`)
  return src
}
