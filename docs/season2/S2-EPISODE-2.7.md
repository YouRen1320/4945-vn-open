# S2 Episode 2.7 合同：后期危机与终局前置

> 状态：已实现并接入运行时（架空设定）。前置 2.6，后继 2.8。
> 关联：[SOL-PLAN-2.7](../../docs/SOL-PLAN-2.7.md)、[S2-CANON](./S2-CANON.md)、[S2-CHOICE-PAYOFF-LEDGER](./S2-CHOICE-PAYOFF-LEDGER.md)。

## 1. 时间窗口与局部问题

- **时间**：2026-10-10（距 2.6 协调席首次交锋一周后）
- **地点**：4945区 · 联合评议厅（第二次正式会晤）
- **局部问题**：联合行动计划第一阶段截止日已到——各组织须在今日完成方案表决。你上一轮的优先级选择（组织优先/关系优先）已产生后果，本轮你没有回头路。危机不是突然出现的敌人，而是你亲手排序的代价：站你这边的人保护你，不在你这边的人守他们自己的线。票数算不过来，你必须决定以什么姿态进入终局。

## 2. 因果追溯

| 因果来源 | 进入方式 | 本集消费 |
| --- | --- | --- |
| 2.5 s2Midpoint（guard/pivot） | 已被 2.6 消费，化为进场姿态 | 仅风味引用 |
| 2.6 s2PressureStance（org-first/rel-first） | 读取 s2PressureStance 分流危机形态 | 危机性质 + 可选应对范围 |
| 2.6 s2MeetingArtifact | 按 route 与上次会议产物分流 | 具体条款在一周后造成的代价或越界 |
| 2.4 s2Diverge（confront/coalition） | 已被 2.5 消费 | 仅风味引用（旁白：你一路扛来/你一路联盟走来） |

## 3. 剧情结构

```
entry ──→ [org-first / rel-first 危机] ──→ route 变体 ──→ 2.6 条款回执 ──→ stakes
       └──────────────────────────────────────────────────────→ decide ──→ route 落点 ──→ closing ──→ exit
```

### 3.1 进场（entry）

回收 s2PressureStance，按 org-first / rel-first 分流到两种危机入场姿态。

### 3.2 危机（crisis-org / crisis-rel）

- **org-first**：你守住了组织底线，主导权在握——但之前被你搁置的关系伙伴已组成事实上的反制联盟。他们不是针对你个人，而是保护各自组织的核心利益。今天的表决，票数算不过来。
- **rel-first**：你维护了关系网络，他们现在愿意帮你——但你让渡的协调权被对手拿走了。你的组织在表决中处于劣势，光靠人情不够翻盘。

### 3.3 路线变体（org2..org6）

每条路线展示该组织在表决中最核心的矛盾：

| 路线 | 危机焦点 | 出场角色 |
| --- | --- | --- |
| org2 | 扩编抽人威胁刚稳下的人心，有人递了退组申请 | shana, bottle |
| org3 | 数据公开触发旧账清算，评议委员引用三组历史数据施压 | truth |
| org4 | 统一战功标准直接削弱精英路线的竞争力 | yanqiu |
| org5 | 开放内部日程协调权的后果显现，五组的谈判筹码被摊薄 | wenxian |
| org6 | 新人组织在表决中无历史权重，被当成添头 | player（独白） |

### 3.4 核心决策（decide）

两份选择都是合法终局入口，并额外留下可供 2.8 消费的结果物：

1. **坚持到底（stand-firm）**：不退半步，把所有筹码押在你认为对的方向上。→ 写入 `s2FinaleEntry = 'stand-firm'`、`s2FinaleArtifact = 'all-lines-defended'`
2. **止损重组（cut-losses）**：牺牲局部目标保全核心。→ 写入 `s2FinaleEntry = 'cut-losses'`、`s2FinaleArtifact = 'core-line-protected'`

### 3.5 后果展示 + 收束

展示选择带来的即时数值后果，并按五条路线分别说明保住了什么、失去了什么。关闭本集局部问题，向 2.8 交付明确终局输入。

## 4. 持久状态

| 变量 | 类型 | 写入位置 | 消费目标 |
| --- | --- | --- | --- |
| `s2FinaleEntry` | `'stand-firm' \| 'cut-losses'` | decide 选择效果 | 2.8 高潮入口路由 |
| `s2FinaleArtifact` | `'all-lines-defended' \| 'core-line-protected'` | decide 选择效果 | 2.8 高潮结果回响 |
| `s2CrisisFaced` | flag | 2.7 entry onEnter | 2.8 前置校验 |

## 5. 终局入口映射

| s2PressureStance | route | s2FinaleEntry | finaleEntryId |
| --- | --- | --- | --- |
| org-first | org2..org6 | stand-firm | finale-assertive-dominant |
| org-first | org2..org6 | cut-losses | finale-pragmatic-dominant |
| rel-first | org2..org6 | stand-firm | finale-assertive-connected |
| rel-first | org2..org6 | cut-losses | finale-pragmatic-connected |

每个合法完成状态恰好映射到一个终局入口，无损坏组合。

## 6. 选择回收

- 回收 2.6 的 s2PressureStance：危机形态取决于此。
- 本集两个选择（stand-firm / cut-losses）写入 s2FinaleEntry，dueIn = 2.8。
- 所有 dueIn <= 2.7 的选择清零。

## 7. 验收标准

1. 危机由 2.3–2.6 累积因果推动，无未铺垫事实。
2. 5 条路线 × 2 种压力姿态均可达；2.6 的 10 份会议产物各自有可见回响。
3. 5 条路线 × 2 种终局姿态各有独立、可复述的组织落点。
4. 失败风险通过叙事可见（算票、表态、人情），不使用隐藏阈值。
5. 2.2–2.6 旧档升级可达本集；回滚保留状态。
6. 零新增托管视觉，复用既有背景与立绘。
7. dueIn <= 2.7 全部回收，开放项归属 2.8。
