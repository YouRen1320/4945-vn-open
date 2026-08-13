# S2 选择回报账本合同（Choice Payoff Ledger）

> 架构阶段合同：定义序章（及后续集）每个选择的回报登记格式与继承分级。
> 仅技术契约，**不含具体回报文本/事实**。具体内容由 canon 签认后登记。
> 代码实现：[`src/content/season2/registry.ts`](../game/src/content/season2/registry.ts)。
> 当前运行时账本共 35 项：暑假桥接篇 11 项、原事件二序章 4 项、2.3–2.7 各 2 项、2.8 五路线各 2 项；2.9 无新增正式选择。修复页选择不计入正式账本。

## 1. ChoicePayoffLedgerEntry

| 字段 | 类型 | 约束 |
| --- | --- | --- |
| `episodeId` | `string` | 所属集 id（如 `s2-prologue`） |
| `nodeId` | `string` | 含该选择的节点 id（`s2-` 前缀） |
| `choiceId` | `string` | 该选择的稳定 id（schema5 `lastChoiceId` 同源） |
| `immediateResult` | `string` | **至少包含即时结果**描述 |
| `inheritanceLevel` | `InheritanceLevel` | 见 §2 |
| `inherits?` | `string[]` | 继承到的 durableFact id 或关系键（按 canon 合同填） |

校验：`isChoicePayoffLedgerEntry`。

## 2. 继承分级（InheritanceLevel）

```ts
type InheritanceLevel = 'flavor' | 'scene' | 'structural' | 'ending'
```

- `flavor`：仅语气/措辞变体，不影响后续机制。
- `scene`：场景/呈现层差异（背景、立绘、音乐）。
- `structural`：影响后续可玩结构（解锁、状态、可达性）。
- `ending`：影响结局分支或关系收束。

**约束**：序章不得擅自扩大继承级别（如把本应 `flavor` 的提升为 `structural`）。分级须对齐 `S2-INHERITANCE-CONTRACT.md` 的评级表（canon 签认后填）。

## 3. 注册表与检索

- `SEASON2_PAYOFF_LEDGER`：架构阶段为**空冻结数组**；序章与后续集登记后才有内容。
- `registerPayoff(ledger, entry)`：按 `(episodeId, choiceId)` 去重追加，返回新数组（不修改入参）。
- `findPayoffsForEpisode(ledger, episodeId)`：取某集全部回报。
- `findPayoff(ledger, episodeId, choiceId)`：精确定位单条。

## 4. 覆盖要求（验收 §7）

- 序章**每个选择**必须在 ledger 中至少登记一次（含即时结果）。
- 遗漏任一并视为不通过；由后续内容阶段补齐并使用 `findPayoff` 做完整性断言。

## 5. 边界

| 情形 | 行为 |
| --- | --- |
| `inheritanceLevel` 非法 | 验证失败 |
| `inherits` 非字符串数组 | 验证失败 |
| 重复 `(episodeId, choiceId)` | 注册去重，保留首次 |
| 架构阶段空 ledger | 合法；内容阶段填充 |

## 6. 已登记条目（内容阶段）

### 2.2 序章

| episodeId | choiceId | inheritanceLevel | inherits |
| --- | --- | --- | --- |
| s2-prologue | s2-prologue-stabilize | flavor | — |
| s2-prologue | s2-prologue-lead | structural | s1-cross-org-tie |
| s2-prologue | s2-prologue-accept | structural | s1-route-complete |
| s2-prologue | s2-prologue-hold | flavor | — |

### 2.3 新局势成形

| episodeId | choiceId | inheritanceLevel | inherits | 即时结果摘要 |
| --- | --- | --- | --- | --- |
| s2-2.3 | s2-2.3-assert | structural | s1-route-complete | 立场写足，协作留模糊余地；旧伙伴看出留后手，人情迟早还 |
| s2-2.3 | s2-2.3-balance | structural | s1-cross-org-tie | 协作写前、立场克制；旧伙伴脸面保住，评议未必买账 |

> 跨版本回收：2.3 两个选择在 2.4 首次到期，并在 2.5 以被圈出的硬话 / 联署签名页再次产生现场后果。

### 2.4 首次实质分歧

| episodeId | choiceId | inheritanceLevel | inherits | 即时结果摘要 |
| --- | --- | --- | --- | --- |
| s2-2.4 | s2-2.4-confront | structural | s1-route-complete | 一个人扛下全部反对声，主导权在握但全部压力归己 |
| s2-2.4 | s2-2.4-coalition | structural | s1-cross-org-tie | 牵头跨组织联盟表态，压力分摊但让渡部分主导权 |

> 持久状态：`variables.s2Diverge`（confront / coalition）延续到 2.5 回收（目标版本 2.5）。

### 2.5 后果与中点

| episodeId | choiceId | inheritanceLevel | inherits | 即时结果摘要 |
| --- | --- | --- | --- | --- |
| s2-2.5 | s2-2.5-guard | structural | s1-route-complete | 后半季优先稳住组织与旧伙伴，谨慎出牌 |
| s2-2.5 | s2-2.5-pivot | structural | s1-cross-org-tie | 后半季借联席协调席争取主动，承担更大风险 |

> 回收：2.5 同时读取 `s2Diverge` 与 `s2Stance`；路线场景写入 `variables.s2RoutePressure`，回应写入 `variables.s2Midpoint`（guard / pivot）供 2.6 回收。

### 2.6 组织与关系压力交汇

| episodeId | choiceId | inheritanceLevel | inherits | 即时结果摘要 |
| --- | --- | --- | --- | --- |
| s2-2.6 | s2-2.6-org-priority | structural | s1-route-complete | 在协调席坚持组织立场，短期获主导权但损伤关键关系信任 |
| s2-2.6 | s2-2.6-rel-priority | structural | s1-cross-org-tie | 在方案中让步维护伙伴关系，让渡部分协调权 |

> 回收：2.6 读取 `s2Midpoint` 与路线压力，真实伴侣亲自参与排序；回应写入 `variables.s2PressureStance` 与路线专属 `variables.s2MeetingArtifact`，均由 2.7 回收。

### 2.7 后期危机与终局前置

| episodeId | choiceId | inheritanceLevel | inherits | 即时结果摘要 |
| --- | --- | --- | --- | --- |
| s2-2.7 | s2-2.7-stand-firm | ending | s1-route-complete | 坚持到底：全押在自己选的方向上，赢则全赢，输则扛全部后果 |
| s2-2.7 | s2-2.7-cut-losses | ending | s1-cross-org-tie | 止损重组：牺牲局部目标保核心，代价是对手看到底线 |

> 回收：2.7 读取 `s2PressureStance` 与 `s2MeetingArtifact`；回应写入 `variables.s2FinaleEntry` 和 `variables.s2FinaleArtifact` 供 2.8 高潮路由与结果回响。所有 dueIn <= 2.7 清零。

### 2.8 高潮与主要结局

| episodeId | choiceId | inheritanceLevel | inherits | 即时结果摘要 |
| --- | --- | --- | --- | --- |
| s2-2.8 | s2-2.8-org2-strike | ending | s1-route-complete | 二组 triumph：拒绝出卖成员，以人心为最优先 |
| s2-2.8 | s2-2.8-org2-settle | ending | s1-cross-org-tie | 二组 compromise：锁死保护线，全员保留但评估权重暂降 |
| s2-2.8 | s2-2.8-org3-strike | ending | s1-route-complete | 三组 triumph：申请重评，全组下半季押在战绩上 |
| s2-2.8 | s2-2.8-org3-settle | ending | s1-cross-org-tie | 三组 compromise：接受评估附说明函，留复议窗口 |
| s2-2.8 | s2-2.8-org4-strike | ending | s1-route-complete | 四组 triumph：拆分精英赛道独立计分，以尺度制胜 |
| s2-2.8 | s2-2.8-org4-settle | ending | s1-cross-org-tie | 四组 compromise：接受统一标准但加赛保留，藏尺于体系 |
| s2-2.8 | s2-2.8-org5-strike | ending | s1-route-complete | 五组 triumph：拒绝公示外联网，独立的城墙 |
| s2-2.8 | s2-2.8-org5-settle | ending | s1-cross-org-tie | 五组 compromise：公示六成核心不交，表里如一 |
| s2-2.8 | s2-2.8-org6-strike | ending | s1-route-complete | 六组 triumph：反向定义独立表决位，名字印上章程 |
| s2-2.8 | s2-2.8-org6-settle | ending | s1-cross-org-tie | 六组 compromise：接受观察员席，锁定一年自动评审 |

> 回收：2.8 读取 `s2PressureStance` + `s2FinaleEntry` 路由四条高潮姿态；写入 `variables.s2MainEnding`（s2-ending-*-triumph / s2-ending-*-compromise）和 `s2ClimaxComplete` flag。所有 ending 级和 dueIn<=2.8 的选择已回收。开放项仅剩 2.9 尾声。

> 连续性修复：2.8/2.9 的 `*repair*` 选项只用于旧档或损坏状态的显式确认，写入 `s2ContinuityRepaired`；它们不是正式叙事选择，不计入 payoff ledger 或正式选择总数。

### 2.9 路线尾声与关系收束

2.9 无新增玩家选择（全叙事尾声/关系收束/季总结），不产生 payoff ledger 条目。

> 回收：2.9 读取 `s2MainEnding` 路由十个尾声，读取 `activePartner` 路由关系收束。写入 `s2Complete` / `s2EpilogueComplete` flag 与 `s2EpilogueEnding` 变量。所有 dueIn <= 2.9 的选择已全部回收，payoff ledger 清零。第二季完成。
