# 《4945区》事件三序章 Sol 方案：共通序章与连续性开局

> 状态：条件 Sol 方案；具体剧情被第三季 canon 用户签认闸门阻塞。
>
> 发布性质：第三季首个稳定内容单元；应用版本从 3.3.0 起继续推进，剧情 episode 编号不再与应用版本绑定。
>
> 前置：[3.1 第二季回望补遗与结局档案](./SOL-PLAN-3.1.md)，或经记录确认无需 3.1 内容版；实现前必须冻结第三季 canon。
>
> 后继：[事件三 3.3 多季余波落地与新目标](./SOL-PLAN-3.3.md)。

## 1. 目标与范围

3.2 冻结第三季事实与创作边界，交付完整可玩的第三季共通序章。玩家从第二季 outcome archive 或引导式连续性建档创建新的 season3 campaign，在序章中看见前两季结果被承认，并面对第三季第一个可行动问题。

3.2 不复制第一、第二季完整状态，不为了“新一季”惯性升级 schema6。

## 2. 第三季 canon 闸门

用户必须签认 `docs/season3/S3-CANON.md`：

- 时间范围、结束边界与事实标签；
- 主题命题、公共主冲突与玩家初始目标；
- 活跃、承认、退休和不可用路线；
- 回归、缺席、新增和不可使用角色；
- 第一/第二季 outcome fields 的最高影响级别；
- 合法 continuity bundles 与冲突处理；
- 失败状态、主要结局和关系收束结构；
- 未决且禁止实现者自行补写的空位。

未签认时只能实现通用类型、验证器和空夹具，不能创建正式 `s3-` 节点或具体图片提示词。

## 3. 连续性来源

玩家可以：

1. 选择一个合法、已完成的第二季 `SeasonOutcomeRecord`；
2. 或在明确剧透提示后进入引导式连续性建档。

系统生成 `ContinuityProfile`，只包含第三季实际消费的归一化事实。多个结果并存时不自动选择；不存在所谓默认官方结局。引导式建档只提供用户签认的合法 bundles，不暴露任意 flags、数值或调试字段，并生成明确标为 `source = recap` 的合成 outcome records，不能伪装成实际通关。

每个 season3 campaign 保存 profile 值快照和来源 outcome IDs。来源 record 后来被删除或 supersede，不静默改变已开始 campaign。

## 4. 序章剧情合同

序章必须：

1. 通过剧情而非数据表确认多季结果；
2. 建立第三季新的日常位置和人物关系状态；
3. 引入经 canon 确认的公共扰动或问题；
4. 让全部活跃路线拥有合法进入理由；
5. 提供第一个有即时结果的有效选择；
6. 形成第三季第一个明确目标；
7. 解决“玩家是否以及如何进入新局面”的局部问题；
8. 标记序章完成并返回季/集中心。

序章不能成为前两季剧情复述，也不能用一段预告冒充可玩内容。

## 5. 数据与 ID

- 第三季节点、选择、结局和素材引用使用 `s3-`，提示词使用 `S3-`；
- 序章登记为 `SeasonEpisodeDefinition`；
- 使用稳定 `campaignId`、`lineageId`、`contentRevision` 和 episode completion；
- 新建目标槽不覆盖 outcome archive；覆盖现有 season3 槽需单独确认；
- schema5、profileVersion 和 outcomeRecordVersion 分开；
- 导出 season3 campaign 携带 continuity profile 和依赖 records。

## 6. 交付物

```text
docs/season3/S3-CANON.md
docs/season3/S3-CONTINUITY-CONTRACT.md
docs/season3/S3-GUIDED-RECAP.md
docs/season3/S3-CHOICE-PAYOFF-LEDGER.md
docs/season3/S3-EPISODE-PROLOGUE.md
docs/season3/V3.3-ASSET-MANIFEST.md
docs/season3/V3.3-IMAGE-PROMPTS.md
docs/season3/S3-CHARACTER-ANCHORS.md
game/docs/V3.3.0-ACCEPTANCE.md
```

具体提示词只在场景卡与第三季角色锚点签认后编写。图片由用户外部生成，本版托管视觉发布前全部 ready。

## 7. 验收标准

1. 第三季 canon 由用户签认，正式节点无未确认具体事实。
2. 每个合法第二季 outcome family 和 recap bundle 均能生成有效 profile 并进入序章。
3. 序章有开端、扰动、玩家选择、即时后果和阶段收束。
4. 多个 outcomes 并存时不自动选择，剧透提示和人类可读摘要清晰。
5. 删除普通来源存档不影响开局；删除/supersede outcome 不改写已开始 campaign。
6. schema5 不因第三季误升 schema6，profile/outcome 版本迁移幂等。
7. 第一、第二季及全部补遗、回放、收藏和离线零回归。
8. 本版素材 ready，类型检查、单测、内容图、构建、E2E 和目标设备通过。

## 8. 迁移与回滚

回滚到 3.0/3.1 时，season3 campaign 暂时不可见，但 v5 存档、continuity profile 和 outcome archive 保留。重新升级后恢复。旧版本不得把 `seasonId = season3` 当损坏档自动重置。

## 9. 兼容性妥协

- 第三季只继承归一化结果，不能重现前两季每次选择。
- 引导式建档会涉及结局剧透，因此必须由玩家显式进入。
- 部分旧路线只被承认或退休，不保证结构性延续。

## 10. 有意不做

- 不在 canon 签认前确定第三季日期、角色、路线或结局。
- 不把序章扩成 3.3 的完整展开。
- 不升级 schema6、不复制前两季完整历史或 flags。
- 不生成图片或替用户选择外部模型。

## 11. 退出闸门

canon、continuity profile、序章和升级/回滚全部通过后才可发布。任何合法 outcome 无法进入或依赖普通来源槽都是阻断项。
