import { Badge } from '@/components/ui/badge';

export function PageHero({ title, description, tags = [], children }) {
  return (
    <section className="relative overflow-hidden rounded-lg border border-border bg-gradient-to-br from-white to-slate-50 p-6 shadow-soft md:p-9">
      <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-[#0b3a64] to-[#1d4f7a]" />
      <h1 className="max-w-3xl pl-4 text-4xl font-semibold leading-tight tracking-tight text-slate-950 md:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-3xl pl-4 text-base text-slate-600 md:text-lg">{description}</p>
      {tags.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2 pl-4">
          {tags.map((tag) => (
            <Badge className="border-slate-200 bg-slate-100 text-slate-700" key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      ) : null}
      {children ? <div className="mt-6 pl-4">{children}</div> : null}
    </section>
  );
}
