import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; guestId: string }> }
) {
  try {
    const { slug, guestId } = await params;

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
              ❖ ពិធីមង្គលអាពាហ៍ពិពាហ៍ ❖
            </div>
            <div
              style={{
                fontSize: '52px',
                fontWeight: 'bold',
                color: '#FFFFFF',
                marginBottom: '24px',
              }}
            >
              Wedding Invitation
            </div>
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
              សូមគោរពអញ្ជើញ
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Guest OG route error:', error);
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1f0710',
            color: '#D4AF37',
            fontSize: '40px',
            fontWeight: 'bold',
          }}
        >
          Wedding Invitation
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
