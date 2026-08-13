# RELEASE v3.0.0 — 完整第二季稳定版

## 概述

3.0 是一个稳定晋升版本：不新增剧情，把 v2.2–v2.9 已交付并冻结的完整第二季从候选状态晋升为稳定版。

玩家可在一个客户端内完整游玩第一季（五条组织路线 + 补遗）和第二季（共通序章 + 七个 episode + 十个主要结局尾声 + 五位伙伴关系收束）。

## 内容范围

### 第一季（v1.7–v2.1）
- 五条组织路线（群雄逐鹿 / 流亡者联盟 / 和平促进会 / 权力实验室 / 影子议会 / 独立记者）
- 每条路线 4+ 结局（含蝴蝶变体结局）
- 第一季补遗（s1x-）
- 31 个章节检查点

### 第二季（v2.2–v2.9）
- 共通序章（s2-prologue）
- 七个 episode（2.3–2.9）
- 十个主要结局 + 可玩尾声
- 五位核心伙伴关系正式收束
- 季总结关闭全部开放项

### 蝴蝶与世界线系统
- 6 维度蝴蝶变量（残酷/忠诚/混沌/外交/影子/真心）
- 世界线异变阈值与分支
- 60+ 注册结局 + 评级/皮肤动画结局舞台

## 技术变更

| 类别 | 变更 |
|------|------|
| 引擎 | activePartner Condition/Effect；蝴蝶维度 computeWorldlineDeviation；normalizeState 世界线阈值集成 |
| 类型 | schema5 多季 campaign 设计；Season2OutcomeRecord；ContinuityProfile |
| 存储 | Season2Storage；outcome archive 创建/去重/隔离 |
| 迁移 | schema1–4 → schema5；收藏 v2 迁移 |
| UI | EndingStage.vue（CG→标题→回顾→制作名单→S/A/B/C 评级）；Season2Panel；Season1SkipPanel |
| 资产 | 201 张正式母图；36/36 v1.8 托管视觉就绪 |

## 验收状态

| 检查项 | 结果 |
|--------|------|
| TypeCheck | ✅ 0 错误 |
| 单元测试 | ✅ 397 项通过（33 文件） |
| 构建 | ✅ 成功 |
| 资产审计 | ✅ 通过（201 母图，158 引用，37 CG，36/36 托管） |
| 图验证 | ✅ 无断链/重复 ID/死节点 |
| 内容冻结 | ✅ 无新增剧情/角色/路线/结局 |

全部检查项见 [`V3.0-ACCEPTANCE.md`](../docs/V3.0-ACCEPTANCE.md)。

## 部署

```sh
npm run deploy -- --dry-run
npm run deploy
npm run smoke:public
```

## 回滚

回滚到 v2.9.0：
```sh
ssh aliyun-4945 'ln -s /srv/4945-vn/releases/2.9.0 /srv/4945-vn/.rollback-2.9.0 && mv -T /srv/4945-vn/.rollback-2.9.0 /srv/4945-vn/current && readlink /srv/4945-vn/current'
```

详见 [`ROLLBACK-v3.0.0.md`](./ROLLBACK-v3.0.0.md)。

## 已知限制（P2）

- e2e 测试需浏览器环境（Playwright 已配置，待 CI 执行）
- 公网烟测需部署后人工验证
- S2-POSTMORTEM 需玩家走查后撰写
- outcome archive 端到端验证需部署环境
