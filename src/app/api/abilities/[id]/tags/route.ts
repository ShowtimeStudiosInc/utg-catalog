import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET tags for an ability
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const abilityTags = await prisma.abilityTag.findMany({
      where: { abilityId: id },
      include: {
        tag: true,
      },
    });

    return NextResponse.json(abilityTags.map(at => at.tag));
  } catch (error) {
    console.error('Error fetching ability tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

// POST add tag to ability
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const bulk = Array.isArray(body.tagIds);
    const tagIds: unknown[] = bulk ? body.tagIds : [body.tagId];
    if (!tagIds.length || tagIds.some((tagId) => typeof tagId !== 'string' || !tagId)) {
      return NextResponse.json({ error: 'Choose at least one valid tag.' }, { status: 400 });
    }
    const abilityTags = await prisma.$transaction([...new Set(tagIds as string[])].map((tagId) => prisma.abilityTag.upsert({
      where: { abilityId_tagId: { abilityId: id, tagId } },
      update: {},
      create: { abilityId: id, tagId },
      include: { tag: true },
    })));

    const result = abilityTags.map((abilityTag) => abilityTag.tag);
    return NextResponse.json(bulk ? result : result[0], { status: 201 });
  } catch (error) {
    console.error('Error adding tag to ability:', error);
    return NextResponse.json({ error: 'Failed to add tag' }, { status: 500 });
  }
}
