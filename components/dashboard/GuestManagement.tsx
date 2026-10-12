"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Plus,
  Edit2,
  Trash2,
  QrCode as QrCodeIcon,
  Check,
  Copy,
  X,
  UserCheck,
  Heart,
  Loader2,
  Download,
  Users,
  Gift,
  Coins,
  DollarSign,
  Calendar,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Sparkles,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QRCodeSVG } from 'qrcode.react';

export interface Guest {
  id: string;
  eventId: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  side: string;
  invitedCount: number;
  notes?: string | null;
  customSlug?: string | null;
  rsvps?: any[];
  giftReceived?: boolean;
  giftAmountKhr?: number | null;
  giftAmountUsd?: number | string | null;
  giftNote?: string | null;
  giftReceivedAt?: string | null;
}

export default function GuestManagement({
  eventId,
  eventSlug,
}: {
  eventId: string;
  eventSlug: string;
}) {
  const t = useTranslations('Dashboard');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Side Tab Filter: "all" | "groom" | "bride"
  const [activeSide, setActiveSide] = useState<'all' | 'groom' | 'bride'>('all');

  // Edit / Add Guest Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // QR Modal State
  const [qrModalGuest, setQrModalGuest] = useState<Guest | null>(null);

  // Gift Recording Modal State
  const [giftModalGuest, setGiftModalGuest] = useState<Guest | null>(null);
  const [giftReceived, setGiftReceived] = useState<boolean>(true);
  const [giftAmountKhr, setGiftAmountKhr] = useState<string>('');
  const [giftAmountUsd, setGiftAmountUsd] = useState<string>('');
  const [giftNote, setGiftNote] = useState<string>('');
  const [giftReceivedAt, setGiftReceivedAt] = useState<string>('');
  const [isSavingGift, setIsSavingGift] = useState<boolean>(false);
  const [giftError, setGiftError] = useState<string>('');

  // Guest Form State
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
    setSide(activeSide === 'bride' ? 'bride' : 'groom');
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

  const openGiftModal = (guest: Guest) => {
    setGiftModalGuest(guest);
    setGiftReceived(guest.giftReceived ?? true);
    setGiftAmountKhr(guest.giftAmountKhr !== null && guest.giftAmountKhr !== undefined ? String(guest.giftAmountKhr) : '');
    setGiftAmountUsd(guest.giftAmountUsd !== null && guest.giftAmountUsd !== undefined ? String(guest.giftAmountUsd) : '');
    setGiftNote(guest.giftNote || '');
    
    // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
    if (guest.giftReceivedAt) {
      const d = new Date(guest.giftReceivedAt);
      const tzOffset = d.getTimezoneOffset() * 60000;
      const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
      setGiftReceivedAt(localISOTime);
    } else {
      const now = new Date();
      const tzOffset = now.getTimezoneOffset() * 60000;
      const localISOTime = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
      setGiftReceivedAt(localISOTime);
    }
    setGiftError('');
  };

  const handleSaveGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftModalGuest) return;

    setGiftError('');

    // Validation
    const cleanKhr = giftAmountKhr.trim();
    const cleanUsd = giftAmountUsd.trim();

    let numKhr: number | null = null;
    let numUsd: number | null = null;

    if (cleanKhr) {
      const parsed = Number(cleanKhr);
      if (isNaN(parsed) || !Number.isInteger(parsed) || parsed < 0) {
        setGiftError('ចំនួនប្រាក់រៀលត្រូវតែជាចំនួនគត់វិជ្ជមាន');
        return;
      }
      numKhr = parsed;
    }

    if (cleanUsd) {
      const parsed = Number(cleanUsd);
      if (isNaN(parsed) || parsed < 0) {
        setGiftError('ចំនួនប្រាក់ដុល្លារត្រូវតែជាលេខត្រឹមត្រូវ');
        return;
      }
      numUsd = Number(parsed.toFixed(2));
    }

    // If both are 0 or empty, but giftReceived is true, still allow recording gift
    const effectiveGiftReceived = giftReceived || Boolean(numKhr && numKhr > 0) || Boolean(numUsd && numUsd > 0);

    setIsSavingGift(true);
    try {
      const payload = {
        giftReceived: effectiveGiftReceived,
        giftAmountKhr: effectiveGiftReceived ? numKhr : null,
        giftAmountUsd: effectiveGiftReceived ? numUsd : null,
        giftNote: effectiveGiftReceived && giftNote.trim() ? giftNote.trim() : null,
        giftReceivedAt: effectiveGiftReceived ? (giftReceivedAt ? new Date(giftReceivedAt).toISOString() : new Date().toISOString()) : null,
      };

      const res = await fetch(`/api/admin/guests/${giftModalGuest.id}/gift`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updated = await res.json();
        setGuests((prev) => prev.map((g) => (g.id === updated.id ? { ...g, ...updated } : g)));
        setGiftModalGuest(null);
        showToast('success', 'បានកត់ត្រាចំណងដៃដោយជោគជ័យ!');
      } else {
        const errData = await res.json().catch(() => ({}));
        setGiftError(errData.error || 'មិនអាចកត់ត្រាចំណងដៃបានទេ');
      }
    } catch (err: any) {
      console.error(err);
      setGiftError('មានបញ្ហាក្នុងការតភ្ជាប់បណ្តាញ');
    } finally {
      setIsSavingGift(false);
    }
  };

  const handleClearGift = async () => {
    if (!giftModalGuest) return;
    if (!window.confirm(`តើអ្នកពិតជាចង់សម្អាតចំណងដៃរបស់ភ្ញៀវ "${giftModalGuest.name}" មែនទេ?`)) return;

    setIsSavingGift(true);
    try {
      const payload = {
        giftReceived: false,
        giftAmountKhr: null,
        giftAmountUsd: null,
        giftNote: null,
        giftReceivedAt: null,
      };

      const res = await fetch(`/api/admin/guests/${giftModalGuest.id}/gift`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updated = await res.json();
        setGuests((prev) => prev.map((g) => (g.id === updated.id ? { ...g, ...updated } : g)));
        setGiftModalGuest(null);
        showToast('success', 'បានសម្អាតចំណងដៃដោយជោគជ័យ!');
      } else {
        const errData = await res.json().catch(() => ({}));
        setGiftError(errData.error || 'មិនអាចសម្អាតចំណងដៃបានទេ');
      }
    } catch (err: any) {
      console.error(err);
      setGiftError('មានបញ្ហាក្នុងការតភ្ជាប់បណ្តាញ');
    } finally {
      setIsSavingGift(false);
    }
  };

  const handleDelete = async (guestId: string) => {
    const confirmMsg = t('deleteGuestConfirm') || 'តើអ្នកពិតជាចង់លុបភ្ញៀវនេះមែនទេ?';
    if (!window.confirm(confirmMsg)) return;

    setDeletingId(guestId);
    try {
      let res = await fetch(`/api/events/${eventId}/guests/${guestId}`, { method: 'DELETE' });
      if (!res.ok) {
        res = await fetch(`/api/guests/${guestId}`, { method: 'DELETE' });
      }

      if (res.ok) {
        setGuests((prev) => prev.filter((g) => g.id !== guestId));
        showToast('success', t('guestDeletedSuccessfully') || 'បានលុបភ្ញៀវដោយជោគជ័យ');
      } else {
        const data = await res.json().catch(() => ({}));
        showToast('error', data.error || t('guestDeleteFailed') || 'មិនអាចលុបភ្ញៀវបានទេ');
      }
    } catch (e) {
      console.error('Delete error:', e);
      showToast('error', t('guestDeleteFailed') || 'មិនអាចលុបភ្ញៀវបានទេ');
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
            ? t('guestUpdatedSuccessfully') || 'បានកែសម្រួលភ្ញៀវដោយជោគជ័យ'
            : t('guestSavedSuccessfully') || 'បានរក្សាទុកភ្ញៀវដោយជោគជ័យ'
        );
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(
          'error',
          data.error || (isEditing ? t('guestUpdateFailed') || 'មិនអាចកែសម្រួលភ្ញៀវបានទេ' : 'មិនអាចរក្សាទុកភ្ញៀវបានទេ')
        );
      }
    } catch (e) {
      console.error(e);
      showToast('error', isEditing ? t('guestUpdateFailed') || 'មិនអាចកែសម្រួលភ្ញៀវបានទេ' : 'មិនអាចរក្សាទុកភ្ញៀវបានទេ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = (guestId: string) => {
    const effectiveSlug = eventSlug || eventId;
    const url = `${window.location.origin}/invite/${effectiveSlug}/guest/${guestId}`;
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

  const handleExportExcel = async (exportSide: 'all' | 'groom' | 'bride') => {
    setIsExporting(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/guests/gifts/export?side=${exportSide}`);
      if (!res.ok) {
        throw new Error('Failed to export Excel');
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      const cleanSlug = eventSlug || eventId;
      a.download = `ចំណងដៃ-${cleanSlug}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      showToast('success', 'បានទាញយកឯកសារ Excel ចំណងដៃដោយជោគជ័យ!');
    } catch (err) {
      console.error('Export error:', err);
      showToast('error', 'មិនអាចទាញយកឯកសារ Excel បានទេ');
    } finally {
      setIsExporting(false);
    }
  };

  // Filter calculations
  const groomGuests = guests.filter((g) => g.side === 'groom' || !g.side);
  const brideGuests = guests.filter((g) => g.side === 'bride');

  const currentTabGuests =
    activeSide === 'all' ? guests : activeSide === 'groom' ? groomGuests : brideGuests;

  const currentPax = currentTabGuests.reduce((sum, g) => sum + (g.invitedCount || 1), 0);
  const giftedGuests = currentTabGuests.filter((g) => g.giftReceived);
  const notGiftedGuests = currentTabGuests.filter((g) => !g.giftReceived);

  const totalKhr = currentTabGuests.reduce((sum, g) => {
    return g.giftReceived && g.giftAmountKhr ? sum + Number(g.giftAmountKhr) : sum;
  }, 0);

  const totalUsd = currentTabGuests.reduce((sum, g) => {
    return g.giftReceived && g.giftAmountUsd ? sum + Number(g.giftAmountUsd) : sum;
  }, 0);

  // Search filter
  const filteredGuests = currentTabGuests.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.phone && g.phone.includes(search)) ||
      (g.giftNote && g.giftNote.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toastMsg && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-bold animate-fade-in ${
            toastMsg.type === 'success'
              ? 'bg-emerald-500 text-white border-emerald-600'
              : 'bg-rose-500 text-white border-rose-600'
          }`}
        >
          {toastMsg.text}
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Total Guests */}
        <Card className="border border-primary/20 shadow-sm bg-card hover:border-primary/40 transition-colors">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-medium text-muted-foreground truncate">ភ្ញៀវសរុប</div>
              <div className="text-lg sm:text-xl font-bold font-serif text-foreground truncate">
                {currentTabGuests.length} <span className="text-xs font-sans text-muted-foreground">({currentPax} នាក់)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Gift Received Count */}
        <Card className="border border-emerald-500/20 shadow-sm bg-card hover:border-emerald-500/40 transition-colors">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-medium text-muted-foreground truncate">បានចងដៃ</div>
              <div className="text-lg sm:text-xl font-bold font-serif text-emerald-600 dark:text-emerald-400 truncate">
                {giftedGuests.length} <span className="text-xs font-sans text-muted-foreground">នាក់</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Not Gifted Count */}
        <Card className="border border-amber-500/20 shadow-sm bg-card hover:border-amber-500/40 transition-colors">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-medium text-muted-foreground truncate">មិនទាន់ចងដៃ</div>
              <div className="text-lg sm:text-xl font-bold font-serif text-amber-600 dark:text-amber-400 truncate">
                {notGiftedGuests.length} <span className="text-xs font-sans text-muted-foreground">នាក់</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Total KHR Amount */}
        <Card className="border border-blue-500/20 shadow-sm bg-card hover:border-blue-500/40 transition-colors">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-medium text-muted-foreground truncate">សរុបប្រាក់រៀល</div>
              <div className="text-base sm:text-lg font-bold font-serif text-blue-600 dark:text-blue-400 truncate" title={`៛ ${totalKhr.toLocaleString()}`}>
                ៛ {totalKhr.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 5: Total USD Amount */}
        <Card className="border border-purple-500/20 shadow-sm bg-card col-span-2 sm:col-span-1 hover:border-purple-500/40 transition-colors">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-medium text-muted-foreground truncate">សរុបប្រាក់ដុល្លារ</div>
              <div className="text-base sm:text-lg font-bold font-serif text-purple-600 dark:text-purple-400 truncate" title={`$ ${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                $ {totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card className="w-full relative shadow-md border-primary/20">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b">
          <div>
            <CardTitle className="text-xl font-serif text-primary flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              <span>{t('guestManagement') || 'ការគ្រប់គ្រងភ្ញៀវ និងចំណងដៃ'}</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              គ្រប់គ្រងបញ្ជីភ្ញៀវ កត់ត្រាចំណងដៃ (ប្រាក់រៀល/ដុល្លារ) និងទាញយករបាយការណ៍ Excel
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Export Excel Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => handleExportExcel(activeSide)}
              disabled={isExporting || guests.length === 0}
              className="flex items-center gap-1.5 text-xs font-bold border-emerald-600/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 h-9"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              )}
              <span>Export Excel ចំណងដៃ</span>
            </Button>

            {/* Add Guest Button */}
            <Button onClick={openAddModal} className="flex items-center gap-2 font-bold shadow-sm text-xs h-9">
              <Plus className="w-4 h-4" />
              <span>{t('addGuest') || 'បន្ថែមភ្ញៀវ'}</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Side Tabs Header & Search */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5 bg-muted/40 p-1.5 rounded-2xl border border-primary/10">
              {/* All Guests Tab */}
              <button
                type="button"
                onClick={() => setActiveSide('all')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeSide === 'all'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>ទាំងអស់</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    activeSide === 'all' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                  }`}
                >
                  {guests.length}
                </span>
              </button>

              {/* Groom Side Tab */}
              <button
                type="button"
                onClick={() => setActiveSide('groom')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeSide === 'groom'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>{t('groomSideGuests') || 'ខាងកូនកម្លោះ'}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    activeSide === 'groom' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                  }`}
                >
                  {groomGuests.length}
                </span>
              </button>

              {/* Bride Side Tab */}
              <button
                type="button"
                onClick={() => setActiveSide('bride')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeSide === 'bride'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>{t('brideSideGuests') || 'ខាងកូនក្រមុំ'}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    activeSide === 'bride' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                  }`}
                >
                  {brideGuests.length}
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="w-full sm:w-72">
              <Input
                placeholder={t('searchGuest') || 'ស្វែងរកឈ្មោះ លេខទូរស័ព្ទ ឬចំណាំ...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-card text-xs h-9"
              />
            </div>
          </div>

          {/* Guest List Table */}
          {loading ? (
            <div className="py-12 text-center text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span>កំពុងផ្ទុកបញ្ជីភ្ញៀវ និងចំណងដៃ...</span>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-primary/20 shadow-sm">
              <table className="w-full border-collapse min-w-[950px] text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-xs font-bold text-muted-foreground">
                    <th className="p-3.5 text-left font-semibold text-foreground">{t('guestName') || 'ឈ្មោះភ្ញៀវ'}</th>
                    <th className="p-3.5 text-left font-semibold text-foreground">{t('guestPhone') || 'លេខទូរស័ព្ទ'}</th>
                    <th className="p-3.5 text-center font-semibold text-foreground">{t('guestSide') || 'ខាង'}</th>
                    <th className="p-3.5 text-center font-semibold text-foreground">{t('invitedCount') || 'អញ្ជើញ'}</th>
                    <th className="p-3.5 text-center font-semibold text-foreground">RSVP</th>
                    <th className="p-3.5 text-center font-semibold text-foreground">ចំណងដៃ</th>
                    <th className="p-3.5 text-right font-semibold text-foreground">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredGuests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-muted-foreground">
                        {search ? 'រកមិនឃើញភ្ញៀវដែលត្រូវគ្នានោះទេ' : t('noGuestsYet') || 'មិនទាន់មានភ្ញៀវនៅឡើយទេ'}
                      </td>
                    </tr>
                  ) : (
                    filteredGuests.map((guest) => {
                      const hasRsvp = guest.rsvps && guest.rsvps.length > 0;
                      const rsvpStatus = hasRsvp ? guest.rsvps![0].status : null;
                      const isGroomSide = guest.side === 'groom' || !guest.side;
                      const isDeleting = deletingId === guest.id;

                      const isGifted = Boolean(guest.giftReceived);
                      const hasKhr = guest.giftAmountKhr !== null && guest.giftAmountKhr !== undefined && Number(guest.giftAmountKhr) > 0;
                      const hasUsd = guest.giftAmountUsd !== null && guest.giftAmountUsd !== undefined && Number(guest.giftAmountUsd) > 0;

                      return (
                        <tr key={guest.id} className="hover:bg-muted/30 transition-colors">
                          {/* 1. Guest Name & Note */}
                          <td className="p-3.5">
                            <div className="font-semibold text-foreground">{guest.name}</div>
                            {guest.notes && <div className="text-xs text-muted-foreground mt-0.5">{guest.notes}</div>}
                          </td>

                          {/* 2. Phone */}
                          <td className="p-3.5 text-muted-foreground text-xs">{guest.phone || '-'}</td>

                          {/* 3. Side */}
                          <td className="p-3.5 text-center">
                            <span
                              className={`text-[11px] px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1 ${
                                isGroomSide
                                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {isGroomSide ? t('groomSide') || 'កូនកម្លោះ' : t('brideSide') || 'កូនក្រមុំ'}
                            </span>
                          </td>

                          {/* 4. Invited Count */}
                          <td className="p-3.5 text-center font-medium text-xs">{guest.invitedCount || 1} នាក់</td>

                          {/* 5. RSVP */}
                          <td className="p-3.5 text-center">
                            {hasRsvp ? (
                              <span
                                className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${
                                  rsvpStatus === 'ATTENDING'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    : rsvpStatus === 'NOT_ATTENDING'
                                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                }`}
                              >
                                {rsvpStatus === 'ATTENDING' ? 'ចូលរួម' : rsvpStatus === 'NOT_ATTENDING' ? 'មិនចូលរួម' : 'មិនទាន់ច្បាស់'}
                              </span>
                            ) : (
                              <span className="text-[11px] px-2.5 py-1 rounded-full font-medium bg-muted text-muted-foreground">
                                មិនទាន់ឆ្លើយតប
                              </span>
                            )}
                          </td>

                          {/* 6. Gift (ចំណងដៃ) Column */}
                          <td className="p-3.5">
                            <div className="flex flex-col items-center gap-1 text-center">
                              {isGifted ? (
                                <>
                                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    បានចងដៃ
                                  </span>

                                  {/* Amounts */}
                                  <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-bold pt-0.5">
                                    {hasKhr && (
                                      <span className="text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                                        ៛ {Number(guest.giftAmountKhr).toLocaleString()}
                                      </span>
                                    )}
                                    {hasUsd && (
                                      <span className="text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                                        $ {Number(guest.giftAmountUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </span>
                                    )}
                                    {!hasKhr && !hasUsd && (
                                      <span className="text-[11px] text-muted-foreground italic">
                                        (មិនបានបញ្ជាក់ចំនួន)
                                      </span>
                                    )}
                                  </div>

                                  {/* Gift Note */}
                                  {guest.giftNote && (
                                    <span className="text-[11px] text-muted-foreground truncate max-w-[160px]" title={guest.giftNote}>
                                      ចំណាំ៖ {guest.giftNote}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-muted text-muted-foreground border border-border">
                                  មិនទាន់ចងដៃ
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 7. Action Buttons */}
                          <td className="p-3.5 text-right">
                            <div className="flex justify-end items-center gap-1.5">
                              {/* Record Gift Button */}
                              <Button
                                type="button"
                                size="sm"
                                variant={isGifted ? 'outline' : 'default'}
                                onClick={() => openGiftModal(guest)}
                                title="កត់ត្រាចំណងដៃ"
                                className={`h-8 text-xs font-bold gap-1 px-2.5 ${
                                  isGifted
                                    ? 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                                    : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs'
                                }`}
                              >
                                <Gift className="w-3.5 h-3.5" />
                                <span>{isGifted ? 'កែចំណងដៃ' : 'កត់ចំណងដៃ'}</span>
                              </Button>

                              {/* Copy Invitation Link */}
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                title={t('copyLink') || 'ចម្លងតំណ'}
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
                                title={t('guestQrCodeTitle') || 'QR Code សម្រាប់ភ្ញៀវ'}
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
                                title={t('editGuest') || 'កែសម្រួល'}
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
                                title={t('deleteGuest') || 'លុប'}
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
        </CardContent>
      </Card>

      {/* ── RECORD GIFT MODAL ─────────────────────────────────────── */}
      {giftModalGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-card border border-primary/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b bg-muted/40">
              <div>
                <h3 className="font-serif font-bold text-lg text-primary flex items-center gap-2">
                  <Gift className="w-5 h-5 text-primary" />
                  <span>កត់ត្រាចំណងដៃ</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  សម្រាប់ភ្ញៀវ៖ <strong className="text-foreground">{giftModalGuest.name}</strong> ({giftModalGuest.side === 'bride' ? 'ខាងកូនក្រមុំ' : 'ខាងកូនកម្លោះ'})
                </p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setGiftModalGuest(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleSaveGift} className="p-5 space-y-4 overflow-y-auto">
              {giftError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                  {giftError}
                </div>
              )}

              {/* Gift Received Checkbox */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border">
                <input
                  type="checkbox"
                  id="giftReceivedCheckbox"
                  checked={giftReceived}
                  onChange={(e) => setGiftReceived(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor="giftReceivedCheckbox" className="text-xs sm:text-sm font-semibold text-foreground cursor-pointer flex-1">
                  បានចងដៃរួចហើយ (Gift Received)
                </label>
              </div>

              {/* Amount KHR Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-blue-500" />
                  <span>ចំនួនប្រាក់រៀល (KHR)</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="ឧ. 100000"
                    value={giftAmountKhr}
                    onChange={(e) => {
                      setGiftAmountKhr(e.target.value);
                      if (e.target.value && !giftReceived) setGiftReceived(true);
                    }}
                    className="font-mono text-sm pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none">
                    ៛
                  </span>
                </div>
                <div className="flex gap-1.5 pt-1">
                  {[50000, 100000, 200000, 500000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setGiftAmountKhr(String(preset));
                        if (!giftReceived) setGiftReceived(true);
                      }}
                      className="text-[10px] px-2 py-1 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 font-mono transition-colors"
                    >
                      +{preset.toLocaleString()}៛
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount USD Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-purple-500" />
                  <span>ចំនួនប្រាក់ដុល្លារ (USD)</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="ឧ. 50.00"
                    value={giftAmountUsd}
                    onChange={(e) => {
                      setGiftAmountUsd(e.target.value);
                      if (e.target.value && !giftReceived) setGiftReceived(true);
                    }}
                    className="font-mono text-sm pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none">
                    $
                  </span>
                </div>
                <div className="flex gap-1.5 pt-1">
                  {[20, 50, 100, 200].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setGiftAmountUsd(String(preset));
                        if (!giftReceived) setGiftReceived(true);
                      }}
                      className="text-[10px] px-2 py-1 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 font-mono transition-colors"
                    >
                      +${preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gift Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>កំណត់ចំណាំ</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="ឧ. ចងដៃក្នុងស្រោមសំបុត្រ ឬជូនពរ..."
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Gift Received Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>កាលបរិច្ឆេទចងដៃ</span>
                </label>
                <Input
                  type="datetime-local"
                  value={giftReceivedAt}
                  onChange={(e) => setGiftReceivedAt(e.target.value)}
                  className="text-xs"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t">
                {giftModalGuest.giftReceived ? (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleClearGift}
                    disabled={isSavingGift}
                    className="text-xs font-bold"
                  >
                    សម្អាតចំណងដៃ
                  </Button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setGiftModalGuest(null)}
                    disabled={isSavingGift}
                    className="text-xs"
                  >
                    បោះបង់
                  </Button>
                  <Button type="submit" size="sm" disabled={isSavingGift} className="font-bold text-xs">
                    {isSavingGift ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                        កំពុងរក្សាទុក...
                      </>
                    ) : (
                      'រក្សាទុក'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD / EDIT GUEST MODAL ─────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-card border border-primary/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b bg-muted/30">
              <h3 className="font-serif font-bold text-lg text-primary">
                {isEditing ? t('editGuest') || 'កែសម្រួលព័ត៌មានភ្ញៀវ' : t('addGuest') || 'បន្ថែមភ្ញៀវថ្មី'}
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
                    {t('guestName') || 'ឈ្មោះភ្ញៀវ'} *
                  </label>
                  <Input
                    placeholder={t('guestName') || 'បញ្ចូលឈ្មោះភ្ញៀវ'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* Guest Side Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t('guestSide') || 'ខាង'}
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
                      <span>{t('groomSide') || 'ខាងកូនកម្លោះ'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSide('bride')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        side === 'bride'
                          ? 'border-rose-500 bg-rose-500/15 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500'
                          : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                      }`}
                    >
                      <Heart className="w-4 h-4" />
                      <span>{t('brideSide') || 'ខាងកូនក្រមុំ'}</span>
                    </button>
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t('guestPhone') || 'លេខទូរស័ព្ទ'}
                  </label>
                  <Input
                    placeholder="012 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                {/* Invited Count */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t('invitedCount') || 'ចំនួនអញ្ជើញ (នាក់)'}
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={invitedCount}
                    onChange={(e) => setInvitedCount(parseInt(e.target.value) || 1)}
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t('notes') || 'កំណត់ចំណាំ'}
                  </label>
                  <Input
                    placeholder="មិត្តរួមការងារ, បងប្អូនជីដូនមួយ..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    {t('cancel') || 'បោះបង់'}
                  </Button>
                  <Button type="submit" disabled={isSaving} className="font-bold">
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('saving') || 'កំពុងរក្សាទុក...'}
                      </>
                    ) : (
                      t('save') || 'រក្សាទុក'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── GUEST QR MODAL ────────────────────────────────────────── */}
      {qrModalGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-card border border-primary/20 rounded-2xl shadow-2xl p-6 flex flex-col items-center text-center space-y-4">
            <div className="flex items-center justify-between w-full">
              <h3 className="font-serif font-bold text-lg text-primary flex items-center gap-1.5">
                <QrCodeIcon className="w-5 h-5 text-primary" />
                <span>QR Code សម្រាប់ភ្ញៀវ</span>
              </h3>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setQrModalGuest(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="w-full bg-muted/40 p-3 rounded-xl border border-primary/10">
              <div className="font-bold text-base text-foreground">{qrModalGuest.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {qrModalGuest.side === 'bride' ? 'ភ្ញៀវខាងកូនក្រមុំ' : 'ភ្ញៀវខាងកូនកម្លោះ'} • ចំនួនអញ្ជើញ {qrModalGuest.invitedCount || 1} នាក់
              </div>
            </div>

            {/* QR Display */}
            <div className="bg-white p-4 rounded-2xl shadow-inner border border-border">
              <QRCodeSVG
                id={`qr-svg-${qrModalGuest.id}`}
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${eventSlug || eventId}/guest/${qrModalGuest.id}`}
                size={200}
                level="H"
                includeMargin
              />
            </div>

            <div className="w-full flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleCopyLink(qrModalGuest.id)}
                className="flex-1 font-semibold text-xs"
              >
                {copiedId === qrModalGuest.id ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}
                ចម្លងតំណ
              </Button>

              <Button
                type="button"
                onClick={() => handleDownloadQr(qrModalGuest)}
                className="flex-1 font-semibold text-xs bg-primary text-primary-foreground"
              >
                <Download className="w-4 h-4 mr-1" />
                ទាញយក QR
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
