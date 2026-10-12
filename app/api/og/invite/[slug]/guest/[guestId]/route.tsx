import { ImageResponse } from 'next/og';
import prisma from '@/lib/prisma';
import { getEventTitle, getEventMainName, isWeddingEvent } from '@/lib/event-helpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; guestId: string }> }
) {
  let groomName = 'កូនកម្លោះ';
  let brideName = 'កូនក្រមុំ';
  let guestName = 'ភ្ញៀវកិត្តិយស';
  let mainTitle = 'សិរីមង្គលអាពាហ៍ពិពាហ៍';
  let middleText = 'កូនកម្លោះ និង កូនក្រមុំ';
  let isWedding = true;

  try {
    const { slug, guestId } = await params;

    if (slug) {
      try {
        const event = await prisma.event.findFirst({
          where: {
            OR: [
              { slug },
              { id: slug },
            ],
          },
        });

        if (event) {
          mainTitle = getEventTitle(event, true);
          isWedding = isWeddingEvent(event);
          if (isWedding) {
            groomName = event.groomNameKm || event.groomNameEn || groomName;
            brideName = event.brideNameKm || event.brideNameEn || brideName;
          } else {
            middleText = getEventMainName(event, true);
          }

          if (guestId && event.showGuestNameInSharePreview !== false) {
            try {
              const guest = await prisma.guest.findUnique({
                where: { id: guestId, eventId: event.id },
              });
              if (guest?.name) {
                guestName = guest.name;
              }
            } catch (gErr) {
              console.error('Guest query error in OG route:', gErr);
            }
          }
        }
      } catch (eErr) {
        console.error('Event query error in OG route:', eErr);
      }
    }
  } catch (paramErr) {
    console.error('Params error in OG route:', paramErr);
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
            padding: '40px',
          }}
        >
          <div
            style={{
              border: '3px solid #D4AF37',
              borderRadius: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 60px',
              backgroundColor: 'rgba(31, 7, 16, 0.85)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '28px',
                color: '#D4AF37',
                letterSpacing: '2px',
                marginBottom: '20px',
                fontWeight: 'bold',
              }}
            >
              ❖ {mainTitle} ❖
            </div>
            {isWedding ? (
              <div
                style={{
                  fontSize: '52px',
                  fontWeight: 'bold',
                  color: '#FFFFFF',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                }}
              >
                <span>{groomName}</span>
                <span style={{ color: '#D4AF37' }}>និង</span>
                <span>{brideName}</span>
              </div>
            ) : (
              <div
                style={{
                  fontSize: '52px',
                  fontWeight: 'bold',
                  color: '#FFFFFF',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span>{middleText}</span>
              </div>
            )}
            <div
              style={{
                background: 'linear-gradient(90deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.5) 50%, rgba(212,175,55,0.2) 100%)',
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
  } catch (renderErr) {
    console.error('OG image render error:', renderErr);

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
            backgroundColor: '#1f0710',
            color: '#D4AF37',
            fontSize: '40px',
            fontWeight: 'bold',
          }}
        >
          <div>Wedding Invitation</div>
          <div style={{ fontSize: '28px', color: '#FFFFFF', marginTop: '10px' }}>
            សូមគោរពអញ្ជើញ
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
