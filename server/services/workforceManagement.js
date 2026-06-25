/**
 * Operational Capacity & Workforce Management™ — server-side logic and persistence.
 */

import { query, isDatabaseReady } from "../db.js";

export const WORKFORCE_CAPACITY_STATES = [
  "available",
  "busy",
  "near-capacity",
  "at-capacity",
  "overloaded"
];

export const WORKFORCE_TRANSFER_DOMAINS = [
  "journeys",
  "consultations",
  "meeting-history",
  "notes",
  "communications",
  "assignments",
  "audit-history"
];

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
];

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isActiveLeave(leave, at = new Date()) {
  if (leave.status !== "approved") return false;
  const start = Date.parse(leave.startsAt);
  const end = Date.parse(leave.endsAt);
  const now = at.getTime();
  return now >= start && now <= end;
}

export function computeLeaveCapacityReduction(leaves, at = new Date()) {
  const active = leaves.filter((leave) => isActiveLeave(leave, at));
  if (!active.length) return 0;
  return Math.min(
    1,
    active.reduce((sum, leave) => sum + asNumber(leave.capacityReduction, 1), 0)
  );
}

export function applyLeaveCapacityImpact(capacity, leaves, at = new Date()) {
  const reduction = computeLeaveCapacityReduction(leaves, at);
  if (!reduction) return capacity;
  return {
    ...capacity,
    availabilityScore: Math.max(0, asNumber(capacity.availabilityScore, 1) - reduction),
    capacityState: reduction >= 1 ? "available" : capacity.capacityState
  };
}

export function deriveCapacityState(input) {
  const {
    activeJourneys = 0,
    maxActiveJourneys = 12,
    followUpsPending = 0,
    introductionsPending = 0,
    consultationsToday = 0,
    availabilityScore = 1,
    employmentStatus = "active"
  } = input;

  if (employmentStatus === "inactive") {
    return "at-capacity";
  }

  if (employmentStatus === "on-leave" || availabilityScore <= 0.1) {
    return "at-capacity";
  }

  const workloadScore =
    activeJourneys + followUpsPending + introductionsPending + consultationsToday;
  const utilization = maxActiveJourneys > 0 ? activeJourneys / maxActiveJourneys : 0;

  if (utilization >= 1.1 || workloadScore >= maxActiveJourneys + 6) return "overloaded";
  if (utilization >= 1 || workloadScore >= maxActiveJourneys + 3) return "at-capacity";
  if (utilization >= 0.85 || workloadScore >= maxActiveJourneys) return "near-capacity";
  if (utilization >= 0.6 || workloadScore >= Math.ceil(maxActiveJourneys * 0.5)) return "busy";
  return "available";
}

export function buildCapacityMetrics(profile, workload = {}, leaves = [], at = new Date()) {
  const activeJourneys = asNumber(workload.activeJourneys, profile.currentWorkload ?? 0);
  const metrics = {
    profileId: profile.id,
    consultantId: profile.consultantId ?? null,
    applicationsAssigned: asNumber(workload.applicationsAssigned),
    consultationsToday: asNumber(workload.consultationsToday),
    consultationsThisWeek: asNumber(workload.consultationsThisWeek),
    activeJourneys,
    followUpsPending: asNumber(workload.followUpsPending),
    introductionsPending: asNumber(workload.introductionsPending),
    memberSatisfaction: workload.memberSatisfaction ?? profile.performanceSummary?.satisfactionScore ?? null,
    availabilityScore: 1,
    vacationSchedule: [],
    workHours: workload.workHours ?? {},
    capacityState: "available"
  };

  const leaveReduction = computeLeaveCapacityReduction(
    leaves.filter((leave) => leave.profileId === profile.id),
    at
  );
  metrics.availabilityScore = Math.max(0, 1 - leaveReduction);
  if (leaveReduction > 0) {
    metrics.vacationSchedule = leaves
      .filter((leave) => isActiveLeave(leave, at))
      .map((leave) => ({
        startsAt: leave.startsAt,
        endsAt: leave.endsAt,
        label: leave.leaveType
      }));
  }

  metrics.capacityState = deriveCapacityState({
    activeJourneys: metrics.activeJourneys,
    maxActiveJourneys: profile.maxActiveJourneys ?? 12,
    followUpsPending: metrics.followUpsPending,
    introductionsPending: metrics.introductionsPending,
    consultationsToday: metrics.consultationsToday,
    availabilityScore: metrics.availabilityScore,
    employmentStatus: profile.employmentStatus
  });

  if (leaveReduction >= 1 || profile.employmentStatus === "on-leave") {
    metrics.capacityState = "at-capacity";
  }

  return metrics;
}

function languageMatch(profileLanguages = [], memberLanguages = []) {
  if (!memberLanguages.length) return false;
  const normalized = profileLanguages.map((item) => String(item).toLowerCase());
  return memberLanguages.some((lang) => normalized.includes(String(lang).toLowerCase()));
}

function regionMatch(profile, regionalAssignments, memberCountry) {
  if (!memberCountry) return false;
  const country = String(memberCountry).toLowerCase();
  return regionalAssignments.some(
    (assignment) =>
      assignment.profileId === profile.id &&
      assignment.coverageCountries.some((item) => String(item).toLowerCase() === country)
  );
}

function cityMatch(regionalAssignments, profileId, memberCity) {
  if (!memberCity) return false;
  const city = String(memberCity).toLowerCase();
  return regionalAssignments.some(
    (assignment) =>
      assignment.profileId === profileId &&
      assignment.coverageCities.some((item) => String(item).toLowerCase() === city)
  );
}

export function scoreWorkforceRecommendation(profile, capacity, regionalAssignments, input = {}) {
  const factors = [];
  let score = 0;

  if (capacity.capacityState === "available" || capacity.capacityState === "busy") {
    factors.push("availability");
    score += 20;
  }

  if (profile.specialization?.length) {
    factors.push("specialization");
    score += 15;
  }

  if (cityMatch(regionalAssignments, profile.id, input.memberCity)) {
    factors.push("city");
    score += 12;
  }

  if (regionMatch(profile, regionalAssignments, input.memberCountry)) {
    factors.push("country");
    score += 12;
  }

  if (languageMatch(profile.languages, input.memberLanguages)) {
    factors.push("language");
    score += 10;
  }

  if (capacity.activeJourneys < profile.maxActiveJourneys * 0.75) {
    factors.push("current-workload");
    score += 10;
  }

  if (input.memberPreference && profile.specialization.includes(input.memberPreference)) {
    factors.push("member-preference");
    score += 8;
  }

  if (input.relationshipType && profile.specialization.includes(input.relationshipType)) {
    factors.push("relationship-type");
    score += 8;
  }

  if (input.needsDiasporaExperience && profile.roleId === "diaspora-consultant") {
    factors.push("diaspora-experience");
    score += 12;
  }

  if (input.needsFamilySpecialization && profile.roleId === "family-values-advisor") {
    factors.push("family-specialization");
    score += 12;
  }

  if (capacity.capacityState === "near-capacity") score -= 8;
  if (capacity.capacityState === "at-capacity" || capacity.capacityState === "overloaded") score -= 25;
  if (profile.employmentStatus !== "active") score -= 40;

  return {
    profileId: profile.id,
    displayName: profile.displayName,
    roleId: profile.roleId,
    score: Math.max(0, Math.min(100, score)),
    capacityState: capacity.capacityState,
    matchFactors: factors,
    narrative: `Recommended with score ${Math.max(0, Math.min(100, score))} — admin confirmation required.`
  };
}

export function rankWorkforceRecommendations(profiles, capacities, regionalAssignments, input = {}) {
  const capacityByProfile = Object.fromEntries(capacities.map((item) => [item.profileId, item]));
  return profiles
    .map((profile) =>
      scoreWorkforceRecommendation(
        profile,
        capacityByProfile[profile.id] ?? buildCapacityMetrics(profile),
        regionalAssignments,
        input
      )
    )
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score);
}

export function assertTransferPayloadComplete(payload) {
  for (const domain of WORKFORCE_TRANSFER_DOMAINS) {
    if (!Array.isArray(payload?.[domain])) {
      throw new Error(`Workforce transfer integrity violation: missing ${domain}`);
    }
  }
}

export function assertTransferPayloadImmutable(previous, next) {
  for (const domain of WORKFORCE_TRANSFER_DOMAINS) {
    const prior = previous?.[domain] ?? [];
    const current = next?.[domain] ?? [];
    if (current.length < prior.length) {
      throw new Error(`Workforce transfer integrity violation: ${domain} cannot shrink`);
    }
    for (let index = 0; index < prior.length; index += 1) {
      if (prior[index] !== current[index]) {
        throw new Error(`Workforce transfer integrity violation: ${domain} history cannot change`);
      }
    }
  }
}

export function buildTransferRecord(input) {
  const payload = { ...input.transferredPayload };
  assertTransferPayloadComplete(payload);
  return {
    id: input.id,
    fromProfileId: input.fromProfileId,
    toProfileId: input.toProfileId,
    status: input.status ?? "completed",
    transferredPayload: payload,
    auditRef: input.auditRef ?? null,
    initiatedBy: input.initiatedBy ?? null,
    completedAt: input.completedAt ?? new Date().toISOString(),
    createdAt: input.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: input.createdBy ?? null,
    updatedBy: input.updatedBy ?? null
  };
}

export function buildStaffingForecast(regionId, profiles, capacities, period = "next-quarter") {
  const regionalProfiles = profiles.filter((profile) => profile.regionId === regionId);
  const capacityByProfile = Object.fromEntries(capacities.map((item) => [item.profileId, item]));
  const activeConsultants = regionalProfiles.filter((profile) => profile.employmentStatus === "active");
  const projectedConsultationDemand = Math.max(
    20,
    activeConsultants.reduce((sum, profile) => {
      const capacity = capacityByProfile[profile.id];
      return sum + asNumber(capacity?.consultationsThisWeek, 4) * 4;
    }, 0)
  );
  const availableCapacity = activeConsultants.reduce((sum, profile) => {
    const capacity = capacityByProfile[profile.id];
    const remaining = Math.max(0, profile.maxActiveJourneys - asNumber(capacity?.activeJourneys, 0));
    return sum + remaining;
  }, 0);
  const consultantShortage = Math.max(0, Math.ceil(projectedConsultationDemand / 12) - activeConsultants.length);
  const estimatedHiringNeeds = consultantShortage + (consultantShortage > 0 ? 1 : 0);
  const staffingPressureScore = Math.min(
    100,
    Math.round((projectedConsultationDemand / Math.max(1, availableCapacity)) * 35)
  );

  return {
    regionId,
    forecastPeriod: period,
    projectedConsultationDemand,
    consultantShortage,
    estimatedHiringNeeds,
    staffingPressureScore,
    assumptions: {
      avgJourneysPerConsultant: 12,
      activeConsultants: activeConsultants.length,
      availableCapacity
    }
  };
}

export function mapWorkforceProfileRow(row) {
  return {
    id: row.id,
    consultantId: row.consultant_id ?? undefined,
    displayName: row.display_name,
    roleId: row.role_id,
    employmentStatus: row.employment_status,
    office: row.office ?? undefined,
    regionId: row.region_id,
    specialization: row.specialization ?? [],
    languages: row.languages ?? [],
    availability: row.availability,
    maxActiveJourneys: row.max_active_journeys,
    currentWorkload: row.current_workload,
    experienceLevel: row.experience_level,
    certifications: row.certifications ?? [],
    performanceSummary: row.performance_summary ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by ?? undefined,
    updatedBy: row.updated_by ?? undefined
  };
}

export async function listWorkforceProfilesFromDatabase() {
  if (!isDatabaseReady()) return [];
  const result = await query(
    `select * from workforce_profiles order by display_name asc`
  );
  return result.rows.map(mapWorkforceProfileRow);
}

export async function upsertWorkforceProfile(profile) {
  if (!isDatabaseReady()) {
    throw new Error("database_not_ready");
  }

  await query(
    `insert into workforce_profiles (
      id, consultant_id, display_name, role_id, employment_status, office, region_id,
      specialization, languages, availability, max_active_journeys, current_workload,
      experience_level, certifications, performance_summary, created_at, updated_at,
      created_by, updated_by
    ) values (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::jsonb, $15::jsonb,
      coalesce($16::timestamptz, now()), now(), $17::uuid, $18::uuid
    )
    on conflict (id) do update set
      consultant_id = excluded.consultant_id,
      display_name = excluded.display_name,
      role_id = excluded.role_id,
      employment_status = excluded.employment_status,
      office = excluded.office,
      region_id = excluded.region_id,
      specialization = excluded.specialization,
      languages = excluded.languages,
      availability = excluded.availability,
      max_active_journeys = excluded.max_active_journeys,
      current_workload = excluded.current_workload,
      experience_level = excluded.experience_level,
      certifications = excluded.certifications,
      performance_summary = excluded.performance_summary,
      updated_at = now(),
      updated_by = excluded.updated_by`,
    [
      profile.id,
      profile.consultantId ?? null,
      profile.displayName,
      profile.roleId,
      profile.employmentStatus,
      profile.office ?? null,
      profile.regionId,
      profile.specialization ?? [],
      profile.languages ?? [],
      profile.availability ?? "available",
      profile.maxActiveJourneys ?? 12,
      profile.currentWorkload ?? 0,
      profile.experienceLevel ?? "mid",
      JSON.stringify(profile.certifications ?? []),
      JSON.stringify(profile.performanceSummary ?? {}),
      profile.createdAt ?? null,
      profile.createdBy ?? null,
      profile.updatedBy ?? null
    ]
  );

  return profile;
}

export function getWorkforceDatabaseTableManifest() {
  return WORKFORCE_DB_TABLES.map((tableName) => ({
    tableName,
    migrationRef: "0005_workforce_management.sql",
    hasUuidPrimaryKey: true,
    auditFields: ["created_at", "updated_at", "created_by", "updated_by"]
  }));
}
