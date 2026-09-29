export const SOUL_TRAIT_SPRITES = {
  Individuality: { path: "/images/soul-traits/individuality.png", label: "Individuality soul trait" },
  Patience: { path: "/images/soul-traits/patience.png", label: "Patience soul trait" },
  Bravery: { path: "/images/soul-traits/bravery.png", label: "Bravery soul trait" },
  Integrity: { path: "/images/soul-traits/integrity.png", label: "Integrity soul trait" },
  Perseverance: { path: "/images/soul-traits/perseverance.png", label: "Perseverance soul trait" },
  Kindness: { path: "/images/soul-traits/kindness.png", label: "Kindness soul trait" },
  Justice: { path: "/images/soul-traits/justice.png", label: "Justice soul trait" },
} as const;

export type SoulTraitName = keyof typeof SOUL_TRAIT_SPRITES;

export function getSoulTraitSprite(trait: string | null | undefined) {
  if (!trait) return null;
  return SOUL_TRAIT_SPRITES[trait as SoulTraitName] ?? null;
}
