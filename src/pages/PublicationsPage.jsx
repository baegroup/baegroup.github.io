import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { PageHero } from '@/components/site/PageHero';
import { PageSectionNav } from '@/components/site/PageSectionNav';
import { ResearchProfileLinks } from '@/components/site/ResearchProfileLinks';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { PUBLICATIONS_CONTENT } from '@/content/site-content';
import { loadPublicationCovers, loadPublications, loadResearchProfileLinks, publicationTypeLabels } from '@/lib/data';

const IMAGE_EXTENSIONS = ['webp', 'png', 'jpg', 'jpeg'];
const COVER_IMAGE_BASE = 'assets/img/publications/covers';
const SCHOLAR_URL = 'https://scholar.google.com/scholar?q=Jaehyeong+Bae';
const REPRINT_EMAIL = 'jbae@khu.ac.kr';
const JOURNAL_DISPLAY_NAMES = {
  'Advanced Energy Materials': 'Adv. Energy Mater.',
  'Advanced Functional Materials': 'Adv. Funct. Mater.',
  'Advanced Materials': 'Adv. Mater.',
  'Energy & Environmental Science': 'Energy Environ. Sci.'
};

function formatJournalDisplayName(name) {
  return JOURNAL_DISPLAY_NAMES[name] || name;
}

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

function normalizeJournalKey(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function formatVolumeIssue(publication) {
  const volume = String(publication?.volume || '').trim();
  const issue = String(publication?.issue || '').trim();
  if (volume && issue) {
    return `${volume}(${issue})`;
  }
  if (volume) {
    return volume;
  }
  if (issue) {
    return `(${issue})`;
  }
  return '';
}

function buildMetadataParts(publication) {
  const journalName = String(publication?.journal || publication?.venue || '').trim();
  const year = publication?.year ? String(publication.year) : '';
  const volumeIssue = formatVolumeIssue(publication);
  const articleNumber = String(publication?.pages || '').trim();

  const parts = [];
  if (journalName) {
    parts.push({ key: 'journal', value: journalName, italic: true });
  }
  if (year) {
    parts.push({ key: 'year', value: year });
  }
  if (volumeIssue) {
    parts.push({ key: 'volumeIssue', value: volumeIssue });
  }
  if (articleNumber) {
    parts.push({ key: 'articleNumber', value: articleNumber });
  }
  return parts;
}

function buildActionLinks(publication) {
  const doiHref = publication?.doi ? `https://doi.org/${publication.doi}` : '';
  const externalHref = String(publication?.link || publication?.url || '').trim();
  const links = [];

  if (doiHref) {
    links.push({ label: 'DOI', href: doiHref });
  }
  if (externalHref && externalHref !== doiHref) {
    links.push({
      label: /\.pdf(?:$|[?#])/i.test(externalHref) ? 'PDF' : 'Publisher',
      href: externalHref
    });
  }

  return links;
}

function compareChronologicalAsc(a, b) {
  const yearDelta = (a?.year || 0) - (b?.year || 0);
  if (yearDelta !== 0) {
    return yearDelta;
  }
  const titleDelta = String(a?.localizedTitle || a?.title || '').localeCompare(String(b?.localizedTitle || b?.title || ''));
  if (titleDelta !== 0) {
    return titleDelta;
  }
  return String(a?.id || '').localeCompare(String(b?.id || ''));
}

function formatCoverDateLabel(item) {
  const year = Number(item?.year) || null;
  const month = Number(item?.month) || null;
  if (year && month) {
    return `${year}.${String(month).padStart(2, '0')}`;
  }
  if (year) {
    return String(year);
  }
  return '';
}

function PublicationInfoPanel({ updatedAt }) {
  return (
    <section className="space-y-3 border-b border-slate-200 pb-5 text-sm text-slate-700">
        <p>
          Complete publication list available on{' '}
          <a className="site-text-link" href={SCHOLAR_URL} rel="noreferrer" target="_blank">
            Google Scholar
          </a>
          .
        </p>
        <p>
          For reprints of publications contact{' '}
          <a className="site-text-link" href={`mailto:${REPRINT_EMAIL}`}>
            {REPRINT_EMAIL}
          </a>
          .
        </p>
        <div className="h-px bg-slate-200" />
        <p className="text-xs leading-relaxed text-slate-500">
          <span className="font-semibold text-slate-800">Bold</span> indicates Bae Lab authors.
        </p>
        <div className="space-y-1 text-xs leading-relaxed text-slate-500">
          <p>
            <span className="font-semibold text-slate-700">*</span> Corresponding author
          </p>
          <p>
            <span className="font-semibold text-slate-700">†</span> Co-first author
          </p>
        </div>
        {updatedAt ? <p className="text-xs leading-relaxed text-slate-500">Last updated {updatedAt}</p> : null}
    </section>
  );
}

function PreprintSection({ items, labAuthorNames, title }) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="min-w-0">
      <h2 className="border-b border-slate-900 pb-3 text-2xl font-semibold tracking-tight text-slate-950">
        {title || 'Current Manuscripts'}
      </h2>
      {items.length ? (
        <ul>
          {items.map((item) => {
            const metadataParts = buildMetadataParts(item);
            const actionLinks = buildActionLinks(item);
            return (
              <li className="border-b border-slate-200 py-5" key={item.id}>
                <div className="space-y-2">
                  <p className="text-lg font-semibold leading-snug text-slate-950 md:text-xl">
                    {item.localizedTitle}
                  </p>

                  <p className="text-[0.95rem] leading-relaxed text-slate-700 md:text-base">
                    {(item.authors || []).map((author, index) => {
                      const highlight = isLabAuthor(author, labAuthorNames);
                      return (
                        <span key={`${item.id}-preprint-author-${author}-${index}`}>
                          <span className={highlight ? 'font-semibold text-slate-900' : ''}>{author}</span>
                          {index < item.authors.length - 1 ? ', ' : ''}
                        </span>
                      );
                    })}
                    .
                  </p>

                  {metadataParts.length ? (
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
                      {metadataParts.map((part, index) => (
                        <span className="inline-flex items-center gap-x-2" key={`${item.id}-meta-${part.key}`}>
                          {index > 0 ? <span className="text-slate-400">·</span> : null}
                          <span className={part.italic ? 'italic text-slate-700' : ''}>{part.value}</span>
                        </span>
                      ))}
                    </p>
                  ) : null}

                  {actionLinks.length ? (
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-[var(--brand-navy)]">
                      {actionLinks.map((link, index) => (
                        <span className="inline-flex items-center gap-x-2" key={`${item.id}-preprint-link-${link.label}-${index}`}>
                          {index > 0 ? <span className="text-slate-400">|</span> : null}
                          <a href={link.href} rel="noreferrer" target="_blank">
                            {link.label}
                          </a>
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">No preprints added yet.</p>
      )}
    </section>
  );
}

function JournalCoverImage({ broken, eager = false, imageSrc, journalName, onError }) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      {!broken ? (
        <img
          alt={`${journalName} cover`}
          className="h-full w-full object-contain"
          decoding="async"
          loading={eager ? 'eager' : 'lazy'}
          onError={onError}
          src={imageSrc}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center border border-dashed border-slate-300 px-3 text-center text-xs font-medium text-slate-500">
          Cover
        </div>
      )}
    </div>
  );
}

function JournalCoverMeta({ controls, dateLabel, journalName }) {
  return (
    <div className="mt-2 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[0.8125rem] font-semibold leading-snug text-slate-900">{formatJournalDisplayName(journalName)}</p>
        {dateLabel ? <p className="mt-1 text-xs text-slate-600">{dateLabel}</p> : null}
      </div>
      {controls}
    </div>
  );
}

function PublicationJournalCoverImage({ eager = false, publication }) {
  const imageBase = publication.coverImage || publication.id;
  const image = useImageFallback(`${COVER_IMAGE_BASE}/${imageBase}`);
  const journalName = publication.journal || publication.venue || '';

  return (
    <JournalCoverImage
      broken={image.broken}
      eager={eager}
      imageSrc={image.src}
      journalName={journalName}
      onError={image.onError}
    />
  );
}

function ManualJournalCoverImage({ cover, eager = false }) {
  const [broken, setBroken] = useState(false);
  const imageSrc = `${import.meta.env.BASE_URL}${cover.path}`;

  return (
    <JournalCoverImage
      broken={broken}
      eager={eager}
      imageSrc={imageSrc}
      journalName={cover.journal || 'Journal Cover'}
      onError={() => setBroken(true)}
    />
  );
}

function JournalCoverCarousel({ items }) {
  const [index, setIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const total = items.length;

  useEffect(() => {
    setIndex(0);
    setAutoPlay(true);
  }, [total]);

  useEffect(() => {
    if (!autoPlay || total <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % total);
    }, 3600);

    return () => window.clearInterval(timer);
  }, [autoPlay, total]);

  function goPrev() {
    setAutoPlay(false);
    setIndex((prev) => (prev - 1 + total) % total);
  }

  function goNext() {
    setAutoPlay(false);
    setIndex((prev) => (prev + 1) % total);
  }

  if (!total) {
    return <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-500">No journal covers available.</p>;
  }

  const cover = items[index];
  const journalName = cover.kind === 'manual' ? cover.journal || 'Journal Cover' : cover.publication.journal || cover.publication.venue || '';
  const dateLabel = cover.kind === 'manual' ? formatCoverDateLabel(cover) : cover.publication.year;
  const controls = total > 1 ? (
    <div className="flex shrink-0 items-center gap-1.5">
      <button
        aria-label="Previous journal cover"
        className="site-control inline-flex h-8 w-8 items-center justify-center rounded-md"
        onClick={goPrev}
        type="button"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        aria-label="Next journal cover"
        className="site-control inline-flex h-8 w-8 items-center justify-center rounded-md"
        onClick={goNext}
        type="button"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  ) : null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Journal Covers</h3>
      <article>
        <div className="grid aspect-[3/4] overflow-hidden">
          {items.map((item, itemIndex) => (
            <div
              aria-hidden={itemIndex !== index}
              className={`col-start-1 row-start-1 h-full w-full transition-opacity duration-[480ms] ease-in-out motion-reduce:transition-none ${
                itemIndex === index ? 'z-10 opacity-100' : 'pointer-events-none z-0 opacity-0'
              }`}
              key={item.id}
            >
              {item.kind === 'manual' ? (
                <ManualJournalCoverImage cover={item} eager />
              ) : (
                <PublicationJournalCoverImage eager publication={item.publication} />
              )}
            </div>
          ))}
        </div>
        <JournalCoverMeta controls={controls} dateLabel={dateLabel} journalName={journalName} />
      </article>
    </div>
  );
}

function PublicationPagination({ currentPage, onPageChange, pageGroups, placement }) {
  const pageCount = pageGroups.length;

  if (pageCount <= 1) {
    return null;
  }

  return (
    <nav aria-label={`Publication pagination ${placement}`} className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <button
        className="page-section-tab disabled:cursor-not-allowed disabled:opacity-40"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        type="button"
      >
        Prev
      </button>
      {pageGroups.map((group, index) => {
        const page = index + 1;
        return (
          <button
            aria-current={page === currentPage ? 'page' : undefined}
            aria-label={`Publications from ${group.label}`}
            className={`page-section-tab ${page === currentPage ? 'font-semibold text-slate-900' : ''}`}
            key={group.label}
            onClick={() => onPageChange(page)}
            type="button"
          >
            {group.years.length > 1 ? `${group.years[0]}–${group.years[group.years.length - 1]}` : group.years[0]}
          </button>
        );
      })}
      <button
        className="page-section-tab disabled:cursor-not-allowed disabled:opacity-40"
        disabled={currentPage === pageCount}
        onClick={() => onPageChange(currentPage + 1)}
        type="button"
      >
        Next
      </button>
    </nav>
  );
}

function PublicationList({ items, numbers, labAuthorNames, years }) {
  return (
    <div className="space-y-6">
      {years.map((year) => {
        const yearItems = items.filter((item) => item.year === year);

        return (
        <section key={year}>
          <div className="border-b border-slate-900 pb-3">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{year}</h2>
          </div>
          <ol>
            {yearItems
              .sort((a, b) => (numbers.get(b.id) || 0) - (numbers.get(a.id) || 0))
              .map((pub) => {
                const number = numbers.get(pub.id) || '-';
                const metadataParts = buildMetadataParts(pub);
                const actionLinks = buildActionLinks(pub);

                return (
                  <li className="grid grid-cols-[2.125rem_minmax(0,1fr)] gap-3 border-b border-slate-200 py-5" key={pub.id}>
                    <span className="pt-1 text-xs font-semibold tracking-[0.05em] text-[var(--brand-burgundy)] tabular-nums">{number}</span>
                    <div className="space-y-2">
                      <p className="text-lg font-semibold leading-snug text-slate-950 md:text-xl">
                        {pub.localizedTitle}
                      </p>

                      <p className="text-[0.95rem] leading-relaxed text-slate-700 md:text-base">
                        {(pub.authors || []).map((author, index) => {
                          const highlight = isLabAuthor(author, labAuthorNames);
                          return (
                            <span key={`${pub.id}-author-${author}-${index}`}>
                              <span className={highlight ? 'font-semibold text-slate-900' : ''}>{author}</span>
                              {index < pub.authors.length - 1 ? ', ' : ''}
                            </span>
                          );
                        })}
                        .
                      </p>

                      {metadataParts.length ? (
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
                          {metadataParts.map((part, index) => (
                            <span className="inline-flex items-center gap-x-2" key={`${pub.id}-meta-${part.key}`}>
                              {index > 0 ? <span className="text-slate-400">·</span> : null}
                              <span className={part.italic ? 'italic text-slate-700' : ''}>{part.value}</span>
                            </span>
                          ))}
                        </p>
                      ) : null}

                      {actionLinks.length ? (
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-[var(--brand-navy)]">
                          {actionLinks.map((link, index) => (
                            <span className="inline-flex items-center gap-x-2" key={`${pub.id}-link-${link.label}-${index}`}>
                              {index > 0 ? <span className="text-slate-400">|</span> : null}
                              <a href={link.href} rel="noreferrer" target="_blank">
                                {link.label}
                              </a>
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </li>
                );
              })}
          </ol>
        </section>
        );
      })}
    </div>
  );
}

export function PublicationsPage({ locale }) {
  const content = PUBLICATIONS_CONTENT[locale] || PUBLICATIONS_CONTENT.en;
  const labels = publicationTypeLabels(locale);
  const [filter, setFilter] = useState('journal');
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [coverManifest, setCoverManifest] = useState([]);
  const [researchProfileLinks, setResearchProfileLinks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [labAuthorNames, setLabAuthorNames] = useState([]);
  const [currentPublicationPage, setCurrentPublicationPage] = useState(1);
  const publicationListRef = useRef(null);

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

    async function loadCovers() {
      try {
        const covers = await loadPublicationCovers();
        if (mounted) {
          setCoverManifest(covers);
        }
      } catch {
        if (mounted) {
          setCoverManifest([]);
        }
      }
    }

    loadCovers();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadProfileLinks() {
      try {
        const links = await loadResearchProfileLinks();
        if (mounted) {
          setResearchProfileLinks(links);
        }
      } catch {
        if (mounted) {
          setResearchProfileLinks({});
        }
      }
    }

    loadProfileLinks();
    return () => {
      mounted = false;
    };
  }, []);

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

  const numbersByType = useMemo(() => {
    const types = ['journal', 'patent', 'preprint'];
    const buckets = new Map();

    types.forEach((type) => {
      const chronological = allItems.filter((pub) => pub.type === type).sort(compareChronologicalAsc);
      const map = new Map();
      chronological.forEach((pub, index) => {
        map.set(pub.id, index + 1);
      });
      buckets.set(type, map);
    });

    return buckets;
  }, [allItems]);
  const activeNumbers = numbersByType.get(filter) || new Map();
  const journalNumbers = numbersByType.get('journal') || new Map();

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
  const journalNumberByKey = useMemo(() => {
    const map = new Map();
    allItems
      .filter((pub) => pub.type === 'journal')
      .forEach((pub) => {
        const key = `${normalizeJournalKey(pub.journal || pub.venue)}::${pub.year || ''}`;
        const value = journalNumbers.get(pub.id);
        if (key && value && !map.has(key)) {
          map.set(key, value);
        }
      });
    return map;
  }, [allItems, journalNumbers]);
  const coverSlides = useMemo(() => {
    if (coverManifest.length) {
      return coverManifest.map((cover, index) => {
        const key = `${normalizeJournalKey(cover.journal)}::${cover.year || ''}`;
        return {
          ...cover,
          kind: 'manual',
          number: journalNumberByKey.get(key) || null,
          id: `${cover.id || cover.fileName || 'cover'}-${index}`
        };
      });
    }

    return journalItems.map((publication) => ({
      kind: 'publication',
      id: publication.id,
      publication,
      number: journalNumbers.get(publication.id) || null
    }));
  }, [coverManifest, journalItems, journalNumberByKey, journalNumbers]);
  const preprintItems = useMemo(
    () => allItems.filter((pub) => pub.type === 'preprint'),
    [allItems]
  );
  const showPreprintSection = filter === 'journal';
  const publicationYears = useMemo(
    () => [...new Set(items.map((item) => item.year).filter(Boolean))].sort((a, b) => b - a),
    [items]
  );
  const publicationPageGroups = useMemo(() => {
    const groups = [];
    for (let index = 0; index < publicationYears.length; index += 3) {
      const years = publicationYears.slice(index, index + 3);
      groups.push({
        label: years.join(' · '),
        years
      });
    }

    return groups;
  }, [publicationYears]);
  const activePublicationPage = publicationPageGroups[currentPublicationPage - 1] || publicationPageGroups[0];
  const paginatedPublicationItems = useMemo(
    () => items.filter((item) => activePublicationPage?.years.includes(item.year)),
    [activePublicationPage, items]
  );

  function handleFilterChange(value) {
    setCurrentPublicationPage(1);
    setFilter(value);
  }

  function handlePublicationPageChange(page) {
    if (page < 1 || page > publicationPageGroups.length || page === currentPublicationPage) {
      return;
    }
    setCurrentPublicationPage(page);
    window.requestAnimationFrame(() => {
      publicationListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <Tabs onValueChange={handleFilterChange} value={filter}>
        <PageHero description={content.description} title={content.title}>
          <PageSectionNav
            activeId={filter}
            ariaLabel="Publication categories"
            items={filters.map((type) => ({ id: type, label: labels[type] }))}
            onChange={handleFilterChange}
          />
        </PageHero>

        <TabsContent className="mt-6 md:mt-8" value={filter}>
          {loading ? <p className="rounded-md border border-dashed border-border p-4 text-base text-slate-600">{content.loading}</p> : null}
          {!loading && error ? <p className="rounded-md border border-red-200 bg-red-50 p-4 text-base text-red-700">{error}</p> : null}
          {!loading && !error && items.length === 0 ? (
            <p className="rounded-md border border-dashed border-border p-4 text-base text-slate-600">{content.empty}</p>
          ) : null}

          {!loading && !error && items.length > 0 ? (
            <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.84fr)_minmax(220px,0.62fr)] xl:items-start xl:gap-10">
              <div className="min-w-0 space-y-4">
                {showPreprintSection && currentPublicationPage === 1 ? (
                  <PreprintSection
                    labAuthorNames={labAuthorNames}
                    items={preprintItems}
                    title={content.preprintTitle || 'Current Manuscripts'}
                  />
                ) : null}
                <div className="scroll-mt-28 space-y-4" ref={publicationListRef}>
                  <PublicationList
                    items={paginatedPublicationItems}
                    labAuthorNames={labAuthorNames}
                    numbers={activeNumbers}
                    years={activePublicationPage?.years || []}
                  />
                  <PublicationPagination
                    currentPage={currentPublicationPage}
                    onPageChange={handlePublicationPageChange}
                    pageGroups={publicationPageGroups}
                    placement="bottom"
                  />
                </div>
              </div>

              <aside className="xl:self-start">
                <div className="xl:sticky xl:top-24">
                  <PublicationInfoPanel updatedAt={updatedAt} />

                  <section className="border-b border-slate-200 py-5">
                    <JournalCoverCarousel items={coverSlides} />
                  </section>

                  <div className="pt-5">
                    <ResearchProfileLinks links={researchProfileLinks} />
                  </div>
                </div>
              </aside>
            </div>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
