# RELEASE v3.1.3 — 事件一结局连续性热修复

## 发布结果

| 项目 | 结果 |
|------|------|
| 发布时间 | 2026-08-10 02:24 CST |
| 公网地址 | `https://4945.iyouren.top/` |
| 应用源码提交 | `c936fa2` |
| 线上发布目录 | `/srv/4945-vn/releases/3.1.3` |
| 当前软链 | `/srv/4945-vn/current` → `/srv/4945-vn/releases/3.1.3` |
| 上一可回滚版本 | `/srv/4945-vn/releases/3.1.2` |
| 发布前备份 | 按用户明确要求跳过；3.1.2 不可变发布目录继续保留 |

## 内容

- 事件一结局统一按“组织结局 → 共享隐藏结局 → 事件一片尾 → 事件二”推进。
- 组织与共享隐藏结局改为“继续片尾”，不再错误返回标题。
- 3.1.2 及更早版本中停在共享隐藏结局的存档，会按最终路线状态补齐组织结局、CG 与连续性摘要。
- 恢复三、五、六组此前被共享结局遮蔽的隐藏组织结局。

## 发布产物

| 文件 | SHA-256 |
|------|---------|
| `index.html` | `58f44d68b1fc13f8a09b6de014beaca81ea94fce15b20b958f429f48598d182b` |
| `assets/index-CcpsTYoF.js` | `978078a293f4f70a28c68241b66bca84da54334c9309a75bcb9629afa15325e2` |
| `assets/index-BxRPVUer.css` | `f16cbfa2ddc6b94c83d5ff11bca3b3c0cb01a1c542b9b1500aecf48e59833dd0` |
| `sw.js` | `449bee3fe53943ea09425cec927823c2b17bd6aaee30b295543b5ecdcfbc3431` |

以上摘要已在发布后直接对远端发布目录重新计算并核对。

## 验收证据

- Vue TypeCheck 与 Vite 生产构建通过，Service Worker 资源注入成功。
- 单元测试 36 个文件、526/526 通过；Playwright 端到端测试 28/28 通过。
- 正式素材审计通过：203 张母图、160 个源码引用、39 个剧情 CG 引用、50 个图鉴登记有效。
- `npm audit` 为 0 个已知漏洞，部署 dry-run 与 `git diff --check` 通过。
- 部署后常规公网烟测通过：HTTP 200、manifest、更新说明、Service Worker、建档及代表剧情资源正常。
- 线上专项验收使用旧版“提线木偶”自动档：显示“继续片尾”，补齐 `r4-puppeteer`，抵达事件一片尾并成功创建事件二 v5 存档。

## 回滚

若发布后出现严重问题，原子切回 3.1.2：

```sh
ssh aliyun-4945 'set -e; previous=/srv/4945-vn/releases/3.1.2; temporary=/srv/4945-vn/.rollback-3.1.2-$(date +%s); ln -s "$previous" "$temporary"; mv -T "$temporary" /srv/4945-vn/current; test "$(readlink /srv/4945-vn/current)" = "$previous"'
```

回滚后必须重新运行与 3.1.2 页面结构和版本号匹配的公网验收。

## 兼容处理

- 保持 v4/v5 schema、localStorage 键和手动存档格式不变。
- 旧共享隐藏结局存档不会倒退重播组织结局画面，而是静默补齐其收藏和跨季传承副作用。
- 新存档按完整顺序展示并收藏组织结局与共享隐藏结局。

## 已知限制

- 主 JavaScript 包约 919 kB（gzip 约 274 kB），构建仍提示超过 500 kB。
- 本次只完成正式站部署；分支尚未合并到 `main`，远端提交与 `v3.1.3` 标签尚未创建。
