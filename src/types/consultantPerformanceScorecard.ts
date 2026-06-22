import type {
  ConsultantAchievementId,
  ConsultantFutureRankingKind
} from "../constants/consultantPerformanceScorecard";

export type ConsultantResponseQuality = "excellent" | "good" | "needs-attention" | "unknown";

export type ConsultantRelationshipMetrics = {
  consultationsCompleted: number;
  applicationsReviewed: number;
  introductionsMade: number;
  followUpsCompleted: number;
  relationshipsFormed: number;
  exclusiveRelationships: number;
  engagements: number;
  marriages: number;
  legacyArchives: number;
  responseTimeHours: number | null;
  memberSatisfaction: number | null;
  retentionRate: number | null;
};

export type ConsultantHealthSnapshot = {
  activeMembers: number;
  workload: number;
  pendingFollowUps: number;
  upcomingMeetings: number;
  responseQuality: ConsultantResponseQuality;
};

export type ConsultantAchievement = {
  id: ConsultantAchievementId;
  label: string;
  earned: boolean;
  progress: number;
  target: number;
};

export type ConsultantJourneyOutcome = {
  id: string;
  label: string;
  count: number;
};

export type ConsultantPerformanceTrend = {
  label: string;
  value: number;
  unit?: string;
};

export type ConsultantFutureRankings = {
  enabled?: boolean;
  kinds?: ConsultantFutureRankingKind[];
};

export type ConsultantPerformanceScorecard = {
  consultantId: string;
  consultantName: string;
  relationshipMetrics: ConsultantRelationshipMetrics;
  health: ConsultantHealthSnapshot;
  achievements: ConsultantAchievement[];
  strengths: string[];
  journeyOutcomes: ConsultantJourneyOutcome[];
  trends: ConsultantPerformanceTrend[];
  futureRankings?: ConsultantFutureRankings;
};
