import fs from 'node:fs/promises';
import path from 'node:path';

import { HOME_MEDIA } from '../src/content/home-media.js';
import { getStructuredDataForPath, RESEARCH_TOPICS, SEO_ROUTES, SITE_URL } from '../src/content/seo.js';

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');
const MAX_PUBLIC_ASSET_BYTES = 750 * 1024;
const errors = [];

function report(condition, message) {
  if (!condition) errors.push(message);
}

async function readJson(relativePath) {
  return JSON.parse(await fs.readFile(path.join(ROOT, relativePath), 'utf8'));
}

function validateUniqueIds(items, label) {
  const seen = new Set();
  for (const item of items) {
    const id = String(item?.id || '').trim();
    report(Boolean(id), `${label}: an item is missing its id`);
    report(!seen.has(id), `${label}: duplicate id "${id}"`);
    seen.add(id);
  }
}

function isValidIsoDate(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function hasFileExtension(value) {
  return /\.[a-z0-9]{2,5}$/i.test(String(value || '').trim());
}

async function validatePublicFile(assetPath, label) {
  const normalized = String(assetPath || '').replace(/^\/+/, '');
  if (!normalized || /^https?:\/\//i.test(normalized) || !hasFileExtension(normalized)) return;
  try {
    const stats = await fs.stat(path.join(PUBLIC_DIR, normalized));
    report(stats.isFile(), `${label}: not a file "${normalized}"`);
  } catch {
    report(false, `${label}: missing public file "${normalized}"`);
  }
}

async function listFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(entryPath)));
    else if (entry.isFile()) files.push(entryPath);
  }
  return files;
}

const [news, team, publications, generatedContent] = await Promise.all([
  readJson('public/data/news.json'),
  readJson('public/data/team.json'),
  readJson('public/data/publications.json'),
  readJson('src/content/site-content.generated.json')
]);

report(isValidIsoDate(news.updatedAt), 'news: updatedAt must use a valid YYYY-MM-DD date');
report(Array.isArray(team) && team.length > 0, 'team: expected at least one member');
report(Array.isArray(publications) && publications.length > 0, 'publications: expected at least one entry');
validateUniqueIds(team, 'team');
validateUniqueIds(publications, 'publications');

const newsItems = ['labNews', 'gallery', 'videos'].flatMap((section) => {
  const items = news.sections?.[section];
  report(Array.isArray(items), `news: missing section "${section}"`);
  return Array.isArray(items) ? items : [];
});
validateUniqueIds(newsItems, 'news');

report(/citations\?user=/.test(news.piLinks?.googleScholar || ''), 'profiles: Google Scholar must point to a specific author profile');
report(/orcid\.org\/\d{4}-\d{4}-\d{4}-\d{4}/.test(news.piLinks?.orcid || ''), 'profiles: ORCID must point to a specific researcher record');
report(/authorId=\d+/.test(news.piLinks?.scopus || ''), 'profiles: Scopus must point to a specific author profile');
report(/\/author\/record\//.test(news.piLinks?.webOfScience || ''), 'profiles: Web of Science must point to a specific researcher record');

for (const item of newsItems) {
  report(isValidIsoDate(item.date), `news: invalid date for "${item.id}"`);
  report(typeof item.summary === 'string', `news: summary must be a string for "${item.id}"`);
  report(Array.isArray(item.images), `news: images must be an array for "${item.id}"`);
  for (const image of item.images || []) await validatePublicFile(image, `news item "${item.id}"`);
}
for (const member of team) await validatePublicFile(member.photo, `team member "${member.id}"`);
for (const publication of publications) {
  if (publication.coverImage && hasFileExtension(publication.coverImage)) {
    await validatePublicFile(publication.coverImage, `publication "${publication.id}"`);
  }
}

const homeMediaPaths = [
  HOME_MEDIA.heroCover,
  ...(HOME_MEDIA.heroCoverWebp || []).map((item) => item.path),
  ...(HOME_MEDIA.researchAreas || []),
  HOME_MEDIA.newsFeatured,
  HOME_MEDIA.joinTeam
].filter(Boolean);
for (const assetPath of homeMediaPaths) await validatePublicFile(assetPath, 'home media');

const researchContent = generatedContent.RESEARCH_CONTENT?.en || {};
for (const card of researchContent.cards || []) {
  await validatePublicFile(`assets/img/research/areas/${card.image}`, `research card "${card.title}"`);
}
for (const item of researchContent.fundingItems || []) {
  await validatePublicFile(`assets/img/research/funding/${item.logo}`, `funding source "${item.name}"`);
}

const seoPaths = SEO_ROUTES.map((item) => item.path);
const requiredSeoPaths = [
  '/',
  '/team',
  '/team/jaehyeong-bae',
  '/team/members',
  '/team/staff',
  '/team/alumni',
  '/research',
  '/publications',
  '/publications/patents',
  '/news',
  '/join',
  '/contact',
  '/privacy',
  '/ko'
];
report(new Set(seoPaths).size === seoPaths.length, 'SEO: route paths must be unique');
report(new Set(SEO_ROUTES.map((item) => item.title)).size === SEO_ROUTES.length, 'SEO: titles must be unique');
report(SITE_URL.startsWith('https://'), 'SEO: SITE_URL must use HTTPS');
for (const requiredPath of requiredSeoPaths) {
  report(seoPaths.includes(requiredPath), `SEO: missing route metadata for "${requiredPath}"`);
}
for (const route of SEO_ROUTES) {
  report(route.description.length >= 50 && route.description.length <= 180, `SEO: description length is invalid for "${route.path}"`);
}
report(
  SEO_ROUTES.find((route) => route.path === '/team/jaehyeong-bae')?.title.includes('Jaehyeong Bae'),
  'SEO: professor profile title must include "Jaehyeong Bae"'
);
report(
  SEO_ROUTES.find((route) => route.path === '/ko')?.title.includes('배재형 교수 연구실'),
  'SEO: Korean landing title must include the Korean lab identity'
);

const homeStructuredData = getStructuredDataForPath('/');
const homeGraph = homeStructuredData['@graph'] || [];
const researchOrganization = homeGraph.find((item) => item['@type'] === 'ResearchOrganization');
const professorEntity = homeGraph.find((item) => item['@type'] === 'Person');
const departmentEntity = homeGraph.find((item) => item['@id'] === 'https://chemeng.khu.ac.kr/#organization');
report(Boolean(researchOrganization?.description), 'GEO: research organization description is missing');
report(Boolean(researchOrganization?.address?.postalCode), 'GEO: research organization address is incomplete');
report(
  researchOrganization?.parentOrganization?.['@id'] === departmentEntity?.['@id'],
  'GEO: lab-to-department entity relationship is missing'
);
report(
  RESEARCH_TOPICS.every((topic) => researchOrganization?.knowsAbout?.includes(topic)),
  'GEO: research organization topics are incomplete'
);
report(
  professorEntity?.sameAs?.some((url) => url.includes('orcid.org/'))
    && professorEntity?.sameAs?.some((url) => url.includes('scholar.google.com/'))
    && professorEntity?.sameAs?.some((url) => url.includes('chemeng.khu.ac.kr/')),
  'GEO: professor entity must link to ORCID, Google Scholar, and the official department profile'
);

const contentSources = await Promise.all([
  fs.readFile(path.join(ROOT, 'public/data/news.json'), 'utf8'),
  fs.readFile(path.join(ROOT, 'content/en/news.md'), 'utf8'),
  fs.readFile(path.join(ROOT, 'src/content/site-content.generated.json'), 'utf8')
]);
const combinedContent = contentSources.join('\n');
for (const forbiddenText of ['Enginnering', 'ICAE (2026)']) {
  report(!combinedContent.includes(forbiddenText), `content: forbidden stale text "${forbiddenText}"`);
}

const indexHtml = await fs.readFile(path.join(ROOT, 'index.html'), 'utf8');
report(indexHtml.includes('<!-- route-meta:start -->'), 'SEO: route metadata start marker is missing');
report(indexHtml.includes('<!-- route-meta:end -->'), 'SEO: route metadata end marker is missing');
report(indexHtml.includes('name="google-site-verification"'), 'SEO: Google site verification tag is missing');
report(indexHtml.includes('name="naver-site-verification"'), 'SEO: Naver site verification tag is missing');
report(indexHtml.includes('type="application/rss+xml"'), 'SEO: RSS discovery link is missing');

const indexNowKey = 'b8c8c3711f534ca7a1ac73822002d8a4';
const indexNowKeyFile = await fs.readFile(path.join(PUBLIC_DIR, `${indexNowKey}.txt`), 'utf8');
report(indexNowKeyFile.trim() === indexNowKey, 'SEO: IndexNow verification key file is invalid');

for (const filePath of await listFiles(path.join(PUBLIC_DIR, 'assets'))) {
  const stats = await fs.stat(filePath);
  if (stats.size > MAX_PUBLIC_ASSET_BYTES) {
    errors.push(`assets: ${path.relative(ROOT, filePath)} is ${(stats.size / 1024 / 1024).toFixed(2)} MB (limit: 750 KB)`);
  }
}

if (errors.length) {
  console.error(`Site validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Site validation passed: ${team.length} team members, ${publications.length} publications, ${newsItems.length} news items, ${SEO_ROUTES.length} SEO routes`);
