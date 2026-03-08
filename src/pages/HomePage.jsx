import { useEffect, useMemo, useState } from 'react';

import { HomeHeroSection } from '@/components/home/HomeHeroSection';
import { HomeJoinSection } from '@/components/home/HomeJoinSection';
import { HomeNewsSection } from '@/components/home/HomeNewsSection';
import { HomeResearchAreasSection } from '@/components/home/HomeResearchAreasSection';
import { HOME_CONTENT, NEWS_CONTENT, RESEARCH_CONTENT } from '@/content/site-content';
import { loadLatestNewsItems } from '@/lib/data';

export function HomePage({ locale }) {
  const homeContent = HOME_CONTENT[locale];
  const researchContent = RESEARCH_CONTENT[locale];
  const newsContent = NEWS_CONTENT[locale];
  const [latestNewsItems, setLatestNewsItems] = useState(newsContent.items || []);

  useEffect(() => {
    let mounted = true;

    async function run() {
      try {
        const items = await loadLatestNewsItems(6);
        if (!mounted || !items.length) {
          return;
        }
        setLatestNewsItems(items);
      } catch {
        // Keep markdown fallback items when API data load fails.
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, [locale]);

  const mergedNewsContent = useMemo(
    () => ({
      ...newsContent,
      newsTitle: homeContent.newsTitle || 'Recent Lab News',
      items: latestNewsItems
    }),
    [homeContent.newsTitle, newsContent, latestNewsItems]
  );

  return (
    <div className="space-y-8 md:space-y-12 xl:space-y-14">
      <HomeHeroSection content={homeContent} revealDelay={0} />
      <div className="pt-1 md:pt-2">
        <HomeResearchAreasSection
          content={researchContent}
          heroCtas={{ primary: homeContent.primaryCta, secondary: homeContent.secondaryCta }}
          locale={locale}
          revealDelay={70}
        />
      </div>
      <HomeNewsSection content={mergedNewsContent} locale={locale} revealDelay={120} />
      <HomeJoinSection content={homeContent} locale={locale} revealDelay={170} />
    </div>
  );
}
