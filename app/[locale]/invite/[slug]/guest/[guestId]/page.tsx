import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import InvitationContent from '@/components/invitation/InvitationContent';

export default async function GuestInvitationPage({ 
  params 
}: { 
  params: Promise<{ slug: string, locale: string, guestId: string }>;
}) {
  const { slug, locale, guestId } = await params;
  
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      programDays: {
        include: {
          items: {
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!event) notFound();

  let guestData = null;
  if (guestId) {
    guestData = await prisma.guest.findUnique({
      where: { id: guestId, eventId: event.id }
    });
  }

  // If the guest is not found for this event, we could fallback to normal invitation,
  // but it's better to just pass null so it acts like a normal invitation.
  return (
    <InvitationContent event={event} locale={locale} guest={guestData} programDays={event.programDays} />
  );
}
