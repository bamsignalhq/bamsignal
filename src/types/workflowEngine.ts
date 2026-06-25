import type {
  WorkflowActionId,
  WorkflowDefinitionId,
  WorkflowRunStatusId,
  WorkflowStatusId,
  WorkflowTriggerId
} from "../constants/workflowEngine";

export type WorkflowRecord = {
  id: string;
  workflowRef: string;
  workflowId: WorkflowDefinitionId;
  title: string;
  status: WorkflowStatusId;
  ownerEmail: string;
  lastRunAt?: string;
  runCount: number;
  description?: string;
};

export type WorkflowTriggerRecord = {
  id: string;
  triggerRef: string;
  workflowId: WorkflowDefinitionId;
  triggerType: WorkflowTriggerId;
  config: Record<string, unknown>;
  enabled: boolean;
};

export type WorkflowActionRecord = {
  id: string;
  actionRef: string;
  workflowId: WorkflowDefinitionId;
  actionType: WorkflowActionId;
  sequence: number;
  config: Record<string, unknown>;
  enabled: boolean;
};

export type WorkflowHistoryRecord = {
  id: string;
  historyRef: string;
  workflowId: WorkflowDefinitionId;
  status: WorkflowRunStatusId;
  triggeredBy: string;
  triggerType: WorkflowTriggerId;
  startedAt: string;
  completedAt?: string;
  resultSummary?: string;
};

export type WorkflowStepLog = {
  id: string;
  runId: string;
  actionType: WorkflowActionId;
  status: WorkflowRunStatusId;
  detail: string;
  executedAt: string;
};

export type WorkflowEngineSummary = {
  totalWorkflows: number;
  activeWorkflows: number;
  pausedWorkflows: number;
  disabledWorkflows: number;
  draftWorkflows: number;
  runsLast24h: number;
  failedRunsLast24h: number;
  automationCoveragePercent: number;
};

export type WorkflowEngineBundle = {
  generatedAt: string;
  summary: WorkflowEngineSummary;
  workflows: WorkflowRecord[];
  triggers: WorkflowTriggerRecord[];
  actions: WorkflowActionRecord[];
  history: WorkflowHistoryRecord[];
  stepLogs: WorkflowStepLog[];
};
