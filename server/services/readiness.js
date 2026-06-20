import { config } from "../config.js";
import { getDatabaseStatus, pingDatabase } from "../db.js";
import { getFirebaseHealth } from "../firebase.js";
import { isSignupEmailConfigured, getSignupEmailHealthTrace } from "../supabaseEnv.js";
import { getSendchampHealthTrace, isSendchampConfigured } from "./sendchamp.js";
import { isPhotoStorageConfigured } from "./photoStorage.js";

export function livenessPayload() {
  return { ok: true, service: "bamsignal" };
}

export function isReadinessChecksReady(checks = {}) {
  return Boolean(
    checks.databaseReady &&
      checks.paystackReady &&
      checks.signupEmailReady &&
      checks.photoStorageReady
  );
}

async function evaluateReadinessChecks() {
  let database = getDatabaseStatus();
  if (database === "connected") {
    const alive = await pingDatabase();
    database = alive ? "connected" : "disconnected";
  }

  return {
    database,
    databaseReady: database === "connected",
    paystackReady: Boolean(config.paystackSecretKey),
    signupEmailReady: isSignupEmailConfigured(),
    photoStorageReady: isPhotoStorageConfigured()
  };
}

export async function isProductionReady() {
  const checks = await evaluateReadinessChecks();
  return isReadinessChecksReady(checks);
}

export async function readinessPayload(options = {}) {
  const checks = await evaluateReadinessChecks();
  const ready = isReadinessChecksReady(checks);

  if (!options.detailed) {
    return {
      ok: ready,
      service: "bamsignal",
      ready
    };
  }

  return {
    ok: ready,
    service: "bamsignal",
    ready,
    database: checks.database,
    paystack: checks.paystackReady,
    resend: Boolean(process.env.RESEND_API_KEY?.trim()),
    signupEmail: checks.signupEmailReady,
    signupEmailTrace: getSignupEmailHealthTrace(),
    ...getFirebaseHealth(),
    telegram: Boolean(config.telegram.botToken),
    sendchamp: isSendchampConfigured(),
    sendchampTrace: getSendchampHealthTrace(),
    photoStorage: checks.photoStorageReady
  };
}
