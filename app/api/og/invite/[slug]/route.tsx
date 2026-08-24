import { ImageResponse } from 'next/og';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

function getAbsoluteBgUrl(rawUrl: string | null | undefined, baseUrl: string): string | null {
  if (!rawUrl || !rawUrl.trim()) return null;
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `${baseUrl}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'km';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://leangna.online';

    const event = await prisma.event.findUnique({
      where: { slug },
    });

    if (!event) {
      return new Response('Event not found', { status: 404 });
    }

    const isKm = locale !== 'en';
    const groomName = (isKm ? event.groomNameKm : event.groomNameEn) || event.groomNameKm || event.groomNameEn || 'Groom';
    const brideName = (isKm ? event.brideNameKm : event.brideNameEn) || event.brideNameKm || event.brideNameEn || 'Bride';

    const titleText = isKm ? 'សិរីមង្គលអាពាហ៍ពិពាហ៍' : 'Wedding Invitation';

    const dateText = event.eventDate
      ? new Date(event.eventDate).toLocaleDateString(isKm ? 'km-KH' : 'en-US', {
          dateStyle: 'full',
        })
      : '';

    const rawBg = event.openingImageUrl || event.coverImage || event.couplePhotoUrl;
    const bgPhoto = getAbsoluteBgUrl(rawBg, baseUrl);

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
            fontFamily: 'sans-serif',
            padding: '40px',
            position: 'relative',
          }}
        >
          {bgPhoto && (
            <img
              src={bgPhoto}
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

          {/* Inner Decorative Border with Dark Overlay */}
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
                fontSize: '26px',
                color: '#D4AF37',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                marginBottom: '15px',
                fontWeight: 'bold',
              }}
            >
              ❖ {titleText} ❖
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
              <span style={{ color: '#D4AF37', fontSize: '44px' }}>&</span>
              <span>{brideName}</span>
            </div>

            {/* Date */}
            {dateText && (
              <div
                style={{
                  fontSize: '22px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  textAlign: 'center',
                  marginTop: '10px',
                }}
              >
                {dateText}
              </div>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error('General OG Image Generation Error:', e);
    return new Response('Failed to generate general OG image', { status: 500 });
  }
}
