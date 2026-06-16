import admin from "firebase-admin";
import {
  getFirebaseEnvTrace,
  getFirebaseHealthTrace,
  isFirebaseConfigured,
  resolveFirebaseServiceAccount
} from "./firebaseEnv.js";

let app = null;
let initError = null;

function getFirebaseApp() {
  if (app) return app;
  if (initError) return null;

  const serviceAccount = resolveFirebaseServiceAccount();
  if (!serviceAccount) return null;

  try {
    if (admin.apps.length) {
      app = admin.app();
      return app;
    }
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
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

export function getFirebaseHealth() {
  const envTrace = getFirebaseEnvTrace();
  const hasCredentials =
    envTrace.hasServiceAccountJson ||
    envTrace.hasProjectId ||
    envTrace.hasClientEmail ||
    envTrace.hasPrivateKey;

  if (hasCredentials && envTrace.hasResolvedAccount) {
    getFirebaseApp();
  }

  const probe = {
    initialized: Boolean(app),
    error: initError
      ? initError instanceof Error
        ? initError.message.slice(0, 160)
        : String(initError).slice(0, 160)
      : envTrace.error
  };

  return {
    firebase: isFirebaseConfigured(probe),
    firebaseTrace: getFirebaseHealthTrace(probe)
  };
}

export async function registerDevicePush({ token, isPremium = false }) {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) {
    const health = getFirebaseHealth();
    return {
      ok: false,
      skipped: true,
      reason: health.firebaseTrace.error || "Firebase is not configured"
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
