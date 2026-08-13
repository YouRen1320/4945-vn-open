# S2 继承合同（Inheritance Contract）

> 关联：[S2-CANON.md](./S2-CANON.md) §5；[season2-outcome.ts](../game/src/engine/season2-outcome.ts) 的 `KNOWN_DURABLE_FACTS` / `DurableFact`。
> 本文定义第一季结果进入第二季时**可继承的事实白名单**与**继承分级评级表**。仅技术+内容合同，不含未定义事实。

## 1. DurableFact 白名单（已签认/架空拟定）

`durableFacts` 仅接受以下枚举值；任何不在表中的值验证失败（见 `isDurableFact`）。

| 值 | 含义 | 来源字段 | 级别 |
| --- | --- | --- | --- |
| `s1-org-ending` | 第一季达成某组织结局 | `organizationEndingId` 非空 | ending |
| `s1-route-complete` | 玩家走完所属路线 | `route` 非 null 且 `unlockedEndings` 含对应路线结局 | structural |
| `s1-partner-bonded` | 第一季以伴侣关系收束 | `activePartner` 为可恋爱角色 | structural |
| `s1-partner-none` | 第一季无伴侣收束 | `activePartner === 'none'` | structural |
| `s1-high-council` | 曾组建高层议会 | `highCouncil.length > 0` | structural |
| `s1-mentor-trust` | 与导师关系深厚 | `relationships.mentor.trust >= 6` | structural |
| `s1-cross-org-tie` | 跨组织纽带 | 高层议会成员来自不止一个组织 | structural |
| `s1-charter-written` | 六组手写章程完成 | `flags.org6WrittenCharter` | flavor |
| `s1-confession-transferred` | 告白转组事件收束 | `flags.gaobaiLeftForOrg1` | flavor |
| `s1-fire-two` | 五组火2要塞事件 | `flags.org5FoughtFireTwo` / `org5UpsetFireTwo` / `org5VotedFireTwo` 任一 | flavor |

> 三个 flavor 级事实（章程 / 告白转组 / 火2）由 2026-08-05 canon 变更流程签认，
> 仅供第二季序章「回望」节点做散文变体引用，不解锁任何机制——严格遵守 §2
> 「序章不得擅自扩大级别」约束。`relationshipTiers` 单独表达各角色 0–100 继承
> 层级，不计入 `durableFacts` 文本枚举。
>
> 修正记录：`extractSeason1Summary` 此前写死 `durableFacts: []`，导致 structural/ending
> 级事实从未被带入第二季（`buildSeason2InitialState` 中 `s1-org-ending` 判定恒为
> false，组织结局 ID 丢失）。现已按上表派生全部事实。

## 2. 继承分级（InheritanceLevel）评级表

序章（及后续集）每个继承字段必须标注级别；序章**不得擅自扩大级别**。

| 字段 | 级别 | 说明 |
| --- | --- | --- |
| 玩家 `route` / `organization` | `structural` | 决定序章可进入的路线变体 |
| 单线 `activePartner` | `structural` | 决定序章关系张力伏笔 |
| `relationshipTiers[partner]` | `structural` | 0–100 关系层级 |
| `organizationEndingId` | `ending` | 结局级事实，仅用于 flavor/scene 旁白，不解锁新机制 |
| 对话措辞 / 称谓 | `flavor` | 不影响机制 |
| 场景背景 / 立绘 | `scene` | 呈现层差异 |

### 一组转线桥接

- 一组仍是事件二的跨路线公共机构，不新增 `org1` 活跃主路线。
- 玩家完成一组事件一结局后，必须显式选择 `org2`–`org6` 之一作为事件二活跃组织。
- `Season1OutcomeSummary.route` / `organization` 写入所选事件二组织；`routeTransfer` 保存原始 `org1` 路线、组织与名称。
- `organizationEndingId` 继续保存原始 `r1-*` 结局，不能替换成目标组织的虚构结局。
- 桥接摘要使用 `summaryVersion >= 2`；未包含 `routeTransfer` 的既有 v1 摘要继续按原规则读取。
- 事件二序章必须先明确承认第一席经历，再进入公共剧情；转线不伪造玩家曾走过目标组织的事件一日常。

## 3. 继承不变量

- 序章只读取白名单内的 `durableFacts` 与 `relationshipTiers`；不读取 S1 任意 `flags` / `variables` / `processedNodes`。
- 相同 `Season1OutcomeSummary`（不论 save 或 recap 来源）得到相同 `digest` → 相同 `Season1OutcomeRecord`（幂等去重）。
- 来源 v4 后续变化**不反向修改**已写入的 `season1Outcome` 快照。
- 继承绝不改写第一季存档；第二季历史从序章重新开始，第一季过程经原 v4 与回放查看。
- 一组转线只改变事件二活跃组织；原一组结局和来源身份必须同时进入摘要、digest 与结果档案。

## 4. 与代码的映射

- `KNOWN_DURABLE_FACTS`（`season2-outcome.ts`）= 上表第 1 列全部白名单值。
- `validateSeason1OutcomeSummary` 拒绝含非白名单 `durableFacts` 的摘要。
- `extractSeason1Summary` 从 `GameState` 提取上述事实（架构阶段已可运行；具体派生规则见各路线 `s1-cross-org-tie` 注释）。
