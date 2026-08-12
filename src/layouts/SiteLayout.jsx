import { useLocation } from 'react-router-dom';

import { RecruitmentNotice } from '@/components/home/RecruitmentNotice';
import { CookieConsent } from '@/components/site/CookieConsent';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import { HOME_CONTENT } from '@/content/site-content';

const RECRUITMENT_NOTICE_PREFIXES = ['/', '/team', '/research', '/publications', '/news'];

export function SiteLayout({ locale, children }) {
  const { pathname } = useLocation();
  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  const prerendering = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('prerender');
  const showRecruitmentNotice = !prerendering && RECRUITMENT_NOTICE_PREFIXES.some((path) => (
    path === '/' ? normalizedPath === '/' : normalizedPath === path || normalizedPath.startsWith(`${path}/`)
  ));
  const homeContent = HOME_CONTENT[locale] || HOME_CONTENT.en || {};

  return (
    <div className="min-h-screen bg-[var(--brand-page)]">
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        href="#main-content"
      >
        Skip to content
      </a>
      <SiteHeader locale={locale} />
      <main className="mx-auto w-full max-w-6xl space-y-4 px-5 py-6 md:py-8" id="main-content">{children}</main>
      <SiteFooter locale={locale} />
      {showRecruitmentNotice ? (
        <RecruitmentNotice autoOpen={normalizedPath === '/'} content={homeContent} locale={locale} />
      ) : null}
      <CookieConsent disabled={prerendering} />
    </div>
  );
}
