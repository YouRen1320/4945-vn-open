# S2 结局合同（Ending Contract）

> 所有条目来自 SOL-PLAN-2.8 §3，经代码实现签认。

## 结局清单

| endingId | routeScope | requiredFinaleEntry | resultSummary | endingTone |
| --- | --- | --- | --- | --- |
| s2-ending-org2-triumph | org2 | 任意 | 拒绝出卖成员，重谈三项核心条款。赢得内部信任，付出人员流失代价。 | 铁血胜利 |
| s2-ending-org2-compromise | org2 | 任意 | 锁死人员保护线，全员保留但二组在后续评估权重暂降。 | 守护妥协 |
| s2-ending-org3-triumph | org3 | 任意 | 拒绝签字接受数据评估，申请重新评定窗口。全组赌下半季战绩。 | 孤注一掷 |
| s2-ending-org3-compromise | org3 | 任意 | 接受数据评估但附加说明函，为复议留永久窗口。 | 埋线策略 |
| s2-ending-org4-triumph | org4 | 任意 | 拆分精英赛道独立计分，以四组标准制胜。树敌但守住尺度。 | 峰顶 |
| s2-ending-org4-compromise | org4 | 任意 | 接受统一标准，加赛条款藏于附录。四组的尺藏在体系之下。 | 脉藏 |
| s2-ending-org5-triumph | org5 | 任意 | 拒绝公示外联网络，两年织的网成为独立调配权的城墙。 | 网成 |
| s2-ending-org5-compromise | org5 | 任意 | 公示六成但核心三通道不交。表里如一，合规又保底。 | 暗守 |
| s2-ending-org6-triumph | org6 | 任意 | 反向定义独立表决位。六组名字从此印在联合章程上。 | 立威 |
| s2-ending-org6-compromise | org6 | 任意 | 接受观察员席，锁定一年后自动评审升级条款。种根不争花期。 | 深耕 |

## 规则

1. 判定只读取 s2MainEnding 变量，不读取任意字符串 flags。
2. 每个合法 2.7 完成状态恰好通向一个结局。
3. 所有结局均可重试。
4. 失败状态通过叙事可见，不使用隐藏阈值。
5. 结局 ID 发布后只追加不改义。

## 解锁的尾声族（2.9 消费）

| endingId | unlockableEpilogueClass |
| --- | --- |
| 任一 triumph | epilogue-triumph |
| 任一 compromise | epilogue-compromise |

每条路线 × triumph/compromise = 10 个尾声入口在 2.9 实现。
