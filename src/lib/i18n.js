export const LOCALES = ['en', 'ko'];

export function isLocale(value) {
  return LOCALES.includes(value);
}

export function switchLocalePath(pathname, targetLocale) {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return `/${targetLocale}`;
  }

  const [first, ...rest] = segments;
  if (isLocale(first)) {
    return `/${[targetLocale, ...rest].join('/')}`;
  }

  return `/${[targetLocale, ...segments].join('/')}`;
}

export function homePath(locale) {
  return `/${locale}`;
}

export function pagePath(locale, slug) {
  return slug ? `/${locale}/${slug}` : `/${locale}`;
}
