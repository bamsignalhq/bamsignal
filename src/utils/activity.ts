/** Users active within this window show as online and match "Online Now" priority */
export const ONLINE_NOW_MS = 15 * 60 * 1000;

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** Human-readable activity — no exact clock timestamps */
export function formatLastActive(lastActiveAt: string | undefined, now = Date.now()): string {
  if (!lastActiveAt) return "Active recently";

  const diff = Math.max(0, now - new Date(lastActiveAt).getTime());
  if (diff < 5 * MINUTE_MS) return "Active now";
  if (diff < HOUR_MS) {
    const mins = Math.max(1, Math.round(diff / MINUTE_MS));
    return mins === 1 ? "Active 1 min ago" : `Active ${mins} mins ago`;
  }
  if (diff < DAY_MS) return "Active today";
  if (diff < 2 * DAY_MS) return "Active yesterday";
  if (diff < 7 * DAY_MS) return "Active this week";
  return "Active recently";
}

export function isOnlineNow(lastActiveAt: string | undefined, now = Date.now()): boolean {
  if (!lastActiveAt) return false;
  return now - new Date(lastActiveAt).getTime() <= ONLINE_NOW_MS;
}

/** Card overlay badge — Active Now or Active Today only */
export function cardActivityBadge(
  lastActiveAt: string | undefined,
  now = Date.now()
): { online: boolean; label: string } | null {
  if (!lastActiveAt) return null;
  const diff = Math.max(0, now - new Date(lastActiveAt).getTime());
  if (diff <= ONLINE_NOW_MS) return { online: true, label: "Active Now" };
  if (diff < DAY_MS) return { online: false, label: "Active Today" };
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
