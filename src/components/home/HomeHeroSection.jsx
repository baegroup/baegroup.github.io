import { buildImageSrcSet, HOME_MEDIA, resolveHomeMedia } from '@/content/home-media';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export function HomeHeroSection({ content, revealDelay = 0 }) {
  const { ref, revealClassName, revealStyle } = useScrollReveal(revealDelay);

  return (
    <section className={`home-hero relative overflow-hidden rounded-xl border border-slate-200/90 bg-slate-900 shadow-soft ${revealClassName}`} ref={ref} style={revealStyle}>
      <picture className="absolute inset-0">
        <source
          sizes="(max-width: 767px) calc(100vw - 40px), 1152px"
          srcSet={buildImageSrcSet(HOME_MEDIA.heroCoverWebp)}
          type="image/webp"
        />
        <img
          alt={content.title}
          className="home-hero-media h-full w-full object-cover"
          decoding="async"
          fetchPriority="high"
          src={resolveHomeMedia(HOME_MEDIA.heroCover)}
        />
      </picture>
      <div className="absolute inset-0 bg-[linear-gradient(92deg,rgba(7,20,43,0.76)_0%,rgba(9,31,66,0.62)_34%,rgba(13,50,111,0.42)_66%,rgba(255,255,255,0.08)_100%)]" />

      <div className="home-hero-copy relative z-10 px-6 py-10 md:px-10 md:py-14">
        <h1 className="home-display-hero max-w-4xl text-white">{content.title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/90 md:text-lg">{content.description}</p>
      </div>
    </section>
  );
}
