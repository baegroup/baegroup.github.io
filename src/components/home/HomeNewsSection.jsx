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
  const featuredLabel = locale === 'ko' ? '주요 소식' : 'Featured';
  const listLabel = locale === 'ko' ? '최근 알림' : 'Recent Highlights';
  const viewAllLabel = locale === 'ko' ? '소식 전체 보기' : 'View all news';
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
                    {locale === 'ko' ? '뉴스 대표 이미지' : 'Featured News Image'}
                  </div>
                )}
                <p className="absolute left-4 top-4 rounded-full bg-slate-900/75 px-2.5 py-1 text-xs font-semibold text-white">{featured.date}</p>
              </div>
              <div className="p-5 md:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0b3a64]">{featuredLabel}</p>
                <h3 className="mt-2 text-xl font-semibold leading-tight text-slate-950 md:text-2xl">{featured.title}</h3>
                <p className="mt-2.5 text-base leading-relaxed text-slate-600">{featured.body}</p>
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
                  <li className="px-5 py-3.5 transition-colors hover:bg-white md:px-6 md:py-4" key={`${item.date}-${item.title}`}>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#0b3a64]">{item.date}</p>
                    <p className="mt-1 text-base font-semibold leading-snug text-slate-900 md:text-lg">{item.title}</p>
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
