import { Link } from 'react-router-dom';

import { BRAND, CONTACT_CONTENT, NAV_ITEMS } from '@/content/site-content';
import { pagePath } from '@/lib/i18n';

export function SiteFooter({ locale }) {
  const brand = BRAND[locale] || BRAND.en || {};
  const content = CONTACT_CONTENT[locale] || CONTACT_CONTENT.en || {};
  const labels = content.labels || {};
  const navItems = NAV_ITEMS[locale] || NAV_ITEMS.en || [];
  const contactLabel = 'Contact';
  const quickLinksLabel = 'Quick Links';
  const rightsLabel = locale === 'ko' ? '모든 권리 보유.' : 'All rights reserved.';
  const affiliationLabel = locale === 'ko' ? '경희대학교 화학공학과' : 'Department of Chemical Engineering, Kyung Hee University';
  const description = (brand.tagline || brand.subtitle || '').trim();
  const quickLinks = [...navItems, { slug: 'contact', label: contactLabel }].filter((item, index, array) => {
    const key = item.slug || 'home';
    return array.findIndex((candidate) => (candidate.slug || 'home') === key) === index;
  });
  const year = new Date().getFullYear();

  return (
    <footer className="mt-8 border-t border-[#d8d8d8] bg-[linear-gradient(180deg,#ffffff_0%,#f7f7f7_100%)] text-[#222222]">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 md:py-10">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#ad1d19]">{brand.name}</h2>
            {description ? <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#717171]">{description}</p> : null}
          </div>
          <div className="md:justify-self-end">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#717171]">{quickLinksLabel}</p>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
              {quickLinks.map((item) => (
                <li key={item.slug || 'home'}>
                  <Link className="text-sm text-[#4a4a4a] no-underline transition-colors hover:text-[#0d326f]" to={pagePath(locale, item.slug)}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 grid gap-4 border-t border-[#e1e1e1] pt-5 md:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#717171]">{labels.address || 'Address'}</p>
            <p className="mt-1 text-sm leading-relaxed text-[#2a2a2a]">{content.address}</p>
          </div>

          <div className="md:justify-self-end md:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#717171]">{labels.email || 'Email'}</p>
            <a className="mt-1 inline-block text-sm text-[#2a2a2a] no-underline transition-colors hover:text-[#ad1d19]" href="mailto:jbae@khu.ac.kr">
              jbae@khu.ac.kr
            </a>
          </div>
        </div>

        <div className="mt-6 border-t border-[#e1e1e1] pt-4 text-xs text-[#717171] md:flex md:items-center md:justify-between">
          <p>© {year} {brand.name}. {rightsLabel}</p>
          <p className="mt-1 md:mt-0">{affiliationLabel}</p>
        </div>
      </div>
    </footer>
  );
}
