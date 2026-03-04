import { PageHero } from '@/components/site/PageHero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RESEARCH_CONTENT } from '@/content/site-content';

export function ResearchPage({ locale }) {
  const content = RESEARCH_CONTENT[locale];

  return (
    <>
      <PageHero description={content.description} title={content.title} />

      <div className="grid gap-4 md:grid-cols-2">
        {content.cards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 md:text-base">{card.body}</p>
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
                <p className="text-sm font-semibold text-slate-900 md:text-base">{method.title}</p>
                <p className="mt-1 text-sm text-slate-600 md:text-base">{method.body}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
