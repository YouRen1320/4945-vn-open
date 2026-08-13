# S2 回顾建档合同（Recap Contract）

> 关联：[S2-CANON.md](./S2-CANON.md) §3/§6；[season2-outcome.ts](../game/src/engine/season2-outcome.ts) 的 `OutcomeSource`（`kind: 'recap'`）。
> 本文定义「无合法第一季完成档时」的回顾建档（recap）合法组合。回顾建档**只允许 canon 允许的合法组合**，不提供任意 flags 或数值编辑器。

## 1. 触发条件

在标题页「第二季」入口，若扫描不到任何「已完成且属于 org2–org6」的第一季存档（`readSave` 成功，且含注册表认可的对应路线组织结局或已抵达 `credits-first-season`），则向玩家提供「回顾建档」作为进入序章的来源。羁绊/隐藏结局不能单独证明路线已经完成；org1 存档继续保留，但不作为第二季可玩来源。

## 2. 合法组合（recap）

| 字段 | 允许值 | 说明 |
| --- | --- | --- |
| `route` | `org2`\|`org3`\|`org4`\|`org5`\|`org6` | 五条活跃路线任一 |
| `organization` | = `route` | 与路线一致 |
| `organizationName` | 由 `organizations[id].name` 固定映射 | 不加自由文本 |
| `organizationEndingId` | `''` | 回顾建档不声称具体结局 id |
| `activePartner` | 可恋爱角色 \| `'none'` | 玩家在列表中显式选择 |
| `relationshipTiers` | `{ [partner]: 100 }`（若 bonded）或 `{}` | 仅伴侣层级 |
| `durableFacts` | `['s1-route-complete', 's1-partner-bonded'\|'s1-partner-none', ...]` 子集 | 仅白名单 |
| `source` | `{ kind: 'recap', contractVersion }` | `contractVersion` = 当前回顾合同版本 |

- 玩家**必须显式选择** route 与伴侣状态；不能跳过或随机。
- 回顾建档产出的 `Season1OutcomeSummary` 经由 `validateSeason1OutcomeSummary` 校验，非法组合给出可解释错误而非静默修正。

## 3. 与 save 来源的等价性

- recap 与 save 来源在 `computeOutcomeDigest` 下**不等价**（source 不同）：digest 仅对内容（route/org/partner/tiers/facts）规范化，故相同内容的不同来源得到相同 digest → 同一 `Season1OutcomeRecord` 被去重复用。
- 由此：同一玩家既用存档、又用回顾建档，只会保留一条 outcome record（按 digest 去重），但可分别带有 save / recap 来源标记。

## 4. 约束

- 回顾建档**不写入**任何 v4 来源存档；它只产出 `Season1OutcomeRecord` 与一条 v5 campaign。
- 禁止通过回顾建档伪造未达成的路线结局或伴侣关系（仅允许白名单组合）。
- 若后续发现玩家其实有合法 v4 完成档，应优先提示其选择存档来源，而非用回顾建档覆盖。
