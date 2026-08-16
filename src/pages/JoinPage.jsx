import { ExternalLinkIcon } from '@/components/site/ExternalLinkIcon';
import { PageHero } from '@/components/site/PageHero';
import { JOIN_CONTENT } from '@/content/site-content';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { formatItemNumber } from '@/lib/format';

function OpportunitySection({ body, children, title }) {
  return (
    <section className="grid gap-3 py-6 first:pt-5 last:pb-5 md:grid-cols-[220px_minmax(0,1fr)] md:gap-10 md:py-8 md:first:pt-7 md:last:pb-7 lg:gap-14">
      <h2 className="page-section-title">{title}</h2>
      <div className="space-y-4 md:space-y-5">
        <p className="home-body-copy max-w-[88ch] text-slate-700">{body}</p>
        {children}
      </div>
    </section>
  );
}

function parseRecruitmentStatus(value) {
  const [label, ...statusParts] = String(value || '').split('|');
  return { label: label.trim(), status: statusParts.join('|').trim() };
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

      <section className={`page-content-offset site-major-stack pb-6 md:pb-8 ${contentReveal.revealClassName}`} ref={contentReveal.ref} style={contentReveal.revealStyle}>
          {recruitmentStatuses.length ? (
            <section className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)] md:gap-10 lg:gap-14">
              <h2 className="page-section-title">{content.recruitmentStatusTitle || 'Current Openings'}</h2>
              <dl className="site-divide-soft site-rule-strong divide-y border-t">
                {recruitmentStatuses.map(({ label, status }) => {
                  const isOpen = status.toLowerCase() === 'open';

                  return (
                    <div className="flex items-center justify-between gap-5 py-4 first:pt-3 last:pb-3 md:py-[1.125rem] md:first:pt-[1.125rem] md:last:pb-[1.125rem]" key={label}>
                      <dt className="text-sm font-semibold leading-snug text-slate-900 md:text-base">{label}</dt>
                      <dd className={`inline-flex shrink-0 items-center gap-2 text-xs font-semibold ${isOpen ? 'text-[var(--brand-burgundy)]' : 'text-[var(--brand-navy)]'}`}>
                        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
                        {status}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </section>
          ) : null}

          <div className="site-divide-soft site-rule-strong divide-y border-t">
            <OpportunitySection body={content.graduateBody} title={content.graduateTitle || 'Graduate Programs'}>
              {graduateBenefits.length ? (
                <ul className="site-rule-strong grid border-t lg:grid-cols-3">
                  {graduateBenefits.map((benefit, index) => (
                    <li
                      className="site-rule-soft border-b py-4 last:border-b-0 lg:border-b-0 lg:border-r lg:px-5 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
                      key={benefit}
                    >
                      <span className="site-meta-index">{formatItemNumber(index + 1)}</span>
                      <p className="site-copy-body mt-2">{benefit}</p>
                    </li>
                  ))}
                </ul>
              ) : null}

              {content.admissionsUrl ? (
                <p className="home-body-copy text-slate-700">
                  <a className="site-text-link" href={content.admissionsUrl} rel="noreferrer" target="_blank">
                    {content.admissionsLabel || 'Graduate Admissions'}<ExternalLinkIcon />
                  </a>
                </p>
              ) : null}
            </OpportunitySection>

            <OpportunitySection body={content.undergraduateBody} title={content.undergraduateTitle || 'Undergraduate Research'} />

            <OpportunitySection body={content.postdocBody} title={content.postdocTitle || 'Postdoctoral Fellowships'} />
          </div>

          <section className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)] md:gap-10 lg:gap-14">
            <div className="space-y-4">
              <h2 className="page-section-title">{content.applicationTitle || 'How to Apply'}</h2>
              {content.applicationDescription ? <p className="home-body-copy text-slate-700">{content.applicationDescription}</p> : null}
            </div>

            <ol className="site-divide-soft site-rule-strong divide-y border-t">
              <li className="site-list-row grid grid-cols-[2.125rem_minmax(0,1fr)] gap-x-3 gap-y-3 md:grid-cols-[2.125rem_170px_minmax(0,1fr)] md:gap-x-5">
                <span className="site-meta-index pt-0.5">01</span>
                <h3 className="text-base font-semibold leading-snug text-slate-900 md:text-lg">{content.applicationMaterialsTitle || 'Application Materials'}</h3>
                <ul className="site-copy-body col-start-2 list-disc space-y-2 pl-5 marker:text-[var(--brand-burgundy)] md:col-start-3">
                  {applicationMaterials.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </li>

              <li className="site-list-row grid grid-cols-[2.125rem_minmax(0,1fr)] gap-x-3 gap-y-3 md:grid-cols-[2.125rem_170px_minmax(0,1fr)] md:gap-x-5">
                <span className="site-meta-index pt-0.5">02</span>
                <h3 className="text-base font-semibold leading-snug text-slate-900 md:text-lg">{content.desiredProgramsTitle || 'Program or Position'}</h3>
                <ul className="site-copy-body col-start-2 list-disc space-y-2 pl-5 marker:text-[var(--brand-burgundy)] md:col-start-3">
                  {desiredPrograms.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </li>

              {content.contactEmail ? (
                <li className="site-list-row grid grid-cols-[2.125rem_minmax(0,1fr)] gap-x-3 gap-y-3 md:grid-cols-[2.125rem_170px_minmax(0,1fr)] md:gap-x-5">
                  <span className="site-meta-index pt-0.5">03</span>
                  <h3 className="text-base font-semibold leading-snug text-slate-900 md:text-lg">{content.applicationCta || 'Submit by Email'}</h3>
                  <div className="col-start-2 md:col-start-3">
                    <a className="site-text-link inline-flex text-sm md:text-base" href={`mailto:${content.contactEmail}`}>
                      {content.contactEmail}
                    </a>
                  </div>
                </li>
              ) : null}
            </ol>
          </section>
      </section>
    </>
  );
}
