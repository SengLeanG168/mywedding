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
  return 'https://mywedding.com';
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const baseUrl = await getBaseUrl();

  const event = await prisma.event.findUnique({
    where: { slug },
  });

  if (!event) return {};

  const isKm = locale === 'km';
  const brideName = isKm ? event.brideNameKm : event.brideNameEn;
  const groomName = isKm ? event.groomNameKm : event.groomNameEn;

  const title = isKm
    ? `សិរីមង្គលអាពាហ៍ពិពាហ៍ ${groomName} និង ${brideName}`
    : `Wedding Invitation of ${groomName} and ${brideName}`;

  const description = isKm
    ? 'សូមគោរពអញ្ជើញចូលរួមពិធីមង្គលអាពាហ៍ពិពាហ៍'
    : 'You are warmly invited to our wedding ceremony';

  const ogImageUrl = `${baseUrl}/api/og/invite/${slug}?locale=${locale}`;
  const pageUrl = `${baseUrl}/${locale}/invite/${slug}`;

  // Build fallback absolute image URL if available
  const rawFallback = event.coverImage || event.couplePhotoUrl || event.openingImageUrl;
  let absoluteFallbackImage = '';
  if (rawFallback) {
    if (rawFallback.startsWith('http://') || rawFallback.startsWith('https://')) {
      absoluteFallbackImage = rawFallback;
    } else {
      absoluteFallbackImage = `${baseUrl}${rawFallback.startsWith('/') ? '' : '/'}${rawFallback}`;
    }
  }

  const images = [
    {
      url: ogImageUrl,
      width: 1200,
      height: 630,
      alt: `${groomName} & ${brideName}`,
    },
  ];

  if (absoluteFallbackImage) {
    images.push({
      url: absoluteFallbackImage,
      width: 1200,
      height: 630,
      alt: `${groomName} & ${brideName}`,
    });
  }

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
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl, ...(absoluteFallbackImage ? [absoluteFallbackImage] : [])],
    },
  };
}

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;

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

  return <InvitationContent event={event} locale={locale} programDays={event.programDays} />;
}
