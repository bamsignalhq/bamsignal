/** Performance Certification™ — runner configuration (shared CLI + tests). */

export const PERFORMANCE_CERT_DEFAULT_PORT = 3099;

export function resolvePerformanceCertConfig(env = process.env) {
  const explicitBaseUrl = String(env.PERF_CERT_BASE_URL || env.CERTIFICATION_BASE_URL || "").trim().replace(/\/$/, "");
  const startLocalServer = env.PERF_CERT_START_LOCAL !== "false";
  const port = Number.parseInt(String(env.PERF_CERT_PORT || PERFORMANCE_CERT_DEFAULT_PORT), 10);

  return {
    baseUrl: explicitBaseUrl || null,
    port: Number.isFinite(port) ? port : PERFORMANCE_CERT_DEFAULT_PORT,
    startLocalServer,
    headless: env.CERTIFICATION_HEADLESS !== "false",
    distDir: String(env.CERTIFICATION_DIST_DIR || "dist").trim(),
    outputDir: String(env.CERTIFICATION_PERF_OUTPUT_DIR || "certification/performance/reports").trim(),
    runId: env.PERF_CERT_RUN_ID || `perf-${Date.now().toString(36)}`
  };
}
