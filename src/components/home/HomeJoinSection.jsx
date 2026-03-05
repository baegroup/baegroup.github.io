import { useState } from 'react';
import { Link } from 'react-router-dom';

import { HOME_MEDIA, mediaCandidates } from '@/content/home-media';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { pagePath } from '@/lib/i18n';

export function HomeJoinSection({ content, locale, revealDelay = 0 }) {
  const [imageIndex, setImageIndex] = useState(0);
  const joinImages = mediaCandidates(HOME_MEDIA.joinTeam);
  const exhausted = imageIndex >= joinImages.length;
  const secondaryLabel = locale === 'ko' ? '연구실 문화 보기' : 'Our Lab Culture';
  const { ref, revealClassName, revealStyle } = useScrollReveal(revealDelay);

  return (
    <section className={`grid gap-5 rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-soft md:grid-cols-2 md:items-center md:gap-6 md:px-7 md:py-7 ${revealClassName}`} ref={ref} style={revealStyle}>
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">{content.joinTitle}</h2>
        <p className="mt-3.5 text-base text-slate-600 md:text-lg">{content.joinDescription}</p>
        <div className="mt-5 flex flex-wrap gap-2.5">
          <a
            className="inline-flex h-11 items-center rounded-full bg-[#7a0f1f] px-6 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#68101b]"
            href="#site-contact"
          >
            {content.joinCta}
          </a>
          <Link
            className="inline-flex h-11 items-center rounded-full border border-[#7a0f1f]/30 bg-white px-6 text-sm font-semibold text-[#7a0f1f] no-underline transition-colors hover:bg-[#7a0f1f]/5"
            to={pagePath(locale, 'members')}
          >
            {secondaryLabel}
          </Link>
        </div>
      </div>

      {!exhausted ? (
        <img
          alt={content.joinTitle}
          className="aspect-[16/10] w-full rounded-md object-cover"
          onError={() => setImageIndex((index) => index + 1)}
          src={joinImages[imageIndex]}
        />
      ) : (
        <div className="flex aspect-[16/10] w-full items-center justify-center rounded-md bg-slate-100 text-sm font-medium text-slate-500">
          {locale === 'ko' ? '팀 이미지 준비 중' : 'Team Image Placeholder'}
        </div>
      )}
    </section>
  );
}
