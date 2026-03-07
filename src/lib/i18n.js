export const LOCALES = ['en'];
export const DEFAULT_LOCALE = 'en';

export function isLocale(value) {
  return value === DEFAULT_LOCALE;
}

export function switchLocalePath(pathname) {
  return pathname || '/';
}

function normalizeSlug(value) {
  return String(value || '').replace(/^\/+|\/+$/g, '').trim();
}

export function homePath() {
  return '/';
}

// Backward compatible signature:
// pagePath(locale, slug) OR pagePath(slug)
export function pagePath(localeOrSlug, maybeSlug) {
  const slug = normalizeSlug(typeof maybeSlug === 'string' ? maybeSlug : localeOrSlug);
  return slug ? `/${slug}` : '/';
}
