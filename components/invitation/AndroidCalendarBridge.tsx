"use client";

import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, ArrowLeft, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { generateAndroidCalendarIntent } from '@/lib/calendar-android';

interface AndroidCalendarBridgeProps {
  event: any;
  guestId?: string;
  guestName?: string;
  locale?: string;
}

export default function AndroidCalendarBridge({
  event,
  guestId,
  guestName,
  locale = 'km',
}: AndroidCalendarBridgeProps) {
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [showRetryButton, setShowRetryButton] = useState(false);

  const isKm = locale === 'km';
  const slug = event?.slug || event?.id;

  const returnUrl = guestId
    ? `/invite/${slug}/guest/${guestId}?skipIntro=1#calendar-section`
    : `/invite/${slug}?skipIntro=1#calendar-section`;
  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}${guestId ? `/invite/${slug}/guest/${guestId}` : `/invite/${slug}`}` : '';

  const { intentUrl } = generateAndroidCalendarIntent(event, locale, baseUrl, guestName);

  const brideName = isKm ? (event.brideNameKm || event.brideNameEn || '') : (event.brideNameEn || event.brideNameKm || '');
  const groomName = isKm ? (event.groomNameKm || event.groomNameEn || '') : (event.groomNameEn || event.groomNameKm || '');
  const coupleTitle = `${groomName} & ${brideName}`;

  useEffect(() => {
    const ua = window.navigator.userAgent || '';
    const inApp = /FBAN|FBAV|Messenger|Instagram|Telegram|Line|Twitter|MicroMessenger|FB_IAB|FBSS/i.test(ua);
    setIsInAppBrowser(inApp);

    if (process.env.NODE_ENV === 'development') {
      console.log('[AndroidCalendarBridge]', {
        userAgent: ua,
        isInAppBrowser: inApp,
        intentUrl,
      });
    }

    // Attempt 1: Immediate automatic launch of native Android calendar intent
    const directTimer = setTimeout(() => {
      window.location.href = intentUrl;
    }, 150);

    // Show retry button after 1.5 seconds if still on bridge screen
    const retryTimer = setTimeout(() => {
      setShowRetryButton(true);
    }, 1500);

    return () => {
      clearTimeout(directTimer);
      clearTimeout(retryTimer);
    };
  }, [intentUrl]);

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

        {/* Single Primary Action Button */}
        {showRetryButton && (
          <div className="pt-2 animate-in fade-in duration-300">
            <a
              href={intentUrl}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 px-6 rounded-2xl shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer font-serif text-sm sm:text-base"
            >
              <RefreshCw className="w-5 h-5 shrink-0" />
              <span>{isKm ? 'បើកប្រតិទិនម្តងទៀត' : 'Open Calendar Again'}</span>
            </a>
          </div>
        )}

        {/* In-App Browser Note (Telegram / Messenger) */}
        {isInAppBrowser && (
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/25 text-left text-xs font-serif text-muted-foreground space-y-1">
            <p className="font-semibold text-primary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{isKm ? 'ចំណាំសម្រាប់ Telegram / Messenger' : 'Note for In-App Browser'}</span>
            </p>
            <p className="leading-relaxed">
              {isKm
                ? 'កម្មវិធីនេះអាចរារាំងការបើក Calendar ដោយផ្ទាល់។ សូមចុចប៊ូតុង “បើកប្រតិទិនម្តងទៀត” ខាងលើ ឬចុចសញ្ញា ⋯ ហើយជ្រើសរើស “Open in Chrome”។'
                : 'In-app browsers may block automatic calendar launching. Tap "Open Calendar Again" above or tap ⋯ and choose "Open in Chrome".'}
            </p>
          </div>
        )}

        {/* Back to Invitation Link */}
        <div className="pt-2 border-t border-border/50">
          <a
            href={returnUrl}
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-primary hover:text-primary/80 font-serif font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isKm ? 'ត្រឡប់ទៅមាតិកាធៀប' : 'Back to Invitation Content'}</span>
          </a>
        </div>

      </div>
    </div>
  );
}
