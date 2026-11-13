import { setTimeout as delay } from 'node:timers/promises';

export async function waitForChrome(url, child, {
  timeoutMs = 60000,
  pollMs = 250,
  requestTimeoutMs = 2000,
  diagnostics = () => ''
} = {}) {
  let launchError;
  const onError = (error) => { launchError = error; };
  child.on('error', onError);
  const deadline = Date.now() + timeoutMs;
  try {
    while (Date.now() < deadline) {
      if (launchError) throw new Error(`Could not start Chrome: ${launchError.message}`);
      if (child.exitCode !== null || child.signalCode) {
        throw new Error(`Chrome exited before prerendering (code ${child.exitCode}, signal ${child.signalCode || 'none'}). ${diagnostics()}`);
      }
      try {
        const response = await fetch(url, {
          signal: AbortSignal.timeout(Math.max(1, Math.min(requestTimeoutMs, deadline - Date.now())))
        });
        const data = response.ok ? await response.json() : null;
        if (data?.webSocketDebuggerUrl) return;
      } catch {
        // Retry connection errors and incomplete startup responses within the deadline.
      }
      await delay(Math.min(pollMs, Math.max(0, deadline - Date.now())));
    }
    throw new Error(`Timed out after ${timeoutMs} ms while waiting for headless Chrome. ${diagnostics()}`);
  } finally {
    child.removeListener('error', onError);
  }
}
