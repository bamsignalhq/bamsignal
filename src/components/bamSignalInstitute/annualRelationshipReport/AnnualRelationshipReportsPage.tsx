import { useMemo } from "react";
import {
  AFRICAN_RELATIONSHIP_CULTURE_LABEL,
  ANNUAL_RELATIONSHIP_REPORT_LABEL,
  ANNUAL_RELATIONSHIP_REPORT_PURPOSE_COPY,
  ANNUAL_RELATIONSHIP_REPORT_RESERVED_COPY,
  ANNUAL_RELATIONSHIP_REPORT_STATIC_COPY,
  ANNUAL_RELATIONSHIP_REPORT_SUBCOPY,
  ANNUAL_RELATIONSHIP_REPORT_TITLE,
  ANNUAL_REPORT_FUTURE_CAPABILITIES,
  INSIGHTS_LABEL,
  PREPARED_ANNUAL_REPORTS,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/annualRelationshipReport";
import { getAnnualRelationshipReportBundle } from "../../../utils/AnnualRelationshipReportEngine";
import { RelationshipReportCard } from "./RelationshipReportCard";
import { ReportCategoryCard } from "./ReportCategoryCard";
import { ReportTimelineCard } from "./ReportTimelineCard";

export function AnnualRelationshipReportsPage() {
  const bundle = useMemo(() => getAnnualRelationshipReportBundle(), []);

  return (
    <div className="arr-page">
      <header className="arr-page__hero institute-glass">
        <p className="bi-page__eyebrow">{INSIGHTS_LABEL}</p>
        <h1>{ANNUAL_RELATIONSHIP_REPORT_TITLE}</h1>
        <p>{ANNUAL_RELATIONSHIP_REPORT_SUBCOPY}</p>
        <p className="arr-page__labels">
          {ANNUAL_RELATIONSHIP_REPORT_LABEL} · {UNDERSTANDING_RELATIONSHIPS_LABEL} ·{" "}
          {AFRICAN_RELATIONSHIP_CULTURE_LABEL}
        </p>
        <p className="arr-page__purpose">{ANNUAL_RELATIONSHIP_REPORT_PURPOSE_COPY}</p>
        <p className="arr-page__static">{ANNUAL_RELATIONSHIP_REPORT_STATIC_COPY}</p>
      </header>

      <section className="arr-page__categories">
        <header className="bi-section-head">
          <h2>Report categories</h2>
          <p>Understanding relationships — never statistics or user reports.</p>
        </header>
        <div className="arr-page__grid arr-page__grid--categories">
          {bundle.categories.map((category) => (
            <ReportCategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      <section className="arr-page__prepared institute-glass">
        <h2>Prepared reports</h2>
        <p>{PREPARED_ANNUAL_REPORTS.length} reports — architecture preview, alphabetical.</p>
        <ul className="arr-page__prepared-list">
          {PREPARED_ANNUAL_REPORTS.map((report) => (
            <li key={report.id}>
              <strong>{report.title}</strong>
              <span>{report.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="arr-page__section">
        <header className="bi-section-head">
          <h2>Annual reports</h2>
          <p>Yearly publications prepared — not published yet.</p>
        </header>
        <div className="arr-page__grid">
          {bundle.reports.map((report) => (
            <RelationshipReportCard key={report.id} report={report} />
          ))}
        </div>
      </section>

      {bundle.reports.map((report) => (
        <ReportTimelineCard key={`${report.id}-timeline`} title={report.title} entries={report.timeline} />
      ))}

      <section className="arr-page__future institute-glass">
        <h2>Future ready</h2>
        <ul>
          {ANNUAL_REPORT_FUTURE_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.label}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
        <p className="arr-page__reserved">{ANNUAL_RELATIONSHIP_REPORT_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
