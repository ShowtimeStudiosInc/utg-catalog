import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { characterSchema } from '@/lib/validations';
import { ZodError } from 'zod';

// GET all characters
export async function GET() {
  try {
    const characters = await prisma.character.findMany({
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(characters);
  } catch (error) {
    console.error('Error fetching characters:', error);
    return NextResponse.json({ error: 'Failed to fetch characters' }, { status: 500 });
  }
}

// POST create character
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = characterSchema.parse(body);

    const character = await prisma.character.create({
      data: validatedData,
    });

    return NextResponse.json(character, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid character data' }, { status: 400 });
    }
    console.error('Error creating character:', error);
    return NextResponse.json({ error: 'Failed to create character' }, { status: 500 });
  }
}
