"use client";

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Download, ExternalLink, X, Bell, Smartphone, FileText, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddToCalendarButtonProps {
  event: any;
  locale: string;
}

export default function AddToCalendarButton({ event, locale }: AddToCalendarButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const isKm = locale === 'km';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent || '';
      const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const inApp = /FBAN|FBAV|Instagram|Line|Twitter|MicroMessenger|Telegram/i.test(ua);
      setIsIOS(ios);
      setIsInAppBrowser(inApp);
    }
  }, []);

  const groomName = isKm ? (event.groomNameKm || event.groomNameEn || '') : (event.groomNameEn || event.groomNameKm || '');
  const brideName = isKm ? (event.brideNameKm || event.brideNameEn || '') : (event.brideNameEn || event.brideNameKm || '');
  const locationName = isKm ? (event.locationNameKm || event.locationNameEn || '') : (event.locationNameEn || event.locationNameKm || '');
  const locationAddress = isKm ? (event.locationAddressKm || event.locationAddressEn || '') : (event.locationAddressEn || event.locationAddressKm || '');
  const invitationMessage = isKm ? (event.invitationMessageKm || event.invitationMessageEn || '') : (event.invitationMessageEn || event.invitationMessageKm || '');

  const location = [locationName, locationAddress].filter(Boolean).join(', ').trim();

  // Server-generated direct .ics endpoint URL
  const calendarIcsUrl = `/api/events/${event.id}/calendar.ics`;

  // Date parsing for Google Calendar fallback
  let dateObj: Date;
  if (event.eventDate instanceof Date) {
    dateObj = event.eventDate;
  } else if (typeof event.eventDate === 'string') {
    dateObj = new Date(event.eventDate);
  } else {
    dateObj = new Date();
  }

  const year = dateObj.getUTCFullYear();
  const month = dateObj.getUTCMonth();
  const day = dateObj.getUTCDate();

  let startHours = 17;
  let startMinutes = 0;
  if (event.eventTime && typeof event.eventTime === 'string') {
    const parts = event.eventTime.split(':');
    if (parts.length >= 2) {
      startHours = parseInt(parts[0], 10) || 0;
      startMinutes = parseInt(parts[1], 10) || 0;
    }
  }

  const startDateMs = Date.UTC(year, month, day, startHours - 7, startMinutes, 0);
  const startDate = new Date(startDateMs);

  let endDate: Date;
  const endTimeStr = event.eventEndTime || event.endTime;
  if (endTimeStr && typeof endTimeStr === 'string') {
    const parts = endTimeStr.split(':');
    if (parts.length >= 2) {
      const endHours = parseInt(parts[0], 10) || 0;
      const endMinutes = parseInt(parts[1], 10) || 0;
      let endDateMs = Date.UTC(year, month, day, endHours - 7, endMinutes, 0);
      if (endDateMs <= startDateMs) {
        endDateMs += 24 * 60 * 60 * 1000;
      }
      endDate = new Date(endDateMs);
    } else {
      endDate = new Date(startDateMs + 3 * 60 * 60 * 1000);
    }
  } else {
    endDate = new Date(startDateMs + 3 * 60 * 60 * 1000);
  }

  const eventTitle = isKm
    ? `ពិធីមង្គលអាពាហ៍ពិពាហ៍ ${groomName} និង ${brideName}`
    : `Wedding Ceremony of ${groomName} and ${brideName}`;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const mapUrl = event.googleMapUrl || '';

  const descriptionLines = [
    eventTitle,
    invitationMessage ? `\n${invitationMessage}` : '',
    `\n${isKm ? 'ទីតាំង' : 'Location'}: ${location}`,
    mapUrl ? `Google Maps: ${mapUrl}` : '',
    currentUrl ? `${isKm ? 'តំណអញ្ជើញ' : 'E-Invitation'}: ${currentUrl}` : ''
  ].filter(Boolean);

  const description = descriptionLines.join('\n').trim();

  const formatUtcIso = (d: Date) => {
    return d.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const googleStart = formatUtcIso(startDate);
  const googleEnd = formatUtcIso(endDate);

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${googleStart}/${googleEnd}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;

  const handleDirectCalendarClick = (e: React.MouseEvent) => {
    // If not on mobile or if user explicitly wants options, we can open modal,
    // but on iOS/Android, navigating directly to the server .ics URL triggers the calendar app immediately!
    // We navigate directly to the server .ics URL
    window.location.href = calendarIcsUrl;
  };

  return (
    <div className="relative inline-block w-full text-center my-4">
      {/* Primary Trigger Button: Direct link to server-generated .ics URL */}
      <div className="flex flex-col items-center justify-center gap-2">
        <a
          href={calendarIcsUrl}
          download="wedding-invitation.ics"
          className="w-full max-w-xs mx-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 px-6 rounded-full shadow-lg flex items-center justify-center gap-2.5 group transition-all active:scale-95 cursor-pointer border border-primary/30"
          onClick={(e) => {
            if (isIOS) {
              // Direct navigation on iOS Safari opens native calendar event prompt
              window.location.href = calendarIcsUrl;
            }
          }}
        >
          <CalendarIcon className="w-5 h-5 group-hover:scale-110 transition-transform shrink-0" />
          <span className="text-sm sm:text-base font-serif tracking-wide">
            {isKm ? 'សូមកត់ចំណាំថ្ងៃចូលរួម' : 'Add to Calendar'}
          </span>
        </a>

        {/* Optional more options button */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="text-xs text-primary/80 hover:text-primary underline underline-offset-4 py-1 transition-colors cursor-pointer"
        >
          {isKm ? 'ជម្រើសប្រតិទិនផ្សេងទៀត' : 'More Calendar Options'}
        </button>

        {/* In-App Browser Warning on iOS */}
        {isIOS && isInAppBrowser && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 max-w-xs mx-auto px-2 mt-1 leading-relaxed">
            {isKm 
              ? 'បើមិនបើកប្រតិទិន សូមបើក Link នេះក្នុង Safari រួចចុចម្តងទៀត។' 
              : 'If calendar does not open, please open this page in Safari and tap again.'}
          </p>
        )}
      </div>

      {/* Mobile-Friendly Bottom Sheet / Modal for Options */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div 
            className="bg-card border-t sm:border border-primary/30 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl relative space-y-4 transition-all duration-300 animate-in slide-in-from-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center space-y-1.5 pt-1">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-1">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-primary">
                {isKm ? 'សូមកត់ចំណាំថ្ងៃចូលរួម' : 'Add to Calendar'}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground px-2">
                {isKm ? 'រក្សាទុកកម្មវិធីទៅក្នុងប្រតិទិនទូរស័ព្ទដើម្បីទទួលបានការរំលឹក' : 'Save event to your phone calendar to get reminders'}
              </p>
            </div>

            {/* Reminder Badges Notice */}
            <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-primary/5 border border-primary/15 text-xs text-primary font-medium">
              <Bell className="w-4 h-4 text-primary shrink-0" />
              <span>{isKm ? 'ការរំលឹក៖ ១ ថ្ងៃមុន & ១ ម៉ោងមុន' : 'Reminders: 1 day & 1 hour before'}</span>
            </div>

            {/* Options List */}
            <div className="space-y-3 pt-1">
              {/* 1. Add to Phone Calendar (MAIN PRIMARY METHOD via Server .ics) */}
              <a
                href={calendarIcsUrl}
                download="wedding-invitation.ics"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-primary bg-primary/10 shadow-md ring-1 ring-primary/40 hover:bg-primary/15 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm sm:text-base text-foreground flex items-center gap-2">
                      <span>{isKm ? 'បន្ថែមទៅប្រតិទិនទូរស័ព្ទ' : 'Add to Phone Calendar'}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-bold uppercase tracking-wider">
                        {isKm ? 'មេ' : 'Primary'}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {isKm ? 'សម្រាប់ iPhone & Android (ឯកសារ .ics)' : 'For iPhone & Android (.ics file)'}
                    </span>
                  </div>
                </div>
                <Download className="w-5 h-5 text-primary group-hover:scale-110 transition-transform shrink-0" />
              </a>

              {/* 2. Download Calendar File (.ics file) */}
              <a
                href={calendarIcsUrl}
                download="wedding-invitation.ics"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-primary/20 bg-card hover:bg-muted/40 hover:border-primary/40 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-muted/40 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm sm:text-base text-foreground">
                      {isKm ? 'ទាញយកឯកសារ Calendar' : 'Download Calendar File'}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {isKm ? 'រក្សាទុកឯកសារ .ics' : 'Save .ics file'}
                    </span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </a>

              {/* 3. Google Calendar (OPTIONAL FALLBACK) */}
              <a
                href={googleCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-primary/20 bg-card hover:bg-muted/40 hover:border-primary/40 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-muted/40 flex items-center justify-center shrink-0">
                    <ExternalLink className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm sm:text-base text-foreground flex items-center gap-2">
                      <span>Google Calendar</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                        {isKm ? 'ជម្រើសបន្ថែម' : 'Optional'}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {isKm ? 'បើកនៅលើ Google Calendar Website' : 'Open in Google Calendar Web'}
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </a>
            </div>

            {/* Help / Instruction Note */}
            <div className="flex items-start gap-2 pt-2 px-2 text-xs text-muted-foreground">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-primary/70" />
              <span>
                {isKm
                  ? (isInAppBrowser 
                      ? 'បើមិនបើកប្រតិទិន សូមបើក Link នេះក្នុង Safari រួចចុចម្តងទៀត។' 
                      : 'ប្រសិនបើមិនបើកដោយស្វ័យប្រវត្តិ សូមបើកឯកសារ Calendar ដែលបានទាញយក')
                  : 'If it does not open automatically, please open the downloaded Calendar file'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
