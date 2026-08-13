# S2 集合同章合同（Episode & Prologue Contract）

> 架构阶段合同：定义集（episode）的登记格式、完成语义与序章作为首个 episode 的结构要求。
> 仅技术契约与结构要求；**序章的具体剧情节点、文本与选择内容待 canon 签认后登记**。
> 代码实现：[`src/content/season2/registry.ts`](../game/src/content/season2/registry.ts)（架构阶段 `SEASON2_EPISODES` 为空）。

## 1. SeasonEpisodeDefinition

| 字段 | 类型 | 约束 |
| --- | --- | --- |
| `id` | `string` | 稳定 id（如 `s2-prologue`） |
| `seasonId` | `string` | 所属季（如 `season-2`） |
| `index` | `number` | 集序号，从 0 起；序章为 0，整数 ≥ 0 |
| `title` | `string` | 集标题 |
| `isPrologue?` | `boolean` | 序章标记 |
| `entryNodeId` | `string` | 集入口节点（当前为 `s2-august-entry`） |
| `completionNodeId` | `string` | 显式收束节点 |

校验：`isSeasonEpisodeDefinition`。

## 2. 完成语义（显式字段，不靠看文本猜测）

- 完成由 `GameStateV5.episodeCompletion: Record<string, boolean>` 的显式布尔标记驱动，**不**通过「玩家是否看过某文本节点」推断。
- `isEpisodeComplete(completion, episode)`：读 `completion[episode.id] === true`。
- `markEpisodeComplete(completion, episode)`：返回新 map（不修改入参）。
- 序章完成 = 到达其 `completionNodeId` 且显式置位，随后返回季/集中心。

## 3. 序章结构要求（SOL-PLAN-2.2 §3）

序章须形成完整 episode，含：来源选择/回顾建档 → 7 月 21 日苏铭事件 → 8 月 1–9 日组织重组与踢人事件 → 确认「上一季结果被看见」→ 建立 9 月新日常与关系位置 → 经确认的扰动提出本季公共压力 → 玩家作出具即时结果的选择 → 选择形成新目标 → 标记完成。桥接篇选择不得改写固定战果、退游、转组和首领变化，只改变玩家回应、关系与后续回响。

## 4. 注册与检索

- `SEASON2_EPISODES`：已登记序章（首个，index 0, isPrologue）及 2.3–2.9；序章入口为 `s2-august-entry`，完成哨兵仍为稳定 ID `s2-prologue-exit`。
- `registerEpisode(episodes, episode)`：按 `id` 去重，返回新数组。
- `findEpisodeById(episodes, id)` / `findPrologue(episodes)`：定位。
- 所有活跃路线都必须能从序章合法进入；分歧尚未发生时通过已登记的继承 flavor/scene 变体表达。

## 5. 边界

| 情形 | 行为 |
| --- | --- |
| `index` 非整数/负数 | 验证失败 |
| 重复 `id` | 注册去重 |
| 架构阶段空注册表 | 合法；内容阶段填充 |
| 以「看某节点」判定完成 | 禁止；仅用显式 `episodeCompletion` |
