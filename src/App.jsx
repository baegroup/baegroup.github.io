import { useLayoutEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { SiteLayout } from '@/layouts/SiteLayout';
import { SiteMetadata } from '@/components/site/SiteMetadata';
import { SiteAnalytics } from '@/components/site/SiteAnalytics';
import { HomePage } from '@/pages/HomePage';
import { TeamPage } from '@/pages/TeamPage';
import { NewsPage } from '@/pages/NewsPage';
import { PublicationsPage } from '@/pages/PublicationsPage';
import { ResearchPage } from '@/pages/ResearchPage';
import { ContactPage } from '@/pages/ContactPage';
import { JoinPage } from '@/pages/JoinPage';
import { KoreanLandingPage } from '@/pages/KoreanLandingPage';
import { PrivacyPage } from '@/pages/PrivacyPage';

const DEFAULT_LOCALE = 'en';

function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

function RouteRenderMarker() {
  const { pathname } = useLocation();
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  return <span aria-hidden="true" data-rendered-route={normalizedPath} hidden />;
}

function LegacyLocaleRedirect() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);
  const destination = segments.slice(1).join('/');
  return <Navigate replace to={destination ? `/${destination}/` : '/'} />;
}

function SiteRoutes() {
  const locale = DEFAULT_LOCALE;

  return (
    <SiteLayout locale={locale}>
      <Routes>
        <Route element={<HomePage locale={locale} />} index />
        <Route element={<TeamPage locale={locale} />} path="team" />
        <Route element={<TeamPage locale={locale} section="professor" />} path="team/jaehyeong-bae" />
        <Route element={<TeamPage locale={locale} section="current" />} path="team/members" />
        <Route element={<TeamPage locale={locale} section="staff" />} path="team/staff" />
        <Route element={<TeamPage locale={locale} section="alumni" />} path="team/alumni" />
        <Route element={<Navigate replace to="/team/" />} path="members" />
        <Route element={<ResearchPage locale={locale} />} path="research" />
        <Route element={<PublicationsPage locale={locale} />} path="publications" />
        <Route element={<PublicationsPage locale={locale} />} path="publications/:typeSlug" />
        <Route element={<PublicationsPage locale={locale} />} path="publications/:typeSlug/:periodSlug" />
        <Route element={<NewsPage locale={locale} />} path="news" />
        <Route element={<NewsPage locale={locale} />} path="news/:sectionSlug" />
        <Route element={<NewsPage locale={locale} />} path="news/:sectionSlug/page/:pageNumber" />
        <Route element={<NewsPage locale={locale} />} path="news/:sectionSlug/:itemSlug" />
        <Route element={<KoreanLandingPage />} path="ko" />
        <Route element={<JoinPage locale={locale} />} path="join" />
        <Route element={<ContactPage locale={locale} />} path="contact" />
        <Route element={<PrivacyPage />} path="privacy" />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </SiteLayout>
  );
}

export default function App() {
  return (
    <>
      <SiteMetadata />
      <SiteAnalytics />
      <ScrollToTop />
      <RouteRenderMarker />
      <Routes>
        <Route element={<LegacyLocaleRedirect />} path="en/*" />
        <Route element={<SiteRoutes />} path="*" />
      </Routes>
    </>
  );
}
