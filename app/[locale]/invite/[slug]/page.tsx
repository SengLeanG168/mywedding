import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import InvitationContent from '@/components/invitation/InvitationContent';

export default async function InvitationPage({ params }: { params: Promise<{ slug: string, locale: string }> }) {
  const { slug, locale } = await params;
  
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

  return (
    <InvitationContent event={event} locale={locale} programDays={event.programDays} />
  );
}
