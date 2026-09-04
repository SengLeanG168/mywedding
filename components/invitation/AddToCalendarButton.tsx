"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, Download, X, Sparkles, Check, MoreHorizontal, ChevronLeft } from 'lucide-react';

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

  const groomName = isKm 
    ? (event?.groomNameKm || event?.groomNameEn || 'ហេង សេងលៀង') 
    : (event?.groomNameEn || event?.groomNameKm || 'Heng Sengleang');
  const brideName = isKm 
    ? (event?.brideNameKm || event?.brideNameEn || 'ល័ក្ខ ចលនា') 
    : (event?.brideNameEn || event?.brideNameKm || 'Leak Cholana');
  const weddingSubtitle = isKm
    ? `ពិធីមង្គលអាពាហ៍ពិពាហ៍របស់ ${groomName} និង ${brideName}`
    : `Wedding Ceremony of ${groomName} and ${brideName}`;

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent || '';
      const ref = typeof document !== 'undefined' ? document.referrer || '' : '';
      const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const android = /Android/i.test(ua);
      const telegram = /Telegram|TGWeb|Telegram-iOS|TelegramBot|TG/i.test(ua) || 
        /t\.me|telegram/i.test(ref) ||
        Boolean((window as any).Telegram) ||
        Boolean((window as any).TelegramWebview) ||
        Boolean((window as any).TelegramWebviewProxy);
      const messenger = /FBAN|FBAV|Messenger|Instagram|FB_IAB|FBSS|Facebook/i.test(ua);
      const inApp = telegram || messenger || !/Safari/i.test(ua) || /Line|Twitter|MicroMessenger/i.test(ua);
      
      setIsIOS(ios);
      setIsAndroid(android);
      setIsTelegram(telegram);
      setIsMessenger(messenger);
      setIsInAppBrowser(inApp);

      if (process.env.NODE_ENV === 'development') {
        console.log('[AddToCalendarButton]', {
          userAgent: ua,
          referrer: ref,
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

  const isIosTelegram = isIOS && (
    isTelegram || 
    (typeof window !== 'undefined' && (
      /Telegram|TGWeb|Telegram-iOS|TelegramBot|TG/i.test(window.navigator.userAgent || '') ||
      (typeof document !== 'undefined' && /t\.me|telegram/i.test(document.referrer || '')) ||
      Boolean((window as any).Telegram) ||
      Boolean((window as any).TelegramWebview) ||
      Boolean((window as any).TelegramWebviewProxy)
    ))
  );
  const isIosMessenger = isIOS && (
    isMessenger || 
    (typeof window !== 'undefined' && /FBAN|FBAV|Messenger|Instagram|FB_IAB|FBSS|Facebook/i.test(window.navigator.userAgent || ''))
  );
  const isIosInApp = isIosTelegram || isIosMessenger || (isIOS && isInAppBrowser);

  const isAndroidTelegram = isAndroid && (
    isTelegram || 
    (typeof window !== 'undefined' && (
      /Telegram|TGWeb|Telegram-iOS|TelegramBot|TG/i.test(window.navigator.userAgent || '') ||
      (typeof document !== 'undefined' && /t\.me|telegram/i.test(document.referrer || '')) ||
      Boolean((window as any).Telegram) ||
      Boolean((window as any).TelegramWebview) ||
      Boolean((window as any).TelegramWebviewProxy)
    ))
  );
  const isAndroidMessenger = isAndroid && (
    isMessenger || 
    (typeof window !== 'undefined' && /FBAN|FBAV|Messenger|Instagram|FB_IAB|FBSS|Facebook/i.test(window.navigator.userAgent || ''))
  );

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent || '';
      const ref = typeof document !== 'undefined' ? document.referrer || '' : '';
      const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const android = /Android/i.test(ua);
      const telegram = isTelegram || /Telegram|TGWeb|Telegram-iOS|TelegramBot|TG/i.test(ua) || 
        /t\.me|telegram/i.test(ref) ||
        Boolean((window as any).Telegram) ||
        Boolean((window as any).TelegramWebview) ||
        Boolean((window as any).TelegramWebviewProxy);
      const messenger = isMessenger || /FBAN|FBAV|Messenger|Instagram|FB_IAB|FBSS|Facebook/i.test(ua);
      const inApp = isInAppBrowser || telegram || messenger || !/Safari/i.test(ua) || /Line|Twitter|MicroMessenger/i.test(ua);

      // 1. Check iOS Telegram FIRST -> open Telegram popup (NEVER download .ics)
      if (ios && telegram) {
        setIsIOS(true);
        setIsTelegram(true);
        setIsModalOpen(true);
        return;
      }

      // 2. Check iOS Messenger/Facebook -> open Messenger popup
      if (ios && messenger) {
        setIsIOS(true);
        setIsMessenger(true);
        setIsModalOpen(true);
        return;
      }

      // 3. Check general iOS In-App Browser -> open popup
      if (ios && inApp) {
        setIsIOS(true);
        setIsInAppBrowser(true);
        setIsModalOpen(true);
        return;
      }

      // 4. Check Android Telegram -> open Android Telegram popup
      if (android && telegram) {
        setIsAndroid(true);
        setIsTelegram(true);
        setIsModalOpen(true);
        return;
      }

      // 5. Check Android Messenger -> open Android Messenger popup
      if (android && messenger) {
        setIsAndroid(true);
        setIsMessenger(true);
        setIsModalOpen(true);
        return;
      }

      // 6. Check Android -> open Android popup
      if (android || isAndroid) {
        setIsAndroid(true);
        setIsModalOpen(true);
        return;
      }

      // 7. iOS external browser Safari/Chrome/Brave or Desktop -> normal .ics flow
      window.location.href = calendarIcsUrl;
    }
  };

  return (
    <div className="relative inline-block w-full text-center my-4">
      {/* Primary Trigger Button: Single clean button with Telegram-first routing */}
      <div className="flex flex-col items-center justify-center">
        <button
          type="button"
          onClick={handleButtonClick}
          className="w-full max-w-xs mx-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 px-6 rounded-full shadow-lg flex items-center justify-center gap-2.5 group transition-all active:scale-95 cursor-pointer border border-primary/30"
        >
          <CalendarIcon className="w-5 h-5 group-hover:scale-110 transition-transform shrink-0" />
          <span className="text-sm sm:text-base font-serif tracking-wide">
            {isKm ? 'សូមកត់ចំណាំថ្ងៃចូលរួម' : 'Add to Calendar'}
          </span>
        </button>
      </div>

      {/* Top Down Popup Modal rendered via React Portal directly into document.body */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
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
              className="overflow-y-auto max-h-[calc(85dvh-40px)] space-y-4 text-center pr-1"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {/* Header / Title */}
              <div className="flex flex-col items-center space-y-1 pt-1">
                <div className="w-12 h-12 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center text-primary shadow-inner mb-1">
                  <CalendarIcon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-foreground">
                  {isKm ? 'សូមកត់ចំណាំថ្ងៃចូលរួម' : 'Add to Calendar'}
                </h3>
                <p className="text-xs sm:text-sm font-serif text-muted-foreground/90 leading-snug px-2">
                  {weddingSubtitle}
                </p>
              </div>

              {/* Instruction Card */}
              <div className="bg-primary/10 border border-primary/25 rounded-2xl p-3.5 text-center space-y-2">
                <div
                  className="flex items-center justify-center gap-1.5 text-primary text-sm tracking-wide font-normal"
                  style={{ fontFamily: 'var(--font-khmer-muol-light), "Khmer OS Muol Light", serif' }}
                >
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>{isKm ? 'ការណែនាំ' : 'Instructions'}</span>
                </div>
                <p
                  className="w-full text-xs sm:text-sm text-foreground/90 font-normal leading-[1.8] px-0.5"
                  style={{
                    fontFamily: 'var(--font-khmer-siemreap), "Khmer OS Siemreap", "Noto Sans Khmer", sans-serif',
                    textAlign: 'justify',
                    textJustify: 'inter-word',
                    textAlignLast: 'left',
                  }}
                >
                  {isIosTelegram ? (
                    isKm ? (
                      <>
                        ដើម្បីរក្សាទុកថ្ងៃចូលរួមទៅកាន់ប្រតិទិនបានត្រឹមត្រូវ សូមចុចសញ្ញា{' '}
                        <span className="inline-flex items-center justify-center align-middle mx-1 px-1.5 py-0.5 rounded-md bg-primary/20 text-primary leading-none border border-primary/30">
                          <MoreHorizontal className="w-3.5 h-3.5 shrink-0" />
                        </span>{' '}
                        នៅខាងលើ រួចជ្រើសយក <span className="font-semibold text-foreground">Open in Chrome, Safari...</span> បន្ទាប់មកធៀបការនឹងបើកសារជាថ្មី។ ក្រោយមកត្រូវចុច “<span className="font-semibold text-primary">សូមកត់ចំណាំថ្ងៃចូលរួម</span>” ម្ដងទៀត (ហើយរើសយក <span className="font-semibold text-foreground">Continue</span> ប្រសិនបើប្រើប្រាស់ Chrome) និងចុច <span className="font-semibold text-foreground">Add To Calendar</span> រួចចុចសញ្ញា{' '}
                        <span className="inline-flex items-center justify-center align-middle mx-1 w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 leading-none border border-emerald-500/40 font-bold">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>{' '}
                        នៅខាងលើជាការស្រេច។ ដើម្បីអាចត្រឡប់ទៅកាន់ធៀបការវិញ សូមចុចសញ្ញា{' '}
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
                        icon at the top and select <span className="font-semibold text-foreground">Open in Chrome, Safari...</span> The invitation will open in your browser. Then tap “<span className="font-semibold text-primary">Add to Calendar</span>” again, choose <span className="font-semibold text-foreground">Continue</span> if using Chrome, and tap <span className="font-semibold text-foreground">Add To Calendar</span>, then tap the{' '}
                        <span className="inline-flex items-center justify-center align-middle mx-1 w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 leading-none border border-emerald-500/40 font-bold">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>{' '}
                        icon at the top. To return to the invitation, tap the{' '}
                        <span className="inline-flex items-center justify-center align-middle mx-1 w-4 h-4 rounded-full bg-destructive/20 text-destructive leading-none border border-destructive/40 font-bold">
                          <X className="w-3 h-3 stroke-[3]" />
                        </span>{' '}
                        icon at the top.
                      </>
                    )
                  ) : isIosInApp ? (
                    isKm ? (
                      <>
                        ដើម្បីរក្សាទុកថ្ងៃចូលរួមទៅកាន់ប្រតិទិនបានត្រឹមត្រូវ សូមចុចសញ្ញា{' '}
                        <span className="inline-flex items-center justify-center align-middle mx-1 px-1.5 py-0.5 rounded-md bg-primary/20 text-primary leading-none border border-primary/30">
                          <MoreHorizontal className="w-3.5 h-3.5 shrink-0" />
                        </span>{' '}
                        នៅខាងលើ រួចជ្រើសយក <span className="font-semibold text-foreground">Open in external browser</span> បន្ទាប់មកធៀបការនឹងបើកសារជាថ្មី។ ក្រោយមកត្រូវចុច “<span className="font-semibold text-primary">សូមកត់ចំណាំថ្ងៃចូលរួម</span>” ម្ដងទៀត (ហើយរើសយក <span className="font-semibold text-foreground">Continue</span> ប្រសិនបើប្រើប្រាស់ Chrome) និងចុច <span className="font-semibold text-foreground">Add To Calendar</span> រួចចុចសញ្ញា{' '}
                        <span className="inline-flex items-center justify-center align-middle mx-1 w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 leading-none border border-emerald-500/40 font-bold">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>{' '}
                        នៅខាងលើជាការស្រេច។ ដើម្បីអាចត្រឡប់ទៅកាន់ធៀបការវិញ សូមចុចសញ្ញា{' '}
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
                        icon at the top and select <span className="font-semibold text-foreground">Open in external browser</span>. The invitation will open in your browser. Then tap “<span className="font-semibold text-primary">Add to Calendar</span>” again, choose <span className="font-semibold text-foreground">Continue</span> if using Chrome, and tap <span className="font-semibold text-foreground">Add To Calendar</span>, then tap the{' '}
                        <span className="inline-flex items-center justify-center align-middle mx-1 w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 leading-none border border-emerald-500/40 font-bold">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>{' '}
                        icon at the top. To return to the invitation, tap the{' '}
                        <span className="inline-flex items-center justify-center align-middle mx-1 w-4 h-4 rounded-full bg-destructive/20 text-destructive leading-none border border-destructive/40 font-bold">
                          <X className="w-3 h-3 stroke-[3]" />
                        </span>{' '}
                        icon at the top.
                      </>
                    )
                  ) : isAndroidTelegram ? (
                    isKm ? (
                      <>
                        ដើម្បីរក្សាទុកថ្ងៃចូលរួមទៅកាន់ប្រតិទិនបានត្រឹមត្រូវ សូមចុច “<span className="font-semibold text-primary">ទាញយក&បើកឯកសារ Calendar</span>” បន្ទាប់មកឯកសារនឹងទាញយកដោយស្វ័យប្រវត្តិ រួចចុច <span className="font-semibold text-foreground">Open</span> ជ្រើសយក <span className="font-semibold text-foreground">Calendar</span> និងយក <span className="font-semibold text-foreground">Always</span> រួចចុច <span className="font-semibold text-foreground">Save to Calendar</span> ជាការស្រេច។ ដើម្បីអាចត្រឡប់ទៅកាន់ធៀបការវិញ សូមចុចសញ្ញា{' '}
                        <span className="inline-flex items-center justify-center align-middle mx-1 px-1.5 py-0.5 rounded-md bg-primary/20 text-primary leading-none border border-primary/30">
                          <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                        </span>{' '}
                        នៅខាងលើ។
                      </>
                    ) : (
                      <>
                        To properly save the event to your calendar, tap “<span className="font-semibold text-primary">Download & Open Calendar</span>”. The file will download automatically, then tap <span className="font-semibold text-foreground">Open</span>, choose <span className="font-semibold text-foreground">Calendar</span> and select <span className="font-semibold text-foreground">Always</span>, then tap <span className="font-semibold text-foreground">Save to Calendar</span>. To return to the invitation, tap the{' '}
                        <span className="inline-flex items-center justify-center align-middle mx-1 px-1.5 py-0.5 rounded-md bg-primary/20 text-primary leading-none border border-primary/30">
                          <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                        </span>{' '}
                        icon at the top.
                      </>
                    )
                  ) : isAndroidMessenger ? (
                    isKm ? (
                      <>
                        ដើម្បីរក្សាទុកថ្ងៃចូលរួមទៅកាន់ប្រតិទិនបានត្រឹមត្រូវ សូមចុច “<span className="font-semibold text-primary">ទាញយក&បើកឯកសារ Calendar</span>” រួចចុច <span className="font-semibold text-foreground">Continue</span>។ បន្ទាប់មកឯកសារនឹងទាញយកដោយស្វ័យប្រវត្តិ រួចចុច <span className="font-semibold text-foreground">Open</span> ជ្រើសយក <span className="font-semibold text-foreground">Calendar</span> និងយក <span className="font-semibold text-foreground">Always</span> រួចចុច <span className="font-semibold text-foreground">Save to Calendar</span> ជាការស្រេច។ ដើម្បីអាចត្រឡប់ទៅកាន់ធៀបការវិញ សូមចុចសញ្ញា{' '}
                        <span className="inline-flex items-center justify-center align-middle mx-1 px-1.5 py-0.5 rounded-md bg-primary/20 text-primary leading-none border border-primary/30">
                          <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                        </span>{' '}
                        នៅខាងលើ។
                      </>
                    ) : (
                      <>
                        To properly save the event to your calendar, tap “<span className="font-semibold text-primary">Download & Open Calendar</span>” and tap <span className="font-semibold text-foreground">Continue</span>. The file will download automatically, then tap <span className="font-semibold text-foreground">Open</span>, choose <span className="font-semibold text-foreground">Calendar</span> and select <span className="font-semibold text-foreground">Always</span>, then tap <span className="font-semibold text-foreground">Save to Calendar</span>. To return to the invitation, tap the{' '}
                        <span className="inline-flex items-center justify-center align-middle mx-1 px-1.5 py-0.5 rounded-md bg-primary/20 text-primary leading-none border border-primary/30">
                          <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                        </span>{' '}
                        icon at the top.
                      </>
                    )
                  ) : (
                    isKm
                      ? 'បន្ទាប់ពីទាញយកឯកសារ Calendar រួច សូមចុចបើកឯកសារ .ics នោះ ហើយជ្រើសរើស “Save” ឬ “Add to Calendar” ដើម្បីរក្សាទុកថ្ងៃចូលរួម។'
                      : 'After downloading the Calendar file, tap to open the .ics file and choose "Save" or "Add to Calendar" to save the wedding date.'
                  )}
                </p>
              </div>

              {/* Note Card */}
              {(isIosMessenger || isIosTelegram || isAndroidMessenger || isAndroidTelegram) && (
                <div className="bg-primary/10 border border-primary/25 rounded-2xl p-3.5 space-y-1.5">
                  <div
                    className="flex items-center gap-1.5 text-primary text-sm tracking-wide font-normal"
                    style={{ fontFamily: 'var(--font-khmer-muol-light), "Khmer OS Muol Light", serif' }}
                  >
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>{isKm ? 'ចំណាំ' : 'Note'}</span>
                  </div>
                  <p
                    className="w-full text-xs sm:text-[13px] text-foreground/90 font-normal leading-[1.8] px-0.5"
                    style={{
                      fontFamily: 'var(--font-khmer-siemreap), "Khmer OS Siemreap", "Noto Sans Khmer", sans-serif',
                      textAlign: 'justify',
                      textJustify: 'inter-word',
                      textAlignLast: 'left',
                    }}
                  >
                    {isAndroidTelegram ? (
                      isKm
                        ? 'ដោយសារនៅក្នុង Telegram មិនអាចរក្សាទុកថ្ងៃចូលរួមទៅកាន់ប្រតិទិនបានដោយផ្ទាល់ទេ ដូច្នេះត្រូវទាញយកឯកសារជាមុនសិន ទើបអាចរក្សាទុកទៅកាន់ប្រតិទិនបានត្រឹមត្រូវ។'
                        : 'Because Telegram cannot save the event date to your calendar directly, you need to download the file first so you can properly save the date to your calendar.'
                    ) : isAndroidMessenger ? (
                      isKm
                        ? 'ដោយសារនៅក្នុង Messenger មិនអាចរក្សាទុកថ្ងៃចូលរួមទៅកាន់ប្រតិទិនបានដោយផ្ទាល់ទេ ដូច្នេះត្រូវទាញយកឯកសារជាមុនសិន ទើបអាចរក្សាទុកទៅកាន់ប្រតិទិនបានត្រឹមត្រូវ។'
                        : 'Because Messenger cannot save the event date to your calendar directly, you need to download the file first so you can properly save the date to your calendar.'
                    ) : isIosTelegram ? (
                      isKm
                        ? 'ដោយសារតែនៅក្នុង Telegram មិនអាចរក្សាទុកថ្ងៃចូលរួមទៅកាន់ប្រតិទិនបានដោយផ្ទាល់បានទេ ដូច្នេះសូមបើកធៀបការនេះក្នុង Browser ខាងក្រៅជាមុនសិន ដើម្បីអាចចុចរក្សាទុកទៅកាន់ប្រតិទិនបានត្រឹមត្រូវ។'
                        : 'Because Telegram cannot save the event date to your calendar directly, please open this invitation in an external browser first so you can properly save the date to your calendar.'
                    ) : (
                      isKm
                        ? 'ដោយសារតែនៅក្នុង Messenger មិនអាចរក្សាទុកថ្ងៃចូលរួមទៅកាន់ប្រតិទិនបានដោយផ្ទាល់ទេ ដូច្នេះសូមបើកធៀបការនេះក្នុង Browser ខាងក្រៅជាមុនសិន ដើម្បីអាចចុចរក្សាទុកទៅកាន់ប្រតិទិនបានត្រឹមត្រូវ។'
                        : 'Because Messenger cannot save the event date to your calendar directly, please open this invitation in an external browser first so you can properly save the date to your calendar.'
                    )}
                  </p>
                </div>
              )}

              {/* Action Buttons Area */}
              <div className="space-y-2.5 pt-1">
                {!isIosInApp && (
                  /* Android Download Action */
                  <a
                    href={calendarIcsUrl}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 px-6 rounded-2xl shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer font-serif text-sm sm:text-base"
                  >
                    <Download className="w-5 h-5 shrink-0" />
                    <span>{isKm ? 'ទាញយក&បើកឯកសារ Calendar' : 'Download & Open Calendar'}</span>
                  </a>
                )}

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={
                    isIosInApp
                      ? "w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 px-6 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer font-serif text-sm sm:text-base border border-primary/30"
                      : "w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium py-3 px-6 rounded-2xl border border-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer font-serif text-xs sm:text-sm"
                  }
                >
                  <X className="w-4 h-4 shrink-0" />
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