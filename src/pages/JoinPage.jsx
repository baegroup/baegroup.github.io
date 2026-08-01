import { PageHero } from '@/components/site/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { JOIN_CONTENT } from '@/content/site-content';
import { useScrollReveal } from '@/hooks/useScrollReveal';

function OpportunitySection({ body, children, title }) {
  return (
    <section className="space-y-4 border-t border-slate-200 pt-7 first:border-t-0 first:pt-0 md:space-y-5 md:pt-8">
      <h2 className="home-section-title">{title}</h2>
      <p className="home-body-copy max-w-[72ch] text-slate-700">{body}</p>
      {children}
    </section>
  );
}

function parseRecruitmentStatus(value) {
  const [label, ...statusParts] = String(value || '').split('|');
  return { label: label.trim(), status: statusParts.join('|').trim() };
}

function DetailList({ items, title }) {
  if (!items.length) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 md:p-6">
      <h3 className="text-base font-semibold text-slate-900 md:text-lg">{title}</h3>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700 marker:text-[#7a0f1f] md:text-base">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}

export function JoinPage({ locale }) {
  const content = JOIN_CONTENT[locale] || JOIN_CONTENT.en;
  const graduateBenefits = content.graduateBenefits || [];
  const recruitmentStatuses = (content.recruitmentStatuses || []).map(parseRecruitmentStatus);
  const applicationMaterials = content.applicationMaterials || [];
  const desiredPrograms = content.desiredPrograms || [];
  const contentReveal = useScrollReveal(50);

  return (
    <>
      <PageHero description={content.description} title={content.title} />

      <Card className={`border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] ${contentReveal.revealClassName}`} ref={contentReveal.ref} style={contentReveal.revealStyle}>
        <CardContent className="space-y-8 p-6 md:space-y-9 md:p-8 lg:space-y-10 lg:p-10">
          {recruitmentStatuses.length ? (
            <section>
              <h2 className="home-section-title">{content.recruitmentStatusTitle || 'Current Recruitment Status'}</h2>
              <dl className="mt-5 grid gap-3 md:grid-cols-3">
                {recruitmentStatuses.map(({ label, status }) => {
                  const isOpen = status.toLowerCase() === 'open';

                  return (
                    <div className="rounded-lg border border-slate-200 bg-white p-4 md:p-5" key={label}>
                      <dt className="text-sm font-semibold leading-snug text-slate-900">{label}</dt>
                      <dd className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                        {status}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </section>
          ) : null}

          <OpportunitySection body={content.graduateBody} title={content.graduateTitle || 'Graduate Opportunities'}>
            {content.admissionsUrl ? (
              <p className="home-body-copy text-slate-700">
                <a className="font-semibold text-[#7a0f1f] underline-offset-2 hover:underline" href={content.admissionsUrl} rel="noreferrer" target="_blank">
                  {content.admissionsLabel || 'Graduate Admissions Information'}
                </a>
              </p>
            ) : null}

            {graduateBenefits.length ? (
              <ul className="home-body-copy max-w-[72ch] list-disc space-y-2 pl-6 text-slate-700 marker:text-[#7a0f1f]">
                {graduateBenefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            ) : null}
          </OpportunitySection>

          <OpportunitySection body={content.undergraduateBody} title={content.undergraduateTitle || 'Undergraduate Opportunities'} />

          <OpportunitySection body={content.postdocBody} title={content.postdocTitle || 'Postdoctoral Opportunities'} />

          <section className="space-y-5 border-t border-slate-200 pt-7 md:pt-8">
            <div>
              <h2 className="home-section-title">{content.applicationTitle || 'How to Apply'}</h2>
              <p className="home-body-copy mt-4 max-w-[72ch] text-slate-700">{content.applicationDescription}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <DetailList items={applicationMaterials} title={content.applicationMaterialsTitle || 'Application Materials'} />
              <DetailList items={desiredPrograms} title={content.desiredProgramsTitle || 'Desired Position or Program'} />
            </div>

            {content.contactEmail ? (
              <a className="home-cta-primary inline-flex" href={`mailto:${content.contactEmail}`}>
                {content.applicationCta || 'Apply by Email'}
              </a>
            ) : null}
          </section>
        </CardContent>
      </Card>
    </>
  );
}
