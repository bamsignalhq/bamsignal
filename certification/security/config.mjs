import { randomUUID } from "node:crypto";

export const config = {
  runId: process.env.SECURITY_CERT_RUN_ID || `sec-${randomUUID().slice(0, 8)}`,
  outputDir: "certification/security/reports"
};
