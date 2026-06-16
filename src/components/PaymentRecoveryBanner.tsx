import { MONETIZATION_COPY } from "../constants/copy";
import { getPaymentFlowState } from "../utils/paymentState";

type PaymentRecoveryBannerProps = {
  onRetry: () => void;
  onDismiss: () => void;
};

export function PaymentRecoveryBanner({ onRetry, onDismiss }: PaymentRecoveryBannerProps) {
  const cancelled = getPaymentFlowState() === "cancelled";
  const title = cancelled ? MONETIZATION_COPY.paymentCancelledTitle : "Payment incomplete";
  const body = cancelled
    ? MONETIZATION_COPY.paymentCancelledBody
    : "We couldn't confirm your payment. You can try again when you're ready.";

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
        <button type="button" className="btn-secondary btn-sm" onClick={onDismiss}>
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
  title = MONETIZATION_COPY.paymentSuccessTitle,
  body = MONETIZATION_COPY.paymentSuccessBody,
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
