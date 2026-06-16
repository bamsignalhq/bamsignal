import { MONETIZATION_COPY } from "../constants/copy";

type PaymentLoadingOverlayProps = {
  message?: string;
};

export function PaymentLoadingOverlay({
  message = MONETIZATION_COPY.checkoutLoading
}: PaymentLoadingOverlayProps) {
  return (
    <div className="payment-loading-overlay" role="status" aria-live="polite">
      <div className="payment-loading-overlay__card">
        <span className="payment-loading-overlay__spinner" aria-hidden />
        <p>{message}</p>
      </div>
    </div>
  );
}
