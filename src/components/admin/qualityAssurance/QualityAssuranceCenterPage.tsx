import { useCallback, useEffect, useMemo, useState } from "react";
import {
  QA_CERTIFICATION_REFRESH_INTERVAL_MS,
  QA_CERTIFICATION_SECTIONS
} from "../../../constants/qualityAssuranceCenter";
import {
  QA_CERTIFICATION_CENTER_ADMIN_BRAND,
  QA_CERTIFICATION_CENTER_ADMIN_PATH
} from "../../../constants/qualityAssuranceCenterAdmin";
import type { QACertificationSectionId, QAReportTypeId } from "../../../constants/qualityAssuranceCenter";
import { buildLiveQACertificationCenterBundle } from "../../../utils/qualityAssuranceCenterEngine";
import { filterGatesBySection } from "../../../utils/qualityAssuranceCenterLogic";
import { generateQAReport } from "../../../utils/qualityAssuranceCenterStore";
import { QAAutomatedTestsCard } from "./QAAutomatedTestsCard";
import { QACertificationPanelCard } from "./QACertificationPanelCard";
import { QACertificationSummaryCard } from "./QACertificationSummaryCard";
import { QAManualQACard } from "./QAManualQACard";
import { QAReleaseGatesCard } from "./QAReleaseGatesCard";
import { QAReportsCard } from "./QAReportsCard";

export function QualityAssuranceCenterPage() {
  const [section, setSection] = useState<QACertificationSectionId>("certification-summary");
  const [refreshKey, setRefreshKey] = useState(0);
  const [busyReport, setBusyReport] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildLiveQACertificationCenterBundle();
  }, [refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(refresh, QA_CERTIFICATION_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [refresh]);

  const sectionGates = useMemo(
    () => filterGatesBySection(bundle.releaseGates, section),
    [bundle.releaseGates, section]
  );

  const handleGenerateReport = useCallback(
    (reportId: QAReportTypeId) => {
      setBusyReport(reportId);
      try {
        generateQAReport(reportId, "qa@bamsignal.com");
        setToast(`${reportId.replace(/-/g, " ")} generated.`);
        refresh();
      } finally {
        setBusyReport(null);
      }
    },
    [refresh]
  );

  const showAutomated = section === "automated-tests";
  const showManual = section === "manual-qa";
  const showCertification = section === "certification-summary";

  return (
    <div className="qa-certification-center-page">
      <header className="qa-certification-center-page__head">
        <div>
          <h2>{QA_CERTIFICATION_CENTER_ADMIN_BRAND}</h2>
          <p>
            Centralized Quality Assurance &amp; Certification — every production release must pass
            through this center before deployment. Auto-refreshes every 30 seconds.
          </p>
        </div>
        <button type="button" className="concierge-consultant-btn" onClick={refresh}>
          Refresh now
        </button>
      </header>

      {toast ? <p className="qa-certification-center-page__toast">{toast}</p> : null}

      <QACertificationSummaryCard summary={bundle.summary} />

      <nav className="qa-certification-center-page__sections" aria-label="QA certification sections">
        {QA_CERTIFICATION_SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`qa-certification-center-page__section-btn${
              section === item.id ? " is-active" : ""
            }`}
            onClick={() => setSection(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="qa-certification-center-page__body">
        <div className="qa-certification-center-page__column">
          {showCertification ? (
            <QACertificationPanelCard
              subsystemScores={bundle.subsystemScores}
              approvals={bundle.approvals}
              history={bundle.history}
              overallScore={bundle.summary.overallScore}
            />
          ) : null}
          {showAutomated ? <QAAutomatedTestsCard tests={bundle.automatedTests} /> : null}
          {showManual ? <QAManualQACard checks={bundle.manualChecks} /> : null}
          {!showAutomated && !showManual && !showCertification ? (
            <QAReleaseGatesCard gates={sectionGates.length ? sectionGates : bundle.releaseGates} />
          ) : null}
        </div>
        <div className="qa-certification-center-page__column">
          <QAReleaseGatesCard gates={bundle.releaseGates} />
          <QAReportsCard
            reports={bundle.reports}
            onGenerate={handleGenerateReport}
            busyReport={busyReport}
          />
        </div>
      </div>

      <footer className="qa-certification-center-page__foot">
        <span>Route: {QA_CERTIFICATION_CENTER_ADMIN_PATH}</span>
        <span>Generated {new Date(bundle.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
