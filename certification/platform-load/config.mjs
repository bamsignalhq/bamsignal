import { randomUUID } from "node:crypto";
import dotenv from "dotenv";
import {
  PLATFORM_LOAD_DEFAULT_MAX_CONCURRENCY,
  PLATFORM_LOAD_DEFAULT_VIRTUAL_MEMBERS
} from "../../shared/platformLoadCertification.mjs";

dotenv.config();

const fast = process.env.LOAD_CERT_FAST === "1" || process.env.LOAD_CERT_FAST === "true";

export const config = {
  runId: process.env.LOAD_CERT_RUN_ID || `load-${randomUUID().slice(0, 8)}`,
  outputDir: "certification/platform-load/reports",
  baseUrl: String(
    process.env.LOAD_CERT_BASE_URL || process.env.CERTIFICATION_BASE_URL || ""
  ).replace(/\/$/, ""),
  port: Number(process.env.LOAD_CERT_PORT || 39457),
  virtualMembers: Number(
    process.env.LOAD_CERT_VIRTUAL_MEMBERS || (fast ? 24 : PLATFORM_LOAD_DEFAULT_VIRTUAL_MEMBERS)
  ),
  maxConcurrency: Number(
    process.env.LOAD_CERT_MAX_CONCURRENCY || (fast ? 8 : PLATFORM_LOAD_DEFAULT_MAX_CONCURRENCY)
  ),
  fast,
  startLocalServer: process.env.LOAD_CERT_START_LOCAL !== "false",
  requestTimeoutMs: Number(process.env.LOAD_CERT_REQUEST_TIMEOUT_MS || 15000),
  sampleReadyEveryMs: Number(process.env.LOAD_CERT_READY_SAMPLE_MS || 2500)
};
