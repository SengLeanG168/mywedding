import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sanitizeEventData } from '@/lib/event-sanitizer';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { rsvps: true, guests: true, programDays: true }
        },
        rsvps: {
          select: {
            id: true,
            status: true,
            attendingCount: true,
          }
        },
        programDays: {
          select: {
            id: true,
            _count: {
              select: { items: true }
            }
          }
        }
      }
    });
    return NextResponse.json(events);
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    
    // Check if slug exists
    if (body.slug) {
      const existing = await prisma.event.findUnique({ where: { slug: String(body.slug).trim() } });
      if (existing) {
        return NextResponse.json({ error: 'Slug already in use' }, { status: 400 });
      }
    }

    const sanitizedData = sanitizeEventData(body);

    const event = await prisma.event.create({
      data: sanitizedData as any
    });
    return NextResponse.json(event);
  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
