import { randomUUID } from "node:crypto";

export const config = {
  runId: process.env.RC_CERT_RUN_ID || `rc-${randomUUID().slice(0, 8)}`,
  outputDir: "certification/release-candidate/reports"
};
