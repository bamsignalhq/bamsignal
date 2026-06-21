import type { DatingProfile, DiscoverProfile } from "../types";
import type { SignalConciergeStatus } from "../constants/signalConcierge";
import { isSignalConciergeMemberActive } from "./signalConciergeStorage";

const ACTIVE_CONCIERGE_STATUSES = new Set<SignalConciergeStatus>([
  "accepted",
  "active-search",
  "introductions-in-progress",
  "matched",
  "consultation-scheduled",
  "under-review",
  "waitlisted"
]);

type ConciergeVisibilityProfile = Pick<
  DatingProfile | DiscoverProfile,
  "signalConciergeMember" | "signalConciergeStatus"
>;

export function isSignalConciergeProfile(profile: ConciergeVisibilityProfile): boolean {
  if (profile.signalConciergeMember === true) return true;
  if (profile.signalConciergeStatus && ACTIVE_CONCIERGE_STATUSES.has(profile.signalConciergeStatus)) {
    return true;
  }
  return false;
}

/** Signal Concierge members must never appear in public discovery surfaces. */
export function isExcludedFromPublicDiscovery(profile: ConciergeVisibilityProfile): boolean {
  return isSignalConciergeProfile(profile);
}

export function viewerIsSignalConciergeMember(): boolean {
  return isSignalConciergeMemberActive();
}
