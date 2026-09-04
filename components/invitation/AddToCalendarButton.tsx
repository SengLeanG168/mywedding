"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, Download, X, Sparkles, Check, MoreHorizontal } from 'lucide-react';

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
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
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
      const inApp = telegram || messenger || /Line|Twitter|MicroMessenger/i.test(ua);
      
      setIsIOS(ios);
      setIsAndroid(android);
      setIsTelegram(telegram);
      setIsMessenger(messenger);
      setIsInAppBrowser(inApp);

      if (process.env.NODE_ENV === 'development') {
        console.log('[AddToCalendarButton]', {
          userAgent: ua,
          isIOS: ios,
          isAndroid: android,
          isTelegram: telegram,
          isMessenger: messenger,
          isInAppBrowser: inApp,
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

  const isIosInApp = isIOS && (isTelegram || isMessenger || isInAppBrowser);
  const isIosMessenger = isIOS && isMessenger;
  // Popup is used for iOS In-App Browsers (Telegram, Messenger, Facebook) and Android
  const usePopup = mounted && (isIosInApp || isAndroid);

  return (
    <div className="relative inline-block w-full text-center my-4">
      {/* Primary Trigger Button: Single clean button */}
      <div className="flex flex-col items-center justify-center">
        {usePopup ? (
          /* iOS In-App & Android: open working top-down popup */
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
          /* iOS External Browser & Desktop: direct real anchor link to .ics URL */
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
          <div className="fixed top-0 left-0 right-0 z-[9999] w-full max-w-[430px] mx-auto bg-card border-b border-x border-primary/40 rounded-b-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col pt-[calc(18px+env(safe-area-inset-top,16px))] px-[18px] pb-5 max-h-[85dvh] animate-in slide-in-from-top duration-300">
            
            {/* Scrollable Content Area inside Top Down Panel */}
            <div
              id="messenger-instructions-area"
              className="overflow-y-auto max-h-[calc(85dvh-40px)] space-y-4 text-center pr-1"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {/* Header / Title */}
              <div className="flex flex-col items-center space-y-1.5 pt-1">
                <div className="w-12 h-12 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center text-primary shadow-inner mb-1">
                  <CalendarIcon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-foreground">
                  {isIosMessenger
                    ? (isKm ? 'សូមកត់ចំណាំថ្ងៃចូលរួម' : 'Add to Calendar')
                    : isIosInApp
                    ? (isKm ? 'សូមបើកក្នុង Browser' : 'Please Open in Browser')
                    : (isKm ? 'កំណត់ចំណាំថ្ងៃចូលរួម' : 'Save Event to Calendar')}
                </h3>
              </div>

              {/* Instruction Card */}
              <div className="bg-primary/10 border border-primary/25 rounded-2xl p-3.5 text-center space-y-1.5">
                <div className="flex items-center justify-center gap-1.5 text-primary text-xs font-serif font-semibold">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>{isKm ? 'ការណែនាំ' : 'Instructions'}</span>
                </div>
                <p className="text-xs sm:text-sm text-foreground/90 font-serif leading-relaxed px-1 text-left">
                  {isIosMessenger ? (
                    isKm ? (
                      <>
                        ដើម្បីរក្សាទុកថ្ងៃចូលរួមទៅកាន់ប្រតិទិនបានត្រឹមត្រូវ សូមចុចសញ្ញា{' '}
                        <span className="inline-flex items-center justify-center align-middle mx-1 px-1.5 py-0.5 rounded-md bg-primary/20 text-primary leading-none border border-primary/30">
                          <MoreHorizontal className="w-3.5 h-3.5 shrink-0" />
                        </span>{' '}
                        នៅខាងលើ រួចបើក <span className="font-semibold text-foreground">Open in external browser</span> បន្ទាប់មកចុច{' '}
                        <span className="font-semibold text-primary">សូមកត់ចំណាំថ្ងៃចូលរួម</span> ម្ដងទៀត រួចចុច{' '}
                        <span className="font-semibold text-foreground">Continue</span> និងចុច{' '}
                        <span className="font-semibold text-foreground">Add To Calendar</span> រួចចុចសញ្ញា{' '}
                        <span className="inline-flex items-center justify-center align-middle mx-1 w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 leading-none border border-emerald-500/40 font-bold">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>{' '}
                        នៅខាងលើជាការស្រេច។ ហើយដើម្បីត្រឡប់ទៅកាន់ធៀបវិញបន្ទាប់ពីចុចសញ្ញា{' '}
                        <span className="inline-flex items-center justify-center align-middle mx-1 w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 leading-none border border-emerald-500/40 font-bold">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>{' '}
                        សូមចុចសញ្ញា{' '}
                        <span className="inline-flex items-center justify-center align-middle mx-1 w-4 h-4 rounded-full bg-destructive/20 text-destructive leading-none border border-destructive/40 font-bold">
                          <X className="w-3 h-3 stroke-[3]" />
                        </span>{' '}
                        នៅខាងលើ។
                      </>
                    ) : (
                      <>
                        To properly save the event date to your calendar, tap the{' '}
                        <span className="inline-flex items-center justify-center align-middle mx-1 px-1.5 py-0.5 rounded-md bg-primary/20 text-primary leading-none border border-primary/30">
                          <MoreHorizontal className="w-3.5 h-3.5 shrink-0" />
                        </span>{' '}
                        icon at the top and select <span className="font-semibold text-foreground">Open in external browser</span>. Then tap{' '}
                        <span className="font-semibold text-primary">Add to Calendar</span> again, tap{' '}
                        <span className="font-semibold text-foreground">Continue</span> and tap{' '}
                        <span className="font-semibold text-foreground">Add To Calendar</span>, then tap the{' '}
                        <span className="inline-flex items-center justify-center align-middle mx-1 w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 leading-none border border-emerald-500/40 font-bold">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>{' '}
                        icon at the top to complete. To return to the invitation, tap the{' '}
                        <span className="inline-flex items-center justify-center align-middle mx-1 w-4 h-4 rounded-full bg-destructive/20 text-destructive leading-none border border-destructive/40 font-bold">
                          <X className="w-3 h-3 stroke-[3]" />
                        </span>{' '}
                        icon at the top.
                      </>
                    )
                  ) : isIosInApp ? (
                    isKm
                      ? 'ដើម្បីរក្សាទុកថ្ងៃចូលរួមទៅ Calendar បានត្រឹមត្រូវ សូមបើក Link នេះក្នុង Browser ខាងក្រៅជាមុនសិន។'
                      : 'To save the event date to Calendar properly, please open this link in an external browser first.'
                  ) : (
                    isKm
                      ? 'បន្ទាប់ពីទាញយកឯកសារ Calendar រួច សូមចុចបើកឯកសារ .ics នោះ ហើយជ្រើសរើស “Save” ឬ “Add to Calendar” ដើម្បីរក្សាទុកថ្ងៃចូលរួម។'
                      : 'After downloading the Calendar file, tap to open the .ics file and choose "Save" or "Add to Calendar" to save the wedding date.'
                  )}
                </p>
              </div>

              {/* iOS In-App Helper Guide (for Telegram or other non-Messenger in-app browsers) */}
              {isIosInApp && !isIosMessenger && (
                <div className="bg-primary/10 border border-primary/25 rounded-2xl p-3 text-left space-y-1.5">
                  <p className="text-xs font-serif text-primary/90 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {isTelegram
                        ? (isKm ? 'របៀបបើកក្នុង Telegram' : 'How to open in Telegram')
                        : (isKm ? 'របៀបបើកក្នុង Browser ខាងក្រៅ' : 'How to open in External Browser')}
                    </span>
                  </p>
                  <p className="text-xs font-serif text-muted-foreground leading-relaxed">
                    {isTelegram
                      ? (isKm
                          ? 'សូមចុចប៊ូតុង Share ឬ … ខាងលើ រួចជ្រើសរើស “Open in Browser” ឬ “Open in Safari/Chrome” ប្រសិនបើមាន។'
                          : 'Tap the Share or … button above and choose "Open in Browser" or "Open in Safari/Chrome" if available.')
                      : (isKm
                          ? 'សូមចុចសញ្ញា … ឬ Share ខាងលើ រួចជ្រើសរើស “Open in Browser” ដើម្បីបើកក្នុង Browser ខាងក្រៅ។'
                          : 'Tap … or Share above and choose "Open in Browser" to open in an external browser.')}
                  </p>
                </div>
              )}

              {/* Action Buttons Area */}
              <div className="space-y-2.5 pt-1">
                {isIosMessenger ? (
                  /* iOS Messenger Action: របៀបបើកក្នុង Browser */
                  <button
                    type="button"
                    onClick={() => {
                      const scrollContainer = document.getElementById('messenger-instructions-area');
                      if (scrollContainer) {
                        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 px-6 rounded-2xl shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer font-serif text-sm sm:text-base border border-primary/30"
                  >
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>{isKm ? 'របៀបបើកក្នុង Browser' : 'How to Open in Browser'}</span>
                  </button>
                ) : isIosInApp ? (
                  /* Other iOS In-App Action */
                  <button
                    type="button"
                    onClick={() => {
                      const scrollContainer = document.getElementById('messenger-instructions-area');
                      if (scrollContainer) {
                        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 px-6 rounded-2xl shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer font-serif text-sm sm:text-base border border-primary/30"
                  >
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>{isKm ? 'របៀបបើកក្នុង Browser' : 'How to Open in Browser'}</span>
                  </button>
                ) : (
                  /* Android Download Action */
                  <a
                    href={calendarIcsUrl}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 px-6 rounded-2xl shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer font-serif text-sm sm:text-base"
                  >
                    <Download className="w-5 h-5 shrink-0" />
                    <span>{isKm ? 'ទាញយក/បើកឯកសារ Calendar' : 'Download / Open Calendar'}</span>
                  </a>
                )}

                {/* Close Button */}
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
