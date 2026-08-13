# RELEASE v3.1.1 — 稳定性热修复

## 发布结果

| 项目 | 结果 |
|------|------|
| 发布时间 | 2026-08-09 22:29 CST |
| 公网地址 | `https://4945.iyouren.top/` |
| 应用源码提交 | `895edef` |
| 线上发布目录 | `/srv/4945-vn/releases/3.1.1` |
| 当前软链 | `/srv/4945-vn/current` → `/srv/4945-vn/releases/3.1.1` |
| 上一可回滚版本 | `/srv/4945-vn/releases/3.1.0-r4` |
| 发布前备份 | `backups/game-src-20260809-151615-671-18841.tar.gz` |

## 内容

- 修正第一季路线结局识别、第二季入口与不完整存档误判。
- 收紧 schema5 存档结构校验，保持有效旧存档兼容。
- 统一第二季活跃路线、伙伴结算、结局注册与归档展示。
- 补齐第一路线两张正式结局 CG，正式素材门禁拒绝占位图。
- 加固 Service Worker、构建资源注入、备份、部署、回滚和公网烟测。

## 发布产物

| 文件 | SHA-256 |
|------|---------|
| `index.html` | `89ac781043d005c69f0c6b912fb56b0a0d811b7ab1d582b71573cbc9ee62f976` |
| `assets/index-DsNVP3gK.js` | `90f8942076e0d308d721f0213a10caf219b91f59161c518fb2c002bf67668286` |
| `assets/index-CZaUA49n.css` | `5d3883917fce5e0fce6486934ff17c43cb7f4ac6631ef0bcefccadf7131eb327` |
| `sw.js` | `b63058d3ded5224b848afc3988c1b397d1c3bea5c12aff294c7f5a8945fbe2ce` |

## 验收证据

- 干净 Git worktree 中重新安装锁定依赖，TypeCheck 通过。
- 单元测试 459/459、Playwright 端到端测试 25/25。
- 正式素材审计通过：203 张母图，36/36 托管视觉就绪。
- `npm audit` 为 0 个已知漏洞。
- 部署后公网返回 HTTP 200，manifest、真实图片和更新说明可用。
- Service Worker 已接管页面，线上缓存键确认为 `4945-v3.1.1`。
- 线上 JavaScript 产物包含 `3.1.1` 与“稳定性热修复”标识。

## 回滚

若发布后出现严重问题，原子切回上一版本：

```sh
ssh aliyun-4945 'set -e; previous=/srv/4945-vn/releases/3.1.0-r4; temporary=/srv/4945-vn/.rollback-3.1.0-r4-$(date +%s); ln -s "$previous" "$temporary"; mv -T "$temporary" /srv/4945-vn/current; test "$(readlink /srv/4945-vn/current)" = "$previous"'
```

回滚后必须重新运行 `npm run smoke:public`。

## 已知限制

- 主 JavaScript 包仍约 913 kB（gzip 约 273 kB），构建存在超过 500 kB 的性能提示。
- 远端分支与发布标签尚未创建；线上运行不受影响，但仍需完成 Git 远端留档。
- CI 工作流已加入仓库，但尚无远端运行记录。
