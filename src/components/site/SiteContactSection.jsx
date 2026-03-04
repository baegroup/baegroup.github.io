import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CONTACT_CONTENT } from '@/content/site-content';

export function SiteContactSection({ locale }) {
  const content = CONTACT_CONTENT[locale];
  const labels = content.labels;

  return (
    <section className="mx-auto mb-4 mt-4 w-full max-w-6xl px-5" id="site-contact">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{content.leftTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 text-sm md:text-base">
              <li className="rounded-md border border-border px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-[#1d4f7a]">{labels.email}</p>
                <a href="mailto:jbae@khu.ac.kr">jbae@khu.ac.kr</a>
              </li>
              <li className="rounded-md border border-border px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-[#1d4f7a]">{labels.phone}</p>
                <a href="tel:+82312012498">+82-31-201-2498</a>
              </li>
              <li className="rounded-md border border-border px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-[#1d4f7a]">{labels.fax}</p>
                +82-31-203-4589
              </li>
              <li className="rounded-md border border-border px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-[#1d4f7a]">{labels.office}</p>
                {content.office}
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{content.rightTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 text-sm md:text-base">
              <li className="rounded-md border border-border px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-[#1d4f7a]">{labels.address}</p>
                {content.address}
              </li>
              <li className="rounded-md border border-border px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-[#1d4f7a]">{labels.map}</p>
                <a
                  href="https://maps.google.com/?q=1732+Deogyeong-daero,+Giheung-gu,+Yongin-si,+Gyeonggi-do"
                  rel="noreferrer"
                  target="_blank"
                >
                  {content.map}
                </a>
              </li>
              <li className="rounded-md border border-border px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-[#1d4f7a]">{labels.apply}</p>
                {content.apply}
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
