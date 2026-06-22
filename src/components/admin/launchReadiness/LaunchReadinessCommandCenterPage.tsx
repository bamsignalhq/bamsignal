import { useMemo, useState } from "react";
import {
  LAUNCH_READINESS_BRAND,
  LAUNCH_READINESS_ADMIN_PATH,
  LAUNCH_READINESS_STATUS_LABELS,
  type LaunchReadinessStatusId
} from "../../../constants/launchReadiness";
import { AUDIT_CENTER_ADMIN_PATH } from "../../../constants/auditCenterAdmin";
import { navigateToPath } from "../../../constants/routes";
import { buildLaunchReadinessReport } from "../../../utils/launchReadinessEngine";
import { LaunchOverviewCard } from "./LaunchOverviewCard";
import { ReadinessCategoryCard } from "./ReadinessCategoryCard";
import { CriticalIssueCard } from "./CriticalIssueCard";
import { LaunchChecklistCard } from "./LaunchChecklistCard";
import { ReadinessTimelineCard } from "./ReadinessTimelineCard";

export function LaunchReadinessCommandCenterPage() {
  const [statusFilter, setStatusFilter] = useState<LaunchReadinessStatusId | "all">("all");
  const [refreshKey, setRefreshKey] = useState(0);

  const report = useMemo(() => {
    void refreshKey;
    return buildLaunchReadinessReport();
  }, [refreshKey]);

  const filteredCategories = useMemo(() => {
    if (statusFilter === "all") return report.categories;
    return report.categories.filter((category) => category.status === statusFilter);
  }, [report.categories, statusFilter]);

  return (
    <div className="launch-readiness-page">
      <header className="launch-readiness-page__head">
        <div>
          <h2>{LAUNCH_READINESS_BRAND}</h2>
          <p>
            Final institutional readiness dashboard — Routes, Database, Permissions, Journey Integrity,
            Payments, Scheduling, Notifications, Consultants, Support, Safety, Finance, Documents,
            Academy, Operations, and Executive. Read-only audit view — no operational actions.
          </p>
        </div>
        <button
          type="button"
          className="concierge-consultant-btn"
          onClick={() => setRefreshKey((value) => value + 1)}
        >
          Refresh audit
        </button>
      </header>

      <LaunchOverviewCard
        metrics={report.metrics}
        overallStatus={report.overallStatus}
        generatedAt={report.generatedAt}
      />

      <div className="launch-readiness-page__filters">
        <label className="launch-readiness-search-field">
          <span>Status filter</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as LaunchReadinessStatusId | "all")}
          >
            <option value="all">All statuses</option>
            {Object.entries(LAUNCH_READINESS_STATUS_LABELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="launch-readiness-page__body">
        <div className="launch-readiness-page__column">
          <ReadinessCategoryCard categories={filteredCategories} />
          <LaunchChecklistCard checklist={report.checklist} />
        </div>
        <div className="launch-readiness-page__column">
          <CriticalIssueCard issues={report.criticalIssues} />
          <ReadinessTimelineCard timeline={report.timeline} />
        </div>
      </div>

      <footer className="launch-readiness-page__foot">
        <p>Launch readiness path: {LAUNCH_READINESS_ADMIN_PATH}</p>
        <p>
          <button
            type="button"
            className="concierge-consultant-btn"
            onClick={() => navigateToPath(AUDIT_CENTER_ADMIN_PATH)}
          >
            Compliance audit
          </button>
        </p>
      </footer>
    </div>
  );
}
