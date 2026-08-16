import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { saveFile, VIDEO_CONFIG } from '@/lib/upload';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const result = await saveFile(file, VIDEO_CONFIG);

    if (result.success && result.path) {
      return NextResponse.json({ success: true, url: result.path });
    } else {
      return NextResponse.json({ error: result.error || 'Upload failed' }, { status: 400 });
    }
  } catch (error) {
    console.error('Video upload error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
