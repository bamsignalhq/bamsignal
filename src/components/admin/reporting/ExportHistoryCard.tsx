import {
  REPORT_CATEGORY_LABELS,
  REPORT_EXPORT_FORMAT_LABELS
} from "../../../constants/reportingCenter";
import type { ReportExportRecord } from "../../../types/reportingCenter";

type ExportHistoryCardProps = {
  exports: ReportExportRecord[];
};

export function ExportHistoryCard({ exports }: ExportHistoryCardProps) {
  return (
    <section className="reporting-center-card export-history-card concierge-consultant-card--glass cc-reveal">
      <header className="reporting-center-card__head">
        <h3>Export history</h3>
        <p>PDF, Excel, CSV, and print exports preserved for institutional audit.</p>
      </header>
      {exports.length ? (
        <ul className="reporting-center-card__list">
          {exports.map((item) => (
            <li key={item.id}>
              <div className="reporting-center-card__row">
                <strong>{item.reportTitle}</strong>
                <span className="reporting-center-card__tag reporting-center-card__tag--export">
                  {REPORT_EXPORT_FORMAT_LABELS[item.format]}
                </span>
              </div>
              <div className="reporting-center-card__meta">
                <span>{item.exportRef}</span>
                <span>{REPORT_CATEGORY_LABELS[item.categoryId]}</span>
                <span>{item.exportedBy}</span>
                {item.fileSizeKb ? <span>{item.fileSizeKb} KB</span> : null}
              </div>
              <time className="reporting-center-card__time">
                {new Date(item.exportedAt).toLocaleString()}
              </time>
            </li>
          ))}
        </ul>
      ) : (
        <p className="reporting-center-card__empty">No exports recorded yet.</p>
      )}
    </section>
  );
}
