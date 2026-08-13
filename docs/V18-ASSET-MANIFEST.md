# 1.8 正式视觉资产接入清单

> 自动生成自 `game/src/content/visualAssets.ts` 与 `artifacts/imagegen-v18/` 提示词文档。
> 生成时间：2026-08-04 19:19:30
> 更新：2026-08-05 —— 32 项 pending 已按提示词文档生成、转码并翻为 ready；`audit:assets` 与 `audit:assets:final` 全绿（36/36）。
> 运行时版本：1.7.1（1.8 视觉正式验收后再升版，见 ROADMAP-1.7-2.0.md §1.8）。

## 总览

- 托管视觉合计：**36 项**
- 已就绪（ready）：**36 / 36**
  - 告白 CG（12）：**12 / 12**
  - 夜市背景（8）：**8 / 8**
  - 表情立绘（16）：**16 / 16**
- 生成方式：按 `artifacts/imagegen-v18/` 提示词（`PROMPTS.md` / `BACKGROUND-PROMPTS.md` / `EXPRESSION-PROMPTS.md`）由模型生成 PNG，经 ImageMagick 转码为正式 WebP；表情立绘四角抠白底并保留 alpha。

## 验收标准（按类别）

- **CG / 背景**：≥1600×900、16:9±1%、≤500 KiB，无文字水印、无明显错误手部、角色可辨认、底部 30% 保留对白安全区
- **表情立绘**：≥800×1600、竖版、≤300 KiB，服装/发色/脸部锚点与既有立绘一致，表情切换时不跳变

## 提示词文档

- 告白 CG：artifacts/imagegen-v18/PROMPTS.md
- 夜市背景：artifacts/imagegen-v18/BACKGROUND-PROMPTS.md
- 表情立绘：artifacts/imagegen-v18/EXPRESSION-PROMPTS.md

## 接入流程

1. 按提示词文档用 image2 / 授权管线生成源图，放入 `artifacts/imagegen-v18/`（CG 命名 `romance-<角色>-confession-v1-source.png`）。
2. CG 走官方管线：`npm run package:v18-cgs -- --character <id>`（自动 1600×900 + ≤500KiB）。背景与表情立绘需另行转 webp 并入 `public/assets`。
3. 通过尺寸/体积检查后，在 `visualAssets.ts` 把对应项从 `pendingVisual` 改为 `readyVisual`。
4. 运行 `npm run audit:assets` 确认全绿；`npm run audit:assets:final` 仅剩待生成占位即达标。
5. 人工目检：手部、水印、角色身份、对白安全区；通过后升版 1.8.0。

## 告白 CG（12 项 · 12/12 ready）

| 提示词 | 资产 ID | 正式路径 | 回退路径 | 状态 | 源图 |
|---|---|---|---|---|---|
| V18-CG-01 | v18-confession-shana | /assets/cg/romance-shana-confession-v1.webp | /assets/cg/bond-shana-v1.webp | 🟢 ready | ✅ 源图就位 |
| V18-CG-02 | v18-confession-qifu | /assets/cg/romance-qifu-confession-v1.webp | /assets/cg/bond-qifu-v1.webp | 🟢 ready | ✅ 源图就位 |
| V18-CG-03 | v18-confession-chenyi | /assets/cg/romance-chenyi-confession-v1.webp | /assets/cg/bond-chenyi-v1.webp | 🟢 ready | ✅ 源图就位 |
| V18-CG-04 | v18-confession-swordheart | /assets/cg/romance-swordheart-confession-v1.webp | /assets/cg/bond-swordheart-v1.webp | 🟢 ready | ✅ 源图就位 |
| V18-CG-05 | v18-confession-heartbeat | /assets/cg/romance-heartbeat-confession-v1.webp | /assets/cg/bond-heartbeat-v1.webp | 🟢 ready | ✅ 源图就位 |
| V18-CG-06 | v18-confession-yanqiu | /assets/cg/romance-yanqiu-confession-v1.webp | /assets/cg/bond-yanqiu-v1.webp | 🟢 ready | ✅ 源图就位 |
| V18-CG-07 | v18-confession-huayue | /assets/cg/romance-huayue-confession-v1.webp | /assets/cg/bond-huayue-v1.webp | 🟢 ready | ✅ 源图就位 |
| V18-CG-08 | v18-confession-wenxian | /assets/cg/romance-wenxian-confession-v1.webp | /assets/cg/bond-wenxian-v1.webp | 🟢 ready | ✅ 源图就位 |
| V18-CG-09 | v18-confession-takemehand | /assets/cg/romance-takemehand-confession-v1.webp | /assets/cg/bond-takemehand-v1.webp | 🟢 ready | ✅ 源图就位 |
| V18-CG-10 | v18-confession-xilufei | /assets/cg/romance-xilufei-confession-v1.webp | /assets/cg/bond-xilufei-v1.webp | 🟢 ready | ✅ 源图就位 |
| V18-CG-11 | v18-confession-yyt | /assets/cg/romance-yyt-confession-v1.webp | /assets/cg/bond-yyt-v1.webp | 🟢 ready | ✅ 源图就位 |
| V18-CG-12 | v18-confession-avucii | /assets/cg/romance-avucii-confession-v1.webp | /assets/cg/bond-avucii-v1.webp | 🟢 ready | ✅ 源图就位 |

## 夜市背景（8 项 · 8/8 ready）

| 提示词 | 资产 ID | 正式路径 | 回退路径 | 状态 | 源图 |
|---|---|---|---|---|---|
| V18-BG-01 | v18-bg-gate-rain | /assets/backgrounds/galgame/romance-gate-rain-v1.webp | /assets/backgrounds/galgame/romance-gate-v1.webp | 🟢 ready | ✅ 源图就位 |
| V18-BG-02 | v18-bg-gate-after-hours | /assets/backgrounds/galgame/romance-gate-after-hours-v1.webp | /assets/backgrounds/galgame/romance-gate-v1.webp | 🟢 ready | ✅ 源图就位 |
| V18-BG-03 | v18-bg-food-street-rain | /assets/backgrounds/galgame/romance-food-street-rain-v1.webp | /assets/backgrounds/galgame/romance-food-street-v1.webp | 🟢 ready | ✅ 源图就位 |
| V18-BG-04 | v18-bg-food-street-after-hours | /assets/backgrounds/galgame/romance-food-street-after-hours-v1.webp | /assets/backgrounds/galgame/romance-food-street-v1.webp | 🟢 ready | ✅ 源图就位 |
| V18-BG-05 | v18-bg-arcade-rain | /assets/backgrounds/galgame/romance-arcade-rain-v1.webp | /assets/backgrounds/galgame/romance-arcade-v1.webp | 🟢 ready | ✅ 源图就位 |
| V18-BG-06 | v18-bg-arcade-after-hours | /assets/backgrounds/galgame/romance-arcade-after-hours-v1.webp | /assets/backgrounds/galgame/romance-arcade-v1.webp | 🟢 ready | ✅ 源图就位 |
| V18-BG-07 | v18-bg-lantern-bridge-rain | /assets/backgrounds/galgame/romance-lantern-bridge-rain-v1.webp | /assets/backgrounds/galgame/romance-lantern-bridge-v1.webp | 🟢 ready | ✅ 源图就位 |
| V18-BG-08 | v18-bg-lantern-bridge-after-hours | /assets/backgrounds/galgame/romance-lantern-bridge-after-hours-v1.webp | /assets/backgrounds/galgame/romance-lantern-bridge-v1.webp | 🟢 ready | ✅ 源图就位 |

## 表情立绘（16 项 · 16/16 ready）

| 提示词 | 资产 ID | 正式路径 | 回退路径 | 状态 | 源图 |
|---|---|---|---|---|---|
| V18-EX-01 | v18-expression-swordheart-shy | /assets/sprites/swordheart/expression-shy-v1.webp | /assets/sprites/swordheart/base-neutral-v1.webp | 🟢 ready | ✅ 源图就位 |
| V18-EX-02 | v18-expression-swordheart-serious | /assets/sprites/swordheart/expression-serious-v1.webp | /assets/sprites/swordheart/base-neutral-v1.webp | 🟢 ready | ✅ 源图就位 |
| V18-EX-03 | v18-expression-swordheart-surprised | /assets/sprites/swordheart/expression-surprised-v1.webp | /assets/sprites/swordheart/base-neutral-v1.webp | 🟢 ready | ✅ 源图就位 |
| V18-EX-04 | v18-expression-swordheart-relaxed | /assets/sprites/swordheart/expression-relaxed-v1.webp | /assets/sprites/swordheart/base-neutral-v1.webp | 🟢 ready | ✅ 源图就位 |
| V18-EX-05 | v18-expression-huayue-shy | /assets/sprites/huayue/expression-shy-v1.webp | /assets/sprites/huayue/base-neutral-v1.webp | 🟢 ready | ✅ 源图就位 |
| V18-EX-06 | v18-expression-huayue-serious | /assets/sprites/huayue/expression-serious-v1.webp | /assets/sprites/huayue/base-neutral-v1.webp | 🟢 ready | ✅ 源图就位 |
| V18-EX-07 | v18-expression-huayue-surprised | /assets/sprites/huayue/expression-surprised-v1.webp | /assets/sprites/huayue/base-neutral-v1.webp | 🟢 ready | ✅ 源图就位 |
| V18-EX-08 | v18-expression-huayue-relaxed | /assets/sprites/huayue/expression-relaxed-v1.webp | /assets/sprites/huayue/base-neutral-v1.webp | 🟢 ready | ✅ 源图就位 |
| V18-EX-09 | v18-expression-yyt-shy | /assets/sprites/yyt/expression-shy-v1.webp | /assets/sprites/yyt/base-neutral-v1.webp | 🟢 ready | ✅ 源图就位 |
| V18-EX-10 | v18-expression-yyt-serious | /assets/sprites/yyt/expression-serious-v1.webp | /assets/sprites/yyt/base-neutral-v1.webp | 🟢 ready | ✅ 源图就位 |
| V18-EX-11 | v18-expression-yyt-surprised | /assets/sprites/yyt/expression-surprised-v1.webp | /assets/sprites/yyt/base-neutral-v1.webp | 🟢 ready | ✅ 源图就位 |
| V18-EX-12 | v18-expression-yyt-relaxed | /assets/sprites/yyt/expression-relaxed-v1.webp | /assets/sprites/yyt/base-neutral-v1.webp | 🟢 ready | ✅ 源图就位 |
| V18-EX-13 | v18-expression-avucii-shy | /assets/sprites/avucii/expression-shy-v1.webp | /assets/sprites/avucii/base-neutral-v1.webp | 🟢 ready | ✅ 源图就位 |
| V18-EX-14 | v18-expression-avucii-serious | /assets/sprites/avucii/expression-serious-v1.webp | /assets/sprites/avucii/base-neutral-v1.webp | 🟢 ready | ✅ 源图就位 |
| V18-EX-15 | v18-expression-avucii-surprised | /assets/sprites/avucii/expression-surprised-v1.webp | /assets/sprites/avucii/base-neutral-v1.webp | 🟢 ready | ✅ 源图就位 |
| V18-EX-16 | v18-expression-avucii-relaxed | /assets/sprites/avucii/expression-relaxed-v1.webp | /assets/sprites/avucii/base-neutral-v1.webp | 🟢 ready | ✅ 源图就位 |

## 说明

- `pending` 状态下运行时一律回退到 `fallback` 路径，预览/构建/离线都不会请求缺失的最终文件。
- 仅当最终文件通过尺寸与体积审计、且人工目检通过后，才翻为 `ready`。
- 全部 36 项已 `ready`；发布 1.8.0 前仍需对全部正式图做一次人工目检（手部/水印/角色身份/对白安全区/表情立绘 alpha 边缘）。
