import { Link } from 'react-router-dom';

import { CONTACT_CONTENT } from '@/content/site-content';
import { pagePath } from '@/lib/i18n';

export function SiteContactSection({ locale }) {
  const content = CONTACT_CONTENT[locale];
  const labels = content.labels;
  const isKorean = locale === 'ko';

  return (
    <section className="mx-auto mb-4 mt-4 w-full max-w-6xl px-5" id="site-contact">
      <div className="rounded-lg border border-border bg-white/95 px-5 py-5 shadow-soft md:px-7 md:py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Bae Lab</h2>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              <li>
                <span className="font-semibold text-slate-500">{labels.email}</span>{' '}
                <a href="mailto:jbae@khu.ac.kr">jbae@khu.ac.kr</a>
              </li>
              <li>
                <span className="font-semibold text-slate-500">{labels.address}</span>{' '}
                {content.address}
              </li>
            </ul>
          </div>
          <Link
            className="inline-flex items-center justify-center rounded-md border border-border bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 no-underline transition-colors hover:bg-slate-100"
            to={pagePath(locale, 'contact')}
          >
            {isKorean ? '자세한 연락처 보기' : 'View full contact details'}
          </Link>
        </div>
      </div>
    </section>
  );
}
