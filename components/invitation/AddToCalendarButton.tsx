"use client";

import { useState } from 'react';
import { Calendar as CalendarIcon, Download, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddToCalendarButtonProps {
  event: any;
  locale: string;
}

export default function AddToCalendarButton({ event, locale }: AddToCalendarButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isKm = locale === 'km';

  const brideName = isKm ? event.brideNameKm : event.brideNameEn;
  const groomName = isKm ? event.groomNameKm : event.groomNameEn;
  const locationName = isKm ? event.locationNameKm : event.locationNameEn;
  const locationAddress = isKm ? event.locationAddressKm : event.locationAddressEn;
  const location = `${locationName || ''}, ${locationAddress || ''}`.trim();

  // Parse start date & time
  const startDate = new Date(event.eventDate || new Date());
  if (event.eventTime) {
    const [hours, minutes] = event.eventTime.split(':');
    startDate.setHours(Number(hours) || 17, Number(minutes) || 0, 0, 0);
  } else {
    startDate.setHours(17, 0, 0, 0);
  }

  // End date: +3 hours default duration
  const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000);

  // Title
  const eventTitle = isKm
    ? `ពិធីមង្គលអាពាហ៍ពិពាហ៍ ${groomName} និង ${brideName}`
    : `Wedding Ceremony of ${groomName} and ${brideName}`;

  // Description & Details
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const mapUrl = event.googleMapUrl || '';
  const description = `${eventTitle}\n\n${isKm ? 'ទីតាំង' : 'Location'}: ${location}\n${mapUrl ? `Google Maps: ${mapUrl}\n` : ''}${currentUrl ? `E-Invitation: ${currentUrl}` : ''}`;

  // Format date for Google Calendar (YYYYMMDDTHHmmssZ)
  const formatUtcIso = (d: Date) => {
    return d.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const googleStart = formatUtcIso(startDate);
  const googleEnd = formatUtcIso(endDate);

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${googleStart}/${googleEnd}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;

  // Generate .ics download for Apple, Outlook, etc.
  const handleDownloadIcs = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MyWedding E-Invitation//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:wedding-${event.id || 'event'}@mywedding.com`,
      `DTSTAMP:${formatUtcIso(new Date())}`,
      `DTSTART:${googleStart}`,
      `DTEND:${googleEnd}`,
      `SUMMARY:${eventTitle}`,
      `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
      `LOCATION:${location}`,
      ...(mapUrl ? [`URL:${mapUrl}`] : []),
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'ACTION:DISPLAY',
      `DESCRIPTION:Reminder: ${eventTitle} is tomorrow`,
      'END:VALARM',
      'BEGIN:VALARM',
      'TRIGGER:-PT1H',
      'ACTION:DISPLAY',
      `DESCRIPTION:Reminder: ${eventTitle} starts in 1 hour`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `wedding_${event.slug || 'event'}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative inline-block w-full text-center my-4">
      {/* Primary Action Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full max-w-xs mx-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-full shadow-lg flex items-center justify-center gap-2 group transition-transform active:scale-95 cursor-pointer"
      >
        <CalendarIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
        <span className="text-sm sm:text-base font-serif">
          {isKm ? 'សូមកត់ចំណាំថ្ងៃចូលរួម' : 'Add to Calendar'}
        </span>
      </Button>

      {/* Modal / Options Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-primary/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-serif font-bold text-primary">
                {isKm ? 'បន្ថែមទៅប្រតិទិន' : 'Add to Calendar'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isKm ? 'សូមជ្រើសរើសប្រភេទប្រតិទិនរបស់អ្នក' : 'Select your preferred calendar'}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {/* Google Calendar */}
              <a
                href={googleCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-primary/20 bg-muted/30 hover:bg-primary/10 text-foreground transition-colors font-medium text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">📅</span>
                  <span>Google Calendar</span>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </a>

              {/* Apple / iPhone Calendar */}
              <button
                onClick={() => {
                  handleDownloadIcs();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-primary/20 bg-muted/30 hover:bg-primary/10 text-foreground transition-colors font-medium text-sm text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">🍏</span>
                  <span>{isKm ? 'ប្រតិទិន iPhone / Apple' : 'iPhone / Apple Calendar'}</span>
                </div>
                <Download className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* Outlook / Other Calendar */}
              <button
                onClick={() => {
                  handleDownloadIcs();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-primary/20 bg-muted/30 hover:bg-primary/10 text-foreground transition-colors font-medium text-sm text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">✉️</span>
                  <span>{isKm ? 'Outlook / ប្រតិទិនផ្សេងៗ' : 'Outlook / Other Calendar'}</span>
                </div>
                <Download className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
