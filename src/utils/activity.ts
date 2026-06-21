/** Users active within this window show as online and match "Online Now" priority */
export const ONLINE_NOW_MS = 15 * 60 * 1000;

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;

/** Human-readable activity — soft labels only (no exact timestamps) */
export function formatLastActive(lastActiveAt: string | undefined, now = Date.now()): string {
  const badge = cardActivityBadge(lastActiveAt, now);
  return badge?.label ?? "Active recently";
}

export function isOnlineNow(lastActiveAt: string | undefined, now = Date.now()): boolean {
  if (!lastActiveAt) return false;
  return now - new Date(lastActiveAt).getTime() <= ONLINE_NOW_MS;
}

/** Card overlay badge — Active now, Active today, or Active this week */
export function cardActivityBadge(
  lastActiveAt: string | undefined,
  now = Date.now()
): { online: boolean; label: string } | null {
  if (!lastActiveAt) return null;
  const diff = Math.max(0, now - new Date(lastActiveAt).getTime());
  if (diff <= ONLINE_NOW_MS) return { online: true, label: "Active now" };
  if (diff < DAY_MS) return { online: false, label: "Active today" };
  if (diff < 7 * DAY_MS) return { online: false, label: "Active this week" };
  return null;
}

/** Stable demo timestamps so profiles feel alive without changing every render */
export function mockLastActiveAt(profileId: string, index: number): string {
  const offsets = [
    2 * MINUTE_MS,
    8 * MINUTE_MS,
    14 * MINUTE_MS,
    42 * MINUTE_MS,
    2 * HOUR_MS,
    5 * HOUR_MS,
    20 * HOUR_MS,
    36 * HOUR_MS
  ];
  const hash = profileId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const offset = offsets[(index + hash) % offsets.length];
  return new Date(Date.now() - offset).toISOString();
}
