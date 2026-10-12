"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye, Users, Clock, Calendar, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { getEventMainName, EVENT_TYPE_LABELS } from '@/lib/event-helpers';

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events', { cache: 'no-store' });
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
    if (!confirm('តើអ្នកពិតជាចង់លុបកម្មវិធីនេះមែនទេ?')) return;
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchEvents();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-serif text-primary">{t('events') || 'កម្មវិធីការ'}</h1>
          <p className="text-sm text-muted-foreground mt-1">គ្រប់គ្រងធៀបការ និងព័ត៌មានលម្អិតនៃកម្មវិធី</p>
        </div>
        <Link href="/dashboard/create">
          <Button className="gap-2 font-bold shadow-md">
            <Plus className="h-4 w-4" />
            {t('createEvent') || 'បង្កើតកម្មវិធី'}
          </Button>
        </Link>
      </div>

      {/* Events List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => {
          const rsvpCount = event._count?.rsvps || 0;
          const guestCount = event._count?.guests || 0;
          const programDaysCount = event._count?.programDays || 0;
          const eventDisplayName = getEventMainName(event, true);
          const eventTypeLabel = EVENT_TYPE_LABELS[event.eventType || 'wedding'] || 'មង្គលការ';

          return (
            <Card key={event.id} className="border border-primary/20 hover:border-primary/40 transition-all shadow-sm hover:shadow-md flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
                      <Sparkles className="w-3 h-3" />
                      {eventTypeLabel}
                    </span>
                    <Link href={`/invite/${event.slug || event.id}`} target="_blank">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" title="មើលទំព័រធៀប">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                  <CardTitle className="flex justify-between items-start gap-2">
                    <span className="text-xl font-serif text-primary truncate" title={eventDisplayName}>
                      {eventDisplayName}
                    </span>
                  </CardTitle>
                  <CardDescription className="text-xs flex items-center gap-1.5 mt-1">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {event.eventDate ? format(new Date(event.eventDate), 'PPP') : ''} {event.eventTime ? `at ${event.eventTime}` : ''}
                    </span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  {/* Quick Stats Summary */}
                  <div className="grid grid-cols-3 gap-1.5 p-2.5 rounded-xl bg-muted/30 border border-primary/10 text-center text-xs">
                    <div>
                      <div className="text-muted-foreground text-[11px]">RSVP</div>
                      <div className="font-bold text-primary">{rsvpCount}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-[11px]">ភ្ញៀវ</div>
                      <div className="font-bold text-primary">{guestCount}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-[11px]">ថ្ងៃកម្មវិធី</div>
                      <div className="font-bold text-primary">{programDaysCount}</div>
                    </div>
                  </div>
                </CardContent>
              </div>

              {/* Direct Action Buttons */}
              <CardContent className="pt-0 border-t mt-4">
                <div className="space-y-2 pt-3">
                  {/* Manage Guests & Manage Program Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Link href={`/dashboard/${event.id}/guests`} className="w-full">
                      <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 justify-center font-medium">
                        <Users className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{t('manageGuestsNav') || 'គ្រប់គ្រងភ្ញៀវ'}</span>
                      </Button>
                    </Link>

                    <Link href={`/dashboard/${event.id}/program`} className="w-full">
                      <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 justify-center font-medium">
                        <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{t('manageProgramNav') || 'គ្រប់គ្រងកម្មវិធី'}</span>
                      </Button>
                    </Link>
                  </div>

                  {/* Details & Delete Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <Link href={`/dashboard/${event.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 justify-center font-medium">
                        <Edit className="h-3.5 w-3.5 shrink-0" />
                        <span>កែសម្រួល</span>
                      </Button>
                    </Link>

                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => deleteEvent(event.id)}
                      title={t('deleteEvent') || 'លុបកម្មវិធី'}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {events.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed">
            មិនទាន់មានកម្មវិធីនៅឡើយទេ។ សូមបង្កើតកម្មវិធីដំបូងរបស់អ្នក!
          </div>
        )}
      </div>
    </div>
  );
}
