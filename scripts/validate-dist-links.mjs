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
let internalLinkCount = 0;

for (const sourcePath of htmlFiles) {
  const html = await readFile(sourcePath, 'utf8');
  const sourceRoute = `/${path.relative(DIST_DIR, path.dirname(sourcePath)).replaceAll(path.sep, '/')}/`;

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

if (missingLinks.length) {
  console.error(`Broken internal links: ${missingLinks.length}`);
  for (const item of missingLinks.slice(0, 30)) {
    console.error(`- ${item.sourceRoute} -> ${item.href} (${item.reason})`);
  }
  process.exit(1);
}

console.log(`Internal link validation passed: ${internalLinkCount} links across ${htmlFiles.length} HTML pages.`);
