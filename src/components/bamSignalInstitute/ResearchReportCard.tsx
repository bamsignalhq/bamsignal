import { INSIGHTS_LABEL, RESEARCH_LABEL } from "../../constants/bamSignalInstitute";
import type { ResearchReportViewModel } from "../../utils/bamSignalInstituteLogic";

type ResearchReportCardProps = {
  report: ResearchReportViewModel;
};

export function ResearchReportCard({ report }: ResearchReportCardProps) {
  return (
    <article className="bi-report-card institute-glass">
      <header className="bi-report-card__head">
        <h3>{report.title}</h3>
        <span className="bi-report-card__badge">{report.visibilityLabel}</span>
      </header>

      <p className="bi-report-card__area">{report.areaTitle}</p>
      <p className="bi-report-card__labels">
        {INSIGHTS_LABEL} · {RESEARCH_LABEL}
      </p>
      <p className="bi-report-card__summary">{report.summary}</p>
      <time dateTime={report.recordedAt}>
        Prepared {new Date(report.recordedAt).toLocaleDateString()}
      </time>
    </article>
  );
}
