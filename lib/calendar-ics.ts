/**
 * RFC 5545 compliant iCalendar (.ics) generator for Wedding Invitations
 * Tailored for iOS Apple Calendar, Google Calendar, Android, and Desktop
 */

function escapeIcsText(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function padZero(num: number, size = 2): string {
  let s = String(num);
  while (s.length < size) s = '0' + s;
  return s;
}

function formatUtcIso(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export function generateEventICS(event: any, locale = 'km', baseUrl = ''): string {
  const isKm = locale === 'km';

  const groomName = isKm 
    ? (event.groomNameKm || event.groomNameEn || '') 
    : (event.groomNameEn || event.groomNameKm || '');
  const brideName = isKm 
    ? (event.brideNameKm || event.brideNameEn || '') 
    : (event.brideNameEn || event.brideNameKm || '');
  const locationName = isKm 
    ? (event.locationNameKm || event.locationNameEn || '') 
    : (event.locationNameEn || event.locationNameKm || '');
  const locationAddress = isKm 
    ? (event.locationAddressKm || event.locationAddressEn || '') 
    : (event.locationAddressEn || event.locationAddressKm || '');
  const invitationMessage = isKm 
    ? (event.invitationMessageKm || event.invitationMessageEn || '') 
    : (event.invitationMessageEn || event.invitationMessageKm || '');

  const location = [locationName, locationAddress].filter(Boolean).join(', ').trim();

  // Parse event date
  let dateObj: Date;
  if (event.eventDate instanceof Date) {
    dateObj = event.eventDate;
  } else if (typeof event.eventDate === 'string') {
    dateObj = new Date(event.eventDate);
  } else {
    dateObj = new Date();
  }

  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1; // 1-indexed
  const day = dateObj.getDate();

  // Parse start time (in Asia/Phnom_Penh timezone)
  let startHours = 17;
  let startMinutes = 0;
  if (event.eventTime && typeof event.eventTime === 'string') {
    const parts = event.eventTime.split(':');
    if (parts.length >= 2) {
      startHours = parseInt(parts[0], 10) || 0;
      startMinutes = parseInt(parts[1], 10) || 0;
    }
  }

  // Parse end time (default 3 hours later)
  let endHours = startHours + 3;
  let endMinutes = startMinutes;
  let endDay = day;
  let endMonth = month;
  let endYear = year;

  const endTimeStr = event.eventEndTime || event.endTime;
  if (endTimeStr && typeof endTimeStr === 'string') {
    const parts = endTimeStr.split(':');
    if (parts.length >= 2) {
      endHours = parseInt(parts[0], 10) || 0;
      endMinutes = parseInt(parts[1], 10) || 0;
      if (endHours < startHours || (endHours === startHours && endMinutes <= startMinutes)) {
        // rolls over to next day
        const nextDay = new Date(year, month - 1, day + 1);
        endYear = nextDay.getFullYear();
        endMonth = nextDay.getMonth() + 1;
        endDay = nextDay.getDate();
      }
    }
  } else {
    if (endHours >= 24) {
      endHours -= 24;
      const nextDay = new Date(year, month - 1, day + 1);
      endYear = nextDay.getFullYear();
      endMonth = nextDay.getMonth() + 1;
      endDay = nextDay.getDate();
    }
  }

  // Local Time String in Asia/Phnom_Penh: YYYYMMDDTHHmm00
  const dtStartStr = `${padZero(year, 4)}${padZero(month)}${padZero(day)}T${padZero(startHours)}${padZero(startMinutes)}00`;
  const dtEndStr = `${padZero(endYear, 4)}${padZero(endMonth)}${padZero(endDay)}T${padZero(endHours)}${padZero(endMinutes)}00`;

  // Event Title
  const eventTitle = isKm
    ? `ពិធីមង្គលអាពាហ៍ពិពាហ៍ ${groomName} និង ${brideName}`
    : `Wedding Ceremony of ${groomName} and ${brideName}`;

  // Description & Details
  const invitationUrl = baseUrl || (event.slug ? `/invite/${event.slug}` : '');
  const mapUrl = event.googleMapUrl || '';

  const descriptionLines = [
    eventTitle,
    invitationMessage ? `\n${invitationMessage}` : '',
    `\n${isKm ? 'ទីតាំង' : 'Location'}: ${location}`,
    mapUrl ? `Google Maps: ${mapUrl}` : '',
    invitationUrl ? `${isKm ? 'តំណអញ្ជើញ' : 'E-Invitation'}: ${invitationUrl}` : ''
  ].filter(Boolean);

  const description = descriptionLines.join('\n').trim();

  const reminder1Day = `${eventTitle} - ${isKm ? 'ការរំលឹក ១ ថ្ងៃមុន' : 'Reminder 1 day before'}`;
  const reminder1Hour = `${eventTitle} - ${isKm ? 'ការរំលឹក ១ ម៉ោងមុន' : 'Reminder 1 hour before'}`;

  const uid = `wedding-${event.id || event.slug || 'invite'}@mywedding.com`;
  const dtstamp = formatUtcIso(new Date());

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MyWedding//Wedding Invitation//KM',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VTIMEZONE',
    'TZID:Asia/Phnom_Penh',
    'X-LIC-LOCATION:Asia/Phnom_Penh',
    'BEGIN:STANDARD',
    'TZOFFSETFROM:+0700',
    'TZOFFSETTO:+0700',
    'TZNAME:+07',
    'DTSTART:19700101T000000',
    'END:STANDARD',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;TZID=Asia/Phnom_Penh:${dtStartStr}`,
    `DTEND;TZID=Asia/Phnom_Penh:${dtEndStr}`,
    `SUMMARY:${escapeIcsText(eventTitle)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(location)}`,
    ...(mapUrl ? [`URL:${escapeIcsText(mapUrl)}`] : []),
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcsText(reminder1Day)}`,
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcsText(reminder1Hour)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  return icsLines.join('\r\n') + '\r\n';
}
