import { randomUUID } from "node:crypto";

export const config = {
  runId: process.env.FOUNDER_CERT_RUN_ID || `founder-${randomUUID().slice(0, 8)}`,
  outputDir: "certification/founder/reports"
};
