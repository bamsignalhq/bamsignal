import {
  OPERATIONS_INTRODUCTION_BUCKET_LABELS,
  OPERATIONS_INTRODUCTION_BUCKETS
} from "../../../constants/operationsCenter";
import type { OperationsCenterBundle } from "../../../types/operationsCenter";

type OperationsIntroductionCardProps = {
  bundle: OperationsCenterBundle;
};

export function OperationsIntroductionCard({ bundle }: OperationsIntroductionCardProps) {
  return (
    <section className="operations-center-introductions concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Introductions</h3>
        <p>Introduction Engine™ review, consent, and active pairings</p>
      </header>
      {OPERATIONS_INTRODUCTION_BUCKETS.map((bucket) => {
        const rows = bundle.introductions[bucket];
        return (
          <div key={bucket} className="operations-center-panel__block">
            <h4>
              {OPERATIONS_INTRODUCTION_BUCKET_LABELS[bucket]} <strong>{rows.length}</strong>
            </h4>
            {rows.length === 0 ? (
              <p className="concierge-consultant__empty">
                No {OPERATIONS_INTRODUCTION_BUCKET_LABELS[bucket].toLowerCase()}.
              </p>
            ) : null}
            <ul className="concierge-consultant-list">
              {rows.slice(0, 8).map((row) => (
                <li key={row.id} className="concierge-consultant-list__item">
                  <div>
                    <strong>{row.pairLabel}</strong>
                    <span>
                      {row.introductionId} · {row.status}
                    </span>
                    {row.consultantName ? <span>{row.consultantName}</span> : null}
                  </div>
                  <time dateTime={row.updatedAt}>{new Date(row.updatedAt).toLocaleString()}</time>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
