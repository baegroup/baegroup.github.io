import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const DIST_DIR = path.resolve('dist');
const SITE_ORIGIN = 'https://baelab.khu.ac.kr';
const htmlFiles = [];

async function collectHtmlFiles(directory) {
  for (const name of await readdir(directory)) {
    const filePath = path.join(directory, name);
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      await collectHtmlFiles(filePath);
    } else if (name === 'index.html') {
      htmlFiles.push(filePath);
    }
  }
}

function localTarget(pathname) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    decodedPath = pathname;
  }

  const relativePath = decodedPath.replace(/^\/+/, '');
  if (!relativePath) return path.join(DIST_DIR, 'index.html');
  return path.extname(relativePath)
    ? path.join(DIST_DIR, relativePath)
    : path.join(DIST_DIR, relativePath, 'index.html');
}

await collectHtmlFiles(DIST_DIR);

const missingLinks = [];
const metadataErrors = [];
let internalLinkCount = 0;

for (const sourcePath of htmlFiles) {
  const html = await readFile(sourcePath, 'utf8');
  const relativeDirectory = path.relative(DIST_DIR, path.dirname(sourcePath)).replaceAll(path.sep, '/');
  const sourceRoute = relativeDirectory ? `/${relativeDirectory}/` : '/';
  const hreflangValues = [...html.matchAll(/<link\b(?=[^>]*\brel=["']alternate["'])(?=[^>]*\bhreflang=["']([^"']+)["'])[^>]*>/gi)]
    .map((match) => match[1]);
  const expectedHreflangCount = sourceRoute === '/' || sourceRoute === '/ko/' ? 3 : 0;

  if (hreflangValues.length !== expectedHreflangCount || new Set(hreflangValues).size !== hreflangValues.length) {
    metadataErrors.push({ sourceRoute, hreflangValues, expectedHreflangCount });
  }

  for (const match of html.matchAll(/\shref=["']([^"']+)["']/gi)) {
    const href = match[1].trim();
    if (!href || href.startsWith('#') || /^(mailto:|tel:|javascript:)/i.test(href)) continue;

    let targetUrl;
    try {
      targetUrl = new URL(href, `${SITE_ORIGIN}${sourceRoute}`);
    } catch {
      missingLinks.push({ sourceRoute, href, reason: 'invalid URL' });
      continue;
    }

    if (targetUrl.origin !== SITE_ORIGIN) continue;
    internalLinkCount += 1;

    try {
      await stat(localTarget(targetUrl.pathname));
    } catch {
      missingLinks.push({ sourceRoute, href, reason: 'target not found' });
    }
  }
}

if (metadataErrors.length) {
  console.error(`Invalid hreflang metadata: ${metadataErrors.length}`);
  for (const item of metadataErrors.slice(0, 30)) {
    console.error(`- ${item.sourceRoute}: expected ${item.expectedHreflangCount} unique tags, found ${item.hreflangValues.join(', ') || 'none'}`);
  }
  process.exit(1);
}

if (missingLinks.length) {
  console.error(`Broken internal links: ${missingLinks.length}`);
  for (const item of missingLinks.slice(0, 30)) {
    console.error(`- ${item.sourceRoute} -> ${item.href} (${item.reason})`);
  }
  process.exit(1);
}

console.log(`Internal link validation passed: ${internalLinkCount} links across ${htmlFiles.length} HTML pages.`);
