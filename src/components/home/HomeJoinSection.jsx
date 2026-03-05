import { useState } from 'react';
import { Link } from 'react-router-dom';

import { HOME_MEDIA, resolveHomeMedia } from '@/content/home-media';
import { pagePath } from '@/lib/i18n';

export function HomeJoinSection({ content, locale }) {
  const [broken, setBroken] = useState(false);
  const secondaryLabel = locale === 'ko' ? '연구실 문화 보기' : 'Our Lab Culture';

  return (
    <section className="grid gap-6 rounded-lg border border-slate-200 bg-white px-6 py-6 shadow-soft md:grid-cols-2 md:items-center md:px-8 md:py-8">
      <div>
        <h2 className="text-4xl font-semibold tracking-tight text-slate-950">{content.joinTitle}</h2>
        <p className="mt-4 text-base text-slate-600 md:text-lg">{content.joinDescription}</p>
        <div className="mt-6 flex flex-wrap gap-2.5">
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

      {!broken ? (
        <img
          alt={content.joinTitle}
          className="aspect-[16/10] w-full rounded-md object-cover"
          onError={() => setBroken(true)}
          src={resolveHomeMedia(HOME_MEDIA.joinTeam)}
        />
      ) : (
        <div className="flex aspect-[16/10] w-full items-center justify-center rounded-md bg-slate-100 text-sm font-medium text-slate-500">
          {locale === 'ko' ? '팀 이미지 준비 중' : 'Team Image Placeholder'}
        </div>
      )}
    </section>
  );
}
