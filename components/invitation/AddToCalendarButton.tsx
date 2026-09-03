"use client";

import { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Info } from 'lucide-react';

interface AddToCalendarButtonProps {
  event: any;
  locale: string;
  guestId?: string;
  guestName?: string;
}

export default function AddToCalendarButton({ event, locale, guestId }: AddToCalendarButtonProps) {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const isKm = locale === 'km';

  const slug = event?.slug || event?.id;

  // Server-generated direct .ics endpoint URL for Android & Desktop
  const calendarIcsUrl = guestId
    ? `/api/invite/${slug}/guest/${guestId}/calendar.ics`
    : `/api/invite/${slug}/calendar.ics`;

  // iOS Calendar Bridge page URL (tailored for Safari, Telegram & Messenger on iOS)
  const calendarBridgeUrl = guestId
    ? `/invite/${slug}/guest/${guestId}/calendar`
    : `/invite/${slug}/calendar`;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent || '';
      const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const android = /Android/i.test(ua);
      const inApp = /FBAN|FBAV|Messenger|Instagram|Telegram|Line|Twitter|MicroMessenger|FB_IAB|FBSS/i.test(ua);
      
      setIsIOS(ios);
      setIsAndroid(android);
      setIsInAppBrowser(inApp);

      if (process.env.NODE_ENV === 'development') {
        console.log('[AddToCalendarButton]', {
          userAgent: ua,
          isIOS: ios,
          isAndroid: android,
          isInAppBrowser: inApp,
          calendarIcsUrl,
          calendarBridgeUrl,
        });
      }
    }
  }, [calendarIcsUrl, calendarBridgeUrl]);

  // Routing: iOS -> iOS Bridge, Android -> Direct .ics download, Desktop -> Direct .ics download
  const primaryTargetUrl = isIOS ? calendarBridgeUrl : calendarIcsUrl;

  return (
    <div className="relative inline-block w-full text-center my-4">
      {/* Primary Trigger Button */}
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

        {/* Android-Only Instruction Note */}
        {isAndroid && (
          <div className="mt-2.5 max-w-sm mx-auto px-3 text-center animate-in fade-in duration-300">
            <p className="text-xs sm:text-[13px] font-serif text-primary/80 leading-relaxed">
              {isInAppBrowser
                ? (isKm
                    ? 'កំណត់ចំណាំ៖ បន្ទាប់ពីចុចប៊ូតុងនេះ ឯកសារ Calendar នឹងត្រូវបានទាញយក។ សូមចុចបើកឯកសារ .ics ដែលបានទាញយក រួចចុច “Save” ឬ “Add to Calendar”។'
                    : 'Note: Tapping this button will download a calendar file. Tap to open the downloaded .ics file and choose "Save" or "Add to Calendar".')
                : (isKm
                    ? 'កំណត់ចំណាំ៖ បន្ទាប់ពីទាញយកឯកសារ Calendar រួច សូមចុចបើកឯកសារ .ics នោះ ហើយជ្រើសរើស “Save” ឬ “Add to Calendar” ដើម្បីរក្សាទុកថ្ងៃចូលរួម។'
                    : 'Note: After downloading the calendar file, tap to open the .ics file and choose "Save" or "Add to Calendar" to save the wedding date.')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
