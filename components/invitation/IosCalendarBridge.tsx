"use client";

import React, { useEffect } from 'react';
import { Calendar as CalendarIcon, ArrowLeft, Sparkles } from 'lucide-react';

interface IosCalendarBridgeProps {
  event: any;
  guestId?: string;
  locale?: string;
}

export default function IosCalendarBridge({ event, guestId, locale = 'km' }: IosCalendarBridgeProps) {
  const isKm = locale === 'km';
  const slug = event?.slug || event?.id;

  const localePrefix = locale === 'km' ? '' : `/${locale}`;

  // Return directly to the main invitation content bypassing intro/curtain
  const returnUrl = guestId
    ? `${localePrefix}/invite/${slug}/guest/${guestId}?skipIntro=1#calendar-section`
    : `${localePrefix}/invite/${slug}?skipIntro=1#calendar-section`;

  const calendarIcsUrl = guestId
    ? `/api/invite/${slug}/guest/${guestId}/calendar.ics`
    : `/api/invite/${slug}/calendar.ics`;

  const brideName = isKm ? (event.brideNameKm || event.brideNameEn || '') : (event.brideNameEn || event.brideNameKm || '');
  const groomName = isKm ? (event.groomNameKm || event.groomNameEn || '') : (event.groomNameEn || event.groomNameKm || '');
  const coupleTitle = `${groomName} & ${brideName}`;

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[IosCalendarBridge]', {
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
        calendarIcsUrl,
      });
    }

    // Automatic same-tab navigation to direct .ics URL
    const directTimer = setTimeout(() => {
      window.location.href = calendarIcsUrl;
    }, 150);

    return () => {
      clearTimeout(directTimer);
    };
  }, [calendarIcsUrl]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative Warm Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      {/* Main Bridge Card */}
      <div className="relative z-10 w-full max-w-md bg-card/90 backdrop-blur-xl border border-primary/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        
        {/* Header Icon / Title */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center text-primary shadow-inner">
            <CalendarIcon className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-serif text-primary/80 uppercase tracking-widest">
              {isKm ? 'ពិធីមង្គលអាពាហ៍ពិពាហ៍' : 'Wedding Ceremony'}
            </h2>
            {coupleTitle && (
              <p className="text-sm font-serif text-muted-foreground mt-0.5">
                {coupleTitle}
              </p>
            )}
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-foreground mt-1">
              {isKm ? 'កំណត់ចំណាំថ្ងៃចូលរួម' : 'Save Event to Calendar'}
            </h1>
          </div>
        </div>

        {/* Instruction Card */}
        <div className="bg-primary/10 border border-primary/25 rounded-2xl p-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-primary text-xs font-serif font-semibold">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{isKm ? 'ការណែនាំ' : 'Instructions'}</span>
          </div>
          <p className="text-xs sm:text-sm text-foreground/90 font-serif leading-relaxed">
            {isKm
              ? 'សូមចុចប៊ូតុងខាងក្រោម ដើម្បីបើកឯកសារ Calendar ហើយជ្រើសរើស “Add to Calendar” ឬ “Save”។'
              : 'Tap the button below to open the Calendar file, then choose "Add to Calendar" or "Save".'}
          </p>
        </div>

        {/* Primary Action Button (Real <a> tag with direct calendarIcsUrl) */}
        <div className="pt-1">
          <a
            href={calendarIcsUrl}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 px-6 rounded-2xl shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer font-serif text-sm sm:text-base border border-primary/30"
          >
            <CalendarIcon className="w-5 h-5 shrink-0" />
            <span>{isKm ? 'បើកឯកសារ Calendar' : 'Open Calendar File'}</span>
          </a>
        </div>

        {/* Return directly to Main Content */}
        <div className="pt-2 border-t border-border/50">
          <a
            href={returnUrl}
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-primary hover:text-primary/80 font-serif font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isKm ? 'ត្រឡប់មកមាតិកាធៀបវិញ' : 'Back to Invitation Content'}</span>
          </a>
        </div>

      </div>
    </div>
  );
}
