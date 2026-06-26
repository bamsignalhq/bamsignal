import { randomUUID } from "node:crypto";

export const config = {
  runId: process.env.DEPENDENCY_CERT_RUN_ID || `dep-${randomUUID().slice(0, 8)}`,
  outputDir: "certification/dependencies/reports"
};
