/**
 * PROGRAM 002 · M13 — Search & Discovery Excellence
 *
 * Deterministic discovery engine:
 * - Hard exclusion rules (safety/visibility)
 * - Freshness cooldowns (passed rediscovery window)
 * - Explainability hooks (reason ids)
 * - Scoring uses existing match quality engine (premium boost capped at 5%).
 */
import type { DatingProfile, DiscoverProfile, MatchPreferences } from "../types";
import { filterDiscoverDeck } from "./safety";
import { listHiddenUsers, listRestrictedUsers } from "./safetyInteractions";
import { isShadowBanned } from "./shadowBan";
import { computeMatchQualityScore } from "./matchQualityEngine";
import { wasRecentlyShown } from "./matchQualityDiscovery";
import { isInPassCooldown, DEFAULT_PASS_REDISCOVERY_DAYS } from "./discoveryFreshness";
import { buildDiscoverReasons, type DiscoverReason } from "./buildDiscoverReasons";
import { trackEvent } from "./analytics";
import { memberApiHeaders } from "./memberApiAuth";
import { apiUrl } from "../services/supabase";
import { readResponseJson } from "./httpJson";

export type DiscoveryScoredProfile = {
  profile: DiscoverProfile;
  discoveryScore: number;
  reasons: DiscoverReason[];
};

export type DiscoverMembersInput = {
  candidates: DiscoverProfile[];
  viewer: DatingProfile;
  prefs: MatchPreferences;
  blocked: string[];
  passed: string[];
  /** If true, include profiles recently shown; otherwise suppress repeats. */
  allowRecentlyShown?: boolean;
};

function dedupeById(profiles: DiscoverProfile[]): DiscoverProfile[] {
  const seen = new Set<string>();
  const out: DiscoverProfile[] = [];
  for (const p of profiles) {
    if (!p?.id) continue;
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
  }
  return out;
}

function applySafetyVisibilityRules(profiles: DiscoverProfile[]): DiscoverProfile[] {
  const hidden = new Set(listHiddenUsers());
  const restricted = new Set(listRestrictedUsers());
  return profiles.filter((p) => {
    if (hidden.has(p.id)) return false;
    if (restricted.has(p.id)) return false;
    if (isShadowBanned(p.id)) return false;
    return true;
  });
}

function applyFreshnessRules(
  profiles: DiscoverProfile[],
  opts: { allowRecentlyShown?: boolean; passCooldownDays?: number }
): DiscoverProfile[] {
  const allowRecentlyShown = Boolean(opts.allowRecentlyShown);
  const passCooldownDays = opts.passCooldownDays ?? DEFAULT_PASS_REDISCOVERY_DAYS;
  return profiles.filter((p) => {
    if (!allowRecentlyShown && wasRecentlyShown(p.id, 24)) return false;
    if (isInPassCooldown(p.id, passCooldownDays)) return false;
    return true;
  });
}

export function calculateDiscoveryScore(
  viewer: DatingProfile,
  candidate: DiscoverProfile,
  prefs: MatchPreferences
): number {
  return computeMatchQualityScore(viewer, candidate, prefs).total;
}

export function discoverMembers(input: DiscoverMembersInput): DiscoveryScoredProfile[] {
  const base = dedupeById(
    applyFreshnessRules(
      applySafetyVisibilityRules(
        filterDiscoverDeck(input.candidates, input.viewer, input.blocked, input.passed)
      ),
      { allowRecentlyShown: input.allowRecentlyShown }
    )
  );

  const scored = base
    .map((profile) => {
      const discoveryScore = calculateDiscoveryScore(input.viewer, profile, input.prefs);
      const reasons = buildDiscoverReasons(input.viewer, profile, 2);
      return { profile, discoveryScore, reasons };
    })
    .sort((a, b) => b.discoveryScore - a.discoveryScore);

  return scored;
}

export function recordDiscoveryImpressions(rows: DiscoveryScoredProfile[]): void {
  const events: { eventType: string; payload: Record<string, unknown> }[] = [];

  for (const row of rows) {
    trackEvent("discover_impression", { profileId: row.profile.id });
    events.push({ eventType: "discover_impression", payload: { profileId: row.profile.id } });
    for (const reason of row.reasons) {
      trackEvent("discover_reason_shown", { profileId: row.profile.id, reasonId: reason.id });
      events.push({
        eventType: "discover_reason_shown",
        payload: { profileId: row.profile.id, reasonId: reason.id }
      });
    }
  }

  // Best-effort: promote analytics to the platform event bus (server-side source of truth).
  void (async () => {
    try {
      if (!events.length) return;
      const response = await fetch(apiUrl("/api/member/data?action=discovery-event"), {
        method: "POST",
        headers: await memberApiHeaders(),
        body: JSON.stringify({ events })
      });
      await readResponseJson(response);
    } catch {
      // never block UI on observability
    }
  })();
}

export function recordDiscoveryOpen(profileId: string): void {
  trackEvent("discover_profile_opened", { profileId });
  void (async () => {
    try {
      const response = await fetch(apiUrl("/api/member/data?action=discovery-event"), {
        method: "POST",
        headers: await memberApiHeaders(),
        body: JSON.stringify({ eventType: "discover_profile_opened", payload: { profileId } })
      });
      await readResponseJson(response);
    } catch {
      /* ignore */
    }
  })();
}

export function recordDiscoverFilterChange(meta: Record<string, string>): void {
  trackEvent("discover_filter_changed", meta);
  void (async () => {
    try {
      const response = await fetch(apiUrl("/api/member/data?action=discovery-event"), {
        method: "POST",
        headers: await memberApiHeaders(),
        body: JSON.stringify({ eventType: "discover_filter_changed", payload: meta })
      });
      await readResponseJson(response);
    } catch {
      /* ignore */
    }
  })();
}

export function recordDiscoverSearch(query: string): void {
  trackEvent("discover_search", { q: query.slice(0, 60) });
  void (async () => {
    try {
      const response = await fetch(apiUrl("/api/member/data?action=discovery-event"), {
        method: "POST",
        headers: await memberApiHeaders(),
        body: JSON.stringify({ eventType: "discover_search", payload: { q: query.slice(0, 60) } })
      });
      await readResponseJson(response);
    } catch {
      /* ignore */
    }
  })();
}

