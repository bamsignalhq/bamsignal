import type { ConciergeConsultantRecord } from "../types/conciergeConsultantDirectory";
import type { RecommendationLevel, WorkloadHealth } from "../types/consultantAssignment";

export function deriveWorkloadHealth(
  consultant: ConciergeConsultantRecord,
  activeMembers: number,
  workloadScore: number
): WorkloadHealth {
  if (consultant.status !== "active") return "paused";
  if (activeMembers >= 8 || workloadScore >= 14) return "full";
  if (activeMembers >= 5 || workloadScore >= 9) return "busy";
  return "healthy";
}

export function deriveCapacityLevel(
  health: WorkloadHealth,
  workloadScore: number
): RecommendationLevel {
  if (health === "paused") return "unavailable";
  if (health === "full") return "limited-capacity";
  if (health === "busy") return workloadScore >= 11 ? "limited-capacity" : "available";
  return "available";
}
