type FastConnectionExpiryBannerProps = {
  message: string;
  onRenew: () => void;
  onDismiss: () => void;
};

export function FastConnectionExpiryBanner({
  message,
  onRenew,
  onDismiss
}: FastConnectionExpiryBannerProps) {
  return (
    <div className="fast-connection-expiry-banner" role="status">
      <p>{message}</p>
      <div className="fast-connection-expiry-banner__actions">
        <button type="button" className="btn-primary btn-compact" onClick={onRenew}>
          Renew
        </button>
        <button type="button" className="btn-secondary btn-compact" onClick={onDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
