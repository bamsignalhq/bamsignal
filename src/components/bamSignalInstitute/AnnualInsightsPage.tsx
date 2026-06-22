import { useMemo } from "react";
import {
  BAMSIGNAL_INSTITUTE_RESERVED_COPY,
  INSIGHTS_LABEL,
  INSTITUTE_FUTURE_CAPABILITIES,
  RESEARCH_LABEL
} from "../../constants/bamSignalInstitute";
import { getBamSignalInstituteBundle } from "../../utils/BamSignalInstituteEngine";
import { ResearchReportCard } from "./ResearchReportCard";

export function AnnualInsightsPage() {
  const bundle = useMemo(() => getBamSignalInstituteBundle(), []);

  return (
    <div className="bi-page">
      <header className="bi-page__hero institute-glass">
        <p className="bi-page__eyebrow">{INSIGHTS_LABEL}</p>
        <h1>Annual Insights</h1>
        <p>Annual reports and white papers — architecture prepared, not published.</p>
        <p className="bi-page__labels">{RESEARCH_LABEL} · Annual insights</p>
      </header>

      <section className="bi-page__section">
        <header className="bi-section-head">
          <h2>Prepared reports</h2>
          <p>Research reports reserved — private by default until consent is granted.</p>
        </header>
        <div className="bi-page__reports">
          {bundle.reports.map((report) => (
            <ResearchReportCard key={report.id} report={report} />
          ))}
        </div>
      </section>

      <section className="bi-page__future institute-glass">
        <h2>Future ready</h2>
        <ul>
          {INSTITUTE_FUTURE_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.label}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
        <p className="bi-page__reserved">{BAMSIGNAL_INSTITUTE_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
