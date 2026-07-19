/**
 * Centralized member visibility policy (Phase 3B).
 *
 * Discreet Membership is its own privacy mode — not Premium, not a feature toggle.
 * Passive exposure is forbidden. Visibility is opt-in by intentional contact only.
 * When uncertain, fail closed.
 */

import { isDatabaseReady, query } from "../db.js";

export const PRIVACY_MODE = Object.freeze({
  DISCOVER: "discover",
  DISCREET: "discreet"
});

export const VISIBILITY_CONTEXT = Object.freeze({
  /** Discover feed, search, nearby, city home, Fast Connection pool, public listings */
  PASSIVE_LISTING: "passive_listing",
  /** profile-by-id / deep link */
  DIRECT_PROFILE: "direct_profile",
  /** Signals inbox, matches, chat peers — relationship already exists */
  RELATIONSHIP: "relationship",
  /** Admin consoles */
  ADMIN: "admin"
});

function normalizePrivacyMode(value) {
  const mode = String(value || PRIVACY_MODE.DISCOVER)
    .trim()
    .toLowerCase();
  return mode === PRIVACY_MODE.DISCREET ? PRIVACY_MODE.DISCREET : PRIVACY_MODE.DISCOVER;
}

function parseUntil(value) {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
}

/**
 * Active Discreet privacy — fail closed when mode is discreet and not clearly expired.
 */
export function isDiscreetPrivacyActive(memberRow = {}) {
  if (!memberRow || typeof memberRow !== "object") return false;
  const mode = normalizePrivacyMode(memberRow.privacy_mode ?? memberRow.privacyMode);
  if (mode !== PRIVACY_MODE.DISCREET) return false;
  const untilMs = parseUntil(memberRow.discreet_until ?? memberRow.discreetUntil);
  if (untilMs == null) return true;
  return untilMs > Date.now();
}

/**
 * Single place that decides the `discoverable` column for writes.
 * Discreet always wins over client-provided discoverable / hideFromDiscovery.
 */
export function computeDiscoverableFlag({
  hideFromDiscovery = false,
  paused = false,
  accountStatus = "active",
  privacyMode = PRIVACY_MODE.DISCOVER,
  discreetUntil = null,
  clientDiscoverable = true
} = {}) {
  const status = String(accountStatus || "active");
  if (status === "deleted_pending" || status === "deleted" || status === "banned") {
    return false;
  }
  if (paused) return false;
  if (
    isDiscreetPrivacyActive({
      privacy_mode: privacyMode,
      discreet_until: discreetUntil
    })
  ) {
    return false;
  }
  if (hideFromDiscovery) return false;
  return clientDiscoverable !== false;
}

/**
 * SQL: subject has active Discreet privacy (used to EXCLUDE from passive listings).
 */
export function activeDiscreetPrivacySql(alias = "") {
  const p = alias ? `${alias}.` : "";
  return `(
    coalesce(${p}privacy_mode, 'discover') = 'discreet'
    and (${p}discreet_until is null or ${p}discreet_until > now())
  )`;
}

/**
 * Trust + Discreet gates for every passive listing query.
 * Prefer this over scattered discoverable / is_discreet checks.
 */
export function passiveListingVisibilitySql(alias = "") {
  const p = alias ? `${alias}.` : "";
  return `coalesce(${p}account_status, 'active') = 'active'
    and ${p}profile_paused_at is null
    and coalesce(${p}shadow_banned, false) = false
    and not ${activeDiscreetPrivacySql(alias)}`;
}

/** @deprecated Prefer passiveListingVisibilitySql — kept as alias for existing imports. */
export function discoverVisibilitySql(alias = "") {
  return passiveListingVisibilitySql(alias);
}

/**
 * Pure decision for listing eligibility (no DB). Fail closed if subject missing.
 */
export function mayAppearInPassiveListing(subject) {
  if (!subject || typeof subject !== "object") return false;
  const status = String(subject.account_status || subject.accountStatus || "active");
  if (status !== "active") return false;
  if (subject.profile_paused_at || subject.profilePausedAt) return false;
  if (subject.shadow_banned || subject.shadowBanned) return false;
  if (isDiscreetPrivacyActive(subject)) return false;
  if (subject.discoverable === false) return false;
  if (subject.city_home_hidden || subject.cityHomeHidden) return false;
  if (subject.onboarding_complete === false || subject.onboardingComplete === false) {
    return false;
  }
  return true;
}

/**
 * Intentional contact: Discreet subject initiated a signal to viewer, or they share a match.
 * Fail closed when identities are incomplete.
 */
export async function hasIntentionalContact({
  subjectUserKey,
  subjectProfileId,
  viewerUserKey,
  viewerProfileId
} = {}) {
  if (!isDatabaseReady()) return false;
  const subjectKey = String(subjectUserKey || "").trim();
  const viewerKey = String(viewerUserKey || "").trim();
  const subjectId = String(subjectProfileId || "").trim();
  const viewerId = String(viewerProfileId || "").trim();
  if (!subjectKey || !viewerKey || !subjectId || !viewerId) return false;
  if (subjectKey === viewerKey || subjectId === viewerId) return true;

  try {
    const signal = await query(
      `select id from app_signals
       where user_key = $1
         and target_profile_id = $2::uuid
         and status in ('pending', 'accepted')
       limit 1`,
      [subjectKey, viewerId]
    );
    if (signal.rows[0]) return true;

    const match = await query(
      `select id from app_matches
       where (
         (
           user_key = $1
           and (
             payload->>'profileId' = $2
             or profile_id::text = $2
           )
         )
         or (
           user_key = $3
           and (
             payload->>'profileId' = $4
             or profile_id::text = $4
           )
         )
       )
       limit 1`,
      [viewerKey, subjectId, subjectKey, viewerId]
    );
    if (match.rows[0]) return true;

    return false;
  } catch {
    return false;
  }
}

/**
 * Central allow/deny for profile visibility.
 * @returns {{ allowed: boolean, reason: string }}
 */
export async function evaluateMemberVisibility({
  subject,
  viewer = null,
  context = VISIBILITY_CONTEXT.DIRECT_PROFILE
} = {}) {
  if (!subject || typeof subject !== "object") {
    return { allowed: false, reason: "missing_subject" };
  }

  const status = String(subject.account_status || subject.accountStatus || "active");
  if (status === "banned" || status === "deleted" || status === "deleted_pending") {
    return { allowed: false, reason: `account_${status}` };
  }
  if (subject.shadow_banned || subject.shadowBanned) {
    return { allowed: false, reason: "shadow_banned" };
  }

  if (context === VISIBILITY_CONTEXT.ADMIN) {
    return { allowed: true, reason: "admin" };
  }

  if (context === VISIBILITY_CONTEXT.RELATIONSHIP) {
    return { allowed: true, reason: "relationship_context" };
  }

  if (context === VISIBILITY_CONTEXT.PASSIVE_LISTING) {
    return mayAppearInPassiveListing(subject)
      ? { allowed: true, reason: "passive_ok" }
      : { allowed: false, reason: "passive_blocked" };
  }

  // DIRECT_PROFILE (default): Discover members visible; Discreet only via intentional contact.
  if (!isDiscreetPrivacyActive(subject)) {
    if (subject.profile_paused_at || subject.profilePausedAt) {
      return { allowed: false, reason: "paused" };
    }
    return { allowed: true, reason: "discover_mode" };
  }

  if (!viewer || typeof viewer !== "object") {
    return { allowed: false, reason: "discreet_no_viewer" };
  }

  const contacted = await hasIntentionalContact({
    subjectUserKey: subject.user_key || subject.userKey,
    subjectProfileId: subject.id,
    viewerUserKey: viewer.user_key || viewer.userKey,
    viewerProfileId: viewer.id
  });
  if (!contacted) {
    return { allowed: false, reason: "discreet_no_intentional_contact" };
  }
  return { allowed: true, reason: "discreet_intentional_contact" };
}

/**
 * Filter profile rows that would passively expose a Discreet actor to a viewer.
 * Fail closed: omit when evaluation fails or contact is missing.
 */
export async function filterPassiveExposureRows(rows, viewer, mapSubject = (row) => row) {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  if (!viewer?.id || !(viewer.user_key || viewer.userKey)) return [];

  const out = [];
  for (const row of rows) {
    const subject = mapSubject(row);
    if (!subject) continue;
    if (!isDiscreetPrivacyActive(subject)) {
      out.push(row);
      continue;
    }
    const decision = await evaluateMemberVisibility({
      subject,
      viewer,
      context: VISIBILITY_CONTEXT.DIRECT_PROFILE
    });
    if (decision.allowed) out.push(row);
  }
  return out;
}
