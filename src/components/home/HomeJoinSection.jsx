import { useState } from 'react';
import { Link } from 'react-router-dom';

import { HOME_MEDIA, mediaCandidates } from '@/content/home-media';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { pagePath } from '@/lib/i18n';
import { responsiveImageProps } from '@/lib/responsive-images';

export function HomeJoinSection({ content, locale, revealDelay = 0 }) {
  const [imageIndex, setImageIndex] = useState(0);
  const joinImages = mediaCandidates(HOME_MEDIA.joinTeam);
  const exhausted = imageIndex >= joinImages.length;
  const primaryLabel = 'View Opportunities';
  const secondaryLabel = 'About Our Lab';
  const { ref, revealClassName, revealStyle } = useScrollReveal(revealDelay);

  return (
    <section
      className={`home-closing-section relative grid gap-6 md:grid-cols-[minmax(0,1.35fr)_minmax(220px,0.65fr)] md:items-start md:gap-10 ${revealClassName}`}
      ref={ref}
      style={revealStyle}
    >
      <div className="relative z-10">
        <h2 className="home-section-title">{content.joinTitle}</h2>
        <p className="home-body-copy mt-4 max-w-xl">{content.joinDescription}</p>
        <div className="site-action-links mt-5">
          <Link
            className="site-action-link"
            to={pagePath(locale, 'join')}
          >
            {primaryLabel}
          </Link>
          <Link
            className="site-action-link"
            to={pagePath(locale, 'team')}
          >
            {secondaryLabel}
          </Link>
        </div>
      </div>

      {!exhausted ? (
        <img
          {...responsiveImageProps(joinImages[imageIndex], '(max-width: 767px) calc(100vw - 32px), 352px')}
          alt={content.joinTitle}
          className="media-landscape relative z-10 mx-auto max-h-[320px] w-full max-w-[36rem] object-cover md:ml-auto md:mr-0 md:max-h-none md:max-w-[22rem]"
          decoding="async"
          loading="lazy"
          onError={() => setImageIndex((index) => index + 1)}
          src={joinImages[imageIndex]}
        />
      ) : (
        <div className="media-landscape relative z-10 mx-auto flex max-h-[320px] w-full max-w-[36rem] items-center justify-center bg-slate-100 text-sm font-medium text-slate-600 md:ml-auto md:mr-0 md:max-h-none md:max-w-[22rem]">
          Team Image Placeholder
        </div>
      )}
    </section>
  );
}
