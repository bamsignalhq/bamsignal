import { useMemo, useState } from "react";
import {
  LAUNCH_CHECKLIST_STATUS_LABELS,
  LAUNCH_CONTROL_FUTURE_ARCHITECTURE,
  LAUNCH_CONTROL_SECTIONS
} from "../../../constants/launchControlCenter";
import {
  LAUNCH_CONTROL_CENTER_ADMIN_BRAND,
  LAUNCH_CONTROL_CENTER_ADMIN_PATH
} from "../../../constants/launchControlCenterAdmin";
import type { LaunchControlSectionId } from "../../../constants/launchControlCenter";
import { buildLaunchControlCenterBundle } from "../../../utils/launchControlCenterEngine";
import { ApprovalCard } from "./ApprovalCard";
import { CriticalBlockerCard } from "./CriticalBlockerCard";
import { DependencyCard } from "./DependencyCard";
import { LaunchHealthCard } from "./LaunchHealthCard";
import { ReadinessCard } from "./ReadinessCard";
import { RiskCard } from "./RiskCard";
import { TimelineCard } from "./TimelineCard";

export function LaunchControlCenterPage() {
  const [section, setSection] = useState<LaunchControlSectionId>("readiness");
  const [refreshKey, setRefreshKey] = useState(0);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildLaunchControlCenterBundle(section);
  }, [section, refreshKey]);

  const showOverview = section === "readiness";
  const showReadiness = showOverview;
  const showChecklist = section === "launch-checklist";
  const showBlockers = showOverview || section === "critical-blockers";
  const showRisks =
    showOverview || section === "open-risks" || section === "resolved-risks";
  const showDependencies = showOverview || section === "dependencies";
  const showTimeline = showOverview || section === "launch-timeline";
  const showGoNoGo = showOverview || section === "go-no-go";

  return (
    <div className="launch-control-center-page">
      <header className="launch-control-center-page__head">
        <div>
          <h2>{LAUNCH_CONTROL_CENTER_ADMIN_BRAND}</h2>
          <p>
            Final operational cockpit before public launch. Every launch decision supported by
            measurable readiness across infrastructure, security, payments, consultants, governance,
            monitoring, compliance, backups, and training.
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

      <nav className="launch-control-center-page__sections" aria-label="Launch control sections">
        {LAUNCH_CONTROL_SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`launch-control-center-page__section-btn${
              section === item.id ? " is-active" : ""
            }`}
            onClick={() => setSection(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {showOverview ? <LaunchHealthCard summary={bundle.summary} /> : null}

      {showChecklist ? (
        <p className="launch-control-center-page__checklist-note">
          Checklist statuses: {LAUNCH_CHECKLIST_STATUS_LABELS.ready},{" "}
          {LAUNCH_CHECKLIST_STATUS_LABELS["needs-attention"]},{" "}
          {LAUNCH_CHECKLIST_STATUS_LABELS.blocked},{" "}
          {LAUNCH_CHECKLIST_STATUS_LABELS["not-started"]}
        </p>
      ) : null}

      <div className="launch-control-center-page__body">
        <div className="launch-control-center-page__column">
          {showReadiness ? <ReadinessCard items={bundle.readiness} /> : null}
          {showBlockers ? <CriticalBlockerCard blockers={bundle.blockers} /> : null}
          {showDependencies ? <DependencyCard dependencies={bundle.dependencies} /> : null}
        </div>
        <div className="launch-control-center-page__column">
          {showRisks ? <RiskCard risks={bundle.risks} /> : null}
          {showGoNoGo ? (
            <ApprovalCard
              summary={bundle.summary}
              approvals={bundle.approvals}
              recommendations={bundle.recommendations}
            />
          ) : null}
          {showTimeline ? <TimelineCard timeline={bundle.timeline} /> : null}
        </div>
      </div>

      <footer className="launch-control-center-page__future">
        <h4>Future architecture (documented only)</h4>
        <p>{LAUNCH_CONTROL_FUTURE_ARCHITECTURE.map((item) => item.label).join(" · ")}</p>
        <span>Route: {LAUNCH_CONTROL_CENTER_ADMIN_PATH}</span>
        <span>Generated {new Date(bundle.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
