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
  const [latestNewsReady, setLatestNewsReady] = useState(false);

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
      } finally {
        if (mounted) {
          setLatestNewsReady(true);
        }
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
      newsTitle: homeContent.newsTitle || 'Latest Highlights',
      items: latestNewsItems
    }),
    [homeContent.newsTitle, newsContent, latestNewsItems]
  );

  return (
    <div>
      <HomeHeroSection content={homeContent} revealDelay={0} />
      <HomeResearchAreasSection
        content={researchContent}
        locale={locale}
        revealDelay={70}
      />
      <div data-prerender-pending={latestNewsReady ? undefined : 'true'}>
        <HomeNewsSection content={mergedNewsContent} locale={locale} revealDelay={120} />
      </div>
      <HomeJoinSection content={homeContent} locale={locale} revealDelay={170} />
    </div>
  );
}
