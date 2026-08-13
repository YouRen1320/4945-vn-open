# 发布 2.4.0 · 第二季首次实质分歧

- 发布日期：2026-08-05
- 应用版本：`2.4.0`（schema5 / 收藏 v2，episode 顺序解锁）
- 域名：4945.iyouren.top
- 发布目录：`/srv/4945-vn/releases/2.4.0`
- 当前软链：`/srv/4945-vn/current -> /srv/4945-vn/releases/2.4.0`

## 内容范围

1. 2.4 episode「首次实质分歧」：评议现场（继承 2.3 s2Stance）→ 路线同期变体 → 实质分歧（confront/coalition）→ 收束哨兵。
2. 持久状态 `variables.s2Diverge` 延续到 2.5 回收；branch budget / ledger / 节点图一致。
3. 集中心 UI 新增「首次实质分歧」入口（前置 2.3 完成）。
4. 零新增托管视觉。

## 验证结果

- `vue-tsc -b`：0 错误
- `vitest run`：369 项全过（2.4 新增 5）
- `audit:assets`：通过，2.4 零新增托管视觉
- `npm run build`：成功

## 部署步骤

```sh
ssh root@aliyun-4945 'mkdir -p /srv/4945-vn/releases/2.4.0'
rsync -az --delete dist/ root@aliyun-4945:/srv/4945-vn/releases/2.4.0/
ssh root@aliyun-4945 'ln -sfn /srv/4945-vn/releases/2.4.0 /srv/4945-vn/current && nginx -t && systemctl reload nginx'
```

## 回滚

```sh
ssh root@aliyun-4945 'ln -sfn /srv/4945-vn/releases/2.3.0 /srv/4945-vn/current && nginx -t && systemctl reload nginx'
```

## 已知限制

- E2E 随 3.0 补充。
- 2.5 起回收 s2Diverge 的持久状态。
