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

function getAbsoluteImageUrl(imagePath?: string | null, baseUrl?: string): string | null {
  if (!imagePath || !imagePath.trim()) return null;
  const defaultAppUrl = baseUrl || (process.env.NEXT_PUBLIC_APP_URL ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '') : 'https://leangna.online');
  const trimmed = imagePath.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `${defaultAppUrl}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
}

function getMimeType(url: string): string {
  const lower = url.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
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

  const isKm = locale !== 'en';
  const brideName = (isKm ? event.brideNameKm : event.brideNameEn) || event.brideNameKm || event.brideNameEn || '';
  const groomName = (isKm ? event.groomNameKm : event.groomNameEn) || event.groomNameKm || event.groomNameEn || '';

  const title = isKm
    ? `សិរីមង្គលអាពាហ៍ពិពាហ៍ ${groomName} និង ${brideName}`
    : `Wedding Invitation of ${groomName} and ${brideName}`;

  const description = isKm
    ? 'សូមគោរពអញ្ជើញចូលរួមពិធីមង្គលអាពាហ៍ពិពាហ៍'
    : 'You are warmly invited to our wedding ceremony';

  const pageUrl = `${baseUrl}/${locale === 'en' ? 'en/' : ''}invite/${slug}`;
  
  // Dedicated optimized 1200x630 dynamic OG card route for event
  const dynamicOgUrl = `${baseUrl}/api/og/invite/${slug}?locale=${isKm ? 'km' : 'en'}`;

  // Fallback raw uploaded photo if available
  const rawImagePath = event.openingImageUrl || event.coverImage || event.couplePhotoUrl;
  const primaryRawImageUrl = getAbsoluteImageUrl(rawImagePath, baseUrl);

  // Debug log for OG image URL
  console.log(`[OG Metadata Event] Slug: ${slug}, OG Image URL: ${dynamicOgUrl}`);

  const images: Array<{
    url: string;
    secureUrl?: string;
    width?: number;
    height?: number;
    alt?: string;
    type?: string;
  }> = [
    {
      url: dynamicOgUrl,
      secureUrl: dynamicOgUrl,
      width: 1200,
      height: 630,
      alt: title,
      type: 'image/png',
    },
  ];

  if (primaryRawImageUrl) {
    images.push({
      url: primaryRawImageUrl,
      secureUrl: primaryRawImageUrl,
      width: 1200,
      height: 630,
      alt: title,
      type: getMimeType(primaryRawImageUrl),
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
      images: [dynamicOgUrl],
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
