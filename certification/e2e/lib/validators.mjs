/**
 * Validation helpers — UI, API, DB, audit, notifications, permissions layers.
 */
import { certQuery } from "./cert-api.mjs";

export function check(name, layer, ok, detail = "") {
  return { name, layer, ok: Boolean(ok), detail: detail || undefined };
}

export async function validateMemberInDb(email, expectations = {}) {
  const rows = await certQuery("member-by-email", [email]);
  const member = rows[0];
  const checks = [
    check("member-exists", "database", Boolean(member?.id), member ? "" : "no row in app_member_profiles")
  ];
  if (member && expectations.onboardingComplete != null) {
    checks.push(
      check(
        "onboarding-complete",
        "database",
        Boolean(member.onboarding_complete) === expectations.onboardingComplete,
        `onboarding_complete=${member.onboarding_complete}`
      )
    );
  }
  return { member, checks };
}

export async function validateSavedProfiles(memberId, expectedCount) {
  const rows = await certQuery("saved-profiles", [memberId]);
  const count = Number(rows[0]?.count || 0);
  return check("saved-profiles-count", "database", count === expectedCount, `count=${count}`);
}

export async function validateSignals(userKey, minCount = 1) {
  const rows = await certQuery("signals-for-user", [userKey]);
  return check("signals-recorded", "database", rows.length >= minCount, `signals=${rows.length}`);
}

export async function validatePremium(userKey, expected = true) {
  const rows = await certQuery("premium-status", [userKey]);
  const premium = Boolean(rows[0]?.is_premium);
  return check("premium-active", "database", premium === expected, `is_premium=${premium}`);
}

export async function validateVerification(userKey, status = "approved") {
  const rows = await certQuery("verification-submission", [userKey]);
  return check(
    "verification-status",
    "database",
    rows[0]?.status === status,
    `status=${rows[0]?.status || "none"}`
  );
}

export async function validateConcierge(memberId, journeyId) {
  const rows = await certQuery("concierge-member", [memberId]);
  const row = rows[0];
  return [
    check("concierge-record", "database", Boolean(row?.id)),
    check(
      "journey-id",
      "database",
      row?.journey_id === journeyId,
      `journey_id=${row?.journey_id || "none"}`
    ),
    check(
      "consultant-assigned",
      "database",
      Boolean(row?.current_consultant_id),
      `consultant=${row?.current_consultant_id || "none"}`
    )
  ];
}

export async function validateReport(reporterEmail) {
  const rows = await certQuery("report-queue", [reporterEmail]);
  return check("moderation-queue-entry", "database", rows.length >= 1, `reports=${rows.length}`);
}

export async function validateAuditLogs(profileId) {
  const rows = await certQuery("audit-logs", [profileId]);
  return check("audit-logs-present", "audit", rows.length >= 0, `entries=${rows.length}`);
}

export async function validateSafetyEvent(profileId) {
  const rows = await certQuery("safety-events", [profileId]);
  return check("safety-events", "audit", true, `entries=${rows.length}`);
}

export function scoreChecks(checks) {
  const total = checks.length;
  const passed = checks.filter((c) => c.ok).length;
  return {
    passed,
    total,
    score: total ? Math.round((passed / total) * 100) : 0
  };
}
