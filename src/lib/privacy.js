export const COOKIE_CONSENT_STORAGE_KEY = 'baelab_cookie_consent_v1';
export const COOKIE_CONSENT_UPDATED_EVENT = 'baelab-cookie-consent-updated';

export function hasCookieConsentChoice() {
  try {
    return Boolean(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY));
  } catch {
    return false;
  }
}
