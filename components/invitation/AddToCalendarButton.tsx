"use client";

import { useEffect, useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { generateAndroidCalendarIntent } from '@/lib/calendar-android';

interface AddToCalendarButtonProps {
  event: any;
  locale: string;
  guestId?: string;
  guestName?: string;
}

export default function AddToCalendarButton({ event, locale, guestId, guestName }: AddToCalendarButtonProps) {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const isKm = locale === 'km';

  const slug = event?.slug || event?.id;

  // Server-generated direct .ics endpoint URL for desktop fallback
  const calendarIcsUrl = guestId
    ? `/api/invite/${slug}/guest/${guestId}/calendar.ics`
    : `/api/invite/${slug}/calendar.ics`;

  // iOS Calendar Bridge page URL (tailored for Safari, Telegram & Messenger on iOS)
  const calendarBridgeUrl = guestId
    ? `/invite/${slug}/guest/${guestId}/calendar`
    : `/invite/${slug}/calendar`;

  // Android Fallback page URL (if in-app browser blocks intent)
  const androidFallbackUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${guestId ? `/invite/${slug}/guest/${guestId}/calendar/android?blocked=1` : `/invite/${slug}/calendar/android?blocked=1`}`
    : '';

  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${guestId ? `/invite/${slug}/guest/${guestId}` : `/invite/${slug}`}`
    : '';

  // Generate direct Android Calendar Intent URI
  const { intentUrl: androidCalendarIntentUrl } = generateAndroidCalendarIntent(
    event,
    locale,
    baseUrl,
    guestName,
    androidFallbackUrl
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent || '';
      const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const android = /Android/i.test(ua);
      const inApp = /FBAN|FBAV|Messenger|Instagram|Telegram|Line|Twitter|MicroMessenger|FB_IAB|FBSS/i.test(ua);
      setIsIOS(ios);
      setIsAndroid(android);

      if (process.env.NODE_ENV === 'development') {
        console.log('[AddToCalendarButton]', {
          userAgent: ua,
          isIOS: ios,
          isAndroid: android,
          isInAppBrowser: inApp,
          androidCalendarIntentUrl,
          calendarBridgeUrl,
        });
      }
    }
  }, [androidCalendarIntentUrl, calendarBridgeUrl]);

  const primaryTargetUrl = isIOS
    ? calendarBridgeUrl
    : isAndroid
    ? androidCalendarIntentUrl
    : calendarIcsUrl;

  return (
    <div className="relative inline-block w-full text-center my-4">
      {/* Primary Trigger Button: Direct real anchor link for Android intent & iOS Bridge */}
      <div className="flex flex-col items-center justify-center">
        <a
          href={primaryTargetUrl}
          className="w-full max-w-xs mx-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 px-6 rounded-full shadow-lg flex items-center justify-center gap-2.5 group transition-all active:scale-95 cursor-pointer border border-primary/30"
        >
          <CalendarIcon className="w-5 h-5 group-hover:scale-110 transition-transform shrink-0" />
          <span className="text-sm sm:text-base font-serif tracking-wide">
            {isKm ? 'សូមកត់ចំណាំថ្ងៃចូលរួម' : 'Add to Calendar'}
          </span>
        </a>
      </div>
    </div>
  );
}
