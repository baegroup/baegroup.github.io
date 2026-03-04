import { useEffect, useMemo, useState } from 'react';

import { PageHero } from '@/components/site/PageHero';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MEMBERS_CONTENT } from '@/content/site-content';
import { loadMembers } from '@/lib/data';

function MemberItem({ member, locale }) {
  const [broken, setBroken] = useState(false);
  const hasPhoto = Boolean(member.photo) && !broken;
  const period = locale === 'ko' ? `${member.startYear || '-'} ~ ${member.endYear || '현재'}` : `${member.startYear || '-'} - ${member.endYear || 'Present'}`;

  return (
    <article className="grid grid-cols-[64px_1fr] gap-3 rounded-md border border-border bg-white p-3">
      <div className="h-16 w-16 overflow-hidden rounded-md border border-border bg-slate-50">
        {hasPhoto ? (
          <img
            alt={member.localizedName}
            className="h-full w-full object-cover"
            onError={() => setBroken(true)}
            src={member.photo}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm font-bold text-slate-700">{member.initials}</div>
        )}
      </div>
      <div>
        <p className="font-semibold text-slate-950">{member.localizedName}</p>
        <p className="text-sm text-slate-600">{member.programLabel || member.roleLabel}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge variant="outline">{period}</Badge>
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
    </article>
  );
}

function MemberGroupList({ groups, locale }) {
  if (!groups.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <section className="rounded-md border border-border bg-slate-50/60 p-3" key={group.role}>
          <h3 className="font-serif text-xl font-semibold text-slate-900">{group.label}</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {group.members.map((member) => (
              <MemberItem key={member.id} locale={locale} member={member} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function MembersPage({ locale }) {
  const content = MEMBERS_CONTENT[locale];
  const [status, setStatus] = useState('current');
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function run() {
      setLoading(true);
      setError('');

      try {
        const result = await loadMembers(locale, status);
        if (mounted) {
          setGroups(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Failed to load members');
          setGroups([]);
        }
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
  }, [locale, status]);

  const currentLabel = useMemo(() => content.current, [content.current]);
  const alumniLabel = useMemo(() => content.alumni, [content.alumni]);

  return (
    <>
      <PageHero description={content.description} title={content.title} />

      <Card>
        <CardHeader>
          <CardTitle>{content.sectionTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs onValueChange={setStatus} value={status}>
            <TabsList>
              <TabsTrigger value="current">{currentLabel}</TabsTrigger>
              <TabsTrigger value="alumni">{alumniLabel}</TabsTrigger>
            </TabsList>
            <TabsContent value={status}>
              {loading ? <p className="rounded-md border border-dashed border-border p-4 text-sm text-slate-600">{content.loading}</p> : null}
              {!loading && error ? <p className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
              {!loading && !error && groups.length === 0 ? (
                <p className="rounded-md border border-dashed border-border p-4 text-sm text-slate-600">{content.empty}</p>
              ) : null}
              {!loading && !error && groups.length > 0 ? <MemberGroupList groups={groups} locale={locale} /> : null}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}
