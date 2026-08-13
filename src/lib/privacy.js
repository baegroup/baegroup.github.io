export const COOKIE_CONSENT_STORAGE_KEY = 'baelab_cookie_consent_v1';
export const COOKIE_CONSENT_UPDATED_EVENT = 'baelab-cookie-consent-updated';

export function readCookiePreferences() {
  try {
    const saved = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!saved) {
      return null;
    }

    const preferences = JSON.parse(saved)?.preferences || {};
    return {
      necessary: true,
      analytics: Boolean(preferences.analytics),
      marketing: false
    };
  } catch {
    return null;
  }
}

export function hasCookieConsentChoice() {
  return Boolean(readCookiePreferences());
}
