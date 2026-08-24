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

function getAbsoluteImageUrl(rawUrl: string | null | undefined, baseUrl: string): string | null {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) return null;
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${baseUrl}${cleanPath}`;
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

  const pageUrl = `${baseUrl}/${locale}/invite/${slug}`;
  const dynamicOgUrl = `${baseUrl}/api/og/invite/${slug}?locale=${locale}`;

  // Image Priority:
  // 1. openingImageUrl (Image used on opening screen page with "បើកធៀប" button)
  // 2. coverImage
  // 3. couplePhotoUrl
  // 4. Default dynamic OG image
  const primaryImageUrl =
    getAbsoluteImageUrl(event.openingImageUrl, baseUrl) ||
    getAbsoluteImageUrl(event.coverImage, baseUrl) ||
    getAbsoluteImageUrl(event.couplePhotoUrl, baseUrl) ||
    dynamicOgUrl;

  const images: Array<{ url: string; width?: number; height?: number; alt?: string }> = [
    {
      url: primaryImageUrl,
      width: 1200,
      height: 630,
      alt: title,
    },
  ];

  if (primaryImageUrl !== dynamicOgUrl) {
    images.push({
      url: dynamicOgUrl,
      width: 1200,
      height: 630,
      alt: title,
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
      images: [primaryImageUrl],
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
