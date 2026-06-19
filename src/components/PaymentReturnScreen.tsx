type PaymentReturnScreenProps = {
  phase: "verifying" | "success" | "failed";
  message?: string;
};

export function PaymentReturnScreen({ phase, message }: PaymentReturnScreenProps) {
  const title =
    phase === "success"
      ? "Payment confirmed"
      : phase === "failed"
        ? "Payment not confirmed"
        : "Confirming payment";
  const body =
    message ||
    (phase === "success"
      ? "Taking you back…"
      : phase === "failed"
        ? "We couldn't verify this payment yet."
        : "Please wait a moment…");

  return (
    <div className="payment-return-screen" role="status" aria-live="polite">
      <div className="payment-return-screen__card">
        {phase === "verifying" ? <span className="payment-loading-overlay__spinner" aria-hidden /> : null}
        <h1>{title}</h1>
        <p>{body}</p>
      </div>
    </div>
  );
}
