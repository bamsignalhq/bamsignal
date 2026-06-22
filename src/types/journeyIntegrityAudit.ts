import type { JourneyHealthStatusId, JourneyStageId } from "../constants/journeyIntegrityAudit";

export type JourneyStageCheck = {
  stageId: JourneyStageId;
  present: boolean;
  status: JourneyHealthStatusId;
  source: string;
  note: string | null;
};

export type JourneyRecord = {
  id: string;
  journeyId: string;
  memberId: string | null;
  status: JourneyHealthStatusId;
  stages: JourneyStageCheck[];
  sources: string[];
  note: string | null;
};

export type JourneyDependency = {
  id: string;
  journeyId: string;
  system: string;
  recordType: string;
  linked: boolean;
  status: JourneyHealthStatusId;
  note: string | null;
};

export type JourneyIntegrityIssue = {
  id: string;
  kind:
    | "missing-journey-id"
    | "duplicate-journey-id"
    | "broken-link"
    | "orphan-record"
    | "timeline-inconsistency"
    | "archive-inconsistency";
  title: string;
  summary: string;
  status: JourneyHealthStatusId;
  journeyIds: string[];
};

export type JourneyRepairRecommendation = {
  id: string;
  title: string;
  summary: string;
  priority: "high" | "medium" | "low";
  journeyId: string | null;
};

export type JourneyHealthMetric = {
  status: JourneyHealthStatusId;
  count: number;
};

export type JourneyIntegrityReport = {
  generatedAt: string;
  journeys: JourneyRecord[];
  dependencies: JourneyDependency[];
  issues: JourneyIntegrityIssue[];
  recommendations: JourneyRepairRecommendation[];
  metrics: JourneyHealthMetric[];
  totalJourneys: number;
};
