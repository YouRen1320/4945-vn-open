# S2-EPISODE-2.6 · 组织与关系压力交汇

> 状态：已实现并接入运行时。
> 方案：[SOL-PLAN-2.6.md](../../docs/SOL-PLAN-2.6.md)。
> 前置：[2.5 后果与中点转折](./S2-EPISODE-2.5.md)；后继：[2.7 后期危机与终局前置](../../docs/SOL-PLAN-2.7.md)。

## 1. 本集目标

2.6 让玩家的组织责任、成员信任和亲密关系第一次在同一决策中互相施压。关系内容必须改变玩家理解局势、取得信息、承担代价或作出组织决定的方式；不能在主线之后附上一段与冲突无关的约会。

## 2. 共通主干：协调席第一次正式交锋（§2.1 共通压力）

- 回收 2.5 的 `s2Midpoint`（guard / pivot），分流两种进场姿态：守成者谨慎出牌，翻局者主动出击。
- 协调席正式提案「联合行动计划」：跨组织资源协同，各组织须让渡部分日程协调权。
- 方案宣讲在北岸评议委员旁听下进行，玩家所在组织的立场被摆上桌面。
- 一名成员、伙伴或关系人持有与玩家目标不完全一致的合理立场，形成关系压力。

## 3. 路线同期变体（§2.3 路线预算）

- 按 `route` 分流到 org2..org6 处境变体，并读取 2.5 留下的具体压力：成员抽调、公开记录、统一标准、日程权限或席位合法性。
- 所有路线共享核心选择，但选择后分别形成一份可复述的会议产物；路线不再只替换会前说明文字。

## 4. 核心选择：组织优先 vs 关系优先（§2.1 排序压力）

`choices`（节点 `s2-2.6-decide`）：

| choiceId | label | tone | inheritanceLevel | inherits |
| --- | --- | --- | --- | --- |
| s2-2.6-org-priority | 「组织立场不能动摇。」 | bold | structural | s1-route-complete |
| s2-2.6-rel-priority | 「先把人稳住，方案可以谈。」 | warm | structural | s1-cross-org-tie |

两条选择的即时后果与持久状态：

- `s2-2.6-org-priority`：在协调席坚持所在组织立场，短期获得主导权但损伤关键关系；写入 `variables.s2PressureStance = 'org-first'`。
- `s2-2.6-rel-priority`：在方案中让步以维护伙伴信任，关系网络稳固但让渡部分协调权；写入 `variables.s2PressureStance = 'rel-first'`。
- 两条选择均产生**可见组织后果**（cohesion / reputation / resources）与**可见人物后果**；关系数值只修改真实 `activePartner`，无伴侣时才回退到老朋友。
- `variables.s2PressureStance` 供 2.7 危机单元回收；`variables.s2MeetingArtifact` 保存五路线各自的通过、搁置或限制条款，并在 2.7 重新出现。

## 5. 关系压力变体（§2.2 伴侣与无伴侣）

- 12 名合法伴侣各有一段短而独立的现场发言，均由本人出场并提出与组织收益不完全一致的合理要求；随后回到共享核心选择。
- 选择效果使用 `activePartnerRelationship` 修改真实伴侣 trust，避免把伴侣路径的代价错误写到老朋友。
- 无伴侣路径使用 `s2-2.6-relation`，由老朋友承担信息与反方立场，不缺少关键选择。
- 不存在「没有伴侣就少一段关键情报」或「某伴侣组合没有可玩路径」的情况。

## 6. 关闭当前冲突，推向 2.7

- 本集明确回答：「在组织立场和个人信任之间，你选了哪一边？」
- 联合行动计划在本集获得首次表决结果；五条路线各自留下两种明确会议产物，例如抽调暂缓/设限、记录封存/限定公开、标准拆分/申诉条款。
- 未解决的压力写入 `variables.s2PressureStance` 与 `variables.s2MeetingArtifact`，2.7 必须同时回收姿态和具体条款。
- 不提前展开 2.7 的全面危机。

## 7. 注册与完成

- `SEASON2_EPISODES` 追加 `s2-2.6`（index=4）。
- payoff ledger 追加 2 条（s2-2.6-org-priority / s2-2.6-rel-priority）。
- 零新增托管视觉，复用 warRoom / organization / aftermath 与既有角色立绘。
- 2.6 前置为 2.5（index=3），集中心 `playSeason2Episode` 检查前置完成。
