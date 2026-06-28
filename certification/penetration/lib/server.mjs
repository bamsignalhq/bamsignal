async function waitForServer(baseUrl, timeoutMs = 30000) {
  const started = Date.now();
  let lastError;
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(`${baseUrl}/health`, { method: "HEAD" });
      if (response.ok) return;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw lastError || new Error("penetration cert server did not become ready");
}

export async function resolvePenetrationTarget(config) {
  if (config.baseUrl) {
    return { baseUrl: config.baseUrl, local: false };
  }

  const baseUrl = `http://127.0.0.1:${config.port}`;

  try {
    const response = await fetch(`${baseUrl}/health`, { method: "HEAD" });
    if (response.ok) {
      return { baseUrl, local: true, reused: true };
    }
  } catch {
    // boot below
  }

  if (!config.startLocalServer) {
    throw new Error("PENTEST_BASE_URL is required when PENTEST_START_LOCAL=false");
  }

  process.env.PORT = String(config.port);
  const { startProductionServer } = await import("../../../shared/startProductionServer.mjs");
  await startProductionServer();
  await waitForServer(baseUrl);
  return { baseUrl, local: true, reused: false };
}
