import { PERFORMANCE_CERT_THRESHOLDS, PERFORMANCE_CERT_API_ENDPOINTS } from "../../../shared/performanceCertificationThresholds.mjs";
import { perfCertFetch } from "./httpClient.mjs";

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(0, index)];
}

async function sampleEndpoint(baseUrl, endpoint, samples = 7) {
  const timings = [];

  for (let i = 0; i < samples; i += 1) {
    const started = performance.now();
    try {
      const response = await perfCertFetch(`${baseUrl}${endpoint.path}`, {
        method: endpoint.method,
        headers: { Accept: endpoint.method === "GET" ? "*/*" : undefined }
      });
      if (endpoint.method === "GET") {
        await response.text().catch(() => "");
      }
    } catch {
      timings.push(5000);
      continue;
    }
    timings.push(performance.now() - started);
  }

  const p95 = Math.round(percentile(timings, 95));
  return {
    path: endpoint.path,
    method: endpoint.method,
    p95,
    avg: Math.round(timings.reduce((a, b) => a + b, 0) / timings.length)
  };
}

export async function measureApiLatency(baseUrl, samples = 7) {
  try {
    await perfCertFetch(`${baseUrl}/health`, { method: "HEAD" });
  } catch {
    // warmup best-effort
  }

  const results = [];
  for (const endpoint of PERFORMANCE_CERT_API_ENDPOINTS) {
    results.push(await sampleEndpoint(baseUrl, endpoint, samples));
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

export async function measureDatabaseResponse(baseUrl, samples = 7) {
  const timings = [];

  for (let i = 0; i < samples; i += 1) {
    const started = performance.now();
    try {
      await perfCertFetch(`${baseUrl}/api/diagnostics/db-ping`, { method: "HEAD" });
    } catch {
      timings.push(5000);
      continue;
    }
    timings.push(performance.now() - started);
  }

  return {
    databaseResponseMs: Math.round(percentile(timings, 95)),
    ok: true
  };
}
