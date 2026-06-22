import { ANNUAL_RELATIONSHIP_REPORT_LABEL } from "../../../constants/annualRelationshipReport";
import type { AnnualReportTimelineEntry } from "../../../constants/annualRelationshipReport";

type ReportTimelineCardProps = {
  title: string;
  entries: AnnualReportTimelineEntry[];
};

export function ReportTimelineCard({ title, entries }: ReportTimelineCardProps) {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  return (
    <section className="arr-timeline-card institute-glass">
      <header className="arr-timeline-card__head">
        <h3>{ANNUAL_RELATIONSHIP_REPORT_LABEL}</h3>
        <p>{title}</p>
      </header>

      {sorted.length ? (
        <ol className="arr-timeline-card__list">
          {sorted.map((entry) => (
            <li key={entry.id} className="arr-timeline-card__item">
              <span className="arr-timeline-card__dot" aria-hidden />
              <div>
                <strong>{entry.label}</strong>
                {entry.note ? <p className="arr-timeline-card__note">{entry.note}</p> : null}
                <time dateTime={entry.recordedAt}>
                  {new Date(entry.recordedAt).toLocaleDateString()}
                </time>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="arr-timeline-card__empty">
          Publication milestones will appear as annual reports mature.
        </p>
      )}
    </section>
  );
}
