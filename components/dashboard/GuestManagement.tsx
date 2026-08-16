"use client"

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Edit2, Trash2, QrCode as QrCodeIcon, Check, Copy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QRCodeSVG } from 'qrcode.react';

interface Guest {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  invitedCount: number;
  notes?: string | null;
  rsvps?: any[];
}

export default function GuestManagement({ eventId, eventSlug }: { eventId: string, eventSlug: string }) {
  const t = useTranslations('Dashboard');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [currentGuestId, setCurrentGuestId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [invitedCount, setInvitedCount] = useState(1);
  const [notes, setNotes] = useState('');
  
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchGuests();
  }, [eventId]);

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
    setInvitedCount(1);
    setNotes('');
    setCurrentGuestId(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (guest: Guest) => {
    setName(guest.name);
    setPhone(guest.phone || '');
    setInvitedCount(guest.invitedCount);
    setNotes(guest.notes || '');
    setCurrentGuestId(guest.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this guest?')) return;
    try {
      await fetch(`/api/events/${eventId}/guests/${id}`, { method: 'DELETE' });
      fetchGuests();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { name, phone, invitedCount, notes };
      if (isEditing && currentGuestId) {
        await fetch(`/api/events/${eventId}/guests/${currentGuestId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(`/api/events/${eventId}/guests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      setIsModalOpen(false);
      fetchGuests();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyLink = (guestId: string) => {
    const url = `${window.location.origin}/invite/${eventSlug}/guest/${guestId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(guestId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredGuests = guests.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase()) || 
    (g.phone && g.phone.includes(search))
  );

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('guestManagement')}</CardTitle>
        <Button onClick={openAddModal} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {t('addGuest')}
        </Button>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="mb-6">
          <Input 
            placeholder={t('searchGuest')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Guest List */}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-medium">{t('guestName')}</th>
                  <th className="p-3 text-left font-medium">{t('guestPhone')}</th>
                  <th className="p-3 text-center font-medium">{t('invitedCount')}</th>
                  <th className="p-3 text-center font-medium">RSVP</th>
                  <th className="p-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      {search ? 'No matching guests found.' : t('noGuestsYet', { defaultMessage: 'No guests yet.' })}
                    </td>
                  </tr>
                ) : (
                  filteredGuests.map(guest => {
                    const hasRsvp = guest.rsvps && guest.rsvps.length > 0;
                    const rsvpStatus = hasRsvp ? guest.rsvps![0].status : null;
                    const inviteUrl = `${window.location.origin}/invite/${eventSlug}/guest/${guest.id}`;

                    return (
                      <tr key={guest.id} className="border-b hover:bg-muted/30">
                        <td className="p-3">
                          <div className="font-medium">{guest.name}</div>
                          {guest.notes && <div className="text-xs text-muted-foreground mt-1">{guest.notes}</div>}
                        </td>
                        <td className="p-3 text-muted-foreground">{guest.phone || '-'}</td>
                        <td className="p-3 text-center">{guest.invitedCount}</td>
                        <td className="p-3 text-center">
                          {hasRsvp ? (
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                              rsvpStatus === 'ATTENDING' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              rsvpStatus === 'NOT_ATTENDING' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                              'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}>
                              {rsvpStatus}
                            </span>
                          ) : (
                            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right flex justify-end items-center gap-2">
                          <Button 
                            size="icon" 
                            variant="outline" 
                            title={t('copyLink')}
                            onClick={() => handleCopyLink(guest.id)}
                            className="h-8 w-8"
                          >
                            {copiedId === guest.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </Button>
                          <div className="relative group cursor-pointer inline-flex items-center justify-center h-8 w-8 rounded-md border bg-background hover:bg-muted transition-colors">
                            <QrCodeIcon className="w-4 h-4" />
                            {/* Hover QR Preview */}
                            <div className="absolute hidden group-hover:block z-50 bottom-full right-0 mb-2 p-3 bg-white rounded-xl shadow-2xl border">
                               <QRCodeSVG value={inviteUrl} size={150} />
                               <div className="text-xs text-center mt-2 text-black font-medium text-nowrap">Scan to view invitation</div>
                            </div>
                          </div>
                          <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => openEditModal(guest)}>
                            <Edit2 className="w-4 h-4 text-blue-500" />
                          </Button>
                          <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleDelete(guest.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal Overlay */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-card border rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-semibold text-lg">{isEditing ? t('editGuest') : t('addGuest')}</h3>
                <Button size="icon" variant="ghost" onClick={() => setIsModalOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="p-4 overflow-y-auto">
                <form id="guestForm" onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('guestName')}</label>
                    <Input 
                      placeholder={t('guestName')}
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('guestPhone')}</label>
                    <Input 
                      placeholder={t('guestPhone')}
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('invitedCount')}</label>
                    <Input 
                      type="number"
                      min="1"
                      placeholder={t('invitedCount')}
                      value={invitedCount}
                      onChange={e => setInvitedCount(parseInt(e.target.value))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('notes')}</label>
                    <textarea 
                      placeholder={t('notes')}
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    />
                  </div>
                </form>
              </div>
              <div className="p-4 border-t bg-muted/20 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" form="guestForm">
                  {isEditing ? t('editGuest') : t('addGuest')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
