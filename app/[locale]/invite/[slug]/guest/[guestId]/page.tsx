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

function getAbsoluteImageUrl(imagePath?: string | null, baseUrl?: string): string {
  const defaultAppUrl = baseUrl || (process.env.NEXT_PUBLIC_APP_URL ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '') : 'https://leangna.online');
  if (!imagePath || !imagePath.trim()) {
    return `${defaultAppUrl}/default-og-image.jpg`;
  }
  const trimmed = imagePath.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `${defaultAppUrl}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
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

  const brideName = event.brideNameKm || event.brideNameEn || '';
  const groomName = event.groomNameKm || event.groomNameEn || '';

  let guestData = null;
  if (guestId) {
    guestData = await prisma.guest.findUnique({
      where: { id: guestId, eventId: event.id },
    });
  }

  const showGuestName = event.showGuestNameInSharePreview !== false;
  const effectiveGuestName = guestData?.name || 'ភ្ញៀវកិត្តិយស';

  const title = showGuestName
    ? `សូមគោរពអញ្ជើញ ${effectiveGuestName}`
    : `សិរីមង្គលអាពាហ៍ពិពាហ៍ ${groomName} និង ${brideName}`;

  const description = showGuestName
    ? `សូមអញ្ជើញចូលរួមពិធីមង្គលអាពាហ៍ពិពាហ៍របស់ ${groomName} និង ${brideName}`
    : 'សូមគោរពអញ្ជើញចូលរួមពិធីមង្គលអាពាហ៍ពិពាហ៍';

  const pageUrl = `${baseUrl}/invite/${slug}/guest/${guestId}`;
  
  // Image priority: 1. socialPreviewImageUrl, 2. openingImageUrl, 3. coverImage, 4. couplePhotoUrl, 5. default
  const rawImagePath =
    event.socialPreviewImageUrl ||
    event.openingImageUrl ||
    event.coverImage ||
    event.couplePhotoUrl;

  const previewImageUrl = getAbsoluteImageUrl(rawImagePath, baseUrl);

  const faviconUrl = event.coupleMonogramImageUrl
    ? getAbsoluteImageUrl(event.coupleMonogramImageUrl, baseUrl)
    : `${baseUrl}/favicon.ico`;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    icons: {
      icon: [
        { url: faviconUrl },
        { url: faviconUrl, sizes: '192x192', type: 'image/png' },
      ],
      shortcut: faviconUrl,
      apple: [
        { url: faviconUrl, sizes: '180x180', type: 'image/png' },
      ],
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: `${groomName} & ${brideName} Wedding`,
      locale: 'km_KH',
      type: 'website',
      images: [
        {
          url: previewImageUrl,
          secureUrl: previewImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [previewImageUrl],
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

  return <InvitationContent event={event} locale="km" guest={guestData} programDays={event.programDays} />;
}
