import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;

    if (!eventId) {
      return NextResponse.json({ error: 'eventId is required' }, { status: 400 });
    }

    const rsvps = await prisma.rSVP.findMany({
      where: {
        eventId,
        message: { not: null, notIn: [''] },
      },
      select: {
        id: true,
        guestName: true,
        message: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const wishes = rsvps
      .filter((r) => r.message && r.message.trim().length > 0)
      .map((r) => ({
        id: r.id,
        guestName: r.guestName ? r.guestName.trim() : 'ភ្ញៀវកិត្តិយស',
        message: r.message!.trim(),
        createdAt: r.createdAt,
      }));

    return NextResponse.json({ wishes });
  } catch (error) {
    console.error('Fetch public wishes error:', error);
    return NextResponse.json({ wishes: [] });
  }
}
