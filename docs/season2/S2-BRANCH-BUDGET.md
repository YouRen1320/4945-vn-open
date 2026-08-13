# S2 分支预算（Branch Budget）· 2.4

> 合同：[SOL-PLAN-2.4 §3]。本表登记 2.4 全部实质分歧，供 branch budget / payoff ledger / 节点图三方对账。

## 2.4 分支清单

| branchId | routeScope | choiceIds | immediateDifference | persistentState | rejoinPolicy | payoffRelease | variantClass | fallback |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| b-confront | all（org2..org6） | s2-2.4-confront | 主导权在握，全部压力归己 | variables.s2Diverge=confront | 延续到 2.5（不本集合流） | s1-route-complete | structural | s2-2.4-stance-assert |
| b-coalition | all（org2..org6） | s2-2.4-coalition | 压力分摊，让渡部分主导权 | variables.s2Diverge=coalition | 延续到 2.5（不本集合流） | s1-cross-org-tie | structural | s2-2.4-stance-balance |

## 一致性约束

- **节点图**：`s2-2.4-diverge` 恰好两个 choice，对应上表 choiceIds。
- **payoff ledger**：`SEASON2_PAYOFF_LEDGER` 中 `s2-2.4` 恰好两条，inherits 与上表一致。
- **自动路径**：structural 分支 2 个，均有独立测试（season2.test 遍历 confront 路径；balance 路径通过 s2Stance 分流覆盖）。
- **风味分支**：route 同期变体（org2..org6）仅修饰处境，不计为 structural 分支，不进入预算乘法。

## 退出闸门

任一行未闭合（分支无即时结果 / 无持久状态 / 无 fallback / 与 ledger 不一致）则 2.4 不得发布。
