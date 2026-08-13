# 《4945区》3.8 Sol 方案：第三季高潮、失败状态与主要结局

> 状态：条件 Sol 方案；结局数量与判定结构以第三季 canon 为准。
>
> 发布性质：第三季主要冲突可完成的稳定剧情版本。
>
> 前置：[3.7 不可逆危机与最终立场](./SOL-PLAN-3.7.md)。
>
> 后继：[3.9 多季尾声、关系收束与 4.0 RC](./SOL-PLAN-3.9.md)。

## 1. 目标与范围

3.8 从每个合法 finale entry state 完成第三季高潮，交付 canon 中全部主要结局和失败状态。玩家必须在本版得到第三季主要冲突的真实答案，而不是停在 Beta 占位终点。

多季余波、关系最终收束和 `Season3OutcomeRecord` 留在 3.9；这些内容只能解释结果之后的生活与连续性，不能推翻 3.8 主要结局。

## 2. 高潮剧情合同

每条活跃路线的高潮必须：

1. 消费 finale entry 的立场、资源、关系类别和 continuity classes；
2. 让玩家在核心冲突中采取最终行动，而非只观看结果；
3. 回收所有影响主要结局的开放 choices/threads；
4. 以可理解因果得出成功、折中或失败结果；
5. 展示主要参与者的直接反应；
6. 写入稳定 main ending ID；
7. 解锁对应 3.9 epilogue family。

共享高潮事实只维护一份。continuity 可以改变条件和代价，不能产生互相矛盾的公共事实版本。

## 3. 结局与失败合同

```text
endingId
routeScope
requiredFinaleEntry
requiredPayoffs
continuityInputs
decisionInputs
resultSummary
unlockedEpilogueFamily
assetIds
fallbackPolicy
```

规则：

- 只读取登记字段，不读取任意 flags 或前代存档；
- 每个合法终局状态恰好进入一个主要结局；
- 每个结局至少一条可达路径；
- 条件顺序、互斥和 fallback 可静态验证；
- 失败状态解释由哪些可见行动和代价造成；
- 失败是完整结局，可重试 episode，不损坏 campaign；
- 关系结果不替玩家完成主要结构决定。

## 4. 选择与连续性回收

- `dueIn = 3.8` 和 ending 级 S3 choices 全部回收；
- ending 级 continuity threads 全部消费或经用户批准关闭；
- 仍开放项只能影响 3.9 尾声/关系余波；
- 每个结局测试列出消费 choice/thread IDs 和 fallback；
- 微小文本差异不登记为独立主要结局。

## 5. 全季主线审计

- 3.2–3.8 每个 episode 与全部活跃路线连续可达；
- 所有主要结局、失败状态和 continuity classes 可达；
- 所有 profile fields、结构分支和 finale entries 有消费证据；
- 场景卡、事实标签、节点、选择、结局和素材可追溯；
- 第一、第二季与多季切换零回归；
- 主线冻结，3.9 只能补尾声、关系、多季连续性和阻断修复。

## 6. 交付物

```text
docs/season3/S3-EPISODE-3.8.md
docs/season3/S3-ENDING-CONTRACT.md
docs/season3/S3-ENDING-REACHABILITY.md
docs/season3/S3-MAIN-STORY-AUDIT.md
docs/season3/S3-CHOICE-PAYOFF-LEDGER.md（更新）
docs/season3/V3.8-ASSET-MANIFEST.md
docs/season3/V3.8-IMAGE-PROMPTS.md
game/docs/V3.8-ACCEPTANCE.md
```

高潮与结局关键 CG 是本版最高素材优先级；无对应节点的概念图不进入发布清单。

## 7. 验收标准

1. 每条活跃路线从全部合法终局入口进入高潮并到达一个主要结局。
2. 玩家在高潮中采取最终行动，第三季主要冲突明确解决。
3. 所有主要结局和失败状态可达、互斥、可解释、可重试且不损坏存档。
4. 影响主要结局的 choice/thread 全部回收，开放项只剩 3.9 余波。
5. 结局判定不读取任意 flags，自动路径覆盖全部结构/结局等价类。
6. 3.2–3.8 主线图、事实、continuity 和素材审计通过。
7. 前两季、schema5、archive、离线季包和升级/回滚零回归。
8. 本版素材 ready，类型检查、单测、内容图、构建、E2E 和设备验收通过。

## 8. 迁移与回滚

主要结局 ID 与完成状态一经发布只追加不改义。回滚到 3.7 时保留结局和 3.9 解锁状态；旧版本不得重新判定。重新升级后恢复。最终 `Season3OutcomeRecord` 尚未在本版创建，避免缺少尾声/关系结果的不完整记录进入 archive。

## 9. 兼容性妥协

- 3.8 给出主要结局，但完整多季余波和关系收束在 3.9。
- 不追求由轻微 flavor 差异产生大量结局。
- 失败条件提供风险类别而非精确公式。

## 10. 有意不做

- 不新增主路线、主要结局或公共事实；范围变化回到 canon。
- 不把“待续”当主要结局。
- 不提前创建缺少尾声字段的第三季 outcome record。
- 不生成图片或接受未验收 fallback 作为正式高潮图。

## 11. 退出闸门

全部主结局、失败状态、ending payoff、主线审计和正式素材通过后 3.8 才可发布。任何不可达结局、未解释失败或仍改变主要结局的开放项都阻断 3.9。
