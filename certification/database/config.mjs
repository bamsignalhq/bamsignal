import { randomUUID } from "node:crypto";

export const config = {
  runId: process.env.DATABASE_PERF_CERT_RUN_ID || `db-${randomUUID().slice(0, 8)}`,
  outputDir: "certification/database/reports"
};
