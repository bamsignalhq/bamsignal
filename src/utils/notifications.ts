import { STORAGE_KEYS } from "../constants/limits";
import type { NavTab } from "../types";
import { readJson, writeJson } from "./storage";

export type AppNotification = {
  id: string;
  type:
    | "signal_received"
    | "signal_accepted"
    | "profile_viewed"
    | "verification_approved"
    | "premium_activated"
    | "off_platform_request"
    | "boost_activated"
    | "referral_reward"
    | "lifecycle_milestone"
    | "lifecycle_next_step";
  title: string;
  body: string;
  at: string;
  read: boolean;
};

export type NotificationDestination =
  | { kind: "tab"; tab: NavTab }
  | { kind: "overlay"; overlay: "visitors" | "premium" | "safety" };

export function notificationDestination(
  type: AppNotification["type"]
): NotificationDestination | null {
  switch (type) {
    case "signal_received":
      return { kind: "tab", tab: "likes" };
    case "signal_accepted":
    case "off_platform_request":
      return { kind: "tab", tab: "chats" };
    case "profile_viewed":
      return { kind: "overlay", overlay: "visitors" };
    case "boost_activated":
      return { kind: "tab", tab: "discover" };
    case "premium_activated":
      return { kind: "overlay", overlay: "premium" };
    case "verification_approved":
    case "referral_reward":
    case "lifecycle_milestone":
    case "lifecycle_next_step":
      return { kind: "tab", tab: "me" };
    default:
      return null;
  }
}

export function getNotifications(): AppNotification[] {
  return readJson<AppNotification[]>(STORAGE_KEYS.notifications, []);
}

export function unreadCount(): number {
  return getNotifications().filter((n) => !n.read).length;
}

export function pushNotification(
  partial: Omit<AppNotification, "id" | "at" | "read">
): void {
  const list = getNotifications();
  list.unshift({
    ...partial,
    id: `n-${Date.now()}`,
    at: new Date().toISOString(),
    read: false
  });
  writeJson(STORAGE_KEYS.notifications, list.slice(0, 50));
}

export function markAllRead(): void {
  writeJson(
    STORAGE_KEYS.notifications,
    getNotifications().map((n) => ({ ...n, read: true }))
  );
}

export function markRead(id: string): void {
  writeJson(
    STORAGE_KEYS.notifications,
    getNotifications().map((n) => (n.id === id ? { ...n, read: true } : n))
  );
}
