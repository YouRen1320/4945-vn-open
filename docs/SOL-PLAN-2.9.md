# 《4945区》2.9 Sol 方案：第二季尾声、关系收束与 3.0 RC

> 状态：Sol 方案完成；具体尾声矩阵依赖 2.8 已冻结主要结局。
>
> 发布性质：第二季内容完整版本；通过后冻结内容并生成 `3.0.0-rc.N`。
>
> 前置：[2.8 高潮、失败状态与主要结局](./SOL-PLAN-2.8.md)。
>
> 后继：[3.0 完整第二季稳定晋升](./SOL-PLAN-3.0.md)。

## 1. 目标与范围

2.9 为每个主要结局补齐路线余波、成员去向、关系收束和连续性说明，关闭所有 2.x 选择承诺。它交付完整可玩的 epilogue episode；随后进入只修阻断问题的内容冻结，并以同一内容生成 3.0 RC。

2.9 不能用尾声推翻 2.8 主要结局，也不能把本应在高潮解决的核心矛盾拖到片尾文字中处理。

## 2. 尾声剧情合同

### 2.1 路线余波

每个主要结局至少拥有一个可玩尾声，包含：

- 结局直接造成的新状态；
- 关键成员对玩家选择的反应；
- 已付代价和仍保留成果的可见结果；
- 玩家对未来位置的一次最终回应；
- 稳定 epilogue completion 和返回完整季总结的出口。

失败结局也需要对应余波，但可以更短；不能只显示“失败，请重试”。

### 2.2 关系收束

canon 中每个合法伴侣结果和无伴侣结果必须有收束：

- 关系收束反映 2.6 交汇和 2.8 主要结局；
- 关系可以确认共同生活、距离、承诺变化或结束方式，但具体形式以 canon 为准；
- 无伴侣路径有完整自我/成员余波，不把缺少伴侣写成内容缺失；
- 关系结局不覆盖组织主结局 ID，可以登记独立 relationship resolution ID；
- 未回归角色只使用已批准的缺席/通信/回忆合同，不临时出场。

### 2.3 完整季总结

季总结只展示玩家可理解的信息：主要结局、路线结果、关键选择回收、关系收束和已解锁内容。内部 flags、调试值和未命中分支不对玩家暴露。

## 3. 连续性补完

2.9 建立最终矩阵：

```text
source outcome class
active route
structural branch
main ending
relationship class
epilogue
resolution
fallback
```

要求：

- 每个合法组合恰好命中一个尾声族和一个关系收束族；
- flavor 组合可以共享结构，但必须使用正确称呼和既有事实；
- 无合法组合不得通过默认值落入他人结局；
- 所有场景事实标签和角色状态与前序 episode 一致；
- 不为追求组合数量复制同一尾声的低差异版本。

## 4. 选择总账关闭

2.9 发布前，payoff ledger 中所有 2.x 项只能是：

- `paid`：已经在具体节点回收；
- `closed-approved`：用户批准以等价说明关闭；
- `moved-to-3.x`：明确不属于第二季主范围，且不影响本季完整性。

不得存在 `planned`、`unknown` 或没有测试的到期项。移入 3.x 的内容不能是理解第二季结局所必需的信息。

## 5. 素材与内容冻结

- 交付 2.9 尾声/关系提示词和正式素材；
- 汇总 2.1–2.9 全部清单，确认 ID、targetRelease、ready/deferred/cancelled 处置完整；
- `targetRelease <= 2.9` 的 pending 必须为零；
- 内容、选择、结局和素材 ID 在 2.9 acceptance 后冻结；
- 冻结后只允许修复 P0/P1、已确认事实错误、无障碍阻断和资产质量阻断。

## 6. 第二季结果归档

完成尾声和关系收束后生成不可变 `Season2OutcomeRecord`：稳定 `outcomeId`、既有 `lineageId`、明确指向第一季来源的 `parentOutcomeIds`、season2 内容修订、main ending、relationship resolution、后续允许消费的 durable facts、digest 与创建时间。

要求：

- 记录进入独立 outcome archive，不占普通存档槽；
- 成功、折中与失败结局均可形成合法 record；
- 同一 lineage 重玩取得不同结局时生成不同 outcomeId，不覆盖旧记录；
- 删除 season2 campaign 不删除 record；
- 导出 record 携带所依赖的 season1 lineage；
- 事实修正使用 supersede，不就地改写已归档结果。

## 7. 3.0 RC 准备

2.9 内容通过后，从同一内容图生成 `3.0.0-rc.N`，进行：

- schema1–4 → schema5 与旧收藏 → v2 全矩阵；
- v4 来源选择、回顾建档和 v5 目标槽覆盖确认；
- season1/season2 outcome archive 创建、去重、导入导出和删除隔离；
- 2.2–2.9 全 episode、全部主要结局、失败状态和尾声；
- 第一季五路线、补遗、31 个章节回放和关系回忆；
- 季级离线包、Service Worker 更新、旧缓存和回滚往返；
- 所有目标设备、键盘、读屏、低动态和长文本；
- 最终资产 `pending = 0` 与人工图片验收。

RC 使用独立预发布地址和复制数据，不能在用户日常浏览器或生产域名试错。

## 8. 交付物

```text
docs/season2/S2-EPISODE-2.9.md
docs/season2/S2-EPILOGUE-MATRIX.md
docs/season2/S2-CONTINUITY-FINAL.md
docs/season2/S2-CHOICE-PAYOFF-LEDGER.md（最终）
docs/season2/S2-OUTCOME-RECORD.md
docs/season2/V2.9-ASSET-MANIFEST.md
docs/season2/V2.9-IMAGE-PROMPTS.md
game/docs/V2.9-ACCEPTANCE.md
game/docs/V3.0-RC-ACCEPTANCE.md
game/deploy/ROLLBACK-v3.0.0.md
```

## 9. 验收标准

1. 每个主要结局和失败结局都有符合其结果的可玩尾声。
2. 每个合法伴侣结果和无伴侣结果都有完整关系收束。
3. 连续性矩阵覆盖所有合法 route × branch × ending × relationship 类别，无错误默认。
4. payoff ledger 无未知或逾期项，移入 3.x 的内容不影响本季完整性。
5. 2.2–2.9 从开局到尾声可连续完成，完整季总结准确。
6. 全部版本素材归属明确，`targetRelease <= 2.9` 的 pending 为零。
7. 每个完整第二季结果可生成不可变 Season2OutcomeRecord，删除 campaign 不影响 archive。
8. 第一季、迁移、离线、回滚和全设备矩阵通过。
9. 类型检查、全部单测、最终资产审计、构建和 E2E 通过。
10. 3.0 RC 与 2.9 冻结内容除版本元数据和获批阻断修复外无漂移。

## 10. 迁移与回滚

尾声、关系收束、完整季完成和 outcome IDs 一经发布只追加不改义。回滚到 2.8 时保留 2.9 进度与 archive，旧版本显示已取得主要结局但不重判尾声；重新升级后恢复。RC 回滚演练必须证明 v4、v5 与 outcome records 均不被删除或覆盖。

## 11. 兼容性妥协

- 组合矩阵按结构类别共享场景，不为每个 flavor 组合复制完整尾声。
- 回滚到旧 2.x 时后续 episode 暂时不可见，但数据保留。
- outcome archive 增加少量本地数据与导出体积，但解除第三季来源长期占槽。
- 部分移入 3.x 的增强可以保留伏笔，但不得是第二季结局理解所必需。

## 12. 有意不做

- 不新增主冲突、路线、主要结局、角色或 schema 字段。
- 不在 RC 阶段扩展剧情或提示词清单。
- 不删除旧 v4/v3/legacy 键或把 RC 测试数据自动迁入最终版。
- 不直接发布 3.0；最终放行按独立 3.0 方案执行。

## 13. 退出闸门

尾声、关系、连续性、选择总账、Season2OutcomeRecord、正式素材和 RC 全矩阵通过后，2.9 内容才算完整。之后只允许按 3.0 方案做稳定晋升，不再增加叙事范围。
