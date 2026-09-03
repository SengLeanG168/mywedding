"use client";

import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, ExternalLink, ArrowLeft, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IosCalendarBridgeProps {
  event: any;
  guestId?: string;
  locale?: string;
}

export default function IosCalendarBridge({ event, guestId, locale = 'km' }: IosCalendarBridgeProps) {
  const [showRetry, setShowRetry] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [isTelegram, setIsTelegram] = useState(false);
  const [isMessenger, setIsMessenger] = useState(false);

  const isKm = locale === 'km';
  const slug = event?.slug || event?.id;

  // Return directly to the main invitation content bypassing intro/curtain
  const returnUrl = guestId
    ? `/${locale}/invite/${slug}/guest/${guestId}?skipIntro=1#calendar-section`
    : `/${locale}/invite/${slug}?skipIntro=1#calendar-section`;

  const calendarIcsUrl = guestId
    ? `/api/invite/${slug}/guest/${guestId}/calendar.ics`
    : `/api/invite/${slug}/calendar.ics`;

  const brideName = isKm ? (event.brideNameKm || event.brideNameEn || '') : (event.brideNameEn || event.brideNameKm || '');
  const groomName = isKm ? (event.groomNameKm || event.groomNameEn || '') : (event.groomNameEn || event.groomNameKm || '');
  const coupleTitle = `${groomName} & ${brideName}`;

  useEffect(() => {
    const ua = window.navigator.userAgent || '';
    const telegram = /Telegram/i.test(ua);
    const messenger = /FBAN|FBAV|Messenger|Instagram|FB_IAB|FBSS/i.test(ua);
    const inApp = telegram || messenger || /Line|Twitter|MicroMessenger/i.test(ua);

    setIsTelegram(telegram);
    setIsMessenger(messenger);
    setIsInAppBrowser(inApp);

    if (process.env.NODE_ENV === 'development') {
      console.log('[IosCalendarBridge]', {
        userAgent: ua,
        isTelegram: telegram,
        isMessenger: messenger,
        isInAppBrowser: inApp,
        calendarIcsUrl,
      });
    }

    // Primary Attempt: Direct inline .ics navigation in the same tab (no download attribute, no target="_blank")
    const directTimer = setTimeout(() => {
      window.location.href = calendarIcsUrl;
    }, 150);

    // After 1.5 seconds, reveal retry button if still on bridge screen
    const retryTimer = setTimeout(() => {
      setShowRetry(true);
    }, 1500);

    return () => {
      clearTimeout(directTimer);
      clearTimeout(retryTimer);
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
        
        {/* Header Icon / Arch */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center text-primary shadow-inner">
            <CalendarIcon className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-serif text-primary/80 uppercase tracking-widest">
              {isKm ? 'ពិធីមង្គលអាពាហ៍ពិពាហ៍' : 'Wedding Ceremony'}
            </h2>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-foreground mt-1">
              {coupleTitle}
            </h1>
          </div>
        </div>

        {/* Loading Spinner & Status Text */}
        <div className="py-2 space-y-2">
          <div className="flex items-center justify-center gap-2 text-primary font-serif text-lg sm:text-xl font-semibold">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{isKm ? 'កំពុងបើកប្រតិទិន...' : 'Opening Calendar...'}</span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-serif leading-relaxed px-2">
            {isKm
              ? 'សូមរង់ចាំបន្តិច ប្រព័ន្ធកំពុងបើក Calendar ដើម្បីរក្សាទុកថ្ងៃចូលរួម។'
              : 'Please wait a moment while your calendar opens to save the wedding date.'}
          </p>
        </div>

        {/* Single Primary Action Button on Retry */}
        {showRetry && (
          <div className="pt-2 animate-in fade-in duration-300">
            <a
              href={calendarIcsUrl}
              onClick={(e) => {
                window.location.href = calendarIcsUrl;
              }}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 px-6 rounded-2xl shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer font-serif text-sm sm:text-base"
            >
              <CalendarIcon className="w-5 h-5 shrink-0" />
              <span>{isKm ? 'បើកក្នុង Calendar ម្តងទៀត' : 'Open in Calendar Again'}</span>
            </a>
          </div>
        )}

        {/* In-App Browser (Telegram / Messenger) Helper Note */}
        {isInAppBrowser && (
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/25 text-left text-xs font-serif text-muted-foreground space-y-1">
            <p className="font-semibold text-primary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>
                {isMessenger
                  ? (isKm ? 'ចំណាំសម្រាប់ Messenger' : 'Note for Messenger')
                  : isTelegram
                  ? (isKm ? 'ចំណាំសម្រាប់ Telegram' : 'Note for Telegram')
                  : (isKm ? 'ចំណាំសម្រាប់កម្មវិធី' : 'Note for In-App Browser')}
              </span>
            </p>
            <p className="leading-relaxed">
              {isKm
                ? 'កម្មវិធីនេះអាចរារាំងការបើក Calendar ដោយផ្ទាល់។ សូមចុច “បើកក្នុង Calendar ម្តងទៀត” ខាងលើ ឬចុចសញ្ញា ⋯ ហើយជ្រើសរើស “Open in Safari”។'
                : 'This app may restrict automatic calendar opening. Tap "Open in Calendar Again" above or tap ⋯ and choose "Open in Safari".'}
            </p>
          </div>
        )}

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
