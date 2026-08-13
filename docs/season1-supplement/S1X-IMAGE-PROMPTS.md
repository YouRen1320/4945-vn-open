# 第一季补遗 · 图片提示词（S1X-IMAGE-PROMPTS）

> 阶段：冻结前草稿。本文件提供可选新增 CG 的外部生成提示词（前缀 `S1X-`，对应 [S1X-ASSET-MANIFEST.md](./S1X-ASSET-MANIFEST.md) §3）。
> 重要：本产品**不支持图像生成**。以下提示词由用户复制到外部图像模型（如 Midjourney / Niji / SD）生成，产出后放入 `game/public/assets/cg/` 并登记资产 ID。
> 视觉基调：沿用 1.8 正式视觉（`artifacts/imagegen-v18/` 风格）——统一 cast 立绘比例、柔光夜色、低饱和暖调、动漫视觉小说质感，避免写实照片感。

---

## 通用风格前缀（每条约请前置）

```
visual novel key visual, anime style, soft nocturnal lighting, low-saturation warm palette,
consistent character design, detailed background, cinematic composition, 2D game art
```

---

## S1X-01 · 二组《值得跟的人》

**资产 ID**：`s1x-cg-01-shi-arrives`
**中文描述**：夜晚的二组据点门口，时提着一只简单的行李，站在暖光门廊下回头望，身后是刚接任首领的玩家身影（剪影），氛围是"被一个组织接住"的安定感。

**英文提示词**：
```
S1X-01: a young man named Shi standing at the doorway of a small night-time organization
base, holding a simple travel bag, looking back over his shoulder, warm porch light
halo behind him, a silhouette of the new leader in the backlit interior, sense of
being welcomed and finding certainty, visual novel key visual, anime style, soft
nocturnal lighting, low-saturation warm palette, detailed interior background,
cinematic composition, 2D game art
```

---

## S1X-02 · 三组《两次转组的人》

**资产 ID**：`s1x-cg-02-gaobai-farewell`
**中文描述**：三组门口，告白（写作者气质、抱着笔记本）在门下与玩家（三组首领心跳成瘾视角或玩家自身）辞行，手边放着一张手写告别纸条，光线清冷中带一点释然。

**英文提示词**：
```
S1X-02: a writer-type young man named Gaobai holding a notebook, saying farewell at the
doorway of a gentle organization, a handwritten farewell note on a small table beside
him, cool but relieved lighting, seasonal plum branches visible in background,
visual novel key visual, anime style, soft lighting, low-saturation cool-warm contrast,
detailed background, cinematic composition, 2D game art
```

---

## S1X-03 · 四组《空白账本之前》

**资产 ID**：`s1x-cg-03-ledger-first-stroke`
**中文描述**：四组"天上白玉京"的内景，一张空白账本摊开在木桌上，砚秋水与玩家各执一笔，正要落下第一笔，账本旁有灯火，氛围是"规则被写下来的郑重"。

**英文提示词**：
```
S1X-03: interior of an elegant organization room named Tian Shang Bai Yu Jing, an open
blank ledger on a wooden desk, a calm woman named Yanshuishui and the player each
holding a brush about to write the first line, warm lamplight on the ledger, atmosphere
of solemn rule-making, visual novel key visual, anime style, soft warm lighting,
low-saturation palette, detailed interior background, cinematic composition, 2D game art
```

---

## S1X-04 · 五组《第一天就走了的人》

**资产 ID**：`s1x-cg-04-empty-seat`
**中文描述**：五组简陋的据点里，一个明显空着的座位，椅背上搭着一件还没带走的围巾，温陷站在窗边独白，光线清冷孤寂，主题"未闻花名"的空与在。

**英文提示词**：
```
S1X-04: a sparsely furnished organization room, one obviously empty chair with a scarf
draped over its back, a young man named Wenxian standing by the window in solitude,
cold lonely light, theme of absence and quiet perseverance, visual novel key visual,
anime style, soft cold lighting, low-saturation blue-grey palette, detailed background,
cinematic composition, 2D game art
```

---

## S1X-05 · 六组《第六个为什么》

**资产 ID**：`s1x-cg-05-sixth-charter`
**中文描述**：六组创立的那一刻，玩家在"第六席"的章程首页上签下名字，yyT 与 AVUCII 在旁注视，纸页上是刚写下的反旧秩序章程第一条，氛围是"敢于开第六个"的轻盈与笃定。

**英文提示词**：
```
S1X-05: the founding moment of the sixth organization, the player signing the first page
of a charter titled the Sixth Seat, two companions named yyT and AVUCII watching beside,
the first anti-establishment clause freshly written on the page, light and determined
mood, visual novel key visual, anime style, soft bright lighting, low-saturation palette
with one accent color, detailed background, cinematic composition, 2D game art
```

---

## 使用与验收说明

1. 复制对应英文提示词到外部图像模型生成（建议 16:9 或竖版 2:3，匹配现有 CG 比例）。
2. 生成后文件命名遵循 `S1X-ASSET-MANIFEST.md` §3 的 ID，放入 `game/public/assets/cg/`。
3. 在 `game/src/content/assets.ts` 与 `visualAssets.ts` 登记为 `targetRelease: '2.1'` 的托管视觉。
4. 运行 `npm run audit:assets` 确认解析通过；稳定发布前 `npm run audit:assets:final` 要求 2.1 视觉全 ready。
5. **若用户选择零新增**（仅复用既有 route3/4/5/6 CG），本文件仅供可选增强，不阻塞 2.1 发布。
