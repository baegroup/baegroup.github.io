import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const NEWS_OUTPUT_PATH = path.join(ROOT, 'public', 'data', 'news.json');
const NOTION_ASSET_DIR = path.join(ROOT, 'public', 'assets', 'img', 'news', 'notion');
const INSTAGRAM_ASSET_DIR = path.join(ROOT, 'public', 'assets', 'img', 'news', 'instagram');
const NOTION_API_VERSION = '2022-06-28';
const SECTION_KEYS = ['labNews', 'gallery', 'videos'];

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

  if (raw === 'labnews' || raw === 'lab news' || raw === 'news' || raw === 'lab-news') {
    return 'labNews';
  }
  if (raw === 'gallery' || raw === 'photos' || raw === 'photo') {
    return 'gallery';
  }
  if (raw === 'videos' || raw === 'video') {
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

async function fetchNotionPages({ token, databaseId }) {
  const pages = [];
  let cursor = '';

  while (true) {
    const payload = {
      page_size: 100,
      sorts: [
        {
          property: 'Date',
          direction: 'descending'
        }
      ]
    };

    if (cursor) {
      payload.start_cursor = cursor;
    }

    const data = await notionRequest({
      token,
      endpoint: `/databases/${databaseId}/query`,
      method: 'POST',
      body: payload
    });

    pages.push(...(data.results || []));

    if (!data.has_more) {
      break;
    }

    cursor = data.next_cursor || '';
    if (!cursor) {
      break;
    }
  }

  return pages;
}

async function convertNotionPagesToSections(pages) {
  const sections = {
    labNews: [],
    gallery: [],
    videos: []
  };

  await fs.mkdir(NOTION_ASSET_DIR, { recursive: true });
  await fs.rm(NOTION_ASSET_DIR, { recursive: true, force: true });
  await fs.mkdir(NOTION_ASSET_DIR, { recursive: true });

  for (const page of pages) {
    const properties = page.properties || {};
    const titleProp = findProperty(properties, ['Title', 'Name'], 'title');
    const sectionProp = findProperty(properties, ['Section', 'Category', 'Type']);
    const dateProp = findProperty(properties, ['Date', 'Updated'], 'date');
    const summaryProp = findProperty(properties, ['Summary', 'Description', 'Content'], 'rich_text');
    const linkProp = findProperty(properties, ['Link', 'URL', 'Source'], 'url');
    const videoProp = findProperty(properties, ['Video', 'Video URL', 'YouTube'], 'url');
    const imageProp = findProperty(properties, ['Images', 'Image', 'Photos', 'Media'], 'files');
    const publishedProp = findProperty(properties, ['Published', 'Visible', 'Show'], 'checkbox');

    if (!propertyToBool(publishedProp, true)) {
      continue;
    }

    const title = propertyToText(titleProp);
    if (!title) {
      continue;
    }

    const section = normalizeSection(propertyToText(sectionProp));
    const date = propertyToText(dateProp);
    const summary = propertyToText(summaryProp);
    const url = propertyToText(linkProp);
    const videoUrl = propertyToText(videoProp);

    const pageToken = String(page.id || '').replace(/-/g, '').slice(0, 10) || toSlug(title, 'item');
    const mediaUrls = propertyToFiles(imageProp);
    const images = [];

    for (let index = 0; index < mediaUrls.length; index += 1) {
      const mediaUrl = mediaUrls[index];
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
      summary,
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
  const notionToken = requireEnv('NOTION_TOKEN');
  const notionDbId = requireEnv('NOTION_NEWS_DB_ID');

  const existing = await readJsonIfExists(NEWS_OUTPUT_PATH, {});
  const pages = await fetchNotionPages({ token: notionToken, databaseId: notionDbId });

  const notionSections = await convertNotionPagesToSections(pages);
  const sections = {
    labNews: notionSections.labNews.length ? notionSections.labNews : Array.isArray(existing.sections?.labNews) ? existing.sections.labNews : [],
    gallery: notionSections.gallery.length ? notionSections.gallery : Array.isArray(existing.sections?.gallery) ? existing.sections.gallery : [],
    videos: notionSections.videos.length ? notionSections.videos : Array.isArray(existing.sections?.videos) ? existing.sections.videos : []
  };

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
