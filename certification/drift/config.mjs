import { randomUUID } from "node:crypto";

export const config = {
  runId: process.env.DRIFT_CERT_RUN_ID || `drf-${randomUUID().slice(0, 8)}`,
  outputDir: "certification/drift/reports"
};
