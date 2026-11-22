import test from 'node:test';
import assert from 'node:assert/strict';
import { claimProperties, deploymentProperties, hasPendingRequest, statusProperties } from '../notion-publish-status.mjs';

const page = (requested, claimed, run = '123') => ({ properties: {
  '요청 시간': { date: requested ? { start: requested } : null },
  '처리 요청 시간': { date: claimed ? { start: claimed } : null },
  '실행 ID': { rich_text: [{ plain_text: run }] }
} });
const before = '2026-11-22T05:00:00.000Z';
const after = '2026-11-22T05:01:00.000Z';

test('only an unclaimed button request starts a polling run', () => {
  assert.equal(hasPendingRequest(page(null, null)), false);
  assert.equal(hasPendingRequest(page(before, null)), true);
  assert.equal(hasPendingRequest(page(before, before)), false);
  assert.equal(hasPendingRequest(page(after, before)), true);
});
test('claim captures the observed request without overwriting subsequent button clicks', () => {
  const properties = claimProperties(page(before, null), '123', 'https://example.com/run');
  assert.equal(properties['처리 요청 시간'].date.start, before);
  assert.equal('요청 시간' in properties, false);
  assert.equal('마지막 반영 시간' in properties, false);
});
test('failure preserves the last successful deployment time and pending clicks', () => {
  const properties = statusProperties(page(after, before), '123', '실패', after, 'abc');
  assert.deepEqual(Object.keys(properties), ['진행 단계']);
  assert.equal(hasPendingRequest(page(after, before)), true);
});
test('only the owning successful deployment updates completion time', () => {
  assert.equal(statusProperties(page(before, before, 'new'), 'old', '완료', after, 'abc'), null);
  const properties = statusProperties(page(before, before), '123', '완료', after, 'abc');
  assert.equal(properties['마지막 반영 시간'].date.start, after);
  assert.equal(properties['반영 커밋'].rich_text[0].text.content, 'abc');
  assert.equal('요청 시간' in properties, false);
});
test('unrelated successful deployment updates actual success time without completing a pending request', () => {
  const properties = deploymentProperties(page(after, before, 'current-sync'), 'other-deploy', after, 'abc');
  assert.equal(properties['마지막 반영 시간'].date.start, after);
  assert.equal('진행 단계' in properties, false);
  assert.equal('실행 ID' in properties, false);
  assert.equal('요청 시간' in properties, false);
});
