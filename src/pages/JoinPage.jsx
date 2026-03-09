import { PageHero } from '@/components/site/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { JOIN_CONTENT } from '@/content/site-content';

function OpportunitySection({ body, children, title }) {
  return (
    <section className="space-y-4 border-t border-slate-200 pt-7 first:border-t-0 first:pt-0 md:space-y-5 md:pt-8">
      <h2 className="home-section-title">{title}</h2>
      <p className="home-body-copy max-w-5xl text-slate-700">{body}</p>
      {children}
    </section>
  );
}

export function JoinPage({ locale }) {
  const content = JOIN_CONTENT[locale] || JOIN_CONTENT.en;
  const graduateBenefits = content.graduateBenefits || [];

  return (
    <>
      <PageHero description={content.description} title={content.title} />

      <Card className="border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
        <CardContent className="space-y-8 p-6 md:space-y-9 md:p-8 lg:space-y-10 lg:p-10">
          <OpportunitySection body={content.graduateBody} title={content.graduateTitle || 'Graduate Opportunities'}>
            {content.admissionsUrl ? (
              <p className="home-body-copy text-slate-700">
                <a className="font-semibold text-[#7a0f1f] underline-offset-2 hover:underline" href={content.admissionsUrl} rel="noreferrer" target="_blank">
                  {content.admissionsLabel || 'Graduate Admissions Information'}
                </a>
              </p>
            ) : null}

            {graduateBenefits.length ? (
              <ul className="home-body-copy list-disc space-y-2 pl-6 text-slate-700 marker:text-[#7a0f1f]">
                {graduateBenefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            ) : null}
          </OpportunitySection>

          <OpportunitySection body={content.undergraduateBody} title={content.undergraduateTitle || 'Undergraduate Opportunities'} />

          <OpportunitySection body={content.postdocBody} title={content.postdocTitle || 'Postdoctoral Opportunities'} />
        </CardContent>
      </Card>
    </>
  );
}
