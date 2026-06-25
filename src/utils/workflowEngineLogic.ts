import type {
  WorkflowEngineSummary,
  WorkflowHistoryRecord,
  WorkflowRecord,
  WorkflowStepLog
} from "../types/workflowEngine";
import type { WorkflowStatusId } from "../constants/workflowEngine";

export function buildWorkflowSummary(
  workflows: WorkflowRecord[],
  history: WorkflowHistoryRecord[]
): WorkflowEngineSummary {
  const activeWorkflows = workflows.filter((item) => item.status === "active").length;
  const pausedWorkflows = workflows.filter((item) => item.status === "paused").length;
  const disabledWorkflows = workflows.filter((item) => item.status === "disabled").length;
  const draftWorkflows = workflows.filter((item) => item.status === "draft").length;

  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recentRuns = history.filter((item) => new Date(item.startedAt).getTime() >= dayAgo);
  const failedRunsLast24h = recentRuns.filter((item) => item.status === "failed").length;

  const automatable = workflows.length;
  const automated = workflows.filter(
    (item) => item.status === "active" || item.status === "paused"
  ).length;
  const automationCoveragePercent = automatable
    ? Math.round((automated / automatable) * 100)
    : 0;

  return {
    totalWorkflows: workflows.length,
    activeWorkflows,
    pausedWorkflows,
    disabledWorkflows,
    draftWorkflows,
    runsLast24h: recentRuns.length,
    failedRunsLast24h,
    automationCoveragePercent
  };
}

export function filterWorkflowsByStatus(
  workflows: WorkflowRecord[],
  statusId: WorkflowStatusId | "all"
) {
  if (statusId === "all") return workflows;
  return workflows.filter((item) => item.status === statusId);
}

export function listActiveWorkflows(workflows: WorkflowRecord[]) {
  return workflows.filter((item) => item.status === "active");
}

export function listTriggersForWorkflow<T extends { workflowId: string; enabled: boolean }>(
  triggers: T[],
  workflowId: string
) {
  return triggers.filter((item) => item.workflowId === workflowId && item.enabled);
}

export function listActionsForWorkflow<
  T extends { workflowId: string; enabled: boolean; sequence: number }
>(actions: T[], workflowId: string) {
  return actions
    .filter((item) => item.workflowId === workflowId && item.enabled)
    .sort((left, right) => left.sequence - right.sequence);
}

export function pauseWorkflow(workflow: WorkflowRecord, actor: string): WorkflowRecord {
  if (workflow.status === "disabled") {
    throw new Error("Workflow engine violation: cannot pause disabled workflow");
  }
  return { ...workflow, status: "paused", ownerEmail: actor };
}

export function activateWorkflow(workflow: WorkflowRecord, actor: string): WorkflowRecord {
  if (workflow.status === "active") {
    throw new Error("Workflow engine violation: already active");
  }
  return { ...workflow, status: "active", ownerEmail: actor };
}

export function listStepLogsForRun(stepLogs: WorkflowStepLog[], runId: string) {
  return stepLogs.filter((item) => item.runId === runId);
}

export function formatWorkflowSummaryLine(summary: WorkflowEngineSummary): string {
  return `${summary.activeWorkflows} active · ${summary.runsLast24h} runs/24h · ${summary.automationCoveragePercent}% coverage`;
}
