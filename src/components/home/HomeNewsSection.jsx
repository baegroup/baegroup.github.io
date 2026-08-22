import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { HOME_MEDIA, mediaCandidates } from '@/content/home-media';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { pagePath } from '@/lib/i18n';
import { newsItemPath } from '@/lib/seo-paths';

function parseNewsDate(value) {
  const raw = String(value || '').trim();
  const parts = raw.split(/[./-]/).filter(Boolean);
  const year = Number(parts[0]) || 0;
  const month = Math.min(12, Math.max(1, Number(parts[1]) || 1));
  const day = Math.min(31, Math.max(1, Number(parts[2]) || 1));
  return Date.UTC(year, month - 1, day);
}

function itemPath(item) {
  if (!item?.id || !['labNews', 'gallery', 'videos'].includes(item?.section)) {
    return '/news/';
  }
  const section = item.section;
  return newsItemPath(section, item);
}

function LeadNewsImage({ item, path, suffix = '' }) {
  const [imageIndex, setImageIndex] = useState(0);
  const imageBase = path || HOME_MEDIA.newsFeatured;
  const imageCandidates = mediaCandidates(imageBase);
  const exhausted = imageIndex >= imageCandidates.length;

  useEffect(() => {
    setImageIndex(0);
  }, [imageBase]);

  if (exhausted) {
    return <div className="flex h-full items-center justify-center text-xs font-medium text-slate-500">Image</div>;
  }

  return (
    <img
      alt={`${item.title}${suffix}`}
      className="h-full w-full object-cover object-top transition-transform duration-[320ms] group-hover:scale-[1.01]"
      decoding="async"
      loading="lazy"
      onError={() => setImageIndex((index) => index + 1)}
      src={imageCandidates[imageIndex]}
    />
  );
}

function LeadNewsCard({ item }) {
  const images = item.images || [];
  const groupedWelcome = /^Welcome .+ to Bae Lab$/i.test(String(item.title || '').trim()) && images.length > 1;

  return (
    <Link className="group flex h-full flex-col" reloadDocument to={itemPath(item)}>
      <div className={`aspect-[4/3] overflow-hidden rounded-sm bg-slate-100 ${groupedWelcome ? 'grid grid-cols-2' : ''}`}>
        {groupedWelcome ? (
          images.slice(0, 2).map((path, index) => (
            <LeadNewsImage item={item} key={`${item.id}-lead-image-${index}`} path={path} suffix={` ${index + 1}`} />
          ))
        ) : (
          <LeadNewsImage item={item} path={item.image} />
        )}
      </div>
      <div className="site-media-caption flex-1">
        <h3 className="site-media-title tracking-tight">{item.title}</h3>
        <p className="site-meta-context mt-1.5">{item.date}</p>
      </div>
    </Link>
  );
}

export function HomeNewsSection({ content, locale, revealDelay = 0 }) {
  const items = [...(content.items || [])].sort((a, b) => {
    const dateDelta = parseNewsDate(b.date) - parseNewsDate(a.date);
    if (dateDelta !== 0) {
      return dateDelta;
    }
    return String(b.title || '').localeCompare(String(a.title || ''));
  });

  const leadItems = items.slice(0, 2);
  const listItems = items.slice(2, 6);
  const sectionTitle = content.newsTitle || 'Latest Highlights';
  const viewAllLabel = 'View All News';
  const { ref, revealClassName, revealStyle } = useScrollReveal(revealDelay);

  if (!leadItems.length && !listItems.length) {
    return null;
  }

  return (
    <section className={`home-air-section space-y-4 md:space-y-5 ${revealClassName}`} ref={ref} style={revealStyle}>
      <div className="home-section-header">
        <h2 className="home-section-title">{sectionTitle}</h2>
        <Link className="site-action-link" to={pagePath(locale, 'news')}>
          {viewAllLabel}
        </Link>
      </div>

      <article>
        <div className={leadItems.length && listItems.length ? 'grid gap-8 lg:grid-cols-[minmax(0,1.16fr)_minmax(0,1fr)] lg:gap-10 xl:gap-12' : 'grid'}>
          {leadItems.length ? (
            <div className="reveal-stagger grid gap-5 sm:grid-cols-2">
              {leadItems.map((item) => (
                <LeadNewsCard item={item} key={`${item.id || item.title}-lead`} />
              ))}
            </div>
          ) : null}

          {listItems.length ? (
            <ul className="reveal-stagger site-divide-soft site-rule-strong divide-y border-t">
              {listItems.map((item) => (
                <li className="py-3 md:py-3.5" key={`${item.id || item.title}-list`}>
                  <Link className="block" reloadDocument to={itemPath(item)}>
                    <p className="site-meta-context">{item.date}</p>
                    <p className="site-balanced-heading mt-1 text-base font-semibold leading-snug text-slate-900 md:text-[1.02rem]">{item.title}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </article>
    </section>
  );
}
