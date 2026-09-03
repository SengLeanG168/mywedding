import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateEventICS } from '@/lib/calendar-ics';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; guestId: string }> }
) {
  try {
    const { slug, guestId } = await params;

    let event = await prisma.event.findUnique({
      where: { slug },
    });

    if (!event) {
      event = await prisma.event.findUnique({
        where: { id: slug },
      });
    }

    if (!event) {
      return new NextResponse('Event not found', { status: 404 });
    }

    let guestName = '';
    if (guestId) {
      const guest = await prisma.guest.findUnique({
        where: { id: guestId, eventId: event.id },
      });
      if (guest?.name) {
        guestName = guest.name;
      }
    }

    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = `${protocol}://${host}/invite/${event.slug}/guest/${guestId}`;

    const icsContent = generateEventICS(event, 'km', baseUrl);

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8; method=PUBLISH',
        'Content-Disposition': 'inline; filename="wedding-invitation.ics"',
        'Cache-Control': 'no-store, max-age=0',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Error generating guest calendar .ics:', error);
    return new NextResponse('Error generating calendar file', { status: 500 });
  }
}
