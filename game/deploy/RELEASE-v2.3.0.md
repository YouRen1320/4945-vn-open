# 发布 2.3.0 · 第二季新局势成形

- 发布日期：2026-08-05
- 应用版本：`2.3.0`（schema5 / 收藏 v2，集中心 episode 机制）
- 域名：4945.iyouren.top
- 发布目录：`/srv/4945-vn/releases/2.3.0`
- 当前软链：`/srv/4945-vn/current -> /srv/4945-vn/releases/2.3.0`

## 内容范围

1. 2.3 episode「新局势成形」：共通主干（准备联合自评）+ 五条路线同期变体（org2..org6）+ 首个有效选择（assert/balance）+ 收束哨兵。
2. episode 完成机制通用化：advance 按 completionNodeId 匹配；completeSeason2Episode 存 episodeState 供后续集继承变量。
3. 集中心 UI：Season2Panel 列出序章（已完成）/ 2.3（可玩）/ 后续（未解锁）；playSeason2Episode 从集中心进入。
4. 零新增托管视觉，复用 1.8 既有背景与立绘。

## 验证结果

- `vue-tsc -b`：0 错误
- `vitest run`：366 项全过（2.3 新增 4）
- `audit:assets`：通过，2.3 零新增托管视觉
- `npm run build`：成功

## 部署步骤

```sh
ssh root@aliyun-4945 'mkdir -p /srv/4945-vn/releases/2.3.0'
rsync -az --delete dist/ root@aliyun-4945:/srv/4945-vn/releases/2.3.0/
ssh root@aliyun-4945 'ln -sfn /srv/4945-vn/releases/2.3.0 /srv/4945-vn/current && nginx -t && systemctl reload nginx'
```

## 回滚

```sh
ssh root@aliyun-4945 'ln -sfn /srv/4945-vn/releases/2.2.0 /srv/4945-vn/current && nginx -t && systemctl reload nginx'
```

## 已知限制

- E2E（Playwright）随 3.0 统一补充。
- 2.4 起后续集按路线图推进；2.3 选择将在 2.4 评议现场到期。
