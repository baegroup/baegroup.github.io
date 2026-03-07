import { PageHero } from '@/components/site/PageHero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CONTACT_CONTENT } from '@/content/site-content';

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
    <>
      <PageHero description={content.description} title={content.title} />

      <Card>
        <CardHeader>
          <CardTitle>{content.leftTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 sm:grid-cols-2">
            {contactItems.map((item) => (
              <li className="rounded-md border border-border bg-slate-50/70 px-4 py-3" key={item.key}>
                <p className="text-xs font-semibold text-slate-500">{item.label}</p>
                <div className="mt-0.5 text-slate-800">{item.value}</div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{content.rightTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 sm:grid-cols-2">
            {locationItems.map((item) => (
              <li className="rounded-md border border-border bg-slate-50/70 px-4 py-3" key={item.key}>
                <p className="text-xs font-semibold text-slate-500">{item.label}</p>
                <div className="mt-0.5 text-slate-800">{item.value}</div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{labels.apply}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700">{content.apply}</p>
        </CardContent>
      </Card>
    </>
  );
}
