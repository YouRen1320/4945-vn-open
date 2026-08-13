# v1.8 告白 CG 生产提示词

## 统一交付标准

- 当前目录中已有的 4 张 `shana / qifu / chenyi / swordheart` source PNG 只作为历史候选参考，尚未验收，不能直接视为正式素材；仍建议按本文件交由外部模型重做或复核。
- 用途：移动端优先 Web Galgame 的告白前停顿 CG；先出 16:9 横图，再由封装脚本输出 1600×900 WebP。
- 构图：角色脸部置于横向 40–60%、纵向 18–42%；关键手势与道具置于横向 36–64%、纵向 28–58%。底部 30% 保持低细节和偏暗，供对白与选择 UI 使用。
- 人物：只出现一名完整可见角色；玩家只能以一只自然的第一人称手或衣袖暗示，不出现第二张完整脸。
- 画风：高级原创日系商业 Galgame；成熟青年比例、干净线稿、细腻赛璐璐上色、克制表演；无文字、无标识、无水印、无现有作品角色。
- 叙事：画面发生在答案按下前，不能把“接受”或“拒绝”画成既定事实。

---

## 01. `shana`／夏娜 · 属于自己的决定

- 提示词编号：`V18-CG-01`
- CG ID：`cg66-romance-shana-confession`
- 原图：`romance-shana-confession-v1-source.png`
- 正式图：`game/public/assets/cg/romance-shana-confession-v1.webp`
- 角色参考：`game/public/assets/sprites/shana/base-neutral-v1.webp`
- 风格与身份参考：`game/public/assets/cg/romance-shana-first-date-v1.webp`
- 场景参考：`game/public/assets/backgrounds/galgame/romance-lantern-bridge-v1.webp`

```text
Use case: stylized-concept
Asset type: premium confession event CG for a mobile-first web visual novel
Input images: Image 1 is Shana's exact identity and outfit reference; Image 2 is the finished first-date CG that establishes her visual language; Image 3 is the Eastern-fantasy lantern bridge environment reference. Generate a new illustration from these references; do not edit any source image.
Primary request: Create one original 16:9 landscape confession CG in the pause before an answer. The same mature young-adult woman from Image 1 stands at a small firework platform beside the lantern bridge. The last spell-card firework is dissolving above the river. She has deliberately turned a tiny blank decision slip face-down on the railing and gently offers the player one unlit sparkler, making clear that this feeling is her own private choice, not an organization vote. Her expression is composed but unmistakably vulnerable, looking directly toward the first-person player.
Scene/backdrop: Preserve Image 3's moonlit bridge, river lanterns, deep blue-plum night and warm amber light; add one restrained burst of abstract pink-gold spell-card fireworks reflected in water.
Subject invariants: Preserve her exact face, very long dusty-magenta hair, red-magenta eyes, paired gold diamond hairpins, navy cropped jacket with dusty-pink trim, ivory high-neck ribbed top, asymmetric navy/plum skirt panels, dark shorts, gold diamond belt chain and dark ankle boots.
Style/medium: premium original Japanese commercial galgame anime event illustration; mature young-adult proportions; elegant linework; polished cel shading; restrained intimate acting.
Composition/framing: intimate three-quarter medium shot, full 16:9 landscape. Keep face x=46–56%, y=18–38%; sparkler, face-down blank decision slip and offering hand x=38–62%, y=30–57%. Center portrait crop must retain face and the unlit sparkler. Reserve bottom 30% as quiet dark river and railing shadow for dialogue UI.
Lighting/mood: moon-blue and plum night with subdued amber lanterns and pink-gold firework reflections; sincere, private, a little dryly funny.
Text rule: no readable text; the decision slip remains completely blank and face-down.
Constraints: exactly one fully visible character; one unlit sparkler offered to the player; one small blank face-down decision slip; anatomically correct hands; no result implied.
Avoid: acceptance gesture, wedding imagery, ring, second complete person, bright phone screen, ballot box, readable text, logo, watermark, costume drift, school uniform, childish proportions, photorealism, 3D render, bright or cluttered bottom 30%.
```

---

## 02. `qifu`／祈福 · 不靠权限的挽留

- 提示词编号：`V18-CG-02`
- CG ID：`cg67-romance-qifu-confession`
- 原图：`romance-qifu-confession-v1-source.png`
- 正式图：`game/public/assets/cg/romance-qifu-confession-v1.webp`
- 角色参考：`game/public/assets/sprites/qifu/base-neutral-v1.webp`
- 风格与身份参考：`game/public/assets/cg/romance-qifu-first-date-v1.webp`
- 场景参考：`game/public/assets/backgrounds/galgame/romance-gate-v1.webp`

```text
Use case: stylized-concept
Asset type: premium confession event CG for a mobile-first web visual novel
Input images: Image 1 is Qifu's exact identity and outfit reference; Image 2 is his finished first-date CG visual reference; Image 3 is the Eastern-fantasy moon-gate environment reference. Generate a new illustration from these references; do not edit any source image.
Primary request: Create one original 16:9 landscape confession CG in the pause before an answer. The same mature young-adult man from Image 1 stands just outside a quiet torii-like moon gate. Behind him, a formal administrator badge has been set down inside the gate, out of reach. With both gloved hands he presents one plain private omamori charm to the first-person player, not yet letting go. He is calm but visibly waiting for consent; the choice is personal rather than an announcement.
Scene/backdrop: Preserve Image 3's circular moon gate, traditional roof silhouettes, blossoms, deep indigo night and small warm lanterns. The interior of the gate is slightly cooler and formal; the space outside is warmer and private.
Subject invariants: Preserve his exact face, tousled black hair, violet eyes, long charcoal-navy coat with violet piping and diamond ornaments, pale high-neck shirt, dark gloves, black trousers, dark boots and slim black folder.
Style/medium: premium original Japanese commercial galgame anime event illustration; mature young-adult proportions; clean elegant linework; polished cel shading; restrained intimate acting.
Composition/framing: quiet medium shot, full 16:9 landscape. Keep face x=46–56%, y=18–40%; both hands and plain omamori x=40–60%, y=30–56%; the abandoned badge remains visible just behind his shoulder. Center portrait crop retains face, charm and the formal badge contrast. Reserve bottom 30% as dark stone path and soft shadow for dialogue UI.
Lighting/mood: deep navy, violet and warm amber; tender resolve without grand ceremony.
Text rule: no readable text, symbols or administrative labels on badge or charm.
Constraints: exactly one fully visible character; one plain omamori offered but not released; one formal badge placed away behind him; anatomically correct gloved hands; no answer implied.
Avoid: crown, ring, kneeling proposal, second full person, readable text, glowing phone, logo, watermark, costume drift, generic school uniform, childish proportions, photorealism, 3D render, bright or cluttered bottom 30%.
```

---

## 03. `chenyi`／辰逸 · 不要求立即回复

- 提示词编号：`V18-CG-03`
- CG ID：`cg68-romance-chenyi-confession`
- 原图：`romance-chenyi-confession-v1-source.png`
- 正式图：`game/public/assets/cg/romance-chenyi-confession-v1.webp`
- 角色参考：`game/public/assets/sprites/chenyi/base-neutral-v1.webp`
- 风格与身份参考：`game/public/assets/cg/romance-chenyi-first-date-v1.webp`
- 场景参考：`game/public/assets/backgrounds/galgame/romance-lantern-bridge-v1.webp`

```text
Use case: stylized-concept
Asset type: premium confession event CG for a mobile-first web visual novel
Input images: Image 1 is Chenyi's exact identity and outfit reference; Image 2 is his finished first-date CG visual reference; Image 3 is the Eastern-fantasy lantern bridge environment reference. Generate a new illustration from these references; do not edit any source image.
Primary request: Create one original 16:9 landscape confession CG in the pause before an answer. The same mature young-adult man from Image 1 stands beside a stone echo well near the lantern bridge. He has placed one sealed blank letter on the well rim and taken one respectful step back, leaving both hands open and empty. His phone is visibly tucked screen-in and inactive in a pocket; he looks toward the first-person player with nervous accountability, making it clear that the message does not demand an immediate response.
Scene/backdrop: Preserve Image 3's moonlit bridge, water, lanterns, traditional roof silhouettes and calm deep blue night. Add a small stone echo well with faint circular ripple light, not a modern mailbox.
Subject invariants: Preserve his exact face, short spiky golden-blond hair, amber-brown eyes, navy cropped jacket with gold piping and diamond badge, cream T-shirt, charcoal cargo trousers, black-and-gold belt detail and black high-top shoes with gold accents.
Style/medium: premium original Japanese commercial galgame anime event illustration; mature young-adult proportions; clean elegant linework; polished cel shading; restrained intimate acting.
Composition/framing: three-quarter medium shot, full 16:9 landscape. Keep face x=46–56%, y=18–40%; sealed blank letter, open hands and inactive pocket x=38–62%, y=30–58%. Center portrait crop retains face, open hands and the letter. Reserve bottom 30% as dark water, well shadow and stone ground for dialogue UI.
Lighting/mood: blue-plum night, low amber lanterns, a soft echo-ring reflection; sincere accountability, no melodrama.
Text rule: no readable text, notification, address, seal wording or phone screen.
Constraints: exactly one fully visible character; one sealed blank letter resting on the well; phone inactive and screen-in; both visible hands naturally open; no answer implied.
Avoid: reading phone, chasing the player, kneeling, second full person, bright notification, readable letter, logo, watermark, costume drift, generic school uniform, childish proportions, photorealism, 3D render, bright or cluttered bottom 30%.
```

---

## 04. `swordheart`／剑斩凡人心 · 职责以外的上线

- 提示词编号：`V18-CG-04`
- CG ID：`cg69-romance-swordheart-confession`
- 原图：`romance-swordheart-confession-v1-source.png`
- 正式图：`game/public/assets/cg/romance-swordheart-confession-v1.webp`
- 角色参考：`game/public/assets/sprites/swordheart/base-neutral-v1.webp`
- 风格与身份参考：`game/public/assets/cg/romance-swordheart-first-date-v1.webp`
- 场景参考：`game/public/assets/backgrounds/galgame/romance-lantern-bridge-v1.webp`

```text
Use case: stylized-concept
Asset type: premium confession event CG for a mobile-first web visual novel
Input images: Image 1 is Swordheart's exact identity and outfit reference; Image 2 is her finished first-date CG visual reference; Image 3 is the Eastern-fantasy lantern bridge environment reference. Generate a new illustration from these references; do not edit any source image.
Primary request: Create one original 16:9 landscape confession CG in the pause before an answer. The same mature young-adult woman from Image 1 stands on a quiet night patrol bridge. Her sheathed sword rests safely at her side. She has just closed a small duty ledger and laid it face-down on the bridge rail; beside it is one unused reward token. Instead of presenting a task, she holds out a simple two-person night-walk ticket with an empty reverse side, waiting calmly for the first-person player's response. Her expression is steady, a little shy, and free of command authority.
Scene/backdrop: Preserve Image 3's full moon, curved bridge, slow river lanterns, dark rooftops and blue-violet night. Add restrained patrol lanterns along the rail; no busy crowd.
Subject invariants: Preserve her exact face, very long pale-blue hair, red eyes, white long hooded jacket with clear blue trim and diamond badge, dark charcoal high-neck top, black tactical trousers, blue-black boots, gold watch charm and sheathed dark sword with blue accents.
Style/medium: premium original Japanese commercial galgame anime event illustration; mature young-adult proportions; clean elegant linework; polished cel shading; restrained intimate acting.
Composition/framing: intimate three-quarter medium shot, full 16:9 landscape. Keep face x=46–56%, y=18–40%; face-down ledger, unused reward token and ticket-holding hand x=38–62%, y=30–58%. Center portrait crop retains face, ticket and the choice to leave work behind. Reserve bottom 30% as dark bridge floor and river reflection for dialogue UI.
Lighting/mood: cool moon blue with sparse warm patrol lanterns; quiet discipline becoming private courage.
Text rule: no readable text, numbers or reward labels; ticket reverse remains blank.
Constraints: exactly one fully visible character; sheathed sword, one closed face-down ledger, one unused token and one blank-backed two-person ticket; anatomically correct hands; no answer implied.
Avoid: combat stance, drawn sword, saluting, ring, second full person, readable ledger, logo, watermark, costume drift, school uniform, childish proportions, photorealism, 3D render, bright or cluttered bottom 30%.
```

---

## 05. `heartbeat`／心跳成瘾 · 没有 KPI 的位置

- 提示词编号：`V18-CG-05`
- CG ID：`cg70-romance-heartbeat-confession`
- 原图：`romance-heartbeat-confession-v1-source.png`
- 正式图：`game/public/assets/cg/romance-heartbeat-confession-v1.webp`
- 角色参考：`game/public/assets/sprites/heartbeat/base-neutral-v1.webp`
- 风格与身份参考：`game/public/assets/cg/romance-heartbeat-first-date-v1.webp`
- 场景参考：`game/public/assets/backgrounds/galgame/romance-lantern-bridge-v1.webp`

```text
Use case: stylized-concept
Asset type: premium confession event CG for a mobile-first web visual novel
Input images: Image 1 is Heartbeat's exact identity and outfit reference; Image 2 is her finished first-date CG visual reference; Image 3 is the Eastern-fantasy lantern bridge reference. Generate a new illustration from these references; do not edit any source image.
Primary request: Create one original 16:9 landscape confession CG in the pause before an answer. The same mature young-adult woman from Image 1 stands beside a blank recruitment board whose printed side has been turned completely toward the wall. She has removed every counter, chart and quota tag. In her open palm rests one plain unnumbered place token, offered toward the first-person player but not yet released. A closed clipboard lies well away on the bridge rail. Her usual energetic confidence is quiet and vulnerable: she wants to reserve a personal place, not fill a roster.
Scene/backdrop: Preserve Image 3's arched bridge, river lanterns, moonlit rooftops and deep blue-plum night. Most market stalls are closing; retain restrained amber and dusty-pink reflections.
Subject invariants: Preserve her exact face, very long honey-blonde hair, blue eyes, silver snowflake-star hair ornament with red bead chains, navy fitted jacket with dusty-pink trim, black high-neck blouse, red-and-white bead necklace, asymmetric navy/plum skirt panels, dark shorts and tights, gold belt charm and dark ankle boots.
Style/medium: premium original Japanese commercial galgame anime event illustration; mature young-adult proportions; elegant linework; polished cel shading; restrained intimate acting.
Composition/framing: intimate three-quarter medium shot, full 16:9. Keep face x=46–56%, y=18–40%; open palm, unnumbered token and turned-away board x=38–62%, y=30–58%. Center portrait crop retains face, token and blank board edge. Reserve bottom 30% as quiet dark river and bridge shadow for dialogue UI.
Lighting/mood: deep navy and plum with low amber lanterns; private sincerity after comic over-optimization.
Text rule: no readable text, numbers, charts, QR codes or organization symbols; the visible board surface is blank.
Constraints: exactly one fully visible character; one plain unnumbered token; one blank turned-around board; one closed ignored clipboard; anatomically correct open hand; no answer implied.
Avoid: KPI dashboard, recruitment crowd, acceptance gesture, ring, second full person, readable text, logo, watermark, costume drift, childish proportions, photorealism, 3D render, bright or cluttered bottom 30%.
```

---

## 06. `yanqiu`／砚秋水 · 账本之外的一栏

- 提示词编号：`V18-CG-06`
- CG ID：`cg71-romance-yanqiu-confession`
- 原图：`romance-yanqiu-confession-v1-source.png`
- 正式图：`game/public/assets/cg/romance-yanqiu-confession-v1.webp`
- 角色参考：`game/public/assets/sprites/yanqiu/base-neutral-v1.webp`
- 风格与身份参考：`game/public/assets/cg/romance-yanqiu-first-date-v1.webp`
- 场景参考：`game/public/assets/backgrounds/galgame/romance-lantern-bridge-v1.webp`

```text
Use case: stylized-concept
Asset type: premium confession event CG for a mobile-first web visual novel
Input images: Image 1 is Yanqiu's exact identity and outfit reference; Image 2 is her finished first-date CG visual reference; Image 3 is the Eastern-fantasy lantern bridge reference. Generate a new illustration from these references; do not edit any source image.
Primary request: Create one original 16:9 landscape confession CG in the pause before an answer. The same mature young-adult woman from Image 1 stands at the river-lantern bridge with her thick rulebook closed. Beside it lies one completely blank loose page outside the binding. She holds a capped pen horizontally between relaxed fingers and leaves the page untouched, looking toward the first-person player with thoughtful courage. The empty page represents a relationship that can be revised together, but no clause or answer has been written.
Scene/backdrop: Preserve Image 3's full moon, arched bridge, river lanterns, willow silhouettes and deep blue night, with restrained warm amber light.
Subject invariants: Preserve her exact face, very long honey-blonde hair, amber-gold eyes, wide straw hat with white lilies, green leaves and long white ribbons, ivory long coat with gold trim, pale blue belted dress, round blue brooch, brown ankle boots and dark brown rulebook.
Style/medium: premium original Japanese commercial galgame anime event illustration; mature young-adult proportions; elegant linework; polished cel shading; restrained intimate acting.
Composition/framing: intimate medium shot, full 16:9. Keep face x=46–56%, y=18–40%; blank loose page, capped pen and closed rulebook x=38–62%, y=30–58%. Center portrait crop retains face and all three objects. Reserve bottom 30% as quiet dark bridge floor and river reflection for dialogue UI.
Lighting/mood: moon-blue, ivory and muted amber; considered trust, procedural humor and honest uncertainty.
Text rule: no readable text, signatures, stamps, lines or checkboxes; the loose page is visibly blank.
Constraints: exactly one fully visible character; one closed book, one blank loose page, one capped pen; no writing or signing action; anatomically correct hands; no answer implied.
Avoid: contract signing, stamping, courtroom imagery, ring, second full person, readable text, logo, watermark, missing flower hat, costume drift, childish proportions, photorealism, 3D render, bright or cluttered bottom 30%.
```

---

## 07. `huayue`／华月乌大王 · 与职位无关的同行

- 提示词编号：`V18-CG-07`
- CG ID：`cg72-romance-huayue-confession`
- 原图：`romance-huayue-confession-v1-source.png`
- 正式图：`game/public/assets/cg/romance-huayue-confession-v1.webp`
- 角色参考：`game/public/assets/sprites/huayue/base-neutral-v1.webp`
- 风格与身份参考：`game/public/assets/cg/romance-huayue-first-date-v1.webp`
- 场景参考：`game/public/assets/backgrounds/galgame/romance-lantern-bridge-v1.webp`

```text
Use case: stylized-concept
Asset type: premium confession event CG for a mobile-first web visual novel
Input images: Image 1 is Huayue's exact identity and outfit reference; Image 2 is her finished first-date CG visual reference; Image 3 is the Eastern-fantasy lantern bridge reference. Generate a new illustration from these references; do not edit any source image.
Primary request: Create one original 16:9 landscape confession CG in the pause before an answer. The same mature young-adult woman from Image 1 stands at an unmanned night-duty desk beside the bridge. Her leader badge and a closed checklist lie together on the far side of the desk. Both of her hands are visible and empty; one trembles very slightly while the other rests nearby without hiding it. She looks directly toward the first-person player, asking to be seen after the work is done rather than offering a rank or handing over responsibility.
Scene/backdrop: Preserve Image 3's moonlit bridge and river lanterns, but add a small closed duty booth with its task lamps switched off. No crowd and no active work screen.
Subject invariants: Preserve her exact face, ash-lilac short hair with low side tie, cyan-blue eyes, blue cat-ear-shaped hair ornaments, cat hair clip, pearly hair ties, ivory long blazer with blue trim, pale blue hoodie, navy asymmetric skirt-shorts, black tights, navy ankle boots and small cat motifs.
Style/medium: premium original Japanese commercial galgame anime event illustration; mature young-adult proportions; elegant linework; polished cel shading; restrained intimate acting.
Composition/framing: intimate seated or leaning medium shot, full 16:9. Keep face x=46–56%, y=18–40%; both empty hands, leader badge and closed checklist x=38–62%, y=30–58%. Center portrait crop retains face, visible trembling hand and set-aside badge. Reserve bottom 30% as dark counter and bridge shadow for dialogue UI.
Lighting/mood: cool moon blue, low amber booth light and pale cyan highlights; exhausted honesty without melodrama.
Text rule: no readable text, task rows or organization marks; badge uses only an abstract geometric emblem.
Constraints: exactly one fully visible character; both hands visible and empty; one badge and one closed checklist clearly set aside; no handoff action; no answer implied.
Avoid: working on forms, passing authority to the player, medical emergency, crying breakdown, ring, second full person, readable text, logo, watermark, missing cat accessories, costume drift, childish proportions, photorealism, 3D render, bright or cluttered bottom 30%.
```

---

## 08. `wenxian`／温陷 · 只留给你的欢迎回来

- 提示词编号：`V18-CG-08`
- CG ID：`cg73-romance-wenxian-confession`
- 原图：`romance-wenxian-confession-v1-source.png`
- 正式图：`game/public/assets/cg/romance-wenxian-confession-v1.webp`
- 角色参考：`game/public/assets/sprites/wenxian/base-neutral-v1.webp`
- 风格与身份参考：`game/public/assets/cg/romance-wenxian-first-date-v1.webp`
- 场景参考：`game/public/assets/backgrounds/galgame/romance-lantern-bridge-v1.webp`

```text
Use case: stylized-concept
Asset type: premium confession event CG for a mobile-first web visual novel
Input images: Image 1 is Wenxian's exact identity and outfit reference; Image 2 is her finished first-date CG visual reference; Image 3 is the Eastern-fantasy lantern bridge reference. Generate a new illustration from these references; do not edit any source image.
Primary request: Create one original 16:9 landscape confession CG in the pause before an answer. The same mature young-adult woman from Image 1 stands beside the last illuminated flower lantern after the shops have closed. She shields one small blank personal lantern with both hands but has not released it. All recruitment banners and headcount boards are absent. She looks toward the first-person player with a quiet hopeful smile, making the welcome personal without presuming that the player will stay.
Scene/backdrop: Preserve Image 3's full moon, arched bridge, river, willow branches and traditional buildings. Dim all but the last nearby lantern and a few distant river lights.
Subject invariants: Preserve her exact face, long wavy silver-white hair with side ponytail, pink-magenta eyes, dark plum flower ornament, tassel and crossed hairpin, navy long floral coat-dress with dusty-magenta piping and blossom patterns, ivory high-neck ribbed blouse, black tights, ankle boots and decorated book.
Style/medium: premium original Japanese commercial galgame anime event illustration; mature young-adult proportions; elegant linework; polished cel shading; restrained intimate acting.
Composition/framing: intimate medium shot, full 16:9. Keep face x=46–56%, y=18–40%; both hands and one blank flower lantern x=40–60%, y=30–56%. Center portrait crop retains face and lantern. Reserve bottom 30% as dark water and soft bridge shadow for dialogue UI.
Lighting/mood: deep navy moonlight, one warm amber-pink lantern and restrained reflections; fragile hope, no organizational triumph.
Text rule: no readable text, name, member count or recruitment symbol; lantern remains blank except abstract floral texture.
Constraints: exactly one fully visible character; exactly one foreground personal lantern held but not released; anatomically correct protecting hands; no answer implied.
Avoid: recruitment crowd, many foreground lanterns, organization banner, acceptance embrace, ring, second full person, readable text, logo, watermark, missing floral ornament, costume drift, childish proportions, photorealism, 3D render, bright or cluttered bottom 30%.
```

---

## 09. `takemehand`／takemehand · 不是成员身份

- 提示词编号：`V18-CG-09`
- CG ID：`cg74-romance-takemehand-confession`
- 原图：`romance-takemehand-confession-v1-source.png`
- 正式图：`game/public/assets/cg/romance-takemehand-confession-v1.webp`
- 角色参考：`game/public/assets/sprites/takemehand/base-neutral-v1.webp`
- 风格与身份参考：`game/public/assets/cg/romance-takemehand-first-date-v1.webp`
- 场景参考：`game/public/assets/backgrounds/galgame/romance-gate-v1.webp`

```text
Use case: stylized-concept
Asset type: premium confession event CG for a mobile-first web visual novel
Input images: Image 1 is takemehand's exact identity and outfit reference; Image 2 is her finished first-date CG visual reference; Image 3 is the Eastern-fantasy moon-gate reference. Generate a new illustration from these references; do not edit any source image.
Primary request: Create one original 16:9 landscape confession CG in the pause before an answer. The same mature young-adult woman from Image 1 waits beneath a silent bell tower just outside the moon gate. One small bell cord hangs between her and the first-person player, untouched; a two-minute sand timer has finished, but she has not rung again or checked a phone. With her hands relaxed and away from every control, she looks toward the player and offers patient trust instead of demanding an immediate response.
Scene/backdrop: Preserve Image 3's circular moon gate, stone path, blossoms, tiled roofs and deep indigo night. Add a restrained wooden bell tower and one small empty sand timer; no modern interface.
Subject invariants: Preserve her exact face, very long pale blush-white hair, magenta eyes, large pink floral bow and ribbons, white long-tailed coat with gold and pink trim, dusty-rose ribbed turtleneck, burgundy shorts, white thigh-high stockings, white-pink ankle boots, gold waist ornaments and sheathed short sword.
Style/medium: premium original Japanese commercial galgame anime event illustration; mature young-adult proportions; elegant linework; polished cel shading; restrained intimate acting.
Composition/framing: intimate three-quarter medium shot, full 16:9. Keep face x=46–56%, y=18–40%; relaxed hands, untouched bell cord and empty sand timer x=38–62%, y=30–58%. Center portrait crop retains all three. Reserve bottom 30% as dark stone path for dialogue UI.
Lighting/mood: deep navy and dusty rose with low amber lanterns; patience, consent and soft vulnerability.
Text rule: no readable text, notification icon, timer number or platform UI.
Constraints: exactly one fully visible character; one untouched bell cord; one empty sand timer; both hands visibly away from controls; sheathed sword; no answer implied.
Avoid: ringing repeatedly, checking a phone, grabbing the player, drawn sword, ring, second full person, readable text, logo, watermark, costume drift, childish proportions, photorealism, 3D render, bright or cluttered bottom 30%.
```

---

## 10. `xilufei`／希露菲 · 私聊里不装陌生

- 提示词编号：`V18-CG-10`
- CG ID：`cg75-romance-xilufei-confession`
- 原图：`romance-xilufei-confession-v1-source.png`
- 正式图：`game/public/assets/cg/romance-xilufei-confession-v1.webp`
- 角色参考：`game/public/assets/sprites/xilufei/base-neutral-v1.webp`
- 风格与身份参考：`game/public/assets/cg/romance-xilufei-first-date-v1.webp`
- 场景参考：`game/public/assets/backgrounds/galgame/romance-gate-v1.webp`

```text
Use case: stylized-concept
Asset type: premium confession event CG for a mobile-first web visual novel
Input images: Image 1 is Xilufei's exact identity and outfit reference; Image 2 is his finished first-date CG visual reference; Image 3 is the Eastern-fantasy moon-gate reference. Generate a new illustration from these references; do not edit any source image.
Primary request: Create one original 16:9 landscape confession CG in the pause before an answer. The same mature young-adult man from Image 1 stands at a quiet symbolic server boundary beyond the moon gate. Two completely blank identity cards rest in his hands: one held openly toward the first-person player and one face-down against his own palm. His fox mask and harmless administrator token have been set aside behind him. His mischievous expression has softened into sincere uncertainty about whether the next shared identity can be real.
Scene/backdrop: Preserve Image 3's moon gate, stone steps, blossoms and deep blue night. Add a subtle abstract boundary of fading violet-blue light beyond the gate, never a literal computer screen.
Subject invariants: Preserve his exact masculine face, short warm-brown hair with one ahoge, green eyes, dark brown-black blazer with teal piping and key pin, charcoal waistcoat, open-collar white shirt, loose black tie or lanyard badge, black trousers, belt chain and dark lace-up boots. Do not feminize him.
Style/medium: premium original Japanese commercial galgame anime event illustration; mature young-adult proportions; elegant linework; polished cel shading; restrained intimate acting.
Composition/framing: intimate standing medium shot, full 16:9. Keep face x=46–56%, y=18–40%; two blank cards and natural hands x=38–62%, y=30–58%; set-aside mask visible behind one shoulder. Center portrait crop retains face, cards and mask. Reserve bottom 30% as dark stone path and boundary glow for dialogue UI.
Lighting/mood: deep navy, teal-violet and low amber; playful history giving way to honest risk.
Text rule: no readable text, username, QR code, platform UI or logo; both cards are fully blank.
Constraints: exactly one fully visible masculine character; exactly two blank identity cards; one removed fox mask and one set-aside token; anatomically correct hands; no answer implied.
Avoid: female redesign, long hair, wearing the mask, hacking interface, kicking users, ring, second full person, readable text, logo, watermark, costume drift, childish proportions, photorealism, 3D render, bright or cluttered bottom 30%.
```

---

## 11. `yyt`／yyT · 不同意时也喜欢

- 提示词编号：`V18-CG-11`
- CG ID：`cg76-romance-yyt-confession`
- 原图：`romance-yyt-confession-v1-source.png`
- 正式图：`game/public/assets/cg/romance-yyt-confession-v1.webp`
- 角色参考：`game/public/assets/sprites/yyt/base-neutral-v1.webp`
- 风格与身份参考：`game/public/assets/cg/romance-yyt-first-date-v1.webp`
- 场景参考：`game/public/assets/backgrounds/galgame/romance-lantern-bridge-v1.webp`

```text
Use case: stylized-concept
Asset type: premium confession event CG for a mobile-first web visual novel
Input images: Image 1 is yyT's exact identity and outfit reference; Image 2 is her finished first-date CG visual reference; Image 3 is the Eastern-fantasy lantern bridge reference. Generate a new illustration from these references; do not edit any source image.
Primary request: Create one original 16:9 landscape confession CG in the pause before an answer. The same mature young-adult woman from Image 1 holds an old charter turned backward so only its completely blank reverse is visible. In her other hand is one unlit violet spell card lowered in a non-combat position. She meets the first-person player's gaze with a challenging but vulnerable half-smile, asking whether disagreement can coexist with affection without surrendering her voice.
Scene/backdrop: Preserve Image 3's arched bridge, moon, river lanterns and deep blue-violet night. Add only a few harmless dissipating debate motes around the lowered card.
Subject invariants: Preserve her exact face, very long silver-gray hair with purple underlayer, violet eyes, long black asymmetric coat with vivid purple piping, round gold insignia, pale gray high-neck top, black trousers, belt-hung blank ID cards and black high lace-up boots.
Style/medium: premium original Japanese commercial galgame anime event illustration; mature young-adult proportions; elegant linework; polished cel shading; restrained intimate acting.
Composition/framing: confident intimate medium shot, full 16:9. Keep face x=46–56%, y=18–40%; blank charter reverse, lowered spell card and natural hands x=38–62%, y=30–58%. Center portrait crop retains face and both symbols. Reserve bottom 30% as dark bridge floor and river reflection for dialogue UI.
Lighting/mood: moon blue, vivid restrained violet and warm amber; intellectual friction, mutual respect and exposed uncertainty.
Text rule: no readable text, signature, law, political symbol or platform logo; charter reverse remains blank.
Constraints: exactly one fully visible character; one backward blank charter and one lowered unlit spell card; no signing, surrender or attack; anatomically correct hands; no answer implied.
Avoid: angry combat, romantic submission, acceptance embrace, ring, second full person, readable text, real political symbols, logo, watermark, costume drift, childish proportions, photorealism, 3D render, bright or cluttered bottom 30%.
```

---

## 12. `avucii`／AVUCII · 不是交接的最后一行

- 提示词编号：`V18-CG-12`
- CG ID：`cg77-romance-avucii-confession`
- 原图：`romance-avucii-confession-v1-source.png`
- 正式图：`game/public/assets/cg/romance-avucii-confession-v1.webp`
- 角色参考：`game/public/assets/sprites/avucii/base-neutral-v1.webp`
- 风格与身份参考：`game/public/assets/cg/romance-avucii-first-date-v1.webp`
- 场景参考：`game/public/assets/backgrounds/galgame/romance-lantern-bridge-v1.webp`

```text
Use case: stylized-concept
Asset type: premium confession event CG for a mobile-first web visual novel
Input images: Image 1 is AVUCII's exact identity and outfit reference; Image 2 is the finished first-date CG visual reference; Image 3 is the Eastern-fantasy lantern bridge reference. Generate a new illustration from these references; do not edit any source image.
Primary request: Create one original 16:9 landscape confession CG in the pause before an answer. The same mature, sharp androgynous young-adult character from Image 1 stands beside a closed night-duty counter near the bridge. A dark work tablet is closed and locked away. Between AVUCII and the first-person player rests one small blank final-line card held gently at its edges, not being handed over and not filed as a task. Their composed expression shows tired vulnerability: this is a personal invitation to walk tomorrow, not a transfer of responsibility.
Scene/backdrop: Preserve Image 3's moonlit bridge, river lanterns and deep blue-plum night. Add a neat closed lost-and-found counter with all compartments shut and lights off.
Subject invariants: Preserve the exact mature, sharp androgynous face; short silver-lilac hair with violet-blue tips; purple eyes; fitted dark navy long-tailed coat with purple and bright-blue piping; white pleated collared shirt; dark trousers; black combat boots; round insignia and white task cards at the waist. Do not lengthen the hair or redesign the presentation.
Style/medium: premium original Japanese commercial galgame anime event illustration; mature young-adult proportions; elegant linework; polished cel shading; restrained intimate acting.
Composition/framing: intimate standing medium shot, full 16:9. Keep face x=46–56%, y=18–40%; blank card, both hands and closed tablet x=38–62%, y=30–58%. Center portrait crop retains face, card and inactive work tools. Reserve bottom 30% as dark counter and bridge shadow for dialogue UI.
Lighting/mood: deep navy, muted violet-blue and low amber; practical care, fatigue and quiet courage.
Text rule: no readable text, task label, signature, checklist mark or platform UI; final-line card is fully blank.
Constraints: exactly one fully visible character; one blank card held but not transferred; one closed inactive tablet; closed compartments; anatomically correct hands; no answer implied.
Avoid: active work, handoff ceremony, signing a task, cluttered lost-property pile, ring, second full person, readable text, logo, watermark, long-hair redesign, costume drift, childish proportions, photorealism, 3D render, bright or cluttered bottom 30%.
```

## 预览拒收标准

- 手机中央裁切必须保留脸部与“尚未回答”的关键道具。
- 不得画出接受、情侣拥抱、戒指、婚礼或第二个完整人物。
- 角色服装、发型、眼睛与既有立绘的核心锚点不得漂移。
- 底部对白区不得压住脸、主手势、信物或关键选择道具。
