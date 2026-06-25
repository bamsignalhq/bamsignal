/** Operational Capacity & Workforce Management™ — institutional staffing engine. */

export const WORKFORCE_MANAGEMENT_BRAND = "Operational Capacity & Workforce Management™";

export const WORKFORCE_ROLE_IDS = [
  "relationship-consultant",
  "senior-matchmaker",
  "compatibility-specialist",
  "family-values-advisor",
  "diaspora-consultant",
  "operations-coordinator",
  "support-specialist",
  "research-associate",
  "community-manager",
  "executive-assistant"
] as const;

export type WorkforceRoleId = (typeof WORKFORCE_ROLE_IDS)[number];

export const WORKFORCE_ROLE_LABELS: Record<WorkforceRoleId, string> = {
  "relationship-consultant": "Relationship Consultant",
  "senior-matchmaker": "Senior Matchmaker",
  "compatibility-specialist": "Compatibility Specialist",
  "family-values-advisor": "Family Values Advisor",
  "diaspora-consultant": "Diaspora Consultant",
  "operations-coordinator": "Operations Coordinator",
  "support-specialist": "Support Specialist",
  "research-associate": "Research Associate",
  "community-manager": "Community Manager",
  "executive-assistant": "Executive Assistant"
};

export const WORKFORCE_EMPLOYMENT_STATUSES = [
  "active",
  "on-leave",
  "part-time",
  "contract",
  "inactive"
] as const;

export type WorkforceEmploymentStatusId = (typeof WORKFORCE_EMPLOYMENT_STATUSES)[number];

export const WORKFORCE_EMPLOYMENT_STATUS_LABELS: Record<WorkforceEmploymentStatusId, string> = {
  active: "Active",
  "on-leave": "On leave",
  "part-time": "Part-time",
  contract: "Contract",
  inactive: "Inactive"
};

export const WORKFORCE_EXPERIENCE_LEVELS = ["junior", "mid", "senior", "lead"] as const;
export type WorkforceExperienceLevelId = (typeof WORKFORCE_EXPERIENCE_LEVELS)[number];

export const WORKFORCE_CAPACITY_STATES = [
  "available",
  "busy",
  "near-capacity",
  "at-capacity",
  "overloaded"
] as const;

export type WorkforceCapacityStateId = (typeof WORKFORCE_CAPACITY_STATES)[number];

export const WORKFORCE_CAPACITY_STATE_LABELS: Record<WorkforceCapacityStateId, string> = {
  available: "Available",
  busy: "Busy",
  "near-capacity": "Near Capacity",
  "at-capacity": "At Capacity",
  overloaded: "Overloaded"
};

export const WORKFORCE_LEAVE_TYPES = [
  "vacation",
  "medical-leave",
  "emergency-leave",
  "training",
  "conference",
  "sabbatical",
  "maternity",
  "paternity"
] as const;

export type WorkforceLeaveTypeId = (typeof WORKFORCE_LEAVE_TYPES)[number];

export const WORKFORCE_LEAVE_TYPE_LABELS: Record<WorkforceLeaveTypeId, string> = {
  vacation: "Vacation",
  "medical-leave": "Medical Leave",
  "emergency-leave": "Emergency Leave",
  training: "Training",
  conference: "Conference",
  sabbatical: "Sabbatical",
  maternity: "Maternity",
  paternity: "Paternity"
};

export const WORKFORCE_ACTIVE_REGIONS = [
  { id: "nigeria", label: "Nigeria" },
  { id: "west-africa", label: "West Africa" },
  { id: "united-kingdom", label: "United Kingdom" },
  { id: "europe", label: "Europe" },
  { id: "north-america", label: "North America" },
  { id: "middle-east", label: "Middle East" },
  { id: "australia", label: "Australia" }
] as const;

export type WorkforceRegionId = (typeof WORKFORCE_ACTIVE_REGIONS)[number]["id"];

export const WORKFORCE_REGION_LABELS: Record<WorkforceRegionId, string> = Object.fromEntries(
  WORKFORCE_ACTIVE_REGIONS.map((region) => [region.id, region.label])
) as Record<WorkforceRegionId, string>;

/** Documented only — not implemented in routing or assignment logic. */
export const WORKFORCE_FUTURE_REGIONS = [
  { id: "asia", label: "Asia" },
  { id: "south-america", label: "South America" }
] as const;

export const WORKFORCE_MATCH_FACTORS = [
  "availability",
  "specialization",
  "city",
  "country",
  "language",
  "current-workload",
  "member-preference",
  "relationship-type",
  "diaspora-experience",
  "family-specialization"
] as const;

export type WorkforceMatchFactorId = (typeof WORKFORCE_MATCH_FACTORS)[number];

export const WORKFORCE_MATCH_FACTOR_LABELS: Record<WorkforceMatchFactorId, string> = {
  availability: "Availability",
  specialization: "Specialization",
  city: "City",
  country: "Country",
  language: "Language",
  "current-workload": "Current workload",
  "member-preference": "Member preference",
  "relationship-type": "Relationship type",
  "diaspora-experience": "Diaspora experience",
  "family-specialization": "Family specialization"
};

export const WORKFORCE_TRANSFER_DOMAINS = [
  "journeys",
  "consultations",
  "meeting-history",
  "notes",
  "communications",
  "assignments",
  "audit-history"
] as const;

export type WorkforceTransferDomainId = (typeof WORKFORCE_TRANSFER_DOMAINS)[number];

export const WORKFORCE_TRANSFER_DOMAIN_LABELS: Record<WorkforceTransferDomainId, string> = {
  journeys: "Journeys",
  consultations: "Consultations",
  "meeting-history": "Meeting history",
  notes: "Notes",
  communications: "Communications",
  assignments: "Assignments",
  "audit-history": "Audit history"
};

export const WORKFORCE_DB_TABLES = [
  "workforce_profiles",
  "workforce_availability",
  "consultant_capacity",
  "consultant_assignments",
  "regional_assignments",
  "leave_requests",
  "workforce_transfers",
  "workforce_metrics",
  "staffing_forecasts"
] as const;
