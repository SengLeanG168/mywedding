import { ImageResponse } from 'next/og';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; guestId: string }> }
) {
  let groomName = 'កូនកម្លោះ';
  let brideName = 'កូនក្រមុំ';
  let guestName = 'ភ្ញៀវកិត្តិយស';
  let mainTitle = 'ពិធីមង្គលអាពាហ៍ពិពាហ៍';

  try {
    const { slug, guestId } = await params;

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
    }
  } catch (dbErr) {
    console.error('Database query error in guest OG route:', dbErr);
  }

  const invitationHeader = `សូមគោរពអញ្ជើញ ${guestName}`;

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
          {/* Inner Decorative Border */}
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
            {/* Top Badge */}
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
              ❖ {mainTitle} ❖
            </div>

            {/* Groom & Bride Names */}
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
        headers: {
          'content-type': 'image/png',
          'cache-control': 'public, max-age=31536000, immutable',
        },
      }
    );
  } catch (renderErr) {
    console.error('ImageResponse render error:', renderErr);
    return new Response('OG image error', { status: 200 });
  }
}
