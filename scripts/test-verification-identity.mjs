#!/usr/bin/env node
/**
 * Verification endpoint identity binding regression tests.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

const submissions = read("api/verify/submissions.js");
const smsStart = read("api/verify/sms/start.js");
const smsConfirm = read("api/verify/sms/confirm.js");
const whatsappStart = read("api/verify/whatsapp/start.js");
const whatsappConfirm = read("api/verify/whatsapp/confirm.js");
const verificationQueue = read("server/services/verificationQueue.js");
const smsService = read("server/services/smsVerification.js");
const verificationImage = read("server/services/verificationImage.js");
const sendchamp = read("server/services/sendchamp.js");
const chatsPage = read("src/pages/ChatsPage.tsx");

assert(submissions.includes("requireMemberAuth(req, body)"), "submit-selfie requires member auth");
assert(submissions.includes("validateVerificationImagePayload"), "submit-selfie validates image payload");
assert(!submissions.includes('const email = String(body.email'), "submit-selfie must not trust body email");
assert(smsStart.includes("requireMemberAuth(req, body)"), "sms start requires member auth");
assert(smsConfirm.includes("requireMemberAuth(req, body)"), "sms confirm requires member auth");
assert(whatsappStart.includes("410"), "whatsapp start must return 410 retired");
assert(whatsappConfirm.includes("410"), "whatsapp confirm must return 410 retired");
assert(smsService.includes("resolveIdentityFromUserId"), "sms verification resolves session identity");
assert(smsService.includes("authUserId"), "sms markPhoneVerified accepts authUserId");
assert(smsService.includes("sendSmsVerificationOtp"), "sms service uses SMS OTP");
assert(sendchamp.includes('channel: "sms"'), "sendchamp adapter sends SMS channel");
assert(verificationImage.includes("decodeBase64ImagePayload"), "verification image reuses photo MIME validation");
assert(chatsPage.includes("isMessagingUnlocked"), "chats page gates messaging on trust unlock");
assert(chatsPage.includes("Unlock messaging"), "chats page shows messaging verify wizard");
assert(verificationQueue.includes("user_key"), "verification queue binds user key");

if (failed > 0) {
  console.error(`\n${failed} verification identity test(s) failed.`);
  process.exit(1);
}

console.log("All verification identity tests passed.");
