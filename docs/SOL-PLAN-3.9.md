# 《4945区》3.9 Sol 方案：多季尾声、关系收束与 4.0 RC

> 状态：条件 Sol 方案；具体尾声矩阵依赖 3.8 已冻结主要结局。
>
> 发布性质：第三季内容完整版本；通过后冻结内容并生成 `4.0.0-rc.N`。
>
> 前置：[3.8 第三季高潮、失败状态与主要结局](./SOL-PLAN-3.8.md)。
>
> 后继：[4.0 完整第三季稳定晋升](./SOL-PLAN-4.0.md)。

## 1. 目标与范围

3.9 为每个第三季主要结局补齐路线余波、人物/关系收束和多季传承总结，关闭全部第三季 payoff 与 continuity debt。完成尾声后才生成不可变 `Season3OutcomeRecord`；随后内容冻结，并从同一内容生成 4.0 RC。

3.9 不推翻 3.8 主要结局，也不把本应在高潮解决的核心冲突拖到片尾说明。

## 2. 尾声剧情合同

### 2.1 第三季余波

每个主要结局至少一个可玩尾声，包含：

- 结局直接造成的新状态；
- 关键人物对玩家选择的反应；
- 已付代价和保留成果；
- 对第一、第二季相关结果的受控回应；
- 玩家对未来位置的一次最终回应；
- 稳定 epilogue completion 和季总结出口。

失败结局也有余波，不能只显示“失败，请重试”。

### 2.2 关系收束

canon 中每个合法关系类别与无伴侣/退休类别必须有收束：

- 反映 3.6 人物信任、3.8 主要结局和 continuity profile；
- 具体共同、疏离、变化或结束形式由 canon 决定；
- 无伴侣路径拥有完整自我/成员余波；
- 关系 resolution ID 不覆盖 main ending ID；
- 缺席角色不临时登场，只按批准合同影响结果。

### 2.3 多季传承总结

总结展示玩家可理解的三季 lineage：主要结局、关键承诺、已回收跨季线索、关系收束和退休路线。它不展示内部 flags、digest、未命中分支或测试分类，也不声称 4.0 是整个作品永久完结。

## 3. 连续性矩阵

```text
season1 outcome class
season2 outcome class
season3 route
structural branch
main ending
relationship class
epilogue family
resolution
fallback
```

每个合法结构组合恰好命中一个尾声族和关系收束族。flavor 组合可以共享结构，但称呼、事实与退休状态必须正确；无合法组合不得通过默认值进入他人结局。

## 4. 总账关闭

3.9 发布前，S3 payoff ledger 与 continuity debt 只能是：

- `paid`：在具体节点回收；
- `closed-approved`：用户批准等价关闭；
- `retired`：明确终止且有连续性说明；
- `moved-to-4.x`：不影响第三季完整性，并有独立后续价值；目标只能是 4.1 或更后版本，不能塞进只做晋升的 4.0。

不得存在 `planned`、`unknown` 或逾期无测试项。移入 4.x 的内容不能是理解第三季结局所必需。

## 5. 第三季结果归档

完整尾声后创建 `Season3OutcomeRecord`，包含 main ending、relationship resolution、第三季 durable facts、lineageId、指向本次 continuity 来源的 `parentOutcomeIds` 与 digest。记录不可变且进入同一 outcome archive。

要求：

- 失败与成功结局均可形成合法 record；
- 重玩取得不同结局生成不同 outcomeId，不覆盖旧记录；
- 删除 campaign 不删除 record；
- 导出记录包含完整 lineage 依赖；
- supersede 只用于事实修正，不合并玩家不同选择。

## 6. 内容与素材冻结

- 交付 3.9 尾声/关系提示词与正式素材；
- 汇总 3.1–3.9 所有素材，确认 ID、targetRelease、provenance 和处置；
- `targetRelease <= 3.9` 的 pending 为零；
- 节点、选择、结局、outcome fields 和素材 ID 在 acceptance 后冻结；
- 冻结后只修 P0/P1、事实错误、无障碍和资产质量阻断。

## 7. 4.0 RC 准备

从 3.9 冻结内容生成 `4.0.0-rc.N`，验证：

- v4/v5、收藏 v2、outcome archive 与 profile 所有版本；
- 3.0 完成档、引导式建档和 season3 campaign；
- 3.2–3.9 全 episode、主要结局、失败状态和尾声；
- 第一、第二季、补遗、31 个章节回放与关系回忆；
- 三个季包下载、更新、删除、配额不足和回滚；
- 所有设备、键盘、读屏、低动态、长文本与剧透提示；
- 最终资产 pending 为零和生成图人工验收。

RC 使用独立预发布地址与复制数据，不在生产域名或用户日常数据上试错。

## 8. 交付物

```text
docs/season3/S3-EPISODE-3.9.md
docs/season3/S3-EPILOGUE-MATRIX.md
docs/season3/S3-CONTINUITY-FINAL.md
docs/season3/S3-CHOICE-PAYOFF-LEDGER.md（最终）
docs/season3/S3-OUTCOME-RECORD.md
docs/season3/V3.9-ASSET-MANIFEST.md
docs/season3/V3.9-IMAGE-PROMPTS.md
game/docs/V3.9-ACCEPTANCE.md
game/docs/V4.0-RC-ACCEPTANCE.md
game/deploy/ROLLBACK-v4.0.0.md
```

## 9. 验收标准

1. 每个主要/失败结局都有符合结果的可玩尾声。
2. 每个合法关系类别及无伴侣/退休类别都有完整收束。
3. 连续性矩阵覆盖全部合法结构类别，无错误默认。
4. payoff 与 continuity debt 无 unknown/逾期项，移入 4.x 不影响本季完整性。
5. 3.2–3.9 可从开局连续完成，多季总结准确且不暗示作品永久完结。
6. 每个完整结局可生成不可变 Season3OutcomeRecord，删除 campaign 不影响 archive。
7. 全部素材归属与 provenance 明确，`targetRelease <= 3.9` pending 为零。
8. 三季内容、迁移、离线、回滚和设备矩阵通过。
9. 类型检查、全部单测、最终资产审计、构建和 E2E 通过。
10. 4.0 RC 与 3.9 冻结内容除版本元数据和阻断修复外无漂移。

## 10. 迁移与回滚

尾声、关系 resolution、季完成和 outcome IDs 只追加不改义。回滚到 3.8 时保留 3.9 进度与 archive；旧版本不得重判或删除。RC 往返必须证明 v4/v5、收藏和全部 outcomes 保留。

## 11. 兼容性妥协

- 连续性矩阵按结构类别共享尾声，不为每个 flavor 组合复制完整场景。
- 回滚到早期 3.x 时后续 episode 与 archive 新字段暂不可见，但数据保留。
- 移入 4.x 的增强可以保留线索，但不得是第三季结局必需信息。

## 12. 有意不做

- 不新增主冲突、路线、主要结局、角色或 schema 字段。
- 不在 RC 扩展剧情或提示词清单。
- 不删除旧存档、收藏、outcome records 或自动迁移 RC 测试数据。
- 不直接发布 4.0，最终放行按独立方案执行。

## 13. 退出闸门

尾声、关系、连续性、总账、第三季 outcome archive、正式素材和 RC 全矩阵通过后 3.9 内容才算完整。之后只允许按 4.0 方案稳定晋升。
