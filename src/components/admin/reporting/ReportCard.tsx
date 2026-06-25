import {
  REPORT_CATEGORY_LABELS,
  REPORT_EXPORT_FORMAT_LABELS
} from "../../../constants/reportingCenter";
import type { ReportCatalogEntry } from "../../../types/reportingCenter";

type ReportCardProps = {
  reports: ReportCatalogEntry[];
};

export function ReportCard({ reports }: ReportCardProps) {
  return (
    <section className="reporting-center-card report-card concierge-consultant-card--glass cc-reveal">
      <header className="reporting-center-card__head">
        <h3>Report catalog</h3>
        <p>Institutional reports — operational dashboards and preserved knowledge over time.</p>
      </header>
      {reports.length ? (
        <ul className="reporting-center-card__list">
          {reports.map((item) => (
            <li key={item.id}>
              <div className="reporting-center-card__row">
                <strong>{item.title}</strong>
                <span
                  className={`reporting-center-card__badge reporting-center-card__badge--${item.status}`}
                >
                  {item.status}
                </span>
              </div>
              <div className="reporting-center-card__meta">
                <span>{item.reportRef}</span>
                <span>{REPORT_CATEGORY_LABELS[item.categoryId]}</span>
                <span>{item.ownerEmail}</span>
              </div>
              {item.description ? (
                <p className="reporting-center-card__detail">{item.description}</p>
              ) : null}
              <div className="reporting-center-card__tags">
                {item.supportedFormats.map((format) => (
                  <span key={format} className="reporting-center-card__tag">
                    {REPORT_EXPORT_FORMAT_LABELS[format]}
                  </span>
                ))}
              </div>
              {item.lastGeneratedAt ? (
                <time className="reporting-center-card__time">
                  Last generated {new Date(item.lastGeneratedAt).toLocaleString()}
                </time>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="reporting-center-card__empty">No reports match this category.</p>
      )}
    </section>
  );
}
