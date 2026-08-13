import { SITE_URL } from '../src/content/seo.js';

const REQUEST_TIMEOUT_MS = 20_000;
const MINIMUM_INDEXABLE_ROUTES = 12;
const MAX_LIVE_IMAGE_BYTES = 1.25 * 1024 * 1024;
const errors = [];

function report(condition, message) {
  if (!condition) errors.push(message);
}

function decodeXml(value) {
  return String(value || '')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");
}

function matchAll(source, pattern) {
  return [...String(source || '').matchAll(pattern)].map((match) => decodeXml(match[1]).trim()).filter(Boolean);
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: { 'User-Agent': 'BaeLab-SiteHealth/1.0' },
    ...options
  });
  return response;
}

async function fetchText(url) {
  const response = await request(url);
  const text = await response.text();
  report(response.ok, `${url}: HTTP ${response.status}`);
  return { response, text };
}

async function runPool(items, worker, concurrency = 6) {
  const queue = [...items];
  const runners = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length) {
      const item = queue.shift();
      try {
        await worker(item);
      } catch (error) {
        errors.push(`${item}: ${error.message}`);
      }
    }
  });
  await Promise.all(runners);
}

const { text: sitemapXml } = await fetchText(`${SITE_URL}/sitemap.xml`);
const urls = [...new Set(matchAll(sitemapXml, /<loc>([\s\S]*?)<\/loc>/gi))];
report(urls.length >= MINIMUM_INDEXABLE_ROUTES, `sitemap: expected at least ${MINIMUM_INDEXABLE_ROUTES} URLs, found ${urls.length}`);
report(urls.every((url) => url.startsWith(`${SITE_URL}/`)), 'sitemap: every URL must use the canonical site origin');

const titles = new Map();
const imageUrls = new Set();

await runPool(urls, async (url) => {
  const { response, text: html } = await fetchText(url);
  report(response.url === url, `${url}: redirected to ${response.url}`);

  const canonical = matchAll(html, /<link\s+rel="canonical"\s+href="([^"]+)"\s*\/?\s*>/gi);
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const title = matchAll(html, /<title>([\s\S]*?)<\/title>/gi)[0] || '';
  const description = matchAll(html, /<meta\s+name="description"\s+content="([^"]*)"\s*\/?\s*>/gi)[0] || '';
  const jsonLd = matchAll(html, /<script\s+id="site-structured-data"\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)[0] || '';

  report(canonical.length === 1, `${url}: expected one canonical link, found ${canonical.length}`);
  report(canonical[0] === url, `${url}: canonical is ${canonical[0] || 'missing'}`);
  report(h1Count === 1, `${url}: expected one H1, found ${h1Count}`);
  report(Boolean(title), `${url}: title is missing`);
  report(description.length >= 50 && description.length <= 180, `${url}: meta description length is ${description.length}`);
  report(!/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html), `${url}: page is marked noindex`);

  if (title) {
    const existing = titles.get(title);
    report(!existing, `${url}: duplicate title also used by ${existing}`);
    titles.set(title, url);
  }

  try {
    JSON.parse(jsonLd);
  } catch {
    report(false, `${url}: structured data is missing or invalid JSON`);
  }

  for (const src of matchAll(html, /<img\b[^>]*\bsrc="([^"]+)"/gi)) {
    const resolved = new URL(src, url);
    if (resolved.origin === new URL(SITE_URL).origin) imageUrls.add(resolved.href);
  }
});

const { text: robotsText } = await fetchText(`${SITE_URL}/robots.txt`);
report(robotsText.includes(`Sitemap: ${SITE_URL}/sitemap.xml`), 'robots.txt: canonical sitemap declaration is missing');
report(!/Disallow:\s*\//i.test(robotsText), 'robots.txt: site-wide crawling is blocked');

const { text: rssText } = await fetchText(`${SITE_URL}/rss.xml`);
report(/<rss\b/i.test(rssText), 'RSS: root element is missing');
report((rssText.match(/<item>/gi) || []).length > 0, 'RSS: no news items found');

await runPool([...imageUrls], async (url) => {
  const response = await request(url, { method: 'HEAD' });
  report(response.ok, `${url}: image HTTP ${response.status}`);
  const contentLength = Number(response.headers.get('content-length')) || 0;
  report(contentLength <= MAX_LIVE_IMAGE_BYTES, `${url}: image is ${(contentLength / 1024 / 1024).toFixed(2)} MB`);
});

if (errors.length) {
  console.error(`Live site audit failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Live site audit passed: ${urls.length} pages, ${titles.size} unique titles, ${imageUrls.size} rendered images`);
