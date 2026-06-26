import { randomUUID } from "node:crypto";

export const config = {
  runId: process.env.CHAOS_CERT_RUN_ID || `chaos-${randomUUID().slice(0, 8)}`,
  outputDir: "certification/chaos/reports"
};
