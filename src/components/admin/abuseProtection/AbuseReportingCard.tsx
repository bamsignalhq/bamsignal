import { ABUSE_MONITOR_LABELS, ABUSE_REPORT_PERIODS } from "../../../constants/abuseProtection";
import type { AbuseReportSnapshot } from "../../../types/abuseProtection";

type AbuseReportingCardProps = {
  reports: AbuseReportSnapshot[];
  onExport: (period: string) => void;
};

export function AbuseReportingCard({ reports, onExport }: AbuseReportingCardProps) {
  return (
    <section className="abuse-protection-reporting concierge-consultant-card--glass cc-reveal">
      <header>
        <h3>Reporting</h3>
        <p>Daily, weekly, and monthly abuse summaries with CSV export.</p>
      </header>
      <div className="abuse-protection-reporting__grid">
        {ABUSE_REPORT_PERIODS.map((period) => {
          const report = reports.find((item) => item.period === period.id);
          if (!report) return null;
          return (
            <article key={period.id} className="abuse-protection-report">
              <h4>{period.label}</h4>
              <dl>
                <div>
                  <dt>Blocked</dt>
                  <dd>{report.totalBlocked}</dd>
                </div>
                <div>
                  <dt>Suspicious</dt>
                  <dd>{report.totalSuspicious}</dd>
                </div>
                <div>
                  <dt>Top monitor</dt>
                  <dd>{ABUSE_MONITOR_LABELS[report.topMonitor]}</dd>
                </div>
              </dl>
              <button
                type="button"
                className="concierge-consultant-btn"
                disabled={!report.exportReady}
                onClick={() => onExport(period.id)}
              >
                Export CSV
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
