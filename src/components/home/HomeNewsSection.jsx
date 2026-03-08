import { useState } from 'react';
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

export function HomeNewsSection({ content, locale, revealDelay = 0 }) {
  const [imageIndex, setImageIndex] = useState(0);
  const featuredImages = mediaCandidates(HOME_MEDIA.newsFeatured);
  const exhausted = imageIndex >= featuredImages.length;
  const items = [...(content.items || [])].sort((a, b) => {
    const dateDelta = parseNewsDate(b.date) - parseNewsDate(a.date);
    if (dateDelta !== 0) {
      return dateDelta;
    }
    return String(b.title || '').localeCompare(String(a.title || ''));
  });
  const featured = items[0];
  const listItems = items.slice(1, 6);
  const sectionTitle = content.sectionTitle || 'Recent Lab News';
  const featuredLabel = 'Featured';
  const listLabel = 'Recent Highlights';
  const viewAllLabel = 'View all news';
  const { ref, revealClassName, revealStyle } = useScrollReveal(revealDelay);

  if (!featured && !listItems.length) {
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
        <div className={featured && listItems.length ? 'grid md:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]' : 'grid'}>
          {featured ? (
            <div className={listItems.length ? 'border-b border-slate-200 md:border-b-0 md:border-r' : ''}>
              <div className="relative h-48 overflow-hidden bg-slate-100 md:h-56">
                {!exhausted ? (
                  <img
                    alt={featured.title}
                    className="h-full w-full object-cover"
                    onError={() => setImageIndex((index) => index + 1)}
                    src={featuredImages[imageIndex]}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm font-medium text-slate-500">
                    Featured News Image
                  </div>
                )}
                <p className="absolute left-4 top-4 rounded-full bg-slate-900/75 px-2.5 py-1 text-xs font-semibold text-white">{featured.date}</p>
              </div>
              <div className="p-5 md:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0b3a64]">{featuredLabel}</p>
                <h3 className="home-display-subtitle mt-2 text-slate-950">{featured.title}</h3>
                <p className="mt-2.5 text-[0.98rem] leading-relaxed text-slate-600 md:text-base">{featured.body}</p>
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
                  <li className="px-5 py-3 transition-colors hover:bg-white md:px-6 md:py-3.5" key={`${item.date}-${item.title}`}>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#0b3a64]">{item.date}</p>
                    <p className="mt-1 text-base font-semibold leading-snug text-slate-900 md:text-[1.02rem]">{item.title}</p>
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
