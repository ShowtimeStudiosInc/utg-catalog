import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET statistics
export async function GET() {
  try {
    // Get counts
    const totalCharacters = await prisma.character.count();
    const totalItems = await prisma.item.count();
    const totalAbilities = await prisma.ability.count();

    // Get all entities for distributions
    const characters = await prisma.character.findMany({
      select: { soulTrait: true },
    });

    const items = await prisma.item.findMany({
      select: { type: true },
    });

    const abilities = await prisma.ability.findMany({
      select: { complexity: true },
    });

    // Calculate soul trait distribution
    const soulTraitMap = new Map();
    const soulTraitEmojis: Record<string, string> = {
      'Individuality': '❤️',
      'Patience': '💙',
      'Bravery': '💛',
      'Integrity': '💚',
      'Perseverance': '💜',
      'Kindness': '💕',
      'Justice': '💛',
    };

    characters.forEach((char) => {
      if (char.soulTrait) {
        soulTraitMap.set(char.soulTrait, (soulTraitMap.get(char.soulTrait) || 0) + 1);
      }
    });

    const soulTraitDistribution = Array.from(soulTraitMap.entries()).map(([trait, count]) => ({
      trait,
      count,
      emoji: soulTraitEmojis[trait] || '❓',
    }));

    // Calculate item type distribution
    const itemTypeMap = new Map();
    items.forEach((item) => {
      itemTypeMap.set(item.type, (itemTypeMap.get(item.type) || 0) + 1);
    });

    const itemTypeDistribution = Array.from(itemTypeMap.entries()).map(([type, count]) => ({
      type,
      count,
    }));

    // Calculate ability complexity distribution
    const complexityMap = new Map();
    const complexityColors: Record<string, string> = {
      'Basic': '#95e1d3',
      'Intermediate': '#ffd93d',
      'Advanced': '#ffaaa5',
      'Complex': '#e94560',
    };

    abilities.forEach((ability) => {
      if (ability.complexity) {
        complexityMap.set(ability.complexity, (complexityMap.get(ability.complexity) || 0) + 1);
      }
    });

    const abilityComplexityDistribution = Array.from(complexityMap.entries()).map(([complexity, count]) => ({
      complexity,
      count,
      color: complexityColors[complexity] || '#4a4a8a',
    }));

    return NextResponse.json({
      totalCharacters,
      totalItems,
      totalAbilities,
      soulTraitDistribution,
      itemTypeDistribution,
      abilityComplexityDistribution,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}