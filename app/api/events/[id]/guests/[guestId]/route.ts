import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; guestId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: eventId, guestId } = await params;
  try {
    const guest = await prisma.guest.findFirst({
      where: { id: guestId, eventId },
      include: {
        rsvps: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    return NextResponse.json(guest);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch guest' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; guestId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: eventId, guestId } = await params;

  try {
    const body = await request.json();
    const { name, phone, side, invitedCount, notes } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Verify guest exists for this event
    const existing = await prisma.guest.findFirst({
      where: { id: guestId, eventId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    const guest = await prisma.guest.update({
      where: { id: guestId },
      data: {
        name,
        phone,
        side: side || 'groom',
        invitedCount: Number(invitedCount) || 1,
        notes,
      },
    });

    return NextResponse.json(guest);
  } catch (error) {
    console.error('Update guest error:', error);
    return NextResponse.json({ error: 'Failed to update guest' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; guestId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: eventId, guestId } = await params;

  try {
    // Verify guest exists for this event
    const guest = await prisma.guest.findFirst({
      where: { id: guestId, eventId },
    });

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    // Relation safety: Unlink RSVPs first so foreign key constraints do not crash delete
    await prisma.rSVP.updateMany({
      where: { guestId },
      data: { guestId: null },
    });

    // Delete guest using primary key id
    await prisma.guest.delete({
      where: { id: guestId },
    });

    return NextResponse.json({ success: true, message: 'Guest deleted successfully' });
  } catch (error) {
    console.error('Delete guest error:', error);
    return NextResponse.json({ error: 'Failed to delete guest' }, { status: 500 });
  }
}
