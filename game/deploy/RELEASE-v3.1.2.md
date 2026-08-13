# RELEASE v3.1.2 — 统一主线体验

## 发布结果

| 项目 | 结果 |
|------|------|
| 发布时间 | 2026-08-10 01:52 CST |
| 公网地址 | `https://4945.iyouren.top/` |
| 应用源码提交 | `35e5691` |
| 线上发布目录 | `/srv/4945-vn/releases/3.1.2` |
| 当前软链 | `/srv/4945-vn/current` → `/srv/4945-vn/releases/3.1.2` |
| 上一可回滚版本 | `/srv/4945-vn/releases/3.1.1` |
| 发布前备份 | `backups/game-src-20260810-015150-001-32034.tar.gz` |

## 内容

- 将事件一与事件二统一为一条玩家可见主线，标题页“继续主线”优先读取最新事件二进度。
- 首页聚焦开始/继续主线与主线进度，将回放、鉴赏、设置和更新说明收进“更多内容”。
- 事件一片尾只保留“继续主线 · 事件二”，修复滚动字幕残留、页面溢出与界面遮挡。
- 开发者身份统一为“YouRen”，并修正二组谨慎路线的正向收益与叙事反馈。

## 发布产物

| 文件 | SHA-256 |
|------|---------|
| `index.html` | `e1e8b791e991892b5f8d3b3713e3bcedb6eed7c0fa64195f21d65b74a87b1769` |
| `assets/index-CwtW67MP.js` | `77bb924fc710be65aaf96f2a6c7c4a1c2c669e4081bda864d9b010f4cf9b621a` |
| `assets/index-Bol9cEfM.css` | `ad4ad66c704f50c6155272dd9924167dcb5dbd0e3e9ae8daa64c7c3349e20230` |
| `sw.js` | `23e236eab4cd56bfff6f1f4c8298b18399095fae91d0112e1e7c4a7da9a2c725` |

以上摘要已在发布后直接对远端发布目录重新计算并核对。

## 验收证据

- TypeCheck 与 Vite 生产构建通过，Service Worker 资源注入成功。
- 单元测试 36 个文件、522/522 通过；Playwright 端到端测试 27/27 通过。
- 正式素材审计通过：203 张母图、160 个源码引用、39 个剧情 CG 引用、50 个图鉴登记有效。
- `npm audit` 为 0 个已知漏洞，部署 dry-run 与 `git diff --check` 通过。
- 部署后公网返回 HTTP 200，manifest 与应用标题正确，Service Worker 已接管页面。
- 公网烟测穿过新版“更多内容”层级，并完成更新说明、设置、建档、聊天、代表剧情路线和资源检查。
- 线上缓存键为 `4945-v3.1.2`，服务器当前软链已复核指向 3.1.2。

## 回滚

若发布后出现严重问题，原子切回上一版本：

```sh
ssh aliyun-4945 'set -e; previous=/srv/4945-vn/releases/3.1.1; temporary=/srv/4945-vn/.rollback-3.1.1-$(date +%s); ln -s "$previous" "$temporary"; mv -T "$temporary" /srv/4945-vn/current; test "$(readlink /srv/4945-vn/current)" = "$previous"'
```

回滚后必须重新运行与 3.1.1 页面结构匹配的公网验收。

## 兼容处理

- 保留内部 `season2`、`s2-*`、schema4/schema5、v4/v5 存档与既有 localStorage 键；本版不执行数据迁移。
- 玩家可见名称统一为“事件一 / 事件二”，内部稳定标识不重命名，以避免破坏既有存档和剧情引用。

## 已知限制

- 主 JavaScript 包约 919 kB（gzip 约 274 kB），构建仍提示超过 500 kB；分包性能优化不属于本次发布范围。
- 当前基础设施没有独立预发布域名；本次通过 dry-run、原子切换、远端产物核对和部署后完整公网验收控制风险。
