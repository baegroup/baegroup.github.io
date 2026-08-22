import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const NOTION_API_VERSION = '2025-09-03';
const PUBLICATIONS_PATH = path.join(ROOT, 'public', 'data', 'publications.json');

async function loadDotenv(fileName) {
  let source = '';
  try {
    source = await fs.readFile(path.join(ROOT, fileName), 'utf8');
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
      if (index < 1) return;
      const key = line.slice(0, index).trim();
      if (!key || process.env[key]) return;
      const raw = line.slice(index + 1).trim();
      process.env[key] =
        (raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))
          ? raw.slice(1, -1)
          : raw;
    });
}

function requireEnv(name) {
  const value = String(process.env[name] || '').trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function notionRequest({ token, endpoint, method = 'GET', body }) {
  const response = await fetch(`https://api.notion.com/v1${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': NOTION_API_VERSION,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(`Notion API error (${response.status} ${endpoint}): ${data.message || text}`);
  }
  return data;
}

function titleValue(value) {
  return { title: [{ type: 'text', text: { content: String(value || '') } }] };
}

function richTextValue(value) {
  const content = String(value || '').trim();
  return { rich_text: content ? [{ type: 'text', text: { content } }] : [] };
}

function selectValue(value) {
  const name = String(value || '').trim();
  return { select: name ? { name } : null };
}

function urlValue(value) {
  return { url: String(value || '').trim() || null };
}

function checkboxValue(value) {
  return { checkbox: Boolean(value) };
}

function textFromProperty(property) {
  if (!property) return '';
  if (property.type === 'title') return (property.title || []).map((item) => item.plain_text || '').join('').trim();
  if (property.type === 'rich_text') return (property.rich_text || []).map((item) => item.plain_text || '').join('').trim();
  if (property.type === 'select') return String(property.select?.name || '').trim();
  return '';
}

function findProperty(properties, names) {
  const wanted = new Set(names.map((name) => name.toLowerCase()));
  return Object.entries(properties || {}).find(([name]) => wanted.has(name.toLowerCase()))?.[1] || null;
}

async function retrieveDatabase(token, databaseId) {
  return notionRequest({ token, endpoint: `/databases/${databaseId}` });
}

async function renameDatabase({ token, databaseId, dataSourceId, title }) {
  await notionRequest({
    token,
    endpoint: `/databases/${databaseId}`,
    method: 'PATCH',
    body: { title: [{ type: 'text', text: { content: title } }] }
  });
  await notionRequest({
    token,
    endpoint: `/data_sources/${dataSourceId}`,
    method: 'PATCH',
    body: { title: [{ type: 'text', text: { content: title } }] }
  });
}

async function findDatabaseByTitle({ token, parentPageId, title }) {
  const result = await notionRequest({
    token,
    endpoint: '/search',
    method: 'POST',
    body: {
      query: title,
      filter: { property: 'object', value: 'data_source' },
      page_size: 100
    }
  });

  for (const source of result.results || []) {
    const sourceTitle = (source.title || []).map((item) => item.plain_text || '').join('').trim();
    const databaseId = String(source.parent?.database_id || '').trim();
    if (sourceTitle !== title || !databaseId) continue;
    const database = await retrieveDatabase(token, databaseId);
    if (database.parent?.page_id === parentPageId) {
      return { database, dataSourceId: source.id };
    }
  }
  return null;
}

async function ensureDatabase({ token, parentPageId, title, description, properties, envDatabaseId, envDataSourceId }) {
  const configuredDatabaseId = String(process.env[envDatabaseId] || '').trim();
  if (configuredDatabaseId) {
    const database = await retrieveDatabase(token, configuredDatabaseId);
    const dataSourceId = String(process.env[envDataSourceId] || database.data_sources?.[0]?.id || '').trim();
    return { database, dataSourceId };
  }

  const existing = await findDatabaseByTitle({ token, parentPageId, title });
  if (existing) return existing;

  const database = await notionRequest({
    token,
    endpoint: '/databases',
    method: 'POST',
    body: {
      parent: { type: 'page_id', page_id: parentPageId },
      title: [{ type: 'text', text: { content: title } }],
      description: [{ type: 'text', text: { content: description } }],
      is_inline: false,
      initial_data_source: { properties }
    }
  });

  return { database, dataSourceId: String(database.data_sources?.[0]?.id || '').trim() };
}

async function queryDataSource({ token, dataSourceId }) {
  const pages = [];
  let cursor = '';
  while (true) {
    const body = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    const result = await notionRequest({
      token,
      endpoint: `/data_sources/${dataSourceId}/query`,
      method: 'POST',
      body
    });
    pages.push(...(result.results || []));
    if (!result.has_more || !result.next_cursor) break;
    cursor = result.next_cursor;
  }
  return pages;
}

async function migratePatents({ token, papersDataSourceId, patentsDataSourceId }) {
  const publications = JSON.parse(await fs.readFile(PUBLICATIONS_PATH, 'utf8'));
  const patents = publications.filter((item) => item.type === 'patent');
  const existingPatentPages = await queryDataSource({ token, dataSourceId: patentsDataSourceId });
  const existingById = new Map(
    existingPatentPages.map((page) => [textFromProperty(findProperty(page.properties, ['ID'])), page])
  );

  for (const patent of patents) {
    const jurisdiction = /europe/i.test(patent.journal || '')
      ? 'European Patent Office'
      : /us|united states/i.test(patent.journal || '')
        ? 'United States'
        : patent.journal || '';
    const rawRecord = String(patent.volume || '').replace(/^Application number\s*/i, '').trim();
    const stage = /B\d$/i.test(rawRecord) ? 'Granted' : 'Application';
    const properties = {
      Published: checkboxValue(true),
      Title: titleValue(patent.title),
      ID: richTextValue(patent.id),
      Year: { number: Number(patent.year) || null },
      Jurisdiction: selectValue(jurisdiction),
      Stage: selectValue(stage),
      'Legal Status': selectValue(''),
      'Application Number': richTextValue(stage === 'Application' ? rawRecord : ''),
      'Grant/Publication Number': richTextValue(stage === 'Granted' ? rawRecord : ''),
      Inventors: richTextValue((patent.authors || []).join('; ')),
      'Filing Date': { date: null },
      URL: urlValue(patent.link || '')
    };

    const existing = existingById.get(patent.id);
    if (existing) {
      await notionRequest({ token, endpoint: `/pages/${existing.id}`, method: 'PATCH', body: { properties } });
    } else {
      await notionRequest({
        token,
        endpoint: '/pages',
        method: 'POST',
        body: { parent: { type: 'data_source_id', data_source_id: patentsDataSourceId }, properties }
      });
    }
  }

  const paperPages = await queryDataSource({ token, dataSourceId: papersDataSourceId });
  for (const page of paperPages) {
    const type = textFromProperty(findProperty(page.properties, ['Type', 'Category'])).toLowerCase();
    if (type.includes('patent')) {
      await notionRequest({
        token,
        endpoint: `/pages/${page.id}`,
        method: 'PATCH',
        body: { in_trash: true }
      });
    }
  }

  return patents.length;
}

async function main() {
  await loadDotenv('.env.local');
  await loadDotenv('.env');

  const token = requireEnv('NOTION_TOKEN');
  const papersDatabaseId = requireEnv('NOTION_PUBLICATIONS_DB_ID');
  const papersDatabase = await retrieveDatabase(token, papersDatabaseId);
  const papersDataSourceId = String(
    process.env.NOTION_PUBLICATIONS_DATA_SOURCE_ID || papersDatabase.data_sources?.[0]?.id || ''
  ).trim();
  const parentPageId = String(papersDatabase.parent?.page_id || '').trim();
  if (!papersDataSourceId || !parentPageId) {
    throw new Error('Could not resolve the Papers data source or parent page.');
  }

  await renameDatabase({ token, databaseId: papersDatabaseId, dataSourceId: papersDataSourceId, title: 'Papers' });

  const patents = await ensureDatabase({
    token,
    parentPageId,
    title: 'Patents',
    description: 'Patent applications and registrations shown on the Bae Lab website.',
    envDatabaseId: 'NOTION_PATENTS_DB_ID',
    envDataSourceId: 'NOTION_PATENTS_DATA_SOURCE_ID',
    properties: {
      Title: { title: {} },
      Published: { checkbox: {} },
      ID: { rich_text: {} },
      Year: { number: {} },
      Jurisdiction: { select: {} },
      Stage: { select: { options: [{ name: 'Application', color: 'yellow' }, { name: 'Granted', color: 'green' }] } },
      'Legal Status': {
        select: {
          options: [
            { name: 'Pending', color: 'yellow' },
            { name: 'Active', color: 'green' },
            { name: 'Abandoned', color: 'red' },
            { name: 'Expired', color: 'gray' }
          ]
        }
      },
      'Application Number': { rich_text: {} },
      'Grant/Publication Number': { rich_text: {} },
      Inventors: { rich_text: {} },
      'Filing Date': { date: {} },
      URL: { url: {} }
    }
  });

  const presentations = await ensureDatabase({
    token,
    parentPageId,
    title: 'Conference Presentations',
    description: 'Poster, oral, and invited conference presentations by Bae Lab members.',
    envDatabaseId: 'NOTION_PRESENTATIONS_DB_ID',
    envDataSourceId: 'NOTION_PRESENTATIONS_DATA_SOURCE_ID',
    properties: {
      Title: { title: {} },
      Published: { checkbox: {} },
      ID: { rich_text: {} },
      Conference: { rich_text: {} },
      Date: { date: {} },
      'Presentation Type': {
        select: {
          options: [
            { name: 'Poster', color: 'blue' },
            { name: 'Oral', color: 'green' },
            { name: 'Invited Talk', color: 'purple' }
          ]
        }
      },
      Presenters: { multi_select: {} },
      Authors: { rich_text: {} },
      'Corresponding Authors': { multi_select: {} },
      City: { rich_text: {} },
      Country: { select: {} },
      Award: { rich_text: {} },
      Note: { rich_text: {} }
    }
  });

  const migratedCount = await migratePatents({
    token,
    papersDataSourceId,
    patentsDataSourceId: patents.dataSourceId
  });

  console.log(`Papers database: ${papersDatabaseId}`);
  console.log(`Papers data source: ${papersDataSourceId}`);
  console.log(`Patents database: ${patents.database.id}`);
  console.log(`Patents data source: ${patents.dataSourceId}`);
  console.log(`Conference Presentations database: ${presentations.database.id}`);
  console.log(`Conference Presentations data source: ${presentations.dataSourceId}`);
  console.log(`Migrated patent records: ${migratedCount}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
