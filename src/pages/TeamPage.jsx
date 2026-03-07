import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { TEAM_CONTENT } from '@/content/site-content';
import { loadTeamProfiles } from '@/lib/data';
import { pagePath } from '@/lib/i18n';

const DEFAULT_JUMP_NAV = {
  en: [
    { id: 'identity', label: 'About & Culture' },
    { id: 'professor', label: 'Professor' },
    { id: 'current', label: 'Current Students' },
    { id: 'alumni', label: 'Alumni' }
  ],
  ko: [
    { id: 'identity', label: '소개 · 문화' },
    { id: 'professor', label: '교수' },
    { id: 'current', label: '현재 학생' },
    { id: 'alumni', label: '졸업생' }
  ]
};

const SUPPORTED_SECTION_IDS = new Set(['identity', 'professor', 'current', 'alumni']);
const PRIMARY_STUDENT_ROLES = new Set(['Graduate', 'Undergraduate']);
const FEARLESS_IMAGE_PATH = 'assets/img/team/culture/fearless-organization.png';

function MemberCard({ member, locale, prominent = false, showRoleBadge = false }) {
  const [broken, setBroken] = useState(false);
  const hasPhoto = Boolean(member.photo) && !broken;
  const period = locale === 'ko' ? `${member.startYear || '-'} ~ ${member.endYear || '현재'}` : `${member.startYear || '-'} - ${member.endYear || 'Present'}`;

  return (
    <article className={`rounded-lg border border-slate-200 ${prominent ? 'bg-white p-5 md:p-6' : 'bg-slate-50/60 p-4'}`}>
      <div className={`grid gap-4 ${prominent ? 'md:grid-cols-[96px_1fr]' : 'grid-cols-[64px_1fr]'}`}>
        <div className={`overflow-hidden rounded-md border border-slate-200 bg-slate-50 ${prominent ? 'h-24 w-24' : 'h-16 w-16'}`}>
          {hasPhoto ? (
            <img
              alt={member.localizedName}
              className="h-full w-full object-cover"
              onError={() => setBroken(true)}
              src={`${import.meta.env.BASE_URL}${member.photo}`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm font-bold text-slate-700">{member.initials}</div>
          )}
        </div>

        <div>
          <p className={prominent ? 'text-xl font-semibold text-slate-950' : 'font-semibold text-slate-950'}>{member.localizedName}</p>
          <p className="mt-0.5 text-sm text-slate-600 md:text-base">{member.programLabel || member.roleLabel}</p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge variant="outline">{period}</Badge>
            {showRoleBadge ? <Badge variant="outline">{member.roleLabel}</Badge> : null}
            {member.localizedInterests.map((item) => (
              <Badge className="border-slate-200 bg-slate-50 text-slate-700" key={item} variant="outline">
                {item}
              </Badge>
            ))}
          </div>

          <div className="mt-2 flex flex-wrap gap-3 text-xs font-medium text-[#0b3a64]">
            {member.email ? <a href={`mailto:${member.email}`}>{locale === 'ko' ? '이메일' : 'Email'}</a> : null}
            {member.website ? (
              <a href={member.website} rel="noreferrer" target="_blank">
                {locale === 'ko' ? '홈페이지' : 'Website'}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function SectionState({ content, loading, error }) {
  if (loading) {
    return <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 md:text-base">{content.loading}</p>;
  }
  if (error) {
    return <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 md:text-base">{error}</p>;
  }
  return <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 md:text-base">{content.empty}</p>;
}

function Principles({ principles }) {
  if (!principles.length) {
    return null;
  }

  return (
    <div className="divide-y divide-slate-200 border-t border-slate-200">
      {principles.map((item) => (
        <article className="py-5" key={item.title}>
          <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 md:text-base">{item.body}</p>
        </article>
      ))}
    </div>
  );
}

export function TeamPage({ locale }) {
  const content = TEAM_CONTENT[locale] || TEAM_CONTENT.en;
  const [currentGroups, setCurrentGroups] = useState([]);
  const [alumniGroups, setAlumniGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('identity');
  const [cultureImageBroken, setCultureImageBroken] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function run() {
      setLoading(true);
      setError('');

      try {
        const [current, alumni] = await Promise.all([loadTeamProfiles(locale, 'current'), loadTeamProfiles(locale, 'alumni')]);
        if (!mounted) {
          return;
        }
        setCurrentGroups(current);
        setAlumniGroups(alumni);
      } catch (err) {
        if (!mounted) {
          return;
        }
        setError(err.message || 'Failed to load team profiles');
        setCurrentGroups([]);
        setAlumniGroups([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    run();

    return () => {
      mounted = false;
    };
  }, [locale]);

  const jumpNav = useMemo(() => {
    const fallback = DEFAULT_JUMP_NAV[locale] || DEFAULT_JUMP_NAV.en;
    const fromContent = Array.isArray(content.jumpNav)
      ? content.jumpNav.filter((item) => item?.id && item?.label && SUPPORTED_SECTION_IDS.has(item.id))
      : [];

    return fromContent.length ? fromContent : fallback;
  }, [content.jumpNav, locale]);

  useEffect(() => {
    if (!jumpNav.some((item) => item.id === activeSection)) {
      setActiveSection(jumpNav[0]?.id || 'identity');
    }
  }, [activeSection, jumpNav]);

  const culturePrinciples = useMemo(() => {
    if (Array.isArray(content.culturePrinciples)) {
      return content.culturePrinciples.filter((item) => item?.title && item?.body);
    }
    return [];
  }, [content.culturePrinciples]);

  const professorMembers = useMemo(
    () => currentGroups.find((group) => group.role === 'PI')?.members || [],
    [currentGroups]
  );

  const currentStudentGroups = useMemo(
    () =>
      currentGroups
        .filter((group) => group.role !== 'PI' && group.role !== 'Alumni')
        .map((group) => ({
          ...group,
          members: [...group.members].sort((a, b) => {
            const startA = Number.isFinite(a.startYear) ? a.startYear : Number.MAX_SAFE_INTEGER;
            const startB = Number.isFinite(b.startYear) ? b.startYear : Number.MAX_SAFE_INTEGER;
            if (startA !== startB) {
              return startA - startB;
            }

            const endA = Number.isFinite(a.endYear) ? a.endYear : Number.MAX_SAFE_INTEGER;
            const endB = Number.isFinite(b.endYear) ? b.endYear : Number.MAX_SAFE_INTEGER;
            if (endA !== endB) {
              return endA - endB;
            }

            return String(a.localizedName || '').localeCompare(String(b.localizedName || ''));
          })
        })),
    [currentGroups]
  );

  const alumniMembers = useMemo(
    () =>
      alumniGroups
        .flatMap((group) => group.members)
        .sort((a, b) => {
          const endA = Number.isFinite(a.endYear) ? a.endYear : -1;
          const endB = Number.isFinite(b.endYear) ? b.endYear : -1;
          if (endA !== endB) {
            return endB - endA;
          }

          const startA = Number.isFinite(a.startYear) ? a.startYear : -1;
          const startB = Number.isFinite(b.startYear) ? b.startYear : -1;
          if (startA !== startB) {
            return startB - startA;
          }

          return String(a.localizedName || '').localeCompare(String(b.localizedName || ''));
        }),
    [alumniGroups]
  );

  return (
    <>
      <section className="px-1 pt-1">
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-950 md:text-5xl">{content.title || 'Team'}</h1>
      </section>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="border-b border-slate-200 px-4 pt-3 md:px-6 md:pt-4">
            <nav aria-label="Team section navigation" className="flex flex-wrap gap-x-6 gap-y-2">
              {jumpNav.map((item) => {
                const active = activeSection === item.id;
                return (
                  <button
                    aria-pressed={active}
                    className={`-mb-px border-b-2 bg-transparent pb-2 text-sm font-semibold transition-colors md:text-[0.95rem] ${
                      active ? 'border-[#0b3a64] text-[#0b3a64]' : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    type="button"
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="px-4 py-6 md:px-6 md:py-7">
            {activeSection === 'identity' ? (
              <section className="space-y-8">
                <section className="space-y-3">
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">About our team</h2>
                  <p className="max-w-4xl text-sm leading-relaxed text-slate-700 md:text-base">{content.aboutBody || content.description}</p>
                  <div className="pt-1">
                    <Link className="home-cta-primary" to={pagePath('join')}>
                      {content.joinCta || 'Information for joining our team'}
                    </Link>
                  </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:items-start">
                  <div className="space-y-3">
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">{content.cultureTitle || 'Lab Culture | The Fearless Lab'}</h2>
                    <p className="text-sm leading-relaxed text-slate-700 md:text-base">{content.cultureBody || ''}</p>
                  </div>

                  <figure className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                    {!cultureImageBroken ? (
                      <img
                        alt="The Fearless Organization matrix"
                        className="h-auto w-full object-contain"
                        onError={() => setCultureImageBroken(true)}
                        src={`${import.meta.env.BASE_URL}${FEARLESS_IMAGE_PATH}`}
                      />
                    ) : (
                      <div className="flex min-h-52 items-center justify-center px-4 text-center text-sm text-slate-500">
                        Fearless organization image placeholder
                      </div>
                    )}
                    <figcaption className="px-4 py-3 text-xs italic text-slate-500">
                      From "The fearless organization" by Amy Edmondson
                    </figcaption>
                  </figure>
                </section>

                <Principles principles={culturePrinciples} />
              </section>
            ) : null}

            {activeSection === 'professor' ? (
              <section>
                <h2 className="sr-only">{content.professorTitle || 'Professor'}</h2>
                {professorMembers.length > 0 ? (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {professorMembers.map((member) => (
                      <MemberCard key={member.id} locale={locale} member={member} prominent />
                    ))}
                  </div>
                ) : (
                  <SectionState content={content} error={error} loading={loading} />
                )}
              </section>
            ) : null}

            {activeSection === 'current' ? (
              <section>
                <h2 className="sr-only">{content.currentStudentsTitle || 'Current Students'}</h2>
                {currentStudentGroups.length > 0 ? (
                  <div className="space-y-6">
                    {currentStudentGroups.map((group, index) => (
                      <section className="space-y-3" key={group.role}>
                        <h3 className="text-lg font-semibold text-slate-900">{group.label}</h3>
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          {group.members.map((member) => (
                            <MemberCard
                              key={member.id}
                              locale={locale}
                              member={member}
                              showRoleBadge={!PRIMARY_STUDENT_ROLES.has(group.role)}
                            />
                          ))}
                        </div>
                        {index < currentStudentGroups.length - 1 ? <div className="h-px bg-slate-200" /> : null}
                      </section>
                    ))}
                  </div>
                ) : (
                  <SectionState content={content} error={error} loading={loading} />
                )}
              </section>
            ) : null}

            {activeSection === 'alumni' ? (
              <section>
                <h2 className="sr-only">{content.alumniTitle || 'Alumni'}</h2>
                {alumniMembers.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {alumniMembers.map((member) => (
                      <MemberCard key={member.id} locale={locale} member={member} />
                    ))}
                  </div>
                ) : (
                  <SectionState content={content} error={error} loading={loading} />
                )}
              </section>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
