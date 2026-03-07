import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { SiteLayout } from '@/layouts/SiteLayout';
import { HomePage } from '@/pages/HomePage';
import { TeamPage } from '@/pages/TeamPage';
import { NewsPage } from '@/pages/NewsPage';
import { PublicationsPage } from '@/pages/PublicationsPage';
import { ResearchPage } from '@/pages/ResearchPage';
import { ContactPage } from '@/pages/ContactPage';

const DEFAULT_LOCALE = 'en';

function LegacyLocaleRedirect() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);
  const destination = segments.slice(1).join('/');
  return <Navigate replace to={destination ? `/${destination}` : '/'} />;
}

function SiteRoutes() {
  const locale = DEFAULT_LOCALE;

  return (
    <SiteLayout locale={locale}>
      <Routes>
        <Route element={<HomePage locale={locale} />} index />
        <Route element={<TeamPage locale={locale} />} path="team" />
        <Route element={<ResearchPage locale={locale} />} path="research" />
        <Route element={<PublicationsPage locale={locale} />} path="publications" />
        <Route element={<NewsPage locale={locale} />} path="news" />
        <Route element={<ContactPage locale={locale} />} path="contact" />
        <Route element={<Navigate replace to="/contact" />} path="join" />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </SiteLayout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<LegacyLocaleRedirect />} path="en/*" />
      <Route element={<LegacyLocaleRedirect />} path="ko/*" />
      <Route element={<SiteRoutes />} path="*" />
    </Routes>
  );
}
