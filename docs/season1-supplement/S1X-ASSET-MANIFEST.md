# 第一季补遗 · 素材清单（S1X-ASSET-MANIFEST）

> 阶段：冻结前草稿。列出五篇补遗所需视觉资产，区分"复用既有"与"需用户外部生成的新增"。
> 关键约束：本产品**不支持图像生成**（见工作记忆硬阻塞）。所有标记为"新增"的资产，提示词由本文件给出，图片须由用户使用外部模型生成后放入 `game/public/assets/...`。
> 复用原则：优先复用 `game/src/content/assets.ts` 中既有 CG 与角色 sprite，尽量零新增强制视觉。

---

## 1. 角色 sprite（全部复用既有，见 characters.ts）

| 角色 | characters.ts 名称 | 复用说明 |
|---|---|---|
| 时 | `时` | S1X-01、S1X-04 共用人物的既有 sprite |
| 告白 | `告白` | S1X-02 |
| 砚秋水 | `砚秋水` | S1X-03 |
| 温陷 | `温陷` | S1X-04 |
| yyT | `yyT` | S1X-05 |
| AVUCII | `AVUCII` | S1X-05 |
| 心跳成瘾 | `心跳成瘾` | S1X-02（三组首领旁白/同框可选） |

> 角色 sprite 在 `s1x-` 节点中按 `speaker` 字段引用既有角色 id，无需新增 sprite 文件。

---

## 2. 背景 / CG（优先复用既有 CG，见 assets.ts）

| 篇 | 复用既有资产（assets.ts） | 适配说明 |
|---|---|---|
| S1X-01 二组·时加入 | `ending-route2-v1.webp`（二组结局 CG）或二组通用背景 | 主题"值得跟的人"，无专属 founding CG，复用二组结局/通用背景 |
| S1X-02 三组·告白转组 | `route3-founding-v1.webp`（三组创立 CG） | 主题"两次转组"，复用三组创立 CG 作背景锚点 |
| S1X-03 四组·空白账本 | `route4-ledger-v1.webp`（账本 CG） | 主题"空白账本之前"，直接复用账本 CG |
| S1X-04 五组·时离开 | `route5-empty-seat-v1.webp`（空座 CG） | 主题"第一天就走了的人"，完美契合空座 CG |
| S1X-05 六组·第六个 | `route6-sixth-seat-v1.webp`（第六席 CG） | 主题"第六个为什么"，直接复用第六席 CG |

**结论**：五篇均可仅凭既有 CG + 角色 sprite 实现，**无强制新增视觉**。满足"零新增"优先原则。

---

## 3. 可选新增 CG（用户外部生成，targetRelease = 2.1）

以下为**增强型**可选 CG，非实现必需。若用户希望每篇补遗有专属插画，按 [S1X-IMAGE-PROMPTS.md](./S1X-IMAGE-PROMPTS.md) 生成后登记：

| 资产 ID（建议） | 归属篇 | 内容 | 状态 |
|---|---|---|---|
| `s1x-cg-01-shi-arrives` | S1X-01 | 时提着行李站在二组门口的夜谈 | pending（用户生成） |
| `s1x-cg-02-gaobai-farewell` | S1X-02 | 告白在三组门口辞行、手写告别 | pending（用户生成） |
| `s1x-cg-03-ledger-first-stroke` | S1X-03 | 砚秋水与玩家在空白账本上落第一笔 | pending（用户生成） |
| `s1x-cg-04-empty-seat` | S1X-04 | 五组空着的那个座位 + 温陷独白 | pending（用户生成，或复用 route5-empty-seat） |
| `s1x-cg-05-sixth-charter` | S1X-05 | 玩家在创立页签下写第六组章程 | pending（用户生成） |

> 这些资产**未冻结为必需**。是否生成由用户决定；不生成时五篇仍以 §2 既有 CG 实现。

---

## 4. 资产审计与发布闸门

- 所有 `s1x-` 视觉引用必须在内容图（content graph）验证中解析为既有路径或已生成文件，否则构建失败（沿用 1.8 的 `audit:assets` 闸门）。
- `targetRelease = 2.1` 的托管视觉：若启用 §3 可选 CG，则必须全部 ready 后方可稳定发布；若仅用 §2 复用资产，则 2.1 无强制待生成视觉，pending 为零。
- 复用的 route3/4/5/6 CG 与角色 sprite 在 1.8 已就位，不在 2.1 新增审计范围内。

---

## 5. 待用户决定

1. 是否启用 §3 可选新增 CG（需用户外部生成）？还是仅用 §2 既有资产零新增？
2. 若启用，生成后图片放置路径与文件名是否遵循本清单 §3 建议 ID？
