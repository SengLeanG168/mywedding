import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import IosCalendarBridge from '@/components/invitation/IosCalendarBridge';

interface CalendarPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export default async function CalendarBridgePage({ params }: CalendarPageProps) {
  const { slug, locale } = await params;

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

  return <IosCalendarBridge event={event} locale={locale} />;
}
