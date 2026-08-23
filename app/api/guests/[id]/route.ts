import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getSession } from '@/lib/auth';

const guestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  side: z.string().optional().nullable(),
  invitedCount: z.number().min(1).default(1),
  notes: z.string().optional().nullable(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const json = await request.json();
    const data = guestSchema.parse(json);

    const guest = await prisma.guest.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        side: data.side || 'groom',
        invitedCount: data.invitedCount,
        notes: data.notes,
      }
    });

    return NextResponse.json(guest);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    
    // Disconnect RSVPs first for relation safety
    await prisma.rSVP.updateMany({
      where: { guestId: id },
      data: { guestId: null }
    });

    await prisma.guest.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete guest error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
