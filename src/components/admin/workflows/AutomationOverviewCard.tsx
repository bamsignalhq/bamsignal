import type { WorkflowEngineSummary } from "../../../types/workflowEngine";
import { formatWorkflowSummaryLine } from "../../../utils/workflowEngineLogic";

type AutomationOverviewCardProps = {
  summary: WorkflowEngineSummary;
};

export function AutomationOverviewCard({ summary }: AutomationOverviewCardProps) {
  return (
    <section className="workflow-engine-card automation-overview-card concierge-consultant-card--glass cc-reveal">
      <header className="workflow-engine-card__head">
        <h3>Automation overview</h3>
        <p>
          Repetitive operational tasks execute automatically — no consultant should manually perform
          work the system can safely automate.
        </p>
      </header>
      <div className="automation-overview-card__score">
        <span>Coverage</span>
        <strong>{summary.automationCoveragePercent}%</strong>
      </div>
      <p className="workflow-engine-card__line">{formatWorkflowSummaryLine(summary)}</p>
      <div className="workflow-engine-card__grid">
        <article>
          <span>Active</span>
          <strong>{summary.activeWorkflows}</strong>
        </article>
        <article>
          <span>Paused</span>
          <strong>{summary.pausedWorkflows}</strong>
        </article>
        <article>
          <span>Disabled</span>
          <strong>{summary.disabledWorkflows}</strong>
        </article>
        <article>
          <span>Draft</span>
          <strong>{summary.draftWorkflows}</strong>
        </article>
        <article>
          <span>Runs / 24h</span>
          <strong>{summary.runsLast24h}</strong>
        </article>
        <article>
          <span>Failed / 24h</span>
          <strong>{summary.failedRunsLast24h}</strong>
        </article>
      </div>
    </section>
  );
}
