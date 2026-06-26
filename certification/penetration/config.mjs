import { randomUUID } from "node:crypto";
import dotenv from "dotenv";

dotenv.config();

export const config = {
  runId: process.env.PENTEST_CERT_RUN_ID || `pentest-${randomUUID().slice(0, 8)}`,
  outputDir: "certification/penetration/reports",
  baseUrl: String(
    process.env.PENTEST_BASE_URL || process.env.CERTIFICATION_BASE_URL || ""
  ).replace(/\/$/, ""),
  port: Number(process.env.PENTEST_PORT || 39458),
  startLocalServer: process.env.PENTEST_START_LOCAL !== "false",
  requestTimeoutMs: Number(process.env.PENTEST_REQUEST_TIMEOUT_MS || 12000),
  pinLoginBurst: Number(process.env.PENTEST_PIN_BURST || 12),
  otpBurst: Number(process.env.PENTEST_OTP_BURST || 8)
};
