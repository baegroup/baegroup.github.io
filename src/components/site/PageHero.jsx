import { Badge } from '@/components/ui/badge';

export function PageHero({ title, description, tags = [], children }) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-slate-200 bg-[linear-gradient(135deg,#f8fbff_0%,#f3f7fc_48%,#ffffff_100%)] px-6 py-7 shadow-[0_20px_40px_-28px_rgba(10,37,64,0.45)] md:px-8 md:py-9">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_16%,rgba(13,50,111,0.14),transparent_36%),radial-gradient(circle_at_92%_86%,rgba(122,15,31,0.10),transparent_32%)]" />
      <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(to_right,rgba(148,163,184,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.22)_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative z-10">
        <div className="mb-4 h-[3px] w-16 rounded-full bg-[#0d326f]" />
        <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-slate-950 md:text-5xl">{title}</h1>
        {description ? <p className="mt-3.5 max-w-4xl text-base leading-relaxed text-slate-700 md:text-lg">{description}</p> : null}
        {tags.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge className="border-slate-300/80 bg-white/75 text-slate-700 backdrop-blur-[2px]" key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </section>
  );
}
