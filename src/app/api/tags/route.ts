import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { tagSchema } from '@/lib/validations';

// GET all tags
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        characterTags: true,
        itemTags: true,
        abilityTags: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Add usage counts
    const tagsWithCounts = tags.map(tag => ({
      ...tag,
      characterCount: tag.characterTags.length,
      itemCount: tag.itemTags.length,
      abilityCount: tag.abilityTags.length,
      totalCount: tag.characterTags.length + tag.itemTags.length + tag.abilityTags.length,
    }));

    return NextResponse.json(tagsWithCounts);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

// POST create tag
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = tagSchema.parse(body);

    const tag = await prisma.tag.create({
      data: validatedData,
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}