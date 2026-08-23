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
    const data = await request.json();
    
    // Check if slug exists
    const existing = await prisma.event.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return NextResponse.json({ error: 'Slug already in use' }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        ...data,
        eventDate: new Date(data.eventDate),
      }
    });
    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
