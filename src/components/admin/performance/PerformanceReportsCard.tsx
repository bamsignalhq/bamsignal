import { PERFORMANCE_REPORT_TYPES } from "../../../constants/performanceCenter";
import type { PerformanceEngineeringReport } from "../../../types/performanceCenter";
import { filterReportsByType } from "../../../utils/performanceCenterLogic";

type PerformanceReportsCardProps = {
  reports: PerformanceEngineeringReport[];
};

export function PerformanceReportsCard({ reports }: PerformanceReportsCardProps) {
  return (
    <section className="performance-center-card performance-reports-card concierge-consultant-card--glass cc-reveal">
      <header className="performance-center-card__head">
        <h3>Reports</h3>
        <p>Largest regressions, improvements, and actionable recommendations.</p>
      </header>
      {PERFORMANCE_REPORT_TYPES.map((reportType) => {
        const items = filterReportsByType(reports, reportType.id);
        return (
          <div key={reportType.id} className="performance-reports-card__section">
            <h4>{reportType.label}</h4>
            {items.length ? (
              <ul>
                {items.map((item) => (
                  <li key={item.id}>
                    <strong>{item.title}</strong>
                    {item.deltaPercent !== 0 ? (
                      <span
                        className={
                          item.reportType === "largest-improvements"
                            ? "performance-reports-card__delta--good"
                            : "performance-reports-card__delta--bad"
                        }
                      >
                        {item.deltaPercent > 0 ? "+" : ""}
                        {item.deltaPercent}%
                      </span>
                    ) : null}
                    <p>{item.detail}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="performance-reports-card__empty">No items in this category.</p>
            )}
          </div>
        );
      })}
    </section>
  );
}
