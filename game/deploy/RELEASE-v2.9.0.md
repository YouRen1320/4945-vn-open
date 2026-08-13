# RELEASE v2.9.0 — 第二季 · 路线尾声与关系收束（3.0 RC）

## 发布内容

第二季最终版：十个主要结局各获可玩尾声，五位核心伙伴关系正式收束，季总结关闭全部开放项。

## 新内容

- 1 个进场节点（`s2-2.9-entry`）+ 10 个结局尾声 + 6 个关系收束 + 1 个季总结 + 1 个退出 = **20 节点**
- 引擎扩展：`activePartner` 条件类型（types.ts + state.ts 各一行）

## 无新增

- 无新增角色/路线/组织/结局/冲突/机制字段
- 无新增托管视觉（复用 aftermath/ending + 既有立绘）
- 无新增 payoff ledger 条目

## 关闭状态

- 所有 dueIn <= 2.9 的选择已回收
- payoff ledger 清零
- 第二季主线完成（`s2Complete` flag）
- 第二季结局 ID 解锁（`s2-finale-complete`）

## 部署

```sh
ssh root@aliyun-4945 'mkdir -p /srv/4945-vn/releases/2.9.0'
rsync -az --delete dist/ root@aliyun-4945:/srv/4945-vn/releases/2.9.0/
ssh root@aliyun-4945 'ln -sfn /srv/4945-vn/releases/2.9.0 /srv/4945-vn/current && nginx -t && systemctl reload nginx'
```

回滚到 v2.8.0：
```sh
ssh root@aliyun-4945 'ln -sfn /srv/4945-vn/releases/2.8.0 /srv/4945-vn/current && nginx -t && systemctl reload nginx'
```
