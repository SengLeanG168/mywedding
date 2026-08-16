import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string, dayId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { dayId } = await params;
    const data = await request.json();
    
    const day = await prisma.programDay.update({
      where: { id: dayId },
      data: {
        titleKm: data.titleKm,
        titleEn: data.titleEn,
        date: data.date ? new Date(data.date) : undefined,
        order: data.order
      }
    });
    
    return NextResponse.json(day);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string, dayId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { dayId } = await params;
    await prisma.programDay.delete({
      where: { id: dayId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
