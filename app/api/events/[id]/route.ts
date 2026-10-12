import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sanitizeEventData } from '@/lib/event-sanitizer';
import { generateEventSlugCandidate, getUniqueEventSlug, slugify } from '@/lib/slug';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
  } catch (error: any) {
    console.error('Error fetching event by id:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    
    // Fetch current event to check existing slug
    const currentEvent = await prisma.event.findUnique({
      where: { id },
      select: { slug: true }
    });

    let finalSlug = '';
    if (body.slug && String(body.slug).trim()) {
      // User provided explicit slug, slugify it and ensure unique
      finalSlug = await getUniqueEventSlug(String(body.slug).trim(), id);
    } else if (currentEvent?.slug && String(currentEvent.slug).trim()) {
      // Keep existing slug
      finalSlug = currentEvent.slug;
    } else {
      // Event had no slug, generate one from names or fallback
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
      finalSlug = await getUniqueEventSlug(candidateSlug, id);
    }

    const sanitizedData = sanitizeEventData({
      ...body,
      slug: finalSlug,
      thankYouFrameImageUrl: body.thankYouFrameImageUrl !== undefined
        ? (body.thankYouFrameImageUrl ? String(body.thankYouFrameImageUrl).trim() : null)
        : undefined,
      apologyFrameImageUrl: body.apologyFrameImageUrl !== undefined
        ? (body.apologyFrameImageUrl ? String(body.apologyFrameImageUrl).trim() : null)
        : undefined,
    });

    const updateData: any = {
      ...(sanitizedData as any),
    };

    if (body.thankYouFrameImageUrl !== undefined) {
      updateData.thankYouFrameImageUrl = body.thankYouFrameImageUrl
        ? String(body.thankYouFrameImageUrl).trim()
        : null;
    }

    if (body.apologyFrameImageUrl !== undefined) {
      updateData.apologyFrameImageUrl = body.apologyFrameImageUrl
        ? String(body.apologyFrameImageUrl).trim()
        : null;
    }

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(event);
  } catch (error: any) {
    console.error('Error updating event:', error?.message || error);
    const msg = error instanceof Error ? error.message : (typeof error === 'string' && error.trim() ? error.trim() : "មិនអាចរក្សាទុកកម្មវិធីបានទេ");
    return NextResponse.json(
      {
        error: msg
      },
      { status: 500 }
    );
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
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
