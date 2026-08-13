# S2-EPISODE-2.4 · 首次实质分歧

> 状态：已落地并接入运行时，单元/类型/剧情图/资产审计通过。
> 方案：[SOL-PLAN-2.4.md](../../docs/SOL-PLAN-2.4.md)；验收见 `game/docs/V2.4-ACCEPTANCE.md`。

## 1. 本集让 2.3 的选择到期

2.4 在「联合评议现场」让 2.3 的 `s2Stance`（assert / balance）到期，玩家首次对第二季推进方式作出**实质分歧**：

- `s2-2.4-confront`（硬扛）：一个人接下全部反对声，主导权在握但全部压力归己。
- `s2-2.4-coalition`（拉联盟）：牵头跨组织联盟共同表态，压力分摊但让渡部分主导权。

分歧改变「合作对象 / 承担代价」至少一项，且持久状态 `s2Diverge` 延续到 2.5 回收（§3 分支预算）。

## 2. 共通主干与路线同期变体

- entry 按 `s2Stance` 分流到 `stance-assert` / `stance-balance`（继承 2.3 变量）。
- 按 `route` 分流到 org2..org6 评议处境变体（只修饰处境，不替换分歧），fallback=org2。
- 实质分歧节点 `s2-2.4-diverge` 跨路线共通，避免分支爆炸。

## 3. 分支预算（S2-BRANCH-BUDGET.md）

| branchId | routeScope | choiceIds | immediateDifference | persistentState | rejoin | payoff | variant | fallback |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| b-confront | all | s2-2.4-confront | 主导权在握，压力全归己 | s2Diverge=confront | 延续至 2.5 | s1-route-complete | structural | stance-assert |
| b-coalition | all | s2-2.4-coalition | 压力分摊，让渡主导权 | s2Diverge=coalition | 延续至 2.5 | s1-cross-org-tie | structural | stance-balance |

风味差异（route 变体）不创建独立长分支；两条 structural 分支均延续到 2.5 并拥有独立测试路径。

## 4. 注册与完成

- `SEASON2_EPISODES` 追加 `s2-2.4`（index=2）；`advance` 通用匹配 completionNodeId。
- 2.4 前置为 2.3（index=1），集中心 `playSeason2Episode` 检查前置完成。
- 零新增托管视觉，复用 warRoom / aftermath 与 bottle/mentor/yanqiu/wenxian 立绘。
