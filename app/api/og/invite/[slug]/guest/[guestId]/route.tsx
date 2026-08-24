import { ImageResponse } from 'next/og';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; guestId: string }> }
) {
  try {
    const { slug, guestId } = await params;
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'km';

    const event = await prisma.event.findUnique({
      where: { slug },
    });

    if (!event) {
      return new Response('Event not found', { status: 404 });
    }

    let guestName = '';
    if (guestId && event.showGuestNameInSharePreview !== false) {
      const guest = await prisma.guest.findUnique({
        where: { id: guestId, eventId: event.id },
      });
      if (guest) {
        guestName = guest.name;
      }
    }

    const isKm = locale !== 'en';
    const groomName = (isKm ? event.groomNameKm : event.brideNameKm ? event.groomNameKm : event.groomNameEn) || event.groomNameEn || 'Groom';
    const brideName = (isKm ? event.brideNameKm : event.groomNameKm ? event.brideNameKm : event.brideNameEn) || event.brideNameEn || 'Bride';

    const titleText = isKm ? 'សិរីមង្គលអាពាហ៍ពិពាហ៍' : 'Wedding Invitation';
    const invitationHeader = guestName
      ? isKm
        ? `សូមគោរពអញ្ជើញ ៖ ${guestName}`
        : `Special Invitation For: ${guestName}`
      : isKm
      ? 'សូមគោរពអញ្ជើញចូលរួមពិធីមង្គលការ'
      : 'You are warmly invited to our wedding';

    const dateText = event.eventDate
      ? new Date(event.eventDate).toLocaleDateString(isKm ? 'km-KH' : 'en-US', {
          dateStyle: 'full',
        })
      : '';

    const bgPhoto = event.openingImageUrl || event.coverImage || event.couplePhotoUrl;
    const hasValidBg = bgPhoto && (bgPhoto.startsWith('http://') || bgPhoto.startsWith('https://'));

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
          {hasValidBg && (
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
                opacity: 0.25,
              }}
            />
          )}

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
              backgroundColor: 'rgba(31, 7, 16, 0.65)',
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
              }}
            >
              ❖ {titleText} ❖
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
              <span style={{ color: '#D4AF37', fontSize: '42px' }}>&</span>
              <span>{brideName}</span>
            </div>

            {/* Guest Invitation Pill Banner */}
            <div
              style={{
                background: 'linear-gradient(90deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.45) 50%, rgba(212,175,55,0.2) 100%)',
                border: '2px solid #D4AF37',
                borderRadius: '50px',
                padding: '14px 40px',
                fontSize: '30px',
                color: '#FCE762',
                fontWeight: 'bold',
                textAlign: 'center',
                marginTop: '10px',
                marginBottom: '20px',
              }}
            >
              {invitationHeader}
            </div>

            {/* Event Date */}
            {dateText && (
              <div
                style={{
                  fontSize: '22px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  textAlign: 'center',
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
    console.error('Guest OG Image Generation Error:', e);
    return new Response('Failed to generate guest OG image', { status: 500 });
  }
}
