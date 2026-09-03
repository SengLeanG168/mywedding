import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import IosCalendarBridge from '@/components/invitation/IosCalendarBridge';

interface GuestCalendarPageProps {
  params: Promise<{ slug: string; guestId: string; locale: string }>;
}

export default async function GuestCalendarBridgePage({ params }: GuestCalendarPageProps) {
  const { slug, guestId, locale } = await params;

  let event = await prisma.event.findUnique({
    where: { slug },
  });

  if (!event) {
    event = await prisma.event.findUnique({
      where: { id: slug },
    });
  }

  if (!event) {
    notFound();
  }

  return <IosCalendarBridge event={event} guestId={guestId} locale={locale} />;
}
