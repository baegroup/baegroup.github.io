import { PageHero } from '@/components/site/PageHero';
import { JOIN_CONTENT } from '@/content/site-content';
import { useScrollReveal } from '@/hooks/useScrollReveal';

function OpportunitySection({ body, children, title }) {
  return (
    <section className="space-y-4 md:space-y-5">
      <h2 className="page-section-title">{title}</h2>
      <p className="home-body-copy max-w-[88ch] text-slate-700">{body}</p>
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
    <div>
      <h3 className="text-base font-semibold text-slate-900 md:text-lg">{title}</h3>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700 marker:text-[var(--brand-burgundy)] md:text-base">
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

      <section className={`space-y-12 py-4 md:space-y-14 md:py-5 lg:space-y-16 ${contentReveal.revealClassName}`} ref={contentReveal.ref} style={contentReveal.revealStyle}>
          {recruitmentStatuses.length ? (
            <section>
              <h2 className="page-section-title">{content.recruitmentStatusTitle || 'Current Recruitment Status'}</h2>
              <dl className="mt-6 grid gap-x-10 gap-y-5 md:grid-cols-3">
                {recruitmentStatuses.map(({ label, status }) => {
                  const isOpen = status.toLowerCase() === 'open';

                  return (
                    <div className="flex items-center justify-between gap-5 md:block" key={label}>
                      <dt className="text-sm font-semibold leading-snug text-slate-900">{label}</dt>
                      <dd className={`inline-flex shrink-0 items-center gap-2 text-xs font-semibold md:mt-3 ${isOpen ? 'text-emerald-800' : 'text-amber-900'}`}>
                        <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${isOpen ? 'bg-emerald-600' : 'bg-amber-600'}`} />
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
                <a className="site-text-link" href={content.admissionsUrl} rel="noreferrer" target="_blank">
                  {content.admissionsLabel || 'Graduate Admissions Information'}
                </a>
              </p>
            ) : null}

            {graduateBenefits.length ? (
              <ul className="home-body-copy max-w-[88ch] list-disc space-y-2 pl-6 text-slate-700 marker:text-[var(--brand-burgundy)]">
                {graduateBenefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            ) : null}
          </OpportunitySection>

          <OpportunitySection body={content.undergraduateBody} title={content.undergraduateTitle || 'Undergraduate Opportunities'} />

          <OpportunitySection body={content.postdocBody} title={content.postdocTitle || 'Postdoctoral Opportunities'} />

          <section className="space-y-6">
            <div>
              <h2 className="page-section-title">{content.applicationTitle || 'How to Apply'}</h2>
              <p className="home-body-copy mt-4 max-w-[88ch] text-slate-700">{content.applicationDescription}</p>
            </div>

            <div className="grid gap-x-14 gap-y-8 md:grid-cols-2">
              <DetailList items={applicationMaterials} title={content.applicationMaterialsTitle || 'Application Materials'} />
              <DetailList items={desiredPrograms} title={content.desiredProgramsTitle || 'Desired Position or Program'} />
            </div>

            {content.contactEmail ? (
              <a className="site-action-link" href={`mailto:${content.contactEmail}`}>
                {content.applicationCta || 'Apply by Email'}
              </a>
            ) : null}
          </section>
      </section>
    </>
  );
}
