import { Badge } from '@/components/ui/badge';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export function PageHero({ title, titleAs = 'h1', description, tags = [], children, showDescription = false }) {
  const { ref, revealClassName, revealStyle } = useScrollReveal();
  const TitleTag = titleAs;

  return (
    <section className={`pb-1 pt-1 md:pb-2 ${revealClassName}`} ref={ref} style={revealStyle}>
      <div className={children ? 'md:flex md:items-baseline md:gap-7' : ''}>
        <TitleTag className="max-w-4xl text-3xl font-semibold leading-tight tracking-tight text-slate-950 md:text-4xl">{title}</TitleTag>
        {children ? (
          <div className="mt-4 min-w-0 md:mt-0 md:flex-1">{children}</div>
        ) : null}
      </div>
      {showDescription && description ? <p className="site-copy-support site-reading-measure mt-2.5">{description}</p> : null}
      {tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge className="border-slate-300/80 bg-white text-slate-700" key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      ) : null}
    </section>
  );
}
