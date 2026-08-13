# 《4945区》4.0 → 5.0 Sol 总方案

> 文档状态：Sol 条件规划完成；这是 4.0–5.0 的权威方案索引，不代表第四季已经立项、实现或发布。
>
> 制定日期：2026-08-05。
>
> 现实基线：当前工作区仍是 `2.0.0` 本地实现候选；本方案只有在 3.0–4.0 路线真实完成并通过 4.0 acceptance 后才能进入实施。
>
> 事实边界：当前确认事实只到 2026-07-28；第四季日期、事件、主题、角色、路线与结局必须由用户另行冻结。
>
> 分工边界：Sol 负责规划、剧情合同、图片提示词模板与验收；图片由用户使用外部模型生成；本轮不修改运行时代码或素材。

## 0. 结论

4.0–5.0 继续采用“内容主导、逐集稳定交付”，但第四季不能只在第三季的 `ContinuityProfile` 外再套一层 profile：

- `4.0` 是完整第三季稳定版和第四季的证据起点，不新增剧情；
- `4.1` 只处理真实存在的第三季回望缺口，并建立多季血缘图、容量证据和便携备份；没有真实剧情缺口时不发布填充内容版；
- `4.2` 冻结第四季 canon，由选定的 `Season3OutcomeRecord` 及其祖先图确定性生成 `ContinuityProjection`，并交付第四季共通序章；
- `4.3–4.9` 依次完成传承压力与新目标、首次不可逆承诺、旧承诺冲突与中点重构、群体责任与私人归属重排、不可逆危机、高潮与主要结局、多季尾声与关系收束；
- `5.0` 不新增剧情，只把 4.2–4.9 已冻结的完整第四季晋升为稳定版；它不自动表示整个作品永久完结。

本阶段新增三个核心合同：不可变结果组成的 `LineageGraph`、从血缘图生成的版本化 `ContinuityProjection`，以及把逻辑 schema 与物理存储后端分开的存储适配层。是否迁往 IndexedDB 由 4.1 的最坏情况证据决定，不因进入第四季或 5.0 而武断升级 schema。

## 1. 目标、范围与完成标准

### 1.1 目标

1. 让第四季拥有独立、完整的主冲突和人物弧，而不是前三季结果展览。
2. 让多季传承来源可验证、可解释、可备份，并控制祖先结果对第四季的影响上限。
3. 在第四季内容扩大前，以真实容量和原子性证据决定存储后端。
4. 每个剧情版本同时交付可执行剧情合同、图片提示词包、素材清单和验收门禁。
5. 在 4.9 冻结完整第四季内容，在 5.0 只做稳定晋升。

### 1.2 本阶段完成标准

- 4.2–4.9 的全部活跃路线均能从合法开局连续到达主要结局和尾声；
- 每个合法第三季结果都能通过有效 `LineageGraph` 生成确定性的第四季投影，非法、冲突或缺失祖先不会静默进入剧情；
- `Season3OutcomeRecord → LineageGraph → ContinuityProjection → season4 campaign → Season4OutcomeRecord` 全链路可追溯；
- 当前最低测试环境满足存储余量和原子导入要求，或已经按门禁完成 IndexedDB 迁移；
- 数据-only 备份、恢复、重复导入、冲突隔离、回滚和旧版本往返均有证据；
- 四季离线素材的共享引用、下载、更新和删除不损坏其他季；
- 每版托管视觉全部通过人工验收，不能用 fallback 冒充正式图；
- 5.0 RC、稳定构建、迁移、离线、设备、公网和回滚证据一致。

### 1.3 明确不在本轮实施

本轮只写 Sol 方案，不创建第四季正式节点，不修改存档实现、Service Worker、版本号或部署配置，不生成或接入图片，也不替用户决定第四季 canon。

## 2. 前提与证据边界

本方案依赖以下未来前提：

1. 3.9 已生成不可变 `Season3OutcomeRecord`，并关闭第三季必需 payoff；
2. 4.0 已通过第三季内容、迁移、离线、素材、公网和回滚验收；
3. outcome archive 已使用稳定 `campaignId`、`lineageId` 和 `parentOutcomeIds`；
4. 用户完成第三季 postmortem，并明确是否立项第四季；
5. 用户签认第四季时间边界、公共事实、主题、角色、路线和结局结构。

这些前提当前都不是已实现事实。当前实际客户端仍把 auto、quick 和 6 个手动槽保存在 `localStorage`，尚无 IndexedDB。第四季实现前必须重新测量真实序列化体积、浏览器配额和失败行为，不能把本规划中的估算写成验证结论。

## 3. 为什么不能机械复制第三季

| 新问题 | 机械沿用的后果 | 本方案处理 |
|---|---|---|
| 多季 outcome 已形成祖先关系 | 平铺 records 无法证明缺失祖先、冲突合并或修订来源 | 建立只读 `LineageGraph` 并验证 DAG、边和 supersede 链 |
| 再叠一层 profile | profile 来源和变换过程不可解释，旧事实影响不断膨胀 | 用确定性 `ContinuityProjection` 记录输入、规则版本和 receipt |
| 前三季结果全部允许结构影响 | 路线、场景、结局组合指数增长 | 第三季可按 canon 影响 structural/ending；更早季默认只到 flavor/scene |
| 数据继续塞进若干 localStorage 键 | 容量不足时可能部分写入，导入也缺乏跨记录事务 | 4.1 做最坏情况审计；不达标则在 4.2 前迁往 IndexedDB |
| 同时长期双写两个后端 | 两份真相漂移，回滚和修复难以证明 | 适配层 + 分阶段复制、校验、切换；切换后只有一个写入后端 |
| 备份只导出单槽 JSON | lineage 依赖缺失，恢复后无法重建投影 | 版本化 data-only 便携备份，导入前全包校验并原子提交 |
| 第四季资源简单复制 | 共享角色/UI 被重复下载，删除一季可能误删另一季资源 | 由已安装 manifest 计算共享引用，不维护易漂移的手工计数 |
| 4.1 惯性补一个“回望版” | 产生复述结局的填充内容 | 只处理 postmortem 证明的真实缺口，无缺口就取消内容版 |
| 5.0 被当成补剧情缓冲区 | 内容冻结和 RC 失去意义 | 4.9 内容完整，5.0 只晋升与发布 |

## 4. 方案比较与已选方向

### 4.1 可行方案

#### 方案 A：继续平铺 outcome，并为第四季再建一层 profile

实现最省，但无法稳定解释祖先缺失、修订、导入冲突和多代影响，长期维护成本最高。

#### 方案 B：LineageGraph + ContinuityProjection + 证据触发的存储迁移

把历史证据、剧情消费和物理存储分层；先审计，只有门禁失败才迁移 IndexedDB。

#### 方案 C：第四季独立应用和独立存储

运行隔离清晰，但重复客户端能力，跨季导入与用户体验割裂。

### 4.2 决策维度

| 维度 | A 叠加 profile | B 图 + 投影 | C 独立应用 |
|---|---|---|---|
| 实现成本 | 前低后高 | 中 | 高 |
| 迁移成本 | 低到中 | 由证据决定，中 | 高 |
| 风险 | 高，来源难审计 | 中低，合同清晰 | 中高，跨应用传递复杂 |
| 回滚难度 | 中高 | 中，可保留旧键回退 | 应用回滚低，数据协同高 |
| 长期维护 | 低 | 高 | 中低 |

采用方案 B。用户已授权按推荐方案完成规划；实际实现仍必须在 4.1 用证据决定是否触发物理迁移。

## 5. 跨版本剧情合同

### 5.1 完整剧情单元

除 4.0 起点和 5.0 晋升外，获准发布的 4.1–4.9 每版必须具备：

1. 明确的时间窗口与本版局部问题；
2. 共通主干或完整补遗框架；
3. 本版要求覆盖的全部活跃路线和合法关系类别；
4. 至少一个改变信息、资源、责任、信任或行动条件的有效选择；
5. 即时后果、延迟后果目标版本和损坏状态 fallback；
6. 对局部问题的阶段答案，不能停在玩家尚未行动的预告点；
7. 对到期 choice、continuity 和关系债务的登记与回收；
8. `IMAGE-PROMPTS`、`ASSET-MANIFEST`、内容图测试和人工验收脚本。

第四季必须建立自己的目标、冲突、代价与人物变化。前三季结果只能改变进入条件、可用资源、角色立场或代价，不能替玩家完成第四季的核心选择。

### 5.2 第四季 canon 闸门

4.2 正式实现前，用户必须签认：

- 第四季时间范围、结束边界和 `confirmed/adapted/fictional` 事实标签；
- 主题命题、公共主冲突和玩家初始目标；
- 活跃、承认、退休和不可用路线；
- 回归、缺席、新增和禁止使用的角色；
- 第三季 outcome fields 的最高影响级别；
- 第一、第二季事实是否存在经理由和预算批准的提升项；
- 合法 projection classes、冲突处理和 fallback；
- 失败状态、主要结局、关系收束与尾声结构；
- 未决且禁止实现者或图像提示词自行补写的空位。

未签认时只允许完成通用类型、验证器、审计夹具和带占位符的提示词模板，不得创建正式 `s4-` 节点或声称某个第四季事实成立。

### 5.3 路线、影响级别与债务

每项多季事实必须登记最高影响级别：

- `flavor`：称呼、回忆或局部文本；
- `scene`：进入专属场景族，但不改变主干结构；
- `structural`：改变 episode 结构或可用行动；
- `ending`：参与主要结局判定。

默认规则：第三季结果可由第四季 canon 批准为任一级别；第一、第二季结果最高为 `scene`。若确有必要提升更早季事实，必须逐项记录叙事理由、组合预算、fallback、测试 ID 和用户签认，不能整季批量提升。

`ContinuityDebtLedger` 在 4.1 继承第三季的 `moved-to-4.x` 项；4.2 起登记第四季新债务。每项必须有 owner、状态、目标版本、影响级别、路线/关系范围和 fallback，不能无限延期。

### 5.4 ID 与修订规则

- 第三季回望补遗节点使用 `s3x-`，提示词使用 `S3X-`；
- 第四季节点、选择、结局和素材引用使用 `s4-`，提示词使用 `S4-`；
- 已发布的 `s1x-`、`s2-`、`s2x-`、`s3-` 与所有既有 ID 只追加、不复用、不改义；
- 结构修正使用 alias/tombstone，事实修正使用 supersede record；
- `schemaVersion`、`storageVersion`、`contentRevision`、`canonVersion`、`projectionVersion` 和 `outcomeRecordVersion` 独立演进。

## 6. 版本路线

| 版本 | 玩家获得的剧情内容 | 支撑能力 | 发布性质 |
|---|---|---|---|
| [`4.0`](./SOL-PLAN-4.0.md) | 不新增剧情；完整第三季 | 第三季发布证据、S3 outcome、第四季交接 | 稳定起点 |
| [`4.1`](./SOL-PLAN-4.1.md) | 经 postmortem 证明的第三季回望补遗；无缺口则不发布内容版 | LineageGraph、容量/原子性审计、便携备份 | 条件桥接增量 |
| [`4.2`](./SOL-PLAN-4.2.md) | 第四季共通序章 | S4 canon、ContinuityProjection、第四季开局 | 第四季首个稳定版本 |
| [`4.3`](./SOL-PLAN-4.3.md) | 多季传承压力落地与第四季新目标 | projection 消费审计、四季资源 manifest | 第四季展开 |
| [`4.4`](./SOL-PLAN-4.4.md) | 首次不可逆承诺与路线分歧 | 分支/影响预算、结构等价类测试 | 第四季承诺阶段 |
| [`4.5`](./SOL-PLAN-4.5.md) | 旧承诺冲突与中点重构 | 跨季 payoff、内容修订与投影恢复 | 第四季中点 |
| [`4.6`](./SOL-PLAN-4.6.md) | 群体责任、人物信任与私人归属重排 | 关系/路线组合控制、投影消费审计 | 第四季重排阶段 |
| [`4.7`](./SOL-PLAN-4.7.md) | 不可逆危机、point-of-no-return 与终局入口 | 最终立场、失败预警、终局入口 | 第四季危机阶段 |
| [`4.8`](./SOL-PLAN-4.8.md) | 高潮、失败状态与主要结局 | 结局判定、全季主线审计 | 第四季主结局阶段 |
| [`4.9`](./SOL-PLAN-4.9.md) | 多季尾声、关系收束与传承总结 | Season4OutcomeRecord、内容冻结、5.0 RC | 完整内容候选 |
| [`5.0`](./SOL-PLAN-5.0.md) | 不新增剧情；完整第四季稳定晋升 | 发布、迁移、备份、离线、公网与回滚证据 | 完整季稳定版 |

依赖顺序：`4.0 → 4.1 范围/存储决策 → 4.2 → ... → 4.9 → 5.0`。4.1 若无真实补遗，只取消内容部分；LineageGraph、存储审计和备份门禁仍必须在 4.2 前完成。

## 7. LineageGraph 合同

### 7.1 图的来源

`LineageGraph` 是 outcome archive 的只读领域视图，不复制或改写 records：

```text
graphVersion
lineageId
rootOutcomeIds
terminalOutcomeIds
nodes: SeasonOutcomeRecord[]
edges: parentOutcomeId -> childOutcomeId
supersedeEdges: oldOutcomeId -> correctedOutcomeId
graphDigest
validationReceipt
```

普通血缘边只来自 child 的 `parentOutcomeIds`。supersede 边表示事实修正，不表示玩家选择派生，也不得被当成普通 parent 合并。

### 7.2 必须验证的不变量

1. outcomeId 全局唯一，payload digest 与内容一致；
2. 同一图的普通节点共享 `lineageId`，不同 lineage 不默认合并；
3. 第一季根记录可以没有 parent，后续季记录的每个 parent 必须存在于依赖闭包；
4. parent 的季序必须早于 child，不允许自环、循环、跨季倒挂或孤儿；
5. 同一 parent ID 不重复，边与 record 声明完全一致；
6. supersede 链无环、目标存在、被修正记录保留且不改变既有 campaign 快照；
7. 导入的同 ID 同 digest 去重，同 ID 异 digest 隔离为冲突，不覆盖本地证据；
8. recap 来源必须形成明确标记的合法合成 lineage，不能把互不相干的真实 lineage 偷偷拼接。

损坏、缺祖先或冲突图进入隔离区，显示可理解原因；不得靠补默认 parent、改 lineageId 或选择“最近记录”静默修复。

### 7.3 选择规则

开启第四季时，玩家选择一个合法、未被隔离的第三季 terminal outcome，或显式进入有剧透提示的引导式建档。多份结果并存时不自动选最近记录，不存在隐藏“官方 lineage”。导出某个 lineage 必须包含选定 terminal outcome 的完整祖先闭包和相关 supersede 证据。

## 8. ContinuityProjection 合同

### 8.1 数据形态

第四季不读取前三季原始 `GameState`，也不直接读取任意 outcome 字段。它只读取由已签认 canon 和投影规则生成的值对象：

```text
projectionId
projectionVersion
canonVersion
lineageId
sourceSeason3OutcomeId
inputOutcomeIds
inputPayloadDigests
normalizedFacts
retiredThreads
impactAssignments
projectionWarnings
receiptDigest
createdAt
```

`inputOutcomeIds` 按稳定规则排序并覆盖被实际消费的祖先闭包；`receiptDigest` 覆盖输入 IDs/digests、canonVersion、projectionVersion、归一化结果与退休项。

### 8.2 确定性与快照

- 同一合法图、同一 source outcome、同一 canonVersion 和 projectionVersion 必须生成相同 receipt；
- 投影器只允许读取白名单字段，未知字段默认拒绝或忽略并产生日志，不能自动升级影响级别；
- 冲突规则和 fallback 是 canon 的版本化内容，不能按对象遍历顺序决定；
- 每个 season4 campaign 保存完整投影值快照、receipt 和来源 IDs；
- 上游 outcome 被删除、supersede 或重新投影时，已开始 campaign 不静默改变；玩家只能保留原快照，或显式创建新 campaign/经独立迁移确认切换；
- 调试重算结果不得覆盖正式 campaign。

### 8.3 第四季结果

4.9 完整尾声后生成不可变 `Season4OutcomeRecord`。它使用同一 `lineageId`，以本 campaign 选定的第三季 terminal outcome 为 parent，记录第四季 durable facts、主要结局、关系收束、contentRevision 和 payload digest。不同重玩结果生成不同 outcomeId；删除 campaign 不删除 record；事实修正使用 supersede，不合并不同玩家选择。

## 9. 存储、容量与备份

### 9.1 版本分离

- `schemaVersion` 描述 `GameState`/`SaveRecord` 的逻辑合同；
- `storageVersion` 描述键布局、对象仓库、索引和物理后端；
- 切换 localStorage → IndexedDB 不自动要求 schema6；
- 修改剧情节点或 projection 规则不自动要求 storageVersion 变化。

所有存取经 repository/adapter 边界完成，剧情层不得直接依赖 `localStorage` 或 IndexedDB API。

### 9.2 4.1 最坏情况审计

审计夹具必须由当时真实 schema、内容图和配置上限生成，至少覆盖：

- auto、quick、6 个手动槽全部为最大合法 campaign；
- 四季 outcome records、合法分叉 lineage、supersede 链和 projection 快照；
- 设置、收藏、已读、结局、回放解锁、内容迁移元数据和导入 staging；
- Unicode 玩家名、最长合法历史、边界数量的关系/选择数据；
- 正常写入、空间不足、进程中断、损坏键、重复导入和冲突导入。

门禁：在项目定义的最低测试浏览器/设备上，完整最坏情况数据写入后必须仍保留至少同等规模的一份 staging 数据，即总量至少有 `2x` 余量；多记录导入必须能在失败时保持导入前状态。任一门禁失败，就必须在 4.2 正式 campaign 创建前完成 staged IndexedDB 迁移。

### 9.3 条件性 IndexedDB 迁移

1. 引入 adapter，并以当前 localStorage 为唯一写入后端完成回归；
2. 创建新 storageVersion 的对象仓库和索引；
3. 从旧键复制到 staging，逐项校验 schema、digest、引用和计数；
4. 在单个事务中提交新数据与 cutover marker；
5. 切换为 IndexedDB 唯一写入后端，保留旧键作只读回滚证据；
6. 经过明确保留期和独立破坏性方案后才能删除旧键。

不做长期双写。迁移失败继续使用旧后端并保留原键；不得出现一部分槽读旧后端、另一部分读新后端的混合真相。

### 9.4 Data-only 便携备份

备份包只包含版本化 JSON 数据和 manifest，不包含脚本、HTML、图片或其他可执行内容：

```text
format = 4945-portable-backup
backupVersion
createdByAppVersion
schemaVersions
storageVersion
recordCounts
records
dependencyClosure
entryDigests
packageDigest
```

导入流程先在内存或 staging 中完成格式、大小、版本、digest、ID、lineage、projection 和引用校验，再通过一个事务/等价原子切换提交。默认不覆盖同 ID 异 digest 数据；冲突隔离并给玩家导出证据。导出与恢复测试必须使用复制数据，不能把生产数据当迁移试验场。

## 10. 四季素材与离线合同

每个季包 manifest 至少包含：

```text
assetId
contentHash
byteSize
mediaType
seasonIds
episodeIds
sharedGroup?
requiredByShell
targetRelease
```

安装集合是唯一事实来源。删除某季时，用“剩余已安装 manifest 是否仍引用同一 assetId + hash”计算可删资源；不依赖可漂移的手工 refcount。相同 assetId 不同 hash 视为版本更新，必须原子切换；共享 shell、当前 episode 和仍被其他季引用的资源不得删除。

玩家可查看每季预计体积、已安装版本和完整性，并显式下载、更新或删除。配额不足只提示和提供选择，不静默驱逐。删除素材不删除 campaign、outcome、projection、收藏、设置或备份。

## 11. IMAGE-PROMPTS 与 ASSET-MANIFEST 总合同

### 11.1 提示词填写顺序

每版分文档提供待填充的拍点模板。只有场景卡、角色锚点和事实标签签认后，才能把方括号占位符替换为具体内容。提示词不能反向创造 canon。

通用正向前缀：

```text
2D Japanese visual novel event CG, precise dark colored line art, clean cel shading,
controlled vivid palette, adult or young-adult proportions, consistent character anchors,
cinematic 16:9 composition, key faces and actions inside the central 55 percent mobile-safe area,
lower dialogue-safe region, detailed background subordinate to the characters
```

通用负向提示：

```text
photorealistic, 3D render, generic cyberpunk neon, chibi, childlike proportions,
sexualized pose, text, letters, subtitles, game UI, watermark, logo,
extra fingers, malformed hands, duplicated people, inconsistent face, hair, outfit or accessories,
cropped face, key action outside the mobile-safe area
```

每条正式提示词还必须注明：prompt ID、assetId、关联 scene/node、叙事功能、角色 anchorVersion、构图、时段/光线、必须出现、禁止出现、事实标签、比例和验收要点。

### 11.2 素材登记

每版 `ASSET-MANIFEST` 至少登记：assetId、promptId、sceneIds、类型、路径、hash、尺寸、targetRelease、是否复用、fallback、状态、外部模型/提示词版本/参考图/生成日期/后处理等可获得 provenance。无法取得的生成参数写 `unknown`，不猜 seed 或模型版本。

低差异 flavor 文本不单独生成图片。视觉预算优先关键行动、不可逆选择、关系变化、危机、高潮和尾声。正式发布要求 `targetRelease` 范围内 pending 为零；fallback 只保障开发，不算正式交付。

### 11.3 人工验收

- 身份与 anchorVersion 一致，无跨季无理由漂移；
- 手部、肢体、视线、人数、关键道具和空间关系正确；
- 不生成昵称、对白、UI、乱码、水印或 logo；
- 16:9 完整构图和 375/430px 中央裁切均保留脸与关键动作；
- 下方对白安全区可用，角色不呈幼态或不合适身体表现；
- 图片只表达场景卡已有事实，不泄露后续结局或混入其他版本内容。

## 12. 每版验收与发布证据

### 12.1 内容

- 本版局部问题得到阶段答案，全部活跃路线/合法关系类别有完整覆盖；
- 场景可追溯到 canon、场景卡和事实标签；
- 选择有即时后果，延迟后果进入 S4 payoff ledger；
- 到期 continuity debt 被回收、批准关闭或正式退休；
- 无死节点、伪结局、跨季普通跳转或未发布内容依赖。

### 12.2 图、投影与数据

- 所有合法 terminal outcomes 构成有效 DAG，并生成确定性 projection；
- 非法、缺祖先、循环、冲突和不同 lineage 合并均被拒绝或隔离；
- campaign 投影快照不被上游修订静默改写；
- 备份导出、原子导入、重复导入、冲突和回滚通过；
- 从 4.0 和每个已发布 4.x 升级、回滚、再升级均保留数据。

### 12.3 客户端、离线与素材

- 类型检查、全部单测、内容图、构建、E2E 和最终资产审计通过；
- 375×812、430×932、844×390 和桌面流程完整；
- 键盘、焦点、读屏、低动态、长文本、剧透提示和存储错误提示通过；
- 四季包下载、更新、共享资源删除、配额不足、纯离线启动与回滚通过；
- 本版托管视觉 pending 为零，生成图完成人工验收。

### 12.4 证据边界

每版独立记录自动、人工、迁移、离线、预发布和公网验证。计划文档、源码版本或 release note 不能单独证明功能已实现或已经上线。

## 13. 迁移与回滚总则

- 4.x 与 5.0 保留 v4、v5、旧收藏、outcome records、profiles 和 projections；
- 回滚到不了解 season4 的版本时，第四季 campaign 暂时不可见但原始数据保留；
- IndexedDB cutover 失败时继续读写旧后端；成功后旧键只读保留，不持续双写；
- projection 规则升级不重写已开始 campaign，只有显式迁移或新 campaign 使用新规则；
- outcome 事实修正使用 supersede，旧记录、图证据和 campaign 快照继续可审计；
- 5.0 范围不删除旧数据键，清理必须另立破坏性方案，说明影响、迁移和回滚。

## 14. 兼容性妥协

- 第一、第二季结果默认最多影响第四季 flavor/scene，减少结构性传承的自由度，换取可控组合规模。
- 已开始 campaign 固定 projection 快照，后来修正上游结果不会自动生效；玩家需显式新建或迁移。
- 若迁往 IndexedDB，会暂时保留旧 localStorage 数据用于回滚，占用额外空间，但不长期双写。
- 回滚到旧版本时，LineageGraph、projection 和第四季进度可能不可见，但不得被删除。
- 四季离线继续由玩家选择安装，不保证未安装季在断网时可玩。
- flavor 组合使用代表性测试和共享画面，不为每个文本差异生成独立 CG。

## 15. 有意不做

- 不编写未经确认的第四季日期、事件、角色行为、路线数或结局数。
- 不把 5.0 宣称为整个作品永久完结。
- 不因版本号自动升级 schema6/schema7，或在无容量证据时强制迁移 IndexedDB。
- 不把完整旧 `GameState`、任意 flags、历史或 processedNodes 继承到第四季。
- 不默认合并不同 lineage，不自动选择最近 outcome，不原地改写不可变 records。
- 不长期双写 localStorage 和 IndexedDB，不把完整备份塞回 preview/临时 UI 状态。
- 不做账号、云存档、遥测、付费、排行榜或多人实时功能。
- 不生成、转换或接入图片，不替用户选择外部模型。
- 不修改运行时代码、当前剧情节点、存档、缓存或部署。

## 16. 与 3.0–4.0 方案的交接

为使本方案可实施，前序合同增加三项前向兼容要求：

1. 3.9 的 `Season3OutcomeRecord` 必须拥有合法 parent 依赖、digest 和 lineageId，可作为 `LineageGraph` 的 terminal node；
2. 4.0 acceptance 必须验证导出第三季 terminal outcome 时包含完整祖先闭包，不只导出一条平铺记录；
3. 3.x 的 `ContinuityProfile` 保持值快照语义，并允许未来 projection 读取 outcome records，而不是读取旧 campaign 运行态。

这些是规划合同同步，不代表本轮实现图、投影或存储迁移。若 4.1 实测与本方案假设冲突，必须以证据更新迁移决定，但不得削弱不可变记录、确定性投影和原子恢复目标。
