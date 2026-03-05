import { useState } from 'react';
import { Link } from 'react-router-dom';

import { HOME_MEDIA, mediaCandidates } from '@/content/home-media';
import { pagePath } from '@/lib/i18n';

export function HomeHeroSection({ content, locale }) {
  const [imageIndex, setImageIndex] = useState(0);
  const heroImages = mediaCandidates(HOME_MEDIA.heroCover);
  const exhausted = imageIndex >= heroImages.length;

  return (
    <section className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-900 shadow-soft">
      {!exhausted ? (
        <img
          alt={content.title}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setImageIndex((index) => index + 1)}
          src={heroImages[imageIndex]}
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/75 to-slate-900/55" />

      <div className="relative z-10 px-6 py-10 md:px-10 md:py-14">
        <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl">{content.title}</h1>
        <p className="mt-4 max-w-3xl text-base text-slate-100 md:text-xl">{content.description}</p>
        <div className="mt-7 flex flex-wrap gap-2.5">
          <Link
            className="inline-flex h-11 items-center rounded-full bg-[#7a0f1f] px-6 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#68101b]"
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
