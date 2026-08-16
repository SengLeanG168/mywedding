"use client"

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchEvents();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-serif">Events</h1>
        <Link href="/dashboard/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t('createEvent')}
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <div>
                  <div className="text-xl">{event.brideNameEn} & {event.groomNameEn}</div>
                  <div className="text-sm text-muted-foreground font-normal">
                    {format(new Date(event.eventDate), 'PPP')} at {event.eventTime}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mt-4 border-t pt-4">
                <div className="text-sm font-medium">
                  {event._count?.rsvps || 0} RSVPs
                </div>
                <div className="flex gap-2">
                  <Link href={`/invite/${event.slug}`} target="_blank">
                    <Button variant="ghost" size="icon" title="View Public Page">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/dashboard/${event.id}`}>
                    <Button variant="outline" size="sm" title={t('editEvent')}>
                      <Edit className="h-4 w-4 mr-2" /> Details
                    </Button>
                  </Link>
                  <Button variant="destructive" size="icon" onClick={() => deleteEvent(event.id)} title={t('deleteEvent')}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {events.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
            No events found. Create your first event!
          </div>
        )}
      </div>
    </div>
  );
}
