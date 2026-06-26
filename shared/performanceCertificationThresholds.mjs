/** Performance Certification™ — release gate thresholds (shared CLI + admin). */

export const PERFORMANCE_CERT_THRESHOLDS = {
  warmStartupMs: 2000,
  coldStartupMs: 2000,
  lcpMs: 2500,
  cls: 0.1,
  fidMs: 100,
  ttfbMs: 800,
  apiP95Ms: 500,
  bundleGrowthPercent: 10,
  memoryLeakGrowthPercent: 15
};

export const PERFORMANCE_CERT_API_ENDPOINTS = [
  { path: "/health", method: "HEAD" },
  { path: "/ready", method: "HEAD" },
  { path: "/", method: "GET" },
  { path: "/api/feature-flags", method: "GET" },
  { path: "/api/remote-config", method: "GET" }
];
