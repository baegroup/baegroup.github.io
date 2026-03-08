import { useEffect, useMemo, useState } from 'react';

import { RESEARCH_CONTENT } from '@/content/site-content';

const IMAGE_EXTENSIONS = ['webp', 'png', 'jpg', 'jpeg'];
const RESEARCH_AREA_IMAGE_DIR = 'assets/img/research/areas';
const RESEARCH_FUNDING_IMAGE_DIR = 'assets/img/research/funding';

function useImageFallback(basePath) {
  const candidates = useMemo(() => IMAGE_EXTENSIONS.map((ext) => `${basePath}.${ext}`), [basePath]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [basePath]);

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

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft md:p-7">
      <div className={`grid gap-6 lg:grid-cols-2 lg:gap-8 ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}>
        <figure className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
          {!image.broken ? (
            <img alt={area.title} className="aspect-[16/10] w-full object-cover" onError={image.onError} src={image.src} />
          ) : (
            <div className="flex aspect-[16/10] items-center justify-center px-4 text-center text-sm text-slate-500">Research image placeholder</div>
          )}
        </figure>

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.1em] text-slate-600">{areaLabel}</p>
          <h3 className="text-4xl font-semibold leading-tight tracking-tight text-slate-950 md:text-5xl">{area.title}</h3>
          <p className="text-base leading-relaxed text-slate-700 md:text-lg">{area.body}</p>
        </div>
      </div>
    </article>
  );
}

function FundingItem({ item, index }) {
  const base = item.logo || slugify(item.name, `source-${index + 1}`);
  const image = useImageFallback(`${RESEARCH_FUNDING_IMAGE_DIR}/${base}`);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 text-center shadow-soft md:p-5">
      <div className="flex min-h-[92px] items-center justify-center">
        {!image.broken ? (
          <img alt={item.name} className="max-h-14 w-auto object-contain" onError={image.onError} src={image.src} />
        ) : (
          <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Funding Logo</div>
        )}
      </div>
      {item.link ? (
        <a className="mt-3 block text-sm font-semibold leading-snug text-slate-900 no-underline hover:text-[#0d326f]" href={item.link} rel="noreferrer" target="_blank">
          {item.name}
        </a>
      ) : (
        <p className="mt-3 text-sm font-semibold leading-snug text-slate-900">{item.name}</p>
      )}
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

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-[#243445] px-6 py-7 text-white md:px-8 md:py-9">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{content.title}</h1>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white px-5 py-6 shadow-soft md:px-7 md:py-7">
        <h2 className="text-center text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">{missionTitle}</h2>
        <div className="mx-auto mt-5 max-w-5xl rounded-xl border border-slate-200 bg-slate-50/80 p-5 md:p-6">
          <p className="text-base leading-relaxed text-slate-700 md:text-lg">{content.description}</p>
        </div>
      </section>

      <section className="space-y-4 md:space-y-5">
        {coreAreas.map((area, index) => (
          <ResearchAreaRow area={area} areaLabel={areaLabel} index={index} key={area.title} />
        ))}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white px-5 py-6 shadow-soft md:px-7 md:py-7">
        <h2 className="text-center text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">{fundingTitle}</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {fundingItems.map((item, index) => (
            <FundingItem index={index} item={item} key={`${item.name}-${item.logo || index}`} />
          ))}
        </div>
      </section>
    </div>
  );
}
