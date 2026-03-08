import { useState } from 'react';
import { Link } from 'react-router-dom';

import { HOME_MEDIA, mediaCandidates } from '@/content/home-media';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { pagePath } from '@/lib/i18n';

const ITALIC_DISCIPLINES =
  'chemical engineering, materials science, polymer chemistry, mechanical engineering, electrical engineering, computer science, and life sciences.';

function renderJoinDescription(description) {
  const text = String(description || '');
  const lower = text.toLowerCase();
  const target = ITALIC_DISCIPLINES.toLowerCase();
  const start = lower.indexOf(target);
  if (start === -1) {
    return text;
  }

  const end = start + target.length;
  const before = text.slice(0, start);
  const emphasis = text.slice(start, end);
  const after = text.slice(end);

  return (
    <>
      {before}
      <em className="italic">{emphasis}</em>
      {after}
    </>
  );
}

export function HomeJoinSection({ content, locale, revealDelay = 0 }) {
  const [imageIndex, setImageIndex] = useState(0);
  const joinImages = mediaCandidates(HOME_MEDIA.joinTeam);
  const exhausted = imageIndex >= joinImages.length;
  const primaryLabel = 'Read More About Joining';
  const secondaryLabel = 'Explore Our Lab Culture';
  const { ref, revealClassName, revealStyle } = useScrollReveal(revealDelay);

  return (
    <section
      className={`home-section relative grid gap-6 overflow-hidden px-5 py-6 md:grid-cols-2 md:items-center md:gap-7 md:px-7 md:py-8 ${revealClassName}`}
      ref={ref}
      style={revealStyle}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_14%,rgba(11,58,100,0.08),transparent_34%),radial-gradient(circle_at_100%_80%,rgba(122,15,31,0.08),transparent_40%)]" />

      <div className="relative z-10">
        <h2 className="home-section-title">{content.joinTitle}</h2>
        <p className="home-body-copy mt-4 max-w-xl">{renderJoinDescription(content.joinDescription)}</p>
        <div className="mt-5 flex flex-wrap gap-2.5">
          <Link
            className="home-cta-primary"
            to={pagePath(locale, 'join')}
          >
            {primaryLabel}
          </Link>
          <Link
            className="home-cta-primary"
            to={pagePath(locale, 'team')}
          >
            {secondaryLabel}
          </Link>
        </div>
      </div>

      {!exhausted ? (
        <img
          alt={content.joinTitle}
          className="relative z-10 mx-auto aspect-[16/10] max-h-[320px] w-full max-w-[36rem] rounded-lg border border-slate-200/90 object-cover shadow-[0_24px_44px_-34px_rgba(8,39,70,0.5)] md:max-h-none md:max-w-none"
          onError={() => setImageIndex((index) => index + 1)}
          src={joinImages[imageIndex]}
        />
      ) : (
        <div className="relative z-10 mx-auto flex aspect-[16/10] max-h-[320px] w-full max-w-[36rem] items-center justify-center rounded-lg border border-slate-200/90 bg-slate-100 text-sm font-medium text-slate-500 md:max-h-none md:max-w-none">
          Team Image Placeholder
        </div>
      )}
    </section>
  );
}
