import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import {
  COOKIE_CONSENT_UPDATED_EVENT,
  readCookiePreferences
} from '@/lib/privacy';

const MEASUREMENT_ID = String(import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim();
const GOOGLE_TAG_SCRIPT_ID = 'baelab-google-tag';

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

    window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, handleConsentUpdate);
    return () => window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, handleConsentUpdate);
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
