import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function POST(request: Request): Promise<NextResponse> {
  // 1. Check if BLOB_READ_WRITE_TOKEN is configured
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error: 'BLOB_READ_WRITE_TOKEN is missing',
        messageKm: 'មិនទាន់បានកំណត់ BLOB_READ_WRITE_TOKEN ទេ។ Upload នឹងប្រើ local fallback សម្រាប់ development ប៉ុណ្ណោះ។',
        missingToken: true,
      },
      { status: 400 }
    );
  }

  try {
    const body = (await request.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const session = await getSession();
        if (!session) {
          throw new Error('Unauthorized');
        }

        return {
          allowedContentTypes: [
            // Images
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/svg+xml',
            'image/gif',
            // Videos
            'video/mp4',
            'video/webm',
            'video/quicktime',
            // Audio
            'audio/mpeg',
            'audio/wav',
            'audio/x-wav',
            'audio/mp4',
            'audio/x-m4a',
            'audio/ogg',
            'audio/aac',
            'audio/flac',
            'audio/webm',
          ],
          tokenPayload: JSON.stringify({
            userId: session.userId || session.id,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Log completed blob upload
        console.log('Vercel Blob client upload completed:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    console.error('Blob upload handler error:', error?.message || error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to authorize Blob upload',
        missingToken: error?.message?.includes('token'),
      },
      { status: 400 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  const hasToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  return NextResponse.json({
    blobEnabled: hasToken,
    isProduction: process.env.NODE_ENV === 'production',
  });
}
