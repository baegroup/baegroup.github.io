import { useEffect, useMemo, useState } from 'react';

import { PageHero } from '@/components/site/PageHero';
import { RESEARCH_CONTENT } from '@/content/site-content';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const IMAGE_EXTENSIONS = ['webp', 'png', 'jpg', 'jpeg'];
const RESEARCH_AREA_IMAGE_DIR = 'assets/img/research/areas';
const RESEARCH_FUNDING_IMAGE_DIR = 'assets/img/research/funding';

function hasImageExtension(path) {
  return /\.(webp|png|jpe?g)$/i.test(String(path || '').trim());
}

function normalizeFundingBaseName(value) {
  return String(value || '')
    .replace(/\s*&\s*/g, ' and ')
    .replace(/[(),]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function useImageFallback(basePathOrPaths) {
  const basePaths = useMemo(() => {
    const raw = Array.isArray(basePathOrPaths) ? basePathOrPaths : [basePathOrPaths];
    return [...new Set(raw.map((value) => String(value || '').trim()).filter(Boolean))];
  }, [basePathOrPaths]);
  const baseKey = basePaths.join('|');
  const candidates = useMemo(
    () =>
      basePaths.flatMap((basePath) =>
        hasImageExtension(basePath)
          ? [basePath]
          : IMAGE_EXTENSIONS.map((ext) => `${basePath}.${ext}`)
      ),
    [baseKey]
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [baseKey]);

  const broken = index >= candidates.length;
  const src = broken ? '' : `${import.meta.env.BASE_URL}${candidates[index]}`;

  const onError = () => {
    setIndex((prev) => prev + 1);
  };

  return { broken, src, onError };
}

function slugify(value, fallback) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized || fallback;
}

function ResearchAreaRow({ area, index, areaLabel }) {
  const imageBase = area.image || `area-${index + 1}`;
  const image = useImageFallback(`${RESEARCH_AREA_IMAGE_DIR}/${imageBase}`);
  const reverse = index % 2 === 1;
  const keepFullImage = index === 1 || /energy|environment/i.test(String(area.title || ''));
  const { ref, revealClassName, revealStyle } = useScrollReveal(Math.min(index * 60, 120));

  return (
    <article className={`group rounded-xl border border-slate-200 bg-white p-5 shadow-soft transition-[border-color,box-shadow] duration-300 hover:border-slate-300 hover:shadow-[0_24px_50px_-34px_rgba(8,39,70,0.42)] md:p-7 ${revealClassName}`} ref={ref} style={revealStyle}>
      <div className={`grid gap-6 lg:grid-cols-2 lg:items-center lg:gap-8 ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}>
        <figure className="mx-auto w-full max-w-3xl overflow-hidden rounded-lg border border-slate-200 bg-slate-100 lg:max-w-none">
          {!image.broken ? (
            <img
              alt={area.title}
              className={`aspect-[16/10] max-h-[380px] w-full transition-transform duration-700 group-hover:scale-[1.012] lg:max-h-none ${
                keepFullImage ? 'object-contain bg-white p-2' : 'object-cover'
              }`}
              decoding="async"
              loading="lazy"
              onError={image.onError}
              src={image.src}
            />
          ) : (
            <div className="flex aspect-[16/10] max-h-[380px] items-center justify-center px-4 text-center text-sm text-slate-500 lg:max-h-none">Research image placeholder</div>
          )}
        </figure>

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.1em] text-slate-600">{areaLabel}</p>
          <h3 className="home-section-title">{area.title}</h3>
          <p className="home-body-copy max-w-[68ch] text-slate-700">{area.body}</p>
        </div>
      </div>
    </article>
  );
}

function FundingItem({ item, index }) {
  const name = String(item.name || '').trim();
  const normalizedName = normalizeFundingBaseName(name);
  const fallbackSlug = slugify(name, `source-${index + 1}`);
  const image = useImageFallback([
    item.logo ? `${RESEARCH_FUNDING_IMAGE_DIR}/${item.logo}` : '',
    name ? `${RESEARCH_FUNDING_IMAGE_DIR}/${name}` : '',
    normalizedName && normalizedName !== name ? `${RESEARCH_FUNDING_IMAGE_DIR}/${normalizedName}` : '',
    `${RESEARCH_FUNDING_IMAGE_DIR}/${fallbackSlug}`
  ]);

  return (
    <article className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-4 text-center shadow-soft transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_34px_-28px_rgba(8,39,70,0.45)] md:p-5">
      <div className="flex min-h-[92px] items-center justify-center">
        {!image.broken ? (
          <img alt={item.name} className="max-h-14 w-auto object-contain" decoding="async" loading="lazy" onError={image.onError} src={image.src} />
        ) : (
          <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Funding Logo</div>
        )}
      </div>
      <div className="mt-3 flex min-h-[4rem] flex-1 items-center justify-center">
        {item.link ? (
          <a className="block text-sm font-semibold leading-snug text-slate-900 no-underline hover:text-[var(--brand-navy)]" href={item.link} rel="noreferrer" target="_blank">
            {item.name}
          </a>
        ) : (
          <p className="text-sm font-semibold leading-snug text-slate-900">{item.name}</p>
        )}
      </div>
    </article>
  );
}

export function ResearchPage({ locale }) {
  const content = RESEARCH_CONTENT[locale] || RESEARCH_CONTENT.en;
  const coreAreas = content.cards || [];
  const missionTitle = content.missionTitle || 'Our Mission';
  const areaLabel = content.areaLabel || 'Research Area';
  const fundingTitle = content.fundingTitle || 'Funding Sources';
  const fundingItems = content.fundingItems || [];
  const missionReveal = useScrollReveal(40);
  const fundingReveal = useScrollReveal(40);

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHero title={content.title} />

      <section className={`rounded-xl border border-slate-200 bg-white px-5 py-6 shadow-soft md:px-7 md:py-7 ${missionReveal.revealClassName}`} ref={missionReveal.ref} style={missionReveal.revealStyle}>
        <h2 className="home-section-title text-center">{missionTitle}</h2>
        <p className="home-body-copy mx-auto mt-5 max-w-[72ch] text-slate-700">{content.description}</p>
      </section>

      <section className="space-y-4 md:space-y-5">
        {coreAreas.map((area, index) => (
          <ResearchAreaRow area={area} areaLabel={areaLabel} index={index} key={area.title} />
        ))}
      </section>

      <section className={`rounded-xl border border-slate-200 bg-white px-5 py-6 shadow-soft md:px-7 md:py-7 ${fundingReveal.revealClassName}`} ref={fundingReveal.ref} style={fundingReveal.revealStyle}>
        <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">{fundingTitle}</h2>
        <div className="reveal-stagger mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {fundingItems.map((item, index) => (
            <FundingItem index={index} item={item} key={`${item.name}-${item.logo || index}`} />
          ))}
        </div>
      </section>
    </div>
  );
}
