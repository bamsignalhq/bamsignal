type PaymentRecoveryBannerProps = {
  onRetry: () => void;
  onDismiss: () => void;
};

export function PaymentRecoveryBanner({ onRetry, onDismiss }: PaymentRecoveryBannerProps) {
  return (
    <div className="payment-recovery-banner" role="status">
      <div>
        <strong>Payment didn't complete</strong>
        <p>Continue where you left off — your Signal Pass is one tap away.</p>
      </div>
      <div className="payment-recovery-banner__actions">
        <button type="button" className="btn-primary btn-sm" onClick={onRetry}>
          Retry payment
        </button>
        <button type="button" className="link-btn" onClick={onDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
