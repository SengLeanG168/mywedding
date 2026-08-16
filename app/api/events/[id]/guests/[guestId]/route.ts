import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import * as jose from 'jose';

async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return false;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
    await jose.jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string, guestId: string }> }
) {
  if (!await verifyAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, guestId } = await params;
  try {
    const guest = await prisma.guest.findUnique({
      where: { id: guestId, eventId: id },
      include: {
        rsvps: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
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
  { params }: { params: Promise<{ id: string, guestId: string }> }
) {
  if (!await verifyAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, guestId } = await params;
  
  try {
    const body = await request.json();
    const { name, phone, invitedCount, notes } = body;
    
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const guest = await prisma.guest.update({
      where: { id: guestId, eventId: id },
      data: {
        name,
        phone,
        invitedCount: Number(invitedCount) || 1,
        notes
      }
    });

    return NextResponse.json(guest);
  } catch (error) {
    console.error('Update guest error:', error);
    return NextResponse.json({ error: 'Failed to update guest' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string, guestId: string }> }
) {
  if (!await verifyAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, guestId } = await params;
  
  try {
    await prisma.guest.delete({
      where: { id: guestId, eventId: id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete guest' }, { status: 500 });
  }
}
