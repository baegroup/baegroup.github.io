import { useState } from 'react';
import { Link } from 'react-router-dom';

import { HOME_MEDIA, mediaCandidates } from '@/content/home-media';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { pagePath } from '@/lib/i18n';

export function HomeHeroSection({ content, locale, revealDelay = 0 }) {
  const [imageIndex, setImageIndex] = useState(0);
  const heroImages = mediaCandidates(HOME_MEDIA.heroCover);
  const exhausted = imageIndex >= heroImages.length;
  const tags = Array.isArray(content.tags) ? content.tags.slice(0, 3) : [];
  const introLabel = locale === 'ko' ? '경희대학교 Bae Lab' : 'Kyung Hee University - Bae Lab';
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
      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(8,39,70,0.92)_0%,rgba(11,58,100,0.78)_42%,rgba(122,15,31,0.62)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.20),transparent_36%),radial-gradient(circle_at_82%_0%,rgba(122,15,31,0.38),transparent_44%)]" />

      <div className="relative z-10 px-6 py-10 md:px-10 md:py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-100/90">{introLabel}</p>
        <h1 className="mt-2 max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl">{content.title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-100/95 md:text-xl">{content.description}</p>

        {tags.length ? (
          <ul className="mt-5 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li className="rounded-full border border-white/35 bg-white/10 px-3 py-1 text-xs font-medium text-slate-100/95 md:text-sm" key={tag}>
                {tag}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-2.5">
          <Link
            className="home-cta-primary"
            to={pagePath(locale, 'research')}
          >
            {content.primaryCta}
          </Link>
          <Link
            className="inline-flex h-11 items-center rounded-full border border-white/70 bg-white/10 px-6 text-sm font-semibold text-white no-underline transition-colors hover:bg-white/20"
            to={pagePath(locale, 'publications')}
          >
            {content.secondaryCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
