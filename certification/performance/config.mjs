import dotenv from "dotenv";

dotenv.config();

export const config = {
  baseUrl: String(process.env.CERTIFICATION_BASE_URL || "https://bamsignal.com").replace(/\/$/, ""),
  distDir: String(process.env.CERTIFICATION_DIST_DIR || "dist").trim(),
  outputDir: String(process.env.CERTIFICATION_PERF_OUTPUT_DIR || "certification/performance/reports").trim(),
  headless: process.env.CERTIFICATION_HEADLESS !== "false",
  runId: `perf-${Date.now().toString(36)}`
};
