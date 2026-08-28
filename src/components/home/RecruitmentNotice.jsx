import { useCallback, useEffect, useRef, useState } from 'react';
import { GraduationCap, X } from 'lucide-react';
import { Link } from 'react-router-dom';

import { pagePath } from '@/lib/i18n';
import {
  COOKIE_CONSENT_UPDATED_EVENT,
  hasCookieConsentChoice
} from '@/lib/privacy';

const SESSION_KEY = 'baelab_recruitment_notice_v3';
const HIDE_UNTIL_KEY = 'baelab_recruitment_notice_hide_until_v2';
const SCROLL_TRIGGER_VIEWPORT_RATIO = 0.35;

export function RecruitmentNotice({ autoOpen = false, content, locale }) {
  const [open, setOpen] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const noticeRef = useRef(null);

  useEffect(() => {
    let listeningForScroll = false;

    if (!autoOpen) {
      setOpen(false);
      setShowBadge(true);
      return undefined;
    }

    setShowBadge(false);

    function showNotice() {
      try {
        window.sessionStorage.setItem(SESSION_KEY, 'shown');
      } catch {
        // The notice can still be displayed without storage.
      }

      window.removeEventListener('scroll', handleScroll);
      listeningForScroll = false;
      setOpen(true);
    }

    function handleScroll() {
      const triggerDistance = Math.max(180, window.innerHeight * SCROLL_TRIGGER_VIEWPORT_RATIO);
      if (window.scrollY >= triggerDistance) showNotice();
    }

    function activateNotice() {
      try {
        const shownThisSession = window.sessionStorage.getItem(SESSION_KEY) === 'shown';
        const hideUntil = Number(window.localStorage.getItem(HIDE_UNTIL_KEY) || 0);

        if (shownThisSession || hideUntil > Date.now()) {
          setShowBadge(true);
          return;
        }
      } catch {
        // The notice can still be displayed without storage.
      }

      listeningForScroll = true;
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
    }

    if (hasCookieConsentChoice()) {
      activateNotice();
    } else {
      window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, activateNotice, { once: true });
    }

    return () => {
      window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, activateNotice);
      if (listeningForScroll) window.removeEventListener('scroll', handleScroll);
    };
  }, [autoOpen]);

  const closeNotice = useCallback(() => {
    try {
      window.sessionStorage.setItem(SESSION_KEY, 'shown');
    } catch {
      // Closing the notice should always work, even without storage.
    }

    setOpen(false);
    setShowBadge(true);
  }, []);

  useEffect(() => {
    if (!open || !window.matchMedia('(max-width: 639px)').matches) return undefined;

    function closeIfFocusIsOutside() {
      if (!noticeRef.current?.contains(document.activeElement)) closeNotice();
    }

    const timer = window.setTimeout(closeIfFocusIsOutside, 5000);
    function handleMobileScroll() {
      closeIfFocusIsOutside();
    }

    window.addEventListener('scroll', handleMobileScroll, { once: true, passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', handleMobileScroll);
    };
  }, [closeNotice, open]);

  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') closeNotice();
    }

    function handleFocusIn(event) {
      if (!noticeRef.current?.contains(event.target)) closeNotice();
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, [closeNotice, open]);

  const badgeClassName = 'surface-floating recruitment-notice-badge group fixed bottom-3 right-3 z-[80] flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white p-1 text-left no-underline transition-transform hover:-translate-y-0.5 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-navy)] focus-visible:ring-offset-2 sm:bottom-6 sm:right-6 sm:h-auto sm:w-auto sm:gap-3 sm:py-2 sm:pl-2 sm:pr-4';
  const badgeContent = (
    <>
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-burgundy)] text-white transition-colors group-hover:bg-[var(--brand-burgundy-deep)] sm:h-10 sm:w-10">
        <GraduationCap aria-hidden="true" className="h-5 w-5" />
      </span>
      <span className="recruitment-notice-badge-copy hidden overflow-hidden whitespace-nowrap sm:block">
        <span className="hidden text-[10px] font-semibold text-[var(--brand-burgundy)] sm:block">Now recruiting</span>
        <span className="hidden text-sm font-semibold text-slate-900 sm:mt-0.5 sm:block">Graduate Students</span>
      </span>
    </>
  );

  return (
    <>
      {open ? (
        <aside
          aria-describedby="recruitment-notice-description"
          aria-labelledby="recruitment-notice-title"
          aria-live="polite"
          className="surface-floating recruitment-notice-card fixed bottom-3 right-3 z-[85] w-[calc(100vw-2rem)] max-w-[18.5rem] overflow-hidden rounded-lg border border-slate-200 bg-white/95 px-4 pb-4 pt-4 backdrop-blur-sm sm:bottom-6 sm:right-6 sm:w-[21.5rem] sm:max-w-none sm:px-5 sm:pb-5 sm:pt-5"
          ref={noticeRef}
        >
          <button
            aria-label="Close recruitment notice"
            className="absolute right-2 top-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-navy)] focus-visible:ring-offset-2 sm:right-3 sm:top-3 sm:h-8 sm:w-8"
            onClick={closeNotice}
            type="button"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>

          <p className="flex items-center gap-2 pr-9 text-[11px] font-semibold text-[var(--brand-burgundy)]">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--brand-burgundy)]" />
            {content.recruitmentNoticeEyebrow === 'Now Recruiting' ? 'Now recruiting' : content.recruitmentNoticeEyebrow || 'Now recruiting'}
          </p>
          <h2 className="mt-1.5 pr-8 text-lg font-semibold leading-snug tracking-tight text-slate-950 sm:mt-2 sm:text-xl sm:leading-tight" id="recruitment-notice-title">
            {content.recruitmentNoticeTitle || 'Graduate Students'}
          </h2>
          <p className="sr-only mt-1.5 text-sm font-medium leading-relaxed text-slate-600 sm:not-sr-only sm:block" id="recruitment-notice-description">
            {content.recruitmentNoticeDescription || 'M.S. · Ph.D. · Integrated M.S.–Ph.D.'}
          </p>

          <div className="site-action-links mt-3 sm:mt-4">
            <Link
              className="site-action-link"
              onClick={closeNotice}
              to={pagePath(locale, 'join')}
            >
              {content.recruitmentNoticeCta || 'View Opportunities'}
            </Link>
          </div>
        </aside>
      ) : null}

      {showBadge && !open ? (
        <Link
          aria-label="View graduate recruitment details"
          className={badgeClassName}
          to={pagePath(locale, 'join')}
        >
          {badgeContent}
        </Link>
      ) : null}
    </>
  );
}
