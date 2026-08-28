import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { ExternalLinkIcon } from '@/components/site/ExternalLinkIcon';
import { PageHero } from '@/components/site/PageHero';
import { PageSectionNav } from '@/components/site/PageSectionNav';
import { ResearchProfileLinks } from '@/components/site/ResearchProfileLinks';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { PUBLICATIONS_CONTENT } from '@/content/site-content';
import { loadPublicationCovers, loadPublications, loadResearchProfileLinks, publicationTypeLabels } from '@/lib/data';
import { formatItemNumber } from '@/lib/format';
import { responsiveImageProps } from '@/lib/responsive-images';
import { publicationPagePath, publicationPeriodSlug } from '@/lib/seo-paths';

const IMAGE_EXTENSIONS = ['webp', 'png', 'jpg', 'jpeg'];
const COVER_IMAGE_BASE = 'assets/img/publications/covers';
const SCHOLAR_URL = 'https://scholar.google.com/citations?user=F4hhc78AAAAJ&hl=en';
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

function isNamedAuthor(author, names = []) {
  const normalized = normalizeAuthorName(author).toLowerCase();
  if (!normalized) return false;
  return names.some((name) => normalizeAuthorName(name).toLowerCase() === normalized);
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
  const rawJournalName = String(publication?.journal || publication?.venue || '').trim();
  const journalName = /^(tbd|n\/?a|none|-+)$/i.test(rawJournalName) ? '' : rawJournalName;
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

function parseIsoDate(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3])
  };
}

function monthName(month) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' }).format(
    new Date(Date.UTC(2020, Math.max(0, Number(month) - 1), 1))
  );
}

function formatDateRange(startValue, endValue = '') {
  const start = parseIsoDate(startValue);
  const end = parseIsoDate(endValue) || start;
  if (!start) return '';
  if (start.year === end.year && start.month === end.month && start.day === end.day) {
    return `${monthName(start.month)} ${start.day}, ${start.year}`;
  }
  if (start.year === end.year && start.month === end.month) {
    return `${monthName(start.month)} ${start.day}–${end.day}, ${start.year}`;
  }
  if (start.year === end.year) {
    return `${monthName(start.month)} ${start.day}–${monthName(end.month)} ${end.day}, ${start.year}`;
  }
  return `${monthName(start.month)} ${start.day}, ${start.year}–${monthName(end.month)} ${end.day}, ${end.year}`;
}

function MetadataRow({ parts }) {
  if (!parts.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600">
      {parts.map((part, index) => (
        <span className="inline-flex items-center gap-x-2" key={part.key}>
          {index > 0 ? <span className="text-slate-400">·</span> : null}
          <span className={part.italic ? 'italic text-slate-700' : ''}>{part.value}</span>
        </span>
      ))}
    </div>
  );
}

function PublicationDoiLink({ publication }) {
  if (!publication?.doi) {
    return null;
  }

  return (
    <a
      className="site-text-link site-touch-target inline-flex shrink-0 items-center gap-1 text-sm"
      href={`https://doi.org/${publication.doi}`}
      rel="noreferrer"
      target="_blank"
    >
      DOI
      <ExternalLinkIcon className="ml-0" />
    </a>
  );
}

function compareChronologicalAsc(a, b) {
  const yearDelta = (a?.year || 0) - (b?.year || 0);
  if (yearDelta !== 0) {
    return yearDelta;
  }
  const aDate = String(a?.dateStart || a?.filingDate || '');
  const bDate = String(b?.dateStart || b?.filingDate || '');
  if (aDate || bDate) {
    const dateDelta = aDate.localeCompare(bDate);
    if (dateDelta !== 0) return dateDelta;
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

function PublicationInfoPanel({ scholarUrl = SCHOLAR_URL, type = 'journal', updatedAt }) {
  const isConference = type === 'conference';
  const isPatent = type === 'patent';

  return (
    <section className="site-rule-strong space-y-3 border-b pb-5 text-[0.8125rem] leading-relaxed text-slate-600">
      {isPatent ? (
        <p>Follow each patent title to view its publicly available application or registration record on Google Patents.</p>
      ) : isConference ? (
        <p>Conference presentations by Bae Lab members.</p>
      ) : (
        <p>
          View the complete publication record on{' '}
          <a className="site-text-link" href={scholarUrl} rel="noreferrer" target="_blank">
            Google Scholar<ExternalLinkIcon />
          </a>
          .
        </p>
      )}
      <p className="flex gap-2">
        <span className="font-semibold text-slate-800">Bold names</span>
        <span>{isConference ? 'Presenting authors' : isPatent ? 'Bae Lab inventors' : 'Bae Lab authors'}</span>
      </p>
      {!isPatent ? (
        <p className="flex gap-2">
          <span className="font-semibold text-slate-800">*</span>
          <span>Corresponding author</span>
        </p>
      ) : null}
      {type === 'journal' ? (
        <p className="flex gap-2">
          <span className="font-semibold text-slate-800">†</span>
          <span>Co-first author</span>
        </p>
      ) : null}
      {updatedAt ? <p className="text-slate-600">Updated {updatedAt}</p> : null}
    </section>
  );
}

function PreprintSection({ items, labAuthorNames, numberOffset = 0, title }) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="min-w-0">
      <h2 className="text-2xl font-semibold tracking-tight text-[var(--brand-burgundy)]">
        {title || 'Manuscripts in Progress'}
      </h2>
      {items.length ? (
        <ol className="site-rule-strong mt-4 border-t">
          {items.map((item, itemIndex) => {
            const number = numberOffset + items.length - itemIndex;
            const metadataParts = buildMetadataParts(item);
            return (
              <li className="site-list-row site-rule-soft grid grid-cols-[2.125rem_minmax(0,1fr)] gap-3 border-b" key={item.id}>
                <span className="site-meta-index pt-1">{formatItemNumber(number)}</span>
                <div className="space-y-2">
                  <p className="min-w-0 text-lg font-semibold leading-snug text-slate-950 [text-wrap:pretty] md:text-xl">
                    {item.localizedTitle}
                  </p>

                  <p className="site-copy-body">
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

                  {metadataParts.length || item.doi ? (
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600">
                      {metadataParts.map((part, index) => (
                        <span className="inline-flex items-center gap-x-2" key={`${item.id}-meta-${part.key}`}>
                          {index > 0 ? <span className="text-slate-400">·</span> : null}
                          <span className={part.italic ? 'italic text-slate-700' : ''}>{part.value}</span>
                        </span>
                      ))}
                      {metadataParts.length && item.doi ? <span className="text-slate-400">·</span> : null}
                      <PublicationDoiLink publication={item} />
                    </div>
                  ) : null}

                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="text-sm text-slate-600">No preprints added yet.</p>
      )}
    </section>
  );
}

function JournalCoverImage({ broken, eager = false, imageSrc, journalName, onError }) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      {!broken ? (
        <img
          {...responsiveImageProps(imageSrc, '232px')}
          alt={`${journalName} cover`}
          className="h-full w-full object-contain"
          decoding="async"
          loading={eager ? 'eager' : 'lazy'}
          onError={onError}
          src={imageSrc}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center border border-dashed border-slate-300 px-3 text-center text-xs font-medium text-slate-600">
          Cover
        </div>
      )}
    </div>
  );
}

function JournalCoverMeta({ dateLabel, journalName }) {
  return (
    <div className="site-media-caption min-w-0">
      <p className="min-w-0 text-[0.8125rem] font-semibold leading-snug text-slate-900">{formatJournalDisplayName(journalName)}</p>
      {dateLabel ? <p className="site-meta-context mt-1.5">{dateLabel}</p> : null}
    </div>
  );
}

function PublicationJournalCoverImage({ eager = false, publication }) {
  const imageBase = String(publication.coverImage || '').trim();
  const image = useImageFallback(imageBase ? `${COVER_IMAGE_BASE}/${imageBase}` : '');
  const journalName = publication.journal || publication.venue || '';

  return (
    <JournalCoverImage
      broken={!imageBase || image.broken}
      eager={eager}
      imageSrc={imageBase ? image.src : ''}
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
    setAutoPlay(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
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
    return <div className="content-state-row"><p className="content-state-label">Empty</p><p className="content-state-message">No journal covers available.</p></div>;
  }

  const cover = items[index];
  const journalName = cover.kind === 'manual' ? cover.journal || 'Journal Cover' : cover.publication.journal || cover.publication.venue || '';
  const dateLabel = cover.kind === 'manual' ? formatCoverDateLabel(cover) : cover.publication.year;
  const controls = total > 1 ? (
    <div className="flex shrink-0 items-center gap-0.5">
      <button
        aria-label="Previous journal cover"
        className="inline-flex h-11 w-11 items-center justify-center bg-transparent p-0 text-slate-600 transition-colors hover:text-[var(--brand-burgundy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-navy)]/35 sm:h-8 sm:w-7"
        onClick={goPrev}
        type="button"
      >
        <ChevronLeft aria-hidden="true" className="h-[1.125rem] w-[1.125rem]" />
      </button>
      <button
        aria-label="Next journal cover"
        className="inline-flex h-11 w-11 items-center justify-center bg-transparent p-0 text-slate-600 transition-colors hover:text-[var(--brand-burgundy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-navy)]/35 sm:h-8 sm:w-7"
        onClick={goNext}
        type="button"
      >
        <ChevronRight aria-hidden="true" className="h-[1.125rem] w-[1.125rem]" />
      </button>
    </div>
  ) : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Journal Covers</h2>
        {controls}
      </div>
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
                <ManualJournalCoverImage cover={item} eager={itemIndex === 0} />
              ) : (
                <PublicationJournalCoverImage eager={itemIndex === 0} publication={item.publication} />
              )}
            </div>
          ))}
        </div>
        <JournalCoverMeta dateLabel={dateLabel} journalName={journalName} />
      </article>
    </div>
  );
}

function PublicationPagination({ currentPage, pageGroups, placement, type }) {
  const pageCount = pageGroups.length;

  if (pageCount <= 1) {
    return null;
  }

  return (
    <nav
      aria-label={`Publication pagination ${placement}`}
      className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 py-1 sm:gap-x-7"
    >
      {currentPage > 1 ? (
        <Link
          aria-label="Previous publication period"
          className="inline-flex size-11 items-center justify-center text-slate-600 transition-colors hover:text-[var(--brand-burgundy)] sm:size-7"
          to={publicationPagePath(type, currentPage - 2, pageGroups[currentPage - 2]?.years)}
        >
          <ChevronLeft aria-hidden="true" className="size-4" strokeWidth={1.5} />
        </Link>
      ) : (
        <span aria-hidden="true" className="inline-flex size-11 items-center justify-center text-slate-300 sm:size-7">
          <ChevronLeft className="size-4" strokeWidth={1.5} />
        </span>
      )}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:gap-x-8">
        {pageGroups.map((group, index) => {
          const page = index + 1;
          return (
            <Link
              aria-current={page === currentPage ? 'page' : undefined}
              aria-label={`Publications from ${group.label}`}
              className={`page-section-tab no-underline ${page === currentPage ? 'font-semibold text-[var(--brand-burgundy)]' : ''}`}
              key={group.label}
              to={publicationPagePath(type, index, group.years)}
            >
              {group.years.length > 1 ? `${group.years[0]}–${group.years[group.years.length - 1]}` : group.years[0]}
            </Link>
          );
        })}
      </div>
      {currentPage < pageCount ? (
        <Link
          aria-label="Next publication period"
          className="inline-flex size-11 items-center justify-center text-slate-600 transition-colors hover:text-[var(--brand-burgundy)] sm:size-7"
          to={publicationPagePath(type, currentPage, pageGroups[currentPage]?.years)}
        >
          <ChevronRight aria-hidden="true" className="size-4" strokeWidth={1.5} />
        </Link>
      ) : (
        <span aria-hidden="true" className="inline-flex size-11 items-center justify-center text-slate-300 sm:size-7">
          <ChevronRight className="size-4" strokeWidth={1.5} />
        </span>
      )}
    </nav>
  );
}

function PublicationList({ items, numbers, labAuthorNames, years }) {
  return (
    <div className="space-y-8 md:space-y-10">
      {years.map((year) => {
        const yearItems = items.filter((item) => item.year === year);

        return (
        <section key={year}>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--brand-burgundy)]">{year}</h2>
          <ol className="site-rule-strong mt-4 border-t">
            {yearItems
              .sort((a, b) => (numbers.get(b.id) || 0) - (numbers.get(a.id) || 0))
              .map((pub) => {
                const number = numbers.get(pub.id) || '-';
                const metadataParts = buildMetadataParts(pub);

                return (
                  <li className="site-list-row site-rule-soft grid grid-cols-[2.125rem_minmax(0,1fr)] gap-3 border-b" key={pub.id}>
                    <span className="site-meta-index pt-1">{formatItemNumber(number)}</span>
                    <div className="space-y-2">
                      <p className="min-w-0 text-lg font-semibold leading-snug text-slate-950 [text-wrap:pretty] md:text-xl">
                        {pub.localizedTitle}
                      </p>

                      <p className="site-copy-body">
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

                      {metadataParts.length || pub.doi ? (
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600">
                          {metadataParts.map((part, index) => (
                            <span className="inline-flex items-center gap-x-2" key={`${pub.id}-meta-${part.key}`}>
                              {index > 0 ? <span className="text-slate-400">·</span> : null}
                              <span className={part.italic ? 'italic text-slate-700' : ''}>{part.value}</span>
                            </span>
                          ))}
                          {metadataParts.length && pub.doi ? <span className="text-slate-400">·</span> : null}
                          <PublicationDoiLink publication={pub} />
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

function ConferenceList({ items, numbers, years }) {
  return (
    <div className="space-y-8 md:space-y-10">
      {years.map((year) => {
        const yearItems = items
          .filter((item) => item.year === year)
          .sort((a, b) => (numbers.get(b.id) || 0) - (numbers.get(a.id) || 0));

        return (
          <section key={year}>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--brand-burgundy)]">{year}</h2>
            <ol className="site-rule-strong mt-4 border-t">
              {yearItems.map((item) => {
                const presenters = item.presenters || [];
                const correspondingAuthors = item.correspondingAuthors || [];
                const location = [item.city, item.country].filter(Boolean).join(', ');
                const date = formatDateRange(item.dateStart, item.dateEnd);
                const metadata = [
                  item.conference ? { key: 'conference', value: item.conference, italic: true } : null,
                  location ? { key: 'location', value: location } : null,
                  date ? { key: 'date', value: date } : null
                ].filter(Boolean);

                return (
                  <li className="site-list-row site-rule-soft grid grid-cols-[2.125rem_minmax(0,1fr)] gap-3 border-b" key={item.id}>
                    <span className="site-meta-index pt-[1.7rem]">{formatItemNumber(numbers.get(item.id) || '-')}</span>
                    <div className="min-w-0 space-y-2">
                      {item.presentationType ? (
                        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-slate-600">
                          {item.presentationType}
                        </p>
                      ) : null}
                      <p className="min-w-0 text-lg font-semibold leading-snug text-slate-950 [text-wrap:pretty] md:text-xl">
                        {item.localizedTitle}
                      </p>
                      <p className="site-copy-body">
                        {(item.authors || []).map((author, index) => {
                          const presenter = isNamedAuthor(author, presenters);
                          const corresponding = isNamedAuthor(author, correspondingAuthors);
                          return (
                            <span key={`${item.id}-conference-author-${author}-${index}`}>
                              <span className={presenter ? 'font-semibold text-slate-900' : ''}>
                                {normalizeAuthorName(author)}{corresponding ? '*' : ''}
                              </span>
                              {index < item.authors.length - 1 ? ', ' : ''}
                            </span>
                          );
                        })}
                        {item.authors?.length ? '.' : null}
                      </p>
                      <MetadataRow parts={metadata} />
                      {item.award ? <p className="text-sm font-semibold text-[var(--brand-burgundy)]">{item.award}</p> : null}
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

function PatentList({ items, numbers, labAuthorNames, years }) {
  return (
    <div className="space-y-8 md:space-y-10">
      {years.map((year) => {
        const yearItems = items
          .filter((item) => item.year === year)
          .sort((a, b) => (numbers.get(b.id) || 0) - (numbers.get(a.id) || 0));

        return (
          <section key={year}>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--brand-burgundy)]">{year}</h2>
            <ol className="site-rule-strong mt-4 border-t">
              {yearItems.map((item) => {
                const status = [item.stage, item.legalStatus].filter(Boolean).join(' · ');
                const recordNumber = item.stage === 'Granted'
                  ? item.publicationNumber || item.applicationNumber
                  : item.applicationNumber || item.publicationNumber;
                const filingDate = formatDateRange(item.filingDate);
                const metadata = [
                  item.jurisdiction ? { key: 'jurisdiction', value: item.jurisdiction } : null,
                  recordNumber ? { key: 'recordNumber', value: recordNumber } : null,
                  filingDate ? { key: 'filingDate', value: `Filed ${filingDate}` } : null
                ].filter(Boolean);
                const hasKicker = Boolean(status);

                return (
                  <li className="site-list-row site-rule-soft grid grid-cols-[2.125rem_minmax(0,1fr)] gap-3 border-b" key={item.id}>
                    <span className={`site-meta-index ${hasKicker ? 'pt-[1.7rem]' : 'pt-1'}`}>
                      {formatItemNumber(numbers.get(item.id) || '-')}
                    </span>
                    <div className="min-w-0 space-y-2">
                      {status ? (
                        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-slate-600">{status}</p>
                      ) : null}
                      <p className="min-w-0 text-lg font-semibold leading-snug text-slate-950 [text-wrap:pretty] md:text-xl">
                        {item.link ? (
                          <a className="transition-colors hover:text-[var(--brand-burgundy)]" href={item.link} rel="noreferrer" target="_blank">
                            {item.localizedTitle}<ExternalLinkIcon className="ml-1 inline-block align-baseline" />
                          </a>
                        ) : item.localizedTitle}
                      </p>
                      <p className="site-copy-body">
                        {(item.authors || []).map((author, index) => {
                          const highlight = isLabAuthor(author, labAuthorNames);
                          return (
                            <span key={`${item.id}-inventor-${author}-${index}`}>
                              <span className={highlight ? 'font-semibold text-slate-900' : ''}>{author}</span>
                              {index < item.authors.length - 1 ? ', ' : ''}
                            </span>
                          );
                        })}
                        {item.authors?.length ? '.' : null}
                      </p>
                      <MetadataRow parts={metadata} />
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
  const { periodSlug = '', typeSlug = '' } = useParams();
  const content = PUBLICATIONS_CONTENT[locale] || PUBLICATIONS_CONTENT.en;
  const labels = publicationTypeLabels(locale);
  const normalizedTypeSlug = String(typeSlug || '').toLowerCase();
  const filter = normalizedTypeSlug === 'patent' || normalizedTypeSlug === 'patents'
    ? 'patent'
    : ['conference', 'conferences', 'presentation', 'presentations'].includes(normalizedTypeSlug)
      ? 'conference'
      : 'journal';
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [coverManifest, setCoverManifest] = useState([]);
  const [researchProfileLinks, setResearchProfileLinks] = useState({});
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

  const filters = useMemo(() => ['journal', 'conference', 'patent'], []);

  const numbersByType = useMemo(() => {
    const types = ['journal', 'conference', 'patent', 'preprint'];
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
  const currentPublicationPage = useMemo(() => {
    if (!periodSlug) return 1;
    const index = publicationPageGroups.findIndex((group) => publicationPeriodSlug(group.years) === periodSlug);
    return index >= 0 ? index + 1 : 1;
  }, [periodSlug, publicationPageGroups]);
  const activePublicationPage = publicationPageGroups[currentPublicationPage - 1] || publicationPageGroups[0];
  const paginatedPublicationItems = useMemo(
    () => items.filter((item) => activePublicationPage?.years.includes(item.year)),
    [activePublicationPage, items]
  );

  return (
    <div>
      <Tabs value={filter}>
        <PageHero description={content.description} title={content.title}>
          <PageSectionNav
            activeId={filter}
            ariaLabel="Publication categories"
            items={filters.map((type) => ({
              id: type,
              label: type === 'journal' ? 'Papers' : labels[type],
              to: type === 'patent'
                ? '/publications/patents/'
                : type === 'conference'
                  ? '/publications/conferences/'
                  : '/publications/'
            }))}
          />
        </PageHero>

        <TabsContent className="page-content-offset" value={filter}>
          {loading ? <div className="content-state-row" role="status"><p className="content-state-label">Loading</p><p className="content-state-message">{content.loading}</p></div> : null}
          {!loading && error ? <div className="content-state-row is-error" role="alert"><p className="content-state-label">Error</p><p className="content-state-message">{error}</p></div> : null}
          {!loading && !error ? (
            <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_232px] lg:items-start lg:gap-8 xl:gap-10">
              <div className="min-w-0 space-y-8 md:space-y-10">
                {showPreprintSection && currentPublicationPage === 1 ? (
                  <PreprintSection
                    labAuthorNames={labAuthorNames}
                    items={preprintItems}
                    numberOffset={journalNumbers.size}
                    title={content.preprintTitle || 'Manuscripts in Progress'}
                  />
                ) : null}
                <div className="scroll-mt-28 space-y-4">
                  {items.length === 0 ? (
                    <div className="content-state-row">
                      <p className="content-state-label">{filter === 'conference' ? 'In preparation' : 'Empty'}</p>
                      <p className="content-state-message">
                        {filter === 'conference'
                          ? 'Verified conference presentation records will be published here as they are added.'
                          : content.empty}
                      </p>
                    </div>
                  ) : filter === 'conference' ? (
                    <ConferenceList
                      items={paginatedPublicationItems}
                      numbers={activeNumbers}
                      years={activePublicationPage?.years || []}
                    />
                  ) : filter === 'patent' ? (
                    <PatentList
                      items={paginatedPublicationItems}
                      labAuthorNames={labAuthorNames}
                      numbers={activeNumbers}
                      years={activePublicationPage?.years || []}
                    />
                  ) : (
                    <PublicationList
                      items={paginatedPublicationItems}
                      labAuthorNames={labAuthorNames}
                      numbers={activeNumbers}
                      years={activePublicationPage?.years || []}
                    />
                  )}
                  <PublicationPagination
                    currentPage={currentPublicationPage}
                    pageGroups={publicationPageGroups}
                    placement="bottom"
                    type={filter}
                  />
                </div>
              </div>

              <aside className="w-full lg:self-start">
                <div className="xl:sticky xl:top-24">
                  <PublicationInfoPanel
                    scholarUrl={researchProfileLinks.googleScholar || SCHOLAR_URL}
                    type={filter}
                    updatedAt={updatedAt}
                  />

                  <section className="site-rule-strong border-b py-5">
                    <div className="mx-auto w-full max-w-sm lg:max-w-none">
                      <JournalCoverCarousel items={coverSlides} />
                    </div>
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
