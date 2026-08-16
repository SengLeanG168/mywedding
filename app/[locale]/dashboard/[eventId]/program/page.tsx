import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ProgramManagement from '@/components/dashboard/ProgramManagement';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default async function ProgramManagementPage({
  params,
}: {
  params: Promise<{ eventId: string; locale: string }>;
}) {
  const { eventId, locale } = await params;
  
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) notFound();

  const brideName = locale === 'km' ? event.brideNameKm : event.brideNameEn;
  const groomName = locale === 'km' ? event.groomNameKm : event.groomNameEn;

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-2">
            {locale === 'km' ? 'ការគ្រប់គ្រងកម្មវិធី' : 'Program Management'}
          </h1>
          <p className="text-muted-foreground">
            {brideName} & {groomName}
          </p>
        </div>
        <Link 
          href={`/dashboard/${eventId}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-foreground hover:bg-muted/80 rounded-md transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {locale === 'km' ? 'ត្រឡប់ទៅកម្មវិធី' : 'Back to Event'}
        </Link>
      </div>

      <ProgramManagement eventId={eventId} locale={locale} />
    </div>
  );
}
