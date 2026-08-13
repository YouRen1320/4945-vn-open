# v1.8 专属表情立绘生产提示词

## 统一交付标准

- 仅需新生成 4 名目前只有基础立绘的角色，每人 4 张，共 16 张；其余 8 名角色复用现有 `soft / determined / surprised / smile` 素材。
- 将对应 `base-neutral-v1.webp` 作为唯一输入图，执行“原位编辑”，不要重新设计角色。
- 保持输入图的画布尺寸、人物锚点、全身轮廓、姿势、服装、光源、线稿与透明背景完全一致；只修改表情及极轻微的头部情绪。
- 源图建议输出无损透明 PNG；正式文件为带 alpha 的 WebP，最长边不得小于原立绘，角色脚底和头顶不得裁切。
- 不得增加道具、文字、背景、第二人物、额外肢体或新的服装细节。

### 共用反向提示词

```text
Avoid: new outfit, changed hairstyle, changed eye color, changed body pose, cropped head or feet, different camera angle, different body proportions, chibi, childlike face, photorealism, 3D render, opaque background, scenery, text, logo, watermark, extra person, extra limb, malformed hands, exaggerated meme face, crying stream, sweat symbols, anger veins, costume drift.
```

---

## 剑斩凡人心 `swordheart`

输入参考：`game/public/assets/sprites/swordheart/base-neutral-v1.webp`

### `V18-EX-01` · shy

- 正式图：`game/public/assets/sprites/swordheart/expression-shy-v1.webp`

```text
Edit Input Image 1 in place as a transparent full-body visual-novel sprite. Preserve Swordheart's exact mature face, very long pale-blue hair, red eyes, white long hooded jacket with blue trim and diamond badge, dark high-neck top, black tactical trousers, blue-black boots, gold watch charm, sheathed sword, original pose, framing, lighting and alpha canvas. Change only the facial acting to restrained shyness: a faint natural blush, softened brows, lips gently closed, gaze briefly angled a few degrees aside while still emotionally present. She remains disciplined and composed, not coy or childish. Keep every pixel outside the face and minimal hair-shadow adjustment as close to the reference as possible. No background and no new prop.
```

### `V18-EX-02` · serious

- 正式图：`game/public/assets/sprites/swordheart/expression-serious-v1.webp`

```text
Edit Input Image 1 in place as a transparent full-body visual-novel sprite. Preserve Swordheart's exact identity, pale-blue hair, red eyes, white-blue hooded jacket, tactical outfit, sheathed sword, original pose, framing, lighting and alpha canvas. Change only the facial acting to calm seriousness: direct steady eye contact, slightly focused brows, neutral closed mouth, no anger and no combat tension. The feeling is private resolve rather than issuing an order. Keep all costume, body, hands, silhouette and background transparency unchanged.
```

### `V18-EX-03` · surprised

- 正式图：`game/public/assets/sprites/swordheart/expression-surprised-v1.webp`

```text
Edit Input Image 1 in place as a transparent full-body visual-novel sprite. Preserve Swordheart's exact identity, outfit, pose, sheathed sword, framing, lighting and transparent canvas. Change only the face to quiet genuine surprise: red eyes slightly widened, brows lifted naturally, lips parted just a little, composure momentarily interrupted. Do not create a scream, panic, manga symbols or large body movement. Keep costume and silhouette pixel-consistent with the reference.
```

### `V18-EX-04` · relaxed

- 正式图：`game/public/assets/sprites/swordheart/expression-relaxed-v1.webp`

```text
Edit Input Image 1 in place as a transparent full-body visual-novel sprite. Preserve Swordheart's exact identity, pale-blue hair, red eyes, white-blue jacket, tactical outfit, sheathed sword, original pose, framing, lighting and alpha canvas. Change only the facial acting to visibly relaxed: softened eyes, released brow tension and a small closed-mouth smile that feels rare but natural. No broad grin and no new gesture. Keep the entire body, costume, prop and transparency unchanged.
```

---

## 华月乌大王 `huayue`

输入参考：`game/public/assets/sprites/huayue/base-neutral-v1.webp`

### `V18-EX-05` · shy

- 正式图：`game/public/assets/sprites/huayue/expression-shy-v1.webp`

```text
Edit Input Image 1 in place as a transparent full-body visual-novel sprite. Preserve Huayue's exact mature face, ash-lilac short hair with low side tie, cyan-blue eyes, blue cat-ear hair ornaments, cat clip, pearly ties, ivory long blazer with blue trim, pale blue hoodie, navy asymmetric skirt-shorts, black tights, navy boots, original pose, framing, lighting and alpha canvas. Change only the face to tired restrained shyness: faint blush, softened eyes, lips pressed into a tiny uncertain smile, gaze slightly aside. Keep her competent adult presence; no cutesy cat expression. No background or new prop.
```

### `V18-EX-06` · serious

- 正式图：`game/public/assets/sprites/huayue/expression-serious-v1.webp`

```text
Edit Input Image 1 in place as a transparent full-body visual-novel sprite. Preserve Huayue's exact identity, cat-themed accessories, ivory-blue layered outfit, original body pose, framing, light and alpha canvas. Change only the facial acting to clear private seriousness: direct cyan gaze, slightly focused brows, neutral mouth, tired but honest rather than angry or managerial. Keep hair, costume, hands, silhouette and transparency unchanged.
```

### `V18-EX-07` · surprised

- 正式图：`game/public/assets/sprites/huayue/expression-surprised-v1.webp`

```text
Edit Input Image 1 in place as a transparent full-body visual-novel sprite. Preserve Huayue's exact identity, ash-lilac side-tied hair, cyan eyes, cat accessories, ivory-blue outfit, pose, framing, light and transparent canvas. Change only the face to startled relief: eyes naturally widened, brows raised, lips slightly parted, as if an unexpected kind answer interrupted her checklist. No comic symbols, open-mouth shout, body jump or accessory movement.
```

### `V18-EX-08` · relaxed

- 正式图：`game/public/assets/sprites/huayue/expression-relaxed-v1.webp`

```text
Edit Input Image 1 in place as a transparent full-body visual-novel sprite. Preserve Huayue's exact identity, hairstyle, cat accessories, outfit, original pose, framing, lighting and alpha canvas. Change only the face to off-duty relaxation: softened cyan eyes, released brow tension and a modest closed-mouth smile with lingering tiredness. Avoid a broad grin or childish catlike pose. Keep all non-facial pixels and transparency as close to the reference as possible.
```

---

## yyT `yyt`

输入参考：`game/public/assets/sprites/yyt/base-neutral-v1.webp`

### `V18-EX-09` · shy

- 正式图：`game/public/assets/sprites/yyt/expression-shy-v1.webp`

```text
Edit Input Image 1 in place as a transparent full-body visual-novel sprite. Preserve yyT's exact mature face, very long silver-gray hair with purple underlayer, violet eyes, long black asymmetric coat with vivid purple piping, round gold insignia, pale gray high-neck top, black trousers, blank waist ID cards, high lace-up boots, original pose, framing, lighting and alpha canvas. Change only the face to guarded shyness: a subtle blush, gaze shifted a few degrees aside, brows still confident, mouth in a restrained almost-smile. She must still look intellectually formidable, not submissive or childish.
```

### `V18-EX-10` · serious

- 正式图：`game/public/assets/sprites/yyt/expression-serious-v1.webp`

```text
Edit Input Image 1 in place as a transparent full-body visual-novel sprite. Preserve yyT's exact identity, silver-purple hair, violet eyes, black-purple coat, gold insignia, original pose, framing, lighting and alpha canvas. Change only the facial acting to attentive seriousness: direct analytical gaze, focused but relaxed brows, neutral mouth, no anger and no attack posture. Keep body, costume, cards, hands and transparency unchanged.
```

### `V18-EX-11` · surprised

- 正式图：`game/public/assets/sprites/yyt/expression-surprised-v1.webp`

```text
Edit Input Image 1 in place as a transparent full-body visual-novel sprite. Preserve yyT's exact identity, outfit, pose, framing, lighting and transparent canvas. Change only the face to controlled surprise: violet eyes widened slightly, brows lifted, lips parted just enough to show her argument has paused. Do not make her frightened, defeated, tearful or comedic. Keep every non-facial design anchor unchanged.
```

### `V18-EX-12` · relaxed

- 正式图：`game/public/assets/sprites/yyt/expression-relaxed-v1.webp`

```text
Edit Input Image 1 in place as a transparent full-body visual-novel sprite. Preserve yyT's exact identity, silver-gray purple-layered hair, black-purple coat, original pose, framing, lighting and alpha canvas. Change only the facial acting to relaxed mutual respect: softened violet eyes, easy brows and a small knowing half-smile, still sharp and self-possessed. No broad grin, surrender pose or new gesture. Keep costume and transparency unchanged.
```

---

## AVUCII `avucii`

输入参考：`game/public/assets/sprites/avucii/base-neutral-v1.webp`

### `V18-EX-13` · shy

- 正式图：`game/public/assets/sprites/avucii/expression-shy-v1.webp`

```text
Edit Input Image 1 in place as a transparent full-body visual-novel sprite. Preserve AVUCII's exact mature sharp androgynous face, short silver-lilac hair with violet-blue tips, purple eyes, fitted dark navy long-tailed coat with purple and bright-blue piping, white pleated shirt, dark trousers, black combat boots, round insignia, white waist task cards, original pose, framing, lighting and alpha canvas. Change only the face to restrained shyness: a faint blush, slightly softened gaze and tiny uncertain closed-mouth smile. Do not feminize, masculinize, lengthen the hair or make the character childish.
```

### `V18-EX-14` · serious

- 正式图：`game/public/assets/sprites/avucii/expression-serious-v1.webp`

```text
Edit Input Image 1 in place as a transparent full-body visual-novel sprite. Preserve AVUCII's exact androgynous identity, short tipped hair, purple eyes, navy-purple-blue long-tail outfit, original pose, framing, lighting and alpha canvas. Change only the facial acting to quiet seriousness: direct gaze, focused brows, neutral closed mouth, visible fatigue but no anger or command posture. Keep all body, costume, task cards, hands and transparency unchanged.
```

### `V18-EX-15` · surprised

- 正式图：`game/public/assets/sprites/avucii/expression-surprised-v1.webp`

```text
Edit Input Image 1 in place as a transparent full-body visual-novel sprite. Preserve AVUCII's exact androgynous identity, short silver-lilac blue-tipped hair, purple eyes, tailored outfit, original pose, framing, lighting and alpha canvas. Change only the face to contained surprise: eyes slightly widened, brows lifted and lips just parted, as if an unexpected offer interrupted a handoff. No body recoil, comic symbols, panic or gender redesign.
```

### `V18-EX-16` · relaxed

- 正式图：`game/public/assets/sprites/avucii/expression-relaxed-v1.webp`

```text
Edit Input Image 1 in place as a transparent full-body visual-novel sprite. Preserve AVUCII's exact androgynous identity, hairstyle, purple eyes, navy-purple-blue outfit, original pose, framing, lighting and alpha canvas. Change only the facial acting to off-duty relaxation: softened eyes, released brow tension and a very small warm closed-mouth smile. Maintain mature sharp features and practical composure. Keep all non-facial pixels and transparency as close to the reference as possible.
```

## 验收清单

- [ ] 16 个提示词编号与正式文件名一一对应。
- [ ] 图片保持透明背景，alpha 边缘无白边、黑边或毛刺。
- [ ] 画布、人物脚底锚点和缩放与各自基础立绘一致，切换表情时人物不跳位。
- [ ] 服装、发型、瞳色、饰品、手部和身体姿势没有重绘漂移。
- [ ] 四种表情可在手机宽度下清晰区分，又不依赖漫画符号或夸张变形。
- [ ] WebP 解码有效；文件建议不超过 300 KiB，且保留 alpha。
