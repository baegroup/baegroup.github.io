import { Badge } from '@/components/ui/badge';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export function PageHero({ title, description, tags = [], children, showDescription = false }) {
  const { ref, revealClassName, revealStyle } = useScrollReveal();

  return (
    <section className={`pb-1 pt-1 md:pb-2 ${revealClassName}`} ref={ref} style={revealStyle}>
      <div className={children ? 'md:flex md:items-baseline md:gap-8' : ''}>
        <h1 className="max-w-4xl text-3xl font-semibold leading-tight tracking-tight text-slate-950 md:text-4xl">{title}</h1>
        {children ? (
          <div className="mt-4 min-w-0 md:mt-0 md:flex-1">{children}</div>
        ) : null}
      </div>
      {showDescription && description ? <p className="mt-2.5 max-w-4xl text-sm leading-relaxed text-slate-600 md:text-base">{description}</p> : null}
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
