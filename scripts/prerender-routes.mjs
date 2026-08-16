import { spawn, spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, 'dist');
const HOST = '127.0.0.1';
const PORT = await findAvailablePort();
const BASE_URL = `http://${HOST}:${PORT}`;
const CHROME_TIMEOUT_MS = 10000;
const META_START = '<!-- route-meta:start -->';
const META_END = '<!-- route-meta:end -->';
const META_PATTERN = new RegExp(`${META_START}[\\s\\S]*?${META_END}`);

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    'google-chrome',
    'google-chrome-stable',
    'chromium',
    'chromium-browser'
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate.includes('/')) {
      const result = spawnSync('test', ['-x', candidate]);
      if (result.status === 0) return candidate;
      continue;
    }
    const result = spawnSync('which', [candidate], { encoding: 'utf8' });
    if (result.status === 0 && result.stdout.trim()) return result.stdout.trim();
  }

  throw new Error('Chrome or Chromium was not found. Set CHROME_PATH to enable static prerendering.');
}

async function waitForServer(preview) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (preview.exitCode !== null) {
      throw new Error(`Vite preview exited before prerendering (code ${preview.exitCode}).`);
    }
    try {
      const response = await fetch(BASE_URL);
      if (response.ok) {
        await new Promise((resolve) => setTimeout(resolve, 75));
        if (preview.exitCode !== null) {
          throw new Error(`Vite preview exited before prerendering (code ${preview.exitCode}).`);
        }
        return;
      }
    } catch {
      // The preview server may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('Timed out while waiting for the Vite preview server.');
}

function routeOutputPath(route) {
  return route === '/'
    ? path.join(DIST_DIR, 'index.html')
    : path.join(DIST_DIR, route.replace(/^\//, ''), 'index.html');
}

function assertRendered(route, html) {
  if (!html.includes('<div id="root">') || /<div id="root"><\/div>/.test(html)) {
    throw new Error(`Prerendered HTML is empty for ${route}`);
  }
  const pendingLabels = ['Loading news feed...', 'Loading publications...', 'Loading team profiles...'];
  const pending = pendingLabels.find((label) => html.includes(label));
  if (pending) {
    throw new Error(`Prerendered HTML is still loading for ${route}: ${pending}`);
  }
}

function findAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, HOST, () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      server.close(() => resolve(port));
    });
  });
}

async function waitForChrome(debugPort, chromeProcess) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (chromeProcess.exitCode !== null) {
      throw new Error(`Chrome exited before prerendering (code ${chromeProcess.exitCode}).`);
    }
    try {
      const response = await fetch(`http://${HOST}:${debugPort}/json/version`);
      if (response.ok) return;
    } catch {
      // Chrome may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('Timed out while waiting for headless Chrome.');
}

async function renderRoute(debugPort, route) {
  const separator = route.includes('?') ? '&' : '?';
  const url = `${BASE_URL}${route}${separator}prerender=1`;
  const tabResponse = await fetch(`http://${HOST}:${debugPort}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
  if (!tabResponse.ok) {
    throw new Error(`Chrome could not open ${route}: ${tabResponse.status}`);
  }

  const tab = await tabResponse.json();
  const socket = new WebSocket(tab.webSocketDebuggerUrl);
  let messageId = 0;
  const pending = new Map();

  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  });

  function command(method, params = {}) {
    messageId += 1;
    const id = messageId;
    socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
  }

  try {
    await command('Runtime.enable');
    const deadline = Date.now() + CHROME_TIMEOUT_MS;
    let html = '';
    while (Date.now() < deadline) {
      const result = await command('Runtime.evaluate', {
        expression: `(() => {
          const root = document.getElementById('root');
          return {
            html: document.documentElement.outerHTML,
            ready: document.readyState === 'complete'
              && Boolean(root?.firstElementChild)
              && !document.querySelector('[data-prerender-pending="true"]')
              && !document.body.innerText.includes('Loading news feed...')
              && !document.body.innerText.includes('Loading publications...')
              && !document.body.innerText.includes('Loading team profiles...')
          };
        })()`,
        returnByValue: true
      });
      html = result.result?.value?.html || '';
      if (result.result?.value?.ready) return html;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error(`Timed out while rendering ${route}`);
  } finally {
    socket.close();
    await fetch(`http://${HOST}:${debugPort}/json/close/${tab.id}`).catch(() => {});
  }
}

const chrome = findChrome();
const routes = JSON.parse(await readFile(path.join(DIST_DIR, 'seo-routes.json'), 'utf8'));
const viteBin = path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js');
const preview = spawn(process.execPath, [viteBin, 'preview', '--host', HOST, '--port', String(PORT), '--strictPort'], {
  cwd: ROOT,
  stdio: ['ignore', 'pipe', 'pipe']
});
const chromeProfile = await mkdtemp(path.join(os.tmpdir(), 'baelab-prerender-'));
const debugPort = await findAvailablePort();
const chromeProcess = spawn(chrome, [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--disable-dev-shm-usage',
  '--hide-scrollbars',
  '--disable-background-networking',
  '--disable-component-update',
  '--no-first-run',
  '--no-default-browser-check',
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${chromeProfile}`,
  'about:blank'
], { stdio: 'ignore' });

let previewError = '';
preview.stderr.on('data', (chunk) => {
  previewError += chunk.toString();
});

try {
  await waitForServer(preview);
  await waitForChrome(debugPort, chromeProcess);

  for (const [routeIndex, route] of routes.entries()) {
    const outputPath = routeOutputPath(route);
    const routeTemplate = await readFile(outputPath, 'utf8');
    const routeMetadata = routeTemplate.match(META_PATTERN)?.[0];
    let html = (await renderRoute(debugPort, route)).trim();
    if (!routeMetadata || !META_PATTERN.test(html)) {
      throw new Error(`Route metadata could not be preserved for ${route}`);
    }
    html = html.replace(META_PATTERN, routeMetadata);
    assertRendered(route, html);
    await writeFile(outputPath, `${html}\n`, 'utf8');
    if ((routeIndex + 1) % 10 === 0 || routeIndex === routes.length - 1) {
      console.log(`Prerender progress: ${routeIndex + 1}/${routes.length}`);
    }
  }

  const homeHtml = await readFile(path.join(DIST_DIR, 'index.html'), 'utf8');
  const notFoundHtml = homeHtml
    .replace(/<title>[\s\S]*?<\/title>/, '<title>Page Not Found | Bae Lab</title>')
    .replace('<meta name="description"', '<meta name="robots" content="noindex, follow"><meta name="description"');
  await writeFile(path.join(DIST_DIR, '404.html'), notFoundHtml, 'utf8');

  console.log(`Prerendered ${routes.length} routes with ${path.basename(chrome)}`);
} finally {
  preview.kill('SIGTERM');
  chromeProcess.kill('SIGTERM');
  await new Promise((resolve) => setTimeout(resolve, 250));
  await rm(chromeProfile, { recursive: true, force: true, maxRetries: 3, retryDelay: 150 }).catch(() => {});
}

if (previewError && preview.exitCode && preview.exitCode !== 0) {
  console.error(previewError);
}
