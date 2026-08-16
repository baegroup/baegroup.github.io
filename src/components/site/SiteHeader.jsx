import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BRAND, NAV_ITEMS } from '@/content/site-content';
import { pagePath } from '@/lib/i18n';

export function SiteHeader({ locale }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);
  const brand = BRAND[locale] || BRAND.en || {};
  const tagline = (brand.tagline || '').trim() || 'Additive Manufacturing of Functional Materials';
  const taglineMatch = tagline.match(/^(Additive Manufacturing)\s+(of Functional Materials)$/i);
  const taglineLines = taglineMatch ? [taglineMatch[1], taglineMatch[2]] : [tagline];
  const universityLabel = 'Kyung Hee University';
  const affiliationLabel = 'Department of Chemical Engineering';
  const universityUrl = 'https://www.khu.ac.kr';
  const departmentUrl = 'https://chemeng.khu.ac.kr';
  const topLinkBaseClass =
    'inline-flex items-center rounded px-1.5 py-0.5 no-underline transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40';
  const navItems = useMemo(() => NAV_ITEMS[locale] || NAV_ITEMS.en || [], [locale]);

  useEffect(() => {
    let frameId = 0;

    function updateHeader() {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 12);
        frameId = 0;
      });
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateHeader);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (!headerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <header className={cn('site-header sticky top-0 z-50 border-b border-[#e6e0da]/95 bg-[#fbfaf8]/95 backdrop-blur-md', scrolled && 'is-scrolled')} ref={headerRef}>
      <div className="border-b border-[#5e111c] bg-[#751523]">
        <div className="site-frame flex h-8 items-center justify-between">
          <a
            className={`${topLinkBaseClass} gap-2 text-sm font-semibold tracking-[0.01em] text-white/95 hover:text-white`}
            href={universityUrl}
            rel="noreferrer"
            target="_blank"
          >
            <img
              alt=""
              aria-hidden="true"
              className="h-5 w-auto shrink-0 brightness-0 invert"
              decoding="async"
              height="399"
              src={`${import.meta.env.BASE_URL}assets/img/khu-symbol.png`}
              width="349"
            />
            {universityLabel}
          </a>
          <a
            className={`${topLinkBaseClass} text-xs font-medium tracking-[0.025em] text-white/80 hover:text-white max-md:hidden`}
            href={departmentUrl}
            rel="noreferrer"
            target="_blank"
          >
            {affiliationLabel}
          </a>
        </div>
      </div>

      <div className="site-header-main site-frame flex min-h-[5.5rem] items-center justify-between md:min-h-24">
        <Link
          aria-label="Bae Lab home"
          className="flex items-center gap-3 no-underline"
          to={pagePath('')}
        >
          <img
            alt="Bae Lab logo"
            className="site-header-logo h-[4.5rem] w-[4.5rem] object-contain md:h-20 md:w-20"
            decoding="async"
            height="96"
            src={`${import.meta.env.BASE_URL}assets/img/lab-logo.png`}
            width="96"
          />
          <p className="max-w-[8rem] sm:max-w-[11rem] md:max-w-[260px]">
            {taglineLines.map((line) => (
              <span
                className="block text-[0.6875rem] font-medium leading-[1.4] tracking-[0.015em] text-slate-600 md:text-[0.8125rem] md:leading-[1.45] md:tracking-[0.025em]"
                key={line}
              >
                {line}
              </span>
            ))}
          </p>
          <span className="sr-only">Go to Bae Lab home</span>
        </Link>

        <nav className="relative">
          <Button
            aria-controls="site-nav"
            aria-expanded={open}
            className="h-11 w-11 rounded border-[#ded8d2] text-slate-700 hover:bg-[#f1ede8] md:hidden"
            onClick={() => setOpen((value) => !value)}
            size="icon"
            type="button"
            variant="outline"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            <span className="sr-only">Toggle navigation</span>
          </Button>

          <ul
            className={cn(
              'hidden md:flex md:items-center md:gap-5',
              open &&
                'surface-floating absolute right-0 top-11 z-40 flex w-52 flex-col gap-0.5 rounded-lg border border-[#ded8d2] bg-[#fbfaf8] p-1.5 md:static md:w-auto md:flex-row md:items-center md:gap-5 md:border-0 md:bg-transparent md:p-0 md:shadow-none'
            )}
            id="site-nav"
          >
            {navItems.map((item) => (
              <li className="w-full md:w-auto" key={item.slug || 'home'}>
                <NavLink
                  className={({ isActive }) =>
                    cn(
                      'inline-flex min-h-11 w-full items-center rounded px-3 py-2 text-sm font-medium leading-5 text-slate-700 no-underline transition-colors hover:bg-[#f1ede8] hover:text-[var(--brand-burgundy)] md:min-h-0 md:w-auto md:rounded-none md:border-b md:border-transparent md:px-0 md:py-1 md:hover:bg-transparent',
                      isActive && 'font-semibold text-[var(--brand-burgundy)] md:border-b-[var(--brand-burgundy)]'
                    )
                  }
                  end={item.slug === ''}
                  onClick={() => setOpen(false)}
                  to={pagePath(item.slug)}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
