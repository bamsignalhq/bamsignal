import { randomUUID } from "node:crypto";

export const config = {
  runId: process.env.ACCESSIBILITY_CERT_RUN_ID || `a11y-${randomUUID().slice(0, 8)}`,
  outputDir: "certification/accessibility/reports"
};
