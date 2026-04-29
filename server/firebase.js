import admin from "firebase-admin";
import { config } from "./config.js";

let app = null;

if (config.firebase.serviceAccount && !admin.apps.length) {
  app = admin.initializeApp({
    credential: admin.credential.cert(config.firebase.serviceAccount)
  });
}

export async function sendTipPush(tip) {
  if (!app) {
    return { ok: false, skipped: true, reason: "FIREBASE_SERVICE_ACCOUNT_JSON is not configured" };
  }

  const topic = tip.is_vip ? "premium-users" : "all-users";
  const response = await admin.messaging().send({
    topic,
    notification: {
      title: tip.is_vip ? "VIP Signal Dropped" : "Free Sure Game",
      body: `${tip.match_name}: ${tip.prediction} @ ${tip.odds}`
    },
    data: {
      tipId: String(tip.id),
      isVip: String(Boolean(tip.is_vip))
    }
  });

  return { ok: true, topic, message_id: response };
}
