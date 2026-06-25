import type { WorkflowEngineBundle } from "../types/workflowEngine";
import type { WorkflowStatusId } from "../constants/workflowEngine";
import { buildWorkflowSummary, filterWorkflowsByStatus } from "./workflowEngineLogic";
import {
  listWorkflowActions,
  listWorkflowHistory,
  listWorkflowStepLogs,
  listWorkflowTriggers,
  listWorkflows
} from "./workflowEngineStore";

export function buildWorkflowEngineBundle(
  statusFilter: WorkflowStatusId | "all" = "all"
): WorkflowEngineBundle {
  const workflows = listWorkflows();
  const history = listWorkflowHistory();

  return {
    generatedAt: new Date().toISOString(),
    summary: buildWorkflowSummary(workflows, history),
    workflows: filterWorkflowsByStatus(workflows, statusFilter),
    triggers: listWorkflowTriggers(),
    actions: listWorkflowActions(),
    history,
    stepLogs: listWorkflowStepLogs()
  };
}
