import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; dayId: string }> | { id: string; dayId: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const resolvedParams = await Promise.resolve(params);
    const dayId = resolvedParams.dayId;
    if (!dayId) {
      return NextResponse.json({ error: 'Missing dayId parameter' }, { status: 400 });
    }

    const data = await request.json();
    
    const item = await prisma.programItem.create({
      data: {
        programDayId: dayId,
        time: String(data.time || ''),
        titleKm: String(data.titleKm || ''),
        titleEn: String(data.titleEn || ''),
        descriptionKm: data.descriptionKm ? String(data.descriptionKm).trim() : null,
        descriptionEn: data.descriptionEn ? String(data.descriptionEn).trim() : null,
        iconType: data.iconType ? String(data.iconType).trim() : null,
        iconImageUrl: data.iconImageUrl ? String(data.iconImageUrl).trim() : null,
        order: Number(data.order) || 0
      }
    });
    
    return NextResponse.json(item);
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Program icon save/upload error:", {
        message: error instanceof Error ? error.message : String(error),
        error,
      });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "មិនអាចរក្សាទុកកម្មវិធីបានទេ" },
      { status: 500 }
    );
  }
}


