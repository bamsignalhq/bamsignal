import type { ConciergeConsultantRoleId } from "./conciergeConsultantRoles";
import type {
  AssignmentConfidence,
  ConsultantAssignmentRule,
  RecommendationLevel,
  WorkloadHealth
} from "../types/consultantAssignment";

export const CONSULTANT_ASSIGNMENT_ENGINE_BRAND = "Consultant Assignment Engine™";

export const ASSIGNMENT_RULE_TARGET_ROLE: Record<ConsultantAssignmentRule, ConciergeConsultantRoleId> = {
  "legacy-member": "senior-matchmaker",
  "global-member": "diaspora-consultant",
  "compatibility-review": "compatibility-specialist",
  "family-journey": "family-values-advisor",
  "default-stewardship": "relationship-consultant"
};

export const ASSIGNMENT_RULE_LABELS: Record<ConsultantAssignmentRule, string> = {
  "legacy-member": "Legacy member stewardship",
  "global-member": "Global member stewardship",
  "compatibility-review": "Compatibility review",
  "family-journey": "Family journey depth",
  "default-stewardship": "Relationship stewardship"
};


export const RECOMMENDATION_LEVELS: RecommendationLevel[] = [
  "highly-recommended",
  "recommended",
  "available",
  "limited-capacity",
  "unavailable"
];

export const RECOMMENDATION_LEVEL_LABELS: Record<RecommendationLevel, string> = {
  "highly-recommended": "Highly Recommended",
  recommended: "Recommended",
  available: "Available",
  "limited-capacity": "Limited Capacity",
  unavailable: "Unavailable"
};

export const RECOMMENDATION_LEVEL_HINTS: Record<RecommendationLevel, string> = {
  "highly-recommended": "Strong specialization, region, tier, and workload fit.",
  recommended: "Good stewardship fit with balanced portfolio room.",
  available: "Can steward with acceptable fit — review workload.",
  "limited-capacity": "Portfolio busy — assign with operational oversight.",
  unavailable: "Not available for new assignments right now."
};

export const ASSIGNMENT_MATCH_FACTOR_LABELS: Record<
  import("../types/consultantAssignment").AssignmentMatchFactor,
  string
> = {
  "low-workload": "Low workload",
  "matching-specialization": "Matching specialization",
  "matching-location": "Matching location",
  "matching-tier": "Matching tier",
  "matching-relationship-goals": "Matching relationship goals"
};

export const ASSIGNMENT_CONFIDENCE_TO_LEVEL: Record<
  AssignmentConfidence,
  RecommendationLevel
> = {
  "strong-fit": "highly-recommended",
  "good-fit": "recommended",
  "available-fit": "available"
};

export const ASSIGNMENT_CONFIDENCE_LABELS: Record<AssignmentConfidence, string> = {
  "strong-fit": "Strong fit",
  "good-fit": "Good fit",
  "available-fit": "Available steward"
};

export const WORKLOAD_HEALTH_LEVELS: { id: WorkloadHealth; label: string; hint: string }[] = [
  { id: "healthy", label: "Healthy", hint: "Room for thoughtful stewardship." },
  { id: "busy", label: "Busy", hint: "Active portfolio — still available with care." },
  { id: "full", label: "Full", hint: "Portfolio near capacity — assign with oversight." },
  { id: "paused", label: "Paused", hint: "Consultant unavailable for new assignments." }
];

export const WORKLOAD_HEALTH_LABELS: Record<WorkloadHealth, string> = Object.fromEntries(
  WORKLOAD_HEALTH_LEVELS.map((level) => [level.id, level.label])
) as Record<WorkloadHealth, string>;

export const CONSULTANT_ASSIGNMENT_FUTURE_CAPABILITIES: {
  id: import("../types/consultantAssignment").ConsultantAssignmentFutureCapability;
  label: string;
}[] = [
  { id: "automatic-balancing", label: "Automatic balancing" },
  { id: "ai-recommendations", label: "AI recommendations" },
  { id: "regional-consultant-teams", label: "Regional consultant teams" },
  { id: "cross-border-specialists", label: "Cross-border specialists" }
];

/**
 * Future-ready architecture hooks — not implemented.
 * Wire `ConsultantAssignmentFutureConfig` into `recommendConsultantForMember` when ready.
 */
export const CONSULTANT_ASSIGNMENT_FUTURE_ARCHITECTURE = {
  automaticBalancing: "Re-rank consultants by portfolio health across the roster.",
  aiRecommendations: "Augment rule engine with narrative fit scoring.",
  regionalConsultantTeams: "Scope candidates by city/region before role matching.",
  crossBorderSpecialists: "Elevate diaspora consultants for relocation + global tier pairs."
} as const;
