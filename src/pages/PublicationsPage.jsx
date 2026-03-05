import { useEffect, useMemo, useState } from 'react';

import { PageHero } from '@/components/site/PageHero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PUBLICATIONS_CONTENT } from '@/content/site-content';
import { loadPublications, publicationTypeLabels } from '@/lib/data';

function PublicationList({ items, locale, paperLabel }) {
  const grouped = items.reduce((acc, item) => {
    const bucket = acc.get(item.year) || [];
    bucket.push(item);
    acc.set(item.year, bucket);
    return acc;
  }, new Map());

  const years = [...grouped.keys()].sort((a, b) => b - a);

  return (
    <div className="space-y-4">
      {years.map((year) => (
        <section key={year}>
          <h3 className="mb-2 border-l-4 border-[#0b3a64] pl-2 text-2xl font-semibold text-slate-900">{year}</h3>
          <ol className="grid gap-2">
            {grouped.get(year).map((pub) => (
              <li className="rounded-md border border-border bg-white p-4" key={pub.id}>
                <p className="font-semibold text-slate-900">{pub.localizedTitle}</p>
                <p className="mt-1 text-base text-slate-600">{pub.citation}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold text-[#0b3a64]">
                  {pub.doi ? (
                    <a href={`https://doi.org/${pub.doi}`} rel="noreferrer" target="_blank">
                      DOI
                    </a>
                  ) : null}
                  {pub.url ? (
                    <a href={pub.url} rel="noreferrer" target="_blank">
                      {paperLabel}
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

export function PublicationsPage({ locale }) {
  const content = PUBLICATIONS_CONTENT[locale];
  const labels = publicationTypeLabels(locale);
  const [filter, setFilter] = useState('all');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function run() {
      setLoading(true);
      setError('');

      try {
        const result = await loadPublications(locale, filter);
        if (mounted) {
          setItems(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Failed to load publications');
          setItems([]);
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
  }, [locale, filter]);

  const filters = useMemo(() => ['all', 'journal', 'conference', 'preprint', 'patent'], []);

  return (
    <>
      <PageHero description={content.description} title={content.title} />

      <Card>
        <CardHeader>
          <CardTitle>{content.sectionTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs onValueChange={setFilter} value={filter}>
            <TabsList className="h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
              {filters.map((type) => (
                <TabsTrigger
                  className="rounded-md border border-input bg-background data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  key={type}
                  value={type}
                >
                  {labels[type]}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={filter}>
              {loading ? <p className="rounded-md border border-dashed border-border p-4 text-base text-slate-600">{content.loading}</p> : null}
              {!loading && error ? <p className="rounded-md border border-red-200 bg-red-50 p-4 text-base text-red-700">{error}</p> : null}
              {!loading && !error && items.length === 0 ? (
                <p className="rounded-md border border-dashed border-border p-4 text-base text-slate-600">{content.empty}</p>
              ) : null}
              {!loading && !error && items.length > 0 ? (
                <PublicationList items={items} locale={locale} paperLabel={content.paperLink} />
              ) : null}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}
