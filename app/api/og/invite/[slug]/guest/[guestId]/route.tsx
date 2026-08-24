import { ImageResponse } from 'next/og';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

function getAbsoluteBgUrl(rawUrl: string | null | undefined, baseUrl: string): string | null {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) return null;
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `${baseUrl}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; guestId: string }> }
) {
  let groomName = 'កូនកម្លោះ';
  let brideName = 'កូនក្រមុំ';
  let guestName = 'ភ្ញៀវកិត្តិយស';
  let mainTitle = 'ពិធីមង្គលអាពាហ៍ពិពាហ៍';
  let bgPhoto: string | null = null;

  try {
    const { slug, guestId } = await params;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://leangna.online';

    const event = await prisma.event.findUnique({
      where: { slug },
    });

    if (event) {
      groomName = event.groomNameKm || event.groomNameEn || groomName;
      brideName = event.brideNameKm || event.brideNameEn || brideName;

      if (guestId && event.showGuestNameInSharePreview !== false) {
        try {
          const guest = await prisma.guest.findUnique({
            where: { id: guestId, eventId: event.id },
          });
          if (guest?.name) {
            guestName = guest.name;
          }
        } catch (gErr) {
          console.error('Guest lookup error in OG route:', gErr);
        }
      }

      const rawBg = event.openingImageUrl || event.coverImage || event.couplePhotoUrl;
      bgPhoto = getAbsoluteBgUrl(rawBg, baseUrl);
    }
  } catch (dbErr) {
    console.error('Database query error in guest OG route:', dbErr);
  }

  const invitationHeader = `សូមគោរពអញ្ជើញ ៖ ${guestName}`;

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
            {/* Top Badge */}
            <div
              style={{
                fontSize: '24px',
                color: '#D4AF37',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                marginBottom: '15px',
                fontWeight: 'bold',
              }}
            >
              ❖ {mainTitle} ❖
            </div>

            {/* Groom & Bride Names */}
            <div
              style={{
                fontSize: '54px',
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
              <span style={{ color: '#D4AF37', fontSize: '42px' }}>និង</span>
              <span>{brideName}</span>
            </div>

            {/* Guest Invitation Pill Banner */}
            <div
              style={{
                background: 'linear-gradient(90deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.5) 50%, rgba(212,175,55,0.2) 100%)',
                border: '2px solid #D4AF37',
                borderRadius: '50px',
                padding: '14px 45px',
                fontSize: '32px',
                color: '#FCE762',
                fontWeight: 'bold',
                textAlign: 'center',
                marginTop: '10px',
                marginBottom: '20px',
              }}
            >
              {invitationHeader}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (renderErr) {
    console.error('ImageResponse render error with background image, rendering pure gradient fallback:', renderErr);

    // Bulletproof Fallback ImageResponse without background image
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
              backgroundColor: 'rgba(31, 7, 16, 0.85)',
            }}
          >
            <div style={{ fontSize: '24px', color: '#D4AF37', fontWeight: 'bold', marginBottom: '15px' }}>
              ❖ {mainTitle} ❖
            </div>
            <div style={{ fontSize: '54px', fontWeight: 'bold', color: '#FFFFFF', marginBottom: '20px' }}>
              {groomName} & {brideName}
            </div>
            <div
              style={{
                background: 'rgba(212,175,55,0.3)',
                border: '2px solid #D4AF37',
                borderRadius: '50px',
                padding: '14px 45px',
                fontSize: '32px',
                color: '#FCE762',
                fontWeight: 'bold',
              }}
            >
              {invitationHeader}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
