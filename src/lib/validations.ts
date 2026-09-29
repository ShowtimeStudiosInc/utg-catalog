import { z } from 'zod'

// Character validation schema
export const characterSchema = z.object({
  // Submitter info
  submitter: z.string().optional(),
  submitterRole: z.string().optional(),
  
  // Main Information
  name: z.string().min(1, "Name is required"),
  aliases: z.string().optional(), // JSON array
  gender: z.string().optional(),
  age: z.number().int().positive().optional(),
  species: z.string().optional(),
  groupOrganization: z.string().optional(),
  role: z.string().optional(),
  
  // Behavior
  personality: z.string().optional(),
  likes: z.string().optional(), // JSON array
  dislikes: z.string().optional(), // JSON array
  fears: z.string().optional(), // JSON array
  traumas: z.string().optional(), // JSON array
  psychologicalOddities: z.string().optional(), // JSON array
  sexuality: z.string().optional(),
  alignment: z.string().optional(),
  
  // Capabilities
  soulTrait: z.enum(['Individuality', 'Patience', 'Bravery', 'Integrity', 'Perseverance', 'Kindness', 'Justice']).optional(),
  mainAbility: z.string().optional(),
  mainAbilityType: z.string().optional(),
  mainAbilityDesc: z.string().optional(),
  subAbilities: z.string().optional(), // JSON array
  subAbilityDescs: z.string().optional(), // JSON array
  weaknesses: z.string().optional(), // JSON array
  
  // Stats - The Whole
  hp: z.number().int().positive().optional(),
  wpr: z.number().int().positive().optional(),
  
  // Stats - The Vessel
  atk: z.number().int().optional(),
  weapon: z.string().optional(),
  weapon2: z.string().optional(),
  def: z.number().int().optional(),
  armor: z.string().optional(),
  accessory1: z.string().optional(),
  accessory2: z.string().optional(),
  edr: z.number().int().optional(),
  spd: z.number().int().optional(),
  
  // Stats - The Soul
  love: z.number().int().min(0).optional(),
  exp: z.number().int().min(0).optional(),
  
  // Appearance
  height: z.string().optional(),
  weight: z.string().optional(),
  physicalOddities: z.string().optional(), // JSON array
  appearanceImage: z.string().url().optional(),
  
  // Custom sections
  trivia: z.string().optional(),
  ost: z.string().optional(), // JSON array
  extras: z.string().optional(),
})

// Item validation schema
export const itemSchema = z.object({
  // Main Information
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  type: z.enum(['Weapon', 'Shield', 'Armor', 'Accessory', 'Consumable', 'Miscellaneous']),
  value: z.number().positive().optional(),
  originalOwner: z.string().optional(),
  currentOwner: z.string().optional(),
  
  // Stats
  atk: z.string().optional(),
  hitCount: z.number().int().positive().optional(),
  def: z.string().optional(),
  defendEfficiency: z.number().max(4).min(0).optional(),
  spd: z.number().int().optional(),
  
  // Physical Properties
  range: z.string().optional(),
  weight: z.string().optional(),
  physicalDamages: z.string().optional(), // JSON array
  appearanceImage: z.string().url().optional(),
})

// Ability validation schema
export const abilitySchema = z.object({
  // Information
  name: z.string().min(1, "Name is required"),
  parentAbility: z.string().optional(), // JSON array
  description: z.string().optional(),
  complexity: z.enum(['Basic', 'Intermediate', 'Advanced', 'Complex']).optional(),
  
  // Components
  passives: z.string().optional(), // JSON array
  skills: z.string().optional(), // JSON array
  statChanges: z.string().optional(), // JSON array
  weaknesses: z.string().optional(), // JSON array
  
  // Optional user-specific classification system
  rating: z.enum(['Limited', 'Minor', 'Base', 'Enhanced', 'Advanced', 'Perfect']).optional(),
  abilityType: z.enum(['Offensive', 'Defensive', 'Buffing', 'Debuffing', 'Mobility', 'Utility']).optional(),
  abilityClass: z.enum(['Physical', 'Summoning', 'Visions', 'Shapeshifting', 'Enchantments', 'Alteration', 'Entropy', 'Elements']).optional(),
})

// Tag validation schema
export const tagSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").default("#3b82f6"),
  category: z.string().optional(),
})

export type CharacterInput = z.infer<typeof characterSchema>
export type ItemInput = z.infer<typeof itemSchema>
export type AbilityInput = z.infer<typeof abilitySchema>
export type TagInput = z.infer<typeof tagSchema>