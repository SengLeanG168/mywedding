import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: Promise<{ id: string, dayId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { dayId } = await params;
    const data = await request.json();
    
    const item = await prisma.programItem.create({
      data: {
        programDayId: dayId,
        time: data.time,
        titleKm: data.titleKm,
        titleEn: data.titleEn,
        descriptionKm: data.descriptionKm,
        descriptionEn: data.descriptionEn,
        order: data.order || 0
      }
    });
    
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
