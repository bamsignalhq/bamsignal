async function waitForServer(baseUrl, timeoutMs = 45000) {
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

  throw lastError || new Error("performance cert server did not become ready");
}

/**
 * Resolve certification target — explicit URL or local production server on dist/.
 */
export async function resolvePerformanceCertTarget(config) {
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
    throw new Error("PERF_CERT_BASE_URL is required when PERF_CERT_START_LOCAL=false");
  }

  process.env.PORT = String(config.port);
  process.env.HOST = process.env.HOST || "127.0.0.1";
  await import("../../../server/production.js");
  await waitForServer(baseUrl);
  return { baseUrl, local: true, reused: false };
}
