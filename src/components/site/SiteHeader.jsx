import { useMemo, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BRAND, NAV_ITEMS } from '@/content/site-content';
import { pagePath } from '@/lib/i18n';

export function SiteHeader({ locale }) {
  const [open, setOpen] = useState(false);
  const brand = BRAND[locale] || BRAND.en || {};
  const tagline = (brand.tagline || '').trim() || 'Functional Materials Additive Manufacturing';
  const universityLabel = 'Kyung Hee University';
  const affiliationLabel = 'Department of Chemical Engineering';
  const navItems = useMemo(() => NAV_ITEMS[locale] || NAV_ITEMS.en || [], [locale]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/90 backdrop-blur-md">
      <div className="border-b border-[#68101b] bg-[#7a0f1f]">
        <div className="mx-auto flex h-8 w-full max-w-6xl items-center justify-between px-5 md:h-9">
          <p className="text-sm font-semibold tracking-[0.01em] text-white">{universityLabel}</p>
          <p className="text-xs font-medium tracking-[0.08em] text-white/85 max-md:hidden">{affiliationLabel}</p>
        </div>
      </div>

      <div className="mx-auto flex min-h-24 w-full max-w-6xl items-center justify-between px-5 md:min-h-28">
        <Link
          aria-label="Bae Lab home"
          className="flex items-center gap-3.5 no-underline md:gap-4"
          to={pagePath('')}
        >
          <img alt="Bae Lab logo" className="h-20 w-20 object-contain md:h-24 md:w-24" src={`${import.meta.env.BASE_URL}assets/img/lab-logo.png`} />
          <p className="max-w-[360px] text-xs font-medium uppercase tracking-[0.10em] text-slate-600 max-md:hidden">{tagline}</p>
          <span className="sr-only">Go to Bae Lab home</span>
        </Link>

        <nav className="relative">
          <Button
            aria-controls="site-nav"
            aria-expanded={open}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 md:hidden"
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
              'hidden md:flex md:items-center md:gap-6',
              open &&
                'absolute right-0 top-12 z-40 flex w-56 flex-col gap-1 rounded-lg border border-slate-200 bg-white p-2 shadow-soft md:static md:w-auto md:flex-row md:items-center md:gap-6 md:border-0 md:bg-transparent md:p-0 md:shadow-none'
            )}
            id="site-nav"
          >
            {navItems.map((item) => (
              <li className="w-full md:w-auto" key={item.slug || 'home'}>
                <NavLink
                  className={({ isActive }) =>
                    cn(
                      'inline-flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-slate-700 no-underline transition-colors hover:bg-slate-50 hover:text-[#0b3a64] md:w-auto md:rounded-none md:border-b-2 md:border-transparent md:px-0 md:py-1 md:hover:bg-transparent',
                      isActive && 'bg-slate-50 text-[#0b3a64] md:border-b-[#0b3a64] md:bg-transparent md:font-semibold'
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
