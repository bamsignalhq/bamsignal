/** Consultant Academy™ — internal training and certification system. */

export const CONSULTANT_ACADEMY_BRAND = "Consultant Academy™";

export type AcademyTrackId =
  | "relationship-consultant"
  | "senior-matchmaker"
  | "compatibility-specialist"
  | "family-values-advisor"
  | "diaspora-consultant"
  | "operations-coordinator";

export type AcademyModuleId =
  | "mission-culture"
  | "signal-concierge-process"
  | "consultation-excellence"
  | "compatibility-reviews"
  | "introductions"
  | "relationship-follow-up"
  | "documentation-standards"
  | "safety-escalations"
  | "privacy-confidentiality"
  | "operations-excellence";

export type CertificationLevelId =
  | "trainee"
  | "certified"
  | "advanced"
  | "senior"
  | "master-steward";

export type ModuleProgressStatusId = "not-started" | "in-progress" | "completed";

export type PromotionReadinessId = "not-ready" | "developing" | "ready";

export type AcademyMetricId =
  | "modules-completed"
  | "certification-status"
  | "training-hours"
  | "assessment-scores"
  | "promotion-readiness";

export const ACADEMY_TRACKS: {
  id: AcademyTrackId;
  label: string;
  hint: string;
}[] = [
  { id: "relationship-consultant", label: "Relationship Consultant", hint: "Core concierge relationship consulting." },
  { id: "senior-matchmaker", label: "Senior Matchmaker", hint: "Advanced matchmaking and introduction leadership." },
  { id: "compatibility-specialist", label: "Compatibility Specialist", hint: "Deep compatibility review expertise." },
  { id: "family-values-advisor", label: "Family Values Advisor", hint: "Family alignment and values counseling." },
  { id: "diaspora-consultant", label: "Diaspora Consultant", hint: "Cross-border corridor consulting." },
  { id: "operations-coordinator", label: "Operations Coordinator", hint: "Operations center coordination and runbooks." }
];

export const ACADEMY_TRACK_LABELS: Record<AcademyTrackId, string> = Object.fromEntries(
  ACADEMY_TRACKS.map((item) => [item.id, item.label])
) as Record<AcademyTrackId, string>;

export const ACADEMY_MODULES: {
  id: AcademyModuleId;
  label: string;
  hours: number;
}[] = [
  { id: "mission-culture", label: "Mission & Culture", hours: 4 },
  { id: "signal-concierge-process", label: "Signal Concierge Process", hours: 6 },
  { id: "consultation-excellence", label: "Consultation Excellence", hours: 8 },
  { id: "compatibility-reviews", label: "Compatibility Reviews", hours: 6 },
  { id: "introductions", label: "Introductions", hours: 5 },
  { id: "relationship-follow-up", label: "Relationship Follow-Up", hours: 5 },
  { id: "documentation-standards", label: "Documentation Standards", hours: 3 },
  { id: "safety-escalations", label: "Safety & Escalations", hours: 4 },
  { id: "privacy-confidentiality", label: "Privacy & Confidentiality", hours: 4 },
  { id: "operations-excellence", label: "Operations Excellence", hours: 5 }
];

export const ACADEMY_MODULE_LABELS: Record<AcademyModuleId, string> = Object.fromEntries(
  ACADEMY_MODULES.map((item) => [item.id, item.label])
) as Record<AcademyModuleId, string>;

export const CERTIFICATION_LEVELS: {
  id: CertificationLevelId;
  label: string;
}[] = [
  { id: "trainee", label: "Trainee" },
  { id: "certified", label: "Certified" },
  { id: "advanced", label: "Advanced" },
  { id: "senior", label: "Senior" },
  { id: "master-steward", label: "Master Steward" }
];

export const CERTIFICATION_LEVEL_LABELS: Record<CertificationLevelId, string> = Object.fromEntries(
  CERTIFICATION_LEVELS.map((item) => [item.id, item.label])
) as Record<CertificationLevelId, string>;

export const PROMOTION_READINESS_LABELS: Record<PromotionReadinessId, string> = {
  "not-ready": "Not ready",
  developing: "Developing",
  ready: "Ready"
};

export const ACADEMY_METRICS: {
  id: AcademyMetricId;
  label: string;
}[] = [
  { id: "modules-completed", label: "Modules completed" },
  { id: "certification-status", label: "Certification status" },
  { id: "training-hours", label: "Training hours" },
  { id: "assessment-scores", label: "Assessment scores" },
  { id: "promotion-readiness", label: "Promotion readiness" }
];

/**
 * Future-ready academy capabilities — documented only, not implemented.
 */
export const CONSULTANT_ACADEMY_FUTURE_KINDS = [
  { id: "video-learning", label: "Video learning" },
  { id: "live-workshops", label: "Live workshops" },
  { id: "mentorship", label: "Mentorship" }
] as const;

export const ACADEMY_MODULE_COUNT = ACADEMY_MODULES.length;
