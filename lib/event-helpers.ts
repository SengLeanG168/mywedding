export type EventType = 'wedding' | 'ceremony' | 'birthday' | 'party' | 'other';

export const EVENT_TYPE_LABELS: Record<string, string> = {
  wedding: 'មង្គលការ',
  ceremony: 'បុណ្យ',
  birthday: 'ខួបកំណើត',
  party: 'កម្មវិធីជប់លៀង',
  other: 'ផ្សេងៗ',
};

export function getEventType(event?: any): EventType {
  const type = event?.eventType ? String(event.eventType).toLowerCase().trim() : 'wedding';
  if (['wedding', 'ceremony', 'birthday', 'party', 'other'].includes(type)) {
    return type as EventType;
  }
  return 'wedding';
}

export function isWeddingEvent(event?: any): boolean {
  return getEventType(event) === 'wedding';
}

/**
 * Returns the primary display title for the event.
 * Priority:
 * 1. event.eventTitle
 * 2. if eventType === "wedding": ពិធីមង្គលអាពាហ៍ពិពាហ៍
 * 3. if eventType === "birthday": ពិធីខួបកំណើត
 * 4. if eventType === "ceremony": ពិធីបុណ្យ
 * 5. if eventType === "party": កម្មវិធីជប់លៀង
 * 6. fallback: កម្មវិធី
 */
export function getEventTitle(event?: any, isKm = true): string {
  if (!event) return isKm ? 'កម្មវិធី' : 'Special Event';

  if (event.eventTitle && String(event.eventTitle).trim()) {
    return String(event.eventTitle).trim();
  }

  const eventType = getEventType(event);

  switch (eventType) {
    case 'wedding':
      return isKm ? 'ពិធីមង្គលអាពាហ៍ពិពាហ៍' : 'Wedding Ceremony';

    case 'birthday':
      return isKm ? 'ពិធីខួបកំណើត' : 'Birthday Celebration';

    case 'ceremony':
      return isKm ? 'ពិធីបុណ្យ' : 'Ceremony';

    case 'party':
      return isKm ? 'កម្មវិធីជប់លៀង' : 'Party Celebration';

    case 'other':
    default:
      return isKm ? 'កម្មវិធី' : 'Special Event';
  }
}

/**
 * Returns the subtitle for public pages, calendar, and invitations.
 */
export function getEventSubtitle(event?: any, isKm = true): string {
  if (!event) return '';

  if (event.eventSubtitle && String(event.eventSubtitle).trim()) {
    return String(event.eventSubtitle).trim();
  }

  const eventType = getEventType(event);
  const groomName = (isKm ? (event.groomNameKm || event.groomNameEn) : (event.groomNameEn || event.groomNameKm)) || '';
  const brideName = (isKm ? (event.brideNameKm || event.brideNameEn) : (event.brideNameEn || event.brideNameKm)) || '';
  const celebrant = event.celebrantName ? String(event.celebrantName).trim() : '';
  const host = event.hostName ? String(event.hostName).trim() : '';
  const title = event.eventTitle ? String(event.eventTitle).trim() : '';

  switch (eventType) {
    case 'wedding':
      if (groomName && brideName) {
        return isKm ? `ពិធីមង្គលអាពាហ៍ពិពាហ៍របស់ ${groomName} និង ${brideName}` : `Wedding Ceremony of ${groomName} and ${brideName}`;
      } else if (groomName || brideName) {
        return isKm ? `ពិធីមង្គលអាពាហ៍ពិពាហ៍របស់ ${groomName || brideName}` : `Wedding Ceremony of ${groomName || brideName}`;
      }
      return isKm ? 'ពិធីមង្គលអាពាហ៍ពិពាហ៍' : 'Wedding Ceremony';

    case 'birthday':
      if (celebrant) {
        return isKm ? `ពិធីខួបកំណើតរបស់ ${celebrant}` : `Birthday Celebration of ${celebrant}`;
      } else if (host) {
        return isKm ? `ពិធីខួបកំណើតរបស់ ${host}` : `Birthday Celebration of ${host}`;
      } else if (title) {
        return title;
      }
      return isKm ? 'ពិធីខួបកំណើត' : 'Birthday Celebration';

    case 'ceremony':
      if (title) return title;
      if (host) return isKm ? `ពិធីបុណ្យ ${host}` : `Ceremony of ${host}`;
      return isKm ? 'ពិធីបុណ្យ' : 'Ceremony';

    case 'party':
      if (title) return title;
      if (host) return isKm ? `កម្មវិធីជប់លៀង ${host}` : `Party Celebration of ${host}`;
      return isKm ? 'កម្មវិធីជប់លៀង' : 'Party Celebration';

    case 'other':
    default:
      if (title) return title;
      if (host) return isKm ? `កម្មវិធី ${host}` : `Event of ${host}`;
      return isKm ? 'កម្មវិធី' : 'Special Event';
  }
}

/**
 * Returns the exact calendar subtitle matching prompt rules.
 */
export function getCalendarSubtitle(event?: any): string {
  if (!event) return 'កម្មវិធី';

  if (event.eventSubtitle && String(event.eventSubtitle).trim()) {
    return String(event.eventSubtitle).trim();
  }

  const eventType = getEventType(event);
  const groomName = event.groomNameKm || event.groomNameEn || 'កូនកម្លោះ';
  const brideName = event.brideNameKm || event.brideNameEn || 'កូនក្រមុំ';
  const celebrant = event.celebrantName || event.hostName || event.eventTitle || '';
  const eventTitle = event.eventTitle ? String(event.eventTitle).trim() : '';

  if (eventType === 'wedding') {
    return `ពិធីមង្គលអាពាហ៍ពិពាហ៍របស់ ${groomName} និង ${brideName}`;
  } else if (eventType === 'birthday') {
    return `ពិធីខួបកំណើតរបស់ ${celebrant || 'ម្ចាស់ខួប'}`;
  } else if (eventType === 'ceremony') {
    return eventTitle || 'ពិធីបុណ្យ';
  } else if (eventType === 'party') {
    return eventTitle || 'កម្មវិធីជប់លៀង';
  } else {
    return eventTitle || 'កម្មវិធី';
  }
}

/**
 * Returns the main name/header to display (e.g. for card titles, opening screen middle text, etc.)
 */
export function getEventMainName(event?: any, isKm = true): string {
  if (!event) return '';
  const eventType = getEventType(event);

  if (eventType === 'wedding') {
    const groomName = (isKm ? (event.groomNameKm || event.groomNameEn) : (event.groomNameEn || event.groomNameKm)) || '';
    const brideName = (isKm ? (event.brideNameKm || event.brideNameEn) : (event.brideNameEn || event.brideNameKm)) || '';
    if (groomName && brideName) return `${groomName} & ${brideName}`;
    return groomName || brideName || event.eventTitle || 'កូនកម្លោះ & កូនក្រមុំ';
  }

  if (eventType === 'birthday') {
    return event.celebrantName || event.eventTitle || event.hostName || 'ម្ចាស់ខួបកំណើត';
  }

  return event.eventTitle || event.hostName || (isKm ? EVENT_TYPE_LABELS[eventType] || 'កម្មវិធី' : 'Event');
}
