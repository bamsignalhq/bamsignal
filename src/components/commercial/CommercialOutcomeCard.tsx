import { COMMERCIAL_OUTCOME, COMMERCIAL_RECEIPT } from "../../constants/commercialExperience";

type CommercialReceiptCardProps = {
  productLabel: string;
  amountLabel?: string;
  reference?: string | null;
  statusLabel?: string;
  paidAt?: string | null;
  note?: string;
};

export function CommercialReceiptCard({
  productLabel,
  amountLabel,
  reference,
  statusLabel = COMMERCIAL_RECEIPT.paid,
  paidAt,
  note = COMMERCIAL_RECEIPT.membershipNote
}: CommercialReceiptCardProps) {
  return (
    <article className="commercial-receipt card" aria-label={COMMERCIAL_RECEIPT.title}>
      <header className="commercial-receipt__head">
        <p className="commercial-eyebrow">{COMMERCIAL_RECEIPT.title}</p>
        <h3>{productLabel}</h3>
      </header>
      <dl className="commercial-receipt__meta">
        {amountLabel ? (
          <div>
            <dt>Amount</dt>
            <dd>{amountLabel}</dd>
          </div>
        ) : null}
        <div>
          <dt>Status</dt>
          <dd>{statusLabel}</dd>
        </div>
        {reference ? (
          <div>
            <dt>Reference</dt>
            <dd>{reference}</dd>
          </div>
        ) : null}
        {paidAt ? (
          <div>
            <dt>Confirmed</dt>
            <dd>{new Date(paidAt).toLocaleString()}</dd>
          </div>
        ) : null}
      </dl>
      {note ? <p className="commercial-muted">{note}</p> : null}
    </article>
  );
}

type CommercialOutcomeCardProps = {
  tone: "success" | "failure" | "pending";
  title?: string;
  body?: string;
  onRetry?: () => void;
  children?: React.ReactNode;
};

export function CommercialOutcomeCard({
  tone,
  title,
  body,
  onRetry,
  children
}: CommercialOutcomeCardProps) {
  const resolvedTitle =
    title ||
    (tone === "success"
      ? COMMERCIAL_OUTCOME.successTitle
      : tone === "failure"
        ? COMMERCIAL_OUTCOME.failureTitle
        : COMMERCIAL_OUTCOME.processingTitle);
  const resolvedBody =
    body ||
    (tone === "success"
      ? COMMERCIAL_OUTCOME.successBody
      : tone === "failure"
        ? COMMERCIAL_OUTCOME.failureBody
        : COMMERCIAL_OUTCOME.processingBody);

  return (
    <article
      className={`commercial-outcome commercial-outcome--${tone} card`}
      role="status"
      aria-live="polite"
    >
      {tone === "pending" ? (
        <span className="commercial-skeleton commercial-skeleton--spinner" aria-hidden />
      ) : null}
      <h2>{resolvedTitle}</h2>
      <p>{resolvedBody}</p>
      {children}
      {tone === "failure" && onRetry ? (
        <button type="button" className="btn-secondary" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </article>
  );
}

export function CommercialSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="commercial-skeleton-stack" aria-hidden>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="commercial-skeleton commercial-skeleton--row" />
      ))}
    </div>
  );
}
