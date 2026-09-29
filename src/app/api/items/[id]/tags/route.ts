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
    const { tagId } = body;

    const itemTag = await prisma.itemTag.create({
      data: {
        itemId: id,
        tagId,
      },
      include: {
        tag: true,
      },
    });

    return NextResponse.json(itemTag.tag, { status: 201 });
  } catch (error) {
    console.error('Error adding tag to item:', error);
    return NextResponse.json({ error: 'Failed to add tag' }, { status: 500 });
  }
}