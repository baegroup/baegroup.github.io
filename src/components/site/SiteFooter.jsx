import { Link } from 'react-router-dom';

import { BRAND, CONTACT_CONTENT, NAV_ITEMS } from '@/content/site-content';
import { pagePath } from '@/lib/i18n';

export function SiteFooter({ locale }) {
  const brand = BRAND[locale] || BRAND.en || {};
  const content = CONTACT_CONTENT[locale] || CONTACT_CONTENT.en || {};
  const labels = content.labels || {};
  const navItems = NAV_ITEMS[locale] || NAV_ITEMS.en || [];
  const contactLabel = 'Contact';
  const joinLabel = 'Join Our Team';
  const quickLinksLabel = 'Quick Links';
  const rightsLabel = 'All rights reserved.';
  const affiliationLabel = 'Department of Chemical Engineering, Kyung Hee University';
  const koreanIdentityLabel = '경희대학교 화학공학과 배재형 교수 연구실';
  const description = (brand.tagline || brand.subtitle || '').trim();
  const quickLinks = [...navItems, { slug: 'contact', label: contactLabel }, { slug: 'join', label: joinLabel }].filter((item, index, array) => {
    const key = item.slug || 'home';
    return array.findIndex((candidate) => (candidate.slug || 'home') === key) === index;
  });
  const year = new Date().getFullYear();

  function openCookiePreferences() {
    if (typeof window === 'undefined') {
      return;
    }
    window.dispatchEvent(new Event('open-cookie-preferences'));
  }

  return (
    <footer className="mt-8 border-t border-[#d2cac3] bg-[var(--brand-footer)] text-[#222222]">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 md:py-10">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--brand-burgundy)]">{brand.name}</h2>
            {description ? <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#717171]">{description}</p> : null}
            <p className="mt-2 text-sm text-[#4a4a4a]">{koreanIdentityLabel}</p>
          </div>
          <div className="md:justify-self-stretch md:text-right">
            <p className="text-xs font-medium text-[#68615d]">{quickLinksLabel}</p>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 md:justify-end">
              {quickLinks.map((item) => (
                <li key={item.slug || 'home'}>
                  <Link className="text-sm text-[#4a4a4a] no-underline transition-colors hover:text-[var(--brand-navy)]" to={pagePath(locale, item.slug)}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 grid gap-4 border-t border-[#d8d0c9] pt-5 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-[#68615d]">{labels.address || 'Address'}</p>
            <p className="mt-1 text-sm leading-relaxed text-[#2a2a2a]">{content.address}</p>
          </div>

          <div className="md:justify-self-stretch md:text-right">
            <p className="text-xs font-medium text-[#68615d]">{labels.email || 'Email'}</p>
            <a className="mt-1 inline-block text-sm text-[#2a2a2a] no-underline transition-colors hover:text-[var(--brand-burgundy)]" href="mailto:jbae@khu.ac.kr">
              jbae@khu.ac.kr
            </a>
          </div>
        </div>

        <div className="mt-6 border-t border-[#d8d0c9] pt-4 text-xs text-[#68615d] md:flex md:items-center md:justify-between">
          <p>© {year} {brand.name}. {rightsLabel}</p>
          <div className="mt-1 flex items-center gap-4 md:mt-0 md:justify-end md:text-right">
            <p>{affiliationLabel}</p>
            <button
              className="text-xs font-semibold text-[#4a4a4a] underline-offset-2 transition-colors hover:text-[var(--brand-navy)] hover:underline"
              onClick={openCookiePreferences}
              type="button"
            >
              Manage Cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
