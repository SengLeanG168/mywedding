"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Search, Calendar, ArrowRight, Loader2, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';

export default function ManageProgramOverviewPage() {
  const t = useTranslations('Dashboard');
  const [events, setEvents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
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
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((ev) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;
    const bride = `${ev.brideNameEn || ''} ${ev.brideNameKm || ''}`.toLowerCase();
    const groom = `${ev.groomNameEn || ''} ${ev.groomNameKm || ''}`.toLowerCase();
    const location = `${ev.locationNameEn || ''} ${ev.locationNameKm || ''}`.toLowerCase();
    return bride.includes(query) || groom.includes(query) || location.includes(query);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-primary flex items-center gap-2.5">
            <Clock className="w-7 h-7" />
            {t('manageProgramNav')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('selectEvent')}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('searchEvent') || 'Search events...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
      </div>

      {/* Events List */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((ev) => {
          const programDaysCount = ev._count?.programDays ?? 0;
          const totalProgramItems = Array.isArray(ev.programDays)
            ? ev.programDays.reduce((acc: number, day: any) => acc + (day._count?.items ?? 0), 0)
            : 0;

          return (
            <Card key={ev.id} className="border border-primary/20 hover:border-primary/40 transition-all shadow-sm hover:shadow-md flex flex-col justify-between">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-serif text-primary">
                  {ev.brideNameEn} & {ev.groomNameEn}
                </CardTitle>
                <CardDescription className="text-xs flex items-center gap-1.5 mt-1">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {ev.eventDate ? format(new Date(ev.eventDate), 'PPP') : ''} {ev.eventTime ? `at ${ev.eventTime}` : ''}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-muted/30 border border-primary/10 text-xs">
                  <div>
                    <div className="text-muted-foreground">{t('programDaysLabel')}</div>
                    <div className="font-bold text-primary text-base mt-0.5">{programDaysCount}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">{t('totalProgramItemsLabel')}</div>
                    <div className="font-bold text-primary text-base mt-0.5">{totalProgramItems}</div>
                  </div>
                </div>

                <Link href={`/dashboard/${ev.id}/program`} className="block">
                  <Button className="w-full justify-between group font-semibold" variant="outline">
                    <span>{t('goToProgramManagement')}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed p-8">
            <CalendarDays className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="font-medium text-base">{t('noEventsYet')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
