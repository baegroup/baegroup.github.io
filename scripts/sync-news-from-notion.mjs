import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const NEWS_OUTPUT_PATH = path.join(ROOT, 'public', 'data', 'news.json');
const NOTION_ASSET_DIR = path.join(ROOT, 'public', 'assets', 'img', 'news', 'notion');
const INSTAGRAM_ASSET_DIR = path.join(ROOT, 'public', 'assets', 'img', 'news', 'instagram');
const NOTION_API_VERSION = '2025-09-03';
const SECTION_KEYS = ['labNews', 'gallery', 'videos'];

async function loadDotenv(fileName) {
  const filePath = path.join(ROOT, fileName);
  let source = '';

  try {
    source = await fs.readFile(filePath, 'utf8');
  } catch {
    return;
  }

  source
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .forEach((line) => {
      const index = line.indexOf('=');
      if (index < 1) {
        return;
      }

      const key = line.slice(0, index).trim();
      if (!key || process.env[key]) {
        return;
      }

      const rawValue = line.slice(index + 1).trim();
      const normalized =
        (rawValue.startsWith('"') && rawValue.endsWith('"')) || (rawValue.startsWith("'") && rawValue.endsWith("'"))
          ? rawValue.slice(1, -1)
          : rawValue;
      process.env[key] = normalized;
    });
}

function requireEnv(name) {
  const value = String(process.env[name] || '').trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function readJsonIfExists(filePath, fallback = {}) {
  try {
    const source = await fs.readFile(filePath, 'utf8');
    return JSON.parse(source);
  } catch {
    return fallback;
  }
}

function toSlug(value, fallback = 'item') {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized || fallback;
}

function normalizeSection(value) {
  const raw = String(value || '')
    .trim()
    .toLowerCase();
  const normalized = raw.split(/[|,/]/).map((part) => part.trim()).find(Boolean) || '';

  if (
    normalized === 'labnews' ||
    normalized === 'lab news' ||
    normalized === 'news' ||
    normalized === 'lab-news' ||
    normalized.includes('lab news') ||
    normalized.includes('랩뉴스') ||
    normalized.includes('뉴스')
  ) {
    return 'labNews';
  }
  if (
    normalized === 'gallery' ||
    normalized === 'photos' ||
    normalized === 'photo' ||
    normalized.includes('gallery') ||
    normalized.includes('갤러리') ||
    normalized.includes('사진')
  ) {
    return 'gallery';
  }
  if (
    normalized === 'videos' ||
    normalized === 'video' ||
    normalized.includes('video') ||
    normalized.includes('videos') ||
    normalized.includes('동영상') ||
    normalized.includes('영상') ||
    normalized.includes('릴스')
  ) {
    return 'videos';
  }
  return 'labNews';
}

function inferSection({ sectionValue, title, videoUrl }) {
  const normalizedInput = String(sectionValue || '').trim();
  if (normalizedInput) {
    return normalizeSection(normalizedInput);
  }

  const titleText = String(title || '')
    .trim()
    .toLowerCase();
  if (titleText.includes('gallery') || titleText.includes('photo') || titleText.includes('갤러리') || titleText.includes('사진')) {
    return 'gallery';
  }
  if (videoUrl || titleText.includes('video') || titleText.includes('동영상') || titleText.includes('영상') || titleText.includes('릴스')) {
    return 'videos';
  }
  return 'labNews';
}

function parseDateValue(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return 0;
  }

  const parsed = Date.parse(raw);
  if (Number.isFinite(parsed)) {
    return parsed;
  }

  const parts = raw.split(/[./-]/).filter(Boolean);
  const year = Number(parts[0]) || 0;
  const month = Math.min(12, Math.max(1, Number(parts[1]) || 1));
  const day = Math.min(31, Math.max(1, Number(parts[2]) || 1));
  return Date.UTC(year, month - 1, day);
}

function sortItems(items) {
  return [...items].sort((a, b) => {
    const dateDelta = parseDateValue(b.date) - parseDateValue(a.date);
    if (dateDelta !== 0) {
      return dateDelta;
    }
    return String(a.title || '').localeCompare(String(b.title || ''));
  });
}

function findProperty(properties, names, type = '') {
  const targets = new Set(names.map((name) => String(name || '').toLowerCase()));

  for (const [key, property] of Object.entries(properties || {})) {
    if (!targets.has(key.toLowerCase())) {
      continue;
    }
    if (type && property?.type !== type) {
      continue;
    }
    return property;
  }

  if (!type) {
    for (const [key, property] of Object.entries(properties || {})) {
      if (targets.has(key.toLowerCase())) {
        return property;
      }
    }
  }

  return null;
}

function richTextToPlain(richText) {
  return (Array.isArray(richText) ? richText : [])
    .map((token) => token?.plain_text || '')
    .join('')
    .trim();
}

function propertyToText(property) {
  if (!property || !property.type) {
    return '';
  }

  if (property.type === 'title') {
    return richTextToPlain(property.title);
  }
  if (property.type === 'rich_text') {
    return richTextToPlain(property.rich_text);
  }
  if (property.type === 'url') {
    return String(property.url || '').trim();
  }
  if (property.type === 'select') {
    return String(property.select?.name || '').trim();
  }
  if (property.type === 'multi_select') {
    return (Array.isArray(property.multi_select) ? property.multi_select : [])
      .map((item) => String(item?.name || '').trim())
      .filter(Boolean)
      .join(', ');
  }
  if (property.type === 'status') {
    return String(property.status?.name || '').trim();
  }
  if (property.type === 'date') {
    return String(property.date?.start || '').trim();
  }
  if (property.type === 'checkbox') {
    return property.checkbox ? 'true' : 'false';
  }

  return '';
}

function propertyToBool(property, fallback = true) {
  if (!property || property.type !== 'checkbox') {
    return fallback;
  }
  return Boolean(property.checkbox);
}

function propertyToFiles(property) {
  if (!property || property.type !== 'files') {
    return [];
  }

  return (property.files || [])
    .map((file) => {
      if (file?.type === 'file' && file.file?.url) {
        return file.file.url;
      }
      if (file?.type === 'external' && file.external?.url) {
        return file.external.url;
      }
      return '';
    })
    .filter(Boolean);
}

function extractBlockFileUrl(blockData) {
  if (!blockData || typeof blockData !== 'object') {
    return '';
  }
  if (blockData.type === 'file' && blockData.file?.url) {
    return blockData.file.url;
  }
  if (blockData.type === 'external' && blockData.external?.url) {
    return blockData.external.url;
  }
  if (blockData.url) {
    return String(blockData.url).trim();
  }
  return '';
}

function extractBlockRichText(block) {
  if (!block?.type || !block[block.type]) {
    return '';
  }
  const node = block[block.type];
  const richText = node.rich_text || node.text || [];
  return richTextToPlain(richText);
}

async function fetchBlockChildren({ token, blockId }) {
  const items = [];
  let cursor = '';

  while (true) {
    const query = new URLSearchParams({ page_size: '100' });
    if (cursor) {
      query.set('start_cursor', cursor);
    }

    const data = await notionRequest({
      token,
      endpoint: `/blocks/${blockId}/children?${query.toString()}`,
      method: 'GET'
    });

    items.push(...(data.results || []));

    if (!data.has_more) {
      break;
    }

    cursor = data.next_cursor || '';
    if (!cursor) {
      break;
    }
  }

  return items;
}

async function fetchPageSupplementalContent({ token, pageId }) {
  const images = [];
  let summary = '';
  let videoUrl = '';

  const queue = await fetchBlockChildren({ token, blockId: pageId });
  while (queue.length > 0) {
    const block = queue.shift();
    if (!block || !block.type) {
      continue;
    }

    if (block.type === 'image') {
      const imageUrl = extractBlockFileUrl(block.image);
      if (imageUrl) {
        images.push(imageUrl);
      }
    }

    if (!videoUrl && block.type === 'video') {
      videoUrl = extractBlockFileUrl(block.video);
    }

    if (!summary) {
      const text = extractBlockRichText(block);
      if (text) {
        summary = text;
      }
    }

    if (block.has_children) {
      const children = await fetchBlockChildren({ token, blockId: block.id });
      queue.push(...children);
    }
  }

  return {
    images,
    summary,
    videoUrl
  };
}

function fileExtensionFromUrl(url, contentType = '') {
  try {
    const parsed = new URL(url);
    const fromPath = path.extname(parsed.pathname).replace('.', '').toLowerCase();
    if (fromPath) {
      return fromPath;
    }
  } catch {
    // ignore invalid URL
  }

  const byType = String(contentType || '').toLowerCase();
  if (byType.includes('image/webp')) {
    return 'webp';
  }
  if (byType.includes('image/png')) {
    return 'png';
  }
  if (byType.includes('image/jpeg') || byType.includes('image/jpg')) {
    return 'jpg';
  }
  if (byType.includes('video/mp4')) {
    return 'mp4';
  }

  return 'jpg';
}

async function downloadAsset(url, destinationDir, fileBaseName, defaultExt = 'jpg') {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download asset: ${url} (${response.status})`);
  }

  const contentType = response.headers.get('content-type') || '';
  const ext = fileExtensionFromUrl(url, contentType) || defaultExt;
  const bytes = Buffer.from(await response.arrayBuffer());
  const fileName = `${fileBaseName}.${ext}`;
  const outputPath = path.join(destinationDir, fileName);
  await fs.writeFile(outputPath, bytes);
  return fileName;
}

async function notionRequest({ token, endpoint, method = 'GET', body = null }) {
  const response = await fetch(`https://api.notion.com/v1${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': NOTION_API_VERSION,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Notion API error (${response.status}): ${text}`);
  }

  return response.json();
}

async function resolveNotionDataSourceIds({ token, databaseId }) {
  const preferred = String(process.env.NOTION_NEWS_DATA_SOURCE_ID || '').trim();
  if (preferred) {
    return [preferred];
  }

  const database = await notionRequest({
    token,
    endpoint: `/databases/${databaseId}`,
    method: 'GET'
  });

  const dataSources = Array.isArray(database?.data_sources) ? database.data_sources : [];
  const ids = dataSources.map((entry) => String(entry?.id || '').trim()).filter(Boolean);

  if (ids.length === 0) {
    // Legacy fallback for older database responses.
    return [databaseId];
  }

  if (ids.length > 1) {
    console.log(`[info] Database has multiple data sources. Merging all sources: ${ids.join(', ')}`);
    console.log('[info] You can pin one source with NOTION_NEWS_DATA_SOURCE_ID if needed.');
  }

  return ids;
}

async function fetchNotionPages({ token, databaseId }) {
  const pages = [];
  const dataSourceIds = await resolveNotionDataSourceIds({ token, databaseId });

  for (const dataSourceId of dataSourceIds) {
    let cursor = '';
    let sourceCount = 0;

    while (true) {
      const payload = { page_size: 100 };

      if (cursor) {
        payload.start_cursor = cursor;
      }

      let data = null;
      try {
        data = await notionRequest({
          token,
          endpoint: `/data_sources/${dataSourceId}/query`,
          method: 'POST',
          body: payload
        });
      } catch (error) {
        const text = String(error?.message || '');
        if (!text.includes('multiple_data_sources_for_database') && dataSourceId === databaseId) {
          // Legacy fallback for older databases without data source endpoint.
          data = await notionRequest({
            token,
            endpoint: `/databases/${databaseId}/query`,
            method: 'POST',
            body: payload
          });
        } else {
          throw error;
        }
      }

      const results = data.results || [];
      pages.push(...results);
      sourceCount += results.length;

      if (!data.has_more) {
        break;
      }

      cursor = data.next_cursor || '';
      if (!cursor) {
        break;
      }
    }

    console.log(`[info] fetched ${sourceCount} pages from data source ${dataSourceId}`);
  }

  const deduped = [...new Map(pages.map((page) => [String(page?.id || ''), page])).values()];
  return deduped;
}

async function convertNotionPagesToSections({ pages, token }) {
  const sections = {
    labNews: [],
    gallery: [],
    videos: []
  };

  await fs.mkdir(NOTION_ASSET_DIR, { recursive: true });
  await fs.rm(NOTION_ASSET_DIR, { recursive: true, force: true });
  await fs.mkdir(NOTION_ASSET_DIR, { recursive: true });
  await fs.writeFile(path.join(NOTION_ASSET_DIR, '.gitkeep'), '', 'utf8');

  for (const page of pages) {
    const properties = page.properties || {};
    const titleProp = findProperty(properties, ['Title', 'Name', '제목', '이름'], 'title');
    const sectionProp = findProperty(properties, ['Section', 'Category', 'Type', '섹션', '구분', '카테고리']);
    const dateProp = findProperty(properties, ['Date', 'Updated', '날짜', '업데이트'], 'date');
    const summaryProp = findProperty(properties, ['Summary', 'Description', 'Content', '요약', '설명', '내용'], 'rich_text');
    const linkProp = findProperty(properties, ['Link', 'URL', 'Source', '링크', '출처'], 'url');
    const videoProp = findProperty(properties, ['Video', 'Video URL', 'YouTube', '영상', '동영상'], 'url');
    const imageProp = findProperty(properties, ['Images', 'Image', 'Photos', 'Media', '사진', '이미지', '파일과 미디어', '파일'], 'files');
    const publishedProp = findProperty(properties, ['Published', 'Visible', 'Show', '게시', '표시', '공개'], 'checkbox');

    if (!propertyToBool(publishedProp, true)) {
      continue;
    }

    const title = propertyToText(titleProp);
    if (!title) {
      continue;
    }

    const sectionText = propertyToText(sectionProp);
    const date = propertyToText(dateProp);
    const summary = propertyToText(summaryProp);
    const url = propertyToText(linkProp);
    let videoUrl = propertyToText(videoProp);

    const pageToken = String(page.id || '').replace(/-/g, '').slice(0, 10) || toSlug(title, 'item');
    const mediaUrls = propertyToFiles(imageProp);
    const supplemental = await fetchPageSupplementalContent({ token, pageId: page.id });
    const mergedMediaUrls = mediaUrls.length ? mediaUrls : supplemental.images;
    const resolvedSummary = summary || supplemental.summary;
    if (!videoUrl && supplemental.videoUrl) {
      videoUrl = supplemental.videoUrl;
    }
    const section = inferSection({ sectionValue: sectionText, title, videoUrl });
    const images = [];

    for (let index = 0; index < mergedMediaUrls.length; index += 1) {
      const mediaUrl = mergedMediaUrls[index];
      try {
        const fileName = await downloadAsset(mediaUrl, NOTION_ASSET_DIR, `${pageToken}-${index + 1}`);
        images.push(`assets/img/news/notion/${fileName}`);
      } catch (error) {
        console.warn(`[warn] failed to download notion media for ${title}: ${error.message}`);
      }
    }

    const id = `${section}-${pageToken}-${toSlug(title, 'entry')}`;
    sections[section].push({
      id,
      date,
      title,
      summary: resolvedSummary,
      url,
      videoUrl,
      images
    });
  }

  return {
    labNews: sortItems(sections.labNews),
    gallery: sortItems(sections.gallery),
    videos: sortItems(sections.videos)
  };
}

async function fetchInstagramRecent(existingInstagram = {}) {
  const accessToken = String(process.env.INSTAGRAM_ACCESS_TOKEN || '').trim();
  const userId = String(process.env.INSTAGRAM_USER_ID || '').trim();

  if (!accessToken || !userId) {
    return {
      handle: String(existingInstagram.handle || process.env.INSTAGRAM_HANDLE || '').trim(),
      profileUrl: String(existingInstagram.profileUrl || process.env.INSTAGRAM_PROFILE_URL || '').trim(),
      recent: Array.isArray(existingInstagram.recent) ? existingInstagram.recent : []
    };
  }

  const limit = Number(process.env.INSTAGRAM_POST_LIMIT || 5);
  await fs.mkdir(INSTAGRAM_ASSET_DIR, { recursive: true });
  await fs.rm(INSTAGRAM_ASSET_DIR, { recursive: true, force: true });
  await fs.mkdir(INSTAGRAM_ASSET_DIR, { recursive: true });
  await fs.writeFile(path.join(INSTAGRAM_ASSET_DIR, '.gitkeep'), '', 'utf8');

  const endpoint = `https://graph.instagram.com/${userId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=${Math.max(1, Math.min(limit, 20))}&access_token=${encodeURIComponent(accessToken)}`;
  const response = await fetch(endpoint);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Instagram API error (${response.status}): ${text}`);
  }

  const payload = await response.json();
  const media = Array.isArray(payload.data) ? payload.data : [];

  const recent = [];
  for (let index = 0; index < media.length; index += 1) {
    const post = media[index];
    const mediaUrl = post.media_type === 'VIDEO' ? post.thumbnail_url || post.media_url : post.media_url;
    const caption = String(post.caption || '').trim();
    const title = caption.split('\n').map((line) => line.trim()).filter(Boolean)[0] || `Instagram Post ${index + 1}`;

    const images = [];
    if (mediaUrl) {
      try {
        const fileName = await downloadAsset(mediaUrl, INSTAGRAM_ASSET_DIR, `ig-${index + 1}`);
        images.push(`assets/img/news/instagram/${fileName}`);
      } catch (error) {
        console.warn(`[warn] failed to download instagram media for post ${post.id}: ${error.message}`);
      }
    }

    recent.push({
      id: `instagram-${post.id || index + 1}`,
      date: String(post.timestamp || '').slice(0, 10),
      title,
      summary: caption,
      url: String(post.permalink || '').trim(),
      videoUrl: '',
      images
    });
  }

  return {
    handle: String(process.env.INSTAGRAM_HANDLE || existingInstagram.handle || '').trim(),
    profileUrl: String(process.env.INSTAGRAM_PROFILE_URL || existingInstagram.profileUrl || '').trim(),
    recent: sortItems(recent)
  };
}

function resolvePiLinks(existing = {}) {
  return {
    linkedin: String(process.env.PI_LINKEDIN_URL || existing.linkedin || '').trim(),
    webOfScience: String(process.env.PI_WOS_URL || existing.webOfScience || '').trim(),
    orcid: String(process.env.PI_ORCID_URL || existing.orcid || '').trim(),
    scopus: String(process.env.PI_SCOPUS_URL || existing.scopus || '').trim(),
    googleScholar: String(process.env.PI_SCHOLAR_URL || existing.googleScholar || '').trim(),
    researchGate: String(process.env.PI_RESEARCHGATE_URL || existing.researchGate || '').trim()
  };
}

async function main() {
  await loadDotenv('.env.local');
  await loadDotenv('.env');

  const notionToken = requireEnv('NOTION_TOKEN');
  const notionDbId = requireEnv('NOTION_NEWS_DB_ID');

  const existing = await readJsonIfExists(NEWS_OUTPUT_PATH, {});
  const pages = await fetchNotionPages({ token: notionToken, databaseId: notionDbId });

  const notionSections = await convertNotionPagesToSections({ pages, token: notionToken });
  const sections = notionSections;

  const instagram = await fetchInstagramRecent(existing.instagram || {});
  const piLinks = resolvePiLinks(existing.piLinks || {});

  const payload = {
    updatedAt: new Date().toISOString().slice(0, 10),
    instagram,
    piLinks,
    sections
  };

  await fs.mkdir(path.dirname(NEWS_OUTPUT_PATH), { recursive: true });
  await fs.writeFile(NEWS_OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  const counts = SECTION_KEYS.map((key) => `${key}: ${payload.sections[key]?.length || 0}`).join(', ');
  console.log(`Synced news from Notion -> public/data/news.json (${counts})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
