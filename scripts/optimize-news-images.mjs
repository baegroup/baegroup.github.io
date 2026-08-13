import fs from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');
const NEWS_PATH = path.join(PUBLIC_DIR, 'data', 'news.json');
const IMAGE_PATTERN = /\.(?:jpe?g|png)$/i;
const MAX_DIMENSION = 1920;
const WEBP_QUALITY = 82;

function localImagePath(value) {
  const normalized = String(value || '').trim().replace(/^\/+/, '');
  return normalized && !/^https?:\/\//i.test(normalized) && IMAGE_PATTERN.test(normalized)
    ? normalized
    : '';
}

async function optimizeImage(assetPath) {
  const sourcePath = path.join(PUBLIC_DIR, assetPath);
  const targetAssetPath = assetPath.replace(IMAGE_PATTERN, '.webp');
  const targetPath = path.join(PUBLIC_DIR, targetAssetPath);
  const sourceStats = await fs.stat(sourcePath);

  await sharp(sourcePath, { animated: true })
    .rotate()
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ effort: 4, quality: WEBP_QUALITY, smartSubsample: true })
    .toFile(targetPath);

  const targetStats = await fs.stat(targetPath);
  await fs.rm(sourcePath);
  return {
    assetPath: targetAssetPath,
    before: sourceStats.size,
    after: targetStats.size
  };
}

async function main() {
  const news = JSON.parse(await fs.readFile(NEWS_PATH, 'utf8'));
  const cache = new Map();

  async function replaceImages(images) {
    const resolved = [];
    for (const image of Array.isArray(images) ? images : []) {
      const assetPath = localImagePath(image);
      if (!assetPath) {
        resolved.push(image);
        continue;
      }

      if (!cache.has(assetPath)) {
        cache.set(assetPath, optimizeImage(assetPath));
      }
      const result = await cache.get(assetPath);
      resolved.push(result.assetPath);
    }
    return resolved;
  }

  for (const section of ['labNews', 'gallery', 'videos']) {
    for (const item of news.sections?.[section] || []) {
      item.images = await replaceImages(item.images);
    }
  }
  for (const item of news.instagram?.recent || []) {
    item.images = await replaceImages(item.images);
  }

  await fs.writeFile(NEWS_PATH, `${JSON.stringify(news, null, 2)}\n`, 'utf8');

  const results = await Promise.all(cache.values());
  const before = results.reduce((sum, item) => sum + item.before, 0);
  const after = results.reduce((sum, item) => sum + item.after, 0);
  const savedPercent = before ? Math.round((1 - after / before) * 100) : 0;
  console.log(
    `Optimized ${results.length} news image(s): ${(before / 1024 / 1024).toFixed(2)} MB -> ${(after / 1024 / 1024).toFixed(2)} MB (${savedPercent}% smaller)`
  );
}

main().catch((error) => {
  console.error('[optimize-news-images] Failed to optimize news images.');
  console.error(error);
  process.exit(1);
});
