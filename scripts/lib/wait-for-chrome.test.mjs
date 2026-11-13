import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { waitForChrome } from './wait-for-chrome.mjs';
const child = () => Object.assign(new EventEmitter(), { exitCode: null, signalCode: null });

test('waits through connection failures and incomplete responses', async (t) => {
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async () => {
    calls++;
    if (calls === 1) throw new Error('connection refused');
    return { ok: true, json: async () => calls === 2 ? {} : { webSocketDebuggerUrl: 'ws://ready' } };
  });
  await waitForChrome('http://localhost/json/version', child(), { timeoutMs: 500, pollMs: 1 });
  assert.equal(calls, 3);
});

test('bounds stalled requests and includes Chrome diagnostics', async (t) => {
  t.mock.method(globalThis, 'fetch', (_, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(signal.reason), { once: true });
  }));
  const keepAlive = setInterval(() => {}, 10);
  try {
    await assert.rejects(waitForChrome('http://localhost', child(), {
      timeoutMs: 40, requestTimeoutMs: 5, pollMs: 1, diagnostics: () => 'startup stderr'
    }), /Timed out after 40 ms.*startup stderr/);
  } finally { clearInterval(keepAlive); }
});

test('reports a Chrome exit immediately', async () => {
  const process = child(); process.exitCode = 1;
  await assert.rejects(waitForChrome('http://localhost', process, { diagnostics: () => 'launch failed' }), /code 1.*launch failed/);
});

test('handles spawn errors without waiting for the timeout', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('not ready'); });
  const process = child();
  const ready = waitForChrome('http://localhost', process, { timeoutMs: 500, pollMs: 1 });
  process.emit('error', new Error('ENOENT'));
  await assert.rejects(ready, /Could not start Chrome: ENOENT/);
  assert.equal(process.listenerCount('error'), 0);
});
