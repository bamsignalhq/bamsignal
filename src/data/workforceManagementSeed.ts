import type {
  ConsultantAssignmentRecord,
  ConsultantCapacityRecord,
  LeaveRequestRecord,
  RegionalAssignmentRecord,
  StaffingForecastRecord,
  WorkforceAvailabilitySlot,
  WorkforceProfileRecord,
  WorkforceTransferRecord
} from "../types/workforceManagement";

const NOW = "2026-06-20T10:00:00.000Z";

export const WORKFORCE_PROFILE_SEED: WorkforceProfileRecord[] = [
  {
    id: "a1000000-0000-4000-8000-000000000001",
    consultantId: "sc_consultant_ada",
    displayName: "Ada Okafor",
    roleId: "senior-matchmaker",
    employmentStatus: "active",
    office: "Lagos HQ",
    regionId: "nigeria",
    specialization: ["legacy", "introductions"],
    languages: ["English", "Igbo"],
    availability: "available",
    maxActiveJourneys: 14,
    currentWorkload: 9,
    experienceLevel: "senior",
    certifications: [{ id: "cert_001", name: "Legacy Stewardship", issuedAt: "2025-03-01T00:00:00.000Z" }],
    performanceSummary: { satisfactionScore: 4.8, completionRate: 0.92, responseTimeHours: 6 },
    createdAt: NOW,
    updatedAt: NOW,
    createdBy: "admin_seed",
    updatedBy: "admin_seed"
  },
  {
    id: "a1000000-0000-4000-8000-000000000002",
    consultantId: "sc_consultant_tunde",
    displayName: "Tunde Bakare",
    roleId: "diaspora-consultant",
    employmentStatus: "active",
    office: "London Hub",
    regionId: "united-kingdom",
    specialization: ["global", "diaspora"],
    languages: ["English", "Yoruba"],
    availability: "busy",
    maxActiveJourneys: 12,
    currentWorkload: 11,
    experienceLevel: "senior",
    certifications: [],
    performanceSummary: { satisfactionScore: 4.6, completionRate: 0.88, responseTimeHours: 8 },
    createdAt: NOW,
    updatedAt: NOW,
    createdBy: "admin_seed",
    updatedBy: "admin_seed"
  },
  {
    id: "a1000000-0000-4000-8000-000000000003",
    consultantId: "sc_consultant_chiamaka",
    displayName: "Chiamaka Eze",
    roleId: "family-values-advisor",
    employmentStatus: "on-leave",
    office: "Abuja",
    regionId: "nigeria",
    specialization: ["family-alignment", "legacy"],
    languages: ["English"],
    availability: "unavailable",
    maxActiveJourneys: 10,
    currentWorkload: 3,
    experienceLevel: "mid",
    certifications: [],
    performanceSummary: { satisfactionScore: 4.9, completionRate: 0.95, responseTimeHours: 5 },
    createdAt: NOW,
    updatedAt: NOW,
    createdBy: "admin_seed",
    updatedBy: "admin_seed"
  },
  {
    id: "a1000000-0000-4000-8000-000000000004",
    consultantId: "sc_consultant_ops",
    displayName: "Ngozi Adeyemi",
    roleId: "operations-coordinator",
    employmentStatus: "active",
    office: "Lagos HQ",
    regionId: "west-africa",
    specialization: ["scheduling", "handoffs"],
    languages: ["English", "French"],
    availability: "available",
    maxActiveJourneys: 0,
    currentWorkload: 4,
    experienceLevel: "lead",
    certifications: [],
    performanceSummary: { satisfactionScore: 4.7, responseTimeHours: 3 },
    createdAt: NOW,
    updatedAt: NOW,
    createdBy: "admin_seed",
    updatedBy: "admin_seed"
  }
];

export const WORKFORCE_AVAILABILITY_SEED: WorkforceAvailabilitySlot[] = [
  {
    id: "b1000000-0000-4000-8000-000000000001",
    profileId: "a1000000-0000-4000-8000-000000000001",
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "17:00",
    timezone: "Africa/Lagos",
    isAvailable: true,
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    id: "b1000000-0000-4000-8000-000000000002",
    profileId: "a1000000-0000-4000-8000-000000000002",
    dayOfWeek: 2,
    startTime: "10:00",
    endTime: "18:00",
    timezone: "Europe/London",
    isAvailable: true,
    createdAt: NOW,
    updatedAt: NOW
  }
];

export const WORKFORCE_CAPACITY_SEED: ConsultantCapacityRecord[] = [
  {
    id: "c1000000-0000-4000-8000-000000000001",
    profileId: "a1000000-0000-4000-8000-000000000001",
    consultantId: "sc_consultant_ada",
    capacityState: "busy",
    applicationsAssigned: 4,
    consultationsToday: 2,
    consultationsThisWeek: 8,
    activeJourneys: 9,
    followUpsPending: 3,
    introductionsPending: 2,
    memberSatisfaction: 4.8,
    availabilityScore: 0.72,
    vacationSchedule: [],
    workHours: { weekly: "40" },
    computedAt: NOW,
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    id: "c1000000-0000-4000-8000-000000000002",
    profileId: "a1000000-0000-4000-8000-000000000002",
    consultantId: "sc_consultant_tunde",
    capacityState: "near-capacity",
    applicationsAssigned: 3,
    consultationsToday: 3,
    consultationsThisWeek: 11,
    activeJourneys: 11,
    followUpsPending: 5,
    introductionsPending: 4,
    memberSatisfaction: 4.6,
    availabilityScore: 0.55,
    vacationSchedule: [],
    workHours: { weekly: "38" },
    computedAt: NOW,
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    id: "c1000000-0000-4000-8000-000000000003",
    profileId: "a1000000-0000-4000-8000-000000000003",
    consultantId: "sc_consultant_chiamaka",
    capacityState: "available",
    applicationsAssigned: 0,
    consultationsToday: 0,
    consultationsThisWeek: 0,
    activeJourneys: 3,
    followUpsPending: 1,
    introductionsPending: 0,
    memberSatisfaction: 4.9,
    availabilityScore: 0.1,
    vacationSchedule: [{ startsAt: "2026-06-18T00:00:00.000Z", endsAt: "2026-07-02T00:00:00.000Z", label: "Vacation" }],
    workHours: { weekly: "0" },
    computedAt: NOW,
    createdAt: NOW,
    updatedAt: NOW
  }
];

export const WORKFORCE_LEAVE_SEED: LeaveRequestRecord[] = [
  {
    id: "d1000000-0000-4000-8000-000000000001",
    profileId: "a1000000-0000-4000-8000-000000000003",
    leaveType: "vacation",
    status: "approved",
    startsAt: "2026-06-18T00:00:00.000Z",
    endsAt: "2026-07-02T00:00:00.000Z",
    capacityReduction: 1,
    notes: "Annual leave",
    approvedBy: "admin_seed",
    approvedAt: NOW,
    createdAt: NOW,
    updatedAt: NOW
  }
];

export const WORKFORCE_REGIONAL_SEED: RegionalAssignmentRecord[] = [
  {
    id: "e1000000-0000-4000-8000-000000000001",
    profileId: "a1000000-0000-4000-8000-000000000001",
    regionId: "nigeria",
    isPrimary: true,
    coverageCities: ["Lagos", "Abuja"],
    coverageCountries: ["Nigeria"],
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    id: "e1000000-0000-4000-8000-000000000002",
    profileId: "a1000000-0000-4000-8000-000000000002",
    regionId: "united-kingdom",
    isPrimary: true,
    coverageCities: ["London", "Manchester"],
    coverageCountries: ["United Kingdom"],
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    id: "e1000000-0000-4000-8000-000000000003",
    profileId: "a1000000-0000-4000-8000-000000000002",
    regionId: "europe",
    isPrimary: false,
    coverageCities: ["Paris"],
    coverageCountries: ["France"],
    createdAt: NOW,
    updatedAt: NOW
  }
];

export const WORKFORCE_TRANSFER_SEED: WorkforceTransferRecord[] = [
  {
    id: "f1000000-0000-4000-8000-000000000001",
    fromProfileId: "a1000000-0000-4000-8000-000000000003",
    toProfileId: "a1000000-0000-4000-8000-000000000001",
    status: "completed",
    transferredPayload: {
      journeys: ["BS-JR-2026-0012"],
      consultations: ["consult_001"],
      "meeting-history": ["meet_001"],
      notes: ["note_001"],
      communications: ["comm_001"],
      assignments: ["assign_001"],
      "audit-history": ["audit_001"]
    },
    auditRef: "audit_workforce_transfer_001",
    initiatedBy: "admin_seed",
    completedAt: NOW,
    createdAt: NOW,
    updatedAt: NOW
  }
];

export const WORKFORCE_ASSIGNMENT_SEED: ConsultantAssignmentRecord[] = [
  {
    id: "g1000000-0000-4000-8000-000000000001",
    profileId: "a1000000-0000-4000-8000-000000000001",
    consultantId: "sc_consultant_ada",
    memberId: "sc_member_new",
    journeyId: "BS-JR-2026-0099",
    assignmentType: "recommendation",
    status: "suggested",
    recommendationScore: 88,
    matchFactors: ["availability", "specialization", "city", "current-workload"],
    createdAt: NOW,
    updatedAt: NOW
  }
];

export const WORKFORCE_FORECAST_SEED: StaffingForecastRecord[] = [
  {
    id: "h1000000-0000-4000-8000-000000000001",
    regionId: "nigeria",
    forecastPeriod: "2026-Q3",
    projectedConsultationDemand: 180,
    consultantShortage: 2,
    estimatedHiringNeeds: 3,
    staffingPressureScore: 72,
    assumptions: { growthRate: 0.18, avgJourneysPerConsultant: 12 },
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    id: "h1000000-0000-4000-8000-000000000002",
    regionId: "united-kingdom",
    forecastPeriod: "2026-Q3",
    projectedConsultationDemand: 95,
    consultantShortage: 1,
    estimatedHiringNeeds: 2,
    staffingPressureScore: 58,
    assumptions: { growthRate: 0.12, avgJourneysPerConsultant: 10 },
    createdAt: NOW,
    updatedAt: NOW
  }
];
