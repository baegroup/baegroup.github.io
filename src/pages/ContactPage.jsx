import { Link } from 'react-router-dom';

import { PageHero } from '@/components/site/PageHero';
import { CONTACT_CONTENT } from '@/content/site-content';
import { pagePath } from '@/lib/i18n';

export function ContactPage({ locale }) {
  const content = CONTACT_CONTENT[locale];
  const labels = content.labels;
  const mapEmbedUrl = 'https://www.google.com/maps?q=1732+Deogyeong-daero,+Giheung-gu,+Yongin-si,+Gyeonggi-do&output=embed';

  const contactItems = [
    { key: 'email', label: labels.email, value: <a href="mailto:jbae@khu.ac.kr">jbae@khu.ac.kr</a> },
    { key: 'phone', label: labels.phone, value: <a href="tel:+82312012477">+82-31-201-2477</a> },
    { key: 'fax', label: labels.fax, value: '+82-31-204-8114' },
    { key: 'office', label: labels.office, value: content.office },
  ];

  return (
    <div className="space-y-5 md:space-y-6">
      <PageHero description={content.description} title={content.title} />

      <section className="rounded-xl border border-slate-200 bg-white px-5 py-6 shadow-soft md:px-7 md:py-7">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
          <div>
            <h2 className="home-section-title">{content.leftTitle}</h2>
            <dl className="mt-4 divide-y divide-slate-200 border-y border-slate-200">
              {contactItems.map((item) => (
                <div className="grid gap-1 py-3 sm:grid-cols-[120px_1fr] sm:items-start sm:gap-4 md:py-4" key={item.key}>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">{item.label}</dt>
                  <dd className="text-sm leading-relaxed text-slate-900 md:text-base">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <h2 className="home-section-title">{content.rightTitle}</h2>
            <div className="mt-4 border-y border-slate-200 py-3 md:py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">{labels.address}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-900 md:text-base">{content.address}</p>
            </div>
          </div>
        </div>

        <div className="mt-7 border-t border-slate-200 pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">{labels.map}</p>
          <div className="mt-2 overflow-hidden rounded-lg border border-slate-200">
            <iframe
              className="h-64 w-full md:h-72"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={mapEmbedUrl}
              title="Bae Lab location map"
            />
          </div>
        </div>

        <div className="mt-7 border-t border-slate-200 pt-5 md:pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="home-body-copy text-slate-700">
              Detailed graduate, undergraduate, and postdoctoral opportunities are listed on the Join Our Team page.
            </p>
            <Link className="home-cta-primary" to={pagePath(locale, 'join')}>Go to Join Our Team</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
