import { CONCIERGE_STEWARDSHIP_TITLE } from "../../../constants/conciergeMemberOwnership";
import type { ConciergeStewardshipTransfer } from "../../../types/conciergeConsultant";

type StewardshipTimelineProps = {
  transfers: ConciergeStewardshipTransfer[];
};

export function StewardshipTimeline({ transfers }: StewardshipTimelineProps) {
  const sorted = [...transfers].sort(
    (a, b) => new Date(b.transferredAt).getTime() - new Date(a.transferredAt).getTime()
  );

  if (!sorted.length) {
    return (
      <section className="stewardship-timeline concierge-consultant-card concierge-consultant-card--glass cc-reveal">
        <header className="concierge-consultant-card__head">
          <h3>{CONCIERGE_STEWARDSHIP_TITLE}</h3>
          <p>Steward transitions — journey history preserved across every handoff.</p>
        </header>
        <p className="concierge-consultant__empty">No steward transitions yet.</p>
      </section>
    );
  }

  return (
    <section className="stewardship-timeline concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{CONCIERGE_STEWARDSHIP_TITLE}</h3>
        <p>Every transition is logged. Notes, summaries, and introductions carry forward.</p>
      </header>
      <ol className="stewardship-timeline__list">
        {sorted.map((transfer, index) => (
          <li
            key={transfer.id}
            className="stewardship-timeline__item cc-reveal"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <div className="stewardship-timeline__dot" aria-hidden />
            <div className="stewardship-timeline__body">
              <p className="stewardship-timeline__label">
                {transfer.fromConsultantName
                  ? `Transferred from ${transfer.fromConsultantName} to ${transfer.toConsultantName}`
                  : `Assigned to ${transfer.toConsultantName}`}
              </p>
              {transfer.note ? <p className="stewardship-timeline__detail">{transfer.note}</p> : null}
              <p className="stewardship-timeline__meta">
                By {transfer.transferredBy} ·{" "}
                <time dateTime={transfer.transferredAt}>
                  {new Date(transfer.transferredAt).toLocaleString()}
                </time>
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
