import { useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Languages, Menu, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BRAND, NAV_ITEMS } from '@/content/site-content';
import { pagePath, switchLocalePath } from '@/lib/i18n';

export function SiteHeader({ locale }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const brand = BRAND[locale];
  const isKorean = locale === 'ko';

  const navItems = useMemo(() => NAV_ITEMS[locale] || NAV_ITEMS.en, [locale]);
  const targetLocale = locale === 'ko' ? 'en' : 'ko';
  const languageLabel = locale === 'ko' ? 'English' : '한국어';
  const localePath = switchLocalePath(location.pathname, targetLocale);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex min-h-24 w-full max-w-6xl items-center justify-between px-5 md:min-h-28">
        <Link className="flex min-w-0 items-center gap-3.5 no-underline md:gap-4" to={pagePath(locale, '')}>
          <img alt="Bae Lab logo" className="h-20 w-20 object-contain md:h-24 md:w-24" src={`${import.meta.env.BASE_URL}assets/img/lab-logo.png`} />
          <div className="min-w-0 leading-tight">
            <p
              className={cn(
                'truncate font-serif font-semibold text-slate-950',
                isKorean ? 'text-base md:text-xl' : 'text-lg md:text-2xl'
              )}
            >
              {brand.name}
            </p>
            <p
              className={cn(
                'mt-1 truncate max-md:hidden',
                isKorean ? 'text-xs font-medium text-slate-500' : 'text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0b3a64]'
              )}
            >
              {brand.subtitle}
            </p>
          </div>
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
