/** Performance Certification™ — release gate thresholds (shared CLI + admin). */

export const PERFORMANCE_CERT_THRESHOLDS = {
  warmStartupMs: 300,
  coldStartupMs: 1200,
  lcpMs: 1800,
  cls: 0.1,
  fidMs: 100,
  ttfbMs: 300,
  apiP95Ms: 250,
  databaseResponseMs: 150,
  bundleGrowthPercent: 10,
  memoryLeakGrowthPercent: 15
};

/** Lightweight public endpoints — excludes readiness probes that hit the database. */
export const PERFORMANCE_CERT_API_ENDPOINTS = [
  { path: "/health", method: "HEAD" },
  { path: "/", method: "GET" },
  { path: "/api/feature-flags", method: "GET" },
  { path: "/api/remote-config", method: "GET" }
];
