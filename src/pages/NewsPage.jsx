import { useEffect, useMemo, useState } from 'react';

import { PageHero } from '@/components/site/PageHero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NEWS_CONTENT } from '@/content/site-content';
import { loadNewsFeed } from '@/lib/data';

const IMAGE_EXTENSIONS = ['webp', 'png', 'jpg', 'jpeg'];
const SECTION_IDS = ['labNews', 'gallery', 'videos'];
const DEFAULT_SECTION_TABS = [
  { id: 'labNews', label: 'Lab News' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'videos', label: 'Videos' }
];
const LINK_META = [
  { key: 'linkedin', label: 'LinkedIn', short: 'in', color: '#0A66C2' },
  { key: 'webOfScience', label: 'Web of Science', short: 'WoS', color: '#111827' },
  { key: 'orcid', label: 'ORCID', short: 'iD', color: '#A6CE39' },
  { key: 'scopus', label: 'Scopus', short: 'SC', color: '#E9711C' },
  { key: 'googleScholar', label: 'Scholar', short: 'GS', color: '#1A73E8' },
  { key: 'researchGate', label: 'ResearchGate', short: 'RG', color: '#00CCBB' }
];

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

function MediaImage({ path, title }) {
  const image = useImageFallback(path);

  if (image.broken) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-md border border-slate-200 bg-slate-100 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
        Image
      </div>
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

function NewsItemRow({ closeLabel, item, onToggle, openLabel, opened }) {
  const youtubeEmbed = toYouTubeEmbedUrl(item.videoUrl);
  const hasDetailContent = Boolean(item.summary || item.url || item.videoUrl || (item.images || []).length);

  return (
    <li className="rounded-lg border border-slate-200 bg-white">
      <button
        className="w-full px-4 py-4 text-left transition-colors hover:bg-slate-50 md:px-5"
        onClick={onToggle}
        type="button"
      >
        <div className="grid gap-3 md:grid-cols-[118px_minmax(0,1fr)_auto] md:items-center">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#0d326f]">{item.date || '-'}</p>
          <div>
            <p className="text-base font-semibold leading-snug text-slate-950 md:text-[1.02rem]">{item.title}</p>
            {item.summary ? <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{item.summary}</p> : null}
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7a0f1f]">{opened ? closeLabel : openLabel}</span>
        </div>
      </button>

      {opened ? (
        <div className="border-t border-slate-200 px-4 pb-4 pt-3 md:px-5">
          <div className="space-y-3">
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

            {item.images?.length ? (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {item.images.map((path, index) => (
                  <MediaImage key={`${item.id}-image-${index}`} path={path} title={item.title} />
                ))}
              </div>
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
    setExpandedId('');
  }, [activeSection]);

  const activeItems = mergedSections[activeSection] || [];
  const activeLabel = sections.find((section) => section.id === activeSection)?.label || '';
  const emptySectionLabel = content.emptySection || 'No items available in this section yet.';
  const openLabel = content.openLabel || 'Open';
  const closeLabel = content.closeLabel || 'Close';
  const instagramTitle = content.instagramTitle || 'Lab Instagram';
  const instagramButton = content.instagramButton || 'Open profile';
  const piLinksTitle = content.piLinksTitle || 'Professor Profiles';
  const piLinksDescription = content.piLinksDescription || 'External research profiles and citation services.';
  const updatedAt = feed.updatedAt || content.updatedAt || '';
  const profileLinks = LINK_META.map((meta) => ({ ...meta, href: feed.piLinks?.[meta.key] })).filter((item) => item.href);
  const latestInstagramPost = (feed.instagram.recent || []).find((post) => (post.images || []).length) || (feed.instagram.recent || [])[0] || null;
  const latestInstagramImage = latestInstagramPost?.images?.[0] || '';

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHero description={content.description} title={content.title} />

      <div className="grid gap-5 xl:grid-cols-[minmax(230px,270px)_minmax(0,1fr)]">
        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-900">{content.sectionTitle || 'Sections'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
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

          <section className="space-y-3 px-1">
            <div className="flex items-center gap-2">
              <a
                aria-label={instagramTitle}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_107%,#fdf497_0%,#fdf497_5%,#fd5949_45%,#d6249f_60%,#285AEB_90%)]"
                href={feed.instagram.profileUrl || latestInstagramPost?.url || '#'}
                rel="noreferrer"
                target="_blank"
              >
                <span className="text-lg font-bold text-white">IG</span>
              </a>
              {latestInstagramPost?.date ? <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{latestInstagramPost.date}</p> : null}
            </div>

            {latestInstagramImage ? (
              <a className="block overflow-hidden rounded-lg border border-slate-200 bg-white" href={latestInstagramPost?.url || feed.instagram.profileUrl || '#'} rel="noreferrer" target="_blank">
                <MediaImage path={latestInstagramImage} title={latestInstagramPost?.title || 'Instagram'} />
              </a>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-xs text-slate-500">Instagram latest photo not available.</div>
            )}

            {feed.instagram.profileUrl ? (
              <a className="inline-flex text-sm font-semibold text-[#0d326f] underline-offset-2 hover:underline" href={feed.instagram.profileUrl} rel="noreferrer" target="_blank">
                {instagramButton} {feed.instagram.handle ? `(${feed.instagram.handle})` : ''}
              </a>
            ) : null}
          </section>

          <section className="space-y-2 px-1">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{piLinksTitle}</p>
            <div className="flex flex-wrap gap-2">
              {profileLinks.map((item) => (
                <a
                  aria-label={item.label}
                  className="inline-flex h-10 min-w-10 items-center justify-center rounded-full px-2 text-[11px] font-bold text-white transition-transform hover:-translate-y-0.5"
                  href={item.href}
                  key={item.key}
                  rel="noreferrer"
                  style={{ backgroundColor: item.color }}
                  target="_blank"
                  title={item.label}
                >
                  {item.short}
                </a>
              ))}
            </div>
            {profileLinks.length === 0 ? <p className="text-xs text-slate-500">{piLinksDescription}</p> : null}
          </section>
        </aside>

        <section className="space-y-3">
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
            <ul className="space-y-2">
              {activeItems.map((item) => (
                <NewsItemRow
                  closeLabel={closeLabel}
                  item={item}
                  key={item.id}
                  onToggle={() => setExpandedId((current) => (current === item.id ? '' : item.id))}
                  openLabel={openLabel}
                  opened={expandedId === item.id}
                />
              ))}
            </ul>
          ) : null}
        </section>
      </div>
    </div>
  );
}
