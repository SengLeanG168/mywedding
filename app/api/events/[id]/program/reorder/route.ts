import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { days, items } = await request.json();
    
    // Update days order
    if (days && Array.isArray(days) && days.length > 0) {
      await prisma.$transaction(
        days.map((day: { id: string; order: number }) =>
          prisma.programDay.update({
            where: { id: day.id },
            data: { order: day.order }
          })
        )
      );
    }
    
    // Update items order
    if (items && Array.isArray(items) && items.length > 0) {
      await prisma.$transaction(
        items.map((item: { id: string; order: number }) =>
          prisma.programItem.update({
            where: { id: item.id },
            data: { order: item.order }
          })
        )
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to reorder program:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

