import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { PageHero } from '@/components/site/PageHero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PUBLICATIONS_CONTENT } from '@/content/site-content';
import { loadPublications, publicationTypeLabels } from '@/lib/data';

const IMAGE_EXTENSIONS = ['webp', 'png', 'jpg', 'jpeg'];
const COVER_IMAGE_BASE = 'assets/img/publications/covers';
const SCHOLAR_URL = 'https://scholar.google.com/scholar?q=Jaehyeong+Bae';
const REPRINT_EMAIL = 'jbae@khu.ac.kr';

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

function normalizeAuthorName(author) {
  return String(author || '')
    .replace(/[†*]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isLabAuthor(author, labNames) {
  const normalized = normalizeAuthorName(author).toLowerCase();
  if (!normalized) {
    return false;
  }
  return labNames.some((name) => {
    const target = String(name || '').toLowerCase();
    return target && (normalized.includes(target) || target.includes(normalized));
  });
}

function PublicationInfoPanel({ updatedAt }) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardContent className="space-y-3 p-4 text-sm text-slate-700 md:p-5">
        <p>
          Complete publication list available on{' '}
          <a className="font-semibold text-[#0d326f] underline-offset-2 hover:underline" href={SCHOLAR_URL} rel="noreferrer" target="_blank">
            Google Scholar
          </a>
          .
        </p>
        <p>
          For reprints of publications contact{' '}
          <a className="font-semibold text-[#0d326f] underline-offset-2 hover:underline" href={`mailto:${REPRINT_EMAIL}`}>
            {REPRINT_EMAIL}
          </a>
          .
        </p>
        <div className="h-px bg-slate-200" />
        <p className="text-xs uppercase tracking-[0.08em] text-slate-500">
          <span className="underline decoration-[#0d326f] decoration-2 underline-offset-2">Underline</span> indicates Bae Lab authors.
        </p>
        <div className="space-y-1 text-xs uppercase tracking-[0.08em] text-slate-500">
          <p>
            <span className="font-semibold">*</span> corresponding author
          </p>
          <p>
            <span className="font-semibold">†</span> co-first author
          </p>
        </div>
        {updatedAt ? <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Last updated {updatedAt}</p> : null}
      </CardContent>
    </Card>
  );
}

function PreprintSection({ description, items, title }) {
  if (!description && !items.length) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h3 className="border-l-4 border-[#7a0f1f] pl-3 text-2xl font-semibold tracking-tight text-[#7a0f1f]">
        {title || 'Preprints in Preparation'}
      </h3>
      {description ? <p className="text-sm leading-relaxed text-slate-700 md:text-base">{description}</p> : null}
      {items.length ? (
        <ul className="space-y-2">
          {items.map((item) => (
            <li className="rounded-lg border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700 md:text-base" key={item}>
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">No preprints added yet.</p>
      )}
    </section>
  );
}

function JournalCoverCard({ publication, number }) {
  const imageBase = publication.coverImage || publication.id;
  const image = useImageFallback(`${COVER_IMAGE_BASE}/${imageBase}`);
  const journalName = publication.journal || publication.venue || '';

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-3 shadow-soft">
      {!image.broken ? (
        <div className="flex aspect-[3/4] items-center justify-center rounded-md border border-slate-100 bg-slate-50 p-2">
          <img alt={`${journalName} cover`} className="h-full w-full object-contain" onError={image.onError} src={image.src} />
        </div>
      ) : (
        <div className="flex aspect-[3/4] w-full items-center justify-center rounded-md border border-slate-100 bg-slate-100 px-3 text-center text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          Cover
        </div>
      )}
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">#{number}</p>
      <p className="mt-0.5 text-sm font-semibold leading-snug text-slate-900">{journalName}</p>
      <p className="mt-0.5 text-xs text-slate-600">{publication.year}</p>
    </article>
  );
}

function JournalCoverCarousel({ items, numbers }) {
  const [index, setIndex] = useState(0);
  const total = items.length;

  useEffect(() => {
    setIndex(0);
  }, [total]);

  useEffect(() => {
    if (total <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % total);
    }, 3600);

    return () => window.clearInterval(timer);
  }, [total]);

  function goPrev() {
    setIndex((prev) => (prev - 1 + total) % total);
  }

  function goNext() {
    setIndex((prev) => (prev + 1) % total);
  }

  if (!total) {
    return <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-500">No journal covers available.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg">
        <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
          {items.map((pub) => (
            <div className="w-full shrink-0" key={`${pub.id}-slide`}>
              <JournalCoverCard number={numbers.get(pub.id) || '-'} publication={pub} />
            </div>
          ))}
        </div>
      </div>

      {total > 1 ? (
        <div className="flex items-center justify-between">
          <button
            aria-label="Previous journal cover"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
            onClick={goPrev}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{index + 1} / {total}</p>
          <button
            aria-label="Next journal cover"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
            onClick={goNext}
            type="button"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function PublicationList({ items, numbers, labAuthorNames, paperLabel }) {
  const grouped = items.reduce((acc, item) => {
    const bucket = acc.get(item.year) || [];
    bucket.push(item);
    acc.set(item.year, bucket);
    return acc;
  }, new Map());

  const years = [...grouped.keys()].sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      {years.map((year) => (
        <section className="space-y-3" key={year}>
          <h3 className="border-l-4 border-[#7a0f1f] pl-3 text-2xl font-semibold tracking-tight text-[#7a0f1f]">{year} Publications</h3>
          <ol className="space-y-3">
            {grouped.get(year).map((pub) => {
              const number = numbers.get(pub.id) || '-';
              const labNames = labAuthorNames;
              const journalName = pub.journal || pub.venue || '';
              const volumeIssue = pub.volume ? `${pub.volume}${pub.issue ? `(${pub.issue})` : ''}` : pub.issue ? `(${pub.issue})` : '';
              const doiHref = pub.doi ? `https://doi.org/${pub.doi}` : '';
              const paperHref = String(pub.link || pub.url || '').trim();

              return (
                <li className="rounded-lg border border-slate-200 bg-white p-4 md:p-5" key={pub.id}>
                  <div className="grid gap-3 md:grid-cols-[56px_1fr] md:gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white md:h-12 md:w-12 md:text-base">
                      {number}
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-[0.97rem] leading-relaxed text-slate-700 md:text-base">
                        {(pub.authors || []).map((author, index) => {
                          const highlight = isLabAuthor(author, labNames);
                          return (
                            <span key={`${pub.id}-author-${author}-${index}`}>
                              <span className={highlight ? 'underline decoration-[#0d326f] decoration-2 underline-offset-2' : ''}>{author}</span>
                              {index < pub.authors.length - 1 ? ', ' : ''}
                            </span>
                          );
                        })}
                        .
                      </p>

                      <p className="text-[1.02rem] leading-relaxed md:text-[1.05rem]">
                        <span className="font-semibold text-[#0d326f]">{pub.localizedTitle}</span>
                        <span className="text-slate-500">. </span>
                        <span className="font-semibold text-[#7a0f1f]">{journalName}</span>
                        {pub.year ? <span className="text-slate-600">, {pub.year}</span> : null}
                        {volumeIssue ? <span className="text-slate-600">, {volumeIssue}</span> : null}
                        {pub.pages ? <span className="text-slate-600">, {pub.pages}</span> : null}
                        {pub.doi ? <span className="text-slate-600">, doi: {pub.doi}</span> : null}
                      </p>

                      <div className="flex flex-wrap gap-3 text-xs font-semibold text-[#0d326f]">
                        {doiHref ? (
                          <a href={doiHref} rel="noreferrer" target="_blank">
                            DOI
                          </a>
                        ) : null}
                        {paperHref && paperHref !== doiHref ? (
                          <a href={paperHref} rel="noreferrer" target="_blank">
                            {paperLabel}
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

export function PublicationsPage({ locale }) {
  const content = PUBLICATIONS_CONTENT[locale] || PUBLICATIONS_CONTENT.en;
  const labels = publicationTypeLabels(locale);
  const [filter, setFilter] = useState('journal');
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [labAuthorNames, setLabAuthorNames] = useState([]);

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

  useEffect(() => {
    let mounted = true;

    async function loadAllPublications() {
      try {
        const result = await loadPublications(locale, 'all');
        if (mounted) {
          setAllItems(result);
        }
      } catch {
        if (mounted) {
          setAllItems([]);
        }
      }
    }

    loadAllPublications();
    return () => {
      mounted = false;
    };
  }, [locale]);

  useEffect(() => {
    let mounted = true;

    async function loadTeamAuthors() {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/team.json`, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to load team data');
        }
        const team = await response.json();
        if (!mounted) {
          return;
        }

        const names = [];
        team.forEach((member) => {
          const name = typeof member?.name === 'string' ? member.name : member?.name?.en || '';
          if (name) {
            names.push(name);
          }
        });
        setLabAuthorNames([...new Set(names)]);
      } catch {
        if (mounted) {
          setLabAuthorNames([]);
        }
      }
    }

    loadTeamAuthors();

    return () => {
      mounted = false;
    };
  }, []);

  const filters = useMemo(() => ['journal', 'patent'], []);

  const numbers = useMemo(() => {
    const chronological = [...allItems].sort((a, b) => {
      const yearDelta = (a.year || 0) - (b.year || 0);
      if (yearDelta !== 0) {
        return yearDelta;
      }
      const titleDelta = String(a.localizedTitle || '').localeCompare(String(b.localizedTitle || ''));
      if (titleDelta !== 0) {
        return titleDelta;
      }
      return String(a.id || '').localeCompare(String(b.id || ''));
    });

    const map = new Map();
    chronological.forEach((pub, index) => {
      map.set(pub.id, index + 1);
    });
    return map;
  }, [allItems]);

  const updatedAt = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      }).format(new Date()),
    []
  );
  const journalItems = useMemo(() => allItems.filter((pub) => pub.type === 'journal').slice(0, 6), [allItems]);
  const preprintItems = Array.isArray(content.preprintItems) ? content.preprintItems.filter(Boolean) : [];
  const showPreprintSection = filter === 'journal';

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHero description={content.description} title={content.title} />

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

        <TabsContent className="mt-4" value={filter}>
          {loading ? <p className="rounded-md border border-dashed border-border p-4 text-base text-slate-600">{content.loading}</p> : null}
          {!loading && error ? <p className="rounded-md border border-red-200 bg-red-50 p-4 text-base text-red-700">{error}</p> : null}
          {!loading && !error && items.length === 0 ? (
            <p className="rounded-md border border-dashed border-border p-4 text-base text-slate-600">{content.empty}</p>
          ) : null}

          {!loading && !error && items.length > 0 ? (
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.84fr)_minmax(220px,0.62fr)]">
              <div className="space-y-4">
                {showPreprintSection ? (
                  <PreprintSection
                    description={content.preprintDescription}
                    items={preprintItems}
                    title={content.preprintTitle || 'Preprints in Preparation'}
                  />
                ) : null}
                <PublicationList items={items} labAuthorNames={labAuthorNames} numbers={numbers} paperLabel={content.paperLink} />
              </div>

              <aside className="xl:border-l xl:border-slate-200 xl:pl-5">
                <div className="space-y-4 xl:sticky xl:top-24">
                  <PublicationInfoPanel updatedAt={updatedAt} />

                  <Card className="border-slate-200 bg-white">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-slate-900">Journal Covers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <JournalCoverCarousel items={journalItems} numbers={numbers} />
                    </CardContent>
                  </Card>
                </div>
              </aside>
            </div>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
