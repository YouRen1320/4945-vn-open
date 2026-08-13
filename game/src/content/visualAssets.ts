export type ManagedVisualStatus = 'pending' | 'ready'

export interface ManagedVisualAsset {
  id: string
  status: ManagedVisualStatus
  final: string
  fallback: string
  promptRef: string
}

const managedVisual = (
  status: ManagedVisualStatus,
  id: string,
  final: string,
  fallback: string,
  promptRef: string,
): ManagedVisualAsset => ({ id, status, final, fallback, promptRef })

// Future intake starts as pending and flips to readyVisual once the file passes the strict audit.
export const pendingVisual = (id: string, final: string, fallback: string, promptRef: string) => (
  managedVisual('pending', id, final, fallback, promptRef)
)

// Final-art intake changes only the relevant constructor/status after the file passes the strict audit.
export const readyVisual = (id: string, final: string, fallback: string, promptRef: string) => (
  managedVisual('ready', id, final, fallback, promptRef)
)

// v1.8 confession artwork remains explicit even while external generation is pending.
// Runtime always resolves to a valid existing fallback, so previews, builds and offline mode never request a missing file.
export const v18ConfessionVisuals = {
  shana: readyVisual('v18-confession-shana', '/assets/cg/romance-shana-confession-v1.webp', '/assets/cg/bond-shana-v1.webp', 'V18-CG-01'),
  qifu: readyVisual('v18-confession-qifu', '/assets/cg/romance-qifu-confession-v1.webp', '/assets/cg/bond-qifu-v1.webp', 'V18-CG-02'),
  chenyi: readyVisual('v18-confession-chenyi', '/assets/cg/romance-chenyi-confession-v1.webp', '/assets/cg/bond-chenyi-v1.webp', 'V18-CG-03'),
  swordheart: readyVisual('v18-confession-swordheart', '/assets/cg/romance-swordheart-confession-v1.webp', '/assets/cg/bond-swordheart-v1.webp', 'V18-CG-04'),
  heartbeat: readyVisual('v18-confession-heartbeat', '/assets/cg/romance-heartbeat-confession-v1.webp', '/assets/cg/bond-heartbeat-v1.webp', 'V18-CG-05'),
  yanqiu: readyVisual('v18-confession-yanqiu', '/assets/cg/romance-yanqiu-confession-v1.webp', '/assets/cg/bond-yanqiu-v1.webp', 'V18-CG-06'),
  huayue: readyVisual('v18-confession-huayue', '/assets/cg/romance-huayue-confession-v1.webp', '/assets/cg/bond-huayue-v1.webp', 'V18-CG-07'),
  wenxian: readyVisual('v18-confession-wenxian', '/assets/cg/romance-wenxian-confession-v1.webp', '/assets/cg/bond-wenxian-v1.webp', 'V18-CG-08'),
  takemehand: readyVisual('v18-confession-takemehand', '/assets/cg/romance-takemehand-confession-v1.webp', '/assets/cg/bond-takemehand-v1.webp', 'V18-CG-09'),
  xilufei: readyVisual('v18-confession-xilufei', '/assets/cg/romance-xilufei-confession-v1.webp', '/assets/cg/bond-xilufei-v1.webp', 'V18-CG-10'),
  yyt: readyVisual('v18-confession-yyt', '/assets/cg/romance-yyt-confession-v1.webp', '/assets/cg/bond-yyt-v1.webp', 'V18-CG-11'),
  avucii: readyVisual('v18-confession-avucii', '/assets/cg/romance-avucii-confession-v1.webp', '/assets/cg/bond-avucii-v1.webp', 'V18-CG-12'),
} as const

// Eight night-market variants are new compositions. Until supplied, each one safely reuses its matching v1.6 location.
export const v18BackgroundVisuals = {
  romanceGateRain: readyVisual('v18-bg-gate-rain', '/assets/backgrounds/galgame/romance-gate-rain-v1.webp', '/assets/backgrounds/galgame/romance-gate-v1.webp', 'V18-BG-01'),
  romanceGateAfterHours: readyVisual('v18-bg-gate-after-hours', '/assets/backgrounds/galgame/romance-gate-after-hours-v1.webp', '/assets/backgrounds/galgame/romance-gate-v1.webp', 'V18-BG-02'),
  romanceFoodStreetRain: readyVisual('v18-bg-food-street-rain', '/assets/backgrounds/galgame/romance-food-street-rain-v1.webp', '/assets/backgrounds/galgame/romance-food-street-v1.webp', 'V18-BG-03'),
  romanceFoodStreetAfterHours: readyVisual('v18-bg-food-street-after-hours', '/assets/backgrounds/galgame/romance-food-street-after-hours-v1.webp', '/assets/backgrounds/galgame/romance-food-street-v1.webp', 'V18-BG-04'),
  romanceArcadeRain: readyVisual('v18-bg-arcade-rain', '/assets/backgrounds/galgame/romance-arcade-rain-v1.webp', '/assets/backgrounds/galgame/romance-arcade-v1.webp', 'V18-BG-05'),
  romanceArcadeAfterHours: readyVisual('v18-bg-arcade-after-hours', '/assets/backgrounds/galgame/romance-arcade-after-hours-v1.webp', '/assets/backgrounds/galgame/romance-arcade-v1.webp', 'V18-BG-06'),
  romanceLanternBridgeRain: readyVisual('v18-bg-lantern-bridge-rain', '/assets/backgrounds/galgame/romance-lantern-bridge-rain-v1.webp', '/assets/backgrounds/galgame/romance-lantern-bridge-v1.webp', 'V18-BG-07'),
  romanceLanternBridgeAfterHours: readyVisual('v18-bg-lantern-bridge-after-hours', '/assets/backgrounds/galgame/romance-lantern-bridge-after-hours-v1.webp', '/assets/backgrounds/galgame/romance-lantern-bridge-v1.webp', 'V18-BG-08'),
} as const

type PendingExpressionCharacter = 'swordheart' | 'huayue' | 'yyt' | 'avucii'
type RomanceExpression = 'shy' | 'serious' | 'surprised' | 'relaxed'

const expressionVisual = (
  character: PendingExpressionCharacter,
  expression: RomanceExpression,
  promptIndex: number,
  status: ManagedVisualStatus,
) => managedVisual(
  status,
  `v18-expression-${character}-${expression}`,
  `/assets/sprites/${character}/expression-${expression}-v1.webp`,
  `/assets/sprites/${character}/base-neutral-v1.webp`,
  `V18-EX-${String(promptIndex).padStart(2, '0')}`,
)

// Eight candidates already have suitable emotional variants. These four need externally generated dedicated expressions.
export const v18ExpressionVisuals = {
  swordheart: {
    shy: expressionVisual('swordheart', 'shy', 1, 'ready'),
    serious: expressionVisual('swordheart', 'serious', 2, 'ready'),
    surprised: expressionVisual('swordheart', 'surprised', 3, 'ready'),
    relaxed: expressionVisual('swordheart', 'relaxed', 4, 'ready'),
  },
  huayue: {
    shy: expressionVisual('huayue', 'shy', 5, 'ready'),
    serious: expressionVisual('huayue', 'serious', 6, 'ready'),
    surprised: expressionVisual('huayue', 'surprised', 7, 'ready'),
    relaxed: expressionVisual('huayue', 'relaxed', 8, 'ready'),
  },
  yyt: {
    shy: expressionVisual('yyt', 'shy', 9, 'ready'),
    serious: expressionVisual('yyt', 'serious', 10, 'ready'),
    surprised: expressionVisual('yyt', 'surprised', 11, 'ready'),
    relaxed: expressionVisual('yyt', 'relaxed', 12, 'ready'),
  },
  avucii: {
    shy: expressionVisual('avucii', 'shy', 13, 'ready'),
    serious: expressionVisual('avucii', 'serious', 14, 'ready'),
    surprised: expressionVisual('avucii', 'surprised', 15, 'ready'),
    relaxed: expressionVisual('avucii', 'relaxed', 16, 'ready'),
  },
} as const

export const resolveManagedVisual = (asset: ManagedVisualAsset) => (
  asset.status === 'ready' ? asset.final : asset.fallback
)

export const allManagedVisualAssets: ManagedVisualAsset[] = [
  ...Object.values(v18ConfessionVisuals),
  ...Object.values(v18BackgroundVisuals),
  ...Object.values(v18ExpressionVisuals).flatMap((expressions) => Object.values(expressions)),
]

// Only resolved URLs enter the offline package. Missing final art never creates a false-positive cached response.
export const runtimeManagedVisualUrls = [...new Set(allManagedVisualAssets.map(resolveManagedVisual))]
export const pendingManagedVisuals = allManagedVisualAssets.filter((asset) => asset.status === 'pending')
