import { useState } from 'react';

import { HOME_RESEARCH_CARD_COPY } from '@/content/home-research-copy';
import { HOME_MEDIA, mediaCandidates } from '@/content/home-media';
import { useScrollReveal } from '@/hooks/useScrollReveal';

function ResearchAreaCard({ card, imagePath }) {
  const [imageIndex, setImageIndex] = useState(0);
  const imageCandidates = mediaCandidates(imagePath);
  const exhausted = imageIndex >= imageCandidates.length;

  return (
    <article className="group mx-auto w-full max-w-[36rem] overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_44px_-32px_rgba(8,39,70,0.45)] focus-within:-translate-y-1 focus-within:shadow-[0_24px_44px_-32px_rgba(8,39,70,0.45)] md:max-w-none">
      {!exhausted ? (
        <img
          alt={card.title}
          className="aspect-[16/10] max-h-[320px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] md:max-h-none"
          onError={() => setImageIndex((index) => index + 1)}
          src={imageCandidates[imageIndex]}
        />
      ) : (
        <div className="flex aspect-[16/10] max-h-[320px] w-full items-center justify-center bg-slate-100 text-sm font-medium text-slate-500 md:max-h-none">
          Image Placeholder
        </div>
      )}
      <div className="p-5 md:p-6">
        <div className="h-1.5 w-12 rounded-full bg-[var(--brand-burgundy)]" />
        <h3 className="home-display-subtitle mt-3 text-slate-950">{card.title}</h3>
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
  const title = content.title || 'Research Area';
  const { ref, revealClassName, revealStyle } = useScrollReveal(revealDelay);

  if (!cards.length) {
    return null;
  }

  return (
    <section className={`space-y-5 ${revealClassName}`} ref={ref} style={revealStyle}>
      <div className="space-y-2.5">
        <h2 className="home-section-title">{title}</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
