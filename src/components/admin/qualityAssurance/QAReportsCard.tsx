import type { QAReportTypeId } from "../../../constants/qualityAssuranceCenter";

type QAReportsCardProps = {
  reports: { id: QAReportTypeId; label: string; lastGeneratedAt?: string }[];
  onGenerate: (reportId: QAReportTypeId) => void;
  busyReport: string | null;
};

export function QAReportsCard({ reports, onGenerate, busyReport }: QAReportsCardProps) {
  return (
    <section className="qa-certification-card qa-reports-card concierge-consultant-card--glass cc-reveal">
      <header className="qa-certification-card__head">
        <h3>Reports</h3>
        <p>Generate release certification PDF, QA summary, and blocker reports.</p>
      </header>
      <div className="qa-reports-card__grid">
        {reports.map((report) => (
          <button
            key={report.id}
            type="button"
            className="qa-report-chip"
            disabled={busyReport === report.id}
            onClick={() => onGenerate(report.id)}
          >
            <strong>{report.label}</strong>
            <span>
              {busyReport === report.id
                ? "Generating…"
                : report.lastGeneratedAt
                  ? `Last ${new Date(report.lastGeneratedAt).toLocaleString()}`
                  : "Not generated"}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
