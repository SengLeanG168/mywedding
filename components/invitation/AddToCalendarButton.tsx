"use client";

import { useEffect, useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

interface AddToCalendarButtonProps {
  event: any;
  locale: string;
  guestId?: string;
  guestName?: string;
}

export default function AddToCalendarButton({ event, locale, guestId }: AddToCalendarButtonProps) {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const isKm = locale === 'km';

  const slug = event?.slug || event?.id;

  // Server-generated direct .ics endpoint URL for desktop
  const calendarIcsUrl = guestId
    ? `/api/invite/${slug}/guest/${guestId}/calendar.ics`
    : `/api/invite/${slug}/calendar.ics`;

  // iOS Calendar Bridge page URL (tailored for Safari, Telegram & Messenger on iOS)
  const calendarBridgeUrl = guestId
    ? `/${locale}/invite/${slug}/guest/${guestId}/calendar`
    : `/${locale}/invite/${slug}/calendar`;

  // Android Calendar Bridge page URL (tailored for Android instruction & .ics download)
  const androidCalendarBridgeUrl = guestId
    ? `/${locale}/invite/${slug}/guest/${guestId}/calendar/android`
    : `/${locale}/invite/${slug}/calendar/android`;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent || '';
      const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const android = /Android/i.test(ua);
      
      setIsIOS(ios);
      setIsAndroid(android);

      if (process.env.NODE_ENV === 'development') {
        console.log('[AddToCalendarButton]', {
          userAgent: ua,
          isIOS: ios,
          isAndroid: android,
          calendarIcsUrl,
          calendarBridgeUrl,
          androidCalendarBridgeUrl,
        });
      }
    }
  }, [calendarIcsUrl, calendarBridgeUrl, androidCalendarBridgeUrl]);

  // Routing: iOS -> iOS Bridge, Android -> Android Bridge, Desktop -> Direct .ics download
  const primaryTargetUrl = isIOS
    ? calendarBridgeUrl
    : isAndroid
    ? androidCalendarBridgeUrl
    : calendarIcsUrl;

  return (
    <div className="relative inline-block w-full text-center my-4">
      {/* Primary Trigger Button: Single clean button */}
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
