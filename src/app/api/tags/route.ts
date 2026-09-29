import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { tagSchema } from '@/lib/validations';
import { readEmoji } from '@/lib/emoji-storage';

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
    const parsed = tagSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid tag.' }, { status: 400 });
    }
    if (parsed.data.emojiFilename && !(await readEmoji(parsed.data.emojiFilename))) {
      return NextResponse.json({ error: 'The selected emoji is no longer available.' }, { status: 400 });
    }

    const tag = await prisma.tag.create({
      data: parsed.data,
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
    }
    console.error('Error creating tag:', error);
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}