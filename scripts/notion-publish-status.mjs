import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const STATUS_PAGE_ID = '420f3566-2a74-814c-8918-dce8210364f2';
const DATA_SOURCE_ID = '420f3566-2a74-812c-a474-000b9d15b3f6';
const date = (page, name) => page.properties[name]?.date?.start || null;
const text = (page, name) => (page.properties[name]?.rich_text || []).map(x => x.plain_text ?? x.text?.content ?? '').join('');
const richText = value => ({ rich_text: [{ type: 'text', text: { content: value } }] });

export function hasPendingRequest(page) {
  const requested = date(page, '요청 시간');
  const claimed = date(page, '처리 요청 시간');
  return Boolean(requested && (!claimed || Date.parse(requested) > Date.parse(claimed)));
}

export function claimProperties(page, runId, runUrl) {
  return {
    '진행 단계': { select: { name: '동기화 중' } },
    '처리 요청 시간': { date: date(page, '요청 시간') ? { start: date(page, '요청 시간') } : null },
    '실행 ID': richText(runId),
    '실행 기록': { url: runUrl }
  };
}

export function statusProperties(page, runId, stage, now, sha) {
  // A late completion must never overwrite a newer request's active run.
  if (text(page, '실행 ID') !== runId) return null;
  const properties = { '진행 단계': { select: { name: stage } } };
  if (stage === '완료') {
    properties['마지막 반영 시간'] = { date: { start: now } };
    properties['반영 커밋'] = richText(sha);
  }
  return properties;
}

export function deploymentProperties(page, runId, now, sha) {
  // Every Pages deployment updates the actual last success time. An unrelated
  // deployment must leave the current Notion request's stage and identity alone.
  return {
    ...(statusProperties(page, runId, '완료', now, sha) || {}),
    '마지막 반영 시간': { date: { start: now } },
    '반영 커밋': richText(sha)
  };
}

async function request(method, body) {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error('NOTION_TOKEN is required.');
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(`https://api.notion.com/v1/pages/${STATUS_PAGE_ID}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, 'Notion-Version': '2025-09-03', 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(30000)
    });
    if (response.ok) return response.json();
    if ((response.status === 429 || response.status >= 500) && attempt < 3) {
      await new Promise(resolve => setTimeout(resolve, Math.min(30, Number(response.headers.get('retry-after')) || 2 ** attempt) * 1000));
      continue;
    }
    throw new Error(`Notion status request failed: HTTP ${response.status}`);
  }
}

function output(name, value) {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
  console.log(`${name}=${value}`);
}

export async function main(command) {
  const page = await request('GET');
  if (page.archived || page.in_trash || page.parent?.data_source_id !== DATA_SOURCE_ID) {
    throw new Error('The publish status page is not in the expected active database.');
  }
  const runId = process.env.GITHUB_RUN_ID;
  if (!runId) throw new Error('GITHUB_RUN_ID is required.');
  if (command === 'claim') {
    const shouldRun = process.env.FORCE_SYNC === 'true' || hasPendingRequest(page);
    const dryRun = process.env.DRY_RUN === 'true';
    if (shouldRun && !dryRun) {
      await request('PATCH', { properties: claimProperties(page, runId, `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${runId}`) });
    }
    output('should_run', shouldRun);
    output('claimed', shouldRun && !dryRun);
    return;
  }
  const stages = { waiting: '배포 대기', deploying: '배포 중', success: '완료', failure: '실패' };
  if (!stages[command]) throw new Error(`Unknown status command: ${command}`);
  const now = new Date().toISOString();
  const properties = command === 'success'
    ? deploymentProperties(page, runId, now, process.env.DEPLOYED_SHA || '')
    : statusProperties(page, runId, stages[command], now, '');
  if (properties) await request('PATCH', { properties });
  else console.log('Status belongs to a different run; leaving it unchanged.');
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  main(process.argv[2]).catch(error => { console.error(error.message); process.exitCode = 1; });
}
