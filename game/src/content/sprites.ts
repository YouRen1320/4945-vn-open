import type { CharacterId, SpriteExpression, SpritePose } from '@/engine/types'
import { resolveManagedVisual, v18ExpressionVisuals } from '@/content/visualAssets'

interface SpriteCatalogEntry {
  anchor: string
  expressions: Partial<Record<SpriteExpression, string>>
  poses?: Partial<Record<SpritePose, string>>
}

const baseSprite = (id: string) => `/assets/sprites/${id}/base-neutral-v1.webp`

/**
 * The sprite catalog is the single identity source for full-size character art.
 * Chat avatars remain in characters.ts; visual-novel stages only read this map.
 */
export const spriteCatalog: Partial<Record<CharacterId, SpriteCatalogEntry>> = {
  shana: {
    anchor: baseSprite('shana'),
    expressions: {
      neutral: baseSprite('shana'),
      soft: '/assets/sprites/shana/expression-soft-v1.webp',
      smile: '/assets/sprites/shana/expression-smile-v1.webp',
      concerned: '/assets/sprites/shana/expression-concerned-v1.webp',
      determined: '/assets/sprites/shana/expression-determined-v1.webp',
      angry: '/assets/sprites/shana/expression-angry-v1.webp',
      sad: '/assets/sprites/shana/expression-sad-v1.webp',
      surprised: '/assets/sprites/shana/expression-surprised-v1.webp',
      shy: '/assets/sprites/shana/expression-soft-v1.webp',
      serious: '/assets/sprites/shana/expression-determined-v1.webp',
      relaxed: '/assets/sprites/shana/expression-smile-v1.webp',
    },
    poses: {
      base: baseSprite('shana'),
      phone: baseSprite('shana'),
    },
  },
  qifu: {
    anchor: baseSprite('qifu'),
    expressions: {
      neutral: baseSprite('qifu'),
      soft: '/assets/sprites/qifu/expression-soft-v1.webp',
      smile: '/assets/sprites/qifu/expression-smile-v1.webp',
      concerned: '/assets/sprites/qifu/expression-concerned-v1.webp',
      determined: '/assets/sprites/qifu/expression-determined-v1.webp',
      angry: '/assets/sprites/qifu/expression-angry-v1.webp',
      sad: '/assets/sprites/qifu/expression-sad-v1.webp',
      surprised: '/assets/sprites/qifu/expression-surprised-v1.webp',
      shy: '/assets/sprites/qifu/expression-soft-v1.webp',
      serious: '/assets/sprites/qifu/expression-determined-v1.webp',
      relaxed: '/assets/sprites/qifu/expression-smile-v1.webp',
    },
    poses: {
      base: baseSprite('qifu'),
    },
  },
  heartbeat: {
    anchor: baseSprite('heartbeat'),
    expressions: {
      neutral: baseSprite('heartbeat'),
      soft: '/assets/sprites/heartbeat/expression-soft-v1.webp',
      smile: '/assets/sprites/heartbeat/expression-smile-v1.webp',
      concerned: '/assets/sprites/heartbeat/expression-concerned-v1.webp',
      determined: '/assets/sprites/heartbeat/expression-determined-v1.webp',
      angry: '/assets/sprites/heartbeat/expression-angry-v1.webp',
      sad: '/assets/sprites/heartbeat/expression-sad-v1.webp',
      surprised: '/assets/sprites/heartbeat/expression-surprised-v1.webp',
      shy: '/assets/sprites/heartbeat/expression-soft-v1.webp',
      serious: '/assets/sprites/heartbeat/expression-determined-v1.webp',
      relaxed: '/assets/sprites/heartbeat/expression-smile-v1.webp',
    },
    poses: {
      base: baseSprite('heartbeat'),
      phone: baseSprite('heartbeat'),
    },
  },
  yanqiu: {
    anchor: baseSprite('yanqiu'),
    expressions: {
      neutral: baseSprite('yanqiu'),
      soft: '/assets/sprites/yanqiu/expression-soft-v1.webp',
      smile: '/assets/sprites/yanqiu/expression-smile-v1.webp',
      concerned: '/assets/sprites/yanqiu/expression-concerned-v1.webp',
      determined: '/assets/sprites/yanqiu/expression-determined-v1.webp',
      angry: '/assets/sprites/yanqiu/expression-angry-v1.webp',
      sad: '/assets/sprites/yanqiu/expression-sad-v1.webp',
      surprised: '/assets/sprites/yanqiu/expression-surprised-v1.webp',
      shy: '/assets/sprites/yanqiu/expression-soft-v1.webp',
      serious: '/assets/sprites/yanqiu/expression-determined-v1.webp',
      relaxed: '/assets/sprites/yanqiu/expression-smile-v1.webp',
    },
    poses: {
      base: baseSprite('yanqiu'),
      thinking: baseSprite('yanqiu'),
    },
  },
  wenxian: {
    anchor: baseSprite('wenxian'),
    expressions: {
      neutral: baseSprite('wenxian'),
      soft: '/assets/sprites/wenxian/expression-soft-v1.webp',
      smile: '/assets/sprites/wenxian/expression-smile-v1.webp',
      concerned: '/assets/sprites/wenxian/expression-concerned-v1.webp',
      determined: '/assets/sprites/wenxian/expression-determined-v1.webp',
      angry: '/assets/sprites/wenxian/expression-angry-v1.webp',
      sad: '/assets/sprites/wenxian/expression-sad-v1.webp',
      surprised: '/assets/sprites/wenxian/expression-surprised-v1.webp',
      shy: '/assets/sprites/wenxian/expression-soft-v1.webp',
      serious: '/assets/sprites/wenxian/expression-determined-v1.webp',
      relaxed: '/assets/sprites/wenxian/expression-smile-v1.webp',
    },
    poses: {
      base: baseSprite('wenxian'),
      thinking: baseSprite('wenxian'),
    },
  },
  takemehand: {
    anchor: baseSprite('takemehand'),
    expressions: {
      neutral: baseSprite('takemehand'),
      soft: '/assets/sprites/takemehand/expression-soft-v1.webp',
      smile: '/assets/sprites/takemehand/expression-smile-v1.webp',
      concerned: '/assets/sprites/takemehand/expression-concerned-v1.webp',
      determined: '/assets/sprites/takemehand/expression-determined-v1.webp',
      angry: '/assets/sprites/takemehand/expression-angry-v1.webp',
      sad: '/assets/sprites/takemehand/expression-sad-v1.webp',
      surprised: '/assets/sprites/takemehand/expression-surprised-v1.webp',
      shy: '/assets/sprites/takemehand/expression-soft-v1.webp',
      serious: '/assets/sprites/takemehand/expression-determined-v1.webp',
      relaxed: '/assets/sprites/takemehand/expression-smile-v1.webp',
    },
    poses: {
      base: baseSprite('takemehand'),
      relaxed: baseSprite('takemehand'),
    },
  },
  xilufei: {
    anchor: baseSprite('xilufei'),
    expressions: {
      neutral: baseSprite('xilufei'),
      soft: '/assets/sprites/xilufei/expression-soft-v1.webp',
      smile: '/assets/sprites/xilufei/expression-smile-v1.webp',
      concerned: '/assets/sprites/xilufei/expression-concerned-v1.webp',
      determined: '/assets/sprites/xilufei/expression-determined-v1.webp',
      angry: '/assets/sprites/xilufei/expression-angry-v1.webp',
      sad: '/assets/sprites/xilufei/expression-sad-v1.webp',
      surprised: '/assets/sprites/xilufei/expression-surprised-v1.webp',
      shy: '/assets/sprites/xilufei/expression-soft-v1.webp',
      serious: '/assets/sprites/xilufei/expression-determined-v1.webp',
      relaxed: '/assets/sprites/xilufei/expression-smile-v1.webp',
    },
    poses: {
      base: baseSprite('xilufei'),
      phone: baseSprite('xilufei'),
    },
  },
  gaobai: {
    anchor: baseSprite('gaobai'),
    expressions: {
      neutral: baseSprite('gaobai'),
    },
    poses: {
      base: baseSprite('gaobai'),
      command: baseSprite('gaobai'),
    },
  },
  chenyi: {
    anchor: baseSprite('chenyi'),
    expressions: {
      neutral: baseSprite('chenyi'),
      soft: '/assets/sprites/chenyi/expression-soft-v1.webp',
      smile: '/assets/sprites/chenyi/expression-smile-v1.webp',
      concerned: '/assets/sprites/chenyi/expression-concerned-v1.webp',
      determined: '/assets/sprites/chenyi/expression-determined-v1.webp',
      angry: '/assets/sprites/chenyi/expression-angry-v1.webp',
      sad: '/assets/sprites/chenyi/expression-sad-v1.webp',
      surprised: '/assets/sprites/chenyi/expression-surprised-v1.webp',
      shy: '/assets/sprites/chenyi/expression-soft-v1.webp',
      serious: '/assets/sprites/chenyi/expression-determined-v1.webp',
      relaxed: '/assets/sprites/chenyi/expression-smile-v1.webp',
    },
    poses: {
      base: baseSprite('chenyi'),
      phone: baseSprite('chenyi'),
    },
  },
  avucii: {
    anchor: baseSprite('avucii'),
    expressions: {
      neutral: baseSprite('avucii'),
      shy: resolveManagedVisual(v18ExpressionVisuals.avucii.shy),
      serious: resolveManagedVisual(v18ExpressionVisuals.avucii.serious),
      surprised: resolveManagedVisual(v18ExpressionVisuals.avucii.surprised),
      relaxed: resolveManagedVisual(v18ExpressionVisuals.avucii.relaxed),
    },
    poses: {
      base: baseSprite('avucii'),
      command: baseSprite('avucii'),
    },
  },
  yyt: {
    anchor: baseSprite('yyt'),
    expressions: {
      neutral: baseSprite('yyt'),
      shy: resolveManagedVisual(v18ExpressionVisuals.yyt.shy),
      serious: resolveManagedVisual(v18ExpressionVisuals.yyt.serious),
      surprised: resolveManagedVisual(v18ExpressionVisuals.yyt.surprised),
      relaxed: resolveManagedVisual(v18ExpressionVisuals.yyt.relaxed),
    },
    poses: {
      base: baseSprite('yyt'),
      command: baseSprite('yyt'),
    },
  },
  truth: {
    anchor: baseSprite('truth'),
    expressions: {
      neutral: baseSprite('truth'),
    },
    poses: {
      base: baseSprite('truth'),
      thinking: baseSprite('truth'),
    },
  },
  oguri: {
    anchor: baseSprite('oguri'),
    expressions: {
      neutral: baseSprite('oguri'),
    },
    poses: {
      base: baseSprite('oguri'),
      command: baseSprite('oguri'),
    },
  },
  mentor: {
    anchor: baseSprite('mentor'),
    expressions: {
      neutral: baseSprite('mentor'),
    },
    poses: {
      base: baseSprite('mentor'),
      phone: baseSprite('mentor'),
      relaxed: baseSprite('mentor'),
    },
  },
  huayue: {
    anchor: baseSprite('huayue'),
    expressions: {
      neutral: baseSprite('huayue'),
      shy: resolveManagedVisual(v18ExpressionVisuals.huayue.shy),
      serious: resolveManagedVisual(v18ExpressionVisuals.huayue.serious),
      surprised: resolveManagedVisual(v18ExpressionVisuals.huayue.surprised),
      relaxed: resolveManagedVisual(v18ExpressionVisuals.huayue.relaxed),
    },
    poses: {
      base: baseSprite('huayue'),
      thinking: baseSprite('huayue'),
    },
  },
  emperor: {
    anchor: baseSprite('emperor'),
    expressions: {
      neutral: baseSprite('emperor'),
    },
    poses: {
      base: baseSprite('emperor'),
      command: baseSprite('emperor'),
    },
  },
  an: {
    anchor: baseSprite('an'),
    expressions: {
      neutral: baseSprite('an'),
      soft: '/assets/sprites/an/expression-soft-v1.webp',
      smile: '/assets/sprites/an/expression-smile-v1.webp',
      concerned: '/assets/sprites/an/expression-concerned-v1.webp',
      determined: '/assets/sprites/an/expression-determined-v1.webp',
      angry: '/assets/sprites/an/expression-angry-v1.webp',
      sad: '/assets/sprites/an/expression-sad-v1.webp',
    },
    poses: {
      base: baseSprite('an'),
      relaxed: baseSprite('an'),
    },
  },
  daigu: {
    anchor: baseSprite('daigu'),
    expressions: {
      neutral: baseSprite('daigu'),
    },
    poses: {
      base: baseSprite('daigu'),
      command: baseSprite('daigu'),
    },
  },
  sixin: {
    anchor: baseSprite('sixin'),
    expressions: {
      neutral: baseSprite('sixin'),
    },
    poses: {
      base: baseSprite('sixin'),
      command: baseSprite('sixin'),
    },
  },
  bottle: {
    anchor: baseSprite('bottle'),
    expressions: {
      neutral: baseSprite('bottle'),
    },
    poses: {
      base: baseSprite('bottle'),
      command: baseSprite('bottle'),
    },
  },
  shi: {
    anchor: baseSprite('shi'),
    expressions: {
      neutral: baseSprite('shi'),
      soft: '/assets/sprites/shi/expression-soft-v1.webp',
      smile: '/assets/sprites/shi/expression-smile-v1.webp',
      concerned: '/assets/sprites/shi/expression-concerned-v1.webp',
      determined: '/assets/sprites/shi/expression-determined-v1.webp',
      angry: '/assets/sprites/shi/expression-angry-v1.webp',
      sad: '/assets/sprites/shi/expression-sad-v1.webp',
      surprised: '/assets/sprites/shi/expression-surprised-v1.webp',
    },
    poses: {
      base: baseSprite('shi'),
      relaxed: baseSprite('shi'),
    },
  },
  jiangjinjiu: {
    anchor: baseSprite('jiangjinjiu'),
    expressions: {
      neutral: baseSprite('jiangjinjiu'),
    },
    poses: {
      base: baseSprite('jiangjinjiu'),
      thinking: baseSprite('jiangjinjiu'),
    },
  },
  saoji: {
    anchor: baseSprite('saoji'),
    expressions: {
      neutral: baseSprite('saoji'),
    },
    poses: {
      base: baseSprite('saoji'),
      relaxed: baseSprite('saoji'),
    },
  },
  swordheart: {
    anchor: baseSprite('swordheart'),
    expressions: {
      neutral: baseSprite('swordheart'),
      shy: resolveManagedVisual(v18ExpressionVisuals.swordheart.shy),
      serious: resolveManagedVisual(v18ExpressionVisuals.swordheart.serious),
      surprised: resolveManagedVisual(v18ExpressionVisuals.swordheart.surprised),
      relaxed: resolveManagedVisual(v18ExpressionVisuals.swordheart.relaxed),
    },
    poses: {
      base: baseSprite('swordheart'),
      command: baseSprite('swordheart'),
    },
  },
  xuanmo: {
    anchor: baseSprite('xuanmo'),
    expressions: {
      neutral: baseSprite('xuanmo'),
    },
    poses: {
      base: baseSprite('xuanmo'),
      command: baseSprite('xuanmo'),
    },
  },
  jianwen: {
    anchor: baseSprite('jianwen'),
    expressions: {
      neutral: baseSprite('jianwen'),
    },
    poses: {
      base: baseSprite('jianwen'),
      thinking: baseSprite('jianwen'),
    },
  },
  haogeju: {
    anchor: baseSprite('haogeju'),
    expressions: {
      neutral: baseSprite('haogeju'),
    },
    poses: {
      base: baseSprite('haogeju'),
      relaxed: baseSprite('haogeju'),
    },
  },
  lan: {
    anchor: baseSprite('lan'),
    expressions: { neutral: baseSprite('lan') },
    poses: { base: baseSprite('lan'), phone: baseSprite('lan') },
  },
  xingqing: {
    anchor: baseSprite('xingqing'),
    expressions: { neutral: baseSprite('xingqing') },
    poses: { base: baseSprite('xingqing'), relaxed: baseSprite('xingqing') },
  },
}

export const getSpriteAsset = (
  character: CharacterId,
  expression: SpriteExpression = 'neutral',
  pose: SpritePose = 'base',
) => {
  const entry = spriteCatalog[character]
  if (!entry) return undefined
  return entry.expressions[expression] ?? entry.poses?.[pose] ?? entry.anchor
}

export const spriteAssetUrls = [...new Set(
  Object.values(spriteCatalog).flatMap((entry) => [
    entry.anchor,
    ...Object.values(entry.expressions),
    ...Object.values(entry.poses ?? {}),
  ]),
)]
