import { BRAND } from '@/content/site-content';

export function SiteFooter({ locale }) {
  const brand = BRAND[locale];
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-white/70 py-5 text-sm text-slate-500">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-5">
        <p>© {year} {brand.name}. All rights reserved.</p>
        <p>{brand.subtitle}</p>
      </div>
    </footer>
  );
}
