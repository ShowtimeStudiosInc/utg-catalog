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
    const { tagId } = body;

    const abilityTag = await prisma.abilityTag.create({
      data: {
        abilityId: id,
        tagId,
      },
      include: {
        tag: true,
      },
    });

    return NextResponse.json(abilityTag.tag, { status: 201 });
  } catch (error) {
    console.error('Error adding tag to ability:', error);
    return NextResponse.json({ error: 'Failed to add tag' }, { status: 500 });
  }
}