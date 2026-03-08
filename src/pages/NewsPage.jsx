import { useEffect, useMemo, useState } from 'react';

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
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'webOfScience', label: 'Web of Science ResearcherID' },
  { key: 'orcid', label: 'ORCID' },
  { key: 'scopus', label: 'Scopus' },
  { key: 'googleScholar', label: 'Google Scholar' },
  { key: 'researchGate', label: 'ResearchGate' }
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
            <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{item.summary}</p>
          </div>
          {hasDetailContent ? <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7a0f1f]">{opened ? closeLabel : openLabel}</span> : null}
        </div>
      </button>

      {opened && hasDetailContent ? (
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
  const instagramDescription = content.instagramDescription || 'Latest updates from our lab account.';
  const instagramButton = content.instagramButton || 'Open profile';
  const piLinksTitle = content.piLinksTitle || 'Professor Profiles';
  const piLinksDescription = content.piLinksDescription || 'External research profiles and citation services.';
  const updatedAt = feed.updatedAt || content.updatedAt || '';

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-[#243445] px-6 py-7 text-white md:px-8 md:py-9">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{content.title}</h1>
        {content.description ? <p className="mt-3 max-w-4xl text-base leading-relaxed text-slate-200 md:text-lg">{content.description}</p> : null}
      </section>

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

          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-900">{instagramTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <p>{instagramDescription}</p>
              {feed.instagram.profileUrl ? (
                <a className="inline-flex text-sm font-semibold text-[#0d326f] underline-offset-2 hover:underline" href={feed.instagram.profileUrl} rel="noreferrer" target="_blank">
                  {instagramButton} {feed.instagram.handle ? `(${feed.instagram.handle})` : ''}
                </a>
              ) : null}

              {feed.instagram.recent?.length ? (
                <ul className="space-y-2 border-t border-slate-200 pt-2">
                  {feed.instagram.recent.slice(0, 5).map((post) => {
                    const href = post.url || feed.instagram.profileUrl;
                    return (
                      <li key={post.id}>
                        {href ? (
                          <a className="block rounded-md border border-slate-200 bg-slate-50 px-3 py-2 hover:bg-slate-100" href={href} rel="noreferrer" target="_blank">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0d326f]">{post.date || '-'}</p>
                            <p className="mt-0.5 text-sm font-semibold leading-snug text-slate-900">{post.title}</p>
                          </a>
                        ) : (
                          <div className="block rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0d326f]">{post.date || '-'}</p>
                            <p className="mt-0.5 text-sm font-semibold leading-snug text-slate-900">{post.title}</p>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-900">{piLinksTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <p>{piLinksDescription}</p>
              <ul className="space-y-1.5">
                {LINK_META.map((meta) => {
                  const href = feed.piLinks?.[meta.key];
                  if (!href) {
                    return null;
                  }
                  return (
                    <li key={meta.key}>
                      <a className="text-sm font-semibold text-[#0d326f] underline-offset-2 hover:underline" href={href} rel="noreferrer" target="_blank">
                        {meta.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
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
