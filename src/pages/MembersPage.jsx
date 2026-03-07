import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MEMBERS_CONTENT } from '@/content/site-content';
import { loadMembers } from '@/lib/data';
import { pagePath } from '@/lib/i18n';

const DEFAULT_JUMP_NAV = {
  en: [
    { id: 'identity', label: 'Lab Identity' },
    { id: 'professor', label: 'Professor' },
    { id: 'current', label: 'Current Students' },
    { id: 'alumni', label: 'Alumni' }
  ],
  ko: [
    { id: 'identity', label: '연구실 정체성' },
    { id: 'professor', label: '교수' },
    { id: 'current', label: '현재 학생' },
    { id: 'alumni', label: '졸업생' }
  ]
};

const SUPPORTED_SECTION_IDS = new Set(['identity', 'professor', 'current', 'alumni']);
const PRIMARY_STUDENT_ROLES = new Set(['Graduate', 'Undergraduate']);

function MemberCard({ member, locale, prominent = false, showRoleBadge = false }) {
  const [broken, setBroken] = useState(false);
  const hasPhoto = Boolean(member.photo) && !broken;
  const period = locale === 'ko' ? `${member.startYear || '-'} ~ ${member.endYear || '현재'}` : `${member.startYear || '-'} - ${member.endYear || 'Present'}`;

  return (
    <article className={`rounded-lg border border-slate-200 bg-white ${prominent ? 'p-5 md:p-6' : 'p-4'}`}>
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
    return <p className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600 md:text-base">{content.loading}</p>;
  }
  if (error) {
    return <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 md:text-base">{error}</p>;
  }
  return <p className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600 md:text-base">{content.empty}</p>;
}

function Principles({ principles }) {
  if (!principles.length) {
    return null;
  }

  return (
    <div className="mt-5 grid gap-3 md:grid-cols-2">
      {principles.map((item) => (
        <article className="rounded-lg border border-slate-200 bg-slate-50/70 p-4" key={item.title}>
          <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 md:text-base">{item.body}</p>
        </article>
      ))}
    </div>
  );
}

export function MembersPage({ locale }) {
  const content = MEMBERS_CONTENT[locale] || MEMBERS_CONTENT.en;
  const [currentGroups, setCurrentGroups] = useState([]);
  const [alumniGroups, setAlumniGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('identity');

  useEffect(() => {
    let mounted = true;

    async function run() {
      setLoading(true);
      setError('');

      try {
        const [current, alumni] = await Promise.all([loadMembers(locale, 'current'), loadMembers(locale, 'alumni')]);
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

  const identityParagraphs = useMemo(() => {
    const seen = new Set();
    return [content.aboutBody, content.cultureBody]
      .map((value) => String(value || '').trim())
      .filter((value) => {
        if (!value || seen.has(value)) {
          return false;
        }
        seen.add(value);
        return true;
      });
  }, [content.aboutBody, content.cultureBody]);

  const professorMembers = useMemo(
    () => currentGroups.find((group) => group.role === 'PI')?.members || [],
    [currentGroups]
  );

  const currentStudentGroups = useMemo(
    () => currentGroups.filter((group) => group.role !== 'PI' && group.role !== 'Alumni'),
    [currentGroups]
  );

  const alumniMembers = useMemo(
    () =>
      alumniGroups
        .flatMap((group) => group.members)
        .sort((a, b) => {
          const endDelta = (b.endYear || 0) - (a.endYear || 0);
          if (endDelta !== 0) {
            return endDelta;
          }
          return (b.startYear || 0) - (a.startYear || 0);
        }),
    [alumniGroups]
  );

  return (
    <>
      <section className="px-1 pt-1">
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-950 md:text-5xl">{content.title || (locale === 'ko' ? '연구진' : 'Team')}</h1>
      </section>

      <Card>
        <CardContent className="px-4 py-3 md:px-6">
          <nav aria-label="Team section navigation" className="flex flex-wrap items-center gap-2">
            {jumpNav.map((item) => {
              const active = activeSection === item.id;
              return (
                <button
                  aria-pressed={active}
                  className={`inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors md:text-sm ${
                    active
                      ? 'border-[#0b3a64] bg-[#0b3a64] text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-[#0b3a64] hover:text-[#0b3a64]'
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
        </CardContent>
      </Card>

      {activeSection === 'identity' ? (
        <Card>
          <CardHeader>
            <CardTitle>{content.aboutTitle || (locale === 'ko' ? '연구실 정체성' : 'Lab Identity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(identityParagraphs.length ? identityParagraphs : [String(content.description || '').trim()]).filter(Boolean).map((text) => (
                <p className="max-w-4xl text-sm leading-relaxed text-slate-700 md:text-base" key={text}>
                  {text}
                </p>
              ))}
            </div>
            <Principles principles={culturePrinciples} />
            <div className="mt-5">
              <Link className="home-cta-primary" to={pagePath(locale, 'contact')}>
                {content.joinCta || (locale === 'ko' ? '문의하기' : 'Contact the Lab')}
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {activeSection === 'professor' ? (
        <Card>
          <CardHeader>
            <CardTitle>{content.professorTitle || (locale === 'ko' ? '교수' : 'Professor')}</CardTitle>
          </CardHeader>
          <CardContent>
            {professorMembers.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {professorMembers.map((member) => (
                  <MemberCard key={member.id} locale={locale} member={member} prominent />
                ))}
              </div>
            ) : (
              <SectionState content={content} error={error} loading={loading} />
            )}
          </CardContent>
        </Card>
      ) : null}

      {activeSection === 'current' ? (
        <Card>
          <CardHeader>
            <CardTitle>{content.currentStudentsTitle || (locale === 'ko' ? '현재 학생' : 'Current Students')}</CardTitle>
          </CardHeader>
          <CardContent>
            {currentStudentGroups.length > 0 ? (
              <div className="space-y-4">
                {currentStudentGroups.map((group) => (
                  <section className="rounded-lg border border-slate-200 bg-slate-50/60 p-4" key={group.role}>
                    <h3 className="text-lg font-semibold text-slate-900">{group.label}</h3>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {group.members.map((member) => (
                        <MemberCard
                          key={member.id}
                          locale={locale}
                          member={member}
                          showRoleBadge={!PRIMARY_STUDENT_ROLES.has(group.role)}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <SectionState content={content} error={error} loading={loading} />
            )}
          </CardContent>
        </Card>
      ) : null}

      {activeSection === 'alumni' ? (
        <Card>
          <CardHeader>
            <CardTitle>{content.alumniTitle || (locale === 'ko' ? '졸업생' : 'Alumni')}</CardTitle>
          </CardHeader>
          <CardContent>
            {alumniMembers.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {alumniMembers.map((member) => (
                  <MemberCard key={member.id} locale={locale} member={member} />
                ))}
              </div>
            ) : (
              <SectionState content={content} error={error} loading={loading} />
            )}
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
