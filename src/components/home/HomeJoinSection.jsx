import { useState } from 'react';
import { Link } from 'react-router-dom';

import { HOME_MEDIA, mediaCandidates } from '@/content/home-media';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { pagePath } from '@/lib/i18n';

export function HomeJoinSection({ content, locale, revealDelay = 0 }) {
  const [imageIndex, setImageIndex] = useState(0);
  const joinImages = mediaCandidates(HOME_MEDIA.joinTeam);
  const exhausted = imageIndex >= joinImages.length;
  const secondaryLabel = locale === 'ko' ? '구성원 소개 보기' : 'Meet Our Members';
  const { ref, revealClassName, revealStyle } = useScrollReveal(revealDelay);

  return (
    <section
      className={`home-section relative grid gap-6 overflow-hidden px-5 py-6 md:grid-cols-2 md:items-center md:gap-7 md:px-7 md:py-8 ${revealClassName}`}
      ref={ref}
      style={revealStyle}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_14%,rgba(11,58,100,0.08),transparent_34%),radial-gradient(circle_at_100%_80%,rgba(122,15,31,0.08),transparent_40%)]" />

      <div className="relative z-10">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">{content.joinTitle}</h2>
        <div className="mt-5 flex flex-wrap gap-2.5">
          <a
            className="home-cta-primary"
            href="#site-contact"
          >
            {content.joinCta}
          </a>
          <Link
            className="home-cta-secondary"
            to={pagePath(locale, 'members')}
          >
            {secondaryLabel}
          </Link>
        </div>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">{content.joinDescription}</p>
      </div>

      {!exhausted ? (
        <img
          alt={content.joinTitle}
          className="relative z-10 aspect-[16/10] w-full rounded-lg border border-slate-200/90 object-cover shadow-[0_24px_44px_-34px_rgba(8,39,70,0.5)]"
          onError={() => setImageIndex((index) => index + 1)}
          src={joinImages[imageIndex]}
        />
      ) : (
        <div className="relative z-10 flex aspect-[16/10] w-full items-center justify-center rounded-lg border border-slate-200/90 bg-slate-100 text-sm font-medium text-slate-500">
          {locale === 'ko' ? '팀 이미지 준비 중' : 'Team Image Placeholder'}
        </div>
      )}
    </section>
  );
}
