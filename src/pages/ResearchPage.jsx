import { useEffect, useMemo, useState } from 'react';

import { PageHero } from '@/components/site/PageHero';
import { RESEARCH_CONTENT } from '@/content/site-content';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { formatItemNumber } from '@/lib/format';
import { responsiveImageProps } from '@/lib/responsive-images';

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

function ResearchAreaRow({ area, index }) {
  const imageBase = area.image || `area-${index + 1}`;
  const image = useImageFallback(`${RESEARCH_AREA_IMAGE_DIR}/${imageBase}`);
  const reverse = index % 2 === 1;
  const keepFullImage = index === 1 || /energy|environment/i.test(String(area.title || ''));
  const { ref, revealClassName, revealStyle } = useScrollReveal(Math.min(index * 60, 120));

  return (
    <article className={`site-rule-strong border-b py-8 first:pt-0 md:py-10 ${revealClassName}`} ref={ref} style={revealStyle}>
      <div className={`grid gap-7 lg:grid-cols-2 lg:items-center lg:gap-10 ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}>
        <figure className="mx-auto w-full max-w-3xl overflow-hidden rounded-sm lg:max-w-none">
          {!image.broken ? (
            <img
              {...responsiveImageProps(image.src, '(max-width: 1023px) min(100vw - 32px, 768px), 552px')}
              alt={area.title}
              className={`media-landscape max-h-[380px] w-full lg:max-h-none ${
                keepFullImage ? 'object-contain bg-white p-2' : 'object-cover'
              }`}
              decoding="async"
              loading="lazy"
              onError={image.onError}
              src={image.src}
            />
          ) : (
            <div className="media-landscape flex max-h-[380px] items-center justify-center px-4 text-center text-sm text-slate-600 lg:max-h-none">Research image placeholder</div>
          )}
        </figure>

        <div className="space-y-4">
          <p className="site-meta-index">{formatItemNumber(index + 1)}</p>
          <h3 className="page-section-title">{area.title}</h3>
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
    <article className="flex h-full w-1/2 shrink-0 flex-col px-4 py-5 text-center md:px-5 md:py-6 xl:w-1/4">
      <div className="flex min-h-[92px] items-center justify-center">
        {!image.broken ? (
          <img {...responsiveImageProps(image.src, '220px')} alt={item.name} className="max-h-14 w-auto object-contain" decoding="async" loading="lazy" onError={image.onError} src={image.src} />
        ) : (
          <div className="text-xs font-medium text-slate-600">Funding logo</div>
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
  const fundingTitle = content.fundingTitle || 'Funding Sources';
  const fundingItems = content.fundingItems || [];
  const missionReveal = useScrollReveal(40);
  const fundingReveal = useScrollReveal(40);

  return (
    <div>
      <PageHero title={content.title} />

      <section className={`page-content-offset site-rule-strong border-b pb-10 md:pb-12 ${missionReveal.revealClassName}`} ref={missionReveal.ref} style={missionReveal.revealStyle}>
        <p className="site-meta-index">{formatItemNumber(0)}</p>
        <h2 className="page-section-title mt-3">{missionTitle}</h2>
        <p className="site-copy-lead mt-4 max-w-4xl md:[text-wrap:balance]">{content.description}</p>
      </section>

      <section className="space-y-4 py-10 md:space-y-5 md:py-12 lg:py-14">
        <h2 className="sr-only">Research Areas</h2>
        {coreAreas.map((area, index) => (
          <ResearchAreaRow area={area} index={index} key={area.title} />
        ))}
      </section>

      <section className={`${fundingReveal.revealClassName} pt-10 md:pt-12 lg:pt-14`} ref={fundingReveal.ref} style={fundingReveal.revealStyle}>
        <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">{fundingTitle}</h2>
        <div className="reveal-stagger mt-6 flex flex-wrap justify-center gap-y-5">
          {fundingItems.map((item, index) => (
            <FundingItem index={index} item={item} key={`${item.name}-${item.logo || index}`} />
          ))}
        </div>
      </section>
    </div>
  );
}
