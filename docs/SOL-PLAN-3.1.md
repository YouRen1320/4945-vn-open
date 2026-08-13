# 《4945区》3.1 Sol 方案：第二季回望补遗与结局档案

> 状态：条件 Sol 方案；必须建立在真实 3.0 postmortem 上，当前不代表已有可写场景。
>
> 发布性质：第二季桥接内容增量，继续使用 schema5；不开始第三季正式时间线。
>
> 前置：[3.0 完整第二季稳定晋升与第三季交接](./SOL-PLAN-3.0.md)。
>
> 后继：[3.2 第三季共通序章与连续性开局](./SOL-PLAN-3.2.md)。

## 1. 目标与范围

3.1 只处理两类真实缺口：3.0 postmortem 证明缺少的第二季成员/结果视角，以及 2.9 明确标记 `moved-to-3.x` 但不影响第二季完整性的可选线索。它不重复 2.9 尾声，不改变主要结局，也不偷渡第三季事实。

若 postmortem 没有足以形成完整剧情单元的缺口，3.1 不得发布空壳或填充短篇；应记录“无需 3.1 内容版”，把 outcome archive 加固并入 3.0 补丁，再直接进入 3.2 canon 决策。

## 2. 剧情单元合同

当 3.1 获准发布时，内容结构为一个回望框架加若干完整补遗篇：

- 每篇对应一个已登记的缺口或可选线索组；
- 从已完成第二季 outcome family 解锁，不要求保留原普通存档；
- 通过新的成员视角、结果余波或未见行动增加理解，而非复述结局摘要；
- 至少一个选择改变该补遗内部的沟通、理解或局部结果；
- 结束时关闭该缺口，或经用户批准提升为第三季 continuity thread；
- 不回写、重判或覆盖第二季 main ending 与 relationship resolution。

补遗数量由真实缺口决定，不按路线数或结局数机械配额。

## 3. 连续性债务整理

建立 `ContinuityDebtLedger`，逐项处理：

- `close-in-3.1`：本版剧情回收；
- `promote-to-s3`：用户确认后进入第三季 canon 候选；
- `retire`：明确说明不再延续；
- `fix-only`：属于事实/错字修复，不扩成剧情；
- `reject`：没有证据或不符合范围，关闭请求。

3.1 结束时不得保留没有状态、目标版本或 fallback 的“以后再看”。

## 4. Outcome archive 加固

- 从合法第二季完成状态生成不可变 `Season2OutcomeRecord`；
- 第一季与第二季 records 通过稳定 `lineageId` 形成血缘；
- 普通存档删除不删除 records；
- archive 显示玩家可理解的季、路线、结局、关系收束和创建时间；
- 内部 flags、digest 和调试字段不直接展示；
- 导出 campaign 时包含所依赖 records，重复导入去重；
- supersede 保留旧记录并解释新旧关系，不就地改写。

3.1 补遗解锁只读取 outcome archive 和收藏，不扫描或猜测“最近一个存档”。

## 5. ID 与素材

- 新补遗节点使用 `s2x-`，提示词使用 `S2X-`；
- 第二季既有节点、选择、结局和 CG ID 不修改；
- 每个补遗拥有独立场景卡、事实标签、完成 ID 和素材引用；
- 本版交付 `V3.1-ASSET-MANIFEST.md`、`V3.1-IMAGE-PROMPTS.md` 和素材验收；
- 图片由用户外部生成，`targetRelease = 3.1` 的托管视觉发布前全部 ready。

## 6. 交付物

```text
docs/season2/S2-POSTMORTEM.md
docs/season2/S2X-SCENE-CARDS.md
docs/season2/S2X-CONTINUITY-DEBT.md
docs/season2/V3.1-ASSET-MANIFEST.md
docs/season2/V3.1-IMAGE-PROMPTS.md
docs/season2/V3.1-ASSET-ACCEPTANCE.md
game/docs/V3.1-ACCEPTANCE.md
```

## 7. 验收标准

1. 每篇补遗可追溯到 postmortem 缺口或已批准线索，不存在填充内容。
2. 每篇提供新视角、有效选择和局部收束，不复述 2.9 尾声。
3. 第二季主要结局、关系收束和既有 ID 零改动。
4. continuity debt 每项已关闭、提升、退休、修复或拒绝，无 unknown。
5. outcome archive 的创建、去重、supersede、删除隔离和导入导出通过。
6. 删除来源普通存档后，补遗仍可从 archive 正确解锁。
7. 第一季、第二季、迁移、回放、收藏和离线零回归。
8. 本版素材 ready，类型检查、单测、内容图、构建、E2E 与设备验收通过。

## 8. 迁移与回滚

本版继续使用 schema5。回滚到 3.0 时，`s2x-` 进度暂时不可见，但 outcome archive 和 records 保留；旧版本不得把未知记录视为损坏并删除。重新升级后补遗进度恢复。

## 9. 兼容性妥协

- 补遗按真实缺口而非路线平均分配，部分结局族可能没有新增篇章。
- 提升到第三季的线索只进入 canon 候选，不保证最终成为结构分支。
- outcome archive 增加本地数据，但解除来源档长期占槽。

## 10. 有意不做

- 不开始第三季正式时间线，不写第三季日期或事件。
- 不新增第二季主要结局、路线或关系结果。
- 不把 postmortem 的所有建议自动变成剧情。
- 不生成图片或让 fallback 冒充本版正式素材。

## 11. 退出闸门

真实补遗、continuity debt、outcome archive、正式素材和全量回归通过后 3.1 才可发布。若无真实补遗范围，则明确取消内容版，不发布空版本。
