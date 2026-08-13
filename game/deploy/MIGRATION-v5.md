# 迁移说明 · v5 存档 / 收藏 v2 / 结果档案（2.2 架构阶段）

> 关联方案：[SOL-PLAN-2.2.md](../docs/SOL-PLAN-2.2.md) §5/§10。
> 范围：本文只描述**存储格式与迁移语义**（技术契约）。任何具体剧情/事实由 canon 签认后填充，不在本文内确定。

## 1. 新增键（与旧键并存，互不覆盖）

| 键 | 用途 | 写入方 |
| --- | --- | --- |
| `4945-vn:v5:save:<slot>` | 第二季 campaign 存档（schema5） | `writeSaveV5` |
| `4945-vn:v2:collection` | 收藏 v2（独立键） | `mergeCollectionV2` / `appendCollectionV2Seen` |
| `4945-vn:v1:outcomes` | `Season1OutcomeRecord` 档案（独立，不占普通存档槽） | `writeOutcomeRecord` |

`<slot>` ∈ `auto | quick | 1..6`（与 v4 同槽位集）。

### 保留的旧键（只读或回退来源，绝不删除/覆盖）

- `4945-vn:v4:save:*`、`4945-vn:v3:save:*`、`4945-vn:save:*`（第一季来源档）
- `4945-vn:settings`
- `4945-vn:collection`（旧收藏，作为 v2 的只读回退）

## 2. 非破坏性不变量

1. **来源档零字节保留**：v4/v3/legacy 存档与旧收藏键永远不会被 v5 流程写入、删除或覆盖。
2. **收藏 v2 与旧收藏独立**：v2 缺省时读路径回退到旧收藏（只读，不回写 v2），旧键不受影响。
3. **结果档案独立**：outcome archive 使用独立键，普通存档删除与此**完全隔离**（不同键）。
4. **损坏/矛盾来源不被静默修复**：解析失败的项被跳过而非改写；验证失败的对象被拒绝写入而非降级成另一结果。
5. **重复迁移幂等**：相同内容按 `digest` 去重，重复 `writeOutcomeRecord` 得到同一 `recordId`，不重复追加。

## 3. 写入校验

- `writeSaveV5` 在写入前调用 `isStructuralV5State`；非结构合法状态**抛错拒绝**，不写入半成形档。
- `writeOutcomeRecord` 在写入前用 `isSeason1OutcomeRecord` 守卫。
- 收藏写入仅追加已知 `s2-` 前缀节点（`appendCollectionV2Seen` 对非法前缀忽略）。

## 4. 回滚到 2.1 的行为

- 2.1 不识别 `v5:save` / `v2:collection` / `v1:outcomes` 键，因此这些键**原样保留**，仅 UI 不可见。
- 任何回滚演练都必须证明：2.1 不会把未知键当作损坏数据清理（2.1 只读取白名单内的已知键）。
- 重新进入 2.2 后，v5 进度与 outcome archive 自动恢复。

## 5. 实现位置

| 职责 | 文件 | 主要导出 |
| --- | --- | --- |
| 数据契约 / 验证器 / digest | `src/engine/season2-outcome.ts` | `Season1OutcomeSummary`, `Season1OutcomeRecord`, `GameStateV5`, `validateSeason1OutcomeSummary`, `computeOutcomeDigest`, `buildOutcomeRecord`, `dedupeByDigest` |
| 存储层 | `src/engine/season2-storage.ts` | `readCollectionV2`, `mergeCollectionV2`, `appendCollectionV2Seen`, `readOutcomeArchive`, `writeOutcomeRecord`, `deleteOutcomeRecord`, `writeSaveV5`, `readSaveV5`, `deleteSaveV5` |
| 集注册表 / 回报账本 | `src/content/season2/registry.ts` | `SeasonEpisodeDefinition`, `SEASON2_EPISODES`, `ChoicePayoffLedgerEntry`, `SEASON2_PAYOFF_LEDGER`, `registerEpisode`, `markEpisodeComplete`, `registerPayoff` |
| 空夹具 | `src/content/season2/fixtures.ts` | `EMPTY_*`, `SAMPLE_*`, `makeV5State` |
| 单测 | `src/engine/season2-outcome.test.ts`、`src/engine/season2-storage.test.ts`、`src/content/season2/registry.test.ts` | 36 项全过 |

## 6. 待 canon 签认后补充

- `s2-` 剧情节点与 `S2-` 图片提示词（由场景卡签认驱动）。
- `KNOWN_DURABLE_FACTS` 由 `S2-INHERITANCE-CONTRACT.md` 填充（当前为空，架构阶段仅允许空列表）。
- 序章 `SeasonEpisodeDefinition` 登记与 payoff ledger 内容。
- 标题页「第二季」来源档选择流与 v5 campaign 构建器（依赖 canon 事实）。
