import { randomUUID } from "node:crypto";
import dotenv from "dotenv";

dotenv.config();

export const config = {
  baseUrl: String(process.env.SMOKE_BASE_URL || process.env.CERTIFICATION_BASE_URL || "https://bamsignal.com").replace(
    /\/$/,
    ""
  ),
  diagnosticsSecret: String(
    process.env.SMOKE_DIAGNOSTICS_SECRET ||
      process.env.DIAGNOSTICS_SECRET ||
      process.env.CRON_SECRET ||
      ""
  ).trim(),
  expectedCommitSha: String(
    process.env.SMOKE_COMMIT_SHA || process.env.GITHUB_SHA || ""
  ).trim(),
  runId: process.env.SMOKE_RUN_ID || `smoke-${randomUUID().slice(0, 8)}`,
  outputDir: "certification/production-smoke/reports"
};
