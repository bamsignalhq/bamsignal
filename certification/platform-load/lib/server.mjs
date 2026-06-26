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
  throw lastError || new Error("load cert server did not become ready");
}

/**
 * Resolve target base URL — explicit env, or boot local production server.
 */
export async function resolveLoadCertTarget(config) {
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
    // boot local server below
  }

  if (!config.startLocalServer) {
    throw new Error("LOAD_CERT_BASE_URL is required when LOAD_CERT_START_LOCAL=false");
  }

  const port = config.port;
  process.env.PORT = String(port);
  await import("../../../server/production.js");
  await waitForServer(baseUrl);
  return { baseUrl, local: true, reused: false };
}
