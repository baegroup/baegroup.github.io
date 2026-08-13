import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';

import { PageHero } from '@/components/site/PageHero';
import { PageSectionNav } from '@/components/site/PageSectionNav';
import { NEWS_CONTENT } from '@/content/site-content';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { loadNewsFeed } from '@/lib/data';
import { formatItemNumber } from '@/lib/format';
import {
  NEWS_SLUG_SECTIONS,
  newsItemPath,
  newsItemSlug,
  newsSectionPath
} from '@/lib/seo-paths';

const IMAGE_EXTENSIONS = ['webp', 'png', 'jpg', 'jpeg'];
const SECTION_IDS = ['labNews', 'gallery', 'videos'];
const DEFAULT_SECTION_TABS = [
  { id: 'labNews', label: 'Highlights' },
  { id: 'gallery', label: 'Lab Life' },
  { id: 'videos', label: 'Video' }
];
const DEFAULT_PAGE_SIZE = 5;
const VIDEOS_PAGE_SIZE = 4;

function normalizeInstagramPermalink(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }

  try {
    const parsed = new URL(raw);
    const host = parsed.hostname.toLowerCase();
    if (!host.includes('instagram.com')) {
      return '';
    }

    const parts = parsed.pathname.split('/').filter(Boolean);
    const type = String(parts[0] || '').toLowerCase();
    const shortcode = String(parts[1] || '').trim();
    if (!shortcode || !['p', 'reel'].includes(type)) {
      return '';
    }

    return `https://www.instagram.com/${type}/${shortcode}/`;
  } catch {
    return '';
  }
}

function toInstagramEmbedUrl(value) {
  const permalink = normalizeInstagramPermalink(value);
  return permalink ? `${permalink}embed/` : '';
}

function toTimestamp(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return 0;
  }

  const parsed = Date.parse(raw);
  if (Number.isFinite(parsed)) {
    return parsed;
  }

  const parts = raw.split(/[./-]/).filter(Boolean);
  const year = Number(parts[0]) || 0;
  const month = Math.min(12, Math.max(1, Number(parts[1]) || 1));
  const day = Math.min(31, Math.max(1, Number(parts[2]) || 1));
  return Date.UTC(year, month - 1, day);
}

function hasImageExtension(path) {
  return /\.[a-z0-9]{3,4}($|\?)/i.test(String(path || '').trim());
}

function useImageFallback(assetPath) {
  const candidates = useMemo(() => {
    const raw = String(assetPath || '').trim();
    if (!raw) {
      return [];
    }
    if (/^https?:\/\//i.test(raw)) {
      return [raw];
    }

    if (hasImageExtension(raw)) {
      return [`${import.meta.env.BASE_URL}${raw}`];
    }

    return IMAGE_EXTENSIONS.map((ext) => `${import.meta.env.BASE_URL}${raw}.${ext}`);
  }, [assetPath]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [assetPath]);

  const broken = index >= candidates.length;
  const src = broken ? '' : candidates[index];

  const onError = () => {
    setIndex((prev) => prev + 1);
  };

  return { broken, src, onError };
}

function MediaImage({ path, title, variant = 'card' }) {
  const image = useImageFallback(path);

  if (image.broken) {
    if (variant === 'thumb') {
      return (
        <div className="flex h-16 w-16 items-center justify-center border border-slate-200 bg-slate-100 text-[10px] font-medium text-slate-500 md:h-[72px] md:w-[72px]">
          Image
        </div>
      );
    }

    if (variant === 'full') {
      return (
        <div className="flex min-h-52 w-full max-w-3xl items-center justify-center rounded-md border border-slate-200 bg-slate-100 px-3 text-xs font-medium text-slate-500">
          Image
        </div>
      );
    }

    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-md border border-slate-200 bg-slate-100 text-xs font-medium text-slate-500">
        Image
      </div>
    );
  }

  if (variant === 'thumb') {
    return <img alt={title} className="h-16 w-16 object-cover md:h-[72px] md:w-[72px]" decoding="async" loading="lazy" onError={image.onError} src={image.src} />;
  }

  if (variant === 'full') {
    return (
      <img
        alt={title}
        className="h-auto max-h-[640px] w-full max-w-3xl rounded-md border border-slate-200 bg-white object-contain"
        decoding="async"
        loading="lazy"
        onError={image.onError}
        src={image.src}
      />
    );
  }

  return <img alt={title} className="aspect-[4/3] w-full rounded-md object-cover" decoding="async" loading="lazy" onError={image.onError} src={image.src} />;
}

function toYouTubeEmbedUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }

  if (raw.includes('youtube.com/embed/')) {
    return raw;
  }

  try {
    const parsed = new URL(raw);
    const host = parsed.hostname.toLowerCase();

    if (host.includes('youtu.be')) {
      const id = parsed.pathname.replace(/^\/+/, '').trim();
      return id ? `https://www.youtube.com/embed/${id}` : '';
    }

    if (host.includes('youtube.com')) {
      if (parsed.pathname.startsWith('/shorts/')) {
        const id = parsed.pathname.replace('/shorts/', '').replace(/\/+$/, '').trim();
        return id ? `https://www.youtube.com/embed/${id}` : '';
      }
      const id = parsed.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : '';
    }
  } catch {
    return '';
  }

  return '';
}

function VideoCard({ detailPath, item, number }) {
  const primaryVideoUrl = item.videoUrl || item.url;
  const youtubeEmbed = toYouTubeEmbedUrl(primaryVideoUrl);
  const fallbackImage = item.images?.[0] || '';

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 bg-slate-100">
        {youtubeEmbed ? (
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="aspect-video w-full"
            src={youtubeEmbed}
            title={`${item.title} video`}
          />
        ) : fallbackImage ? (
          <MediaImage path={fallbackImage} title={item.title} />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center px-4 text-center text-sm text-slate-500">Video preview not available.</div>
        )}
      </div>

      <div className="grid grid-cols-[2.125rem_minmax(0,1fr)] gap-3 p-4">
        <span className="pt-0.5 text-xs font-semibold tracking-[0.04em] text-[var(--brand-burgundy)] tabular-nums">{formatItemNumber(number)}</span>
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--brand-navy)]">{item.date || '-'}</p>
          <h3 className="text-xl font-semibold leading-snug text-slate-950">
            <Link className="no-underline hover:text-[var(--brand-burgundy)]" reloadDocument to={detailPath}>{item.title}</Link>
          </h3>
          {item.summary ? <p className="text-sm leading-relaxed text-slate-600">{item.summary}</p> : null}
          {primaryVideoUrl ? (
            <a className="site-text-link inline-flex text-sm" href={primaryVideoUrl} rel="noreferrer" target="_blank">
              Open video source
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function NewsItemRow({ compactPreview = false, detailPath, item, itemRef, number, onToggle, opened }) {
  const youtubeEmbed = toYouTubeEmbedUrl(item.videoUrl || item.url);
  const hasDetailContent = Boolean(item.summary || item.url || item.videoUrl || (item.images || []).length);
  const firstImage = item.images?.[0] || '';
  const toggleLabel = opened ? 'Collapse details' : 'View details';

  return (
    <li className="scroll-mt-28" ref={itemRef}>
      <div className="w-full px-1 py-4 text-left transition-colors hover:bg-white/40 md:px-2 md:py-5">
        <div className={`grid items-center gap-3 ${compactPreview ? 'grid-cols-[2.125rem_64px_minmax(0,1fr)_auto] md:grid-cols-[2.125rem_72px_minmax(0,1fr)_auto] md:gap-4' : 'grid-cols-[2.125rem_minmax(0,1fr)_auto]'}`}>
          <span className="text-xs font-semibold tracking-[0.04em] text-[var(--brand-burgundy)] tabular-nums">{formatItemNumber(number)}</span>
          {compactPreview ? (
            <div className="flex items-center justify-center">
              <MediaImage path={firstImage} title={item.title} variant="thumb" />
            </div>
          ) : null}

          <div>
            <p className="text-xs font-medium text-[var(--brand-navy)]">{item.date || '-'}</p>
            <p className="mt-1 text-base font-semibold leading-snug text-slate-950 md:text-[1.02rem]">
              <Link className="no-underline hover:text-[var(--brand-burgundy)]" reloadDocument to={detailPath}>{item.title}</Link>
            </p>
          </div>

          <button
            aria-expanded={opened}
            className="inline-flex items-center justify-center text-slate-600 transition-colors hover:text-slate-900"
            onClick={onToggle}
            type="button"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${opened ? 'rotate-180' : ''}`} />
            <span className="sr-only">{toggleLabel}</span>
          </button>
        </div>
      </div>

      {opened ? (
        <div className="border-t border-slate-200/80 px-1 pb-5 pt-4 md:px-2">
          <div className="space-y-4">
            {item.summary ? <p className="text-sm leading-relaxed text-slate-700 md:text-base">{item.summary}</p> : null}

            {item.images?.length ? (
              <div className="flex flex-col items-center gap-3">
                {item.images.map((path, index) => (
                  <MediaImage key={`${item.id}-image-${index}`} path={path} title={item.title} variant="full" />
                ))}
              </div>
            ) : null}

            {item.videoUrl ? (
              youtubeEmbed ? (
                <div className="overflow-hidden rounded-md border border-slate-200">
                  <iframe
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="aspect-video w-full"
                    src={youtubeEmbed}
                    title={`${item.title} video`}
                  />
                </div>
              ) : (
                <a className="site-text-link inline-flex text-sm" href={item.videoUrl} rel="noreferrer" target="_blank">
                  Open video
                </a>
              )
            ) : null}

            {item.url ? (
              <a className="site-text-link inline-flex text-sm" href={item.url} rel="noreferrer" target="_blank">
                Source link
              </a>
            ) : null}

            {!hasDetailContent ? <p className="text-sm text-slate-600">No additional details yet.</p> : null}
          </div>
        </div>
      ) : null}
    </li>
  );
}

function NewsDetail({ item, section }) {
  const primaryVideoUrl = item.videoUrl || item.url;
  const youtubeEmbed = toYouTubeEmbedUrl(primaryVideoUrl);

  return (
    <article className="space-y-7 md:space-y-9">
      <PageHero description={item.summary} showDescription={Boolean(item.summary)} title={item.title} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-10">
        <div className="space-y-6">
          {item.date ? (
            <time className="block text-sm font-semibold text-[var(--brand-navy)]" dateTime={item.date}>{item.date}</time>
          ) : null}

          {item.images?.length ? (
            <div className="flex flex-col items-center gap-5">
              {item.images.map((path, index) => (
                <MediaImage key={`${item.id}-detail-image-${index}`} path={path} title={item.title} variant="full" />
              ))}
            </div>
          ) : null}

          {item.videoUrl ? (
            youtubeEmbed ? (
              <div className="overflow-hidden rounded-md border border-slate-200">
                <iframe
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="aspect-video w-full"
                  loading="lazy"
                  src={youtubeEmbed}
                  title={`${item.title} video`}
                />
              </div>
            ) : (
              <a className="site-text-link inline-flex text-sm" href={item.videoUrl} rel="noreferrer" target="_blank">Open video</a>
            )
          ) : null}

          {item.url ? (
            <a className="site-text-link inline-flex text-sm" href={item.url} rel="noreferrer" target="_blank">Source link</a>
          ) : null}
        </div>

        <aside className="border-t border-slate-200 pt-4 lg:border-t-0 lg:pt-0">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Bae Lab News</p>
          <Link className="site-action-link mt-3 inline-flex" to={newsSectionPath(section)}>Back to {section === 'gallery' ? 'Lab Life' : section === 'videos' ? 'Video' : 'Highlights'}</Link>
        </aside>
      </div>
    </article>
  );
}

export function NewsPage({ locale }) {
  const location = useLocation();
  const { itemSlug = '', pageNumber = '', sectionSlug = '' } = useParams();
  const content = NEWS_CONTENT[locale] || NEWS_CONTENT.en;
  const [feed, setFeed] = useState({
    updatedAt: '',
    sections: {
      labNews: [],
      gallery: [],
      videos: []
    },
    instagram: {
      handle: '',
      profileUrl: '',
      recent: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState('');
  const listTopRef = useRef(null);
  const itemRefs = useRef(new Map());

  const legacyRequestedSection = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const requested = String(params.get('section') || '').trim();
    return SECTION_IDS.includes(requested) ? requested : '';
  }, [location.search]);
  const activeSection = NEWS_SLUG_SECTIONS[sectionSlug] || legacyRequestedSection || 'labNews';
  const currentPage = Math.max(1, Number(pageNumber) || 1);

  useEffect(() => {
    let mounted = true;

    async function run() {
      setLoading(true);
      setError('');
      try {
        const data = await loadNewsFeed();
        if (!mounted) {
          return;
        }
        setFeed(data);
      } catch (err) {
        if (!mounted) {
          return;
        }
        setError(err.message || 'Failed to load news feed');
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
  }, []);

  const fallbackLabNews = useMemo(
    () =>
      (content.items || [])
        .map((item, index) => ({
          id: `fallback-news-${index + 1}`,
          date: item.date,
          title: item.title,
          summary: item.body,
          images: [],
          videoUrl: '',
          url: ''
        }))
        .sort((a, b) => {
          const dateDelta = toTimestamp(b.date) - toTimestamp(a.date);
          if (dateDelta !== 0) {
            return dateDelta;
          }
          return String(a.title || '').localeCompare(String(b.title || ''));
        }),
    [content.items]
  );

  const sections = useMemo(() => {
    const configured = Array.isArray(content.sectionTabs) ? content.sectionTabs : [];
    const available = configured
      .map((tab) => ({
        id: String(tab.id || '').trim(),
        label: String(tab.label || '').trim()
      }))
      .filter((tab) => SECTION_IDS.includes(tab.id) && tab.label);

    return available.length ? available : DEFAULT_SECTION_TABS;
  }, [content.sectionTabs]);

  const mergedSections = useMemo(() => {
    const source = feed.sections || {};
    return {
      labNews: source.labNews?.length ? source.labNews : fallbackLabNews,
      gallery: source.gallery || [],
      videos: source.videos || []
    };
  }, [feed.sections, fallbackLabNews]);

  useEffect(() => {
    setExpandedId('');
  }, [activeSection]);

  const activeItems = mergedSections[activeSection] || [];
  const pageSize = activeSection === 'videos' ? VIDEOS_PAGE_SIZE : DEFAULT_PAGE_SIZE;
  const pageCount = Math.max(1, Math.ceil(activeItems.length / pageSize));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return activeItems.slice(start, start + pageSize);
  }, [activeItems, currentPage, pageSize]);

  function smoothScrollTo(node) {
    if (typeof window === 'undefined') {
      return;
    }
    node?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleToggleItem(itemId) {
    const willOpen = expandedId !== itemId;
    setExpandedId(willOpen ? itemId : '');
    if (willOpen) {
      window.requestAnimationFrame(() => {
        const target = itemRefs.current.get(itemId);
        smoothScrollTo(target);
      });
      window.setTimeout(() => {
        const target = itemRefs.current.get(itemId);
        smoothScrollTo(target);
      }, 180);
    }
  }

  const emptySectionLabel = content.emptySection || 'No items available in this section yet.';
  const updatedAt = feed.updatedAt || content.updatedAt || '';
  const latestInstagramPost = (feed.instagram.recent || []).find((post) => (post.images || []).length) || (feed.instagram.recent || [])[0] || null;
  const latestInstagramImage = latestInstagramPost?.images?.[0] || '';
  const latestInstagramPermalink = normalizeInstagramPermalink(latestInstagramPost?.url);
  const latestInstagramEmbedUrl = toInstagramEmbedUrl(latestInstagramPost?.url);
  const contentReveal = useScrollReveal(40);
  const detailItem = itemSlug
    ? activeItems.find((item) => newsItemSlug(item) === itemSlug)
    : null;

  if (!loading && itemSlug) {
    if (detailItem) {
      return <NewsDetail item={detailItem} section={activeSection} />;
    }

    return (
      <div className="space-y-6">
        <PageHero title="News item not found" />
        <p className="text-base text-slate-700">This news item is no longer available.</p>
        <Link className="site-action-link" to={newsSectionPath(activeSection)}>Back to News</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHero description={content.description} title={content.title}>
        <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-5 gap-y-2">
          <PageSectionNav
            activeId={activeSection}
            ariaLabel="News categories"
            items={sections.map((section) => ({ ...section, to: newsSectionPath(section.id) }))}
          />
          <p aria-live="polite" className="ml-auto text-right text-[0.7rem] font-normal text-slate-600">
            <span>{activeItems.length} items</span>
            {updatedAt ? (
              <>
                <span aria-hidden="true" className="mx-2 text-slate-300">·</span>
                <span>Updated {updatedAt}</span>
              </>
            ) : null}
          </p>
        </div>
      </PageHero>

      <div className={`grid gap-6 lg:grid-cols-[minmax(0,1fr)_232px] lg:items-start lg:gap-8 xl:gap-10 ${contentReveal.revealClassName}`} ref={contentReveal.ref} style={contentReveal.revealStyle}>
        <aside className="order-2 lg:self-start">
          <div className="space-y-4 xl:sticky xl:top-28">
            {latestInstagramEmbedUrl || latestInstagramImage ? (
              <section className="space-y-3">
                {latestInstagramEmbedUrl ? (
                  <div className="mx-auto w-full max-w-[340px] overflow-hidden rounded-lg border border-slate-200 bg-white lg:h-[401px] lg:max-w-[232px]">
                    <div className="h-[590px] w-full lg:w-[340px] lg:origin-top-left lg:scale-[0.676]">
                      <iframe
                        allowTransparency
                        className="block h-full w-full"
                        loading="lazy"
                        scrolling="no"
                        src={latestInstagramEmbedUrl}
                        style={{ border: 0 }}
                        title={latestInstagramPost?.title || 'Instagram embed'}
                      />
                    </div>
                  </div>
                ) : (
                  <a className="mx-auto block w-full max-w-[340px] overflow-hidden rounded-lg border border-slate-200 bg-white lg:max-w-[232px]" href={latestInstagramPermalink || feed.instagram.profileUrl || '#'} rel="noreferrer" target="_blank">
                    <MediaImage path={latestInstagramImage} title={latestInstagramPost?.title || 'Instagram'} />
                  </a>
                )}
              </section>
            ) : null}
          </div>
        </aside>

        <section className="order-1 space-y-3" ref={listTopRef}>
          {loading ? <p className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-base text-slate-600">Loading news feed...</p> : null}
          {!loading && error ? <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-base text-red-700">{error}</p> : null}
          {!loading && !error && activeItems.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-base text-slate-600">{emptySectionLabel}</p>
          ) : null}

          {!loading && !error && activeItems.length > 0 ? (
            <div className="space-y-3">
              {activeSection === 'videos' ? (
                <ol className="grid gap-4 md:grid-cols-2">
                  {paginatedItems.map((item, index) => (
                    <li key={item.id}>
                      <VideoCard
                        detailPath={newsItemPath(activeSection, item)}
                        item={item}
                        number={activeItems.length - ((currentPage - 1) * pageSize + index)}
                      />
                    </li>
                  ))}
                </ol>
              ) : (
                <ol className="divide-y divide-slate-200 border-y border-slate-200">
                  {paginatedItems.map((item, index) => (
                    <NewsItemRow
                      compactPreview={activeSection === 'labNews' || activeSection === 'gallery'}
                      detailPath={newsItemPath(activeSection, item)}
                      item={item}
                      itemRef={(node) => {
                        if (node) {
                          itemRefs.current.set(item.id, node);
                        } else {
                          itemRefs.current.delete(item.id);
                        }
                      }}
                      key={item.id}
                      number={activeItems.length - ((currentPage - 1) * pageSize + index)}
                      onToggle={() => handleToggleItem(item.id)}
                      opened={expandedId === item.id}
                    />
                  ))}
                </ol>
              )}

              {pageCount > 1 ? (
                <nav aria-label="News pagination" className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  {currentPage > 1 ? (
                    <Link className="page-section-tab no-underline" to={newsSectionPath(activeSection, currentPage - 1)}>Prev</Link>
                  ) : <span className="page-section-tab opacity-40">Prev</span>}
                  {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                    <Link
                      aria-current={page === currentPage ? 'page' : undefined}
                      className={`page-section-tab ${page === currentPage ? 'font-semibold text-slate-900' : ''}`}
                      key={page}
                      to={newsSectionPath(activeSection, page)}
                    >
                      {page}
                    </Link>
                  ))}
                  {currentPage < pageCount ? (
                    <Link className="page-section-tab no-underline" to={newsSectionPath(activeSection, currentPage + 1)}>Next</Link>
                  ) : <span className="page-section-tab opacity-40">Next</span>}
                </nav>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
