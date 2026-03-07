import { PageHero } from '@/components/site/PageHero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RESEARCH_CONTENT } from '@/content/site-content';

export function ResearchPage({ locale }) {
  const content = RESEARCH_CONTENT[locale];
  const coreAreas = (content.cards || []).slice(0, 3);

  return (
    <>
      <PageHero description={content.description} title={content.title} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {coreAreas.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base text-slate-600">{card.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{content.methodsTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3">
            {content.methods.map((method) => (
              <li className="rounded-md border border-border px-4 py-3" key={method.title}>
                <p className="text-base font-semibold text-slate-900">{method.title}</p>
                <p className="mt-1 text-base text-slate-600">{method.body}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
