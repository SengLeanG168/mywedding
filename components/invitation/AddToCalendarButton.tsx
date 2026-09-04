"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, Download, X, Sparkles, RefreshCw } from 'lucide-react';

interface AddToCalendarButtonProps {
  event: any;
  locale: string;
  guestId?: string;
  guestName?: string;
}

export default function AddToCalendarButton({ event, locale, guestId }: AddToCalendarButtonProps) {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isTelegram, setIsTelegram] = useState(false);
  const [isMessenger, setIsMessenger] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isKm = locale === 'km';

  const slug = event?.slug || event?.id;

  // Server-generated direct .ics endpoint URL
  const calendarIcsUrl = guestId
    ? `/api/invite/${slug}/guest/${guestId}/calendar.ics`
    : `/api/invite/${slug}/calendar.ics`;

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent || '';
      const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const android = /Android/i.test(ua);
      const telegram = /Telegram/i.test(ua);
      const messenger = /FBAN|FBAV|Messenger|Instagram|FB_IAB|FBSS|Facebook/i.test(ua);
      
      setIsIOS(ios);
      setIsAndroid(android);
      setIsTelegram(telegram);
      setIsMessenger(messenger);

      if (process.env.NODE_ENV === 'development') {
        console.log('[AddToCalendarButton]', {
          userAgent: ua,
          isIOS: ios,
          isAndroid: android,
          isTelegram: telegram,
          isMessenger: messenger,
          calendarIcsUrl,
        });
      }
    }
  }, [calendarIcsUrl]);

  // Lock background scroll when popup modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isModalOpen]);

  const isIosTelegram = isIOS && isTelegram;
  // Mobile popup used strictly for iOS Messenger / Facebook and Android (not iOS Telegram)
  const usePopup = mounted && ((isIOS && !isTelegram) || isAndroid);

  return (
    <div className="relative inline-block w-full text-center my-4">
      {/* Primary Trigger Button: Single clean button */}
      <div className="flex flex-col items-center justify-center">
        {usePopup ? (
          /* iOS Messenger & Android: open working top-down popup */
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            className="w-full max-w-xs mx-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 px-6 rounded-full shadow-lg flex items-center justify-center gap-2.5 group transition-all active:scale-95 cursor-pointer border border-primary/30"
          >
            <CalendarIcon className="w-5 h-5 group-hover:scale-110 transition-transform shrink-0" />
            <span className="text-sm sm:text-base font-serif tracking-wide">
              {isKm ? 'សូមកត់ចំណាំថ្ងៃចូលរួម' : 'Add to Calendar'}
            </span>
          </button>
        ) : (
          /* iOS Telegram & Desktop: direct real anchor link to .ics URL (same-tab, no popup, no download attr) */
          <a
            href={calendarIcsUrl}
            className="w-full max-w-xs mx-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 px-6 rounded-full shadow-lg flex items-center justify-center gap-2.5 group transition-all active:scale-95 cursor-pointer border border-primary/30"
          >
            <CalendarIcon className="w-5 h-5 group-hover:scale-110 transition-transform shrink-0" />
            <span className="text-sm sm:text-base font-serif tracking-wide">
              {isKm ? 'សូមកត់ចំណាំថ្ងៃចូលរួម' : 'Add to Calendar'}
            </span>
          </a>
        )}
      </div>

      {/* Top Down Popup Modal rendered via React Portal directly into document.body */}
      {usePopup && isModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] pointer-events-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] transition-opacity animate-in fade-in duration-200 cursor-pointer"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Top Down Popup Panel */}
          <div className="fixed top-0 left-0 right-0 z-[9999] w-full max-w-[430px] mx-auto bg-card border-b border-x border-primary/40 rounded-b-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col pt-[calc(18px+env(safe-area-inset-top,16px))] px-[18px] pb-5 max-h-[80dvh] animate-in slide-in-from-top duration-300">
            
            {/* Scrollable Content Area inside Top Down Panel */}
            <div
              className="overflow-y-auto max-h-[calc(80dvh-40px)] space-y-4 text-center pr-1"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {/* Header / Title */}
              <div className="flex flex-col items-center space-y-1.5 pt-1">
                <div className="w-12 h-12 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center text-primary shadow-inner mb-1">
                  <CalendarIcon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-foreground">
                  {isKm ? 'កំណត់ចំណាំថ្ងៃចូលរួម' : 'Save Event to Calendar'}
                </h3>
              </div>

              {/* Instruction Card */}
              <div className="bg-primary/10 border border-primary/25 rounded-2xl p-3.5 text-center space-y-1.5">
                <div className="flex items-center justify-center gap-1.5 text-primary text-xs font-serif font-semibold">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>{isKm ? 'ការណែនាំ' : 'Instructions'}</span>
                </div>
                <p className="text-xs sm:text-sm text-foreground/90 font-serif leading-relaxed px-1">
                  {isIOS
                    ? (isKm
                        ? 'សូមចុចប៊ូតុងខាងក្រោម ដើម្បីបើកឯកសារ Calendar។ បន្ទាប់មកជ្រើសរើស “Add to Calendar” ឬ “Save” ដើម្បីរក្សាទុកថ្ងៃចូលរួម។'
                        : 'Tap the button below to open the Calendar file. Then choose "Add to Calendar" or "Save" to save the wedding date.')
                    : (isKm
                        ? 'បន្ទាប់ពីទាញយកឯកសារ Calendar រួច សូមចុចបើកឯកសារ .ics នោះ ហើយជ្រើសរើស “Save” ឬ “Add to Calendar” ដើម្បីរក្សាទុកថ្ងៃចូលរួម។'
                        : 'After downloading the Calendar file, tap to open the .ics file and choose "Save" or "Add to Calendar" to save the wedding date.')}
                </p>
              </div>

              {/* iOS Messenger In-App Note (shown inside popup only) */}
              {isIOS && isMessenger && (
                <div className="bg-primary/10 border border-primary/25 rounded-2xl p-3 text-left space-y-1">
                  <p className="text-xs font-serif text-primary/90 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>{isKm ? 'ចំណាំសម្រាប់ Messenger' : 'Note for Messenger'}</span>
                  </p>
                  <p className="text-xs font-serif text-muted-foreground leading-relaxed">
                    {isKm
                      ? 'Messenger អាចរារាំងការបើក Calendar ដោយផ្ទាល់។ ប្រសិនបើមិនបើក សូមចុចបើកឯកសារ Calendar ម្តងទៀត ឬបើក Link ក្នុង Safari។'
                      : 'Messenger may restrict opening Calendar directly. If it does not open, tap open Calendar again or open this link in Safari.'}
                  </p>
                </div>
              )}

              {/* Action Buttons Area */}
              <div className="space-y-2.5 pt-1">
                {/* Primary Download / Open Button (Real Anchor Link to direct .ics) */}
                <a
                  href={calendarIcsUrl}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 px-6 rounded-2xl shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer font-serif text-sm sm:text-base"
                >
                  <Download className="w-5 h-5 shrink-0" />
                  <span>{isKm ? 'ទាញយក/បើកឯកសារ Calendar' : 'Download / Open Calendar'}</span>
                </a>

                {/* Optional Retry Button for iOS Messenger */}
                {isIOS && isMessenger && (
                  <a
                    href={calendarIcsUrl}
                    className="w-full bg-primary/15 hover:bg-primary/25 text-primary font-medium py-3 px-6 rounded-2xl border border-primary/30 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer font-serif text-xs sm:text-sm"
                  >
                    <RefreshCw className="w-4 h-4 shrink-0" />
                    <span>{isKm ? 'បើកឯកសារ Calendar ម្តងទៀត' : 'Open Calendar Again'}</span>
                  </a>
                )}

                {/* Secondary Close Button */}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium py-3 px-6 rounded-2xl border border-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer font-serif text-xs sm:text-sm"
                >
                  <X className="w-4 h-4 shrink-0 text-muted-foreground" />
                  <span>{isKm ? 'បិទ' : 'Close'}</span>
                </button>
              </div>
            </div>

            {/* Bottom Grab Indicator Accent */}
            <div className="w-12 h-1 bg-muted-foreground/25 rounded-full mx-auto mt-3 shrink-0" />

          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
