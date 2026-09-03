/**
 * Native Android Calendar Intent URI Generator for Wedding Invitations
 * Dispatches directly to the phone's native Calendar app (Samsung, Google, Xiaomi, etc.)
 * Bypasses Google Calendar Web login flow completely.
 */

export function generateAndroidCalendarIntent(
  event: any,
  locale = 'km',
  baseUrl = '',
  guestName?: string
): { intentUrl: string; beginTimeMs: number; endTimeMs: number; eventTitle: string } {
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
  const month = dateObj.getMonth(); // 0-indexed
  const day = dateObj.getDate();

  // Parse start time (in Asia/Phnom_Penh timezone UTC+7)
  let startHours = 17;
  let startMinutes = 0;
  if (event.eventTime && typeof event.eventTime === 'string') {
    const parts = event.eventTime.split(':');
    if (parts.length >= 2) {
      startHours = parseInt(parts[0], 10) || 0;
      startMinutes = parseInt(parts[1], 10) || 0;
    }
  }

  const beginTimeMs = Date.UTC(year, month, day, startHours - 7, startMinutes, 0);

  // Parse end time (default 3 hours later)
  let endHours = startHours + 3;
  let endMinutes = startMinutes;

  const endTimeStr = event.eventEndTime || event.endTime;
  if (endTimeStr && typeof endTimeStr === 'string') {
    const parts = endTimeStr.split(':');
    if (parts.length >= 2) {
      endHours = parseInt(parts[0], 10) || 0;
      endMinutes = parseInt(parts[1], 10) || 0;
    }
  }

  let endTimeMs = Date.UTC(year, month, day, endHours - 7, endMinutes, 0);
  if (endTimeMs <= beginTimeMs) {
    endTimeMs = beginTimeMs + 3 * 60 * 60 * 1000;
  }

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

  // Construct standard Android Intent URI for calendar insert action
  // Works seamlessly with Chrome, Samsung Internet, and Android WebViews (Telegram, Messenger)
  const encodedTitle = encodeURIComponent(eventTitle);
  const encodedDesc = encodeURIComponent(description);
  const encodedLoc = encodeURIComponent(location);

  const intentUrl = `intent://calendar/event#Intent;action=android.intent.action.INSERT;type=vnd.android.cursor.item/event;S.title=${encodedTitle};S.description=${encodedDesc};S.eventLocation=${encodedLoc};l.beginTime=${beginTimeMs};l.endTime=${endTimeMs};end;`;

  return {
    intentUrl,
    beginTimeMs,
    endTimeMs,
    eventTitle,
  };
}
