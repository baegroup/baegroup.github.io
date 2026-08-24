import fs from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');
const IMAGE_ROOT = path.join(PUBLIC_DIR, 'assets', 'img');
const OUTPUT_ROOT = path.join(IMAGE_ROOT, 'responsive');
const MANIFEST_PATH = path.join(ROOT, 'src', 'content', 'responsive-images.generated.json');
const RASTER_PATTERN = /\.(?:jpe?g|png|webp)$/i;
const TARGET_WIDTHS = [320, 640, 960];
const STATIC_ASSETS = [
  'assets/img/lab-logo.png',
  'assets/img/home/join/team.webp',
  'assets/img/home/news/featured.jpg',
  'assets/img/team/group/group-photo.webp',
  'assets/img/team/culture/fearless-organization.webp'
];
const STATIC_DIRECTORIES = [
  'assets/img/home/research',
  'assets/img/research/areas',
  'assets/img/research/funding',
  'assets/img/publications/covers'
];

function normalizeAssetPath(value) {
  const normalized = String(value || '').trim().replace(/^\/+/, '');
  return normalized.startsWith('assets/img/') && RASTER_PATTERN.test(normalized) ? normalized : '';
}

function collectAssetPaths(value, target) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectAssetPaths(item, target));
    return;
  }
  if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => collectAssetPaths(item, target));
    return;
  }
  const assetPath = normalizeAssetPath(value);
  if (assetPath) target.add(assetPath);
}

async function listRasterAssets(directoryPath) {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  const assets = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const entryPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) assets.push(...(await listRasterAssets(entryPath)));
    if (entry.isFile() && RASTER_PATTERN.test(entry.name)) {
      assets.push(path.relative(PUBLIC_DIR, entryPath).split(path.sep).join('/'));
    }
  }
  return assets;
}

function variantPath(assetPath, width) {
  const relativePath = assetPath.replace(/^assets\/img\//, '');
  const extension = path.extname(relativePath);
  const basePath = relativePath.slice(0, -extension.length);
  return `assets/img/responsive/${basePath}-w${width}.webp`;
}

async function main() {
  const assetPaths = new Set(STATIC_ASSETS);
  for (const dataFile of ['team.json', 'news.json']) {
    const content = JSON.parse(await fs.readFile(path.join(PUBLIC_DIR, 'data', dataFile), 'utf8'));
    collectAssetPaths(content, assetPaths);
  }
  for (const directory of STATIC_DIRECTORIES) {
    for (const assetPath of await listRasterAssets(path.join(PUBLIC_DIR, directory))) {
      assetPaths.add(assetPath);
    }
  }

  const manifest = {};
  const expectedOutputs = new Set();
  let generatedCount = 0;
  let reusedCount = 0;
  for (const assetPath of [...assetPaths].sort()) {
    const sourcePath = path.join(PUBLIC_DIR, assetPath);
    const sourceStats = await fs.stat(sourcePath).catch(() => null);
    if (!sourceStats) continue;
    let metadata;
    try {
      metadata = await sharp(sourcePath).metadata();
    } catch {
      continue;
    }

    const originalWidth = Number(metadata.width) || 0;
    const originalHeight = Number(metadata.height) || 0;
    if (!originalWidth || !originalHeight) continue;

    const sources = [];
    for (const width of TARGET_WIDTHS.filter((candidate) => candidate < originalWidth)) {
      const outputAssetPath = variantPath(assetPath, width);
      const outputPath = path.join(PUBLIC_DIR, outputAssetPath);
      expectedOutputs.add(outputPath);
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      const outputStats = await fs.stat(outputPath).catch(() => null);
      if (!outputStats || outputStats.mtimeMs < sourceStats.mtimeMs) {
        await sharp(sourcePath, { animated: true })
          .rotate()
          .resize({ width, withoutEnlargement: true })
          .webp({ effort: 4, quality: 78, smartSubsample: true })
          .toFile(outputPath);
        generatedCount += 1;
      } else {
        reusedCount += 1;
      }
      sources.push({ path: outputAssetPath, width });
    }

    manifest[assetPath] = {
      height: originalHeight,
      sources,
      width: originalWidth
    };
  }

  for (const outputPath of await listRasterAssets(OUTPUT_ROOT).catch(() => [])) {
    const absolutePath = path.join(PUBLIC_DIR, outputPath);
    if (!expectedOutputs.has(absolutePath)) await fs.rm(absolutePath);
  }

  await fs.writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`Responsive images ready: ${generatedCount} built, ${reusedCount} reused, ${Object.keys(manifest).length} source image(s).`);
}

main().catch((error) => {
  console.error('[build-responsive-images] Failed to build responsive images.');
  console.error(error);
  process.exit(1);
});
