import { ImageResponse } from 'next/og';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  let groomName = 'កូនកម្លោះ';
  let brideName = 'កូនក្រមុំ';
  let mainTitle = 'សិរីមង្គលអាពាហ៍ពិពាហ៍';

  try {
    const { slug } = await params;

    if (slug) {
      try {
        const event = await prisma.event.findUnique({
          where: { slug },
        });

        if (event) {
          groomName = event.groomNameKm || event.groomNameEn || groomName;
          brideName = event.brideNameKm || event.brideNameEn || brideName;
        }
      } catch (eErr) {
        console.error('Event query error in OG route:', eErr);
      }
    }
  } catch (paramErr) {
    console.error('Params error in OG route:', paramErr);
  }

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
            <div
              style={{
                fontSize: '52px',
                fontWeight: 'bold',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
              }}
            >
              <span>{groomName}</span>
              <span style={{ color: '#D4AF37' }}>និង</span>
              <span>{brideName}</span>
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
    console.error('General OG image render error:', renderErr);

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
            សិរីមង្គលអាពាហ៍ពិពាហ៍
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
