import { useState } from 'react';
import { Link } from 'react-router-dom';

import { HOME_MEDIA, mediaCandidates } from '@/content/home-media';
import { pagePath } from '@/lib/i18n';

export function HomeNewsSection({ content, locale }) {
  const [imageIndex, setImageIndex] = useState(0);
  const featuredImages = mediaCandidates(HOME_MEDIA.newsFeatured);
  const exhausted = imageIndex >= featuredImages.length;
  const items = content.items || [];
  const featured = items[0];
  const listItems = items.slice(1, 5);
  const sectionTitle = content.sectionTitle || (locale === 'ko' ? '최근 소식' : 'Recent Lab News');
  const viewAllLabel = locale === 'ko' ? '소식 전체 보기' : 'View all news';

  if (!featured && !listItems.length) {
    return null;
  }

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-4xl font-semibold tracking-tight text-slate-950">{sectionTitle}</h2>
        <Link className="text-sm font-semibold text-[#0b3a64] underline-offset-4 hover:underline" to={pagePath(locale, 'news')}>
          {viewAllLabel}
        </Link>
      </div>

      {featured ? (
        <article className="grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft md:grid-cols-[1.1fr_1fr]">
          {!exhausted ? (
            <img
              alt={featured.title}
              className="h-full w-full object-cover"
              onError={() => setImageIndex((index) => index + 1)}
              src={featuredImages[imageIndex]}
            />
          ) : (
            <div className="flex min-h-52 items-center justify-center bg-slate-100 text-sm font-medium text-slate-500">
              {locale === 'ko' ? '뉴스 대표 이미지' : 'Featured News Image'}
            </div>
          )}
          <div className="p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#0b3a64]">{featured.date}</p>
            <h3 className="mt-2 text-2xl font-semibold leading-tight text-slate-950">{featured.title}</h3>
            <p className="mt-3 text-base text-slate-600">{featured.body}</p>
          </div>
        </article>
      ) : null}

      {listItems.length ? (
        <ul className="grid gap-3 md:grid-cols-2">
          {listItems.map((item) => (
            <li className="rounded-lg border border-slate-200 bg-white p-4" key={`${item.date}-${item.title}`}>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#0b3a64]">{item.date}</p>
              <p className="mt-1 text-lg font-semibold leading-snug text-slate-900">{item.title}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
