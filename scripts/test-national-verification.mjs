#!/usr/bin/env node
/**
 * National verification provider isolation + surface checks.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;

function assert(cond, msg) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    failed += 1;
  }
}

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

const engine = read("server/lib/verification/engine.js");
const factory = read("server/lib/verification/providers/index.js");
const app = read("server/app.js");
const start = read("api/verification/start.js");
const chats = read("src/pages/ChatsPage.tsx");

assert(factory.includes("createInsightFaceProvider"), "factory registers InsightFace");
assert(factory.includes("createFaceNetProvider"), "factory registers FaceNet");
assert(factory.includes("getFaceProvider"), "factory exports getFaceProvider");
assert(engine.includes("getFaceProvider("), "engine uses provider factory");
assert(!engine.includes("from \"./providers/insightface"), "engine must not import InsightFace directly");
assert(!chats.includes("insightface"), "ChatsPage must not mention InsightFace");
assert(app.includes("/api/verification/start"), "app mounts verification start");
assert(app.includes("/api/verification/verify"), "app mounts verification verify");
assert(start.includes("requireMemberAuth"), "start requires member auth");
assert(start.includes("checkRateLimit"), "start is rate limited");
assert(read("migrations/0049_national_verification.sql").includes("verification_sessions"), "migration has sessions");
assert(read("migrations/0049_national_verification.sql").includes("verification_audit_logs"), "migration has audit");

const { computeTrustScore, resolveThresholds } = await import("../server/lib/verification/risk-engine.js");
const high = computeTrustScore(
  {
    emailVerified: true,
    smsVerified: true,
    livenessPassed: true,
    faceMatchConfidence: 98,
    duplicatePhone: false,
    duplicateDevice: false,
    duplicateFace: false,
    accountAgeDays: 30,
    reportCount: 0
  },
  resolveThresholds({ autoVerifyMin: 95, manualReviewMin: 80 })
);
assert(high.decision === "auto_verify", "high trust auto-verifies");
assert(high.trustScore >= 95, "high trust score >= 95");

const low = computeTrustScore(
  {
    emailVerified: true,
    smsVerified: true,
    livenessPassed: false,
    faceMatchConfidence: 40,
    duplicatePhone: false,
    duplicateDevice: false,
    duplicateFace: false,
    accountAgeDays: 0,
    reportCount: 0
  },
  resolveThresholds()
);
assert(low.decision === "retry", "failed liveness retries");

const { getFaceProvider, resetFaceProviderCache } = await import(
  "../server/lib/verification/providers/index.js"
);
resetFaceProviderCache();
process.env.FACE_VERIFICATION_PROVIDER = "noop";
const provider = getFaceProvider("noop");
assert(provider.id === "noop", "noop provider selectable");
await provider.initialize();
const methods = ["initialize", "detectFace", "extractEmbedding", "compare", "verify"];
for (const m of methods) assert(typeof provider[m] === "function", `provider implements ${m}`);

if (failed) {
  console.error(`\n${failed} national verification test(s) failed.`);
  process.exit(1);
}
console.log("All national verification tests passed.");
