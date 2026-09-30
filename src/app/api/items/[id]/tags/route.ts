import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET tags for an item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const itemTags = await prisma.itemTag.findMany({
      where: { itemId: id },
      include: {
        tag: true,
      },
    });

    return NextResponse.json(itemTags.map(it => it.tag));
  } catch (error) {
    console.error('Error fetching item tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

// POST add tag to item
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
    const itemTags = await prisma.$transaction([...new Set(tagIds as string[])].map((tagId) => prisma.itemTag.upsert({
      where: { itemId_tagId: { itemId: id, tagId } },
      update: {},
      create: { itemId: id, tagId },
      include: { tag: true },
    })));

    const result = itemTags.map((itemTag) => itemTag.tag);
    return NextResponse.json(bulk ? result : result[0], { status: 201 });
  } catch (error) {
    console.error('Error adding tag to item:', error);
    return NextResponse.json({ error: 'Failed to add tag' }, { status: 500 });
  }
}
