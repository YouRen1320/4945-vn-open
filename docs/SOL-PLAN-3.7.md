# 《4945区》3.7 Sol 方案：第三季不可逆危机与最终立场

> 状态：条件 Sol 方案；具体危机必须来自 3.2–3.6 已发布因果与第三季 canon。
>
> 发布性质：完成 point-of-no-return 决策并建立终局入口的危机单元。
>
> 前置：[3.6 力量关系与人物信任重排](./SOL-PLAN-3.6.md)。
>
> 后继：[3.8 第三季高潮、失败状态与主要结局](./SOL-PLAN-3.8.md)。

## 1. 目标与范围

3.7 把第三季前半的承诺、中点变化、关系重排和跨季 continuity payoff 汇入不可逆危机。玩家在本集作出进入终局前的最终立场决定；完成后主要路线、承担的代价和可用终局入口冻结。

危机不能靠未铺垫的新事实或突然出现的角色制造。它必须可追溯到已发布 episode 与 canon 公共压力。

## 2. 剧情单元合同

### 2.1 危机形成

- 至少一个 3.5/3.6 到期后果推动危机；
- 共通事实只维护一份，路线差异体现在暴露方式、承担者和应对资源；
- continuity profile 可以改变既有条件，不能创造未经确认的新公共事实；
- 玩家在决策前理解风险类别、可用行动和可能失去的内容；
- 失败风险有剧情铺垫，不使用完全隐藏阈值。

### 2.2 Point of no return

进入最终立场前，UI 和剧情都明确：

- 哪些 episode/补遗仍未完成；
- 继续后哪些路线或行动将锁定；
- 可以返回季/集中心或另存档；
- 不展示结局公式或具体剧透；
- 确认只作用于当前 campaign，不修改 outcome archive。

确认后，玩家完成一次有即时收益和损失的立场选择，并获得 finale entry state。

### 2.3 阶段收束

本集回答“危机发生后，玩家以什么立场和条件进入终局”。最终结果留给 3.8，但不能停在危机刚出现、玩家尚未行动的位置。

## 3. 终局入口合同

```text
finaleEntryId
campaignId
lineageId
route
requiredEpisodeCompletions
resolvedChoiceIds
openChoiceIds
continuityClasses
availableResources
relationshipClass
failureWarnings
fallback
```

每个合法 3.7 完成状态恰好映射到一个入口。入口只读取第三季状态与 normalized continuity，不读取前代原始档。非法组合隔离报错，不静默分配默认好结局。

## 4. 终局前审计

- 全部活跃路线从 3.2 到 3.7 时间连续；
- structural branches 有终局入口、合流说明或批准退休；
- `dueIn <= 3.7` 的 S3 choices 与 continuity threads 全部处理；
- 尚开放项目只属于 3.8 主要结局或 3.9 余波；
- 主要失败状态有铺垫与风险提示；
- canon 中没有仍影响高潮的 P0/P1 空位。

## 5. 交付物

```text
docs/season3/S3-EPISODE-3.7.md
docs/season3/S3-POINT-OF-NO-RETURN.md
docs/season3/S3-FINALE-ENTRY-CONTRACT.md
docs/season3/S3-PRE-FINALE-CONTINUITY.md
docs/season3/S3-CHOICE-PAYOFF-LEDGER.md（更新）
docs/season3/V3.7-ASSET-MANIFEST.md
docs/season3/V3.7-IMAGE-PROMPTS.md
game/docs/V3.7-ACCEPTANCE.md
```

本版图片覆盖危机、最终立场和关键损失，不提前混入 3.8 结局画面。

## 6. 验收标准

1. 危机由已发布因果推动，无未确认突发事实。
2. 每条活跃路线都有危机应对、point-of-no-return 确认、即时代价和终局入口。
3. 确认前可返回或另存档，确认后状态稳定且不修改 outcome archive。
4. 所有合法完成状态恰好映射一个 finale entry；损坏状态不静默纠正。
5. `dueIn <= 3.7` 总账清零，开放项明确归属 3.8/3.9。
6. 3.0–3.6 合法旧档可升级，本版回滚保留最终立场。
7. 三季既有内容、archive、离线和收藏零回归，本版素材 ready。
8. 类型检查、单测、内容图、构建、E2E 和设备验收通过。

## 7. 迁移与回滚

回滚到 3.6 时保留 finale entry 与最终立场，旧版本只允许停在安全点或提示升级，不能撤销确认。重新升级后继续原入口。

## 8. 兼容性妥协

- 多个低影响 flavor 状态可以合并到同一 finale entry，对白差异仍可保留。
- 风险提示给出类别而非精确结局公式。
- point-of-no-return 增加一次明确确认，换取避免误锁路线。

## 9. 有意不做

- 不在本版交付最终高潮、主要结局或多季尾声。
- 不新增 canon 外危机来源、路线或角色。
- 不让 unresolved structural branch 进入 3.8。
- 不生成图片或混入结局素材。

## 10. 退出闸门

全部终局入口、最终立场、选择回收、正式素材和连续性审计通过后 3.7 才可发布。无入口的合法状态或无铺垫失败条件均为阻断项。
