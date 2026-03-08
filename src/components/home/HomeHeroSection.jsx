import { useState } from 'react';

import { HOME_MEDIA, mediaCandidates } from '@/content/home-media';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export function HomeHeroSection({ content, revealDelay = 0 }) {
  const [imageIndex, setImageIndex] = useState(0);
  const heroImages = mediaCandidates(HOME_MEDIA.heroCover);
  const exhausted = imageIndex >= heroImages.length;
  const { ref, revealClassName, revealStyle } = useScrollReveal(revealDelay);

  return (
    <section className={`relative overflow-hidden rounded-xl border border-slate-200/90 bg-slate-900 shadow-soft ${revealClassName}`} ref={ref} style={revealStyle}>
      {!exhausted ? (
        <img
          alt={content.title}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setImageIndex((index) => index + 1)}
          src={heroImages[imageIndex]}
        />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(92deg,rgba(7,20,43,0.76)_0%,rgba(9,31,66,0.62)_34%,rgba(13,50,111,0.42)_66%,rgba(255,255,255,0.08)_100%)]" />

      <div className="relative z-10 px-6 py-10 md:px-10 md:py-14">
        <h1 className="home-display-hero max-w-4xl text-white">{content.title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/90 md:text-lg">{content.description}</p>
        {content.focusDescription ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75 md:text-base">{content.focusDescription}</p>
        ) : null}
      </div>
    </section>
  );
}
