/**
 * Stankings Digital Trust Passport — lifecycle stages.
 * Lifecycle communicates maturity — not rankings. Never replaces trust dimensions.
 *
 * @see docs/architecture/TRUST_EVOLUTION_MODEL.md
 */

/** Lifecycle stage — descriptive maturity, not a score. */
export type PassportLifecycleStageId =
  | "anonymous"
  | "registered"
  | "verified"
  | "trusted"
  | "established"
  | "distinguished";

export type PassportLifecycleStage = {
  id: PassportLifecycleStageId;
  label: string;
  order: number;
  description: string;
};

/**
 * Documented lifecycle progression — no calculations in this sprint.
 * Identity is permanent; lifecycle reflects participation maturity over time.
 */
export const PASSPORT_LIFECYCLE_STAGES: readonly PassportLifecycleStage[] = [
  {
    id: "anonymous",
    label: "Anonymous",
    order: 1,
    description: "Passport not yet bound or minimally registered"
  },
  {
    id: "registered",
    label: "Registered",
    order: 2,
    description: "Passport created and bound to a human identity anchor"
  },
  {
    id: "verified",
    label: "Verified",
    order: 3,
    description: "Core identity verification milestones completed"
  },
  {
    id: "trusted",
    label: "Trusted",
    order: 4,
    description: "Positive participation across one or more trust dimensions"
  },
  {
    id: "established",
    label: "Established",
    order: 5,
    description: "Sustained participation and consistency across products"
  },
  {
    id: "distinguished",
    label: "Distinguished",
    order: 6,
    description: "Notable ecosystem contribution and long-term good standing"
  }
] as const;

export function getLifecycleStage(id: PassportLifecycleStageId): PassportLifecycleStage {
  const stage = PASSPORT_LIFECYCLE_STAGES.find((s) => s.id === id);
  if (!stage) throw new Error(`Unknown lifecycle stage: ${id}`);
  return stage;
}

export function listLifecycleStages(): PassportLifecycleStage[] {
  return [...PASSPORT_LIFECYCLE_STAGES].sort((a, b) => a.order - b.order);
}
