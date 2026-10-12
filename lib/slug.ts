import prisma from '@/lib/prisma';

/**
 * Convert any string into a safe URL slug.
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD') // Normalize accented characters
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading and trailing hyphens
    .replace(/-{2,}/g, '-'); // Replace multiple hyphens with single hyphen
}

/**
 * Generate a candidate slug from names, title, or fallback.
 */
export function generateEventSlugCandidate(data: {
  slug?: string | null;
  eventType?: string | null;
  eventTitle?: string | null;
  celebrantName?: string | null;
  hostName?: string | null;
  groomNameEn?: string | null;
  brideNameEn?: string | null;
  groomNameKm?: string | null;
  brideNameKm?: string | null;
  title?: string | null;
}): string {
  if (data.slug && String(data.slug).trim()) {
    const customSlug = slugify(String(data.slug).trim());
    if (customSlug) return customSlug;
  }

  const groomEn = slugify(data.groomNameEn || '');
  const brideEn = slugify(data.brideNameEn || '');

  if (groomEn && brideEn) {
    return `${groomEn}-${brideEn}`;
  }
  if (groomEn) {
    return groomEn;
  }
  if (brideEn) {
    return brideEn;
  }

  const titleText = data.eventTitle || data.title;
  if (titleText) {
    const titleSlug = slugify(titleText);
    if (titleSlug) return titleSlug;
  }

  if (data.celebrantName) {
    const celebSlug = slugify(data.celebrantName);
    if (celebSlug) return celebSlug;
  }

  if (data.hostName) {
    const hostSlug = slugify(data.hostName);
    if (hostSlug) return hostSlug;
  }

  const type = data.eventType ? slugify(data.eventType) : 'event';
  const timeSuffix = Date.now().toString(36);
  return `${type || 'event'}-${timeSuffix}`;
}

/**
 * Ensure the slug is truly unique in the database.
 * If already taken, appends incremental suffix (-1, -2, etc.).
 */
export async function getUniqueEventSlug(
  candidateSlug: string,
  excludeEventId?: string
): Promise<string> {
  const baseSlug = slugify(candidateSlug) || `wedding-${Date.now().toString(36)}`;
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.event.findFirst({
      where: {
        slug,
        ...(excludeEventId ? { id: { not: excludeEventId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;

    // Safety guard against infinite loops
    if (counter > 100) {
      slug = `${baseSlug}-${Date.now().toString(36)}`;
      break;
    }
  }

  return slug;
}
