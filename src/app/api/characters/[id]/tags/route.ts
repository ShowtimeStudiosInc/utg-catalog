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
    const { tagId } = body;

    const characterTag = await prisma.characterTag.create({
      data: {
        characterId: id,
        tagId,
      },
      include: {
        tag: true,
      },
    });

    return NextResponse.json(characterTag.tag, { status: 201 });
  } catch (error) {
    console.error('Error adding tag to character:', error);
    return NextResponse.json({ error: 'Failed to add tag' }, { status: 500 });
  }
}