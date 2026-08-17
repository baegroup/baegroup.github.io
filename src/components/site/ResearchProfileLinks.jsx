const PROFILE_LINKS = [
  { key: 'googleScholar', label: 'Google Scholar', icon: 'assets/img/news/profiles/googlescholar.svg' },
  { key: 'webOfScience', label: 'Web of Science', icon: 'assets/img/news/profiles/webofscience.ico' },
  { key: 'orcid', label: 'ORCID', icon: 'assets/img/news/profiles/orcid.svg' },
  { key: 'linkedin', label: 'LinkedIn', icon: 'assets/img/news/profiles/linkedin.ico' },
  { key: 'scopus', label: 'Scopus', icon: 'assets/img/news/profiles/scopus.svg' },
  { key: 'researchGate', label: 'ResearchGate', icon: 'assets/img/news/profiles/researchgate.svg' }
];

export function ResearchProfileLinks({ links = {}, variant = 'default' }) {
  const items = PROFILE_LINKS.map((item) => ({ ...item, href: links[item.key] })).filter((item) => item.href);

  if (!items.length) {
    return null;
  }

  if (variant === 'inline') {
    return (
      <section aria-label="Research profiles" className="site-rule-soft mt-4 border-t pt-4">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1.5">
          <h4 className="text-xs font-semibold text-slate-600">Research Profiles</h4>
          {items.map((item) => (
            <a
              className="site-text-link whitespace-nowrap text-xs font-medium"
              href={item.href}
              key={item.key}
              rel="noreferrer"
              target="_blank"
            >
              {item.label}
            </a>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Research profiles" className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Research Profiles</h3>
      <div className="grid grid-cols-2 gap-x-4">
        {items.map((item) => (
          <a
            className="group site-rule-soft grid min-w-0 grid-cols-[1.75rem_minmax(0,1fr)] items-center gap-2 border-t py-3 no-underline"
            href={item.href}
            key={item.key}
            rel="noreferrer"
            target="_blank"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center overflow-hidden transition-transform group-hover:-translate-y-0.5">
              <img alt="" aria-hidden="true" className="h-full w-full object-contain p-0.5" decoding="async" loading="lazy" src={`${import.meta.env.BASE_URL}${item.icon}`} />
            </span>
            <span className="min-w-0 text-xs font-medium leading-tight text-slate-600 transition-colors group-hover:text-[var(--brand-navy)]">{item.label}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
