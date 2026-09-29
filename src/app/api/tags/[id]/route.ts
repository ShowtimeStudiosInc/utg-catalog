import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { tagSchema } from '@/lib/validations';
import { readEmoji } from '@/lib/emoji-storage';

// GET single tag
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        characterTags: {
          include: {
            character: true,
          },
        },
        itemTags: {
          include: {
            item: true,
          },
        },
        abilityTags: {
          include: {
            ability: true,
          },
        },
      },
    });

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    return NextResponse.json(tag);
  } catch (error) {
    console.error('Error fetching tag:', error);
    return NextResponse.json({ error: 'Failed to fetch tag' }, { status: 500 });
  }
}

// PUT update tag
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = tagSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid tag.' }, { status: 400 });
    }
    if (parsed.data.emojiFilename) {
      const [emojiRecord, emojiImage] = await Promise.all([
        prisma.customEmoji.findUnique({
          where: { fileName: parsed.data.emojiFilename },
          select: { fileName: true },
        }),
        readEmoji(parsed.data.emojiFilename),
      ]);
      if (!emojiRecord || !emojiImage) {
        return NextResponse.json({ error: 'The selected emoji is no longer available.' }, { status: 400 });
      }
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(tag);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
    }
    console.error('Error updating tag:', error);
    return NextResponse.json({ error: 'Failed to update tag' }, { status: 500 });
  }
}

// DELETE tag
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.tag.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 });
  }
}