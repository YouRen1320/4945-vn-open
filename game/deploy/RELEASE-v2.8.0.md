# 发布 2.8.0 · 高潮与主要结局

- 发布日期：2026-08-05
- 应用版本：`2.8.0`（schema5 / 收藏 v2，episode 顺序解锁）
- 域名：4945.iyouren.top
- 发布目录：`/srv/4945-vn/releases/2.8.0`
- 当前软链：`/srv/4945-vn/current -> /srv/4945-vn/releases/2.8.0`

## 内容范围

1. 2.8 episode「高潮与主要结局」：20 个节点，回收 2.7 s2FinaleEntry + 2.6 s2PressureStance → 五条路线各自的高潮对决 → 最终行动（strike/settle）→ 10 个主要结局。
2. 10 个稳定结局 ID（s2-ending-{org}-triumph / s2-ending-{org}-compromise）写入 s2MainEnding 变量。
3. s2ClimaxComplete flag 标记第二季主线完成。
4. 所有 ending 级和 dueIn<=2.8 的选择全部回收；开放项仅剩 2.9 尾声。
5. 零新增托管视觉，复用 warRoom/aftermath 与既有立绘。

## 验证结果

- `vue-tsc -b`：0 错误
- `vitest run`：372 项全过（3 个 2.8 新增）
- `audit:assets`：通过，201 张母图
- `npm run build`：成功

## 部署步骤

```sh
ssh root@aliyun-4945 'mkdir -p /srv/4945-vn/releases/2.8.0'
rsync -az --delete dist/ root@aliyun-4945:/srv/4945-vn/releases/2.8.0/
ssh root@aliyun-4945 'ln -sfn /srv/4945-vn/releases/2.8.0 /srv/4945-vn/current && nginx -t && systemctl reload nginx'
```

## 回滚

```sh
ssh root@aliyun-4945 'ln -sfn /srv/4945-vn/releases/2.7.0 /srv/4945-vn/current && nginx -t && systemctl reload nginx'
```
