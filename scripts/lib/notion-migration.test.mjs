import assert from 'node:assert/strict';
import test from 'node:test';
import { stableNewsPageId } from './notion-news-page-ids.mjs';
import { findOrCreateDashboard } from '../sync-analytics-to-notion.mjs';

test('copied news keeps the original public identity, including dashed IDs', () => {
  assert.equal(stableNewsPageId('9bdf3566-2a74-82bc-829b-01d446968c5c'), '4176760c5a6580bd8b14ef146a0bc6cb');
  assert.equal(stableNewsPageId('9bdf35662a7482bc829b01d446968c5c'), '4176760c5a6580bd8b14ef146a0bc6cb');
});

test('original and future news page identities remain unchanged', () => {
  assert.equal(stableNewsPageId('4176760c5a6580bd8b14ef146a0bc6cb'), '4176760c5a6580bd8b14ef146a0bc6cb');
  assert.equal(stableNewsPageId('ffffffff-ffff-ffff-ffff-ffffffffffff'), 'ffffffffffffffffffffffffffffffff');
});

test('analytics updates only the configured dashboard inside the CMS', async (t) => {
  const calls = [];
  const dashboard = { id: 'dashboard', parent: { page_id: 'cms' }, archived: false };
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, method: options.method });
    return Response.json(url.endsWith('/databases/news') ? { parent: { page_id: 'cms' } } : dashboard);
  });
  const result = await findOrCreateDashboard({ token: 'test', parentDatabaseId: 'news', dashboardPageId: 'dashboard' });
  assert.equal(result.id, 'dashboard');
  assert.deepEqual(calls.map(c => c.method), ['GET', 'GET']);
  assert.ok(calls[1].url.endsWith('/pages/dashboard'));
});

for (const invalid of [
  { parent: { page_id: 'other-cms' } },
  { parent: { page_id: 'cms' }, archived: true },
  { parent: { page_id: 'cms' }, in_trash: true }
]) {
  test(`analytics rejects invalid target ${JSON.stringify(invalid)}`, async (t) => {
    t.mock.method(globalThis, 'fetch', async url => Response.json(
      url.endsWith('/databases/news') ? { parent: { page_id: 'cms' } } : invalid
    ));
    await assert.rejects(
      findOrCreateDashboard({ token: 'test', parentDatabaseId: 'news', dashboardPageId: 'dashboard' }),
      /active child of the Website CMS page/
    );
  });
}
