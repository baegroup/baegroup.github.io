import { Badge } from '@/components/ui/badge';

export function PageHero({ title, description, tags = [], children, showDescription = false }) {
  return (
    <section className="border-b border-slate-200 pb-4 pt-1 md:pb-5">
      <div className="h-[3px] w-14 rounded-full bg-[#0d326f]" />
      <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight tracking-tight text-slate-950 md:text-4xl">{title}</h1>
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
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}
