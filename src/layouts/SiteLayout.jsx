import { CookieConsent } from '@/components/site/CookieConsent';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';

export function SiteLayout({ locale, children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_12%_-8%,rgba(11,58,100,0.09),transparent_40%),radial-gradient(circle_at_88%_0%,rgba(15,23,42,0.06),transparent_30%),linear-gradient(to_bottom,#f8fafc,#f8fafc)]">
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        href="#main-content"
      >
        Skip to content
      </a>
      <SiteHeader locale={locale} />
      <main className="mx-auto w-full max-w-6xl space-y-4 px-5 py-6 md:py-8" id="main-content">{children}</main>
      <SiteFooter locale={locale} />
      <CookieConsent />
    </div>
  );
}
