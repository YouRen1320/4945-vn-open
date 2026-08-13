# 发布 2.2.0 · 第二季共通序章与回顾建档

- 发布日期：2026-08-05
- 应用版本：`2.2.0`（schema5 / 收藏 v2）
- 域名：4945.iyouren.top
- 发布目录：`/srv/4945-vn/releases/2.2.0`
- 当前软链：`/srv/4945-vn/current -> /srv/4945-vn/releases/2.2.0`

## 内容范围

1. 第二季共通序章 `s2-prologue` 完整 episode（入口→回望→日常→扰动→选择→目标→收束哨兵）。
2. 回顾建档 UI：无合法 v4 完成档时选择路线与伴侣，按 `S2-RECAP-CONTRACT` 生成合法 recap 摘要进入序章。
3. 第二季存储层：收藏 v2、outcome archive、v5 存档（独立键，非破坏性叠加）。
4. 补齐 1.8 托管视觉：12 告白 CG + 8 夜市背景 + 16 表情立绘，审计 36/36 ready。

## 验证结果（发布前）

- `vue-tsc -b`：0 错误
- `vitest run`：362 项全过（2.2 新增 49）
- `audit:assets`：通过，36/36 托管视觉 ready，序章零新增资产
- `npm run build`：成功

## 部署步骤

```sh
# 1. 上传 dist
ssh root@aliyun-4945 'mkdir -p /srv/4945-vn/releases/2.2.0'
rsync -avz --delete game/dist/ root@aliyun-4945:/srv/4945-vn/releases/2.2.0/

# 2. 切换软链（原子）
ssh root@aliyun-4945 'ln -sfn /srv/4945-vn/releases/2.2.0 /srv/4945-vn/current'

# 3. 校验并重载 nginx
ssh root@aliyun-4945 'nginx -t && systemctl reload nginx'
```

## 回滚

```sh
ssh root@aliyun-4945 'ln -sfn /srv/4945-vn/releases/20260801-183522-v1.7.1-r1 /srv/4945-vn/current && nginx -t && systemctl reload nginx'
```

## 已知限制

- E2E（Playwright）随 3.0 统一补充，本版仅单元/类型/资产审计与手工验收。
- 第二季后续 2.3–2.9 将逐集发布，每次完成即发版。
