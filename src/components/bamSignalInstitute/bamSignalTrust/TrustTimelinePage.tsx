import { BAMSIGNAL_TRUST_LABEL } from "../../../constants/bamSignalTrust";
import type { TrustTimelineEntry } from "../../../constants/bamSignalTrust";

type TrustTimelinePageProps = {
  title: string;
  entries: TrustTimelineEntry[];
};

export function TrustTimelinePage({ title, entries }: TrustTimelinePageProps) {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  return (
    <section className="bst-trust-timeline institute-glass">
      <header className="bst-trust-timeline__head">
        <h3>{BAMSIGNAL_TRUST_LABEL}</h3>
        <p>{title}</p>
      </header>

      {sorted.length ? (
        <ol className="bst-trust-timeline__list">
          {sorted.map((entry) => (
            <li key={entry.id} className="bst-trust-timeline__item">
              <span className="bst-trust-timeline__dot" aria-hidden />
              <div>
                <strong>{entry.label}</strong>
                {entry.note ? <p className="bst-trust-timeline__note">{entry.note}</p> : null}
                <time dateTime={entry.recordedAt}>
                  {new Date(entry.recordedAt).toLocaleDateString()}
                </time>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="bst-trust-timeline__empty">
          Trust timelines will appear as the professional ecosystem matures.
        </p>
      )}
    </section>
  );
}
