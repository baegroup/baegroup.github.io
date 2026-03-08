import { Link } from 'react-router-dom';

import { PageHero } from '@/components/site/PageHero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CONTACT_CONTENT } from '@/content/site-content';
import { pagePath } from '@/lib/i18n';

export function ContactPage({ locale }) {
  const content = CONTACT_CONTENT[locale];
  const labels = content.labels;

  const contactItems = [
    { key: 'email', label: labels.email, value: <a href="mailto:jbae@khu.ac.kr">jbae@khu.ac.kr</a> },
    { key: 'phone', label: labels.phone, value: <a href="tel:+82312012477">+82-31-201-2477</a> },
    { key: 'fax', label: labels.fax, value: '+82-31-204-8114' },
    { key: 'office', label: labels.office, value: content.office },
  ];

  const locationItems = [
    { key: 'address', label: labels.address, value: content.address },
    {
      key: 'map',
      label: labels.map,
      value: (
        <a
          href="https://maps.google.com/?q=1732+Deogyeong-daero,+Giheung-gu,+Yongin-si,+Gyeonggi-do"
          rel="noreferrer"
          target="_blank"
        >
          {content.map}
        </a>
      ),
    },
  ];

  return (
    <div className="space-y-5 md:space-y-6">
      <PageHero description={content.description} title={content.title} />

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">{content.leftTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {contactItems.map((item) => (
                <li className="rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3" key={item.key}>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{item.label}</p>
                  <div className="mt-1 text-sm leading-relaxed text-slate-800 md:text-base">{item.value}</div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">{content.rightTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {locationItems.map((item) => (
                <li className="rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3" key={item.key}>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{item.label}</p>
                  <div className="mt-1 text-sm leading-relaxed text-slate-800 md:text-base">{item.value}</div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <Card className="border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f6f9fd_100%)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">Interested in Joining Bae Lab?</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm leading-relaxed text-slate-700 md:text-base">
            Detailed graduate, undergraduate, and postdoctoral opportunities are listed on the Join Our Team page.
          </p>
          <Link className="home-cta-primary" to={pagePath(locale, 'join')}>Go to Join Our Team</Link>
        </CardContent>
      </Card>
    </div>
  );
}
