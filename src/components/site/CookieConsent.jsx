import { useEffect, useId, useState } from 'react';

import {
  COOKIE_CONSENT_STORAGE_KEY,
  COOKIE_CONSENT_UPDATED_EVENT
} from '@/lib/privacy';

const OPEN_EVENT = 'open-cookie-preferences';

const DEFAULT_PREFERENCES = {
  necessary: true,
  analytics: false,
  marketing: false
};

function ToggleRow({ checked, description, disabled = false, label, onChange }) {
  const inputId = useId();
  const descriptionId = `${inputId}-description`;

  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3">
      <div>
        <label className="text-sm font-semibold text-slate-900" htmlFor={inputId}>{label}</label>
        <p className="mt-1 text-sm leading-relaxed text-slate-600" id={descriptionId}>{description}</p>
      </div>

      <label className="relative mt-0.5 inline-flex cursor-pointer items-center">
        <input
          aria-describedby={descriptionId}
          checked={checked}
          className="peer sr-only"
          disabled={disabled}
          id={inputId}
          onChange={onChange}
          type="checkbox"
        />
        <span className="h-6 w-11 rounded-full bg-slate-300 transition-colors peer-checked:bg-[var(--brand-navy)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--brand-navy)] peer-focus-visible:ring-offset-2 peer-disabled:bg-slate-400/70" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </label>
    </div>
  );
}

export function CookieConsent({ disabled = false }) {
  const [ready, setReady] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
      if (!saved) {
        setShowBanner(true);
        setReady(true);
        return;
      }

      const parsed = JSON.parse(saved);
      const savedPreferences = parsed?.preferences || {};
      setPreferences({
        necessary: true,
        analytics: Boolean(savedPreferences.analytics),
        marketing: Boolean(savedPreferences.marketing)
      });
      setShowBanner(false);
      setReady(true);
    } catch {
      setShowBanner(true);
      setReady(true);
    }
  }, []);

  useEffect(() => {
    function handleOpen() {
      setShowPanel(true);
    }

    window.addEventListener(OPEN_EVENT, handleOpen);
    return () => {
      window.removeEventListener(OPEN_EVENT, handleOpen);
    };
  }, []);

  function persist(nextPreferences) {
    const payload = {
      version: 1,
      updatedAt: new Date().toISOString(),
      preferences: {
        necessary: true,
        analytics: Boolean(nextPreferences.analytics),
        marketing: Boolean(nextPreferences.marketing)
      }
    };

    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(payload));
    setPreferences(payload.preferences);
    setShowBanner(false);
    setShowPanel(false);
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_UPDATED_EVENT, { detail: payload.preferences }));
  }

  function acceptAll() {
    persist({ necessary: true, analytics: true, marketing: true });
  }

  function acceptEssential() {
    persist({ necessary: true, analytics: false, marketing: false });
  }

  function saveCustom() {
    persist(preferences);
  }

  if (disabled || !ready) {
    return null;
  }

  return (
    <>
      {showBanner ? (
        <section aria-label="Cookie notice" className="fixed inset-x-0 bottom-0 z-[90] mx-auto w-full max-w-6xl px-4 pb-4">
          <div className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-[0_20px_40px_-24px_rgba(15,23,42,0.45)] backdrop-blur-sm md:p-5">
            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <p className="text-sm font-semibold text-slate-900 md:text-base">Cookie Notice</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  We use cookies to improve performance, analyze traffic, and personalize content.
                  You can accept all, keep only essential cookies, or customize preferences.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  onClick={acceptEssential}
                  type="button"
                >
                  Essential Only
                </button>
                <button
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  onClick={() => setShowPanel(true)}
                  type="button"
                >
                  Customize
                </button>
                <button
                  className="rounded-md bg-[var(--brand-burgundy)] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-burgundy-deep)]"
                  onClick={acceptAll}
                  type="button"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {showPanel ? (
        <section
          aria-labelledby="cookie-preferences-title"
          className="fixed bottom-4 right-4 z-[95] w-[calc(100vw-2rem)] max-w-md"
          role="dialog"
        >
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_24px_45px_-24px_rgba(15,23,42,0.45)] md:p-5">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <p className="text-base font-semibold text-slate-900" id="cookie-preferences-title">Manage Cookies</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  Choose which cookies you allow for this website.
                </p>
              </div>
              <button
                aria-label="Close cookie preferences"
                className="rounded-md border border-slate-300 px-2 py-1 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                onClick={() => setShowPanel(false)}
                type="button"
              >
                Close
              </button>
            </div>

            <div className="space-y-2.5">
              <ToggleRow
                checked
                description="Required for security and core website functionality."
                disabled
                label="Strictly Necessary"
              />
              <ToggleRow
                checked={preferences.analytics}
                description="Helps us understand usage patterns and improve performance."
                label="Analytics"
                onChange={(event) => setPreferences((prev) => ({ ...prev, analytics: event.target.checked }))}
              />
              <ToggleRow
                checked={preferences.marketing}
                description="Used to measure campaign effectiveness and relevance."
                label="Marketing"
                onChange={(event) => setPreferences((prev) => ({ ...prev, marketing: event.target.checked }))}
              />
            </div>

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                onClick={acceptEssential}
                type="button"
              >
                Essential Only
              </button>
              <button
                className="rounded-md border border-[var(--brand-burgundy)] bg-[var(--brand-burgundy)] px-3 py-2 text-sm font-semibold text-white transition-colors hover:border-[var(--brand-burgundy-deep)] hover:bg-[var(--brand-burgundy-deep)]"
                onClick={saveCustom}
                type="button"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
