import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; dayId: string; itemId: string }> | { id: string; dayId: string; itemId: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const resolvedParams = await Promise.resolve(params);
    const itemId = resolvedParams.itemId;
    if (!itemId) {
      return NextResponse.json({ error: 'Missing itemId parameter' }, { status: 400 });
    }

    const data = await request.json();
    
    const updateData: any = {};
    if (data.time !== undefined) updateData.time = String(data.time || '');
    if (data.titleKm !== undefined) updateData.titleKm = String(data.titleKm || '');
    if (data.titleEn !== undefined) updateData.titleEn = String(data.titleEn || '');
    if (data.descriptionKm !== undefined) updateData.descriptionKm = data.descriptionKm ? String(data.descriptionKm).trim() : null;
    if (data.descriptionEn !== undefined) updateData.descriptionEn = data.descriptionEn ? String(data.descriptionEn).trim() : null;
    if (data.iconType !== undefined) updateData.iconType = data.iconType ? String(data.iconType).trim() : null;
    if (data.iconImageUrl !== undefined) {
      updateData.iconImageUrl = data.iconImageUrl ? String(data.iconImageUrl).trim() : null;
    }
    if (data.order !== undefined) updateData.order = Number(data.order) || 0;

    const item = await prisma.programItem.update({
      where: { id: itemId },
      data: updateData
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; dayId: string; itemId: string }> | { id: string; dayId: string; itemId: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const resolvedParams = await Promise.resolve(params);
    const itemId = resolvedParams.itemId;
    if (!itemId) {
      return NextResponse.json({ error: 'Missing itemId parameter' }, { status: 400 });
    }

    await prisma.programItem.delete({
      where: { id: itemId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Program item delete error:", {
        message: error instanceof Error ? error.message : String(error),
        error,
      });
    }
    return NextResponse.json({ error: error?.message || 'មិនអាចលុបកាលវិភាគបានទេ' }, { status: 500 });
  }
}


