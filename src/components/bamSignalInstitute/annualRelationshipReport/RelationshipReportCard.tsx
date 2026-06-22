import {
  ANNUAL_RELATIONSHIP_REPORT_LABEL,
  INSIGHTS_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/annualRelationshipReport";
import type { AnnualRelationshipReportViewModel } from "../../../utils/annualRelationshipReportLogic";

type RelationshipReportCardProps = {
  report: AnnualRelationshipReportViewModel;
};

export function RelationshipReportCard({ report }: RelationshipReportCardProps) {
  return (
    <article className="arr-report-card institute-glass">
      <header className="arr-report-card__head">
        <h3>{report.title}</h3>
        <span className="arr-report-card__year">{report.publicationYear}</span>
      </header>

      <p className="arr-report-card__labels">
        {ANNUAL_RELATIONSHIP_REPORT_LABEL} · {INSIGHTS_LABEL} · {UNDERSTANDING_RELATIONSHIPS_LABEL}
      </p>
      <p className="arr-report-card__category">{report.categoryLabel}</p>
      <p className="arr-report-card__description">{report.description}</p>
      <p className="arr-report-card__status">{report.statusLabel}</p>
    </article>
  );
}
