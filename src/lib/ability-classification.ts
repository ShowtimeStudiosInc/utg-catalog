export const ABILITY_TYPES = ["Offensive", "Defensive", "Buffing", "Debuffing", "Mobility", "Utility"] as const;
export const ABILITY_CLASSES = ["Physical", "Summoning", "Visions", "Shapeshifting", "Enchantments", "Alteration", "Entropy", "Elements"] as const;

export function parseAbilityClassification(value: string | string[] | null | undefined): string[] {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) return parsed;
  } catch {
    // Existing records store a single choice as plain text.
  }
  return [value];
}

export function serializeAbilityClassification(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value.length ? JSON.stringify(value) : undefined;
  return value || undefined;
}
