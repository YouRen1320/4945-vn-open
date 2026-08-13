# 《4945区》2.2 Sol 方案：第二季共通序章与 schema5 开局

> 状态：Sol 方案完成；具体剧情被第二季 canon 用户签认闸门阻塞。
>
> 发布性质：第二季首个稳定内容版本，不使用 preview 存储。
>
> 前置：[2.1 第一季组织与成员补遗](./SOL-PLAN-2.1.md)；实现前必须冻结第二季 canon。
>
> 后继：[2.3 新局势成形](./SOL-PLAN-2.3.md)。

## 1. 目标与范围

2.2 同时完成两件不能再拆开的工作：

1. 交付一个完整可玩的第二季共通序章；
2. 从第一段稳定第二季内容开始就使用 canonical schema5、收藏 v2 和显式第一季结果摘要。

旧方案只冻结规格、不提供剧情，随后又让第二季切片写临时 preview 键，最终必然二次迁移。新方案把 canon 冻结作为 2.2 的实现前置，不把它伪装成一个空发布版本。

## 2. 实现前 canon 闸门

用户必须逐项确认并形成 `docs/season2/S2-CANON.md`：

- 第二季时间范围和结束边界；
- 公共事实锚点及 `confirmed/adapted/fictional` 分类；
- 活跃、退出和新增的组织或路线；
- 可使用、回归、新增和不可使用的角色；
- 第一季组织结果、伴侣和其他 durable facts 的继承级别；
- 公共主冲突、玩家目标和不可改写事实；
- 失败状态、主要结局与关系收束的结构；
- 明确仍未知、不得自行补写的空位。

本方案不猜测这些答案。未签认时可以完成类型、验证器和空数据夹具，但不能创建正式 `s2-` 剧情节点或具体图片提示词。

## 3. 序章剧情合同

序章必须形成一个完整 episode：

1. 玩家选择合法第一季来源档或经批准的回顾建档；
2. 开场用受控变体确认“上一季的结果确实被看见”；
3. 建立第二季新的日常状态与当前关系位置；
4. 一个经确认的扰动打破状态，提出本季公共压力；
5. 玩家作出第一个具有即时结果的应对选择；
6. 选择结果形成清晰的新目标；
7. 解决“玩家是否进入这场新局面”的局部问题，标记序章完成并返回季/集中心。

集末可以留下下一步任务，但不能以一段预告或“待续”代替玩家行动。所有活跃路线都必须能从序章合法进入；若分歧尚未发生，差异通过已登记的继承 flavor/scene 变体表达。

## 4. 第一季结果摘要

`Season1OutcomeSummary` 只保留第二季实际消费的白名单：

```text
summaryVersion
source: save(slot + savedAt) | recap(contractVersion)
route
organization
organizationName
organizationEndingId
activePartner | none
relationshipTiers
durableFacts
createdAt
```

要求：

- 多个完成档并存时绝不自动选择；
- 每个字段有提取、合法组合、消费点和 fallback 测试；
- `durableFacts` 是枚举白名单，不接受任意 flags；
- 摘要作为值快照写入新 v5 档，来源 v4 后续变化不反向修改它；
- 不复制第一季完整历史、processedNodes、variables 或原始关系数值。

玩家确认摘要时创建或复用不可变 `Season1OutcomeRecord`。record 进入独立 outcome archive，不占用普通存档槽；它保存结果、来源、内容修订和 digest，不保存完整 `GameState`。season2 campaign 保存该 record 的值快照、`campaignId` 和 `lineageId`。

## 5. schema5 与收藏 v2

2.2 稳定版本正式写：

```text
4945-vn:v5:save:*
4945-vn:v2:collection
4945-vn:v1:outcomes
```

schema5 至少新增 `seasonId`、`contentRevision`、稳定 `campaignId` / `lineageId`、新选择的稳定 `choiceId`、版本化 continuity profile 和 episode completion。`Season1OutcomeSummary` 作为 season1 outcome payload，而不是不可扩展的唯一跨季字段。第二季历史从新季开始，并带 season/episode 标签。

所有 v4、v3、legacy 存档和旧收藏键保留。迁移只在内存验证成功后写 v5；重复迁移必须得到相同结果。损坏或矛盾来源不可选择，但不得被删除、覆盖或静默修复成另一结果。

## 6. 开局交互

```text
标题页“第二季”
  -> 扫描第一季完成档
  -> 选择来源档，或在无合法档时进入回顾建档
  -> 查看人类可读结果摘要
  -> 创建/复用 Season1OutcomeRecord 与 lineage
  -> 选择第二季目标槽
  -> 确认创建 v5 season2 campaign
  -> 游玩共通序章
  -> 序章完成，返回季/集中心
```

回顾建档只提供 canon 允许的合法组合。若目标 v5 槽已有进度，必须显示内容摘要并单独确认覆盖；来源 v4 键永不覆盖。

## 7. 内容与选择登记

- 所有第二季节点、选择、结局和素材引用使用 `s2-`；提示词使用 `S2-`；
- 序章登记为第一个 `SeasonEpisodeDefinition`；
- 序章每个选择写入 payoff ledger，至少有即时结果；
- 继承字段按 flavor、scene、structural、ending 分级，序章不得擅自扩大级别；
- episode completion 使用显式字段，不以看过某个文本节点猜测。

## 8. 交付物

```text
docs/season2/S2-CANON.md
docs/season2/S2-INHERITANCE-CONTRACT.md
docs/season2/S2-RECAP-CONTRACT.md
docs/season2/S2-OUTCOME-ARCHIVE-CONTRACT.md
docs/season2/S2-CHOICE-PAYOFF-LEDGER.md
docs/season2/S2-EPISODE-PROLOGUE.md
docs/season2/V2.2-ASSET-MANIFEST.md
docs/season2/V2.2-IMAGE-PROMPTS.md
game/deploy/MIGRATION-v5.md
game/docs/V2.2-ACCEPTANCE.md
```

具体提示词只能在场景卡签认后编写。图片由用户外部生成，`targetRelease = 2.2` 的托管视觉必须在发布前 ready。

## 9. 验收标准

1. canon 文档由用户签认，正式节点中无未确认的具体事实。
2. 所有合法第一季结果均可通过来源档或回顾建档进入序章；非法组合有可解释错误。
3. 序章具备开端、扰动、玩家选择、即时后果和阶段收束，不是空壳或预告。
4. 来源 v4 与旧收藏逐字节保留；新 v5 目标档创建和覆盖确认正确。
5. Season1OutcomeRecord 创建、去重、digest、普通存档删除隔离和导入导出通过。
6. schema1–4 迁移、重复迁移、损坏数据、导入和回滚夹具通过。
7. 序章节点、选择和 episode completion 全部使用稳定 ID，payoff ledger 无漏项。
8. 第一季正常游玩、补遗、章节回放和关系回忆零回归。
9. 本版图片、移动端、离线、类型检查、单测、内容图、构建和 E2E 全部通过。

## 10. 迁移与回滚

回滚到 2.1 时，v5 第二季进度和 outcome archive UI 暂时不可见，但 v4 来源档、v5 与 archive 键均保留。重新进入 2.2 后恢复。发布与回滚演练必须证明 2.1 不会把未知键当损坏数据清理。

## 11. 兼容性妥协

- 第一季旧选择日志不完整，序章只能继承可证明的结果摘要。
- 第二季历史从序章重新开始，第一季过程通过原 v4 和回放查看。
- 回顾建档只允许合法组合，不提供任意 flags 或数值编辑器。
- outcome archive 增加本地记录和导出体积，换取后续季不依赖普通来源槽。

## 12. 有意不做

- 不在 canon 签认前自行确定第二季日期、角色、路线或结局。
- 不把序章扩成第一阶段全部剧情。
- 不删除或覆盖旧存档键，不迁移旧历史为伪造 choice ID。
- 不引入账号、云存档或遥测。

## 13. 退出闸门

canon、序章内容、canonical v5、收藏 v2、outcome archive、正式素材和回滚证据全部通过后才发布 2.2。后续版本只能消费已签认合同；新增公共事实必须回到 canon 变更流程。
