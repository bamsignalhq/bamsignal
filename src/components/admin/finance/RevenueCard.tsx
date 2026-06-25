import { REPORT_PERIOD_LABELS } from "../../../constants/financeOperations";
import type { FinanceMetric, FinancialReportRecord } from "../../../types/financeOperations";
import { buildReportCsvContent } from "../../../utils/financeOperationsLogic";

type RevenueCardProps = {
  metrics: FinanceMetric[];
  reports: FinancialReportRecord[];
};

function formatNgn(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export function RevenueCard({ metrics, reports }: RevenueCardProps) {
  const revenueToday = metrics.find((item) => item.id === "revenue-today")?.value ?? "₦0";
  const revenueMonth = metrics.find((item) => item.id === "revenue-month")?.value ?? "₦0";
  const consultations = metrics.find((item) => item.id === "consultations-paid")?.value ?? "0";

  function handleExport(report: FinancialReportRecord, format: "csv" | "pdf") {
    if (format === "pdf") {
      window.alert(`PDF export documented for ${report.reportRef} — institutional finance review.`);
      return;
    }
    const content = buildReportCsvContent(report);
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${report.reportRef}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="finance-card revenue-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Revenue</h3>
        <p>
          Consultation revenue and institutional reporting — today {revenueToday}, month {revenueMonth},{" "}
          {consultations} consultations paid.
        </p>
      </header>

      <div className="revenue-card__summary">
        {metrics
          .filter((item) => item.id.startsWith("revenue") || item.id === "consultations-paid")
          .map((metric) => (
            <article key={metric.id} className="finance-metric">
              <span className="finance-metric__label">{metric.label}</span>
              <strong className="finance-metric__value">{metric.value}</strong>
            </article>
          ))}
      </div>

      <h4>Reports</h4>
      <ul className="finance-list finance-list--compact">
        {reports.map((report) => (
          <li key={report.id} className="finance-list__item">
            <div>
              <strong>{report.reportRef}</strong>
              <span>{REPORT_PERIOD_LABELS[report.periodType]}</span>
            </div>
            <div className="finance-list__meta">
              <span>Net {formatNgn(report.netPositionNgn)}</span>
              <button
                type="button"
                className="concierge-consultant-btn concierge-consultant-btn--ghost"
                onClick={() => handleExport(report, "csv")}
              >
                CSV
              </button>
              <button
                type="button"
                className="concierge-consultant-btn concierge-consultant-btn--ghost"
                onClick={() => handleExport(report, "pdf")}
              >
                PDF
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
