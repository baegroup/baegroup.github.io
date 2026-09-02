export const TEAM_SECTION_PATHS = {
  identity: '/team/',
  professor: '/team/jaehyeong-bae/',
  current: '/team/members/',
  alumni: '/team/alumni/'
};

export const NEWS_SECTION_SLUGS = {
  labNews: 'highlights',
  gallery: 'lab-life',
  videos: 'video'
};

export const NEWS_SLUG_SECTIONS = Object.fromEntries(
  Object.entries(NEWS_SECTION_SLUGS).map(([section, slug]) => [slug, section])
);

export function slugifyPathSegment(value, fallback = 'item') {
  const slug = String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\u3131-\uD79D]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

  return slug || fallback;
}

export function newsSectionPath(section, page = 1) {
  const sectionSlug = NEWS_SECTION_SLUGS[section] || NEWS_SECTION_SLUGS.labNews;
  const normalizedPage = Math.max(1, Number(page) || 1);
  if (section === 'labNews' && normalizedPage === 1) {
    return '/news/';
  }
  return normalizedPage > 1
    ? `/news/${sectionSlug}/page/${normalizedPage}/`
    : `/news/${sectionSlug}/`;
}

export function newsItemSlug(item) {
  const rawDate = String(item?.date || '').trim();
  const dateParts = rawDate.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/);
  const date = dateParts
    ? `${dateParts[1]}-${dateParts[2].padStart(2, '0')}-${dateParts[3].padStart(2, '0')}`
    : slugifyPathSegment(rawDate, '');
  const title = slugifyPathSegment(item?.title, 'update');
  return date ? `${date}-${title}` : title;
}

export function newsItemPath(section, item) {
  const sectionSlug = NEWS_SECTION_SLUGS[section] || NEWS_SECTION_SLUGS.labNews;
  return `/news/${sectionSlug}/${newsItemSlug(item)}/`;
}

export function publicationPeriodSlug(years = []) {
  const normalized = years.map(Number).filter(Boolean);
  if (!normalized.length) return '';
  if (normalized.length === 1) return String(normalized[0]);
  return `${normalized[0]}-${normalized[normalized.length - 1]}`;
}

export function publicationPagePath(type, pageIndex, years = []) {
  const normalizedType = type === 'patent' ? 'patents' : type === 'conference' ? 'conferences' : 'journals';
  const normalizedIndex = Math.max(0, Number(pageIndex) || 0);

  if (normalizedType === 'journals' && normalizedIndex === 0) {
    return '/publications/';
  }
  if (normalizedType === 'patents' && normalizedIndex === 0) {
    return '/publications/patents/';
  }
  if (normalizedType === 'conferences' && normalizedIndex === 0) {
    return '/publications/conferences/';
  }

  const period = publicationPeriodSlug(years);
  return period
    ? `/publications/${normalizedType}/${period}/`
    : `/publications/${normalizedType}/`;
}
