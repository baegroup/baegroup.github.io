import { HomeHeroSection } from '@/components/home/HomeHeroSection';
import { HomeJoinSection } from '@/components/home/HomeJoinSection';
import { HomeNewsSection } from '@/components/home/HomeNewsSection';
import { HomeResearchAreasSection } from '@/components/home/HomeResearchAreasSection';
import { HOME_CONTENT, NEWS_CONTENT, RESEARCH_CONTENT } from '@/content/site-content';

export function HomePage({ locale }) {
  const homeContent = HOME_CONTENT[locale];
  const researchContent = RESEARCH_CONTENT[locale];
  const newsContent = NEWS_CONTENT[locale];

  return (
    <>
      <HomeHeroSection content={homeContent} locale={locale} />
      <HomeResearchAreasSection content={researchContent} locale={locale} />
      <HomeNewsSection content={newsContent} locale={locale} />
      <HomeJoinSection content={homeContent} locale={locale} />
    </>
  );
}
