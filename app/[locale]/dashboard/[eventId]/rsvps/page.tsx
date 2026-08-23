"use client";

import { useEffect, useState, use } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Loader2, MessageSquare, Phone, User, Calendar, CheckCircle2, XCircle, HelpCircle, ClipboardList, UserCheck, Heart } from 'lucide-react';
import { format } from 'date-fns';

export default function EventRsvpsDetailPage({ params }: { params: Promise<{ eventId: string }> }) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.eventId;

  const t = useTranslations('Dashboard');
  const [event, setEvent] = useState<any>(null);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ATTENDING' | 'NOT_ATTENDING' | 'UNSURE'>('ALL');
  const [sideFilter, setSideFilter] = useState<'ALL' | 'groom' | 'bride'>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    try {
      const [eventRes, rsvpRes] = await Promise.all([
        fetch(`/api/events/${eventId}`),
        fetch(`/api/events/${eventId}/rsvps`),
      ]);

      if (eventRes.ok) {
        setEvent(await eventRes.json());
      }
      if (rsvpRes.ok) {
        setRsvps(await rsvpRes.json());
      }
    } catch (err) {
      console.error('Failed to fetch RSVPs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRsvps = rsvps.filter((rsvp) => {
    // Status Filter
    if (statusFilter !== 'ALL' && rsvp.status !== statusFilter) {
      return false;
    }

    // Side Filter
    const guestSide = rsvp.guest?.side || 'groom';
    if (sideFilter !== 'ALL' && guestSide !== sideFilter) {
      return false;
    }

    // Search Filter
    const query = search.toLowerCase().trim();
    if (!query) return true;

    const name = (rsvp.guestName || rsvp.guest?.name || '').toLowerCase();
    const phone = (rsvp.phone || '').toLowerCase();
    const message = (rsvp.message || '').toLowerCase();

    return name.includes(query) || phone.includes(query) || message.includes(query);
  });

  const totalPax = rsvps
    .filter((r) => r.status === 'ATTENDING')
    .reduce((sum, r) => sum + (r.attendingCount || 1), 0);
  const attendingCount = rsvps.filter((r) => r.status === 'ATTENDING').length;
  const notAttendingCount = rsvps.filter((r) => r.status === 'NOT_ATTENDING').length;
  const unsureCount = rsvps.filter((r) => r.status === 'UNSURE').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Back Button & Title Header */}
      <div className="space-y-4">
        <Link href="/dashboard/rsvps">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground -ml-2">
            <ArrowLeft className="w-4 h-4" />
            <span>{t('backToEvent') || 'Back'}</span>
          </Button>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-serif text-primary">
              {t('rsvpResponses')}: {event?.brideNameEn} & {event?.groomNameEn}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              View and manage guest RSVP confirmations separated by Groom Side & Bride Side.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border border-primary/20 bg-card">
          <CardContent className="p-4 text-center">
            <div className="text-xs text-muted-foreground font-medium">{t('totalRsvpsLabel')}</div>
            <div className="text-2xl font-bold font-serif text-primary mt-1">{rsvps.length}</div>
          </CardContent>
        </Card>

        <Card className="border border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-4 text-center">
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{t('attending')}</div>
            <div className="text-2xl font-bold font-serif text-emerald-600 dark:text-emerald-400 mt-1">
              {attendingCount} <span className="text-xs font-normal font-sans">({totalPax} pax)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-rose-500/20 bg-rose-500/5">
          <CardContent className="p-4 text-center">
            <div className="text-xs text-rose-600 dark:text-rose-400 font-medium">{t('notAttending')}</div>
            <div className="text-2xl font-bold font-serif text-rose-600 dark:text-rose-400 mt-1">{notAttendingCount}</div>
          </CardContent>
        </Card>

        <Card className="border border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4 text-center">
            <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">{t('unsure')}</div>
            <div className="text-2xl font-bold font-serif text-amber-600 dark:text-amber-400 mt-1">{unsureCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="space-y-3 bg-card p-4 rounded-2xl border border-primary/20 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Status & Side Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Side Filter */}
            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-primary/10">
              <button
                onClick={() => setSideFilter('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  sideFilter === 'ALL' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('all')}
              </button>
              <button
                onClick={() => setSideFilter('groom')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  sideFilter === 'groom' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <UserCheck className="w-3 h-3" />
                <span>{t('groomSide')}</span>
              </button>
              <button
                onClick={() => setSideFilter('bride')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  sideFilter === 'bride' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Heart className="w-3 h-3" />
                <span>{t('brideSide')}</span>
              </button>
            </div>

            <div className="h-4 w-px bg-border hidden sm:block" />

            {/* Status Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1">
              <Button
                variant={statusFilter === 'ALL' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter('ALL')}
                className="text-xs font-medium rounded-xl h-8"
              >
                {t('all')} ({rsvps.length})
              </Button>

              <Button
                variant={statusFilter === 'ATTENDING' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter('ATTENDING')}
                className={`text-xs font-medium rounded-xl h-8 ${
                  statusFilter === 'ATTENDING' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'text-emerald-600'
                }`}
              >
                {t('attending')} ({rsvps.filter((r) => r.status === 'ATTENDING').length})
              </Button>

              <Button
                variant={statusFilter === 'NOT_ATTENDING' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter('NOT_ATTENDING')}
                className={`text-xs font-medium rounded-xl h-8 ${
                  statusFilter === 'NOT_ATTENDING' ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'text-rose-600'
                }`}
              >
                {t('notAttending')} ({rsvps.filter((r) => r.status === 'NOT_ATTENDING').length})
              </Button>

              <Button
                variant={statusFilter === 'UNSURE' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter('UNSURE')}
                className={`text-xs font-medium rounded-xl h-8 ${
                  statusFilter === 'UNSURE' ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'text-amber-600'
                }`}
              >
                {t('unsure')} ({rsvps.filter((r) => r.status === 'UNSURE').length})
              </Button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('searchRsvps') || 'Search RSVPs...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background text-xs"
            />
          </div>
        </div>
      </div>

      {/* RSVPs List */}
      <div className="space-y-3">
        {filteredRsvps.map((rsvp) => {
          const formattedDate = rsvp.createdAt
            ? format(new Date(rsvp.createdAt), 'PPP, p')
            : '';

          const guestSide = rsvp.guest?.side || 'groom';
          const isGroomSide = guestSide === 'groom';

          return (
            <Card key={rsvp.id} className="border border-primary/15 shadow-sm hover:border-primary/30 transition-all">
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 font-bold text-base text-foreground">
                      <User className="w-4 h-4 text-primary shrink-0" />
                      <span>{rsvp.guestName}</span>
                    </div>

                    {/* Guest Side Badge */}
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1 ${
                        isGroomSide
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {isGroomSide ? t('groomSide') : t('brideSide')}
                    </span>

                    {/* Attendance Status Badge */}
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1.5 ${
                        rsvp.status === 'ATTENDING'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : rsvp.status === 'NOT_ATTENDING'
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {rsvp.status === 'ATTENDING' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {rsvp.status === 'NOT_ATTENDING' && <XCircle className="w-3.5 h-3.5" />}
                      {rsvp.status === 'UNSURE' && <HelpCircle className="w-3.5 h-3.5" />}
                      <span>{rsvp.status}</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                      {rsvp.phone}
                    </span>

                    {rsvp.status === 'ATTENDING' && (
                      <span className="font-semibold text-primary">
                        Pax: {rsvp.attendingCount || 1}
                      </span>
                    )}

                    {formattedDate && (
                      <span className="flex items-center gap-1 text-muted-foreground/70">
                        <Calendar className="w-3.5 h-3.5" />
                        {formattedDate}
                      </span>
                    )}
                  </div>

                  {/* Blessing / Message */}
                  {rsvp.message && (
                    <div className="flex items-start gap-2 p-2.5 rounded-xl bg-muted/40 text-xs text-foreground/90 italic border-l-2 border-primary mt-2">
                      <MessageSquare className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span>"{rsvp.message}"</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredRsvps.length === 0 && (
          <div className="text-center py-16 text-muted-foreground bg-card rounded-2xl border border-dashed p-8">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="font-medium text-base">{t('noRsvpsYet')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
