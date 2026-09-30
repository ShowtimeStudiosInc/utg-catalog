import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const validTypes = new Set(['character', 'item', 'ability']);

async function entityExists(type: string, id: string) {
  if (type === 'character') return Boolean(await prisma.character.findUnique({ where: { id }, select: { id: true } }));
  if (type === 'item') return Boolean(await prisma.item.findUnique({ where: { id }, select: { id: true } }));
  if (type === 'ability') return Boolean(await prisma.ability.findUnique({ where: { id }, select: { id: true } }));
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid link.' }, { status: 400 });
    const { sourceType, sourceId, targetType, targetId } = body as Record<string, unknown>;
    if (
      typeof sourceType !== 'string' || !validTypes.has(sourceType) ||
      typeof targetType !== 'string' || !validTypes.has(targetType) ||
      typeof sourceId !== 'string' || typeof targetId !== 'string' ||
      !sourceId || !targetId || (sourceType === targetType && sourceId === targetId)
    ) return NextResponse.json({ error: 'Choose two different catalog entries.' }, { status: 400 });

    const [sourceExists, targetExists] = await Promise.all([
      entityExists(sourceType, sourceId),
      entityExists(targetType, targetId),
    ]);
    if (!sourceExists || !targetExists) return NextResponse.json({ error: 'One of those entries no longer exists.' }, { status: 404 });

    const link = await prisma.entityLink.upsert({
      where: { sourceType_sourceId_targetType_targetId: { sourceType, sourceId, targetType, targetId } },
      create: { sourceType, sourceId, targetType, targetId },
      update: {},
    });
    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error('Error saving graph link:', error);
    return NextResponse.json({ error: 'Failed to save this link.' }, { status: 500 });
  }
}
