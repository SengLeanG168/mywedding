import { ImageResponse } from 'next/og';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

function loadKhmerFont(): ArrayBuffer | null {
  try {
    const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Siemreap-Regular.ttf');
    if (fs.existsSync(fontPath)) {
      const buffer = fs.readFileSync(fontPath);
      return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    }
  } catch (err) {
    console.error('Font load error:', err);
  }
  return null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  let groomName = 'កូនកម្លោះ';
  let brideName = 'កូនក្រមុំ';
  let mainTitle = 'សិរីមង្គលអាពាហ៍ពិពាហ៍';
  let bgDataUri: string | null = null;

  try {
    const { slug } = await params;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://leangna.online';

    const event = await prisma.event.findUnique({
      where: { slug },
    });

    if (event) {
      groomName = event.groomNameKm || event.groomNameEn || groomName;
      brideName = event.brideNameKm || event.brideNameEn || brideName;

      const rawBg = event.openingImageUrl || event.coverImage || event.couplePhotoUrl;
      if (rawBg && typeof rawBg === 'string' && rawBg.trim()) {
        const trimmed = rawBg.trim();
        const fullBgUrl = trimmed.startsWith('http') ? trimmed : `${baseUrl}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
        try {
          const imgRes = await fetch(fullBgUrl, { signal: AbortSignal.timeout(3000) });
          if (imgRes.ok) {
            const buffer = await imgRes.arrayBuffer();
            const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
            const base64 = Buffer.from(buffer).toString('base64');
            bgDataUri = `data:${contentType};base64,${base64}`;
          }
        } catch (fetchErr) {
          console.error('Background photo fetch error:', fetchErr);
        }
      }
    }
  } catch (dbErr) {
    console.error('Database query error in general OG route:', dbErr);
  }

  const fontBuffer = loadKhmerFont();

  const fontsOption = fontBuffer
    ? [
        {
          name: 'KhmerFont',
          data: fontBuffer,
          style: 'normal' as const,
          weight: 400 as const,
        },
      ]
    : undefined;

  try {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1f0710 0%, #3d0c1c 50%, #15030a 100%)',
            color: '#FBF7F0',
            fontFamily: fontBuffer ? 'KhmerFont, sans-serif' : 'sans-serif',
            padding: '40px',
            position: 'relative',
          }}
        >
          {bgDataUri && (
            <img
              src={bgDataUri}
              alt="Background"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.3,
              }}
            />
          )}

          {/* Inner Decorative Border with Dark Transparent Overlay */}
          <div
            style={{
              position: 'absolute',
              top: '25px',
              left: '25px',
              right: '25px',
              bottom: '25px',
              border: '3px solid #D4AF37',
              borderRadius: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '30px',
              backgroundColor: 'rgba(31, 7, 16, 0.75)',
            }}
          >
            {/* Top Ornamental Title */}
            <div
              style={{
                fontSize: '28px',
                color: '#D4AF37',
                letterSpacing: '2px',
                marginBottom: '15px',
                fontWeight: 'bold',
              }}
            >
              ❖ {mainTitle} ❖
            </div>

            {/* Couple Names Banner */}
            <div
              style={{
                fontSize: '56px',
                fontWeight: 'bold',
                color: '#FFFFFF',
                textAlign: 'center',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
              }}
            >
              <span>{groomName}</span>
              <span style={{ color: '#D4AF37', fontSize: '44px' }}>និង</span>
              <span>{brideName}</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: fontsOption,
      }
    );
  } catch (renderErr) {
    console.error('ImageResponse render error:', renderErr);
    return new Response('OG Image Error', { status: 200 });
  }
}
