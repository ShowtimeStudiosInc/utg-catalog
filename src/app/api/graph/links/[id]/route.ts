import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await prisma.entityLink.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting graph link:', error);
    return NextResponse.json({ error: 'Failed to delete this link.' }, { status: 500 });
  }
}
