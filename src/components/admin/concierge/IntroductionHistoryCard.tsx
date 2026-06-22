import {
  CONCIERGE_INTRO_OUTCOME_LABELS,
  CONCIERGE_INTRODUCTIONS_TITLE,
  type ConciergeIntroductionOutcome
} from "../../../constants/conciergeConsultant";
import {
  INTRODUCTION_OUTCOME_LABELS
} from "../../../constants/conciergeIntroduction";
import type { ConciergeIntroductionEntry } from "../../../types/conciergeConsultant";
import type { IntroductionHistoryEntry, IntroductionRecord } from "../../../types/conciergeIntroduction";
import { getMemberDisplayName } from "../../../utils/IntroductionEngine";

type IntroductionHistoryCardProps = {
  introductions?: ConciergeIntroductionEntry[];
  engineRecords?: IntroductionRecord[];
};

function outcomeLabel(outcome?: string): string {
  if (!outcome) return "";
  if (outcome in CONCIERGE_INTRO_OUTCOME_LABELS) {
    return CONCIERGE_INTRO_OUTCOME_LABELS[outcome as ConciergeIntroductionOutcome];
  }
  if (outcome in INTRODUCTION_OUTCOME_LABELS) {
    return INTRODUCTION_OUTCOME_LABELS[outcome as keyof typeof INTRODUCTION_OUTCOME_LABELS];
  }
  return outcome;
}

function renderEngineHistory(record: IntroductionRecord) {
  return (
    <li key={record.id} className="concierge-consultant-list__item introduction-history__engine-item">
      <div>
        <strong>
          {getMemberDisplayName(record.memberAId)} & {getMemberDisplayName(record.memberBId)}
        </strong>
        <ul className="introduction-history__events">
          {record.history.map((event: IntroductionHistoryEntry) => (
            <li key={event.id}>
              <span>{event.label}</span>
              {event.detail ? <span className="introduction-history__detail">{event.detail}</span> : null}
              {event.outcome ? (
                <span className="introduction-history__outcome">{outcomeLabel(event.outcome)}</span>
              ) : null}
              <time dateTime={event.at}>{new Date(event.at).toLocaleDateString()}</time>
            </li>
          ))}
        </ul>
        {record.feedback[0] ? (
          <p className="concierge-consultant-list__note">{record.feedback[0].body}</p>
        ) : null}
      </div>
      <time dateTime={record.updatedAt}>{new Date(record.updatedAt).toLocaleDateString()}</time>
    </li>
  );
}

export function IntroductionHistoryCard({
  introductions = [],
  engineRecords = []
}: IntroductionHistoryCardProps) {
  const legacySorted = [...introductions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const hasEngine = engineRecords.length > 0;
  const hasLegacy = legacySorted.length > 0;

  return (
    <section className="concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{CONCIERGE_INTRODUCTIONS_TITLE}</h3>
        <p>Who was introduced, date, outcome, and consultant notes.</p>
      </header>
      {hasEngine || hasLegacy ? (
        <ul className="concierge-consultant-list introduction-history">
          {engineRecords.map((record) => renderEngineHistory(record))}
          {!hasEngine
            ? legacySorted.map((entry) => (
                <li key={entry.id} className="concierge-consultant-list__item">
                  <div>
                    <strong>{entry.introducedWithName}</strong>
                    <p className="introduction-history__outcome">{outcomeLabel(entry.outcome)}</p>
                    <p>{entry.notes}</p>
                  </div>
                  <time dateTime={entry.date}>{new Date(entry.date).toLocaleDateString()}</time>
                </li>
              ))
            : null}
        </ul>
      ) : (
        <p className="concierge-consultant__empty">No introduction history yet.</p>
      )}
    </section>
  );
}
