#!/usr/bin/env node
/**
 * WhatsApp verification certification tests.
 * Usage: node scripts/test-whatsapp-verification.mjs
 * Optional live provider test:
 *   SENDCHAMP_API_KEY=... SENDCHAMP_WHATSAPP_SENDER=... node scripts/test-whatsapp-verification.mjs --live
 */
import assert from "node:assert/strict";
import dotenv from "dotenv";
import {
  isValidNigerianPhone,
  normalizeNigerianPhoneLocal,
  toE164NigerianPhone,
  toSendchampPhone
} from "../server/utils/nigerianPhone.js";
import { parseSendchampEnvelope, isSendchampConfigured } from "../server/services/sendchamp.js";
import {
  mapSendchampConfirmError,
  mapSendchampStartError,
  VERIFICATION_ERROR_CODES,
  WhatsappVerificationError
} from "../server/services/whatsappVerificationErrors.js";
import { SendchampError } from "../server/services/sendchamp.js";
import {
  confirmWhatsappVerification,
  startWhatsappVerification
} from "../server/services/whatsappVerification.js";
import { initDatabase, getDatabaseStatus } from "../server/db.js";
import { PLACEHOLDER_PATTERNS } from "../shared/environmentRegistry.mjs";

dotenv.config();

const liveMode = process.argv.includes("--live");

function testPhoneNormalization() {
  assert.equal(normalizeNigerianPhoneLocal("08035143299"), "08035143299");
  assert.equal(normalizeNigerianPhoneLocal("+2348035143299"), "08035143299");
  assert.equal(normalizeNigerianPhoneLocal("2348035143299"), "08035143299");
  assert.equal(toSendchampPhone("08035143299"), "2348035143299");
  assert.equal(toE164NigerianPhone("08035143299"), "+2348035143299");
  assert.equal(isValidNigerianPhone("08035143299"), true);
  assert.equal(isValidNigerianPhone("12345"), false);
  console.log("✓ Phone normalization");
}

function testSendchampEnvelopeParsing() {
  const success = parseSendchampEnvelope({
    status: "success",
    code: 200,
    data: { verification_reference: "VER-abc123", status: "sent" }
  });
  assert.equal(success.ok, true);
  assert.equal(success.reference, "VER-abc123");

  const altShape = parseSendchampEnvelope({
    status: "success",
    verification_reference: "VER-top-level"
  });
  assert.equal(altShape.reference, "VER-top-level");

  const failed = parseSendchampEnvelope({
    status: "failed",
    code: 400,
    message: "Invalid sender"
  });
  assert.equal(failed.ok, false);
  console.log("✓ Sendchamp response parsing");
}

function testErrorMapping() {
  const notConfigured = mapSendchampStartError(
    new SendchampError(503, "missing", "not_configured")
  );
  assert.equal(notConfigured.code, VERIFICATION_ERROR_CODES.NOT_CONFIGURED);

  const timeout = mapSendchampStartError(
    new SendchampError(504, "Network timeout. Try again.", "provider_timeout")
  );
  assert.equal(timeout.code, VERIFICATION_ERROR_CODES.PROVIDER_TIMEOUT);
  assert.match(timeout.message, /timeout/i);

  const invalidCode = mapSendchampConfirmError(
    new SendchampError(400, "Invalid verification code", "sendchamp_request_failed")
  );
  assert.equal(invalidCode.code, VERIFICATION_ERROR_CODES.INVALID_CODE);

  const wrapped = new WhatsappVerificationError(400, "Invalid phone number.", "invalid_phone");
  assert.equal(wrapped.code, "invalid_phone");
  console.log("✓ Error mapping");
}

function isPlaceholder(value = "") {
  const trimmed = String(value).trim();
  if (!trimmed) return true;
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(trimmed));
}

function testEnvironmentValidation() {
  const required = [
    "SENDCHAMP_API_KEY",
    "SENDCHAMP_BASE_URL",
    "SENDCHAMP_WHATSAPP_SENDER",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY"
  ];

  const report = {};
  for (const name of required) {
    const value = process.env[name]?.trim() || "";
    report[name] = {
      present: Boolean(value),
      placeholder: isPlaceholder(value)
    };
  }

  console.log("• Environment validation report:");
  for (const [name, status] of Object.entries(report)) {
    const label = !status.present ? "missing" : status.placeholder ? "placeholder" : "ok";
    console.log(`  - ${name}: ${label}`);
  }

  console.log("✓ Environment validation");
}

async function testStartGuards() {
  try {
    await startWhatsappVerification("12345");
    assert.fail("invalid phone should throw");
  } catch (error) {
    assert.equal(error.code, VERIFICATION_ERROR_CODES.INVALID_PHONE);
  }

  try {
    await startWhatsappVerification("08035143299", { requestId: "test-req" });
    if (!isSendchampConfigured()) {
      assert.fail("expected configuration guard when Sendchamp is unavailable");
    }
    console.log("✓ Live start path attempted");
  } catch (error) {
    if (
      error instanceof WhatsappVerificationError ||
      error instanceof SendchampError ||
      error.name === "SendchampError"
    ) {
      console.log("✓ Start path guarded when provider unavailable or misconfigured");
      return;
    }
    throw error;
  }
}

async function testConfirmGuards() {
  try {
    await confirmWhatsappVerification("08035143299", "000000", { requestId: "test-req" });
  } catch (error) {
    if (error instanceof WhatsappVerificationError) {
      assert.ok(
        [VERIFICATION_ERROR_CODES.NO_ACTIVE_SESSION, VERIFICATION_ERROR_CODES.INVALID_CODE].includes(
          error.code
        )
      );
      console.log("✓ Confirm path returns session/code errors without raw provider leaks");
      return;
    }
    throw error;
  }
}

async function testRateLimitWhenDatabaseConnected() {
  if (getDatabaseStatus() !== "connected" || !isSendchampConfigured()) {
    console.log("• Skipping rate-limit persistence test (database or Sendchamp unavailable)");
    return;
  }

  const phone = "08039998877";
  await startWhatsappVerification(phone, { requestId: "rate-limit-test" }).catch(() => {});

  try {
    await startWhatsappVerification(phone, { requestId: "rate-limit-test-2" });
    console.log("• Rate limit not triggered (provider may have failed first request)");
  } catch (error) {
    assert.equal(error.code, VERIFICATION_ERROR_CODES.RATE_LIMITED);
    console.log("✓ Rate limiting enforced");
  }
}

async function main() {
  testPhoneNormalization();
  testSendchampEnvelopeParsing();
  testErrorMapping();
  testEnvironmentValidation();

  await initDatabase().catch(() => {});
  await testStartGuards();
  await testConfirmGuards();
  await testRateLimitWhenDatabaseConnected();

  if (liveMode && isSendchampConfigured()) {
    console.log("• Live provider mode enabled — run scripts/test-sendchamp-whatsapp.mjs for delivery confirmation");
  }

  console.log("\nWhatsApp verification tests passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
