import { Link } from 'react-router-dom';
import { ArrowRight, Mail, MapPin } from 'lucide-react';

import { BRAND, CONTACT_CONTENT, NAV_ITEMS } from '@/content/site-content';
import { pagePath } from '@/lib/i18n';

export function SiteFooter({ locale }) {
  const brand = BRAND[locale] || BRAND.en || {};
  const content = CONTACT_CONTENT[locale] || CONTACT_CONTENT.en || {};
  const labels = content.labels || {};
  const navItems = NAV_ITEMS[locale] || NAV_ITEMS.en || [];
  const quickLinksLabel = locale === 'ko' ? '바로가기' : 'Quick Links';
  const rightsLabel = locale === 'ko' ? '모든 권리 보유.' : 'All rights reserved.';
  const affiliationLabel = locale === 'ko' ? '경희대학교 화학공학과' : 'Department of Chemical Engineering, Kyung Hee University';
  const year = new Date().getFullYear();
  const isKorean = locale === 'ko';

  return (
    <footer className="mt-8 bg-[#0b3a64] text-white">
      <div className="h-0.5 w-full bg-gradient-to-r from-[#7a0f1f]/90 via-white/35 to-[#7a0f1f]/90" />
      <div className="mx-auto w-full max-w-6xl px-5 py-10 md:py-12">
        <div className="mb-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start">
          <div>
          <h2 className="text-2xl font-semibold tracking-tight">Bae Lab</h2>
          <p className="mt-1 text-sm text-white/60">{brand.subtitle}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.1em] text-white/45">{brand.tagline}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-white/55">{quickLinksLabel}</p>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
              {navItems.map((item) => (
                <li key={item.slug || 'home'}>
                  <Link className="text-sm text-white/80 no-underline hover:text-white" to={pagePath(locale, item.slug)}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-white/50">{labels.email}</p>
              <a className="text-sm text-white/90 hover:text-white" href="mailto:jbae@khu.ac.kr">
                jbae@khu.ac.kr
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-white/50">{labels.address}</p>
              <p className="text-sm text-white/90">{content.address}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Link
            className="group inline-flex items-center gap-2 text-sm font-medium text-white/70 no-underline transition-colors hover:text-white"
            to={pagePath(locale, 'contact')}
          >
            {isKorean ? '연락처 및 지원 안내' : 'Contact & Directions'}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-8 border-t border-white/15 pt-5">
          <p>© {year} {brand.name}. {rightsLabel}</p>
          <p className="mt-1 text-xs text-white/40 md:mt-0">{affiliationLabel}</p>
        </div>
      </div>
    </footer>
  );
}
