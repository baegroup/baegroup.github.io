import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import {
  COOKIE_CONSENT_UPDATED_EVENT,
  readCookiePreferences
} from '@/lib/privacy';

const MEASUREMENT_ID = String(import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim();
const GOOGLE_TAG_SCRIPT_ID = 'baelab-google-tag';
const RESEARCH_PROFILE_HOSTS = [
  'scholar.google.com',
  'orcid.org',
  'www.scopus.com',
  'www.webofscience.com',
  'www.researchgate.net',
  'www.linkedin.com'
];

function configureDataLayer() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };
}

function setConsent(analyticsGranted) {
  configureDataLayer();
  window.gtag('consent', 'update', {
    ad_personalization: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    analytics_storage: analyticsGranted ? 'granted' : 'denied'
  });
}

function loadGoogleTag() {
  if (!MEASUREMENT_ID || document.getElementById(GOOGLE_TAG_SCRIPT_ID)) {
    return;
  }

  configureDataLayer();
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, {
    allow_ad_personalization_signals: false,
    allow_google_signals: false,
    send_page_view: false
  });

  const script = document.createElement('script');
  script.async = true;
  script.id = GOOGLE_TAG_SCRIPT_ID;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
  document.head.appendChild(script);
}

function sendPageView(pathname, search) {
  if (!MEASUREMENT_ID || !readCookiePreferences()?.analytics) {
    return;
  }

  loadGoogleTag();
  window.gtag('event', 'page_view', {
    page_location: window.location.href,
    page_path: `${pathname}${search || ''}`,
    page_title: document.title,
    send_to: MEASUREMENT_ID
  });
}

function classifyConnectionSignal(anchor) {
  const href = String(anchor.getAttribute('href') || '').trim();
  if (!href) return '';

  if (href.toLowerCase().startsWith('mailto:')) {
    return window.location.pathname.startsWith('/join') ? 'application_intent' : 'contact_intent';
  }

  try {
    const url = new URL(href, window.location.origin);
    if (url.origin === window.location.origin && url.pathname.startsWith('/join')) {
      return 'recruitment_interest';
    }
    if (RESEARCH_PROFILE_HOSTS.includes(url.hostname)) {
      return 'research_profile_interest';
    }
    if (url.hostname === 'doi.org' || url.hostname === 'patents.google.com') {
      return 'publication_interest';
    }
  } catch {
    return '';
  }

  return '';
}

export function SiteAnalytics() {
  const { pathname, search } = useLocation();
  const lastPageViewRef = useRef('');

  useEffect(() => {
    if (!MEASUREMENT_ID) {
      return undefined;
    }

    configureDataLayer();
    window.gtag('consent', 'default', {
      ad_personalization: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      analytics_storage: 'denied',
      wait_for_update: 500
    });

    const preferences = readCookiePreferences();
    if (preferences?.analytics) {
      setConsent(true);
      loadGoogleTag();
    }

    function handleConsentUpdate(event) {
      const analyticsGranted = Boolean(event.detail?.analytics);
      setConsent(analyticsGranted);
      if (analyticsGranted) {
        loadGoogleTag();
        lastPageViewRef.current = '';
        window.setTimeout(() => sendPageView(window.location.pathname, window.location.search), 0);
      }
    }

    function handleDocumentClick(event) {
      if (!readCookiePreferences()?.analytics) return;
      const anchor = event.target.closest?.('a');
      if (!anchor) return;
      const eventName = classifyConnectionSignal(anchor);
      if (!eventName) return;
      loadGoogleTag();
      window.gtag('event', eventName, { send_to: MEASUREMENT_ID });
    }

    window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, handleConsentUpdate);
    document.addEventListener('click', handleDocumentClick);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, handleConsentUpdate);
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  useEffect(() => {
    if (!MEASUREMENT_ID || !readCookiePreferences()?.analytics) {
      return;
    }

    const pageKey = `${pathname}${search}`;
    if (lastPageViewRef.current === pageKey) {
      return;
    }
    lastPageViewRef.current = pageKey;
    sendPageView(pathname, search);
  }, [pathname, search]);

  return null;
}
