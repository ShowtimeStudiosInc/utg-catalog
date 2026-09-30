import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET tags for a character
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const characterTags = await prisma.characterTag.findMany({
      where: { characterId: id },
      include: {
        tag: true,
      },
    });

    return NextResponse.json(characterTags.map(ct => ct.tag));
  } catch (error) {
    console.error('Error fetching character tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

// POST add tag to character
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
    const uniqueTagIds = [...new Set(tagIds as string[])];
    const characterTags = await prisma.$transaction(uniqueTagIds.map((tagId) => prisma.characterTag.upsert({
      where: { characterId_tagId: { characterId: id, tagId } },
      update: {},
      create: { characterId: id, tagId },
      include: { tag: true },
    })));

    const result = characterTags.map((characterTag) => characterTag.tag);
    return NextResponse.json(bulk ? result : result[0], { status: 201 });
  } catch (error) {
    console.error('Error adding tag to character:', error);
    return NextResponse.json({ error: 'Failed to add tag' }, { status: 500 });
  }
}
