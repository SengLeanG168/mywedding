import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import InvitationContent from '@/components/invitation/InvitationContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mywedding.com';

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
          width: 1200,
          height: 630,
          alt: `${groomName} & ${brideName}`,
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
