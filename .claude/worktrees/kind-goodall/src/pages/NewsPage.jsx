import { PageHero } from '@/components/site/PageHero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NEWS_CONTENT } from '@/content/site-content';

export function NewsPage({ locale }) {
  const content = NEWS_CONTENT[locale];

  return (
    <>
      <PageHero description={content.description} title={content.title} />

      <Card>
        <CardHeader>
          <CardTitle>{content.sectionTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3">
            {content.items.map((item) => (
              <li className="rounded-md border border-border bg-white px-4 py-3" key={`${item.date}-${item.title}`}>
                <p className="text-xs font-bold uppercase tracking-wide text-[#1d4f7a]">{item.date}</p>
                <p className="mt-1 text-base font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-base text-slate-600">{item.body}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
