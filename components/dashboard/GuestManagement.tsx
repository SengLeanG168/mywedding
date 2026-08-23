"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Edit2, Trash2, QrCode as QrCodeIcon, Check, Copy, X, UserCheck, Heart, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QRCodeSVG } from 'qrcode.react';

interface Guest {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  side: string;
  invitedCount: number;
  notes?: string | null;
  rsvps?: any[];
}

export default function GuestManagement({ eventId, eventSlug }: { eventId: string; eventSlug: string }) {
  const t = useTranslations('Dashboard');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Side Tab State: "groom" | "bride"
  const [activeSide, setActiveSide] = useState<'groom' | 'bride'>('groom');

  // Edit / Add Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // QR Modal State
  const [qrModalGuest, setQrModalGuest] = useState<Guest | null>(null);

  // Form State
  const [currentGuestId, setCurrentGuestId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [side, setSide] = useState<'groom' | 'bride'>('groom');
  const [invitedCount, setInvitedCount] = useState(1);
  const [notes, setNotes] = useState('');

  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchGuests();
  }, [eventId]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/guests`);
      if (res.ok) {
        setGuests(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setName('');
    setPhone('');
    setSide(activeSide);
    setInvitedCount(1);
    setNotes('');
    setCurrentGuestId(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (guest: Guest) => {
    setName(guest.name);
    setPhone(guest.phone || '');
    setSide((guest.side as 'groom' | 'bride') || 'groom');
    setInvitedCount(guest.invitedCount || 1);
    setNotes(guest.notes || '');
    setCurrentGuestId(guest.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (guestId: string) => {
    const confirmMsg = t('deleteGuestConfirm') || 'Are you sure you want to delete this guest?';
    if (!window.confirm(confirmMsg)) return;

    setDeletingId(guestId);
    try {
      let res = await fetch(`/api/events/${eventId}/guests/${guestId}`, { method: 'DELETE' });
      if (!res.ok) {
        res = await fetch(`/api/guests/${guestId}`, { method: 'DELETE' });
      }

      if (res.ok) {
        setGuests((prev) => prev.filter((g) => g.id !== guestId));
        showToast('success', t('guestDeletedSuccessfully') || 'Guest deleted successfully');
      } else {
        const data = await res.json().catch(() => ({}));
        showToast('error', data.error || t('guestDeleteFailed') || 'Failed to delete guest');
      }
    } catch (e) {
      console.error('Delete error:', e);
      showToast('error', t('guestDeleteFailed') || 'Failed to delete guest');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = { name, phone, side, invitedCount: Number(invitedCount) || 1, notes };
      let res;

      if (isEditing && currentGuestId) {
        res = await fetch(`/api/events/${eventId}/guests/${currentGuestId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          res = await fetch(`/api/guests/${currentGuestId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        }
      } else {
        res = await fetch(`/api/events/${eventId}/guests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setIsModalOpen(false);
        await fetchGuests();
        showToast(
          'success',
          isEditing
            ? t('guestUpdatedSuccessfully') || 'Guest updated successfully'
            : t('guestSavedSuccessfully') || 'Guest saved successfully'
        );
      } else {
        const data = await res.json().catch(() => ({}));
        showToast('error', data.error || (isEditing ? t('guestUpdateFailed') : 'Failed to save guest'));
      }
    } catch (e) {
      console.error(e);
      showToast('error', isEditing ? t('guestUpdateFailed') : 'Failed to save guest');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = (guestId: string) => {
    const url = `${window.location.origin}/invite/${eventSlug}/guest/${guestId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(guestId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadQr = (guest: Guest) => {
    const svgElement = document.getElementById(`qr-svg-${guest.id}`);
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const context = canvas.getContext('2d');
      if (context) {
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, 400, 400);
        context.drawImage(image, 20, 20, 360, 360);

        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `QR-${guest.name.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };
    image.src = blobURL;
  };

  // Counts by side
  const groomGuests = guests.filter((g) => g.side === 'groom' || !g.side);
  const brideGuests = guests.filter((g) => g.side === 'bride');

  const groomPax = groomGuests.reduce((sum, g) => sum + (g.invitedCount || 1), 0);
  const bridePax = brideGuests.reduce((sum, g) => sum + (g.invitedCount || 1), 0);

  // Filtered list for active tab and search
  const currentSideGuests = activeSide === 'groom' ? groomGuests : brideGuests;

  const filteredGuests = currentSideGuests.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.phone && g.phone.includes(search))
  );

  return (
    <Card className="w-full relative">
      {/* Toast Notification Banner */}
      {toastMsg && (
        <div
          className={`absolute top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-bold animate-fade-in ${
            toastMsg.type === 'success'
              ? 'bg-emerald-500 text-white border-emerald-600'
              : 'bg-rose-500 text-white border-rose-600'
          }`}
        >
          {toastMsg.text}
        </div>
      )}

      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
        <div>
          <CardTitle className="text-xl font-serif text-primary">{t('guestManagement')}</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Separate and manage guests for Groom side & Bride side
          </p>
        </div>

        <Button onClick={openAddModal} className="flex items-center gap-2 font-bold shadow-md">
          <Plus className="w-4 h-4" />
          {t('addGuest')}
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Side Tabs Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-2 bg-muted/40 p-1.5 rounded-2xl border border-primary/10">
            <button
              type="button"
              onClick={() => setActiveSide('groom')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeSide === 'groom'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{t('groomSideGuests')}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeSide === 'groom' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
                {groomGuests.length} ({groomPax} pax)
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSide('bride')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeSide === 'bride'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>{t('brideSideGuests')}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeSide === 'bride' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
                {brideGuests.length} ({bridePax} pax)
              </span>
            </button>
          </div>

          {/* Search */}
          <div className="w-full sm:w-64">
            <Input
              placeholder={t('searchGuest')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-card text-xs"
            />
          </div>
        </div>

        {/* Guest List Table */}
        {loading ? (
          <div className="py-12 text-center text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span>Loading guests...</span>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-primary/20 shadow-sm">
            <table className="w-full border-collapse min-w-[800px] text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="p-3.5 text-left font-semibold">{t('guestName')}</th>
                  <th className="p-3.5 text-left font-semibold">{t('guestPhone')}</th>
                  <th className="p-3.5 text-center font-semibold">{t('guestSide')}</th>
                  <th className="p-3.5 text-center font-semibold">{t('invitedCount')}</th>
                  <th className="p-3.5 text-center font-semibold">RSVP</th>
                  <th className="p-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-muted-foreground">
                      {search
                        ? 'No matching guests found.'
                        : t('noGuestsYet', { defaultMessage: 'No guests yet for this side.' })}
                    </td>
                  </tr>
                ) : (
                  filteredGuests.map((guest) => {
                    const hasRsvp = guest.rsvps && guest.rsvps.length > 0;
                    const rsvpStatus = hasRsvp ? guest.rsvps![0].status : null;
                    const isGroomSide = guest.side === 'groom' || !guest.side;
                    const isDeleting = deletingId === guest.id;

                    return (
                      <tr key={guest.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-3.5">
                          <div className="font-semibold text-foreground">{guest.name}</div>
                          {guest.notes && <div className="text-xs text-muted-foreground mt-0.5">{guest.notes}</div>}
                        </td>

                        <td className="p-3.5 text-muted-foreground">{guest.phone || '-'}</td>

                        {/* Guest Side Badge */}
                        <td className="p-3.5 text-center">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1 ${
                              isGroomSide
                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {isGroomSide ? t('groomSide') : t('brideSide')}
                          </span>
                        </td>

                        <td className="p-3.5 text-center font-medium">{guest.invitedCount}</td>

                        <td className="p-3.5 text-center">
                          {hasRsvp ? (
                            <span
                              className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                                rsvpStatus === 'ATTENDING'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                  : rsvpStatus === 'NOT_ATTENDING'
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              }`}
                            >
                              {rsvpStatus}
                            </span>
                          ) : (
                            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-muted text-muted-foreground">
                              Pending
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="flex justify-end items-center gap-2">
                            {/* Copy Invitation Link */}
                            <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              title={t('copyLink')}
                              onClick={() => handleCopyLink(guest.id)}
                              className="h-8 w-8"
                            >
                              {copiedId === guest.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                            </Button>

                            {/* Guest QR Code Modal Trigger */}
                            <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              title={t('guestQrCodeTitle') || 'Guest QR Code'}
                              onClick={() => setQrModalGuest(guest)}
                              className="h-8 w-8 text-primary border-primary/30 hover:bg-primary/10"
                            >
                              <QrCodeIcon className="w-4 h-4" />
                            </Button>

                            {/* Edit Guest Button */}
                            <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              title={t('editGuest') || 'Edit Guest'}
                              onClick={() => openEditModal(guest)}
                            >
                              <Edit2 className="w-4 h-4 text-blue-500" />
                            </Button>

                            {/* Delete Guest Button */}
                            <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              disabled={isDeleting}
                              title={t('deleteGuest') || 'Delete Guest'}
                              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                              onClick={(e) => {
                                e.preventDefault();
                                handleDelete(guest.id);
                              }}
                            >
                              {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin text-destructive" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Add / Edit Guest Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-card border border-primary/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center p-4 border-b bg-muted/30">
                <h3 className="font-serif font-bold text-lg text-primary">
                  {isEditing ? (t('editGuest') || 'Edit Guest') : (t('addGuest') || 'Add Guest')}
                </h3>
                <Button size="icon" variant="ghost" onClick={() => setIsModalOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-5 overflow-y-auto">
                <form id="guestForm" onSubmit={handleSubmit} className="space-y-4">
                  {/* Guest Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t('guestName')} *
                    </label>
                    <Input
                      placeholder={t('guestName')}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Guest Side Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t('guestSide')}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSide('groom')}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          side === 'groom'
                            ? 'border-primary bg-primary/15 text-primary ring-1 ring-primary'
                            : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                        }`}
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>{t('groomSide')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSide('bride')}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          side === 'bride'
                            ? 'border-primary bg-primary/15 text-primary ring-1 ring-primary'
                            : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                        }`}
                      >
                        <Heart className="w-4 h-4" />
                        <span>{t('brideSide')}</span>
                      </button>
                    </div>
                  </div>

                  {/* Guest Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t('guestPhone')}
                    </label>
                    <Input
                      placeholder={t('guestPhone')}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  {/* Invited Count */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t('invitedCount')}
                    </label>
                    <Input
                      type="number"
                      min="1"
                      placeholder={t('invitedCount')}
                      value={invitedCount}
                      onChange={(e) => setInvitedCount(parseInt(e.target.value, 10) || 1)}
                      required
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t('notes')}
                    </label>
                    <textarea
                      placeholder={t('notes')}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    />
                  </div>
                </form>
              </div>

              <div className="p-4 border-t bg-muted/20 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" form="guestForm" disabled={isSaving} className="font-bold gap-2">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isEditing ? (t('saveGuest') || 'Save Guest') : (t('addGuest') || 'Add Guest')}</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Clean Responsive Guest QR Code Modal */}
        {qrModalGuest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-sm bg-card border border-primary/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6 space-y-5 text-center">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-serif font-bold text-lg text-primary flex items-center gap-2">
                  <QrCodeIcon className="w-5 h-5 text-primary" />
                  <span>{t('guestQrCodeTitle') || 'Guest QR Code'}</span>
                </h3>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setQrModalGuest(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Guest Header Info */}
              <div>
                <h4 className="font-bold text-base text-foreground">{qrModalGuest.name}</h4>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      qrModalGuest.side === 'bride'
                        ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                        : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                    }`}
                  >
                    {qrModalGuest.side === 'bride' ? t('brideSide') : t('groomSide')}
                  </span>
                  {qrModalGuest.phone && <span className="text-xs text-muted-foreground">{qrModalGuest.phone}</span>}
                </div>
              </div>

              {/* Perfectly Centered Square QR Code Box */}
              <div className="flex justify-center items-center">
                <div className="w-full max-w-[240px] aspect-square flex items-center justify-center p-4 bg-white rounded-2xl border shadow-inner">
                  <QRCodeSVG
                    id={`qr-svg-${qrModalGuest.id}`}
                    value={`${window.location.origin}/invite/${eventSlug}/guest/${qrModalGuest.id}`}
                    size={200}
                    level="H"
                    includeMargin={true}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Button
                  type="button"
                  variant="default"
                  onClick={() => handleDownloadQr(qrModalGuest)}
                  className="w-full font-bold gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>{t('downloadQrCode') || 'Download QR Code'}</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCopyLink(qrModalGuest.id)}
                  className="w-full text-xs font-semibold gap-2"
                >
                  {copiedId === qrModalGuest.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedId === qrModalGuest.id ? 'Copied Link!' : (t('copyLink') || 'Copy Invitation Link')}</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
