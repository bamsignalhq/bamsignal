/**
 * External Passport API — abstraction interfaces only.
 * No HTTP implementation in this sprint.
 *
 * Future consumers (with user consent / legal basis):
 * government agencies, credit bureaus, financial institutions, employers,
 * insurance, education, marketplace partners.
 */

import type { PassportSummary } from "./types";

/** Scopes external consumers may request — never grants raw product data by default. */
export type PassportApiScope =
  | "identity.summary"
  | "trust.summary"
  | "trust.dimension.identity"
  | "trust.dimension.social"
  | "trust.dimension.financial"
  | "trust.dimension.marketplace"
  | "trust.dimension.ecosystem"
  | "products.participation"
  | "audit.recent"
  | "audit.security";

export type PassportApiConsentGrant = {
  grantId: string;
  passportId: string;
  consumerId: string;
  scopes: PassportApiScope[];
  grantedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
};

export type PassportApiRequestContext = {
  consumerId: string;
  scopes: PassportApiScope[];
  consentGrantId?: string;
  /** Legal basis reference when consent is not the basis (prepared). */
  legalBasisRef?: string;
};

export type PassportApiErrorCode =
  | "consent_required"
  | "scope_denied"
  | "passport_not_found"
  | "consumer_unauthorized";

export type PassportApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: PassportApiErrorCode; message: string };

/** Future server-side Passport API contract. */
export interface PassportExternalApiClient {
  fetchSummary(context: PassportApiRequestContext): Promise<PassportApiResult<PassportSummary>>;
}

/**
 * Local stub — returns client-built summary for development.
 * Replace with server client when Passport platform API ships.
 */
export const localPassportApiClient: PassportExternalApiClient = {
  async fetchSummary(context) {
    void context;
    const { buildPassportSummary } = await import("./summary");
    return { ok: true, data: buildPassportSummary() };
  }
};

/** Filter summary fields by authorized scopes — privacy enforcement at API boundary. */
export function filterSummaryByScopes(
  summary: PassportSummary,
  scopes: PassportApiScope[]
): Partial<PassportSummary> {
  const allowed = new Set(scopes);
  const filtered: Partial<PassportSummary> = {
    passportId: summary.passportId,
    generatedAt: summary.generatedAt
  };

  if (allowed.has("identity.summary")) {
    filtered.identity = summary.identity;
  }
  if (allowed.has("trust.summary")) {
    filtered.trust = summary.trust;
  } else {
    filtered.trust = {};
    if (allowed.has("trust.dimension.identity")) filtered.trust!.identity_trust = summary.trust?.identity_trust;
    if (allowed.has("trust.dimension.social")) filtered.trust!.social_trust = summary.trust?.social_trust;
    if (allowed.has("trust.dimension.financial")) filtered.trust!.financial_trust = summary.trust?.financial_trust;
    if (allowed.has("trust.dimension.marketplace")) filtered.trust!.marketplace_trust = summary.trust?.marketplace_trust;
    if (allowed.has("trust.dimension.ecosystem")) filtered.trust!.ecosystem_trust = summary.trust?.ecosystem_trust;
  }
  if (allowed.has("products.participation")) {
    filtered.products = summary.products;
  }
  if (allowed.has("audit.recent") || allowed.has("audit.security")) {
    filtered.timeline = summary.timeline;
  }

  return filtered;
}
