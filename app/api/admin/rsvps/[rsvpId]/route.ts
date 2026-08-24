import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const updateRsvpSchema = z.object({
  guestName: z.string().min(1, 'Name is required').optional(),
  phone: z.string().optional().nullable(),
  status: z.enum(['ATTENDING', 'NOT_ATTENDING', 'UNSURE']).optional(),
  attendingCount: z.number().min(1).optional(),
  message: z.string().optional().nullable(),
  side: z.enum(['groom', 'bride']).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ rsvpId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { rsvpId } = await params;
    const json = await request.json();
    const data = updateRsvpSchema.parse(json);

    const existingRsvp = await prisma.rSVP.findUnique({
      where: { id: rsvpId },
      include: { guest: true },
    });

    if (!existingRsvp) {
      return NextResponse.json({ error: 'RSVP not found' }, { status: 404 });
    }

    const updatedRsvp = await prisma.rSVP.update({
      where: { id: rsvpId },
      data: {
        ...(data.guestName !== undefined && { guestName: data.guestName }),
        ...(data.phone !== undefined && { phone: data.phone || '' }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.attendingCount !== undefined && { attendingCount: data.attendingCount }),
        ...(data.message !== undefined && { message: data.message }),
      },
      include: { guest: true },
    });

    // If side was provided and a guest record exists, update guest side
    if (data.side && existingRsvp.guestId) {
      await prisma.guest.update({
        where: { id: existingRsvp.guestId },
        data: {
          side: data.side,
          ...(data.guestName && { name: data.guestName }),
        },
      });
    }

    return NextResponse.json({ success: true, rsvp: updatedRsvp });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Update RSVP error:', error);
    return NextResponse.json({ error: 'Failed to update RSVP' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ rsvpId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { rsvpId } = await params;

    const existingRsvp = await prisma.rSVP.findUnique({
      where: { id: rsvpId },
    });

    if (!existingRsvp) {
      return NextResponse.json({ error: 'RSVP not found' }, { status: 404 });
    }

    await prisma.rSVP.delete({
      where: { id: rsvpId },
    });

    return NextResponse.json({ success: true, message: 'RSVP deleted successfully' });
  } catch (error) {
    console.error('Delete RSVP error:', error);
    return NextResponse.json({ error: 'Failed to delete RSVP' }, { status: 500 });
  }
}
