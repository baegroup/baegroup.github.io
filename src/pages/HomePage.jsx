import { Link } from 'react-router-dom';

import { PageHero } from '@/components/site/PageHero';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HOME_CONTENT } from '@/content/site-content';
import { pagePath } from '@/lib/i18n';

export function HomePage({ locale }) {
  const content = HOME_CONTENT[locale];

  return (
    <>
      <PageHero description={content.description} tags={content.tags} title={content.title}>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to={pagePath(locale, 'research')}>{content.primaryCta}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={pagePath(locale, 'publications')}>{content.secondaryCta}</Link>
          </Button>
        </div>
      </PageHero>

      <Card>
        <CardHeader>
          <CardTitle>{content.newsTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3">
            {content.newsItems.map((item) => (
              <li className="rounded-md border border-border bg-white px-4 py-3" key={`${item.date}-${item.text}`}>
                <p className="text-xs font-bold uppercase tracking-wide text-[#1d4f7a]">{item.date}</p>
                <p className="mt-1 text-base text-slate-600">{item.text}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{content.focusTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base text-slate-600">{content.focusDescription}</p>
            <Button asChild size="sm" variant="outline">
              <Link to={pagePath(locale, 'research')}>{content.focusCta}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{content.joinTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base text-slate-600">{content.joinDescription}</p>
            <Button asChild size="sm" variant="outline">
              <a href="#site-contact">{content.joinCta}</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
