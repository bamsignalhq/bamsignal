/**
 * Passport Evolution Model — long-term Living Digital Trust Passport philosophy.
 *
 * @see docs/architecture/TRUST_EVOLUTION_MODEL.md
 */

export type PassportEvolutionPhaseId =
  | "identity"
  | "verification"
  | "participation"
  | "contribution"
  | "consistency"
  | "confidence"
  | "legacy";

export type PassportEvolutionPhase = {
  id: PassportEvolutionPhaseId;
  label: string;
  order: number;
  description: string;
};

/** Documented evolution path — philosophy only, not a calculation pipeline. */
export const PASSPORT_EVOLUTION_PHASES: readonly PassportEvolutionPhase[] = [
  {
    id: "identity",
    label: "Identity",
    order: 1,
    description: "Immutable Passport ID bound to one human"
  },
  {
    id: "verification",
    label: "Verification",
    order: 2,
    description: "Identity and contact verification milestones"
  },
  {
    id: "participation",
    label: "Participation",
    order: 3,
    description: "Active engagement across Stankings products"
  },
  {
    id: "contribution",
    label: "Contribution",
    order: 4,
    description: "Trust signals contributed by participating products"
  },
  {
    id: "consistency",
    label: "Consistency",
    order: 5,
    description: "Sustained responsible behaviour over time"
  },
  {
    id: "confidence",
    label: "Confidence",
    order: 6,
    description: "Derived multi-dimensional trust confidence grows"
  },
  {
    id: "legacy",
    label: "Legacy",
    order: 7,
    description: "Long-term Stankings Legacy — lifelong digital trust journey"
  }
] as const;

export const LIVING_PASSPORT_PHILOSOPHY =
  "Identity is permanent. Trust is dynamic. Reputation evolves. Confidence grows. " +
  "The Stankings Digital Trust Passport is a Living Digital Trust Passport — " +
  "it tells the story of a person's growth, not just their current state.";

export const DYNAMIC_TRUST_PHILOSOPHY =
  "Trust summaries remain current. Historical events remain auditable. " +
  "The Passport must never permanently define a person by isolated mistakes.";

export function listEvolutionPhases(): PassportEvolutionPhase[] {
  return [...PASSPORT_EVOLUTION_PHASES].sort((a, b) => a.order - b.order);
}
