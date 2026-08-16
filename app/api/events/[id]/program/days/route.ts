import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const data = await request.json();
    
    const day = await prisma.programDay.create({
      data: {
        eventId: id,
        titleKm: data.titleKm,
        titleEn: data.titleEn,
        date: new Date(data.date),
        order: data.order || 0
      }
    });
    
    return NextResponse.json(day);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
