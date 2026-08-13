# S2 Episode 2.8 合同：高潮、失败状态与主要结局

> 状态：已实现并接入运行时。前置 2.7，后继 2.9。
> 关联：[SOL-PLAN-2.8](../../docs/SOL-PLAN-2.8.md)、[S2-CANON](./S2-CANON.md)、[S2-CHOICE-PAYOFF-LEDGER](./S2-CHOICE-PAYOFF-LEDGER.md)。

## 1. 时间窗口与核心问题

- **时间**：2026-10-17（距 2.7 第三轮表决一周后）
- **地点**：4945区 · 联合评议厅（最终表决）
- **核心问题**：联合行动计划最后一轮表决——各组织的高潮对决。你上一轮选择的终局姿态（stand-firm / cut-losses）和累积的压力姿态（org-first / rel-first）在此交汇。你的组织将在这场表决中得到最终答案：它在这场博弈中赢了什么、丢了什么。你只有一次最终行动：strike（全力一击）或 settle（锁定结果）。

## 2. 因果追溯

| 来源 | 消费方式 | 影响 |
| --- | --- | --- |
| 2.6 s2PressureStance | entry 分流 org-first/rel-first 高潮入场姿态 | 决定你在高潮中是独自扛旗还是有联盟撑腰 |
| 2.6 s2MeetingArtifact | 10 种会议条款逐一回到最终提案 | 说明上次通过、搁置或限制的条款如何成为今日代价 |
| 2.7 s2FinaleEntry + s2FinaleArtifact | 成对校验 stand-firm/all-lines-defended 或 cut-losses/core-line-protected | 决定全线坚守或保护核心的终局承诺；错配进入修复页 |
| 路线 | route 分流五条路线各自的高潮节点 | 每条路线有独立的对决场景和角色 |

## 3. 剧情结构

```
entry → 终局承诺校验 → 2.6 会议条款回执 → org-first/rel-first → route 分岔(5)
      → 最终行动(strike/settle) → 10 个稳定结局 → 共通收束 → exit

损坏/旧档：缺少承诺、排序或路线时进入可见修复页；缺少旧会议条款时明确标记为未迁移，不伪造具体历史。
```

### 3.1 最终行动

每条路线在关键角色陪伴下面对核心冲突的最终时刻。玩家在两个选择之间采取最终行动：

- **strike**：不保留，全押。高声誉、可辨识的胜利形态，但代价惨重。
- **settle**：锁定结果，保护核心。保持凝聚力，换稳定位置。

四、五组沿用 8 月重组后的职责边界：砚秋水负责解释四组制度与标准，剑问白玉京负责五组日常与外联执行；玩家选定方案后，分别由首领铁碎牙、困醒签字确认并承担组织责任。执行人不会被误写成最终首领。

### 3.2 主要结局 ID

| 路线 | strike（triumph） | settle（compromise） |
| --- | --- | --- |
| org2 | s2-ending-org2-triumph | s2-ending-org2-compromise |
| org3 | s2-ending-org3-triumph | s2-ending-org3-compromise |
| org4 | s2-ending-org4-triumph | s2-ending-org4-compromise |
| org5 | s2-ending-org5-triumph | s2-ending-org5-compromise |
| org6 | s2-ending-org6-triumph | s2-ending-org6-compromise |

### 3.3 失败状态

失败是可见叙事的结果，不是隐藏骰子。strike 的路线高潮节点文本中明确展示了组织当前状态的脆弱迹象（人员流失、数据压力、筹码不足），使玩家在做出 strike 选择前已可预判风险。选择 strike 后的结局节点展示了完整的成功或成本叙事——即便付出惨重代价，仍是一个完成态结局。所有结局均可重新触发，不损坏存档。

## 4. 持久状态

| 变量 | 类型 | 写入位置 | 消费目标 |
| --- | --- | --- | --- |
| `s2MainEnding` | string（ending ID） | 各路线 strike/settle 选择效果 | 2.9 尾声路由 |
| `s2ClimaxComplete` | flag | closing onEnter | 第三季入口检查 |
| `s2ContinuityRepaired` | flag | 可见修复选择/可证明补记 | 标记旧档发生过连续性修复 |
| `s2LegacyMeetingArtifactMissing` | flag | 旧会议条款缺失节点 | 明确缺失，不猜测条款 |

## 5. 选择回收

- 回收 2.6 的具体会议产物，以及 2.7 的 `s2FinaleEntry` / `s2FinaleArtifact`；它们先改变高潮现场，再进入路线最终行动。
- 本集 10 个选择全部 ending 级，写入 stable ending ID。
- 所有 dueIn <= 2.8 的选择清零。开放项仅剩 2.9 尾声。

## 6. 验收标准

1. 5 路线 × 2 组会议条款/压力 × 2 终局承诺 × 2 最终行动，共 40 条正式组合均到达合法结局。
2. 玩家在高潮中采取最终行动（strike/settle），非仅观看。
3. 10 个结局 ID 互斥、可达、可重试、不损坏存档。
4. 所有 ending 级选择已回收。
5. 失败风险通过叙事可见，不使用隐藏阈值。
6. 零新增托管视觉。
7. 2.2–2.8 全季主线可连续完成。
8. 缺失、错配状态不会默认成 stand-firm、org-first 或 org2；修复行为对玩家可见。
9. 四、五组两个结局分支均经过对应首领确认节点，且不改变 10 个稳定结局 ID。
