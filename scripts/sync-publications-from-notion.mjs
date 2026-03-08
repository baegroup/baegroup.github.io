import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const PUBLICATIONS_OUTPUT_PATH = path.join(ROOT, 'public', 'data', 'publications.json');
const COVERS_ASSET_DIR = path.join(ROOT, 'public', 'assets', 'img', 'publications', 'covers');
const NOTION_API_VERSION = '2025-09-03';

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
      const raw = line.slice(index + 1).trim();
      const value =
        (raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))
          ? raw.slice(1, -1)
          : raw;
      process.env[key] = value;
    });
}

function requireEnv(name) {
  const value = String(process.env[name] || '').trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function toSlug(value, fallback = 'publication') {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized || fallback;
}

function findProperty(properties, names, type = '') {
  const targets = new Set(names.map((item) => String(item || '').toLowerCase()));
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
  if (property.type === 'select') {
    return String(property.select?.name || '').trim();
  }
  if (property.type === 'status') {
    return String(property.status?.name || '').trim();
  }
  if (property.type === 'url') {
    return String(property.url || '').trim();
  }
  if (property.type === 'number') {
    return Number.isFinite(property.number) ? String(property.number) : '';
  }
  if (property.type === 'date') {
    return String(property.date?.start || '').trim();
  }
  if (property.type === 'multi_select') {
    return (Array.isArray(property.multi_select) ? property.multi_select : [])
      .map((item) => String(item?.name || '').trim())
      .filter(Boolean)
      .join(', ');
  }
  if (property.type === 'relation') {
    return (Array.isArray(property.relation) ? property.relation : [])
      .map((item) => String(item?.id || '').trim())
      .filter(Boolean)
      .join(', ');
  }
  return '';
}

function propertyToNumber(property) {
  if (!property) {
    return null;
  }
  if (property.type === 'number') {
    return Number.isFinite(property.number) ? Number(property.number) : null;
  }
  if (property.type === 'date') {
    const raw = String(property.date?.start || '').slice(0, 4);
    const year = Number(raw);
    return Number.isFinite(year) ? year : null;
  }
  const text = propertyToText(property);
  const num = Number(text);
  return Number.isFinite(num) ? num : null;
}

function propertyToBool(property, fallback = true) {
  if (!property || property.type !== 'checkbox') {
    return fallback;
  }
  return Boolean(property.checkbox);
}

function textToBool(value, fallback = false) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) {
    return fallback;
  }
  if (['true', 'yes', 'y', '1', 'featured', 'cover', 'o'].includes(raw)) {
    return true;
  }
  if (['false', 'no', 'n', '0', 'x'].includes(raw)) {
    return false;
  }
  return fallback;
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

function parseNameList(value) {
  const text = String(value || '').trim();
  if (!text) {
    return [];
  }

  if (text.includes(';')) {
    return text.split(';').map((item) => item.trim()).filter(Boolean);
  }
  if (text.includes('\n')) {
    return text.split('\n').map((item) => item.trim()).filter(Boolean);
  }
  return text.split(',').map((item) => item.trim()).filter(Boolean);
}

function normalizeDoi(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }
  return raw
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
    .replace(/^doi:\s*/i, '')
    .trim();
}

function fileExtensionFromUrl(url, contentType = '') {
  try {
    const parsed = new URL(url);
    const ext = path.extname(parsed.pathname).replace('.', '').toLowerCase();
    if (ext) {
      return ext;
    }
  } catch {
    // ignore
  }

  const type = String(contentType || '').toLowerCase();
  if (type.includes('image/webp')) {
    return 'webp';
  }
  if (type.includes('image/png')) {
    return 'png';
  }
  if (type.includes('image/jpeg') || type.includes('image/jpg')) {
    return 'jpg';
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
  await fs.writeFile(path.join(destinationDir, fileName), bytes);
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

async function resolveNotionDataSourceIds({ token, databaseId, dataSourceEnvKey }) {
  const preferred = String(process.env[dataSourceEnvKey] || '').trim();
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
  return ids.length ? ids : [databaseId];
}

async function fetchNotionPages({ token, databaseId, dataSourceEnvKey }) {
  const pages = [];
  const dataSourceIds = await resolveNotionDataSourceIds({ token, databaseId, dataSourceEnvKey });

  for (const dataSourceId of dataSourceIds) {
    let cursor = '';
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
        if (dataSourceId === databaseId) {
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

      pages.push(...(data.results || []));
      if (!data.has_more) {
        break;
      }
      cursor = data.next_cursor || '';
      if (!cursor) {
        break;
      }
    }
  }
  return [...new Map(pages.map((page) => [String(page?.id || ''), page])).values()];
}

function normalizeType(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (raw.includes('patent')) {
    return 'patent';
  }
  if (raw.includes('preprint')) {
    return 'preprint';
  }
  if (raw.includes('conference')) {
    return 'conference';
  }
  return 'journal';
}

async function convertPagesToPublications({ pages }) {
  await fs.mkdir(COVERS_ASSET_DIR, { recursive: true });

  const publications = [];

  for (const page of pages) {
    const properties = page.properties || {};
    const publishedProp = findProperty(properties, ['Published', 'Visible', 'Show', '게시', '공개'], 'checkbox');
    if (!propertyToBool(publishedProp, true)) {
      continue;
    }

    const title = propertyToText(findProperty(properties, ['Title', 'Name', '논문명', '제목'], 'title'));
    if (!title) {
      continue;
    }

    const idRaw = propertyToText(findProperty(properties, ['ID', 'Slug', '식별자']));
    const id = toSlug(idRaw || title);
    const year =
      propertyToNumber(findProperty(properties, ['Year', 'Publication Year', '연도'])) ||
      Number(String(propertyToText(findProperty(properties, ['Date', 'Published Date', '게재일'])).slice(0, 4))) ||
      new Date().getFullYear();
    const type = normalizeType(propertyToText(findProperty(properties, ['Type', 'Category', '구분'])));
    const authors = parseNameList(propertyToText(findProperty(properties, ['Authors', 'Author', 'Author List', '저자'])));
    const venue = propertyToText(findProperty(properties, ['Venue', 'Journal', '학술지']));
    const doi = normalizeDoi(propertyToText(findProperty(properties, ['DOI', 'doi'])));
    const url = propertyToText(findProperty(properties, ['URL', 'Link', 'Paper URL', '논문링크'], 'url')) || propertyToText(findProperty(properties, ['URL', 'Link', 'Paper URL', '논문링크']));
    const featuredCheckbox = findProperty(properties, ['Featured', 'Highlight', '대표'], 'checkbox');
    const featuredText = propertyToText(findProperty(properties, ['Featured as cover', 'Featured']));
    const featured = featuredCheckbox ? propertyToBool(featuredCheckbox, false) : textToBool(featuredText, false);
    const labAuthorNames = parseNameList(propertyToText(findProperty(properties, ['Lab Authors', 'Bae Lab Authors', '연구실 저자'])));
    const labAuthors = parseNameList(propertyToText(findProperty(properties, ['Lab Author IDs', 'Lab IDs', '저자 ID'])));

    const coverFiles = propertyToFiles(findProperty(properties, ['Cover', 'Journal Cover', '표지'], 'files'));
    let coverImage = '';
    if (coverFiles.length > 0) {
      try {
        const fileBase = `${id}-cover`;
        await downloadAsset(coverFiles[0], COVERS_ASSET_DIR, fileBase);
        coverImage = fileBase;
      } catch (error) {
        console.warn(`[warn] failed to download cover for ${title}: ${error.message}`);
      }
    }

    publications.push({
      id,
      year,
      type,
      title,
      authors,
      venue,
      doi,
      url,
      labAuthors,
      labAuthorNames,
      featured,
      coverImage
    });
  }

  publications.sort((a, b) => {
    const yearDelta = (b.year || 0) - (a.year || 0);
    if (yearDelta !== 0) {
      return yearDelta;
    }
    return String(a.title || '').localeCompare(String(b.title || ''));
  });

  return publications;
}

async function main() {
  await loadDotenv('.env.local');
  await loadDotenv('.env');

  const notionToken = requireEnv('NOTION_TOKEN');
  const notionDbId = requireEnv('NOTION_PUBLICATIONS_DB_ID');
  const pages = await fetchNotionPages({
    token: notionToken,
    databaseId: notionDbId,
    dataSourceEnvKey: 'NOTION_PUBLICATIONS_DATA_SOURCE_ID'
  });

  const publications = await convertPagesToPublications({ pages });
  await fs.writeFile(PUBLICATIONS_OUTPUT_PATH, `${JSON.stringify(publications, null, 2)}\n`, 'utf8');
  console.log(`Synced publications from Notion -> public/data/publications.json (${publications.length} records)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
