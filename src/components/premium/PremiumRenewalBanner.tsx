type PremiumRenewalBannerProps = {
  message: string;
  onRenew: () => void;
  onDismiss: () => void;
  loading?: boolean;
};

export function PremiumRenewalBanner({
  message,
  onRenew,
  onDismiss,
  loading,
}: PremiumRenewalBannerProps) {
  return (
    <div className="premium-renewal-banner" role="status">
      <p>{message}</p>
      <div className="premium-renewal-banner__actions">
        <button type="button" className="btn-primary btn-compact" onClick={onRenew} disabled={loading}>
          {loading ? "Opening…" : "Renew"}
        </button>
        <button type="button" className="btn-secondary btn-compact" onClick={onDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
