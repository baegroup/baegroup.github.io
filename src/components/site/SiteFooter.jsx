import { Link } from 'react-router-dom';

import { BRAND, CONTACT_CONTENT, NAV_ITEMS } from '@/content/site-content';
import { pagePath } from '@/lib/i18n';

export function SiteFooter({ locale, onOpenCookiePreferences }) {
  const brand = BRAND[locale] || BRAND.en || {};
  const content = CONTACT_CONTENT[locale] || CONTACT_CONTENT.en || {};
  const navItems = NAV_ITEMS[locale] || NAV_ITEMS.en || [];
  const contactLabel = 'Contact';
  const joinLabel = 'Join Our Team';
  const quickLinksLabel = 'Quick Links';
  const rightsLabel = 'All rights reserved.';
  const koreanIdentityLabel = '경희대학교 화학공학과 배재형 교수 연구실';
  const description = (brand.tagline || brand.subtitle || '').trim();
  const quickLinks = [...navItems, { slug: 'contact', label: contactLabel }, { slug: 'join', label: joinLabel }].filter((item, index, array) => {
    const key = item.slug || 'home';
    return array.findIndex((candidate) => (candidate.slug || 'home') === key) === index;
  });
  const year = new Date().getFullYear();

  function openCookiePreferences() {
    onOpenCookiePreferences?.();
  }

  return (
    <footer className="site-rule-strong mt-8 border-t bg-[var(--brand-footer)] text-[#222222]">
      <div className="site-frame pb-3 pt-8 md:pb-4 md:pt-8">
        <div className="grid gap-7 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_minmax(0,1.15fr)] md:items-start md:gap-8">
          <div className="text-left">
            <h2 className="text-xl font-semibold leading-tight tracking-tight text-[var(--brand-burgundy)]">{brand.name}</h2>
            <div className="mt-2 space-y-1 text-left text-sm leading-relaxed">
              {description ? <p className="font-medium text-[#55504d]">{description}</p> : null}
              <p className="text-[#55504d]">{koreanIdentityLabel}</p>
            </div>
          </div>

          <div className="text-left">
            <p className="text-sm font-semibold text-[#55504d]">{contactLabel}</p>
            <div className="mt-2 space-y-1.5 text-sm leading-relaxed text-[#2a2a2a]">
              <p>{content.address}</p>
              <a className="inline-flex min-h-11 items-center no-underline transition-colors hover:text-[var(--brand-navy)] md:min-h-6" href="mailto:jbae@khu.ac.kr">
                jbae@khu.ac.kr
              </a>
            </div>
          </div>

          <div className="text-left">
            <p className="text-sm font-semibold text-[#55504d]">{quickLinksLabel}</p>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
              {quickLinks.map((item) => (
                <li key={item.slug || 'home'}>
                  <Link className="inline-flex min-h-11 items-center text-sm text-[#4a4a4a] no-underline transition-colors hover:text-[var(--brand-burgundy)] md:min-h-6" to={pagePath(locale, item.slug)}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="site-rule-soft mt-4 flex flex-col items-start gap-2 border-t pt-3 text-sm leading-relaxed text-[#68615d] md:flex-row md:items-center md:justify-between">
          <p>© {year} {brand.name}, Department of Chemical Engineering, Kyung Hee University. {rightsLabel}</p>
          <div className="flex items-center gap-3">
            <Link className="inline-flex min-h-11 items-center text-sm text-[#68615d] underline-offset-2 transition-colors hover:text-[var(--brand-burgundy)] hover:underline md:min-h-6" to="/privacy/">
              Privacy
            </Link>
            <button
              className="inline-flex min-h-11 items-center text-sm text-[#68615d] underline-offset-2 transition-colors hover:text-[var(--brand-burgundy)] hover:underline md:min-h-6"
              data-cookie-preferences-trigger
              onClick={openCookiePreferences}
              type="button"
            >
              Cookie Settings
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
