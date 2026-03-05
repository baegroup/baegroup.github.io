import { useState } from 'react';
import { Link } from 'react-router-dom';

import { HOME_MEDIA, mediaCandidates } from '@/content/home-media';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { pagePath } from '@/lib/i18n';

export function HomeNewsSection({ content, locale, revealDelay = 0 }) {
  const [imageIndex, setImageIndex] = useState(0);
  const featuredImages = mediaCandidates(HOME_MEDIA.newsFeatured);
  const exhausted = imageIndex >= featuredImages.length;
  const items = content.items || [];
  const featured = items[0];
  const listItems = items.slice(1, 4);
  const sectionTitle = content.sectionTitle || (locale === 'ko' ? '최근 소식' : 'Recent Lab News');
  const viewAllLabel = locale === 'ko' ? '소식 전체 보기' : 'View all news';
  const { ref, revealClassName, revealStyle } = useScrollReveal(revealDelay);

  if (!featured && !listItems.length) {
    return null;
  }

  return (
    <section className={`space-y-4 md:space-y-5 ${revealClassName}`} ref={ref} style={revealStyle}>
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">{sectionTitle}</h2>
        <Link className="text-sm font-semibold text-[#0b3a64] underline-offset-4 hover:underline" to={pagePath(locale, 'news')}>
          {viewAllLabel}
        </Link>
      </div>

      <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
        <div className={featured && listItems.length ? 'grid md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]' : 'grid'}>
          {featured ? (
            <div className={listItems.length ? 'border-b border-slate-200 md:border-b-0 md:border-r' : ''}>
              <div className="relative h-40 overflow-hidden bg-slate-100 md:h-44">
                {!exhausted ? (
                  <img
                    alt={featured.title}
                    className="h-full w-full object-cover"
                    onError={() => setImageIndex((index) => index + 1)}
                    src={featuredImages[imageIndex]}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm font-medium text-slate-500">
                    {locale === 'ko' ? '뉴스 대표 이미지' : 'Featured News Image'}
                  </div>
                )}
              </div>
              <div className="p-4 md:p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#0b3a64]">{featured.date}</p>
                <h3 className="mt-1.5 text-xl font-semibold leading-tight text-slate-950 md:text-2xl">{featured.title}</h3>
                <p className="mt-2 text-base text-slate-600">{featured.body}</p>
              </div>
            </div>
          ) : null}

          {listItems.length ? (
            <ul className="divide-y divide-slate-200">
              {listItems.map((item) => (
                <li className="px-4 py-3.5 md:px-5 md:py-4" key={`${item.date}-${item.title}`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#0b3a64]">{item.date}</p>
                  <p className="mt-1 text-base font-semibold leading-snug text-slate-900 md:text-lg">{item.title}</p>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </article>
    </section>
  );
}
