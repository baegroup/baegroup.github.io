import { Navigate, Route, Routes, useParams } from 'react-router-dom';

import { SiteLayout } from '@/layouts/SiteLayout';
import { HomePage } from '@/pages/HomePage';
import { MembersPage } from '@/pages/MembersPage';
import { NewsPage } from '@/pages/NewsPage';
import { PublicationsPage } from '@/pages/PublicationsPage';
import { ResearchPage } from '@/pages/ResearchPage';
import { isLocale } from '@/lib/i18n';

function LocaleRoutes() {
  const { locale } = useParams();

  if (!locale || !isLocale(locale)) {
    return <Navigate replace to="/en" />;
  }

  return (
    <SiteLayout locale={locale}>
      <Routes>
        <Route element={<HomePage locale={locale} />} index />
        <Route element={<MembersPage locale={locale} />} path="members" />
        <Route element={<ResearchPage locale={locale} />} path="research" />
        <Route element={<PublicationsPage locale={locale} />} path="publications" />
        <Route element={<NewsPage locale={locale} />} path="news" />
        <Route element={<Navigate replace to={`/${locale}`} />} path="*" />
      </Routes>
    </SiteLayout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Navigate replace to="/en" />} path="/" />
      <Route element={<LocaleRoutes />} path=":locale/*" />
      <Route element={<Navigate replace to="/en" />} path="*" />
    </Routes>
  );
}
