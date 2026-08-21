import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

const ROOT = process.cwd();
const LOGO_PATH = path.join(ROOT, 'public', 'assets', 'img', 'lab-logo.png');
const SOCIAL_DIR = path.join(ROOT, 'public', 'assets', 'img', 'social');
const ICON_DIR = path.join(ROOT, 'public', 'assets', 'img', 'icons');

await Promise.all([
  mkdir(SOCIAL_DIR, { recursive: true }),
  mkdir(ICON_DIR, { recursive: true })
]);

const socialBackground = Buffer.from(`
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#f5f2ee"/>
    <rect width="1200" height="12" fill="#8f1714"/>
    <rect x="742" y="0" width="458" height="630" fill="#e9e4de"/>
    <rect x="94" y="128" width="58" height="4" rx="2" fill="#ad1d19"/>
    <text x="94" y="229" fill="#0f172a" font-family="IBM Plex Sans, Arial, sans-serif" font-size="82" font-weight="600" letter-spacing="-2">BAE LAB</text>
    <text x="94" y="296" fill="#334155" font-family="IBM Plex Sans, Arial, sans-serif" font-size="29" font-weight="500">Functional Materials · Additive Manufacturing</text>
    <text x="94" y="370" fill="#475569" font-family="Noto Sans KR, IBM Plex Sans, Arial, sans-serif" font-size="26" font-weight="500">배재형 교수 연구실</text>
    <text x="94" y="415" fill="#475569" font-family="IBM Plex Sans, Arial, sans-serif" font-size="22">Kyung Hee University · Chemical Engineering</text>
    <text x="94" y="548" fill="#64748b" font-family="IBM Plex Sans, Arial, sans-serif" font-size="20">baelab.khu.ac.kr</text>
  </svg>
`);

const socialLogo = await sharp(LOGO_PATH)
  .resize(330, 330, { fit: 'contain' })
  .png()
  .toBuffer();

await sharp(socialBackground)
  .composite([{ input: socialLogo, left: 806, top: 150 }])
  .jpeg({ quality: 88, progressive: true, chromaSubsampling: '4:4:4' })
  .toFile(path.join(SOCIAL_DIR, 'bae-lab-social.jpg'));

await Promise.all([
  sharp(LOGO_PATH)
    .resize(64, 64, { fit: 'contain' })
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(ICON_DIR, 'favicon-64.png')),
  sharp(LOGO_PATH)
    .resize(180, 180, { fit: 'contain' })
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(ICON_DIR, 'apple-touch-icon-180.png'))
]);

console.log('Generated brand assets: 1200x630 social image and optimized site icons.');
