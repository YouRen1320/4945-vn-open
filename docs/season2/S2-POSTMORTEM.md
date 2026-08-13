# 第二季复盘

> 版本：3.0.0-rc.1 · 2026-08-06
>
> 作用：为 V3.1+ 划定闭环范围，区分 3.1 必须处理项、3.x 补遗、已完整关闭项。

## 1. 叙事缺口

| # | 位置 | 描述 | 严重度 | 建议处理 |
|---|------|------|--------|---------|
| 1 | S2-CANON | 评议委员会领导者身份与动机未填 | P2 | 第三季 canon 冻结时填入，不影响 S2 结局完整性 |
| 2 | S2-CANON | 2026-12-31 之后无任何具体事实 | P2 | 第三季 canon 自行定义，不溯及修改 S2 |

> S2-CANON 明确标出四条"不得自行补写的空位"，为设计预留而非遗漏。

## 2. 可选线索（明确留到第三季）

| 线索 ID | 描述 | 当前位置 | 3.x 目标 |
|---------|------|---------|---------|
| s2-org2-triumph-line | "等你赢到第三季，他们回来"（夏娜线） | `s2-2.9.ts` org2 triumph 叙事 | 3.1 起 |
| durable-facts | `KNOWN_DURABLE_FACTS` 已启用签认白名单，跨季摘要按合同继承 | `engine/season2-outcome.ts` | 已关闭 |

## 3. 只需修错、不应扩写

| # | 位置 | 问题 | 修复方式 |
|---|------|------|---------|
| 1 | `endingRegistry.ts` | S2 的 10 个主线结局（`s2-ending-org*-triumph/compromise`）及 `s2-finale-complete` 未登记到 `ENDING_REGISTRY`，若结局画廊依赖 registry 则不可见 | 每个结局追加一条 `EndingEntry`：id/title/tier/skin/subtitle |
| 2 | `endingRegistry.ts` | 12 个羁绊结局 `bond-*` 仅通过 `onEnter: unlockEnding` 写入状态但 registry 同样仅含 ID 无详情 | 确认画廊渲染路径，必要时补登 |

## 4. 已完整关闭、不应重复消费的结局

| 结局 ID | 关闭原因 | 建议 |
|---------|---------|------|
| `s2-ending-org2-triumph` | 2.8 高潮判定 + 2.9 尾声已写 | 保持关闭 |
| `s2-ending-org2-compromise` | 同上 | 保持关闭 |
| `s2-ending-org3-triumph` | 同上 | 保持关闭 |
| `s2-ending-org3-compromise` | 同上 | 保持关闭 |
| `s2-ending-org4-triumph` | 同上 | 保持关闭 |
| `s2-ending-org4-compromise` | 同上 | 保持关闭 |
| `s2-ending-org5-triumph` | 同上 | 保持关闭 |
| `s2-ending-org5-compromise` | 同上 | 保持关闭 |
| `s2-ending-org6-triumph` | 同上 | 保持关闭 |
| `s2-ending-org6-compromise` | 同上 | 保持关闭 |
| `s2-finale-complete` | 2.9 总结节点关闭双 flag + unlockedEndings | 保持关闭 |
| 12 个合法伴侣关系收束 | s2-2.9-rel-shana/qifu/chenyi/swordheart/heartbeat/yanqiu/huayue/wenxian/takemehand/xilufei/yyt/avucii | 保持关闭 |
| `s2-2.9-rel-none` | 无伴侣独行路径 | 保持关闭 |

> 当前 payoff ledger 共登记 35 个正式玩家选择（含暑假桥接篇新增的 11 项），均已回收清零，无开放项。

## 5. 第三季可能使用的连续性维度（未获批）

| 维度 | 当前状态 | 第二季证据 | 建议 |
|------|---------|-----------|------|
| `s2MainEnding` | 写入 10 个结局之一 | `s2-2.8.ts` 高潮节点 | S3 开场时可读，判断起始状态 |
| `s2EpilogueEnding` | 写入具体尾声 ID | `s2-2.9.ts` 10 个尾声节点 | 同上 |
| `s2RelationshipResolved` | 写入伴侣 ID 或 `'none'` | `s2-2.9.ts` 关系路由 | S3 关系状态继承输入 |
| `s2Complete` + `s2EpilogueComplete` | 双 flag 写入 | `s2-2.9.ts` 总结节点 | S3 前置检查 |
| `durableFacts` | 10 个签认白名单事实 | `engine/season2-outcome.ts` | 已作为跨季摘要输入 |
| `activePartner` | 12 名合法候选 + `null` | `state.ts` schema field | 直接可读，S3 进入即生效；瓶/真理仅保留 relationshipResolved 回顾兼容 |

## 6. 素材与体验

| 问题 | 位置 | 严重度 | 建议 |
|------|------|--------|------|
| 所有资产通过审计 | 201 张母图，36/36 V18 托管视觉 | — | 无需处理 |
| S2 结局无专属 CG | `endingRegistry.ts` 缺失导致未分配 CG 槽 | P2 | 登记结局时同步分配（建议沿用路线 climax CG） |

## 7. 技术负债

| 问题 | 影响 | 建议版本 |
|------|------|---------|
| V18 托管视觉截止 2026-11-30 到期 | 到期后需确认是否已升为正式母图并从托管移除 | V3.1 |
| `KNOWN_DURABLE_FACTS` 白名单 | 已定义 10 个可继承事实并由校验器约束 | 已关闭 |
| `@v18` 标记的临时视觉路径需清理 | `visualAssets.ts` 中 36 条 V18 条目标注了到期日 | V3.1（到期日后逐条处理） |

---

## 复盘总结

| 指标 | 值 |
|------|-----|
| S2 集数 | 8 集（序章 + 2.3~2.9） |
| S2 节点总数 | 约 130+ |
| S2 结局数 | 10 个主线 + 1 个季终标记 |
| S2 玩家选择数 | 35 个（含暑假桥接篇 11 项，全部回收） |
| Payoff Ledger | **清零** |
| S2 结局注册遗漏 | **已补齐**（V3.1: 10 个主线结局 + 1 个季终标记；另确认 12 个羁绊结局详情完整） |
| 已知叙事缺口 | 2 项（P2，属设计预留，已提升至 S3 canon） |
| 技术负债 | 3 项（V18 到期: 2026-11-30 清理，DurableFacts 已在 season2-outcome.ts 定义，V18 路径同步清理） |

> **V3.1 处理结论**：全部 10 条债务已通过 ContinuityDebtLedger 逐条处理。无真实叙事缺口可支撑第二季补遗内容，V3.1 发布为技术加固版（无新剧情）。详情见 `docs/season2/S2X-CONTINUITY-DEBT.md`。
>
> **下一优先事项**：第三季 canon 冻结决策 + 策划文档 SOL-PLAN-3.x。
