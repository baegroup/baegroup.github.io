import { PageHero } from '@/components/site/PageHero';

const GOOGLE_PRIVACY_URL = 'https://policies.google.com/privacy';

export function PrivacyPage() {
  return (
    <div className="space-y-6 md:space-y-8">
      <PageHero title="Privacy & Analytics" />

      <div className="max-w-4xl divide-y divide-slate-200 border-y border-slate-200">
        <section className="py-5 md:py-6">
          <h2 className="page-section-title">Information We Measure</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700 md:text-base">
            With your consent, this website uses Google Analytics to understand aggregate usage patterns,
            including approximate country, traffic source, pages viewed, engagement, and
            selected interactions with recruitment, contact, publication, and research-profile links. We do
            not use advertising or personalization features.
          </p>
        </section>

        <section className="py-5 md:py-6">
          <h2 className="page-section-title">Consent and Control</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700 md:text-base">
            Analytics storage is denied by default. Google Analytics loads only after you allow Analytics
            in the cookie notice. You may change or withdraw your choice at any time through Cookie Settings
            in the footer.
          </p>
        </section>

        <section className="py-5 md:py-6">
          <h2 className="page-section-title">Data Management</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700 md:text-base">
            Analytics reports are used only to maintain and improve the laboratory website. Access is limited
            to website administrators, and event-level analytics data is retained for no longer than 14 months.
            Learn more in the{' '}
            <a className="site-text-link" href={GOOGLE_PRIVACY_URL} rel="noreferrer" target="_blank">
              Google Privacy Policy
            </a>.
          </p>
        </section>

        <section className="py-5 md:py-6">
          <h2 className="page-section-title">Contact</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700 md:text-base">
            Questions about website analytics or privacy may be sent to{' '}
            <a className="site-text-link" href="mailto:jbae@khu.ac.kr">jbae@khu.ac.kr</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
