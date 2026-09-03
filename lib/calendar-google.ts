/**
 * Google Calendar Event Creation URL Generator for Wedding Invitations
 * Specifically tailored for Android Telegram, Messenger, and mobile browsers.
 */

function padZero(num: number, size = 2): string {
  let s = String(num);
  while (s.length < size) s = '0' + s;
  return s;
}

export function generateGoogleCalendarUrl(
  event: any,
  locale = 'km',
  baseUrl = '',
  guestName?: string
): string {
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

  // Format: YYYYMMDDTHHmmss
  const startIso = `${padZero(year, 4)}${padZero(month)}${padZero(day)}T${padZero(startHours)}${padZero(startMinutes)}00`;
  const endIso = `${padZero(endYear, 4)}${padZero(endMonth)}${padZero(endDay)}T${padZero(endHours)}${padZero(endMinutes)}00`;

  const eventTitle = isKm
    ? `ពិធីមង្គលអាពាហ៍ពិពាហ៍ ${groomName} និង ${brideName}`
    : `Wedding Ceremony of ${groomName} and ${brideName}`;

  const invitationUrl = baseUrl || (event.slug ? `/invite/${event.slug}` : '');
  const mapUrl = event.googleMapUrl || '';

  const descriptionLines = [
    eventTitle,
    guestName ? `\n${isKm ? 'ភ្ញៀវកិត្តិយស' : 'Guest'}: ${guestName}` : '',
    invitationMessage ? `\n${invitationMessage}` : '',
    location ? `\n${isKm ? 'ទីតាំង' : 'Location'}: ${location}` : '',
    mapUrl ? `Google Maps: ${mapUrl}` : '',
    invitationUrl ? `${isKm ? 'តំណអញ្ជើញ' : 'E-Invitation'}: ${invitationUrl}` : '',
  ].filter(Boolean);

  const description = descriptionLines.join('\n').trim();

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: eventTitle,
    dates: `${startIso}/${endIso}`,
    details: description,
    location: location,
    ctz: 'Asia/Phnom_Penh',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
