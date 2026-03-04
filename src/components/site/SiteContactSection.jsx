import { CONTACT_CONTENT } from '@/content/site-content';

export function SiteContactSection({ locale }) {
  const content = CONTACT_CONTENT[locale];
  const labels = content.labels;

  const leftItems = [
    { key: 'email', label: labels.email, value: <a href="mailto:jbae@khu.ac.kr">jbae@khu.ac.kr</a> },
    { key: 'phone', label: labels.phone, value: <a href="tel:+82312012498">+82-31-201-2498</a> },
    { key: 'fax', label: labels.fax, value: '+82-31-203-4589' },
    { key: 'office', label: labels.office, value: content.office }
  ];

  const rightItems = [
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
      )
    },
    { key: 'apply', label: labels.apply, value: content.apply }
  ];

  return (
    <section className="mx-auto mb-4 mt-4 w-full max-w-6xl px-5" id="site-contact">
      <div className="rounded-lg border border-border bg-white/95 px-5 py-5 shadow-soft md:px-7 md:py-6">
        <div className="mb-5 border-b border-border pb-4">
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-slate-950">Bae Lab</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2.5">
            <p className="text-sm font-semibold text-slate-800">{content.leftTitle}</p>
            <ul className="grid gap-2.5 text-sm md:text-base">
              {leftItems.map((item) => (
                <li className="rounded-md border border-border bg-slate-50/70 px-4 py-3" key={item.key}>
                  <p className="text-xs font-semibold text-slate-500">{item.label}</p>
                  <div className="mt-0.5 text-slate-800">{item.value}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2.5">
            <p className="text-sm font-semibold text-slate-800">{content.rightTitle}</p>
            <ul className="grid gap-2.5 text-sm md:text-base">
              {rightItems.map((item) => (
                <li className="rounded-md border border-border bg-slate-50/70 px-4 py-3" key={item.key}>
                  <p className="text-xs font-semibold text-slate-500">{item.label}</p>
                  <div className="mt-0.5 text-slate-800">{item.value}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
