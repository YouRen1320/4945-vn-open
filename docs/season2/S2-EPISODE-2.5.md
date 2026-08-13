# S2-EPISODE-2.5 · 后果与中点转折

> 状态：已落地并接入运行时，单元/类型/剧情图/资产审计通过。
> 方案：[SOL-PLAN-2.5.md](../../docs/SOL-PLAN-2.5.md)；验收见 `game/docs/V2.5-ACCEPTANCE.md`。

## 1. 回收前期选择（§2.1 后果到达）

- 按 `s2Diverge`（2.4）分流：`cons-confront`（独自承压）/`cons-coalition`（联盟内博弈）。
- 按 `route` 分流到 org2..org6 处境变体，每条体现不同代价；fallback=org2。
- 回收结果在场景与角色反应中可见，不以总结文字替代。

## 2. 中点转折（§2.2）

共享 canon 中点事实：北岸评议委员会宣布以「联合对峙」代替书面自评，各组织须公开站队并进入联席协调席。由前半季行动推动（你选的边被摆上桌面对质），迫使重新排序优先事项，形成后半季新目标（联席协调席的位子）。

## 3. 中点后回应（§2.3 收束）

`choices`：
- `s2-2.5-guard`：守成，优先稳住组织与旧伙伴（structural，inherits s1-route-complete）。
- `s2-2.5-pivot`：翻局，借协调席争取主动（structural，inherits s1-cross-org-tie）。
- 写入持久 `variables.s2Midpoint`，供 2.6 回收。

## 4. 注册

- `SEASON2_EPISODES` 追加 `s2-2.5`（index=3）；payoff ledger 2 条。
- 零新增托管视觉，复用 organization/warRoom/aftermath 与既有立绘。
