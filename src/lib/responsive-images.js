import responsiveImageManifest from '@/content/responsive-images.generated.json';

function normalizeAssetPath(value) {
  const raw = String(value || '').trim();
  if (!raw || /^https?:\/\//i.test(raw) || raw.startsWith('data:')) return '';

  const basePath = String(import.meta.env.BASE_URL || '/').replace(/^\/+|\/+$/g, '');
  let normalized = raw.split(/[?#]/, 1)[0].replace(/^\/+/, '');
  if (basePath && normalized.startsWith(`${basePath}/`)) {
    normalized = normalized.slice(basePath.length + 1);
  }
  return normalized;
}

function resolveAssetPath(assetPath) {
  return `${import.meta.env.BASE_URL}${String(assetPath || '').replace(/^\/+/, '')}`;
}

export function responsiveImageProps(src, sizes) {
  const assetPath = normalizeAssetPath(src);
  const entry = responsiveImageManifest[assetPath];
  if (!entry) return {};

  const candidates = [
    ...(entry.sources || []),
    { path: assetPath, width: entry.width }
  ].filter((item, index, items) => (
    item.width && items.findIndex((candidate) => candidate.width === item.width) === index
  ));

  return {
    height: entry.height,
    sizes,
    srcSet: candidates.map((item) => `${resolveAssetPath(item.path)} ${item.width}w`).join(', '),
    width: entry.width
  };
}
