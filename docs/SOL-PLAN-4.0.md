# 《4945区》4.0 Sol 方案：完整第三季稳定晋升

> 状态：条件放行方案；当前工作区尚未实现第二季或第三季，必须等待 3.9 内容冻结与全部 RC 证据。
>
> 剧情定位：不新增剧情。4.0 只发布 3.2–3.9 已交付并冻结的完整第三季。
>
> 前置：[3.9 多季尾声、关系收束与 4.0 RC](./SOL-PLAN-3.9.md)。

## 1. 目标与范围

4.0 把三季客户端从候选状态晋升为稳定版。它表示第三季完整产品里程碑，不自动表示整个作品永久完结，也不意味着故意破坏 schema5 兼容。

玩家侧交付：完整游玩前三季及补遗；从 outcome archive 选择多季 lineage 开启第三季；完成第三季全部主要结局、失败状态、关系收束和多季总结；按需管理各季离线包。

## 2. 必要前置

- 3.9 全部 episode、结局、尾声、连续性与 Season3OutcomeRecord 完成；
- S3 payoff 和 continuity debt 必需项全部关闭；
- 节点、选择、结局、outcome fields 和素材 ID 冻结；
- `targetRelease <= 4.0` 的托管视觉全部 ready；
- v4/v5、收藏 v2、outcome archive 和 profiles 全矩阵通过；
- `4.0.0-rc.N` 在独立预发布环境通过；
- P0/P1 为零，P2 均有明确决定。

## 3. 冻结规则

允许：修复崩溃、错档、断链、事实错误、缺图、离线、配额、无障碍和关键布局问题；补测试、迁移、发布与回滚证据；不改含义的错字和资产压缩。

禁止：新增剧情、路线、角色、结局、schema 字段、continuity 维度或提示词项；改写选择含义；删除旧数据键；降低测试或素材门禁。

## 4. 最终验收矩阵

### 4.1 内容

- 第一季、第一季补遗、第二季、第二季回望补遗；
- 第三季 3.2–3.9 全 episode；
- 所有活跃路线、合法 continuity classes、失败状态、主要结局与尾声；
- S3 payoff、continuity retirement 和多季总结；
- 全局 ID 唯一、无死节点、伪结局或跨季普通跳转。

### 4.2 数据与 lineage

- schema1–4 → schema5 与所有内容修订；
- outcome archive 创建、去重、supersede、删除影响与导入导出；
- guided recap 合法 bundles 与剧透提示；
- campaignId/lineageId、profile 快照、目标槽覆盖确认；
- 普通存档删除不删除 outcomes；
- 4.0 → 最后稳定 3.x → 4.0 往返后所有数据恢复；
- 损坏、冲突、重复导入、空间不足和部分旧数据。

### 4.3 客户端与离线

- 375×812、430×932、844×390 和桌面全流程；
- 键盘、焦点、读屏、低动态、音量、长文本、安全区和剧透提示；
- 首装、升级、纯离线启动、三季包按需下载/更新/删除；
- 配额不足不静默驱逐，删除资源不删除数据；
- Service Worker 更新、旧缓存淘汰、资源 hash 和回滚。

### 4.4 素材

- pending 为零，无未登记、损坏、错误比例或 fallback 冒充；
- 每张生成图通过身份、手部、文字/水印、移动焦点和对白安全区人工验收；
- 角色锚点、targetRelease 和外部生成 provenance 可追溯；
- 三季素材无 ID、路径、版本或缓存串用。

## 5. 发布产物

```text
game/deploy/RELEASE-v4.0.0.md
game/deploy/ROLLBACK-v4.0.0.md
game/deploy/MIGRATION-v5-MULTISEASON.md
game/docs/V4.0-ACCEPTANCE.md
最终内容图、continuity 与 outcome 报告
最终素材 provenance 与离线季包报告
```

版本号、锁文件、状态常量、发布说明、页面显示和 Service Worker 在最终构建前一次同步。最终构建与最后通过 RC 除版本元数据和获批阻断修复外不得漂移。

## 6. 必跑验证

```text
npm run typecheck
npm test
npm run audit:assets:final
npm run build
npm run test:e2e
```

所有新增内容图、lineage、outcome、配额和离线审计命令必须进入 `package.json` 与 acceptance。

## 7. 发布与回滚

1. 独立预发布地址部署不可变 RC。
2. 用复制的真实 v4/v5/outcome 数据记录迁移前后键与 hash。
3. 完成内容、数据、设备、离线、素材和 lineage 矩阵。
4. 指回最后稳定 3.x，确认旧内容可用且第三季数据/archive 未覆盖。
5. 再切回 RC，确认 season3 campaigns 与 outcomes 恢复。
6. 发布不可变 `v4.0.0` 并完成公网烟测。
7. 任一步失败生成新 RC，不覆盖旧候选。

## 8. 完成标准

P0/P1 为零；P2 有明确决定；自动、人工、离线、配额和公网矩阵通过；全部图片由用户确认；迁移、lineage、outcome archive 和回滚证据完整；release、acceptance、rollback 与构建一致。

## 9. 兼容性妥协

- 回滚到早期 3.x 时第三季后续内容或 archive 新字段暂不可见，但数据保留。
- 多季连续性只继承可证明结果，不能精确复原第一季旧选择。
- 离线改为按季下载，不保证未下载的季在断网时可用。
- 部分旧路线只被承认或退休，不结构性延续到第三季。

## 10. 有意不做

- 不新增剧情、图片需求、系统功能或 schema 字段。
- 不把 4.0 宣称为作品永久完结。
- 不自动升级 schema6，不删除 v4/v5/旧收藏/outcome records。
- 不做账号、云存档、遥测、数据库或跨设备同步。
- 不在生产数据上执行破坏性迁移试验。
