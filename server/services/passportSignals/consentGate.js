/**
 * Consent gate — server-side consent verification.
 */

import { query, isDatabaseReady } from "../../db.js";
import { validateConsentRef } from "./validation.js";

export async function lookupConsentGrant(consentRef, passportId, contributorId) {
  if (!isDatabaseReady()) return null;
  const result = await query(
    `select consent_ref, passport_id, contributor_id, status, expires_at, revoked_at
     from passport_consent_grants
     where consent_ref = $1 and deleted_at is null
     limit 1`,
    [consentRef]
  );
  const row = result.rows[0];
  if (!row) return null;
  if (row.passport_id !== passportId) return null;
  if (row.contributor_id !== contributorId && row.contributor_id !== "*") return null;
  if (row.revoked_at) return { ...row, status: "revoked" };
  return row;
}

export async function checkConsentGate(submission, contributor) {
  const consentResult = await validateConsentRef(
    submission.consentRef,
    submission.passportId,
    contributor.contributorId,
    lookupConsentGrant
  );

  return {
    allowed: consentResult.passed,
    consentRef: submission.consentRef || null,
    failureReason: consentResult.passed ? null : "consent_missing",
    checkedAt: new Date().toISOString(),
    humanOverrideRef: null
  };
}

export async function ensureContributorEmissionConsent(passportId, contributorId) {
  if (!isDatabaseReady()) return null;
  const consentRef = `contributor:${contributorId}:signal_emission`;
  await query(
    `insert into passport_consent_grants (
      consent_ref, passport_id, contributor_id, scopes, status, purpose
    ) values ($1, $2, $3, $4, 'active', $5)
    on conflict (consent_ref) do update set updated_at = now()`,
    [
      consentRef,
      passportId,
      contributorId,
      JSON.stringify(["signal.emission"]),
      "Contributor authorized signal emission"
    ]
  );
  return consentRef;
}
