import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Bookmark, ChevronDown, ChevronLeft, ChevronRight, Heart, Instagram, MessageCircle, Send } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';

import { ExternalLinkIcon } from '@/components/site/ExternalLinkIcon';
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
const LAB_LIFE_PAGE_SIZE = 6;
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
    if (variant === 'instagramAvatar') {
      return <span className="inline-flex size-8 items-center justify-center rounded-full bg-[var(--brand-burgundy)] text-xs font-semibold text-white">B</span>;
    }

    if (variant === 'thumb') {
      return (
        <div className="flex h-16 w-16 items-center justify-center border border-slate-200 bg-slate-100 text-[10px] font-medium text-slate-500 md:h-[72px] md:w-[72px]">
          Image
        </div>
      );
    }

    if (variant === 'strip') {
      return (
        <div className="flex h-[63px] w-[84px] items-center justify-center rounded-sm bg-slate-100 text-[10px] font-medium text-slate-500 md:h-[82px] md:w-[110px]">
          Image
        </div>
      );
    }

    if (variant === 'galleryFill') {
      return (
        <div className="flex h-full min-h-0 w-full items-center justify-center bg-slate-100 text-[10px] font-medium text-slate-500">
          Image
        </div>
      );
    }

    if (variant === 'instagram') {
      return (
        <div className="flex aspect-square w-full items-center justify-center bg-slate-100 text-xs font-medium text-slate-500">
          Image
        </div>
      );
    }

    if (variant === 'full') {
      return (
        <div className="flex min-h-52 w-full max-w-3xl items-center justify-center rounded-sm bg-slate-100 px-3 text-xs font-medium text-slate-500">
          Image
        </div>
      );
    }

    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-sm bg-slate-100 text-xs font-medium text-slate-500">
        Image
      </div>
    );
  }

  if (variant === 'thumb') {
    return <img alt={title} className="h-16 w-16 rounded-sm object-cover md:h-[72px] md:w-[72px]" decoding="async" loading="lazy" onError={image.onError} src={image.src} />;
  }

  if (variant === 'instagramAvatar') {
    return <img alt={title} className="size-8 rounded-full object-cover" decoding="async" height="32" loading="lazy" onError={image.onError} src={image.src} width="32" />;
  }

  if (variant === 'strip') {
    return <img alt={title} className="h-[63px] w-[84px] rounded-sm object-cover md:h-[82px] md:w-[110px]" decoding="async" loading="lazy" onError={image.onError} src={image.src} />;
  }

  if (variant === 'galleryFill') {
    return <img alt={title} className="h-full min-h-0 w-full object-cover" decoding="async" loading="lazy" onError={image.onError} src={image.src} />;
  }

  if (variant === 'instagram') {
    return <img alt={title} className="aspect-square w-full object-cover" decoding="async" loading="lazy" onError={image.onError} src={image.src} />;
  }

  if (variant === 'full') {
    return (
      <img
        alt={title}
        className="h-auto max-h-[640px] w-full max-w-3xl rounded-sm bg-white object-contain"
        decoding="async"
        loading="lazy"
        onError={image.onError}
        src={image.src}
      />
    );
  }

  return <img alt={title} className="media-news w-full" decoding="async" loading="lazy" onError={image.onError} src={image.src} />;
}

function InstagramRail({ displayName, handle, post, postUrl, profileImage, profileUrl }) {
  const images = post?.images || [];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const mediaId = useId();

  useEffect(() => {
    setActiveImageIndex(0);
  }, [post?.id]);

  if (!post || !images.length) {
    return null;
  }

  const imageCount = images.length;
  const displayHandle = String(handle || '@baelab.khu').trim() || '@baelab.khu';
  const profileLabel = String(displayName || 'Bae Lab').trim() || 'Bae Lab';

  function showPreviousImage() {
    setActiveImageIndex((current) => (current - 1 + imageCount) % imageCount);
  }

  function showNextImage() {
    setActiveImageIndex((current) => (current + 1) % imageCount);
  }

  return (
    <section className="mx-auto w-full max-w-[340px] space-y-3 lg:max-w-[232px]" aria-label="Bae Lab on Instagram">
      <div className="flex items-center gap-2.5">
        <a
          aria-label={`Open ${displayHandle} on Instagram`}
          className="flex min-w-0 flex-1 items-center gap-2.5 no-underline"
          href={profileUrl}
          rel="noreferrer"
          target="_blank"
        >
          <span className="inline-flex rounded-full bg-[linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#4c68d7)] p-0.5">
            <span className="inline-flex size-9 items-center justify-center rounded-full border-2 border-[var(--brand-page)]">
              <MediaImage path={profileImage} title={`${profileLabel} Instagram profile`} variant="instagramAvatar" />
            </span>
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-slate-900">{displayHandle.replace(/^@/, '')}</span>
            <span className="block truncate text-xs text-slate-600">{profileLabel}</span>
          </span>
        </a>
        <a
          aria-label="Open Bae Lab Instagram profile"
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-[linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366)] text-white no-underline"
          href={profileUrl}
          rel="noreferrer"
          target="_blank"
        >
          <Instagram aria-hidden="true" className="size-4" strokeWidth={1.8} />
        </a>
      </div>

      <div className="relative overflow-hidden rounded-sm bg-slate-100" id={mediaId}>
        <a className="block" href={postUrl} rel="noreferrer" target="_blank">
          <MediaImage path={images[activeImageIndex]} title={post.title || 'Bae Lab Instagram post'} variant="instagram" />
        </a>
        {imageCount > 1 ? (
          <>
            <button aria-controls={mediaId} aria-label="Previous Instagram image" className="site-touch-target absolute left-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/55 text-white transition-colors hover:bg-slate-950/70" onClick={showPreviousImage} type="button">
              <ChevronLeft aria-hidden="true" className="size-4" strokeWidth={1.8} />
            </button>
            <button aria-controls={mediaId} aria-label="Next Instagram image" className="site-touch-target absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/55 text-white transition-colors hover:bg-slate-950/70" onClick={showNextImage} type="button">
              <ChevronRight aria-hidden="true" className="size-4" strokeWidth={1.8} />
            </button>
          </>
        ) : null}
      </div>

      <div className="flex items-center gap-3 text-slate-700" aria-hidden="true">
        <Heart className="size-[18px]" strokeWidth={1.6} />
        <MessageCircle className="size-[18px]" strokeWidth={1.6} />
        <Send className="size-[18px]" strokeWidth={1.6} />
        <Bookmark className="ml-auto size-[18px]" strokeWidth={1.6} />
      </div>

      {imageCount > 1 ? (
        <div className="flex justify-center gap-1.5" aria-label={`${imageCount} images in this Instagram post`}>
          {Array.from({ length: Math.min(imageCount, 5) }, (_, index) => (
            <button
              aria-controls={mediaId}
              aria-label={`Show Instagram image ${index + 1}`}
              aria-pressed={activeImageIndex === index}
              className={`site-touch-target size-1.5 rounded-full ${activeImageIndex === index ? 'bg-[#4c68d7]' : 'bg-slate-300'}`}
              key={`${post.id}-instagram-dot-${index}`}
              onClick={() => setActiveImageIndex(index)}
              type="button"
            />
          ))}
        </div>
      ) : null}

      {imageCount > 1 ? <p aria-live="polite" className="sr-only">Instagram image {activeImageIndex + 1} of {imageCount}</p> : null}

      <div className="space-y-1">
        <p className="site-copy-body line-clamp-2">
          <span className="font-semibold text-slate-900">{displayHandle.replace(/^@/, '')}</span>{' '}
          {post.summary || post.title}
        </p>
        <a className="site-text-link inline-flex items-center text-xs" href={postUrl} rel="noreferrer" target="_blank">View on Instagram<ExternalLinkIcon /></a>
        {post.date ? <p className="text-xs text-slate-500">{post.date}</p> : null}
      </div>
    </section>
  );
}

function LabLifeCard({ detailPath, item, number }) {
  const images = (item.images || []).slice(0, 4);
  const visibleImages = images.length ? images : [''];
  const mediaClass = images.length <= 1
    ? 'grid-cols-1'
    : images.length === 2
      ? 'grid-cols-2'
      : images.length === 3
        ? 'grid-cols-[1.55fr_1fr] grid-rows-2'
        : 'grid-cols-2 grid-rows-2';

  return (
    <article className="min-w-0">
      <Link
        aria-label={`View ${item.title}`}
        className={`grid aspect-[4/3] gap-[3px] overflow-hidden rounded-sm bg-slate-100 ${mediaClass}`}
        reloadDocument
        to={detailPath}
      >
        {visibleImages.map((path, imageIndex) => (
          <span
            className={`block min-h-0 overflow-hidden ${images.length === 3 && imageIndex === 0 ? 'row-span-2' : ''}`}
            key={`${item.id}-gallery-preview-${imageIndex}`}
          >
            <MediaImage path={path} title={`${item.title}${images.length > 1 ? ` ${imageIndex + 1}` : ''}`} variant="galleryFill" />
          </span>
        ))}
      </Link>

      <div className="site-media-caption grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-2">
        <span className="site-meta-index pt-1">{formatItemNumber(number)}</span>
        <div className="min-w-0">
          <h3 className="site-media-title">
            <Link className="no-underline hover:text-[var(--brand-burgundy)]" reloadDocument to={detailPath}>{item.title}</Link>
          </h3>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <span className="site-meta-context">{item.date || '-'}</span>
            {images.length ? <span className="site-meta-secondary">{images.length} {images.length === 1 ? 'photo' : 'photos'}</span> : null}
          </div>
        </div>
      </div>
    </article>
  );
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
    <article className="min-w-0">
      <div className="overflow-hidden rounded-sm bg-slate-100">
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

      <div className="site-media-caption grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-2">
        <span className="site-meta-index pt-1.5">{formatItemNumber(number)}</span>
        <div className="min-w-0">
          <h3 className="text-xl font-semibold leading-snug text-slate-950">
            <Link className="no-underline hover:text-[var(--brand-burgundy)]" reloadDocument to={detailPath}>{item.title}</Link>
          </h3>
          <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <span className="site-meta-context">{item.date || '-'}</span>
            {primaryVideoUrl ? (
              <a className="site-text-link inline-flex whitespace-nowrap text-xs font-medium" href={primaryVideoUrl} rel="noreferrer" target="_blank">
                View original video<ExternalLinkIcon />
              </a>
            ) : null}
          </div>
          {item.summary ? <p className="site-media-description">{item.summary}</p> : null}
        </div>
      </div>
    </article>
  );
}

function NewsItemRow({ compactPreview = false, detailPath, editorialPreview = false, item, itemRef, number, onToggle, opened }) {
  const youtubeEmbed = toYouTubeEmbedUrl(item.videoUrl || item.url);
  const hasDetailContent = Boolean(item.summary || item.url || item.videoUrl || (item.images || []).length);
  const firstImage = item.images?.[0] || '';
  const toggleLabel = opened ? 'Collapse details' : 'View details';
  const detailsId = `news-details-${item.id}`;

  return (
    <li className="scroll-mt-28" ref={itemRef}>
      <div className="site-list-row w-full px-1 text-left transition-colors hover:bg-white/40 md:px-2">
        <div
          className={`grid ${
            editorialPreview
            ? 'grid-cols-[1.5rem_5.25rem_minmax(0,1fr)_auto] items-start gap-x-2.5 md:grid-cols-[2.125rem_110px_minmax(0,1fr)_auto] md:items-center md:gap-4'
              : compactPreview
                ? 'grid-cols-[2.125rem_64px_minmax(0,1fr)_auto] items-center gap-3 md:grid-cols-[2.125rem_72px_minmax(0,1fr)_auto] md:gap-4'
                : 'grid-cols-[2.125rem_minmax(0,1fr)_auto] items-center gap-3'
          }`}
        >
          <span className={editorialPreview ? 'site-meta-index pt-1 md:self-auto md:pt-0' : 'site-meta-index'}>{formatItemNumber(number)}</span>
          {compactPreview || editorialPreview ? (
            <div className={editorialPreview ? 'col-start-2 row-start-1 flex items-center justify-center md:col-start-2 md:row-start-1' : 'flex items-center justify-center'}>
              <MediaImage path={firstImage} title={item.title} variant={editorialPreview ? 'strip' : 'thumb'} />
            </div>
          ) : null}

          <div className={editorialPreview ? 'col-start-3 row-start-1 min-w-0 md:col-span-1 md:col-start-3 md:row-start-1' : ''}>
            {!editorialPreview ? <p className="site-meta-context">{item.date || '-'}</p> : null}
            <p className="site-balanced-heading mt-1 text-base font-semibold leading-snug text-slate-950 md:text-[1.02rem]">
              <Link className="no-underline hover:text-[var(--brand-burgundy)]" reloadDocument to={detailPath}>{item.title}</Link>
            </p>
            {editorialPreview ? <p className="site-meta-context mt-1.5 md:hidden">{item.date || '-'}</p> : null}
            {editorialPreview && item.summary ? <p className="site-copy-support mt-2 line-clamp-2">{item.summary}</p> : null}
          </div>

          <div className={editorialPreview ? 'col-start-4 row-start-1 flex self-start items-center gap-3 md:col-start-4 md:row-start-1 md:self-start' : ''}>
            {editorialPreview ? <p className="site-meta-context hidden whitespace-nowrap md:block">{item.date || '-'}</p> : null}
            <button
              aria-controls={detailsId}
              aria-expanded={opened}
              className="inline-flex size-11 items-center justify-center text-slate-600 transition-colors hover:text-slate-900 md:size-auto"
              onClick={onToggle}
              type="button"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${opened ? 'rotate-180' : ''}`} />
              <span className="sr-only">{toggleLabel}</span>
            </button>
          </div>
        </div>
      </div>

      {opened ? (
        <div className="site-rule-soft border-t px-1 pb-5 pt-4 md:px-2" id={detailsId}>
          <div className="space-y-4">
            {item.summary ? <p className="site-copy-body">{item.summary}</p> : null}

            {item.images?.length ? (
              <div className="flex flex-col items-center gap-3">
                {item.images.map((path, index) => (
                  <MediaImage key={`${item.id}-image-${index}`} path={path} title={item.title} variant="full" />
                ))}
              </div>
            ) : null}

            {item.videoUrl ? (
              youtubeEmbed ? (
                <div className="overflow-hidden rounded-sm">
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
                  Open video<ExternalLinkIcon />
                </a>
              )
            ) : null}

            {item.url ? (
              <a className="site-text-link inline-flex text-sm" href={item.url} rel="noreferrer" target="_blank">
                View original source<ExternalLinkIcon />
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
              <div className="overflow-hidden rounded-sm">
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
              <a className="site-text-link inline-flex items-center text-sm" href={item.videoUrl} rel="noreferrer" target="_blank">Open video<ExternalLinkIcon /></a>
            )
          ) : null}

          {item.url ? (
            <a className="site-text-link inline-flex items-center text-sm" href={item.url} rel="noreferrer" target="_blank">Source link<ExternalLinkIcon /></a>
          ) : null}
        </div>

        <aside className="site-rule-strong border-t pt-4 lg:border-t-0 lg:pt-0">
          <p className="text-xs font-semibold text-slate-500">Bae Lab news</p>
          <Link className="site-utility-link mt-3 inline-flex" to={newsSectionPath(section)}>Back to {section === 'gallery' ? 'Lab Life' : section === 'videos' ? 'Video' : 'Highlights'}</Link>
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
  const pageSize = activeSection === 'videos'
    ? VIDEOS_PAGE_SIZE
    : activeSection === 'gallery'
      ? LAB_LIFE_PAGE_SIZE
      : DEFAULT_PAGE_SIZE;
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
  const latestInstagramPermalink = normalizeInstagramPermalink(latestInstagramPost?.url);
  const instagramProfileUrl = feed.instagram.profileUrl || 'https://www.instagram.com/baelab.khu/';
  const latestInstagramPostUrl = latestInstagramPermalink || latestInstagramPost?.url || instagramProfileUrl;
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
        <Link className="site-utility-link" to={newsSectionPath(activeSection)}>Back to News</Link>
      </div>
    );
  }

  return (
    <div>
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

      <div className={`page-content-offset grid gap-6 lg:grid-cols-[minmax(0,1fr)_232px] lg:items-start lg:gap-8 xl:gap-10 ${contentReveal.revealClassName}`} ref={contentReveal.ref} style={contentReveal.revealStyle}>
        <aside className="order-2 w-full lg:self-start">
          <div className="mx-auto w-full max-w-sm space-y-4 lg:max-w-none xl:sticky xl:top-28">
            <InstagramRail
              displayName={feed.instagram.displayName}
              handle={feed.instagram.handle}
              post={latestInstagramPost}
              postUrl={latestInstagramPostUrl}
              profileImage={feed.instagram.profileImage}
              profileUrl={instagramProfileUrl}
            />
          </div>
        </aside>

        <section className="order-1 space-y-3" ref={listTopRef}>
          <h2 className="sr-only">{sections.find((section) => section.id === activeSection)?.label || 'News items'}</h2>
          {loading ? <div className="content-state-row" role="status"><p className="content-state-label">Loading</p><p className="content-state-message">Loading news feed...</p></div> : null}
          {!loading && error ? <div className="content-state-row is-error" role="alert"><p className="content-state-label">Error</p><p className="content-state-message">{error}</p></div> : null}
          {!loading && !error && activeItems.length === 0 ? (
            <div className="content-state-row"><p className="content-state-label">Empty</p><p className="content-state-message">{emptySectionLabel}</p></div>
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
              ) : activeSection === 'labNews' ? (
                <ol className="site-divide-soft site-rule-strong divide-y border-t">
                  {paginatedItems.map((item, index) => (
                    <NewsItemRow
                      detailPath={newsItemPath(activeSection, item)}
                      editorialPreview
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
              ) : activeSection === 'gallery' ? (
                <ol className="grid gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
                  {paginatedItems.map((item, index) => (
                    <li key={item.id}>
                      <LabLifeCard
                        detailPath={newsItemPath(activeSection, item)}
                        item={item}
                        number={activeItems.length - ((currentPage - 1) * pageSize + index)}
                      />
                    </li>
                  ))}
                </ol>
              ) : (
                <ol className="site-divide-soft site-rule-strong divide-y border-t">
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
                <nav aria-label="News pagination" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 py-1 sm:gap-x-7">
                  {currentPage > 1 ? (
                    <Link
                      aria-label="Previous news page"
                      className="inline-flex size-11 items-center justify-center text-slate-500 transition-colors hover:text-[var(--brand-burgundy)] sm:size-7"
                      to={newsSectionPath(activeSection, currentPage - 1)}
                    >
                      <ChevronLeft aria-hidden="true" className="size-4" strokeWidth={1.5} />
                    </Link>
                  ) : (
                    <span aria-hidden="true" className="inline-flex size-11 items-center justify-center text-slate-300 sm:size-7">
                      <ChevronLeft className="size-4" strokeWidth={1.5} />
                    </span>
                  )}
                  <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:gap-x-8">
                    {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                      <Link
                        aria-current={page === currentPage ? 'page' : undefined}
                        className={`page-section-tab no-underline ${page === currentPage ? 'font-semibold text-[var(--brand-burgundy)]' : ''}`}
                        key={page}
                        to={newsSectionPath(activeSection, page)}
                      >
                        {page}
                      </Link>
                    ))}
                  </div>
                  {currentPage < pageCount ? (
                    <Link
                      aria-label="Next news page"
                      className="inline-flex size-11 items-center justify-center text-slate-500 transition-colors hover:text-[var(--brand-burgundy)] sm:size-7"
                      to={newsSectionPath(activeSection, currentPage + 1)}
                    >
                      <ChevronRight aria-hidden="true" className="size-4" strokeWidth={1.5} />
                    </Link>
                  ) : (
                    <span aria-hidden="true" className="inline-flex size-11 items-center justify-center text-slate-300 sm:size-7">
                      <ChevronRight className="size-4" strokeWidth={1.5} />
                    </span>
                  )}
                </nav>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
