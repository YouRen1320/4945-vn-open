# S2 结果档案合同（Outcome Archive Contract）

> 已实现合同：定义 `Season1OutcomeSummary` / `Season1OutcomeRecord` 的格式、来源、去重与不可变性。
> `durableFacts` 只允许 `season2-outcome.ts` 中 `KNOWN_DURABLE_FACTS` 的签认白名单值。
> 代码实现：[`src/engine/season2-outcome.ts`](../game/src/engine/season2-outcome.ts)。

## 1. Season1OutcomeSummary（白名单值快照）

写入新 v5 档作为 season1 outcome payload；来源 v4 后续变化不反向修改它。不复制第一季完整 history / processedNodes / variables / 原始关系数值。

| 字段 | 类型 | 约束 |
| --- | --- | --- |
| `summaryVersion` | `number` | ≥ 0 |
| `source` | `OutcomeSource` | 见 §3 |
| `route` | `RouteId \| null` | `org2..org6` 或 `null` |
| `organization` | `OrganizationId \| null` | `org1..org6` 或 `null` |
| `organizationName` | `string` | 非空 |
| `organizationEndingId` | `string` | 结局 id（canon 签认后填充，架构阶段可空串） |
| `activePartner` | `CharacterId \| 'none'` | 已知可恋爱角色或 `'none'`（显式二选一，不混淆 null） |
| `relationshipTiers` | `Partial<Record<CharacterId, number>>` | 每值 0–100，键为已知角色 |
| `durableFacts` | `DurableFact[]` | **枚举白名单**；只接受当前 `KNOWN_DURABLE_FACTS` 中的值 |
| `createdAt` | `number` | ≥ 0 时间戳 |

校验：`validateSeason1OutcomeSummary` 返回 `{ ok, errors }`；守卫 `isSeason1OutcomeSummary`。

## 2. Season1OutcomeRecord（不可变，进独立档案）

`record` 进入 outcome archive（`4945-vn:v1:outcomes`），**不占用普通存档槽**；保存结果、来源、内容修订与 digest，不保存完整 `GameState`。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `recordId` | `string` | 由 `digest` 派生：`outcome-<digest>` |
| `digest` | `string` | 对「内容」的稳定摘要（见 §4） |
| `summary` | `Season1OutcomeSummary` | 值快照，写入后不变 |
| `source` | `OutcomeSource` | 比 summary.source 更完整的来源元信息 |
| `contentRevision` | `string` | 内容修订标记 |
| `createdAt` | `number` | ≥ 0 |
| `campaignId?` | `string` | 被某 campaign 复用后回填 |
| `lineageId?` | `string` | 同一次第一季结果衍生的 lineage |

校验：`isSeason1OutcomeRecord`。

## 3. OutcomeSource

```ts
type OutcomeSource =
  | { kind: 'save';  slot: string; savedAt: number }   // 合法第一季完成档
  | { kind: 'recap'; contractVersion: number }          // 经批准的回顾建档
```

- 多个完成档并存时**绝不自动选择**；由玩家在开局流中显式挑选（canon 签认后实现）。
- 损坏或矛盾来源不可选择，但不得被删除、覆盖或静默修复成另一结果。

## 4. Digest 与去重

- `computeOutcomeDigest(summary)`：对**内容**（route/organization/organizationName/organizationEndingId/activePartner/relationshipTiers/durableFacts）做键排序规范化后取 FNV-1a 十六进制。
- **排除** `source` 与 `createdAt`，因此相同结果（无论来自 save 还是 recap）得到相同 digest → 幂等去重。
- `dedupeByDigest`：按 digest 去重，保留首次出现。
- `writeOutcomeRecord`：digest 已存在则返回既有 record，不重复写入。

## 5. 提取助手（from first-season GameState）

- `extractSeason1Summary(state, slot, savedAt)`：从第一季 `GameState` 提取白名单字段，`source` 取 `save`，并按继承合同生成 `durableFacts`。
- `buildOutcomeRecord(summary, contentRevision)`：计算 digest 并构造 record。

## 6. 违规与边界

| 情形 | 行为 |
| --- | --- |
| `durableFacts` 含非白名单值 | 验证失败 |
| `relationshipTiers` 越界/未知角色 | 验证失败 |
| 损坏 JSON 档案 | 跳过该项，不静默修复 |
| 重复内容 | digest 去重，返回既有 record |
| 普通存档删除 | 不影响 outcome archive（不同键） |
