# 发布 2.7.0 · 后期危机与终局前置

- 发布日期：2026-08-05
- 应用版本：`2.7.0`（schema4 / 收藏 v2，episode 顺序解锁）
- 域名：4945.iyouren.top
- 发布目录：`/srv/4945-vn/releases/2.7.0`
- 当前软链：`/srv/4945-vn/current -> /srv/4945-vn/releases/2.7.0`

## 内容范围

1. 2.7 episode「后期危机与终局前置」：回收 2.6 s2PressureStance → 第二次协调席会晤 → 危机分流 × 路线变体 × 终局选择 → 后果 → 收束。
2. 持久状态 `variables.s2FinaleEntry`（stand-firm / cut-losses）供 2.8 高潮路由；`s2CrisisFaced` flag 供 2.8 前置校验。
3. 五条路线各承受核心矛盾（退组/旧账/精英门槛/筹码摊薄/新人权重），角色反应与组织后果三线可见。
4. 零新增托管视觉，复用 warRoom/aftermath 与既有立绘。

## 验证结果

- `vue-tsc -b`：0 错误
- `vitest run`：372 项全过
- `audit:assets`：通过，201 张母图
- `npm run build`：成功

## 部署步骤

```sh
ssh root@aliyun-4945 'mkdir -p /srv/4945-vn/releases/2.7.0'
rsync -az --delete dist/ root@aliyun-4945:/srv/4945-vn/releases/2.7.0/
ssh root@aliyun-4945 'ln -sfn /srv/4945-vn/releases/2.7.0 /srv/4945-vn/current && nginx -t && systemctl reload nginx'
```

## 回滚

```sh
ssh root@aliyun-4945 'ln -sfn /srv/4945-vn/releases/2.6.0 /srv/4945-vn/current && nginx -t && systemctl reload nginx'
```
