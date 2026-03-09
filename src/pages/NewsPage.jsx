import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { PageHero } from '@/components/site/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { NEWS_CONTENT } from '@/content/site-content';
import { loadNewsFeed } from '@/lib/data';

const IMAGE_EXTENSIONS = ['webp', 'png', 'jpg', 'jpeg'];
const SECTION_IDS = ['labNews', 'gallery', 'videos'];
const DEFAULT_SECTION_TABS = [
  { id: 'labNews', label: 'Lab News' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'videos', label: 'Videos' }
];
const PAGE_SIZE = 5;
const LINK_META = [
  { key: 'linkedin', label: 'LinkedIn', icon: 'assets/img/news/profiles/linkedin.ico' },
  { key: 'webOfScience', label: 'Web of Science', icon: 'assets/img/news/profiles/webofscience.ico' },
  { key: 'orcid', label: 'ORCID', icon: 'assets/img/news/profiles/orcid.svg' },
  { key: 'scopus', label: 'Scopus', icon: 'assets/img/news/profiles/scopus.svg' },
  { key: 'googleScholar', label: 'Google Scholar', icon: 'assets/img/news/profiles/googlescholar.svg' },
  { key: 'researchGate', label: 'ResearchGate', icon: 'assets/img/news/profiles/researchgate.svg' }
];

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
        <div className="flex h-16 w-16 items-center justify-center rounded-md border border-slate-200 bg-slate-100 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
          Image
        </div>
      );
    }

    if (variant === 'full') {
      return (
        <div className="flex min-h-52 w-full max-w-3xl items-center justify-center rounded-md border border-slate-200 bg-slate-100 px-3 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          Image
        </div>
      );
    }

    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-md border border-slate-200 bg-slate-100 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
        Image
      </div>
    );
  }

  if (variant === 'thumb') {
    return <img alt={title} className="h-16 w-16 rounded-md object-cover" onError={image.onError} src={image.src} />;
  }

  if (variant === 'full') {
    return (
      <img
        alt={title}
        className="h-auto max-h-[640px] w-full max-w-3xl rounded-md border border-slate-200 bg-white object-contain"
        onError={image.onError}
        src={image.src}
      />
    );
  }

  return <img alt={title} className="aspect-[4/3] w-full rounded-md object-cover" onError={image.onError} src={image.src} />;
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
      const id = parsed.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : '';
    }
  } catch {
    return '';
  }

  return '';
}

function NewsItemRow({ compactPreview = false, item, itemRef, onToggle, opened }) {
  const youtubeEmbed = toYouTubeEmbedUrl(item.videoUrl);
  const hasDetailContent = Boolean(item.summary || item.url || item.videoUrl || (item.images || []).length);
  const firstImage = item.images?.[0] || '';
  const toggleLabel = opened ? 'Collapse details' : 'View details';

  return (
    <li className="scroll-mt-28 rounded-lg border border-slate-200 bg-white" ref={itemRef}>
      <button
        aria-expanded={opened}
        className="w-full px-4 py-4 text-left transition-colors hover:bg-slate-50 md:px-5"
        onClick={onToggle}
        type="button"
      >
        <div className={`grid gap-3 md:items-center ${compactPreview ? 'md:grid-cols-[72px_minmax(0,1fr)_auto]' : 'md:grid-cols-[118px_minmax(0,1fr)_auto]'}`}>
          {compactPreview ? (
            <div className="flex items-center justify-center">
              <MediaImage path={firstImage} title={item.title} variant="thumb" />
            </div>
          ) : (
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#0d326f]">{item.date || '-'}</p>
          )}

          <div>
            <p className="text-base font-semibold leading-snug text-slate-950 md:text-[1.02rem]">{item.title}</p>
            {compactPreview ? <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#0d326f]">{item.date || '-'}</p> : null}
          </div>

          <span className="inline-flex items-center justify-center rounded-full border border-slate-200 p-1 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700">
            <ChevronDown className={`h-4 w-4 transition-transform ${opened ? 'rotate-180' : ''}`} />
            <span className="sr-only">{toggleLabel}</span>
          </span>
        </div>
      </button>

      {opened ? (
        <div className="border-t border-slate-200 px-4 pb-4 pt-3 md:px-5">
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
                <a className="inline-flex text-sm font-semibold text-[#0d326f] underline-offset-2 hover:underline" href={item.videoUrl} rel="noreferrer" target="_blank">
                  Open video
                </a>
              )
            ) : null}

            {item.url ? (
              <a className="inline-flex text-sm font-semibold text-[#0d326f] underline-offset-2 hover:underline" href={item.url} rel="noreferrer" target="_blank">
                Source link
              </a>
            ) : null}

            {!hasDetailContent ? <p className="text-sm text-slate-500">No additional details yet.</p> : null}
          </div>
        </div>
      ) : null}
    </li>
  );
}

export function NewsPage({ locale }) {
  const location = useLocation();
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
    },
    piLinks: {
      linkedin: '',
      webOfScience: '',
      orcid: '',
      scopus: '',
      googleScholar: '',
      researchGate: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('labNews');
  const [expandedId, setExpandedId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const listTopRef = useRef(null);
  const itemRefs = useRef(new Map());

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
    if (!sections.find((section) => section.id === activeSection)) {
      setActiveSection(sections[0]?.id || 'labNews');
    }
  }, [sections, activeSection]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const requested = String(params.get('section') || '').trim();
    if (SECTION_IDS.includes(requested) && requested !== activeSection) {
      setActiveSection(requested);
    }
  }, [location.search, activeSection]);

  useEffect(() => {
    setExpandedId('');
    setCurrentPage(1);
  }, [activeSection]);

  const activeItems = mergedSections[activeSection] || [];
  const pageCount = Math.max(1, Math.ceil(activeItems.length / PAGE_SIZE));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return activeItems.slice(start, start + PAGE_SIZE);
  }, [activeItems, currentPage]);

  function smoothScrollTo(node) {
    if (typeof window === 'undefined') {
      return;
    }
    node?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function smoothScrollToPageTop() {
    if (typeof window === 'undefined') {
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  useEffect(() => {
    if (currentPage > pageCount) {
      setCurrentPage(pageCount);
    }
  }, [currentPage, pageCount]);

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

  function handlePageChange(page) {
    const next = Math.min(Math.max(1, page), pageCount);
    setCurrentPage(next);
    setExpandedId('');
    window.requestAnimationFrame(() => {
      smoothScrollToPageTop();
    });
  }

  const activeLabel = sections.find((section) => section.id === activeSection)?.label || '';
  const emptySectionLabel = content.emptySection || 'No items available in this section yet.';
  const piLinksDescription = content.piLinksDescription || 'External research profiles and citation services.';
  const updatedAt = feed.updatedAt || content.updatedAt || '';
  const profileLinks = LINK_META.map((meta) => ({ ...meta, href: feed.piLinks?.[meta.key] })).filter((item) => item.href);
  const latestInstagramPost = (feed.instagram.recent || []).find((post) => (post.images || []).length) || (feed.instagram.recent || [])[0] || null;
  const latestInstagramImage = latestInstagramPost?.images?.[0] || '';
  const latestInstagramPermalink = normalizeInstagramPermalink(latestInstagramPost?.url);
  const latestInstagramEmbedUrl = toInstagramEmbedUrl(latestInstagramPost?.url);

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHero description={content.description} title={content.title} />

      <div className="grid gap-5 lg:grid-cols-[minmax(194px,232px)_minmax(0,1fr)]">
        <aside className="order-2 space-y-4 lg:order-1 lg:sticky lg:top-24 lg:self-start">
          <Card className="border-slate-200 bg-white">
            <CardContent className="space-y-2 pt-4">
              {sections.map((section) => (
                <button
                  className={`w-full rounded-md border px-3 py-2 text-left text-sm font-semibold transition-colors ${
                    activeSection === section.id
                      ? 'border-[#7a0f1f] bg-[#7a0f1f] text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  type="button"
                >
                  {section.label}
                </button>
              ))}
            </CardContent>
          </Card>

          <section className="space-y-2 px-1">
            <div className="flex flex-wrap justify-center gap-2">
              {profileLinks.map((item) => (
                <a
                  aria-label={item.label}
                  className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white transition-transform hover:-translate-y-0.5 hover:border-slate-300"
                  href={item.href}
                  key={item.key}
                  rel="noreferrer"
                  target="_blank"
                  title={item.label}
                >
                  <img
                    alt={item.label}
                    className="h-full w-full object-contain p-1.5"
                    src={`${import.meta.env.BASE_URL}${item.icon}`}
                  />
                </a>
              ))}
            </div>
            {profileLinks.length === 0 ? <p className="text-xs text-slate-500">{piLinksDescription}</p> : null}
          </section>

          <section className="space-y-3 px-1">
            {latestInstagramEmbedUrl ? (
              <>
                <div className="mx-auto hidden w-full max-w-[248px] overflow-hidden rounded-lg border border-slate-200 bg-white p-1.5 xl:block">
                  <iframe
                    allowTransparency
                    className="block w-full"
                    loading="lazy"
                    scrolling="no"
                    src={latestInstagramEmbedUrl}
                    style={{ border: 0, height: '460px' }}
                    title={latestInstagramPost?.title || 'Instagram embed'}
                  />
                </div>
                <a
                  className="mx-auto block w-full max-w-[248px] overflow-hidden rounded-lg border border-slate-200 bg-white xl:hidden"
                  href={latestInstagramPermalink || feed.instagram.profileUrl || '#'}
                  rel="noreferrer"
                  target="_blank"
                >
                  {latestInstagramImage ? (
                    <MediaImage path={latestInstagramImage} title={latestInstagramPost?.title || 'Instagram'} />
                  ) : (
                    <div className="p-3 text-xs text-slate-500">Open latest Instagram post</div>
                  )}
                </a>
              </>
            ) : latestInstagramImage ? (
              <a className="mx-auto block w-full max-w-[248px] overflow-hidden rounded-lg border border-slate-200 bg-white" href={latestInstagramPermalink || feed.instagram.profileUrl || '#'} rel="noreferrer" target="_blank">
                <MediaImage path={latestInstagramImage} title={latestInstagramPost?.title || 'Instagram'} />
              </a>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-xs text-slate-500">Instagram latest photo not available.</div>
            )}
          </section>
        </aside>

        <section className="order-1 space-y-3 lg:order-2" ref={listTopRef}>
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{activeLabel}</h2>
            <div className="text-right text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              <p>{activeItems.length} items</p>
              {updatedAt ? <p className="mt-1">Updated {updatedAt}</p> : null}
            </div>
          </div>

          {loading ? <p className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-base text-slate-600">Loading news feed...</p> : null}
          {!loading && error ? <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-base text-red-700">{error}</p> : null}
          {!loading && !error && activeItems.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-base text-slate-600">{emptySectionLabel}</p>
          ) : null}

          {!loading && !error && activeItems.length > 0 ? (
            <div className="space-y-3">
              <ul className="space-y-2">
                {paginatedItems.map((item) => (
                  <NewsItemRow
                    compactPreview={activeSection === 'labNews'}
                    item={item}
                    itemRef={(node) => {
                      if (node) {
                        itemRefs.current.set(item.id, node);
                      } else {
                        itemRefs.current.delete(item.id);
                      }
                    }}
                    key={item.id}
                    onToggle={() => handleToggleItem(item.id)}
                    opened={expandedId === item.id}
                  />
                ))}
              </ul>

              {pageCount > 1 ? (
                <nav aria-label="News pagination" className="flex flex-wrap items-center gap-2">
                  <button
                    className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    type="button"
                  >
                    Prev
                  </button>
                  {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                    <button
                      className={`rounded-md border px-3 py-1.5 text-sm font-semibold ${
                        page === currentPage
                          ? 'border-[#7a0f1f] bg-[#7a0f1f] text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                      key={page}
                      onClick={() => handlePageChange(page)}
                      type="button"
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={currentPage === pageCount}
                    onClick={() => handlePageChange(currentPage + 1)}
                    type="button"
                  >
                    Next
                  </button>
                </nav>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
