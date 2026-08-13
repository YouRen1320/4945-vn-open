# 发布 2.6.0 · 组织与关系压力交汇

- 发布日期：2026-08-05
- 应用版本：`2.6.0`（schema5 / 收藏 v2，episode 顺序解锁）
- 域名：4945.iyouren.top
- 发布目录：`/srv/4945-vn/releases/2.6.0`
- 当前软链：`/srv/4945-vn/current -> /srv/4945-vn/releases/2.6.0`

## 内容范围

1. 2.6 episode「组织与关系压力交汇」：回收 2.5 中点 → 协调席交锋 → 路线同期变体 → 核心选择（org-priority/rel-priority）→ 收束哨兵。
2. 持久状态 `variables.s2PressureStance` 延续到 2.7 回收；branch budget / ledger / 节点图一致。
3. 集中心 UI 新增「组织与关系压力交汇」入口（前置 2.5 完成）。
4. 零新增托管视觉，复用既有背景与立绘。

## 验证结果

- `vue-tsc -b`：0 错误
- `vitest run`：372 项全过（2.6 新增）
- `audit:assets`：通过，2.6 零新增托管视觉
- `npm run build`：成功

## 部署步骤

```sh
ssh root@aliyun-4945 'mkdir -p /srv/4945-vn/releases/2.6.0'
rsync -az --delete dist/ root@aliyun-4945:/srv/4945-vn/releases/2.6.0/
ssh root@aliyun-4945 'ln -sfn /srv/4945-vn/releases/2.6.0 /srv/4945-vn/current && nginx -t && systemctl reload nginx'
```

## 回滚

```sh
ssh root@aliyun-4945 'ln -sfn /srv/4945-vn/releases/2.5.0 /srv/4945-vn/current && nginx -t && systemctl reload nginx'
```

## 已知限制

- E2E 随 3.0 补充。
- 2.7 起回收 s2PressureStance 的持久状态。
