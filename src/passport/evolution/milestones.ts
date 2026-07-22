/**
 * Passport Milestone registry — participation markers across the ecosystem.
 * Registry only — no automatic awarding in this sprint.
 *
 * @see docs/architecture/TRUST_EVOLUTION_MODEL.md
 */

export type PassportMilestoneId =
  | "first_verification"
  | "first_trust_contributor"
  | "first_marketplace_transaction"
  | "first_escrow_completion"
  | "transactions_100"
  | "community_actions_1000"
  | "five_years_active"
  | "ten_years_active"
  | "legacy_status";

export type PassportMilestoneDefinition = {
  id: PassportMilestoneId;
  label: string;
  description: string;
  category: "verification" | "participation" | "transaction" | "community" | "longevity" | "legacy";
};

export const PASSPORT_MILESTONE_REGISTRY: Record<
  PassportMilestoneId,
  PassportMilestoneDefinition
> = {
  first_verification: {
    id: "first_verification",
    label: "First Verification",
    description: "First identity or contact verification completed",
    category: "verification"
  },
  first_trust_contributor: {
    id: "first_trust_contributor",
    label: "First Trust Contributor",
    description: "First Stankings product linked as Trust Contributor",
    category: "participation"
  },
  first_marketplace_transaction: {
    id: "first_marketplace_transaction",
    label: "First Marketplace Transaction",
    description: "First completed marketplace transaction",
    category: "transaction"
  },
  first_escrow_completion: {
    id: "first_escrow_completion",
    label: "First Escrow Completion",
    description: "First successful escrow completion",
    category: "transaction"
  },
  transactions_100: {
    id: "transactions_100",
    label: "100 Successful Transactions",
    description: "One hundred successful transactions across marketplace products",
    category: "transaction"
  },
  community_actions_1000: {
    id: "community_actions_1000",
    label: "1000 Positive Community Actions",
    description: "One thousand positive community interactions",
    category: "community"
  },
  five_years_active: {
    id: "five_years_active",
    label: "Five Years Active",
    description: "Five years of active Passport participation",
    category: "longevity"
  },
  ten_years_active: {
    id: "ten_years_active",
    label: "Ten Years Active",
    description: "Ten years of active Passport participation",
    category: "longevity"
  },
  legacy_status: {
    id: "legacy_status",
    label: "Legacy Status",
    description: "Recognized long-term Stankings Legacy participation",
    category: "legacy"
  }
} as const;

export type PassportMilestoneRecord = {
  milestoneId: PassportMilestoneId;
  passportId: string;
  reachedAt: string;
  originProduct: string;
  headline: string;
};

export function getMilestoneDefinition(id: PassportMilestoneId): PassportMilestoneDefinition {
  return PASSPORT_MILESTONE_REGISTRY[id];
}

export function listMilestoneDefinitions(): PassportMilestoneDefinition[] {
  return Object.values(PASSPORT_MILESTONE_REGISTRY);
}
