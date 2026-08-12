import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { HOME_MEDIA, mediaCandidates } from '@/content/home-media';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { pagePath } from '@/lib/i18n';

function parseNewsDate(value) {
  const raw = String(value || '').trim();
  const parts = raw.split(/[./-]/).filter(Boolean);
  const year = Number(parts[0]) || 0;
  const month = Math.min(12, Math.max(1, Number(parts[1]) || 1));
  const day = Math.min(31, Math.max(1, Number(parts[2]) || 1));
  return Date.UTC(year, month - 1, day);
}

function sectionPath(locale, sectionId) {
  const section = ['labNews', 'gallery', 'videos'].includes(sectionId) ? sectionId : 'labNews';
  return `${pagePath(locale, 'news')}?section=${section}`;
}

function FeaturedNewsCard({ item, locale }) {
  const [imageIndex, setImageIndex] = useState(0);
  const imageBase = item.image || HOME_MEDIA.newsFeatured;
  const imageCandidates = mediaCandidates(imageBase);
  const exhausted = imageIndex >= imageCandidates.length;

  useEffect(() => {
    setImageIndex(0);
  }, [imageBase]);

  return (
    <Link className="group flex h-full flex-col" to={sectionPath(locale, item.section)}>
      <div className="h-44 overflow-hidden bg-slate-100">
        {!exhausted ? (
          <img
            alt={item.title}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
            decoding="async"
            loading="lazy"
            onError={() => setImageIndex((index) => index + 1)}
            src={imageCandidates[imageIndex]}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-medium text-slate-500">Featured News Image</div>
        )}
      </div>
      <div className="flex-1 pt-3">
        <p className="text-xs font-medium text-[var(--brand-navy)]">{item.date}</p>
        <h3 className="mt-1.5 text-lg font-semibold leading-snug tracking-tight text-slate-950">{item.title}</h3>
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

  const featuredItems = items.slice(0, 2);
  const listItems = items.slice(2, 6);
  const sectionTitle = 'Lab News';
  const listLabel = 'Recent Highlights';
  const viewAllLabel = 'View All News';
  const { ref, revealClassName, revealStyle } = useScrollReveal(revealDelay);

  if (!featuredItems.length && !listItems.length) {
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
        <div className={featuredItems.length && listItems.length ? 'grid lg:grid-cols-[minmax(0,1.16fr)_minmax(0,1fr)]' : 'grid'}>
          {featuredItems.length ? (
            <div className={listItems.length ? 'border-b border-slate-200 pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8' : ''}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.10em] text-[var(--brand-navy)]">Featured</p>
              <div className="reveal-stagger grid gap-5 sm:grid-cols-2">
                {featuredItems.map((item) => (
                  <FeaturedNewsCard item={item} key={`${item.id || item.title}-featured`} locale={locale} />
                ))}
              </div>
            </div>
          ) : null}

          {listItems.length ? (
            <div className={featuredItems.length ? 'pt-6 lg:pl-8 lg:pt-0' : ''}>
              <div className="pb-2">
                <p className="text-xs font-semibold uppercase tracking-[0.10em] text-[var(--brand-navy)]">{listLabel}</p>
              </div>
              <ul className="reveal-stagger divide-y divide-slate-200">
                {listItems.map((item) => (
                  <li className="py-3 first:pt-1 md:py-3.5" key={`${item.id || item.title}-list`}>
                    <Link className="block" to={sectionPath(locale, item.section)}>
                      <p className="text-xs font-medium text-[var(--brand-navy)]">{item.date}</p>
                      <p className="mt-1 text-base font-semibold leading-snug text-slate-900 md:text-[1.02rem]">{item.title}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </article>
    </section>
  );
}
