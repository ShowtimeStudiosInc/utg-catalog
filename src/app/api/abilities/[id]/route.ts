import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { abilitySchema } from '@/lib/validations';
import { serializeAbilityClassification } from '@/lib/ability-classification';

// GET single ability
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ability = await prisma.ability.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!ability) {
      return NextResponse.json({ error: 'Ability not found' }, { status: 404 });
    }

    return NextResponse.json(ability);
  } catch (error) {
    console.error('Error fetching ability:', error);
    return NextResponse.json({ error: 'Failed to fetch ability' }, { status: 500 });
  }
}

// PUT update ability
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = abilitySchema.parse(body);

    const ability = await prisma.ability.update({
      where: { id },
      data: {
        ...validatedData,
        abilityType: serializeAbilityClassification(validatedData.abilityType) ?? (Array.isArray(validatedData.abilityType) ? '[]' : undefined),
        abilityClass: serializeAbilityClassification(validatedData.abilityClass) ?? (Array.isArray(validatedData.abilityClass) ? '[]' : undefined),
      },
    });

    return NextResponse.json(ability);
  } catch (error) {
    console.error('Error updating ability:', error);
    return NextResponse.json({ error: 'Failed to update ability' }, { status: 500 });
  }
}

// DELETE ability
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.ability.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ability:', error);
    return NextResponse.json({ error: 'Failed to delete ability' }, { status: 500 });
  }
}
