import { FAMILY_ADVISORS_LABEL } from "../../../constants/familyAdvisors";
import type { AdvisorTimelineEntry } from "../../../constants/familyAdvisors";

type AdvisorTimelineCardProps = {
  title: string;
  entries: AdvisorTimelineEntry[];
};

export function AdvisorTimelineCard({ title, entries }: AdvisorTimelineCardProps) {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  return (
    <section className="fadv-timeline-card institute-glass">
      <header className="fadv-timeline-card__head">
        <h3>{FAMILY_ADVISORS_LABEL}</h3>
        <p>{title}</p>
      </header>

      {sorted.length ? (
        <ol className="fadv-timeline-card__list">
          {sorted.map((entry) => (
            <li key={entry.id} className="fadv-timeline-card__item">
              <span className="fadv-timeline-card__dot" aria-hidden />
              <div>
                <strong>{entry.label}</strong>
                {entry.note ? <p className="fadv-timeline-card__note">{entry.note}</p> : null}
                <time dateTime={entry.recordedAt}>
                  {new Date(entry.recordedAt).toLocaleDateString()}
                </time>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="fadv-timeline-card__empty">
          Advisor timelines will appear as family advisors join the network.
        </p>
      )}
    </section>
  );
}
