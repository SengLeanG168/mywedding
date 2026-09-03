import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import AndroidCalendarBridge from '@/components/invitation/AndroidCalendarBridge';

interface AndroidCalendarPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export default async function AndroidCalendarPage({ params }: AndroidCalendarPageProps) {
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

  return <AndroidCalendarBridge event={event} locale={locale} />;
}
