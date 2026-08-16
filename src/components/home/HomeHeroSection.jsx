import { buildImageSrcSet, HOME_MEDIA, resolveHomeMedia } from '@/content/home-media';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export function HomeHeroSection({ content, revealDelay = 0 }) {
  const { ref, revealClassName, revealStyle } = useScrollReveal(revealDelay);

  return (
    <section className={`home-hero relative overflow-hidden rounded-md bg-slate-900 ${revealClassName}`} ref={ref} style={revealStyle}>
      <picture className="absolute inset-0">
        <source
          sizes="(max-width: 767px) calc(100vw - 32px), 1152px"
          srcSet={buildImageSrcSet(HOME_MEDIA.heroCoverWebp)}
          type="image/webp"
        />
        <img
          alt={content.title}
          className="home-hero-media h-full w-full object-cover"
          decoding="async"
          fetchPriority="high"
          height="2560"
          loading="eager"
          src={resolveHomeMedia(HOME_MEDIA.heroCover)}
          width="1920"
        />
      </picture>
      <div className="absolute inset-0 bg-[linear-gradient(92deg,rgba(7,20,43,0.76)_0%,rgba(9,31,66,0.62)_34%,rgba(13,50,111,0.42)_66%,rgba(255,255,255,0.08)_100%)]" />

      <div className="home-hero-copy relative z-10 flex min-h-[22rem] flex-col justify-center px-6 py-12 md:min-h-[25rem] md:px-10 md:pb-14 md:pt-[4.5rem]">
        <h1 className="home-display-hero max-w-4xl text-white">{content.title}</h1>
        <p className="mt-[1.375rem] max-w-3xl text-base leading-relaxed text-white/90 md:text-lg">{content.description}</p>
      </div>
    </section>
  );
}
