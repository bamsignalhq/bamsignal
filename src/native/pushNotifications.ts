import { Capacitor } from "@capacitor/core";
import { FCM } from "@capacitor-community/fcm";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { PushNotifications, type ActionPerformed, type PushNotificationSchema } from "@capacitor/push-notifications";
import { apiUrl } from "../services/supabase";
import { memberApiHeaders } from "../utils/memberApiAuth";
import { dispatchNativeDeepLinkRoute } from "./appBridge";
import { parseNativeDeepLink, type NativeDeepLinkRoute } from "./deepLinks";

export const PUSH_CHANNELS = [
  { id: "messages", name: "Messages", description: "New chat messages", importance: 5 as const },
  { id: "signals", name: "Signals", description: "Likes and interest signals", importance: 4 as const },
  { id: "matches", name: "Matches", description: "New mutual connections", importance: 4 as const },
  { id: "admin", name: "Updates", description: "Account and safety updates", importance: 3 as const }
] as const;

type PushRouteHandler = (route: NativeDeepLinkRoute) => void;

let routeHandler: PushRouteHandler | null = null;

export function setPushRouteHandler(handler: PushRouteHandler | null) {
  routeHandler = handler;
}

function notifyRoute(route: NativeDeepLinkRoute) {
  routeHandler?.(route);
  dispatchNativeDeepLinkRoute(route);
}

async function createAndroidChannels() {
  if (Capacitor.getPlatform() !== "android") return;
  for (const channel of PUSH_CHANNELS) {
    await PushNotifications.createChannel({
      id: channel.id,
      name: channel.name,
      description: channel.description,
      importance: channel.importance,
      vibration: true,
      visibility: 1
    });
  }
}

async function registerTokenWithServer(token: string) {
  const headers = await memberApiHeaders();
  if (!headers.Authorization) return;

  await fetch(apiUrl("/api/auth/identity?action=push-token"), {
    method: "POST",
    headers,
    body: JSON.stringify({ token })
  }).catch(() => undefined);
}

function channelForNotification(notification: PushNotificationSchema | ActionPerformed["notification"]) {
  const data = notification.data ?? {};
  const explicit = String(data.channelId || data.channel || "").trim();
  if (explicit && PUSH_CHANNELS.some((c) => c.id === explicit)) return explicit;
  const type = String(data.type || data.category || "").toLowerCase();
  if (type.includes("message") || type.includes("chat")) return "messages";
  if (type.includes("match")) return "matches";
  if (type.includes("signal") || type.includes("like")) return "signals";
  if (type.includes("admin") || type.includes("safety")) return "admin";
  return "admin";
}

function routeFromNotification(notification: PushNotificationSchema | ActionPerformed["notification"]) {
  const data = notification.data ?? {};
  const url = String(data.deepLink || data.url || data.link || "").trim();
  if (url) {
    const route = parseNativeDeepLink(url);
    if (route) {
      notifyRoute(route);
      return;
    }
  }
  const type = String(data.type || data.category || "").toLowerCase();
  if (type.includes("message") || type.includes("chat")) {
    notifyRoute({ kind: "chats", threadId: data.threadId ? String(data.threadId) : undefined });
    return;
  }
  if (type.includes("signal") || type.includes("like")) {
    notifyRoute({ kind: "signals" });
    return;
  }
  if (type.includes("match")) {
    notifyRoute({ kind: "matches" });
    return;
  }
  if (type.includes("premium")) {
    notifyRoute({ kind: "premium" });
    return;
  }
  notifyRoute({ kind: "notifications" });
}

async function hapticOnPush() {
  if (Capacitor.getPlatform() !== "android") return;
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    /* optional */
  }
}

export async function initNativePushNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  await createAndroidChannels();

  const permission = await PushNotifications.requestPermissions();
  if (permission.receive !== "granted") return;

  await PushNotifications.addListener("registration", async (event) => {
    const token = event.value;
    if (token) await registerTokenWithServer(token);
    try {
      const fcm = await FCM.getToken();
      if (fcm.token && fcm.token !== token) await registerTokenWithServer(fcm.token);
    } catch {
      // FCM token optional when registration event already fired
    }
  });

  await PushNotifications.addListener("registrationError", (error) => {
    console.warn("[bamsignal-native] push registration error", error);
  });

  await PushNotifications.addListener("pushNotificationReceived", async (notification) => {
    void hapticOnPush();
    const channelId = channelForNotification(notification);
    if (Capacitor.getPlatform() === "android" && notification.data) {
      notification.data.channelId = channelId;
    }
    if (notification.data?.foregroundRoute) {
      routeFromNotification(notification);
    }
  });

  await PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
    routeFromNotification(action.notification);
  });

  await PushNotifications.register();
}
