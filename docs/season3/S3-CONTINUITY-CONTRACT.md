# 第三季 Continuity Profile 合约（S3-CONTINUITY-CONTRACT）

> 状态：**已签认（2026-08-09）**。
>
> 关联：[S3-CANON.md](./S3-CANON.md)；[SOL-PLAN-3.2.md](../SOL-PLAN-3.2.md) §3–5；[S2X-CONTINUITY-DEBT.md](../season2/S2X-CONTINUITY-DEBT.md)。
>
> 实现：`game/src/engine/season3-continuity.ts`；测试：`game/src/engine/season3-continuity.test.ts`。

## 1. 目的与边界

本合约冻结 S2 outcome v1→v2 的读取迁移、S3 `ContinuityProfile` 的白名单、引导式建档和多结果去重规则。S3 画像必须是自包含 JSON 快照；生成时不读取普通存档或 S1 outcome archive，来源被删除后也不改变既有 campaign。

本阶段不创建 `s3-` 剧情节点、UI、图片、版本号或部署产物。

## 2. Season2Outcome v2

### 2.1 新增字段

`Season2OutcomeSummary` 当前版本固定为 `summaryVersion: 2`，在 v1 字段上新增：

```typescript
type Season2OutcomeSource =
  | { kind: 'save'; slot: string; savedAt: number }
  | { kind: 'recap'; contractVersion: number }
  | { kind: 'legacy'; originalSummaryVersion: 1 | 2 }

interface Season2OutcomeSummaryV2 {
  summaryVersion: 2
  source: Season2OutcomeSource
  durableFacts: DurableFact[]
  s2Complete: boolean
  s2EpilogueComplete: boolean
  finaleEndingId: 's2-finale-complete' | null
  completionEvidence: 'explicit' | 'legacy-derived' | 'recap-declared'
  // 其余字段沿用 v1
}
```

真实通关必须使用完成时的 S2 v5 槽作为 `source.save.slot`；原始 S1 血缘继续由 `lineageId` 和嵌入的 S1 summary 表达，不与 S2 槽位混用。`durableFacts` 在 S2 完成时从嵌入的 S1 summary 白名单复制，排序去重后写入 v2。

### 2.2 完成证明

可写入归档并用于 S3 的记录必须同时满足：

1. `s2Complete === true`；
2. `s2EpilogueComplete === true`；
3. `finaleEndingId === 's2-finale-complete'`，且 `unlockedEndings` 含同一 ID；
4. `s2MainEnding` 非空并与 route 的 triumph/compromise 结局一致；
5. `organization === route`，route 为 org2–org6。

仅有非空结局字符串不构成完成证明。`s2EpilogueEnding` 文本 ID 可为空；在完成旗标和 finale 证据齐全时，S3 画像回退使用 `s2MainEnding` 并记录 warning。

### 2.3 v1 读取迁移

- 迁移是纯函数和只读内存视图；读取不会改写 localStorage 原始 v1 对象。
- v1 只有在 main ending、epilogue ending、`s2-finale-complete` 三项旧证据齐全时，才派生完整证明。
- v1 无法恢复真实槽位，来源固定标记为 `legacy`；缺失的 `durableFacts` 固定为 `[]`，不去外部 archive 猜测。
- v1 的 `recordId`/`digest` 用旧 canonical 算法验证并保留；原生 v2 用 v2 canonical 算法验证。篡改或未来版本被隔离。
- 新写入、导入、删除或 supersede 均保留同一 archive 中其他 v1 entry 的 summary 版本，不执行隐式全量迁移。
- digest 排除来源、创建时间和 summary 版本；S3 候选按归一化内容 digest 去重。

## 3. S3ContinuityProfile v1

### 3.1 字段白名单

```typescript
interface S3ContinuityProfile {
  profileVersion: 1
  source: Season2OutcomeSource
  route: 'org2' | 'org3' | 'org4' | 'org5' | 'org6'
  organization: 'org2' | 'org3' | 'org4' | 'org5' | 'org6'
  organizationName: string
  activePartner: RomanceCandidateId | 'bottle' | 'truth' | 'none'
  s2MainEnding: string
  s2Triumph: boolean
  s2EpilogueEnding: string
  s2RelationshipResolved: RomanceCandidateId | 'bottle' | 'truth' | 'none'
  durableFacts: DurableFact[]
  s2FlavorHooks: S2FlavorHook[]
  cohesion: number
  reputation: number
  resources: number
  summaryVersion: 2
  completionEvidence: 'explicit' | 'legacy-derived' | 'recap-declared'
  contentRevision: string
  createdAt: number
  warnings: string[]
}
```

未知顶层字段被拒绝。整个 profile 必须可无损 JSON round-trip：允许 null、有限数字、字符串、布尔、数组和普通对象；拒绝循环、超过 32 层的异常嵌套、稀疏数组、`undefined`、`NaN`、`Infinity`、Date、Map、函数、symbol 字段和非普通对象。

### 3.2 Structural 与 ending 规则

| 字段 | 规则 | 失败行为 |
| --- | --- | --- |
| `route` / `organization` | 两者相同且属于 org2–org6 | 阻断 |
| `organizationName` | 非空 | 阻断 |
| `s2MainEnding` | `s2-ending-{route}-{triumph|compromise}` | 阻断 |
| `s2Triumph` | 与主结局后缀一致 | 阻断 |
| `s2EpilogueEnding` | 空时回退到主结局 | warning |
| `s2RelationshipResolved` | 12 名合法伴侣、瓶/真理回顾兼容值或 `none` | 阻断 |
| `activePartner` | 优先采用关系收束；接受第一季登记的全部合法伴侣，另保留瓶/真理回顾兼容关系 | 未登记旧值落 `none` 并 warning |

org1 是 S3 中的 acknowledged 公共机构，不是可玩 structural route，因此 org1 outcome 不生成有效 S3 profile。

现有 GameState 持久化校验只把 romance candidates 视为合法 `activePartner`；`bottle`/`truth` 的 recap 通过 `s2RelationshipResolved` 表达，summary 的 `activePartner` 保持 null，不扩张旧状态契约。

### 3.3 Durable facts 与 flavor hooks

`durableFacts` 直接取自自包含的 S2 v2 summary，只接受既有十项 `KNOWN_DURABLE_FACTS` 白名单，排序去重。v1/recap 没有可证明事实时为 `[]`；空数组不阻断。

合法 flavor hooks：

| hookId | fromEnding |
| --- | --- |
| `s2-org2-triumph-line` | `s2-ending-org2-triumph` |
| `s2-org5-undercurrent` | org5 triumph / compromise |
| `s2-org4-appendix` | `s2-ending-org4-compromise` |

这些字段只改变措辞，不解锁路线或机制。

### 3.4 数值范围

范围服从当前引擎真实边界，而非抽象百分制：

| 字段 | 范围 | 越界行为 |
| --- | --- | --- |
| `cohesion` | 0–5 | 收敛到边界并 warning |
| `reputation` | -5–5 | 收敛到边界并 warning |
| `resources` | 0–5 | 收敛到边界并 warning |

summary 缺字段或非有限数字属于损坏记录，直接阻断，不猜测默认值。

## 4. 引导式建档（Recap）

Recap 由玩家明确选择 route、triumph/compromise、12 名合法伴侣（另含瓶/真理回顾兼容）或 none 后生成：

- `source = { kind: 'recap', contractVersion: 1 }`；
- `summaryVersion = 2`，三项完成证明齐全，`completionEvidence = 'recap-declared'`；
- stats 使用引擎中性值 `0/0/0`，durable facts 为 `[]`；
- 使用与真实 v2 相同的 canonical digest；同内容不因 save/recap 来源不同而重复；
- UI 后续必须明确显示“建档（非实际通关）”。本阶段只实现数据生成器，不实现 UI。

## 5. 多记录、supersede 与快照

- 多个合法结果不自动选择；后续 UI 必须让玩家手动选择。
- 同一归一化内容 digest 只展示 createdAt 最新者，归档原记录不删除。
- superseded、incomplete、org1、route/ending 矛盾和未知版本不进入候选。
- S3 campaign 创建时复制完整 profile；之后删除或 supersede 来源不改变 campaign 快照。
- `ContinuityProfile` 在 schema5 中改为递归 JSON 值，挂载和续玩时深拷贝，避免引用串改。

## 6. 验收标准

1. 十个 S2 主结局都生成有效 profile；
2. org2–org6 recap 与 12 名合法伴侣、瓶/真理回顾兼容值及 none 均有效；
3. org1、缺完成证明、路线/组织/结局矛盾、未知关系、superseded、未来版本和 digest 篡改均阻断；
4. v1 迁移幂等、不修改入参或 localStorage 原始字节，且不伪造来源或 durable facts；
5. profile JSON round-trip 等价，坏 JSON 值被拒；
6. 数值范围、epilogue 回退、flavor hooks、durable facts 和归一化去重均有测试；
7. `season3-continuity.test.ts` 至少 31 项测试；全量测试、类型检查、资源检查和生产构建通过。

---

> 签认栏：☑ 已确认，可按本合约实现 S3 continuity 数据层
>
> 签认人：用户（Codex 对话确认）　日期：2026-08-09
