import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { PageHero } from '@/components/site/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { TEAM_CONTENT } from '@/content/site-content';
import { loadTeamProfiles } from '@/lib/data';
import { pagePath } from '@/lib/i18n';

const DEFAULT_JUMP_NAV = {
  en: [
    { id: 'identity', label: 'Lab Identity' },
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
const TERM_SORT_ORDER = { spring: 0, summer: 1, fall: 2, winter: 3 };
const GRAD_PROGRAM_ORDER = { MSPhD: 0, PhD: 1, MS: 2 };
const IMAGE_EXTENSIONS = ['webp', 'png', 'jpg', 'jpeg'];
const LAB_GROUP_IMAGE_BASE = 'assets/img/team/group/group-photo';
const FEARLESS_IMAGE_BASE = 'assets/img/team/culture/fearless-organization';
const IDENTITY_COPY = {
  en: {
    aboutHeading: 'About our team'
  },
  ko: {
    aboutHeading: 'Team Overview'
  }
};
const MEMBER_FIELD_LABELS = {
  en: {
    course: 'Course',
    joining: 'Year in joining group',
    undergraduateSchool: 'Undergraduate school',
    undergraduateMajor: 'Undergraduate major',
    masterSchool: 'Master degree school',
    masterMajor: 'Master degree major',
    research: 'Research interests',
    korean: 'Korean proficiency',
    current: 'Current',
    note: 'Note',
    email: 'E-mail'
  },
  ko: {
    course: 'Course',
    joining: 'Year in joining group',
    undergraduateSchool: 'Undergraduate school',
    undergraduateMajor: 'Undergraduate major',
    masterSchool: 'Master degree school',
    masterMajor: 'Master degree major',
    research: 'Research interests',
    korean: 'Korean proficiency',
    current: 'Current',
    note: 'Note',
    email: 'E-mail'
  }
};
const PROFESSOR_COPY = {
  en: {
    sectionLead: 'Principal Investigator',
    profileTitle: 'Principal Investigator',
    department: 'Chemical Engineering',
    affiliation: 'Department of Chemical Engineering, Kyung Hee University',
    educationTitle: 'Education',
    appointmentsTitle: 'Academic Appointments',
    honorsTitle: 'Honors & Award',
    publicationsTitle: 'Selected Publications'
  },
  ko: {
    sectionLead: 'Principal Investigator',
    profileTitle: 'Principal Investigator',
    department: 'Chemical Engineering',
    affiliation: 'Department of Chemical Engineering, Kyung Hee University',
    educationTitle: 'Education',
    appointmentsTitle: 'Academic Appointments',
    honorsTitle: 'Honors & Award',
    publicationsTitle: 'Selected Publications'
  }
};
const PROFESSOR_PROFILE_DETAILS = {
  'bae-jaehyeong': {
    phone: '+82-31-201-2477',
    fax: '+82-31-204-8114',
    education: [
      { year: '2020', text: 'Ph.D. in Materials Science and Engineering, KAIST, Korea' },
      { year: '2016', text: 'M.S. in Chemical and Biomolecular Engineering, KAIST, Korea' },
      { year: '2013', text: 'B.S. in Chemical Engineering, Tsinghua University, China' }
    ],
    appointments: [
      { year: '2023.03-Present', text: 'Assistant Professor, Dept. of Chemical Engineering, Kyung Hee University' },
      { year: '2022.04-2022.10', text: 'Postdoctoral Fellow, Harvard University (Prof. Jennifer A. Lewis)' },
      { year: '2021.06-2022.11', text: 'Postdoctoral Fellow, Harvard University (Prof. Jennifer A. Lewis)' },
      { year: '2020.09-2023.02', text: 'Postdoctoral Fellow, KAIST (Prof. Il-Doo Kim)' },
      { year: '2018.03-2018.06', text: 'Visiting Scholar, University of California, Irvine (Prof. Reginald M. Penner)' }
    ],
    honors: [
      { year: '2021.03', text: 'Sejong Science Fellowship, National Research Foundation of Korea (NRF)' },
      { year: '2021.02', text: 'Best PhD Dissertation Award, KAIST' },
      { year: '2020.09', text: 'Research Fellowship of BK21 Plus Program' },
      { year: '2019.12', text: 'Best Poster Award, International Conference on Advanced Electromaterials (ICAE) 2019' },
      { year: '2017.12', text: 'Best Poster Award, ICAE 2017' },
      { year: '2016-2020', text: 'KAIST Scholarship, KAIST' },
      { year: '2014-2016', text: 'Korean Government Scholarship, KAIST' },
      { year: '2011', text: 'Academic Excellence Award, Tsinghua University' },
      { year: '2010-2013', text: 'Beijing Government International Student Full Scholarship, Tsinghua University' }
    ],
    publications: [
      {
        authors: 'Jaehyeong Bae, Haeseong Lim, Jaewan Ahn, Youn Hwa Kim, Min Soo Kim, and Il-Doo Kim',
        title: 'Photoenergy harvesting by photoacid solution',
        journalName: 'Advanced Materials',
        details: '2201734, 2022. Featured as Journal Inside Front Cover.'
      },
      {
        authors:
          'Jaehyeong Bae, Keonwoo Choi, Hyunsun Song, Do Heung Kim, Doo Young Youn, Su-Ho Cho, Dogyeong Jeon, Jiyoung Lee, Junyoung Lee, wontae Jang, Changhyeon Lee, Youson Kim, Chanhoon Kim, Ji-Won Jung, Sung Gap Im, and Il-Doo Kim',
        title: 'Reinforcing Native Solid-Electrolyte Interphase Layer via Electrolyte-Swellable Soft-Scaffold for Lithium Metal Anode',
        journalName: 'Advanced Energy Materials',
        details: '2203818, 2023.'
      },
      {
        authors: 'Dong-Ha Kim, Jaehyeong Bae, Jiyoung Lee, Jaewan Ahn, Won-Tae Hwang, Jaehyun Ko, and Il-Doo Kim',
        title: 'Porous Nanofiber Membrane: Rational Design for Highly Sensitive Thermochromic Sensor',
        journalName: 'Advanced Functional Materials',
        details: '2200463, 2022. Featured as Journal Front Cover.'
      },
      {
        authors: 'Jaehyeong Bae, Min Soo Kim, Taegon Oh, Bong Lim Suh, Tae Gwang Yun, Seungjun Lee, Kahyun Hur, Yury Gogotsi, Chong Min Koo, and Il-Doo Kim',
        title: 'Towards Watt-scale hydroelectric energy harvesting by Ti3C2Tx-based transpiration-driven electrokinetic power generators',
        journalName: 'Energy & Environmental Science',
        details: '15, 123-135, 2022. Featured as Journal Inside Front Cover.'
      },
      {
        authors: 'Jaehyeong Bae, Tae Gwang Yun, Bong Lim Suh, Jihan Kim, and Il-Doo Kim',
        title: 'Self-operating transpiration driven electrokinetic power generator with an artificial hydrological cycle',
        journalName: 'Energy & Environmental Science',
        details: '13, 527-534, 2019. Featured as Journal Back Cover.'
      }
    ]
  }
};

function useImageFallback(basePath) {
  const candidates = useMemo(() => IMAGE_EXTENSIONS.map((ext) => `${basePath}.${ext}`), [basePath]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [basePath]);

  const broken = index >= candidates.length;
  const src = broken ? '' : `${import.meta.env.BASE_URL}${candidates[index]}`;

  const onError = () => {
    setIndex((prev) => prev + 1);
  };

  return { broken, src, onError };
}

function parseJoiningRank(member) {
  const fallbackYear = Number.isFinite(member.startYear) ? member.startYear : Number.MAX_SAFE_INTEGER;
  const raw = String(member.joiningGroup || '').trim();
  const match = raw.match(/(20\d{2})(?:\D+)?(Spring|Summer|Fall|Winter)?/i);
  if (!match) {
    return { year: fallbackYear, term: 99 };
  }

  const year = Number(match[1]);
  const term = match[2] ? TERM_SORT_ORDER[String(match[2]).toLowerCase()] ?? 99 : 99;
  return { year, term };
}

function compareMembersByJoinThenProgram(a, b, role) {
  const joinA = parseJoiningRank(a);
  const joinB = parseJoiningRank(b);

  if (joinA.year !== joinB.year) {
    return joinA.year - joinB.year;
  }
  if (joinA.term !== joinB.term) {
    return joinA.term - joinB.term;
  }

  if (role === 'Graduate') {
    const rankA = GRAD_PROGRAM_ORDER[a.program] ?? 99;
    const rankB = GRAD_PROGRAM_ORDER[b.program] ?? 99;
    if (rankA !== rankB) {
      return rankA - rankB;
    }
  }

  return String(a.localizedName || '').localeCompare(String(b.localizedName || ''));
}

function MemberDetailRow({ label, value, type = 'text' }) {
  if (!value) {
    return null;
  }

  const trimmed = String(value).trim();
  const isEmail = type === 'email' && trimmed.includes('@');

  return (
    <div className="grid gap-0.5 sm:grid-cols-[160px_1fr] sm:gap-2">
      <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</dt>
      <dd className="text-sm leading-relaxed text-slate-700 md:text-[0.95rem]">
        {isEmail ? (
          <a className="text-[#0d326f] underline-offset-2 hover:underline" href={`mailto:${trimmed}`}>
            {trimmed}
          </a>
        ) : (
          trimmed
        )}
      </dd>
    </div>
  );
}

function MemberCard({ member, locale, prominent = false, showRoleBadge = false }) {
  const [broken, setBroken] = useState(false);
  const hasPhoto = Boolean(member.photo) && !broken;
  const period = locale === 'ko' ? `${member.startYear || '-'} ~ ${member.endYear || '현재'}` : `${member.startYear || '-'} - ${member.endYear || 'Present'}`;
  const labels = MEMBER_FIELD_LABELS[locale] || MEMBER_FIELD_LABELS.en;
  const joinValue = member.joiningGroup || period;
  const courseValue = member.courseLabel || member.programLabel || member.roleLabel;
  const researchValue = member.localizedInterests?.filter(Boolean).join(', ') || '';
  const emailValue = member.emailDisplay || member.email || '';
  const topRows = [
    { key: 'joining', label: labels.joining, value: joinValue, type: 'text' },
    { key: 'email', label: labels.email, value: emailValue, type: 'email' }
  ];
  const detailRows = [
    { key: 'undergraduateSchool', label: labels.undergraduateSchool, value: member.undergraduateSchool, type: 'text' },
    { key: 'undergraduateMajor', label: labels.undergraduateMajor, value: member.undergraduateMajor, type: 'text' },
    { key: 'masterSchool', label: labels.masterSchool, value: member.masterSchool, type: 'text' },
    { key: 'masterMajor', label: labels.masterMajor, value: member.masterMajor, type: 'text' },
    { key: 'research', label: labels.research, value: researchValue, type: 'text' },
    { key: 'korean', label: labels.korean, value: member.koreanProficiency, type: 'text' },
    { key: 'current', label: labels.current, value: member.currentAffiliation, type: 'text' },
    { key: 'note', label: labels.note, value: member.note, type: 'text' }
  ];

  if (prominent) {
    return (
      <article className="rounded-xl border border-slate-200 bg-white p-5 md:p-6">
        <div className="grid gap-5 md:grid-cols-[140px_1fr]">
          <div className="mx-auto w-full max-w-[140px]">
            <div className="h-44 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
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
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <p className="text-2xl font-semibold text-slate-950">{member.localizedName}</p>
              <p className="text-sm font-medium text-slate-700 md:text-base">{courseValue}</p>
              {showRoleBadge ? <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#0b3a64]">{member.roleLabel}</p> : null}
            </div>

            <dl className="space-y-2">
              <MemberDetailRow label={labels.joining} value={joinValue} />
              <MemberDetailRow label={labels.undergraduateSchool} value={member.undergraduateSchool} />
              <MemberDetailRow label={labels.undergraduateMajor} value={member.undergraduateMajor} />
              <MemberDetailRow label={labels.masterSchool} value={member.masterSchool} />
              <MemberDetailRow label={labels.masterMajor} value={member.masterMajor} />
              <MemberDetailRow label={labels.research} value={researchValue} />
              <MemberDetailRow label={labels.korean} value={member.koreanProficiency} />
              <MemberDetailRow label={labels.current} value={member.currentAffiliation} />
              <MemberDetailRow label={labels.note} value={member.note} />
              <MemberDetailRow label={labels.email} type="email" value={emailValue} />
            </dl>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 md:p-6">
      <div className="grid gap-5 md:grid-cols-[180px_1fr] md:items-start">
        <div className="mx-auto w-full max-w-[180px]">
          <div className="h-56 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
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
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <p className="text-xl font-semibold text-slate-950 md:text-2xl">{member.localizedName}</p>
            <p className="text-sm font-medium text-slate-700 md:text-base">{courseValue}</p>
            {showRoleBadge ? <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#0b3a64]">{member.roleLabel}</p> : null}
          </div>

          <dl className="space-y-2">
            {topRows.map((row) => (
              <MemberDetailRow key={`${member.id}-${row.key}`} label={row.label} type={row.type} value={row.value} />
            ))}
          </dl>
        </div>
      </div>

      <dl className="mt-4 space-y-2 border-t border-slate-200 pt-4">
        {detailRows.map((row) => (
          <MemberDetailRow key={`${member.id}-${row.key}`} label={row.label} type={row.type} value={row.value} />
        ))}
      </dl>
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
    <div className="grid gap-3 sm:grid-cols-2">
      {principles.map((item) => (
        <article className="rounded-lg border border-slate-200/90 bg-slate-50/70 p-4 md:p-5" key={item.title}>
          <h3 className="text-base font-semibold text-slate-900 md:text-lg">{item.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
        </article>
      ))}
    </div>
  );
}

function ProfessorTimeline({ title, items }) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h3 className="text-3xl font-semibold tracking-tight text-slate-950">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li className="flex flex-col gap-0.5 text-sm leading-relaxed text-slate-700 md:flex-row md:gap-2 md:text-base" key={`${item.year}-${item.text}`}>
            <span className="font-semibold text-[#2563eb] md:min-w-[130px]">{item.year}</span>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function HighlightPIName({ authors, piName }) {
  if (!authors || !piName || !String(authors).includes(piName)) {
    return <>{authors}</>;
  }

  const chunks = String(authors).split(piName);
  return (
    <>
      {chunks.map((chunk, index) => (
        <span key={`${chunk}-${index}`}>
          {chunk}
          {index < chunks.length - 1 ? (
            <span className="underline decoration-slate-500 decoration-2 underline-offset-4">{piName}</span>
          ) : null}
        </span>
      ))}
    </>
  );
}

function ProfessorPublications({ title, items }) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h3 className="text-3xl font-semibold tracking-tight text-slate-950">{title}</h3>
      <ul className="list-disc space-y-4 pl-6 text-sm leading-relaxed text-slate-700 md:text-base">
        {items.map((item) => (
          <li key={`${item.title}-${item.journalName}`}>
            <HighlightPIName authors={item.authors} piName="Jaehyeong Bae" />
            <span>, </span>
            <span>"{item.title}", </span>
            <strong className="font-semibold text-slate-900">{item.journalName}</strong>
            {item.details ? <span>, {item.details}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProfessorShowcase({ professor, locale }) {
  const [broken, setBroken] = useState(false);
  const hasPhoto = Boolean(professor.photo) && !broken;
  const copy = PROFESSOR_COPY[locale] || PROFESSOR_COPY.en;
  const profile = PROFESSOR_PROFILE_DETAILS[professor.id] || PROFESSOR_PROFILE_DETAILS['bae-jaehyeong'];

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft">
      <div className="border-b border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#eef3f8_100%)]">
        <div className="grid gap-4 p-4 md:p-5 lg:grid-cols-[minmax(220px,300px)_minmax(0,1fr)] lg:gap-6 lg:items-start">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="min-h-[280px] lg:min-h-[360px]">
              {hasPhoto ? (
                <img
                  alt={professor.localizedName}
                  className="h-full w-full object-cover object-top"
                  onError={() => setBroken(true)}
                  src={`${import.meta.env.BASE_URL}${professor.photo}`}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-6xl font-semibold tracking-tight text-slate-600">{professor.initials}</div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7a0f1f]">{copy.sectionLead}</p>
              <h3 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">Prof. {professor.localizedName}</h3>
              <p className="text-xl font-semibold leading-tight text-slate-900">{copy.department}</p>
              <p className="text-sm leading-relaxed text-slate-600 md:text-base">{copy.affiliation}</p>
            </div>

            <ul className="space-y-2 text-sm leading-relaxed text-slate-700 md:text-base">
              {professor.email ? (
                <li>
                  <span className="font-semibold">E-mail:</span>{' '}
                  <a className="text-[#0d326f] underline-offset-2 hover:underline" href={`mailto:${professor.email}`}>
                    {professor.email}
                  </a>
                </li>
              ) : null}
              {profile?.phone ? (
                <li>
                  <span className="font-semibold">Phone:</span> {profile.phone}
                </li>
              ) : null}
              {profile?.fax ? (
                <li>
                  <span className="font-semibold">Fax:</span> {profile.fax}
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-8 p-5 md:space-y-10 md:p-7">
        <ProfessorTimeline items={profile?.education || []} title={copy.educationTitle} />
        <ProfessorTimeline items={profile?.appointments || []} title={copy.appointmentsTitle} />
        <ProfessorTimeline items={profile?.honors || []} title={copy.honorsTitle} />
        <ProfessorPublications items={profile?.publications || []} title={copy.publicationsTitle} />
      </div>
    </article>
  );
}

export function TeamPage({ locale }) {
  const content = TEAM_CONTENT[locale] || TEAM_CONTENT.en;
  const identityCopy = IDENTITY_COPY[locale] || IDENTITY_COPY.en;
  const [currentGroups, setCurrentGroups] = useState([]);
  const [alumniGroups, setAlumniGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('identity');
  const aboutImage = useImageFallback(LAB_GROUP_IMAGE_BASE);
  const cultureImage = useImageFallback(FEARLESS_IMAGE_BASE);

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
  const leadProfessor = professorMembers[0] || null;
  const additionalProfessors = professorMembers.slice(1);

  const currentStudentGroups = useMemo(
    () =>
      currentGroups
        .filter((group) => group.role !== 'PI' && group.role !== 'Alumni')
        .map((group) => ({
          ...group,
          members: [...group.members].sort((a, b) => compareMembersByJoinThenProgram(a, b, group.role))
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
      <PageHero description={content.description} title={content.title || 'Team'} />

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
              <section>
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="grid gap-6 p-5 md:p-7 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.95fr)] lg:items-start lg:gap-8">
                    <div className="space-y-4">
                      <h2 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">{identityCopy.aboutHeading}</h2>
                      <p className="text-sm leading-relaxed text-slate-700 md:text-base">{content.aboutBody || content.description}</p>
                      <div className="pt-1">
                        <Link className="home-cta-primary" to={pagePath('join')}>
                          {content.joinCta || 'Information for joining our team'}
                        </Link>
                      </div>
                    </div>

                    <figure className="mx-auto w-full max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-slate-100 lg:max-w-none">
                      {!aboutImage.broken ? (
                        <img
                          alt="Bae Lab group photo"
                          className="h-full max-h-[360px] w-full object-cover lg:max-h-none"
                          onError={aboutImage.onError}
                          src={aboutImage.src}
                        />
                      ) : (
                        <div className="flex min-h-[220px] max-h-[360px] items-center justify-center px-4 text-center text-sm text-slate-500 lg:max-h-none">Lab group photo placeholder</div>
                      )}
                    </figure>
                  </div>

                  <div className="h-px bg-slate-200" />

                  <div className="space-y-6 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 md:p-7">
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.95fr)] lg:items-start lg:gap-8">
                      <div className="space-y-4">
                        <h2 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">{content.cultureTitle || 'The Fearless Lab Culture'}</h2>
                        <p className="text-sm leading-relaxed text-slate-700 md:text-base">{content.cultureBody || ''}</p>
                      </div>

                      <figure className="mx-auto w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#eef3f8_100%)] lg:max-w-none">
                        {!cultureImage.broken ? (
                          <img
                            alt="The Fearless Organization matrix"
                            className="h-auto max-h-[360px] w-full object-contain p-3 md:p-4 lg:max-h-none"
                            onError={cultureImage.onError}
                            src={cultureImage.src}
                          />
                        ) : (
                          <div className="flex min-h-[220px] max-h-[360px] items-center justify-center px-4 text-center text-sm text-slate-500 lg:max-h-none">Culture image placeholder</div>
                        )}
                        <figcaption className="border-t border-slate-200 px-4 py-3 text-xs italic text-slate-500">
                          From "The fearless organization" by Amy Edmondson
                        </figcaption>
                      </figure>
                    </div>

                    <Principles principles={culturePrinciples} />
                  </div>
                </section>
              </section>
            ) : null}

            {activeSection === 'professor' ? (
              <section>
                <h2 className="sr-only">{content.professorTitle || 'Professor'}</h2>
                {leadProfessor ? (
                  <div className="space-y-4">
                    <ProfessorShowcase locale={locale} professor={leadProfessor} />
                    {additionalProfessors.length ? (
                      <div className="grid gap-4 lg:grid-cols-2">
                        {additionalProfessors.map((member) => (
                          <MemberCard key={member.id} locale={locale} member={member} prominent />
                        ))}
                      </div>
                    ) : null}
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
                        <h3 className="text-lg font-semibold text-slate-900">
                          {group.label}
                          <span className="ml-2 text-base font-medium text-slate-500">({group.members.length})</span>
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2">
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
                  <div className="grid gap-4 md:grid-cols-2">
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
