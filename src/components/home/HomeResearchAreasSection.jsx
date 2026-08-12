import { useState } from 'react';
import { Link } from 'react-router-dom';

import { HOME_RESEARCH_CARD_COPY } from '@/content/home-research-copy';
import { HOME_MEDIA, mediaCandidates } from '@/content/home-media';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { pagePath } from '@/lib/i18n';

function ResearchAreaCard({ card, imagePath }) {
  const [imageIndex, setImageIndex] = useState(0);
  const imageCandidates = mediaCandidates(imagePath);
  const exhausted = imageIndex >= imageCandidates.length;

  return (
    <article className="group mx-auto w-full max-w-[36rem] md:max-w-none">
      {!exhausted ? (
        <img
          alt={card.title}
          className="aspect-[16/10] max-h-[320px] w-full rounded-md border border-slate-200 object-cover transition-[border-color,filter] duration-300 group-hover:border-slate-300 group-hover:brightness-[1.015] md:max-h-none"
          decoding="async"
          loading="lazy"
          onError={() => setImageIndex((index) => index + 1)}
          src={imageCandidates[imageIndex]}
        />
      ) : (
        <div className="flex aspect-[16/10] max-h-[320px] w-full items-center justify-center rounded-md border border-slate-200 bg-slate-100 text-sm font-medium text-slate-500 md:max-h-none">
          Image Placeholder
        </div>
      )}
      <div className="pt-4">
        <h3 className="home-display-subtitle text-slate-950">{card.title}</h3>
        <p className="mt-2.5 text-[0.98rem] leading-relaxed text-slate-600 md:text-base">{card.body}</p>
      </div>
    </article>
  );
}

export function HomeResearchAreasSection({ content, locale, revealDelay = 0 }) {
  const cards = (content.cards || []).slice(0, 3).map((card, index) => ({
    ...card,
    body: HOME_RESEARCH_CARD_COPY[locale]?.[index] || HOME_RESEARCH_CARD_COPY.en[index] || card.body
  }));
  const title = 'Research Area';
  const primaryCtaLabel = 'Explore Research';
  const secondaryCtaLabel = 'View Publications';
  const { ref, revealClassName, revealStyle } = useScrollReveal(revealDelay);

  if (!cards.length) {
    return null;
  }

  return (
    <section className={`home-air-section space-y-5 ${revealClassName}`} ref={ref} style={revealStyle}>
      <div className="home-section-header flex-col items-start sm:flex-row sm:items-end">
        <h2 className="home-section-title">{title}</h2>
        <div className="site-action-links">
          <Link className="site-action-link" to={pagePath(locale, 'research')}>
            {primaryCtaLabel}
          </Link>
          <Link className="site-action-link" to={pagePath(locale, 'publications')}>
            {secondaryCtaLabel}
          </Link>
        </div>
      </div>

      <div className="reveal-stagger grid gap-7 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 xl:gap-[1.375rem]">
        {cards.map((card, index) => (
          <ResearchAreaCard
            card={card}
            imagePath={HOME_MEDIA.researchAreas[index] || HOME_MEDIA.researchAreas[HOME_MEDIA.researchAreas.length - 1]}
            key={card.title}
          />
        ))}
      </div>
    </section>
  );
}
