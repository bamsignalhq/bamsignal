/**
 * Privacy boundaries — Passport indexes trust; products own activity data.
 */

import type { PassportProductId } from "./types";

/** Data classes the Passport may store (summaries and references only). */
export type PassportDataClass =
  | "identity"
  | "trust_summary"
  | "trust_dimension"
  | "audit_reference"
  | "product_participation";

/** Data classes that MUST remain inside owning products — never duplicated in Passport. */
export type ProductOwnedDataClass =
  | "chats"
  | "wallets"
  | "listings"
  | "transactions"
  | "messages"
  | "preferences"
  | "relationship_history"
  | "financial_records"
  | "marketplace_data"
  | "media"
  | "signals";

export const PASSPORT_ALLOWED_DATA: readonly PassportDataClass[] = [
  "identity",
  "trust_summary",
  "trust_dimension",
  "audit_reference",
  "product_participation"
] as const;

export const PRODUCT_OWNED_DATA: readonly ProductOwnedDataClass[] = [
  "chats",
  "wallets",
  "listings",
  "transactions",
  "messages",
  "preferences",
  "relationship_history",
  "financial_records",
  "marketplace_data",
  "media",
  "signals"
] as const;

/** Which product owns which data classes — registry reference for privacy reviews. */
export const PRODUCT_DATA_OWNERSHIP: Partial<
  Record<PassportProductId, readonly ProductOwnedDataClass[]>
> = {
  bamsignal: ["chats", "messages", "preferences", "relationship_history", "media", "signals"],
  bayright: ["wallets", "transactions", "financial_records"],
  yike: ["listings", "transactions", "marketplace_data"]
};

export function isPassportDataClass(value: string): value is PassportDataClass {
  return (PASSPORT_ALLOWED_DATA as readonly string[]).includes(value);
}

export function isProductOwnedDataClass(value: string): value is ProductOwnedDataClass {
  return (PRODUCT_OWNED_DATA as readonly string[]).includes(value);
}

/** Guard: Passport must not persist product-owned payloads. */
export function assertNotProductOwnedPayload(
  dataClass: string,
  context = "passport write"
): void {
  if (isProductOwnedDataClass(dataClass) && import.meta.env.DEV) {
    console.warn(
      `[passport privacy] ${context}: "${dataClass}" is product-owned and must not be stored in Passport.`
    );
  }
}
