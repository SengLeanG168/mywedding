import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

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
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    
    // Check if slug exists
    if (body.slug) {
      const existing = await prisma.event.findUnique({ where: { slug: body.slug } });
      if (existing) {
        return NextResponse.json({ error: 'Slug already in use' }, { status: 400 });
      }
    }

    // Strip relational and system fields that cannot be created directly
    const { id: _id, createdAt: _c, updatedAt: _u, guests: _g, rsvps: _r, programDays: _p, _count: _cnt, ...data } = body;

    const event = await prisma.event.create({
      data: {
        ...data,
        coupleMonogramImageUrl: data.coupleMonogramImageUrl || null,
        transitionVideoUrl: data.transitionVideoUrl || null,
        showTransitionVideo: data.showTransitionVideo !== undefined ? Boolean(data.showTransitionVideo) : true,
        eventDate: new Date(data.eventDate),
      }
    });
    return NextResponse.json(event);
  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
