/**
 * Reserved Stankings Passport prefix namespaces — permanent platform contract.
 * Only SKL is active; others are architectural reservations.
 *
 * @see docs/architecture/PASSPORT_IDENTIFIER_STANDARD.md
 */

export type PassportPrefixId = "SKL" | "SKB" | "SKO" | "SKG" | "SKA";

export type PassportPrefixStatus = "active" | "reserved";

export type PassportPrefixDefinition = {
  prefix: PassportPrefixId;
  /** Official Passport type label for documentation and UI. */
  passportType: string;
  meaning: string;
  status: PassportPrefixStatus;
  example: string;
};

/** SKL officially stands for Stankings Legacy — the individual human Passport. */
export const PASSPORT_PREFIX_SKL_MEANING = "Stankings Legacy" as const;

/**
 * Official namespace registry — advance maturity here, never invent parallel prefix systems.
 * Platform contract as of Passport Foundation v1.0.
 */
export const PASSPORT_PREFIX_REGISTRY: Record<PassportPrefixId, PassportPrefixDefinition> = {
  SKL: {
    prefix: "SKL",
    passportType: "Individual Digital Trust Passport",
    meaning: PASSPORT_PREFIX_SKL_MEANING,
    status: "active",
    example: "SKL-4A7D-9XQ2"
  },
  SKB: {
    prefix: "SKB",
    passportType: "Business Digital Trust Passport",
    meaning: "Stankings Business Legacy",
    status: "reserved",
    example: "SKB-7Q8M-TP42"
  },
  SKO: {
    prefix: "SKO",
    passportType: "Organization Digital Trust Passport",
    meaning: "Stankings Organization Legacy",
    status: "reserved",
    example: "SKO-M7X4-RP82"
  },
  SKG: {
    prefix: "SKG",
    passportType: "Government Digital Trust Passport",
    meaning: "Stankings Government Legacy",
    status: "reserved",
    example: "SKG-KP92-WQ84"
  },
  SKA: {
    prefix: "SKA",
    passportType: "Autonomous Agent Digital Trust Passport",
    meaning: "Stankings Autonomous Legacy",
    status: "reserved",
    example: "SKA-TM84-QP73"
  }
} as const;

/** Active prefix for newly issued individual Passports. */
export const ACTIVE_INDIVIDUAL_PASSPORT_PREFIX: PassportPrefixId = "SKL";

export function getPassportPrefixDefinition(prefix: string): PassportPrefixDefinition | null {
  const key = prefix.toUpperCase() as PassportPrefixId;
  return PASSPORT_PREFIX_REGISTRY[key] ?? null;
}

export function listPassportPrefixes(activeOnly = false): PassportPrefixDefinition[] {
  return Object.values(PASSPORT_PREFIX_REGISTRY).filter((p) => !activeOnly || p.status === "active");
}

export function isReservedPassportPrefix(prefix: string): boolean {
  return prefix.toUpperCase() in PASSPORT_PREFIX_REGISTRY;
}

export function isActivePassportPrefix(prefix: string): boolean {
  const def = getPassportPrefixDefinition(prefix);
  return def?.status === "active";
}
