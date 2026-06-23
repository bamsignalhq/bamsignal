import { useMemo, useState } from "react";
import {
  REMEDIATION_BOARD_ADMIN_PATH,
  REMEDIATION_BOARD_BRAND
} from "../../../constants/remediationBoardAdmin";
import {
  REMEDIATION_CATEGORIES,
  REMEDIATION_CATEGORY_LABELS,
  REMEDIATION_SEVERITIES,
  REMEDIATION_STATUSES,
  REMEDIATION_STATUS_LABELS
} from "../../../constants/remediationBoard";
import { LAUNCH_READINESS_ADMIN_PATH } from "../../../constants/launchReadiness";
import { navigateToPath } from "../../../constants/routes";
import type {
  RemediationCategoryId,
  RemediationSeverityId,
  RemediationStatusId
} from "../../../types/remediationBoard";
import {
  buildRemediationBoardBundle,
  resetRemediationBoardStatuses,
  updateRemediationFindingStatus
} from "../../../utils/remediationBoardEngine";
import { RemediationCard } from "./RemediationCard";
import { RemediationSummaryCard } from "./RemediationSummaryCard";
import { RiskOverviewCard } from "./RiskOverviewCard";

export function RemediationBoardPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [severityFilter, setSeverityFilter] = useState<RemediationSeverityId | "all">("all");
  const [statusFilter, setStatusFilter] = useState<RemediationStatusId | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<RemediationCategoryId | "all">("all");

  const bundle = useMemo(() => {
    void refreshKey;
    return buildRemediationBoardBundle();
  }, [refreshKey]);

  const filteredFindings = useMemo(() => {
    return bundle.findings.filter((finding) => {
      if (severityFilter !== "all" && finding.severity !== severityFilter) return false;
      if (statusFilter !== "all" && finding.status !== statusFilter) return false;
      if (categoryFilter !== "all" && finding.category !== categoryFilter) return false;
      return true;
    });
  }, [bundle.findings, categoryFilter, severityFilter, statusFilter]);

  function handleStatusChange(findingId: string, status: RemediationStatusId) {
    updateRemediationFindingStatus(findingId, status);
    setRefreshKey((value) => value + 1);
  }

  function handleReset() {
    resetRemediationBoardStatuses();
    setRefreshKey((value) => value + 1);
  }

  return (
    <div className="remediation-board-page">
      <header className="remediation-board-page__head">
        <div>
          <h2>{REMEDIATION_BOARD_BRAND}</h2>
          <p>
            Centralize institutional audit findings across Routes, Permissions, Journey Integrity,
            Persistence, Operations, CRM, Notifications, Safety, Executive, and Launch readiness.
          </p>
        </div>
        <div className="remediation-board-page__actions">
          <button
            type="button"
            className="concierge-consultant-btn concierge-consultant-btn--ghost"
            onClick={() => navigateToPath(LAUNCH_READINESS_ADMIN_PATH)}
          >
            Launch readiness
          </button>
          <button type="button" className="concierge-consultant-btn" onClick={handleReset}>
            Reset statuses
          </button>
        </div>
      </header>

      <RemediationSummaryCard metrics={bundle.metrics} generatedAt={bundle.generatedAt} />

      <div className="remediation-board-page__filters">
        <label className="remediation-board-filter">
          <span>Severity</span>
          <select
            value={severityFilter}
            onChange={(event) =>
              setSeverityFilter(event.target.value as RemediationSeverityId | "all")
            }
          >
            <option value="all">All severities</option>
            {REMEDIATION_SEVERITIES.map((severity) => (
              <option key={severity.id} value={severity.id}>
                {severity.label}
              </option>
            ))}
          </select>
        </label>

        <label className="remediation-board-filter">
          <span>Status</span>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as RemediationStatusId | "all")
            }
          >
            <option value="all">All statuses</option>
            {REMEDIATION_STATUSES.map((status) => (
              <option key={status.id} value={status.id}>
                {REMEDIATION_STATUS_LABELS[status.id]}
              </option>
            ))}
          </select>
        </label>

        <label className="remediation-board-filter">
          <span>Category</span>
          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value as RemediationCategoryId | "all")
            }
          >
            <option value="all">All categories</option>
            {REMEDIATION_CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {REMEDIATION_CATEGORY_LABELS[category.id]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="remediation-board-page__body">
        <div className="remediation-board-page__column remediation-board-page__column--wide">
          <section className="remediation-findings-list">
            <header className="remediation-findings-list__head">
              <h3>Findings ({filteredFindings.length})</h3>
              <p>Track remediation status — persisted in operator browser storage.</p>
            </header>
            <div className="remediation-findings-list__grid">
              {filteredFindings.length ? (
                filteredFindings.map((finding) => (
                  <RemediationCard
                    key={finding.id}
                    finding={finding}
                    onStatusChange={handleStatusChange}
                  />
                ))
              ) : (
                <p className="remediation-board-page__empty">No findings match the current filters.</p>
              )}
            </div>
          </section>
        </div>
        <div className="remediation-board-page__column">
          <RiskOverviewCard
            categorySummaries={bundle.categorySummaries}
            findings={bundle.findings}
          />
        </div>
      </div>

      <footer className="remediation-board-page__foot">
        <p>Admin path: {REMEDIATION_BOARD_ADMIN_PATH}</p>
      </footer>
    </div>
  );
}
