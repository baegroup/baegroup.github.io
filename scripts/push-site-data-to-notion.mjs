import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const TEAM_JSON_PATH = path.join(ROOT, 'public', 'data', 'team.json');
const PUBLICATIONS_JSON_PATH = path.join(ROOT, 'public', 'data', 'publications.json');
const NOTION_API_VERSION = '2025-09-03';
const DEFAULT_SITE_BASE_URL = 'https://baegroup.github.io';

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

function normalizeSiteBaseUrl(value) {
  const raw = String(value || DEFAULT_SITE_BASE_URL).trim().replace(/\/+$/, '');
  return raw || DEFAULT_SITE_BASE_URL;
}

async function readJson(filePath) {
  const source = await fs.readFile(filePath, 'utf8');
  return JSON.parse(source);
}

function truncateText(value, max = 1900) {
  return String(value || '').trim().slice(0, max);
}

function richTextValue(value) {
  const text = truncateText(value);
  if (!text) {
    return { rich_text: [] };
  }
  return {
    rich_text: [
      {
        type: 'text',
        text: {
          content: text
        }
      }
    ]
  };
}

function titleValue(value) {
  const text = truncateText(value);
  return {
    title: text
      ? [
          {
            type: 'text',
            text: {
              content: text
            }
          }
        ]
      : []
  };
}

function selectValue(value) {
  const name = String(value || '').trim();
  return { select: name ? { name } : null };
}

function numberValue(value) {
  return { number: Number.isFinite(value) ? value : null };
}

function urlValue(value) {
  const raw = String(value || '').trim();
  return { url: raw || null };
}

function checkboxValue(value) {
  return { checkbox: Boolean(value) };
}

function filesExternalValue(url) {
  const raw = String(url || '').trim();
  if (!raw) {
    return { files: [] };
  }
  return {
    files: [
      {
        type: 'external',
        name: raw.split('/').pop() || 'file',
        external: {
          url: raw
        }
      }
    ]
  };
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
    throw new Error(`Notion API error (${response.status}) ${endpoint}: ${text}`);
  }
  return response.json();
}

async function resolveDataSourceId({ token, databaseId, envDataSourceId }) {
  if (envDataSourceId) {
    return envDataSourceId;
  }
  const database = await notionRequest({
    token,
    endpoint: `/databases/${databaseId}`,
    method: 'GET'
  });
  const dataSources = Array.isArray(database?.data_sources) ? database.data_sources : [];
  const ids = dataSources.map((entry) => String(entry?.id || '').trim()).filter(Boolean);
  if (!ids.length) {
    throw new Error(`No data sources found for database ${databaseId}. Set explicit data source ID.`);
  }
  return ids[0];
}

async function getDataSource({ token, dataSourceId }) {
  return notionRequest({
    token,
    endpoint: `/data_sources/${dataSourceId}`,
    method: 'GET'
  });
}

async function ensureProperties({ token, dataSourceId, specs }) {
  const dataSource = await getDataSource({ token, dataSourceId });
  const existingNames = new Set(Object.keys(dataSource.properties || {}));
  const toAdd = {};

  specs.forEach((spec) => {
    if (existingNames.has(spec.name)) {
      return;
    }
    if (spec.type === 'title') {
      toAdd[spec.name] = { title: {} };
      return;
    }
    if (spec.type === 'rich_text') {
      toAdd[spec.name] = { rich_text: {} };
      return;
    }
    if (spec.type === 'select') {
      toAdd[spec.name] = {
        select: {
          options: (spec.options || []).map((name) => ({ name }))
        }
      };
      return;
    }
    if (spec.type === 'checkbox') {
      toAdd[spec.name] = { checkbox: {} };
      return;
    }
    if (spec.type === 'url') {
      toAdd[spec.name] = { url: {} };
      return;
    }
    if (spec.type === 'files') {
      toAdd[spec.name] = { files: {} };
      return;
    }
    if (spec.type === 'number') {
      toAdd[spec.name] = { number: { format: 'number' } };
    }
  });

  if (Object.keys(toAdd).length) {
    await notionRequest({
      token,
      endpoint: `/data_sources/${dataSourceId}`,
      method: 'PATCH',
      body: {
        properties: toAdd
      }
    });
  }

  return getDataSource({ token, dataSourceId });
}

async function removePropertiesByName({ token, dataSourceId, names }) {
  const dataSource = await getDataSource({ token, dataSourceId });
  const current = dataSource?.properties || {};
  const removals = {};

  names.forEach((name) => {
    if (!current[name]) {
      return;
    }
    const propertyId = String(current[name]?.id || '').trim();
    if (!propertyId) {
      return;
    }
    removals[propertyId] = null;
  });

  if (!Object.keys(removals).length) {
    return dataSource;
  }

  await notionRequest({
    token,
    endpoint: `/data_sources/${dataSourceId}`,
    method: 'PATCH',
    body: {
      properties: removals
    }
  });

  return getDataSource({ token, dataSourceId });
}

function propertyByNameMap(dataSource) {
  return new Map(Object.entries(dataSource?.properties || {}).map(([name, config]) => [name, config]));
}

function pickProperty(propertyMap, preferredNames) {
  for (const name of preferredNames) {
    if (propertyMap.has(name)) {
      return name;
    }
  }
  return '';
}

function extractPlainFromPropertyValue(value) {
  if (!value || !value.type) {
    return '';
  }
  if (value.type === 'title') {
    return (value.title || []).map((item) => item?.plain_text || '').join('').trim();
  }
  if (value.type === 'rich_text') {
    return (value.rich_text || []).map((item) => item?.plain_text || '').join('').trim();
  }
  if (value.type === 'select') {
    return String(value.select?.name || '').trim();
  }
  if (value.type === 'number') {
    return Number.isFinite(value.number) ? String(value.number) : '';
  }
  if (value.type === 'url') {
    return String(value.url || '').trim();
  }
  return '';
}

async function fetchAllPages({ token, dataSourceId }) {
  const pages = [];
  let cursor = '';
  while (true) {
    const payload = { page_size: 100 };
    if (cursor) {
      payload.start_cursor = cursor;
    }
    const data = await notionRequest({
      token,
      endpoint: `/data_sources/${dataSourceId}/query`,
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

async function upsertPages({ token, dataSourceId, uniqueFieldName, items, buildProperties, itemLabel }) {
  const pages = await fetchAllPages({ token, dataSourceId });
  const existingByKey = new Map();

  pages.forEach((page) => {
    const key = extractPlainFromPropertyValue(page.properties?.[uniqueFieldName]);
    if (!key) {
      return;
    }
    existingByKey.set(key, page);
  });

  let created = 0;
  let updated = 0;

  for (const item of items) {
    const key = String(item.key || '').trim();
    if (!key) {
      continue;
    }

    const properties = buildProperties(item);
    const existing = existingByKey.get(key);

    if (existing) {
      await notionRequest({
        token,
        endpoint: `/pages/${existing.id}`,
        method: 'PATCH',
        body: { properties }
      });
      updated += 1;
    } else {
      await notionRequest({
        token,
        endpoint: '/pages',
        method: 'POST',
        body: {
          parent: { data_source_id: dataSourceId },
          properties
        }
      });
      created += 1;
    }
  }

  console.log(`[${itemLabel}] upsert complete: created=${created}, updated=${updated}`);
}

async function pushTeam({ token, dataSourceId, siteBaseUrl }) {
  const team = await readJson(TEAM_JSON_PATH);
  let dataSource = await ensureProperties({
    token,
    dataSourceId,
    specs: [
      { name: 'Published', type: 'checkbox' },
      { name: 'Name', type: 'title' },
      { name: 'ID', type: 'rich_text' },
      { name: 'Role', type: 'select', options: ['PI', 'Researcher', 'Staff', 'Graduate', 'Undergraduate', 'Alumni'] },
      { name: 'Program', type: 'select', options: ['PhD', 'MSPhD', 'MS', 'BS', 'Staff'] },
      { name: 'E-mail', type: 'rich_text' },
      { name: 'Photo', type: 'files' },
      { name: 'Start Year', type: 'number' },
      { name: 'End Year', type: 'number' },
      { name: 'Start Year & Semester', type: 'rich_text' },
      { name: 'Undergraduate School', type: 'rich_text' },
      { name: 'Undergraduate Major', type: 'rich_text' },
      { name: 'Master School', type: 'rich_text' },
      { name: 'Master Major', type: 'rich_text' },
      { name: 'Research Interests', type: 'rich_text' },
      { name: 'Korean Proficiency', type: 'rich_text' },
      { name: 'Current Affiliation', type: 'rich_text' },
      { name: 'Note', type: 'rich_text' }
    ]
  });

  dataSource = await removePropertiesByName({
    token,
    dataSourceId,
    names: ['Status', 'Course Label', 'Email Display', 'Website']
  });

  const propertyMap = propertyByNameMap(dataSource);
  const publishedProp = pickProperty(propertyMap, ['Published', 'Publish']);
  const nameProp = pickProperty(propertyMap, ['Name']);
  const idProp = pickProperty(propertyMap, ['ID']);
  const roleProp = pickProperty(propertyMap, ['Role']);
  const programProp = pickProperty(propertyMap, ['Program']);
  const emailProp = pickProperty(propertyMap, ['E-mail', 'Email']);
  const photoProp = pickProperty(propertyMap, ['Photo']);
  const startYearProp = pickProperty(propertyMap, ['Start Year']);
  const endYearProp = pickProperty(propertyMap, ['End Year']);
  const joinTermProp = pickProperty(propertyMap, ['Start Year & Semester', 'Joining Group']);
  const ugSchoolProp = pickProperty(propertyMap, ['Undergraduate School']);
  const ugMajorProp = pickProperty(propertyMap, ['Undergraduate Major']);
  const msSchoolProp = pickProperty(propertyMap, ['Master School']);
  const msMajorProp = pickProperty(propertyMap, ['Master Major']);
  const interestsProp = pickProperty(propertyMap, ['Research Interests']);
  const koreanProp = pickProperty(propertyMap, ['Korean Proficiency']);
  const currentAffProp = pickProperty(propertyMap, ['Current Affiliation']);
  const noteProp = pickProperty(propertyMap, ['Note']);

  const items = team.map((member) => ({
    key: member.id,
    member
  }));

  await upsertPages({
    token,
    dataSourceId,
    uniqueFieldName: idProp || nameProp,
    itemLabel: 'team',
    items,
    buildProperties: ({ member }) => {
      const properties = {};
      if (nameProp) {
        properties[nameProp] = titleValue(member.name);
      }
      if (idProp) {
        properties[idProp] = richTextValue(member.id);
      }
      if (roleProp) {
        properties[roleProp] = selectValue(member.role);
      }
      if (programProp) {
        properties[programProp] = selectValue(member.program);
      }
      if (emailProp) {
        properties[emailProp] = richTextValue(member.email || '');
      }
      if (photoProp) {
        const photoPath = String(member.photo || '').trim();
        const photoUrl = photoPath ? `${siteBaseUrl}/${photoPath.replace(/^\/+/, '')}` : '';
        properties[photoProp] = filesExternalValue(photoUrl);
      }
      if (startYearProp) {
        properties[startYearProp] = numberValue(Number.isFinite(member.startYear) ? member.startYear : null);
      }
      if (endYearProp) {
        properties[endYearProp] = numberValue(Number.isFinite(member.endYear) ? member.endYear : null);
      }
      if (joinTermProp) {
        properties[joinTermProp] = richTextValue(member.joiningGroup || '');
      }
      if (ugSchoolProp) {
        properties[ugSchoolProp] = richTextValue(member.undergraduateSchool || '');
      }
      if (ugMajorProp) {
        properties[ugMajorProp] = richTextValue(member.undergraduateMajor || '');
      }
      if (msSchoolProp) {
        properties[msSchoolProp] = richTextValue(member.masterSchool || '');
      }
      if (msMajorProp) {
        properties[msMajorProp] = richTextValue(member.masterMajor || '');
      }
      if (interestsProp) {
        properties[interestsProp] = richTextValue((member.interests || []).join('; '));
      }
      if (koreanProp) {
        properties[koreanProp] = richTextValue(member.koreanProficiency || '');
      }
      if (currentAffProp) {
        properties[currentAffProp] = richTextValue(member.currentAffiliation || '');
      }
      if (noteProp) {
        properties[noteProp] = richTextValue(member.note || '');
      }
      if (publishedProp) {
        properties[publishedProp] = checkboxValue(true);
      }
      return properties;
    }
  });
}

async function pushPublications({ token, dataSourceId, siteBaseUrl }) {
  const publications = await readJson(PUBLICATIONS_JSON_PATH);
  let dataSource = await ensureProperties({
    token,
    dataSourceId,
    specs: [
      { name: 'Published', type: 'checkbox' },
      { name: 'Title', type: 'title' },
      { name: 'ID', type: 'rich_text' },
      { name: 'Year', type: 'rich_text' },
      { name: 'Type', type: 'select', options: ['journal', 'patent', 'preprint', 'conference'] },
      { name: 'Author', type: 'rich_text' },
      { name: 'Journal', type: 'rich_text' },
      { name: 'Volume', type: 'rich_text' },
      { name: 'Issue', type: 'rich_text' },
      { name: 'Pages', type: 'rich_text' },
      { name: 'DOI', type: 'url' },
      { name: 'Cover', type: 'files' },
    ]
  });

  dataSource = await removePropertiesByName({
    token,
    dataSourceId,
    names: ['Venue', 'URL', 'Lab Authors', 'Lab Author IDs', 'Featured', 'Featured as cover']
  });

  const propertyMap = propertyByNameMap(dataSource);
  const publishedProp = pickProperty(propertyMap, ['Published', 'Publish']);
  const titleProp = pickProperty(propertyMap, ['Title']);
  const idProp = pickProperty(propertyMap, ['ID']);
  const yearProp = pickProperty(propertyMap, ['Year']);
  const typeProp = pickProperty(propertyMap, ['Type']);
  const authorProp = pickProperty(propertyMap, ['Author', 'Authors']);
  const journalProp = pickProperty(propertyMap, ['Journal', 'Venue']);
  const volumeProp = pickProperty(propertyMap, ['Volume', 'Vol']);
  const issueProp = pickProperty(propertyMap, ['Issue', 'No']);
  const pagesProp = pickProperty(propertyMap, ['Pages', 'Page']);
  const doiProp = pickProperty(propertyMap, ['DOI']);
  const coverProp = pickProperty(propertyMap, ['Cover']);

  const items = publications.map((publication) => ({
    key: publication.id,
    publication
  }));

  await upsertPages({
    token,
    dataSourceId,
    uniqueFieldName: idProp || titleProp,
    itemLabel: 'publications',
    items,
    buildProperties: ({ publication }) => {
      const properties = {};
      if (titleProp) {
        properties[titleProp] = titleValue(publication.title);
      }
      if (idProp) {
        properties[idProp] = richTextValue(publication.id);
      }
      if (yearProp) {
        properties[yearProp] = richTextValue(publication.year);
      }
      if (typeProp) {
        properties[typeProp] = selectValue(publication.type);
      }
      if (authorProp) {
        properties[authorProp] = richTextValue((publication.authors || []).join('; '));
      }
      if (journalProp) {
        properties[journalProp] = richTextValue(publication.journal || publication.venue || '');
      }
      if (volumeProp) {
        properties[volumeProp] = richTextValue(publication.volume || '');
      }
      if (issueProp) {
        properties[issueProp] = richTextValue(publication.issue || '');
      }
      if (pagesProp) {
        properties[pagesProp] = richTextValue(publication.pages || '');
      }
      if (doiProp) {
        const doi = normalizeDoi(publication.doi || '');
        const link = String(publication.link || publication.url || '').trim();
        const doiUrl = doi ? `https://doi.org/${doi}` : '';
        properties[doiProp] = urlValue(doiUrl || link);
      }
      if (coverProp) {
        const coverBase = String(publication.coverImage || '').trim();
        const coverUrl = coverBase ? `${siteBaseUrl}/assets/img/publications/covers/${coverBase}.jpg` : '';
        properties[coverProp] = filesExternalValue(coverUrl);
      }
      if (publishedProp) {
        properties[publishedProp] = checkboxValue(true);
      }
      return properties;
    }
  });
}

async function main() {
  await loadDotenv('.env.local');
  await loadDotenv('.env');

  const token = requireEnv('NOTION_TOKEN');
  const siteBaseUrl = normalizeSiteBaseUrl(process.env.SITE_BASE_URL);

  const teamDatabaseId = requireEnv('NOTION_TEAM_DB_ID');
  const publicationsDatabaseId = requireEnv('NOTION_PUBLICATIONS_DB_ID');

  const teamDataSourceId = await resolveDataSourceId({
    token,
    databaseId: teamDatabaseId,
    envDataSourceId: String(process.env.NOTION_TEAM_DATA_SOURCE_ID || '').trim()
  });
  const publicationsDataSourceId = await resolveDataSourceId({
    token,
    databaseId: publicationsDatabaseId,
    envDataSourceId: String(process.env.NOTION_PUBLICATIONS_DATA_SOURCE_ID || '').trim()
  });

  await pushTeam({
    token,
    dataSourceId: teamDataSourceId,
    siteBaseUrl
  });

  await pushPublications({
    token,
    dataSourceId: publicationsDataSourceId,
    siteBaseUrl
  });

  console.log('Notion Team/Publications databases updated from current website JSON.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
