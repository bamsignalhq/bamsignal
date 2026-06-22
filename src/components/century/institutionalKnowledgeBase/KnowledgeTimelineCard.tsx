import { INSTITUTIONAL_KNOWLEDGE_BASE_LABEL } from "../../../constants/institutionalKnowledgeBase";
import type { KnowledgeTimelineEntryViewModel } from "../../../types/institutionalKnowledgeBase";

type KnowledgeTimelineCardProps = {
  entries: KnowledgeTimelineEntryViewModel[];
};

export function KnowledgeTimelineCard({ entries }: KnowledgeTimelineCardProps) {
  const sorted = [...entries].sort(
    (left, right) => new Date(left.recordedAt).getTime() - new Date(right.recordedAt).getTime()
  );

  return (
    <section className="ikb-timeline-card institute-glass">
      <header className="ikb-timeline-card__head">
        <h3>{INSTITUTIONAL_KNOWLEDGE_BASE_LABEL}</h3>
        <p>Knowledge timeline — institutional memory milestones, not live articles.</p>
      </header>
      {sorted.length ? (
        <ol className="ikb-timeline-card__list">
          {sorted.map((entry) => (
            <li key={entry.id} className="ikb-timeline-card__item">
              <span className="ikb-timeline-card__dot" aria-hidden />
              <div>
                <strong>{entry.label}</strong>
                {entry.note ? <p className="ikb-timeline-card__note">{entry.note}</p> : null}
                <time dateTime={entry.recordedAt}>
                  {new Date(entry.recordedAt).toLocaleDateString()}
                </time>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="ikb-card__empty">Knowledge milestones will appear as institutional memory matures.</p>
      )}
    </section>
  );
}
