import {
  CONCIERGE_COMMUNICATION_JOURNAL_SUBCOPY,
  CONCIERGE_COMMUNICATION_JOURNAL_TITLE
} from "../../../constants/conciergeMemberOwnership";
import { CONCIERGE_PROFESSIONAL_CHANNEL_LABELS } from "../../../constants/conciergeConsultantCommunication";
import type { ConciergeCommunicationJournalEntry } from "../../../types/conciergeConsultant";

type CommunicationJournalCardProps = {
  entries: ConciergeCommunicationJournalEntry[];
};

export function CommunicationJournalCard({ entries }: CommunicationJournalCardProps) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <section className="communication-journal-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{CONCIERGE_COMMUNICATION_JOURNAL_TITLE}</h3>
        <p>{CONCIERGE_COMMUNICATION_JOURNAL_SUBCOPY}</p>
      </header>
      {sorted.length ? (
        <ul className="communication-journal-card__list">
          {sorted.map((entry) => (
            <li key={entry.id} className="communication-journal-card__entry">
              <div className="communication-journal-card__head-row">
                <strong>{CONCIERGE_PROFESSIONAL_CHANNEL_LABELS[entry.platform]}</strong>
                <time dateTime={entry.date}>{new Date(entry.date).toLocaleString()}</time>
              </div>
              <p className="communication-journal-card__participants">
                {entry.participants.join(" · ")} · Steward: {entry.consultantName}
              </p>
              {entry.durationMinutes ? (
                <p className="communication-journal-card__duration">{entry.durationMinutes} minutes</p>
              ) : null}
              <p className="communication-journal-card__summary">{entry.summary}</p>
              {entry.outcome ? (
                <p className="communication-journal-card__outcome">
                  <span>Outcome</span> {entry.outcome}
                </p>
              ) : null}
              {entry.nextAction ? (
                <p className="communication-journal-card__next">
                  <span>Next action</span> {entry.nextAction}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="concierge-consultant__empty">No documented communications yet.</p>
      )}
    </section>
  );
}
