import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  absoluteSiteUrl,
  DEFAULT_SOCIAL_IMAGE,
  getStructuredDataForPath,
  SEO_ROUTES,
  SITE_NAME,
  SITE_URL
} from '../src/content/seo.js';

const DIST_DIR = path.resolve('dist');
const META_START = '<!-- route-meta:start -->';
const META_END = '<!-- route-meta:end -->';

const LEGACY_REDIRECTS = [
  { from: '/kr', to: '/' },
  { from: '/kr/배재형-교수', to: '/team' },
  { from: '/jaehyeong-bae', to: '/team' },
  { from: '/kr/구성원', to: '/team' },
  { from: '/kr/연구', to: '/research' },
  { from: '/news-2', to: '/publications' },
  { from: '/kr/대학원생-모집', to: '/join' },
  { from: '/kr/연락처', to: '/contact' }
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderMetadata(route) {
  const title = escapeHtml(route.title);
  const description = escapeHtml(route.description);
  const canonicalUrl = escapeHtml(absoluteSiteUrl(route.path));
  const socialImageUrl = escapeHtml(`${SITE_URL}${DEFAULT_SOCIAL_IMAGE}`);
  const structuredData = JSON.stringify(getStructuredDataForPath(route.path)).replace(/</g, '\\u003c');

  return `${META_START}
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${socialImageUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${socialImageUrl}" />
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

const baseHtml = await readFile(path.join(DIST_DIR, 'index.html'), 'utf8');
const metaPattern = new RegExp(`${META_START}[\\s\\S]*?${META_END}`);

if (!metaPattern.test(baseHtml)) {
  throw new Error('Route metadata block was not found in dist/index.html');
}

for (const route of SEO_ROUTES) {
  const outputDirectory = route.path === '/'
    ? DIST_DIR
    : path.join(DIST_DIR, route.path.replace(/^\//, ''));
  const outputPath = path.join(outputDirectory, 'index.html');
  const routeHtml = baseHtml.replace(metaPattern, renderMetadata(route));

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
${SEO_ROUTES.map((route) => `  <url><loc>${escapeHtml(absoluteSiteUrl(route.path))}</loc></url>`).join('\n')}
</urlset>\n`;

await writeFile(path.join(DIST_DIR, 'sitemap.xml'), sitemap);
await writeFile(
  path.join(DIST_DIR, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
);

console.log(`Generated route HTML: ${SEO_ROUTES.length} pages, ${LEGACY_REDIRECTS.length} legacy redirects, sitemap.xml, robots.txt`);
