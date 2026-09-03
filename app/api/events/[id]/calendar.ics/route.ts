import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateEventICS } from '@/lib/calendar-ics';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      event = await prisma.event.findUnique({
        where: { slug: id },
      });
    }

    if (!event) {
      return new NextResponse('Event not found', { status: 404 });
    }

    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = `${protocol}://${host}/invite/${event.slug}`;

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
    console.error('Error generating calendar .ics:', error);
    return new NextResponse('Error generating calendar file', { status: 500 });
  }
}
