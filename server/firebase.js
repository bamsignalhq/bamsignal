import admin from "firebase-admin";
import { config } from "./config.js";

let app = null;
let initError = null;

function getFirebaseApp() {
  if (app) return app;
  if (initError) return null;
  if (!config.firebase.serviceAccount) return null;
  if (admin.apps.length) {
    app = admin.app();
    return app;
  }

  try {
    app = admin.initializeApp({
      credential: admin.credential.cert(config.firebase.serviceAccount)
    });
    return app;
  } catch (error) {
    initError = error;
    console.warn(
      "[bamsignal] Firebase admin disabled:",
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
}

export async function registerDevicePush({ token, isPremium = false }) {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) {
    return {
      ok: false,
      skipped: true,
      reason: initError
        ? "FIREBASE_SERVICE_ACCOUNT_JSON is invalid"
        : "FIREBASE_SERVICE_ACCOUNT_JSON is not configured"
    };
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
