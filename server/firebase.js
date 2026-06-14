import admin from "firebase-admin";
import { config } from "./config.js";

let app = null;

if (config.firebase.serviceAccount && !admin.apps.length) {
  app = admin.initializeApp({
    credential: admin.credential.cert(config.firebase.serviceAccount)
  });
}

export async function registerDevicePush({ token, isPremium = false }) {
  if (!app) {
    return { ok: false, skipped: true, reason: "FIREBASE_SERVICE_ACCOUNT_JSON is not configured" };
  }
  if (!token) return { ok: false, error: "Push token is required" };

  await admin.messaging().subscribeToTopic([token], "signals");
  if (isPremium) {
    await admin.messaging().subscribeToTopic([token], "premium-users");
  } else {
    await admin.messaging().unsubscribeFromTopic([token], "premium-users").catch(() => undefined);
  }

  return { ok: true, topics: isPremium ? ["signals", "premium-users"] : ["signals"] };
}
