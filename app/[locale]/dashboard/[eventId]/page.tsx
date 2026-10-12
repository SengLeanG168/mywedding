"use client"

import { useEffect, useState, use } from 'react';
import { Link, useRouter } from '@/i18n/routing';
import EventForm from '@/components/dashboard/EventForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QRCodeSVG } from 'qrcode.react';
import { getEventMainName } from '@/lib/event-helpers';

export default function EditEventPage({ params }: { params: Promise<{ eventId: string }> }) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.eventId;
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    try {
      const [eventRes, rsvpRes] = await Promise.all([
        fetch(`/api/events/${eventId}`, { cache: 'no-store' }),
        fetch(`/api/events/${eventId}/rsvps`, { cache: 'no-store' })
      ]);
      
      if (eventRes.ok && rsvpRes.ok) {
        setEvent(await eventRes.json());
        setRsvps(await rsvpRes.json());
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">កំពុងដំណើរការ...</div>;
  if (!event) return null;

  const eventMainName = getEventMainName(event, true);
  const inviteUrl = typeof window !== 'undefined' ? `${window.location.origin}/invite/${event.slug || event.id}` : `/invite/${event.slug || event.id}`;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold font-serif text-primary">គ្រប់គ្រងកម្មវិធី៖ {eventMainName}</h1>
        <div className="flex gap-4 items-center bg-card p-4 rounded-xl shadow-sm border">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">QR Code & តំណភ្ជាប់ធៀប</span>
            <a href={inviteUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm truncate max-w-[200px]">
              {inviteUrl}
            </a>
          </div>
          <div className="bg-white p-2 rounded-md shrink-0">
             <QRCodeSVG value={inviteUrl} size={80} />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-xl font-bold font-serif text-primary">កែសម្រួលព័ត៌មានកម្មវិធី</h2>
          <EventForm initialData={event} />
        </div>
        
        <div className="space-y-6">
          <h2 className="text-xl font-bold font-serif text-primary">ការឆ្លើយតប RSVP ({rsvps.length})</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">សង្ខេប</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>ចូលរួម:</span>
                  <span className="font-bold text-green-600">
                    {rsvps.filter(r => r.status === 'ATTENDING').reduce((sum, r) => sum + r.attendingCount, 0)} នាក់
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>មិនចូលរួម:</span>
                  <span className="font-bold text-red-600">
                    {rsvps.filter(r => r.status === 'NOT_ATTENDING').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>មិនទាន់ច្បាស់:</span>
                  <span className="font-bold text-yellow-600">
                    {rsvps.filter(r => r.status === 'UNSURE').length}
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {rsvps.map(rsvp => (
                <Card key={rsvp.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">{rsvp.guestName}</div>
                      <div className={`text-xs px-2 py-1 rounded-full font-medium
                        ${rsvp.status === 'ATTENDING' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                        ${rsvp.status === 'NOT_ATTENDING' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                        ${rsvp.status === 'UNSURE' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                      `}>
                        {rsvp.status === 'ATTENDING' ? 'ចូលរួម' : rsvp.status === 'NOT_ATTENDING' ? 'មិនចូលរួម' : 'មិនទាន់ច្បាស់'}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">{rsvp.phone}</div>
                    {rsvp.status === 'ATTENDING' && (
                      <div className="text-sm mt-1">ចំនួនចូលរួម: {rsvp.attendingCount} នាក់</div>
                    )}
                    {rsvp.message && (
                      <div className="mt-2 text-sm italic border-l-2 pl-2">"{rsvp.message}"</div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {rsvps.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-8 border rounded-lg border-dashed">
                  មិនទាន់មានការឆ្លើយតប RSVP នៅឡើយទេ។
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
