/**
 * Contributor authorization — API key strategy with audit logging hooks.
 */

import crypto from "node:crypto";
import { query, isDatabaseReady } from "../../db.js";
import { PassportSignalAuthorizationError, PassportSignalDatabaseError } from "./errors.js";
import { logPassportSignalEvent } from "./observability.js";

const CONTRIBUTOR_ID_HEADER = "x-passport-contributor-id";
const CONTRIBUTOR_KEY_HEADER = "x-passport-contributor-key";

function hashApiKey(apiKey) {
  return crypto.createHash("sha256").update(String(apiKey)).digest("hex");
}

function apiKeyPrefix(apiKey) {
  return String(apiKey).slice(0, 8);
}

export function extractContributorAuth(req) {
  const contributorId = String(req.headers[CONTRIBUTOR_ID_HEADER] || "").trim().toLowerCase();
  const apiKey = String(req.headers[CONTRIBUTOR_KEY_HEADER] || "").trim();
  return { contributorId, apiKey };
}

export async function authorizeContributor(req) {
  const { contributorId, apiKey } = extractContributorAuth(req);
  if (!contributorId || !apiKey) {
    logPassportSignalEvent("passport_signal_auth_failed", {
      reason: "missing_credentials",
      contributorId: contributorId || null
    });
    throw new PassportSignalAuthorizationError("Missing contributor credentials");
  }

  if (!isDatabaseReady()) {
    throw new PassportSignalDatabaseError();
  }

  const result = await query(
    `select contributor_id, display_name, trust_domain, status, verification_level,
            allowed_signal_types, allowed_categories, capabilities, version_compatibility,
            api_key_hash, trust_contributor_ref
     from passport_signal_contributors
     where contributor_id = $1 and deleted_at is null
     limit 1`,
    [contributorId]
  );

  const row = result.rows[0];
  if (!row) {
    logPassportSignalEvent("passport_signal_auth_failed", { reason: "unknown_contributor", contributorId });
    throw new PassportSignalAuthorizationError("Unknown contributor");
  }

  if (row.status !== "active") {
    logPassportSignalEvent("passport_signal_auth_failed", {
      reason: "contributor_not_active",
      contributorId,
      status: row.status
    });
    throw new PassportSignalAuthorizationError("Contributor is not active");
  }

  const envKey = process.env[`PASSPORT_SIGNAL_CONTRIBUTOR_${contributorId.toUpperCase()}_KEY`];
  const expectedHash = row.api_key_hash || (envKey ? hashApiKey(envKey) : null);

  if (!expectedHash || hashApiKey(apiKey) !== expectedHash) {
    logPassportSignalEvent("passport_signal_auth_failed", { reason: "invalid_api_key", contributorId });
    throw new PassportSignalAuthorizationError("Invalid contributor API key");
  }

  return {
    contributorId: row.contributor_id,
    displayName: row.display_name,
    trustDomain: row.trust_domain,
    status: row.status,
    verificationLevel: row.verification_level,
    allowedSignalTypes: Array.isArray(row.allowed_signal_types) ? row.allowed_signal_types : [],
    allowedCategories: Array.isArray(row.allowed_categories) ? row.allowed_categories : [],
    capabilities: Array.isArray(row.capabilities) ? row.capabilities : [],
    versionCompatibility: row.version_compatibility,
    trustContributorRef: row.trust_contributor_ref
  };
}

export async function bootstrapContributorApiKey(contributorId, apiKey) {
  if (!isDatabaseReady() || !contributorId || !apiKey) return { ok: false, skipped: true };
  const hash = hashApiKey(apiKey);
  const prefix = apiKeyPrefix(apiKey);
  await query(
    `update passport_signal_contributors
     set api_key_hash = $2, api_key_prefix = $3, updated_at = now()
     where contributor_id = $1`,
    [contributorId, hash, prefix]
  );
  return { ok: true, contributorId, prefix };
}

export function contributorAllowsSignalType(contributor, signalType) {
  return contributor.allowedSignalTypes.includes(signalType);
}

export { CONTRIBUTOR_ID_HEADER, CONTRIBUTOR_KEY_HEADER, hashApiKey };
