import { readFile } from 'node:fs/promises';
import path from 'node:path';

const SITE_URL = 'https://www.baelab.khu.ac.kr';
const HOST = 'www.baelab.khu.ac.kr';
const INDEXNOW_KEY = 'b8c8c3711f534ca7a1ac73822002d8a4';
const INDEXNOW_ENDPOINT = 'https://searchadvisor.naver.com/indexnow';

function absoluteUrl(route) {
  const normalized = route === '/' ? '/' : `/${String(route).replace(/^\/+|\/+$/g, '')}/`;
  return `${SITE_URL}${normalized}`;
}

const routes = JSON.parse(await readFile(path.resolve('dist/seo-routes.json'), 'utf8'));
const urlList = routes.map(absoluteUrl);
const response = await fetch(INDEXNOW_ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList
  })
});

if (![200, 202].includes(response.status)) {
  const message = (await response.text()).trim();
  throw new Error(`Naver IndexNow request failed (${response.status})${message ? `: ${message}` : ''}`);
}

console.log(`Naver IndexNow accepted ${urlList.length} URLs (${response.status}).`);
