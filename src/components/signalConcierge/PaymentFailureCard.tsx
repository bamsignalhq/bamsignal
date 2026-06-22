type PaymentFailureCardProps = {
  message?: string;
  onRetry?: () => void;
};

export function PaymentFailureCard({
  message = "We couldn't confirm your consultation fee. You can try again when you're ready.",
  onRetry
}: PaymentFailureCardProps) {
  return (
    <article className="consultation-payment-status-card consultation-payment-status-card--failed signal-concierge-glass sc-reveal">
      <h2>Payment not confirmed</h2>
      <p>{message}</p>
      {onRetry ? (
        <div className="signal-concierge-hero__actions">
          <button type="button" className="signal-concierge-btn signal-concierge-btn--primary" onClick={onRetry}>
            Try again
          </button>
        </div>
      ) : null}
    </article>
  );
}
