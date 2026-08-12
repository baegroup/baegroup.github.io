import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, GraduationCap, X } from 'lucide-react';
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
  const [badgeCompact, setBadgeCompact] = useState(false);

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

  const openNotice = () => {
    setBadgeCompact(false);
    setShowBadge(false);
    setOpen(true);
  };

  useEffect(() => {
    if (!showBadge || open) {
      setBadgeCompact(false);
      return undefined;
    }

    const timer = window.setTimeout(() => setBadgeCompact(true), 4500);
    return () => window.clearTimeout(timer);
  }, [open, showBadge]);

  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') closeNotice();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeNotice, open]);

  const badgeClassName = `recruitment-notice-badge group fixed bottom-5 right-4 z-[80] flex items-center gap-3 rounded-full border border-slate-200 bg-white py-2 pl-2 pr-4 text-left no-underline shadow-[0_16px_45px_-18px_rgba(2,6,23,0.48)] transition-transform hover:-translate-y-0.5 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-navy)] focus-visible:ring-offset-2 sm:bottom-6 sm:right-6 ${badgeCompact ? 'is-compact' : ''}`;
  const badgeContent = (
    <>
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-navy)] text-white transition-colors group-hover:bg-[var(--brand-navy-deep)]">
        <GraduationCap aria-hidden="true" className="h-5 w-5" />
      </span>
      <span className="recruitment-notice-badge-copy overflow-hidden whitespace-nowrap">
        <span className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-burgundy)] sm:block">Now Recruiting</span>
        <span className="block text-xs font-semibold text-slate-900 sm:mt-0.5 sm:text-sm">Graduate Students</span>
      </span>
    </>
  );

  return (
    <>
      {open ? (
        <aside
          aria-labelledby="recruitment-notice-title"
          className="recruitment-notice-card fixed bottom-3 left-3 right-3 z-[85] overflow-hidden rounded-2xl border border-slate-200 bg-white/95 px-5 pb-5 pt-6 shadow-[0_24px_60px_-28px_rgba(2,6,23,0.58)] backdrop-blur-sm sm:bottom-6 sm:left-auto sm:right-6 sm:w-[23rem]"
        >
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-[var(--brand-navy)]" />
          <button
            aria-label="Close recruitment notice"
            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-navy)] focus-visible:ring-offset-2"
            onClick={closeNotice}
            type="button"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>

          <p className="flex items-center gap-2 pr-9 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-burgundy)]">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--brand-burgundy)]" />
            {content.recruitmentNoticeEyebrow || 'Now Recruiting'}
          </p>
          <h2 className="mt-2 pr-8 text-xl font-semibold leading-tight tracking-tight text-slate-950" id="recruitment-notice-title">
            {content.recruitmentNoticeTitle || 'Graduate Students'}
          </h2>
          <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-600">
            {content.recruitmentNoticeDescription || 'M.S. · Ph.D. · Integrated M.S.–Ph.D.'}
          </p>

          <Link
            className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[var(--brand-navy)] px-4 py-2 text-sm font-semibold text-white no-underline transition-colors hover:bg-[var(--brand-navy-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-navy)] focus-visible:ring-offset-2"
            onClick={closeNotice}
            to={pagePath(locale, 'join')}
          >
            {content.recruitmentNoticeCta || 'View Details'}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </aside>
      ) : null}

      {showBadge && !open ? (
        autoOpen ? (
          <button
            aria-label="Open graduate recruitment notice"
            className={badgeClassName}
            onClick={openNotice}
            type="button"
          >
            {badgeContent}
          </button>
        ) : (
          <Link
            aria-label="View graduate recruitment details"
            className={badgeClassName}
            to={pagePath(locale, 'join')}
          >
            {badgeContent}
          </Link>
        )
      ) : null}
    </>
  );
}
