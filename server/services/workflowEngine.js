/**
 * Automation & Workflow Engine™ — server-side workflow automation logic.
 */

export const WORKFLOW_ENGINE_DB_TABLES = [
  "workflow_definitions",
  "workflow_triggers",
  "workflow_actions",
  "workflow_run_history",
  "workflow_step_logs",
  "workflow_automation_snapshots"
];

export function getWorkflowEngineDatabaseTableManifest() {
  return WORKFLOW_ENGINE_DB_TABLES.map((tableName) => ({
    tableName,
    domain: "workflows",
    migrationRef: "0018_workflow_engine.sql",
    hasUuidPrimaryKey: true,
    auditFields: ["created_at", "updated_at", "created_by", "updated_by"]
  }));
}

export function canAccessWorkflowEngine(permissions = []) {
  return (
    permissions.includes("ManageOperations") ||
    permissions.includes("SystemAdministration") ||
    permissions.includes("ManageConsultants")
  );
}

export function buildWorkflowSummary(workflows, history) {
  const activeWorkflows = workflows.filter((item) => item.status === "active").length;
  const pausedWorkflows = workflows.filter((item) => item.status === "paused").length;
  const disabledWorkflows = workflows.filter((item) => item.status === "disabled").length;
  const draftWorkflows = workflows.filter((item) => item.status === "draft").length;

  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recentRuns = history.filter(
    (item) => new Date(item.startedAt).getTime() >= dayAgo
  );
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

export function filterWorkflowsByStatus(workflows, statusId) {
  if (!statusId || statusId === "all") return workflows;
  return workflows.filter((item) => item.status === statusId);
}

export function listActiveWorkflows(workflows) {
  return workflows.filter((item) => item.status === "active");
}

export function listTriggersForWorkflow(triggers, workflowId) {
  return triggers.filter((item) => item.workflowId === workflowId && item.enabled);
}

export function listActionsForWorkflow(actions, workflowId) {
  return actions
    .filter((item) => item.workflowId === workflowId && item.enabled)
    .sort((left, right) => left.sequence - right.sequence);
}

export function pauseWorkflow(workflow, actor) {
  if (workflow.status === "disabled") {
    throw new Error("Workflow engine violation: cannot pause disabled workflow");
  }
  return {
    ...workflow,
    status: "paused",
    updatedBy: actor
  };
}

export function activateWorkflow(workflow, actor) {
  if (workflow.status === "active") {
    throw new Error("Workflow engine violation: already active");
  }
  return {
    ...workflow,
    status: "active",
    updatedBy: actor
  };
}

export function formatWorkflowSummaryLine(summary) {
  return `${summary.activeWorkflows} active · ${summary.runsLast24h} runs/24h · ${summary.automationCoveragePercent}% coverage`;
}
