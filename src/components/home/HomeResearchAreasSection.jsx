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
    <article className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_44px_-32px_rgba(8,39,70,0.45)] focus-within:-translate-y-1 focus-within:shadow-[0_24px_44px_-32px_rgba(8,39,70,0.45)]">
      {!exhausted ? (
        <img
          alt={card.title}
          className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          onError={() => setImageIndex((index) => index + 1)}
          src={imageCandidates[imageIndex]}
        />
      ) : (
        <div className="flex aspect-[16/10] items-center justify-center bg-slate-100 text-sm font-medium text-slate-500">
          {locale === 'ko' ? '이미지 준비 중' : 'Image Placeholder'}
        </div>
      )}
      <div className="p-5 md:p-6">
        <div className="h-1.5 w-12 rounded-full bg-[var(--brand-burgundy)]" />
        <h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-950 md:text-2xl">{card.title}</h3>
        <p className="mt-2.5 text-base leading-relaxed text-slate-600">{card.body}</p>
      </div>
    </article>
  );
}

export function HomeResearchAreasSection({ content, locale, revealDelay = 0 }) {
  const cards = (content.cards || []).slice(0, 3);
  const title = content.title || (locale === 'ko' ? '연구 분야' : 'Research Area');
  const description = content.description;
  const kicker = locale === 'ko' ? '핵심 연구 축' : 'Core Research Domains';
  const learnMoreLabel = locale === 'ko' ? '연구 더보기' : 'Learn more about our research';
  const publicationLabel = locale === 'ko' ? '논문 전체 보기' : 'See all publications';
  const { ref, revealClassName, revealStyle } = useScrollReveal(revealDelay);

  if (!cards.length) {
    return null;
  }

  return (
    <section className={`space-y-5 ${revealClassName}`} ref={ref} style={revealStyle}>
      <div className="space-y-2.5">
        <p className="home-kicker">{kicker}</p>
        <h2 className="home-section-title">{title}</h2>
        {description ? <p className="max-w-4xl text-base leading-relaxed text-slate-600 md:text-lg">{description}</p> : null}
      </div>

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

      <div className="flex flex-wrap gap-2.5 pt-1">
        <Link
          className="home-cta-primary"
          to={pagePath(locale, 'research')}
        >
          {learnMoreLabel}
        </Link>
        <Link
          className="home-cta-secondary"
          to={pagePath(locale, 'publications')}
        >
          {publicationLabel}
        </Link>
      </div>
    </section>
  );
}
