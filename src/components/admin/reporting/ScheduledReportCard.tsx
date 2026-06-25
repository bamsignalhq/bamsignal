import {
  REPORT_EXPORT_FORMAT_LABELS,
  REPORT_SCHEDULE_FREQUENCY_LABELS
} from "../../../constants/reportingCenter";
import type { ReportScheduleRecord } from "../../../types/reportingCenter";

type ScheduledReportCardProps = {
  schedules: ReportScheduleRecord[];
};

export function ScheduledReportCard({ schedules }: ScheduledReportCardProps) {
  const enabled = schedules.filter((item) => item.enabled);

  return (
    <section className="reporting-center-card scheduled-report-card concierge-consultant-card--glass cc-reveal">
      <header className="reporting-center-card__head">
        <h3>Scheduled reports</h3>
        <p>Daily, weekly, monthly, quarterly, and annual institutional report delivery.</p>
      </header>
      {enabled.length ? (
        <ul className="reporting-center-card__list">
          {enabled.map((item) => (
            <li key={item.id}>
              <div className="reporting-center-card__row">
                <strong>{item.reportTitle}</strong>
                <span className="reporting-center-card__badge reporting-center-card__badge--published">
                  {REPORT_SCHEDULE_FREQUENCY_LABELS[item.frequency]}
                </span>
              </div>
              <div className="reporting-center-card__meta">
                <span>{item.scheduleRef}</span>
                <span>{REPORT_EXPORT_FORMAT_LABELS[item.format]}</span>
                <span>{item.recipients.length} recipient{item.recipients.length === 1 ? "" : "s"}</span>
              </div>
              <time className="reporting-center-card__time">
                Next run {new Date(item.nextRunAt).toLocaleString()}
              </time>
            </li>
          ))}
        </ul>
      ) : (
        <p className="reporting-center-card__empty">No scheduled reports enabled.</p>
      )}
    </section>
  );
}
