import { useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Languages, Menu, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/content/site-content';
import { pagePath, switchLocalePath } from '@/lib/i18n';

export function SiteHeader({ locale }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isKorean = locale === 'ko';
  const universityLabel = isKorean ? '경희대학교' : 'Kyung Hee University';
  const affiliationLabel = isKorean ? '화학공학과' : 'Department of Chemical Engineering';

  const navItems = useMemo(() => NAV_ITEMS[locale] || NAV_ITEMS.en, [locale]);
  const targetLocale = locale === 'ko' ? 'en' : 'ko';
  const languageLabel = locale === 'ko' ? 'English' : '한국어';
  const localePath = switchLocalePath(location.pathname, targetLocale);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/90 backdrop-blur-md">
      <div className="border-b border-[#7f1121] bg-gradient-to-r from-[#7a0f1f] via-[#98132a] to-[#7a0f1f]">
        <div className="mx-auto flex h-9 w-full max-w-6xl items-center justify-between px-5">
          <p className="font-serif text-sm font-semibold tracking-[0.01em] text-white">{universityLabel}</p>
          <p className="text-[11px] font-medium tracking-[0.08em] text-white/85 max-md:hidden">{affiliationLabel}</p>
        </div>
      </div>

      <div className="mx-auto flex min-h-24 w-full max-w-6xl items-center justify-between px-5 md:min-h-28">
        <Link
          aria-label={isKorean ? '배랩 홈페이지' : 'Bae Lab home'}
          className="flex items-center no-underline"
          to={pagePath(locale, '')}
        >
          <img alt="Bae Lab logo" className="h-20 w-20 object-contain md:h-24 md:w-24" src={`${import.meta.env.BASE_URL}assets/img/lab-logo.png`} />
          <span className="sr-only">{isKorean ? '배랩 메인으로 이동' : 'Go to Bae Lab home'}</span>
        </Link>

        <nav className="relative">
          <Button
            aria-controls="site-nav"
            aria-expanded={open}
            className="md:hidden"
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
              'hidden items-center gap-1 md:flex md:rounded-full md:border md:border-slate-200 md:bg-white/75 md:px-2 md:py-1 md:shadow-[0_12px_28px_-20px_rgba(2,6,23,0.55)]',
              open &&
                'absolute right-0 top-12 z-40 flex w-56 flex-col rounded-lg border border-border bg-white p-2 shadow-soft md:static md:w-auto md:flex-row md:rounded-full md:border-slate-200 md:bg-white/75 md:px-2 md:py-1 md:shadow-[0_12px_28px_-20px_rgba(2,6,23,0.55)]'
            )}
            id="site-nav"
          >
            {navItems.map((item) => (
              <li className="w-full md:w-auto" key={item.slug || 'home'}>
                <NavLink
                  className={({ isActive }) =>
                    cn(
                      'inline-flex w-full rounded-md border border-transparent px-3 py-2 text-sm font-semibold text-slate-700 no-underline transition-colors hover:border-border hover:bg-slate-50',
                      isActive && 'border-[#0b3a64]/20 bg-[#0b3a64]/10 text-[#0b3a64]'
                    )
                  }
                  end={item.slug === ''}
                  onClick={() => setOpen(false)}
                  to={pagePath(locale, item.slug)}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li className="w-full md:w-auto">
              <Link
                className="inline-flex w-full items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-semibold text-slate-800 no-underline hover:bg-slate-50"
                onClick={() => setOpen(false)}
                to={localePath}
              >
                <Languages className="h-4 w-4" />
                {languageLabel}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
