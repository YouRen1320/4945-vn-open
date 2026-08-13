# S2-EPISODE-2.9：路线尾声、关系收束与 3.0 RC

> 版本：2.9.0 | 关联：[S2-ENDING-CONTRACT.md](./S2-ENDING-CONTRACT.md) | [S2-CHOICE-PAYOFF-LEDGER.md](./S2-CHOICE-PAYOFF-LEDGER.md)

## 1. 设计约束

- 第二季最后一集，主线范围冻结：不新增路线/角色/组织/结局/冲突/机制字段。
- 每个 2.8 主要结局获得一个可玩尾声（总计 10 个）。
- 12 名合法伴侣各有关系收束场景；无伴侣路径有独行余波。
- 主结局先形成“艰难胜利 / 保护核心”两种情绪底色，再由真实伴侣本人完成收束。
- 季总结节点关闭全部开放项；不再产生新 payoff ledger 条目。

## 2. 节点图

```
s2-2.9-entry
 ├─ s2MainEnding → s2-2.9-org2-triumph
 ├─ s2MainEnding → s2-2.9-org2-compromise
 ├─ s2MainEnding → s2-2.9-org3-triumph
 ├─ s2MainEnding → s2-2.9-org3-compromise
 ├─ s2MainEnding → s2-2.9-org4-triumph
 ├─ s2MainEnding → s2-2.9-org4-compromise
 ├─ s2MainEnding → s2-2.9-org5-triumph
 ├─ s2MainEnding → s2-2.9-org5-compromise
 ├─ s2MainEnding → s2-2.9-org6-triumph
 └─ route + s2MainEnding → s2-2.9-org6-compromise
      ↓ (全部 convergent)
   s2-2.9-rel-closure
      ├─ triumph → s2-2.9-rel-tone-triumph
      └─ compromise → s2-2.9-rel-tone-compromise
          ↓
      partner-router → 12 名合法 activePartner / none
      ↓
   s2-2.9-summary
      ↓
   s2-2.9-exit
```

结局和路线不匹配时进入 `ending-repair`；组织也缺失时先进入 `route-repair`。两者都要求玩家明确确认，不设置默认结局。

## 3. 十个尾声内容

| 结局 ID | 结点 | 角色 | 核心意象 |
| --- | --- | --- | --- |
| s2-ending-org2-triumph | s2-2.9-org2-triumph | shana | 新座位表：走的人留了信，留的人旁边写了新计划 |
| s2-ending-org2-compromise | s2-2.9-org2-compromise | bottle | 排班表画星：末席就末席，人齐了路就长 |
| s2-ending-org3-triumph | s2-2.9-org3-triumph | truth | 红色记号笔：接下来九十天每一秒都被记下来 |
| s2-ending-org3-compromise | s2-2.9-org3-compromise | truth | 说明函在原始数据旁：这页纸比前面几十页都重要 |
| s2-ending-org4-triumph | s2-2.9-org4-triumph | yanqiu | 独立时钟：树敌没关系，只要尺够硬 |
| s2-ending-org4-compromise | s2-2.9-org4-compromise | yanqiu | 训练柜里的加赛条款：尺可以藏，但不能丢 |
| s2-ending-org5-triumph | s2-2.9-org5-triumph | wenxian | 暗线拓扑图：两年的网没摊在阳光下但比公示文书结实 |
| s2-ending-org5-compromise | s2-2.9-org5-compromise | wenxian | 表里如一：桌面一份合规、抽屉一把钥匙 |
| s2-ending-org6-triumph | s2-2.9-org6-triumph | narrator | 章程正文上的名字：以后每次翻开章程六组都在上面 |
| s2-ending-org6-compromise | s2-2.9-org6-compromise | narrator | 日历上的圈：穿过了这一层地板够到了下一季的土壤 |

## 4. 关系收束

- 12 名合法伴侣各有独立场景，读取 `activePartner` 路由：shana、qifu、chenyi、swordheart、heartbeat、yanqiu、huayue、wenxian、takemehand、xilufei、yyt、avucii。
- 主结局先写入 `s2RelationshipTone = hard-won / protected-core`，使 triumph 与 compromise 的关系余波可见不同。
- bottle/truth 仅通过早期 `s2RelationshipResolved` 回顾字段兼容，不扩张 GameState 的 activePartner 合同。
- 无伴侣路径走 `s2-2.9-rel-none`：独行但不孤独，只是选择了一种更重的走法。

## 5. 引擎变更

- `Condition` 联合类型新增 `activePartner` 分支。
- `evaluateCondition` 新增对应 case。

## 6. 持久状态

| 标记 | 位置 | 含义 |
| --- | --- | --- |
| `s2EpilogueEntered` | s2-2.9-entry onEnter | 进入尾声 |
| `s2EpilogueEnding` | 各尾声 onEnter | 具体结局 ID |
| `s2RelationshipResolved` | 各关系 onEnter | 伴侣 ID 或 'none' |
| `s2RelationshipTone` | 主结局关系前奏 onEnter | hard-won / protected-core / legacy-unrecorded |
| `s2Complete` | s2-2.9-summary onEnter | 第二季主线完成 |
| `s2EpilogueComplete` | s2-2.9-summary onEnter | 尾声完成 |
| `s2-finale-complete` | s2-2.9-summary unlockEnding | 第二季结局 ID |

## 7. 视觉

- 零新增托管视觉，复用 `aftermath` / `ending` 背景与既有立绘。

## 8. 修复选择与 payoff ledger

`s2-2.8-*repair*` 与 `s2-2.9-*repair*` 是损坏/旧档的操作性确认，不是正式剧情选择，不进入 payoff ledger、结局数量或正式路径计数；每次修复都写入 `s2ContinuityRepaired`。
