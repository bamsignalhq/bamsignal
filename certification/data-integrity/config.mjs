import { randomUUID } from "node:crypto";

export const config = {
  runId: process.env.DATA_INTEGRITY_CERT_RUN_ID || `di-${randomUUID().slice(0, 8)}`,
  outputDir: "certification/data-integrity/reports"
};
