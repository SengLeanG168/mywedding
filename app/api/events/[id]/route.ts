import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const event = await prisma.event.findUnique({
      where: { id }
    });
    
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    
    // Check if slug exists for other events
    if (body.slug) {
      const existing = await prisma.event.findFirst({
        where: { slug: body.slug, id: { not: id } }
      });
      if (existing) {
        return NextResponse.json({ error: 'Slug already in use' }, { status: 400 });
      }
    }

    // Strip relational and system fields that cannot be updated directly
    const { id: _id, createdAt: _c, updatedAt: _u, guests: _g, rsvps: _r, programDays: _p, _count: _cnt, ...data } = body;

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...data,
        coupleMonogramImageUrl: data.coupleMonogramImageUrl || null,
        transitionVideoUrl: data.transitionVideoUrl || null,
        showTransitionVideo: data.showTransitionVideo !== undefined ? Boolean(data.showTransitionVideo) : true,
        eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
      }
    });
    return NextResponse.json(event);
  } catch (error: any) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    await prisma.event.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
