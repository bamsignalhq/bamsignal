/** Minimum profiles viewed before the first trust nudge may appear (1-based). */
export const TRUST_NUDGE_MIN_PROFILES = 3;

const TRUST_NUDGE_BASE_POSITIONS = [12, 28, 46, 65];

function daySeed(): number {
  return Math.floor(Date.now() / 86_400_000);
}

function jitter(seed: number, index: number): number {
  const mixed = (seed * 9301 + index * 49297 + 233280) % 233280;
  return (mixed % 5) - 2;
}

/** 1-based profile indices where a trust nudge may appear after that profile. */
export function getTrustNudgePositions(maxProfiles: number, seed = daySeed()): number[] {
  const positions: number[] = [];
  let cursor = TRUST_NUDGE_BASE_POSITIONS[0] + jitter(seed, 0);

  for (let i = 0; cursor <= maxProfiles; i += 1) {
    if (cursor >= TRUST_NUDGE_MIN_PROFILES) {
      positions.push(cursor);
    }
    const gap = 15 + ((seed + i * 17) % 11);
    cursor += gap + jitter(seed, i + 1);
  }

  return positions;
}

/** 0-based indices after which a trust nudge should be inserted in a feed slice. */
export function trustNudgeInsertAfterIndices(profileCount: number, seed = daySeed()): Set<number> {
  const positions = getTrustNudgePositions(profileCount, seed);
  return new Set(
    positions
      .filter((position) => position >= TRUST_NUDGE_MIN_PROFILES && position <= profileCount)
      .map((position) => position - 1)
  );
}

export type FeedWithTrustNudgeItem<TProfile> =
  | { type: "profile"; profile: TProfile; index: number }
  | { type: "trust-nudge"; afterIndex: number };

export function interleaveTrustNudges<TProfile>(
  profiles: TProfile[],
  enabled: boolean,
  seed = daySeed()
): FeedWithTrustNudgeItem<TProfile>[] {
  if (!enabled || profiles.length < TRUST_NUDGE_MIN_PROFILES) {
    return profiles.map((profile, index) => ({ type: "profile", profile, index }));
  }

  const insertAfter = trustNudgeInsertAfterIndices(profiles.length, seed);
  const items: FeedWithTrustNudgeItem<TProfile>[] = [];

  profiles.forEach((profile, index) => {
    items.push({ type: "profile", profile, index });
    if (insertAfter.has(index)) {
      items.push({ type: "trust-nudge", afterIndex: index });
    }
  });

  return items;
}

const TRUST_FEED_DISMISS_KEY = "bamsignal_trust_feed_nudge_dismissed_at";
const TRUST_FEED_DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

export function shouldShowTrustFeedNudge(): boolean {
  try {
    const raw = localStorage.getItem(TRUST_FEED_DISMISS_KEY);
    if (!raw) return true;
    const dismissedAt = Number(raw);
    if (!Number.isFinite(dismissedAt)) return true;
    return Date.now() - dismissedAt >= TRUST_FEED_DISMISS_MS;
  } catch {
    return true;
  }
}

export function dismissTrustFeedNudge(): void {
  try {
    localStorage.setItem(TRUST_FEED_DISMISS_KEY, String(Date.now()));
  } catch {
    // ignore storage failures
  }
}
