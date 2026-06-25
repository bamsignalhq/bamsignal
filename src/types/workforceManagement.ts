import type {
  WorkforceCapacityStateId,
  WorkforceEmploymentStatusId,
  WorkforceExperienceLevelId,
  WorkforceLeaveTypeId,
  WorkforceMatchFactorId,
  WorkforceRegionId,
  WorkforceRoleId,
  WorkforceTransferDomainId
} from "../constants/workforceManagement";

export type WorkforceCertification = {
  id: string;
  name: string;
  issuedAt: string;
  expiresAt?: string;
};

export type WorkforcePerformanceSummary = {
  satisfactionScore?: number;
  completionRate?: number;
  responseTimeHours?: number;
  notes?: string;
};

export type WorkforceProfileRecord = {
  id: string;
  consultantId?: string;
  displayName: string;
  roleId: WorkforceRoleId;
  employmentStatus: WorkforceEmploymentStatusId;
  office?: string;
  regionId: WorkforceRegionId;
  specialization: string[];
  languages: string[];
  availability: string;
  maxActiveJourneys: number;
  currentWorkload: number;
  experienceLevel: WorkforceExperienceLevelId;
  certifications: WorkforceCertification[];
  performanceSummary: WorkforcePerformanceSummary;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
};

export type WorkforceAvailabilitySlot = {
  id: string;
  profileId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
};

export type ConsultantCapacityRecord = {
  id: string;
  profileId: string;
  consultantId?: string;
  capacityState: WorkforceCapacityStateId;
  applicationsAssigned: number;
  consultationsToday: number;
  consultationsThisWeek: number;
  activeJourneys: number;
  followUpsPending: number;
  introductionsPending: number;
  memberSatisfaction?: number;
  availabilityScore: number;
  vacationSchedule: Array<{ startsAt: string; endsAt: string; label: string }>;
  workHours: Record<string, string>;
  computedAt: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
};

export type ConsultantAssignmentRecord = {
  id: string;
  profileId: string;
  consultantId?: string;
  memberId?: string;
  journeyId?: string;
  assignmentType: "recommendation" | "confirmed";
  status: "suggested" | "accepted" | "declined" | "expired";
  recommendationScore?: number;
  matchFactors: WorkforceMatchFactorId[];
  decidedBy?: string;
  decidedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
};

export type RegionalAssignmentRecord = {
  id: string;
  profileId: string;
  regionId: WorkforceRegionId;
  isPrimary: boolean;
  coverageCities: string[];
  coverageCountries: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
};

export type LeaveRequestRecord = {
  id: string;
  profileId: string;
  leaveType: WorkforceLeaveTypeId;
  status: "pending" | "approved" | "rejected" | "cancelled";
  startsAt: string;
  endsAt: string;
  capacityReduction: number;
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
};

export type WorkforceTransferPayload = Partial<Record<WorkforceTransferDomainId, string[]>>;

export type WorkforceTransferRecord = {
  id: string;
  fromProfileId: string;
  toProfileId: string;
  status: "pending" | "completed" | "failed";
  transferredPayload: WorkforceTransferPayload;
  auditRef?: string;
  initiatedBy?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
};

export type WorkforceMetricRecord = {
  id: string;
  metricKey: string;
  metricValue: number;
  metricUnit?: string;
  regionId?: WorkforceRegionId;
  snapshotAt: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
};

export type StaffingForecastRecord = {
  id: string;
  regionId: WorkforceRegionId;
  forecastPeriod: string;
  projectedConsultationDemand: number;
  consultantShortage: number;
  estimatedHiringNeeds: number;
  staffingPressureScore: number;
  assumptions: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
};

export type WorkforceRecommendationInput = {
  memberCity?: string;
  memberCountry?: string;
  memberLanguages?: string[];
  memberPreference?: string;
  relationshipType?: string;
  needsDiasporaExperience?: boolean;
  needsFamilySpecialization?: boolean;
};

export type WorkforceRecommendation = {
  profileId: string;
  displayName: string;
  roleId: WorkforceRoleId;
  score: number;
  capacityState: WorkforceCapacityStateId;
  matchFactors: WorkforceMatchFactorId[];
  narrative: string;
};

export type WorkforceOverviewMetric = {
  id: string;
  label: string;
  value: string;
  hint?: string;
};

export type WorkforceCapacityHeatmapCell = {
  profileId: string;
  displayName: string;
  regionId: WorkforceRegionId;
  capacityState: WorkforceCapacityStateId;
  activeJourneys: number;
  maxActiveJourneys: number;
};

export type WorkforceManagementBundle = {
  generatedAt: string;
  overviewMetrics: WorkforceOverviewMetric[];
  profiles: WorkforceProfileRecord[];
  capacity: ConsultantCapacityRecord[];
  availability: WorkforceAvailabilitySlot[];
  leaveRequests: LeaveRequestRecord[];
  regionalAssignments: RegionalAssignmentRecord[];
  transfers: WorkforceTransferRecord[];
  recommendations: WorkforceRecommendation[];
  forecasts: StaffingForecastRecord[];
  heatmap: WorkforceCapacityHeatmapCell[];
};
