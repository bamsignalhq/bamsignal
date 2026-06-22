import { SUCCESS_STORY_CONSENT_ACTION_LABELS } from "../../constants/conciergeSuccessStoryConsent";
import type { SuccessStoryConsentHistoryEntry } from "../../types/conciergeSuccessStoryConsent";

type ConsentHistoryTimelineProps = {
  history: SuccessStoryConsentHistoryEntry[];
};

export function ConsentHistoryTimeline({ history }: ConsentHistoryTimelineProps) {
  const sorted = [...history].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  if (!sorted.length) {
    return <p className="success-story-consent__empty">No consent history yet.</p>;
  }

  return (
    <ol className="consent-history-timeline">
      {sorted.map((entry, index) => (
        <li
          key={entry.id}
          className={`consent-history-timeline__item consent-history-timeline__item--${entry.action} sc-reveal`}
          style={{ animationDelay: `${index * 40}ms` }}
        >
          <div className="consent-history-timeline__dot" aria-hidden />
          <div className="consent-history-timeline__body">
            <p className="consent-history-timeline__label">
              {SUCCESS_STORY_CONSENT_ACTION_LABELS[entry.action]}
            </p>
            <p className="consent-history-timeline__who">
              {entry.approvedBy}
              {entry.memberId ? ` · ${entry.detail ?? ""}` : null}
            </p>
            {entry.detail && !entry.memberId ? (
              <p className="consent-history-timeline__detail">{entry.detail}</p>
            ) : null}
            <time className="consent-history-timeline__time" dateTime={entry.at}>
              {new Date(entry.at).toLocaleString()}
            </time>
          </div>
        </li>
      ))}
    </ol>
  );
}
