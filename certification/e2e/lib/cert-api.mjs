/**
 * Diagnostics-gated certification helper API client (read / peek / cleanup only).
 */
import { config } from "../config.mjs";
import { httpJson } from "./http.mjs";

function certHeaders() {
  return { "x-diagnostics-secret": config.diagnosticsSecret };
}

export async function certAction(action, body = {}) {
  return httpJson(`/api/diagnostics/certification?action=${encodeURIComponent(action)}`, {
    method: "POST",
    body: { action, ...body },
    headers: certHeaders()
  });
}

export async function peekSignupOtp(email) {
  const result = await certAction("peek-signup-otp", { email });
  if (!result.ok) {
    throw new Error(`peek-signup-otp failed (${result.status}): ${result.payload?.error || "unknown"}`);
  }
  return result.payload.code;
}

export async function seedSignupOtp(email, code = "246810") {
  const result = await certAction("seed-signup-otp", { email, code });
  if (!result.ok) throw new Error(result.payload?.error || "seed-signup-otp failed");
  return result.payload;
}

export async function certQuery(name, params = []) {
  const result = await certAction("query", { name, params });
  if (!result.ok) throw new Error(result.payload?.error || `query ${name} failed`);
  return result.payload.rows || [];
}

export async function setPhoneVerified(email, phone) {
  const result = await certAction("set-phone-verified", { email, phone });
  if (!result.ok) throw new Error(result.payload?.error || "set-phone-verified failed");
  return result.payload;
}

export async function approveVerification(email, phone) {
  const result = await certAction("approve-verification", { email, phone });
  if (!result.ok) throw new Error(result.payload?.error || "approve-verification failed");
  return result.payload;
}

export async function cleanupCertMember(email) {
  return certAction("cleanup-member", { email });
}
