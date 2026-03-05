import { useState } from 'react';
import { Link } from 'react-router-dom';

import { HOME_MEDIA, mediaCandidates } from '@/content/home-media';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { pagePath } from '@/lib/i18n';

function ResearchAreaCard({ card, imagePath, locale }) {
  const [imageIndex, setImageIndex] = useState(0);
  const imageCandidates = mediaCandidates(imagePath);
  const exhausted = imageIndex >= imageCandidates.length;

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
      {!exhausted ? (
        <img
          alt={card.title}
          className="aspect-[16/10] w-full object-cover"
          onError={() => setImageIndex((index) => index + 1)}
          src={imageCandidates[imageIndex]}
        />
      ) : (
        <div className="flex aspect-[16/10] items-center justify-center bg-slate-100 text-sm font-medium text-slate-500">
          {locale === 'ko' ? '이미지 준비 중' : 'Image Placeholder'}
        </div>
      )}
      <div className="p-4 md:p-5">
        <h3 className="text-xl font-semibold tracking-tight text-slate-950 md:text-2xl">{card.title}</h3>
        <p className="mt-2.5 text-base leading-relaxed text-slate-600">{card.body}</p>
      </div>
    </article>
  );
}

export function HomeResearchAreasSection({ content, locale, revealDelay = 0 }) {
  const cards = (content.cards || []).slice(0, 3);
  const title = locale === 'ko' ? '연구 분야' : 'Research Area';
  const learnMoreLabel = locale === 'ko' ? '연구 더보기' : 'Learn more about our research';
  const publicationLabel = locale === 'ko' ? '논문 전체 보기' : 'See all publications';
  const { ref, revealClassName, revealStyle } = useScrollReveal(revealDelay);

  if (!cards.length) {
    return null;
  }

  return (
    <section className={`space-y-5 ${revealClassName}`} ref={ref} style={revealStyle}>
      <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card, index) => (
          <ResearchAreaCard
            card={card}
            imagePath={HOME_MEDIA.researchAreas[index] || HOME_MEDIA.researchAreas[HOME_MEDIA.researchAreas.length - 1]}
            key={card.title}
            locale={locale}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-2.5">
        <Link
          className="inline-flex h-11 items-center rounded-full bg-[#7a0f1f] px-6 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#68101b]"
          to={pagePath(locale, 'research')}
        >
          {learnMoreLabel}
        </Link>
        <Link
          className="inline-flex h-11 items-center rounded-full bg-[#7a0f1f] px-6 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#68101b]"
          to={pagePath(locale, 'publications')}
        >
          {publicationLabel}
        </Link>
      </div>
    </section>
  );
}
