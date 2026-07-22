/**
 * Consent architecture — Principle 7: Consent by Design.
 * No OAuth flows. Interfaces and local markers only.
 *
 * @see docs/architecture/DIGITAL_TRUST_CONSTITUTION.md
 */

import type { PassportApiScope, PassportApiConsentGrant } from "../externalApi";
import type { PassportId } from "../types";

const CONSENT_STORE_KEY = "stankings-passport-consent-grants-v1";
const CONSENT_AUDIT_KEY = "stankings-passport-consent-audit-v1";

export type ConsentGrantStatus = "active" | "expired" | "revoked";

export type ConsentGrantRecord = PassportApiConsentGrant & {
  status: ConsentGrantStatus;
  grantedBy: "user" | "legal_basis";
  purpose: string;
  consumerLabel: string;
};

export type ConsentAuditEntry = {
  id: string;
  passportId: PassportId;
  grantId: string;
  action: "granted" | "revoked" | "expired" | "accessed" | "denied";
  consumerId: string;
  scopes: PassportApiScope[];
  at: string;
};

export type ConsentRequest = {
  consumerId: string;
  consumerLabel: string;
  scopes: PassportApiScope[];
  purpose: string;
  expiresAt: string | null;
};

function readGrants(): ConsentGrantRecord[] {
  try {
    const raw = localStorage.getItem(CONSENT_STORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ConsentGrantRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeGrants(grants: ConsentGrantRecord[]): void {
  try {
    localStorage.setItem(CONSENT_STORE_KEY, JSON.stringify(grants));
  } catch {
    /* ignore */
  }
}

function appendConsentAudit(entry: ConsentAuditEntry): void {
  try {
    const raw = localStorage.getItem(CONSENT_AUDIT_KEY);
    const existing = raw ? (JSON.parse(raw) as ConsentAuditEntry[]) : [];
    localStorage.setItem(CONSENT_AUDIT_KEY, JSON.stringify([entry, ...existing].slice(0, 200)));
  } catch {
    /* ignore */
  }
}

function resolveGrantStatus(grant: ConsentGrantRecord): ConsentGrantStatus {
  if (grant.revokedAt) return "revoked";
  if (grant.expiresAt && new Date(grant.expiresAt) < new Date()) return "expired";
  return "active";
}

/** Prepared — record a user consent grant (local dev marker). */
export function recordConsentGrant(
  passportId: PassportId,
  request: ConsentRequest
): ConsentGrantRecord {
  const grant: ConsentGrantRecord = {
    grantId: `grant_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    passportId,
    consumerId: request.consumerId,
    scopes: request.scopes,
    grantedAt: new Date().toISOString(),
    expiresAt: request.expiresAt,
    revokedAt: null,
    status: "active",
    grantedBy: "user",
    purpose: request.purpose,
    consumerLabel: request.consumerLabel
  };
  writeGrants([grant, ...readGrants()]);
  appendConsentAudit({
    id: `ca_${Date.now()}`,
    passportId,
    grantId: grant.grantId,
    action: "granted",
    consumerId: request.consumerId,
    scopes: request.scopes,
    at: grant.grantedAt
  });
  return grant;
}

export function revokeConsentGrant(passportId: PassportId, grantId: string): boolean {
  const grants = readGrants();
  const idx = grants.findIndex((g) => g.grantId === grantId && g.passportId === passportId);
  if (idx < 0) return false;
  const revokedAt = new Date().toISOString();
  grants[idx] = { ...grants[idx], revokedAt, status: "revoked" };
  writeGrants(grants);
  appendConsentAudit({
    id: `ca_${Date.now()}`,
    passportId,
    grantId,
    action: "revoked",
    consumerId: grants[idx].consumerId,
    scopes: grants[idx].scopes,
    at: revokedAt
  });
  return true;
}

export function listConsentGrants(passportId: PassportId): ConsentGrantRecord[] {
  return readGrants()
    .filter((g) => g.passportId === passportId)
    .map((g) => ({ ...g, status: resolveGrantStatus(g) }));
}

export function listActiveConsentGrants(passportId: PassportId): ConsentGrantRecord[] {
  return listConsentGrants(passportId).filter((g) => g.status === "active");
}

export function getConsentAuditTrail(passportId: PassportId, limit = 50): ConsentAuditEntry[] {
  try {
    const raw = localStorage.getItem(CONSENT_AUDIT_KEY);
    if (!raw) return [];
    const entries = JSON.parse(raw) as ConsentAuditEntry[];
    return entries.filter((e) => e.passportId === passportId).slice(0, limit);
  } catch {
    return [];
  }
}

/** Validate scopes against active consent before external API access. */
export function consentCoversScopes(
  passportId: PassportId,
  grantId: string,
  requestedScopes: PassportApiScope[]
): boolean {
  const grant = listActiveConsentGrants(passportId).find((g) => g.grantId === grantId);
  if (!grant) return false;
  const allowed = new Set(grant.scopes);
  return requestedScopes.every((s) => allowed.has(s));
}
