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
    <div className="space-y-8 md:space-y-12 xl:space-y-14">
      <HomeHeroSection content={homeContent} locale={locale} revealDelay={0} />
      <div className="pt-1 md:pt-2">
        <HomeResearchAreasSection content={researchContent} locale={locale} revealDelay={70} />
      </div>
      <HomeNewsSection content={newsContent} locale={locale} revealDelay={120} />
      <HomeJoinSection content={homeContent} locale={locale} revealDelay={170} />
    </div>
  );
}
