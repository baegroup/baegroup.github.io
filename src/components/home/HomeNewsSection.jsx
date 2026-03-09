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
    <Link className="group block overflow-hidden rounded-lg border border-slate-200 bg-white" to={sectionPath(locale, item.section)}>
      <div className="relative h-44 overflow-hidden bg-slate-100">
        {!exhausted ? (
          <img
            alt={item.title}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
            onError={() => setImageIndex((index) => index + 1)}
            src={imageCandidates[imageIndex]}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-medium text-slate-500">Featured News Image</div>
        )}
        <p className="absolute left-3 top-3 rounded-full bg-slate-900/75 px-2.5 py-1 text-xs font-semibold text-white">{item.date}</p>
      </div>
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0b3a64]">Featured</p>
        <h3 className="mt-2 text-lg font-semibold leading-snug tracking-tight text-slate-950">{item.title}</h3>
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
  const viewAllLabel = 'View all news';
  const { ref, revealClassName, revealStyle } = useScrollReveal(revealDelay);

  if (!featuredItems.length && !listItems.length) {
    return null;
  }

  return (
    <section className={`space-y-4 md:space-y-5 ${revealClassName}`} ref={ref} style={revealStyle}>
      <div className="home-section-header">
        <h2 className="home-section-title">{sectionTitle}</h2>
        <Link className="text-sm font-semibold text-[#0b3a64] underline-offset-4 hover:underline" to={pagePath(locale, 'news')}>
          {viewAllLabel}
        </Link>
      </div>

      <article className="home-section overflow-hidden">
        <div className={featuredItems.length && listItems.length ? 'grid lg:grid-cols-[minmax(0,1.16fr)_minmax(0,1fr)]' : 'grid'}>
          {featuredItems.length ? (
            <div className={listItems.length ? 'border-b border-slate-200 lg:border-b-0 lg:border-r' : ''}>
              <div className="grid gap-3 p-4 sm:grid-cols-2 md:p-5">
                {featuredItems.map((item) => (
                  <FeaturedNewsCard item={item} key={`${item.id || item.title}-featured`} locale={locale} />
                ))}
              </div>
            </div>
          ) : null}

          {listItems.length ? (
            <div className="bg-slate-50/70">
              <div className="px-5 pb-2 pt-5 md:px-6">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0b3a64]">{listLabel}</p>
              </div>
              <ul className="divide-y divide-slate-200">
                {listItems.map((item) => (
                  <li className="px-5 py-3 transition-colors hover:bg-white md:px-6 md:py-3.5" key={`${item.id || item.title}-list`}>
                    <Link className="block" to={sectionPath(locale, item.section)}>
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#0b3a64]">{item.date}</p>
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
