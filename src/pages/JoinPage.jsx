import { PageHero } from '@/components/site/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { JOIN_CONTENT } from '@/content/site-content';

function OpportunitySection({ body, children, title }) {
  return (
    <section className="space-y-3 border-t border-slate-200 pt-6 first:border-t-0 first:pt-0">
      <h2 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">{title}</h2>
      <p className="text-base leading-relaxed text-slate-700 md:text-lg">{body}</p>
      {children}
    </section>
  );
}

export function JoinPage({ locale }) {
  const content = JOIN_CONTENT[locale] || JOIN_CONTENT.en;
  const graduateBenefits = content.graduateBenefits || [];
  const email = content.contactEmail || 'jbae@khu.ac.kr';

  return (
    <>
      <PageHero description={content.description} title={content.title} />

      <Card>
        <CardContent className="space-y-7 p-5 md:p-7 lg:p-8">
          <OpportunitySection body={content.graduateBody} title={content.graduateTitle || 'Graduate Opportunities'}>
            {content.admissionsUrl ? (
              <p className="text-base text-slate-700 md:text-lg">
                <a className="font-semibold text-[#7a0f1f] underline-offset-2 hover:underline" href={content.admissionsUrl} rel="noreferrer" target="_blank">
                  {content.admissionsLabel || 'Graduate Admissions Information'}
                </a>
              </p>
            ) : null}

            {graduateBenefits.length ? (
              <ul className="list-disc space-y-1.5 pl-6 text-base leading-relaxed text-slate-700 md:text-lg">
                {graduateBenefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            ) : null}
          </OpportunitySection>

          <OpportunitySection body={content.undergraduateBody} title={content.undergraduateTitle || 'Undergraduate Opportunities'} />

          <OpportunitySection body={content.postdocBody} title={content.postdocTitle || 'Postdoctoral Opportunities'} />

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 md:text-base">
            Contact: <a className="font-semibold text-[#0d326f] underline-offset-2 hover:underline" href={`mailto:${email}`}>{email}</a>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
