import fs from 'node:fs/promises';
import path from 'node:path';

import matter from 'gray-matter';

const ROOT = process.cwd();
const CONTENT_ROOT = path.join(ROOT, 'content');
const OUTPUT_PATH = path.join(ROOT, 'src', 'content', 'site-content.generated.json');
const LOCALES = ['en', 'ko'];

async function readFrontmatter(locale, slug) {
  const filePath = path.join(CONTENT_ROOT, locale, `${slug}.md`);
  const source = await fs.readFile(filePath, 'utf8');
  const parsed = matter(source);
  return parsed.data || {};
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

async function build() {
  const output = {
    NAV_ITEMS: {},
    BRAND: {},
    HOME_CONTENT: {},
    MEMBERS_CONTENT: {},
    RESEARCH_CONTENT: {},
    PUBLICATIONS_CONTENT: {},
    NEWS_CONTENT: {},
    CONTACT_CONTENT: {}
  };

  for (const locale of LOCALES) {
    const navigation = await readFrontmatter(locale, 'navigation');
    const brand = await readFrontmatter(locale, 'brand');
    const home = await readFrontmatter(locale, 'home');
    const members = await readFrontmatter(locale, 'members');
    const research = await readFrontmatter(locale, 'research');
    const publications = await readFrontmatter(locale, 'publications');
    const news = await readFrontmatter(locale, 'news');
    const contact = await readFrontmatter(locale, 'contact');

    output.NAV_ITEMS[locale] = asArray(navigation.items).map((item) => ({
      slug: String(item.slug ?? ''),
      label: String(item.label ?? '')
    }));

    output.BRAND[locale] = {
      name: String(brand.name ?? ''),
      subtitle: String(brand.subtitle ?? '')
    };

    output.HOME_CONTENT[locale] = {
      title: String(home.title ?? ''),
      description: String(home.description ?? ''),
      tags: asArray(home.tags).map((item) => String(item)),
      primaryCta: String(home.primaryCta ?? ''),
      secondaryCta: String(home.secondaryCta ?? ''),
      newsTitle: String(home.newsTitle ?? ''),
      newsItems: asArray(home.newsItems).map((item) => ({
        date: String(item.date ?? ''),
        text: String(item.text ?? '')
      })),
      focusTitle: String(home.focusTitle ?? ''),
      focusDescription: String(home.focusDescription ?? ''),
      focusCta: String(home.focusCta ?? ''),
      joinTitle: String(home.joinTitle ?? ''),
      joinDescription: String(home.joinDescription ?? ''),
      joinCta: String(home.joinCta ?? '')
    };

    output.MEMBERS_CONTENT[locale] = {
      title: String(members.title ?? ''),
      description: String(members.description ?? ''),
      sectionTitle: String(members.sectionTitle ?? ''),
      current: String(members.current ?? ''),
      alumni: String(members.alumni ?? ''),
      loading: String(members.loading ?? ''),
      empty: String(members.empty ?? '')
    };

    output.RESEARCH_CONTENT[locale] = {
      title: String(research.title ?? ''),
      description: String(research.description ?? ''),
      cards: asArray(research.cards).map((item) => ({
        title: String(item.title ?? ''),
        body: String(item.body ?? '')
      })),
      methodsTitle: String(research.methodsTitle ?? ''),
      methods: asArray(research.methods).map((item) => ({
        title: String(item.title ?? ''),
        body: String(item.body ?? '')
      }))
    };

    output.PUBLICATIONS_CONTENT[locale] = {
      title: String(publications.title ?? ''),
      description: String(publications.description ?? ''),
      sectionTitle: String(publications.sectionTitle ?? ''),
      loading: String(publications.loading ?? ''),
      empty: String(publications.empty ?? ''),
      paperLink: String(publications.paperLink ?? '')
    };

    output.NEWS_CONTENT[locale] = {
      title: String(news.title ?? ''),
      description: String(news.description ?? ''),
      sectionTitle: String(news.sectionTitle ?? ''),
      items: asArray(news.items).map((item) => ({
        date: String(item.date ?? ''),
        title: String(item.title ?? ''),
        body: String(item.body ?? '')
      }))
    };

    output.CONTACT_CONTENT[locale] = {
      title: String(contact.title ?? ''),
      description: String(contact.description ?? ''),
      leftTitle: String(contact.leftTitle ?? ''),
      rightTitle: String(contact.rightTitle ?? ''),
      labels: asObject(contact.labels),
      office: String(contact.office ?? ''),
      address: String(contact.address ?? ''),
      map: String(contact.map ?? ''),
      apply: String(contact.apply ?? '')
    };
  }

  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(`Generated content: ${path.relative(ROOT, OUTPUT_PATH)}`);
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
