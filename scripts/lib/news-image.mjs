import sharp from 'sharp';

export async function encodeNewsImage(bytes) {
  const limit = 600 * 1024;
  // Keep the usual quality for small images, then reduce only oversized assets.
  for (const [dimension, quality] of [[1600, 80], [1600, 70], [1400, 65], [1200, 60], [960, 55]]) {
    const result = await sharp(bytes, { animated: true })
      .rotate()
      .resize({ width: dimension, height: dimension, fit: 'inside', withoutEnlargement: true })
      .webp({ effort: 4, quality, smartSubsample: true })
      .toBuffer();
    if (result.length <= limit) return result;
  }
  throw new Error('News image exceeds the 600 KB asset limit after compression');
}
