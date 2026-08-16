import { PageHero } from '@/components/site/PageHero';
import { CONTACT_CONTENT } from '@/content/site-content';

export function ContactPage({ locale }) {
  const content = CONTACT_CONTENT[locale];
  const labels = content.labels;
  const mapEmbedUrl = 'https://www.google.com/maps?q=1732+Deogyeong-daero,+Giheung-gu,+Yongin-si,+Gyeonggi-do&output=embed';

  const contactItems = [
    { key: 'email', label: labels.email, value: <a href="mailto:jbae@khu.ac.kr">jbae@khu.ac.kr</a> },
    { key: 'phone', label: labels.phone, value: <a href="tel:+82312012477">+82-31-201-2477</a> },
    { key: 'fax', label: labels.fax, value: '+82-31-204-8114' },
    { key: 'affiliation', label: labels.affiliation, value: content.affiliation },
    { key: 'address', label: labels.address, value: content.address },
  ];

  return (
    <div>
      <PageHero description={content.description} title={content.title} />

      <section className="page-content-offset pb-6 md:pb-8">
        <div className="grid gap-9 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.55fr)] lg:items-start lg:gap-12">
          <div>
            <h2 className="page-section-title">{content.leftTitle}</h2>
            <dl className="site-divide-soft site-rule-strong mt-4 divide-y border-t">
              {contactItems.map((item) => (
                <div className="grid gap-1 py-3 sm:grid-cols-[120px_1fr] sm:items-start sm:gap-4 md:py-4" key={item.key}>
                  <dt className="text-xs font-medium text-slate-600 md:text-[0.8125rem]">{item.label}</dt>
                  <dd className="text-sm leading-relaxed text-slate-900 md:text-base">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="overflow-hidden">
            <iframe
              className="h-72 w-full md:h-[23rem]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={mapEmbedUrl}
              title="Bae Lab location map"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
