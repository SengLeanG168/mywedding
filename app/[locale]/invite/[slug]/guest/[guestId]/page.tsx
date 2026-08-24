import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import InvitationContent from '@/components/invitation/InvitationContent';

async function getBaseUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  try {
    const headerList = await headers();
    const host = headerList.get('x-forwarded-host') || headerList.get('host');
    const proto = headerList.get('x-forwarded-proto') || 'https';
    if (host) {
      return `${proto}://${host}`;
    }
  } catch (e) {
    // Fallback if headers cannot be read
  }
  return 'https://leangna.online';
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string; guestId: string }>;
}): Promise<Metadata> {
  const { slug, locale, guestId } = await params;
  const baseUrl = await getBaseUrl();

  const event = await prisma.event.findUnique({
    where: { slug },
  });

  if (!event) return {};

  const isKm = locale !== 'en';
  const brideName = (isKm ? event.brideNameKm : event.brideNameEn) || event.brideNameKm || event.brideNameEn || '';
  const groomName = (isKm ? event.groomNameKm : event.groomNameEn) || event.groomNameKm || event.groomNameEn || '';

  let guestData = null;
  if (guestId) {
    guestData = await prisma.guest.findUnique({
      where: { id: guestId, eventId: event.id },
    });
  }

  const showGuestName = event.showGuestNameInSharePreview !== false;
  const effectiveGuestName = guestData?.name || (isKm ? 'ភ្ញៀវកិត្តិយស' : 'Honored Guest');

  const title = showGuestName
    ? isKm
      ? `សូមគោរពអញ្ជើញ ${effectiveGuestName}`
      : `Invitation for ${effectiveGuestName}`
    : isKm
    ? `សិរីមង្គលអាពាហ៍ពិពាហ៍ ${groomName} និង ${brideName}`
    : `Wedding Invitation of ${groomName} and ${brideName}`;

  const description = showGuestName
    ? isKm
      ? `សូមអញ្ជើញចូលរួមពិធីមង្គលអាពាហ៍ពិពាហ៍របស់ ${groomName} និង ${brideName}`
      : `You are invited to the wedding ceremony of ${groomName} and ${brideName}`
    : isKm
    ? 'សូមគោរពអញ្ជើញចូលរួមពិធីមង្គលអាពាហ៍ពិពាហ៍'
    : 'You are warmly invited to our wedding ceremony';

  const pageUrl = `${baseUrl}/${locale === 'en' ? 'en/' : ''}invite/${slug}/guest/${guestId}`;
  
  // Dynamic 1200x630 OG image route for guest-specific link
  const ogImageUrl = `${baseUrl}/api/og/invite/${slug}/guest/${guestId}`;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: `${groomName} & ${brideName} Wedding`,
      locale: isKm ? 'km_KH' : 'en_US',
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          secureUrl: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function GuestInvitationPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string; guestId: string }>;
}) {
  const { slug, locale, guestId } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      programDays: {
        include: {
          items: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!event) notFound();

  let guestData = null;
  if (guestId) {
    guestData = await prisma.guest.findUnique({
      where: { id: guestId, eventId: event.id },
    });
  }

  return <InvitationContent event={event} locale={locale} guest={guestData} programDays={event.programDays} />;
}
