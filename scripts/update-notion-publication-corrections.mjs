import fs from 'node:fs/promises';

// Explicitly invoked by workflow_dispatch; daily sync remains read-only in Notion.
const token = process.env.NOTION_TOKEN;
const source = process.env.NOTION_PUBLICATIONS_DATA_SOURCE_ID;
if (!token || !source) throw new Error('Missing Notion configuration');
const corrections = JSON.parse(await fs.readFile('content/publication-corrections.json', 'utf8'));
const publications = JSON.parse(await fs.readFile('public/data/publications.json', 'utf8'));
async function request(endpoint, method = 'GET', body) {
  const response = await fetch(`https://api.notion.com/v1/${endpoint}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Notion-Version': '2025-09-03', 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  if (!response.ok) throw new Error(`Notion ${method} ${endpoint}: HTTP ${response.status}`);
  return response.json();
}
const schema = await request(`data_sources/${source}`);
const text = (p) => (p?.[p.type] || []).map((t) => t.plain_text ?? t.text?.content ?? '').join('');
const pages = [];
let cursor;
do {
  const result = await request(`data_sources/${source}/query`, 'POST', { page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) });
  pages.push(...result.results);
  cursor = result.has_more ? result.next_cursor : null;
} while (cursor);
const fields = { year: 'Year', journal: 'Journal', volume: 'Volume', issue: 'Issue', pages: 'Pages', link: 'DOI' };
const plans = Object.entries(corrections).map(([id, correction]) => {
  const publication = publications.find((p) => p.id === id);
  if (!publication) throw new Error(`Unknown publication: ${id}`);
  const matches = pages.filter((p) => text(p.properties.ID) === id || text(p.properties.Title) === publication.title);
  if (matches.length !== 1) throw new Error(`Expected one Notion page for ${id}, found ${matches.length}`);
  const properties = {};
  for (const [key, name] of Object.entries(fields)) {
    if (!(key in correction)) continue;
    const type = schema.properties[name]?.type;
    const value = correction[key];
    if (type === 'rich_text') properties[name] = { rich_text: value === '' ? [] : [{ text: { content: String(value) } }] };
    else if (type === 'number') properties[name] = { number: Number(value) };
    else if (type === 'url') properties[name] = { url: value || null };
    else throw new Error(`Unsupported ${name} type: ${type}`);
  }
  return { id, page: matches[0], properties, correction };
});
for (const plan of plans) {
  console.log(`Updating ${plan.id}: ${plan.page.url}`);
  await request(`pages/${plan.page.id}`, 'PATCH', { properties: plan.properties });
  const saved = await request(`pages/${plan.page.id}`);
  for (const [key, name] of Object.entries(fields)) {
    if (!(key in plan.correction)) continue;
    const p = saved.properties[name];
    const value = p.type === 'rich_text' ? text(p) : p[p.type];
    if (String(value ?? '') !== String(plan.correction[key])) throw new Error(`Verification failed: ${name}`);
  }
  console.log(`Verified Notion publication metadata: ${plan.id}`);
}
