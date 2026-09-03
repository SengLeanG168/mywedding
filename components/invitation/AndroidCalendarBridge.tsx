"use client";

import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, ArrowLeft, Download, Sparkles, CheckCircle2 } from 'lucide-react';

interface AndroidCalendarBridgeProps {
  event: any;
  guestId?: string;
  guestName?: string;
  locale?: string;
}

export default function AndroidCalendarBridge({
  event,
  guestId,
  locale = 'km',
}: AndroidCalendarBridgeProps) {
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  const isKm = locale === 'km';
  const slug = event?.slug || event?.id;

  // Direct return to main invitation content with skipIntro=1
  const returnUrl = guestId
    ? `/${locale}/invite/${slug}/guest/${guestId}?skipIntro=1#calendar-section`
    : `/${locale}/invite/${slug}?skipIntro=1#calendar-section`;

  // Server .ics endpoint URL
  const calendarIcsUrl = guestId
    ? `/api/invite/${slug}/guest/${guestId}/calendar.ics`
    : `/api/invite/${slug}/calendar.ics`;

  const brideName = isKm ? (event.brideNameKm || event.brideNameEn || '') : (event.brideNameEn || event.brideNameKm || '');
  const groomName = isKm ? (event.groomNameKm || event.groomNameEn || '') : (event.groomNameEn || event.groomNameKm || '');
  const coupleTitle = `${groomName} & ${brideName}`;

  useEffect(() => {
    const ua = window.navigator.userAgent || '';
    const inApp = /FBAN|FBAV|Messenger|Instagram|Telegram|Line|Twitter|MicroMessenger|FB_IAB|FBSS/i.test(ua);
    setIsInAppBrowser(inApp);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative Warm Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md bg-card/90 backdrop-blur-xl border border-primary/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        
        {/* Header Icon */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center text-primary shadow-inner">
            <CalendarIcon className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-foreground">
              {isKm ? 'កំណត់ចំណាំថ្ងៃចូលរួម' : 'Save Event to Calendar'}
            </h1>
            <p className="text-xs sm:text-sm font-serif text-primary/80 mt-1">
              {coupleTitle}
            </p>
          </div>
        </div>

        {/* Clear Instruction Card */}
        <div className="bg-primary/10 border border-primary/25 rounded-2xl p-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-primary text-xs font-serif font-semibold">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{isKm ? 'ការណែនាំ' : 'Instructions'}</span>
          </div>
          <p className="text-xs sm:text-sm text-foreground/90 font-serif leading-relaxed">
            {isKm
              ? 'បន្ទាប់ពីទាញយកឯកសារ Calendar រួច សូមចុចបើកឯកសារ .ics នោះ ហើយជ្រើសរើស “Save” ឬ “Add to Calendar” ដើម្បីរក្សាទុកថ្ងៃចូលរួម។'
              : 'After downloading the Calendar file, tap to open the .ics file and choose "Save" or "Add to Calendar" to save the wedding date.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-1">
          {/* Button 1: Download/Open Calendar (.ics) */}
          <a
            href={calendarIcsUrl}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 px-6 rounded-2xl shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer font-serif text-sm sm:text-base"
          >
            <Download className="w-5 h-5 shrink-0" />
            <span>{isKm ? 'ទាញយក/បើកឯកសារ Calendar' : 'Download / Open Calendar'}</span>
          </a>

          {/* Button 2: Return directly to Main Invitation Content */}
          <a
            href={returnUrl}
            className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium py-3 px-6 rounded-2xl border border-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer font-serif text-xs sm:text-sm"
          >
            <ArrowLeft className="w-4 h-4 shrink-0 text-primary" />
            <span>{isKm ? 'ត្រឡប់មកមាតិកាធៀបវិញ' : 'Back to Invitation Content'}</span>
          </a>
        </div>

      </div>
    </div>
  );
}
