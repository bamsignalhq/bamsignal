type PaymentLoadingOverlayProps = {
  message?: string;
};

export function PaymentLoadingOverlay({
  message = "Starting secure payment…"
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
