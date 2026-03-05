import fs from 'node:fs/promises';
import path from 'node:path';

import matter from 'gray-matter';

const ROOT = process.cwd();
const CONTENT_ROOT = path.join(ROOT, 'content');
const OUTPUT_PATH = path.join(ROOT, 'src', 'content', 'site-content.generated.json');
const LOCALES = ['en', 'ko'];

async function readSource(locale, slug) {
  const filePath = path.join(CONTENT_ROOT, locale, `${slug}.md`);
  const source = await fs.readFile(filePath, 'utf8');
  const parsed = matter(source);
  return {
    data: parsed.data || {},
    sections: parseSections(parsed.content || '')
  };
}

function parseSections(content) {
  const sections = new Map();
  let current = '__root__';
  sections.set(current, []);

  const lines = content.replace(/\r/g, '').split('\n');
  for (const line of lines) {
    const match = line.match(/^##\s+([A-Za-z0-9_.-]+)\s*$/);
    if (match) {
      current = match[1];
      if (!sections.has(current)) {
        sections.set(current, []);
      }
      continue;
    }

    if (!sections.has(current)) {
      sections.set(current, []);
    }
    sections.get(current).push(line);
  }

  const output = {};
  for (const [key, value] of sections.entries()) {
    output[key] = value.join('\n').trim();
  }
  return output;
}

function normalizeText(value) {
  return String(value || '')
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' ')
    .trim();
}

function readString(source, key) {
  const fromFrontmatter = source.data[key];
  if (typeof fromFrontmatter === 'string' && fromFrontmatter.trim()) {
    return fromFrontmatter.trim();
  }

  if (source.sections[key]) {
    return normalizeText(source.sections[key]);
  }

  return '';
}

function parseBulletLines(sectionText) {
  return String(sectionText || '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => line.slice(2).trim())
    .filter(Boolean);
}

function parseDelimitedItems(sectionText, expectedParts) {
  return parseBulletLines(sectionText)
    .map((line) => line.split('|').map((part) => part.trim()))
    .filter((parts) => parts.length >= expectedParts);
}

function readStringArray(source, key) {
  const fromFrontmatter = source.data[key];
  if (Array.isArray(fromFrontmatter)) {
    return fromFrontmatter.map((item) => normalizeText(item)).filter(Boolean);
  }

  return parseBulletLines(source.sections[key]);
}

function readNavigationItems(source) {
  const fromFrontmatter = source.data.items;
  if (Array.isArray(fromFrontmatter)) {
    return fromFrontmatter.map((item) => ({
      slug: normalizeHomeSlug(item.slug),
      label: String(item.label || '').trim()
    }));
  }

  return parseDelimitedItems(source.sections.items, 2).map(([slug, label]) => ({
    slug: normalizeHomeSlug(slug),
    label
  }));
}

function normalizeHomeSlug(slug) {
  const text = String(slug || '').trim();
  if (text === '/' || text.toLowerCase() === 'home') {
    return '';
  }
  return text;
}

function readNewsSummary(source) {
  const fromFrontmatter = source.data.newsItems;
  if (Array.isArray(fromFrontmatter)) {
    return fromFrontmatter.map((item) => ({
      date: String(item.date || '').trim(),
      text: normalizeText(item.text)
    }));
  }

  return parseDelimitedItems(source.sections.newsItems, 2).map(([date, text]) => ({ date, text }));
}

function readCardItems(source, key) {
  const fromFrontmatter = source.data[key];
  if (Array.isArray(fromFrontmatter)) {
    return fromFrontmatter.map((item) => ({
      title: String(item.title || '').trim(),
      body: normalizeText(item.body)
    }));
  }

  return parseDelimitedItems(source.sections[key], 2).map(([title, body]) => ({ title, body }));
}

function readNewsPageItems(source) {
  const fromFrontmatter = source.data.items;
  if (Array.isArray(fromFrontmatter)) {
    return fromFrontmatter.map((item) => ({
      date: String(item.date || '').trim(),
      title: String(item.title || '').trim(),
      body: normalizeText(item.body)
    }));
  }

  return parseDelimitedItems(source.sections.items, 3).map(([date, title, body]) => ({
    date,
    title,
    body
  }));
}

function readLabels(source) {
  const fromFrontmatter = source.data.labels;
  if (fromFrontmatter && typeof fromFrontmatter === 'object' && !Array.isArray(fromFrontmatter)) {
    return fromFrontmatter;
  }

  const labels = {};
  parseDelimitedItems(source.sections.labels, 2).forEach(([key, value]) => {
    labels[key] = value;
  });
  return labels;
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
    const navigation = await readSource(locale, 'navigation');
    const brand = await readSource(locale, 'brand');
    const home = await readSource(locale, 'home');
    const members = await readSource(locale, 'members');
    const research = await readSource(locale, 'research');
    const publications = await readSource(locale, 'publications');
    const news = await readSource(locale, 'news');
    const contact = await readSource(locale, 'contact');

    output.NAV_ITEMS[locale] = readNavigationItems(navigation);

    output.BRAND[locale] = {
      name: readString(brand, 'name'),
      subtitle: readString(brand, 'subtitle'),
      tagline: readString(brand, 'tagline')
    };

    output.HOME_CONTENT[locale] = {
      title: readString(home, 'title'),
      description: readString(home, 'description'),
      tags: readStringArray(home, 'tags'),
      primaryCta: readString(home, 'primaryCta'),
      secondaryCta: readString(home, 'secondaryCta'),
      newsTitle: readString(home, 'newsTitle'),
      newsItems: readNewsSummary(home),
      focusTitle: readString(home, 'focusTitle'),
      focusDescription: readString(home, 'focusDescription'),
      focusCta: readString(home, 'focusCta'),
      joinTitle: readString(home, 'joinTitle'),
      joinDescription: readString(home, 'joinDescription'),
      joinCta: readString(home, 'joinCta')
    };

    output.MEMBERS_CONTENT[locale] = {
      title: readString(members, 'title'),
      description: readString(members, 'description'),
      sectionTitle: readString(members, 'sectionTitle'),
      current: readString(members, 'current'),
      alumni: readString(members, 'alumni'),
      loading: readString(members, 'loading'),
      empty: readString(members, 'empty')
    };

    output.RESEARCH_CONTENT[locale] = {
      title: readString(research, 'title'),
      description: readString(research, 'description'),
      cards: readCardItems(research, 'cards'),
      methodsTitle: readString(research, 'methodsTitle'),
      methods: readCardItems(research, 'methods')
    };

    output.PUBLICATIONS_CONTENT[locale] = {
      title: readString(publications, 'title'),
      description: readString(publications, 'description'),
      sectionTitle: readString(publications, 'sectionTitle'),
      loading: readString(publications, 'loading'),
      empty: readString(publications, 'empty'),
      paperLink: readString(publications, 'paperLink')
    };

    output.NEWS_CONTENT[locale] = {
      title: readString(news, 'title'),
      description: readString(news, 'description'),
      sectionTitle: readString(news, 'sectionTitle'),
      items: readNewsPageItems(news)
    };

    output.CONTACT_CONTENT[locale] = {
      title: readString(contact, 'title'),
      description: readString(contact, 'description'),
      leftTitle: readString(contact, 'leftTitle'),
      rightTitle: readString(contact, 'rightTitle'),
      labels: readLabels(contact),
      office: readString(contact, 'office'),
      address: readString(contact, 'address'),
      map: readString(contact, 'map'),
      apply: readString(contact, 'apply')
    };
  }

  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(`Generated content: ${path.relative(ROOT, OUTPUT_PATH)}`);
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
