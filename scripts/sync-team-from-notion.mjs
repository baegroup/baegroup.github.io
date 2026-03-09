import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const TEAM_OUTPUT_PATH = path.join(ROOT, 'public', 'data', 'team.json');
const TEAM_ASSET_DIR = path.join(ROOT, 'public', 'assets', 'img', 'team', 'notion');
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

function toSlug(value, fallback = 'member') {
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
  if (property.type === 'number') {
    return Number.isFinite(property.number) ? String(property.number) : '';
  }
  if (property.type === 'email') {
    return String(property.email || '').trim();
  }
  if (property.type === 'phone_number') {
    return String(property.phone_number || '').trim();
  }
  if (property.type === 'url') {
    return String(property.url || '').trim();
  }
  if (property.type === 'multi_select') {
    return (Array.isArray(property.multi_select) ? property.multi_select : [])
      .map((item) => String(item?.name || '').trim())
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
  const text = propertyToText(property);
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
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

function parseListText(value) {
  const text = String(value || '').trim();
  if (!text) {
    return [];
  }
  return text
    .split(/\n|;|,(?!\s(?:Jr\.|Sr\.))/)
    .map((item) => item.trim())
    .filter(Boolean);
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

function normalizeRole(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) {
    return 'Graduate';
  }
  if (raw.includes('pi') || raw.includes('professor')) {
    return 'PI';
  }
  if (raw.includes('staff')) {
    return 'Staff';
  }
  if (raw.includes('researcher') || raw.includes('postdoc')) {
    return 'Researcher';
  }
  if (raw.includes('undergraduate') || raw.includes('ug')) {
    return 'Undergraduate';
  }
  if (raw.includes('alumni')) {
    return 'Alumni';
  }
  return 'Graduate';
}

function normalizeStatus(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (raw.includes('alumni') || raw.includes('graduated')) {
    return 'alumni';
  }
  return 'current';
}

function normalizeProgram(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (raw === 'ms-phd' || raw === 'msphd' || raw.includes('integrated')) {
    return 'MSPhD';
  }
  if (raw === 'phd' || raw.includes('doctoral')) {
    return 'PhD';
  }
  if (raw === 'ms' || raw.includes('master')) {
    return 'MS';
  }
  if (raw === 'bs' || raw.includes('undergraduate')) {
    return 'BS';
  }
  if (raw.includes('staff') || raw.includes('pi') || raw.includes('professor')) {
    return 'Staff';
  }
  return '';
}

async function convertPagesToTeam({ pages }) {
  await fs.mkdir(TEAM_ASSET_DIR, { recursive: true });
  await fs.rm(TEAM_ASSET_DIR, { recursive: true, force: true });
  await fs.mkdir(TEAM_ASSET_DIR, { recursive: true });
  await fs.writeFile(path.join(TEAM_ASSET_DIR, '.gitkeep'), '', 'utf8');

  const members = [];

  for (const page of pages) {
    const properties = page.properties || {};

    const publishedProp = findProperty(properties, ['Published', 'Visible', 'Show', '게시', '공개'], 'checkbox');
    if (!propertyToBool(publishedProp, true)) {
      continue;
    }

    const name = propertyToText(findProperty(properties, ['Name', 'Title', 'Member Name', '이름', '성명'], 'title'));
    if (!name) {
      continue;
    }

    const idRaw = propertyToText(findProperty(properties, ['ID', 'Slug', 'Handle', '식별자']));
    const id = toSlug(idRaw || name);
    let role = normalizeRole(propertyToText(findProperty(properties, ['Role', 'Track', '구분', '직책'])));
    const statusText = propertyToText(findProperty(properties, ['Status', 'Membership Status', '상태']));
    const program = normalizeProgram(propertyToText(findProperty(properties, ['Program', 'Degree', '학위과정'])));
    if (program === 'Staff' && role !== 'PI' && role !== 'Alumni') {
      role = 'Staff';
    }
    const status = statusText ? normalizeStatus(statusText) : role === 'Alumni' ? 'alumni' : 'current';
    const email = propertyToText(findProperty(properties, ['Email', 'E-mail', '메일', '이메일'], 'email')) || propertyToText(findProperty(properties, ['Email', 'E-mail', '메일', '이메일']));
    const startYear = propertyToNumber(findProperty(properties, ['Start Year', 'StartYear', 'Start Year & Semester', '입실연도', 'Start']));
    const endYear = propertyToNumber(findProperty(properties, ['End Year', 'EndYear', '졸업연도', 'End']));
    const joiningGroup = propertyToText(findProperty(properties, ['Joining Group', 'Join Term', 'Start Year & Semester', '입실시기']));
    const undergraduateSchool = propertyToText(findProperty(properties, ['Undergraduate School', '학사 학교']));
    const undergraduateMajor = propertyToText(findProperty(properties, ['Undergraduate Major', '학사 전공']));
    const masterSchool = propertyToText(findProperty(properties, ['Master School', '석사 학교']));
    const masterMajor = propertyToText(findProperty(properties, ['Master Major', '석사 전공']));
    const interestsText = propertyToText(findProperty(properties, ['Research Interests', 'Interests', '연구주제', '관심분야']));
    const interests = parseListText(interestsText);
    const koreanProficiency = propertyToText(findProperty(properties, ['Korean Proficiency', 'TOPIK']));
    const currentAffiliation = propertyToText(findProperty(properties, ['Current Affiliation', 'Current', '현소속']));
    const note = propertyToText(findProperty(properties, ['Note', 'Remarks', '비고']));

    const photoFiles = propertyToFiles(findProperty(properties, ['Photo', 'Profile', 'Image', '사진'], 'files'));
    let photo = '';
    if (photoFiles.length > 0) {
      try {
        const fileName = await downloadAsset(photoFiles[0], TEAM_ASSET_DIR, id);
        photo = `assets/img/team/notion/${fileName}`;
      } catch (error) {
        console.warn(`[warn] failed to download profile photo for ${name}: ${error.message}`);
      }
    }

    members.push({
      id,
      name,
      role,
      status,
      program,
      email,
      interests,
      photo,
      startYear,
      endYear,
      joiningGroup,
      undergraduateSchool,
      undergraduateMajor,
      masterSchool,
      masterMajor,
      koreanProficiency,
      note,
      currentAffiliation
    });
  }

  members.sort((a, b) => {
    const statusWeight = a.status === b.status ? 0 : a.status === 'current' ? -1 : 1;
    if (statusWeight !== 0) {
      return statusWeight;
    }
    const yearA = Number.isFinite(a.startYear) ? a.startYear : 9999;
    const yearB = Number.isFinite(b.startYear) ? b.startYear : 9999;
    if (yearA !== yearB) {
      return yearA - yearB;
    }
    return String(a.name || '').localeCompare(String(b.name || ''));
  });

  return members;
}

async function main() {
  await loadDotenv('.env.local');
  await loadDotenv('.env');

  const notionToken = requireEnv('NOTION_TOKEN');
  const notionDbId = requireEnv('NOTION_TEAM_DB_ID');
  const pages = await fetchNotionPages({
    token: notionToken,
    databaseId: notionDbId,
    dataSourceEnvKey: 'NOTION_TEAM_DATA_SOURCE_ID'
  });

  const members = await convertPagesToTeam({ pages });
  await fs.writeFile(TEAM_OUTPUT_PATH, `${JSON.stringify(members, null, 2)}\n`, 'utf8');
  console.log(`Synced team from Notion -> public/data/team.json (${members.length} members)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
