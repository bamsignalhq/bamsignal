/**
 * Stankings Digital Trust Passport — Constitutional Principles.
 *
 * These principles are the permanent governance contract for every implementation.
 * They are not enforced by algorithms — they guide architecture and future features.
 *
 * @see docs/architecture/DIGITAL_TRUST_CONSTITUTION.md
 */

export const CONSTITUTION_VERSION = "1.2.0" as const;

/** The constitutional principles of the Stankings Digital Trust Passport. */
export const CONSTITUTIONAL_PRINCIPLES = [
  {
    id: "one_human_one_passport",
    number: 1,
    title: "One Human, One Passport",
    summary: "Every human owns exactly one Passport. Passport IDs are immutable. Identity must never be duplicated."
  },
  {
    id: "products_contribute_not_own",
    number: 2,
    title: "Products Contribute, They Do Not Own",
    summary: "Products never own identity or trust. Products contribute signals. Passport derives understanding."
  },
  {
    id: "trust_is_explainable",
    number: 3,
    title: "Trust Is Explainable",
    summary: "Every trust conclusion must eventually be explainable — which signals, which products, and why."
  },
  {
    id: "trust_is_multidimensional",
    number: 4,
    title: "Trust Is Multi-Dimensional",
    summary: "Never reduce a person to one permanent score. Independent dimensions only."
  },
  {
    id: "products_own_their_data",
    number: 5,
    title: "Products Own Their Data",
    summary: "Passport owns summaries. Products own details. Passport stores references, not product databases."
  },
  {
    id: "user_visibility",
    number: 6,
    title: "User Visibility",
    summary: "Users must eventually see their Passport, trust dimensions, connected products, consent, and explanations."
  },
  {
    id: "consent_by_design",
    number: 7,
    title: "Consent by Design",
    summary: "External access requires authorization — scoped, expiring, revocable, and auditable."
  },
  {
    id: "right_to_challenge",
    number: 8,
    title: "Right to Challenge",
    summary: "Users may dispute incorrect verification, moderation, fraud flags, and reputation events."
  },
  {
    id: "human_oversight",
    number: 9,
    title: "Human Oversight",
    summary: "Passport assists human decision-making. It does not autonomously judge people in high-impact contexts."
  },
  {
    id: "ecosystem_first",
    number: 10,
    title: "Ecosystem First",
    summary: "New products integrate as Trust Contributors — never duplicate identity or trust systems."
  },
  {
    id: "trust_can_be_earned",
    number: 11,
    title: "Trust Can Be Earned",
    summary:
      "The Passport must never permanently define a person by isolated mistakes. " +
      "Trust evolves through verified identity, positive participation, responsible behaviour, " +
      "completed transactions, successful interactions, dispute resolution, and long-term consistency. " +
      "Historical events remain auditable; trust summaries remain current."
  },
  {
    id: "legacy_is_built",
    number: 12,
    title: "Legacy Is Built",
    summary:
      "Legacy recognizes sustained positive contribution over time. It cannot be purchased, granted arbitrarily, " +
      "or inherited. Legacy emerges from years of verified participation, responsible conduct, meaningful contribution, " +
      "and enduring trust. Legacy represents stewardship rather than status."
  }
] as const;

export type ConstitutionalPrincipleId = (typeof CONSTITUTIONAL_PRINCIPLES)[number]["id"];

/** Decision boundaries — what the Passport must NEVER do. */
export const PASSPORT_PROHIBITIONS = [
  "Never assign a single permanent life score",
  "Never manually override trust without audit trail",
  "Never store raw product payloads (chats, wallets, medical records)",
  "Never share data externally without consent or legal basis",
  "Never act as autonomous judge in employment, credit, or legal decisions",
  "Never duplicate identity across products",
  "Never opaque black-box trust without explainability path",
  "Never permanently define a person by isolated mistakes",
  "Never purchase, arbitrarily grant, or inherit Legacy recognition",
  "Never calculate Legacy directly as a score or trust dimension"
] as const;

/** Mission statement — constitution preamble. */
export const PASSPORT_MISSION =
  "The Stankings Digital Trust Passport is a transparent trust framework — not a score that judges people. " +
  "It helps humans and institutions make informed decisions with explainable, multi-dimensional confidence.";

export function getConstitutionalPrinciple(id: ConstitutionalPrincipleId) {
  return CONSTITUTIONAL_PRINCIPLES.find((p) => p.id === id);
}

export function listConstitutionalPrinciples() {
  return [...CONSTITUTIONAL_PRINCIPLES];
}
