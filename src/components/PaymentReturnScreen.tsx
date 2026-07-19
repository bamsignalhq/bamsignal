import { COMMERCIAL_OUTCOME } from "../constants/commercialExperience";

export type PaymentReturnScreenPhase = "verifying" | "processing" | "success" | "failed";

type PaymentReturnScreenProps = {
  phase: PaymentReturnScreenPhase;
  message?: string;
  onRetry?: () => void;
};

export function PaymentReturnScreen({ phase, message, onRetry }: PaymentReturnScreenProps) {
  const title =
    phase === "success"
      ? COMMERCIAL_OUTCOME.successTitle
      : phase === "failed"
        ? COMMERCIAL_OUTCOME.failureTitle
        : phase === "processing"
          ? COMMERCIAL_OUTCOME.processingTitle
          : COMMERCIAL_OUTCOME.verifyingTitle;
  const body =
    message ||
    (phase === "success"
      ? COMMERCIAL_OUTCOME.successBody
      : phase === "failed"
        ? COMMERCIAL_OUTCOME.failureBody
        : phase === "processing"
          ? COMMERCIAL_OUTCOME.processingBody
          : COMMERCIAL_OUTCOME.verifyingBody);

  return (
    <div className="payment-return-screen" role="status" aria-live="polite">
      <div className={`payment-return-screen__card commercial-outcome commercial-outcome--${
        phase === "success" ? "success" : phase === "failed" ? "failure" : "pending"
      }`}>
        {phase === "verifying" || phase === "processing" ? (
          <span className="commercial-skeleton commercial-skeleton--spinner" aria-hidden />
        ) : null}
        <h1>{title}</h1>
        <p>{body}</p>
        {phase === "failed" && onRetry ? (
          <button type="button" className="btn-secondary" onClick={onRetry}>
            Try again
          </button>
        ) : null}
      </div>
    </div>
  );
}
