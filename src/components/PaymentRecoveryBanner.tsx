type PaymentRecoveryBannerProps = {
  title?: string;
  body?: string;
  onRetry: () => void;
  onDismiss: () => void;
};

export function PaymentRecoveryBanner({
  title = "Payment incomplete",
  body = "Your purchase was not completed. You can try again at any time.",
  onRetry,
  onDismiss
}: PaymentRecoveryBannerProps) {
  return (
    <div className="payment-recovery-banner" role="status">
      <div>
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
      <div className="payment-recovery-banner__actions">
        <button type="button" className="btn-primary btn-sm" onClick={onRetry}>
          Try again
        </button>
        <button type="button" className="link-btn" onClick={onDismiss}>
          Close
        </button>
      </div>
    </div>
  );
}

type PaymentSuccessToastProps = {
  title?: string;
  body?: string;
  onContinue: () => void;
};

export function PaymentSuccessToast({
  title = "Payment successful",
  body = "Your Signal Pass is now active.",
  onContinue
}: PaymentSuccessToastProps) {
  return (
    <div className="payment-success-banner" role="status">
      <div>
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
      <button type="button" className="btn-primary btn-sm" onClick={onContinue}>
        Continue
      </button>
    </div>
  );
}
