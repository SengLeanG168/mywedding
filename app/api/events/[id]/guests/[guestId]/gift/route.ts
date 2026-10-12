import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PATCH(
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

    const existingGuest = await prisma.guest.findFirst({
      where: { id: guestId, eventId },
    });

    if (!existingGuest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    const giftReceived = Boolean(body.giftReceived);
    const giftAmountKhr =
      body.giftAmountKhr !== null && body.giftAmountKhr !== undefined && body.giftAmountKhr !== ''
        ? Math.round(Number(body.giftAmountKhr))
        : null;
    const giftAmountUsd =
      body.giftAmountUsd !== null && body.giftAmountUsd !== undefined && body.giftAmountUsd !== ''
        ? Number(Number(body.giftAmountUsd).toFixed(2))
        : null;
    const giftNote = body.giftNote ? String(body.giftNote).trim() : null;

    let giftReceivedAt: Date | null = null;
    if (body.giftReceivedAt) {
      const parsed = new Date(body.giftReceivedAt);
      if (!isNaN(parsed.getTime())) {
        giftReceivedAt = parsed;
      }
    } else if (giftReceived) {
      giftReceivedAt = new Date();
    }

    const updatedGuest = await prisma.guest.update({
      where: { id: guestId },
      data: {
        giftReceived,
        giftAmountKhr: giftReceived ? giftAmountKhr : null,
        giftAmountUsd: giftReceived ? (giftAmountUsd !== null ? giftAmountUsd : null) : null,
        giftNote: giftReceived ? giftNote : null,
        giftReceivedAt: giftReceived ? giftReceivedAt : null,
      },
      include: {
        rsvps: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return NextResponse.json(updatedGuest);
  } catch (error: any) {
    console.error('Update gift error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update gift information' },
      { status: 500 }
    );
  }
}
