import type { SignalConciergeTierId } from "../constants/signalConcierge";
import type { ConciergeConsultantRoleId } from "../constants/conciergeConsultantRoles";

export type ConciergeConsultantStatus = "invited" | "active" | "inactive" | "frozen";

export type ConciergeProfessionalChannel =
  | "microsoft-teams"
  | "zoom"
  | "google-meet"
  | "email"
  | "phone";

export type ConciergeConsultantActivityType =
  | "application-reviewed"
  | "consultation-completed"
  | "introduction-created"
  | "feedback-recorded"
  | "relationship-update"
  | "member-paused"
  | "member-resumed"
  | "case-closed"
  | "note-added"
  | "outcome-updated"
  | "member-assigned"
  | "member-reassigned"
  | "member-transferred"
  | "consultant-invited"
  | "consultant-activated"
  | "consultant-deactivated"
  | "consultant-frozen"
  | "meeting-scheduled"
  | "follow-up-scheduled"
  | "introduction-sent"
  | "search-resumed"
  | "portfolio-transferred"
  | "consultant-promoted"
  | "journey-transition"
  | "consultant-exit"
  | "portfolio-frozen";

export type ConciergeAuditActorRole = "admin" | "consultant";

export type ConciergeConsultantActivity = {
  id: string;
  consultantId: string;
  consultantName: string;
  memberId?: string;
  memberName?: string;
  type: ConciergeConsultantActivityType;
  label: string;
  detail?: string;
  changes?: string;
  actorId: string;
  actorName: string;
  actorRole: ConciergeAuditActorRole;
  at: string;
};

export type ConciergeScheduledMeeting = {
  id: string;
  memberId: string;
  memberName: string;
  consultantId: string;
  channel: ConciergeProfessionalChannel;
  scheduledAt: string;
  notes?: string;
  loggedAt: string;
  loggedByConsultantId: string;
};

export type ConciergeMemberConsultantSummary = {
  lines: string[];
  source: "manual" | "ai";
  updatedAt: string;
  updatedByConsultantId: string;
};

export type ConciergeConsultantMetrics = {
  activeMembers: number;
  introductionsMade: number;
  consultationsCompleted: number;
  matchesFormed: number;
  relationshipsFormed: number;
  engagements: number;
  marriages: number;
  responseTimeHours: number | null;
  memberSatisfaction: number | null;
};

export type ConciergeConsultantRecord = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: ConciergeConsultantStatus;
  roles: ConciergeConsultantRoleId[];
  primaryRole: ConciergeConsultantRoleId;
  tierFocus: SignalConciergeTierId[];
  bio?: string;
  invitedAt?: string;
  activatedAt?: string;
  frozenAt?: string;
  /** Set during exit protocol — portfolio awaiting journey transition. */
  portfolioFrozen?: boolean;
  exitProtocolAt?: string;
  /** Members always belong to BamSignal — consultants never own members. */
  memberOwnershipPolicy: "bamsignal";
  createdAt: string;
  updatedAt: string;
};

export type ConciergeConsultantDirectoryStore = {
  consultants: ConciergeConsultantRecord[];
  activity: ConciergeConsultantActivity[];
  meetings: ConciergeScheduledMeeting[];
  updatedAt: string;
};

/** Reserved specialist lanes — not implemented. */
export type ConciergeSpecialistFutureLane =
  | "relationship-coach"
  | "psychologist"
  | "family-value-advisor"
  | "diaspora-specialist"
  | "compatibility-analyst"
  | "ai-summary";

export type ConciergeSpecialistFutureConfig = {
  lane?: ConciergeSpecialistFutureLane;
  consultantId?: string;
  memberId?: string;
  enabled?: boolean;
};
