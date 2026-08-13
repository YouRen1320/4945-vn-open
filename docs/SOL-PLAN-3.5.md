# 《4945区》3.5 Sol 方案：第三季旧选择后果与中点重构

> 状态：条件 Sol 方案；具体中点事实依赖第三季 canon 和 3.4 承诺状态。
>
> 发布性质：让第三季与获批多季线索共同到期的中点剧情单元。
>
> 前置：[3.4 首次不可逆承诺与路线分歧](./SOL-PLAN-3.4.md)。
>
> 后继：[3.6 力量关系与人物信任重排](./SOL-PLAN-3.6.md)。

## 1. 目标与范围

3.5 回收 3.3–3.4 的选择，并在 canon 支持时回收至少一个从 3.1 正式提升到第三季的 continuity thread。中点必须改变玩家对第三季目标、冲突或自身位置的理解，使后半季不能按原计划机械继续。

中点不能靠突然出现的未铺垫事实制造，也不能因为前代结局不同就写成彼此冲突的公共 canon。

## 2. 剧情单元合同

### 2.1 后果到达

- 每条活跃路线至少回收一个第三季前期选择；
- 回收在场景、可用行动、人物反应、资源或路线状态中可见；
- 被提升的前代 thread 只能按批准影响级别进入；
- fallback 玩家仍有完整内容，但不获得不存在的前置成果；
- 不用总结文本代替全部后果演出。

### 2.2 中点重构

中点必须：

1. 回答前半季一个核心问题；
2. 由已发布因果和已确认事实共同推动；
3. 迫使玩家重新排序目标、信任或代价；
4. 形成后半季可执行的新目标；
5. 给玩家一次回应或决策；
6. 不提前解决最终危机。

### 2.3 阶段收束

本集同时关闭“前期承诺是否产生后果”和“玩家接下来为何改变行动”两个问题。信息揭示后必须允许玩家回应，不能直接切到待续。

## 3. 跨季 payoff 与债务审计

- `dueIn = 3.5` 的 S3 choices 全部拥有消费节点和测试；
- 提升到 S3 的 continuity threads 有实际 payoff 或经批准延期；
- 一项前代事实只能从 continuity profile 消费，不回查原存档；
- 已回收项标记实际节点，内容修订后不重复触发；
- 延期项更新目标版本、原因和 fallback；
- 不再使用的 normalized facts 从 profile 白名单移除或退休。

## 4. 内容修订与恢复

3.5 验证真实多季升级：

- 从 3.0、3.1、3.2、3.3、3.4 合法完成点升级；
- 在 3.4 结构分支中途保存、升级和继续；
- alias/tombstone 处理已发布节点修正；
- contentRevision、profileVersion 和 outcomeRecordVersion 各自幂等迁移；
- 无法继续的存档隔离报错并保留原数据；
- superseded outcome 不静默改写已开始 campaign 的 profile 快照。

## 5. 交付物

```text
docs/season3/S3-EPISODE-3.5.md
docs/season3/S3-MIDPOINT-CONTRACT.md
docs/season3/S3-CROSS-SEASON-PAYOFF.md
docs/season3/S3-CONTENT-MIGRATION-MATRIX.md
docs/season3/S3-CHOICE-PAYOFF-LEDGER.md（更新）
docs/season3/V3.5-ASSET-MANIFEST.md
docs/season3/V3.5-IMAGE-PROMPTS.md
game/docs/V3.5-ACCEPTANCE.md
```

中点关键行动图优先于低频差分；提示词不能引入场景卡之外的新事实。

## 6. 验收标准

1. 每条活跃路线至少回收一个第三季前期选择，结果在可玩内容中可见。
2. 获批跨季 thread 按声明级别回收，不读取原始存档。
3. 中点由既有因果推动并改变后半季目标，玩家有回应。
4. `dueIn = 3.5` 项关闭或有批准延期，测试可追溯。
5. 3.0–3.4 各合法状态与 3.4 中途档可升级继续。
6. content/profile/outcome 各版本迁移幂等，supersede 不改变现有 campaign。
7. 三季既有内容、archive、离线和收藏零回归，本版素材 ready。
8. 类型检查、单测、内容图、构建、E2E 和设备验收通过。

## 7. 迁移与回滚

本版继续 schema5。回滚到 3.4 时保留中点状态，旧版本不得猜回某个前期分支或重算 profile。重新升级后恢复；被 supersede 的来源结果仍按 campaign 已保存快照解释。

## 8. 兼容性妥协

- 不是所有前代线索都在中点回收；未到期项必须有 3.6–3.9 目标。
- 为保持旧档可达，结构修正可能长期保留 alias/tombstone。
- 同一公共中点可因 continuity 产生不同语境，但不能产生互相冲突的事实版本。

## 9. 有意不做

- 不提前进入 3.7 最终危机或 3.8 高潮。
- 不用 schema6 掩盖内容修订问题。
- 不修改已开始 campaign 的 continuity 快照。
- 不生成图片或在提示词中补写 canon 外事实。

## 10. 退出闸门

中点因果、到期 payoff、跨版本恢复、正式素材和全量回归通过后 3.5 才可发布。任何合法旧档无法继续都是阻断项。
