export type OperationStatus = "pending" | "active" | "paused" | "completed" | "archived";

export type OperationStage =
  | "application-received"
  | "consultation-scheduled"
  | "consultation-completed"
  | "consultant-assignment"
  | "application-review"
  | "approved"
  | "introduction-process"
  | "relationship-follow-up"
  | "marriage"
  | "legacy-archive";

export type OperationHealth =
  | "healthy"
  | "requires-attention"
  | "paused"
  | "completed"
  | "archived";

export type OperationTimelineEntry = {
  id: string;
  at: string;
  stage: OperationStage;
  label: string;
  detail?: string;
  actorName?: string;
};

export type ConciergeOperation = {
  operationId: string;
  memberId: string;
  journeyId: string;
  memberName: string;
  status: OperationStatus;
  currentStage: OperationStage;
  health: OperationHealth;
  assignedConsultantId?: string;
  assignedConsultantName?: string;
  timeline: OperationTimelineEntry[];
  createdAt: string;
  updatedAt: string;
};

export type OperationSummary = {
  operationId: string;
  memberName: string;
  journeyId: string;
  currentStage: OperationStage;
  status: OperationStatus;
  health: OperationHealth;
  assignedConsultantName?: string;
  lastTimelineLabel?: string;
  lastTimelineAt?: string;
};

/** Reserved for future products — not implemented. */
export type ConciergeOperationsFutureCapability =
  | "recommendations"
  | "ai-summaries"
  | "workflow-automation"
  | "regional-operations-teams";

export type ConciergeOperationsFutureConfig = {
  capability?: ConciergeOperationsFutureCapability;
  enabled?: boolean;
};
