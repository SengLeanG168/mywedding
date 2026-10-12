import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sanitizeEventData } from '@/lib/event-sanitizer';
import { generateEventSlugCandidate, getUniqueEventSlug } from '@/lib/slug';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    
    // Generate safe candidate slug from input slug or names/titles
    const candidateSlug = generateEventSlugCandidate({
      slug: body.slug,
      eventType: body.eventType,
      eventTitle: body.eventTitle,
      celebrantName: body.celebrantName,
      hostName: body.hostName,
      groomNameEn: body.groomNameEn,
      brideNameEn: body.brideNameEn,
      groomNameKm: body.groomNameKm,
      brideNameKm: body.brideNameKm,
    });

    // Guarantee unique slug across database
    const uniqueSlug = await getUniqueEventSlug(candidateSlug);

    const sanitizedData = sanitizeEventData({
      ...body,
      slug: uniqueSlug,
      thankYouFrameImageUrl: body.thankYouFrameImageUrl ? String(body.thankYouFrameImageUrl).trim() : null,
      apologyFrameImageUrl: body.apologyFrameImageUrl ? String(body.apologyFrameImageUrl).trim() : null,
    });

    const event = await prisma.event.create({
      data: {
        ...(sanitizedData as any),
        thankYouFrameImageUrl: body.thankYouFrameImageUrl ? String(body.thankYouFrameImageUrl).trim() : null,
        apologyFrameImageUrl: body.apologyFrameImageUrl ? String(body.apologyFrameImageUrl).trim() : null,
      }
    });
    return NextResponse.json(event);
  } catch (error: any) {
    console.error('Error creating event:', error?.message || error);
    const msg = error instanceof Error ? error.message : (typeof error === 'string' && error.trim() ? error.trim() : "មិនអាចរក្សាទុកកម្មវិធីបានទេ");
    return NextResponse.json(
      {
        error: msg
      },
      { status: 500 }
    );
  }
}
