import { z } from 'zod'
import { ABILITY_CLASSES, ABILITY_TYPES } from '@/lib/ability-classification'
import { getYouTubeVideoId } from '@/lib/youtube-video'

// Character validation schema
export const characterSchema = z.object({
  // Submitter info
  submitter: z.string().optional(),
  submitterRole: z.string().optional(),
  
  // Main Information
  name: z.string().min(1, "Name is required"),
  aliases: z.string().optional(), // JSON array
  gender: z.string().optional(),
  age: z.number().int().positive().nullable().optional(),
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
  soulTrait: z.enum(['Individuality', 'Patience', 'Bravery', 'Integrity', 'Perseverance', 'Kindness', 'Justice']).nullable().optional(),
  mainAbility: z.string().optional(),
  mainAbilityType: z.string().optional(),
  mainAbilityDesc: z.string().optional(),
  subAbilities: z.string().optional(), // JSON array
  subAbilityDescs: z.string().optional(), // JSON array
  weaknesses: z.string().optional(), // JSON array
  
  // Stats - The Whole
  hp: z.number().int().positive().nullable().optional(),
  wpr: z.number().int().positive().nullable().optional(),
  
  // Stats - The Vessel
  atk: z.number().int().nullable().optional(),
  weapon: z.string().optional(),
  weapon2: z.string().optional(),
  def: z.number().int().nullable().optional(),
  armor: z.string().optional(),
  accessory1: z.string().optional(),
  accessory2: z.string().optional(),
  edr: z.number().int().nullable().optional(),
  spd: z.number().int().nullable().optional(),
  
  // Stats - The Soul
  love: z.number().int().min(0).nullable().optional(),
  exp: z.number().int().min(0).nullable().optional(),
  
  // Appearance
  height: z.string().optional(),
  weight: z.string().optional(),
  physicalOddities: z.string().optional(), // JSON array
  appearanceImage: z.string().url().nullable().optional(),
  
  // Custom sections
  trivia: z.string().optional(),
  ost: z.string().optional(), // JSON array
  youtubeLinks: z.array(z.string().trim().url().refine((url) => getYouTubeVideoId(url) !== null, 'Use a valid YouTube video link.')).max(20, 'Add up to 20 YouTube links.').nullable().optional().transform((links) => links?.length ? JSON.stringify([...new Set(links)]) : undefined),
  extras: z.string().optional(),
})

// Item validation schema
export const itemSchema = z.object({
  // Main Information
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  type: z.enum(['Weapon', 'Shield', 'Armor', 'Accessory', 'Consumable', 'Miscellaneous']),
  value: z.number().positive().nullable().optional(),
  originalOwner: z.string().optional(),
  currentOwner: z.string().optional(),
  
  // Stats
  atk: z.string().optional(),
  hitCount: z.number().int().positive().nullable().optional(),
  def: z.string().optional(),
  defendEfficiency: z.number().max(4).min(0).nullable().optional(),
  spd: z.number().int().nullable().optional(),
  
  // Physical Properties
  range: z.string().optional(),
  weight: z.string().optional(),
  physicalDamages: z.string().optional(), // JSON array
  appearanceImage: z.string().url().nullable().optional(),
})

// Ability validation schema
export const abilitySchema = z.object({
  // Information
  name: z.string().min(1, "Name is required"),
  parentAbility: z.string().optional(), // JSON array
  description: z.string().optional(),
  complexity: z.enum(['Basic', 'Intermediate', 'Advanced', 'Complex']).nullable().optional(),
  
  // Components
  passives: z.string().optional(), // JSON array
  skills: z.string().optional(), // JSON array
  statChanges: z.string().optional(), // JSON array
  weaknesses: z.string().optional(), // JSON array
  
  // Optional user-specific classification system
  rating: z.enum(['Limited', 'Minor', 'Base', 'Enhanced', 'Advanced', 'Perfect']).nullable().optional(),
  abilityType: z.union([z.enum(ABILITY_TYPES), z.array(z.enum(ABILITY_TYPES))]).optional(),
  abilityClass: z.union([z.enum(ABILITY_CLASSES), z.array(z.enum(ABILITY_CLASSES))]).optional(),
})

// Tag validation schema
export const tagSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").default("#3b82f6"),
  category: z.string().trim().max(80).nullable().optional(),
  emojiFilename: z.string().regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(png|gif|jpg|webp)$/i,
    "Invalid emoji",
  ).nullable().optional(),
})

export const customEmojiNameSchema = z.string()
  .trim()
  .min(1, "Emoji name is required")
  .max(32, "Emoji names must be 32 characters or fewer")
  .regex(/^[A-Za-z0-9_-]+$/, "Use letters, numbers, underscores, or hyphens")
  .transform((name) => name.toLowerCase())

export type CharacterInput = z.infer<typeof characterSchema>
export type ItemInput = z.infer<typeof itemSchema>
export type AbilityInput = z.infer<typeof abilitySchema>
export type TagInput = z.infer<typeof tagSchema>
