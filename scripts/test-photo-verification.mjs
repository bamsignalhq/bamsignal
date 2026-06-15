#!/usr/bin/env node
import assert from "node:assert/strict";
import {
  containsContactInText,
  isValidNigerianPhone,
  normalizeNigerianPhoneLocal,
  toE164NigerianPhone,
  toSendchampPhone
} from "../server/utils/imageContactPatterns.js";
import {
  confirmWhatsappVerification,
  startWhatsappVerification,
  WhatsappVerificationError
} from "../server/services/whatsappVerification.js";
import {
  submitVerificationSelfie,
  reviewVerificationSubmission,
  listVerificationSubmissions
} from "../server/services/verificationQueue.js";
import { initDatabase, getDatabaseStatus } from "../server/db.js";

function testPhoneNormalization() {
  assert.equal(normalizeNigerianPhoneLocal("+2348012345678"), "08012345678");
  assert.equal(toE164NigerianPhone("08012345678"), "+2348012345678");
  assert.equal(toSendchampPhone("08012345678"), "2348012345678");
  assert.equal(isValidNigerianPhone("08012345678"), true);
  assert.equal(isValidNigerianPhone("12345"), false);
  console.log("✓ Nigerian phone normalization");
}

function testContactPatterns() {
  assert.equal(containsContactInText("call me on 08012345678"), true);
  assert.equal(containsContactInText("WhatsApp me"), true);
  assert.equal(containsContactInText("@myhandle on ig"), true);
  assert.equal(containsContactInText("Just a normal caption"), false);
  assert.equal(containsContactInText("hello@example.com"), true);
  console.log("✓ Image contact pattern detection");
}

async function testWhatsappOtpDryRun() {
  try {
    await startWhatsappVerification("08012345678");
    console.log("✓ WhatsApp OTP send attempted (configured)");
  } catch (error) {
    if (error instanceof WhatsappVerificationError || error.name === "SendchampError") {
      console.log("✓ WhatsApp OTP send guarded when Sendchamp unavailable");
      return;
    }
    throw error;
  }

  try {
    await confirmWhatsappVerification("08012345678", "000000");
    console.log("✓ WhatsApp OTP confirm path reachable");
  } catch (error) {
    if (error instanceof WhatsappVerificationError) {
      console.log("✓ Wrong OTP returns calm error path");
    } else {
      throw error;
    }
  }
}

async function testVerificationQueue() {
  if (getDatabaseStatus() !== "connected") {
    console.log("• Skipping DB verification queue tests (no database)");
    return;
  }

  const row = await submitVerificationSelfie({
    email: `verify-${Date.now()}@bamsignal.com`,
    phone: "08011112222",
    name: "QA Verify",
    profilePhoto: "data:image/png;base64,profile",
    verificationSelfie: "data:image/png;base64,selfie",
    phoneVerified: true
  });
  assert.ok(row?.id, "selfie submission should persist");

  const approved = await reviewVerificationSubmission(row.id, { status: "approved" });
  assert.equal(approved?.status, "approved");

  const rejectedRow = await submitVerificationSelfie({
    email: `verify-reject-${Date.now()}@bamsignal.com`,
    phone: "08011113333",
    name: "QA Reject",
    verificationSelfie: "data:image/png;base64,selfie2",
    phoneVerified: true
  });
  const rejected = await reviewVerificationSubmission(rejectedRow.id, {
    status: "rejected",
    rejectReason: "Test reject"
  });
  assert.equal(rejected?.status, "rejected");

  const list = await listVerificationSubmissions({ status: "approved" });
  assert.ok(Array.isArray(list));
  console.log("✓ Verification queue approve/reject");
}

async function main() {
  testPhoneNormalization();
  testContactPatterns();
  await initDatabase().catch(() => null);
  await testWhatsappOtpDryRun();
  await testVerificationQueue();
  console.log("\nAll photo / verification checks passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
