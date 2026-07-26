import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { pagePath } from '@/lib/i18n';

const SESSION_KEY = 'baelab_recruitment_notice_v1';

export function RecruitmentNotice({ content, locale }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(SESSION_KEY)) return;
      window.sessionStorage.setItem(SESSION_KEY, 'shown');
    } catch {
      // Show the notice when session storage is unavailable.
    }

    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const previousActiveElement = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false);
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
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 py-8 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <section
        aria-labelledby="recruitment-notice-title"
        aria-modal="true"
        className="relative w-full max-w-lg rounded-xl border border-white/20 bg-white p-6 shadow-[0_28px_70px_-24px_rgba(2,6,23,0.65)] md:p-8"
        ref={dialogRef}
        role="dialog"
      >
        <button
          aria-label="Close recruitment notice"
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-xl leading-none text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d326f] focus-visible:ring-offset-2"
          onClick={() => setOpen(false)}
          ref={closeButtonRef}
          type="button"
        >
          ×
        </button>

        <p className="pr-12 text-xs font-semibold uppercase tracking-[0.14em] text-[#7a0f1f]">
          {content.recruitmentNoticeEyebrow || 'Now Recruiting'}
        </p>
        <h2 className="mt-3 pr-10 text-2xl font-semibold leading-tight text-slate-950 md:text-3xl" id="recruitment-notice-title">
          {content.recruitmentNoticeTitle || 'Graduate Students Wanted'}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-700 md:text-base">
          {content.recruitmentNoticeDescription}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="home-cta-primary" onClick={() => setOpen(false)} to={pagePath(locale, 'join')}>
            {content.recruitmentNoticeCta || 'View Recruitment Details'}
          </Link>
          <button
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d326f] focus-visible:ring-offset-2"
            onClick={() => setOpen(false)}
            type="button"
          >
            Close
          </button>
        </div>
      </section>
    </div>
  );
}
