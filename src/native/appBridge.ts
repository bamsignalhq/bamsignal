import type { NavTab } from "../types";
import type { NativeDeepLinkRoute } from "./deepLinks";
import { setPendingChatOpen } from "../utils/chatDraft";

export type NativeAppBridge = {
  setTab: (tab: NavTab) => void;
  navigateToPath: (path: string, replace?: boolean) => void;
  openNotifications: () => void;
  openPricing: () => void;
  openChatThread: (threadId?: string) => void;
  applyReferralCode: (code?: string) => void;
};

let bridge: NativeAppBridge | null = null;

export function registerNativeAppBridge(next: NativeAppBridge | null) {
  bridge = next;
}

export function getNativeAppBridge(): NativeAppBridge | null {
  return bridge;
}

export const NATIVE_ROUTE_EVENT = "bamsignal:native-route" as const;

export function dispatchNativeDeepLinkRoute(route: NativeDeepLinkRoute) {
  if (typeof window === "undefined") return;
  if (bridge) {
    applyNativeDeepLinkRoute(route, bridge);
    return;
  }
  window.dispatchEvent(new CustomEvent(NATIVE_ROUTE_EVENT, { detail: route }));
}

export function applyNativeDeepLinkRoute(route: NativeDeepLinkRoute, api: NativeAppBridge) {
  switch (route.kind) {
    case "payment":
      api.navigateToPath(`/payment/success?reference=${encodeURIComponent(route.reference)}`, true);
      break;
    case "profile":
      api.navigateToPath(`/profile/${route.profileId}`);
      break;
    case "chats":
      api.setTab("chats");
      if (route.threadId) setPendingChatOpen(route.threadId);
      api.openChatThread(route.threadId);
      break;
    case "signals":
      api.setTab("likes");
      break;
    case "matches":
      api.setTab("chats");
      break;
    case "premium":
      api.openPricing();
      break;
    case "referral":
      if (route.code) {
        api.navigateToPath(`/love/signup?ref=${encodeURIComponent(route.code)}`);
      } else {
        api.navigateToPath("/love/signup");
      }
      break;
    case "notifications":
      api.openNotifications();
      break;
    case "discover":
      api.setTab("discover");
      break;
    case "home":
      api.setTab("home");
      api.navigateToPath("/home");
      break;
    default:
      break;
  }
}
