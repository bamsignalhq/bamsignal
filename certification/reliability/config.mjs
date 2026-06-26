import { randomUUID } from "node:crypto";

export const config = {
  runId: process.env.RELIABILITY_CERT_RUN_ID || `rel-${randomUUID().slice(0, 8)}`,
  outputDir: "certification/reliability/reports"
};
