import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import AndroidCalendarBridge from '@/components/invitation/AndroidCalendarBridge';

interface GuestAndroidCalendarPageProps {
  params: Promise<{ slug: string; guestId: string; locale: string }>;
}

export default async function GuestAndroidCalendarPage({ params }: GuestAndroidCalendarPageProps) {
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

  let guestName = '';
  if (guestId) {
    const guest = await prisma.guest.findUnique({
      where: { id: guestId, eventId: event.id },
    });
    if (guest?.name) {
      guestName = guest.name;
    }
  }

  return (
    <AndroidCalendarBridge
      event={event}
      guestId={guestId}
      guestName={guestName}
      locale={locale}
    />
  );
}
