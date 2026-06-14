import { STORAGE_KEYS } from "../constants/limits";
import { readJson, writeJson } from "./storage";

export type AppNotification = {
  id: string;
  type:
    | "signal_received"
    | "signal_accepted"
    | "profile_viewed"
    | "verification_approved"
    | "premium_activated"
    | "off_platform_request";
  title: string;
  body: string;
  at: string;
  read: boolean;
};

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
