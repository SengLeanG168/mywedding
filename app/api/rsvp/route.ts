import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const rsvpSchema = z.object({
  eventId: z.string().min(1),
  guestId: z.string().optional(),
  guestName: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  status: z.enum(['ATTENDING', 'NOT_ATTENDING', 'UNSURE']),
  attendingCount: z.number().min(1).default(1),
  message: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = rsvpSchema.parse(json);
    
    // Check if event exists
    const event = await prisma.event.findUnique({ where: { id: data.eventId } });
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const rsvp = await prisma.rSVP.create({
      data: {
        eventId: data.eventId,
        guestId: data.guestId,
        guestName: data.guestName,
        phone: data.phone,
        status: data.status,
        attendingCount: data.attendingCount,
        message: data.message,
      }
    });

    return NextResponse.json({ success: true, rsvp });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
