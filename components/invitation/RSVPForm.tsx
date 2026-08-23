"use client"

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RSVPForm({ eventId, guest }: { eventId: string, guest?: any }) {
  const t = useTranslations('RSVP');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    guestName: guest ? guest.name : '',
    phone: guest && guest.phone ? guest.phone : '',
    status: 'ATTENDING',
    attendingCount: guest ? guest.invitedCount : 1,
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          eventId, 
          guestId: guest ? guest.id : undefined,
          attendingCount: Number(formData.attendingCount) 
        })
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || t('error'));
      }
    } catch (err) {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-6 rounded-2xl text-center shadow border border-green-200 dark:border-green-800 space-y-2">
        <h3 className="text-xl font-bold font-serif">🎉 {t('success')}</h3>
        <p className="text-xs sm:text-sm text-green-600 dark:text-green-300">
          {t('thankYouForResponse')}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-card/80 p-4 sm:p-6 rounded-2xl sm:rounded-xl shadow-lg border border-primary/20 backdrop-blur-sm w-full max-w-md mx-auto">
      {error && <div className="text-destructive font-medium text-center text-sm">{error}</div>}
      
      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground">{t('guestName')}</label>
        <Input required placeholder={t('guestName')} className="text-base sm:text-sm" value={formData.guestName} onChange={(e) => setFormData({...formData, guestName: e.target.value})} />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground">{t('phone')}</label>
        <Input required placeholder={t('phone')} className="text-base sm:text-sm" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground">{t('attendanceStatus')}</label>
        <select 
          className="flex h-12 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm ring-offset-background font-serif"
          value={formData.status} 
          onChange={(e) => setFormData({...formData, status: e.target.value})}
        >
          <option value="ATTENDING">{t('attending')}</option>
          <option value="NOT_ATTENDING">{t('notAttending')}</option>
          <option value="UNSURE">{t('unsure')}</option>
        </select>
      </div>

      {formData.status === 'ATTENDING' && (
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">{t('attendingCount')}</label>
          <Input type="number" min="1" max="10" required placeholder={t('attendingCount')} className="text-base sm:text-sm" value={formData.attendingCount} onChange={(e) => setFormData({...formData, attendingCount: Number(e.target.value)})} />
        </div>
      )}

      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground">{t('blessingMessage')}</label>
        <textarea 
          placeholder={t('blessingMessage')} 
          className="flex min-h-[100px] sm:min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm ring-offset-background"
          value={formData.message} 
          onChange={(e) => setFormData({...formData, message: e.target.value})}
        />
      </div>

      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 text-base sm:text-sm font-serif cursor-pointer" disabled={loading}>
        {loading ? '...' : t('submit')}
      </Button>
    </form>
  );
}
