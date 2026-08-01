import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, GraduationCap, X } from 'lucide-react';
import { Link } from 'react-router-dom';

import { pagePath } from '@/lib/i18n';

const SESSION_KEY = 'baelab_recruitment_notice_v3';
const HIDE_UNTIL_KEY = 'baelab_recruitment_notice_hide_until_v2';
const NOTICE_DELAY_MS = 800;

export function RecruitmentNotice({ content, locale }) {
  const [open, setOpen] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    let timer;

    try {
      const shownThisSession = window.sessionStorage.getItem(SESSION_KEY) === 'shown';
      const hideUntil = Number(window.localStorage.getItem(HIDE_UNTIL_KEY) || 0);

      if (shownThisSession || hideUntil > Date.now()) {
        setShowBadge(true);
        return undefined;
      }
    } catch {
      // Show the notice when browser storage is unavailable.
    }

    timer = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem(SESSION_KEY, 'shown');
      } catch {
        // The notice can still be displayed without storage.
      }
      setOpen(true);
    }, NOTICE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, []);

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
    setShowBadge(false);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return undefined;

    const previousActiveElement = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        closeNotice();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusableElements = dialogRef.current?.querySelectorAll('a[href], button:not([disabled])') || [];
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousActiveElement?.focus?.();
    };
  }, [closeNotice, open]);

  return (
    <>
      {open ? (
        <div
          className="recruitment-notice-backdrop fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/50 px-3 pb-3 pt-8 backdrop-blur-[2px] sm:items-center sm:px-5 sm:py-8"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeNotice();
          }}
        >
          <section
            aria-describedby="recruitment-notice-description"
            aria-labelledby="recruitment-notice-title"
            aria-modal="true"
            className="recruitment-notice-dialog relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white px-6 pb-6 pt-7 shadow-[0_28px_80px_-30px_rgba(2,6,23,0.65)] sm:rounded-3xl sm:px-8 sm:pb-8 sm:pt-9"
            ref={dialogRef}
            role="dialog"
          >
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-[#0d326f]" />
            <button
              aria-label="Close recruitment notice"
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d326f] focus-visible:ring-offset-2"
              onClick={closeNotice}
              ref={closeButtonRef}
              type="button"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>

            <p className="flex items-center gap-2 pr-10 text-xs font-semibold uppercase tracking-[0.16em] text-[#ad1d19]">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#ad1d19]" />
              {content.recruitmentNoticeEyebrow || 'Join Bae Lab'}
            </p>
            <h2 className="mt-3 pr-8 text-2xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-[1.75rem]" id="recruitment-notice-title">
              {content.recruitmentNoticeTitle || 'Graduate Research Opportunities'}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-[0.95rem]" id="recruitment-notice-description">
              {content.recruitmentNoticeDescription || 'Explore M.S., Ph.D., and integrated degree opportunities at Bae Lab.'}
            </p>

            <Link
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#0d326f] px-5 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#0a2858] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d326f] focus-visible:ring-offset-2"
              onClick={closeNotice}
              to={pagePath(locale, 'join')}
            >
              {content.recruitmentNoticeCta || 'Explore Opportunities'}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </section>
        </div>
      ) : null}

      {showBadge && !open ? (
        <button
          aria-label="Open graduate recruitment notice"
          className="recruitment-notice-badge group fixed bottom-5 right-4 z-[80] flex items-center gap-3 rounded-full border border-slate-200 bg-white py-2 pl-2 pr-4 text-left shadow-[0_16px_45px_-18px_rgba(2,6,23,0.48)] transition-transform hover:-translate-y-0.5 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d326f] focus-visible:ring-offset-2 sm:bottom-6 sm:right-6"
          onClick={openNotice}
          type="button"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0d326f] text-white transition-colors group-hover:bg-[#0a2858]">
            <GraduationCap aria-hidden="true" className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#ad1d19]">Join Bae Lab</span>
            <span className="mt-0.5 block text-xs font-semibold text-slate-900 sm:text-sm">Graduate Opportunities</span>
          </span>
        </button>
      ) : null}
    </>
  );
}
