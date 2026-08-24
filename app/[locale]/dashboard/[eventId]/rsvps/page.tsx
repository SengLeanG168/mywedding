"use client";

import { useEffect, useState, use } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Search, 
  Loader2, 
  MessageSquare, 
  Phone, 
  User, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ClipboardList, 
  Edit2, 
  Trash2, 
  X, 
  Check 
} from 'lucide-react';
import { format } from 'date-fns';

interface RsvpItem {
  id: string;
  eventId: string;
  guestId?: string | null;
  guestName: string;
  phone?: string | null;
  status: string;
  attendingCount: number;
  message?: string | null;
  createdAt?: string;
  guest?: {
    id: string;
    name: string;
    side: string;
    phone?: string | null;
  } | null;
}

export default function EventRsvpsDetailPage({ params }: { params: Promise<{ eventId: string }> }) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.eventId;

  const t = useTranslations('Dashboard');
  const [event, setEvent] = useState<any>(null);
  const [rsvps, setRsvps] = useState<RsvpItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ATTENDING' | 'NOT_ATTENDING' | 'UNSURE'>('ALL');
  const [sideFilter, setSideFilter] = useState<'ALL' | 'groom' | 'bride'>('ALL');
  const [loading, setLoading] = useState(true);

  // Toast Notification State
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRsvp, setEditingRsvp] = useState<RsvpItem | null>(null);
  const [editGuestName, setEditGuestName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStatus, setEditStatus] = useState<'ATTENDING' | 'NOT_ATTENDING' | 'UNSURE'>('ATTENDING');
  const [editAttendingCount, setEditAttendingCount] = useState(1);
  const [editSide, setEditSide] = useState<'groom' | 'bride'>('groom');
  const [editMessage, setEditMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingRsvp, setDeletingRsvp] = useState<RsvpItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  };

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

  const openEditModal = (rsvp: RsvpItem) => {
    setEditingRsvp(rsvp);
    setEditGuestName(rsvp.guestName || '');
    setEditPhone(rsvp.phone || '');
    setEditStatus((rsvp.status as any) || 'ATTENDING');
    setEditAttendingCount(rsvp.attendingCount || 1);
    setEditSide((rsvp.guest?.side as any) || 'groom');
    setEditMessage(rsvp.message || '');
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingRsvp(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRsvp) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/rsvps/${editingRsvp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: editGuestName,
          phone: editPhone || '',
          status: editStatus,
          attendingCount: Number(editAttendingCount) || 1,
          side: editSide,
          message: editMessage || '',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRsvps((prev) =>
          prev.map((r) => (r.id === editingRsvp.id ? { ...r, ...data.rsvp } : r))
        );
        showToast('success', t('rsvpUpdatedSuccessfully') || 'RSVP updated successfully');
        closeEditModal();
      } else {
        const err = await res.json();
        showToast('error', err.error || t('rsvpUpdateFailed') || 'Failed to update RSVP');
      }
    } catch (err) {
      showToast('error', t('rsvpUpdateFailed') || 'Failed to update RSVP');
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteModal = (rsvp: RsvpItem) => {
    setDeletingRsvp(rsvp);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingRsvp(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRsvp) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/rsvps/${deletingRsvp.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setRsvps((prev) => prev.filter((r) => r.id !== deletingRsvp.id));
        showToast('success', t('rsvpDeletedSuccessfully') || 'RSVP deleted successfully');
        closeDeleteModal();
      } else {
        const err = await res.json();
        showToast('error', err.error || t('rsvpDeleteFailed') || 'Failed to delete RSVP');
      }
    } catch (err) {
      showToast('error', t('rsvpDeleteFailed') || 'Failed to delete RSVP');
    } finally {
      setIsDeleting(false);
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
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${
            toastMsg.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
          }`}
        >
          {toastMsg.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

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
              View, edit, and manage guest RSVP confirmations separated by Groom Side & Bride Side.
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
              {attendingCount} <span className="text-xs font-normal">({totalPax} pax)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-rose-500/20 bg-rose-500/5">
          <CardContent className="p-4 text-center">
            <div className="text-xs text-rose-600 dark:text-rose-400 font-medium">{t('notAttending')}</div>
            <div className="text-2xl font-bold font-serif text-rose-600 dark:text-rose-400 mt-1">
              {notAttendingCount}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4 text-center">
            <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">{t('unsure')}</div>
            <div className="text-2xl font-bold font-serif text-amber-600 dark:text-amber-400 mt-1">
              {unsureCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Search Row */}
      <div className="bg-card p-4 rounded-2xl border border-primary/20 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Side & Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Side Filter */}
            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-primary/10">
              <Button
                variant={sideFilter === 'ALL' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSideFilter('ALL')}
                className="text-xs font-medium rounded-lg h-7 px-2.5"
              >
                {t('all')}
              </Button>
              <Button
                variant={sideFilter === 'groom' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSideFilter('groom')}
                className={`text-xs font-medium rounded-lg h-7 px-2.5 ${
                  sideFilter === 'groom' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-blue-600 dark:text-blue-400'
                }`}
              >
                {t('groomSide')}
              </Button>
              <Button
                variant={sideFilter === 'bride' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSideFilter('bride')}
                className={`text-xs font-medium rounded-lg h-7 px-2.5 ${
                  sideFilter === 'bride' ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {t('brideSide')}
              </Button>
            </div>

            {/* Status Filters */}
            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-primary/10">
              <Button
                variant={statusFilter === 'ALL' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter('ALL')}
                className="text-xs font-medium rounded-lg h-7 px-2.5"
              >
                {t('all')}
              </Button>
              <Button
                variant={statusFilter === 'ATTENDING' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter('ATTENDING')}
                className={`text-xs font-medium rounded-lg h-7 px-2.5 ${
                  statusFilter === 'ATTENDING' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {t('attending')} ({rsvps.filter((r) => r.status === 'ATTENDING').length})
              </Button>
              <Button
                variant={statusFilter === 'NOT_ATTENDING' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter('NOT_ATTENDING')}
                className={`text-xs font-medium rounded-lg h-7 px-2.5 ${
                  statusFilter === 'NOT_ATTENDING' ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {t('notAttending')} ({rsvps.filter((r) => r.status === 'NOT_ATTENDING').length})
              </Button>
              <Button
                variant={statusFilter === 'UNSURE' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter('UNSURE')}
                className={`text-xs font-medium rounded-lg h-7 px-2.5 ${
                  statusFilter === 'UNSURE' ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'text-amber-600 dark:text-amber-400'
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
                      {rsvp.phone || '-'}
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

                {/* Actions: Edit & Delete Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(rsvp)}
                    className="h-8 px-3 gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/10 hover:text-primary rounded-xl"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{t('edit')}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteModal(rsvp)}
                    className="h-8 px-3 gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('delete')}</span>
                  </Button>
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

      {/* Edit RSVP Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-primary/20 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeEditModal}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold font-serif text-primary mb-4 flex items-center gap-2">
              <Edit2 className="w-5 h-5" />
              {t('editRsvp')}
            </h2>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Guest Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">{t('guestName') || 'Guest Name'}</label>
                <Input
                  required
                  value={editGuestName}
                  onChange={(e) => setEditGuestName(e.target.value)}
                  placeholder="Enter guest name"
                  className="bg-background text-sm"
                />
              </div>

              {/* Phone Number (Optional) */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  {t('phone')} (Optional)
                </label>
                <Input
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="bg-background text-sm"
                />
              </div>

              {/* Side Selector */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">{t('guestSide') || 'Side'}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditSide('groom')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      editSide === 'groom'
                        ? 'bg-blue-600 text-white border-blue-600 shadow'
                        : 'bg-muted/40 text-muted-foreground border-transparent hover:bg-muted'
                    }`}
                  >
                    {t('groomSide')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditSide('bride')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      editSide === 'bride'
                        ? 'bg-rose-600 text-white border-rose-600 shadow'
                        : 'bg-muted/40 text-muted-foreground border-transparent hover:bg-muted'
                    }`}
                  >
                    {t('brideSide')}
                  </button>
                </div>
              </div>

              {/* Attendance Status & Attendees Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">{t('attendanceStatus') || 'Status'}</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="ATTENDING">{t('attending')}</option>
                    <option value="NOT_ATTENDING">{t('notAttending')}</option>
                    <option value="UNSURE">{t('unsure')}</option>
                  </select>
                </div>

                {editStatus === 'ATTENDING' && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">{t('attendingCount') || 'Pax'}</label>
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      value={editAttendingCount}
                      onChange={(e) => setEditAttendingCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="bg-background text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Wish / Message */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">{t('blessingMessage') || 'Blessing / Wish'}</label>
                <textarea
                  value={editMessage}
                  onChange={(e) => setEditMessage(e.target.value)}
                  placeholder="Enter blessing or wish message..."
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeEditModal}
                  disabled={isSaving}
                  className="rounded-xl text-xs"
                >
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-xs gap-1.5"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{t('save')}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-primary/20 rounded-2xl w-full max-w-sm shadow-2xl p-6 relative">
            <h3 className="text-lg font-bold font-serif text-foreground mb-2">
              {t('deleteRsvp')}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {t('deleteRsvpConfirm')}
            </p>

            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="rounded-xl text-xs"
              >
                {t('cancel')}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="rounded-xl text-xs gap-1.5"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{t('delete')}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
