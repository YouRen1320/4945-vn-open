# v1.8 幻想夜市背景变体生产提示词

## 统一交付标准

- 每张都以指定 v1.6 背景作为唯一几何与风格参考，执行环境编辑；不要重新设计建筑布局。
- 正式画幅 16:9，至少 1600×900；WebP 建议不超过 500 KiB，无需透明通道。
- 全图不得出现人物、剪影人群、可读文字、品牌、真实平台 UI 或水印。
- 中央 34–66% 是人物舞台安全区，避免新增高对比前景遮挡；底部 30% 保持偏暗、低细节，供对白 UI 使用。
- 雨天版本必须有可信湿地反射、檐边滴水和细雨纵深，但不能用暴雨遮挡场景；打烊版本必须保留少量安全引路灯，不能黑到失去可读性。

---

## `V18-BG-01` · 月门细雨

- 输入参考：`game/public/assets/backgrounds/galgame/romance-gate-v1.webp`
- 正式图：`game/public/assets/backgrounds/galgame/romance-gate-rain-v1.webp`

```text
Edit Input Image 1 into a rainy-night variant of the exact same Eastern-fantasy moon-gate location. Preserve the circular gate, roof silhouettes, stone stair geometry, blossom placement, camera position, perspective, deep indigo-plum palette and warm lantern design. Add gentle steady rain, narrow roof-edge drips, wet stone with physically coherent amber and blue reflections, a few subtle ripples in shallow puddles and slightly softened distant haze. The gate remains fully legible and welcoming; no storm, lightning or flooding. Keep the center stage open and the bottom 30% dark and low-detail. No people, umbrellas, text, logo or watermark. Premium original Japanese galgame background, polished painterly cel rendering, 16:9 landscape.
```

## `V18-BG-02` · 月门打烊后

- 输入参考：`game/public/assets/backgrounds/galgame/romance-gate-v1.webp`
- 正式图：`game/public/assets/backgrounds/galgame/romance-gate-after-hours-v1.webp`

```text
Edit Input Image 1 into an after-hours variant of the exact same Eastern-fantasy moon-gate location. Preserve architecture, camera, perspective, blossoms and night palette. Close distant stalls, dim most decorative lanterns and remove every sign of active commerce, while keeping two or three low amber path lights and moonlight so the stone steps and gate remain safely readable. Add a quiet cooled atmosphere and longer soft shadows; do not make the scene abandoned, ruined or frightening. Keep the central character stage unobstructed and the bottom 30% dark and simple. No people, text, logo or watermark. Premium original Japanese galgame background, polished painterly cel rendering, 16:9 landscape.
```

---

## `V18-BG-03` · 妖怪食街细雨

- 输入参考：`game/public/assets/backgrounds/galgame/romance-food-street-v1.webp`
- 正式图：`game/public/assets/backgrounds/galgame/romance-food-street-rain-v1.webp`

```text
Edit Input Image 1 into a gentle rainy-night variant of the exact same Eastern-fantasy food street. Preserve stall geometry, roofs, supernatural accent lights, camera, perspective and deep blue-plum with warm amber palette. Add fine rain beyond the awnings, believable roof drips, wet flagstones reflecting stall lamps, light steam made more visible by moisture and a few small puddle ripples. Keep all counters closed enough that no vendor or customer appears; rain must not obscure the visual stage. Preserve a clear central 34–66% zone and a dark low-detail bottom 30%. No people, umbrellas, readable menus, text, logo or watermark. Premium original Japanese galgame background, polished painterly cel rendering, 16:9 landscape.
```

## `V18-BG-04` · 妖怪食街打烊后

- 输入参考：`game/public/assets/backgrounds/galgame/romance-food-street-v1.webp`
- 正式图：`game/public/assets/backgrounds/galgame/romance-food-street-after-hours-v1.webp`

```text
Edit Input Image 1 into an after-hours variant of the exact same Eastern-fantasy food street. Preserve every stall footprint, roof, camera and perspective. Pull shutters or cloth covers across most stalls, extinguish most display lights, leave only two restrained night-snack lamps and several safe path lanterns, and add a faint trace of cooling steam. The location should feel recently closed and intimate, not derelict. Keep the central stage clear and the bottom 30% dark, quiet and low-detail. No people, leftover readable menu boards, text, logo or watermark. Premium original Japanese galgame background, polished painterly cel rendering, 16:9 landscape.
```

---

## `V18-BG-05` · 符卡游艺场细雨

- 输入参考：`game/public/assets/backgrounds/galgame/romance-arcade-v1.webp`
- 正式图：`game/public/assets/backgrounds/galgame/romance-arcade-rain-v1.webp`

```text
Edit Input Image 1 into a gentle rainy-night variant of the exact same Eastern-fantasy spell-card arcade. Preserve target lanes, hanging bells, masks, timber geometry, camera, perspective and blue-violet amber palette. Add fine rain outside the covered lanes, wet floor edges with accurate reflections, roof drips, a few rain-darkened paper decorations and subtle mist beyond the eaves. Targets, bells and walking surfaces remain readable; no storm or active projectiles. Keep the center stage open and bottom 30% dark and simple. No people, readable scoreboards, text, logo or watermark. Premium original Japanese galgame background, polished painterly cel rendering, 16:9 landscape.
```

## `V18-BG-06` · 符卡游艺场闭馆后

- 输入参考：`game/public/assets/backgrounds/galgame/romance-arcade-v1.webp`
- 正式图：`game/public/assets/backgrounds/galgame/romance-arcade-after-hours-v1.webp`

```text
Edit Input Image 1 into an after-hours variant of the exact same Eastern-fantasy spell-card arcade. Preserve the architecture, targets, hanging bells, masks, camera and perspective. Power down the target lanes, secure spell cards in closed racks, dim most bells, leave one sparse row of low guide lights and allow moonlight to define the empty course. It should feel safely closed and quiet, never ruined or ominous. Keep the central stage unobstructed and bottom 30% dark and low-detail. No people, active projectiles, readable scores, text, logo or watermark. Premium original Japanese galgame background, polished painterly cel rendering, 16:9 landscape.
```

---

## `V18-BG-07` · 河灯桥细雨

- 输入参考：`game/public/assets/backgrounds/galgame/romance-lantern-bridge-v1.webp`
- 正式图：`game/public/assets/backgrounds/galgame/romance-lantern-bridge-rain-v1.webp`

```text
Edit Input Image 1 into a gentle rainy-night variant of the exact same moonlit lantern bridge. Preserve the arched bridge, full-moon placement, riverbank buildings, willow shapes, camera and perspective. Add fine rain layers, delicate ripples around floating lanterns, a wet bridge surface and long physically coherent blue and amber reflections. Slightly veil the far bank with humid haze but retain the bridge silhouette and moon. Keep the central stage clear and the bottom 30% dark and calm. No people, umbrellas, storm, lightning, readable text, logo or watermark. Premium original Japanese galgame background, polished painterly cel rendering, 16:9 landscape.
```

## `V18-BG-08` · 河灯桥打烊后

- 输入参考：`game/public/assets/backgrounds/galgame/romance-lantern-bridge-v1.webp`
- 正式图：`game/public/assets/backgrounds/galgame/romance-lantern-bridge-after-hours-v1.webp`

```text
Edit Input Image 1 into an after-hours variant of the exact same moonlit lantern bridge. Preserve the bridge, moon, river, willows, buildings, camera and perspective. Extinguish distant shop windows and most bridge decorations, retain only a sparse chain of safe path lanterns plus several river lanterns and moonlight, and deepen the cool blue-violet shadows. The place feels intimate after closing, not abandoned, haunted or unreadably dark. Keep the central stage open and the bottom 30% dark and low-detail. No people, readable signs, text, logo or watermark. Premium original Japanese galgame background, polished painterly cel rendering, 16:9 landscape.
```

## 验收清单

- [ ] 8 个提示词编号与正式文件名一一对应，地点和天气／营业状态没有串图。
- [ ] 与输入参考叠放对比时，主要建筑轮廓、相机高度、透视消失点和中心舞台位置一致。
- [ ] 16:9 且至少 1600×900；中央人物安全区无遮挡，底部 30% 可承载对白。
- [ ] 雨景的反射、滴水和涟漪方向可信；打烊景仍有安全可读的引路光。
- [ ] 无人物、可读文字、真实平台 UI、品牌、水印、额外肢体或现代街景漂移。
- [ ] WebP 可正常解码，色彩与基础夜市背景属于同一视觉包。
