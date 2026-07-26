import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  absoluteSiteUrl,
  DEFAULT_SOCIAL_IMAGE,
  SEO_ROUTES,
  SITE_NAME,
  SITE_URL
} from '../src/content/seo.js';

const DIST_DIR = path.resolve('dist');
const META_START = '<!-- route-meta:start -->';
const META_END = '<!-- route-meta:end -->';

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
    ${META_END}`;
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

console.log(`Generated route HTML: ${SEO_ROUTES.length} pages`);
