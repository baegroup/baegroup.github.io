import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  absoluteSiteUrl,
  DEFAULT_SOCIAL_IMAGE,
  DEFAULT_SOCIAL_IMAGE_HEIGHT,
  DEFAULT_SOCIAL_IMAGE_WIDTH,
  getStructuredDataForPath,
  SEO_ROUTES,
  SITE_NAME,
  SITE_URL
} from '../src/content/seo.js';
import {
  newsItemPath,
  newsSectionPath,
  publicationPagePath
} from '../src/lib/seo-paths.js';

const DIST_DIR = path.resolve('dist');
const PUBLIC_DIR = path.resolve('public');
const META_START = '<!-- route-meta:start -->';
const META_END = '<!-- route-meta:end -->';
const NEWS_PAGE_SIZE = 5;
const VIDEO_PAGE_SIZE = 4;

const LEGACY_REDIRECTS = [
  { from: '/kr', to: '/ko' },
  { from: '/kr/배재형-교수', to: '/team/jaehyeong-bae' },
  { from: '/jaehyeong-bae', to: '/team/jaehyeong-bae' },
  { from: '/kr/구성원', to: '/team/members' },
  { from: '/kr/박사-후-연구원', to: '/team/staff' },
  { from: '/kr/박사과정', to: '/team/members' },
  { from: '/kr/석사과정-학부연구생', to: '/team/members' },
  { from: '/kr/연구실-졸업생', to: '/team/alumni' },
  { from: '/kr/join-our-team-2-2-2-2', to: '/team' },
  { from: '/kr/연구', to: '/research' },
  { from: '/news-2', to: '/publications' },
  { from: '/lab-news', to: '/news' },
  { from: '/kr/dr-jaehyeong-bae-won-the-best-poster-award-at-5th-international-conference-on-advanced-electromaterials-icae-2019-배재형-박사-icae-2019-best-poster-award-2', to: '/news' },
  { from: '/kr/대학원생-모집', to: '/join' },
  { from: '/kr/연락처', to: '/contact' },
  { from: '/join-our-team', to: '/join' },
  { from: '/join-our-team-2', to: '/join' },
  { from: '/博士研究生-2', to: '/team/members' },
  { from: '/news/lab-life/2026-08-03-october-lab-dinner', to: '/news/lab-life/2026-10-03-october-lab-dinner' },
  { from: '/news/lab-life/2026-05-15-teacher-s-day-2026-may-15th', to: '/news/lab-life/2026-05-15-teacher-s-day-2026' }
];

const ROUTE_SOURCE_FILES = {
  '/': ['src/pages/HomePage.jsx', 'content/en/home.md'],
  '/team': ['src/pages/TeamPage.jsx', 'content/en/team.md', 'public/data/team.json'],
  '/team/jaehyeong-bae': ['src/pages/TeamPage.jsx', 'public/data/team.json'],
  '/team/members': ['src/pages/TeamPage.jsx', 'public/data/team.json'],
  '/team/staff': ['src/pages/TeamPage.jsx', 'public/data/team.json'],
  '/team/alumni': ['src/pages/TeamPage.jsx', 'public/data/team.json'],
  '/research': ['src/pages/ResearchPage.jsx', 'content/en/research.md'],
  '/publications': ['src/pages/PublicationsPage.jsx', 'public/data/publications.json'],
  '/publications/conferences': ['src/pages/PublicationsPage.jsx', 'public/data/publications.json'],
  '/publications/patents': ['src/pages/PublicationsPage.jsx', 'public/data/publications.json'],
  '/news': ['src/pages/NewsPage.jsx', 'public/data/news.json'],
  '/join': ['src/pages/JoinPage.jsx', 'content/en/join.md'],
  '/contact': ['src/pages/ContactPage.jsx', 'content/en/contact.md'],
  '/privacy': ['src/pages/PrivacyPage.jsx', 'src/components/site/SiteAnalytics.jsx'],
  '/ko': ['src/pages/KoreanLandingPage.jsx']
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function rssDate(value) {
  const date = new Date(`${value || ''}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? new Date().toUTCString() : date.toUTCString();
}

function buildRssItems(news) {
  const sectionNames = {
    labNews: 'Research Highlight',
    gallery: 'Lab Life',
    videos: 'Video'
  };

  return Object.entries(news?.sections || {})
    .flatMap(([section, items]) => (Array.isArray(items) ? items : []).map((item) => ({ section, item })))
    .sort((a, b) => String(b.item.date || '').localeCompare(String(a.item.date || '')))
    .map(({ section, item }) => {
      const itemUrl = absoluteSiteUrl(newsItemPath(section, item));
      const description = normalizeDescription(
        item.summary,
        `${item.title}. ${sectionNames[section] || 'News'} from Bae Lab at Kyung Hee University.`
      );
      return `  <item>
    <title>${escapeHtml(item.title)}</title>
    <link>${escapeHtml(itemUrl)}</link>
    <guid isPermaLink="true">${escapeHtml(itemUrl)}</guid>
    <description>${escapeHtml(description)}</description>
    <category>${escapeHtml(sectionNames[section] || 'News')}</category>
    <pubDate>${rssDate(item.date)}</pubDate>
  </item>`;
    });
}

function normalizeDescription(value, fallback) {
  const normalized = String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
  const context = 'Research update from Bae Lab at Kyung Hee University.';
  const result = normalized
    ? normalized.length < 50
      ? `${normalized.replace(/[.\s]+$/, '')}. ${context}`
      : normalized
    : fallback;
  return result.length > 180 ? `${result.slice(0, 177).trim()}…` : result;
}

function absoluteAssetUrl(value) {
  const source = String(value || '').trim();
  if (!source) return `${SITE_URL}${DEFAULT_SOCIAL_IMAGE}`;
  if (/^https?:\/\//i.test(source)) return source;
  return `${SITE_URL}/${source.replace(/^\/+/, '')}`;
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function gitLastModified(files = []) {
  if (!files.length) return '';
  try {
    return execFileSync('git', ['log', '-1', '--format=%cs', '--', ...files], { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

function buildNewsRoutes(news) {
  const labels = {
    labNews: 'Highlights',
    gallery: 'Lab Life',
    videos: 'Video'
  };
  const descriptions = {
    labNews: 'Research achievements, awards, conference activities, and major milestones from Bae Lab at Kyung Hee University.',
    gallery: 'Photos and stories from daily research, celebrations, events, and team life at Bae Lab, Kyung Hee University.',
    videos: 'Watch research demonstrations, presentations, and laboratory videos from Bae Lab at Kyung Hee University.'
  };
  const routes = [];

  for (const [section, itemsValue] of Object.entries(news?.sections || {})) {
    if (!labels[section]) continue;
    const items = Array.isArray(itemsValue) ? itemsValue : [];
    const pageSize = section === 'videos' ? VIDEO_PAGE_SIZE : NEWS_PAGE_SIZE;
    const pageCount = Math.max(1, Math.ceil(items.length / pageSize));

    for (let page = 1; page <= pageCount; page += 1) {
      const routePath = newsSectionPath(section, page);
      if (routePath === '/news/') continue;
      routes.push({
        path: routePath,
        title: `${labels[section]}${page > 1 ? ` – Page ${page}` : ''} | Bae Lab News`,
        description: descriptions[section],
        language: 'en',
        lastmod: news.updatedAt || ''
      });
    }

    for (const item of items) {
      const fallback = `${item.date ? `${item.date} · ` : ''}${item.title}. Read this update from Bae Lab at Kyung Hee University.`;
      routes.push({
        path: newsItemPath(section, item),
        title: `${item.title} | Bae Lab News`,
        articleTitle: item.title,
        description: normalizeDescription(item.summary, fallback),
        image: absoluteAssetUrl(item.images?.[0]),
        imageAlt: item.title,
        language: 'en',
        lastmod: item.date || news.updatedAt || '',
        datePublished: item.date || undefined,
        dateModified: item.date || undefined,
        schemaType: 'NewsArticle',
        articleSection: labels[section],
        keywords: [labels[section], 'Bae Lab', 'Kyung Hee University', 'Chemical Engineering']
      });
    }
  }

  return routes;
}

function normalizeSchemaAuthorName(value) {
  return String(value || '')
    .replace(/[†*]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function schemaAuthor(value) {
  const name = normalizeSchemaAuthorName(value);
  if (name.toLowerCase() === 'jaehyeong bae') {
    return {
      '@type': 'Person',
      '@id': `${SITE_URL}/team/jaehyeong-bae/#person`,
      name
    };
  }
  return { '@type': 'Person', name };
}

function publicationSchema(item) {
  const isPatent = item.type === 'patent';
  const isConference = item.type === 'conference';
  const isCurrentManuscript = item.type === 'preprint';
  const doi = String(item.doi || '').trim();
  const link = String(item.link || '').trim();
  const journal = String(item.journal || '').trim();

  return {
    '@type': isPatent || isConference ? 'CreativeWork' : 'ScholarlyArticle',
    name: item.title,
    author: (item.authors || [])
      .map(normalizeSchemaAuthorName)
      .filter(Boolean)
      .map(schemaAuthor),
    datePublished: item.dateStart || item.filingDate || (item.year ? String(item.year) : undefined),
    creativeWorkStatus: isCurrentManuscript ? 'In preparation' : undefined,
    genre: isPatent ? 'Patent' : isConference ? 'Conference presentation' : isCurrentManuscript ? 'Current manuscript' : 'Journal article',
    isPartOf: journal && journal !== 'TBD'
      ? { '@type': 'Periodical', name: journal }
      : undefined,
    volumeNumber: item.volume || undefined,
    issueNumber: item.issue || undefined,
    pagination: item.pages || undefined,
    identifier: doi
      ? { '@type': 'PropertyValue', propertyID: 'DOI', value: doi }
      : undefined,
    url: link || (doi ? `https://doi.org/${doi}` : undefined)
  };
}

function buildPublicationRoutes(publications) {
  const routes = [];
  for (const type of ['journal', 'conference', 'patent']) {
    const years = [...new Set(
      publications
        .filter((item) => item?.type === type && item?.year)
        .map((item) => Number(item.year))
    )].sort((a, b) => b - a);

    for (let index = 0; index < years.length; index += 3) {
      const group = years.slice(index, index + 3);
      const label = group.length > 1 ? `${group[0]}–${group[group.length - 1]}` : String(group[0]);
      const pageIndex = index / 3;
      const basePath = type === 'patent'
        ? '/publications/patents'
        : type === 'conference'
          ? '/publications/conferences'
          : '/publications';
      const baseRoute = SEO_ROUTES.find((route) => route.path === basePath);
      const listedItems = publications.filter((item) => item?.type === type && group.includes(Number(item.year)));
      if (type === 'journal' && pageIndex === 0) {
        listedItems.unshift(...publications.filter((item) => item?.type === 'preprint'));
      }
      routes.push({
        path: publicationPagePath(type, pageIndex, group),
        title: pageIndex === 0
          ? baseRoute.title
          : `${label} ${type === 'patent' ? 'Patents' : type === 'conference' ? 'Conference Presentations' : 'Journal Articles'} | Bae Lab`,
        description: pageIndex === 0
          ? baseRoute.description
          : `Browse Bae Lab ${type === 'patent' ? 'patents' : type === 'conference' ? 'conference presentations' : 'peer-reviewed journal articles'} from ${label}.`,
        language: 'en',
        lastmod: gitLastModified(['public/data/publications.json']),
        schemaType: 'CollectionPage',
        itemListName: `${type === 'patent' ? 'Bae Lab patents' : type === 'conference' ? 'Bae Lab conference presentations' : 'Bae Lab publications'} · ${label}`,
        itemListElements: listedItems.map(publicationSchema)
      });
    }
  }
  return routes;
}

function renderMetadata(route) {
  const title = escapeHtml(route.title);
  const description = escapeHtml(route.description);
  const canonicalUrl = escapeHtml(absoluteSiteUrl(route.path));
  const socialImageUrl = escapeHtml(route.image || `${SITE_URL}${DEFAULT_SOCIAL_IMAGE}`);
  const imageAlt = escapeHtml(route.imageAlt || 'Bae Lab research at Kyung Hee University');
  const structuredData = JSON.stringify(getStructuredDataForPath(route.path, route)).replace(/</g, '\\u003c');
  const defaultImageDimensions = route.image
    ? ''
    : `\n    <meta property="og:image:width" content="${DEFAULT_SOCIAL_IMAGE_WIDTH}" />\n    <meta property="og:image:height" content="${DEFAULT_SOCIAL_IMAGE_HEIGHT}" />`;
  const languageAlternates = route.path === '/' || route.path === '/ko'
    ? `\n    <link rel="alternate" hreflang="en" href="${SITE_URL}/" />\n    <link rel="alternate" hreflang="ko" href="${SITE_URL}/ko/" />\n    <link rel="alternate" hreflang="x-default" href="${SITE_URL}/" />`
    : '';

  return `${META_START}
    <meta name="seo-route" content="${escapeHtml(route.path)}" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${canonicalUrl}" />${languageAlternates}
    <meta property="og:type" content="${route.schemaType === 'NewsArticle' ? 'article' : 'website'}" />
    <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${socialImageUrl}" />${defaultImageDimensions}
    <meta property="og:image:alt" content="${imageAlt}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${socialImageUrl}" />
    <meta name="twitter:image:alt" content="${imageAlt}" />
    <script id="site-structured-data" type="application/ld+json">${structuredData}</script>
    ${META_END}`;
}

function renderLegacyRedirect({ from, to }) {
  const targetUrl = absoluteSiteUrl(to);
  const safeTargetUrl = escapeHtml(targetUrl);
  const safeSourcePath = escapeHtml(from);

  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, follow" />
    <title>페이지 이동 | Bae Lab</title>
    <link rel="canonical" href="${safeTargetUrl}" />
    <meta http-equiv="refresh" content="0; url=${safeTargetUrl}" />
    <script>window.location.replace(${JSON.stringify(targetUrl)});</script>
  </head>
  <body>
    <p>요청하신 ${safeSourcePath} 페이지가 이동되었습니다. <a href="${safeTargetUrl}">새 페이지로 이동</a></p>
  </body>
</html>`;
}

const [news, publications] = await Promise.all([
  readJson(path.join(PUBLIC_DIR, 'data', 'news.json'), { sections: {} }),
  readJson(path.join(PUBLIC_DIR, 'data', 'publications.json'), [])
]);

const staticRoutes = SEO_ROUTES.map((route) => ({
  ...route,
  language: route.path === '/ko' ? 'ko' : 'en',
  lastmod: gitLastModified(ROUTE_SOURCE_FILES[route.path] || [])
}));
const routeMap = new Map(
  [...staticRoutes, ...buildNewsRoutes(news), ...buildPublicationRoutes(publications)]
    .map((route) => [route.path.replace(/\/+$/, '') || '/', { ...route, path: route.path.replace(/\/+$/, '') || '/' }])
);
const routes = [...routeMap.values()];

const baseHtml = await readFile(path.join(DIST_DIR, 'index.html'), 'utf8');
const metaPattern = new RegExp(`${META_START}[\\s\\S]*?${META_END}`);

if (!metaPattern.test(baseHtml)) {
  throw new Error('Route metadata block was not found in dist/index.html');
}

for (const route of routes) {
  const outputDirectory = route.path === '/'
    ? DIST_DIR
    : path.join(DIST_DIR, route.path.replace(/^\//, ''));
  const outputPath = path.join(outputDirectory, 'index.html');
  const routeHtml = baseHtml
    .replace(metaPattern, renderMetadata(route))
    .replace(/<html lang="[^"]+">/, `<html lang="${route.language || 'en'}">`);

  await mkdir(outputDirectory, { recursive: true });
  await writeFile(outputPath, routeHtml);
}

for (const redirect of LEGACY_REDIRECTS) {
  const outputDirectory = path.join(DIST_DIR, redirect.from.replace(/^\//, ''));
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(path.join(outputDirectory, 'index.html'), renderLegacyRedirect(redirect));
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((route) => {
  const lastmod = route.lastmod ? `<lastmod>${escapeHtml(route.lastmod)}</lastmod>` : '';
  return `  <url><loc>${escapeHtml(absoluteSiteUrl(route.path))}</loc>${lastmod}</url>`;
}).join('\n')}
</urlset>\n`;

const rssItems = buildRssItems(news);
const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${escapeHtml(SITE_NAME)} News</title>
  <link>${SITE_URL}/news/</link>
  <description>경희대학교 화학공학과 배재형 교수 연구실의 연구 성과, 수상, 학회 활동 및 연구실 소식입니다.</description>
  <language>ko-KR</language>
  <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${rssItems.join('\n')}
</channel>
</rss>\n`;

await writeFile(path.join(DIST_DIR, 'sitemap.xml'), sitemap);
await writeFile(path.join(DIST_DIR, 'rss.xml'), rss);
await writeFile(
  path.join(DIST_DIR, 'robots.txt'),
  `User-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: ChatGPT-User\nAllow: /\n\nUser-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
);
await writeFile(
  path.join(DIST_DIR, 'seo-routes.json'),
  `${JSON.stringify(routes.map((route) => route.path), null, 2)}\n`
);

console.log(`Generated route HTML: ${routes.length} indexable pages, ${LEGACY_REDIRECTS.length} legacy redirects, sitemap.xml, rss.xml, robots.txt`);
