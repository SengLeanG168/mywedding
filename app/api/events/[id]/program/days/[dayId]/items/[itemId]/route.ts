import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string, dayId: string, itemId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { itemId } = await params;
    const data = await request.json();
    
    const item = await prisma.programItem.update({
      where: { id: itemId },
      data: {
        time: data.time,
        titleKm: data.titleKm,
        titleEn: data.titleEn,
        descriptionKm: data.descriptionKm,
        descriptionEn: data.descriptionEn,
        order: data.order
      }
    });
    
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string, dayId: string, itemId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { itemId } = await params;
    await prisma.programItem.delete({
      where: { id: itemId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
