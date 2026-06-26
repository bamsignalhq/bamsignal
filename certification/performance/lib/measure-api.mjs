import { PERFORMANCE_CERT_API_ENDPOINTS } from "../../../shared/performanceCertificationThresholds.mjs";

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(0, index)];
}

export async function measureApiLatency(baseUrl, samples = 5) {
  const results = [];

  for (const endpoint of PERFORMANCE_CERT_API_ENDPOINTS) {
    const timings = [];
    for (let i = 0; i < samples; i += 1) {
      const started = performance.now();
      try {
        await fetch(`${baseUrl}${endpoint.path}`, { method: endpoint.method });
      } catch {
        // record timeout as high latency
        timings.push(5000);
        continue;
      }
      timings.push(performance.now() - started);
    }
    const p95 = Math.round(percentile(timings, 95));
    results.push({ path: endpoint.path, method: endpoint.method, p95, avg: Math.round(timings.reduce((a, b) => a + b, 0) / timings.length) });
  }

  const p95Values = results.map((item) => item.p95);
  const slowest = results.reduce((max, item) => (item.p95 > max.p95 ? item : max), results[0]);

  return {
    apiP95Ms: Math.round(percentile(p95Values, 95)),
    slowestEndpointMs: slowest?.p95 ?? 0,
    slowestEndpoint: slowest ? `${slowest.method} ${slowest.path}` : "—",
    profiles: results
  };
}

export async function measureDatabaseResponse(baseUrl) {
  const started = performance.now();
  try {
    const response = await fetch(`${baseUrl}/health`, { method: "HEAD" });
    return {
      databaseResponseMs: Math.round(performance.now() - started),
      ok: response.ok
    };
  } catch {
    return { databaseResponseMs: 5000, ok: false };
  }
}
