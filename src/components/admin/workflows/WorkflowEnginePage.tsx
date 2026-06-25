import { useMemo, useState } from "react";
import {
  WORKFLOW_FUTURE_ARCHITECTURE,
  WORKFLOW_STATUSES,
  WORKFLOW_STATUS_LABELS
} from "../../../constants/workflowEngine";
import {
  WORKFLOW_ENGINE_ADMIN_BRAND,
  WORKFLOW_ENGINE_ADMIN_PATH
} from "../../../constants/workflowEngineAdmin";
import type { WorkflowStatusId } from "../../../constants/workflowEngine";
import { buildWorkflowEngineBundle } from "../../../utils/workflowEngineEngine";
import { AutomationOverviewCard } from "./AutomationOverviewCard";
import { WorkflowActionCard } from "./WorkflowActionCard";
import { WorkflowCard } from "./WorkflowCard";
import { WorkflowHistoryCard } from "./WorkflowHistoryCard";
import { WorkflowTriggerCard } from "./WorkflowTriggerCard";

export function WorkflowEnginePage() {
  const [statusFilter, setStatusFilter] = useState<WorkflowStatusId | "all">("all");
  const [refreshKey, setRefreshKey] = useState(0);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildWorkflowEngineBundle(statusFilter);
  }, [statusFilter, refreshKey]);

  const showOverview = statusFilter === "all";

  return (
    <div className="workflow-engine-page">
      <header className="workflow-engine-page__head">
        <div>
          <h2>{WORKFLOW_ENGINE_ADMIN_BRAND}</h2>
          <p>
            Institutional operational automation — repetitive tasks execute automatically so
            consultants focus on relationship care, not manual system work the platform can safely
            handle.
          </p>
        </div>
        <button
          type="button"
          className="concierge-consultant-btn"
          onClick={() => setRefreshKey((value) => value + 1)}
        >
          Refresh
        </button>
      </header>

      <nav className="workflow-engine-page__filters" aria-label="Workflow status filters">
        <button
          type="button"
          className={`workflow-engine-page__filter-btn${statusFilter === "all" ? " is-active" : ""}`}
          onClick={() => setStatusFilter("all")}
        >
          All
        </button>
        {WORKFLOW_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            className={`workflow-engine-page__filter-btn${
              statusFilter === status ? " is-active" : ""
            }`}
            onClick={() => setStatusFilter(status)}
          >
            {WORKFLOW_STATUS_LABELS[status]}
          </button>
        ))}
      </nav>

      {showOverview ? <AutomationOverviewCard summary={bundle.summary} /> : null}

      <div className="workflow-engine-page__body">
        <div className="workflow-engine-page__column">
          <WorkflowCard workflows={bundle.workflows} />
          <WorkflowTriggerCard triggers={bundle.triggers} />
        </div>
        <div className="workflow-engine-page__column">
          <WorkflowActionCard actions={bundle.actions} />
          <WorkflowHistoryCard history={bundle.history} stepLogs={bundle.stepLogs} />
        </div>
      </div>

      <footer className="workflow-engine-page__future">
        <h4>Future architecture (documented only)</h4>
        <p>{WORKFLOW_FUTURE_ARCHITECTURE.map((item) => item.label).join(" · ")}</p>
        <span>Route: {WORKFLOW_ENGINE_ADMIN_PATH}</span>
        <span>Generated {new Date(bundle.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
