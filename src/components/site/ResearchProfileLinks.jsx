const PROFILE_LINKS = [
  { key: 'linkedin', label: 'LinkedIn', icon: 'assets/img/news/profiles/linkedin.ico' },
  { key: 'webOfScience', label: 'Web of Science', icon: 'assets/img/news/profiles/webofscience.ico' },
  { key: 'orcid', label: 'ORCID', icon: 'assets/img/news/profiles/orcid.svg' },
  { key: 'scopus', label: 'Scopus', icon: 'assets/img/news/profiles/scopus.svg' },
  { key: 'googleScholar', label: 'Google Scholar', icon: 'assets/img/news/profiles/googlescholar.svg' },
  { key: 'researchGate', label: 'ResearchGate', icon: 'assets/img/news/profiles/researchgate.svg' }
];

export function ResearchProfileLinks({ links = {} }) {
  const items = PROFILE_LINKS.map((item) => ({ ...item, href: links[item.key] })).filter((item) => item.href);

  if (!items.length) {
    return null;
  }

  return (
    <section aria-label="Research profiles" className="space-y-3 px-1 pt-2">
      <h3 className="text-sm font-semibold text-slate-900">Research Profiles</h3>
      <div className="grid grid-cols-3 gap-x-2 gap-y-3">
        {items.map((item) => (
          <a className="group flex min-w-0 flex-col items-center gap-1.5 text-center no-underline" href={item.href} key={item.key} rel="noreferrer" target="_blank">
            <span className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white transition-transform group-hover:-translate-y-0.5 group-hover:border-slate-300">
              <img alt="" aria-hidden="true" className="h-full w-full object-contain p-1.5" decoding="async" loading="lazy" src={`${import.meta.env.BASE_URL}${item.icon}`} />
            </span>
            <span className="text-[0.68rem] font-medium leading-tight text-slate-600 transition-colors group-hover:text-slate-900">{item.label}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
