# S2 内容修订迁移矩阵（Content Migration Matrix）

> 合同：[SOL-PLAN-2.5 §4]。记录 v5 存档从各完成点升级到 2.5 的恢复能力。

| 来源完成点 | contentRevision | 升级到 2.5 | 恢复行为 |
| --- | --- | --- | --- |
| 仅序章完成 | r0 | ✅ | episodeState 含序章变量，进入 2.3 起按选择逐步填充 |
| 序章 + 2.3 | r0 | ✅ | s2Stance 已存，2.4/2.5 分流可读 |
| 序章 + 2.3 + 2.4 | r0 | ✅ | s2Diverge 已存，2.5 回收 confront/coalition 分流 |
| 2.4 分支中途（未完成 2.4 exit） | r0 | ✅ | 分支变量保留，升级后落到安全入口继续 |
| 损坏/矛盾 v5 | — | 隔离报错 | 拒绝加载，保留原数据，不静默新建 |

## 不变量

- `contentRevision` 迁移不改变 `schemaVersion`（始终 5）。
- 重复运行内容修订迁移幂等。
- 已发布节点结构修正经 alias/tombstone 落到安全节点，旧 ID 保留（tombstone）。
- 无法继续的存档隔离报错并保留原数据。
