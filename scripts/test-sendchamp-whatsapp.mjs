#!/usr/bin/env node
/**
 * Manual Sendchamp WhatsApp OTP smoke test.
 * Usage: SENDCHAMP_API_KEY=... SENDCHAMP_WHATSAPP_SENDER=... node scripts/test-sendchamp-whatsapp.mjs [phone]
 */
import dotenv from "dotenv";
import {
  confirmWhatsAppVerificationOtp,
  isSendchampConfigured,
  sendWhatsAppVerificationOtp
} from "../server/services/sendchamp.js";
import { toSendchampPhone } from "../server/utils/nigerianPhone.js";

dotenv.config();

const phoneArg = process.argv[2] || "08035143299";
const phone = toSendchampPhone(phoneArg);

async function main() {
  if (!isSendchampConfigured()) {
    console.error("Sendchamp is not configured. Set SENDCHAMP_API_KEY and SENDCHAMP_WHATSAPP_SENDER (or SENDCHAMP_SENDER).");
    process.exit(1);
  }

  console.log("Sending WhatsApp OTP to", phone);
  const created = await sendWhatsAppVerificationOtp({ phone });
  console.log("Create response:", { reference: created.reference, status: created.status });

  const code = process.env.SENDCHAMP_TEST_CODE?.trim();
  if (!code) {
    console.log("Set SENDCHAMP_TEST_CODE to confirm, or enter the code from WhatsApp and re-run with:");
    console.log(`SENDCHAMP_TEST_CODE=123456 node scripts/test-sendchamp-whatsapp.mjs ${phoneArg}`);
    return;
  }

  console.log("Confirming OTP...");
  await confirmWhatsAppVerificationOtp({ reference: created.reference, code });
  console.log("Confirm OK");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
