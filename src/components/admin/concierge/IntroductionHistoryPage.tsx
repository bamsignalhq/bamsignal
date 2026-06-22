import {
  INTRODUCTION_HISTORY_EVENTS,
  INTRODUCTION_OUTCOME_LABELS,
  INTRODUCTION_STATUS_LABELS
} from "../../../constants/conciergeIntroduction";
import { INTRODUCTION_ID_LABEL } from "../../../constants/introductionId";
import type { IntroductionRecord } from "../../../types/conciergeIntroduction";
import { getMemberDisplayName } from "../../../utils/IntroductionEngine";

type IntroductionHistoryPageProps = {
  records: IntroductionRecord[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
};

function historyHighlights(record: IntroductionRecord): string[] {
  const labels = new Set(record.history.map((entry) => entry.label));
  return INTRODUCTION_HISTORY_EVENTS.filter((event) => labels.has(event));
}

export function IntroductionHistoryPage({
  records,
  selectedId,
  onSelect
}: IntroductionHistoryPageProps) {
  const sorted = [...records].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <section className="introduction-history-page concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Introduction history</h3>
        <p>Presented, Accepted, Declined, Relationship formed, Engagement, and Marriage.</p>
      </header>

      {sorted.length ? (
        <ul className="introduction-history-page__list">
          {sorted.map((record) => (
            <li key={record.id}>
              <button
                type="button"
                className={`introduction-history-page__row${selectedId === record.id ? " is-active" : ""}`}
                onClick={() => onSelect?.(record.id)}
              >
                <div>
                  <span className="introduction-history-page__id">{record.introductionId}</span>
                  <strong>
                    {getMemberDisplayName(record.memberAId)} & {getMemberDisplayName(record.memberBId)}
                  </strong>
                  <span className="introduction-history-page__journeys">
                    {record.journeyAId ?? "—"} · {record.journeyBId ?? "—"}
                  </span>
                  <span className="introduction-history-page__status">
                    {INTRODUCTION_STATUS_LABELS[record.status]}
                    {record.outcome ? ` · ${INTRODUCTION_OUTCOME_LABELS[record.outcome]}` : ""}
                  </span>
                  {historyHighlights(record).length ? (
                    <span className="introduction-history-page__highlights">
                      {historyHighlights(record).join(" · ")}
                    </span>
                  ) : null}
                </div>
                <time dateTime={record.createdAt}>
                  {new Date(record.createdAt).toLocaleDateString()}
                </time>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="concierge-consultant__empty">No introduction history yet.</p>
      )}

      <p className="introduction-history-page__id-note">
        {INTRODUCTION_ID_LABEL}s are permanent and never reused.
      </p>
    </section>
  );
}
