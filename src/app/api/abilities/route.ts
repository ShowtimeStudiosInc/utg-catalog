import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { abilitySchema } from '@/lib/validations';

// GET all abilities
export async function GET() {
  try {
    const abilities = await prisma.ability.findMany({
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

    return NextResponse.json(abilities);
  } catch (error) {
    console.error('Error fetching abilities:', error);
    return NextResponse.json({ error: 'Failed to fetch abilities' }, { status: 500 });
  }
}

// POST create ability
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = abilitySchema.parse(body);

    const ability = await prisma.ability.create({
      data: validatedData,
    });

    return NextResponse.json(ability, { status: 201 });
  } catch (error) {
    console.error('Error creating ability:', error);
    return NextResponse.json({ error: 'Failed to create ability' }, { status: 500 });
  }
}