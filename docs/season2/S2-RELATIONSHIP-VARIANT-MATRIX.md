# S2 关系变体矩阵（Relationship Variant Matrix）

> 版本：v2.6 · 组织与关系压力交汇
> 合同：[SOL-PLAN-2.6 §2.2–2.3]

## 1. 矩阵设计原则

- 不按「组织路线 × 伴侣 × 前期分支」全量复制。
- 组织路线决定结构骨架；关系默认影响 flavor 或 scene 层。
- 只有 canon 明确批准时，关系才提升为 structural/ending 影响。
- 每个组合有确定覆盖或声明 fallback。

## 2. 2.6 关系变体覆盖表

### 2.1 有伴侣路径

| route | 常见伴侣 | 关系压力出场方式 | 级别 |
| --- | --- | --- | --- |
| org2–org6 | 第一季继承的任一合法伴侣 | 共用关系压力骨架；`activePartnerRelationship` 把数值后果落到真实 `activePartner` | flavor + effect |
| org2–org6 | 无伴侣 | 共用无伴侣路径；mentor 承担关系反馈 | flavor + effect |

### 2.2 无伴侣路径

所有路线的无伴侣玩家共享 `s2-2.6-relation`，压力来自 route 默认亲密成员或 mentor。

## 3. 继承字段使用

| 字段 | 级别 | 在 2.6 中的用途 |
| --- | --- | --- |
| `activePartner` | structural | 决定 2.6/2.7 选择效果修改谁，并决定 2.9 的十二位伴侣收束 |
| `relationshipTiers[partner]` | structural | 0–100 层级，影响 scene 层 flavor 措辞（预留，本版未差异化） |
| `s1-route-complete` | structural | org-priority 选择继承 |
| `s1-cross-org-tie` | structural | rel-priority 选择继承 |

## 4. Fallback 策略

| 情形 | fallback |
| --- | --- |
| 无伴侣 | 共用无伴侣场景，不缺少可玩路径 |
| 伴侣不在 2.6 共通场景中 | 信任变化仍落到真实伴侣；代表性黄金样板负责验证人物化演出方式 |
| 关系未从 S1 继承 | 初始 trust 默认为 5，选择效果在此基础上加减 |

## 5. 边界

- 本集不新增可恋爱角色。
- 本集不让关系结局替代组织主结局。
- 本集不将 flavor 级别的关系差异提升为 structural 分支（除非后续 canon 变更）。
