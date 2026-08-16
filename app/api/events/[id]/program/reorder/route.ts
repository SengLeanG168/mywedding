import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const { days, items } = await request.json();
    
    // Update days order
    if (days && Array.isArray(days)) {
      for (const day of days) {
        await prisma.programDay.update({
          where: { id: day.id },
          data: { order: day.order }
        });
      }
    }
    
    // Update items order
    if (items && Array.isArray(items)) {
      for (const item of items) {
        await prisma.programItem.update({
          where: { id: item.id },
          data: { order: item.order }
        });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
